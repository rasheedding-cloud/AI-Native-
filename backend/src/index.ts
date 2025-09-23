import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/logger';
import strategyRoutes from './routes/strategyRoutes';
import initiativeRoutes from './routes/initiativeRoutes';
import projectRoutes from './routes/projectRoutes';
import taskRoutes from './routes/taskRoutes';
import kpiRoutes from './routes/kpiRoutes';
import aiRoutes from './routes/aiRoutes';

// 加载环境变量
dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// 请求限制中间件
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 限制每个IP每15分钟最多100个请求
  message: '请求过于频繁，请稍后再试'
});

// 中间件
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(limiter);
app.use(requestLogger);

// 健康检查端点
app.get('/health', (_req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API路由
app.use('/api/strategies', strategyRoutes);
app.use('/api/initiatives', initiativeRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/kpis', kpiRoutes);
app.use('/api/ai', aiRoutes);

// 错误处理中间件
app.use(errorHandler);

// 404处理
app.use('*', (_req, res) => {
  res.status(404).json({ error: '接口不存在' });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 AI Native项目管理工具后端服务启动成功！`);
  console.log(`📊 服务器运行在端口: ${PORT}`);
  console.log(`🌐 健康检查: http://localhost:${PORT}/health`);
});

// 优雅关闭
process.on('SIGINT', async () => {
  console.log('正在关闭服务器...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('正在关闭服务器...');
  await prisma.$disconnect();
  process.exit(0);
});

export default app;