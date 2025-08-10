<template>
  <div class="min-h-screen bg-gradient-soft">
    <!-- 导航栏 -->
    <header class="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-gray-200">
      <nav class="container py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <button 
              class="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
              @click="goHome"
            >
              <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
              </svg>
            </button>
            <div>
              <h1 class="font-bold text-gray-900">测评结果</h1>
              <p class="text-xs text-gray-500">基于荣格心理学</p>
            </div>
          </div>
          
          
        </div>
      </nav>
    </header>

    <!-- 结果内容区域 -->
    <main class="container py-12">
      <div class="max-w-4xl mx-auto">

        <!-- 结果展示卡片 -->
        <div class="bg-white rounded-3xl shadow-soft overflow-hidden mb-8">
          <!-- 头部背景 -->
          <div class="bg-gradient-to-r from-primary-500 to-secondary-500 text-white p-8 text-center">
            <div class="w-36 h-36 sm:w-40 sm:h-40 bg-white/15 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-white/30">
              <img :src="characterImage" :alt="`${result.type} 人格图像`" class="w-24 h-24 sm:w-28 sm:h-28 object-contain drop-shadow-xl" @error="onCharacterImgError" />
            </div>
            <h1 class="text-4xl font-bold mb-2">{{ result.name }}</h1>
            <p class="text-2xl text-white/90 mb-4">{{ result.type }}</p>
            <p class="text-lg text-white/80">{{ result.subtitle }}</p>
          </div>


        </div>

        <!-- 详细分析板块预览 -->
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div 
            v-for="section in sections"
            :key="section.id"
            class="bg-white rounded-2xl shadow-soft overflow-hidden relative"
          >
            <!-- 磨玻璃遮罩 -->
            <div class="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center">
              <div class="text-center">
                <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                </div>
                <h4 class="font-semibold text-gray-900 mb-2">{{ section.title }}</h4>
                <p class="text-sm text-gray-600">解锁查看详细内容</p>
              </div>
            </div>
            
            <!-- 内容预览 -->
            <div class="p-6">
              <div class="flex items-center gap-3 mb-4">
                <span class="text-2xl">{{ section.icon }}</span>
                <h3 class="text-xl font-bold text-gray-900">{{ section.title }}</h3>
              </div>
              <p class="text-gray-600 mb-4">{{ section.preview }}</p>
              <div class="space-y-2">
                <div v-for="item in section.highlights" :key="item" class="flex items-center gap-2">
                  <div class="w-2 h-2 bg-primary-500 rounded-full"></div>
                  <span class="text-sm text-gray-700">{{ item }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 付费解锁CTA -->
        <div class="bg-gradient-primary text-white rounded-3xl p-8 text-center">
          <h2 class="text-3xl font-bold mb-4">解锁你的完整性格报告</h2>
          <p class="text-xl text-white/90 mb-2">获得6大板块的深度分析</p>
          <p class="text-white/80 mb-8">基于荣格心理学理论的专业解读</p>
          
          <div class="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
            <div class="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
              <div class="text-2xl font-bold">¥39.9</div>
              <div class="text-sm text-white/80">专业版报告</div>
            </div>
            <div class="text-left">
              <div class="font-semibold mb-1">包含内容：</div>
              <div class="text-sm text-white/90 space-y-1">
                <div>✓ 6大专业分析板块</div>
                <div>✓ 个性化成长建议</div>
                <div>✓ 永久查看权限</div>
              </div>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <button @click="unlock" :disabled="isPaymentLoading" class="bg-white text-primary-600 font-semibold px-8 py-3 rounded-xl hover:bg-gray-50 transition-colors btn-animate btn-shine shine-loop cta-attention disabled:opacity-50 disabled:cursor-not-allowed">
              <span v-if="isPaymentLoading" class="flex items-center justify-center gap-2">
                <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                处理中...
              </span>
              <span v-else>立即解锁 ¥39.9</span>
            </button>
            <button class="border-2 border-white/30 text-white font-semibold px-8 py-3 rounded-xl hover:bg-white/10 transition-colors btn-animate">
              分享给朋友
            </button>
          </div>

          <!-- 支付消息提示 -->
          <div v-if="paymentMessage" class="mt-6 p-3 rounded-lg text-center" :class="paymentMessage.includes('成功') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
            {{ paymentMessage }}
          </div>

        </div>

        <!-- 权威性背书 -->
        <div class="mt-12 text-center">
          <h3 class="text-xl font-bold text-gray-900 mb-6">基于权威心理学理论</h3>
          <div class="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                <span class="text-primary-600 font-bold text-sm">荣</span>
              </div>
              <span class="text-gray-700">荣格心理学</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span class="text-blue-600 font-bold text-sm">70</span>
              </div>
              <span class="text-gray-700">年科学研究</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span class="text-green-600 font-bold text-sm">2亿</span>
              </div>
              <span class="text-gray-700">全球用户</span>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 悬浮解锁按钮（桌面端始终可见） -->
    <div class="hidden md:block fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
      <button
        class="group bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold rounded-full px-6 py-3 sm:px-7 sm:py-4 shadow-2xl hover:shadow-3xl btn-animate btn-shine shine-loop cta-attention"
        aria-label="解锁完整报告"
        @click="unlock"
      >
        <span class="flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
          </svg>
          <span class="hidden sm:inline">解锁完整报告</span>
          <span class="sm:hidden">解锁</span>
          <span class="ml-1 opacity-90 text-white/90">¥39.9</span>
        </span>
      </button>
    </div>

    <!-- 移动端吸顶解锁条（移动端始终可见） -->
    <div class="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-t border-gray-200">
      <div class="container py-3 flex items-center justify-between gap-3">
        <div>
          <div class="text-sm text-gray-700 font-semibold leading-tight">解锁完整报告</div>
          <div class="text-xs text-gray-500 leading-tight">专业版 <span class="font-bold text-primary-600">¥39.9</span> · 含6大板块</div>
        </div>
        <button 
          class="bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold px-5 py-2 rounded-full shadow-xl hover:shadow-2xl btn-animate btn-shine shine-loop cta-attention disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="立即解锁"
          @click="unlock"
          :disabled="isPaymentLoading"
        >
          <span v-if="isPaymentLoading" class="flex items-center justify-center gap-2">
            <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            处理中...
          </span>
          <span v-else>立即解锁</span>
        </button>
      </div>
    </div>

    <!-- 初始付费弹窗 -->
    <div v-if="showPaymentModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div class="bg-white rounded-3xl max-w-md w-full mx-4 overflow-hidden animate-scale-in">
        <!-- 弹窗头部 -->
        <div class="bg-gradient-to-r from-primary-500 to-secondary-500 text-white p-6 text-center relative">
          <button @click="closePaymentModal" class="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
          
          <!-- 权威标识 -->
          <div class="flex items-center justify-center gap-2 mb-3">
            <div class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div class="text-xs text-white/90">
              <div class="font-semibold">权威认证</div>
              <div>心理学专业团队</div>
            </div>
          </div>
          
          <h3 class="text-2xl font-bold mb-1">解锁完整性格报告</h3>
          <p class="text-white/90 text-sm mb-2">🔥 限时特价，仅需一杯咖啡钱</p>
          <p class="text-white/80 text-xs">基于荣格心理学的专业解读</p>
        </div>
        
        <!-- 弹窗内容 -->
        <div class="p-6">
          <!-- 价格展示 -->
          <div class="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl p-4 mb-4">
            <div class="flex items-center justify-center gap-2 mb-1">
              <span class="text-lg text-gray-400 line-through">¥99</span>
              <span class="text-3xl font-bold text-primary-600">¥39.9</span>
              <span class="bg-red-500 text-white text-xs px-2 py-1 rounded-full">6折</span>
            </div>
            <p class="text-sm text-primary-700 font-semibold text-center">专业版完整报告 · 超值价格</p>
          </div>
          
          <!-- 核心价值点 -->
          <div class="space-y-2 mb-4">
            <div class="flex items-center text-sm text-gray-700 bg-green-50 p-3 rounded-lg">
              <svg class="w-4 h-4 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
              </svg>
              <span class="font-semibold">6大专业维度深度解析</span>
            </div>
            <div class="flex items-center text-sm text-gray-700 bg-blue-50 p-3 rounded-lg">
              <svg class="w-4 h-4 text-blue-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
              </svg>
              <span class="font-semibold">个性化职业发展建议</span>
            </div>
            <div class="flex items-center text-sm text-gray-700 bg-purple-50 p-3 rounded-lg">
              <svg class="w-4 h-4 text-purple-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
              </svg>
              <span class="font-semibold">永久查看权限</span>
            </div>
          </div>
          
          <!-- 社会证明 -->
          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <div class="flex items-center justify-center gap-1 mb-1">
              <svg class="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
              </svg>
              <span class="text-sm font-bold text-yellow-700">4.9分好评</span>
            </div>
            <p class="text-xs text-yellow-700 text-center">已有18,642人获得专业报告</p>
          </div>
          
          <!-- 紧迫感提示 -->
          <div class="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <div class="flex items-center justify-center gap-1 mb-1">
              <svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span class="text-sm font-bold text-red-700 animate-pulse">⚡ 限时优惠还剩：<span class="text-red-800 font-mono">{{ formatTime(countdown) }}</span></span>
            </div>
            <p class="text-xs text-red-600 text-center">此价格今日有效，明日恢复原价¥99</p>
          </div>
          
          <button @click="proceedPayment(39.9)" :disabled="isPaymentLoading" class="w-full bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-bold py-4 px-6 rounded-xl text-lg hover:shadow-lg transition-all disabled:opacity-50 shadow-xl animate-pulse">
            🚀 立即解锁专业报告
          </button>
          
          <!-- 信任背书 -->
          <div class="mt-4 flex items-center justify-center gap-4 text-xs text-gray-500">
            <div class="flex items-center gap-1">
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span>微信安全支付</span>
            </div>
            <div class="flex items-center gap-1">
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span>专业团队认证</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 第一次优惠弹窗 (29.9) -->
    <div v-if="showDiscountModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div class="bg-white rounded-3xl max-w-md w-full mx-4 overflow-hidden animate-scale-in">
        <!-- 弹窗头部 -->
        <div class="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 text-center relative">
          <button @click="closeDiscountModal" class="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
          <div class="w-20 h-20 bg-white/15 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
            </svg>
          </div>
          <h3 class="text-2xl font-bold mb-2">特享优惠</h3>
          <p class="text-white/90">限时新人优惠价</p>
        </div>
        
        <!-- 弹窗内容 -->
        <div class="p-6">
          <div class="text-center mb-6">
            <div class="flex items-center justify-center gap-2 mb-2">
              <span class="text-lg text-gray-400 line-through">¥39.9</span>
              <span class="text-3xl font-bold text-orange-600">¥29.9</span>
            </div>
            <div class="text-orange-600 font-semibold">新人专享优惠券</div>
            <div class="text-sm text-gray-600">节省 ¥10</div>
          </div>
          
          <div class="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
            <div class="flex items-center gap-2 mb-2">
              <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span class="font-semibold text-orange-800">限时优惠</span>
            </div>
            <p class="text-sm text-orange-700">此优惠仅限新用户，错过不再有！</p>
          </div>
          
          <button @click="proceedPayment(29.9)" :disabled="isPaymentLoading" class="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold py-4 px-6 rounded-xl text-lg hover:shadow-lg transition-all disabled:opacity-50 shadow-xl">
            立即领取优惠
          </button>
        </div>
      </div>
    </div>

    <!-- 最终优惠弹窗 (19.9) -->
    <div v-if="showFinalDiscountModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div class="bg-white rounded-3xl max-w-md w-full mx-4 overflow-hidden animate-scale-in">
        <!-- 弹窗头部 -->
        <div class="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-6 text-center relative">
          <button @click="closeFinalDiscountModal" class="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
          <div class="w-20 h-20 bg-white/15 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
            </svg>
          </div>
          <h3 class="text-2xl font-bold mb-2">最终优惠</h3>
          <p class="text-white/90">错过今天就没有了！</p>
        </div>
        
        <!-- 弹窗内容 -->
        <div class="p-6">
          <div class="text-center mb-6">
            <div class="flex items-center justify-center gap-2 mb-2">
              <span class="text-lg text-gray-400 line-through">¥39.9</span>
              <span class="text-4xl font-bold text-pink-600">¥19.9</span>
            </div>
            <div class="text-pink-600 font-bold text-lg">超级VIP专享价</div>
            <div class="text-sm text-gray-600">节省 ¥20，史上最低价</div>
          </div>
          
          <!-- 增值权益展示 -->
          <div class="space-y-3 mb-6">
            <div class="bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-xl p-4">
              <div class="flex items-center gap-2 mb-2">
                <svg class="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span class="font-bold text-pink-800">专业心理学报告</span>
              </div>
              <p class="text-sm text-pink-700">基于荣格理论的6大维度深度分析</p>
            </div>
            
            <div class="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-4">
              <div class="flex items-center gap-2 mb-2">
                <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                </svg>
                <span class="font-bold text-purple-800">个人成长指南</span>
              </div>
              <p class="text-sm text-purple-700">定制化职业发展与关系建议</p>
            </div>
            

          </div>
          
          <!-- 紧迫感提示 -->
          <div class="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div class="flex items-center gap-2 mb-2">
              <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span class="font-bold text-red-800 animate-pulse">⚡ 限时优惠还剩：<span class="text-red-900 font-mono text-lg">{{ formatTime(finalCountdown) }}</span></span>
            </div>
            <p class="text-sm text-red-700">此价格仅限今日，明天恢复原价¥99.9</p>
            <p class="text-xs text-red-600 mt-1">已有2847人抢购成功</p>
          </div>
          
          <button @click="proceedPayment(19.9)" :disabled="isPaymentLoading" class="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold py-4 px-6 rounded-xl text-lg hover:shadow-lg transition-all disabled:opacity-50 shadow-xl animate-pulse">
            立即抢购 ¥19.9 (限时)
          </button>
          
          <!-- 信任背书 -->
          <div class="mt-4 text-center">
            <div class="flex items-center justify-center gap-4 text-xs text-gray-500">
              <div class="flex items-center gap-1">
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>安全支付</span>
              </div>
              <div class="flex items-center gap-1">
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>终身有效</span>
              </div>
              <div class="flex items-center gap-1">
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>专业权威</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAssessmentStore } from '@/stores/assessment'
import { useEnhancedAssessmentStore } from '@/stores/enhancedAssessment'
import { typeProfiles } from '@/data/profiles'
import { handlePayment, isWechatBrowser } from '@/utils/payment'
import { dataService } from '@/services/dataService'

const router = useRouter()

const store = useAssessmentStore()
const assessmentStore = useEnhancedAssessmentStore()

const mbtiType = computed(() => store.mbtiType)
const profile = computed(() => typeProfiles[mbtiType.value] || typeProfiles['ENFP'])

const result = computed(() => ({
  type: profile.value.type,
  name: profile.value.name,
  subtitle: profile.value.subtitle,
  description: profile.value.personality.analysis,
  coreStrengths: profile.value.career.strengths,
  traits: profile.value.personality.traits
}))

const sections = computed(() => [
  {
    id: 'jung',
    title: '荣格八维分析',
    icon: '🔧',
    preview: '深度解析你的认知功能堆栈',
    highlights: ['主导功能优势分析', '辅助功能发展建议', '盲点功能改善方案']
  },
  {
    id: 'shadow',
    title: '隐藏人格',
    icon: '🌑',
    preview: '探索压力下的影子面表现',
    highlights: ['影子人格触发条件', '压力状态识别信号', '恢复策略与应对方法']
  },
  {
    id: 'personality',
    title: '人格特征分析',
    icon: '🧠',
    preview: '全面解读你的核心特质',
    highlights: ['性格优势与天赋', '典型行为模式', '个性化成长建议']
  },
  {
    id: 'career',
    title: '职业发展建议',
    icon: '💼',
    preview: '匹配你性格的职业路径',
    highlights: ['适合的工作环境', '职业发展方向', '团队协作优势']
  },
  {
    id: 'relationship',
    title: '恋爱关系分析',
    icon: '💕',
    preview: '了解你在亲密关系中的表现',
    highlights: ['恋爱风格特点', '关系中的优势', '需要注意的盲点']
  }
])

const goHome = () => {
  router.push('/')
}

// 人格图像：根据类型映射到 /images/characters/{type}.png
const characterImage = computed(() => `/images/characters/${result.value.type.toLowerCase()}.png`)
const onCharacterImgError = (e: Event) => {
  const target = e.target as HTMLImageElement
  target.src = '/images/avatar-placeholder.svg'
}

// 支付状态
const isPaymentLoading = ref(false)
const paymentMessage = ref('')

// 弹窗状态管理
const showPaymentModal = ref(false)
const showDiscountModal = ref(false)
const showFinalDiscountModal = ref(false)
const currentPrice = ref(39.9)
const modalStep = ref(0) // 0: 初始, 1: 第一次优惠, 2: 最终优惠

// 倒计时功能
const countdown = ref(300000) // 5分钟倒计时（毫秒）
const finalCountdown = ref(300000) // 最终弹窗5分钟倒计时（毫秒）
let countdownTimer: NodeJS.Timeout | null = null
let finalCountdownTimer: NodeJS.Timeout | null = null

// 解锁按钮点击
const unlock = () => {
  showPaymentModal.value = true
  modalStep.value = 0
  currentPrice.value = 39.9
}

// 关闭初始付费弹窗
const closePaymentModal = () => {
  showPaymentModal.value = false
  // 第一次关闭，显示29.9优惠弹窗
  if (modalStep.value === 0) {
    setTimeout(() => {
      showDiscountModal.value = true
      currentPrice.value = 29.9
      modalStep.value = 1
    }, 300)
  }
}

// 关闭第一次优惠弹窗
const closeDiscountModal = () => {
  showDiscountModal.value = false
  // 第二次关闭，显示19.9最终优惠弹窗
  if (modalStep.value === 1) {
    setTimeout(() => {
      showFinalDiscountModal.value = true
      currentPrice.value = 19.9
      modalStep.value = 2
    }, 300)
  }
}

// 关闭最终优惠弹窗
const closeFinalDiscountModal = () => {
  showFinalDiscountModal.value = false
  // 用户最终选择不付费，正常显示结果页
}

// 执行支付
const proceedPayment = async (price: number) => {
  if (isPaymentLoading.value) return
  
  // 检查微信环境
  if (!isWechatBrowser()) {
    paymentMessage.value = '请在微信中打开此页面进行支付'
    setTimeout(() => paymentMessage.value = '', 3000)
    return
  }
  
  isPaymentLoading.value = true
  paymentMessage.value = '正在创建订单...'
  
  // 关闭所有弹窗
  showPaymentModal.value = false
  showDiscountModal.value = false
  showFinalDiscountModal.value = false
  
  try {
    // 创建支付订单数据（模拟数据）
    const orderData = {
      user_id: assessmentStore.userId || 'user_' + Date.now(),
      session_id: assessmentStore.sessionId,
      product_type: 'premium_report' as const,
      amount: price,
      currency: 'CNY',
      status: 'pending' as const,
      payment_method: 'wechat'
    }
    
    // 保存订单到数据服务
    const order = await dataService.createPaymentOrder(orderData)
    console.log('订单创建成功:', order)
    
    // 记录用户行为
    await dataService.logUserBehavior({
      user_id: assessmentStore.userId || 'user_' + Date.now(),
      session_id: assessmentStore.sessionId,
      action: 'payment_initiated',
      page: 'result',
      details: { price, product: 'MBTI性格测试完整报告', orderId: order.id }
    })
    
    const result = await handlePayment(price, 'MBTI性格测试完整报告')
    
    if (result.success) {
      // 更新订单状态为已支付
      await dataService.updatePaymentOrder(order.id, {
        status: 'paid',
        payment_id: 'mock_payment_' + Date.now()
      })
      
      // 记录支付成功行为
      await dataService.logUserBehavior({
        user_id: assessmentStore.userId || 'user_' + Date.now(),
        session_id: assessmentStore.sessionId,
        action: 'payment_success',
        page: 'result',
        details: { orderId: order.id, amount: price }
      })
      
      // 设置付费状态
      assessmentStore.setPaid(true)
      
      paymentMessage.value = '支付成功！正在跳转...'
      // 支付成功后跳转到报告页
      setTimeout(() => {
        router.push('/report')
      }, 1500)
    } else {
      // 更新订单状态为失败
      await dataService.updatePaymentOrder(order.id, {
        status: 'failed'
      })
      
      // 记录支付失败行为
      await dataService.logUserBehavior({
        user_id: assessmentStore.userId || 'user_' + Date.now(),
        session_id: assessmentStore.sessionId,
        action: 'payment_failed',
        page: 'result',
        details: { orderId: order.id, error: result.message }
      })
      
      paymentMessage.value = result.message
      setTimeout(() => paymentMessage.value = '', 3000)
    }
  } catch (error) {
    console.error('支付失败:', error)
    
    // 记录支付错误行为
    await dataService.logUserBehavior({
      user_id: assessmentStore.userId || 'user_' + Date.now(),
      session_id: assessmentStore.sessionId,
      action: 'payment_error',
      page: 'result',
      details: { error: error.message }
    })
    
    paymentMessage.value = '支付失败，请重试'
    setTimeout(() => paymentMessage.value = '', 3000)
  } finally {
    isPaymentLoading.value = false
  }
}

// 启动倒计时
const startCountdown = () => {
  countdownTimer = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value -= 10 // 每10毫秒减少
    } else {
      if (countdownTimer) clearInterval(countdownTimer)
    }
  }, 10)
}

const startFinalCountdown = () => {
  finalCountdownTimer = setInterval(() => {
    if (finalCountdown.value > 0) {
      finalCountdown.value -= 10 // 每10毫秒减少
    } else {
      if (finalCountdownTimer) clearInterval(finalCountdownTimer)
    }
  }, 10)
}

// 格式化时间显示（毫秒级别）
const formatTime = (milliseconds: number) => {
  const totalSeconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  const ms = Math.floor((milliseconds % 1000) / 10) // 显示两位毫秒
  return `${minutes}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`
}

// 组件挂载时启动倒计时
startCountdown()
startFinalCountdown()

</script>