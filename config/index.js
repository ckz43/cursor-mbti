// 后端配置文件
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// 加载环境变量
dotenv.config()

// ES模块中获取__dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 服务器配置
export const serverConfig = {
  port: parseInt(process.env.SERVER_PORT) || 3002,  // 使用 SERVER_PORT，避免外部 PORT 干扰
  host: process.env.HOST || 'localhost',
  env: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5175',  // 也更新前端URL
  
  // 安全配置
  security: {
    jwtSecret: process.env.JWT_SECRET || 'mbti-secret-key',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 10,
    corsOrigin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
  },
  
  // 限流配置
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15分钟
    max: parseInt(process.env.RATE_LIMIT_MAX) || 1000, // 最大请求数
    adminMax: parseInt(process.env.ADMIN_RATE_LIMIT_MAX) || 100, // 管理接口最大请求数
  },
  
  // 请求体配置
  bodyParser: {
    jsonLimit: process.env.JSON_LIMIT || '10mb',
    urlencodedLimit: process.env.URLENCODED_LIMIT || '10mb',
  }
}

// 数据库配置
export const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'mbti_test',
  
  // 连接池配置
  pool: {
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
    queueLimit: parseInt(process.env.DB_QUEUE_LIMIT) || 0,
    acquireTimeout: parseInt(process.env.DB_ACQUIRE_TIMEOUT) || 60000,
    timeout: parseInt(process.env.DB_TIMEOUT) || 60000,
    reconnect: process.env.DB_RECONNECT !== 'false',
    charset: process.env.DB_CHARSET || 'utf8mb4'
  }
}

// 管理员配置
export const adminConfig = {
  defaultUsername: process.env.ADMIN_USERNAME || 'admin',
  defaultPassword: process.env.ADMIN_PASSWORD || '123456',
  sessionTimeout: parseInt(process.env.ADMIN_SESSION_TIMEOUT) || 24 * 60 * 60 * 1000, // 24小时
}

// 邮件配置
export const emailConfig = {
  enabled: process.env.EMAIL_ENABLED === 'true',
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || ''
    }
  },
  from: {
    name: process.env.EMAIL_FROM_NAME || 'MBTI测试系统',
    address: process.env.EMAIL_FROM_ADDRESS || 'noreply@example.com'
  }
}

// 支付配置
export const paymentConfig = {
  enabled: process.env.PAYMENT_ENABLED === 'true',
  wechat: {
    appId: process.env.WECHAT_APP_ID || '',
    mchId: process.env.WECHAT_MCH_ID || '',
    // v2 key（若仍需兼容老逻辑，可保留）。v3请使用 apiV3Key
    key: process.env.WECHAT_KEY || '',
    notifyUrl: process.env.WECHAT_NOTIFY_URL || '',
    // v3 所需配置
    apiV3Key: process.env.WECHAT_API_V3_KEY || '',
    merchantPrivateKeyPath: process.env.WECHAT_MCH_PRIVATE_KEY_PATH || '', // 商户私钥（PEM）文件路径
    merchantCertificateSerial: process.env.WECHAT_MCH_CERT_SERIAL || '',   // 商户证书序列号
    platformCertificatePath: process.env.WECHAT_PLATFORM_CERT_PATH || '',  // 微信平台证书（PEM）文件路径（用于回调验签）
    apiBase: process.env.WECHAT_API_BASE || 'https://api.mch.weixin.qq.com'
  },
  alipay: {
    appId: process.env.ALIPAY_APP_ID || '',
    privateKey: process.env.ALIPAY_PRIVATE_KEY || '',
    publicKey: process.env.ALIPAY_PUBLIC_KEY || '',
    notifyUrl: process.env.ALIPAY_NOTIFY_URL || ''
  }
}

// 文件上传配置
export const uploadConfig = {
  maxFileSize: parseInt(process.env.UPLOAD_MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
  allowedTypes: (process.env.UPLOAD_ALLOWED_TYPES || 'image/jpeg,image/png,image/gif').split(','),
  uploadDir: process.env.UPLOAD_DIR || path.join(__dirname, '../uploads'),
  publicPath: process.env.UPLOAD_PUBLIC_PATH || '/uploads'
}

// 日志配置
export const logConfig = {
  level: process.env.LOG_LEVEL || 'info',
  file: process.env.LOG_FILE || path.join(__dirname, '../logs/app.log'),
  maxSize: process.env.LOG_MAX_SIZE || '10m',
  maxFiles: parseInt(process.env.LOG_MAX_FILES) || 5,
  datePattern: process.env.LOG_DATE_PATTERN || 'YYYY-MM-DD'
}

// Redis配置（如果使用）
export const redisConfig = {
  enabled: process.env.REDIS_ENABLED === 'true',
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || '',
  db: parseInt(process.env.REDIS_DB) || 0,
  keyPrefix: process.env.REDIS_KEY_PREFIX || 'mbti:'
}

// 系统配置
export const systemConfig = {
  // 数据清理配置
  cleanup: {
    enabled: process.env.CLEANUP_ENABLED === 'true',
    interval: parseInt(process.env.CLEANUP_INTERVAL) || 24 * 60 * 60 * 1000, // 24小时
    retentionDays: parseInt(process.env.CLEANUP_RETENTION_DAYS) || 30
  },
  
  // 备份配置
  backup: {
    enabled: process.env.BACKUP_ENABLED === 'true',
    interval: parseInt(process.env.BACKUP_INTERVAL) || 24 * 60 * 60 * 1000, // 24小时
    retentionCount: parseInt(process.env.BACKUP_RETENTION_COUNT) || 7,
    path: process.env.BACKUP_PATH || path.join(__dirname, '../backups')
  },
  
  // 监控配置
  monitoring: {
    enabled: process.env.MONITORING_ENABLED === 'true',
    healthCheckInterval: parseInt(process.env.HEALTH_CHECK_INTERVAL) || 30000, // 30秒
    alertThreshold: {
      cpu: parseInt(process.env.ALERT_CPU_THRESHOLD) || 80,
      memory: parseInt(process.env.ALERT_MEMORY_THRESHOLD) || 80,
      disk: parseInt(process.env.ALERT_DISK_THRESHOLD) || 90
    }
  }
}

// 工具函数
export const isDevelopment = () => serverConfig.env === 'development'
export const isProduction = () => serverConfig.env === 'production'
export const isTest = () => serverConfig.env === 'test'

// 验证配置
export const validateConfig = () => {
  const errors = []
  
  // 验证必需的环境变量
  if (!dbConfig.password && isProduction()) {
    errors.push('生产环境必须设置数据库密码')
  }
  
  if (!serverConfig.security.jwtSecret || serverConfig.security.jwtSecret === 'mbti-secret-key') {
    if (isProduction()) {
      errors.push('生产环境必须设置自定义JWT密钥')
    }
  }
  
  if (paymentConfig.enabled) {
    if (!paymentConfig.wechat.appId && !paymentConfig.alipay.appId) {
      errors.push('启用支付功能时必须配置微信或支付宝参数')
    }
  }
  
  return errors
}

// 导出默认配置
export default {
  server: serverConfig,
  db: dbConfig,
  admin: adminConfig,
  email: emailConfig,
  payment: paymentConfig,
  upload: uploadConfig,
  log: logConfig,
  redis: redisConfig,
  system: systemConfig,
  isDevelopment,
  isProduction,
  isTest,
  validateConfig
}