// 后端数据库服务 - 实际的MySQL连接和操作
import mysql from 'mysql2/promise';
// @ts-ignore
import config from '../../config/index.js';
import type { 
  User, 
  TestSession, 
  AnswerRecord, 
  PaymentOrder, 
  UserBehaviorLog, 
  ShareRecord 
} from './database';

export class DatabaseService {
  private pool: mysql.Pool;
  private isConnected = false;

  constructor() {
    this.pool = mysql.createPool({
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
      database: config.db.database,
      waitForConnections: true,
      connectionLimit: config.db.pool.connectionLimit,
      queueLimit: config.db.pool.queueLimit
    });

    this.initializeConnection();
  }

  private async initializeConnection() {
    try {
      const connection = await this.pool.getConnection();
      await connection.ping();
      connection.release();
      this.isConnected = true;
      console.log('✅ 数据库连接成功');
    } catch (error) {
      console.error('❌ 数据库连接失败:', error);
      this.isConnected = false;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const connection = await this.pool.getConnection();
      await connection.ping();
      connection.release();
      return true;
    } catch (error) {
      console.error('数据库连接测试失败:', error);
      return false;
    }
  }

  // 用户相关操作
  async createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    const connection = await this.pool.getConnection();
    try {
      const [result] = await connection.execute(
        `INSERT INTO users (user_id, registration_source, device_info, ip_address, user_agent, status) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          userData.user_id,
          userData.registration_source,
          JSON.stringify(userData.device_info),
          userData.ip_address,
          userData.user_agent,
          userData.status
        ]
      ) as mysql.ResultSetHeader[];

      const [rows] = await connection.execute(
        'SELECT * FROM users WHERE id = ?',
        [result.insertId]
      ) as mysql.RowDataPacket[][];

      return rows[0] as User;
    } finally {
      connection.release();
    }
  }

  async getUserById(userId: string): Promise<User | null> {
    const connection = await this.pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM users WHERE user_id = ?',
        [userId]
      ) as mysql.RowDataPacket[][];

      return rows.length > 0 ? rows[0] as User : null;
    } finally {
      connection.release();
    }
  }

  async updateUser(userId: string, updateData: Partial<User>): Promise<User | null> {
    const connection = await this.pool.getConnection();
    try {
      const setClause = Object.keys(updateData)
        .filter(key => key !== 'id' && key !== 'user_id' && key !== 'created_at')
        .map(key => `${key} = ?`)
        .join(', ');
      
      const values = Object.entries(updateData)
        .filter(([key]) => key !== 'id' && key !== 'user_id' && key !== 'created_at')
        .map(([, value]) => typeof value === 'object' ? JSON.stringify(value) : value);
      
      await connection.execute(
        `UPDATE users SET ${setClause}, updated_at = NOW() WHERE user_id = ?`,
        [...values, userId]
      );

      return await this.getUserById(userId);
    } finally {
      connection.release();
    }
  }

  // 测试会话相关操作
  async createTestSession(sessionData: Omit<TestSession, 'id' | 'created_at' | 'updated_at'>): Promise<TestSession> {
    const connection = await this.pool.getConnection();
    try {
      const [result] = await connection.execute(
        `INSERT INTO test_sessions (
          session_id, user_id, test_type, test_version, status, total_questions, 
          answered_questions, current_question_index, device_type, browser_info, 
          source_page, utm_source, utm_medium, utm_campaign
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          sessionData.session_id,
          sessionData.user_id,
          sessionData.test_type,
          sessionData.test_version,
          sessionData.status,
          sessionData.total_questions,
          sessionData.answered_questions,
          sessionData.current_question_index,
          sessionData.device_type,
          sessionData.browser_info,
          sessionData.source_page,
          sessionData.utm_source,
          sessionData.utm_medium,
          sessionData.utm_campaign
        ]
      ) as mysql.ResultSetHeader[];

      const [rows] = await connection.execute(
        'SELECT * FROM test_sessions WHERE id = ?',
        [result.insertId]
      ) as mysql.RowDataPacket[][];

      return rows[0] as TestSession;
    } finally {
      connection.release();
    }
  }

  async getTestSession(sessionId: string): Promise<TestSession | null> {
    const connection = await this.pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM test_sessions WHERE session_id = ?',
        [sessionId]
      ) as mysql.RowDataPacket[][];

      return rows.length > 0 ? rows[0] as TestSession : null;
    } finally {
      connection.release();
    }
  }

  async updateTestSession(sessionId: string, updateData: Partial<TestSession>): Promise<TestSession | null> {
    const connection = await this.pool.getConnection();
    try {
      const setClause = Object.keys(updateData)
        .filter(key => key !== 'id' && key !== 'session_id' && key !== 'created_at')
        .map(key => `${key} = ?`)
        .join(', ');
      
      const values = Object.entries(updateData)
        .filter(([key]) => key !== 'id' && key !== 'session_id' && key !== 'created_at')
        .map(([, value]) => value);
      
      await connection.execute(
        `UPDATE test_sessions SET ${setClause}, updated_at = NOW() WHERE session_id = ?`,
        [...values, sessionId]
      );

      return await this.getTestSession(sessionId);
    } finally {
      connection.release();
    }
  }

  // 答题记录相关操作
  async saveAnswer(answerData: Omit<AnswerRecord, 'id' | 'answer_time'>): Promise<AnswerRecord> {
    const connection = await this.pool.getConnection();
    try {
      const [result] = await connection.execute(
        `INSERT INTO answer_records (
          session_id, user_id, question_index, question_text, dimension, direction,
          answer_index, answer_text, answer_score, time_spent_seconds, is_changed,
          change_count, previous_answer_index
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          answer_index = VALUES(answer_index),
          answer_text = VALUES(answer_text),
          answer_score = VALUES(answer_score),
          time_spent_seconds = VALUES(time_spent_seconds),
          is_changed = 1,
          change_count = change_count + 1,
          previous_answer_index = answer_index,
          answer_time = NOW()`,
        [
          answerData.session_id,
          answerData.user_id,
          answerData.question_index,
          answerData.question_text,
          answerData.dimension,
          answerData.direction,
          answerData.answer_index,
          answerData.answer_text,
          answerData.answer_score,
          answerData.time_spent_seconds,
          answerData.is_changed ? 1 : 0,
          answerData.change_count || 0,
          answerData.previous_answer_index
        ]
      ) as mysql.ResultSetHeader[];

      const [rows] = await connection.execute(
        'SELECT * FROM answer_records WHERE session_id = ? AND question_index = ?',
        [answerData.session_id, answerData.question_index]
      ) as mysql.RowDataPacket[][];

      return rows[0] as AnswerRecord;
    } finally {
      connection.release();
    }
  }

  async getAnswersBySession(sessionId: string): Promise<AnswerRecord[]> {
    const connection = await this.pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM answer_records WHERE session_id = ? ORDER BY question_index',
        [sessionId]
      ) as mysql.RowDataPacket[][];

      return rows as AnswerRecord[];
    } finally {
      connection.release();
    }
  }

  async updateAnswer(answerId: number, updateData: Partial<AnswerRecord>): Promise<AnswerRecord | null> {
    const connection = await this.pool.getConnection();
    try {
      const setClause = Object.keys(updateData)
        .filter(key => key !== 'id' && key !== 'answer_time')
        .map(key => `${key} = ?`)
        .join(', ');
      
      const values = Object.entries(updateData)
        .filter(([key]) => key !== 'id' && key !== 'answer_time')
        .map(([, value]) => value);
      
      await connection.execute(
        `UPDATE answer_records SET ${setClause}, answer_time = NOW() WHERE id = ?`,
        [...values, answerId]
      );

      const [rows] = await connection.execute(
        'SELECT * FROM answer_records WHERE id = ?',
        [answerId]
      ) as mysql.RowDataPacket[][];

      return rows.length > 0 ? rows[0] as AnswerRecord : null;
    } finally {
      connection.release();
    }
  }

  async deleteAnswer(answerId: number): Promise<boolean> {
    const connection = await this.pool.getConnection();
    try {
      const [result] = await connection.execute(
        'DELETE FROM answer_records WHERE id = ?',
        [answerId]
      ) as mysql.ResultSetHeader[];

      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  async getAnswerStats(sessionId: string): Promise<any> {
    const connection = await this.pool.getConnection();
    try {
      const [rows] = await connection.execute(
        `SELECT 
          COUNT(*) as total_answers,
          AVG(time_spent_seconds) as avg_time_per_question,
          SUM(CASE WHEN is_changed = 1 THEN 1 ELSE 0 END) as changed_answers,
          dimension,
          AVG(answer_score) as avg_score
        FROM answer_records 
        WHERE session_id = ? 
        GROUP BY dimension`,
        [sessionId]
      ) as mysql.RowDataPacket[][];

      return rows;
    } finally {
      connection.release();
    }
  }

  // 用户行为日志
  async logUserBehavior(logData: Omit<UserBehaviorLog, 'id' | 'created_at'>): Promise<UserBehaviorLog> {
    const connection = await this.pool.getConnection();
    try {
      const [result] = await connection.execute(
        `INSERT INTO user_behavior_logs (
          user_id, session_id, event_type, event_category, event_action, event_label,
          page_url, page_title, referrer_url, custom_data, viewport_width, viewport_height,
          device_type, browser_name, browser_version, os_name, os_version, user_agent
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          logData.user_id,
          logData.session_id,
          logData.event_type,
          logData.event_category,
          logData.event_action,
          logData.event_label,
          logData.page_url,
          logData.page_title,
          logData.referrer_url,
          JSON.stringify(logData.custom_data),
          logData.viewport_width,
          logData.viewport_height,
          logData.device_type,
          logData.browser_name,
          logData.browser_version,
          logData.os_name,
          logData.os_version,
          logData.user_agent
        ]
      ) as mysql.ResultSetHeader[];

      const [rows] = await connection.execute(
        'SELECT * FROM user_behavior_logs WHERE id = ?',
        [result.insertId]
      ) as mysql.RowDataPacket[][];

      return rows[0] as UserBehaviorLog;
    } finally {
      connection.release();
    }
  }

  // 支付订单相关操作
  async createPaymentOrder(orderData: Omit<PaymentOrder, 'id' | 'created_at' | 'updated_at'>): Promise<PaymentOrder> {
    const connection = await this.pool.getConnection();
    try {
      const [result] = await connection.execute(
        `INSERT INTO payment_orders (
          order_id, user_id, session_id, product_type, product_name, original_amount, 
          discount_amount, final_amount, currency, payment_method, payment_status, 
          trade_no, prepay_id, ip_address, user_agent, remark
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderData.order_id,
          orderData.user_id,
          orderData.session_id,
          orderData.product_type,
          orderData.product_name,
          orderData.original_amount,
          orderData.discount_amount || 0,
          orderData.final_amount,
          orderData.currency || 'CNY',
          orderData.payment_method,
          orderData.payment_status || 0,
          orderData.trade_no,
          orderData.prepay_id,
          orderData.ip_address,
          orderData.user_agent,
          orderData.remark
        ]
      ) as mysql.ResultSetHeader[];

      const [rows] = await connection.execute(
        'SELECT * FROM payment_orders WHERE id = ?',
        [result.insertId]
      ) as mysql.RowDataPacket[][];

      return rows[0] as PaymentOrder;
    } finally {
      connection.release();
    }
  }

  // 分享记录相关操作
  async createShareRecord(shareData: Omit<ShareRecord, 'id' | 'created_at'>): Promise<ShareRecord> {
    const connection = await this.pool.getConnection();
    try {
      const [result] = await connection.execute(
        `INSERT INTO share_records (
          share_id, user_id, session_id, share_type, share_platform, share_content,
          share_url, view_count, click_count, conversion_count
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          shareData.share_id,
          shareData.user_id,
          shareData.session_id,
          shareData.share_type,
          shareData.share_platform,
          JSON.stringify(shareData.share_content || {}),
          shareData.share_url,
          shareData.view_count || 0,
          shareData.click_count || 0,
          shareData.conversion_count || 0
        ]
      ) as mysql.ResultSetHeader[];

      const [rows] = await connection.execute(
        'SELECT * FROM share_records WHERE id = ?',
        [result.insertId]
      ) as mysql.RowDataPacket[][];

      return rows[0] as ShareRecord;
    } finally {
      connection.release();
    }
  }

  // 关闭连接池
  async close(): Promise<void> {
    await this.pool.end();
    this.isConnected = false;
    console.log('数据库连接池已关闭');
  }

  // 获取连接状态
  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

export default DatabaseService;