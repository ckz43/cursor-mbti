<template>
  <div class="admin-analytics">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">数据分析</h2>
      <div class="header-actions">
        <select v-model="selectedTimeRange" @change="loadAnalyticsData" class="time-range-select">
          <option value="7">最近7天</option>
          <option value="30">最近30天</option>
          <option value="90">最近90天</option>
          <option value="365">最近一年</option>
        </select>
        <button @click="exportReport" class="export-btn">
          📊 导出报告
        </button>
      </div>
    </div>
    
    <!-- 核心指标卡片 -->
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-icon">👥</div>
        <div class="metric-content">
          <div class="metric-value">{{ analytics.totalUsers || 0 }}</div>
          <div class="metric-label">总用户数</div>
          <div class="metric-change" :class="getChangeClass(analytics.userGrowth)">
            {{ formatChange(analytics.userGrowth) }}
          </div>
        </div>
      </div>
      
      <div class="metric-card">
        <div class="metric-icon">📝</div>
        <div class="metric-content">
          <div class="metric-value">{{ analytics.totalTests || 0 }}</div>
          <div class="metric-label">总测试数</div>
          <div class="metric-change" :class="getChangeClass(analytics.testGrowth)">
            {{ formatChange(analytics.testGrowth) }}
          </div>
        </div>
      </div>
      
      <div class="metric-card">
        <div class="metric-icon">✅</div>
        <div class="metric-content">
          <div class="metric-value">{{ analytics.completedTests || 0 }}</div>
          <div class="metric-label">完成测试数</div>
          <div class="metric-change" :class="getChangeClass(analytics.completionGrowth)">
            {{ formatChange(analytics.completionGrowth) }}
          </div>
        </div>
      </div>
      
      <div class="metric-card">
        <div class="metric-icon">📊</div>
        <div class="metric-content">
          <div class="metric-value">{{ formatPercentage(analytics.completionRate) }}</div>
          <div class="metric-label">完成率</div>
          <div class="metric-change" :class="getChangeClass(analytics.completionRateChange)">
            {{ formatChange(analytics.completionRateChange) }}
          </div>
        </div>
      </div>
      
      <div class="metric-card">
        <div class="metric-icon">⏱️</div>
        <div class="metric-content">
          <div class="metric-value">{{ formatDuration(analytics.avgTestDuration) }}</div>
          <div class="metric-label">平均测试时长</div>
          <div class="metric-change" :class="getChangeClass(analytics.durationChange)">
            {{ formatChange(analytics.durationChange) }}
          </div>
        </div>
      </div>
      
      <div class="metric-card">
        <div class="metric-icon">💰</div>
        <div class="metric-content">
          <div class="metric-value">¥{{ formatMoney(analytics.totalRevenue) }}</div>
          <div class="metric-label">总收入</div>
          <div class="metric-change" :class="getChangeClass(analytics.revenueGrowth)">
            {{ formatChange(analytics.revenueGrowth) }}
          </div>
        </div>
      </div>
    </div>
    
    <!-- 图表区域 -->
    <div class="charts-section">
      <!-- 用户增长趋势 -->
      <div class="chart-card">
        <div class="chart-header">
          <h3 class="chart-title">用户增长趋势</h3>
          <div class="chart-legend">
            <span class="legend-item">
              <span class="legend-color" style="background: #3b82f6;"></span>
              新增用户
            </span>
            <span class="legend-item">
              <span class="legend-color" style="background: #10b981;"></span>
              累计用户
            </span>
          </div>
        </div>
        <div class="chart-container">
          <canvas ref="userGrowthChart" class="chart-canvas"></canvas>
        </div>
      </div>
      
      <!-- 测试完成情况 -->
      <div class="chart-card">
        <div class="chart-header">
          <h3 class="chart-title">测试完成情况</h3>
          <div class="chart-legend">
            <span class="legend-item">
              <span class="legend-color" style="background: #10b981;"></span>
              已完成
            </span>
            <span class="legend-item">
              <span class="legend-color" style="background: #f59e0b;"></span>
              进行中
            </span>
            <span class="legend-item">
              <span class="legend-color" style="background: #ef4444;"></span>
              已放弃
            </span>
          </div>
        </div>
        <div class="chart-container">
          <canvas ref="testStatusChart" class="chart-canvas"></canvas>
        </div>
      </div>
    </div>
    
    <!-- MBTI类型分布 -->
    <div class="charts-section">
      <div class="chart-card full-width">
        <div class="chart-header">
          <h3 class="chart-title">MBTI类型分布</h3>
          <div class="chart-stats">
            <span class="stat-item">总样本: {{ analytics.mbtiDistribution?.total || 0 }}</span>
            <span class="stat-item">最常见: {{ getMostCommonType() }}</span>
          </div>
        </div>
        <div class="mbti-grid">
          <div 
            v-for="type in mbtiTypes" 
            :key="type" 
            class="mbti-type-card"
            :class="{ 'most-common': type === getMostCommonType() }"
          >
            <div class="type-header">
              <span class="type-name">{{ type }}</span>
              <span class="type-count">{{ getMbtiCount(type) }}</span>
            </div>
            <div class="type-bar">
              <div 
                class="type-fill" 
                :style="{ width: getMbtiPercentage(type) + '%' }"
              ></div>
            </div>
            <div class="type-percentage">{{ getMbtiPercentage(type) }}%</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 用户行为分析 -->
    <div class="charts-section">
      <!-- 活跃时段分析 -->
      <div class="chart-card">
        <div class="chart-header">
          <h3 class="chart-title">用户活跃时段</h3>
        </div>
        <div class="heatmap-container">
          <div class="heatmap-grid">
            <div class="heatmap-labels">
              <div class="hour-labels">
                <span v-for="hour in 24" :key="hour" class="hour-label">
                  {{ hour - 1 }}
                </span>
              </div>
            </div>
            <div class="heatmap-data">
              <div 
                v-for="hour in 24" 
                :key="hour" 
                class="heatmap-cell"
                :style="{ backgroundColor: getHeatmapColor(getHourActivity(hour - 1)) }"
                :title="`${hour - 1}:00 - 活跃度: ${getHourActivity(hour - 1)}`"
              >
                {{ getHourActivity(hour - 1) }}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 设备类型分布 -->
      <div class="chart-card">
        <div class="chart-header">
          <h3 class="chart-title">设备类型分布</h3>
        </div>
        <div class="device-stats">
          <div class="device-item">
            <div class="device-icon">💻</div>
            <div class="device-info">
              <div class="device-name">桌面端</div>
              <div class="device-count">{{ analytics.deviceStats?.desktop || 0 }}</div>
              <div class="device-percentage">{{ getDevicePercentage('desktop') }}%</div>
            </div>
          </div>
          
          <div class="device-item">
            <div class="device-icon">📱</div>
            <div class="device-info">
              <div class="device-name">移动端</div>
              <div class="device-count">{{ analytics.deviceStats?.mobile || 0 }}</div>
              <div class="device-percentage">{{ getDevicePercentage('mobile') }}%</div>
            </div>
          </div>
          
          <div class="device-item">
            <div class="device-icon">📟</div>
            <div class="device-info">
              <div class="device-name">平板</div>
              <div class="device-count">{{ analytics.deviceStats?.tablet || 0 }}</div>
              <div class="device-percentage">{{ getDevicePercentage('tablet') }}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 详细统计表格 -->
    <div class="table-section">
      <div class="table-header">
        <h3 class="table-title">详细统计数据</h3>
        <button @click="exportTableData" class="export-table-btn">
          📋 导出数据
        </button>
      </div>
      
      <div class="table-container">
        <table class="stats-table">
          <thead>
            <tr>
              <th>指标</th>
              <th>当前值</th>
              <th>上期值</th>
              <th>变化</th>
              <th>变化率</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>总用户数</td>
              <td>{{ analytics.totalUsers || 0 }}</td>
              <td>{{ analytics.previousUsers || 0 }}</td>
              <td class="change-value" :class="getChangeClass(analytics.userGrowth)">
                {{ formatChangeValue(analytics.userGrowth) }}
              </td>
              <td class="change-rate" :class="getChangeClass(analytics.userGrowth)">
                {{ formatChange(analytics.userGrowth) }}
              </td>
            </tr>
            <tr>
              <td>总测试数</td>
              <td>{{ analytics.totalTests || 0 }}</td>
              <td>{{ analytics.previousTests || 0 }}</td>
              <td class="change-value" :class="getChangeClass(analytics.testGrowth)">
                {{ formatChangeValue(analytics.testGrowth) }}
              </td>
              <td class="change-rate" :class="getChangeClass(analytics.testGrowth)">
                {{ formatChange(analytics.testGrowth) }}
              </td>
            </tr>
            <tr>
              <td>完成测试数</td>
              <td>{{ analytics.completedTests || 0 }}</td>
              <td>{{ analytics.previousCompleted || 0 }}</td>
              <td class="change-value" :class="getChangeClass(analytics.completionGrowth)">
                {{ formatChangeValue(analytics.completionGrowth) }}
              </td>
              <td class="change-rate" :class="getChangeClass(analytics.completionGrowth)">
                {{ formatChange(analytics.completionGrowth) }}
              </td>
            </tr>
            <tr>
              <td>平均测试时长</td>
              <td>{{ formatDuration(analytics.avgTestDuration) }}</td>
              <td>{{ formatDuration(analytics.previousAvgDuration) }}</td>
              <td class="change-value" :class="getChangeClass(analytics.durationChange)">
                {{ formatDurationChange(analytics.durationChange) }}
              </td>
              <td class="change-rate" :class="getChangeClass(analytics.durationChange)">
                {{ formatChange(analytics.durationChange) }}
              </td>
            </tr>
            <tr>
              <td>总收入</td>
              <td>¥{{ formatMoney(analytics.totalRevenue) }}</td>
              <td>¥{{ formatMoney(analytics.previousRevenue) }}</td>
              <td class="change-value" :class="getChangeClass(analytics.revenueGrowth)">
                ¥{{ formatMoney(Math.abs(analytics.revenueChange || 0)) }}
              </td>
              <td class="change-rate" :class="getChangeClass(analytics.revenueGrowth)">
                {{ formatChange(analytics.revenueGrowth) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'

// 响应式数据
const selectedTimeRange = ref('30')
const analytics = reactive({
  totalUsers: 0,
  totalTests: 0,
  completedTests: 0,
  completionRate: 0,
  avgTestDuration: 0,
  totalRevenue: 0,
  userGrowth: 0,
  testGrowth: 0,
  completionGrowth: 0,
  completionRateChange: 0,
  durationChange: 0,
  revenueGrowth: 0,
  mbtiDistribution: {},
  hourlyActivity: {},
  deviceStats: {},
  userGrowthData: [],
  testStatusData: []
})

// 图表引用
const userGrowthChart = ref(null)
const testStatusChart = ref(null)

// MBTI类型列表
const mbtiTypes = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP'
]

// 组件挂载
onMounted(() => {
  loadAnalyticsData()
})

// 加载分析数据
const loadAnalyticsData = async () => {
  try {
    const token = localStorage.getItem('admin_token')
    if (!token) return
    
    const response = await fetch(`/api/admin/analytics?timeRange=${selectedTimeRange.value}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      Object.assign(analytics, data)
      
      // 等待DOM更新后绘制图表
      await nextTick()
      drawCharts()
    }
  } catch (error) {
    console.error('加载分析数据失败:', error)
  }
}

// 绘制图表
const drawCharts = () => {
  drawUserGrowthChart()
  drawTestStatusChart()
}

// 绘制用户增长图表
const drawUserGrowthChart = () => {
  const canvas = userGrowthChart.value
  if (!canvas) return
  
  const ctx = canvas.getContext('2d')
  const data = analytics.userGrowthData || []
  
  // 简单的图表绘制逻辑
  canvas.width = canvas.offsetWidth
  canvas.height = 300
  
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  
  if (data.length === 0) {
    ctx.fillStyle = '#9ca3af'
    ctx.font = '14px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('暂无数据', canvas.width / 2, canvas.height / 2)
    return
  }
  
  // 绘制简单的折线图
  const padding = 40
  const chartWidth = canvas.width - padding * 2
  const chartHeight = canvas.height - padding * 2
  
  const maxValue = Math.max(...data.map(d => d.cumulative || 0))
  const stepX = chartWidth / (data.length - 1)
  
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
  
  // 绘制累计用户线
  ctx.strokeStyle = '#10b981'
  ctx.lineWidth = 2
  ctx.beginPath()
  
  data.forEach((point, index) => {
    const x = padding + stepX * index
    const y = padding + chartHeight - (point.cumulative / maxValue) * chartHeight
    
    if (index === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  })
  
  ctx.stroke()
}

// 绘制测试状态图表
const drawTestStatusChart = () => {
  const canvas = testStatusChart.value
  if (!canvas) return
  
  const ctx = canvas.getContext('2d')
  const data = analytics.testStatusData || []
  
  canvas.width = canvas.offsetWidth
  canvas.height = 300
  
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  
  if (data.length === 0) {
    ctx.fillStyle = '#9ca3af'
    ctx.font = '14px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('暂无数据', canvas.width / 2, canvas.height / 2)
    return
  }
  
  // 绘制简单的饼图
  const centerX = canvas.width / 2
  const centerY = canvas.height / 2
  const radius = Math.min(centerX, centerY) - 40
  
  const total = data.reduce((sum, item) => sum + item.count, 0)
  const colors = ['#10b981', '#f59e0b', '#ef4444']
  
  let currentAngle = -Math.PI / 2
  
  data.forEach((item, index) => {
    const sliceAngle = (item.count / total) * 2 * Math.PI
    
    ctx.fillStyle = colors[index] || '#6b7280'
    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle)
    ctx.closePath()
    ctx.fill()
    
    currentAngle += sliceAngle
  })
}

// 工具函数
const formatChange = (value) => {
  const numValue = Number(value) || 0
  const sign = numValue >= 0 ? '+' : ''
  return `${sign}${numValue.toFixed(1)}%`
}

const formatChangeValue = (value) => {
  const numValue = Number(value) || 0
  const sign = numValue >= 0 ? '+' : ''
  return `${sign}${Math.abs(numValue)}`
}

const formatDurationChange = (value) => {
  const numValue = Number(value) || 0
  const sign = numValue >= 0 ? '+' : '-'
  return `${sign}${formatDuration(Math.abs(numValue))}`
}

const getChangeClass = (value) => {
  const numValue = Number(value) || 0
  return numValue >= 0 ? 'positive' : 'negative'
}

const formatPercentage = (value) => {
  const numValue = Number(value) || 0
  return `${(numValue * 100).toFixed(1)}%`
}

const formatDuration = (seconds) => {
  const numSeconds = Number(seconds) || 0
  if (numSeconds === 0) return '0分钟'
  
  const hours = Math.floor(numSeconds / 3600)
  const minutes = Math.floor((numSeconds % 3600) / 60)
  
  if (hours > 0) {
    return `${hours}小时${minutes}分钟`
  } else {
    return `${minutes}分钟`
  }
}

const formatMoney = (amount) => {
  const numAmount = Number(amount) || 0
  return (numAmount / 100).toFixed(2)
}

const getMostCommonType = () => {
  const distribution = analytics.mbtiDistribution || {}
  let maxCount = 0
  let mostCommon = ''
  
  Object.entries(distribution).forEach(([type, count]) => {
    if (count > maxCount) {
      maxCount = count
      mostCommon = type
    }
  })
  
  return mostCommon
}

const getMbtiCount = (type) => {
  return analytics.mbtiDistribution?.[type] || 0
}

const getMbtiPercentage = (type) => {
  const count = getMbtiCount(type)
  const total = analytics.mbtiDistribution?.total || 0
  
  if (total === 0) return 0
  return ((count / total) * 100).toFixed(1)
}

const getHourActivity = (hour) => {
  return analytics.hourlyActivity?.[hour] || 0
}

const getHeatmapColor = (activity) => {
  const maxActivity = Math.max(...Object.values(analytics.hourlyActivity || {}))
  if (maxActivity === 0) return '#f3f4f6'
  
  const intensity = activity / maxActivity
  const alpha = 0.1 + intensity * 0.9
  return `rgba(59, 130, 246, ${alpha})`
}

const getDevicePercentage = (device) => {
  const stats = analytics.deviceStats || {}
  const total = Object.values(stats).reduce((sum, count) => sum + count, 0)
  
  if (total === 0) return 0
  return ((stats[device] || 0) / total * 100).toFixed(1)
}

// 导出功能
const exportReport = () => {
  alert('导出报告功能开发中...')
}

const exportTableData = () => {
  alert('导出表格数据功能开发中...')
}
</script>

<style scoped>
.admin-analytics {
  padding: 24px;
}

/* 页面标题 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #1a202c;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.time-range-select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background: white;
}

.export-btn {
  padding: 8px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.export-btn:hover {
  background: #2563eb;
}

/* 指标卡片网格 */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.metric-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.2s;
}

.metric-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.metric-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.metric-content {
  flex: 1;
}

.metric-value {
  font-size: 24px;
  font-weight: 700;
  color: #1a202c;
  line-height: 1.2;
}

.metric-label {
  font-size: 14px;
  color: #6b7280;
  margin: 4px 0;
}

.metric-change {
  font-size: 12px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  display: inline-block;
}

.metric-change.positive {
  background: #dcfce7;
  color: #166534;
}

.metric-change.negative {
  background: #fee2e2;
  color: #991b1b;
}

.metric-change.neutral {
  background: #f3f4f6;
  color: #6b7280;
}

/* 图表区域 */
.charts-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.chart-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px;
}

.chart-card.full-width {
  grid-column: 1 / -1;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chart-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
}

.chart-legend {
  display: flex;
  gap: 16px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #6b7280;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.chart-stats {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #6b7280;
}

.chart-container {
  position: relative;
  height: 300px;
}

.chart-canvas {
  width: 100%;
  height: 100%;
}

/* MBTI类型分布 */
.mbti-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.mbti-type-card {
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.2s;
}

.mbti-type-card.most-common {
  background: #fef3c7;
  border-color: #f59e0b;
}

.mbti-type-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.type-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.type-name {
  font-size: 16px;
  font-weight: 700;
  color: #1a202c;
}

.type-count {
  font-size: 14px;
  font-weight: 600;
  color: #059669;
}

.type-bar {
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 8px;
}

.type-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6 0%, #10b981 100%);
  transition: width 0.3s ease;
}

.type-percentage {
  font-size: 12px;
  color: #6b7280;
  text-align: center;
}

/* 热力图 */
.heatmap-container {
  padding: 16px;
}

.heatmap-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.hour-labels {
  display: grid;
  grid-template-columns: repeat(24, 1fr);
  gap: 2px;
  margin-bottom: 8px;
}

.hour-label {
  font-size: 10px;
  color: #6b7280;
  text-align: center;
}

.heatmap-data {
  display: grid;
  grid-template-columns: repeat(24, 1fr);
  gap: 2px;
}

.heatmap-cell {
  aspect-ratio: 1;
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 600;
  color: #1a202c;
  cursor: pointer;
  transition: all 0.2s;
}

.heatmap-cell:hover {
  transform: scale(1.1);
  z-index: 1;
}

/* 设备统计 */
.device-stats {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.device-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.device-icon {
  font-size: 32px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.device-info {
  flex: 1;
}

.device-name {
  font-size: 16px;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 4px;
}

.device-count {
  font-size: 20px;
  font-weight: 700;
  color: #059669;
  margin-bottom: 2px;
}

.device-percentage {
  font-size: 12px;
  color: #6b7280;
}

/* 统计表格 */
.table-section {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  background: #f8fafc;
}

.table-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
}

.export-table-btn {
  padding: 8px 16px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.export-table-btn:hover {
  background: #059669;
}

.table-container {
  overflow-x: auto;
}

.stats-table {
  width: 100%;
  border-collapse: collapse;
}

.stats-table th,
.stats-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.stats-table th {
  background: #f8fafc;
  font-weight: 600;
  color: #374151;
  font-size: 14px;
}

.stats-table td {
  font-size: 14px;
  color: #1a202c;
}

.change-value,
.change-rate {
  font-weight: 600;
}

.change-value.positive,
.change-rate.positive {
  color: #059669;
}

.change-value.negative,
.change-rate.negative {
  color: #dc2626;
}

.change-value.neutral,
.change-rate.neutral {
  color: #6b7280;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .admin-analytics {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .header-actions {
    justify-content: space-between;
  }
  
  .metrics-grid {
    grid-template-columns: 1fr;
  }
  
  .charts-section {
    grid-template-columns: 1fr;
  }
  
  .mbti-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .chart-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .chart-legend {
    justify-content: center;
  }
  
  .table-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
}

@media (max-width: 480px) {
  .mbti-grid {
    grid-template-columns: 1fr;
  }
  
  .hour-labels,
  .heatmap-data {
    grid-template-columns: repeat(12, 1fr);
  }
  
  .device-item {
    flex-direction: column;
    text-align: center;
  }
}
</style>