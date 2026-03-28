import type { Theme, Project, ApiConfig } from './types';

const API_BASE = 'http://localhost:8000/api';

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

  async updateProject(id: string, project: { title?: string; content?: string; outline?: string | undefined; theme_id?: string | null }): Promise<Project> {
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

  // Export project to Word
  downloadProject(id: string) {
    window.open(`${API_BASE}/projects/${id}/export`, '_blank');
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
  generateContent(content: string, themeId?: string, options?: { max_tokens?: number; temperature?: number; top_p?: number; suggestion?: string; outline?: string; generate_mode?: string }) {
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

  // Outline APIs
  async generateOutline(data: {
    theme: string;
    genre?: string;
    style?: string;
    length?: string;
    requirements?: string;
    theme_id?: string;
    num_options?: number;
  }) {
    const res = await fetch(`${API_BASE}/outline/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async continueOutline(data: {
    selected_outline: object;
    action: 'continue' | 'modify';
    modifications?: string;
    theme_id?: string;
    max_tokens?: number;
    temperature?: number;
  }) {
    const res = await fetch(`${API_BASE}/outline/continue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Outline CRUD
  async getOutlines(projectId?: string) {
    const url = projectId ? `${API_BASE}/outline/?project_id=${projectId}` : `${API_BASE}/outline/`;
    const res = await fetch(url);
    return res.json();
  },

  async saveOutline(data: {
    title: string;
    genre: string;
    plot: string;
    characters: string[];
    highlights: string;
    chapters: number;
    source_theme?: string;
    content?: string;
    project_id?: string;
  }) {
    const res = await fetch(`${API_BASE}/outline/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteOutline(id: string) {
    await fetch(`${API_BASE}/outline/${id}`, { method: 'DELETE' });
  },

  // Export outline to Word
  downloadOutline(id: string) {
    window.open(`${API_BASE}/outline/${id}/export`, '_blank');
  },
};