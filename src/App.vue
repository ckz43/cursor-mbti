<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <!-- 页面内容 -->
    <RouterView />
    
    <!-- 全局加载状态 -->
    <Transition name="fade">
      <div 
        v-if="isLoading" 
        class="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50"
      >
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mb-4"></div>
          <p class="text-gray-600">加载中...</p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterView } from 'vue-router'

// 全局加载状态
const isLoading = ref(false)

// 全局错误处理
const handleError = (error: Error) => {
  console.error('Application Error:', error)
  // 这里可以添加错误上报逻辑
}

// 应用初始化
onMounted(() => {
  // 注册全局错误处理
  window.addEventListener('error', (event) => {
    handleError(new Error(event.message))
  })
  
  window.addEventListener('unhandledrejection', (event) => {
    handleError(new Error(event.reason))
  })
  
  // 预加载关键资源
  preloadAssets()
})

// 预加载资源
const preloadAssets = () => {
  const imagesToPreload = [
    '/images/founders/carl-jung.jpg',
    '/images/founders/katharine-briggs.jpg',
    '/images/founders/isabel-myers.jpg'
  ]
  
  imagesToPreload.forEach(src => {
    const img = new Image()
    img.src = src
  })
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>