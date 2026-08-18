const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const progressRoutes = require('./routes/progress');
const quizRoutes = require('./routes/quiz');

const app = express();
const PORT = process.env.PORT || 3456;

// 中间件
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(session({
  // 密钥优先读环境变量；未设置时用开发默认值（本地 localhost 场景安全，生产部署务必设置 SESSION_SECRET）
  secret: process.env.SESSION_SECRET || 'xuanmen-learning-platform-2024',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 } // 7天
}));

// 静态文件：前端页面
app.use(express.static(path.join(__dirname, '..')));

// API 路由
app.use('/api/auth', authRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/quiz', quizRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`玄门学习平台已启动 → http://localhost:${PORT}`);
  console.log(`API 健康检查 → http://localhost:${PORT}/api/health`);
});
