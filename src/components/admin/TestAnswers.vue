<template>
  <div class="test-answers-container">
    <div class="header">
      <h3>测试答案详情</h3>
      <button @click="$emit('close')" class="close-btn">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>

    <div v-if="isLoading" class="loading">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>

    <div v-else-if="answers.length === 0" class="no-data">
      <p>暂无答案数据</p>
    </div>

    <div v-else class="answers-content">
      <!-- 答案统计 -->
      <div class="stats-section">
        <h4>答案统计</h4>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">总题数</span>
            <span class="stat-value">{{ totalQuestions }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">已答题数</span>
            <span class="stat-value">{{ answeredQuestions }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">平均用时</span>
            <span class="stat-value">{{ averageTime }}秒</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">完成率</span>
            <span class="stat-value">{{ completionRate }}%</span>
          </div>
        </div>
      </div>

      <!-- 答案列表 -->
      <div class="answers-section">
        <h4>详细答案</h4>
        <div class="answers-list">
          <div v-for="answer in answers" :key="answer.id" class="answer-item">
            <div class="answer-header">
              <span class="question-number">第{{ answer.question_index + 1 }}题</span>
              <span class="dimension-tag" :class="getDimensionClass(answer.dimension)">
                {{ getDimensionName(answer.dimension) }}
              </span>
              <span class="time-spent">{{ answer.time_spent_seconds }}秒</span>
            </div>
            
            <div class="question-text">
              {{ answer.question_text || '题目内容未记录' }}
            </div>
            
            <div class="answer-content">
              <div class="answer-choice">
                <span class="choice-label">选择:</span>
                <span class="choice-text">{{ answer.answer_text || `选项${answer.answer_index + 1}` }}</span>
                <span class="choice-score" :class="getScoreClass(answer.answer_score)">
                  {{ answer.answer_score }}分
                </span>
              </div>
              
              <div v-if="answer.is_changed" class="change-info">
                <span class="change-badge">已修改</span>
                <span class="change-count">修改{{ answer.change_count }}次</span>
                <span v-if="answer.previous_answer_index !== null" class="previous-choice">
                  原选择: 选项{{ answer.previous_answer_index + 1 }}
                </span>
              </div>
            </div>
            
            <div class="answer-meta">
              <span class="answer-time">答题时间: {{ formatTime(answer.answer_time) }}</span>
              <span class="direction" :class="getDirectionClass(answer.direction)">
                {{ getDirectionText(answer.direction) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 维度分析 -->
      <div class="dimension-analysis">
        <h4>维度分析</h4>
        <div class="dimension-grid">
          <div v-for="dimension in dimensionStats" :key="dimension.name" class="dimension-item">
            <div class="dimension-header">
              <span class="dimension-name">{{ dimension.fullName }}</span>
              <span class="dimension-score">{{ dimension.score }}分</span>
            </div>
            <div class="dimension-progress">
              <div class="progress-bar">
                <div 
                  class="progress-fill" 
                  :style="{ width: dimension.percentage + '%' }"
                  :class="getDimensionClass(dimension.name)"
                ></div>
              </div>
              <span class="percentage">{{ dimension.percentage }}%</span>
            </div>
            <div class="dimension-details">
              <span>{{ dimension.count }}题 / {{ dimension.total }}题</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { config } from '../../config/index'

const props = defineProps({
  sessionId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['close'])

// 响应式数据
const answers = ref([])
const isLoading = ref(false)

// API基础URL
const API_BASE = config.api.baseUrl

// 计算属性
const totalQuestions = computed(() => {
  return Math.max(...answers.value.map(a => a.question_index)) + 1 || 0
})

const answeredQuestions = computed(() => {
  return answers.value.length
})

const averageTime = computed(() => {
  if (answers.value.length === 0) return 0
  const total = answers.value.reduce((sum, answer) => sum + (answer.time_spent_seconds || 0), 0)
  return Math.round(total / answers.value.length)
})

const completionRate = computed(() => {
  if (totalQuestions.value === 0) return 0
  return Math.round((answeredQuestions.value / totalQuestions.value) * 100)
})

const dimensionStats = computed(() => {
  const stats = {
    E: { name: 'E', fullName: '外向性 (E)', score: 0, count: 0, total: 0 },
    I: { name: 'I', fullName: '内向性 (I)', score: 0, count: 0, total: 0 },
    S: { name: 'S', fullName: '感觉 (S)', score: 0, count: 0, total: 0 },
    N: { name: 'N', fullName: '直觉 (N)', score: 0, count: 0, total: 0 },
    T: { name: 'T', fullName: '思考 (T)', score: 0, count: 0, total: 0 },
    F: { name: 'F', fullName: '情感 (F)', score: 0, count: 0, total: 0 },
    J: { name: 'J', fullName: '判断 (J)', score: 0, count: 0, total: 0 },
    P: { name: 'P', fullName: '感知 (P)', score: 0, count: 0, total: 0 }
  }

  answers.value.forEach(answer => {
    const dimension = answer.dimension
    if (stats[dimension]) {
      stats[dimension].score += answer.answer_score || 0
      stats[dimension].count += 1
    }
  })

  // 计算总题数和百分比
  Object.values(stats).forEach(stat => {
    stat.total = answers.value.filter(a => a.dimension === stat.name).length
    stat.percentage = stat.total > 0 ? Math.round((stat.score / (stat.total * 5)) * 100) : 0
  })

  return Object.values(stats).filter(stat => stat.total > 0)
})

// 方法
const loadAnswers = async () => {
  if (!props.sessionId) return
  
  isLoading.value = true
  try {
    const response = await fetch(`${API_BASE}/admin/sessions/${props.sessionId}/answers`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      answers.value = data.answers || []
    } else {
      console.error('获取答案失败:', response.statusText)
    }
  } catch (error) {
    console.error('获取答案错误:', error)
  } finally {
    isLoading.value = false
  }
}

const getDimensionName = (dimension) => {
  const names = {
    'E': '外向性',
    'I': '内向性', 
    'S': '感觉',
    'N': '直觉',
    'T': '思考',
    'F': '情感',
    'J': '判断',
    'P': '感知'
  }
  return names[dimension] || dimension
}

const getDimensionClass = (dimension) => {
  const classes = {
    'E': 'dimension-e',
    'I': 'dimension-i',
    'S': 'dimension-s', 
    'N': 'dimension-n',
    'T': 'dimension-t',
    'F': 'dimension-f',
    'J': 'dimension-j',
    'P': 'dimension-p'
  }
  return classes[dimension] || ''
}

const getScoreClass = (score) => {
  if (score >= 4) return 'score-high'
  if (score >= 3) return 'score-medium'
  return 'score-low'
}

const getDirectionClass = (direction) => {
  return direction > 0 ? 'direction-positive' : 'direction-negative'
}

const getDirectionText = (direction) => {
  return direction > 0 ? '正向' : '反向'
}

const formatTime = (timeString) => {
  if (!timeString) return '未记录'
  const date = new Date(timeString)
  return date.toLocaleString('zh-CN')
}

// 生命周期
onMounted(() => {
  loadAnswers()
})
</script>

<style scoped>
.test-answers-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-height: 90vh;
  overflow-y: auto;
  width: 100%;
  max-width: 1200px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
}

.header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  color: #6b7280;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #6b7280;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.no-data {
  text-align: center;
  padding: 40px;
  color: #6b7280;
}

.answers-content {
  padding: 20px;
}

.stats-section,
.answers-section,
.dimension-analysis {
  margin-bottom: 32px;
}

.stats-section h4,
.answers-section h4,
.dimension-analysis h4 {
  margin: 0 0 16px 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.stat-item {
  background: #f9fafb;
  padding: 16px;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  color: #6b7280;
  font-size: 0.875rem;
}

.stat-value {
  font-weight: 600;
  font-size: 1.125rem;
  color: #1f2937;
}

.answers-list {
  space-y: 16px;
}

.answer-item {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.answer-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.question-number {
  font-weight: 600;
  color: #1f2937;
}

.dimension-tag {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  color: white;
}

.dimension-e { background: #ef4444; }
.dimension-i { background: #3b82f6; }
.dimension-s { background: #10b981; }
.dimension-n { background: #f59e0b; }
.dimension-t { background: #8b5cf6; }
.dimension-f { background: #ec4899; }
.dimension-j { background: #06b6d4; }
.dimension-p { background: #84cc16; }

.time-spent {
  color: #6b7280;
  font-size: 0.875rem;
  margin-left: auto;
}

.question-text {
  background: #f9fafb;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 12px;
  color: #374151;
  line-height: 1.5;
}

.answer-content {
  margin-bottom: 12px;
}

.answer-choice {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.choice-label {
  color: #6b7280;
  font-size: 0.875rem;
}

.choice-text {
  font-weight: 500;
  color: #1f2937;
}

.choice-score {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.score-high {
  background: #dcfce7;
  color: #166534;
}

.score-medium {
  background: #fef3c7;
  color: #92400e;
}

.score-low {
  background: #fee2e2;
  color: #991b1b;
}

.change-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
}

.change-badge {
  background: #fbbf24;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.75rem;
}

.change-count,
.previous-choice {
  color: #6b7280;
}

.answer-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  color: #6b7280;
}

.direction {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.75rem;
}

.direction-positive {
  background: #dcfce7;
  color: #166534;
}

.direction-negative {
  background: #fee2e2;
  color: #991b1b;
}

.dimension-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.dimension-item {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
}

.dimension-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.dimension-name {
  font-weight: 600;
  color: #1f2937;
}

.dimension-score {
  font-weight: 600;
  color: #3b82f6;
}

.dimension-progress {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.percentage {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  min-width: 40px;
}

.dimension-details {
  color: #6b7280;
  font-size: 0.875rem;
}
</style>