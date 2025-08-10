<template>
  <div class="min-h-screen bg-gray-50">
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
              <h1 class="font-bold text-gray-900">详细报告</h1>
              <p class="text-xs text-gray-500">{{ result.name }} ({{ result.type }})</p>
            </div>
          </div>
          
          <div class="flex gap-2">
            <button class="btn-primary">
              分享报告
            </button>
          </div>
        </div>
      </nav>
    </header>

    <!-- 报告内容 -->
<main class="container py-8">
      <div class="max-w-4xl mx-auto space-y-8">
        <!-- 个人信息卡片（与结果页一致的形象图） -->
        <div class="bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-3xl p-8">
          <div class="flex items-center gap-6">
            <div class="w-24 h-24 bg-white/15 rounded-full flex items-center justify-center ring-1 ring-white/30">
              <img :src="characterImage" :alt="`${result.type} 人格图像`" class="w-16 h-16 object-contain drop-shadow-xl" @error="onCharacterImgError" />
            </div>
            <div>
              <h1 class="text-3xl font-bold mb-2">{{ result.name }}</h1>
              <p class="text-xl text-white/90 mb-1">{{ result.type }}</p>
              <p class="text-white/80">{{ result.subtitle }}</p>
            </div>
          </div>
        </div>

        <!-- 报告章节（动态渲染） -->
        <div 
          v-for="section in dynamicSections" 
          :key="section.id"
          class="bg-white rounded-2xl shadow-soft overflow-hidden"
        >
          <div class="bg-gray-50 px-8 py-6 border-b border-gray-200">
            <div class="flex items-center gap-3">
              <span class="text-3xl">{{ section.icon }}</span>
              <div>
                <h2 class="text-2xl font-bold text-gray-900">{{ section.title }}</h2>
                <p class="text-gray-600">{{ section.subtitle }}</p>
              </div>
            </div>
          </div>

          <div class="p-8">
            <!-- 核心内容 -->
            <div class="mb-8">
              <h3 class="text-xl font-bold text-gray-900 mb-4">核心特点</h3>
              <p class="text-gray-600 leading-relaxed mb-6">{{ section.description }}</p>
              
              <div class="grid sm:grid-cols-2 gap-6">
                <div>
                  <h4 class="font-semibold text-gray-900 mb-3">优势</h4>
                  <ul class="space-y-2">
                     <li v-for="strength in section.strengths" :key="strength" class="flex items-start gap-2">
                      <div class="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                      <span class="text-gray-700">{{ strength }}</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 class="font-semibold text-gray-900 mb-3">注意事项</h4>
                  <ul class="space-y-2">
                     <li v-for="challenge in section.challenges" :key="challenge" class="flex items-start gap-2">
                      <div class="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div class="w-2 h-2 bg-orange-500 rounded-full"></div>
                      </div>
                      <span class="text-gray-700">{{ challenge }}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- 实用建议 -->
            <div v-if="section.tips && section.tips.length" class="bg-blue-50 rounded-xl p-6">
              <h4 class="font-semibold text-blue-900 mb-3">💡 实用建议</h4>
              <ul class="space-y-2">
                <li v-for="tip in section.tips" :key="tip" class="text-blue-800 flex items-start gap-2">
                  <span class="text-blue-500 font-bold">·</span>
                  <span>{{ tip }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- 总结卡片（动态） -->
        <div class="bg-white rounded-2xl shadow-soft p-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-6 text-center">🎯 个人成长总结</h2>
          
          <div class="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl p-6 mb-6">
            <h3 class="font-bold text-gray-900 mb-3">你的核心价值</h3>
            <p class="text-gray-700 leading-relaxed mb-4">{{ dynamicSummary.coreValue }}</p>
            <p class="text-gray-700 leading-relaxed" v-if="profile.longSummary">{{ profile.longSummary }}</p>
          </div>

          <div class="grid sm:grid-cols-2 gap-6">
            <div class="bg-green-50 rounded-xl p-4">
              <h4 class="font-semibold text-green-800 mb-2">继续发扬</h4>
              <ul class="space-y-1">
                <li v-for="strength in dynamicSummary.keepDoing" :key="strength" class="text-green-700 text-sm">
                  ✓ {{ strength }}
                </li>
              </ul>
            </div>
            <div class="bg-blue-50 rounded-xl p-4">
              <h4 class="font-semibold text-blue-800 mb-2">重点改善</h4>
              <ul class="space-y-1">
                <li v-for="improvement in dynamicSummary.improvements" :key="improvement" class="text-blue-700 text-sm">
                  → {{ improvement }}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- 底部CTA -->
        <div class="bg-gradient-primary text-white rounded-2xl p-8 text-center">
          <h3 class="text-xl font-bold mb-4">继续你的成长之旅</h3>
          <p class="text-white/90 mb-6">定期重新测评，跟踪你的性格发展和成长进步</p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <button class="bg-white text-primary-600 font-semibold px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors">
              重新测评
            </button>
            <button class="border-2 border-white/30 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/10 transition-colors">
              推荐给朋友
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { typeProfiles } from '@/data/profiles'
import { useAssessmentStore } from '@/stores/assessment'

const router = useRouter()

const store = useAssessmentStore()
const currentType = computed(() => store.finished ? store.mbtiType : 'ENFP')
const profile = computed(() => typeProfiles[currentType.value] || typeProfiles['ENFP'])
// 构造长文的通用兜底：将摘要+要点自动扩写为连贯段落（避免出现空白/过短）
const toSentence = (text?: string) => (text ? (text.endsWith('。') || text.endsWith('！') || text.endsWith('？') ? text : text + '。') : '')
const joinSentences = (parts: (string | undefined)[]) => parts.map(toSentence).join('')

const buildLongFromSection = (sec: { description: string; strengths?: string[]; challenges?: string[]; tips?: string[] }) => {
  const s1 = toSentence(sec.description)
  const s2 = sec.strengths && sec.strengths.length ? `优势包括：${sec.strengths.join('、')}。` : ''
  const s3 = sec.challenges && sec.challenges.length ? `可能的注意事项：${sec.challenges.join('、')}。` : ''
  const s4 = sec.tips && sec.tips.length ? `实用建议：${sec.tips.join('；')}。` : ''
  return [s1, s2, s3, s4].join('')
}

const buildLongJung = (jungFunctions: string[], fallback?: string) => {
  const order = jungFunctions.join(' · ')
  const s1 = `你的功能顺序为：${order}。`
  const s2 = jungFunctions[0] ? `主导功能优势：${jungFunctions[0]}，请安排能发挥该功能的高价值任务。` : ''
  const s3 = jungFunctions[1] ? `辅助功能优势：${jungFunctions[1]}，在协作中可作为稳定输出的基座。` : ''
  const s4 = jungFunctions[2] ? `第三功能常见盲点：${jungFunctions[2]}，建议设置流程性护栏与同伴审阅。` : ''
  const s5 = jungFunctions[3] ? `第四功能容易被忽视：${jungFunctions[3]}，以“低剂量训练+休息”方式逐步补齐。` : ''
  const s6 = '每周做一次功能平衡复盘：记录本周被哪一功能过度驱动、造成了哪些偏差，以及下周如何用其他功能对冲。将功能语言化（如“我现在在用Ne/Fi/Te…”），帮助团队理解你的思考模式并提升协作效率。'
  return (fallback || '') + [s1, s2, s3, s4, s5, s6].map(toSentence).join('')
}

const buildLongShadow = (shadowType: string, fallback?: string) => {
  const s1 = `在高压或能量透支时，可能短暂呈现 ${shadowType} 的影子特征。`
  const s2 = '识别信号：突然迷恋流程细节并以此否认他人；大量使用“应该/不应该”的评判；在讨论中频繁打断或情绪抽离；以控制取代协作。'
  const s3 = '应对策略：暂停输入，做15分钟静息/步行；回到“最小下一步”，把任务缩减为30–60分钟的原型；邀请可信同伴进行5分钟事实复述，区分感受与事实；会后做简短复盘，记录触发因素与可替代行为。影子面不是敌人，而是提醒我们需要边界、节奏与复盘。'
  return (fallback || '') + [s1, s2, s3].map(toSentence).join('')
}

const expanded = computed(() => {
  const p = profile.value
  return {
    career: p.longCareer ?? buildLongFromSection(p.career),
    relationship: p.longRelationship ?? buildLongFromSection(p.relationship),
    social: p.longSocial ?? buildLongFromSection(p.social),
    personality: p.longPersonality ?? joinSentences([p.personality.analysis, `核心特质：${p.personality.traits.join('、')}`]),
    jung: p.longJung ?? buildLongJung(p.jungFunctions),
    shadow: p.longShadow ?? buildLongShadow(store.shadowType),
    summary: p.longSummary ?? joinSentences([`你的核心价值：${p.subtitle}`, `继续发扬：${p.career.strengths.slice(0,4).join('、')}`, `重点改善：${p.career.challenges.slice(0,4).join('、')}`])
  }
})
const result = computed(() => ({
  type: profile.value.type,
  name: profile.value.name,
  subtitle: profile.value.subtitle
}))

// 人格图像 + 兜底
const characterImage = computed(() => `/images/characters/${result.value.type.toLowerCase()}.png`)
const onCharacterImgError = (e: Event) => {
  (e.target as HTMLImageElement).src = '/images/avatar-placeholder.svg'
}

// 动态章节
const dynamicSections = computed(() => [
    { ...profile.value.career, description: expanded.value.career },
    { ...profile.value.relationship, description: expanded.value.relationship },
    { ...profile.value.social, description: expanded.value.social },
  {
    id: 'personality',
    title: '人格特征分析',
    subtitle: '你的核心特质与功能堆栈',
    icon: '🧠',
      description: expanded.value.personality,
      strengths: profile.value.personality.traits,
      challenges: profile.value.career.challenges.slice(0, 4),
    tips: profile.value.growth
  },
    {
      id: 'celeb',
      title: '相同人格名人',
      subtitle: '看看谁与你相似',
      icon: '⭐',
      description: '与你类型相近的公众人物：' + profile.value.celebrities.join('、'),
      strengths: profile.value.personality.traits.slice(0, 4),
      challenges: profile.value.career.challenges.slice(0, 3),
      tips: []
    },
    {
      id: 'jung',
      title: '荣格八维分析',
      subtitle: '功能视角理解你',
      icon: '🔧',
      description: expanded.value.jung,
      strengths: [
        `主导功能优势：${profile.value.jungFunctions[0] || ''}`,
        `辅助功能优势：${profile.value.jungFunctions[1] || ''}`
      ],
      challenges: [
        `第三功能盲点：${profile.value.jungFunctions[2] || ''}`,
        `第四功能盲点：${profile.value.jungFunctions[3] || ''}`
      ],
      tips: [
        '为主导/辅助功能设计“优势场景”：周内安排能发挥主导与辅助功能的高价值任务；',
        '第三/第四功能做“保底机制”：对第三与第四功能的盲点设置流程性护栏（检查清单/复述/同伴审阅）；',
        '每周一次功能平衡复盘：记录本周在哪些场景被某一功能“过度驱动”，下一周如何用其他功能对冲；',
        '将功能语言化：用“我现在在用Ne/Fi/Te/Si…”描述当下状态，帮助团队理解你的思考模式并便于协作'
      ]
    },
    {
      id: 'shadow',
      title: '隐藏人格',
      subtitle: '压力下的影子面',
      icon: '🌑',
      description: expanded.value.shadow,
      strengths: ['影子面的提醒价值：需要边界/节奏/复盘', '通过暂停与原型拆解恢复掌控', '与可信同伴复述事实，降低情绪失真'],
      challenges: ['可能出现苛责与僵化，否定当下创造', '频繁使用“应该/不应该”的评判语言', '会议中高频打断与强控制、或情绪抽离'],
      tips: ['识别触发因素', '用休息与复盘恢复主功能']
    }
])

const dynamicSummary = computed(() => ({
  coreValue: `你的核心价值：${profile.value.subtitle}`,
  keepDoing: profile.value.career.strengths.slice(0, 4),
  improvements: profile.value.career.challenges.slice(0, 4)
}))

const goBack = () => {
  router.push('/result')
}
</script>