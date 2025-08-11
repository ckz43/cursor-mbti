// 本地存储服务 - 用于临时数据持久化和离线支持
import type { 
  User, 
  TestSession, 
  AnswerRecord, 
  PaymentOrder, 
  UserBehaviorLog, 
  ShareRecord 
} from './database';

// 存储键名常量
const STORAGE_KEYS = {
  USERS: 'mbti_users',
  SESSIONS: 'mbti_sessions',
  ANSWERS: 'mbti_answers',
  PAYMENTS: 'mbti_payments',
  BEHAVIORS: 'mbti_behaviors',
  SHARES: 'mbti_shares',
  SYNC_QUEUE: 'mbti_sync_queue'
} as const;

// 同步队列项类型
interface SyncQueueItem {
  id: string;
  type: 'user' | 'session' | 'answer' | 'payment' | 'behavior' | 'share';
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
  retryCount: number;
}

export class LocalStorageService {
  private syncQueue: SyncQueueItem[] = [];
  private isOnline = navigator.onLine;
  private syncInProgress = false;

  constructor() {
    this.loadSyncQueue();
    this.setupOnlineListener();
    
    // 定期尝试同步
    setInterval(() => {
      if (this.isOnline && !this.syncInProgress) {
        this.processSyncQueue();
      }
    }, 30000); // 每30秒尝试同步一次
  }

  private setupOnlineListener() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('🌐 网络连接恢复，开始同步数据');
      this.processSyncQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('📴 网络连接断开，切换到离线模式');
    });
  }

  private getStorageData<T>(key: string): T[] {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`读取存储数据失败 (${key}):`, error);
      return [];
    }
  }

  private setStorageData<T>(key: string, data: T[]): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error: any) {
      console.error(`保存存储数据失败 (${key}):`, error);
      // 如果存储空间不足，清理旧数据
      if (error?.name === 'QuotaExceededError') {
        this.cleanupOldData();
        try {
          localStorage.setItem(key, JSON.stringify(data));
        } catch (retryError) {
          console.error('重试保存失败:', retryError);
        }
      }
    }
  }

  private cleanupOldData(): void {
    console.log('🧹 清理旧数据以释放存储空间');
    
    // 清理7天前的行为日志
    const behaviors = this.getStorageData<UserBehaviorLog>(STORAGE_KEYS.BEHAVIORS);
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const filteredBehaviors = behaviors.filter(b => 
      b.created_at && new Date(b.created_at).getTime() > sevenDaysAgo
    );
    this.setStorageData(STORAGE_KEYS.BEHAVIORS, filteredBehaviors);
    
    // 清理已完成的旧会话（保留最近10个）
    const sessions = this.getStorageData<TestSession>(STORAGE_KEYS.SESSIONS);
    const completedSessions = sessions
      .filter(s => s.status === 1)
      .sort((a, b) => {
        const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
        return bTime - aTime;
      })
      .slice(10);
    
    const activeSessions = sessions.filter(s => s.status !== 1);
    this.setStorageData(STORAGE_KEYS.SESSIONS, [...activeSessions, ...completedSessions]);
  }

  private addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retryCount'>): void {
    const syncItem: SyncQueueItem = {
      ...item,
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retryCount: 0
    };
    
    this.syncQueue.push(syncItem);
    this.saveSyncQueue();
    
    // 如果在线，立即尝试同步
    if (this.isOnline && !this.syncInProgress) {
      this.processSyncQueue();
    }
  }

  private loadSyncQueue(): void {
    this.syncQueue = this.getStorageData<SyncQueueItem>(STORAGE_KEYS.SYNC_QUEUE);
  }

  private saveSyncQueue(): void {
    this.setStorageData(STORAGE_KEYS.SYNC_QUEUE, this.syncQueue);
  }

  private async processSyncQueue(): Promise<void> {
    if (this.syncInProgress || this.syncQueue.length === 0) return;
    
    this.syncInProgress = true;
    console.log(`🔄 开始同步 ${this.syncQueue.length} 个待同步项`);
    
    const successfulSyncs: string[] = [];
    
    for (const item of this.syncQueue) {
      try {
        await this.syncItem(item);
        successfulSyncs.push(item.id);
        console.log(`✅ 同步成功: ${item.type} ${item.action}`);
      } catch (error) {
        console.error(`❌ 同步失败: ${item.type} ${item.action}`, error);
        item.retryCount++;
        
        // 超过最大重试次数则移除
        if (item.retryCount >= 5) {
          console.warn(`⚠️ 同步项超过最大重试次数，已移除: ${item.id}`);
          successfulSyncs.push(item.id);
        }
      }
    }
    
    // 移除已成功同步的项
    this.syncQueue = this.syncQueue.filter(item => !successfulSyncs.includes(item.id));
    this.saveSyncQueue();
    
    this.syncInProgress = false;
    console.log(`🔄 同步完成，剩余 ${this.syncQueue.length} 个待同步项`);
  }

  private async syncItem(item: SyncQueueItem): Promise<void> {
    // 这里应该调用实际的API接口
    // 目前模拟同步过程
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.1) { // 90% 成功率
          resolve();
        } else {
          reject(new Error('模拟网络错误'));
        }
      }, 100);
    });
  }

  // 用户相关操作
  async createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    const users = this.getStorageData<User>(STORAGE_KEYS.USERS);
    const now = new Date().toISOString();
    
    const newUser: User = {
      ...userData,
      id: users.length + 1,
      created_at: new Date(now),
      updated_at: new Date(now)
    };
    
    users.push(newUser);
    this.setStorageData(STORAGE_KEYS.USERS, users);
    
    // 添加到同步队列
    this.addToSyncQueue({
      type: 'user',
      action: 'create',
      data: newUser
    });
    
    return newUser;
  }

  async getUserById(userId: string): Promise<User | null> {
    const users = this.getStorageData<User>(STORAGE_KEYS.USERS);
    return users.find(u => u.user_id === userId) || null;
  }

  async updateUser(userId: string, updateData: Partial<User>): Promise<User | null> {
    const users = this.getStorageData<User>(STORAGE_KEYS.USERS);
    const userIndex = users.findIndex(u => u.user_id === userId);
    
    if (userIndex === -1) return null;
    
    users[userIndex] = {
      ...users[userIndex],
      ...updateData,
      updated_at: new Date()
    };
    
    this.setStorageData(STORAGE_KEYS.USERS, users);
    
    // 添加到同步队列
    this.addToSyncQueue({
      type: 'user',
      action: 'update',
      data: { userId, updateData }
    });
    
    return users[userIndex];
  }

  // 测试会话相关操作
  async createTestSession(sessionData: Omit<TestSession, 'id' | 'created_at' | 'updated_at'>): Promise<TestSession> {
    const sessions = this.getStorageData<TestSession>(STORAGE_KEYS.SESSIONS);
    const now = new Date().toISOString();
    
    const newSession: TestSession = {
      ...sessionData,
      id: sessions.length + 1,
      created_at: new Date(now),
      updated_at: new Date(now)
    };
    
    sessions.push(newSession);
    this.setStorageData(STORAGE_KEYS.SESSIONS, sessions);
    
    // 添加到同步队列
    this.addToSyncQueue({
      type: 'session',
      action: 'create',
      data: newSession
    });
    
    return newSession;
  }

  async getTestSession(sessionId: string): Promise<TestSession | null> {
    const sessions = this.getStorageData<TestSession>(STORAGE_KEYS.SESSIONS);
    return sessions.find(s => s.session_id === sessionId) || null;
  }

  async updateTestSession(sessionId: string, updateData: Partial<TestSession>): Promise<TestSession | null> {
    const sessions = this.getStorageData<TestSession>(STORAGE_KEYS.SESSIONS);
    const sessionIndex = sessions.findIndex(s => s.session_id === sessionId);
    
    if (sessionIndex === -1) return null;
    
    sessions[sessionIndex] = {
      ...sessions[sessionIndex],
      ...updateData,
      updated_at: new Date()
    };
    
    this.setStorageData(STORAGE_KEYS.SESSIONS, sessions);
    
    // 添加到同步队列
    this.addToSyncQueue({
      type: 'session',
      action: 'update',
      data: { sessionId, updateData }
    });
    
    return sessions[sessionIndex];
  }

  // 答题记录相关操作
  async saveAnswer(answerData: Omit<AnswerRecord, 'id' | 'answer_time'>): Promise<AnswerRecord> {
    const answers = this.getStorageData<AnswerRecord>(STORAGE_KEYS.ANSWERS);
    
    // 检查是否已存在相同会话和问题的答案
    const existingIndex = answers.findIndex(
      a => a.session_id === answerData.session_id && a.question_index === answerData.question_index
    );
    
    const now = new Date().toISOString();
    
    if (existingIndex !== -1) {
      // 更新现有答案
      answers[existingIndex] = {
        ...answers[existingIndex],
        ...answerData,
        is_changed: true,
        change_count: (answers[existingIndex].change_count || 0) + 1,
        previous_answer_index: answers[existingIndex].answer_index,
        answer_time: new Date(now)
      };
      
      this.setStorageData(STORAGE_KEYS.ANSWERS, answers);
      
      // 添加到同步队列
      this.addToSyncQueue({
        type: 'answer',
        action: 'update',
        data: answers[existingIndex]
      });
      
      return answers[existingIndex];
    } else {
      // 创建新答案
      const newAnswer: AnswerRecord = {
        ...answerData,
        id: answers.length + 1,
        answer_time: new Date(now)
      };
      
      answers.push(newAnswer);
      this.setStorageData(STORAGE_KEYS.ANSWERS, answers);
      
      // 添加到同步队列
      this.addToSyncQueue({
        type: 'answer',
        action: 'create',
        data: newAnswer
      });
      
      return newAnswer;
    }
  }

  async getAnswersBySession(sessionId: string): Promise<AnswerRecord[]> {
    const answers = this.getStorageData<AnswerRecord>(STORAGE_KEYS.ANSWERS);
    return answers
      .filter(a => a.session_id === sessionId)
      .sort((a, b) => a.question_index - b.question_index);
  }

  async updateAnswer(answerId: number, updateData: Partial<AnswerRecord>): Promise<AnswerRecord | null> {
    const answers = this.getStorageData<AnswerRecord>(STORAGE_KEYS.ANSWERS);
    const answerIndex = answers.findIndex(a => a.id === answerId);
    
    if (answerIndex === -1) return null;
    
    answers[answerIndex] = {
      ...answers[answerIndex],
      ...updateData,
      answer_time: new Date()
    };
    
    this.setStorageData(STORAGE_KEYS.ANSWERS, answers);
    
    // 添加到同步队列
    this.addToSyncQueue({
      type: 'answer',
      action: 'update',
      data: { answerId, updateData }
    });
    
    return answers[answerIndex];
  }

  async deleteAnswer(answerId: number): Promise<boolean> {
    const answers = this.getStorageData<AnswerRecord>(STORAGE_KEYS.ANSWERS);
    const answerIndex = answers.findIndex(a => a.id === answerId);
    
    if (answerIndex === -1) return false;
    
    const deletedAnswer = answers.splice(answerIndex, 1)[0];
    this.setStorageData(STORAGE_KEYS.ANSWERS, answers);
    
    // 添加到同步队列
    this.addToSyncQueue({
      type: 'answer',
      action: 'delete',
      data: { answerId }
    });
    
    return true;
  }

  async getAnswerStats(sessionId: string): Promise<any> {
    const answers = this.getStorageData<AnswerRecord>(STORAGE_KEYS.ANSWERS)
      .filter(a => a.session_id === sessionId);
    
    const stats = {
      total_answers: answers.length,
      avg_time_per_question: answers.reduce((sum, a) => sum + (a.time_spent_seconds || 0), 0) / answers.length,
      changed_answers: answers.filter(a => a.is_changed).length,
      dimensions: {} as Record<string, { count: number; avg_score: number }>
    };
    
    // 按维度统计
    answers.forEach(answer => {
      if (!stats.dimensions[answer.dimension]) {
        stats.dimensions[answer.dimension] = { count: 0, avg_score: 0 };
      }
      stats.dimensions[answer.dimension].count++;
      stats.dimensions[answer.dimension].avg_score += (answer.answer_score || 0);
    });
    
    // 计算平均分
    Object.keys(stats.dimensions).forEach(dim => {
      stats.dimensions[dim].avg_score /= stats.dimensions[dim].count;
    });
    
    return stats;
  }

  // 用户行为日志
  async logUserBehavior(logData: Omit<UserBehaviorLog, 'id' | 'created_at'>): Promise<UserBehaviorLog> {
    const behaviors = this.getStorageData<UserBehaviorLog>(STORAGE_KEYS.BEHAVIORS);
    const now = new Date().toISOString();
    
    const newLog: UserBehaviorLog = {
      ...logData,
      id: behaviors.length + 1,
      created_at: new Date(now)
    };
    
    behaviors.push(newLog);
    this.setStorageData(STORAGE_KEYS.BEHAVIORS, behaviors);
    
    // 添加到同步队列（低优先级）
    this.addToSyncQueue({
      type: 'behavior',
      action: 'create',
      data: newLog
    });
    
    return newLog;
  }

  // 支付订单相关操作
  async createPaymentOrder(orderData: Omit<PaymentOrder, 'id' | 'created_at' | 'updated_at'>): Promise<PaymentOrder> {
    const orders = this.getStorageData<PaymentOrder>(STORAGE_KEYS.PAYMENTS);
    const now = new Date().toISOString();
    
    const newOrder: PaymentOrder = {
      ...orderData,
      id: orders.length + 1,
      created_at: new Date(now),
      updated_at: new Date(now)
    };
    
    orders.push(newOrder);
    this.setStorageData(STORAGE_KEYS.PAYMENTS, orders);
    
    // 添加到同步队列（高优先级）
    this.addToSyncQueue({
      type: 'payment',
      action: 'create',
      data: newOrder
    });
    
    return newOrder;
  }

  async updatePaymentOrder(id: number, updateData: Partial<PaymentOrder>): Promise<PaymentOrder | null> {
    const orders = this.getStorageData<PaymentOrder>(STORAGE_KEYS.PAYMENTS);
    const orderIndex = orders.findIndex(order => order.id === id);
    
    if (orderIndex === -1) {
      return null;
    }
    
    const updatedOrder = {
      ...orders[orderIndex],
      ...updateData,
      updated_at: new Date()
    };
    
    orders[orderIndex] = updatedOrder;
    this.setStorageData(STORAGE_KEYS.PAYMENTS, orders);
    
    // 添加到同步队列
    this.addToSyncQueue({
      type: 'payment',
      action: 'update',
      data: { id, ...updateData }
    });
    
    return updatedOrder;
  }

  // 分享记录相关操作
  async createShareRecord(shareData: Omit<ShareRecord, 'id' | 'created_at'>): Promise<ShareRecord> {
    const shares = this.getStorageData<ShareRecord>(STORAGE_KEYS.SHARES);
    const now = new Date().toISOString();
    
    const newShare: ShareRecord = {
      ...shareData,
      id: shares.length + 1,
      created_at: new Date(now)
    };
    
    shares.push(newShare);
    this.setStorageData(STORAGE_KEYS.SHARES, shares);
    
    // 添加到同步队列
    this.addToSyncQueue({
      type: 'share',
      action: 'create',
      data: newShare
    });
    
    return newShare;
  }

  // 获取存储统计信息
  // 获取所有用户
  async getAllUsers(): Promise<User[]> {
    return this.getStorageData<User>(STORAGE_KEYS.USERS);
  }

  // 获取所有测试会话
  async getAllTestSessions(): Promise<TestSession[]> {
    return this.getStorageData<TestSession>(STORAGE_KEYS.SESSIONS);
  }

  // 获取所有答案记录
  async getAllAnswers(): Promise<AnswerRecord[]> {
    return this.getStorageData<AnswerRecord>(STORAGE_KEYS.ANSWERS);
  }

  // 获取所有行为日志
  async getAllBehaviorLogs(): Promise<UserBehaviorLog[]> {
    return this.getStorageData<UserBehaviorLog>(STORAGE_KEYS.BEHAVIORS);
  }

  // 获取所有支付订单
  async getAllPaymentOrders(): Promise<PaymentOrder[]> {
    return this.getStorageData<PaymentOrder>(STORAGE_KEYS.PAYMENTS);
  }

  // 获取所有分享记录
  async getAllShareRecords(): Promise<ShareRecord[]> {
    return this.getStorageData<ShareRecord>(STORAGE_KEYS.SHARES);
  }

  getStorageStats(): {
    users: number;
    sessions: number;
    answers: number;
    behaviors: number;
    payments: number;
    shares: number;
    syncQueue: number;
    storageUsed: string;
  } {
    const stats = {
      users: this.getStorageData<User>(STORAGE_KEYS.USERS).length,
      sessions: this.getStorageData<TestSession>(STORAGE_KEYS.SESSIONS).length,
      answers: this.getStorageData<AnswerRecord>(STORAGE_KEYS.ANSWERS).length,
      behaviors: this.getStorageData<UserBehaviorLog>(STORAGE_KEYS.BEHAVIORS).length,
      payments: this.getStorageData<PaymentOrder>(STORAGE_KEYS.PAYMENTS).length,
      shares: this.getStorageData<ShareRecord>(STORAGE_KEYS.SHARES).length,
      syncQueue: this.syncQueue.length,
      storageUsed: '0 KB'
    };
    
    // 计算存储使用量
    let totalSize = 0;
    Object.values(STORAGE_KEYS).forEach(key => {
      const data = localStorage.getItem(key);
      if (data) {
        totalSize += new Blob([data]).size;
      }
    });
    
    stats.storageUsed = totalSize > 1024 * 1024 
      ? `${(totalSize / (1024 * 1024)).toFixed(2)} MB`
      : `${(totalSize / 1024).toFixed(2)} KB`;
    
    return stats;
  }

  // 清空所有数据
  clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    this.syncQueue = [];
    console.log('🗑️ 所有本地数据已清空');
  }

  // 导出数据（用于备份）
  exportData(): string {
    const data: Record<string, any> = {};
    Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
      data[name] = this.getStorageData(key);
    });
    data.SYNC_QUEUE = this.syncQueue;
    return JSON.stringify(data, null, 2);
  }

  // 导入数据（用于恢复）
  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
        if (data[name]) {
          this.setStorageData(key, data[name]);
        }
      });
      if (data.SYNC_QUEUE) {
        this.syncQueue = data.SYNC_QUEUE;
        this.saveSyncQueue();
      }
      console.log('📥 数据导入成功');
      return true;
    } catch (error) {
      console.error('❌ 数据导入失败:', error);
      return false;
    }
  }
}

// 创建单例实例
export const localStorageService = new LocalStorageService();
export default localStorageService;