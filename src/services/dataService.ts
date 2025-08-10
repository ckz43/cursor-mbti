import { dataService as databaseService } from './database';
import { LocalStorageService } from './localStorageService';
import type { User, TestSession, AnswerRecord, PaymentOrder, UserBehaviorLog, ShareRecord } from './database';

/**
 * 数据服务 - 统一的数据访问层
 * 在线时使用数据库，离线时使用本地存储
 * 支持数据同步和缓存策略
 */
export class DataService {
  private databaseService: typeof databaseService;
  private localStorageService: LocalStorageService;
  private isOnline: boolean = navigator.onLine;
  private syncQueue: Array<{ action: string; data: any; timestamp: number }> = [];
  private cacheTimeout = 5 * 60 * 1000; // 5分钟缓存
  private lastSyncTime = 0;

  constructor() {
    this.databaseService = databaseService;
    this.localStorageService = new LocalStorageService();
    
    // 监听网络状态变化
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncOfflineData();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
    
    // 定期同步数据
    setInterval(() => {
      if (this.isOnline && Date.now() - this.lastSyncTime > this.cacheTimeout) {
        this.syncOfflineData();
      }
    }, 60000); // 每分钟检查一次
  }

  /**
   * 同步离线数据到服务器
   */
  private async syncOfflineData(): Promise<void> {
    if (!this.isOnline || this.syncQueue.length === 0) return;

    try {
      console.log(`开始同步 ${this.syncQueue.length} 条离线数据`);
      
      for (const item of this.syncQueue) {
        try {
          await this.executeSyncAction(item);
        } catch (error) {
          console.error('同步数据项失败:', item, error);
          // 保留失败的项目，稍后重试
          continue;
        }
      }
      
      // 清空已同步的数据
      this.syncQueue = [];
      this.lastSyncTime = Date.now();
      console.log('离线数据同步完成');
      
    } catch (error) {
      console.error('同步离线数据失败:', error);
    }
  }

  /**
   * 执行同步操作
   */
  private async executeSyncAction(item: { action: string; data: any; timestamp: number }): Promise<void> {
    const { action, data } = item;
    
    switch (action) {
      case 'createUser':
        await this.databaseService.createUser(data);
        break;
      case 'updateUser':
        await this.databaseService.updateUser(data.id.toString(), data);
        break;
      case 'createSession':
        await this.databaseService.createTestSession(data);
        break;
      case 'updateSession':
        await this.databaseService.updateTestSession(data.id.toString(), data);
        break;
      case 'saveAnswer':
        await this.databaseService.saveAnswer(data);
        break;
      case 'saveBehaviorLog':
        await this.databaseService.logUserBehavior(data);
        break;
      case 'createPaymentOrder':
        await this.databaseService.createPaymentOrder(data);
        break;
      case 'createShareRecord':
        await this.databaseService.createShareRecord(data);
        break;
      default:
        console.warn('未知的同步操作:', action);
    }
  }

  /**
   * 添加到同步队列
   */
  private addToSyncQueue(action: string, data: any): void {
    this.syncQueue.push({
      action,
      data,
      timestamp: Date.now()
    });
  }

  // ==================== 用户相关操作 ====================
  
  async createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    if (this.isOnline) {
      try {
        const user = await this.databaseService.createUser(userData);
        // 同时保存到本地缓存
        await this.localStorageService.createUser(userData);
        return user;
      } catch (error) {
        console.error('在线创建用户失败，使用本地存储:', error);
        this.addToSyncQueue('createUser', userData);
        return await this.localStorageService.createUser(userData);
      }
    } else {
      this.addToSyncQueue('createUser', userData);
      return await this.localStorageService.createUser(userData);
    }
  }

  async getUserById(id: number): Promise<User | null> {
    if (this.isOnline) {
      try {
        return await this.databaseService.getUserById(id.toString());
      } catch (error) {
        console.error('在线获取用户失败，使用本地存储:', error);
        return await this.localStorageService.getUserById(id.toString());
      }
    } else {
      return await this.localStorageService.getUserById(id.toString());
    }
  }

  async updateUser(id: number, updateData: Partial<User>): Promise<User | null> {
    if (this.isOnline) {
      try {
        const user = await this.databaseService.updateUser(id.toString(), updateData);
        // 同时更新本地缓存
        await this.localStorageService.updateUser(id.toString(), updateData);
        return user;
      } catch (error) {
        console.error('在线更新用户失败，使用本地存储:', error);
        this.addToSyncQueue('updateUser', { id: id.toString(), ...updateData });
        return await this.localStorageService.updateUser(id.toString(), updateData);
      }
    } else {
      this.addToSyncQueue('updateUser', { id: id.toString(), ...updateData });
      return await this.localStorageService.updateUser(id.toString(), updateData);
    }
  }

  // ==================== 测试会话相关操作 ====================
  
  async createSession(sessionData: Omit<TestSession, 'id' | 'created_at' | 'updated_at'>): Promise<TestSession> {
    if (this.isOnline) {
      try {
        const session = await this.databaseService.createTestSession(sessionData);
        await this.localStorageService.createTestSession(sessionData);
        return session;
      } catch (error) {
        console.error('在线创建会话失败，使用本地存储:', error);
        this.addToSyncQueue('createSession', sessionData);
        return await this.localStorageService.createTestSession(sessionData);
      }
    } else {
      this.addToSyncQueue('createSession', sessionData);
      return await this.localStorageService.createTestSession(sessionData);
    }
  }

  async getSessionById(id: number): Promise<TestSession | null> {
    if (this.isOnline) {
      try {
        return await this.databaseService.getTestSession(id.toString());
      } catch (error) {
        console.error('在线获取会话失败，使用本地存储:', error);
        return await this.localStorageService.getTestSession(id.toString());
      }
    } else {
      return await this.localStorageService.getTestSession(id.toString());
    }
  }

  async updateSession(id: number, updateData: Partial<TestSession>): Promise<TestSession | null> {
    if (this.isOnline) {
      try {
        const session = await this.databaseService.updateTestSession(id.toString(), updateData);
        await this.localStorageService.updateTestSession(id.toString(), updateData);
        return session;
      } catch (error) {
        console.error('在线更新会话失败，使用本地存储:', error);
        this.addToSyncQueue('updateSession', { id: id.toString(), ...updateData });
        return await this.localStorageService.updateTestSession(id.toString(), updateData);
      }
    } else {
      this.addToSyncQueue('updateSession', { id: id.toString(), ...updateData });
      return await this.localStorageService.updateTestSession(id.toString(), updateData);
    }
  }

  async getUserSessions(userId: number): Promise<TestSession[]> {
    if (this.isOnline) {
      try {
        return await this.databaseService.getUserTestSessions(userId.toString());
      } catch (error) {
        console.error('在线获取用户会话失败，使用本地存储:', error);
        // 通过获取所有会话并过滤来实现
        const allSessions = await this.localStorageService.getAllTestSessions();
        return allSessions.filter(s => s.user_id === userId.toString());
      }
    } else {
      // 通过获取所有会话并过滤来实现
      const allSessions = await this.localStorageService.getAllTestSessions();
      return allSessions.filter(s => s.user_id === userId.toString());
    }
  }

  // ==================== 答题记录相关操作 ====================
  
  async saveAnswer(answerData: Omit<AnswerRecord, 'id' | 'answer_time'>): Promise<AnswerRecord> {
    if (this.isOnline) {
      try {
        const answer = await this.databaseService.saveAnswer(answerData);
        await this.localStorageService.saveAnswer(answerData);
        return answer;
      } catch (error) {
        console.error('在线保存答案失败，使用本地存储:', error);
        this.addToSyncQueue('saveAnswer', answerData);
        return await this.localStorageService.saveAnswer(answerData);
      }
    } else {
      this.addToSyncQueue('saveAnswer', answerData);
      return await this.localStorageService.saveAnswer(answerData);
    }
  }

  async batchSaveAnswers(answers: Array<Omit<AnswerRecord, 'id' | 'answer_time'>>): Promise<AnswerRecord[]> {
    if (this.isOnline) {
      try {
        // 数据库服务没有批量保存方法，逐个保存
        const savedAnswers: AnswerRecord[] = [];
        for (const answer of answers) {
          const saved = await this.databaseService.saveAnswer(answer);
          savedAnswers.push(saved);
        }
        // LocalStorageService没有批量保存方法，逐个保存
        for (const answer of answers) {
          await this.localStorageService.saveAnswer(answer);
        }
        return savedAnswers;
      } catch (error) {
        console.error('在线批量保存答案失败，使用本地存储:', error);
        answers.forEach(answer => this.addToSyncQueue('saveAnswer', answer));
        // LocalStorageService没有批量保存方法，逐个保存
        const savedAnswers: AnswerRecord[] = [];
        for (const answer of answers) {
          const saved = await this.localStorageService.saveAnswer(answer);
          savedAnswers.push(saved);
        }
        return savedAnswers;
      }
    } else {
      answers.forEach(answer => this.addToSyncQueue('saveAnswer', answer));
      // LocalStorageService没有批量保存方法，逐个保存
      const savedAnswers: AnswerRecord[] = [];
      for (const answer of answers) {
        const saved = await this.localStorageService.saveAnswer(answer);
        savedAnswers.push(saved);
      }
      return savedAnswers;
    }
  }

  async getSessionAnswers(sessionId: number): Promise<AnswerRecord[]> {
    if (this.isOnline) {
      try {
        return await this.databaseService.getSessionAnswers(sessionId.toString());
      } catch (error) {
        console.error('在线获取会话答案失败，使用本地存储:', error);
        return await this.localStorageService.getAnswersBySession(sessionId.toString());
      }
    } else {
      return await this.localStorageService.getAnswersBySession(sessionId.toString());
    }
  }

  async getUserAnswers(userId: number): Promise<AnswerRecord[]> {
    if (this.isOnline) {
      try {
        // 数据库服务没有getUserAnswers方法，通过用户会话获取
        const sessions = await this.databaseService.getUserTestSessions(userId.toString());
        const allAnswers: AnswerRecord[] = [];
        for (const session of sessions) {
          if (session.session_id) {
            const answers = await this.databaseService.getSessionAnswers(session.session_id);
            allAnswers.push(...answers);
          }
        }
        return allAnswers;
      } catch (error) {
        console.error('在线获取用户答案失败，使用本地存储:', error);
        // 通过获取所有答案并过滤来实现
        const allAnswers = await this.localStorageService.getAllAnswers();
        return allAnswers.filter(a => a.user_id === userId.toString());
      }
    } else {
      // 通过获取所有答案并过滤来实现
      const allAnswers = await this.localStorageService.getAllAnswers();
      return allAnswers.filter(a => a.user_id === userId.toString());
    }
  }

  // ==================== 用户行为日志相关操作 ====================
  
  async saveBehaviorLog(logData: Omit<UserBehaviorLog, 'id' | 'created_at'>): Promise<UserBehaviorLog> {
    if (this.isOnline) {
      try {
        await this.databaseService.logUserBehavior(logData);
        const log = await this.localStorageService.logUserBehavior(logData);
        return log;
      } catch (error) {
        console.error('在线保存行为日志失败，使用本地存储:', error);
        this.addToSyncQueue('saveBehaviorLog', logData);
        return await this.localStorageService.logUserBehavior(logData);
      }
    } else {
      this.addToSyncQueue('saveBehaviorLog', logData);
      return await this.localStorageService.logUserBehavior(logData);
    }
  }

  async getUserBehaviorLogs(userId: number): Promise<UserBehaviorLog[]> {
    if (this.isOnline) {
      try {
        return await this.databaseService.getUserBehaviorLogs(userId.toString());
      } catch (error) {
        console.error('在线获取用户行为日志失败，使用本地存储:', error);
        // 通过获取所有行为日志并过滤来实现
        const allBehaviors = await this.localStorageService.getAllBehaviorLogs();
        return allBehaviors.filter(b => b.user_id === userId.toString());
      }
    } else {
      // 通过获取所有行为日志并过滤来实现
      const allBehaviors = await this.localStorageService.getAllBehaviorLogs();
      return allBehaviors.filter(b => b.user_id === userId.toString());
    }
  }

  // ==================== 支付订单相关操作 ====================
  
  async createPaymentOrder(orderData: Omit<PaymentOrder, 'id' | 'created_at' | 'updated_at'>): Promise<PaymentOrder> {
    if (this.isOnline) {
      try {
        const order = await this.databaseService.createPaymentOrder(orderData);
        await this.localStorageService.createPaymentOrder(orderData);
        return order;
      } catch (error) {
        console.error('在线创建支付订单失败，使用本地存储:', error);
        this.addToSyncQueue('createPaymentOrder', orderData);
        return await this.localStorageService.createPaymentOrder(orderData);
      }
    } else {
      this.addToSyncQueue('createPaymentOrder', orderData);
      return await this.localStorageService.createPaymentOrder(orderData);
    }
  }

  async getPaymentOrderById(id: number): Promise<PaymentOrder | null> {
    if (this.isOnline) {
      try {
        return await this.databaseService.getPaymentOrder(id.toString());
      } catch (error) {
        console.error('在线获取支付订单失败，使用本地存储:', error);
        // 通过获取所有订单并过滤来实现
        const allOrders = await this.localStorageService.getAllPaymentOrders();
        return allOrders.find(o => o.id === id) || null;
      }
    } else {
      // 通过获取所有订单并过滤来实现
      const allOrders = await this.localStorageService.getAllPaymentOrders();
      return allOrders.find(o => o.id === id) || null;
    }
  }

  // ==================== 分享记录相关操作 ====================
  
  async createShareRecord(shareData: Omit<ShareRecord, 'id' | 'created_at'>): Promise<ShareRecord> {
    if (this.isOnline) {
      try {
        const share = await this.databaseService.createShareRecord(shareData);
        await this.localStorageService.createShareRecord(shareData);
        return share;
      } catch (error) {
        console.error('在线创建分享记录失败，使用本地存储:', error);
        this.addToSyncQueue('createShareRecord', shareData);
        return await this.localStorageService.createShareRecord(shareData);
      }
    } else {
      this.addToSyncQueue('createShareRecord', shareData);
      return await this.localStorageService.createShareRecord(shareData);
    }
  }

  // ==================== 数据分析相关操作 ====================
  
  async getAnswerStats(sessionId?: number): Promise<any> {
    if (this.isOnline) {
      try {
        // 数据库服务没有getAnswerStats方法，使用本地实现
        return await this.localStorageService.getAnswerStats(sessionId ? sessionId.toString() : '');
      } catch (error) {
        console.error('在线获取答题统计失败，使用本地存储:', error);
        return await this.localStorageService.getAnswerStats(sessionId?.toString() || '');
      }
    } else {
      return await this.localStorageService.getAnswerStats(sessionId ? sessionId.toString() : '');
    }
  }

  /**
   * 获取测试历史记录
   */
  async getTestHistory(userId?: number): Promise<TestSession[]> {
    if (this.isOnline) {
      try {
        if (userId) {
          return await this.getUserSessions(userId);
        } else {
          // 获取所有会话记录
          return await this.localStorageService.getAllTestSessions();
        }
      } catch (error) {
        console.error('在线获取测试历史失败，使用本地存储:', error);
        return await this.localStorageService.getAllTestSessions();
      }
    } else {
      return await this.localStorageService.getAllTestSessions();
    }
  }

  // ==================== 工具方法 ====================
  
  /**
   * 获取网络状态
   */
  getNetworkStatus(): boolean {
    return this.isOnline;
  }

  /**
   * 获取同步队列长度
   */
  getSyncQueueLength(): number {
    return this.syncQueue.length;
  }

  /**
   * 手动触发同步
   */
  async forcSync(): Promise<void> {
    if (this.isOnline) {
      await this.syncOfflineData();
    }
  }

  /**
   * 清理本地缓存
   */
  async clearLocalCache(): Promise<void> {
    await this.localStorageService.clearAllData();
  }

  /**
   * 获取存储使用情况
   */
  getStorageUsage(): {
    users: number;
    sessions: number;
    answers: number;
    behaviors: number;
    payments: number;
    shares: number;
    syncQueue: number;
    storageUsed: string;
  } {
    return this.localStorageService.getStorageStats();
  }
}

// 导出单例实例
export const dataService = new DataService();