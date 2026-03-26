# 小说写作 Agent

一个支持自定义主题风格的AI小说写作工具。

## 功能特性

- **AI续写**：基于主题风格进行智能续写，支持流式输出
- **主题管理**：通过Web界面创建、编辑、删除自定义写作主题
- **项目管理**：创建、保存、加载、删除写作项目
- **历史记录**：自动保存项目历史版本
- **API配置**：支持任意OpenAI兼容API端点

## 技术栈

- **后端**: Python FastAPI
- **前端**: React + TypeScript + Vite
- **AI集成**: OpenAI Python SDK

## 项目结构

```
writer/
├── backend/           # FastAPI后端
│   ├── app/
│   │   ├── api/        # API路由
│   │   ├── services/  # 业务逻辑
│   │   └── models/    # 数据模型
│   ├── data/          # 数据存储
│   │   ├── projects/  # 项目文件
│   │   ├── themes/    # 主题配置
│   │   └── api_config.json
│   └── requirements.txt
├── frontend/          # React前端
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── utils/
│   └── package.json
└── README.md
```

## 快速开始

### 1. 安装后端依赖

```bash
cd backend
pip install -r requirements.txt
```

### 2. 启动后端服务

```bash
cd backend
python -m uvicorn app.main:app --reload --port 8000
```

后端服务将在 http://localhost:8000 运行

### 3. 启动前端开发服务器

```bash
cd frontend
npm run dev
```

前端应用将在 http://localhost:5173 运行

### 4. 配置API

1. 打开 http://localhost:5173/settings
2. 填写API端点和API Key
3. 点击"测试连接"验证配置
4. 点击"保存配置"

## 使用指南

### 创建主题

1. 进入"主题"页面
2. 填写主题名称、风格类型、写作风格、世界观、角色设定等
3. 点击"创建主题"

### 创建项目

1. 进入"项目"页面
2. 点击"新建项目"
3. 输入项目名称，选择主题
4. 点击"创建"

### AI续写

1. 在写作界面输入或粘贴已有内容
2. 选择项目的主题（可选）
3. 点击"AI续写"按钮
4. 等待AI生成内容
5. 预览生成结果，可以"采纳"或"丢弃"
6. 采纳后内容会追加到正文

## 注意事项

- 确保API配置正确，否则AI功能无法使用
- 项目数据保存在本地文件系统中
- 建议定期备份data目录下的数据