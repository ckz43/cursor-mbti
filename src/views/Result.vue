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
          
          <button class="btn-secondary">
            分享结果
          </button>
        </div>
      </nav>
    </header>

    <!-- 结果内容区域 -->
    <main class="container py-12">
      <div class="max-w-4xl mx-auto">
        <!-- 维度可视化 -->
        <div class="grid sm:grid-cols-4 gap-4 mb-6">
          <div v-for="(value, key) in proportions" :key="key" class="bg-white rounded-2xl p-4 shadow-soft">
            <div class="text-sm text-gray-500 mb-2">{{ dimensionLabels[key] }}</div>
            <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full" :style="{ width: value + '%' }"></div>
            </div>
            <div class="mt-2 text-xs text-gray-600">{{ value }}%</div>
          </div>
        </div>
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

          <!-- 基础描述 -->
          <div class="p-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">你的性格特点</h2>
            <p class="text-gray-600 leading-relaxed text-lg mb-6">{{ result.description }}</p>
            
            <!-- 核心特质 -->
            <div class="grid sm:grid-cols-2 gap-4 mb-8">
              <div class="bg-green-50 p-4 rounded-xl">
                <h3 class="font-semibold text-green-800 mb-2">核心优势</h3>
                <ul class="space-y-1">
                  <li v-for="strength in result.coreStrengths" :key="strength" class="text-green-700 text-sm flex items-center gap-2">
                    <div class="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    {{ strength }}
                  </li>
                </ul>
              </div>
              <div class="bg-blue-50 p-4 rounded-xl">
                <h3 class="font-semibold text-blue-800 mb-2">典型特征</h3>
                <ul class="space-y-1">
                  <li v-for="trait in result.traits" :key="trait" class="text-blue-700 text-sm flex items-center gap-2">
                    <div class="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    {{ trait }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- 详细分析板块预览 -->
        <div class="grid lg:grid-cols-2 gap-6 mb-8">
          <div class="bg-white rounded-2xl shadow-soft p-6 flex flex-col items-center justify-center">
            <h3 class="text-xl font-bold text-gray-900 mb-4">维度雷达图</h3>
            <RadarChart :values="proportions" :size="280" />
            <div class="grid grid-cols-2 gap-2 mt-4 w-full text-xs text-gray-500">
              <div v-for="(label, key) in dimensionLabels" :key="key" class="flex items-center justify-between">
                <span>{{ label }}</span>
                <span class="text-gray-700">{{ proportions[key] }}%</span>
              </div>
            </div>
          </div>
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
                <h4 class="font-semibold text-gray-900 mb-2">解锁完整内容</h4>
                <p class="text-sm text-gray-600">获取详细的性格分析报告</p>
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
              <div class="text-2xl font-bold">¥19.9</div>
              <div class="text-sm text-white/80">限时优惠价</div>
              <div class="text-xs text-white/60 line-through">原价 ¥39.9</div>
            </div>
            <div class="text-left">
              <div class="font-semibold mb-1">包含内容：</div>
              <div class="text-sm text-white/90 space-y-1">
                <div>✓ 6大专业分析板块</div>
                <div>✓ 个性化成长建议</div>
                <div>✓ 终身查看权限</div>
              </div>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <button class="bg-white text-primary-600 font-semibold px-8 py-3 rounded-xl hover:bg-gray-50 transition-colors btn-animate btn-shine shine-loop cta-attention">
              立即解锁 ¥19.9
            </button>
            <button class="border-2 border-white/30 text-white font-semibold px-8 py-3 rounded-xl hover:bg-white/10 transition-colors btn-animate">
              分享给朋友
            </button>
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
          <span class="ml-1 opacity-90 text-white/90">¥19.9</span>
        </span>
      </button>
    </div>

    <!-- 移动端吸顶解锁条（移动端始终可见） -->
    <div class="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-t border-gray-200">
      <div class="container py-3 flex items-center justify-between gap-3">
        <div>
          <div class="text-sm text-gray-700 font-semibold leading-tight">解锁完整报告</div>
          <div class="text-xs text-gray-500 leading-tight">限时价 <span class="font-bold text-primary-600">¥19.9</span> · 含6大板块</div>
        </div>
        <button 
          class="bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold px-5 py-2 rounded-full shadow-xl hover:shadow-2xl btn-animate btn-shine shine-loop cta-attention"
          aria-label="立即解锁"
          @click="unlock"
        >
          立即解锁
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAssessmentStore } from '@/stores/assessment'
import { typeProfiles } from '@/data/profiles'
import RadarChart from '@/components/UI/RadarChart.vue'

const router = useRouter()

const store = useAssessmentStore()

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
    id: 'career',
    title: profile.value.career.title,
    icon: profile.value.career.icon,
    preview: profile.value.career.subtitle || '职业发展',
    highlights: [...profile.value.career.strengths.slice(0, 3)]
  },
  {
    id: 'relationship',
    title: profile.value.relationship.title,
    icon: profile.value.relationship.icon,
    preview: profile.value.relationship.subtitle || '恋爱关系',
    highlights: [...profile.value.relationship.strengths.slice(0, 3)]
  },
  {
    id: 'social',
    title: profile.value.social.title,
    icon: profile.value.social.icon,
    preview: profile.value.social.subtitle || '人际交往',
    highlights: [...profile.value.social.strengths.slice(0, 3)]
  },
  {
    id: 'growth',
    title: '个人成长路径',
    icon: '🌱',
    preview: '识别性格盲点，制定成长计划',
    highlights: profile.value.growth.slice(0, 3)
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

// 解锁按钮点击
const unlock = () => {
  // TODO: 接入支付逻辑
  console.log('unlock clicked')
}

// 维度可视化（容错+解构）
const proportions = computed(() => {
  const p = (store as any)?.proportions
  if (!p) return { EI: 0, NS: 0, TF: 0, JP: 0 }
  const { EI = 0, NS = 0, TF = 0, JP = 0 } = p as any
  return { EI, NS, TF, JP }
})
const dimensionLabels: Record<'EI'|'NS'|'TF'|'JP', string> = {
  EI: '外向(E) - 内向(I)',
  NS: '直觉(N) - 实感(S)',
  TF: '思考(T) - 情感(F)',
  JP: '判断(J) - 知觉(P)'
}
</script>