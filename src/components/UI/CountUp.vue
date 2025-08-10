<template>
  <span>{{ formattedValue }}</span>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface Props {
  end: number
  start?: number
  duration?: number
  suffix?: string
  prefix?: string
  startWhenVisible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  start: 0,
  duration: 2,
  suffix: '',
  prefix: '',
  startWhenVisible: true
})

const displayValue = ref(props.start)
const hasStarted = ref(false)

// 格式化显示值
const formattedValue = computed(() => {
  return `${props.prefix}${displayValue.value}${props.suffix}`
})

const animate = () => {
  if (hasStarted.value) return
  hasStarted.value = true
  
  const startTime = Date.now()
  const startValue = props.start
  const endValue = props.end
  const duration = props.duration * 1000
  
  const update = () => {
    const now = Date.now()
    const elapsed = now - startTime
    const progress = Math.min(elapsed / duration, 1)
    
    // 使用缓动函数
    const easedProgress = 1 - Math.pow(1 - progress, 3)
    const currentValue = startValue + (endValue - startValue) * easedProgress
    
    displayValue.value = Math.round(currentValue)
    
    if (progress < 1) {
      requestAnimationFrame(update)
    }
  }
  
  requestAnimationFrame(update)
}

// 监听可见性
onMounted(() => {
  if (!props.startWhenVisible) {
    animate()
    return
  }
  
  // 延迟一点时间再开始动画，让用户有时间看到
  setTimeout(() => {
    animate()
  }, 500)
})
</script>