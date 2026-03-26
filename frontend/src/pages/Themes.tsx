import { useState, useEffect } from 'react';
import { api, Theme } from '../utils/api';
import './Themes.css';

export default function Themes() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [editingTheme, setEditingTheme] = useState<Theme | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    genre: '',
    style: '',
    background: '',
    characters: '',
    other_settings: '',
  });

  useEffect(() => {
    loadThemes();
  }, []);

  const loadThemes = async () => {
    const data = await api.getThemes();
    setThemes(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTheme) {
      await api.updateTheme(editingTheme.id, formData);
    } else {
      await api.createTheme(formData);
    }
    setEditingTheme(null);
    setFormData({ name: '', genre: '', style: '', background: '', characters: '', other_settings: '' });
    loadThemes();
  };

  const handleEdit = (theme: Theme) => {
    setEditingTheme(theme);
    setFormData({
      name: theme.name,
      genre: theme.genre,
      style: theme.style,
      background: theme.background,
      characters: theme.characters,
      other_settings: theme.other_settings,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个主题吗？')) return;
    await api.deleteTheme(id);
    loadThemes();
  };

  return (
    <div className="themes-page">
      <h2>主题管理</h2>

      <div className="theme-form-card">
        <h3>{editingTheme ? '编辑主题' : '创建新主题'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>主题名称</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="输入主题名称"
            />
          </div>

          <div className="form-group">
            <label>风格类型</label>
            <input
              type="text"
              value={formData.genre}
              onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
              placeholder="如：武侠、科幻、言情、悬疑"
            />
          </div>

          <div className="form-group">
            <label>写作风格</label>
            <textarea
              value={formData.style}
              onChange={(e) => setFormData({ ...formData, style: e.target.value })}
              placeholder="描述文笔风格、句式特点、语气等"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>世界观/背景</label>
            <textarea
              value={formData.background}
              onChange={(e) => setFormData({ ...formData, background: e.target.value })}
              placeholder="描述故事背景、世界观设定"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>角色设定</label>
            <textarea
              value={formData.characters}
              onChange={(e) => setFormData({ ...formData, characters: e.target.value })}
              placeholder="主要角色介绍和设定"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>其他设定</label>
            <textarea
              value={formData.other_settings}
              onChange={(e) => setFormData({ ...formData, other_settings: e.target.value })}
              placeholder="其他补充设定"
              rows={2}
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary">
              {editingTheme ? '保存修改' : '创建主题'}
            </button>
            {editingTheme && (
              <button type="button" className="btn-secondary" onClick={() => {
                setEditingTheme(null);
                setFormData({ name: '', genre: '', style: '', background: '', characters: '', other_settings: '' });
              }}>
                取消
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="theme-list">
        <h3>已有主题</h3>
        {themes.length === 0 ? (
          <p className="empty-message">暂无主题，请创建一个</p>
        ) : (
          <div className="theme-grid">
            {themes.map(theme => (
              <div key={theme.id} className="theme-card">
                <div className="theme-header">
                  <h4>{theme.name}</h4>
                  <span className="theme-genre">{theme.genre || '未分类'}</span>
                </div>
                <div className="theme-body">
                  <p><strong>写作风格：</strong>{theme.style || '未设置'}</p>
                  <p><strong>背景设定：</strong>{theme.background || '未设置'}</p>
                  <p><strong>角色设定：</strong>{theme.characters || '未设置'}</p>
                </div>
                <div className="theme-actions">
                  <button onClick={() => handleEdit(theme)}>编辑</button>
                  <button className="btn-delete" onClick={() => handleDelete(theme.id)}>删除</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}