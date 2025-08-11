// 应用配置文件

// 环境变量配置
const config = {
  // API配置
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000'),
  },
  
  // 应用配置
  app: {
    name: import.meta.env.VITE_APP_NAME || 'MBTI专业性格测试',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    description: import.meta.env.VITE_APP_DESCRIPTION || '基于荣格心理学理论的专业MBTI性格测试',
  },
  
  // 开发配置
  dev: {
    enableDebug: import.meta.env.VITE_ENABLE_DEBUG === 'true',
    mockApi: import.meta.env.VITE_MOCK_API === 'true',
  },
  
  // 支付配置
  payment: {
    enabled: import.meta.env.VITE_PAYMENT_ENABLED === 'true',
    wechatAppId: import.meta.env.VITE_WECHAT_APP_ID || '',
    alipayAppId: import.meta.env.VITE_ALIPAY_APP_ID || '',
  },
  
  // 分析配置
  analytics: {
    enabled: import.meta.env.VITE_ANALYTICS_ENABLED === 'true',
    trackingId: import.meta.env.VITE_ANALYTICS_TRACKING_ID || '',
  },
  
  // 存储配置
  storage: {
    prefix: import.meta.env.VITE_STORAGE_PREFIX || 'mbti_',
    enableEncryption: import.meta.env.VITE_STORAGE_ENCRYPTION === 'true',
  },
  
  // 测试配置
  test: {
    autoSaveInterval: parseInt(import.meta.env.VITE_TEST_AUTO_SAVE_INTERVAL || '30000'),
    maxRetries: parseInt(import.meta.env.VITE_TEST_MAX_RETRIES || '3'),
  }
}

// 导出配置
export { config }
export default config

// 导出具体配置项
export const { api, app, dev, payment, analytics, storage, test } = config

// 工具函数
export const isDevelopment = import.meta.env.DEV
export const isProduction = import.meta.env.PROD
export const getApiUrl = (path: string) => `${api.baseUrl}${path.startsWith('/') ? path : `/${path}`}`

// 管理后台配置
export const adminConfig = {
  tokenKey: 'admin_token',
  userKey: 'admin_user',
  defaultRoute: '/admin/dashboard'
}

// 类型定义
export interface Config {
  api: {
    baseUrl: string
    timeout: number
  }
  app: {
    name: string
    version: string
    description: string
  }
  dev: {
    enableDebug: boolean
    mockApi: boolean
  }
  payment: {
    enabled: boolean
    wechatAppId: string
    alipayAppId: string
  }
  analytics: {
    enabled: boolean
    trackingId: string
  }
  storage: {
    prefix: string
    enableEncryption: boolean
  }
  test: {
    autoSaveInterval: number
    maxRetries: number
  }
}