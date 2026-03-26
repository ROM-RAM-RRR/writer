import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import type { ApiConfig } from '../utils/types';
import './Settings.css';

export default function Settings() {
  const [config, setConfig] = useState<ApiConfig>({
    base_url: '',
    api_key: '',
    model: 'gpt-3.5-turbo',
  });
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    const data = await api.getConfig();
    setConfig(data);
  };

  const saveConfig = async () => {
    await api.updateConfig(config);
    alert('配置已保存');
  };

  const testConnection = async () => {
    if (!config.api_key) {
      setTestResult({ success: false, message: '请先填写 API Key' });
      return;
    }
    setTesting(true);
    setTestResult(null);

    try {
      const response = await api.generateContent('测试', undefined, { max_tokens: 10 });
      if (response.ok) {
        setTestResult({ success: true, message: '连接成功！' });
      } else {
        const error = await response.text();
        setTestResult({ success: false, message: `连接失败: ${error}` });
      }
    } catch (error) {
      setTestResult({ success: false, message: `连接失败: ${error}` });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="settings-page">
      <h2>API 配置</h2>

      <div className="settings-card">
        <div className="form-group">
          <label>API 端点 (Base URL)</label>
          <input
            type="text"
            value={config.base_url}
            onChange={(e) => setConfig({ ...config, base_url: e.target.value })}
            placeholder="https://api.openai.com/v1"
          />
          <span className="help-text">如果你使用自定义API，请填写对应的端点地址</span>
        </div>

        <div className="form-group">
          <label>API Key</label>
          <input
            type="password"
            value={config.api_key}
            onChange={(e) => setConfig({ ...config, api_key: e.target.value })}
            placeholder="sk-..."
          />
        </div>

        <div className="form-group">
          <label>模型名称</label>
          <input
            type="text"
            value={config.model}
            onChange={(e) => setConfig({ ...config, model: e.target.value })}
            placeholder="gpt-3.5-turbo"
          />
        </div>

        {testResult && (
          <div className={`test-result ${testResult.success ? 'success' : 'error'}`}>
            {testResult.message}
          </div>
        )}

        <div className="settings-actions">
          <button className="btn-primary" onClick={saveConfig}>保存配置</button>
          <button className="btn-secondary" onClick={testConnection} disabled={testing}>
            {testing ? '测试中...' : '测试连接'}
          </button>
        </div>
      </div>

      <div className="settings-card">
        <h3>使用说明</h3>
        <ul className="help-list">
          <li><strong>API 端点：</strong>默认为 OpenAI 官方 API 地址，如果使用其他兼容 API（如 Azure、国产模型），请填写对应的地址</li>
          <li><strong>API Key：</strong>填入你的 API 密钥，注意保密不要泄露</li>
          <li><strong>模型名称：</strong>填写要使用的模型名称，如 gpt-3.5-turbo、gpt-4 等</li>
          <li>配置完成后建议点击"测试连接"验证配置是否正确</li>
        </ul>
      </div>
    </div>
  );
}