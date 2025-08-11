<template>
  <div class="test-detail">
    <!-- 测试基本信息 -->
    <div class="detail-section">
      <h4 class="section-title">测试基本信息</h4>
      <div class="info-grid">
        <div class="info-item">
          <label>会话ID</label>
          <span class="session-id">{{ test.session_id }}</span>
        </div>
        <div class="info-item">
          <label>用户ID</label>
          <span class="user-id">{{ test.user_id }}</span>
        </div>
        <div class="info-item">
          <label>测试状态</label>
          <span class="status-badge" :class="getStatusClass(test.status)">
            {{ getStatusText(test.status) }}
          </span>
        </div>
        <div class="info-item">
          <label>测试结果</label>
          <span v-if="test.result_type" class="result-badge" :class="test.result_type.toLowerCase()">
            {{ test.result_type }}
          </span>
          <span v-else class="no-result">未完成</span>
        </div>
        <div class="info-item">
          <label>开始时间</label>
          <span>{{ formatDate(test.created_at) }}</span>
        </div>
        <div class="info-item">
          <label>完成时间</label>
          <span>{{ formatDate(test.completed_at) || '未完成' }}</span>
        </div>
        <div class="info-item">
          <label>测试时长</label>
          <span>{{ formatDuration(test.test_duration) }}</span>
        </div>
        <div class="info-item">
          <label>答题数量</label>
          <span>{{ test.answer_count || 0 }} / {{ test.total_questions || 60 }} 题</span>
        </div>
        <div class="info-item">
          <label>完成率</label>
          <span class="completion-rate">
            {{ getCompletionRate(test) }}%
          </span>
        </div>
        <div class="info-item">
          <label>更新时间</label>
          <span>{{ formatDate(test.updated_at) }}</span>
        </div>
      </div>
    </div>
    
    <!-- 用户信息 -->
    <div v-if="test.user" class="detail-section">
      <h4 class="section-title">用户信息</h4>
      <div class="user-info-card">
        <div class="user-avatar">
          <div class="avatar">{{ getUserAvatar(test.user) }}</div>
        </div>
        <div class="user-details">
          <div class="user-name">{{ test.user.nickname || '未设置昵称' }}</div>
          <div class="user-meta">
            <span class="meta-item">邮箱: {{ test.user.email || '未设置' }}</span>
            <span class="meta-item">手机: {{ test.user.phone || '未设置' }}</span>
            <span class="meta-item">性别: {{ getGenderText(test.user.gender) }}</span>
            <span class="meta-item">年龄: {{ test.user.age || '未设置' }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 测试结果详情 -->
    <div v-if="test.result_details" class="detail-section">
      <h4 class="section-title">测试结果详情</h4>
      <div class="result-details-card">
        <div class="result-content">
          {{ test.result_details }}
        </div>
      </div>
    </div>
    
    <!-- 维度得分 -->
    <div v-if="test.dimension_scores" class="detail-section">
      <h4 class="section-title">维度得分</h4>
      <div class="dimension-scores">
        <div 
          v-for="(score, dimension) in parseDimensionScores(test.dimension_scores)" 
          :key="dimension" 
          class="dimension-item"
        >
          <div class="dimension-header">
            <span class="dimension-name">{{ getDimensionName(dimension) }}</span>
            <span class="dimension-score">{{ score }}%</span>
          </div>
          <div class="dimension-bar">
            <div 
              class="dimension-fill" 
              :style="{ width: score + '%', backgroundColor: getDimensionColor(dimension) }"
            ></div>
          </div>
          <div class="dimension-description">
            {{ getDimensionDescription(dimension, score) }}
          </div>
        </div>
      </div>
    </div>
    
    <!-- 答题进度 -->
    <div class="detail-section">
      <h4 class="section-title">答题进度</h4>
      <div class="progress-section">
        <div class="progress-stats">
          <div class="stat-item">
            <span class="stat-label">总题数:</span>
            <span class="stat-value">{{ test.total_questions || 60 }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">已答题:</span>
            <span class="stat-value">{{ test.answer_count || 0 }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">剩余题:</span>
            <span class="stat-value">{{ (test.total_questions || 60) - (test.answer_count || 0) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">完成率:</span>
            <span class="stat-value">{{ getCompletionRate(test) }}%</span>
          </div>
        </div>
        
        <div class="progress-visual">
          <div class="progress-bar-large">
            <div 
              class="progress-fill-large" 
              :style="{ width: getCompletionRate(test) + '%' }"
            ></div>
          </div>
          <div class="progress-text">{{ getCompletionRate(test) }}% 完成</div>
        </div>
      </div>
    </div>
    
    <!-- 时间统计 -->
    <div class="detail-section">
      <h4 class="section-title">时间统计</h4>
      <div class="time-stats">
        <div class="time-item">
          <div class="time-icon">⏱️</div>
          <div class="time-content">
            <div class="time-value">{{ formatDuration(test.test_duration) }}</div>
            <div class="time-label">总测试时长</div>
          </div>
        </div>
        
        <div class="time-item">
          <div class="time-icon">📅</div>
          <div class="time-content">
            <div class="time-value">{{ formatDate(test.created_at, 'date') }}</div>
            <div class="time-label">开始日期</div>
          </div>
        </div>
        
        <div class="time-item">
          <div class="time-icon">🕐</div>
          <div class="time-content">
            <div class="time-value">{{ formatDate(test.created_at, 'time') }}</div>
            <div class="time-label">开始时间</div>
          </div>
        </div>
        
        <div v-if="test.completed_at" class="time-item">
          <div class="time-icon">✅</div>
          <div class="time-content">
            <div class="time-value">{{ formatDate(test.completed_at, 'time') }}</div>
            <div class="time-label">完成时间</div>
          </div>
        </div>
        
        <div class="time-item">
          <div class="time-icon">⚡</div>
          <div class="time-content">
            <div class="time-value">{{ getAverageTimePerQuestion(test) }}</div>
            <div class="time-label">平均每题用时</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 操作按钮 -->
    <div class="action-section">
      <button @click="viewAnswers" class="action-button answers-btn">
        📋 查看答案详情
      </button>
      <button @click="exportTest" class="action-button export-btn">
        📊 导出测试数据
      </button>
      <button 
        v-if="test.status === 'in_progress'"
        @click="markAbandoned" 
        class="action-button abandon-btn"
      >
        🚫 标记为放弃
      </button>
      <button @click="deleteTest" class="action-button delete-btn">
        🗑️ 删除测试
      </button>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

// 组件属性
const props = defineProps({
  test: {
    type: Object,
    required: true
  }
})

// 组件事件
const emit = defineEmits(['close', 'viewAnswers', 'markAbandoned', 'deleteTest'])

// 查看答案详情
const viewAnswers = () => {
  emit('viewAnswers', props.test)
}

// 导出测试数据
const exportTest = () => {
  alert('导出测试数据功能开发中...')
}

// 标记为放弃
const markAbandoned = () => {
  if (confirm(`确定要将测试 "${props.test.session_id}" 标记为放弃吗？`)) {
    emit('markAbandoned', props.test)
  }
}

// 删除测试
const deleteTest = () => {
  if (confirm(`确定要删除测试 "${props.test.session_id}" 吗？此操作不可恢复！`)) {
    emit('deleteTest', props.test)
  }
}

// 工具函数
const getUserAvatar = (user) => {
  if (!user || !user.nickname) return '?'
  return user.nickname.charAt(0).toUpperCase()
}

const getGenderText = (gender) => {
  const genderMap = {
    'male': '男',
    'female': '女',
    'other': '其他'
  }
  return genderMap[gender] || '未知'
}

const getStatusText = (status) => {
  const statusMap = {
    'completed': '已完成',
    'in_progress': '进行中',
    'abandoned': '已放弃'
  }
  return statusMap[status] || status || '未知'
}

const getStatusClass = (status) => {
  const classMap = {
    'completed': 'completed',
    'in_progress': 'in-progress',
    'abandoned': 'abandoned'
  }
  return classMap[status] || 'unknown'
}

const getCompletionRate = (test) => {
  if (test.completion_rate) {
    return Math.round(test.completion_rate * 100)
  }
  const answered = test.answer_count || 0
  const total = test.total_questions || 60
  return Math.round((answered / total) * 100)
}

const parseDimensionScores = (scores) => {
  if (typeof scores === 'string') {
    try {
      return JSON.parse(scores)
    } catch {
      return {}
    }
  }
  return scores || {}
}

const getDimensionName = (dimension) => {
  const dimensionMap = {
    'E': '外向性 (Extraversion)',
    'I': '内向性 (Introversion)',
    'S': '感觉 (Sensing)',
    'N': '直觉 (Intuition)',
    'T': '思考 (Thinking)',
    'F': '情感 (Feeling)',
    'J': '判断 (Judging)',
    'P': '知觉 (Perceiving)'
  }
  return dimensionMap[dimension] || dimension
}

const getDimensionColor = (dimension) => {
  const colorMap = {
    'E': '#3b82f6',
    'I': '#8b5cf6',
    'S': '#10b981',
    'N': '#f59e0b',
    'T': '#ef4444',
    'F': '#ec4899',
    'J': '#6366f1',
    'P': '#84cc16'
  }
  return colorMap[dimension] || '#6b7280'
}

const getDimensionDescription = (dimension, score) => {
  const descriptions = {
    'E': score > 50 ? '倾向于外向，喜欢与人交往' : '倾向于内向，喜欢独处思考',
    'I': score > 50 ? '倾向于内向，喜欢独处思考' : '倾向于外向，喜欢与人交往',
    'S': score > 50 ? '倾向于感觉，注重具体细节' : '倾向于直觉，关注整体概念',
    'N': score > 50 ? '倾向于直觉，关注整体概念' : '倾向于感觉，注重具体细节',
    'T': score > 50 ? '倾向于思考，重视逻辑分析' : '倾向于情感，重视人际和谐',
    'F': score > 50 ? '倾向于情感，重视人际和谐' : '倾向于思考，重视逻辑分析',
    'J': score > 50 ? '倾向于判断，喜欢有序规划' : '倾向于知觉，喜欢灵活应变',
    'P': score > 50 ? '倾向于知觉，喜欢灵活应变' : '倾向于判断，喜欢有序规划'
  }
  return descriptions[dimension] || ''
}

const getAverageTimePerQuestion = (test) => {
  const duration = test.test_duration || 0
  const answered = test.answer_count || 0
  
  if (answered === 0) return '0秒'
  
  const avgSeconds = Math.round(duration / answered)
  return formatDuration(avgSeconds)
}

const formatDuration = (seconds) => {
  if (!seconds || seconds === 0) return '0分钟'
  
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (hours > 0) {
    return `${hours}小时${minutes}分钟`
  } else if (minutes > 0) {
    return `${minutes}分钟${secs}秒`
  } else {
    return `${secs}秒`
  }
}

const formatDate = (dateString, format = 'datetime') => {
  if (!dateString) return ''
  const date = new Date(dateString)
  
  if (format === 'date') {
    return date.toLocaleDateString('zh-CN')
  } else if (format === 'time') {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.test-detail {
  max-width: 100%;
}

/* 详情区块 */
.detail-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #e5e7eb;
}

/* 信息网格 */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item label {
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-item span {
  font-size: 14px;
  color: #1a202c;
  font-weight: 500;
}

.session-id,
.user-id {
  font-family: monospace;
  background: #f3f4f6;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px !important;
  color: #6b7280 !important;
}

/* 徽章样式 */
.status-badge,
.result-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  text-align: center;
  min-width: 60px;
}

.status-badge.completed {
  background: #dcfce7;
  color: #166534;
}

.status-badge.in-progress {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.abandoned {
  background: #fee2e2;
  color: #991b1b;
}

.result-badge {
  background: #f3f4f6;
  color: #374151;
  font-weight: 600;
}

.no-result {
  color: #9ca3af;
  font-style: italic;
}

.completion-rate {
  font-weight: 600;
  color: #059669;
}

/* 用户信息卡片 */
.user-info-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
}

.user-avatar .avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 18px;
}

.user-details {
  flex: 1;
}

.user-name {
  font-size: 16px;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 8px;
}

.user-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.meta-item {
  font-size: 12px;
  color: #6b7280;
}

/* 测试结果详情 */
.result-details-card {
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
}

.result-content {
  font-size: 14px;
  color: #374151;
  line-height: 1.6;
  white-space: pre-wrap;
}

/* 维度得分 */
.dimension-scores {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.dimension-item {
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
}

.dimension-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.dimension-name {
  font-size: 14px;
  font-weight: 600;
  color: #1a202c;
}

.dimension-score {
  font-size: 14px;
  font-weight: 700;
  color: #059669;
}

.dimension-bar {
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.dimension-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.dimension-description {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.4;
}

/* 答题进度 */
.progress-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.progress-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
}

.stat-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

.stat-value {
  font-size: 14px;
  color: #1a202c;
  font-weight: 600;
}

.progress-visual {
  text-align: center;
}

.progress-bar-large {
  width: 100%;
  height: 12px;
  background: #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill-large {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6 0%, #10b981 100%);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 14px;
  font-weight: 600;
  color: #059669;
}

/* 时间统计 */
.time-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.time-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
}

.time-icon {
  font-size: 24px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.time-content {
  flex: 1;
}

.time-value {
  font-size: 16px;
  font-weight: 700;
  color: #1a202c;
  line-height: 1.2;
}

.time-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
  margin-top: 2px;
}

/* 操作按钮 */
.action-section {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

.action-button {
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.answers-btn {
  background: #3b82f6;
  color: white;
}

.answers-btn:hover {
  background: #2563eb;
}

.export-btn {
  background: #10b981;
  color: white;
}

.export-btn:hover {
  background: #059669;
}

.abandon-btn {
  background: #f59e0b;
  color: white;
}

.abandon-btn:hover {
  background: #d97706;
}

.delete-btn {
  background: #ef4444;
  color: white;
}

.delete-btn:hover {
  background: #dc2626;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .user-info-card {
    flex-direction: column;
    text-align: center;
  }
  
  .user-meta {
    justify-content: center;
  }
  
  .progress-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .time-stats {
    grid-template-columns: 1fr;
  }
  
  .action-section {
    flex-direction: column;
  }
  
  .action-button {
    justify-content: center;
  }
}
</style>