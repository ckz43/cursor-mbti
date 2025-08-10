<template>
  <Teleport to="body">
    <div 
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
      @click="$emit('close')"
    >
      <div 
        class="bg-white rounded-3xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        @click.stop
      >
        <!-- 关闭按钮 -->
        <button 
          class="absolute top-4 right-4 w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors z-10"
          @click="$emit('close')"
        >
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>

        <!-- 头部信息 -->
        <div class="bg-gradient-to-r from-primary-500 to-secondary-500 text-white p-8 rounded-t-3xl">
          <div class="flex items-center gap-6">
            <div class="w-24 h-24 rounded-full overflow-hidden border-4 border-white/30">
              <img 
                :src="founder.image" 
                :alt="founder.name"
                class="w-full h-full object-cover"
                @error="handleImageError"
              >
            </div>
            <div>
              <h2 class="text-3xl font-bold mb-2">{{ founder.name }}</h2>
              <p class="text-xl text-white/90 mb-1">{{ founder.title }}</p>
              <div class="flex flex-wrap gap-2">
                <span 
                  v-for="achievement in founder.achievements.slice(0, 2)"
                  :key="achievement"
                  class="bg-white/20 text-white text-sm px-3 py-1 rounded-full"
                >
                  {{ achievement }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 内容区域 -->
        <div class="p-8">
          <!-- 简介 -->
          <div class="mb-8">
            <h3 class="text-xl font-bold text-gray-900 mb-4">人物简介</h3>
            <p class="text-gray-600 leading-relaxed">{{ founder.biography.trim() }}</p>
          </div>

          <!-- 主要成就 -->
          <div class="mb-8">
            <h3 class="text-xl font-bold text-gray-900 mb-4">主要成就</h3>
            <div class="grid sm:grid-cols-2 gap-3">
              <div 
                v-for="achievement in founder.achievements"
                :key="achievement"
                class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <div class="w-2 h-2 bg-primary-500 rounded-full"></div>
                <span class="text-gray-700">{{ achievement }}</span>
              </div>
            </div>
          </div>

          <!-- 经典语录 -->
          <div class="mb-8">
            <h3 class="text-xl font-bold text-gray-900 mb-4">经典语录</h3>
            <div class="space-y-4">
              <blockquote 
                v-for="quote in founder.quotes"
                :key="quote"
                class="border-l-4 border-primary-500 pl-4 py-2 italic text-gray-600"
              >
                "{{ quote }}"
              </blockquote>
            </div>
          </div>

          <!-- 人生轨迹 -->
          <div>
            <h3 class="text-xl font-bold text-gray-900 mb-4">人生轨迹</h3>
            <div class="space-y-4">
              <div 
                v-for="milestone in founder.timeline"
                :key="milestone.year"
                class="flex gap-4"
              >
                <div class="flex-shrink-0 w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                  <span class="text-primary-600 font-bold text-sm">{{ milestone.year }}</span>
                </div>
                <div class="pt-2">
                  <p class="text-gray-700">{{ milestone.event }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 底部操作 -->
        <div class="bg-gray-50 p-6 rounded-b-3xl text-center">
          <p class="text-gray-600 mb-4">了解更多MBTI理论基础</p>
          <button 
            class="btn-primary"
            @click="$emit('close')"
          >
            开始测试
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
interface Founder {
  id: string
  name: string
  title: string
  image: string
  biography: string
  achievements: string[]
  quotes: string[]
  timeline: { year: number; event: string }[]
}

interface Props {
  founder: Founder
}

defineProps<Props>()
defineEmits<{
  close: []
}>()

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = '/images/avatar-placeholder.svg'
}
</script>

<style scoped>
/* 自定义滚动条 */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>