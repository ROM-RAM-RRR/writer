import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../utils/api';
import type { Theme, Project } from '../utils/types';
import { useSearchParams } from 'react-router-dom';
import './Editor.css';

export default function Editor() {
  const [searchParams] = useSearchParams();
  const [projects, setProjects] = useState<Project[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [content, setContent] = useState('');
  const [outline, setOutline] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedText, setGeneratedText] = useState('');
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [discardSuggestion, setDiscardSuggestion] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  const [generateMode, setGenerateMode] = useState<'continue' | 'complete'>('continue');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Generation state managed in a ref object
  const genState = useRef({
    isGenerating: false,
    isPaused: false,
    generatedText: '',
    shouldStop: false,
  });

  // Initialize refs that need to persist
  useEffect(() => {
    genState.current = {
      isGenerating: false,
      isPaused: false,
      generatedText: '',
      shouldStop: false,
    };
  }, []);

  const loadData = async () => {
    const [projectsData, themesData] = await Promise.all([
      api.getProjects(),
      api.getThemes(),
    ]);
    setProjects(projectsData);
    setThemes(themesData);
    return projectsData;
  };

  // Initial load and when URL params change
  useEffect(() => {
    loadData().then(projectsData => {
      if (projectsData.length === 0) return;

      const projectId = searchParams.get('project');
      let targetProject = null;

      if (projectId) {
        targetProject = projectsData.find(p => p.id === projectId);
      }

      // Default: select first project
      if (!targetProject) {
        targetProject = projectsData[0];
      }

      selectProject(targetProject);
    });
  }, [searchParams]);

  const selectProject = (project: Project) => {
    setCurrentProject(project);
    setContent(project.content);
    setOutline(project.outline || '');
    setGeneratedText('');
  };

  const [showAddProject, setShowAddProject] = useState(false);
  const [allProjects, setAllProjects] = useState<Project[]>([]);

  const createProject = async () => {
    const title = `新项目 ${projects.length + 1}`;
    const project = await api.createProject({ title });
    setProjects([project, ...projects]);
    selectProject(project);
  };

  const loadAllProjects = async () => {
    const all = await api.getProjects();
    setAllProjects(all);
    setShowAddProject(true);
  };

  const addProjectToList = (project: Project) => {
    if (!projects.find(p => p.id === project.id)) {
      setProjects([project, ...projects]);
    }
    selectProject(project);
    setShowAddProject(false);
  };

  const saveProject = async () => {
    if (!currentProject) return;
    await api.updateProject(currentProject.id, { content, outline });
    const updated = await api.getProject(currentProject.id);
    setCurrentProject(updated);
    setProjects(projects.map(p => p.id === updated.id ? updated : p));
  };

  const generateContent = async (fromOutline: boolean = false, autoContinue: boolean = false) => {
    const state = genState.current;

    if (state.isGenerating && !autoContinue) return;

    const hasContent = content.trim().length > 0;
    const hasOutline = outline.trim().length > 0;

    // Validation - only for manual start (not autoContinue)
    if (!autoContinue) {
      // If starting from outline, need outline
      if (fromOutline && !hasOutline) {
        alert('请先填写大纲');
        return;
      }
      // If continuing (not from outline), need either content or outline
      if (!fromOutline && !hasContent && !hasOutline) {
        alert('请先输入内容或填写大纲');
        return;
      }
      // If from outline with complete mode, that's valid
    }

    // Initialize state
    if (!autoContinue) {
      state.generatedText = '';
      state.isPaused = false;
      state.shouldStop = false;
    }
    state.isGenerating = true;

    setGenerating(true);
    if (!autoContinue) {
      setGeneratedText('');
    }

    try {
      const response = await api.generateContent(
        fromOutline ? '' : content,
        currentProject?.theme_id,
        { max_tokens: 1000, temperature: 0.8, outline, generate_mode: generateMode }
      );

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          // Stop if requested
          if (state.shouldStop) break;

          // When paused, keep waiting
          if (state.isPaused) {
            await new Promise(resolve => setTimeout(resolve, 200));
            continue;
          }

          const { done, value } = await reader.read();
          if (done) break;
          const text = decoder.decode(value);
          const lines = text.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;
              if (data.startsWith('[ERROR]')) {
                alert('生成出错: ' + data);
                continue;
              }
              state.generatedText += data;
              setGeneratedText(state.generatedText);
            }
          }
        }
      }
    } catch (error: any) {
      console.error('Generation error:', error);
      if (!autoContinue) {
        alert('生成失败，请检查API配置');
      }
    } finally {
      state.isGenerating = false;
      setGenerating(false);

      // Auto-continue only in "continue" mode with enough text
      // In "complete" mode, we don't auto-continue - story is complete
      if (generateMode === 'continue' && state.generatedText.length > 100 && !state.shouldStop && !autoContinue) {
        console.log('Auto-continuing...');
        // Add to content
        const newContent = content + state.generatedText;
        setContent(newContent);
        // Auto-save to project
        if (currentProject) {
          api.updateProject(currentProject.id, { content: newContent, outline: outline || undefined });
        }
        // Clear and continue
        state.generatedText = '';
        setGeneratedText('');
        // Continue after delay
        setTimeout(() => {
          generateContent(false, true);
        }, 1500);
      }
      // Note: In complete mode, we don't auto-add to content - user needs to "采纳" to confirm
    }
  };

  // Toggle pause/resume
  const togglePause = () => {
    const state = genState.current;
    if (state.isGenerating) {
      state.isPaused = !state.isPaused;
      setIsPaused(state.isPaused);
    }
  };

  // Stop generation
  const stopGeneration = () => {
    const state = genState.current;
    state.shouldStop = true;
    state.isGenerating = false;
    state.isPaused = false;
    setGenerating(false);
    setIsPaused(false);
  };

  const applyGenerated = () => {
    if (generatedText) {
      setContent(prev => prev + generatedText);
      setGeneratedText('');
      saveProject();
    }
  };

  const discardGenerated = () => {
    setShowDiscardDialog(true);
  };

  const submitDiscardWithSuggestion = async () => {
    if (!discardSuggestion.trim() || generating) return;
    const state = genState.current;

    setShowDiscardDialog(false);
    setGenerating(true);
    setGeneratedText('');
    state.generatedText = '';
    state.isGenerating = true;
    state.isPaused = false;
    state.shouldStop = false;

    try {
      const response = await api.generateContent(
        content,
        currentProject?.theme_id,
        { max_tokens: 1000, temperature: 0.8, suggestion: discardSuggestion, outline, generate_mode: generateMode }
      );

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          // Check stop
          if (state.shouldStop) break;
          // Check pause
          if (state.isPaused) {
            await new Promise(resolve => setTimeout(resolve, 200));
            continue;
          }

          const { done, value } = await reader.read();
          if (done) break;
          const text = decoder.decode(value);
          const lines = text.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;
              if (data.startsWith('[ERROR]')) {
                alert('生成出错: ' + data);
                continue;
              }
              state.generatedText += data;
              setGeneratedText(state.generatedText);
            }
          }
        }
      }

      // Don't auto-add to content - let user click "采纳" to confirm
      // This applies to both continue and complete modes
      console.log('Generation complete, waiting for user confirmation');
    } catch (error) {
      console.error('Generation error:', error);
      alert('生成失败，请检查API配置');
    } finally {
      state.isGenerating = false;
      setGenerating(false);
      setDiscardSuggestion('');
    }
  };

  const removeFromList = (id: string) => {
    // Just remove from Editor list, don't delete the project
    setProjects(projects.filter(p => p.id !== id));
    if (currentProject?.id === id) {
      if (projects.length > 1) {
        selectProject(projects.find(p => p.id !== id)!);
      } else {
        setCurrentProject(null);
        setContent('');
        setOutline('');
      }
    }
  };

  return (
    <div className="editor-page">
      <div className="project-list">
        <h3>项目列表</h3>
        <div className="project-list-actions">
          <button className="btn-primary btn-sm" onClick={createProject}>新建</button>
          <button className="btn-secondary btn-sm" onClick={loadAllProjects}>添加</button>
        </div>
        <ul>
          {projects.length === 0 ? (
            <li className="empty-hint">暂无项目，点击"新建"或"添加"</li>
          ) : (
            projects.map(project => (
              <li
                key={project.id}
                className={currentProject?.id === project.id ? 'active' : ''}
                onClick={() => selectProject(project)}
              >
                <span>{project.title}</span>
                <button className="btn-remove" onClick={(e) => { e.stopPropagation(); removeFromList(project.id); }}>×</button>
              </li>
            ))
          )}
        </ul>

        {showAddProject && (
          <div className="add-project-modal">
            <h4>选择项目添加到写作列表</h4>
            <ul className="project-select-list">
              {allProjects.map(project => (
                <li key={project.id} onClick={() => addProjectToList(project)}>
                  {project.title}
                </li>
              ))}
            </ul>
            <button className="btn-secondary btn-sm" onClick={() => setShowAddProject(false)}>关闭</button>
          </div>
        )}
      </div>

      <div className="editor-main">
        {currentProject ? (
          <>
            <div className="editor-toolbar">
              <h2>{currentProject.title}</h2>
              <div className="toolbar-right">
                <select
                  value={currentProject.theme_id || ''}
                  onChange={async (e) => {
                    const updated = await api.updateProject(currentProject.id, { theme_id: e.target.value || null });
                    setCurrentProject(updated);
                  }}
                >
                  <option value="">选择主题</option>
                  {themes.map(theme => (
                    <option key={theme.id} value={theme.id}>{theme.name}</option>
                  ))}
                </select>
                <button className="btn-primary" onClick={saveProject}>保存</button>
              </div>
            </div>

            <div className="outline-section">
              <h3>故事大纲</h3>
              <textarea
                value={outline}
                onChange={(e) => setOutline(e.target.value)}
                placeholder="输入或编辑故事大纲..."
                className="outline-textarea"
              />
              <button className="btn-primary" onClick={saveProject}>保存大纲</button>
            </div>

            <div className="editor-area">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="在这里开始你的创作..."
              />
              {generatedText && (
                <div className="generated-preview">
                  <h4>AI生成内容：</h4>
                  <pre className="generated-text">{generatedText}</pre>
                  {!generating && (
                    <div className="preview-actions">
                      <button className="btn-primary" onClick={applyGenerated}>采纳</button>
                      <button className="btn-secondary" onClick={discardGenerated}>丢弃并改进</button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {showDiscardDialog && (
              <div className="modal-overlay" onClick={() => setShowDiscardDialog(false)}>
                <div className="modal" onClick={e => e.stopPropagation()}>
                  <h3>改进建议</h3>
                  <p>请提供改进建议，AI将根据您的建议重新生成内容：</p>
                  <textarea
                    value={discardSuggestion}
                    onChange={(e) => setDiscardSuggestion(e.target.value)}
                    placeholder="例如：让情节更紧凑、人物更有层次感..."
                    rows={4}
                  />
                  <div className="modal-actions">
                    <button className="btn-primary" onClick={submitDiscardWithSuggestion}>提交并重新生成</button>
                    <button className="btn-secondary" onClick={() => {
                      setShowDiscardDialog(false);
                      setGeneratedText('');
                      setIsPaused(false);
                      genState.current.isGenerating = false;
                      genState.current.isPaused = false;
                    }}>直接丢弃</button>
                  </div>
                </div>
              </div>
            )}

            <div className="editor-actions">
              {generating ? (
                <>
                  <button className="btn-pause" onClick={togglePause}>
                    {isPaused ? '继续' : '暂停'}
                  </button>
                  <button className="btn-stop" onClick={stopGeneration}>
                    停止
                  </button>
                </>
              ) : (
                <>
                  <div className="generate-mode-selector">
                    <label>
                      <input
                        type="radio"
                        name="generateMode"
                        checked={generateMode === 'continue'}
                        onChange={() => setGenerateMode('continue')}
                      />
                      连续续写
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="generateMode"
                        checked={generateMode === 'complete'}
                        onChange={() => setGenerateMode('complete')}
                      />
                      完整故事
                    </label>
                  </div>
                  <button
                    className="btn-generate"
                    onClick={() => generateContent(false)}
                    disabled={!content}
                  >
                    {generateMode === 'complete' ? '续写完整结局' : 'AI续写'}
                  </button>
                  <button
                    className="btn-generate-outline"
                    onClick={() => generateContent(true)}
                    disabled={!outline}
                  >
                    {generateMode === 'complete' ? '创作完整故事' : '从大纲开始'}
                  </button>
                </>
              )}
            </div>
          </>
        ) : (
          <div className="no-project">
            <p>请选择一个项目或创建新项目</p>
          </div>
        )}
      </div>
    </div>
  );
}