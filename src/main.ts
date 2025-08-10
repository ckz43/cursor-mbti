import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import './style.css'
import { useAssessmentStore } from './stores/assessment'

// 先创建 pinia 以便在守卫中访问 store
const pinia = createPinia()

// 路由配置
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('./views/Home.vue'),
      meta: {
        title: 'MBTI专业性格测试 - 发现真正的自己'
      }
    },
    {
      path: '/test',
      name: 'Test',
      component: () => import('./views/Test.vue'),
      meta: {
        title: '开始测试 - MBTI性格测评'
      }
    },
    {
      path: '/result',
      name: 'Result',
      component: () => import('./views/Result.vue'),
      meta: {
        title: '测试结果 - MBTI性格分析'
      }
    },
    {
      path: '/report',
      name: 'Report',
      component: () => import('./views/Report.vue'),
      meta: {
        title: '详细报告 - MBTI深度解析'
      }
    }
  ],
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 路由守卫 - 访问控制与标题
router.beforeEach((to, _from, next) => {
  if (to.meta?.title) {
    document.title = to.meta.title as string
  }
  const store = useAssessmentStore(pinia)

  const goingResult = to.name === 'Result'
  const goingReport = to.name === 'Report'

  if (goingResult || goingReport) {
    if (!store.finished) {
      return next({ name: 'Home' })
    }
  }
  if (goingReport) {
    if (!store.paid) {
      return next({ name: 'Home' })
    }
  }
  next()
})

// 创建应用
const app = createApp(App)
app.use(pinia)
app.use(router)

// v-ripple 指令：给按钮添加点击涟漪效果
app.directive('ripple', {
  mounted(el: HTMLElement) {
    // 容器样式
    el.classList.add('ripple-container')
    el.addEventListener('click', (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const ripple = document.createElement('span')
      const size = Math.max(rect.width, rect.height)
      const x = e.clientX - rect.left - size / 2
      const y = e.clientY - rect.top - size / 2
      ripple.className = 'ripple'
      ripple.style.width = ripple.style.height = `${size}px`
      ripple.style.left = `${x}px`
      ripple.style.top = `${y}px`
      el.appendChild(ripple)
      ripple.addEventListener('animationend', () => ripple.remove())
    })
  }
})

app.mount('#app')