import { useState } from 'react';
import { api } from '../utils/api';
import type { Theme } from '../utils/types';
import './OutlineGenerator.css';

interface Outline {
  title: string;
  genre: string;
  plot: string;
  characters: string[];
  highlights: string;
  chapters: number;
}

interface OutlineGeneratorProps {
  themes: Theme[];
  currentThemeId?: string;
  onSelectOutline?: (content: string) => void;
}

export default function OutlineGenerator({ themes, currentThemeId, onSelectOutline }: OutlineGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    theme: '',
    genre: '',
    style: '',
    length: '中篇小说',
    requirements: '',
  });
  const [selectedTheme, setSelectedTheme] = useState(currentThemeId || '');
  const [outlines, setOutlines] = useState<Outline[]>([]);
  const [generating, setGenerating] = useState(false);
  const [selectedOutline, setSelectedOutline] = useState<Outline | null>(null);
  const [continueResult, setContinueResult] = useState('');
  const [continuing, setContinuing] = useState(false);
  const [modifying, setModifying] = useState(false);

  const handleGenerate = async () => {
    if (!formData.theme) return;
    setGenerating(true);
    setOutlines([]);
    setSelectedOutline(null);
    setContinueResult('');

    try {
      const result = await api.generateOutline({
        theme: formData.theme,
        genre: formData.genre || undefined,
        style: formData.style || undefined,
        length: formData.length,
        requirements: formData.requirements || undefined,
        theme_id: selectedTheme || undefined,
      });

      if (result.outlines) {
        setOutlines(result.outlines);
      }
    } catch (error) {
      console.error('Generate outline error:', error);
      alert('生成大纲失败，请检查API配置');
    } finally {
      setGenerating(false);
    }
  };

  const handleContinue = async () => {
    if (!selectedOutline) return;
    setContinuing(true);
    setContinueResult('');

    try {
      const result = await api.continueOutline({
        selected_outline: selectedOutline,
        action: 'continue',
        theme_id: selectedTheme || undefined,
      });
      setContinueResult(result.content);
    } catch (error) {
      console.error('Continue error:', error);
      alert('继续生成失败');
    } finally {
      setContinuing(false);
    }
  };

  const handleModify = async () => {
    if (!selectedOutline) return;
    setModifying(true);

    const modifications = prompt('请输入修改要求（如：增加悬疑元素/改变主角性格等）：');
    if (!modifications) {
      setModifying(false);
      return;
    }

    try {
      const result = await api.continueOutline({
        selected_outline: selectedOutline,
        action: 'modify',
        modifications,
        theme_id: selectedTheme || undefined,
      });
      setContinueResult(result.content);
    } catch (error) {
      console.error('Modify error:', error);
      alert('修改大纲失败');
    } finally {
      setModifying(false);
    }
  };

  const handleUseContent = () => {
    if (continueResult && onSelectOutline) {
      onSelectOutline(continueResult);
      setIsOpen(false);
    }
  };

  const handleSaveOutline = async (outline: Outline) => {
    try {
      await api.saveOutline({
        title: outline.title,
        genre: outline.genre,
        plot: outline.plot,
        characters: outline.characters,
        highlights: outline.highlights,
        chapters: outline.chapters,
        source_theme: formData.theme,
      });
      alert('大纲已保存！');
    } catch (error) {
      console.error('Save error:', error);
      alert('保存失败');
    }
  };

  const handleSaveWithContent = async () => {
    if (!selectedOutline || !continueResult) return;
    try {
      await api.saveOutline({
        title: selectedOutline.title,
        genre: selectedOutline.genre,
        plot: selectedOutline.plot,
        characters: selectedOutline.characters,
        highlights: selectedOutline.highlights,
        chapters: selectedOutline.chapters,
        source_theme: formData.theme,
        content: continueResult,
      });
      alert('大纲和正文已保存！');
    } catch (error) {
      console.error('Save error:', error);
      alert('保存失败');
    }
  };

  return (
    <div className="outline-generator">
      <button className="outline-toggle-btn" onClick={() => setIsOpen(!isOpen)}>
        📝 大纲撰写
      </button>

      {isOpen && (
        <div className="outline-modal">
          <div className="outline-content">
            <div className="outline-header">
              <h3>AI大纲生成</h3>
              <button className="close-btn" onClick={() => setIsOpen(false)}>×</button>
            </div>

            {!outlines.length && !generating && (
              <div className="outline-form">
                <div className="form-group">
                  <label>故事主题/核心创意 *</label>
                  <input
                    type="text"
                    value={formData.theme}
                    onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                    placeholder="例如：一个关于时间旅行的悬疑故事"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>故事类型</label>
                    <input
                      type="text"
                      value={formData.genre}
                      onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                      placeholder="如：悬疑、科幻、言情"
                    />
                  </div>
                  <div className="form-group">
                    <label>写作风格</label>
                    <input
                      type="text"
                      value={formData.style}
                      onChange={(e) => setFormData({ ...formData, style: e.target.value })}
                      placeholder="如：严肃、轻松、细腻"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>篇幅</label>
                    <select
                      value={formData.length}
                      onChange={(e) => setFormData({ ...formData, length: e.target.value })}
                    >
                      <option value="短篇小说">短篇小说</option>
                      <option value="中篇小说">中篇小说</option>
                      <option value="长篇小说">长篇小说</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>使用主题设定</label>
                    <select
                      value={selectedTheme}
                      onChange={(e) => setSelectedTheme(e.target.value)}
                    >
                      <option value="">不使用</option>
                      {themes.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>其他要求（可选）</label>
                  <textarea
                    value={formData.requirements}
                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                    placeholder="如：希望有反转结局、主要角色要有成长弧线"
                    rows={2}
                  />
                </div>

                <button
                  className="generate-btn"
                  onClick={handleGenerate}
                  disabled={generating || !formData.theme}
                >
                  {generating ? '生成中...' : '生成大纲'}
                </button>
              </div>
            )}

            {generating && (
              <div className="generating">
                <div className="spinner"></div>
                <p>AI正在创作大纲...</p>
              </div>
            )}

            {outlines.length > 0 && !selectedOutline && (
              <div className="outline-results">
                <h4>请选择一个大纲：</h4>
                <div className="outlines-list">
                  {outlines.map((outline, idx) => (
                    <div
                      key={idx}
                      className="outline-card"
                    >
                      <div className="outline-card-content" onClick={() => setSelectedOutline(outline)}>
                        <h5>{outline.title}</h5>
                        <span className="outline-genre">{outline.genre}</span>
                        <p className="outline-plot">{outline.plot}</p>
                        <div className="outline-meta">
                          <span>角色：{outline.characters.slice(0, 2).join('、')}...</span>
                          <span>约{outline.chapters}章</span>
                        </div>
                      </div>
                      <button className="save-outline-btn" onClick={() => handleSaveOutline(outline)}>
                        保存
                      </button>
                    </div>
                  ))}
                </div>
                <button className="back-btn" onClick={() => setOutlines([])}>
                  重新生成
                </button>
              </div>
            )}

            {selectedOutline && !continueResult && (
              <div className="selected-outline">
                <h4>已选择：{selectedOutline.title}</h4>
                <div className="outline-detail">
                  <p><strong>类型：</strong>{selectedOutline.genre}</p>
                  <p><strong>情节：</strong>{selectedOutline.plot}</p>
                  <p><strong>角色：</strong>{selectedOutline.characters.join('、')}</p>
                  <p><strong>亮点：</strong>{selectedOutline.highlights}</p>
                </div>
                <div className="outline-actions">
                  <button className="primary-btn" onClick={handleContinue} disabled={continuing}>
                    {continuing ? '生成中...' : '生成正文'}
                  </button>
                  <button className="secondary-btn" onClick={handleModify} disabled={modifying}>
                    {modifying ? '修改中...' : '修改大纲'}
                  </button>
                </div>
              </div>
            )}

            {continueResult && (
              <div className="continue-result">
                <h4>生成结果：</h4>
                <div className="result-content">
                  {continueResult}
                </div>
                <div className="result-actions">
                  <button className="primary-btn" onClick={handleUseContent}>
                    仅使用内容
                  </button>
                  <button className="save-btn" onClick={handleSaveWithContent}>
                    保存大纲和内容
                  </button>
                  <button className="secondary-btn" onClick={() => setContinueResult('')}>
                    重新生成
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}