<template>
  <div class="admin-container">
    <!-- 登录页面 -->
    <div v-if="!isAuthenticated" class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h1 class="login-title">MBTI 管理后台</h1>
          <p class="login-subtitle">请登录以访问管理功能</p>
        </div>
        
        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="username" class="form-label">用户名</label>
            <input
              id="username"
              v-model="loginForm.username"
              type="text"
              class="form-input"
              placeholder="请输入用户名"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="password" class="form-label">密码</label>
            <input
              id="password"
              v-model="loginForm.password"
              type="password"
              class="form-input"
              placeholder="请输入密码"
              required
            />
          </div>
          
          <button
            type="submit"
            class="login-button"
            :disabled="isLoading"
          >
            <span v-if="isLoading" class="loading-spinner"></span>
            {{ isLoading ? '登录中...' : '登录' }}
          </button>
          
          <div v-if="loginError" class="error-message">
            {{ loginError }}
          </div>
        </form>
        
        <div class="login-footer">
        </div>
      </div>
    </div>
    
    <!-- 管理后台主界面 -->
    <div v-else class="admin-layout">
      <!-- 侧边栏 -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <h2 class="sidebar-title">MBTI 管理</h2>
        </div>
        
        <nav class="sidebar-nav">
          <ul class="nav-list">
            <li class="nav-item">
              <button
                @click="activeTab = 'dashboard'"
                :class="['nav-link', { active: activeTab === 'dashboard' }]"
              >
                <span class="nav-icon">📊</span>
                <span class="nav-text">仪表板</span>
              </button>
            </li>
            <li class="nav-item">
              <button
                @click="activeTab = 'users'"
                :class="['nav-link', { active: activeTab === 'users' }]"
              >
                <span class="nav-icon">👥</span>
                <span class="nav-text">用户管理</span>
              </button>
            </li>
            <li class="nav-item">
              <button
                @click="activeTab = 'sessions'"
                :class="['nav-link', { active: activeTab === 'sessions' }]"
              >
                <span class="nav-icon">📝</span>
                <span class="nav-text">测试管理</span>
              </button>
            </li>
            <li class="nav-item">
              <button
                @click="activeTab = 'analytics'"
                :class="['nav-link', { active: activeTab === 'analytics' }]"
              >
                <span class="nav-icon">📈</span>
                <span class="nav-text">数据分析</span>
              </button>
            </li>
            <li class="nav-item">
              <button
                @click="activeTab = 'settings'"
                :class="['nav-link', { active: activeTab === 'settings' }]"
              >
                <span class="nav-icon">⚙️</span>
                <span class="nav-text">系统设置</span>
              </button>
            </li>
          </ul>
        </nav>
      </aside>
      
      <!-- 主内容区 -->
      <main class="main-content">
        <!-- 顶部导航栏 -->
        <header class="top-header">
          <div class="header-left">
            <h1 class="page-title">{{ getPageTitle() }}</h1>
          </div>
          <div class="header-right">
            <div class="user-info">
              <span class="user-name">{{ currentUser?.username }}</span>
              <button @click="handleLogout" class="logout-button">
                退出登录
              </button>
            </div>
          </div>
        </header>
        
        <!-- 页面内容 -->
        <div class="page-content">
          <!-- 仪表板 -->
          <AdminDashboard v-if="activeTab === 'dashboard'" />
          
          <!-- 用户管理 -->
          <AdminUsers v-else-if="activeTab === 'users'" />
          
          <!-- 测试管理 -->
          <AdminTests v-else-if="activeTab === 'sessions'" />
          
          <!-- 数据分析 -->
          <AdminAnalytics v-else-if="activeTab === 'analytics'" />
          
          <!-- 系统设置 -->
          <AdminSettings v-else-if="activeTab === 'settings'" />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import AdminDashboard from '../components/admin/AdminDashboard.vue'
import AdminUsers from '../components/admin/AdminUsers.vue'
import AdminTests from '../components/admin/AdminTests.vue'
import AdminAnalytics from '../components/admin/AdminAnalytics.vue'
import AdminSettings from '../components/admin/AdminSettings.vue'

const router = useRouter()

// 响应式数据
const isAuthenticated = ref(false)
const isLoading = ref(false)
const loginError = ref('')
const activeTab = ref('dashboard')
const currentUser = ref(null)

// 登录表单
const loginForm = reactive({
  username: '',
  password: ''
})

import { config } from '../config/index'

// API基础URL
const API_BASE = config.api.baseUrl

// 计算属性
const getPageTitle = () => {
  const titles = {
    dashboard: '仪表板',
    users: '用户管理',
    sessions: '测试管理',
    analytics: '数据分析',
    settings: '系统设置'
  }
  return titles[activeTab.value] || '管理后台'
}

// 登录处理
const handleLogin = async () => {
  if (!loginForm.username || !loginForm.password) {
    loginError.value = '请输入用户名和密码'
    return
  }
  
  isLoading.value = true
  loginError.value = ''
  
  try {
    const response = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: loginForm.username,
        password: loginForm.password
      })
    })
    
    const data = await response.json()
    
    if (response.ok && data.success) {
      // 保存token和用户信息
      localStorage.setItem('admin_token', data.token)
      localStorage.setItem('admin_user', JSON.stringify(data.user))
      
      currentUser.value = data.user
      isAuthenticated.value = true
      
      console.log('管理员登录成功:', data.user)
    } else {
      loginError.value = data.error || '登录失败'
    }
  } catch (error) {
    console.error('登录请求失败:', error)
    loginError.value = '网络错误，请检查后端服务是否启动'
  } finally {
    isLoading.value = false
  }
}

// 退出登录
const handleLogout = () => {
  localStorage.removeItem('admin_token')
  localStorage.removeItem('admin_user')
  currentUser.value = null
  isAuthenticated.value = false
  activeTab.value = 'dashboard'
  
  // 清空登录表单
  loginForm.username = ''
  loginForm.password = ''
}

// 验证token
const verifyToken = async () => {
  const token = localStorage.getItem('admin_token')
  const userStr = localStorage.getItem('admin_user')
  
  if (!token || !userStr) {
    return false
  }
  
  try {
    const response = await fetch(`${API_BASE}/admin/verify`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      if (data.success) {
        currentUser.value = JSON.parse(userStr)
        return true
      }
    }
  } catch (error) {
    console.error('Token验证失败:', error)
  }
  
  // Token无效，清除本地存储
  localStorage.removeItem('admin_token')
  localStorage.removeItem('admin_user')
  return false
}

// 组件挂载时检查认证状态
onMounted(async () => {
  const isValid = await verifyToken()
  isAuthenticated.value = isValid
})
</script>

<style scoped>
/* 容器样式 */
.admin-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* 登录页面样式 */
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
}

.login-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 400px;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-title {
  font-size: 28px;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 8px;
}

.login-subtitle {
  color: #718096;
  font-size: 16px;
}

.login-form {
  space-y: 24px;
}

.form-group {
  margin-bottom: 24px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.2s;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.login-button {
  width: 100%;
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.login-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-message {
  color: #ef4444;
  font-size: 14px;
  margin-top: 12px;
  text-align: center;
}

.login-footer {
  margin-top: 24px;
  text-align: center;
}

.demo-info {
  color: #6b7280;
  font-size: 14px;
}

/* 管理后台布局样式 */
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: #f8fafc;
}

/* 侧边栏样式 */
.sidebar {
  width: 260px;
  background: white;
  border-right: 1px solid #e5e7eb;
  box-shadow: 2px 0 4px rgba(0, 0, 0, 0.02);
}

.sidebar-header {
  padding: 24px 20px;
  border-bottom: 1px solid #e5e7eb;
}

.sidebar-title {
  font-size: 20px;
  font-weight: 700;
  color: #1a202c;
}

.sidebar-nav {
  padding: 16px 0;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-item {
  margin-bottom: 4px;
}

.nav-link {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 12px 20px;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
  color: #6b7280;
}

.nav-link:hover {
  background: #f3f4f6;
  color: #374151;
}

.nav-link.active {
  background: #eff6ff;
  color: #2563eb;
  border-right: 3px solid #2563eb;
}

.nav-icon {
  font-size: 18px;
  margin-right: 12px;
}

.nav-text {
  font-size: 14px;
  font-weight: 500;
}

/* 主内容区样式 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.top-header {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #1a202c;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-name {
  font-size: 14px;
  color: #6b7280;
}

.logout-button {
  padding: 8px 16px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-button:hover {
  background: #dc2626;
}

.page-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .admin-layout {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    height: auto;
  }
  
  .sidebar-nav {
    display: flex;
    overflow-x: auto;
    padding: 8px 16px;
  }
  
  .nav-list {
    display: flex;
    gap: 8px;
  }
  
  .nav-item {
    margin-bottom: 0;
    white-space: nowrap;
  }
  
  .nav-link {
    padding: 8px 16px;
    border-radius: 6px;
  }
  
  .nav-link.active {
    border-right: none;
    background: #2563eb;
    color: white;
  }
  
  .page-content {
    padding: 16px;
  }
}
</style>