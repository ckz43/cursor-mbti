import { createApp, defineComponent, ref, onMounted, h } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory, useRouter } from 'vue-router'
import App from './App.vue'
import './style.css'
import { useAssessmentStore } from './stores/assessment'

// 先创建 pinia 以便在后续全局和组件中使用
const pinia = createPinia()

// 生成中转页（内联组件，render 函数，不依赖模板编译）
const GeneratingRoute = defineComponent({
  name: 'GeneratingRoute',
  setup() {
    const router = useRouter()
    const store = useAssessmentStore()
    const steps = [
      { key: 'personality', title: '人格分析内容准备' },
      { key: 'emotion', title: '情感分析内容准备' },
      { key: 'career', title: '职业性格内容准备' }
    ]
    const currentIndex = ref(0)
    const innerProgress = ref(0)

    const barClass = (idx: number) => (idx < currentIndex.value ? 'bg-green-500' : idx === currentIndex.value ? 'bg-primary-500' : 'bg-gray-300')
    const barWidth = (idx: number) => `${idx < currentIndex.value ? 100 : idx === currentIndex.value ? innerProgress.value : 0}%`

    async function runStep(i: number) {
      currentIndex.value = i
      innerProgress.value = 0
      const durationMs = 1200
      const tick = 30
      const totalTicks = Math.floor(durationMs / tick)
      for (let t = 0; t <= totalTicks; t++) {
        innerProgress.value = Math.round((t / totalTicks) * 100)
        await new Promise(r => setTimeout(r, tick))
      }
    }

    onMounted(async () => {
      if (!store.finished) return router.replace('/')
      // 起始延时，确保用户可见
      await new Promise(r => setTimeout(r, 250))
      for (let i = 0; i < steps.length; i++) await runStep(i)
      await new Promise(r => setTimeout(r, 200))
      router.replace('/result')
    })

    // 渲染函数
    return () => h('div', { class: 'min-h-screen bg-gradient-to-b from-teal-200/30 to-white' }, [
      h('header', { class: 'container py-5 text-center' }, [
        h('h1', { class: 'text-xl font-bold text-gray-900' }, '你的专属人格报告 正在生成中…')
      ]),
      h('main', { class: 'container' }, [
        h('div', { class: 'max-w-md mx-auto' }, [
          h('div', { class: 'flex flex-col items-center gap-6 py-8' }, [
            h('img', { src: '/images/vite.svg', alt: 'loading', class: 'w-16 h-16 opacity-80 animate-pulse' })
          ]),
          h('section', { class: 'bg-white rounded-2xl shadow-soft p-6 space-y-5' },
            steps.map((step, idx) => h('div', { class: 'space-y-2', key: step.key }, [
              h('div', { class: 'flex items-center justify-between' }, [
                h('div', { class: 'text-gray-800 font-medium' }, step.title),
                idx === currentIndex.value
                  ? h('div', { class: 'text-sm text-gray-500' }, '加载中…')
                  : (idx < currentIndex.value ? h('div', { class: 'text-sm text-green-600' }, '已完成') : null)
              ]),
              h('div', { class: 'h-2 bg-gray-200 rounded-full overflow-hidden' }, [
                h('div', { class: `h-full rounded-full transition-all duration-500 ${barClass(idx)}`, style: { width: barWidth(idx) } })
              ])
            ]))
          )
        ])
      ])
    ])
  }
})

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
      path: '/generating',
      name: 'Generating',
      component: GeneratingRoute,
      meta: {
        title: '生成报告中 - MBTI性格分析'
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
  scrollBehavior(to, from, savedPosition) {
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

  const protectedRoutes = ['Generating', 'Result', 'Report'] as const
  if (protectedRoutes.includes(to.name as any)) {
    if (!store.finished) {
      return next({ name: 'Home' })
    }
  }
  if (to.name === 'Report') {
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

// 暴露开发者后门，便于控制台快速预览类型与跳转
;(window as any).__MBTI_DEV__ = {
  store: () => useAssessmentStore(pinia),
  setType: (type: string | null) => useAssessmentStore(pinia).setOverrideType(type),
  setFinished: (v: boolean) => useAssessmentStore(pinia).setFinished(v),
  setPaid: (v: boolean) => useAssessmentStore(pinia).setPaid(v),
  goto: (path: string) => router.push(path),
  // 一键预览：设置完成+付费+类型，并进入生成中转页
  preview: (type: string) => {
    const s = useAssessmentStore(pinia)
    s.setFinished(true)
    s.setPaid(true)
    s.setOverrideType(type)
    router.push('/generating')
  }
}
;(window as any).MBTI_DEV = (window as any).__MBTI_DEV__

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