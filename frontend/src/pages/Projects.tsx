import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import type { Project, Theme } from '../utils/types';
import { useNavigate } from 'react-router-dom';
import './Projects.css';

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('');
  const navigate = useNavigate();

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
  };

  const createProject = async () => {
    if (!newProjectTitle.trim()) return;
    const project = await api.createProject({
      title: newProjectTitle,
      theme_id: selectedTheme || undefined,
    });
    setProjects([project, ...projects]);
    setShowModal(false);
    setNewProjectTitle('');
    setSelectedTheme('');
    navigate('/editor');
  };

  const deleteProject = async (id: string) => {
    if (!confirm('确定要删除这个项目吗？')) return;
    await api.deleteProject(id);
    setProjects(projects.filter(p => p.id !== id));
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN');
  };

  const getThemeName = (themeId: string | null) => {
    if (!themeId) return '未设置主题';
    const theme = themes.find(t => t.id === themeId);
    return theme?.name || '未知主题';
  };

  const handleExport = (projectId: string) => {
    api.downloadProject(projectId);
  };

  return (
    <div className="projects-page">
      <div className="projects-header">
        <h2>项目管理</h2>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          新建项目
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="empty-state">
          <p>暂无项目，点击"新建项目"开始创作</p>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map(project => (
            <div key={project.id} className="project-card">
              <div className="project-info">
                <h3>{project.title}</h3>
                <div className="project-meta">
                  <span className="meta-item">
                    主题: {getThemeName(project.theme_id)}
                  </span>
                  <span className="meta-item">
                    字数: {project.content.length}
                  </span>
                  <span className="meta-item">
                    更新: {formatDate(project.updated_at)}
                  </span>
                </div>
                <p className="project-preview">
                  {project.content.slice(0, 100) || '暂无内容'}
                </p>
              </div>
              <div className="project-actions">
                <button className="btn-primary" onClick={() => navigate(`/editor?project=${project.id}`)}>
                  继续写作
                </button>
                <button className="btn-export" onClick={() => handleExport(project.id)}>
                  导出Word
                </button>
                <button className="btn-delete" onClick={() => deleteProject(project.id)}>
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>新建项目</h3>
            <div className="form-group">
              <label>项目名称</label>
              <input
                type="text"
                value={newProjectTitle}
                onChange={(e) => setNewProjectTitle(e.target.value)}
                placeholder="输入项目名称"
                autoFocus
              />
            </div>
            <div className="form-group">
              <label>选择主题（可选）</label>
              <select value={selectedTheme} onChange={(e) => setSelectedTheme(e.target.value)}>
                <option value="">不选择主题</option>
                {themes.map(theme => (
                  <option key={theme.id} value={theme.id}>{theme.name}</option>
                ))}
              </select>
            </div>
            <div className="modal-actions">
              <button className="btn-primary" onClick={createProject}>创建</button>
              <button className="btn-secondary" onClick={() => setShowModal(false)}>取消</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}