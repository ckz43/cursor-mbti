// 数据库服务层 - 负责与后端API的交互
// 注意：前端不直接连接数据库，而是通过API接口

// 数据类型定义
export interface User {
  id?: number;
  user_id: string;
  openid?: string;
  unionid?: string;
  nickname?: string;
  avatar_url?: string;
  gender?: number;
  city?: string;
  province?: string;
  country?: string;
  phone?: string;
  email?: string;
  birth_year?: number;
  education_level?: number;
  occupation?: string;
  registration_source?: string;
  referrer_user_id?: string;
  device_info?: any;
  ip_address?: string;
  user_agent?: string;
  status?: number;
  created_at?: Date;
  updated_at?: Date;
  last_login_at?: Date;
}

export interface TestSession {
  id?: number;
  session_id: string;
  user_id: string;
  test_type?: string;
  test_version?: string;
  status?: number;
  start_time?: Date;
  complete_time?: Date;
  abandon_time?: Date;
  total_questions?: number;
  answered_questions?: number;
  current_question_index?: number;
  time_spent_seconds?: number;
  avg_time_per_question?: number;
  device_type?: string;
  browser_info?: string;
  ip_address?: string;
  source_page?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  mbti_type?: string;
  ei_score?: number;
  ns_score?: number;
  tf_score?: number;
  jp_score?: number;
  ei_percentage?: number;
  ns_percentage?: number;
  tf_percentage?: number;
  jp_percentage?: number;
  confidence_score?: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface AnswerRecord {
  id?: number;
  session_id: string;
  user_id: string;
  question_index: number;
  question_text?: string;
  dimension: string;
  direction: number;
  answer_index: number;
  answer_text?: string;
  answer_score?: number;
  time_spent_seconds?: number;
  is_changed?: boolean;
  change_count?: number;
  previous_answer_index?: number;
  answer_time?: Date;
}

export interface PaymentOrder {
  id?: number;
  order_id: string;
  user_id: string;
  session_id?: string;
  product_type: string;
  product_name: string;
  original_amount: number;
  discount_amount?: number;
  final_amount: number;
  currency?: string;
  payment_method?: string;
  payment_status?: number;
  trade_no?: string;
  prepay_id?: string;
  payment_time?: Date;
  refund_time?: Date;
  refund_reason?: string;
  coupon_code?: string;
  promotion_id?: string;
  ip_address?: string;
  user_agent?: string;
  remark?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface UserBehaviorLog {
  id?: number;
  user_id: string;
  session_id?: string;
  event_type: string;
  event_category?: string;
  event_action?: string;
  event_label?: string;
  page_url?: string;
  page_title?: string;
  referrer_url?: string;
  element_id?: string;
  element_class?: string;
  element_text?: string;
  custom_data?: any;
  duration_ms?: number;
  scroll_depth?: number;
  viewport_width?: number;
  viewport_height?: number;
  device_type?: string;
  browser_name?: string;
  browser_version?: string;
  os_name?: string;
  os_version?: string;
  ip_address?: string;
  user_agent?: string;
  created_at?: Date;
}

export interface ShareRecord {
  id?: number;
  share_id: string;
  user_id: string;
  session_id?: string;
  share_type: string;
  share_platform?: string;
  share_content?: any;
  share_url?: string;
  view_count?: number;
  click_count?: number;
  conversion_count?: number;
  last_viewed_at?: Date;
  created_at?: Date;
  updated_at?: Date;
}

// API 基础配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// HTTP 客户端类
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', { url, error });
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// 数据服务类
class DataService {
  private api: ApiClient;

  constructor(apiClient: ApiClient) {
    this.api = apiClient;
  }

  // 用户相关操作
  async createUser(user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    return this.api.post<User>('/users', user);
  }

  async getUserById(userId: string): Promise<User | null> {
    try {
      return await this.api.get<User>(`/users/${userId}`);
    } catch (error) {
      return null;
    }
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    return this.api.put<User>(`/users/${userId}`, updates);
  }

  // 测试会话相关操作
  async createTestSession(session: Omit<TestSession, 'id' | 'created_at' | 'updated_at'>): Promise<TestSession> {
    return this.api.post<TestSession>('/test-sessions', session);
  }

  async getTestSession(sessionId: string): Promise<TestSession | null> {
    try {
      return await this.api.get<TestSession>(`/test-sessions/${sessionId}`);
    } catch (error) {
      return null;
    }
  }

  async updateTestSession(sessionId: string, updates: Partial<TestSession>): Promise<TestSession> {
    return this.api.put<TestSession>(`/test-sessions/${sessionId}`, updates);
  }

  async getUserTestSessions(userId: string): Promise<TestSession[]> {
    return this.api.get<TestSession[]>(`/users/${userId}/test-sessions`);
  }

  // 答题记录相关操作
  async saveAnswer(answer: Omit<AnswerRecord, 'id' | 'answer_time'>): Promise<AnswerRecord> {
    return this.api.post<AnswerRecord>('/answers', answer);
  }

  async getSessionAnswers(sessionId: string): Promise<AnswerRecord[]> {
    return this.api.get<AnswerRecord[]>(`/test-sessions/${sessionId}/answers`);
  }

  async updateAnswer(answerId: number, updates: Partial<AnswerRecord>): Promise<AnswerRecord> {
    return this.api.put<AnswerRecord>(`/answers/${answerId}`, updates);
  }

  // 支付订单相关操作
  async createPaymentOrder(order: Omit<PaymentOrder, 'id' | 'created_at' | 'updated_at'>): Promise<PaymentOrder> {
    return this.api.post<PaymentOrder>('/payment-orders', order);
  }

  async getPaymentOrder(orderId: string): Promise<PaymentOrder | null> {
    try {
      return await this.api.get<PaymentOrder>(`/payment-orders/${orderId}`);
    } catch (error) {
      return null;
    }
  }

  async updatePaymentOrder(orderId: string, updates: Partial<PaymentOrder>): Promise<PaymentOrder> {
    return this.api.put<PaymentOrder>(`/payment-orders/${orderId}`, updates);
  }

  // 用户行为日志
  async logUserBehavior(log: Omit<UserBehaviorLog, 'id' | 'created_at'>): Promise<void> {
    await this.api.post<void>('/user-behavior-logs', log);
  }

  async getUserBehaviorLogs(userId: string, limit = 100): Promise<UserBehaviorLog[]> {
    return this.api.get<UserBehaviorLog[]>(`/users/${userId}/behavior-logs?limit=${limit}`);
  }

  // 分享记录
  async createShareRecord(share: Omit<ShareRecord, 'id' | 'created_at' | 'updated_at'>): Promise<ShareRecord> {
    return this.api.post<ShareRecord>('/share-records', share);
  }

  async updateShareRecord(shareId: string, updates: Partial<ShareRecord>): Promise<ShareRecord> {
    return this.api.put<ShareRecord>(`/share-records/${shareId}`, updates);
  }

  async getShareRecord(shareId: string): Promise<ShareRecord | null> {
    try {
      return await this.api.get<ShareRecord>(`/share-records/${shareId}`);
    } catch (error) {
      return null;
    }
  }
}

// 创建API客户端和数据服务实例
const apiClient = new ApiClient(API_BASE_URL);
export const dataService = new DataService(apiClient);

// 工具函数
export const generateUserId = (): string => {
  return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

export const generateSessionId = (): string => {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

export const generateOrderId = (): string => {
  return 'order_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

export const generateShareId = (): string => {
  return 'share_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

// 设备信息获取
export const getDeviceInfo = () => {
  const userAgent = navigator.userAgent;
  const platform = navigator.platform;
  const language = navigator.language;
  const cookieEnabled = navigator.cookieEnabled;
  const onLine = navigator.onLine;
  
  return {
    userAgent,
    platform,
    language,
    cookieEnabled,
    onLine,
    screenWidth: screen.width,
    screenHeight: screen.height,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timestamp: new Date().toISOString()
  };
};

// 浏览器信息获取
export const getBrowserInfo = () => {
  const userAgent = navigator.userAgent;
  let browserName = 'Unknown';
  let browserVersion = 'Unknown';
  
  if (userAgent.indexOf('Chrome') > -1) {
    browserName = 'Chrome';
    browserVersion = userAgent.match(/Chrome\/(\d+\.\d+)/)?.[1] || 'Unknown';
  } else if (userAgent.indexOf('Firefox') > -1) {
    browserName = 'Firefox';
    browserVersion = userAgent.match(/Firefox\/(\d+\.\d+)/)?.[1] || 'Unknown';
  } else if (userAgent.indexOf('Safari') > -1) {
    browserName = 'Safari';
    browserVersion = userAgent.match(/Version\/(\d+\.\d+)/)?.[1] || 'Unknown';
  } else if (userAgent.indexOf('Edge') > -1) {
    browserName = 'Edge';
    browserVersion = userAgent.match(/Edge\/(\d+\.\d+)/)?.[1] || 'Unknown';
  }
  
  return {
    name: browserName,
    version: browserVersion,
    userAgent
  };
};

// 导出默认服务
export default dataService;