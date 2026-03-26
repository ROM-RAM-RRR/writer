import { useState, useEffect, useRef } from 'react';
import { api } from '../utils/api';
import type { Theme, Project } from '../utils/types';
import './Editor.css';

export default function Editor() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [content, setContent] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedText, setGeneratedText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [projectsData, themesData] = await Promise.all([
      api.getProjects(),
      api.getThemes(),
    ]);
    setProjects(projectsData);
    setThemes(themesData);
    if (projectsData.length > 0) {
      selectProject(projectsData[0]);
    }
  };

  const selectProject = (project: Project) => {
    setCurrentProject(project);
    setContent(project.content);
    setGeneratedText('');
  };

  const createProject = async () => {
    const title = `新项目 ${projects.length + 1}`;
    const project = await api.createProject({ title });
    setProjects([project, ...projects]);
    selectProject(project);
  };

  const saveProject = async () => {
    if (!currentProject) return;
    await api.updateProject(currentProject.id, { content });
    const updated = await api.getProject(currentProject.id);
    setCurrentProject(updated);
    setProjects(projects.map(p => p.id === updated.id ? updated : p));
  };

  const generateContent = async () => {
    if (!content || generating) return;
    setGenerating(true);
    setGeneratedText('');

    try {
      const response = await api.generateContent(
        content,
        currentProject?.theme_id,
        { max_tokens: 1000, temperature: 0.8 }
      );

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
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
              setGeneratedText(prev => prev + data);
            }
          }
        }
      }
    } catch (error) {
      console.error('Generation error:', error);
      alert('生成失败，请检查API配置');
    } finally {
      setGenerating(false);
    }
  };

  const applyGenerated = () => {
    if (generatedText) {
      setContent(prev => prev + generatedText);
      setGeneratedText('');
      saveProject();
    }
  };

  const deleteProject = async (id: string) => {
    if (!confirm('确定要删除这个项目吗？')) return;
    await api.deleteProject(id);
    setProjects(projects.filter(p => p.id !== id));
    if (currentProject?.id === id) {
      if (projects.length > 1) {
        selectProject(projects.find(p => p.id !== id)!);
      } else {
        setCurrentProject(null);
        setContent('');
      }
    }
  };

  return (
    <div className="editor-page">
      <div className="project-list">
        <h3>项目列表</h3>
        <button className="btn-primary" onClick={createProject}>新建项目</button>
        <ul>
          {projects.map(project => (
            <li
              key={project.id}
              className={currentProject?.id === project.id ? 'active' : ''}
              onClick={() => selectProject(project)}
            >
              <span>{project.title}</span>
              <button className="btn-delete" onClick={(e) => { e.stopPropagation(); deleteProject(project.id); }}>×</button>
            </li>
          ))}
        </ul>
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
                  <p>{generatedText}</p>
                  <div className="preview-actions">
                    <button className="btn-primary" onClick={applyGenerated}>采纳</button>
                    <button className="btn-secondary" onClick={() => setGeneratedText('')}>丢弃</button>
                  </div>
                </div>
              )}
            </div>

            <div className="editor-actions">
              <button
                className="btn-generate"
                onClick={generateContent}
                disabled={generating || !content}
              >
                {generating ? '生成中...' : 'AI续写'}
              </button>
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