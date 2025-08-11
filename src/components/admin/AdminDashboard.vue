<template>
  <div class="dashboard">
    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon user-icon">👥</div>
        <div class="stat-content">
          <h3 class="stat-title">总用户数</h3>
          <p class="stat-value">{{ stats.users?.total_users || 0 }}</p>
          <p class="stat-change positive">今日新增: {{ stats.users?.today_users || 0 }}</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon test-icon">📝</div>
        <div class="stat-content">
          <h3 class="stat-title">总测试数</h3>
          <p class="stat-value">{{ stats.tests?.total_tests || 0 }}</p>
          <p class="stat-change positive">完成率: {{ getCompletionRate() }}%</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon revenue-icon">💰</div>
        <div class="stat-content">
          <h3 class="stat-title">总收入</h3>
          <p class="stat-value">¥{{ Number(stats.payments?.total_revenue || 0).toFixed(2) }}</p>
          <p class="stat-change positive">今日: ¥{{ Number(stats.payments?.today_revenue || 0).toFixed(2) }}</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon time-icon">⏱️</div>
        <div class="stat-content">
          <h3 class="stat-title">平均测试时长</h3>
          <p class="stat-value">{{ getAverageTestTime() }}</p>
          <p class="stat-change neutral">分钟</p>
        </div>
      </div>
    </div>
    
    <!-- 图表区域 -->
    <div class="charts-grid">
      <!-- 用户增长趋势 -->
      <div class="chart-card">
        <div class="chart-header">
          <h3 class="chart-title">用户增长趋势</h3>
          <div class="chart-controls">
            <select v-model="growthDays" @change="loadUserGrowth" class="chart-select">
              <option value="7">最近7天</option>
              <option value="30">最近30天</option>
              <option value="90">最近90天</option>
            </select>
          </div>
        </div>
        <div class="chart-content">
          <canvas ref="growthChart" class="chart-canvas"></canvas>
        </div>
      </div>
      
      <!-- MBTI类型分布 -->
      <div class="chart-card">
        <div class="chart-header">
          <h3 class="chart-title">MBTI类型分布</h3>
        </div>
        <div class="chart-content">
          <div class="mbti-distribution">
            <div 
              v-for="item in stats.mbtiDistribution" 
              :key="item.mbti_type"
              class="mbti-item"
            >
              <div class="mbti-type">{{ item.mbti_type }}</div>
              <div class="mbti-bar">
                <div 
                  class="mbti-fill" 
                  :style="{ width: getMbtiPercentage(item.count) + '%' }"
                ></div>
              </div>
              <div class="mbti-count">{{ item.count }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 最近活动 -->
    <div class="activity-section">
      <div class="activity-card">
        <div class="activity-header">
          <h3 class="activity-title">最近活动</h3>
          <button @click="loadRecentActivity" class="refresh-button">
            🔄 刷新
          </button>
        </div>
        <div class="activity-content">
          <div v-if="recentActivity.length === 0" class="no-activity">
            暂无最近活动
          </div>
          <div v-else class="activity-list">
            <div 
              v-for="activity in recentActivity" 
              :key="activity.id"
              class="activity-item"
            >
              <div class="activity-icon">{{ getActivityIcon(activity.type) }}</div>
              <div class="activity-details">
                <p class="activity-text">{{ getActivityText(activity) }}</p>
                <p class="activity-time">{{ formatTime(activity.time) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 快速操作 -->
    <div class="quick-actions">
      <h3 class="section-title">快速操作</h3>
      <div class="actions-grid">
        <button @click="exportData" class="action-button">
          <span class="action-icon">📊</span>
          <span class="action-text">导出数据</span>
        </button>
        <button @click="viewUsers" class="action-button">
          <span class="action-icon">👥</span>
          <span class="action-text">查看用户</span>
        </button>
        <button @click="viewSessions" class="action-button">
          <span class="action-icon">📝</span>
          <span class="action-text">测试管理</span>
        </button>
        <button @click="systemSettings" class="action-button">
          <span class="action-icon">⚙️</span>
          <span class="action-text">系统设置</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'

// 响应式数据
const stats = reactive({
  users: null,
  tests: null,
  payments: null,
  mbtiDistribution: []
})

const userGrowth = ref([])
const recentActivity = ref([])
const growthDays = ref(30)
const growthChart = ref(null)
const isLoading = ref(false)

// API基础URL
import { config } from '../../config/index'

const API_BASE = config.api.baseUrl

// 获取认证头
const getAuthHeaders = () => {
  const token = localStorage.getItem('admin_token')
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
}

// 加载统计数据
const loadStats = async () => {
  try {
    const response = await fetch(`${API_BASE}/admin/dashboard/stats`, {
      headers: getAuthHeaders()
    })
    
    if (response.ok) {
      const data = await response.json()
      if (data.success) {
        Object.assign(stats, data.data)
      }
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

// 加载用户增长数据
const loadUserGrowth = async () => {
  try {
    const response = await fetch(`${API_BASE}/admin/analytics/user-growth?days=${growthDays.value}`, {
      headers: getAuthHeaders()
    })
    
    if (response.ok) {
      const data = await response.json()
      if (data.success) {
        userGrowth.value = data.data
        await nextTick()
        renderGrowthChart()
      }
    }
  } catch (error) {
    console.error('加载用户增长数据失败:', error)
  }
}

// 加载最近活动
const loadRecentActivity = async () => {
  try {
    // 模拟最近活动数据
    recentActivity.value = [
      {
        id: 1,
        type: 'user_register',
        user: '新用户',
        time: new Date(Date.now() - 5 * 60 * 1000)
      },
      {
        id: 2,
        type: 'test_complete',
        user: '测试用户1',
        mbti: 'INTJ',
        time: new Date(Date.now() - 15 * 60 * 1000)
      },
      {
        id: 3,
        type: 'payment',
        user: '测试用户2',
        amount: 29.9,
        time: new Date(Date.now() - 30 * 60 * 1000)
      }
    ]
  } catch (error) {
    console.error('加载最近活动失败:', error)
  }
}

// 渲染增长图表
const renderGrowthChart = () => {
  if (!growthChart.value || userGrowth.value.length === 0) return
  
  const canvas = growthChart.value
  const ctx = canvas.getContext('2d')
  
  // 设置画布大小
  const rect = canvas.parentElement.getBoundingClientRect()
  canvas.width = rect.width - 40
  canvas.height = 200
  
  // 清空画布
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  
  if (userGrowth.value.length === 0) {
    ctx.fillStyle = '#6b7280'
    ctx.font = '14px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('暂无数据', canvas.width / 2, canvas.height / 2)
    return
  }
  
  // 绘制简单的折线图
  const padding = 40
  const chartWidth = canvas.width - padding * 2
  const chartHeight = canvas.height - padding * 2
  
  const maxUsers = Math.max(...userGrowth.value.map(d => d.total_users))
  const minUsers = Math.min(...userGrowth.value.map(d => d.total_users))
  const range = maxUsers - minUsers || 1
  
  // 绘制网格线
  ctx.strokeStyle = '#e5e7eb'
  ctx.lineWidth = 1
  
  for (let i = 0; i <= 5; i++) {
    const y = padding + (chartHeight / 5) * i
    ctx.beginPath()
    ctx.moveTo(padding, y)
    ctx.lineTo(canvas.width - padding, y)
    ctx.stroke()
  }
  
  // 绘制数据线
  ctx.strokeStyle = '#3b82f6'
  ctx.lineWidth = 2
  ctx.beginPath()
  
  userGrowth.value.forEach((point, index) => {
    const x = padding + (chartWidth / (userGrowth.value.length - 1)) * index
    const y = padding + chartHeight - ((point.total_users - minUsers) / range) * chartHeight
    
    if (index === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  })
  
  ctx.stroke()
  
  // 绘制数据点
  ctx.fillStyle = '#3b82f6'
  userGrowth.value.forEach((point, index) => {
    const x = padding + (chartWidth / (userGrowth.value.length - 1)) * index
    const y = padding + chartHeight - ((point.total_users - minUsers) / range) * chartHeight
    
    ctx.beginPath()
    ctx.arc(x, y, 4, 0, 2 * Math.PI)
    ctx.fill()
  })
}

// 计算完成率
const getCompletionRate = () => {
  if (!stats.tests?.total_tests || !stats.tests?.completed_tests) return 0
  return Math.round((stats.tests.completed_tests / stats.tests.total_tests) * 100)
}

// 计算平均测试时长
const getAverageTestTime = () => {
  if (!stats.tests?.avg_test_time) return '0'
  const minutes = Math.round(stats.tests.avg_test_time / 60)
  return minutes.toString()
}

// 计算MBTI类型百分比
const getMbtiPercentage = (count) => {
  if (!stats.mbtiDistribution.length) return 0
  const total = stats.mbtiDistribution.reduce((sum, item) => sum + item.count, 0)
  return total > 0 ? Math.round((count / total) * 100) : 0
}

// 获取活动图标
const getActivityIcon = (type) => {
  const icons = {
    user_register: '👤',
    test_complete: '✅',
    payment: '💳',
    login: '🔑'
  }
  return icons[type] || '📝'
}

// 获取活动文本
const getActivityText = (activity) => {
  switch (activity.type) {
    case 'user_register':
      return `${activity.user} 注册了账号`
    case 'test_complete':
      return `${activity.user} 完成了测试，结果为 ${activity.mbti}`
    case 'payment':
      return `${activity.user} 支付了 ¥${activity.amount}`
    default:
      return '未知活动'
  }
}

// 格式化时间
const formatTime = (time) => {
  const now = new Date()
  const diff = now - new Date(time)
  const minutes = Math.floor(diff / (1000 * 60))
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}小时前`
  
  const days = Math.floor(hours / 24)
  return `${days}天前`
}

// 快速操作
const exportData = () => {
  // 导出数据逻辑
  alert('导出功能开发中...')
}

const viewUsers = () => {
  // 跳转到用户管理
  window.dispatchEvent(new CustomEvent('admin-tab-change', { detail: 'users' }))
}

const viewSessions = () => {
  // 跳转到测试管理
  window.dispatchEvent(new CustomEvent('admin-tab-change', { detail: 'sessions' }))
}

const systemSettings = () => {
  // 跳转到系统设置
  window.dispatchEvent(new CustomEvent('admin-tab-change', { detail: 'settings' }))
}

// 组件挂载时加载数据
onMounted(async () => {
  await loadStats()
  await loadUserGrowth()
  await loadRecentActivity()
})
</script>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
}

/* 统计卡片样式 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.user-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.test-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.revenue-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.time-icon {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-content {
  flex: 1;
}

.stat-title {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 4px;
}

.stat-change {
  font-size: 12px;
  margin: 0;
}

.stat-change.positive {
  color: #10b981;
}

.stat-change.negative {
  color: #ef4444;
}

.stat-change.neutral {
  color: #6b7280;
}

/* 图表区域样式 */
.charts-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  margin-bottom: 32px;
}

.chart-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid #f1f5f9;
}

.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.chart-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a202c;
}

.chart-select {
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background: white;
}

.chart-content {
  height: 200px;
}

.chart-canvas {
  width: 100%;
  height: 100%;
}

/* MBTI分布样式 */
.mbti-distribution {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 200px;
  overflow-y: auto;
}

.mbti-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mbti-type {
  width: 50px;
  font-weight: 600;
  color: #374151;
  font-size: 14px;
}

.mbti-bar {
  flex: 1;
  height: 20px;
  background: #f3f4f6;
  border-radius: 10px;
  overflow: hidden;
}

.mbti-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #1d4ed8);
  transition: width 0.3s ease;
}

.mbti-count {
  width: 40px;
  text-align: right;
  font-size: 14px;
  color: #6b7280;
}

/* 活动区域样式 */
.activity-section {
  margin-bottom: 32px;
}

.activity-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid #f1f5f9;
}

.activity-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.activity-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a202c;
}

.refresh-button {
  padding: 8px 16px;
  background: #f3f4f6;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.refresh-button:hover {
  background: #e5e7eb;
}

.no-activity {
  text-align: center;
  color: #6b7280;
  padding: 40px;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
}

.activity-icon {
  font-size: 20px;
}

.activity-details {
  flex: 1;
}

.activity-text {
  font-size: 14px;
  color: #374151;
  margin-bottom: 4px;
}

.activity-time {
  font-size: 12px;
  color: #6b7280;
  margin: 0;
}

/* 快速操作样式 */
.quick-actions {
  margin-bottom: 32px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 16px;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.action-button:hover {
  border-color: #3b82f6;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
}

.action-icon {
  font-size: 20px;
}

.action-text {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
  }
}
</style>