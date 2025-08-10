<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
    <!-- 顶部标题区域 -->
    <header class="text-center pt-16 pb-8">
      <div class="container">
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">你的专属人格报告 正在生成中</h1>
        <p class="text-gray-600 text-lg">基于科学的心理学理论，为您量身定制专业分析</p>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <main class="container px-4 sm:px-6">
      <div class="max-w-2xl mx-auto">
        <!-- 中心加载图标 -->
        <div class="flex flex-col items-center mb-12">
          <div class="relative">
            <!-- MBTI圆环图标 -->
            <div class="w-24 h-24 sm:w-32 sm:h-32 relative">
              <!-- 外圆环 -->
              <div class="absolute inset-0 rounded-full border-4 border-gray-200"></div>
              <!-- 动态进度圆环 -->
              <div class="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-500 animate-spin"></div>
              <!-- 内部MBTI标识 -->
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="text-center">
                  <div class="text-primary-600 font-bold text-lg sm:text-xl">MBTI</div>
                  <div class="text-xs text-gray-500 mt-1">{{ Math.round(overallProgress) }}%</div>
                </div>
              </div>
            </div>
            <!-- 脉冲效果 -->
            <div class="absolute inset-0 rounded-full border-2 border-primary-300 animate-pulse opacity-30"></div>
          </div>
        </div>

        <!-- 三个分析板块 -->
        <div class="space-y-6">
          <!-- 人格分析板块 -->
          <div class="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden transition-all duration-500"
               :class="currentSection === 0 ? 'ring-2 ring-primary-200 shadow-primary' : ''">
            <div class="p-6">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                    <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 class="font-semibold text-gray-900">人格分析</h3>
                    <p class="text-sm text-gray-500">深度解析人格信息：内外向、直觉、情感...</p>
                  </div>
                </div>
                <div class="text-sm font-medium"
                     :class="currentSection > 0 ? 'text-green-600' : currentSection === 0 ? 'text-primary-600' : 'text-gray-400'">
                  {{ currentSection > 0 ? '已完成' : currentSection === 0 ? '分析中...' : '等待中' }}
                </div>
              </div>
              
              <!-- 人格分析子项目 -->
              <div class="space-y-3">
                <div v-for="(item, idx) in personalityItems" :key="idx" class="space-y-2">
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-gray-700">{{ item.name }}</span>
                    <span class="text-xs"
                          :class="getItemStatus(0, idx).class">
                      {{ getItemStatus(0, idx).text }}
                    </span>
                  </div>
                  <div class="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div class="h-full rounded-full transition-all duration-700"
                         :class="getItemStatus(0, idx).barClass"
                         :style="{ width: getItemProgress(0, idx) + '%' }"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 情感分析板块 -->
          <div class="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden transition-all duration-500"
               :class="currentSection === 1 ? 'ring-2 ring-primary-200 shadow-primary' : ''">
            <div class="p-6">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
                    <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 class="font-semibold text-gray-900">情感分析</h3>
                    <p class="text-sm text-gray-500">正在分析你的情感特质和恋爱基因</p>
                  </div>
                </div>
                <div class="text-sm font-medium"
                     :class="currentSection > 1 ? 'text-green-600' : currentSection === 1 ? 'text-primary-600' : 'text-gray-400'">
                  {{ currentSection > 1 ? '已完成' : currentSection === 1 ? '分析中...' : '等待中' }}
                </div>
              </div>
              
              <!-- 情感分析子项目 -->
              <div class="space-y-3">
                <div v-for="(item, idx) in emotionItems" :key="idx" class="space-y-2">
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-gray-700">{{ item.name }}</span>
                    <span class="text-xs"
                          :class="getItemStatus(1, idx).class">
                      {{ getItemStatus(1, idx).text }}
                    </span>
                  </div>
                  <div class="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div class="h-full rounded-full transition-all duration-700"
                         :class="getItemStatus(1, idx).barClass"
                         :style="{ width: getItemProgress(1, idx) + '%' }"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 职业性格板块 -->
          <div class="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden transition-all duration-500"
               :class="currentSection === 2 ? 'ring-2 ring-primary-200 shadow-primary' : ''">
            <div class="p-6">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 flex items-center justify-center">
                    <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clip-rule="evenodd"></path>
                      <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 class="font-semibold text-gray-900">职业性格</h3>
                    <p class="text-sm text-gray-500">正在深度解析你的职场人格优势</p>
                  </div>
                </div>
                <div class="text-sm font-medium"
                     :class="currentSection > 2 ? 'text-green-600' : currentSection === 2 ? 'text-primary-600' : 'text-gray-400'">
                  {{ currentSection > 2 ? '已完成' : currentSection === 2 ? '分析中...' : '等待中' }}
                </div>
              </div>
              
              <!-- 职业性格子项目 -->
              <div class="space-y-3">
                <div v-for="(item, idx) in careerItems" :key="idx" class="space-y-2">
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-gray-700">{{ item.name }}</span>
                    <span class="text-xs"
                          :class="getItemStatus(2, idx).class">
                      {{ getItemStatus(2, idx).text }}
                    </span>
                  </div>
                  <div class="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div class="h-full rounded-full transition-all duration-700"
                         :class="getItemStatus(2, idx).barClass"
                         :style="{ width: getItemProgress(2, idx) + '%' }"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAssessmentStore } from '@/stores/assessment'

const router = useRouter()
const store = useAssessmentStore()

// 当前正在处理的板块 (0: 人格分析, 1: 情感分析, 2: 职业性格)
const currentSection = ref(0)
// 当前板块内正在处理的子项目索引
const currentItemIndex = ref(0)
// 当前子项目的进度
const currentItemProgress = ref(0)

// 三个板块的子项目定义
const personalityItems = [
  { name: '荣格维分析你的天赋能力、行为风格...' },
  { name: '正在分析你的性格优势，定制成长建议...' },
  { name: '正在全方位评估你的MBTI人格类型...' }
]

const emotionItems = [
  { name: '正在分析你的情感特质和恋爱基因' },
  { name: '正在匹配你的天选爱情人格类型' },
  { name: '正在根据人格类型分析情感走向' },
  { name: '正在生成你的专属情感综合报告' }
]

const careerItems = [
  { name: '正在深度解析你的职场人格优势' },
  { name: '正在分析你的性格与人际关系' },
  { name: '正在生成与你天赋匹配的职业' },
  { name: '正在生成你专属的深度职业报告' }
]

// 获取所有项目的总数
const totalItems = personalityItems.length + emotionItems.length + careerItems.length

// 计算整体进度
const overallProgress = computed(() => {
  const completedSections = currentSection.value
  const completedItems = completedSections * (completedSections === 0 ? personalityItems.length : 
                        completedSections === 1 ? personalityItems.length + emotionItems.length :
                        personalityItems.length + emotionItems.length + careerItems.length)
  const currentSectionItems = currentSection.value === 0 ? personalityItems.length :
                             currentSection.value === 1 ? emotionItems.length : careerItems.length
  
  let completedInCurrentSection = 0
  if (currentSection.value < 3) {
    completedInCurrentSection = currentItemIndex.value + (currentItemProgress.value / 100)
  }
  
  const totalCompleted = (completedSections === 0 ? 0 : 
                         completedSections === 1 ? personalityItems.length :
                         completedSections === 2 ? personalityItems.length + emotionItems.length :
                         totalItems) + completedInCurrentSection
  
  return Math.min((totalCompleted / totalItems) * 100, 100)
})

// 获取子项目的进度
function getItemProgress(sectionIndex: number, itemIndex: number): number {
  if (sectionIndex < currentSection.value) {
    return 100 // 已完成的板块
  } else if (sectionIndex === currentSection.value) {
    if (itemIndex < currentItemIndex.value) {
      return 100 // 当前板块中已完成的项目
    } else if (itemIndex === currentItemIndex.value) {
      return currentItemProgress.value // 当前正在进行的项目
    }
  }
  return 0 // 未开始的项目
}

// 获取子项目的状态
function getItemStatus(sectionIndex: number, itemIndex: number) {
  if (sectionIndex < currentSection.value || 
      (sectionIndex === currentSection.value && itemIndex < currentItemIndex.value)) {
    return {
      text: '已完成',
      class: 'text-green-600',
      barClass: 'bg-gradient-to-r from-green-500 to-green-600'
    }
  } else if (sectionIndex === currentSection.value && itemIndex === currentItemIndex.value) {
    return {
      text: '分析中...',
      class: 'text-primary-600',
      barClass: 'bg-gradient-to-r from-primary-500 to-primary-600'
    }
  } else {
    return {
      text: '等待中',
      class: 'text-gray-400',
      barClass: 'bg-gray-300'
    }
  }
}

// 运行单个子项目
async function runItem(sectionIndex: number, itemIndex: number) {
  currentSection.value = sectionIndex
  currentItemIndex.value = itemIndex
  currentItemProgress.value = 0
  
  // 模拟进度动画
  const durationMs = 1200 // 每个子项目1.2秒
  const tick = 50
  const totalTicks = Math.floor(durationMs / tick)
  
  for (let t = 0; t <= totalTicks; t++) {
    currentItemProgress.value = Math.round((t / totalTicks) * 100)
    await new Promise(r => setTimeout(r, tick))
  }
}

// 运行整个板块
async function runSection(sectionIndex: number) {
  const items = sectionIndex === 0 ? personalityItems :
                sectionIndex === 1 ? emotionItems : careerItems
  
  for (let i = 0; i < items.length; i++) {
    await runItem(sectionIndex, i)
    // 每个子项目完成后稍作停顿
    await new Promise(r => setTimeout(r, 200))
  }
}

onMounted(async () => {
  // 若未完成测评，返回首页
  if (!store.finished) {
    return router.replace('/')
  }
  
  try {
    // 依次运行三个板块
    for (let section = 0; section < 3; section++) {
      await runSection(section)
      // 每个板块完成后稍作停顿
      if (section < 2) {
        await new Promise(r => setTimeout(r, 500))
      }
    }
    
    // 所有分析完成，跳转到结果页
    currentSection.value = 3 // 标记为全部完成
    await new Promise(r => setTimeout(r, 1000)) // 显示完成状态1秒
    router.replace('/result')
  } catch (error) {
    console.error('生成报告时出错:', error)
    // 出错时也跳转到结果页
    router.replace('/result')
  }
})
</script>

<style scoped>
.shadow-soft { box-shadow: 0 8px 20px rgba(0,0,0,.06) }
</style>

