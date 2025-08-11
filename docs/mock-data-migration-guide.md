# 虚拟数据迁移指南

## 概述

本指南详细说明了当前测试阶段使用的虚拟数据字段，以及如何在生产环境中替换这些字段为真实数据。

## 当前虚拟数据字段

### 支付订单虚拟字段

| 字段名 | 当前虚拟值 | 生产环境数据源 | 优先级 |
|--------|------------|----------------|--------|
| `discount_amount` | 计算值 (原价-最终价) | 优惠券系统 + 促销系统 | 高 |
| `coupon_code` | `MOCK_COUPON_[随机码]` | 用户输入 + 优惠券验证 | 高 |
| `promotion_id` | `MOCK_PROMO_[随机码]` | 营销活动系统 | 中 |
| `trade_no` | `MOCK_TRADE_[时间戳]` | 支付平台回调 | 高 |
| `prepay_id` | `MOCK_PREPAY_[随机码]` | 支付平台预下单 | 高 |
| `remark` | `[TEST] 测试订单备注` | 用户输入 (可选) | 低 |

### 用户行为虚拟字段

| 字段名 | 当前虚拟值 | 生产环境数据源 | 优先级 |
|--------|------------|----------------|--------|
| `event_type` | 基于action映射 | 业务逻辑映射 | 高 |
| `event_category` | 基于event_type分类 | 业务逻辑分类 | 高 |
| `page_url` | `window.location.href` | 浏览器API | 高 |
| `referrer_url` | `document.referrer` | 浏览器API | 中 |
| `device_type` | 简单UA解析 | 专业UA解析库 | 中 |
| `browser_name` | 简单UA解析 | 专业UA解析库 | 中 |
| `browser_version` | 简单UA解析 | 专业UA解析库 | 低 |
| `os_name` | 简单UA解析 | 专业UA解析库 | 中 |
| `os_version` | 简单UA解析 | 专业UA解析库 | 低 |
| `screen_resolution` | `screen.width x screen.height` | 浏览器API | 低 |
| `viewport_size` | `window.innerWidth x window.innerHeight` | 浏览器API | 低 |

## 迁移步骤

### 第一阶段：高优先级字段替换

#### 1. 支付相关字段

**trade_no 和 prepay_id**
```typescript
// 当前虚拟实现
const mockTradeNo = `MOCK_TRADE_${timestamp}`
const mockPrepayId = `MOCK_PREPAY_${random}`

// 生产环境实现
const paymentResult = await wechatPayAPI.createOrder(orderData)
const tradeNo = paymentResult.trade_no
const prepayId = paymentResult.prepay_id
```

**coupon_code**
```typescript
// 当前虚拟实现
const mockCouponCode = `MOCK_COUPON_${random}`

// 生产环境实现
const couponCode = userInput.couponCode
const couponValidation = await couponService.validate(couponCode)
if (!couponValidation.isValid) {
  throw new Error('优惠券无效')
}
```

**discount_amount**
```typescript
// 当前虚拟实现
const discountAmount = originalAmount - finalAmount

// 生产环境实现
const discountAmount = await calculateDiscount({
  originalAmount,
  couponCode,
  promotionId,
  userId
})
```

#### 2. 页面信息字段

**page_url 和 referrer_url**
```typescript
// 当前实现已经是真实数据
const pageUrl = window.location.href
const referrerUrl = document.referrer

// 生产环境可能需要添加参数清理
const cleanPageUrl = removeTrackingParams(window.location.href)
```

### 第二阶段：中优先级字段优化

#### 1. 设备信息优化

**使用专业UA解析库**
```bash
npm install ua-parser-js
```

```typescript
import { UAParser } from 'ua-parser-js'

// 替换简单的UA解析
const parser = new UAParser()
const result = parser.getResult()

const deviceInfo = {
  device_type: result.device.type || 'desktop',
  browser_name: result.browser.name,
  browser_version: result.browser.version,
  os_name: result.os.name,
  os_version: result.os.version
}
```

#### 2. 营销系统集成

**promotion_id**
```typescript
// 当前虚拟实现
const mockPromotionId = `MOCK_PROMO_${random}`

// 生产环境实现
const activePromotions = await promotionService.getActivePromotions(userId)
const applicablePromotion = findBestPromotion(activePromotions, orderData)
const promotionId = applicablePromotion?.id
```

### 第三阶段：低优先级字段完善

#### 1. 用户体验优化

**remark 字段**
```typescript
// 当前虚拟实现
const mockRemark = '[TEST] 测试订单备注'

// 生产环境实现
const remark = userInput.remark || '' // 用户可选输入
```

#### 2. 版本信息精确化

**browser_version 和 os_version**
- 使用更精确的版本检测
- 添加版本兼容性检查
- 记录关键版本信息用于问题排查

## 系统集成要求

### 支付系统集成

1. **微信支付**
   - 商户号配置
   - API密钥管理
   - 回调URL设置
   - 证书文件配置

2. **支付宝**
   - 应用ID配置
   - 私钥/公钥配置
   - 回调URL设置

### 营销系统集成

1. **优惠券系统**
   - 优惠券验证API
   - 使用记录API
   - 优惠计算逻辑

2. **促销活动系统**
   - 活动规则引擎
   - 用户资格验证
   - 促销效果统计

### 数据分析系统

1. **用户行为分析**
   - 事件追踪配置
   - 漏斗分析设置
   - 用户画像构建

2. **业务指标监控**
   - 支付成功率监控
   - 转化率分析
   - 收入统计

## 数据清理计划

### 测试数据识别

所有虚拟数据都包含以下标识：
- `MOCK_` 前缀
- `[TEST]` 标签
- 特定的生成模式

### 清理脚本

```sql
-- 清理测试支付订单
DELETE FROM payment_orders 
WHERE coupon_code LIKE 'MOCK_%' 
   OR promotion_id LIKE 'MOCK_%' 
   OR trade_no LIKE 'MOCK_%'
   OR remark LIKE '[TEST]%';

-- 清理测试用户行为
DELETE FROM user_behavior_logs 
WHERE event_data LIKE '%MOCK_%' 
   OR event_data LIKE '%[TEST]%';
```

### 数据验证

```sql
-- 验证生产数据完整性
SELECT 
  COUNT(*) as total_orders,
  COUNT(CASE WHEN trade_no NOT LIKE 'MOCK_%' THEN 1 END) as real_trade_orders,
  COUNT(CASE WHEN coupon_code NOT LIKE 'MOCK_%' THEN 1 END) as real_coupon_orders
FROM payment_orders
WHERE created_at >= '2024-01-01';
```

## 监控和告警

### 虚拟数据监控

```typescript
// 生产环境虚拟数据告警
if (process.env.NODE_ENV === 'production') {
  const hasMockData = orderData.trade_no?.includes('MOCK_')
  if (hasMockData) {
    logger.error('生产环境检测到虚拟数据', { orderData })
    // 发送告警通知
  }
}
```

### 数据质量监控

```typescript
// 数据完整性监控
const dataQualityMetrics = {
  missingTradeNo: orders.filter(o => !o.trade_no).length,
  mockDataCount: orders.filter(o => o.trade_no?.includes('MOCK_')).length,
  validOrdersCount: orders.filter(o => o.trade_no && !o.trade_no.includes('MOCK_')).length
}
```

## 回滚计划

如果生产环境出现问题，可以临时启用虚拟数据模式：

```typescript
// 紧急回滚配置
const EMERGENCY_MOCK_MODE = process.env.EMERGENCY_MOCK_MODE === 'true'

if (EMERGENCY_MOCK_MODE) {
  logger.warn('启用紧急虚拟数据模式')
  // 使用虚拟数据生成器
}
```

## 总结

本迁移指南提供了从测试环境虚拟数据到生产环境真实数据的完整迁移路径。通过分阶段实施，可以确保系统的稳定性和数据的完整性。建议在每个阶段完成后进行充分的测试和验证。