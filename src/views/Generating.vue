<template>
  <div class="min-h-screen bg-gradient-to-b from-teal-200/30 to-white">
    <header class="container py-5 text-center">
      <h1 class="text-xl font-bold text-gray-900">你的专属人格报告 正在生成中…</h1>
    </header>

    <main class="container">
      <div class="max-w-md mx-auto">
        <div class="flex flex-col items-center gap-6 py-8">
          <img src="/images/vite.svg" alt="loading" class="w-16 h-16 opacity-80 animate-pulse" />
        </div>

        <!-- 分步进度：一条一条读取，顺序执行 -->
        <section class="bg-white rounded-2xl shadow-soft p-6 space-y-5">
          <div v-for="(step, idx) in steps" :key="step.key" class="space-y-2">
            <div class="flex items-center justify-between">
              <div class="text-gray-800 font-medium">{{ step.title }}</div>
              <div class="text-sm text-gray-500" v-if="idx === currentIndex">加载中…</div>
              <div class="text-sm text-green-600" v-else-if="idx < currentIndex">已完成</div>
            </div>
            <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div class="h-full rounded-full transition-all duration-500"
                   :class="barClass(idx)"
                   :style="{ width: barWidth(idx) }"></div>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
  </template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAssessmentStore } from '@/stores/assessment'

const router = useRouter()
const store = useAssessmentStore()

// 步骤定义：严格的顺序读取
const steps = [
  { key: 'personality', title: '人格分析内容准备' },
  { key: 'emotion', title: '情感分析内容准备' },
  { key: 'career', title: '职业性格内容准备' }
]
const currentIndex = ref(0)
const innerProgress = ref(0)

// 样式与宽度计算，避免复杂内联表达式
const barClass = (idx: number) => (idx < currentIndex.value ? 'bg-green-500' : idx === currentIndex.value ? 'bg-primary-500' : 'bg-gray-300')
const barWidth = (idx: number) => {
  const val = idx < currentIndex.value ? 100 : idx === currentIndex.value ? innerProgress.value : 0
  return `${val}%`
}

async function runStep(i: number) {
  currentIndex.value = i
  innerProgress.value = 0
  // 模拟分段推进动画（可与真实接口进度整合）
  const durationMs = 900
  const tick = 30
  const totalTicks = Math.floor(durationMs / tick)
  for (let t = 0; t <= totalTicks; t++) {
    innerProgress.value = Math.round((t / totalTicks) * 100)
    await new Promise(r => setTimeout(r, tick))
  }
}

onMounted(async () => {
  // 若未完成测评，返回首页（与全局守卫一致）
  if (!store.finished) {
    return router.replace('/')
  }
  // 一条一条执行
  for (let i = 0; i < steps.length; i++) {
    await runStep(i)
  }
  // 全部完成后前往结果页
  router.replace('/result')
})

</script>

<style scoped>
.shadow-soft { box-shadow: 0 8px 20px rgba(0,0,0,.06) }
</style>

