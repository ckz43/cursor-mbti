// 微信支付相关工具函数

interface WechatPayConfig {
  appId: string
  timeStamp: string
  nonceStr: string
  package: string
  signType: string
  paySign: string
}

interface PaymentResult {
  success: boolean
  message: string
  orderId?: string
}

// 检查微信环境
export const isWechatBrowser = (): boolean => {
  // 开发环境下跳过微信环境检查
  if (import.meta.env.DEV) {
    return true
  }
  
  const ua = navigator.userAgent.toLowerCase()
  return ua.includes('micromessenger')
}

// 调用微信支付
export const invokeWechatPay = (config: WechatPayConfig): Promise<PaymentResult> => {
  return new Promise((resolve) => {
    // 开发环境模拟支付成功
    if (import.meta.env.DEV) {
      setTimeout(() => {
        resolve({
          success: true,
          message: '支付成功（开发环境模拟）'
        })
      }, 2000)
      return
    }
    
    if (!isWechatBrowser()) {
      resolve({
        success: false,
        message: '请在微信中打开此页面进行支付'
      })
      return
    }

    // 检查微信JS-SDK是否已加载
    if (typeof window.WeixinJSBridge === 'undefined') {
      resolve({
        success: false,
        message: '微信支付环境未就绪，请稍后重试'
      })
      return
    }

    window.WeixinJSBridge.invoke('getBrandWCPayRequest', {
      appId: config.appId,
      timeStamp: config.timeStamp,
      nonceStr: config.nonceStr,
      package: config.package,
      signType: config.signType,
      paySign: config.paySign
    }, (res: any) => {
      if (res.err_msg === 'get_brand_wcpay_request:ok') {
        resolve({
          success: true,
          message: '支付成功'
        })
      } else if (res.err_msg === 'get_brand_wcpay_request:cancel') {
        resolve({
          success: false,
          message: '用户取消支付'
        })
      } else {
        resolve({
          success: false,
          message: '支付失败，请重试'
        })
      }
    })
  })
}

// 创建支付订单
export const createPaymentOrder = async (amount: number, productName: string): Promise<WechatPayConfig | null> => {
  try {
    // 开发环境使用模拟数据
    if (import.meta.env.DEV) {
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      return {
        appId: 'wx1234567890abcdef',
        timeStamp: Math.floor(Date.now() / 1000).toString(),
        nonceStr: Math.random().toString(36).substring(2, 15),
        package: `prepay_id=wx${Date.now()}`,
        signType: 'MD5',
        paySign: 'A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6'
      }
    }
    
    // 生产环境调用真实API
    const response = await fetch('/api/payment/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: amount * 100, // 转换为分
        productName,
        productType: 'mbti_report'
      })
    })

    if (!response.ok) {
      throw new Error('创建订单失败')
    }

    const data = await response.json()
    return data.paymentConfig
  } catch (error) {
    console.error('创建支付订单失败:', error)
    return null
  }
}

// 处理支付流程
export const handlePayment = async (amount: number, productName: string): Promise<PaymentResult> => {
  try {
    // 创建订单
    const paymentConfig = await createPaymentOrder(amount, productName)
    if (!paymentConfig) {
      return {
        success: false,
        message: '创建订单失败，请重试'
      }
    }

    // 调用微信支付
    const result = await invokeWechatPay(paymentConfig)
    return result
  } catch (error) {
    console.error('支付处理失败:', error)
    return {
      success: false,
      message: '支付处理失败，请重试'
    }
  }
}

// 声明全局微信对象类型
declare global {
  interface Window {
    WeixinJSBridge: any
  }
}