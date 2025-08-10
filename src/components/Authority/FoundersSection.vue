<template>
  <section class="py-20 bg-white">
    <div class="container">
      <div class="text-center mb-16">
        <h2 class="section-title">理论奠基人</h2>
        <p class="section-subtitle">MBTI理论的创立凝聚了多位心理学大师的智慧结晶</p>
      </div>
      
      <div class="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
        <!-- 卡尔·荣格 - 主要位置 -->
        <div 
          class="founder-card primary group cursor-pointer transform hover:scale-105 transition-all duration-300"
          @click="showFounderModal('jung')"
        >
          <div class="founder-avatar">
            <img 
              src="/images/founders/carl-jung-real.jpg" 
              alt="卡尔·荣格"
              class="avatar-image"
              loading="lazy"
              @error="handleImageError"
            >
            <!-- 脉冲光环效果 -->
            <div class="avatar-ring"></div>
            <div class="avatar-badge">理论创始人</div>
          </div>
          <div class="founder-info">
            <h3>卡尔·荣格</h3>
            <p class="title">瑞士著名心理学家</p>
            <p class="contribution">心理类型理论创始人</p>
            <p class="description">
              首次提出内向/外向概念，《心理类型》奠定了MBTI理论基础。
              分析心理学创始人，20世纪最具影响力的心理学家之一。
            </p>
            <div class="founder-achievements">
              <span class="achievement">分析心理学创始人</span>
              <span class="achievement">集体无意识理论</span>
            </div>
          </div>
        </div>

        <!-- 伊莎贝尔·迈尔斯 -->
        <div 
          class="founder-card group cursor-pointer transform hover:scale-105 transition-all duration-300"
          @click="showFounderModal('myers')"
        >
          <div class="founder-avatar">
            <img 
              src="/images/founders/isabel-myers-placeholder.jpg" 
              alt="伊莎贝尔·迈尔斯"
              class="avatar-image"
              @error="handleImageError"
            >
          </div>
          <div class="founder-info">
            <h3>伊莎贝尔·迈尔斯</h3>
            <p class="title">MBTI测试开发者</p>
            <p class="contribution">现代MBTI创立者</p>
            <p class="description">
              与母亲凯瑟琳·布里格斯共同开发MBTI测试，
              将荣格理论转化为实用的测评工具。
            </p>
            <div class="founder-achievements">
              <span class="achievement">MBTI测试开发</span>
              <span class="achievement">理论实用化</span>
            </div>
          </div>
        </div>

        <!-- 凯瑟琳·布里格斯 -->
        <div 
          class="founder-card group cursor-pointer transform hover:scale-105 transition-all duration-300"
          @click="showFounderModal('briggs')"
        >
          <div class="founder-avatar">
            <img 
              src="/images/founders/katharine-briggs-real.jpg" 
              alt="凯瑟琳·布里格斯"
              class="avatar-image"
              @error="handleImageError"
            >
          </div>
          <div class="founder-info">
            <h3>凯瑟琳·布里格斯</h3>
            <p class="title">MBTI共同创立者</p>
            <p class="contribution">理论体系化先驱</p>
            <p class="description">
              首先发现荣格理论的实用价值，
              开始系统化研究不同性格类型的特征。
            </p>
            <div class="founder-achievements">
              <span class="achievement">类型研究先驱</span>
              <span class="achievement">理论体系化</span>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- 创始人详情弹窗 -->
    <FounderModal 
      v-if="activeFounder"
      :founder="activeFounder"
      @close="closeModal"
    />
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import FounderModal from '@/components/UI/FounderModal.vue'

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

const activeFounder = ref<Founder | null>(null)

const foundersData: Record<string, Founder> = {
  jung: {
    id: 'jung',
    name: '卡尔·古斯塔夫·荣格',
    title: '瑞士心理学家、精神病医师',
    image: '/images/founders/carl-jung-real.jpg',
    biography: `
      卡尔·古斯塔夫·荣格（1875-1961）是20世纪最具影响力的心理学家之一，
      分析心理学的创始人。他首次提出了内向和外向的概念，并在1921年出版的
      《心理类型》一书中系统阐述了心理类型理论，为后来的MBTI奠定了理论基础。
    `,
    achievements: [
      '分析心理学创始人',
      '集体无意识理论提出者',
      '心理类型理论奠基人',
      '原型理论创立者',
      '积极想象疗法开发者'
    ],
    quotes: [
      '你的视野会被你的品格所限制。',
      '一个人最大的困难就是认识自己。',
      '内向的人从内部世界获得能量，外向的人从外部世界获得能量。'
    ],
    timeline: [
      { year: 1875, event: '生于瑞士凯斯维尔' },
      { year: 1900, event: '获得医学博士学位' },
      { year: 1907, event: '与弗洛伊德开始合作' },
      { year: 1913, event: '与弗洛伊德分道扬镳' },
      { year: 1921, event: '出版《心理类型》' },
      { year: 1961, event: '逝世于瑞士' }
    ]
  },
  myers: {
    id: 'myers',
    name: '伊莎贝尔·布里格斯·迈尔斯',
    title: 'MBTI测试开发者',
    image: '/images/founders/isabel-myers-real.jpg',
    biography: `
      伊莎贝尔·布里格斯·迈尔斯（1897-1980）与母亲凯瑟琳·布里格斯共同开发了MBTI测试。
      她致力于将荣格的心理类型理论转化为实用的测评工具，使普通人能够更好地理解自己的性格。
    `,
    achievements: [
      'MBTI测试共同开发者',
      '心理类型实用化先驱',
      'MBTI手册编写者',
      '性格测评标准化推动者'
    ],
    quotes: [
      '理解自己的类型可以帮助我们更好地发挥优势。',
      '每种性格类型都有其独特的价值和贡献。'
    ],
    timeline: [
      { year: 1897, event: '出生于美国' },
      { year: 1943, event: '开始开发MBTI指标' },
      { year: 1962, event: '发布首个MBTI手册' },
      { year: 1975, event: 'MBTI在企业中推广' },
      { year: 1980, event: '逝世' }
    ]
  },
  briggs: {
    id: 'briggs',
    name: '凯瑟琳·库克·布里格斯',
    title: 'MBTI理论先驱',
    image: '/images/founders/katharine-briggs-real.jpg',
    biography: `
      凯瑟琳·库克·布里格斯（1875-1968）是MBTI理论的先驱者。
      她最早发现了荣格心理类型理论的实用价值，并开始系统化研究不同性格类型的特征，
      为后来的MBTI测试奠定了基础。
    `,
    achievements: [
      'MBTI理论体系化先驱',
      '性格类型观察研究者',
      '荣格理论实用化倡导者'
    ],
    quotes: [
      '每个人都有独特的性格类型，理解这些差异很重要。',
      '观察和理解人的性格差异是一门艺术。'
    ],
    timeline: [
      { year: 1875, event: '出生于美国' },
      { year: 1920, event: '开始研究性格类型' },
      { year: 1943, event: '与女儿开发MBTI' },
      { year: 1968, event: '逝世' }
    ]
  }
}

const showFounderModal = (founderId: string) => {
  activeFounder.value = foundersData[founderId]
}

const closeModal = () => {
  activeFounder.value = null
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  // 使用默认头像或占位符
  img.src = '/images/avatar-placeholder.svg'
}
</script>

<style scoped>
.founder-card {
  @apply bg-white border rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all duration-300 text-center;
}

.founder-card.primary {
  @apply border-primary-200 relative;
}

.founder-card.primary::before {
  content: '';
  @apply absolute inset-0 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl opacity-50;
}

.founder-card.primary .founder-info {
  @apply relative z-10;
}

.founder-avatar {
  @apply relative w-24 h-24 mx-auto mb-6;
}

.avatar-image {
  @apply w-full h-full rounded-full object-cover;
  filter: grayscale(10%);
}

.founder-card.primary .avatar-image {
  @apply border-4 border-primary-200;
}

.founder-card.primary .avatar-ring {
  @apply absolute -inset-1 border-4 border-primary-400 rounded-full animate-pulse-ring;
}

.avatar-badge {
  @apply absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-primary-500 text-white text-xs px-3 py-1 rounded-full font-medium;
}

.founder-info h3 {
  @apply text-xl font-bold text-gray-900 mb-2;
}

.founder-info .title {
  @apply text-primary-600 font-semibold mb-2;
}

.founder-info .contribution {
  @apply text-success font-medium text-sm mb-3;
}

.founder-info .description {
  @apply text-gray-600 text-sm leading-relaxed mb-4;
}

.founder-achievements {
  @apply flex flex-wrap gap-2 justify-center;
}

.achievement {
  @apply bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full;
}

.endorsement-item {
  @apply text-center;
}

@keyframes pulse-ring {
  0% { 
    transform: scale(1); 
    opacity: 1; 
  }
  100% { 
    transform: scale(1.2); 
    opacity: 0; 
  }
}
</style>