// MBTI测试系统 - 数据库初始化脚本
import mysql from 'mysql2/promise';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import config from './config/index.js';

dotenv.config();

// ES模块中获取__dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 数据库配置
const dbConfig = {
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  charset: 'utf8mb4'
};

const dbName = config.db.database;

// 初始化数据库
async function initializeDatabase() {
  let connection;
  
  try {
    console.log('🔄 开始初始化数据库...');
    
    // 连接到MySQL服务器（不指定数据库）
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 连接到MySQL服务器成功');
    
    // 创建数据库（如果不存在）
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`✅ 数据库 '${dbName}' 创建成功`);
    
    // 切换到目标数据库
    await connection.query(`USE \`${dbName}\``);
    console.log(`✅ 切换到数据库 '${dbName}'`);
    
    // 读取并执行SQL文件
    const sqlFilePath = path.join(__dirname, 'database-schema.sql');
    
    try {
      const sqlContent = await fs.readFile(sqlFilePath, 'utf8');
      
      // 处理SQL内容，移除注释和空行
      let processedSql = sqlContent
        .split('\n')
        .filter(line => !line.trim().startsWith('--') && line.trim().length > 0)
        .join('\n');
      
      // 处理DELIMITER语句
      processedSql = processedSql.replace(/DELIMITER\s+\/\/[\s\S]*?DELIMITER\s*;/gi, '');
      
      // 分割SQL语句（以分号分隔）
      const sqlStatements = processedSql
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0);
      
      console.log(`📄 找到 ${sqlStatements.length} 条SQL语句`);
      
      // 执行每条SQL语句
      for (let i = 0; i < sqlStatements.length; i++) {
        const statement = sqlStatements[i];
        try {
          await connection.query(statement);
          console.log(`✅ 执行SQL语句 ${i + 1}/${sqlStatements.length}`);
        } catch (error) {
          // 忽略表已存在的错误
          if (error.code !== 'ER_TABLE_EXISTS_ERROR') {
            console.warn(`⚠️  SQL语句 ${i + 1} 执行警告:`, error.message);
          }
        }
      }
      
    } catch (fileError) {
      console.warn('⚠️  未找到 database-schema.sql 文件，将创建基础表结构');
      await createBasicTables(connection);
    }
    
    // 插入初始数据
    await insertInitialData(connection);
    
    // 验证表结构
    await verifyTables(connection);
    
    console.log('🎉 数据库初始化完成!');
    
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// 创建基础表结构
async function createBasicTables(connection) {
  console.log('🔄 创建基础表结构...');
  
  // 用户表
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id VARCHAR(50) UNIQUE NOT NULL,
      nickname VARCHAR(100),
      email VARCHAR(255),
      phone VARCHAR(20),
      gender ENUM('male', 'female', 'other'),
      age INT,
      city VARCHAR(100),
      province VARCHAR(100),
      registration_source VARCHAR(50) DEFAULT 'direct',
      device_info JSON,
      ip_address VARCHAR(45),
      user_agent TEXT,
      status TINYINT DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      last_login_at TIMESTAMP NULL,
      INDEX idx_user_id (user_id),
      INDEX idx_email (email),
      INDEX idx_phone (phone),
      INDEX idx_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  
  // 管理员用户表
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role ENUM('admin', 'manager') DEFAULT 'admin',
      status TINYINT DEFAULT 1 COMMENT '1:启用, 0:禁用',
      last_login TIMESTAMP NULL,
      login_attempts INT DEFAULT 0,
      locked_until TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_username (username),
      INDEX idx_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  
  // 测试会话表
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS test_sessions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      session_id VARCHAR(50) UNIQUE NOT NULL,
      user_id VARCHAR(50) NOT NULL,
      test_type VARCHAR(20) DEFAULT 'mbti_93',
      test_version VARCHAR(10) DEFAULT '1.0',
      status TINYINT DEFAULT 0 COMMENT '0:进行中, 1:已完成, 2:已放弃',
      start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      complete_time TIMESTAMP NULL,
      mbti_type VARCHAR(4),
      ei_score INT,
      ns_score INT,
      tf_score INT,
      jp_score INT,
      ei_percentage DECIMAL(5,2),
      ns_percentage DECIMAL(5,2),
      tf_percentage DECIMAL(5,2),
      jp_percentage DECIMAL(5,2),
      confidence_score DECIMAL(5,2),
      time_spent_seconds INT,
      answered_questions INT DEFAULT 0,
      total_questions INT DEFAULT 93,
      device_type VARCHAR(20),
      browser_info VARCHAR(200),
      ip_address VARCHAR(45),
      source_page VARCHAR(500),
      INDEX idx_session_id (session_id),
      INDEX idx_user_id (user_id),
      INDEX idx_status (status),
      INDEX idx_start_time (start_time),
      INDEX idx_mbti_type (mbti_type),
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  
  // 答题记录表
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS answer_records (
      id INT AUTO_INCREMENT PRIMARY KEY,
      session_id VARCHAR(50) NOT NULL,
      user_id VARCHAR(50) NOT NULL,
      question_index INT NOT NULL,
      question_text TEXT,
      selected_option CHAR(1) NOT NULL,
      option_text TEXT,
      answer_time_seconds DECIMAL(6,3),
      device_type VARCHAR(20),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_session_id (session_id),
      INDEX idx_user_id (user_id),
      INDEX idx_question_index (question_index),
      FOREIGN KEY (session_id) REFERENCES test_sessions(session_id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  
  // 支付订单表
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS payment_orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id VARCHAR(100) UNIQUE NOT NULL,
      user_id VARCHAR(50) NOT NULL,
      session_id VARCHAR(100),
      product_type VARCHAR(50) NOT NULL,
      product_name VARCHAR(200) NOT NULL,
      original_amount DECIMAL(10,2) NOT NULL,
      discount_amount DECIMAL(10,2) DEFAULT 0,
      final_amount DECIMAL(10,2) NOT NULL,
      currency VARCHAR(10) DEFAULT 'CNY',
      payment_method VARCHAR(50),
      payment_status TINYINT DEFAULT 0 COMMENT '0:待支付, 1:已支付, 2:已退款, 3:支付失败',
      trade_no VARCHAR(100),
      prepay_id VARCHAR(100),
      payment_time TIMESTAMP NULL,
      coupon_code VARCHAR(50),
      promotion_id VARCHAR(50),
      remark TEXT,
      ip_address VARCHAR(45),
      user_agent TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_order_id (order_id),
      INDEX idx_user_id (user_id),
      INDEX idx_payment_status (payment_status),
      INDEX idx_created_at (created_at),
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  // 报告表
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS reports (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id VARCHAR(100) UNIQUE NOT NULL,
      user_id VARCHAR(50) NOT NULL,
      session_id VARCHAR(100),
      mbti_type VARCHAR(4) NOT NULL,
      proportions JSON,
      content JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_order_id (order_id),
      INDEX idx_user_id (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  
  // 用户行为日志表
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS user_behavior_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id VARCHAR(50),
      session_id VARCHAR(50),
      action_type VARCHAR(50) NOT NULL,
      action_data JSON,
      page_url VARCHAR(500),
      referrer_url VARCHAR(500),
      device_type VARCHAR(20),
      browser_info VARCHAR(200),
      ip_address VARCHAR(45),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_user_id (user_id),
      INDEX idx_session_id (session_id),
      INDEX idx_action_type (action_type),
      INDEX idx_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  
  // 系统设置表
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS system_settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      setting_key VARCHAR(100) UNIQUE NOT NULL,
      setting_value TEXT,
      setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_setting_key (setting_key)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  
  // 操作日志表
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS admin_logs (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      admin_id INT,
      action VARCHAR(100),
      target_type VARCHAR(50),
      target_id VARCHAR(50),
      details JSON,
      ip_address VARCHAR(45),
      user_agent TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE SET NULL,
      INDEX idx_admin_id (admin_id),
      INDEX idx_action (action),
      INDEX idx_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  
  console.log('✅ 基础表结构创建完成');
}

// 插入初始数据
async function insertInitialData(connection) {
  console.log('🔄 插入初始数据...');
  
  try {
    // 检查是否已有测试数据
    const [existingUsers] = await connection.execute('SELECT COUNT(*) as count FROM users');
    
    if (existingUsers[0].count === 0) {
      // 插入测试用户
      await connection.execute(`
        INSERT INTO users (user_id, nickname, email, gender, age, city, province, registration_source) VALUES
        ('test_user_001', '测试用户1', 'test1@example.com', 'male', 25, '北京', '北京市', 'direct'),
        ('test_user_002', '测试用户2', 'test2@example.com', 'female', 28, '上海', '上海市', 'direct'),
        ('test_user_003', '测试用户3', 'test3@example.com', 'other', 22, '广州', '广东省', 'wechat')
      `);
      
      // 插入测试会话
      await connection.execute(`
        INSERT INTO test_sessions (session_id, user_id, test_type, status, mbti_type, 
                                  ei_score, ns_score, tf_score, jp_score, 
                                  ei_percentage, ns_percentage, tf_percentage, jp_percentage,
                                  confidence_score, time_spent_seconds, answered_questions, complete_time) VALUES
        ('session_001', 'test_user_001', 'mbti_93', 1, 'INTJ', 15, 18, 16, 17, 65.2, 78.3, 69.6, 73.9, 85.5, 1200, 93, NOW()),
        ('session_002', 'test_user_002', 'mbti_93', 1, 'ENFP', 8, 12, 9, 11, 34.8, 52.2, 39.1, 47.8, 78.2, 980, 93, NOW()),
        ('session_003', 'test_user_003', 'mbti_93', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 450, 45, NULL)
      `);
      
      console.log('✅ 测试数据插入完成');
    } else {
      console.log('ℹ️  数据库中已存在数据，跳过初始数据插入');
    }
    
    // 检查并插入管理员账户
    const [existingAdmins] = await connection.execute('SELECT COUNT(*) as count FROM admin_users');
    if (existingAdmins[0].count === 0) {
      console.log('🔄 创建默认管理员账户...');
      
      // 使用bcrypt加密密码
      const bcrypt = require('bcrypt');
      const defaultPassword = 'admin123';
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);
      
      await connection.execute(
        `INSERT INTO admin_users (username, password, role, status) VALUES (?, ?, ?, ?)`,
        ['admin', hashedPassword, 'admin', 1]
      );
      
      console.log('✅ 默认管理员账户创建完成');
      console.log('   用户名: admin');
      console.log('   密码: admin123');
      console.log('   ⚠️  请在生产环境中修改默认密码！');
    } else {
      console.log('ℹ️  管理员账户已存在，跳过创建');
    }
    
    // 插入默认系统设置
    const [existingSettings] = await connection.execute('SELECT COUNT(*) as count FROM system_settings');
    if (existingSettings[0].count === 0) {
      console.log('🔄 插入默认系统设置...');
      
      const defaultSettings = [
        ['system_name', 'MBTI性格测试系统', 'string', '系统名称'],
        ['system_description', '专业的MBTI性格类型测试平台', 'string', '系统描述'],
        ['question_count', '93', 'number', '测试题目数量'],
        ['time_limit', '30', 'number', '测试时间限制（分钟）'],
        ['allow_retake', 'true', 'boolean', '允许重新测试'],
        ['show_progress', 'true', 'boolean', '显示测试进度'],
        ['auto_save_interval', '30', 'number', '自动保存间隔（秒）'],
        ['payment_enabled', 'false', 'boolean', '启用付费功能'],
        ['test_price', '1000', 'number', '测试价格（分）'],
        ['free_test_count', '1', 'number', '免费测试次数']
      ];
      
      for (const setting of defaultSettings) {
        await connection.execute(
          `INSERT INTO system_settings (setting_key, setting_value, setting_type, description) VALUES (?, ?, ?, ?)`,
          setting
        );
      }
      
      console.log('✅ 默认系统设置插入完成');
    } else {
      console.log('ℹ️  系统设置已存在，跳过插入');
    }
    
  } catch (error) {
    console.warn('⚠️  插入初始数据时出现警告:', error.message);
  }
}

// 验证表结构
async function verifyTables(connection) {
  console.log('🔄 验证表结构...');
  
  const requiredTables = ['users', 'admin_users', 'test_sessions', 'answer_records', 'payment_orders', 'user_behavior_logs', 'system_settings', 'admin_logs'];
  
  for (const table of requiredTables) {
    const [tables] = await connection.execute(`SHOW TABLES LIKE '${table}'`);
    if (tables.length > 0) {
      const [columns] = await connection.execute(`DESCRIBE ${table}`);
      console.log(`✅ 表 '${table}' 存在，包含 ${columns.length} 个字段`);
    } else {
      console.error(`❌ 表 '${table}' 不存在`);
    }
  }
}

// 主函数
async function main() {
  try {
    await initializeDatabase();
    console.log('\n🎉 数据库初始化成功完成!');
    console.log('\n📋 接下来可以执行:');
    console.log('   npm run server    # 启动后端服务器');
    console.log('   npm run dev       # 启动前端开发服务器');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ 数据库初始化失败:', error.message);
    console.log('\n🔧 请检查:');
    console.log('   1. MySQL服务是否正在运行');
    console.log('   2. .env 文件中的数据库配置是否正确');
    console.log('   3. 数据库用户是否有足够的权限');
    process.exit(1);
  }
}

// 如果直接运行此脚本
// ES模块中检查是否为主模块
if (import.meta.url === new URL(process.argv[1], 'file:').href) {
  main();
}

export {
  initializeDatabase,
  createBasicTables,
  insertInitialData,
  verifyTables
};