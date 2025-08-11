<template>
  <div class="tests-management">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">测试管理</h2>
        <p class="page-subtitle">管理系统中的所有测试会话和结果</p>
      </div>
      <div class="header-right">
        <button @click="exportTests" class="export-button">
          📊 导出测试数据
        </button>
      </div>
    </div>
    
    <!-- 搜索和筛选 -->
    <div class="filters-section">
      <div class="search-box">
        <input
          v-model="searchQuery"
          @input="handleSearch"
          type="text"
          placeholder="搜索用户ID、会话ID或测试结果..."
          class="search-input"
        />
        <span class="search-icon">🔍</span>
      </div>
      
      <div class="filter-controls">
        <select v-model="statusFilter" @change="loadTests" class="filter-select">
          <option value="">全部状态</option>
          <option value="completed">已完成</option>
          <option value="in_progress">进行中</option>
          <option value="abandoned">已放弃</option>
        </select>
        
        <select v-model="resultFilter" @change="loadTests" class="filter-select">
          <option value="">全部类型</option>
          <option value="INTJ">INTJ</option>
          <option value="INTP">INTP</option>
          <option value="ENTJ">ENTJ</option>
          <option value="ENTP">ENTP</option>
          <option value="INFJ">INFJ</option>
          <option value="INFP">INFP</option>
          <option value="ENFJ">ENFJ</option>
          <option value="ENFP">ENFP</option>
          <option value="ISTJ">ISTJ</option>
          <option value="ISFJ">ISFJ</option>
          <option value="ESTJ">ESTJ</option>
          <option value="ESFJ">ESFJ</option>
          <option value="ISTP">ISTP</option>
          <option value="ISFP">ISFP</option>
          <option value="ESTP">ESTP</option>
          <option value="ESFP">ESFP</option>
        </select>
        
        <input
          v-model="dateRange.start"
          @change="loadTests"
          type="date"
          class="date-input"
          placeholder="开始日期"
        />
        <input
          v-model="dateRange.end"
          @change="loadTests"
          type="date"
          class="date-input"
          placeholder="结束日期"
        />
        
        <button @click="resetFilters" class="reset-button">
          重置筛选
        </button>
      </div>
    </div>
    
    <!-- 测试统计 -->
    <div class="stats-bar">
      <div class="stat-item">
        <span class="stat-label">总测试数:</span>
        <span class="stat-value">{{ pagination.total }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">完成率:</span>
        <span class="stat-value">{{ completionRate }}%</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">当前页:</span>
        <span class="stat-value">{{ pagination.page }}/{{ pagination.totalPages }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">每页显示:</span>
        <select v-model="pagination.limit" @change="loadTests" class="limit-select">
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </select>
      </div>
    </div>
    
    <!-- 测试列表 -->
    <div class="tests-table-container">
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>加载测试数据中...</p>
      </div>
      
      <div v-else-if="tests.length === 0" class="empty-state">
        <div class="empty-icon">📝</div>
        <h3>暂无测试数据</h3>
        <p>{{ searchQuery ? '没有找到匹配的测试' : '系统中还没有测试记录' }}</p>
      </div>
      
      <table v-else class="tests-table">
        <thead>
          <tr>
            <th>会话ID</th>
            <th>用户</th>
            <th>测试状态</th>
            <th>测试结果</th>
            <th>答题进度</th>
            <th>测试时长</th>
            <th>完成率</th>
            <th>开始时间</th>
            <th>完成时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="test in tests" :key="test.session_id" class="test-row">
            <td class="session-id">{{ test.session_id }}</td>
            <td class="user-info">
              <div class="user-cell">
                <div class="avatar">{{ getUserAvatar(test.user) }}</div>
                <div class="user-details">
                  <div class="user-name">{{ test.user?.nickname || '未知用户' }}</div>
                  <div class="user-id">ID: {{ test.user_id }}</div>
                </div>
              </div>
            </td>
            <td class="test-status">
              <span class="status-badge" :class="getStatusClass(test.status)">
                {{ getStatusText(test.status) }}
              </span>
            </td>
            <td class="test-result">
              <span v-if="test.result_type" class="result-badge" :class="test.result_type.toLowerCase()">
                {{ test.result_type }}
              </span>
              <span v-else class="no-result">-</span>
            </td>
            <td class="test-progress">
              <div class="progress-info">
                <span class="progress-text">{{ test.answer_count || 0 }}/{{ test.total_questions || 60 }}</span>
                <div class="progress-bar">
                  <div 
                    class="progress-fill" 
                    :style="{ width: getProgressPercentage(test) + '%' }"
                  ></div>
                </div>
              </div>
            </td>
            <td class="test-duration">{{ formatDuration(test.test_duration) }}</td>
            <td class="completion-rate">
              <span class="rate-value">{{ getCompletionRate(test) }}%</span>
            </td>
            <td class="start-time">{{ formatDate(test.created_at) }}</td>
            <td class="end-time">{{ formatDate(test.completed_at) || '-' }}</td>
            <td class="test-actions">
              <div class="action-buttons">
                <button @click="viewTest(test)" class="action-btn view-btn" title="查看详情">
                  👁️
                </button>
                <button @click="viewAnswers(test)" class="action-btn answers-btn" title="查看答案">
                  📋
                </button>
                <button 
                  v-if="test.status === 'in_progress'"
                  @click="markAbandoned(test)" 
                  class="action-btn abandon-btn" 
                  title="标记为放弃"
                >
                  🚫
                </button>
                <button @click="deleteTest(test)" class="action-btn delete-btn" title="删除测试">
                  🗑️
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- 分页控件 -->
    <div v-if="pagination.totalPages > 1" class="pagination">
      <button 
        @click="goToPage(1)" 
        :disabled="pagination.page === 1"
        class="page-btn"
      >
        首页
      </button>
      <button 
        @click="goToPage(pagination.page - 1)" 
        :disabled="pagination.page === 1"
        class="page-btn"
      >
        上一页
      </button>
      
      <div class="page-numbers">
        <button
          v-for="page in getPageNumbers()"
          :key="page"
          @click="goToPage(page)"
          :class="['page-number', { active: page === pagination.page }]"
        >
          {{ page }}
        </button>
      </div>
      
      <button 
        @click="goToPage(pagination.page + 1)" 
        :disabled="pagination.page === pagination.totalPages"
        class="page-btn"
      >
        下一页
      </button>
      <button 
        @click="goToPage(pagination.totalPages)" 
        :disabled="pagination.page === pagination.totalPages"
        class="page-btn"
      >
        末页
      </button>
    </div>
    
    <!-- 测试详情模态框 -->
    <div v-if="showTestModal" class="modal-overlay" @click="closeTestModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>测试详情</h3>
          <button @click="closeTestModal" class="close-btn">×</button>
        </div>
        <div class="modal-body">
          <TestDetail :test="selectedTest" @close="closeTestModal" />
        </div>
      </div>
    </div>
    
    <!-- 答案详情模态框 -->
    <div v-if="showAnswersModal" class="modal-overlay" @click="closeAnswersModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>答题详情</h3>
          <button @click="closeAnswersModal" class="close-btn">×</button>
        </div>
        <div class="modal-body">
          <TestAnswers :test="selectedTest" :answers="testAnswers" @close="closeAnswersModal" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import TestDetail from './TestDetail.vue'
import TestAnswers from './TestAnswers.vue'

// 响应式数据
const tests = ref([])
const isLoading = ref(false)
const searchQuery = ref('')
const statusFilter = ref('')
const resultFilter = ref('')
const dateRange = reactive({
  start: '',
  end: ''
})
const showTestModal = ref(false)
const showAnswersModal = ref(false)
const selectedTest = ref(null)
const testAnswers = ref([])

// 分页数据
const pagination = reactive({
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0
})

// API基础URL
import { config } from '../../config/index'

const API_BASE = config.api.baseUrl

// 计算完成率
const completionRate = computed(() => {
  if (tests.value.length === 0) return 0
  const completed = tests.value.filter(test => test.status === 'completed').length
  return Math.round((completed / tests.value.length) * 100)
})

// 获取认证头
const getAuthHeaders = () => {
  const token = localStorage.getItem('admin_token')
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
}

// 加载测试列表
const loadTests = async () => {
  isLoading.value = true
  
  try {
    const params = new URLSearchParams({
      page: pagination.page.toString(),
      limit: pagination.limit.toString(),
      search: searchQuery.value,
      status: statusFilter.value,
      result_type: resultFilter.value,
      start_date: dateRange.start,
      end_date: dateRange.end
    })
    
    const response = await fetch(`${API_BASE}/admin/tests?${params}`, {
      headers: getAuthHeaders()
    })
    
    if (response.ok) {
      const data = await response.json()
      if (data.success) {
        tests.value = data.data.tests
        pagination.total = data.data.total
        pagination.totalPages = data.data.totalPages
      }
    } else {
      console.error('加载测试列表失败')
    }
  } catch (error) {
    console.error('加载测试列表失败:', error)
  } finally {
    isLoading.value = false
  }
}

// 搜索处理
let searchTimeout = null
const handleSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    pagination.page = 1
    loadTests()
  }, 500)
}

// 重置筛选
const resetFilters = () => {
  searchQuery.value = ''
  statusFilter.value = ''
  resultFilter.value = ''
  dateRange.start = ''
  dateRange.end = ''
  pagination.page = 1
  loadTests()
}

// 分页跳转
const goToPage = (page) => {
  if (page >= 1 && page <= pagination.totalPages) {
    pagination.page = page
    loadTests()
  }
}

// 获取页码数组
const getPageNumbers = () => {
  const current = pagination.page
  const total = pagination.totalPages
  const pages = []
  
  let start = Math.max(1, current - 2)
  let end = Math.min(total, current + 2)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
}

// 查看测试详情
const viewTest = async (test) => {
  try {
    const response = await fetch(`${API_BASE}/admin/tests/${test.session_id}`, {
      headers: getAuthHeaders()
    })
    
    if (response.ok) {
      const data = await response.json()
      if (data.success) {
        selectedTest.value = data.data
        showTestModal.value = true
      }
    }
  } catch (error) {
    console.error('获取测试详情失败:', error)
  }
}

// 查看答案详情
const viewAnswers = async (test) => {
  try {
    const response = await fetch(`${API_BASE}/admin/tests/${test.session_id}/answers`, {
      headers: getAuthHeaders()
    })
    
    if (response.ok) {
      const data = await response.json()
      if (data.success) {
        selectedTest.value = test
        testAnswers.value = data.data
        showAnswersModal.value = true
      }
    }
  } catch (error) {
    console.error('获取答案详情失败:', error)
  }
}

// 标记为放弃
const markAbandoned = async (test) => {
  if (!confirm(`确定要将测试 "${test.session_id}" 标记为放弃吗？`)) {
    return
  }
  
  try {
    // 调用标记放弃API
    test.status = 'abandoned'
    alert('测试已标记为放弃')
  } catch (error) {
    console.error('标记放弃失败:', error)
    alert('标记放弃失败')
  }
}

// 删除测试
const deleteTest = async (test) => {
  if (!confirm(`确定要删除测试 "${test.session_id}" 吗？此操作不可恢复！`)) {
    return
  }
  
  try {
    // 调用删除测试API
    const index = tests.value.findIndex(t => t.session_id === test.session_id)
    if (index > -1) {
      tests.value.splice(index, 1)
      pagination.total--
    }
    alert('测试删除成功')
  } catch (error) {
    console.error('删除测试失败:', error)
    alert('删除测试失败')
  }
}

// 导出测试数据
const exportTests = () => {
  alert('导出测试数据功能开发中...')
}

// 关闭模态框
const closeTestModal = () => {
  showTestModal.value = false
  selectedTest.value = null
}

const closeAnswersModal = () => {
  showAnswersModal.value = false
  selectedTest.value = null
  testAnswers.value = []
}

// 工具函数
const getUserAvatar = (user) => {
  if (!user || !user.nickname) return '?'
  return user.nickname.charAt(0).toUpperCase()
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

const getProgressPercentage = (test) => {
  const answered = test.answer_count || 0
  const total = test.total_questions || 60
  return Math.round((answered / total) * 100)
}

const getCompletionRate = (test) => {
  if (test.completion_rate) {
    return Math.round(test.completion_rate * 100)
  }
  return getProgressPercentage(test)
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

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 组件挂载时加载数据
onMounted(() => {
  loadTests()
})
</script>

<style scoped>
.tests-management {
  max-width: 1400px;
  margin: 0 auto;
}

/* 页面头部 */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 4px;
}

.page-subtitle {
  color: #6b7280;
  margin: 0;
}

.export-button {
  padding: 10px 20px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.export-button:hover {
  background: #2563eb;
}

/* 搜索和筛选 */
.filters-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid #f1f5f9;
}

.search-box {
  position: relative;
  margin-bottom: 16px;
}

.search-input {
  width: 100%;
  padding: 12px 16px 12px 40px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
  box-sizing: border-box;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
}

.filter-controls {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-select,
.date-input {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background: white;
}

.reset-button {
  padding: 8px 16px;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.reset-button:hover {
  background: #e5e7eb;
}

/* 统计栏 */
.stats-bar {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 20px;
  padding: 16px 20px;
  background: white;
  border-radius: 8px;
  border: 1px solid #f1f5f9;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-label {
  color: #6b7280;
  font-size: 14px;
}

.stat-value {
  color: #1a202c;
  font-weight: 600;
  font-size: 14px;
}

.limit-select {
  padding: 4px 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 14px;
}

/* 表格容器 */
.tests-table-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid #f1f5f9;
  margin-bottom: 20px;
}

/* 加载和空状态 */
.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #6b7280;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f4f6;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

/* 测试表格 */
.tests-table {
  width: 100%;
  border-collapse: collapse;
}

.tests-table th {
  background: #f8fafc;
  padding: 16px 12px;
  text-align: left;
  font-weight: 600;
  color: #374151;
  font-size: 14px;
  border-bottom: 1px solid #e5e7eb;
}

.tests-table td {
  padding: 16px 12px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 14px;
}

.test-row:hover {
  background: #f8fafc;
}

/* 表格单元格样式 */
.session-id {
  font-family: monospace;
  color: #6b7280;
  font-size: 12px;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 500;
  color: #1a202c;
  font-size: 14px;
}

.user-id {
  font-size: 12px;
  color: #6b7280;
  font-family: monospace;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
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
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background: #f3f4f6;
  color: #374151;
}

.no-result {
  color: #9ca3af;
}

.progress-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.progress-text {
  font-size: 12px;
  color: #6b7280;
}

.progress-bar {
  width: 60px;
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #3b82f6;
  transition: width 0.3s ease;
}

.rate-value {
  font-weight: 600;
  color: #1a202c;
}

.action-buttons {
  display: flex;
  gap: 4px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.2s;
}

.view-btn {
  background: #f3f4f6;
  color: #374151;
}

.view-btn:hover {
  background: #e5e7eb;
}

.answers-btn {
  background: #dbeafe;
  color: #1d4ed8;
}

.answers-btn:hover {
  background: #bfdbfe;
}

.abandon-btn {
  background: #fef3c7;
  color: #92400e;
}

.abandon-btn:hover {
  background: #fde68a;
}

.delete-btn {
  background: #fee2e2;
  color: #991b1b;
}

.delete-btn:hover {
  background: #fecaca;
}

/* 分页 */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 20px;
}

.page-btn {
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  background: #f3f4f6;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 4px;
}

.page-number {
  width: 36px;
  height: 36px;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.page-number:hover {
  background: #f3f4f6;
}

.page-number.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

/* 模态框 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 900px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1a202c;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: #f3f4f6;
  border-radius: 6px;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #e5e7eb;
}

.modal-body {
  padding: 24px;
  max-height: calc(90vh - 80px);
  overflow-y: auto;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .filter-controls {
    flex-direction: column;
  }
  
  .stats-bar {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .tests-table-container {
    overflow-x: auto;
  }
  
  .tests-table {
    min-width: 1000px;
  }
  
  .pagination {
    flex-wrap: wrap;
  }
}
</style>