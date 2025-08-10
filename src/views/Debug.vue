<template>
  <div class="min-h-screen bg-gray-100 p-8">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold mb-8">MBTI 计算调试页面</h1>
      
      <div class="bg-white rounded-lg p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">Store 状态</h2>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <h3 class="font-medium mb-2">答案数组长度:</h3>
            <p class="text-lg">{{ store.answers.length }}</p>
          </div>
          <div>
            <h3 class="font-medium mb-2">MBTI 类型:</h3>
            <p class="text-lg font-bold">{{ store.mbtiType }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">维度分数</h2>
        <div class="grid grid-cols-4 gap-4">
          <div v-for="(score, dimension) in store.dimensionScores" :key="dimension" class="text-center">
            <h3 class="font-medium mb-2">{{ dimension }}</h3>
            <p class="text-2xl font-bold" :class="score >= 0 ? 'text-green-600' : 'text-red-600'">
              {{ score.toFixed(2) }}
            </p>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">百分比显示</h2>
        <div class="grid grid-cols-4 gap-4">
          <div v-for="(percentage, dimension) in store.proportions" :key="dimension" class="text-center">
            <h3 class="font-medium mb-2">{{ dimensionLabels[dimension] }}</h3>
            <div class="w-full bg-gray-200 rounded-full h-4 mb-2">
              <div class="bg-blue-600 h-4 rounded-full" :style="{ width: percentage + '%' }"></div>
            </div>
            <p class="text-lg font-bold">{{ percentage }}%</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">维度题目分布</h2>
        <div class="grid grid-cols-4 gap-4">
          <div v-for="(count, dimension) in dimensionCounts" :key="dimension" class="text-center">
            <h3 class="font-medium mb-2">{{ dimension }}</h3>
            <p class="text-lg">{{ count }} 题</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg p-6">
        <h2 class="text-xl font-semibold mb-4">操作</h2>
        <div class="flex gap-4">
          <button @click="generateRandomAnswers" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            生成随机答案
          </button>
          <button @click="clearAnswers" class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
            清空答案
          </button>
          <button @click="goToResult" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            查看结果页
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAssessmentStore } from '@/stores/assessment'
import { mapping93 } from '@/data/mapping-93'

const router = useRouter()
const store = useAssessmentStore()

const dimensionLabels: Record<'EI'|'NS'|'TF'|'JP', string> = {
  EI: '外向(E) - 内向(I)',
  NS: '直觉(N) - 实感(S)',
  TF: '思考(T) - 情感(F)',
  JP: '判断(J) - 知觉(P)'
}

const dimensionCounts = computed(() => {
  const counts: Record<'EI'|'NS'|'TF'|'JP', number> = { EI: 0, NS: 0, TF: 0, JP: 0 }
  mapping93.forEach(map => {
    counts[map.dimension]++
  })
  return counts
})

const generateRandomAnswers = () => {
  store.answers = Array.from({ length: 93 }, () => Math.floor(Math.random() * 4))
  store.setFinished(true)
}

const clearAnswers = () => {
  store.reset()
}

const goToResult = () => {
  router.push('/result')
}
</script>