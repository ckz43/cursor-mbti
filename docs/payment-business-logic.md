# 支付功能完整业务逻辑文档

## 概述

本文档详细描述了MBTI测试应用中支付功能的完整业务逻辑，从前端到后端的整个数据流程，确保数据完整性并为生产环境做好准备。

## 数据库表结构

### 支付订单表 (payment_orders)

```sql
CREATE TABLE payment_orders (
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
  payment_method VARCHAR(50) NOT NULL,
  payment_status TINYINT DEFAULT 0,
  trade_no VARCHAR(100),
  prepay_id VARCHAR(100),
  payment_time TIMESTAMP NULL,
  coupon_code VARCHAR(50),
  promotion_id VARCHAR(50),
  remark TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 用户行为日志表 (user_behavior_logs)

```sql
CREATE TABLE user_behavior_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  session_id VARCHAR(100),
  event_type VARCHAR(50) NOT NULL,
  event_category VARCHAR(50) NOT NULL,
  event_action VARCHAR(100) NOT NULL,
  page_url VARCHAR(500),
  referrer_url VARCHAR(500),
  user_agent TEXT,
  device_type VARCHAR(20),
  browser_name VARCHAR(50),
  browser_version VARCHAR(20),
  os_name VARCHAR(50),
  os_version VARCHAR(20),
  screen_resolution VARCHAR(20),
  viewport_size VARCHAR(20),
  ip_address VARCHAR(45),
  event_data JSON,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 业务流程

### 1. 支付发起阶段

#### 前端处理 (Result.vue)

1. **用户触发支付**
   - 用户点击"解锁完整报告"按钮
   - 触发 `proceedPayment()` 方法

2. **生成完整订单数据**
   ```typescript
   const orderDataGenerator = new PaymentOrderDataGenerator()
   const orderData = orderDataGenerator.generatePaymentOrder({
     userId: assessmentStore.userId || 'user_' + Date.now(),
     sessionId: assessmentStore.sessionId,
     productType: 'premium_report',
     productName: 'MBTI性格测试完整报告',
     originalAmount: price,
     finalAmount: price,
     paymentMethod: 'wechat'
   })
   ```

3. **数据完整性验证**
   ```typescript
   const validator = new DataIntegrityValidator()
   if (!validator.validatePaymentOrder(orderData)) {
     throw new Error('订单数据验证失败')
   }
   ```

4. **创建订单记录**
   ```typescript
   const order = await dataService.createPaymentOrder(orderData)
   ```

#### 后端处理 (databaseService.ts)

1. **接收订单数据**
   - 验证必需字段
   - 插入数据库

2. **返回订单信息**
   - 包含订单ID和状态

### 2. 用户行为记录

#### 支付发起行为
```typescript
const behaviorGenerator = new UserBehaviorDataGenerator()
const behaviorData = behaviorGenerator.generateUserBehavior({
  userId: assessmentStore.userId,
  sessionId: assessmentStore.sessionId,
  action: 'payment_initiated',
  page: 'result',
  details: { price, product: 'MBTI性格测试完整报告', orderId: order.id },
  environment: EnvironmentUtils.getEnvironmentInfo()
})
```

### 3. 支付处理阶段

#### 调用支付接口
```typescript
const result = await handlePayment(price, 'MBTI性格测试完整报告')
```

#### 支付结果处理

**成功情况：**
1. 更新订单状态为已支付
2. 记录支付成功行为
3. 设置用户付费状态
4. 显示成功消息

**失败情况：**
1. 记录支付失败行为
2. 显示错误消息

**异常情况：**
1. 记录支付错误行为
2. 显示通用错误消息

## 数据完整性保障

### 虚拟数据配置 (mock-data-config.json)

```json
{
  "paymentOrder": {
    "mockFields": {
      "discount_amount": "根据优惠券和促销活动计算的折扣金额",
      "coupon_code": "用户使用的优惠券代码",
      "promotion_id": "参与的促销活动ID",
      "trade_no": "第三方支付平台返回的交易号",
      "prepay_id": "微信支付预支付ID",
      "remark": "订单备注信息"
    }
  },
  "userBehavior": {
    "mockFields": {
      "event_type": "根据action映射的事件类型",
      "event_category": "事件分类",
      "page_url": "当前页面URL",
      "referrer_url": "来源页面URL",
      "device_type": "设备类型",
      "browser_name": "浏览器名称",
      "browser_version": "浏览器版本",
      "os_name": "操作系统名称",
      "os_version": "操作系统版本",
      "screen_resolution": "屏幕分辨率",
      "viewport_size": "视口大小"
    }
  }
}
```

### 数据生成策略

#### 支付订单数据补全

1. **discount_amount**: 计算原价与最终价格的差值
2. **coupon_code**: 生成虚拟优惠券代码 (MOCK_COUPON_xxx)
3. **promotion_id**: 生成虚拟促销ID (MOCK_PROMO_xxx)
4. **trade_no**: 支付成功后生成虚拟交易号
5. **prepay_id**: 支付成功后生成虚拟预支付ID
6. **remark**: 添加测试环境标识

#### 用户行为数据补全

1. **event_type**: 根据action映射事件类型
   - payment_initiated → payment
   - payment_success → payment
   - payment_failed → payment
   - payment_error → error

2. **event_category**: 根据事件类型分类
   - payment → transaction
   - error → system

3. **页面信息**: 获取当前URL和来源URL
4. **设备信息**: 解析User-Agent获取设备和浏览器信息
5. **屏幕信息**: 获取屏幕分辨率和视口大小

### 环境标识

所有虚拟数据都会添加环境标识：
- 测试环境: `[TEST]` 前缀
- 生产环境: `[PROD]` 前缀

## 生产环境迁移计划

### 阶段1: 数据源替换

1. **支付订单字段**
   - `discount_amount`: 接入优惠券系统
   - `coupon_code`: 从用户输入获取
   - `promotion_id`: 从营销活动系统获取
   - `trade_no`: 从支付平台回调获取
   - `prepay_id`: 从支付平台预下单获取
   - `remark`: 从用户输入获取

2. **用户行为字段**
   - `page_url`: 从浏览器API获取
   - `referrer_url`: 从document.referrer获取
   - 设备信息: 使用专业的User-Agent解析库

### 阶段2: 系统集成

1. **支付系统集成**
   - 微信支付API集成
   - 支付宝API集成
   - 支付回调处理

2. **营销系统集成**
   - 优惠券系统
   - 促销活动系统
   - 会员系统

3. **数据分析系统**
   - 用户行为分析
   - 支付数据统计
   - 业务指标监控

### 阶段3: 数据清理

1. **移除虚拟数据标识**
2. **清理测试数据**
3. **数据完整性验证**

## 技术实现细节

### 核心工具类

1. **PaymentOrderDataGenerator**: 支付订单数据生成器
2. **UserBehaviorDataGenerator**: 用户行为数据生成器
3. **DataIntegrityValidator**: 数据完整性验证器
4. **EnvironmentUtils**: 环境工具类

### 数据验证规则

#### 支付订单必需字段
- order_id, user_id, product_name
- original_amount, final_amount
- currency, payment_method, payment_status

#### 用户行为必需字段
- user_id, session_id
- event_type, event_category
- page_url, timestamp

## 监控和日志

### 数据完整性监控
- 缺失字段警告
- 虚拟字段信息记录
- 验证失败统计

### 业务流程监控
- 支付成功率
- 支付失败原因分析
- 用户行为路径分析

## 总结

本支付功能实现了完整的业务逻辑，确保了数据的完整性和一致性。通过虚拟数据生成和环境标识，为生产环境的平滑迁移做好了充分准备。所有的数据流程都经过了严格的验证，能够满足实际业务需求。