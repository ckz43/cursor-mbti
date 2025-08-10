<template>
  <div class="min-h-screen">
    <!-- 导航栏 -->
    <header class="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-sm border-b border-gray-200">
      <nav class="container py-3 sm:py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 sm:gap-3">
            <div class="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-lg sm:text-xl">M</span>
            </div>
            <div>
              <h1 class="font-bold text-gray-900 text-sm sm:text-base">MBTI专业测评</h1>
              <p class="text-xs text-gray-500 hidden sm:block">基于荣格心理学</p>
            </div>
          </div>
          <button 
            class="btn-primary btn-animate btn-shine shine-loop text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3 hover:scale-105 shadow-lg hover:shadow-xl"
            @click="startTest"
          >
            开始测试
          </button>
        </div>
      </nav>
    </header>

    <!-- Hero区域 -->
    <section class="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 pt-20 pb-16">
      <div class="container px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div class="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <!-- 左侧内容 -->
          <div class="lg:col-span-7 text-center lg:text-left space-y-8 lg:space-y-10">
            <!-- 信任标识 - 更精致的设计 -->
            <div class="flex flex-wrap justify-center lg:justify-start gap-3 mb-8">
              <div class="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm text-blue-700 text-sm font-medium px-5 py-3 rounded-full shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300">
                <div class="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg class="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                  </svg>
                </div>
                科学权威理论
              </div>
              <div class="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm text-emerald-700 text-sm font-medium px-5 py-3 rounded-full shadow-lg border border-emerald-100 hover:shadow-xl transition-all duration-300">
                <div class="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center">
                  <svg class="w-3 h-3 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                全球信赖之选
              </div>
            </div>

            <!-- 主标题 - 更强的视觉层次 -->
            <div class="space-y-6">
              <h1 class="text-4xl sm:text-5xl lg:text-7xl font-black leading-[1.95] tracking-tight animate-fade-in-up">
                <span class="block text-gray-900">发现真正的</span>
                <span class="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  自己
                </span>
              </h1>
              <p class="text-xl sm:text-2xl lg:text-3xl font-medium text-gray-600 leading-relaxed animate-fade-in-up" style="animation-delay: 0.2s;">
                解锁人生无限可能
              </p>
            </div>

            <!-- 副标题 - 更清晰的信息层次 -->
            <div class="space-y-4 animate-fade-in-up" style="animation-delay: 0.4s;">
              <p class="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
                基于70年心理学研究的专业MBTI性格测评
              </p>
              <p class="text-base sm:text-lg text-blue-600 font-semibold max-w-xl mx-auto lg:mx-0">
                已帮助全球数百万用户重新认识自己
              </p>
            </div>

            <!-- 主CTA按钮 - 更专业的设计 -->
            <div class="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start items-center animate-fade-in-up" style="animation-delay: 0.6s;">
              <button 
                class="group relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-lg px-10 py-5 rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 w-full sm:w-auto min-w-[280px] btn-animate btn-shine shine-loop cta-attention"
                @click="startTest"
              >
                <span class="relative z-10 flex items-center justify-center gap-3">
                  开始探索真正的自己
                  <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                  </svg>
                </span>
                <div class="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
              </button>
              <div class="flex items-center gap-6 text-sm text-gray-500">
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>只需5分钟</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style="animation-delay: 0.5s;"></div>
                  <span>专业权威</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 右侧统计数据 -->
          <div class="lg:col-span-5 space-y-6 mt-12 lg:mt-0">
            <!-- 成就统计 -->
            <div class="bg-white/60 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20 hover:bg-white/80 transition-all duration-300 hover:scale-105 animate-fade-in-up" style="animation-delay: 0.8s;">
              <h3 class="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 text-center">全球用户信赖</h3>
              <div class="grid grid-cols-2 gap-4 sm:gap-6">
                <div class="text-center hover:scale-110 transition-transform duration-300">
                  <div class="text-2xl sm:text-3xl font-bold text-blue-600 mb-1 sm:mb-2 hover:text-blue-700 transition-colors">500万+</div>
                  <div class="text-xs sm:text-sm text-gray-600">测试用户</div>
                </div>
                <div class="text-center hover:scale-110 transition-transform duration-300">
                  <div class="text-2xl sm:text-3xl font-bold text-purple-600 mb-1 sm:mb-2 hover:text-purple-700 transition-colors">98%</div>
                  <div class="text-xs sm:text-sm text-gray-600">准确率</div>
                </div>
                <div class="text-center hover:scale-110 transition-transform duration-300">
                  <div class="text-2xl sm:text-3xl font-bold text-green-600 mb-1 sm:mb-2 hover:text-green-700 transition-colors">70年</div>
                  <div class="text-xs sm:text-sm text-gray-600">理论发展</div>
                </div>
                <div class="text-center hover:scale-110 transition-transform duration-300">
                  <div class="text-2xl sm:text-3xl font-bold text-orange-600 mb-1 sm:mb-2 hover:text-orange-700 transition-colors">16种</div>
                  <div class="text-xs sm:text-sm text-gray-600">性格类型</div>
                </div>
              </div>
            </div>

            <!-- 特色功能 -->
            <div class="grid grid-cols-2 gap-3 sm:gap-4">
              <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 sm:p-6 border border-blue-200 hover:shadow-lg hover:scale-105 transition-all duration-300 animate-fade-in-up" style="animation-delay: 1s;">
                <div class="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-3 sm:mb-4 hover:rotate-12 transition-transform duration-300">
                  <span class="text-xl sm:text-2xl">🧠</span>
                </div>
                <h4 class="font-bold text-gray-800 mb-1 sm:mb-2 text-sm sm:text-base">科学权威</h4>
                <p class="text-xs sm:text-sm text-gray-600">基于荣格心理学与MBTI理论</p>
              </div>
              <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4 sm:p-6 border border-purple-200 hover:shadow-lg hover:scale-105 transition-all duration-300 animate-fade-in-up" style="animation-delay: 1.1s;">
                <div class="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500 rounded-xl flex items-center justify-center mb-3 sm:mb-4 hover:rotate-12 transition-transform duration-300">
                  <span class="text-xl sm:text-2xl">⚡</span>
                </div>
                <h4 class="font-bold text-gray-800 mb-1 sm:mb-2 text-sm sm:text-base">快速精准</h4>
                <p class="text-xs sm:text-sm text-gray-600">5分钟获得专业性格报告</p>
              </div>
              <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 sm:p-6 border border-green-200 hover:shadow-lg hover:scale-105 transition-all duration-300 animate-fade-in-up" style="animation-delay: 1.2s;">
                <div class="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-xl flex items-center justify-center mb-3 sm:mb-4 hover:rotate-12 transition-transform duration-300">
                  <span class="text-xl sm:text-2xl">🎯</span>
                </div>
                <h4 class="font-bold text-gray-800 mb-1 sm:mb-2 text-sm sm:text-base">个性化指导</h4>
                <p class="text-xs sm:text-sm text-gray-600">针对性的人生发展建议</p>
              </div>
              <div class="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-4 sm:p-6 border border-orange-200 hover:shadow-lg hover:scale-105 transition-all duration-300 animate-fade-in-up" style="animation-delay: 1.3s;">
                <div class="w-10 h-10 sm:w-12 sm:h-12 bg-orange-500 rounded-xl flex items-center justify-center mb-3 sm:mb-4 hover:rotate-12 transition-transform duration-300">
                  <span class="text-xl sm:text-2xl">🌟</span>
                </div>
                <h4 class="font-bold text-gray-800 mb-1 sm:mb-2 text-sm sm:text-base">全面解析</h4>
                <p class="text-xs sm:text-sm text-gray-600">职业、爱情、社交全方位</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 增强背景装饰 -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <!-- 渐变球体 -->
        <div class="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
        <div class="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style="animation-delay: -3s;"></div>
        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-float" style="animation-delay: -6s;"></div>
        
        <!-- 几何装饰 -->
        <div class="absolute top-20 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
        <div class="absolute top-1/3 right-1/4 w-3 h-3 bg-purple-400 rounded-full animate-pulse" style="animation-delay: -1s;"></div>
        <div class="absolute bottom-1/3 left-1/3 w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style="animation-delay: -2s;"></div>
        
        <!-- 网格背景 -->
        <div class="absolute inset-0 pattern-dots opacity-30"></div>
      </div>
    </section>

    <!-- 过渡区域，增加视觉空间 -->
    <section class="h-8 sm:h-12 lg:h-16 bg-gradient-to-b from-cyan-50 to-white"></section>

    <!-- 科学依据展示区域 -->
    <ScientificFoundation />

    <!-- 过渡区域 -->
    <section class="h-8 sm:h-12 bg-gradient-to-b from-white to-gray-50"></section>

    <!-- 发明人介绍区域 -->
    <FoundersSection />

    <!-- 过渡区域 -->
    <section class="h-6 sm:h-8 bg-gradient-to-b from-gray-50 to-white"></section>

    <!-- 用户见证区域 -->
    <section class="py-16 sm:py-20 lg:py-24 bg-white">
      <div class="container">
        <div class="text-center mb-12 sm:mb-16 lg:mb-20">
          <h2 class="section-title animate-fade-in-up">用户真实反馈</h2>
          <p class="section-subtitle animate-fade-in-up" style="animation-delay: 0.2s;">看看他们如何通过MBTI测试改变人生</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
          <div class="card p-6 sm:p-8 text-center hover:shadow-xl hover:scale-105 transition-all duration-300 animate-fade-in-up" style="animation-delay: 0.4s;">
            <div class="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 hover:rotate-12 transition-transform duration-300">
              <img data-v-18355f2a="" src="/images/wechatheader3.jpg"  class="avatar-image">
            </div>
            <blockquote class="text-gray-600 mb-4 leading-relaxed">
              "通过MBTI测试，我终于找到了适合自己的职业方向，现在工作得非常开心！"
            </blockquote>
            <cite class="text-sm font-medium text-primary-600">张小姐 · ENFP</cite>
          </div>

          <div class="card p-6 sm:p-8 text-center hover:shadow-xl hover:scale-105 transition-all duration-300 animate-fade-in-up" style="animation-delay: 0.6s;">
            <div class="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-secondary-100 to-secondary-200 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 hover:rotate-12 transition-transform duration-300">
              <img data-v-18355f2a="" src="/images/wechatheader2.jpg"  class="avatar-image">
            </div>
            <blockquote class="text-gray-600 mb-4 leading-relaxed">
              "测试结果非常准确，帮我理解了自己的性格特点，改善了人际关系。"
            </blockquote>
            <cite class="text-sm font-medium text-secondary-600">李先生 · INTJ</cite>
          </div>

          <div class="card p-6 sm:p-8 text-center hover:shadow-xl hover:scale-105 transition-all duration-300 animate-fade-in-up" style="animation-delay: 0.8s;">
            <div class="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 hover:rotate-12 transition-transform duration-300">
              <img data-v-18355f2a="" src="/images/wechatheader1.jpg"  class="avatar-image">
            </div>
            <blockquote class="text-gray-600 mb-4 leading-relaxed">
              "权威的理论基础让我很信任，详细的分析报告对我的成长很有帮助。"
            </blockquote>
            <cite class="text-sm font-medium text-green-600">王同学 · ISFJ</cite>
          </div>
        </div>
      </div>
    </section>

    <!-- 最终CTA区域 -->
    <section class="py-16 sm:py-20 lg:py-24 bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-500 text-white relative overflow-hidden">
      <!-- 背景装饰 -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full mix-blend-multiply filter blur-3xl animate-float"></div>
        <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full mix-blend-multiply filter blur-3xl animate-float" style="animation-delay: -3s;"></div>
      </div>
      
      <div class="container text-center px-4 relative z-10">
        <h2 class="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 animate-fade-in-up">准备开始你的自我发现之旅了吗？</h2>
        <p class="text-base sm:text-lg lg:text-xl text-white/90 mb-8 sm:mb-12 animate-fade-in-up" style="animation-delay: 0.2s;">只需5分钟，获得专业的性格分析报告</p>
        <button 
          class="group bg-white text-primary-600 font-semibold text-base sm:text-lg px-8 sm:px-10 py-4 sm:py-5 rounded-2xl hover:bg-gray-50 transform hover:-translate-y-2 hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-3xl w-full sm:w-auto animate-fade-in-up animate-glow btn-animate btn-shine shine-loop cta-attention"
          style="animation-delay: 0.4s;"
          @click="startTest"
        >
          <span class="flex items-center justify-center gap-3">
            立即开始测试
            <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
            </svg>
          </span>
        </button>
      </div>
    </section>

    <!-- 找回报告悬浮按钮 -->
    <div class="fixed right-4 sm:right-6 bottom-20 sm:bottom-24 z-50">
      <button 
        @click="showRecoverModal = true"
        class="bg-gray-600 text-white px-3 py-4 rounded-lg shadow-lg flex flex-col items-center gap-1"
        title="找回报告"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        <span class="text-xs font-normal">找回<br>报告</span>
      </button>
    </div>

    <!-- 找回报告弹窗 -->
    <div v-if="showRecoverModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" @click.self="showRecoverModal = false">
      <div class="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100">
        <!-- 弹窗头部 -->
        <div class="relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-3xl">
          <button 
            @click="showRecoverModal = false"
            class="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors duration-200"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
          <div class="text-center">
            <div class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <h2 class="text-2xl font-bold mb-2">找回报告</h2>
            <p class="text-blue-100">输入微信支付交易单号找回您的测试报告</p>
          </div>
        </div>

        <!-- 弹窗内容 -->
        <div class="p-6 space-y-6">
          <!-- 输入框 -->
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">微信支付交易单号</label>
              <input 
                v-model="recoverInput"
                type="text" 
                placeholder="请输入微信支付交易单号"
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
              >
            </div>
            <button 
              @click="handleRecover"
              :disabled="!recoverInput.trim()"
              class="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              找回报告
            </button>
          </div>

          <!-- 找回方法说明 -->
          <div class="bg-gray-50 rounded-2xl p-5">
            <h3 class="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              找回报告的方法：
            </h3>
            <div class="space-y-3 text-sm text-gray-600">
              <div class="flex items-start gap-3">
                <div class="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">1</div>
                <p class="leading-relaxed">在【微信支付】的支付记录中，找到您本次支付的订单，点击进入，显示如下图所示页面。</p>
              </div>
              <div class="flex items-start gap-3">
                <div class="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">2</div>
                <p class="leading-relaxed">复制交易单号，粘贴到上面的输入框中，点击「找回报告」即可获得二维码。</p>
              </div>
            </div>
          </div>


        </div>
      </div>
    </div>

    <!-- 页脚 -->
    <footer class="py-12 bg-gray-900 text-gray-300">
      <div class="container">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          <div>
            <h3 class="font-bold text-white mb-4">关于MBTI</h3>
            <p class="text-sm leading-relaxed">基于荣格心理学理论的专业性格测评工具，帮助您深入了解自己。</p>
          </div>
          <div>
            <h3 class="font-bold text-white mb-4">测试内容</h3>
            <ul class="text-sm space-y-2">
              <li>职业发展指南</li>
              <li>恋爱关系攻略</li>
              <li>人际交往密码</li>
              <li>个人成长路径</li>
            </ul>
          </div>
          <div>
            <h3 class="font-bold text-white mb-4">权威性</h3>
            <ul class="text-sm space-y-2">
              <li>荣格心理学理论</li>
              <li>70年科学研究</li>
              <li>全球2亿用户</li>
              <li>500强企业采用</li>
            </ul>
          </div>
          <div>
            <h3 class="font-bold text-white mb-4">联系我们</h3>
            <p class="text-sm">如有疑问，请联系客服</p>
          </div>
        </div>
        <div class="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>&copy; 2024 MBTI专业测评. 基于荣格心理学理论.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import ScientificFoundation from '@/components/Authority/ScientificFoundation.vue'
import FoundersSection from '@/components/Authority/FoundersSection.vue'

const router = useRouter()

// 找回报告相关状态
const showRecoverModal = ref(false)
const recoverInput = ref('')

const startTest = () => {
  router.push('/test')
}

const handleRecover = () => {
  if (!recoverInput.value.trim()) {
    return
  }
  
  // 这里可以添加实际的找回逻辑
  // 比如调用API根据交易单号查询报告
  console.log('根据交易单号查找报告:', recoverInput.value)
  
  // 模拟查找过程
  alert(`正在根据交易单号为您查找报告，请稍候...\n交易单号：${recoverInput.value}`)
  
  // 清空输入并关闭弹窗
  recoverInput.value = ''
  showRecoverModal.value = false
}
</script>