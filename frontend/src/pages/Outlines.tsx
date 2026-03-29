import { useState, useEffect, useRef } from 'react';
import { api } from '../utils/api';
import type { Theme } from '../utils/types';
import OutlineGenerator from '../components/OutlineGenerator';
import './Outlines.css';

interface SavedOutline {
  id: string;
  title: string;
  genre: string;
  plot: string;
  characters: string[];
  highlights: string;
  chapters: number;
  source_theme: string | null;
  content: string | null;
  created_at: string;
  project_id: string | null;
}

export default function Outlines() {
  const [outlines, setOutlines] = useState<SavedOutline[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [selectedOutline, setSelectedOutline] = useState<SavedOutline | null>(null);
  const [loading, setLoading] = useState(true);
  const detailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [outlinesData, themesData] = await Promise.all([
        api.getOutlines(),
        api.getThemes(),
      ]);
      setOutlines(outlinesData);
      setThemes(themesData);
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个大纲吗？')) return;
    try {
      await api.deleteOutline(id);
      setOutlines(outlines.filter(o => o.id !== id));
      if (selectedOutline?.id === id) {
        setSelectedOutline(null);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('删除失败');
    }
  };

  const handleExport = (outline: SavedOutline) => {
    api.downloadOutline(outline.id);
  };

  const handleCreateProject = async (outline: SavedOutline) => {
    const title = prompt('请输入项目名称：', outline.title);
    if (!title) return;

    // Build outline text from the saved outline
    const outlineText = `【大纲】\n\n类型：${outline.genre}\n\n情节：${outline.plot}\n\n角色：${outline.characters.join('、')}\n\n亮点：${outline.highlights}`;

    // Build content if there's generated content
    const initialContent = outline.content || '';

    try {
      const project = await api.createProject({
        title,
        content: initialContent,
        outline: outlineText,
      });
      alert('项目已创建！');
      // Navigate to editor with the new project
      window.location.href = `/editor?project=${project.id}`;
    } catch (error) {
      console.error('Create project error:', error);
      alert('创建项目失败');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN');
  };

  if (loading) {
    return <div className="outlines-page">加载中...</div>;
  }

  return (
    <div className="outlines-page">
      <OutlineGenerator themes={themes} />
      <div className="outlines-header">
        <h2>我的大纲</h2>
        <span className="outlines-count">共 {outlines.length} 个大纲</span>
      </div>

      {outlines.length === 0 ? (
        <div className="empty-state">
          <p>暂无保存的大纲</p>
          <p className="hint">在写作界面使用"大纲撰写"功能生成并保存大纲</p>
        </div>
      ) : (
        <div className="outlines-content">
          <div className="outlines-list">
            {outlines.map(outline => (
              <div
                key={outline.id}
                className={`outline-item ${selectedOutline?.id === outline.id ? 'active' : ''}`}
                onClick={() => {
                  setSelectedOutline(outline);
                  // Scroll to top when selecting
                  if (detailRef.current) {
                    detailRef.current.scrollTop = 0;
                  }
                }}
              >
                <h4>{outline.title}</h4>
                <div className="outline-tags">
                  <span className="tag">{outline.genre}</span>
                  <span className="tag">{outline.chapters}章</span>
                </div>
                <p className="outline-preview">{outline.plot.slice(0, 60)}...</p>
                <div className="outline-footer">
                  <span className="date">{formatDate(outline.created_at)}</span>
                </div>
              </div>
            ))}
          </div>

          {selectedOutline && (
            <div className="outline-detail" ref={detailRef}>
              <div className="detail-header">
                <h3>{selectedOutline.title}</h3>
                <div className="detail-actions">
                  <button className="primary-btn" onClick={() => handleCreateProject(selectedOutline)}>
                    创建项目
                  </button>
                  <button className="export-btn" onClick={() => handleExport(selectedOutline)}>
                    导出Word
                  </button>
                  <button className="danger-btn" onClick={() => handleDelete(selectedOutline.id)}>
                    删除
                  </button>
                </div>
              </div>

              <div className="detail-content">
                <div className="detail-section">
                  <h5>类型</h5>
                  <p>{selectedOutline.genre}</p>
                </div>

                <div className="detail-section">
                  <h5>情节</h5>
                  <p>{selectedOutline.plot}</p>
                </div>

                <div className="detail-section">
                  <h5>角色</h5>
                  <p>{selectedOutline.characters.join('、')}</p>
                </div>

                <div className="detail-section">
                  <h5>亮点</h5>
                  <p>{selectedOutline.highlights}</p>
                </div>

                <div className="detail-section">
                  <h5>章节数</h5>
                  <p>约 {selectedOutline.chapters} 章</p>
                </div>

                {selectedOutline.source_theme && (
                  <div className="detail-section">
                    <h5>来源主题</h5>
                    <p>{selectedOutline.source_theme}</p>
                  </div>
                )}

                {selectedOutline.content && (
                  <div className="detail-section">
                    <h5>已生成内容</h5>
                    <div className="content-preview">
                      {selectedOutline.content.slice(0, 500)}
                      {selectedOutline.content.length > 500 && '...'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}