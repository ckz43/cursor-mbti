<template>
  <div class="min-h-screen bg-gradient-soft">
    <!-- 导航栏 -->
    <header class="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-gray-200">
      <nav class="container py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <button 
              class="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
              @click="goBack"
            >
              <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
            </button>
            <div>
              <h1 class="font-bold text-gray-900">MBTI专业测评</h1>
              <p class="text-xs text-gray-500">基于荣格心理学</p>
            </div>
          </div>
          
          <!-- 进度指示 -->
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-600">{{ currentStep }}/{{ totalSteps }}</span>
            <div class="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                class="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full transition-all duration-300"
                :style="{ width: `${progress}%` }"
              ></div>
            </div>
          </div>
        </div>
      </nav>
    </header>

    <!-- 测试内容区域 -->
    <main class="container py-12">
      <div class="max-w-2xl mx-auto">
        <!-- 测试介绍（第一步） -->
        <div v-if="currentStep === 1" class="text-center">
          <div class="w-24 h-24  rounded-full flex items-center justify-center mx-auto mb-8">
            <img data-v-18355f2a="" src="/images/mbtilogo.png"  class="avatar-image">
          </div>
          
          <h1 class="text-4xl font-bold text-gray-900 mb-6">
            探索你的
            <span class="text-gradient">真实性格</span>
          </h1>
          
          <p class="text-lg text-gray-600 mb-8 leading-relaxed">
            这个测评基于卡尔·荣格的心理类型理论，通过 <strong class="text-primary-600">93个精心设计的问题</strong>，
            帮你深入了解自己的性格特点、优势潜能和成长方向。
          </p>

          <div class="bg-white rounded-2xl p-8 shadow-soft mb-8">
            <h3 class="text-xl font-bold text-gray-900 mb-6">测评包含内容</h3>
            <div class="grid sm:grid-cols-2 gap-4 text-left">
              <div class="flex items-start gap-3">
                <div class="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <svg class="w-3 h-3 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                  </svg>
                </div>
                <div>
                  <h4 class="font-semibold text-gray-900 mb-1">职业发展指南</h4>
                  <p class="text-sm text-gray-600">适合的职业方向和发展路径</p>
                </div>
              </div>
              
              <div class="flex items-start gap-3">
                <div class="w-6 h-6 bg-secondary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <svg class="w-3 h-3 text-secondary-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                  </svg>
                </div>
                <div>
                  <h4 class="font-semibold text-gray-900 mb-1">恋爱关系攻略</h4>
                  <p class="text-sm text-gray-600">理想伴侣类型和相处之道</p>
                </div>
              </div>
              
              <div class="flex items-start gap-3">
                <div class="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <svg class="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                  </svg>
                </div>
                <div>
                  <h4 class="font-semibold text-gray-900 mb-1">人际交往密码</h4>
                  <p class="text-sm text-gray-600">沟通技巧和社交策略</p>
                </div>
              </div>
              
              <div class="flex items-start gap-3">
                <div class="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <svg class="w-3 h-3 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                  </svg>
                </div>
                <div>
                  <h4 class="font-semibold text-gray-900 mb-1">个人成长路径</h4>
                  <p class="text-sm text-gray-600">性格优化和潜能开发</p>
                </div>
              </div>
            </div>
          </div>

          <div class="flex flex-col items-center gap-4">
            <button 
              class="btn-primary text-lg px-8 py-4 group"
              @click="startTest"
            >
              <span>开始专业测评</span>
              <svg class="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
              </svg>
            </button>
            <p class="text-sm text-gray-500">大约需要 5-8 分钟完成</p>
          </div>
        </div>

        <!-- 测试问题（第2-94步） -->
        <div v-else-if="currentStep <= totalSteps" class="space-y-8">
          <div class="text-center mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-2">问题 {{ currentStep - 1 }}</h2>
            <p class="text-gray-600">请根据你的真实感受选择最符合的选项</p>
          </div>

          <div class="bg-white rounded-2xl p-8 shadow-soft">
            <h3 class="text-xl font-semibold text-gray-900 mb-8 leading-relaxed">
              {{ currentQuestion.question }}
            </h3>

            <div class="space-y-4">
              <button
                v-for="(option, index) in currentQuestion.options"
                :key="index"
                class="w-full p-6 text-left bg-gray-50 hover:bg-primary-50 border-2 border-transparent hover:border-primary-200 rounded-xl transition-all duration-300 group"
                :class="{ 'bg-primary-50 border-primary-300': selectedAnswer === index }"
                @click="selectAnswer(index)"
              >
                <div class="flex items-start gap-4">
                  <div class="w-6 h-6 border-2 border-gray-300 rounded-full flex items-center justify-center flex-shrink-0 group-hover:border-primary-400 transition-colors"
                       :class="{ 'border-primary-500 bg-primary-500': selectedAnswer === index }">
                    <div v-if="selectedAnswer === index" class="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span class="text-gray-700 group-hover:text-gray-900">{{ option }}</span>
                </div>
              </button>
            </div>
          </div>

          <div class="flex justify-end">
            <button 
              class="btn-secondary"
              @click="previousQuestion"
              :disabled="currentStep <= 2"
            >
              上一题
            </button>
          </div>
        </div>

        <!-- 完成页面 -->
        <div v-else class="text-center">
          <div class="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <svg class="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          
          <h1 class="text-4xl font-bold text-gray-900 mb-6">测评完成！</h1>
          <p class="text-lg text-gray-600 mb-8">正在分析你的性格类型...</p>
          
          <div class="flex justify-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { questions93, baseOptions } from '@/data/questions-93'
import { useAssessmentStore } from '@/stores/assessment'

const router = useRouter()

// 先初始化全局答题 store，再使用其属性
const store = useAssessmentStore()

// 测试状态
const currentStep = ref(1)
const totalSteps = ref(store.totalQuestions + 1) // 1个介绍页 + 题目数
const selectedAnswer = ref<number | null>(null)

// 进度计算
const progress = computed(() => {
  if (currentStep.value === 1) return 0
  return Math.round(((currentStep.value - 1) / (totalSteps.value - 1)) * 100)
})

// 题库：把93条描述转为题目对象 + 通用选项（裁剪到映射题数）
const questions = ref(
  questions93.slice(0, store.totalQuestions).map((q) => ({
    question: q,
    options: baseOptions
  }))
)

const currentQuestion = computed(() => {
  const questionIndex = currentStep.value - 2
  return questions.value[questionIndex] || questions.value[0]
})

const goBack = () => {
  router.push('/')
}

const startTest = () => {
  store.reset()
  currentStep.value = 2
}

const selectAnswer = (index: number) => {
  selectedAnswer.value = index
}

const nextQuestion = () => {
  if (selectedAnswer.value !== null) {
    // 记录到全局答题存储
    store.recordAnswer(selectedAnswer.value)
    selectedAnswer.value = null
    
    if (currentStep.value === totalSteps.value) {
      // 完成测试，立即跳转到结果
      store.setFinished(true)
      router.push('/result')
    } else {
      currentStep.value++
    }
  }
}

const previousQuestion = () => {
  if (currentStep.value > 2) {
    currentStep.value--
    // 回退一题时丢弃上一条答案
    store.answers.pop()
    selectedAnswer.value = null
  }
}

// 自动保存进度
onMounted(() => {
  // 这里可以加载之前保存的进度
  console.log('Test page mounted')
})

// 选择后自动进入下一题（100~250ms之间，确保视觉反馈但无卡顿）
watch(selectedAnswer, (val) => {
  if (val !== null) {
    setTimeout(() => {
      nextQuestion()
    }, 120)
  }
})
</script>