const API_BASE = 'http://localhost:8000/api';

export interface Theme {
  id: string;
  name: string;
  genre: string;
  style: string;
  background: string;
  characters: string;
  other_settings: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  title: string;
  content: string;
  theme_id: string | null;
  created_at: string;
  updated_at: string;
  history: { timestamp: string; content: string }[];
}

export interface ApiConfig {
  base_url: string;
  api_key: string;
  model: string;
}

export const api = {
  // Theme APIs
  async getThemes(): Promise<Theme[]> {
    const res = await fetch(`${API_BASE}/themes/`);
    return res.json();
  },

  async getTheme(id: string): Promise<Theme> {
    const res = await fetch(`${API_BASE}/themes/${id}`);
    return res.json();
  },

  async createTheme(theme: Omit<Theme, 'id' | 'created_at' | 'updated_at'>): Promise<Theme> {
    const res = await fetch(`${API_BASE}/themes/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(theme),
    });
    return res.json();
  },

  async updateTheme(id: string, theme: Omit<Theme, 'id' | 'created_at' | 'updated_at'>): Promise<Theme> {
    const res = await fetch(`${API_BASE}/themes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(theme),
    });
    return res.json();
  },

  async deleteTheme(id: string): Promise<void> {
    await fetch(`${API_BASE}/themes/${id}`, { method: 'DELETE' });
  },

  // Project APIs
  async getProjects(): Promise<Project[]> {
    const res = await fetch(`${API_BASE}/projects/`);
    return res.json();
  },

  async getProject(id: string): Promise<Project> {
    const res = await fetch(`${API_BASE}/projects/${id}`);
    return res.json();
  },

  async createProject(project: { title: string; content?: string; theme_id?: string }): Promise<Project> {
    const res = await fetch(`${API_BASE}/projects/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project),
    });
    return res.json();
  },

  async updateProject(id: string, project: { title?: string; content?: string; theme_id?: string }): Promise<Project> {
    const res = await fetch(`${API_BASE}/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project),
    });
    return res.json();
  },

  async deleteProject(id: string): Promise<void> {
    await fetch(`${API_BASE}/projects/${id}`, { method: 'DELETE' });
  },

  // Config APIs
  async getConfig(): Promise<ApiConfig> {
    const res = await fetch(`${API_BASE}/config/`);
    return res.json();
  },

  async updateConfig(config: Partial<ApiConfig>): Promise<ApiConfig> {
    const res = await fetch(`${API_BASE}/config/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    return res.json();
  },

  // Generate API (streaming)
  generateContent(content: string, themeId?: string, options?: { max_tokens?: number; temperature?: number; top_p?: number }) {
    return fetch(`${API_BASE}/generate/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content,
        theme_id: themeId || null,
        ...options,
      }),
    });
  },
};