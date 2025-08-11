<template>
  <div class="users-management">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">用户管理</h2>
        <p class="page-subtitle">管理系统中的所有用户信息</p>
      </div>
      <div class="header-right">
        <button @click="exportUsers" class="export-button">
          📊 导出用户
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
          placeholder="搜索用户昵称、邮箱或手机号..."
          class="search-input"
        />
        <span class="search-icon">🔍</span>
      </div>
      
      <div class="filter-controls">
        <select v-model="statusFilter" @change="loadUsers" class="filter-select">
          <option value="">全部状态</option>
          <option value="1">正常</option>
          <option value="0">禁用</option>
        </select>
        
        <select v-model="sourceFilter" @change="loadUsers" class="filter-select">
          <option value="">全部来源</option>
          <option value="direct">直接注册</option>
          <option value="wechat">微信</option>
          <option value="qq">QQ</option>
        </select>
        
        <button @click="resetFilters" class="reset-button">
          重置筛选
        </button>
      </div>
    </div>
    
    <!-- 用户统计 -->
    <div class="stats-bar">
      <div class="stat-item">
        <span class="stat-label">总用户数:</span>
        <span class="stat-value">{{ pagination.total }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">当前页:</span>
        <span class="stat-value">{{ pagination.page }}/{{ pagination.totalPages }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">每页显示:</span>
        <select v-model="pagination.limit" @change="loadUsers" class="limit-select">
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </select>
      </div>
    </div>
    
    <!-- 用户列表 -->
    <div class="users-table-container">
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>加载用户数据中...</p>
      </div>
      
      <div v-else-if="users.length === 0" class="empty-state">
        <div class="empty-icon">👥</div>
        <h3>暂无用户数据</h3>
        <p>{{ searchQuery ? '没有找到匹配的用户' : '系统中还没有用户注册' }}</p>
      </div>
      
      <table v-else class="users-table">
        <thead>
          <tr>
            <th>用户ID</th>
            <th>昵称</th>
            <th>邮箱</th>
            <th>手机号</th>
            <th>性别</th>
            <th>地区</th>
            <th>注册来源</th>
            <th>状态</th>
            <th>注册时间</th>
            <th>最后登录</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.user_id" class="user-row">
            <td class="user-id">{{ user.user_id }}</td>
            <td class="user-nickname">
              <div class="nickname-cell">
                <div class="avatar">{{ getAvatarText(user.nickname) }}</div>
                <span>{{ user.nickname || '未设置' }}</span>
              </div>
            </td>
            <td class="user-email">{{ user.email || '-' }}</td>
            <td class="user-phone">{{ user.phone || '-' }}</td>
            <td class="user-gender">
              <span class="gender-badge" :class="user.gender">
                {{ getGenderText(user.gender) }}
              </span>
            </td>
            <td class="user-location">{{ getLocationText(user) }}</td>
            <td class="user-source">
              <span class="source-badge" :class="user.registration_source">
                {{ getSourceText(user.registration_source) }}
              </span>
            </td>
            <td class="user-status">
              <span class="status-badge" :class="user.status ? 'active' : 'inactive'">
                {{ user.status ? '正常' : '禁用' }}
              </span>
            </td>
            <td class="user-created">{{ formatDate(user.created_at) }}</td>
            <td class="user-login">{{ formatDate(user.last_login) }}</td>
            <td class="user-actions">
              <button @click="viewUser(user)" class="action-btn view-btn" title="查看详情">
                👁️
              </button>
              <button @click="editUser(user)" class="action-btn edit-btn" title="编辑用户">
                ✏️
              </button>
              <button 
                @click="toggleUserStatus(user)" 
                class="action-btn toggle-btn"
                :class="user.status ? 'disable-btn' : 'enable-btn'"
                :title="user.status ? '禁用用户' : '启用用户'"
              >
                {{ user.status ? '🚫' : '✅' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- 分页 -->
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
          v-for="pageNum in getPageNumbers()"
          :key="pageNum"
          @click="goToPage(pageNum)"
          class="page-num"
          :class="{ active: pageNum === pagination.page }"
        >
          {{ pageNum }}
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
    
    <!-- 用户详情模态框 -->
    <div v-if="showUserModal" class="modal-overlay" @click="closeUserModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>用户详情</h3>
          <button @click="closeUserModal" class="close-btn">×</button>
        </div>
        <div class="modal-body">
          <UserDetail v-if="selectedUser" :user="selectedUser" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import UserDetail from './UserDetail.vue'

// 响应式数据
const isLoading = ref(false)
const users = ref([])
const searchQuery = ref('')
const statusFilter = ref('')
const sourceFilter = ref('')
const showUserModal = ref(false)
const selectedUser = ref(null)

// 分页数据
const pagination = reactive({
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0
})

// API基础URL - 修复硬编码问题
import config from '../../config/index'
const API_BASE = config.api.baseUrl

// 获取认证头
const getAuthHeaders = () => {
  const token = localStorage.getItem('admin_token')
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
}

// 加载用户列表
const loadUsers = async () => {
  isLoading.value = true
  
  try {
    const params = new URLSearchParams({
      page: pagination.page.toString(),
      limit: pagination.limit.toString(),
      search: searchQuery.value,
      status: statusFilter.value
    })
    
    const response = await fetch(`${API_BASE}/admin/users?${params}`, {
      headers: getAuthHeaders()
    })
    
    if (response.ok) {
      const data = await response.json()
      if (data.success) {
        users.value = data.data.users
        pagination.total = data.data.total
        pagination.totalPages = data.data.totalPages
      } else {
        console.error('加载用户列表失败:', data.error)
      }
    } else {
      console.error('加载用户列表失败: HTTP', response.status)
    }
  } catch (error) {
    console.error('加载用户列表失败:', error)
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
    loadUsers()
  }, 500)
}

// 重置筛选
const resetFilters = () => {
  searchQuery.value = ''
  statusFilter.value = ''
  sourceFilter.value = ''
  pagination.page = 1
  loadUsers()
}

// 分页跳转
const goToPage = (page) => {
  if (page >= 1 && page <= pagination.totalPages) {
    pagination.page = page
    loadUsers()
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

// 查看用户详情
const viewUser = async (user) => {
  try {
    const response = await fetch(`${API_BASE}/admin/users/${user.user_id}`, {
      headers: getAuthHeaders()
    })
    
    if (response.ok) {
      const data = await response.json()
      if (data.success) {
        selectedUser.value = data.data
        showUserModal.value = true
      }
    }
  } catch (error) {
    console.error('获取用户详情失败:', error)
  }
}

// 编辑用户
const editUser = (user) => {
  // 编辑用户逻辑
  alert(`编辑用户功能开发中: ${user.nickname || user.user_id}`)
}

// 切换用户状态
const toggleUserStatus = async (user) => {
  const newStatus = user.status ? 0 : 1
  const action = newStatus ? '启用' : '禁用'
  
  if (!confirm(`确定要${action}用户 "${user.nickname || user.user_id}" 吗？`)) {
    return
  }
  
  try {
    const response = await fetch(`${API_BASE}/admin/users/${user.user_id}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status: newStatus })
    })
    
    if (response.ok) {
      const data = await response.json()
      if (data.success) {
        user.status = newStatus
        alert(`用户${action}成功`)
      } else {
        alert(`${action}用户失败: ${data.error}`)
      }
    } else {
      alert(`${action}用户失败`)
    }
  } catch (error) {
    console.error(`${action}用户失败:`, error)
    alert(`${action}用户失败`)
  }
}

// 导出用户
const exportUsers = () => {
  // 导出用户逻辑
  alert('导出用户功能开发中...')
}

// 关闭用户详情模态框
const closeUserModal = () => {
  showUserModal.value = false
  selectedUser.value = null
}

// 工具函数
const getAvatarText = (nickname) => {
  if (!nickname) return '?'
  return nickname.charAt(0).toUpperCase()
}

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
  return user.city || user.province || '-'
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
  loadUsers()
})
</script>

<style scoped>
.users-management {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

/* 页面头部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e0e6ed;
}

.header-left .page-title {
  font-size: 28px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 8px 0;
}

.header-left .page-subtitle {
  font-size: 16px;
  color: #7f8c8d;
  margin: 0;
}

.export-button {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
}

.export-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(52, 152, 219, 0.4);
}

/* 筛选区域 */
.filters-section {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
  display: flex;
  gap: 20px;
  align-items: center;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 300px;
}

.search-input {
  width: 100%;
  padding: 12px 16px 12px 44px;
  border: 2px solid #e0e6ed;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #3498db;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #7f8c8d;
}

.filter-controls {
  display: flex;
  gap: 12px;
  align-items: center;
}

.filter-select {
  padding: 10px 12px;
  border: 2px solid #e0e6ed;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  cursor: pointer;
}

.reset-button {
  background: #95a5a6;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.3s;
}

.reset-button:hover {
  background: #7f8c8d;
}

/* 统计栏 */
.stats-bar {
  background: white;
  padding: 16px 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-label {
  font-weight: 600;
  color: #2c3e50;
}

.stat-value {
  color: #3498db;
  font-weight: 700;
}

.limit-select {
  padding: 6px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
}

/* 表格容器 */
.users-table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

/* 加载状态 */
.loading-state {
  padding: 60px 20px;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 空状态 */
.empty-state {
  padding: 60px 20px;
  text-align: center;
  color: #7f8c8d;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state h3 {
  color: #2c3e50;
  margin-bottom: 8px;
}

/* 用户表格 */
.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th {
  background: #f8f9fa;
  padding: 16px;
  text-align: left;
  font-weight: 600;
  color: #2c3e50;
  border-bottom: 2px solid #e0e6ed;
}

.users-table td {
  padding: 16px;
  border-bottom: 1px solid #e0e6ed;
  vertical-align: middle;
}

.user-row:hover {
  background: #f8f9fa;
}

/* 用户昵称单元格 */
.nickname-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
}

/* 徽章样式 */
.gender-badge, .source-badge, .status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.gender-badge.male {
  background: #e3f2fd;
  color: #1976d2;
}

.gender-badge.female {
  background: #fce4ec;
  color: #c2185b;
}

.source-badge.direct {
  background: #e8f5e8;
  color: #2e7d32;
}

.source-badge.wechat {
  background: #e8f8f5;
  color: #00695c;
}

.status-badge.active {
  background: #e8f5e8;
  color: #2e7d32;
}

.status-badge.inactive {
  background: #ffebee;
  color: #c62828;
}

/* 操作按钮 */
.user-actions {
  display: flex;
  gap: 8px;
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
  transition: all 0.3s;
}

.view-btn {
  background: #e3f2fd;
  color: #1976d2;
}

.edit-btn {
  background: #fff3e0;
  color: #f57c00;
}

.disable-btn {
  background: #ffebee;
  color: #c62828;
}

.enable-btn {
  background: #e8f5e8;
  color: #2e7d32;
}

.action-btn:hover {
  transform: scale(1.1);
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 24px;
}

.page-btn, .page-num {
  padding: 8px 12px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-num.active {
  background: #3498db;
  color: white;
  border-color: #3498db;
}

.page-btn:hover:not(:disabled),
.page-num:hover:not(.active) {
  background: #f8f9fa;
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
  max-width: 90vw;
  max-height: 90vh;
  overflow: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e0e6ed;
}

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #7f8c8d;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #2c3e50;
}

.modal-body {
  padding: 24px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .users-management {
    padding: 10px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
  
  .filters-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-controls {
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .users-table-container {
    overflow-x: auto;
  }
  
  .users-table {
    min-width: 800px;
  }
}
</style>