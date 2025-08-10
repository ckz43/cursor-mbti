# MBTI测试系统 API接口文档

## 概述

本文档描述了MBTI测试系统的数据服务接口，包括前端数据服务、后端API接口和本地存储服务。

## 数据服务架构

### 1. 混合数据访问模式
- **在线模式**: 使用后端API进行数据操作，同时缓存到本地存储
- **离线模式**: 使用本地存储，数据会在网络恢复时自动同步
- **容错机制**: 在线操作失败时自动降级到本地存储

### 2. 数据类型定义

#### User (用户)
```typescript
interface User {
  id: string;
  nickname?: string;
  avatar_url?: string;
  email?: string;
  phone?: string;
  gender?: 'male' | 'female' | 'other';
  birth_date?: string;
  location?: string;
  occupation?: string;
  education?: string;
  created_at: Date;
  updated_at: Date;
}
```

#### TestSession (测试会话)
```typescript
interface TestSession {
  id: string;
  user_id: string;
  test_type: 'mbti_93' | 'mbti_60' | 'custom';
  status: 'in_progress' | 'completed' | 'abandoned';
  start_time: Date;
  end_time?: Date;
  result_type?: string;
  total_questions: number;
  answered_questions: number;
  device_info?: string;
  browser_info?: string;
  ip_address?: string;
  created_at: Date;
  updated_at: Date;
}
```

#### AnswerRecord (答题记录)
```typescript
interface AnswerRecord {
  id: number;
  session_id: string;
  user_id: string;
  question_id: number;
  question_text: string;
  answer_value: number;
  answer_text: string;
  dimension: string;
  answer_time: Date;
  time_spent: number;
}
```

#### PaymentOrder (支付订单)
```typescript
interface PaymentOrder {
  id: string;
  user_id: string;
  session_id?: string;
  product_type: 'basic_report' | 'premium_report' | 'career_guidance';
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method?: string;
  payment_id?: string;
  created_at: Date;
  updated_at: Date;
}
```

#### UserBehaviorLog (用户行为日志)
```typescript
interface UserBehaviorLog {
  id: string;
  user_id: string;
  session_id?: string;
  action: string;
  page: string;
  details?: any;
  timestamp: Date;
  created_at: Date;
}
```

#### ShareRecord (分享记录)
```typescript
interface ShareRecord {
  id: string;
  user_id: string;
  session_id: string;
  platform: 'wechat' | 'weibo' | 'qq' | 'link' | 'other';
  shared_content: string;
  created_at: Date;
}
```

## 前端数据服务接口 (DataService)

### 用户管理

#### 创建用户
```typescript
createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User>
```

#### 获取用户信息
```typescript
getUserById(id: string | number): Promise<User | null>
```

#### 更新用户信息
```typescript
updateUser(id: string | number, updateData: Partial<User>): Promise<User | null>
```

### 测试会话管理

#### 创建测试会话
```typescript
createTestSession(sessionData: Omit<TestSession, 'id' | 'created_at' | 'updated_at'>): Promise<TestSession>
```

#### 获取测试会话
```typescript
getTestSessionById(id: string | number): Promise<TestSession | null>
```

#### 获取用户的所有测试会话
```typescript
getUserTestSessions(userId: string | number): Promise<TestSession[]>
```

#### 更新测试会话
```typescript
updateTestSession(id: string | number, updateData: Partial<TestSession>): Promise<TestSession | null>
```

### 答题记录管理

#### 保存单个答案
```typescript
saveAnswer(answerData: Omit<AnswerRecord, 'id' | 'answer_time'>): Promise<AnswerRecord>
```

#### 批量保存答案
```typescript
batchSaveAnswers(answers: Omit<AnswerRecord, 'id' | 'answer_time'>[]): Promise<AnswerRecord[]>
```

#### 获取会话的所有答案
```typescript
getSessionAnswers(sessionId: string | number): Promise<AnswerRecord[]>
```

#### 获取用户的所有答案
```typescript
getUserAnswers(userId: string | number): Promise<AnswerRecord[]>
```

#### 更新答案
```typescript
updateAnswer(id: number, updateData: Partial<AnswerRecord>): Promise<AnswerRecord | null>
```

#### 删除答案
```typescript
deleteAnswer(id: number): Promise<boolean>
```

#### 获取答题统计
```typescript
getAnswerStats(sessionId?: string | number): Promise<any>
```

### 支付订单管理

#### 创建支付订单
```typescript
createPaymentOrder(orderData: Omit<PaymentOrder, 'id' | 'created_at' | 'updated_at'>): Promise<PaymentOrder>
```

#### 获取支付订单
```typescript
getPaymentOrderById(id: string): Promise<PaymentOrder | null>
```

#### 更新支付订单
```typescript
updatePaymentOrder(id: string, updateData: Partial<PaymentOrder>): Promise<PaymentOrder | null>
```

### 用户行为日志

#### 记录用户行为
```typescript
logUserBehavior(logData: Omit<UserBehaviorLog, 'id' | 'created_at'>): Promise<UserBehaviorLog>
```

#### 获取用户行为日志
```typescript
getUserBehaviorLogs(userId: string | number): Promise<UserBehaviorLog[]>
```

### 分享记录管理

#### 创建分享记录
```typescript
createShareRecord(shareData: Omit<ShareRecord, 'id' | 'created_at'>): Promise<ShareRecord>
```

### 系统管理

#### 获取存储使用情况
```typescript
getStorageUsage(): {
  users: number;
  sessions: number;
  answers: number;
  behaviors: number;
  payments: number;
  shares: number;
  syncQueue: number;
  storageUsed: string;
}
```

#### 清理存储数据
```typescript
cleanupStorage(): void
```

## 后端API接口 (Express服务)

### 基础配置
- **端口**: 3000 (可通过环境变量PORT配置)
- **CORS**: 已启用，支持跨域请求
- **安全**: 集成Helmet安全中间件
- **限流**: 每15分钟最多100个请求
- **压缩**: 启用Gzip压缩

### 健康检查
```
GET /health
响应: { status: 'ok', timestamp: string, uptime: number }
```

### 答题记录接口 (/api/answers)

#### 保存单个答案
```
POST /api/answers
Body: {
  session_id: string,
  user_id: string,
  question_id: number,
  question_text: string,
  answer_value: number,
  answer_text: string,
  dimension: string,
  time_spent?: number
}
响应: AnswerRecord
```

#### 批量保存答案
```
POST /api/answers/batch
Body: {
  answers: AnswerRecord[]
}
响应: AnswerRecord[]
```

#### 获取用户答题记录
```
GET /api/answers/user/:userId
响应: AnswerRecord[]
```

#### 获取会话答题记录
```
GET /api/answers/session/:sessionId
响应: AnswerRecord[]
```

#### 更新答案
```
PUT /api/answers/:id
Body: Partial<AnswerRecord>
响应: AnswerRecord
```

#### 删除答案
```
DELETE /api/answers/:id
响应: { success: boolean }
```

#### 获取答题统计
```
GET /api/answers/stats/:sessionId?
响应: {
  total: number,
  byDimension: Record<string, number>,
  averageTime: number,
  completion: number
}
```

## 本地存储服务 (LocalStorageService)

### 特性
- **离线支持**: 完整的离线数据操作能力
- **自动同步**: 网络恢复时自动同步到服务器
- **存储管理**: 自动清理过期数据，防止存储溢出
- **数据备份**: 支持数据导出和导入

### 存储键名
- `mbti_users`: 用户数据
- `mbti_sessions`: 测试会话
- `mbti_answers`: 答题记录
- `mbti_payments`: 支付订单
- `mbti_behaviors`: 用户行为日志
- `mbti_shares`: 分享记录
- `mbti_sync_queue`: 同步队列

### 数据清理策略
- **行为日志**: 保留7天内的数据
- **测试会话**: 保留最近10个已完成的会话
- **同步队列**: 清理失败次数超过5次的项目

## 工具函数

### ID生成
```typescript
generateUserId(): string          // 生成用户ID
generateSessionId(): string       // 生成会话ID
```

### 设备信息
```typescript
getDeviceInfo(): string           // 获取设备信息
getBrowserInfo(): string          // 获取浏览器信息
```

### 数据管理
```typescript
backupData(): string              // 导出数据备份
restoreData(backupData: string): boolean  // 恢复数据
clearAllData(): void              // 清理所有数据
```

## 错误处理

### 错误类型
1. **网络错误**: 自动降级到本地存储
2. **存储错误**: 自动清理旧数据后重试
3. **数据验证错误**: 返回详细错误信息
4. **权限错误**: 记录日志并返回适当响应

### 错误响应格式
```typescript
{
  success: false,
  error: string,
  details?: any,
  timestamp: string
}
```

## 性能监控

### 自动监控
- **存储使用量**: 每分钟检查一次
- **网络状态**: 实时监控连接状态
- **同步队列**: 定期处理待同步数据

### 性能指标
- **响应时间**: API请求响应时间
- **成功率**: 操作成功率统计
- **存储效率**: 本地存储使用效率

## 安全考虑

### 数据保护
- **敏感信息**: 不在本地存储敏感信息
- **数据加密**: 传输过程中使用HTTPS
- **访问控制**: 基于用户ID的数据隔离

### 隐私保护
- **最小化收集**: 只收集必要的用户数据
- **数据清理**: 定期清理过期数据
- **用户控制**: 提供数据导出和删除功能

## 部署说明

### 环境变量
```bash
PORT=3000                    # 服务端口
DB_HOST=localhost            # 数据库主机
DB_USER=mbti_user           # 数据库用户
DB_PASSWORD=your_password    # 数据库密码
DB_NAME=mbti_test           # 数据库名称
```

### 启动命令
```bash
# 开发环境
npm run dev

# 生产环境
npm run build
npm start
```

## 更新日志

### v1.0.0 (2024-01-XX)
- ✅ 完成基础数据服务架构
- ✅ 实现混合数据访问模式
- ✅ 添加离线支持和自动同步
- ✅ 集成Express后端API
- ✅ 完善错误处理和性能监控
- ✅ 添加数据备份和恢复功能

---

*最后更新时间: 2024-01-XX*
*文档版本: v1.0.0*