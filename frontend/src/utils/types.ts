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
