<template>
  <Teleport to="body">
    <div 
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4"
      @click="$emit('close')"
    >
      <div 
        class="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
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
        <div class="bg-gradient-to-r from-primary-500 to-secondary-500 text-white p-8 rounded-t-3xl text-center">
          <div class="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span class="text-4xl">{{ character.emoji }}</span>
          </div>
          <h2 class="text-2xl font-bold mb-2">{{ character.name }}</h2>
          <p class="text-xl text-white/90 mb-1">{{ character.type }}</p>
          <p class="text-white/80">{{ character.traits.join(' • ') }}</p>
        </div>

        <!-- 内容区域 -->
        <div class="p-6">
          <!-- 性格描述 -->
          <div class="mb-6">
            <h3 class="text-lg font-bold text-gray-900 mb-3">性格特点</h3>
            <p class="text-gray-600 leading-relaxed">{{ character.description }}</p>
          </div>

          <!-- 能力指标 -->
          <div class="mb-6">
            <h3 class="text-lg font-bold text-gray-900 mb-3">能力指标</h3>
            <div class="space-y-3">
              <div 
                v-for="stat in character.stats"
                :key="stat.name"
                class="flex items-center justify-between"
              >
                <span class="text-gray-700 font-medium">{{ stat.name }}</span>
                <div class="flex items-center gap-2">
                  <div class="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      class="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full transition-all duration-1000"
                      :style="{ width: `${stat.value}%` }"
                    ></div>
                  </div>
                  <span class="text-sm text-gray-500 w-8">{{ stat.value }}%</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 优势特长 -->
          <div class="mb-6">
            <h3 class="text-lg font-bold text-gray-900 mb-3">优势特长</h3>
            <div class="flex flex-wrap gap-2">
              <span 
                v-for="strength in character.strengths"
                :key="strength"
                class="bg-green-100 text-green-700 text-sm px-3 py-1 rounded-full"
              >
                {{ strength }}
              </span>
            </div>
          </div>

          <!-- 成长空间 -->
          <div class="mb-6">
            <h3 class="text-lg font-bold text-gray-900 mb-3">成长空间</h3>
            <div class="flex flex-wrap gap-2">
              <span 
                v-for="challenge in character.challenges"
                :key="challenge"
                class="bg-orange-100 text-orange-700 text-sm px-3 py-1 rounded-full"
              >
                {{ challenge }}
              </span>
            </div>
          </div>

          <!-- 适合职业 -->
          <div class="mb-6">
            <h3 class="text-lg font-bold text-gray-900 mb-3">适合职业</h3>
            <div class="grid grid-cols-2 gap-2">
              <div 
                v-for="career in character.careers"
                :key="career"
                class="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
              >
                <div class="w-2 h-2 bg-primary-500 rounded-full"></div>
                <span class="text-gray-700 text-sm">{{ career }}</span>
              </div>
            </div>
          </div>

          <!-- 人际关系 -->
          <div class="mb-6">
            <h3 class="text-lg font-bold text-gray-900 mb-3">人际关系</h3>
            <p class="text-gray-600 text-sm leading-relaxed">{{ character.relationships }}</p>
          </div>
        </div>

        <!-- 底部操作 -->
        <div class="bg-gray-50 p-6 rounded-b-3xl text-center">
          <p class="text-gray-600 mb-4">想了解你的完整性格解析吗？</p>
          <div class="flex gap-3 justify-center">
            <button 
              class="bg-gray-200 text-gray-700 font-medium px-6 py-2 rounded-xl hover:bg-gray-300 transition-colors"
              @click="$emit('close')"
            >
              稍后再说
            </button>
            <button 
              class="btn-primary"
              @click="$emit('start-test')"
            >
              开始测试
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
interface PersonalityType {
  type: string
  name: string
  emoji: string
  traits: string[]
  stats: { name: string; value: number }[]
  description: string
  strengths: string[]
  challenges: string[]
  careers: string[]
  relationships: string
}

interface Props {
  character: PersonalityType
}

defineProps<Props>()
defineEmits<{
  close: []
  'start-test': []
}>()
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