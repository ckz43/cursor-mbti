<template>
  <section class="py-24 sm:py-28 lg:py-32 bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30 relative overflow-hidden" ref="foundationRef">
    <!-- 背景装饰元素 -->
    <div class="absolute inset-0 opacity-[0.02]">
      <div class="absolute top-20 left-10 w-72 h-72 bg-primary-400 rounded-full mix-blend-multiply filter blur-xl animate-float"></div>
      <div class="absolute top-40 right-10 w-72 h-72 bg-secondary-400 rounded-full mix-blend-multiply filter blur-xl animate-float" style="animation-delay: 2s;"></div>
      <div class="absolute bottom-20 left-1/2 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl animate-float" style="animation-delay: 4s;"></div>
    </div>
    <div class="container">
      <!-- 理论基础标题 - 专业优化版 -->
      <div class="text-center mb-20 sm:mb-24 lg:mb-28">
        <!-- 权威认证标签 - 更专业的设计 -->
        <div class="inline-flex items-center gap-3 bg-white/98 backdrop-blur-md text-primary-700 px-10 py-5 rounded-full text-sm font-semibold mb-16 shadow-xl border border-primary-100/60 hover:shadow-2xl hover:bg-white transition-all duration-500 hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 relative overflow-hidden" role="banner" aria-label="科学权威认证标识">
          <!-- 背景光晕效果 -->
          <div class="absolute inset-0 bg-gradient-to-r from-primary-50/50 to-secondary-50/50 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
          <div class="relative z-10 flex items-center gap-3">
            <div class="w-7 h-7 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center shadow-md" aria-hidden="true">
              <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <span class="tracking-[0.05em] font-medium">科学权威认证</span>
          </div>
          </div>
        </div>
        
        <!-- 主标题 - 优化可读性和专业感 -->
        <h2 class="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-12 leading-[1.15] tracking-[-0.01em] max-w-5xl mx-auto">
          基于<span class="relative inline-block mx-3">
            <span class="bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-600 bg-clip-text text-transparent font-extrabold">百年</span>
            <span class="absolute -bottom-2 left-0 right-0 h-1.5 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full opacity-50 animate-pulse"></span>
          </span>心理学研究
          <div class="mt-6 text-base font-medium text-gray-500 tracking-[0.08em] uppercase">Scientific Foundation</div>
        </h2>
        
        <!-- 副标题 - 优化信息层次和可读性 -->
        <div class="max-w-5xl mx-auto space-y-10">
          <p class="text-xl sm:text-2xl lg:text-3xl text-gray-800 leading-[1.4] font-medium">
            MBTI源于著名心理学家
            <span class="relative inline-block font-bold text-gray-900 bg-gradient-to-r from-amber-50/95 to-yellow-50/95 px-5 py-3 rounded-2xl border border-amber-200/60 mx-3 hover:shadow-xl hover:bg-amber-50/80 transition-all duration-300 hover:scale-[1.02] cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2" tabindex="0" role="button" aria-label="了解更多关于卡尔·荣格的信息，按回车键或点击查看详情">
              卡尔·荣格
              <span class="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full animate-pulse shadow-md" aria-hidden="true"></span>
            </span>
            的心理类型理论
          </p>
          <p class="text-lg sm:text-xl lg:text-2xl text-gray-700 leading-[1.5] font-medium max-w-4xl mx-auto">
            经过
            <span class="relative inline-block font-bold text-primary-700 bg-gradient-to-r from-primary-50/95 to-blue-50/95 px-5 py-3 rounded-2xl border border-primary-200/60 mx-3 hover:shadow-xl hover:bg-primary-50/80 transition-all duration-300 hover:scale-[1.02] cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2" tabindex="0" role="button" aria-label="了解更多关于70年科学研究发展历程，按回车键或点击查看详情">
              70年科学研究发展
              <span class="absolute -top-1 -right-1 w-3 h-3 bg-primary-500 rounded-full animate-pulse shadow-md" style="animation-delay: 0.5s;" aria-hidden="true"></span>
            </span>
            ，已成为全球最权威的性格测评工具
          </p>
          <!-- 添加辅助说明文字 -->
          <div class="bg-gradient-to-r from-slate-50/80 to-blue-50/60 rounded-3xl p-8 border border-slate-200/50">
            <p class="text-lg text-gray-700 leading-[1.7] max-w-3xl mx-auto font-medium">
              全球数千万人通过MBTI深入了解自己的性格特征，在职业发展、人际关系和个人成长方面获得科学指导
            </p>
            <div class="flex justify-center mt-6">
              <div class="flex items-center gap-2 text-sm text-gray-500">
                <div class="w-2 h-2 bg-primary-400 rounded-full animate-pulse"></div>
                <span>基于百年心理学研究</span>
                <div class="w-2 h-2 bg-secondary-400 rounded-full animate-pulse" style="animation-delay: 0.5s;"></div>
                <span>全球权威认证</span>
                <div class="w-2 h-2 bg-primary-400 rounded-full animate-pulse" style="animation-delay: 1s;"></div>
                <span>科学可信</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 权威数据展示 - 优化专业感和可读性 -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 mb-28 sm:mb-32">
        <div 
          v-for="(stat, index) in authorityStats" 
          :key="stat.id"
          class="group text-center p-10 sm:p-12 bg-white rounded-3xl shadow-professional hover:shadow-professional-hover hover:scale-[1.03] transition-all duration-500 border border-gray-100/60 hover:border-primary-200/80 backdrop-blur-sm relative overflow-hidden"
          :class="{ 'animate-fade-in-up': isVisible }"
          :style="{ animationDelay: `${index * 0.15}s` }"
        >
          <!-- 背景装饰 -->
          <div class="absolute inset-0 bg-gradient-to-br from-primary-50/30 to-secondary-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <!-- 顶部装饰线 -->
          <div class="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full opacity-60 group-hover:opacity-100 group-hover:w-20 transition-all duration-500"></div>
          
          <div class="relative z-10 pt-6">
            <div class="relative mb-8">
              <div class="text-4xl sm:text-5xl lg:text-6xl font-black text-primary-600 mb-4 group-hover:scale-105 transition-transform duration-500 tracking-tight leading-none">
                <CountUp 
                  :end="stat.number" 
                  :suffix="stat.suffix"
                  :duration="3.2"
                  :start-when-visible="true"
                />
              </div>
              <!-- 数字背景光晕 -->
              <div class="absolute inset-0 bg-gradient-to-r from-primary-500/15 to-secondary-500/15 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl"></div>
            </div>
            <h3 class="font-bold text-gray-900 mb-5 text-lg sm:text-xl leading-tight tracking-wide">{{ stat.label }}</h3>
            <p class="text-sm sm:text-base text-gray-600 leading-[1.6] font-medium">{{ stat.description }}</p>
            
            <!-- 底部装饰点 -->
            <div class="flex justify-center mt-8 space-x-2">
              <div class="w-2 h-2 bg-primary-400 rounded-full opacity-50 group-hover:opacity-100 transition-all duration-300 group-hover:scale-125"></div>
              <div class="w-2 h-2 bg-primary-500 rounded-full opacity-70 group-hover:opacity-100 transition-all duration-300 group-hover:scale-125" style="transition-delay: 0.1s;"></div>
              <div class="w-2 h-2 bg-secondary-500 rounded-full opacity-50 group-hover:opacity-100 transition-all duration-300 group-hover:scale-125" style="transition-delay: 0.2s;"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 理论发展时间轴 -->
              <div class="bg-white rounded-3xl p-10 sm:p-12 lg:p-20 shadow-professional border border-gray-100/80 relative overflow-hidden" role="region" aria-labelledby="timeline-heading">
        <!-- 背景装饰 -->
        <div class="absolute inset-0 bg-gradient-to-br from-slate-50/60 via-blue-50/40 to-indigo-50/30 opacity-60" aria-hidden="true"></div>
        
        <div class="relative z-10">
          <div class="text-center mb-20 sm:mb-24">
            <h3 id="timeline-heading" class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-8 leading-tight tracking-[-0.01em]">理论发展历程</h3>
            <p class="text-lg sm:text-xl text-gray-600 max-w-4xl mx-auto leading-[1.7] font-medium">从心理学理论到全球应用的百年发展轨迹</p>
            <div class="mt-8 flex justify-center">
              <div class="w-20 h-1 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full opacity-70"></div>
            </div>
          </div>
        <!-- 桌面端时间轴 -->
        <div class="relative max-w-4xl mx-auto hidden md:block">
          <!-- 时间轴线 -->
          <div class="absolute left-1/2 transform -translate-x-0.5 w-1 h-full bg-gradient-to-b from-primary-500 via-primary-400 to-secondary-500 rounded-full shadow-sm"></div>
          
          <div class="space-y-20 lg:space-y-24">
            <div 
              v-for="(milestone, index) in theoryMilestones"
              :key="milestone.year"
              class="relative flex items-center"
              :class="index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'"
            >
              <!-- 时间点 -->
              <div class="absolute left-1/2 transform -translate-x-1/2 w-14 h-14 bg-white border-4 border-primary-500 rounded-full z-10 shadow-xl hover:scale-110 transition-all duration-300 hover:border-primary-600 cursor-pointer group">
                <div class="w-5 h-5 bg-primary-500 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 group-hover:bg-primary-600 transition-colors group-hover:scale-110"></div>
                <!-- 年份标签 -->
                <div class="absolute -bottom-10 left-1/2 transform -translate-x-1/2 text-sm font-bold text-primary-700 bg-white px-4 py-2 rounded-full shadow-lg border border-primary-200 group-hover:scale-105 transition-transform">
                  {{ milestone.year }}
                </div>
              </div>
              
              <!-- 内容卡片 -->
              <div class="w-5/12 group" :class="index % 2 === 0 ? 'mr-auto pr-10' : 'ml-auto pl-10'">
                <div class="p-8 sm:p-10 bg-gradient-to-br from-white to-gray-50/90 rounded-3xl hover:shadow-professional-hover transition-all duration-500 border border-gray-200/70 group-hover:border-primary-300/80 relative overflow-hidden hover:scale-[1.03]">
                  <!-- 卡片背景装饰 -->
                  <div class="absolute inset-0 bg-gradient-to-br from-primary-50/30 to-secondary-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div class="relative z-10">
                    <h4 class="font-bold text-gray-900 mb-4 text-xl sm:text-2xl group-hover:text-primary-800 transition-colors leading-tight tracking-wide">
                      {{ milestone.title }}
                    </h4>
                    <p class="text-gray-600 leading-[1.7] group-hover:text-gray-700 transition-colors text-base sm:text-lg font-medium">
                      {{ milestone.description }}
                    </p>
                  </div>
                  
                  <!-- 箭头指向时间轴 -->
                  <div 
                    class="absolute top-1/2 transform -translate-y-1/2 w-5 h-5 bg-white border-3 border-gray-300 rotate-45 group-hover:border-primary-400 transition-all duration-300 shadow-md"
                    :class="index % 2 === 0 ? '-right-2.5' : '-left-2.5'"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 移动端时间轴 -->
        <div class="md:hidden max-w-2xl mx-auto">
          <div class="relative pl-8">
            <!-- 移动端时间轴线 -->
            <div class="absolute left-4 top-0 w-0.5 h-full bg-gradient-to-b from-primary-500 via-primary-400 to-secondary-500 rounded-full"></div>
            
            <div class="space-y-8">
              <div 
                v-for="milestone in theoryMilestones"
                :key="milestone.year"
                class="relative"
              >
                <!-- 移动端时间点 -->
                <div class="absolute -left-4 top-6 w-8 h-8 bg-white border-3 border-primary-500 rounded-full shadow-lg z-10">
                  <div class="w-2 h-2 bg-primary-500 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                </div>
                
                <!-- 移动端内容卡片 -->
                <div class="bg-white rounded-2xl p-6 shadow-professional border border-gray-100/80 hover:shadow-professional-hover transition-all duration-300 ml-4">
                  <div class="flex items-center gap-3 mb-4">
                    <div class="text-2xl font-black text-primary-600">
                      {{ milestone.year }}
                    </div>
                    <div class="h-0.5 flex-1 bg-gradient-to-r from-primary-300 to-transparent"></div>
                  </div>
                  <h4 class="font-bold text-gray-900 mb-3 text-lg leading-tight">
                    {{ milestone.title }}
                  </h4>
                  <p class="text-gray-600 leading-[1.6] text-sm">
                    {{ milestone.description }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 学术认证 -->
      <div class="mt-24 sm:mt-28 text-center">
        <div class="mb-16">
          <div class="inline-flex items-center gap-3 bg-gradient-to-r from-primary-50 to-secondary-50 text-primary-700 px-6 py-3 rounded-full text-sm font-semibold mb-8 border border-primary-200/60 shadow-sm">
            <svg class="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M9.504 1.132a1 1 0 01.992 0l1.75 1a1 1 0 11-.992 1.736L10 3.152l-1.254.716a1 1 0 11-.992-1.736l1.75-1zM5.618 4.504a1 1 0 01-.372 1.364L5.016 6l.23.132a1 1 0 11-.992 1.736L4 7.723V8a1 1 0 01-2 0V6a.996.996 0 01.52-.878l1.734-.99a1 1 0 011.364.372zm8.764 0a1 1 0 011.364-.372l1.734.99A.996.996 0 0118 6v2a1 1 0 11-2 0v-.277l-.254.145a1 1 0 11-.992-1.736L15.016 6l-.23-.132a1 1 0 01-.372-1.364zm-7 4a1 1 0 011.364-.372L10 8.848l1.254-.716a1 1 0 11.992 1.736L11 10.723V12a1 1 0 11-2 0v-1.277l-1.246-.855a1 1 0 01-.372-1.364zM3 11a1 1 0 011 1v1.277l1.246.855a1 1 0 01-.372 1.364l-1.75-1A.996.996 0 013 14v-2a1 1 0 011-1zm14 0a1 1 0 011 1v2a.996.996 0 01-.52.878l-1.75 1a1 1 0 01-.372-1.364L16.746 13.277V12a1 1 0 011-1zm-9.618 4.504L5.618 14.5a1 1 0 01-.372-1.364l1.75-1a1 1 0 011.364.372L8.016 13l.23.132a1 1 0 11-.992 1.736l-.254-.145V16a1 1 0 11-2 0v-1.277l-1.246-.855a1 1 0 01-.372-1.364z" clip-rule="evenodd" />
            </svg>
            <span>全球权威认证</span>
          </div>
          <h3 id="institutions-heading" class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight tracking-[-0.01em]">获得权威机构认可</h3>
          <p class="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-[1.7] font-medium">全球顶尖学府与企业的信赖之选</p>
          <div class="mt-8 flex justify-center">
            <div class="w-20 h-1 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full opacity-70"></div>
          </div>
        </div>
        <div class="bg-white rounded-3xl p-8 sm:p-10 lg:p-12 shadow-professional border border-gray-100/80 relative overflow-hidden" role="region" aria-labelledby="institutions-heading">
          <!-- 背景装饰 -->
          <div class="absolute inset-0 bg-gradient-to-br from-slate-50/40 via-blue-50/30 to-indigo-50/20 opacity-60" aria-hidden="true"></div>
          <!-- 背景图案 -->
          <div class="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.4%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221.5%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" aria-hidden="true"></div>
          
          <div class="relative z-10">
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
              <!-- 哈佛大学 -->
              <div class="group flex flex-col items-center gap-4 p-6 sm:p-8 rounded-3xl hover:bg-white/95 hover:shadow-xl transition-all duration-400 backdrop-blur-sm cursor-pointer border border-transparent hover:border-red-100/60">
                <div class="w-20 h-20 sm:w-24 sm:h-24 bg-red-50/90 rounded-3xl flex items-center justify-center group-hover:bg-red-100/90 transition-all duration-300 border border-red-100/60 group-hover:border-red-200/80 shadow-lg group-hover:shadow-xl group-hover:scale-105">
                  <img src="/images/Harvard.png" alt="哈佛大学" class="w-12 h-12 sm:w-14 sm:h-14 object-contain group-hover:scale-110 transition-transform duration-300">
                </div>
                <span class="font-bold text-gray-800 text-base sm:text-lg group-hover:text-red-700 transition-colors tracking-wide">哈佛大学</span>
                <div class="w-12 h-1 bg-red-300 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:w-16"></div>
              </div>
              
              <!-- 斯坦福大学 -->
              <div class="group flex flex-col items-center gap-4 p-6 sm:p-8 rounded-3xl hover:bg-white/95 hover:shadow-xl transition-all duration-400 backdrop-blur-sm cursor-pointer border border-transparent hover:border-blue-100/60">
                <div class="w-20 h-20 sm:w-24 sm:h-24 bg-blue-50/90 rounded-3xl flex items-center justify-center group-hover:bg-blue-100/90 transition-all duration-300 border border-blue-100/60 group-hover:border-blue-200/80 shadow-lg group-hover:shadow-xl group-hover:scale-105">
                  <img src="/images/standford.png" alt="斯坦福大学" class="w-12 h-12 sm:w-14 sm:h-14 object-contain group-hover:scale-110 transition-transform duration-300">
                </div>
                <span class="font-bold text-gray-800 text-base sm:text-lg group-hover:text-blue-700 transition-colors tracking-wide">斯坦福大学</span>
                <div class="w-12 h-1 bg-blue-300 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:w-16"></div>
              </div>
              
              <!-- MIT -->
              <div class="group flex flex-col items-center gap-4 p-6 sm:p-8 rounded-3xl hover:bg-white/95 hover:shadow-xl transition-all duration-400 backdrop-blur-sm cursor-pointer border border-transparent hover:border-gray-200/60">
                <div class="w-20 h-20 sm:w-24 sm:h-24 bg-gray-50/90 rounded-3xl flex items-center justify-center group-hover:bg-gray-100/90 transition-all duration-300 border border-gray-200/60 group-hover:border-gray-300/80 shadow-lg group-hover:shadow-xl group-hover:scale-105">
                  <img src="/images/mit.png" alt="MIT" class="w-12 h-12 sm:w-14 sm:h-14 object-contain group-hover:scale-110 transition-transform duration-300">
                </div>
                <span class="font-bold text-gray-800 text-base sm:text-lg group-hover:text-gray-700 transition-colors tracking-wide">MIT</span>
                <div class="w-12 h-1 bg-gray-400 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:w-16"></div>
              </div>
              
              <!-- 世界500强 -->
              <div class="group flex flex-col items-center gap-4 p-6 sm:p-8 rounded-3xl hover:bg-white/95 hover:shadow-xl transition-all duration-400 backdrop-blur-sm cursor-pointer border border-transparent hover:border-green-100/60">
                <div class="w-20 h-20 sm:w-24 sm:h-24 bg-green-50/90 rounded-3xl flex items-center justify-center group-hover:bg-green-100/90 transition-all duration-300 border border-green-100/60 group-hover:border-green-200/80 shadow-lg group-hover:shadow-xl group-hover:scale-105">
                  <img src="/images/m1.jpg" alt="世界500强" class="w-12 h-12 sm:w-14 sm:h-14 object-contain group-hover:scale-110 transition-transform duration-300">
                </div>
                <span class="font-bold text-gray-800 text-base sm:text-lg group-hover:text-green-700 transition-colors tracking-wide">世界500强</span>
                <div class="w-12 h-1 bg-green-300 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:w-16"></div>
              </div>
            </div>
            
            <!-- 底部说明文字 -->
            <div class="mt-12 pt-8 border-t border-gray-200/60">
              <div class="bg-gradient-to-r from-slate-50/70 to-blue-50/50 rounded-2xl p-6 border border-slate-200/40">
                <p class="text-sm sm:text-base text-gray-600 leading-[1.7] max-w-4xl mx-auto font-medium text-center">
                  MBTI在全球范围内获得了顶尖学术机构和知名企业的广泛认可，被应用于人才选拔、团队建设、领导力发展等多个领域
                </p>
                <div class="flex justify-center mt-4">
                  <div class="flex items-center gap-2 text-xs text-gray-500">
                    <span class="w-1.5 h-1.5 bg-primary-400 rounded-full"></span>
                    <span>科学严谨</span>
                    <span class="w-1.5 h-1.5 bg-secondary-400 rounded-full"></span>
                    <span>权威认证</span>
                    <span class="w-1.5 h-1.5 bg-primary-400 rounded-full"></span>
                    <span>全球应用</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import CountUp from '@/components/UI/CountUp.vue'

interface AuthorityStat {
  id: string
  number: number
  suffix: string
  label: string
  description: string
}

interface TheoryMilestone {
  year: number
  title: string
  description: string
}

const foundationRef = ref<HTMLElement>()
const isVisible = ref(false)

// 权威数据
const authorityStats: AuthorityStat[] = [
  {
    id: 'history',
    number: 100,
    suffix: '+',
    label: '年心理学研究历史',
    description: '从荣格1921年《心理类型》开始'
  },
  {
    id: 'enterprise',
    number: 89,
    suffix: '%',
    label: '世界500强企业采用',
    description: '包括苹果、微软、IBM等'
  },
  {
    id: 'languages',
    number: 50,
    suffix: '+',
    label: '种语言版本',
    description: '覆盖全球主要国家和地区'
  },
  {
    id: 'users',
    number: 200,
    suffix: 'M+',
    label: '全球用户使用',
    description: '每年新增2000万用户'
  }
]

// 理论发展里程碑
const theoryMilestones: TheoryMilestone[] = [
  {
    year: 1921,
    title: '《心理类型》出版',
    description: '卡尔·荣格首次系统阐述心理类型理论，提出内向/外向概念'
  },
  {
    year: 1943,
    title: 'MBTI测试诞生',
    description: '凯瑟琳·布里格斯和伊莎贝尔·迈尔斯开始开发MBTI指标'
  },
  {
    year: 1962,
    title: '首个MBTI手册发布',
    description: 'MBTI正式成为标准化心理测评工具'
  },
  {
    year: 1975,
    title: '企业应用推广',
    description: '开始在企业人力资源管理中广泛应用'
  },
  {
    year: 2000,
    title: '数字化转型',
    description: '在线测试平台上线，全球用户激增'
  }
]

// 可见性观察
onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          isVisible.value = true
        }
      })
    },
    { threshold: 0.1 }
  )
  
  if (foundationRef.value) {
    observer.observe(foundationRef.value)
  }
})
</script>

<style scoped>
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.6s ease-out forwards;
}
</style>