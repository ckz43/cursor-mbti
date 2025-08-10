// API 路由和中间件配置
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import { DatabaseService } from '../services/database';
import { userRoutes } from './routes/users';
import { sessionRoutes } from './routes/sessions';
import { answerRoutes } from './routes/answers';
import { paymentRoutes } from './routes/payments';
import { behaviorRoutes } from './routes/behaviors';
import { shareRoutes } from './routes/shares';
import { analyticsRoutes } from './routes/analytics';

const app = express();
const port = process.env.PORT || 3001;

// 初始化数据库服务
const dbService = new DatabaseService();

// 中间件配置
app.use(helmet()); // 安全头
app.use(compression()); // 响应压缩
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// 请求限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 1000, // 每个IP最多1000次请求
  message: '请求过于频繁，请稍后再试',
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// 特殊限制：答题接口
const answerLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1分钟
  max: 100, // 每分钟最多100次答题
  message: '答题过于频繁，请稍后再试'
});

// 解析请求体
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 请求日志中间件
app.use((req, res, next) => {
  const start = Date.now();
  const originalSend = res.send;
  
  res.send = function(data) {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
    return originalSend.call(this, data);
  };
  
  next();
});

// 数据库服务中间件
app.use((req, res, next) => {
  req.dbService = dbService;
  next();
});

// 健康检查
app.get('/health', async (req, res) => {
  try {
    await dbService.testConnection();
    res.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'unhealthy', 
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message
    });
  }
});

// API 路由
app.use('/api/users', userRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/answers', answerLimiter, answerRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/behaviors', behaviorRoutes);
app.use('/api/shares', shareRoutes);
app.use('/api/analytics', analyticsRoutes);

// 错误处理中间件
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('API Error:', error);
  
  // 数据库错误
  if (error.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      error: 'Duplicate entry',
      message: '数据已存在'
    });
  }
  
  // 验证错误
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation error',
      message: error.message,
      details: error.details
    });
  }
  
  // 默认错误
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : '服务器内部错误'
  });
});

// 404 处理
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: '接口不存在'
  });
});

// 启动服务器
app.listen(port, () => {
  console.log(`🚀 API服务器启动成功: http://localhost:${port}`);
  console.log(`📊 健康检查: http://localhost:${port}/health`);
});

// 优雅关闭
process.on('SIGTERM', async () => {
  console.log('收到 SIGTERM 信号，正在关闭服务器...');
  await dbService.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('收到 SIGINT 信号，正在关闭服务器...');
  await dbService.close();
  process.exit(0);
});

export default app;

// 类型扩展
declare global {
  namespace Express {
    interface Request {
      dbService: DatabaseService;
    }
  }
}