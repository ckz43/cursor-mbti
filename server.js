// MBTI测试系统 - 后端服务器
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import mysql from 'mysql2/promise';
import path from 'path';
import dotenv from 'dotenv';
import crypto from 'crypto';
import fs from 'fs';
// 导入配置文件
import config from './config/index.js';
// WeChat Pay v3 helpers
const wechatCfg = config.payment.wechat || {};
const mchPrivateKeyPem = wechatCfg.merchantPrivateKeyPath && fs.existsSync(wechatCfg.merchantPrivateKeyPath)
  ? fs.readFileSync(wechatCfg.merchantPrivateKeyPath, 'utf8')
  : '';
const platformCertPem = wechatCfg.platformCertificatePath && fs.existsSync(wechatCfg.platformCertificatePath)
  ? fs.readFileSync(wechatCfg.platformCertificatePath, 'utf8')
  : '';

function buildAuthorization(method, urlPathWithQuery, body) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonceStr = crypto.randomBytes(16).toString('hex');
  const bodyStr = body ? JSON.stringify(body) : '';
  const message = `${method}\n${urlPathWithQuery}\n${timestamp}\n${nonceStr}\n${bodyStr}\n`;
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(message);
  sign.end();
  const signature = sign.sign(mchPrivateKeyPem, 'base64');
  const token = `mchid=\"${wechatCfg.mchId}\",nonce_str=\"${nonceStr}\",timestamp=\"${timestamp}\",serial_no=\"${wechatCfg.merchantCertificateSerial}\",signature=\"${signature}\"`;
  return `WECHATPAY2-SHA256-RSA2048 ${token}`;
}

function buildJsapiPayParams(prepayId) {
  const timeStamp = Math.floor(Date.now() / 1000).toString();
  const nonceStr = crypto.randomBytes(16).toString('hex');
  const pkg = `prepay_id=${prepayId}`;
  const signString = `${wechatCfg.appId}\n${timeStamp}\n${nonceStr}\n${pkg}\n`;
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(signString);
  sign.end();
  const paySign = sign.sign(mchPrivateKeyPem, 'base64');
  return {
    appId: wechatCfg.appId,
    timeStamp,
    nonceStr,
    package: pkg,
    signType: 'RSA',
    paySign
  };
}

function verifyWechatpaySignature(headers, bodyRaw) {
  try {
    const serial = headers['wechatpay-serial'];
    const timestamp = headers['wechatpay-timestamp'];
    const nonce = headers['wechatpay-nonce'];
    const signature = headers['wechatpay-signature'];
    if (!serial || !timestamp || !nonce || !signature || !platformCertPem) return false;
    const message = `${timestamp}\n${nonce}\n${bodyRaw}\n`;
    const verify = crypto.createVerify('RSA-SHA256');
    verify.update(message);
    verify.end();
    return verify.verify(platformCertPem, signature, 'base64');
  } catch (e) {
    return false;
  }
}

function decryptResource(resource) {
  const { associated_data, nonce, ciphertext } = resource || {};
  const key = wechatCfg.apiV3Key;
  const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(key, 'utf8'), Buffer.from(nonce, 'utf8'));
  if (associated_data) decipher.setAAD(Buffer.from(associated_data, 'utf8'));
  const data = Buffer.from(ciphertext, 'base64');
  const authTag = data.slice(data.length - 16);
  const text = data.slice(0, data.length - 16);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(text), decipher.final()]);
  return JSON.parse(decrypted.toString('utf8'));
}

dotenv.config();

const app = express();
const PORT = config.server.port;  // 使用配置文件中的端口

// 数据库连接池
const dbPool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  waitForConnections: true,
  connectionLimit: config.db.pool.connectionLimit,
  queueLimit: config.db.pool.queueLimit,
  acquireTimeout: config.db.pool.acquireTimeout,
  timeout: config.db.pool.timeout,
  reconnect: config.db.pool.reconnect,
  charset: config.db.pool.charset,
  // 确保数字字段返回数字类型而不是字符串
  decimalNumbers: true,
  typeCast: function (field, next) {
    if (field.type === 'DECIMAL' || field.type === 'NEWDECIMAL' || field.type === 'FLOAT' || field.type === 'DOUBLE') {
      var value = field.string();
      return (value === null) ? null : Number(value);
    }
    return next();
  }
});

// 中间件配置
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: config.server.security.corsOrigin,
  credentials: true
}));

// 请求限制
const limiter = rateLimit({
  windowMs: config.server.rateLimit.windowMs,
  max: config.server.rateLimit.max,
  message: { error: '请求过于频繁，请稍后再试' },
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// 管理接口特殊限制
const adminLimiter = rateLimit({
  windowMs: config.server.rateLimit.windowMs,
  max: config.server.rateLimit.adminMax,
  message: { error: '管理接口请求过于频繁' }
});

// 解析请求体
app.use(express.json({ 
  limit: config.server.bodyParser.jsonLimit,
  verify: (req, _res, buf) => {
    // 保存原始请求体供微信回调验签使用
    if (req.originalUrl && req.originalUrl.startsWith('/api/wechatpay/notify')) {
      req.rawBody = buf.toString('utf8');
    }
  }
}));
app.use(express.urlencoded({ extended: true, limit: config.server.bodyParser.urlencodedLimit }));

// 请求日志中间件
app.use((req, res, next) => {
  const start = Date.now();
  const originalSend = res.send;
  
  res.send = function(data) {
    const duration = Date.now() - start;
    console.log(`${new Date().toISOString()} ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
    return originalSend.call(this, data);
  };
  
  next();
});

// 数据库连接中间件
app.use((req, res, next) => {
  req.db = dbPool;
  next();
});

// JWT认证中间件
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: '访问令牌缺失' });
  }

  jwt.verify(token, config.server.security.jwtSecret, (err, user) => {
    if (err) {
      return res.status(403).json({ error: '访问令牌无效' });
    }
    req.user = user;
    next();
  });
};

// 管理员权限中间件
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: '需要管理员权限' });
  }
  next();
};

// ==================== 基础接口 ====================

// 健康检查
app.get('/health', async (req, res) => {
  try {
    const connection = await dbPool.getConnection();
    await connection.ping();
    connection.release();
    
    res.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      database: 'connected',
      version: '1.0.0'
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

// ==================== 管理员认证接口 ====================

// 管理员登录
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码不能为空' });
    }

    // 验证管理员账户（使用配置文件中的默认账户）
    if (username !== config.admin.defaultUsername) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    // 简单密码验证（生产环境应使用数据库存储的哈希密码）
    if (password !== config.admin.defaultPassword) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    // 生成JWT token
    const token = jwt.sign(
      { 
        username, 
        role: 'admin',
        loginTime: new Date().toISOString()
      },
      config.server.security.jwtSecret,
      { expiresIn: config.server.security.jwtExpiresIn }
    );

    res.json({
      success: true,
      token,
      user: {
        username,
        role: 'admin',
        loginTime: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('管理员登录失败:', error);
    res.status(500).json({ error: '登录失败，请稍后重试' });
  }
});

// 验证token
app.get('/api/admin/verify', authenticateToken, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

// ==================== 用户管理接口 ====================

// 获取用户列表
app.get('/api/admin/users', adminLimiter, authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', status = '' } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = 'WHERE 1=1';
    const params = [];
    
    if (search) {
      whereClause += ' AND (nickname LIKE ? OR email LIKE ? OR phone LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    if (status !== '') {
      whereClause += ' AND status = ?';
      params.push(status);
    }
    
    // 获取用户列表
    // 安全处理分页参数，避免 MySQL 预处理语句对 LIMIT/OFFSET 的占位符兼容问题
    const safeLimit = Math.max(1, Math.min(1000, parseInt(limit, 10) || 20));
    const safeOffset = Math.max(0, parseInt(offset, 10) || 0);

    const [users] = await req.db.execute(
      `SELECT user_id, nickname, email, phone, gender, city, province, 
              registration_source, status, created_at, updated_at, last_login_at
       FROM users ${whereClause} 
       ORDER BY created_at DESC 
       LIMIT ${safeLimit} OFFSET ${safeOffset}`,
      params
    );
    
    // 获取总数
    const [countResult] = await req.db.execute(
      `SELECT COUNT(*) as total FROM users ${whereClause}`,
      params
    );
    
    res.json({
      success: true,
      data: {
        users,
        total: countResult[0].total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(countResult[0].total / limit)
      }
    });
    
  } catch (error) {
    console.error('获取用户列表失败:', error);
    res.status(500).json({ error: '获取用户列表失败' });
  }
});

// 获取用户详情
app.get('/api/admin/users/:userId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // 获取用户基本信息
    const [users] = await req.db.execute(
      'SELECT * FROM users WHERE user_id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ error: '用户不存在' });
    }
    
    // 获取用户测试记录
    const [sessions] = await req.db.execute(
      `SELECT session_id, test_type, status, start_time, complete_time, 
              mbti_type, time_spent_seconds, answered_questions, total_questions
       FROM test_sessions 
       WHERE user_id = ? 
       ORDER BY start_time DESC`,
      [userId]
    );
    
    // 获取支付记录
    const [payments] = await req.db.execute(
      `SELECT order_id, final_amount, payment_status, payment_method, created_at
       FROM payment_orders 
       WHERE user_id = ? 
       ORDER BY created_at DESC`,
      [userId]
    );
    
    res.json({
      success: true,
      data: {
        user: users[0],
        sessions,
        payments
      }
    });
    
  } catch (error) {
    console.error('获取用户详情失败:', error);
    res.status(500).json({ error: '获取用户详情失败' });
  }
});

// 更新用户状态
app.put('/api/admin/users/:userId/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;
    
    // 验证状态值
    if (status !== 0 && status !== 1) {
      return res.status(400).json({ error: '状态值必须为0或1' });
    }
    
    // 检查用户是否存在
    const [users] = await req.db.execute(
      'SELECT user_id FROM users WHERE user_id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ error: '用户不存在' });
    }
    
    // 更新用户状态
    await req.db.execute(
      'UPDATE users SET status = ?, updated_at = NOW() WHERE user_id = ?',
      [status, userId]
    );
    
    res.json({
      success: true,
      message: `用户状态已${status === 1 ? '启用' : '禁用'}`
    });
    
  } catch (error) {
    console.error('更新用户状态失败:', error);
    res.status(500).json({ error: '更新用户状态失败' });
  }
});

// ==================== 数据统计接口 ====================

// 获取仪表板统计数据
app.get('/api/admin/dashboard/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // 用户统计
    const [userStats] = await req.db.execute(
      `SELECT 
         COUNT(*) as total_users,
         COUNT(CASE WHEN DATE(created_at) = CURDATE() THEN 1 END) as today_users,
         COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as week_users,
         COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as month_users
       FROM users`
    );
    
    // 测试统计
    const [testStats] = await req.db.execute(
      `SELECT 
         COUNT(*) as total_tests,
         COUNT(CASE WHEN status = 1 THEN 1 END) as completed_tests,
         COUNT(CASE WHEN DATE(start_time) = CURDATE() THEN 1 END) as today_tests,
         COALESCE(AVG(time_spent_seconds), 0) as avg_test_time
       FROM test_sessions`
    );
    
    // 支付统计
    const [paymentStats] = await req.db.execute(
      `SELECT 
         COUNT(*) as total_orders,
         COUNT(CASE WHEN payment_status = 1 THEN 1 END) as paid_orders,
         COALESCE(SUM(CASE WHEN payment_status = 1 THEN final_amount ELSE 0 END), 0) as total_revenue,
         COALESCE(SUM(CASE WHEN payment_status = 1 AND DATE(created_at) = CURDATE() THEN final_amount ELSE 0 END), 0) as today_revenue
       FROM payment_orders`
    );
    
    // MBTI类型分布
    const [mbtiDistribution] = await req.db.execute(
      `SELECT mbti_type, COUNT(*) as count 
       FROM test_sessions 
       WHERE status = 1 AND mbti_type IS NOT NULL 
       GROUP BY mbti_type 
       ORDER BY count DESC`
    );
    
    res.json({
      success: true,
      data: {
        users: userStats[0],
        tests: testStats[0],
        payments: paymentStats[0],
        mbtiDistribution
      }
    });
    
  } catch (error) {
    console.error('获取统计数据失败:', error);
    res.status(500).json({ error: '获取统计数据失败' });
  }
});

// 获取用户增长趋势
app.get('/api/admin/analytics/user-growth', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const [growth] = await req.db.execute(
      `SELECT 
         DATE(created_at) as date,
         COUNT(*) as new_users,
         SUM(COUNT(*)) OVER (ORDER BY DATE(created_at)) as total_users
       FROM users 
       WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       GROUP BY DATE(created_at)
       ORDER BY date`,
      [parseInt(days)]
    );
    
    res.json({
      success: true,
      data: growth
    });
    
  } catch (error) {
    console.error('获取用户增长趋势失败:', error);
    res.status(500).json({ error: '获取用户增长趋势失败' });
  }
});

// 获取MBTI类型分布
app.get('/api/admin/analytics/mbti-distribution', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [results] = await req.db.execute(
      `SELECT 
         mbti_type,
         COUNT(*) as count,
         ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM test_sessions WHERE status = 1 AND mbti_type IS NOT NULL), 2) as percentage
       FROM test_sessions 
       WHERE status = 1 AND mbti_type IS NOT NULL
       GROUP BY mbti_type
       ORDER BY count DESC`
    );
    
    res.json({
      success: true,
      data: results
    });
    
  } catch (error) {
    console.error('获取MBTI类型分布失败:', error);
    res.status(500).json({ error: '获取MBTI类型分布失败' });
  }
});

// 获取测试完成情况
app.get('/api/admin/analytics/test-completion', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const [results] = await req.db.execute(
      `SELECT 
         DATE(start_time) as date,
         COUNT(*) as total_tests,
         COUNT(CASE WHEN status = 1 THEN 1 END) as completed_tests,
         COUNT(CASE WHEN status = 0 THEN 1 END) as incomplete_tests,
         ROUND(COUNT(CASE WHEN status = 1 THEN 1 END) * 100.0 / COUNT(*), 2) as completion_rate
       FROM test_sessions 
       WHERE start_time >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       GROUP BY DATE(start_time)
       ORDER BY date ASC`,
      [parseInt(days)]
    );
    
    res.json({
      success: true,
      data: results
    });
    
  } catch (error) {
    console.error('获取测试完成情况失败:', error);
    res.status(500).json({ error: '获取测试完成情况失败' });
  }
});

// 获取用户活跃时段
app.get('/api/admin/analytics/user-activity', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [hourlyActivity] = await req.db.execute(
      `SELECT 
         HOUR(created_at) as hour,
         COUNT(*) as activity_count
       FROM users 
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       GROUP BY HOUR(created_at)
       ORDER BY hour`
    );
    
    const [weeklyActivity] = await req.db.execute(
      `SELECT 
         DAYOFWEEK(created_at) as day_of_week,
         DAYNAME(created_at) as day_name,
         COUNT(*) as activity_count
       FROM users 
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       GROUP BY DAYOFWEEK(created_at), DAYNAME(created_at)
       ORDER BY day_of_week`
    );
    
    res.json({
      success: true,
      data: {
        hourly: hourlyActivity,
        weekly: weeklyActivity
      }
    });
    
  } catch (error) {
    console.error('获取用户活跃时段失败:', error);
    res.status(500).json({ error: '获取用户活跃时段失败' });
  }
});

// 获取收入统计
app.get('/api/admin/analytics/revenue', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const [dailyRevenue] = await req.db.execute(
      `SELECT 
         DATE(created_at) as date,
         COUNT(*) as total_orders,
         COUNT(CASE WHEN payment_status = 1 THEN 1 END) as paid_orders,
         SUM(CASE WHEN payment_status = 1 THEN final_amount ELSE 0 END) as revenue
       FROM payment_orders 
       WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       GROUP BY DATE(created_at)
       ORDER BY date ASC`,
      [parseInt(days)]
    );
    
    const [paymentMethods] = await req.db.execute(
      `SELECT 
         payment_method,
         COUNT(*) as count,
         SUM(final_amount) as total_amount
       FROM payment_orders 
       WHERE payment_status = 1 AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
       GROUP BY payment_method
       ORDER BY count DESC`,
      [parseInt(days)]
    );
    
    res.json({
      success: true,
      data: {
        daily: dailyRevenue,
        paymentMethods
      }
    });
    
  } catch (error) {
    console.error('获取收入统计失败:', error);
    res.status(500).json({ error: '获取收入统计失败' });
  }
});

// ==================== 测试管理接口 ====================

// 获取测试会话列表
app.get('/api/admin/sessions', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, status = '', mbti_type = '' } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = 'WHERE 1=1';
    const params = [];
    
    if (status !== '') {
      whereClause += ' AND ts.status = ?';
      params.push(status);
    }
    
    if (mbti_type) {
      whereClause += ' AND ts.mbti_type = ?';
      params.push(mbti_type);
    }
    
    // 安全处理分页参数
    const safeLimit = Math.max(1, Math.min(1000, parseInt(limit, 10) || 20));
    const safeOffset = Math.max(0, parseInt(offset, 10) || 0);
    
    const [sessions] = await req.db.execute(
      `SELECT ts.*, u.nickname, u.email 
       FROM test_sessions ts
       LEFT JOIN users u ON ts.user_id = u.user_id
       ${whereClause}
       ORDER BY ts.start_time DESC 
       LIMIT ${safeLimit} OFFSET ${safeOffset}`,
      params
    );
    
    const [countResult] = await req.db.execute(
      `SELECT COUNT(*) as total 
       FROM test_sessions ts
       LEFT JOIN users u ON ts.user_id = u.user_id
       ${whereClause}`,
      params
    );
    
    res.json({
      success: true,
      data: {
        sessions,
        total: countResult[0].total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(countResult[0].total / limit)
      }
    });
    
  } catch (error) {
    console.error('获取测试会话列表失败:', error);
    res.status(500).json({ error: '获取测试会话列表失败' });
  }
});

// 获取测试列表（为AdminTests.vue提供数据）
app.get('/api/admin/tests', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search = '', 
      status = '', 
      result_type = '',
      start_date = '',
      end_date = ''
    } = req.query;
    
    const offset = (page - 1) * limit;
    let whereClause = 'WHERE 1=1';
    const params = [];
    
    // 搜索条件
    if (search) {
      whereClause += ' AND (ts.session_id LIKE ? OR ts.user_id LIKE ? OR u.nickname LIKE ? OR ts.mbti_type LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    // 状态筛选
    if (status) {
      if (status === 'completed') {
        whereClause += ' AND ts.status = 1';
      } else if (status === 'in_progress') {
        whereClause += ' AND ts.status = 0';
      } else if (status === 'abandoned') {
        whereClause += ' AND ts.status = -1';
      }
    }
    
    // MBTI类型筛选
    if (result_type) {
      whereClause += ' AND ts.mbti_type = ?';
      params.push(result_type);
    }
    
    // 日期范围筛选
    if (start_date) {
      whereClause += ' AND DATE(ts.start_time) >= ?';
      params.push(start_date);
    }
    
    if (end_date) {
      whereClause += ' AND DATE(ts.start_time) <= ?';
      params.push(end_date);
    }
    
    // 安全处理分页参数
    const safeLimit = Math.max(1, Math.min(1000, parseInt(limit, 10) || 20));
    const safeOffset = Math.max(0, parseInt(offset, 10) || 0);
    
    // 获取测试列表
    const [tests] = await req.db.execute(
      `SELECT 
         ts.session_id,
         ts.user_id,
         ts.status,
         ts.mbti_type as result_type,
         ts.total_questions,
         ts.time_spent_seconds as test_duration,
         ts.start_time as created_at,
         ts.complete_time as completed_at,
         u.nickname,
         u.email,
         (
           SELECT COUNT(*) 
           FROM answer_records ar 
           WHERE ar.session_id = ts.session_id
         ) as answer_count
       FROM test_sessions ts
       LEFT JOIN users u ON ts.user_id = u.user_id
       ${whereClause}
       ORDER BY ts.start_time DESC 
       LIMIT ${safeLimit} OFFSET ${safeOffset}`,
      params
    );
    
    // 处理测试数据，添加用户信息并转换状态
    const processedTests = tests.map(test => {
      // 将数字状态转换为字符串状态
      let statusString = 'unknown';
      switch(test.status) {
        case 1: statusString = 'completed'; break;
        case 0: statusString = 'in_progress'; break;
        case -1: statusString = 'abandoned'; break;
        default: statusString = 'unknown';
      }
      
      return {
        ...test,
        status: statusString, // 覆盖数字状态为字符串状态
        user: test.nickname ? {
          nickname: test.nickname,
          email: test.email
        } : null
      };
    });
    
    // 获取总数
    const [countResult] = await req.db.execute(
      `SELECT COUNT(*) as total 
       FROM test_sessions ts
       LEFT JOIN users u ON ts.user_id = u.user_id
       ${whereClause}`,
      params
    );
    
    res.json({
      success: true,
      data: {
        tests: processedTests,
        total: countResult[0].total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(countResult[0].total / limit)
      }
    });
    
  } catch (error) {
    console.error('获取测试列表失败:', error);
    res.status(500).json({ error: '获取测试列表失败' });
  }
});

// 获取测试详情
app.get('/api/admin/tests/:sessionId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { sessionId } = req.params;

    // 查询测试会话详情
    const [rows] = await req.db.execute(
      `SELECT 
         ts.session_id,
         ts.user_id,
         ts.status,
         ts.mbti_type as result_type,
         ts.total_questions,
         ts.time_spent_seconds as test_duration,
         ts.start_time as created_at,
         ts.complete_time as completed_at,
         u.nickname,
         u.email
       FROM test_sessions ts
       LEFT JOIN users u ON ts.user_id = u.user_id
       WHERE ts.session_id = ?`,
      [sessionId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: '测试不存在' });
    }

    const test = rows[0];
    // 状态转换
    let statusString = 'unknown';
    switch(test.status) {
      case 1: statusString = 'completed'; break;
      case 0: statusString = 'in_progress'; break;
      case -1: statusString = 'abandoned'; break;
      default: statusString = 'unknown';
    }

    // 获取答案数量
    const [answerCountRows] = await req.db.execute(
      'SELECT COUNT(*) as answer_count FROM answer_records WHERE session_id = ?',
      [sessionId]
    );

    const detail = {
      ...test,
      status: statusString,
      user: test.nickname ? { nickname: test.nickname, email: test.email } : null,
      answer_count: answerCountRows[0].answer_count
    };

    res.json({ success: true, data: detail });
  } catch (error) {
    console.error('获取测试详情失败:', error);
    res.status(500).json({ error: '获取测试详情失败' });
  }
});

// 获取测试答案详情
app.get('/api/admin/tests/:sessionId/answers', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { sessionId } = req.params;

    const [answers] = await req.db.execute(
      `SELECT 
         ar.id,
         ar.session_id,
         ar.question_id,
         ar.answer_value,
         ar.created_at,
         q.section,
         q.question_text
       FROM answer_records ar
       LEFT JOIN questions q ON ar.question_id = q.id
       WHERE ar.session_id = ?
       ORDER BY ar.created_at ASC`,
      [sessionId]
    );

    res.json({ success: true, data: answers });
  } catch (error) {
    console.error('获取答案详情失败:', error);
    res.status(500).json({ error: '获取答案详情失败' });
  }
});

// ==================== 前端API接口（兼容现有系统）====================

// 用户相关接口
app.post('/api/users', async (req, res) => {
  try {
    const userData = req.body;
    const userId = userData.user_id || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 检查微信用户是否已存在（通过 openid）
    if (userData.openid) {
      const [existingUsers] = await req.db.execute(
        'SELECT user_id, id FROM users WHERE openid = ?',
        [userData.openid]
      );
      
      if (existingUsers.length > 0) {
        // 用户已存在，返回现有用户信息
        return res.json({
          success: true,
          data: existingUsers[0],
          message: '用户已存在，返回现有用户信息'
        });
      }
    }
    
    const [result] = await req.db.execute(
      `INSERT INTO users (user_id, openid, unionid, nickname, email, phone, gender, city, province, 
                          registration_source, device_info, ip_address, user_agent) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        userData.openid || null,
        userData.unionid || null,
        userData.nickname || null,
        userData.email || null,
        userData.phone || null,
        userData.gender || null,
        userData.city || null,
        userData.province || null,
        userData.registration_source || (userData.openid ? 'wechat' : 'direct'),
        JSON.stringify(userData.device_info || {}),
        userData.ip_address || null,
        userData.user_agent || null
      ]
    );
    
    res.json({
      success: true,
      data: { ...userData, user_id: userId, id: result.insertId }
    });
    
  } catch (error) {
    console.error('创建用户失败:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: '用户已存在' });
    }
    res.status(500).json({ error: '创建用户失败' });
  }
});

// 测试会话相关接口
app.post('/api/sessions', async (req, res) => {
  try {
    const sessionData = req.body;
    const sessionId = sessionData.session_id || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const [result] = await req.db.execute(
      `INSERT INTO test_sessions (session_id, user_id, test_type, test_version, 
                                  total_questions, device_type, browser_info, ip_address, source_page) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sessionId,
        sessionData.user_id,
        sessionData.test_type || 'mbti_93',
        sessionData.test_version || '1.0',
        sessionData.total_questions || 93,
        sessionData.device_type || null,
        sessionData.browser_info || null,
        sessionData.ip_address || null,
        sessionData.source_page || null
      ]
    );
    
    res.json({
      success: true,
      data: { ...sessionData, session_id: sessionId, id: result.insertId }
    });
    
  } catch (error) {
    console.error('创建测试会话失败:', error);
    res.status(500).json({ error: '创建测试会话失败' });
  }
});

// 更新测试结果
app.put('/api/sessions/:sessionId/result', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const resultData = req.body;
    
    const [result] = await req.db.execute(
      `UPDATE test_sessions 
       SET status = 1, complete_time = NOW(), mbti_type = ?, 
           ei_score = ?, ns_score = ?, tf_score = ?, jp_score = ?,
           ei_percentage = ?, ns_percentage = ?, tf_percentage = ?, jp_percentage = ?,
           confidence_score = ?, time_spent_seconds = ?
       WHERE session_id = ?`,
      [
        resultData.mbti_type,
        resultData.ei_score || null,
        resultData.ns_score || null,
        resultData.tf_score || null,
        resultData.jp_score || null,
        resultData.ei_percentage || null,
        resultData.ns_percentage || null,
        resultData.tf_percentage || null,
        resultData.jp_percentage || null,
        resultData.confidence_score || null,
        resultData.time_spent_seconds || null,
        sessionId
      ]
    );
    
    res.json({
      success: true,
      data: { session_id: sessionId, ...resultData }
    });
    
  } catch (error) {
    console.error('更新测试结果失败:', error);
    res.status(500).json({ error: '更新测试结果失败' });
  }
});

// 保存答题记录
app.post('/api/answers', async (req, res) => {
  try {
    const answerData = req.body;
    
    const [result] = await req.db.execute(
      `INSERT INTO answer_records (session_id, user_id, question_index, question_text, 
                                   selected_option, option_text, answer_time_seconds, device_type) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        answerData.session_id,
        answerData.user_id,
        answerData.question_index,
        answerData.question_text || null,
        answerData.selected_option,
        answerData.option_text || null,
        answerData.answer_time_seconds || null,
        answerData.device_type || null
      ]
    );
    
    res.json({
      success: true,
      data: { ...answerData, id: result.insertId }
    });
    
  } catch (error) {
    console.error('保存答题记录失败:', error);
    res.status(500).json({ error: '保存答题记录失败' });
  }
});

// ==================== 支付订单接口 ====================

// 创建支付订单
app.post('/api/payment-orders', async (req, res) => {
  try {
    const {
      user_id,
      session_id,
      product_type,
      product_name,
      original_amount,
      discount_amount,
      final_amount,
      currency,
      payment_method,
      payment_status,
      trade_no,
      prepay_id,
      ip_address,
      user_agent,
      remark,
      // 兼容旧版本API，如果没有传完整数据，使用amount字段
      amount,
      // 微信支付支持：接收openid和unionid
      openid,
      unionid
    } = req.body;

    // 验证必需字段
    const finalAmount = final_amount || amount;
    const originalAmount = original_amount || amount;
    
    if (!user_id || !product_type || !finalAmount) {
      return res.status(400).json({ error: '缺少必需字段: user_id, product_type, final_amount/amount' });
    }

    // 检查用户是否存在，优先通过openid查找
    let userExists = false;
    if (openid) {
      const [openidUsers] = await req.db.execute(
        'SELECT user_id FROM users WHERE openid = ?',
        [openid]
      );
      userExists = openidUsers.length > 0;
    }
    
    if (!userExists) {
      const [userRows] = await req.db.execute(
        'SELECT user_id FROM users WHERE user_id = ?',
        [user_id]
      );
      userExists = userRows.length > 0;
    }

    if (!userExists) {
      // 创建用户记录，包含微信信息
      await req.db.execute(
        `INSERT INTO users (user_id, openid, unionid, nickname, registration_source, ip_address, user_agent) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          user_id,
          openid || null,
          unionid || null,
          `用户_${user_id.slice(-8)}`, // 使用user_id后8位作为默认昵称
          openid ? 'wechat_payment' : 'payment', // 通过微信支付或普通支付创建的用户
          ip_address || req.ip,
          user_agent || req.get('User-Agent')
        ]
      );
      console.log(`自动创建用户: ${user_id}${openid ? ' (微信用户)' : ''}`);
    }

    // 检查session是否存在，如果不存在则创建或设为null
    let finalSessionId = session_id;
    if (session_id) {
      const [sessionRows] = await req.db.execute(
        'SELECT session_id FROM test_sessions WHERE session_id = ?',
        [session_id]
      );

      if (sessionRows.length === 0) {
        // 创建session记录
        await req.db.execute(
          `INSERT INTO test_sessions (session_id, user_id, start_time, status) 
           VALUES (?, ?, NOW(), 0)`,
          [session_id, user_id]
        );
        console.log(`自动创建session: ${session_id}`);
      }
    } else {
      finalSessionId = null;
    }

    // 生成订单ID（如果没有提供）
    const order_id = req.body.order_id || `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 根据产品类型设置产品名称（如果没有提供）
    const productNames = {
      'basic_report': 'MBTI基础报告',
      'premium_report': 'MBTI完整报告',
      'career_guidance': 'MBTI职业指导'
    };
    const finalProductName = product_name || productNames[product_type] || product_type;

    const [result] = await req.db.execute(
      `INSERT INTO payment_orders (
        order_id, user_id, session_id, product_type, product_name, original_amount,
        discount_amount, final_amount, currency, payment_method, payment_status,
        trade_no, prepay_id, ip_address, user_agent, remark
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        order_id,
        user_id,
        finalSessionId,
        product_type,
        finalProductName,
        originalAmount,
        discount_amount || 0,
        finalAmount,
        currency || 'CNY',
        payment_method || null,
        payment_status || 0,
        trade_no || null,
        prepay_id || null,
        ip_address || null,
        user_agent || null,
        remark || null
      ]
    );

    const [rows] = await req.db.execute(
      'SELECT * FROM payment_orders WHERE id = ?',
      [result.insertId]
    );

    // 如果是微信支付，且已配置v3参数，则走JSAPI预下单
    let paymentConfigData = null;
    const isWechatPay = (payment_method && payment_method.toLowerCase() === 'wechat') || !!openid;
    const v3Ready = wechatCfg && wechatCfg.appId && wechatCfg.mchId && wechatCfg.apiV3Key && mchPrivateKeyPem && wechatCfg.merchantCertificateSerial;

    if (isWechatPay && v3Ready) {
      try {
        const urlPath = '/v3/pay/transactions/jsapi';
        const url = `${wechatCfg.apiBase}${urlPath}`;
        const body = {
          appid: wechatCfg.appId,
          mchid: wechatCfg.mchId,
          description: finalProductName,
          out_trade_no: order_id,
          notify_url: wechatCfg.notifyUrl || `${config.server.frontendUrl.replace(/\/$/, '')}/api/wechatpay/notify`,
          amount: { total: Math.round(Number(finalAmount) * 100) },
          payer: { openid: openid || '' }
        };
        const auth = buildAuthorization('POST', urlPath, body);
        const resp = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Authorization': auth,
            'Accept': 'application/json'
          },
          body: JSON.stringify(body)
        });
        const prepayRes = await resp.json();
        if (!resp.ok || !prepayRes.prepay_id) {
          console.error('WeChat JSAPI unified order failed:', prepayRes);
          // 不中断主流程：返回订单信息，前端可提示失败
        } else {
          // 保存 prepay_id
          await req.db.execute('UPDATE payment_orders SET prepay_id = ? WHERE id = ?', [prepayRes.prepay_id, result.insertId]);
          rows[0].prepay_id = prepayRes.prepay_id;
          paymentConfigData = buildJsapiPayParams(prepayRes.prepay_id);
        }
      } catch (err) {
        console.error('WeChat v3 unified order error:', err);
      }
    }

    res.json({ success: true, data: paymentConfigData ? { ...rows[0], paymentConfig: paymentConfigData } : rows[0] });

  } catch (error) {
    console.error('创建支付订单失败:', error);
    res.status(500).json({ error: '创建支付订单失败' });
  }
});

// WeChat Pay v3 异步通知回调
app.post('/api/wechatpay/notify', async (req, res) => {
  try {
    const bodyRaw = req.rawBody || JSON.stringify(req.body || {});
    const headers = Object.fromEntries(Object.entries(req.headers).map(([k, v]) => [k.toLowerCase(), v]));
    const ok = verifyWechatpaySignature(headers, bodyRaw);
    if (!ok) {
      console.warn('微信回调验签失败');
      return res.status(401).send('signature verify failed');
    }

    const json = typeof req.body === 'object' && Object.keys(req.body || {}).length ? req.body : JSON.parse(bodyRaw);
    const resource = decryptResource(json.resource);
    const { out_trade_no, transaction_id, trade_state, success_time, amount } = resource;

    if (trade_state === 'SUCCESS') {
      // 更新订单状态
      const paidAt = success_time ? success_time.replace('T', ' ').replace('Z', '') : new Date();
      const paidAmountYuan = amount?.total != null ? (Number(amount.total) / 100.0) : null;
      await req.db.execute(
        `UPDATE payment_orders SET payment_status = 1, trade_no = ?, payment_time = ?, 
         final_amount = COALESCE(final_amount, ?)
         WHERE order_id = ?`,
        [transaction_id, paidAt, paidAmountYuan, out_trade_no]
      );

      // 获取订单信息
      const [orders] = await req.db.execute('SELECT * FROM payment_orders WHERE order_id = ?', [out_trade_no]);
      if (orders.length) {
        const order = orders[0];
        // 从 test_sessions 读取结果构建报告
        const [sessions] = await req.db.execute('SELECT * FROM test_sessions WHERE session_id = ?', [order.session_id]);
        if (sessions.length) {
          const s = sessions[0];
          const proportions = s.ei_percentage != null ? {
            EI: Number(s.ei_percentage) || 0,
            NS: Number(s.ns_percentage) || 0,
            TF: Number(s.tf_percentage) || 0,
            JP: Number(s.jp_percentage) || 0
          } : null;
          // 基础内容占位，可由前端/后端增强
          const content = { summary: 'MBTI 报告', generatedAt: new Date().toISOString() };
          // upsert 报告
          await req.db.execute(
            `INSERT INTO reports (order_id, user_id, session_id, mbti_type, proportions, content)
             VALUES (?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE mbti_type = VALUES(mbti_type), proportions = VALUES(proportions), content = VALUES(content), updated_at = NOW()`,
            [out_trade_no, order.user_id, order.session_id, s.mbti_type || 'ENFP', JSON.stringify(proportions || {}), JSON.stringify(content)]
          );
        }
      }
    }

    res.status(200).json({ code: 'SUCCESS' });
  } catch (err) {
    console.error('处理微信支付回调失败:', err);
    res.status(500).send('error');
  }
});

// 报告接口：根据订单号获取
app.get('/api/reports/by-order/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const [rows] = await req.db.execute('SELECT * FROM reports WHERE order_id = ?', [orderId]);
    if (!rows.length) return res.status(404).json({ error: '报告不存在或尚未生成' });
    res.json({ success: true, data: rows[0] });
  } catch (e) {
    res.status(500).json({ error: '获取报告失败' });
  }
});

// 报告接口：创建或覆盖（可用于前端在支付成功回调后主动落库，最终以异步通知为准）
app.post('/api/reports', async (req, res) => {
  try {
    const { order_id, user_id, session_id, mbti_type, proportions, content } = req.body;
    if (!order_id || !user_id || !mbti_type) return res.status(400).json({ error: '缺少必要字段' });
    await req.db.execute(
      `INSERT INTO reports (order_id, user_id, session_id, mbti_type, proportions, content)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE session_id = VALUES(session_id), mbti_type = VALUES(mbti_type), proportions = VALUES(proportions), content = VALUES(content), updated_at = NOW()`,
      [order_id, user_id, session_id || null, mbti_type, JSON.stringify(proportions || {}), JSON.stringify(content || {})]
    );
    res.json({ success: true });
  } catch (e) {
    console.error('保存报告失败:', e);
    res.status(500).json({ error: '保存报告失败' });
  }
});

// 获取支付订单
app.get('/api/payment-orders/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    const [rows] = await req.db.execute(
      'SELECT * FROM payment_orders WHERE id = ? OR order_id = ?',
      [orderId, orderId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: '支付订单不存在' });
    }

    res.json({
      success: true,
      data: rows[0]
    });

  } catch (error) {
    console.error('获取支付订单失败:', error);
    res.status(500).json({ error: '获取支付订单失败' });
  }
});

// 更新支付订单
app.put('/api/payment-orders/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const updates = req.body;

    // 定义允许更新的字段
    const allowedFields = [
      'payment_status', 'trade_no', 'prepay_id', 'payment_time',
      'payment_method', 'discount_amount', 'final_amount',
      'currency', 'remark', 'ip_address', 'user_agent'
    ];

    // 构建更新字段，过滤掉不允许的字段
    const updateFields = [];
    const updateValues = [];

    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined && allowedFields.includes(key)) {
        let value = updates[key];
        
        // 处理 payment_time 字段的格式转换
        if (key === 'payment_time' && value) {
          if (typeof value === 'string' && (value.includes('T') || value.includes('Z'))) {
            // 将 ISO 格式转换为 MySQL TIMESTAMP 格式
            const date = new Date(value);
            value = date.toISOString().slice(0, 19).replace('T', ' ');
          }
        }
        
        updateFields.push(`${key} = ?`);
        updateValues.push(value);
      } else if (!allowedFields.includes(key) && key !== '_mockFields') {
        console.warn(`忽略不允许更新的字段: ${key}`);
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({ error: '没有提供有效的更新字段' });
    }

    updateValues.push(orderId, orderId);

    await req.db.execute(
      `UPDATE payment_orders SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = ? OR order_id = ?`,
      updateValues
    );

    const [rows] = await req.db.execute(
      'SELECT * FROM payment_orders WHERE id = ? OR order_id = ?',
      [orderId, orderId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: '支付订单不存在' });
    }

    res.json({
      success: true,
      data: rows[0]
    });

  } catch (error) {
    console.error('更新支付订单失败:', error);
    res.status(500).json({ error: '更新支付订单失败' });
  }
});

// ==================== 用户行为日志接口 ====================

// 创建用户行为日志
app.post('/api/user-behavior-logs', async (req, res) => {
  try {
    const {
      user_id,
      session_id,
      event_type,
      event_category,
      event_action,
      event_label,
      page_url,
      page_title,
      referrer_url,
      element_id,
      element_class,
      element_text,
      custom_data,
      duration_ms,
      scroll_depth,
      viewport_width,
      viewport_height,
      device_type,
      browser_name,
      browser_version,
      os_name,
      os_version,
      ip_address,
      user_agent,
      // 向后兼容的简化字段
      action,
      page,
      details
    } = req.body;

    // 验证必需字段 - 支持新格式和旧格式
    if (!user_id || (!event_type && !action)) {
      return res.status(400).json({ error: '缺少必需字段: user_id 和 event_type (或 action)' });
    }

    const [result] = await req.db.execute(
      `INSERT INTO user_behavior_logs (
        user_id, session_id, event_type, event_category, event_action, event_label,
        page_url, page_title, referrer_url, element_id, element_class, element_text,
        custom_data, duration_ms, scroll_depth, viewport_width, viewport_height,
        device_type, browser_name, browser_version, os_name, os_version,
        ip_address, user_agent
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        session_id || null,
        event_type || action, // 使用新字段或回退到旧字段
        event_category || 'user_action', // 使用新字段或默认值
        event_action || action, // 使用新字段或回退到旧字段
        event_label || null,
        page_url || page || null, // 使用新字段或回退到旧字段
        page_title || page || null, // 使用新字段或回退到旧字段
        referrer_url || null,
        element_id || null,
        element_class || null,
        element_text || null,
        custom_data ? (typeof custom_data === 'string' ? custom_data : JSON.stringify(custom_data)) : 
                      (details ? JSON.stringify(details) : null), // 使用新字段或回退到旧字段
        duration_ms || null,
        scroll_depth || null,
        viewport_width || null,
        viewport_height || null,
        device_type || null,
        browser_name || null,
        browser_version || null,
        os_name || null,
        os_version || null,
        ip_address || null,
        user_agent || null
      ]
    );

    res.json({
      success: true,
      data: { id: result.insertId }
    });

  } catch (error) {
    console.error('创建用户行为日志失败:', error);
    res.status(500).json({ error: '创建用户行为日志失败' });
  }
});

// 获取用户行为日志
app.get('/api/user-behavior-logs/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const rawLimit = req.query.limit;
    let limitNum = 100;
    if (typeof rawLimit === 'string') {
      const parsed = parseInt(rawLimit, 10);
      if (!Number.isNaN(parsed)) limitNum = parsed;
    }
    // 安全夹取，避免过大或无效的 LIMIT 值
    if (limitNum < 1) limitNum = 1;
    if (limitNum > 1000) limitNum = 1000;

    const [rows] = await req.db.execute(
      `SELECT * FROM user_behavior_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT ${limitNum}`,
      [userId]
    );

    res.json({
      success: true,
      data: rows
    });

  } catch (error) {
    console.error('获取用户行为日志失败:', error);
    res.status(500).json({ error: '获取用户行为日志失败' });
  }
});

// ==================== 错误处理 ====================

// 全局错误处理中间件
app.use((error, req, res, next) => {
  console.error('服务器错误:', error);
  
  // 数据库错误
  if (error.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      error: 'Duplicate entry',
      message: '数据已存在'
    });
  }
  
  // JWT错误
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid token',
      message: '无效的访问令牌'
    });
  }
  
  // 默认错误
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : '服务器内部错误'
  });
});

// ==================== 系统设置接口 ====================

// 获取系统设置
app.get('/api/admin/settings', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // 这里可以从数据库或配置文件读取设置
    // 暂时返回默认设置
    const settings = {
      basic: {
        systemName: 'MBTI性格测试系统',
        systemDescription: '专业的MBTI性格类型测试平台',
        contactEmail: 'contact@example.com',
        supportPhone: '400-123-4567',
        websiteUrl: 'https://example.com',
        icpNumber: ''
      },
      test: {
        questionCount: 60,
        timeLimit: 30,
        allowRetake: true,
        showProgress: true,
        autoSaveInterval: 30,
        resultDetail: 'standard'
      },
      payment: {
        enabled: false,
        testPrice: 1000,
        freeTestCount: 1,
        alipayMerchantId: '',
        wechatMerchantId: '',
        timeoutMinutes: 15
      },
      email: {
        enabled: false,
        smtpHost: '',
        smtpPort: 587,
        fromEmail: '',
        fromName: '',
        username: '',
        password: '',
        useSSL: true
      },
      security: {
        enableRateLimit: true,
        maxRequestsPerMinute: 100,
        jwtExpirationHours: 24,
        minPasswordLength: 8,
        enableLoginLock: true,
        maxLoginAttempts: 5,
        lockDurationMinutes: 30,
        enableAuditLog: true
      }
    };
    
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('获取系统设置失败:', error);
    res.status(500).json({ error: '获取系统设置失败' });
  }
});

// 更新系统设置
app.put('/api/admin/settings', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const settings = req.body;
    
    // 这里应该将设置保存到数据库或配置文件
    // 暂时只返回成功响应
    console.log('更新系统设置:', settings);
    
    res.json({ 
      success: true,
      message: '设置保存成功' 
    });
  } catch (error) {
    console.error('保存系统设置失败:', error);
    res.status(500).json({ error: '保存系统设置失败' });
  }
});

// 测试邮件连接
app.post('/api/admin/test-email', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const emailConfig = req.body;
    
    // 这里应该实际测试邮件连接
    // 暂时返回成功响应
    console.log('测试邮件配置:', emailConfig);
    
    res.json({ 
      success: true,
      message: '邮件连接测试成功' 
    });
  } catch (error) {
    console.error('测试邮件连接失败:', error);
    res.status(500).json({ error: '邮件连接测试失败' });
  }
});

// 修改管理员密码
app.post('/api/admin/change-password', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const username = req.user.username;
    
    // 验证当前密码（这里使用硬编码的管理员账户）
    const adminUsers = {
      'admin': '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
      'manager': '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' // password
    };
    
    const hashedPassword = adminUsers[username];
    if (!hashedPassword) {
      return res.status(404).json({ error: '管理员不存在' });
    }
    
    const isValidPassword = await bcrypt.compare(currentPassword, hashedPassword);
    if (!isValidPassword) {
      return res.status(400).json({ error: '当前密码错误' });
    }
    
    // 这里应该更新密码到数据库
    // 暂时只返回成功响应
    console.log(`管理员 ${username} 修改密码`);
    
    res.json({ 
      success: true,
      message: '密码修改成功' 
    });
  } catch (error) {
    console.error('修改密码失败:', error);
    res.status(500).json({ error: '修改密码失败' });
  }
});

// 创建新管理员
app.post('/api/admin/create-admin', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { username, password, role = 'admin' } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码不能为空' });
    }
    
    // 这里应该检查用户名是否已存在并创建新管理员
    // 暂时只返回成功响应
    console.log(`创建新管理员: ${username}`);
    
    res.json({ 
      success: true,
      message: '管理员创建成功' 
    });
  } catch (error) {
    console.error('创建管理员失败:', error);
    res.status(500).json({ error: '创建管理员失败' });
  }
});

// 获取管理员列表
app.get('/api/admin/admins', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // 这里应该从数据库获取管理员列表
    // 暂时返回硬编码数据
    const admins = [
      {
        id: 1,
        username: 'admin',
        role: 'admin',
        status: 'active',
        lastLogin: new Date().toISOString(),
        createdAt: '2024-01-01T00:00:00.000Z'
      },
      {
        id: 2,
        username: 'manager',
        role: 'admin',
        status: 'active',
        lastLogin: new Date().toISOString(),
        createdAt: '2024-01-01T00:00:00.000Z'
      }
    ];
    
    res.json({
      success: true,
      data: admins
    });
  } catch (error) {
    console.error('获取管理员列表失败:', error);
    res.status(500).json({ error: '获取管理员列表失败' });
  }
});

// ==================== 数据导出接口 ====================

// 导出用户数据
app.get('/api/admin/export/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [users] = await req.db.execute(`
      SELECT 
        user_id,
        nickname,
        email,
        phone,
        gender,
        city,
        province,
        registration_source,
        status,
        created_at,
        updated_at
      FROM users
      ORDER BY created_at DESC
    `);
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=users.json');
    res.json({
      success: true,
      data: users,
      exportTime: new Date().toISOString()
    });
  } catch (error) {
    console.error('导出用户数据失败:', error);
    res.status(500).json({ error: '导出用户数据失败' });
  }
});

// 导出测试数据
app.get('/api/admin/export/tests', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [tests] = await req.db.execute(`
      SELECT 
        ts.session_id,
        ts.user_id,
        u.nickname,
        ts.test_type,
        ts.status,
        ts.mbti_type,
        ts.start_time,
        ts.complete_time,
        ts.time_spent_seconds,
        ts.answered_questions,
        ts.total_questions,
        ts.ei_score,
        ts.ns_score,
        ts.tf_score,
        ts.jp_score
      FROM test_sessions ts
      LEFT JOIN users u ON ts.user_id = u.user_id
      ORDER BY ts.start_time DESC
    `);
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=tests.json');
    res.json({
      success: true,
      data: tests,
      exportTime: new Date().toISOString()
    });
  } catch (error) {
    console.error('导出测试数据失败:', error);
    res.status(500).json({ error: '导出测试数据失败' });
  }
});

// 导出统计报告
app.get('/api/admin/export/report', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // 获取各种统计数据
    const [userStats] = await req.db.execute(
      `SELECT 
         COUNT(*) as total_users,
         COUNT(CASE WHEN DATE(created_at) = CURDATE() THEN 1 END) as today_users,
         COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as week_users,
         COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as month_users
       FROM users`
    );
    
    const [testStats] = await req.db.execute(
      `SELECT 
         COUNT(*) as total_tests,
         COUNT(CASE WHEN status = 1 THEN 1 END) as completed_tests,
         AVG(time_spent_seconds) as avg_test_time
       FROM test_sessions`
    );
    
    const [mbtiDistribution] = await req.db.execute(
      `SELECT mbti_type, COUNT(*) as count 
       FROM test_sessions 
       WHERE status = 1 AND mbti_type IS NOT NULL 
       GROUP BY mbti_type 
       ORDER BY count DESC`
    );
    
    const report = {
      generatedAt: new Date().toISOString(),
      userStatistics: userStats[0],
      testStatistics: testStats[0],
      mbtiDistribution
    };
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=report.json');
    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('导出统计报告失败:', error);
    res.status(500).json({ error: '导出统计报告失败' });
  }
});

// ==================== 系统维护接口 ====================

// 清理过期数据
app.post('/api/admin/cleanup', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { days = 30 } = req.body;
    
    // 清理未完成的测试会话（超过指定天数）
    const [result] = await req.db.execute(
      `DELETE FROM test_sessions 
       WHERE status = 0 AND start_time < DATE_SUB(NOW(), INTERVAL ? DAY)`,
      [days]
    );
    
    res.json({
      success: true,
      message: `清理完成，删除了 ${result.affectedRows} 条过期记录`
    });
  } catch (error) {
    console.error('清理过期数据失败:', error);
    res.status(500).json({ error: '清理过期数据失败' });
  }
});

// 数据库备份
app.post('/api/admin/backup', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // 这里应该实现数据库备份逻辑
    // 暂时返回成功响应
    const backupId = `backup_${Date.now()}`;
    
    res.json({
      success: true,
      message: '数据库备份已启动',
      backupId
    });
  } catch (error) {
    console.error('数据库备份失败:', error);
    res.status(500).json({ error: '数据库备份失败' });
  }
});

// 404 处理
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: '接口不存在'
  });
});

// ==================== 服务器启动 ====================

// 数据库初始化
async function initializeDatabase() {
  try {
    const connection = await dbPool.getConnection();
    console.log('✅ 数据库连接成功');
    
    // 检查必要的表是否存在
    const [tables] = await connection.execute(
      "SHOW TABLES LIKE 'users'"
    );
    
    if (tables.length === 0) {
      console.log('⚠️  数据库表不存在，请先执行 database-schema.sql 创建表结构');
    } else {
      console.log('✅ 数据库表结构正常');
    }
    
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    return false;
  }
}

// 启动服务器
async function startServer() {
  const dbConnected = await initializeDatabase();
  
  if (!dbConnected) {
    console.log('⚠️  数据库连接失败，服务器将在无数据库模式下启动');
  }
  
  app.listen(PORT, () => {
    console.log('\n🚀 MBTI测试系统后端服务启动成功!');
    console.log(`📍 服务地址: http://localhost:${PORT}`);
    console.log(`🏥 健康检查: http://localhost:${PORT}/health`);
    console.log(`👨‍💼 管理后台API: http://localhost:${PORT}/api/admin`);
    console.log(`📊 前端API: http://localhost:${PORT}/api`);
    console.log('\n📋 默认管理员账号:');
    console.log(`   用户名: ${config.admin.defaultUsername}`);
    console.log(`   密码: ${config.admin.defaultPassword}`);
    console.log('\n⏰ 启动时间:', new Date().toLocaleString());
  });
}

// 优雅关闭
process.on('SIGTERM', async () => {
  console.log('\n📴 收到 SIGTERM 信号，正在关闭服务器...');
  await dbPool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\n📴 收到 SIGINT 信号，正在关闭服务器...');
  await dbPool.end();
  process.exit(0);
});

// 启动应用
startServer();

export default app;