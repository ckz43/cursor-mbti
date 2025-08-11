<template>
  <div class="user-detail">
    <!-- 用户基本信息 -->
    <div class="detail-section">
      <h4 class="section-title">基本信息</h4>
      <div class="info-grid">
        <div class="info-item">
          <label>用户ID</label>
          <span class="user-id">{{ user.user_id }}</span>
        </div>
        <div class="info-item">
          <label>昵称</label>
          <span>{{ user.nickname || '未设置' }}</span>
        </div>
        <div class="info-item">
          <label>邮箱</label>
          <span>{{ user.email || '未设置' }}</span>
        </div>
        <div class="info-item">
          <label>手机号</label>
          <span>{{ user.phone || '未设置' }}</span>
        </div>
        <div class="info-item">
          <label>性别</label>
          <span class="gender-badge" :class="user.gender">
            {{ getGenderText(user.gender) }}
          </span>
        </div>
        <div class="info-item">
          <label>年龄</label>
          <span>{{ user.age || '未设置' }}</span>
        </div>
        <div class="info-item">
          <label>地区</label>
          <span>{{ getLocationText(user) }}</span>
        </div>
        <div class="info-item">
          <label>注册来源</label>
          <span class="source-badge" :class="user.registration_source">
            {{ getSourceText(user.registration_source) }}
          </span>
        </div>
        <div class="info-item">
          <label>状态</label>
          <span class="status-badge" :class="user.status ? 'active' : 'inactive'">
            {{ user.status ? '正常' : '禁用' }}
          </span>
        </div>
        <div class="info-item">
          <label>注册时间</label>
          <span>{{ formatDate(user.created_at) }}</span>
        </div>
        <div class="info-item">
          <label>最后登录</label>
          <span>{{ formatDate(user.last_login_at) || '从未登录' }}</span>
        </div>
        <div class="info-item">
          <label>更新时间</label>
          <span>{{ formatDate(user.updated_at) }}</span>
        </div>
      </div>
    </div>
    
    <!-- 测试记录 -->
    <div class="detail-section">
      <div class="section-header">
        <h4 class="section-title">测试记录</h4>
        <span class="record-count">共 {{ testSessions.length }} 次测试</span>
      </div>
      
      <div v-if="isLoadingTests" class="loading-state">
        <div class="loading-spinner"></div>
        <p>加载测试记录中...</p>
      </div>
      
      <div v-else-if="testSessions.length === 0" class="empty-state">
        <div class="empty-icon">📝</div>
        <p>该用户还没有进行过测试</p>
      </div>
      
      <div v-else class="test-sessions">
        <div 
          v-for="session in testSessions" 
          :key="session.session_id" 
          class="test-session-card"
        >
          <div class="session-header">
            <div class="session-info">
              <h5 class="session-title">测试 #{{ session.session_id }}</h5>
              <span class="session-date">{{ formatDate(session.created_at) }}</span>
            </div>
            <div class="session-status">
              <span class="status-badge" :class="getSessionStatusClass(session.status)">
                {{ getSessionStatusText(session.status) }}
              </span>
            </div>
          </div>
          
          <div class="session-details">
            <div class="detail-row">
              <span class="detail-label">测试结果:</span>
              <span class="detail-value">
                {{ session.result_type || '未完成' }}
              </span>
            </div>
            <div class="detail-row">
              <span class="detail-label">测试时长:</span>
              <span class="detail-value">
                {{ formatDuration(session.test_duration) }}
              </span>
            </div>
            <div class="detail-row">
              <span class="detail-label">答题数量:</span>
              <span class="detail-value">
                {{ session.answer_count || 0 }} 题
              </span>
            </div>
            <div v-if="session.completion_rate" class="detail-row">
              <span class="detail-label">完成率:</span>
              <span class="detail-value">
                {{ Math.round(session.completion_rate * 100) }}%
              </span>
            </div>
          </div>
          
          <div v-if="session.result_details" class="session-result">
            <h6>测试结果详情</h6>
            <div class="result-content">
              {{ session.result_details }}
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 行为统计 -->
    <div class="detail-section">
      <h4 class="section-title">行为统计</h4>
      
      <div v-if="isLoadingBehavior" class="loading-state">
        <div class="loading-spinner"></div>
        <p>加载行为数据中...</p>
      </div>
      
      <div v-else class="behavior-stats">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">📊</div>
            <div class="stat-content">
              <div class="stat-value">{{ behaviorStats.totalSessions || 0 }}</div>
              <div class="stat-label">总测试次数</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">✅</div>
            <div class="stat-content">
              <div class="stat-value">{{ behaviorStats.completedSessions || 0 }}</div>
              <div class="stat-label">完成测试</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">⏱️</div>
            <div class="stat-content">
              <div class="stat-value">{{ formatDuration(behaviorStats.avgDuration) }}</div>
              <div class="stat-label">平均时长</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">📅</div>
            <div class="stat-content">
              <div class="stat-value">{{ formatDate(behaviorStats.lastActivity, 'date') }}</div>
              <div class="stat-label">最后活动</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 操作按钮 -->
    <div class="action-section">
      <button @click="exportUserData" class="action-button export-btn">
        📊 导出用户数据
      </button>
      <button @click="resetUserPassword" class="action-button reset-btn">
        🔑 重置密码
      </button>
      <button 
        @click="toggleUserStatus" 
        class="action-button"
        :class="user.status ? 'disable-btn' : 'enable-btn'"
      >
        {{ user.status ? '🚫 禁用用户' : '✅ 启用用户' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, defineProps, defineEmits } from 'vue'

// 组件属性
const props = defineProps({
  user: {
    type: Object,
    required: true
  }
})

// 组件事件
const emit = defineEmits(['close'])

// 响应式数据
const testSessions = ref([])
const isLoadingTests = ref(false)
const isLoadingBehavior = ref(false)
const behaviorStats = reactive({
  totalSessions: 0,
  completedSessions: 0,
  avgDuration: 0,
  lastActivity: null
})

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

// 加载用户测试记录
const loadTestSessions = async () => {
  isLoadingTests.value = true
  
  try {
    const response = await fetch(`${API_BASE}/admin/users/${props.user.user_id}/sessions`, {
      headers: getAuthHeaders()
    })
    
    if (response.ok) {
      const data = await response.json()
      if (data.success) {
        testSessions.value = data.data
      }
    }
  } catch (error) {
    console.error('加载测试记录失败:', error)
  } finally {
    isLoadingTests.value = false
  }
}

// 加载用户行为统计
const loadBehaviorStats = async () => {
  isLoadingBehavior.value = true
  
  try {
    const response = await fetch(`${API_BASE}/admin/users/${props.user.user_id}/stats`, {
      headers: getAuthHeaders()
    })
    
    if (response.ok) {
      const data = await response.json()
      if (data.success) {
        Object.assign(behaviorStats, data.data)
      }
    }
  } catch (error) {
    console.error('加载行为统计失败:', error)
  } finally {
    isLoadingBehavior.value = false
  }
}

// 导出用户数据
const exportUserData = () => {
  // 导出用户数据逻辑
  alert('导出用户数据功能开发中...')
}

// 重置用户密码
const resetUserPassword = async () => {
  if (!confirm('确定要重置该用户的密码吗？新密码将发送到用户邮箱。')) {
    return
  }
  
  try {
    // 调用重置密码API
    alert('重置密码功能开发中...')
  } catch (error) {
    console.error('重置密码失败:', error)
    alert('重置密码失败')
  }
}

// 切换用户状态
const toggleUserStatus = async () => {
  const newStatus = props.user.status ? 0 : 1
  const action = newStatus ? '启用' : '禁用'
  
  if (!confirm(`确定要${action}用户 "${props.user.nickname || props.user.user_id}" 吗？`)) {
    return
  }
  
  try {
    // 调用更新用户状态API
    props.user.status = newStatus
    alert(`用户${action}成功`)
  } catch (error) {
    console.error(`${action}用户失败:`, error)
    alert(`${action}用户失败`)
  }
}

// 工具函数
const getGenderText = (gender) => {
  const genderMap = {
    'male': '男',
    'female': '女',
    'other': '其他'
  }
  return genderMap[gender] || '未知'
}

const getLocationText = (user) => {
  if (user.city && user.province) {
    return `${user.city}, ${user.province}`
  }
  return user.city || user.province || '未设置'
}

const getSourceText = (source) => {
  const sourceMap = {
    'direct': '直接注册',
    'wechat': '微信',
    'qq': 'QQ',
    'weibo': '微博'
  }
  return sourceMap[source] || source || '未知'
}

const getSessionStatusText = (status) => {
  const statusMap = {
    'completed': '已完成',
    'in_progress': '进行中',
    'abandoned': '已放弃'
  }
  return statusMap[status] || status || '未知'
}

const getSessionStatusClass = (status) => {
  const classMap = {
    'completed': 'completed',
    'in_progress': 'in-progress',
    'abandoned': 'abandoned'
  }
  return classMap[status] || 'unknown'
}

const formatDate = (dateString, format = 'datetime') => {
  if (!dateString) return ''
  const date = new Date(dateString)
  
  if (format === 'date') {
    return date.toLocaleDateString('zh-CN')
  }
  
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
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

// 组件挂载时加载数据
onMounted(() => {
  loadTestSessions()
  loadBehaviorStats()
})
</script>

<style scoped>
.user-detail {
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

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.record-count {
  color: #6b7280;
  font-size: 14px;
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

.user-id {
  font-family: monospace;
  background: #f3f4f6;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px !important;
  color: #6b7280 !important;
}

/* 徽章样式 */
.gender-badge,
.source-badge,
.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  text-align: center;
  min-width: 60px;
}

.gender-badge.male {
  background: #dbeafe;
  color: #1d4ed8;
}

.gender-badge.female {
  background: #fce7f3;
  color: #be185d;
}

.gender-badge.other {
  background: #f3f4f6;
  color: #6b7280;
}

.source-badge.direct {
  background: #ecfdf5;
  color: #065f46;
}

.source-badge.wechat {
  background: #f0fdf4;
  color: #166534;
}

.source-badge.qq {
  background: #eff6ff;
  color: #1e40af;
}

.status-badge.active {
  background: #dcfce7;
  color: #166534;
}

.status-badge.inactive {
  background: #fee2e2;
  color: #991b1b;
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

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #6b7280;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid #f3f4f6;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #6b7280;
}

.empty-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

/* 测试会话卡片 */
.test-sessions {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.test-session-card {
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.2s;
}

.test-session-card:hover {
  border-color: #d1d5db;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.session-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.session-title {
  font-size: 14px;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
}

.session-date {
  font-size: 12px;
  color: #6b7280;
}

.session-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 8px;
  margin-bottom: 12px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

.detail-value {
  font-size: 12px;
  color: #1a202c;
  font-weight: 600;
}

.session-result {
  border-top: 1px solid #e5e7eb;
  padding-top: 12px;
}

.session-result h6 {
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 8px 0;
}

.result-content {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.5;
  background: white;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
}

/* 行为统计 */
.behavior-stats {
  margin-top: 16px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.stat-card {
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.2s;
}

.stat-card:hover {
  border-color: #d1d5db;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.stat-icon {
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

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: #1a202c;
  line-height: 1.2;
}

.stat-label {
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

.export-btn {
  background: #3b82f6;
  color: white;
}

.export-btn:hover {
  background: #2563eb;
}

.reset-btn {
  background: #f59e0b;
  color: white;
}

.reset-btn:hover {
  background: #d97706;
}

.disable-btn {
  background: #ef4444;
  color: white;
}

.disable-btn:hover {
  background: #dc2626;
}

.enable-btn {
  background: #10b981;
  color: white;
}

.enable-btn:hover {
  background: #059669;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .session-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .session-details {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
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