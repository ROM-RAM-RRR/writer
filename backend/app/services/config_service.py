import json
import os
from typing import Optional


CONFIG_FILE = "data/api_config.json"


class ConfigService:
    def __init__(self):
        os.makedirs("data", exist_ok=True)
        self._config = self._load_config()

    def _load_config(self) -> dict:
        if os.path.exists(CONFIG_FILE):
            with open(CONFIG_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        return {
            "base_url": "https://api.openai.com/v1",
            "api_key": "",
            "model": "gpt-3.5-turbo",
        }

    def get_config(self) -> dict:
        return self._config

    def update_config(self, config: dict) -> dict:
        self._config.update(config)
        with open(CONFIG_FILE, "w", encoding="utf-8") as f:
            json.dump(self._config, f, ensure_ascii=False, indent=2)
        return self._config


config_service = ConfigService()