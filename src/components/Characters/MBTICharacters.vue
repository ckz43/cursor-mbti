<template>
  <section class="py-20 bg-gradient-soft" ref="charactersRef">
    <div class="container">
      <div class="text-center mb-16">
        <h2 class="section-title">16种人格，哪一个是你？</h2>
        <p class="section-subtitle">每种人格都有独特的魅力和特征</p>
      </div>

      <div class="space-y-16">
        <!-- 分析师组 (NT) -->
        <div class="character-group analyst">
          <div class="group-header">
            <div class="group-icon">🧠</div>
            <h3 class="group-title">分析师 (NT)</h3>
            <p class="group-description">理性思考，追求知识和能力</p>
          </div>

          <div class="characters-grid">
            <div 
              v-for="character in analystTypes"
              :key="character.type"
              class="character-card"
              :data-type="character.type"
              @click="selectCharacter(character)"
              @mouseenter="preloadCharacterImage(character.type)"
            >
              <div class="character-avatar">
                <div class="character-image-container">
                  <!-- 使用真实卡通角色图片 -->
                  <img 
                    :src="character.image || '/images/characters/default.png'" 
                    :alt="character.name"
                    class="character-image"
                    loading="lazy"
                    @error="handleImageError"
                  >
                  <div class="character-emoji fallback">{{ character.emoji }}</div>
                </div>
                <div class="character-glow"></div>
              </div>

              <div class="character-info">
                <h4 class="character-name">{{ character.name }}</h4>
                <p class="character-type">{{ character.type }}</p>
                <p class="character-traits">{{ character.traits.join(' • ') }}</p>
              </div>

              <div class="character-stats">
                <div 
                  v-for="stat in character.stats"
                  :key="stat.name"
                  class="stat-bar"
                >
                  <span class="stat-name">{{ stat.name }}</span>
                  <div class="stat-progress">
                    <div 
                      class="stat-fill" 
                      :style="{ width: `${stat.value}%` }"
                    ></div>
                  </div>
                </div>
              </div>

              <!-- 悬停效果 -->
              <div class="character-overlay">
                <p class="overlay-text">点击了解更多</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 外交官组 (NF) -->
        <div class="character-group diplomat">
          <div class="group-header">
            <div class="group-icon">💝</div>
            <h3 class="group-title">外交官 (NF)</h3>
            <p class="group-description">重视人际关系，追求和谐与成长</p>
          </div>

          <div class="characters-grid">
            <div 
              v-for="character in diplomatTypes"
              :key="character.type"
              class="character-card"
              :data-type="character.type"
              @click="selectCharacter(character)"
            >
              <div class="character-avatar">
                <div class="character-image-container">
                  <div class="character-emoji">{{ character.emoji }}</div>
                </div>
                <div class="character-glow"></div>
              </div>

              <div class="character-info">
                <h4 class="character-name">{{ character.name }}</h4>
                <p class="character-type">{{ character.type }}</p>
                <p class="character-traits">{{ character.traits.join(' • ') }}</p>
              </div>

              <div class="character-stats">
                <div 
                  v-for="stat in character.stats"
                  :key="stat.name"
                  class="stat-bar"
                >
                  <span class="stat-name">{{ stat.name }}</span>
                  <div class="stat-progress">
                    <div 
                      class="stat-fill" 
                      :style="{ width: `${stat.value}%` }"
                    ></div>
                  </div>
                </div>
              </div>

              <div class="character-overlay">
                <p class="overlay-text">点击了解更多</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 守护者组 (SJ) -->
        <div class="character-group sentinel">
          <div class="group-header">
            <div class="group-icon">🛡️</div>
            <h3 class="group-title">守护者 (SJ)</h3>
            <p class="group-description">稳重可靠，重视传统和秩序</p>
          </div>

          <div class="characters-grid">
            <div 
              v-for="character in sentinelTypes"
              :key="character.type"
              class="character-card"
              :data-type="character.type"
              @click="selectCharacter(character)"
            >
              <div class="character-avatar">
                <div class="character-image-container">
                  <div class="character-emoji">{{ character.emoji }}</div>
                </div>
                <div class="character-glow"></div>
              </div>

              <div class="character-info">
                <h4 class="character-name">{{ character.name }}</h4>
                <p class="character-type">{{ character.type }}</p>
                <p class="character-traits">{{ character.traits.join(' • ') }}</p>
              </div>

              <div class="character-stats">
                <div 
                  v-for="stat in character.stats"
                  :key="stat.name"
                  class="stat-bar"
                >
                  <span class="stat-name">{{ stat.name }}</span>
                  <div class="stat-progress">
                    <div 
                      class="stat-fill" 
                      :style="{ width: `${stat.value}%` }"
                    ></div>
                  </div>
                </div>
              </div>

              <div class="character-overlay">
                <p class="overlay-text">点击了解更多</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 探险家组 (SP) -->
        <div class="character-group explorer">
          <div class="group-header">
            <div class="group-icon">🎭</div>
            <h3 class="group-title">探险家 (SP)</h3>
            <p class="group-description">灵活应变，享受当下的体验</p>
          </div>

          <div class="characters-grid">
            <div 
              v-for="character in explorerTypes"
              :key="character.type"
              class="character-card"
              :data-type="character.type"
              @click="selectCharacter(character)"
            >
              <div class="character-avatar">
                <div class="character-image-container">
                  <div class="character-emoji">{{ character.emoji }}</div>
                </div>
                <div class="character-glow"></div>
              </div>

              <div class="character-info">
                <h4 class="character-name">{{ character.name }}</h4>
                <p class="character-type">{{ character.type }}</p>
                <p class="character-traits">{{ character.traits.join(' • ') }}</p>
              </div>

              <div class="character-stats">
                <div 
                  v-for="stat in character.stats"
                  :key="stat.name"
                  class="stat-bar"
                >
                  <span class="stat-name">{{ stat.name }}</span>
                  <div class="stat-progress">
                    <div 
                      class="stat-fill" 
                      :style="{ width: `${stat.value}%` }"
                    ></div>
                  </div>
                </div>
              </div>

              <div class="character-overlay">
                <p class="overlay-text">点击了解更多</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 测试引导CTA -->
      <div class="text-center mt-16">
        <div class="bg-white rounded-3xl p-8 lg:p-12 shadow-soft max-w-2xl mx-auto">
          <h3 class="text-2xl font-bold text-gray-900 mb-4">想知道你是哪种人格类型吗？</h3>
          <p class="text-gray-600 mb-8">基于荣格心理学理论的专业测评，只需5分钟</p>
          <button 
            class="btn-primary text-lg px-8 py-4 group"
            @click="startTest"
          >
            <span>开始专业测评</span>
            <svg class="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 角色详情弹窗 -->
    <CharacterModal 
      v-if="selectedCharacter"
      :character="selectedCharacter"
      @close="closeCharacterModal"
      @start-test="startTest"
    />
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import CharacterModal from '@/components/UI/CharacterModal.vue'

interface PersonalityType {
  type: string
  name: string
  emoji: string
  image?: string
  traits: string[]
  stats: { name: string; value: number }[]
  description: string
  strengths: string[]
  challenges: string[]
  careers: string[]
  relationships: string
}

const router = useRouter()
const charactersRef = ref<HTMLElement>()
const selectedCharacter = ref<PersonalityType | null>(null)

// 分析师组 (NT)
const analystTypes: PersonalityType[] = [
  {
    type: 'INTJ',
    name: '建筑师',
    emoji: '🏗️',
    image: '/images/characters/intj-stewie.png',
    traits: ['独立思考', '战略规划'],
    stats: [
      { name: '逻辑思维', value: 95 },
      { name: '创新能力', value: 88 },
      { name: '独立性', value: 92 }
    ],
    description: '独立的思考者，具有强烈的直觉和战略思维能力',
    strengths: ['系统思维', '长远规划', '独立决策'],
    challenges: ['过度完美主义', '难以妥协', '忽视他人感受'],
    careers: ['软件架构师', '投资分析师', '科学研究员'],
    relationships: '需要理解和空间的伴侣，重视智慧和独立'
  },
  {
    type: 'INTP',
    name: '思想家',
    emoji: '🤔',
    image: '/images/characters/intp-charlie-brown.png',
    traits: ['逻辑分析', '理论创新'],
    stats: [
      { name: '分析能力', value: 96 },
      { name: '创造力', value: 90 },
      { name: '客观性', value: 94 }
    ],
    description: '热爱理论和抽象概念的逻辑思考者',
    strengths: ['深度思考', '理论建构', '问题解决'],
    challenges: ['实践困难', '情感表达', '细节管理'],
    careers: ['哲学家', '数学家', '程序员'],
    relationships: '需要智力激发和理解的关系'
  },
  {
    type: 'ENTJ',
    name: '指挥官',
    emoji: '👨‍💼',
    image: '/images/characters/entj-cartman.png',
    traits: ['天生领导', '目标导向'],
    stats: [
      { name: '领导力', value: 97 },
      { name: '执行力', value: 93 },
      { name: '决策力', value: 95 }
    ],
    description: '天生的领导者，善于组织和激励他人',
    strengths: ['战略思维', '团队管理', '目标达成'],
    challenges: ['过于强势', '忽视情感', '完美主义'],
    careers: ['CEO', '项目经理', '律师'],
    relationships: '寻求能力匹配的伙伴关系'
  },
  {
    type: 'ENTP',
    name: '辩论家',
    emoji: '🗣️',
    traits: ['创新思维', '善于辩论'],
    stats: [
      { name: '创新力', value: 94 },
      { name: '沟通力', value: 91 },
      { name: '适应力', value: 89 }
    ],
    description: '富有创造力的思辨者，喜欢探索新的可能性',
    strengths: ['头脑风暴', '说服力', '快速学习'],
    challenges: ['缺乏持续性', '细节疏忽', '过度争论'],
    careers: ['创业者', '营销经理', '咨询师'],
    relationships: '需要智力刺激和自由的关系'
  }
]

// 外交官组 (NF)
const diplomatTypes: PersonalityType[] = [
  {
    type: 'INFJ',
    name: '提倡者',
    emoji: '🌟',
    traits: ['理想主义', '深度洞察'],
    stats: [
      { name: '直觉力', value: 96 },
      { name: '同理心', value: 94 },
      { name: '洞察力', value: 92 }
    ],
    description: '具有深刻洞察力的理想主义者',
    strengths: ['深度理解', '未来规划', '价值坚持'],
    challenges: ['过度敏感', '完美主义', '社交疲劳'],
    careers: ['心理咨询师', '作家', '社会工作者'],
    relationships: '寻求深度连接和意义的关系'
  },
  {
    type: 'INFP',
    name: '调停者',
    emoji: '🎨',
    traits: ['价值驱动', '创意表达'],
    stats: [
      { name: '创造力', value: 95 },
      { name: '价值感', value: 97 },
      { name: '适应力', value: 88 }
    ],
    description: '忠于自己价值观的创意理想主义者',
    strengths: ['创意表达', '价值坚持', '个人成长'],
    challenges: ['过度理想化', '决策困难', '冲突回避'],
    careers: ['艺术家', '治疗师', '编剧'],
    relationships: '重视真诚和个人成长的关系'
  },
  {
    type: 'ENFJ',
    name: '主人公',
    emoji: '🤝',
    traits: ['鼓舞他人', '天生导师'],
    stats: [
      { name: '影响力', value: 96 },
      { name: '同理心', value: 95 },
      { name: '沟通力', value: 93 }
    ],
    description: '富有魅力的天然领导者和导师',
    strengths: ['激励他人', '团队建设', '沟通表达'],
    challenges: ['过度付出', '忽视自我', '情绪化'],
    careers: ['教师', '培训师', '人力资源'],
    relationships: '专注于他人成长和和谐的关系'
  },
  {
    type: 'ENFP',
    name: '竞选者',
    emoji: '🎪',
    traits: ['热情洋溢', '社交能手'],
    stats: [
      { name: '热情度', value: 97 },
      { name: '创新力', value: 92 },
      { name: '社交力', value: 94 }
    ],
    description: '充满热情和创造力的自由灵魂',
    strengths: ['激发灵感', '人际连接', '创新思维'],
    challenges: ['缺乏专注', '情绪波动', '过度承诺'],
    careers: ['记者', '公关专员', '演员'],
    relationships: '寻求激情和成长的动态关系'
  }
]

// 守护者组 (SJ)
const sentinelTypes: PersonalityType[] = [
  {
    type: 'ISTJ',
    name: '物流师',
    emoji: '📋',
    traits: ['可靠稳重', '条理清晰'],
    stats: [
      { name: '可靠性', value: 97 },
      { name: '组织力', value: 94 },
      { name: '专注力', value: 92 }
    ],
    description: '实用可靠的现实主义者',
    strengths: ['责任感强', '计划周密', '执行力强'],
    challenges: ['变化适应', '情感表达', '创新思维'],
    careers: ['会计师', '项目管理', '工程师'],
    relationships: '重视稳定和承诺的长期关系'
  },
  {
    type: 'ISFJ',
    name: '守护者',
    emoji: '🤗',
    image: '/images/characters/isfj-marge.png',
    traits: ['温暖体贴', '默默奉献'],
    stats: [
      { name: '关怀度', value: 96 },
      { name: '责任感', value: 94 },
      { name: '细心度', value: 95 }
    ],
    description: '温暖贴心的保护者和照顾者',
    strengths: ['细心关怀', '支持他人', '记忆力强'],
    challenges: ['过度付出', '压力承受', '自我主张'],
    careers: ['护士', '教师', '社工'],
    relationships: '专注于支持和照顾他人的关系'
  },
  {
    type: 'ESTJ',
    name: '总经理',
    emoji: '👔',
    traits: ['组织管理', '执行力强'],
    stats: [
      { name: '组织力', value: 96 },
      { name: '执行力', value: 95 },
      { name: '领导力', value: 91 }
    ],
    description: '优秀的管理者和组织者',
    strengths: ['目标导向', '团队管理', '执行效率'],
    challenges: ['固执己见', '情感忽视', '变化适应'],
    careers: ['销售经理', '运营总监', '银行家'],
    relationships: '重视传统和稳定的关系结构'
  },
  {
    type: 'ESFJ',
    name: '执政官',
    emoji: '🌺',
    traits: ['和谐友善', '服务他人'],
    stats: [
      { name: '社交力', value: 95 },
      { name: '协调力', value: 93 },
      { name: '服务心', value: 96 }
    ],
    description: '关心他人福祉的温暖协调者',
    strengths: ['人际和谐', '团队合作', '服务精神'],
    challenges: ['过分在意他人', '冲突回避', '自我忽视'],
    careers: ['客服经理', '活动策划', '医护人员'],
    relationships: '重视和谐与相互支持的关系'
  }
]

// 探险家组 (SP)
const explorerTypes: PersonalityType[] = [
  {
    type: 'ISTP',
    name: '鉴赏家',
    emoji: '🔧',
    traits: ['动手实践', '冷静分析'],
    stats: [
      { name: '实践力', value: 95 },
      { name: '分析力', value: 91 },
      { name: '冷静度', value: 94 }
    ],
    description: '灵活实用的问题解决者',
    strengths: ['实际操作', '危机处理', '逻辑分析'],
    challenges: ['情感表达', '长期规划', '社交互动'],
    careers: ['机械师', '程序员', '飞行员'],
    relationships: '重视自由和独立的关系'
  },
  {
    type: 'ISFP',
    name: '探险家',
    emoji: '🎭',
    traits: ['艺术气息', '自由灵魂'],
    stats: [
      { name: '艺术感', value: 96 },
      { name: '敏感度', value: 94 },
      { name: '适应力', value: 89 }
    ],
    description: '温和的艺术家和冒险者',
    strengths: ['审美能力', '价值坚持', '适应变化'],
    challenges: ['竞争环境', '时间管理', '批评处理'],
    careers: ['设计师', '摄影师', '音乐家'],
    relationships: '寻求美好和深度连接的关系'
  },
  {
    type: 'ESTP',
    name: '企业家',
    emoji: '🏃‍♂️',
    traits: ['行动派', '适应力强'],
    stats: [
      { name: '行动力', value: 97 },
      { name: '适应力', value: 95 },
      { name: '影响力', value: 90 }
    ],
    description: '精力充沛的实用主义者',
    strengths: ['快速行动', '危机应对', '人际影响'],
    challenges: ['长期规划', '理论学习', '细节关注'],
    careers: ['销售员', '企业家', '运动员'],
    relationships: '享受活跃和刺激的关系'
  },
  {
    type: 'ESFP',
    name: '表演者',
    emoji: '🎪',
    image: '/images/characters/esfp-homer-real.png',
    traits: ['活泼外向', '享受当下'],
    stats: [
      { name: '热情度', value: 96 },
      { name: '社交力', value: 95 },
      { name: '表现力', value: 94 }
    ],
    description: '自发且热情的娱乐者',
    strengths: ['激发氛围', '人际连接', '即兴发挥'],
    challenges: ['长期规划', '批评处理', '独处时间'],
    careers: ['演员', '导游', '活动主持'],
    relationships: '享受快乐和分享的关系'
  }
]

const selectCharacter = (character: PersonalityType) => {
  selectedCharacter.value = character
}

const closeCharacterModal = () => {
  selectedCharacter.value = null
}

const startTest = () => {
  router.push('/test')
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  console.log(`Failed to load image: ${img.src}`)
  // 隐藏图片，显示emoji作为后备
  img.style.display = 'none'
  const fallback = img.nextElementSibling as HTMLElement
  if (fallback) {
    fallback.style.display = 'flex'
  }
}

// 图片预加载
const preloadCharacterImage = (type: string) => {
  // 预加载逻辑，如果有实际图片的话
  console.log(`Preloading image for ${type}`)
}

// 滚动动画
onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in')
        }
      })
    },
    { threshold: 0.1 }
  )

  const characterCards = charactersRef.value?.querySelectorAll('.character-card')
  characterCards?.forEach(card => observer.observe(card))
})
</script>

<style scoped>
.group-header {
  @apply text-center mb-12;
}

.group-icon {
  @apply text-6xl mb-4;
}

.group-title {
  @apply text-2xl font-bold text-gray-900 mb-2;
}

.group-description {
  @apply text-gray-600;
}

.characters-grid {
  @apply grid sm:grid-cols-2 lg:grid-cols-4 gap-6;
}

.character-card {
  @apply bg-white rounded-2xl p-6 shadow-soft hover:shadow-medium 
         cursor-pointer transition-all duration-300 relative overflow-hidden
         transform hover:-translate-y-2 hover:scale-105;
}

.character-card::before {
  content: '';
  @apply absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-secondary-500
         transform scale-x-0 transition-transform duration-300;
}

.character-card:hover::before {
  @apply scale-x-100;
}

.character-avatar {
  @apply relative w-20 h-20 mx-auto mb-4;
}

.character-image-container {
  @apply w-full h-full rounded-full bg-gradient-to-br from-primary-100 to-secondary-100
         flex items-center justify-center transition-transform duration-300;
}

.character-card:hover .character-image-container {
  @apply transform scale-110 rotate-6;
}

.character-emoji {
  @apply text-3xl;
}

.character-image {
  @apply w-full h-full object-cover rounded-full;
}

.character-emoji.fallback {
  @apply hidden absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl;
}

.character-glow {
  @apply absolute inset-0 rounded-full bg-gradient-to-r from-primary-400 to-secondary-400
         opacity-0 blur-md transition-opacity duration-300;
}

.character-card:hover .character-glow {
  @apply opacity-20;
}

.character-info {
  @apply text-center mb-4;
}

.character-name {
  @apply text-lg font-bold text-gray-900 mb-1;
}

.character-type {
  @apply text-sm font-bold text-primary-600 mb-2 tracking-wide;
}

.character-traits {
  @apply text-xs text-gray-600;
}

.character-stats {
  @apply space-y-2 mb-4;
}

.stat-bar {
  @apply flex items-center gap-2;
}

.stat-name {
  @apply text-xs text-gray-500 w-16 flex-shrink-0;
}

.stat-progress {
  @apply flex-1 h-1 bg-gray-200 rounded-full overflow-hidden;
}

.stat-fill {
  @apply h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full
         transition-all duration-1000;
}

.character-overlay {
  @apply absolute inset-0 bg-gradient-to-t from-primary-600 to-transparent
         flex items-end justify-center pb-4 opacity-0 transition-opacity duration-300;
}

.character-card:hover .character-overlay {
  @apply opacity-100;
}

.overlay-text {
  @apply text-white text-sm font-medium;
}

/* 组别颜色主题 */
.analyst .character-card:hover::before {
  @apply from-purple-500 to-blue-500;
}

.diplomat .character-card:hover::before {
  @apply from-green-500 to-teal-500;
}

.sentinel .character-card:hover::before {
  @apply from-blue-500 to-cyan-500;
}

.explorer .character-card:hover::before {
  @apply from-orange-500 to-red-500;
}

.animate-in {
  @apply animate-fade-in-up;
}
</style>