// 数据完整性工具函数
// 用于补全测试阶段的虚拟数据，确保数据库字段完整性

import mockConfig from '../../mock-data-config.json'

// 用户代理解析结果接口
interface UserAgentInfo {
  deviceType: string
  browserName: string
  browserVersion: string
  osName: string
}

// 支付订单虚拟数据生成器
export class PaymentOrderDataGenerator {
  /**
   * 生成完整的支付订单数据
   * @param params 订单参数
   * @returns 补全后的订单数据
   */
  generatePaymentOrder(params: {
    userId: string
    sessionId: string
    productType: string
    productName: string
    originalAmount: number
    finalAmount: number
    paymentMethod: string
  }) {
    const baseData = {
      order_id: 'order_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15),
      user_id: params.userId,
      session_id: params.sessionId,
      product_type: params.productType,
      product_name: params.productName,
      original_amount: params.originalAmount,
      final_amount: params.finalAmount,
      currency: 'CNY',
      payment_method: params.paymentMethod,
      payment_status: 0, // 0:待支付
      ip_address: '127.0.0.1',
      user_agent: navigator.userAgent
    }
    
    return this.generateCompleteOrderData(baseData)
  }
  
  /**
   * 生成完整的支付订单数据（内部方法）
   * @param baseData 基础订单数据
   * @returns 补全后的订单数据
   */
  private generateCompleteOrderData(baseData: any) {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    
    // 计算优惠金额
    const discountAmount = (baseData.original_amount || 0) - (baseData.final_amount || 0)
    
    // 生成优惠券代码（虚拟数据）
    const couponCode = discountAmount > 0 
      ? `TEST_${baseData.final_amount}_${timestamp}` 
      : null
    
    // 根据价格映射促销活动ID（虚拟数据）
    const promotionMapping = mockConfig.mockFields.paymentOrders.fields.promotion_id.mapping
    const promotionId = promotionMapping[baseData.final_amount as keyof typeof promotionMapping] || null
    
    // 生成备注（测试环境标识）
    const remark = mockConfig.mockFields.paymentOrders.fields.remark.value
    
    return {
      ...baseData,
      discount_amount: discountAmount,
      coupon_code: couponCode,
      promotion_id: promotionId,
      trade_no: null, // 支付成功后更新
      prepay_id: null, // 调用支付接口时更新
      remark: remark,
      // 添加虚拟数据标识
      _mockFields: {
        discount_amount: discountAmount > 0,
        coupon_code: !!couponCode,
        promotion_id: !!promotionId,
        remark: true
      }
    }
  }
  
  /**
   * 生成支付成功后的更新数据
   * @param orderId 订单ID
   * @returns 支付成功更新数据
   */
  static generatePaymentSuccessData(orderId: string) {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    
    return {
      payment_status: 1,
      trade_no: `MOCK_TRADE_${timestamp}_${random}`,
      prepay_id: `MOCK_PREPAY_${timestamp}_${random}`,
      payment_time: new Date().toISOString()
    }
  }
}

// 用户行为日志数据生成器
export class UserBehaviorDataGenerator {
  /**
   * 生成完整的用户行为数据
   * @param params 行为参数
   * @returns 补全后的行为数据
   */
  generateUserBehavior(params: {
    userId: string
    sessionId: string
    action: string
    page: string
    details: any
    environment?: any
  }) {
    const baseData = {
      user_id: params.userId,
      session_id: params.sessionId,
      action: params.action,
      page: params.page,
      details: params.details
    }
    
    return this.generateCompleteLogData(baseData)
  }
  
  /**
   * 解析用户代理字符串
   * @param userAgent 用户代理字符串
   * @returns 解析结果
   */
  private parseUserAgent(userAgent: string): UserAgentInfo {
    const ua = userAgent.toLowerCase()
    
    // 设备类型检测
    let deviceType = 'desktop'
    if (/mobile|android|iphone|ipad|phone/i.test(userAgent)) {
      deviceType = /ipad/i.test(userAgent) ? 'tablet' : 'mobile'
    }
    
    // 浏览器检测
    let browserName = 'unknown'
    let browserVersion = 'unknown'
    
    if (ua.includes('chrome')) {
      browserName = 'Chrome'
      const match = ua.match(/chrome\/(\d+\.\d+)/)
      browserVersion = match ? match[1] : 'unknown'
    } else if (ua.includes('firefox')) {
      browserName = 'Firefox'
      const match = ua.match(/firefox\/(\d+\.\d+)/)
      browserVersion = match ? match[1] : 'unknown'
    } else if (ua.includes('safari') && !ua.includes('chrome')) {
      browserName = 'Safari'
      const match = ua.match(/version\/(\d+\.\d+)/)
      browserVersion = match ? match[1] : 'unknown'
    } else if (ua.includes('edge')) {
      browserName = 'Edge'
      const match = ua.match(/edge\/(\d+\.\d+)/)
      browserVersion = match ? match[1] : 'unknown'
    }
    
    // 操作系统检测
    let osName = 'unknown'
    if (ua.includes('windows')) {
      osName = 'Windows'
    } else if (ua.includes('mac')) {
      osName = 'macOS'
    } else if (ua.includes('linux')) {
      osName = 'Linux'
    } else if (ua.includes('android')) {
      osName = 'Android'
    } else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) {
      osName = 'iOS'
    }
    
    return {
      deviceType,
      browserName,
      browserVersion,
      osName
    }
  }
  
  /**
   * 生成完整的用户行为日志数据
   * @param baseData 基础行为数据
   * @returns 补全后的行为数据
   */
  private generateCompleteLogData(baseData: any) {
    const userAgentInfo = this.parseUserAgent(navigator.userAgent)
    
    // 事件类型映射
    const eventTypeMapping = mockConfig.mockFields.userBehaviorLogs.fields.event_type.mapping
    const eventCategoryMapping = mockConfig.mockFields.userBehaviorLogs.fields.event_category.mapping
    
    const eventType = eventTypeMapping[baseData.action as keyof typeof eventTypeMapping] || baseData.action
    const eventCategory = eventCategoryMapping[baseData.action as keyof typeof eventCategoryMapping] || 'general'
    
    return {
      user_id: baseData.user_id,
      session_id: baseData.session_id,
      event_type: eventType,
      event_category: eventCategory,
      event_action: baseData.action,
      event_label: baseData.page || 'unknown',
      page_url: window.location.href,
      page_title: document.title,
      referrer_url: document.referrer || null,
      element_id: null, // 可以后续扩展
      element_class: null, // 可以后续扩展
      element_text: null, // 可以后续扩展
      custom_data: JSON.stringify(baseData.details || {}),
      duration_ms: null, // 可以后续扩展
      scroll_depth: null, // 可以后续扩展
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight,
      device_type: userAgentInfo.deviceType,
      browser_name: userAgentInfo.browserName,
      browser_version: userAgentInfo.browserVersion,
      os_name: userAgentInfo.osName,
      os_version: 'unknown', // 添加缺失的 os_version 字段
      ip_address: '127.0.0.1', // 测试环境默认值
      user_agent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      // 虚拟数据标识
      _mockFields: {
        ip_address: true, // IP地址在测试环境是虚拟的
        os_version: true // OS版本在当前实现中是虚拟的
      }
    }
  }
}

// 数据完整性验证器
export class DataIntegrityValidator {
  /**
   * 验证支付订单数据完整性
   * @param orderData 订单数据
   * @returns 验证结果
   */
  validatePaymentOrder(orderData: any): boolean {
    const requiredFields = [
      'order_id', 'user_id', 'product_name', 'original_amount', 
      'final_amount', 'currency', 'payment_method', 'payment_status'
    ]
    
    const missingFields = requiredFields.filter(field => 
      orderData[field] === undefined || orderData[field] === null
    )
    
    if (missingFields.length > 0) {
      console.warn('支付订单数据缺少必需字段:', missingFields)
      return false
    }
    
    const mockFields = orderData._mockFields || {}
    if (Object.keys(mockFields).length > 0) {
      console.info('支付订单包含虚拟字段:', mockFields)
    }
    
    return true
  }
  
  /**
   * 验证用户行为数据完整性
   * @param behaviorData 行为数据
   * @returns 验证结果
   */
  validateUserBehavior(behaviorData: any): boolean {
    const requiredFields = [
      'user_id', 'session_id', 'event_type', 'event_category', 
      'page_url', 'timestamp'
    ]
    
    const missingFields = requiredFields.filter(field => !behaviorData[field])
    
    if (missingFields.length > 0) {
      console.warn('用户行为数据缺少必需字段:', missingFields)
      return false
    }
    
    const mockFields = behaviorData._mockFields || {}
    if (Object.keys(mockFields).length > 0) {
      console.info('用户行为包含虚拟字段:', mockFields)
    }
    
    return true
  }
  
  /**
   * 验证用户行为日志数据完整性
   * @param logData 日志数据
   * @returns 验证结果
   */
  validateUserBehaviorLog(logData: any): boolean {
    const requiredFields = [
      'user_id', 'event_type', 'event_category', 'event_action'
    ]
    
    const missingFields = requiredFields.filter(field => 
      logData[field] === undefined || logData[field] === null
    )
    
    if (missingFields.length > 0) {
      console.warn('用户行为日志数据缺少必需字段:', missingFields)
      return false
    }
    
    const mockFields = logData._mockFields || {}
    if (Object.keys(mockFields).length > 0) {
      console.info('用户行为日志包含虚拟字段:', mockFields)
    }
    
    return true
  }
}

// 环境标识工具
export class EnvironmentUtils {
  /**
   * 检查是否为测试环境
   */
  static isTestEnvironment(): boolean {
    return import.meta.env.DEV || import.meta.env.MODE === 'development'
  }
  
  /**
   * 获取环境标识
   */
  static getEnvironmentTag(): string {
    return EnvironmentUtils.isTestEnvironment() ? '[TEST]' : '[PROD]'
  }
  
  /**
   * 获取环境信息
   */
  static getEnvironmentInfo(): any {
    return {
      environment: EnvironmentUtils.isTestEnvironment() ? 'test' : 'production',
      timestamp: new Date().toISOString(),
      mode: import.meta.env.MODE,
      dev: import.meta.env.DEV
    }
  }
  
  /**
   * 添加环境标识到数据
   */
  static addEnvironmentTag(data: any): any {
    if (EnvironmentUtils.isTestEnvironment()) {
      return {
        ...data,
        _environment: 'test',
        _timestamp: new Date().toISOString()
      }
    }
    return data
  }
}

// 导出配置信息
export { mockConfig }