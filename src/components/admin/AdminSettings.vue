<template>
  <div class="admin-settings">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">系统设置</h2>
      <div class="header-actions">
        <button @click="saveAllSettings" class="save-all-btn" :disabled="!hasChanges">
          💾 保存所有设置
        </button>
      </div>
    </div>
    
    <!-- 设置导航 -->
    <div class="settings-nav">
      <button 
        v-for="tab in settingsTabs" 
        :key="tab.key"
        @click="activeTab = tab.key"
        class="nav-tab"
        :class="{ active: activeTab === tab.key }"
      >
        <span class="tab-icon">{{ tab.icon }}</span>
        <span class="tab-label">{{ tab.label }}</span>
      </button>
    </div>
    
    <!-- 基本设置 -->
    <div v-if="activeTab === 'basic'" class="settings-section">
      <div class="section-header">
        <h3 class="section-title">基本设置</h3>
        <p class="section-description">配置系统的基本信息和参数</p>
      </div>
      
      <div class="settings-grid">
        <div class="setting-item">
          <label class="setting-label">系统名称</label>
          <input 
            v-model="settings.basic.systemName" 
            type="text" 
            class="setting-input"
            placeholder="请输入系统名称"
          >
          <p class="setting-help">显示在页面标题和导航栏中的系统名称</p>
        </div>
        
        <div class="setting-item">
          <label class="setting-label">系统描述</label>
          <textarea 
            v-model="settings.basic.systemDescription" 
            class="setting-textarea"
            placeholder="请输入系统描述"
            rows="3"
          ></textarea>
          <p class="setting-help">系统的简要描述信息</p>
        </div>
        
        <div class="setting-item">
          <label class="setting-label">联系邮箱</label>
          <input 
            v-model="settings.basic.contactEmail" 
            type="email" 
            class="setting-input"
            placeholder="请输入联系邮箱"
          >
          <p class="setting-help">用户反馈和系统通知的邮箱地址</p>
        </div>
        
        <div class="setting-item">
          <label class="setting-label">客服电话</label>
          <input 
            v-model="settings.basic.supportPhone" 
            type="tel" 
            class="setting-input"
            placeholder="请输入客服电话"
          >
          <p class="setting-help">客户服务热线电话</p>
        </div>
        
        <div class="setting-item">
          <label class="setting-label">网站域名</label>
          <input 
            v-model="settings.basic.websiteUrl" 
            type="url" 
            class="setting-input"
            placeholder="https://example.com"
          >
          <p class="setting-help">网站的主域名地址</p>
        </div>
        
        <div class="setting-item">
          <label class="setting-label">备案号</label>
          <input 
            v-model="settings.basic.icpNumber" 
            type="text" 
            class="setting-input"
            placeholder="请输入备案号"
          >
          <p class="setting-help">网站ICP备案号</p>
        </div>
      </div>
    </div>
    
    <!-- 测试设置 -->
    <div v-if="activeTab === 'test'" class="settings-section">
      <div class="section-header">
        <h3 class="section-title">测试设置</h3>
        <p class="section-description">配置MBTI测试的相关参数</p>
      </div>
      
      <div class="settings-grid">
        <div class="setting-item">
          <label class="setting-label">测试题目数量</label>
          <input 
            v-model.number="settings.test.questionCount" 
            type="number" 
            class="setting-input"
            min="20" 
            max="100"
          >
          <p class="setting-help">每次测试的题目总数（建议60题）</p>
        </div>
        
        <div class="setting-item">
          <label class="setting-label">测试时间限制（分钟）</label>
          <input 
            v-model.number="settings.test.timeLimit" 
            type="number" 
            class="setting-input"
            min="10" 
            max="120"
          >
          <p class="setting-help">单次测试的最大时间限制，0表示无限制</p>
        </div>
        
        <div class="setting-item">
          <label class="setting-label">允许重复测试</label>
          <div class="setting-toggle">
            <input 
              v-model="settings.test.allowRetake" 
              type="checkbox" 
              class="toggle-input"
              id="allowRetake"
            >
            <label for="allowRetake" class="toggle-label"></label>
          </div>
          <p class="setting-help">是否允许用户重复进行测试</p>
        </div>
        
        <div class="setting-item">
          <label class="setting-label">显示进度条</label>
          <div class="setting-toggle">
            <input 
              v-model="settings.test.showProgress" 
              type="checkbox" 
              class="toggle-input"
              id="showProgress"
            >
            <label for="showProgress" class="toggle-label"></label>
          </div>
          <p class="setting-help">测试过程中是否显示答题进度</p>
        </div>
        
        <div class="setting-item">
          <label class="setting-label">自动保存间隔（秒）</label>
          <input 
            v-model.number="settings.test.autoSaveInterval" 
            type="number" 
            class="setting-input"
            min="10" 
            max="300"
          >
          <p class="setting-help">自动保存答题进度的时间间隔</p>
        </div>
        
        <div class="setting-item">
          <label class="setting-label">结果详细程度</label>
          <select v-model="settings.test.resultDetail" class="setting-select">
            <option value="basic">基础版</option>
            <option value="standard">标准版</option>
            <option value="detailed">详细版</option>
          </select>
          <p class="setting-help">测试结果报告的详细程度</p>
        </div>
      </div>
    </div>
    
    <!-- 支付设置 -->
    <div v-if="activeTab === 'payment'" class="settings-section">
      <div class="section-header">
        <h3 class="section-title">支付设置</h3>
        <p class="section-description">配置支付相关的参数和密钥</p>
      </div>
      
      <div class="settings-grid">
        <div class="setting-item">
          <label class="setting-label">启用支付功能</label>
          <div class="setting-toggle">
            <input 
              v-model="settings.payment.enabled" 
              type="checkbox" 
              class="toggle-input"
              id="paymentEnabled"
            >
            <label for="paymentEnabled" class="toggle-label"></label>
          </div>
          <p class="setting-help">是否启用付费测试功能</p>
        </div>
        
        <div class="setting-item">
          <label class="setting-label">测试价格（分）</label>
          <input 
            v-model.number="settings.payment.testPrice" 
            type="number" 
            class="setting-input"
            min="0"
            :disabled="!settings.payment.enabled"
          >
          <p class="setting-help">单次测试的价格，单位为分（100分=1元）</p>
        </div>
        
        <div class="setting-item">
          <label class="setting-label">免费测试次数</label>
          <input 
            v-model.number="settings.payment.freeTestCount" 
            type="number" 
            class="setting-input"
            min="0"
            :disabled="!settings.payment.enabled"
          >
          <p class="setting-help">每个用户的免费测试次数</p>
        </div>
        
        <div class="setting-item">
          <label class="setting-label">支付宝商户ID</label>
          <input 
            v-model="settings.payment.alipayMerchantId" 
            type="text" 
            class="setting-input"
            placeholder="请输入支付宝商户ID"
            :disabled="!settings.payment.enabled"
          >
          <p class="setting-help">支付宝开放平台的商户ID</p>
        </div>
        
        <div class="setting-item">
          <label class="setting-label">微信支付商户号</label>
          <input 
            v-model="settings.payment.wechatMerchantId" 
            type="text" 
            class="setting-input"
            placeholder="请输入微信支付商户号"
            :disabled="!settings.payment.enabled"
          >
          <p class="setting-help">微信支付的商户号</p>
        </div>
        
        <div class="setting-item">
          <label class="setting-label">支付超时时间（分钟）</label>
          <input 
            v-model.number="settings.payment.timeoutMinutes" 
            type="number" 
            class="setting-input"
            min="5" 
            max="60"
            :disabled="!settings.payment.enabled"
          >
          <p class="setting-help">支付订单的超时时间</p>
        </div>
      </div>
    </div>
    
    <!-- 邮件设置 -->
    <div v-if="activeTab === 'email'" class="settings-section">
      <div class="section-header">
        <h3 class="section-title">邮件设置</h3>
        <p class="section-description">配置邮件发送服务</p>
      </div>
      
      <div class="settings-grid">
        <div class="setting-item">
          <label class="setting-label">启用邮件服务</label>
          <div class="setting-toggle">
            <input 
              v-model="settings.email.enabled" 
              type="checkbox" 
              class="toggle-input"
              id="emailEnabled"
            >
            <label for="emailEnabled" class="toggle-label"></label>
          </div>
          <p class="setting-help">是否启用邮件通知功能</p>
        </div>
        
        <div class="setting-item">
          <label class="setting-label">SMTP服务器</label>
          <input 
            v-model="settings.email.smtpHost" 
            type="text" 
            class="setting-input"
            placeholder="smtp.example.com"
            :disabled="!settings.email.enabled"
          >
          <p class="setting-help">SMTP邮件服务器地址</p>
        </div>
        
        <div class="setting-item">
          <label class="setting-label">SMTP端口</label>
          <input 
            v-model.number="settings.email.smtpPort" 
            type="number" 
            class="setting-input"
            placeholder="587"
            :disabled="!settings.email.enabled"
          >
          <p class="setting-help">SMTP服务器端口号</p>
        </div>
        
        <div class="setting-item">
          <label class="setting-label">发件人邮箱</label>
          <input 
            v-model="settings.email.fromEmail" 
            type="email" 
            class="setting-input"
            placeholder="noreply@example.com"
            :disabled="!settings.email.enabled"
          >
          <p class="setting-help">系统发送邮件的邮箱地址</p>
        </div>
        
        <div class="setting-item">
          <label class="setting-label">发件人名称</label>
          <input 
            v-model="settings.email.fromName" 
            type="text" 
            class="setting-input"
            placeholder="MBTI测试系统"
            :disabled="!settings.email.enabled"
          >
          <p class="setting-help">邮件显示的发件人名称</p>
        </div>
        
        <div class="setting-item">
          <label class="setting-label">邮箱用户名</label>
          <input 
            v-model="settings.email.username" 
            type="text" 
            class="setting-input"
            placeholder="请输入邮箱用户名"
            :disabled="!settings.email.enabled"
          >
          <p class="setting-help">SMTP认证用户名</p>
        </div>
        
        <div class="setting-item">
          <label class="setting-label">邮箱密码</label>
          <input 
            v-model="settings.email.password" 
            type="password" 
            class="setting-input"
            placeholder="请输入邮箱密码"
            :disabled="!settings.email.enabled"
          >
          <p class="setting-help">SMTP认证密码或授权码</p>
        </div>
        
        <div class="setting-item">
          <label class="setting-label">启用SSL</label>
          <div class="setting-toggle">
            <input 
              v-model="settings.email.useSSL" 
              type="checkbox" 
              class="toggle-input"
              id="emailSSL"
              :disabled="!settings.email.enabled"
            >
            <label for="emailSSL" class="toggle-label"></label>
          </div>
          <p class="setting-help">是否使用SSL加密连接</p>
        </div>
        
        <div class="setting-actions">
          <button 
            @click="testEmailConnection" 
            class="test-btn"
            :disabled="!settings.email.enabled || testingEmail"
          >
            {{ testingEmail ? '测试中...' : '🧪 测试邮件连接' }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- 安全设置 -->
    <div v-if="activeTab === 'security'" class="settings-section">
      <div class="section-header">
        <h3 class="section-title">安全设置</h3>
        <p class="section-description">配置系统安全相关参数</p>
      </div>
      
      <div class="settings-grid">
        <div class="setting-item">
          <label class="setting-label">启用访问限制</label>
          <div class="setting-toggle">
            <input 
              v-model="settings.security.enableRateLimit" 
              type="checkbox" 
              class="toggle-input"
              id="rateLimit"
            >
            <label for="rateLimit" class="toggle-label"></label>
          </div>
          <p class="setting-help">是否启用API访问频率限制</p>
        </div>
        
        <div class="setting-item">
          <label class="setting-label">每分钟最大请求数</label>
          <input 
            v-model.number="settings.security.maxRequestsPerMinute" 
            type="number" 
            class="setting-input"
            min="10" 
            max="1000"
            :disabled="!settings.security.enableRateLimit"
          >
          <p class="setting-help">单个IP每分钟最大请求次数</p>
        </div>
        
        <div class="setting-item">
          <label class="setting-label">JWT过期时间（小时）</label>
          <input 
            v-model.number="settings.security.jwtExpirationHours" 
            type="number" 
            class="setting-input"
            min="1" 
            max="168"
          >
          <p class="setting-help">JWT令牌的有效期</p>
        </div>
        
        <div class="setting-item">
          <label class="setting-label">密码最小长度</label>
          <input 
            v-model.number="settings.security.minPasswordLength" 
            type="number" 
            class="setting-input"
            min="6" 
            max="20"
          >
          <p class="setting-help">用户密码的最小长度要求</p>
        </div>
        
        <div class="setting-item">
          <label class="setting-label">登录失败锁定</label>
          <div class="setting-toggle">
            <input 
              v-model="settings.security.enableLoginLock" 
              type="checkbox" 
              class="toggle-input"
              id="loginLock"
            >
            <label for="loginLock" class="toggle-label"></label>
          </div>
          <p class="setting-help">多次登录失败后是否锁定账户</p>
        </div>
        
        <div class="setting-item">
          <label class="setting-label">最大失败次数</label>
          <input 
            v-model.number="settings.security.maxLoginAttempts" 
            type="number" 
            class="setting-input"
            min="3" 
            max="10"
            :disabled="!settings.security.enableLoginLock"
          >
          <p class="setting-help">触发账户锁定的最大失败次数</p>
        </div>
        
        <div class="setting-item">
          <label class="setting-label">锁定时间（分钟）</label>
          <input 
            v-model.number="settings.security.lockDurationMinutes" 
            type="number" 
            class="setting-input"
            min="5" 
            max="1440"
            :disabled="!settings.security.enableLoginLock"
          >
          <p class="setting-help">账户锁定的持续时间</p>
        </div>
        
        <div class="setting-item">
          <label class="setting-label">启用操作日志</label>
          <div class="setting-toggle">
            <input 
              v-model="settings.security.enableAuditLog" 
              type="checkbox" 
              class="toggle-input"
              id="auditLog"
            >
            <label for="auditLog" class="toggle-label"></label>
          </div>
          <p class="setting-help">是否记录管理员操作日志</p>
        </div>
      </div>
    </div>
    
    <!-- 管理员账户 -->
    <div v-if="activeTab === 'admin'" class="settings-section">
      <div class="section-header">
        <h3 class="section-title">管理员账户</h3>
        <p class="section-description">管理系统管理员账户</p>
      </div>
      
      <!-- 当前管理员信息 -->
      <div class="admin-info-card">
        <div class="admin-avatar">
          <div class="avatar">{{ getCurrentAdminAvatar() }}</div>
        </div>
        <div class="admin-details">
          <div class="admin-name">{{ currentAdmin.username }}</div>
          <div class="admin-role">超级管理员</div>
          <div class="admin-meta">
            <span>最后登录: {{ formatDate(currentAdmin.lastLogin) }}</span>
            <span>创建时间: {{ formatDate(currentAdmin.createdAt) }}</span>
          </div>
        </div>
        <div class="admin-actions">
          <button @click="showChangePassword = true" class="change-password-btn">
            🔑 修改密码
          </button>
        </div>
      </div>
      
      <!-- 修改密码表单 -->
      <div v-if="showChangePassword" class="password-form">
        <h4 class="form-title">修改密码</h4>
        <div class="form-grid">
          <div class="form-item">
            <label class="form-label">当前密码</label>
            <input 
              v-model="passwordForm.currentPassword" 
              type="password" 
              class="form-input"
              placeholder="请输入当前密码"
            >
          </div>
          <div class="form-item">
            <label class="form-label">新密码</label>
            <input 
              v-model="passwordForm.newPassword" 
              type="password" 
              class="form-input"
              placeholder="请输入新密码"
            >
          </div>
          <div class="form-item">
            <label class="form-label">确认新密码</label>
            <input 
              v-model="passwordForm.confirmPassword" 
              type="password" 
              class="form-input"
              placeholder="请再次输入新密码"
            >
          </div>
        </div>
        <div class="form-actions">
          <button @click="changePassword" class="submit-btn" :disabled="!isPasswordFormValid">
            ✅ 确认修改
          </button>
          <button @click="cancelChangePassword" class="cancel-btn">
            ❌ 取消
          </button>
        </div>
      </div>
      
      <!-- 创建新管理员 -->
      <div class="create-admin-section">
        <h4 class="section-subtitle">创建新管理员</h4>
        <div class="form-grid">
          <div class="form-item">
            <label class="form-label">用户名</label>
            <input 
              v-model="newAdminForm.username" 
              type="text" 
              class="form-input"
              placeholder="请输入用户名"
            >
          </div>
          <div class="form-item">
            <label class="form-label">密码</label>
            <input 
              v-model="newAdminForm.password" 
              type="password" 
              class="form-input"
              placeholder="请输入密码"
            >
          </div>
          <div class="form-item">
            <label class="form-label">确认密码</label>
            <input 
              v-model="newAdminForm.confirmPassword" 
              type="password" 
              class="form-input"
              placeholder="请再次输入密码"
            >
          </div>
        </div>
        <div class="form-actions">
          <button @click="createAdmin" class="submit-btn" :disabled="!isNewAdminFormValid">
            ➕ 创建管理员
          </button>
        </div>
      </div>
    </div>
    
    <!-- 保存确认对话框 -->
    <div v-if="showSaveDialog" class="save-dialog-overlay" @click="showSaveDialog = false">
      <div class="save-dialog" @click.stop>
        <div class="dialog-header">
          <h3 class="dialog-title">保存设置</h3>
        </div>
        <div class="dialog-content">
          <p>确定要保存当前的设置更改吗？</p>
          <div class="changed-settings">
            <h4>已修改的设置：</h4>
            <ul>
              <li v-for="change in getChangedSettings()" :key="change">
                {{ change }}
              </li>
            </ul>
          </div>
        </div>
        <div class="dialog-actions">
          <button @click="confirmSaveSettings" class="confirm-btn">
            ✅ 确认保存
          </button>
          <button @click="showSaveDialog = false" class="cancel-btn">
            ❌ 取消
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'

// 响应式数据
const activeTab = ref('basic')
const showChangePassword = ref(false)
const showSaveDialog = ref(false)
const testingEmail = ref(false)

// 设置标签页
const settingsTabs = [
  { key: 'basic', label: '基本设置', icon: '⚙️' },
  { key: 'test', label: '测试设置', icon: '📝' },
  { key: 'payment', label: '支付设置', icon: '💰' },
  { key: 'email', label: '邮件设置', icon: '📧' },
  { key: 'security', label: '安全设置', icon: '🔒' },
  { key: 'admin', label: '管理员', icon: '👤' }
]

// 系统设置
const settings = reactive({
  basic: {
    systemName: 'MBTI性格测试系统',
    systemDescription: '专业的MBTI性格类型测试平台',
    contactEmail: 'contact@example.com',
    supportPhone: '400-123-4567',
    websiteUrl: 'https://example.com',
    icpNumber: ''
  },
  test: {
    questionCount: 60,
    timeLimit: 30,
    allowRetake: true,
    showProgress: true,
    autoSaveInterval: 30,
    resultDetail: 'standard'
  },
  payment: {
    enabled: false,
    testPrice: 1000,
    freeTestCount: 1,
    alipayMerchantId: '',
    wechatMerchantId: '',
    timeoutMinutes: 15
  },
  email: {
    enabled: false,
    smtpHost: '',
    smtpPort: 587,
    fromEmail: '',
    fromName: '',
    username: '',
    password: '',
    useSSL: true
  },
  security: {
    enableRateLimit: true,
    maxRequestsPerMinute: 100,
    jwtExpirationHours: 24,
    minPasswordLength: 8,
    enableLoginLock: true,
    maxLoginAttempts: 5,
    lockDurationMinutes: 30,
    enableAuditLog: true
  }
})

// 原始设置（用于检测变更）
const originalSettings = reactive({})

// 当前管理员信息
const currentAdmin = reactive({
  username: 'admin',
  lastLogin: new Date(),
  createdAt: new Date()
})

// 密码修改表单
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 新管理员表单
const newAdminForm = reactive({
  username: '',
  password: '',
  confirmPassword: ''
})

// 计算属性
const hasChanges = computed(() => {
  return JSON.stringify(settings) !== JSON.stringify(originalSettings)
})

const isPasswordFormValid = computed(() => {
  return passwordForm.currentPassword && 
         passwordForm.newPassword && 
         passwordForm.confirmPassword &&
         passwordForm.newPassword === passwordForm.confirmPassword &&
         passwordForm.newPassword.length >= settings.security.minPasswordLength
})

const isNewAdminFormValid = computed(() => {
  return newAdminForm.username && 
         newAdminForm.password && 
         newAdminForm.confirmPassword &&
         newAdminForm.password === newAdminForm.confirmPassword &&
         newAdminForm.password.length >= settings.security.minPasswordLength
})

// 组件挂载
onMounted(() => {
  loadSettings()
})

// 加载设置
const loadSettings = async () => {
  try {
    const token = localStorage.getItem('admin_token')
    if (!token) return
    
    const response = await fetch('/api/admin/settings', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      Object.assign(settings, data)
      Object.assign(originalSettings, JSON.parse(JSON.stringify(data)))
    }
  } catch (error) {
    console.error('加载设置失败:', error)
  }
}

// 保存所有设置
const saveAllSettings = () => {
  showSaveDialog.value = true
}

// 确认保存设置
const confirmSaveSettings = async () => {
  try {
    const token = localStorage.getItem('admin_token')
    if (!token) return
    
    const response = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(settings)
    })
    
    if (response.ok) {
      Object.assign(originalSettings, JSON.parse(JSON.stringify(settings)))
      showSaveDialog.value = false
      alert('设置保存成功！')
    } else {
      alert('设置保存失败，请重试')
    }
  } catch (error) {
    console.error('保存设置失败:', error)
    alert('设置保存失败，请重试')
  }
}

// 获取已修改的设置
const getChangedSettings = () => {
  const changes = []
  
  // 简化的变更检测
  if (JSON.stringify(settings.basic) !== JSON.stringify(originalSettings.basic)) {
    changes.push('基本设置')
  }
  if (JSON.stringify(settings.test) !== JSON.stringify(originalSettings.test)) {
    changes.push('测试设置')
  }
  if (JSON.stringify(settings.payment) !== JSON.stringify(originalSettings.payment)) {
    changes.push('支付设置')
  }
  if (JSON.stringify(settings.email) !== JSON.stringify(originalSettings.email)) {
    changes.push('邮件设置')
  }
  if (JSON.stringify(settings.security) !== JSON.stringify(originalSettings.security)) {
    changes.push('安全设置')
  }
  
  return changes
}

// 测试邮件连接
const testEmailConnection = async () => {
  testingEmail.value = true
  
  try {
    const token = localStorage.getItem('admin_token')
    if (!token) return
    
    const response = await fetch('/api/admin/test-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(settings.email)
    })
    
    if (response.ok) {
      alert('邮件连接测试成功！')
    } else {
      alert('邮件连接测试失败，请检查配置')
    }
  } catch (error) {
    console.error('测试邮件连接失败:', error)
    alert('邮件连接测试失败，请检查配置')
  } finally {
    testingEmail.value = false
  }
}

// 修改密码
const changePassword = async () => {
  try {
    const token = localStorage.getItem('admin_token')
    if (!token) return
    
    const response = await fetch('/api/admin/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      })
    })
    
    if (response.ok) {
      alert('密码修改成功！')
      cancelChangePassword()
    } else {
      const error = await response.json()
      alert(error.message || '密码修改失败')
    }
  } catch (error) {
    console.error('修改密码失败:', error)
    alert('密码修改失败，请重试')
  }
}

// 取消修改密码
const cancelChangePassword = () => {
  showChangePassword.value = false
  Object.assign(passwordForm, {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
}

// 创建管理员
const createAdmin = async () => {
  try {
    const token = localStorage.getItem('admin_token')
    if (!token) return
    
    const response = await fetch('/api/admin/create-admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        username: newAdminForm.username,
        password: newAdminForm.password
      })
    })
    
    if (response.ok) {
      alert('管理员创建成功！')
      Object.assign(newAdminForm, {
        username: '',
        password: '',
        confirmPassword: ''
      })
    } else {
      const error = await response.json()
      alert(error.message || '管理员创建失败')
    }
  } catch (error) {
    console.error('创建管理员失败:', error)
    alert('管理员创建失败，请重试')
  }
}

// 工具函数
const getCurrentAdminAvatar = () => {
  return currentAdmin.username.charAt(0).toUpperCase()
}

const formatDate = (date) => {
  if (!date) return '未知'
  return new Date(date).toLocaleString('zh-CN')
}
</script>

<style scoped>
.admin-settings {
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

.save-all-btn {
  padding: 10px 20px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.save-all-btn:hover:not(:disabled) {
  background: #059669;
}

.save-all-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

/* 设置导航 */
.settings-nav {
  display: flex;
  gap: 8px;
  margin-bottom: 32px;
  border-bottom: 1px solid #e5e7eb;
  overflow-x: auto;
}

.nav-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border: none;
  background: none;
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
  white-space: nowrap;
}

.nav-tab:hover {
  color: #374151;
  background: #f9fafb;
}

.nav-tab.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
}

.tab-icon {
  font-size: 16px;
}

/* 设置区块 */
.settings-section {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px;
}

.section-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #1a202c;
  margin: 0 0 8px 0;
}

.section-description {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

/* 设置网格 */
.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.setting-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.setting-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.setting-input,
.setting-textarea,
.setting-select {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.setting-input:focus,
.setting-textarea:focus,
.setting-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.setting-input:disabled,
.setting-textarea:disabled,
.setting-select:disabled {
  background: #f9fafb;
  color: #9ca3af;
  cursor: not-allowed;
}

.setting-help {
  font-size: 12px;
  color: #6b7280;
  margin: 0;
}

/* 切换开关 */
.setting-toggle {
  position: relative;
  display: inline-block;
}

.toggle-input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-label {
  display: block;
  width: 48px;
  height: 24px;
  background: #d1d5db;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.2s;
  position: relative;
}

.toggle-label::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  transition: transform 0.2s;
}

.toggle-input:checked + .toggle-label {
  background: #3b82f6;
}

.toggle-input:checked + .toggle-label::after {
  transform: translateX(24px);
}

.toggle-input:disabled + .toggle-label {
  background: #f3f4f6;
  cursor: not-allowed;
}

/* 设置操作 */
.setting-actions {
  grid-column: 1 / -1;
  display: flex;
  gap: 12px;
  justify-content: flex-start;
  margin-top: 16px;
}

.test-btn {
  padding: 8px 16px;
  background: #f59e0b;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.test-btn:hover:not(:disabled) {
  background: #d97706;
}

.test-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

/* 管理员信息卡片 */
.admin-info-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
}

.admin-avatar .avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 24px;
}

.admin-details {
  flex: 1;
}

.admin-name {
  font-size: 18px;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 4px;
}

.admin-role {
  font-size: 14px;
  color: #059669;
  font-weight: 500;
  margin-bottom: 8px;
}

.admin-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: #6b7280;
}

.change-password-btn {
  padding: 8px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.change-password-btn:hover {
  background: #2563eb;
}

/* 表单样式 */
.password-form,
.create-admin-section {
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
}

.form-title,
.section-subtitle {
  font-size: 16px;
  font-weight: 600;
  color: #1a202c;
  margin: 0 0 16px 0;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.form-input {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-actions {
  display: flex;
  gap: 12px;
}

.submit-btn {
  padding: 10px 20px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.submit-btn:hover:not(:disabled) {
  background: #059669;
}

.submit-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.cancel-btn {
  padding: 10px 20px;
  background: #6b7280;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.cancel-btn:hover {
  background: #4b5563;
}

/* 保存对话框 */
.save-dialog-overlay {
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

.save-dialog {
  background: white;
  border-radius: 12px;
  padding: 24px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.dialog-header {
  margin-bottom: 16px;
}

.dialog-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
}

.dialog-content {
  margin-bottom: 24px;
}

.changed-settings {
  margin-top: 16px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 6px;
}

.changed-settings h4 {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 8px 0;
}

.changed-settings ul {
  margin: 0;
  padding-left: 20px;
  font-size: 14px;
  color: #6b7280;
}

.dialog-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.confirm-btn {
  padding: 10px 20px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.confirm-btn:hover {
  background: #059669;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .admin-settings {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .settings-nav {
    flex-wrap: wrap;
  }
  
  .settings-grid {
    grid-template-columns: 1fr;
  }
  
  .admin-info-card {
    flex-direction: column;
    text-align: center;
  }
  
  .admin-meta {
    align-items: center;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .form-actions,
  .dialog-actions {
    flex-direction: column;
  }
}
</style>