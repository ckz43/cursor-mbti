# MBTI测试 UI/UX 设计规范

## 1. 设计理念与原则

### 1.1 设计理念
**专业、权威、温暖、科学**
- 专业：体现心理学的科学性和权威性
- 权威：突出理论基础和专家背书
- 温暖：让用户感受到关怀和理解
- 科学：展示测试的学术基础和可信度

### 1.2 设计原则
1. **权威感建立** - 通过科学依据和专家形象建立信任
2. **情感共鸣** - 通过卡通形象和温暖色彩传达亲和力
3. **专业呈现** - 平衡学术严谨性与用户友好性
4. **视觉层次** - 突出关键信息，引导用户关注

## 2. 首页权威性设计

### 2.1 科学依据展示区域

#### 理论基础介绍
```html
<section class="scientific-foundation">
  <div class="theory-intro">
    <h2>基于百年心理学研究</h2>
    <p class="intro-text">
      MBTI源于著名心理学家卡尔·荣格的心理类型理论，
      经过伊莎贝尔·迈尔斯和凯瑟琳·布里格斯母女70年的研究发展，
      已成为全球最权威的性格测评工具之一。
    </p>
  </div>
</section>
```

#### 权威数据展示
```html
<div class="authority-stats">
  <div class="stat-item">
    <span class="number">100+</span>
    <span class="label">年心理学研究历史</span>
  </div>
  <div class="stat-item">
    <span class="number">89%</span>
    <span class="label">世界500强企业采用</span>
  </div>
  <div class="stat-item">
    <span class="number">50+</span>
    <span class="label">种语言版本</span>
  </div>
  <div class="stat-item">
    <span class="number">200M+</span>
    <span class="label">全球用户使用</span>
  </div>
</div>
```

### 2.2 发明人头像设计

#### 专家介绍区域布局
```html
<section class="founders-section">
  <h2>理论奠基人</h2>
  <div class="founders-grid">
    <!-- 卡尔·荣格 -->
    <div class="founder-card primary">
      <div class="founder-avatar">
        <img src="/images/carl-jung.jpg" alt="卡尔·荣格" class="avatar-image">
        <div class="avatar-ring"></div>
      </div>
      <div class="founder-info">
        <h3>卡尔·荣格</h3>
        <p class="title">瑞士著名心理学家</p>
        <p class="contribution">心理类型理论创始人</p>
        <p class="description">
          首次提出内向/外向概念，奠定了MBTI理论基础
        </p>
      </div>
    </div>
    
    <!-- 凯瑟琳·布里格斯 -->
    <div class="founder-card">
      <div class="founder-avatar">
        <img src="/images/katharine-briggs.jpg" alt="凯瑟琳·布里格斯" class="avatar-image">
      </div>
      <div class="founder-info">
        <h3>凯瑟琳·布里格斯</h3>
        <p class="title">MBTI共同创立者</p>
        <p class="contribution">理论体系化先驱</p>
      </div>
    </div>
    
    <!-- 伊莎贝尔·迈尔斯 -->
    <div class="founder-card">
      <div class="founder-avatar">
        <img src="/images/isabel-myers.jpg" alt="伊莎贝尔·迈尔斯" class="avatar-image">
      </div>
      <div class="founder-info">
        <h3>伊莎贝尔·迈尔斯</h3>
        <p class="title">MBTI测试开发者</p>
        <p class="contribution">现代MBTI创立者</p>
      </div>
    </div>
  </div>
</section>
```

### 2.3 MBTI人物卡通形象设计

#### 16型人格卡通角色展示
```html
<section class="mbti-characters">
  <h2>16种人格，哪一个是你？</h2>
  <p class="section-subtitle">每种人格都有独特的魅力和特征</p>
  
  <div class="characters-grid">
    <!-- 分析师组 (NT) -->
    <div class="character-group analyst">
      <h3 class="group-title">
        <span class="group-icon">🧠</span>
        分析师 (NT)
      </h3>
      <div class="characters-row">
        <div class="character-card" data-type="INTJ">
          <div class="character-avatar">
            <img src="/images/characters/intj-architect.svg" alt="INTJ建筑师">
          </div>
          <h4>建筑师</h4>
          <p class="character-type">INTJ</p>
          <p class="character-trait">独立思考 • 战略规划</p>
        </div>
        
        <div class="character-card" data-type="INTP">
          <div class="character-avatar">
            <img src="/images/characters/intp-thinker.svg" alt="INTP思想家">
          </div>
          <h4>思想家</h4>
          <p class="character-type">INTP</p>
          <p class="character-trait">逻辑分析 • 理论创新</p>
        </div>
        
        <div class="character-card" data-type="ENTJ">
          <div class="character-avatar">
            <img src="/images/characters/entj-commander.svg" alt="ENTJ指挥官">
          </div>
          <h4>指挥官</h4>
          <p class="character-type">ENTJ</p>
          <p class="character-trait">天生领导 • 目标导向</p>
        </div>
        
        <div class="character-card" data-type="ENTP">
          <div class="character-avatar">
            <img src="/images/characters/entp-debater.svg" alt="ENTP辩论家">
          </div>
          <h4>辩论家</h4>
          <p class="character-type">ENTP</p>
          <p class="character-trait">创新思维 • 善于辩论</p>
        </div>
      </div>
    </div>
    
    <!-- 外交官组 (NF) -->
    <div class="character-group diplomat">
      <h3 class="group-title">
        <span class="group-icon">💝</span>
        外交官 (NF)  
      </h3>
      <div class="characters-row">
        <div class="character-card" data-type="INFJ">
          <div class="character-avatar">
            <img src="/images/characters/infj-advocate.svg" alt="INFJ提倡者">
          </div>
          <h4>提倡者</h4>
          <p class="character-type">INFJ</p>
          <p class="character-trait">理想主义 • 深度洞察</p>
        </div>
        
        <div class="character-card" data-type="INFP">
          <div class="character-avatar">
            <img src="/images/characters/infp-mediator.svg" alt="INFP调停者">
          </div>
          <h4>调停者</h4>
          <p class="character-type">INFP</p>
          <p class="character-trait">价值驱动 • 创意表达</p>
        </div>
        
        <div class="character-card" data-type="ENFJ">
          <div class="character-avatar">
            <img src="/images/characters/enfj-protagonist.svg" alt="ENFJ主人公">
          </div>
          <h4>主人公</h4>
          <p class="character-type">ENFJ</p>
          <p class="character-trait">鼓舞他人 • 天生导师</p>
        </div>
        
        <div class="character-card" data-type="ENFP">
          <div class="character-avatar">
            <img src="/images/characters/enfp-campaigner.svg" alt="ENFP竞选者">
          </div>
          <h4>竞选者</h4>
          <p class="character-type">ENFP</p>
          <p class="character-trait">热情洋溢 • 社交能手</p>
        </div>
      </div>
    </div>
    
    <!-- 守护者组 (SJ) -->
    <div class="character-group sentinel">
      <h3 class="group-title">
        <span class="group-icon">🛡️</span>
        守护者 (SJ)
      </h3>
      <div class="characters-row">
        <div class="character-card" data-type="ISTJ">
          <div class="character-avatar">
            <img src="/images/characters/istj-logistician.svg" alt="ISTJ物流师">
          </div>
          <h4>物流师</h4>
          <p class="character-type">ISTJ</p>
          <p class="character-trait">可靠稳重 • 条理清晰</p>
        </div>
        
        <div class="character-card" data-type="ISFJ">
          <div class="character-avatar">
            <img src="/images/characters/isfj-protector.svg" alt="ISFJ守护者">
          </div>
          <h4>守护者</h4>
          <p class="character-type">ISFJ</p>
          <p class="character-trait">温暖体贴 • 默默奉献</p>
        </div>
        
        <div class="character-card" data-type="ESTJ">
          <div class="character-avatar">
            <img src="/images/characters/estj-executive.svg" alt="ESTJ总经理">
          </div>
          <h4>总经理</h4>
          <p class="character-type">ESTJ</p>
          <p class="character-trait">组织管理 • 执行力强</p>
        </div>
        
        <div class="character-card" data-type="ESFJ">
          <div class="character-avatar">
            <img src="/images/characters/esfj-consul.svg" alt="ESFJ执政官">
          </div>
          <h4>执政官</h4>
          <p class="character-type">ESFJ</p>
          <p class="character-trait">和谐友善 • 服务他人</p>
        </div>
      </div>
    </div>
    
    <!-- 探险家组 (SP) -->
    <div class="character-group explorer">
      <h3 class="group-title">
        <span class="group-icon">🎭</span>
        探险家 (SP)
      </h3>
      <div class="characters-row">
        <div class="character-card" data-type="ISTP">
          <div class="character-avatar">
            <img src="/images/characters/istp-virtuoso.svg" alt="ISTP鉴赏家">
          </div>
          <h4>鉴赏家</h4>
          <p class="character-type">ISTP</p>
          <p class="character-trait">动手实践 • 冷静分析</p>
        </div>
        
        <div class="character-card" data-type="ISFP">
          <div class="character-avatar">
            <img src="/images/characters/isfp-adventurer.svg" alt="ISFP探险家">
          </div>
          <h4>探险家</h4>
          <p class="character-type">ISFP</p>
          <p class="character-trait">艺术气息 • 自由灵魂</p>
        </div>
        
        <div class="character-card" data-type="ESTP">
          <div class="character-avatar">
            <img src="/images/characters/estp-entrepreneur.svg" alt="ESTP企业家">
          </div>
          <h4>企业家</h4>
          <p class="character-type">ESTP</p>
          <p class="character-trait">行动派 • 适应力强</p>
        </div>
        
        <div class="character-card" data-type="ESFP">
          <div class="character-avatar">
            <img src="/images/characters/esfp-entertainer.svg" alt="ESFP表演者">
          </div>
          <h4>表演者</h4>
          <p class="character-type">ESFP</p>
          <p class="character-trait">活泼外向 • 享受当下</p>
        </div>
      </div>
    </div>
  </div>
  
  <!-- 互动提示 -->
  <div class="character-cta">
    <p class="cta-text">想知道你是哪种人格类型吗？</p>
    <button class="start-test-btn">
      <span>开始专业测评</span>
      <svg class="arrow-icon" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
      </svg>
    </button>
  </div>
</section>
```

## 3. 视觉系统

### 2.1 色彩系统

#### 主色调
```
品牌主色：#6366F1 (Indigo-500)
- 传达专业、信任、智慧
- 代表深度思考和内省
- 与心理学的科学性相符

辅助色：#8B5CF6 (Violet-500)
- 用于强调和点缀
- 代表创造力和想象力
- 增加视觉层次感
```

#### 语义色彩
```
成功：#10B981 (Emerald-500) - 测试完成、付费成功
警告：#F59E0B (Amber-500) - 限时优惠、注意事项
错误：#EF4444 (Red-500) - 错误提示、风险警告
信息：#3B82F6 (Blue-500) - 信息提示、说明文字
```

#### 中性色阶
```
文字色：
- 主要文字：#111827 (Gray-900)
- 次要文字：#4B5563 (Gray-600)
- 辅助文字：#9CA3AF (Gray-400)
- 占位文字：#D1D5DB (Gray-300)

背景色：
- 主背景：#FFFFFF (White)
- 次背景：#F9FAFB (Gray-50)
- 卡片背景：#FFFFFF (White)
- 分割线：#E5E7EB (Gray-200)
```

### 2.2 字体系统

#### 字体族
```
中文：PingFang SC, -apple-system, BlinkMacSystemFont, "Segoe UI"
英文：SF Pro Display, Helvetica Neue, Arial, sans-serif
数字：SF Mono, Monaco, Consolas, monospace (用于倒计时等)
```

#### 字体大小层级
```
超大标题：32px (2rem) - 重量级：700 - 行高：1.2
大标题：28px (1.75rem) - 重量级：600 - 行高：1.3
标题：24px (1.5rem) - 重量级：600 - 行高：1.3
副标题：20px (1.25rem) - 重量级：500 - 行高：1.4
正文大：18px (1.125rem) - 重量级：400 - 行高：1.5
正文：16px (1rem) - 重量级：400 - 行高：1.5
正文小：14px (0.875rem) - 重量级：400 - 行高：1.4
说明文字：12px (0.75rem) - 重量级：400 - 行高：1.3
```

### 2.3 间距系统

#### 基础间距单位：4px
```
xs: 4px   - 微小间距（图标与文字）
sm: 8px   - 小间距（标签内边距）
md: 16px  - 中等间距（组件间距）
lg: 24px  - 大间距（区块间距）
xl: 32px  - 超大间距（页面区块）
2xl: 48px - 巨大间距（页面主要区域）
3xl: 64px - 超巨大间距（页面分隔）
```

#### 内容间距规范
```
页面边距：16px (移动端) / 24px (平板端)
卡片内边距：16px - 20px
按钮内边距：12px - 20px (垂直 - 水平)
输入框内边距：12px - 16px
列表项间距：12px
段落间距：16px
```

### 2.4 圆角系统
```
微圆角：2px - 用于小元素边框
小圆角：4px - 用于按钮、标签
中圆角：8px - 用于卡片、输入框
大圆角：12px - 用于模态框、大卡片
超大圆角：16px - 用于主要容器
圆形：50% - 用于头像、图标背景
```

### 2.5 阴影系统
```
浅阴影：0 1px 3px rgba(0, 0, 0, 0.1)
- 用于：悬停状态、轻微层次

中阴影：0 4px 6px rgba(0, 0, 0, 0.1)
- 用于：卡片、按钮

深阴影：0 10px 15px rgba(0, 0, 0, 0.1)
- 用于：模态框、下拉菜单

超深阴影：0 25px 50px rgba(0, 0, 0, 0.15)
- 用于：重要弹窗、重点强调
```

## 3. 组件设计规范

### 3.1 按钮组件

#### 主要按钮 (Primary Button)
```
用途：主要操作，如"开始测试"、"立即支付"
样式：
- 背景：渐变色 #6366F1 → #8B5CF6
- 文字：白色，重量级 600
- 圆角：12px
- 内边距：14px 28px
- 阴影：0 4px 6px rgba(99, 102, 241, 0.3)

状态：
- 默认：渐变背景
- 悬停：向上移动 2px，增强阴影
- 按下：向下移动 1px，减弱阴影
- 禁用：50% 透明度，无交互
- 加载：显示转圈动画
```

#### 次要按钮 (Secondary Button)
```
用途：次要操作，如"上一题"、"分享"
样式：
- 背景：透明
- 边框：2px solid #6366F1
- 文字：#6366F1，重量级 500
- 其他样式同主要按钮

状态：
- 默认：透明背景
- 悬停：浅色背景 rgba(99, 102, 241, 0.1)
- 其他状态同主要按钮
```

### 3.2 卡片组件

#### 基础卡片
```
样式：
- 背景：白色
- 圆角：12px
- 边框：1px solid #E5E7EB
- 阴影：0 1px 3px rgba(0, 0, 0, 0.1)
- 内边距：20px

交互：
- 悬停：阴影增强，向上移动 2px
- 点击：轻微缩放动画
```

#### 结果卡片
```
增强样式：
- 更深的阴影：0 10px 15px rgba(0, 0, 0, 0.1)
- 渐变边框：渐变色描边
- 微动画：渐现动画
```

### 3.3 进度条组件

#### 测试进度条
```
样式：
- 容器：高度 8px，圆角 4px，背景 #E5E7EB
- 进度：渐变背景 #6366F1 → #8B5CF6
- 动画：平滑过渡 0.5s ease
- 文字：显示"X / Y"格式

位置：页面顶部固定
```

### 3.4 选项组件

#### 测试选项
```
默认状态：
- 背景：白色
- 边框：2px solid #E5E7EB
- 圆角：12px
- 内边距：16px
- 文字：#374151

悬停状态：
- 边框：#8B5CF6
- 背景：rgba(139, 92, 246, 0.05)

选中状态：
- 边框：#6366F1
- 背景：渐变 rgba(99, 102, 241, 0.1) → rgba(139, 92, 246, 0.05)
- 右侧显示选中图标

交互：
- 点击反馈：轻微缩放动画
- 选中动画：边框颜色渐变过渡
```

### 3.5 模态框组件

#### 支付模态框
```
背景遮罩：
- 颜色：rgba(0, 0, 0, 0.5)
- 背景模糊：backdrop-filter: blur(4px)

模态框本体：
- 背景：白色
- 圆角：16px
- 阴影：0 25px 50px rgba(0, 0, 0, 0.15)
- 最大宽度：400px (移动端占满屏幕宽度-32px)

动画：
- 入场：从底部滑入 + 透明度渐变
- 出场：向底部滑出 + 透明度渐变
- 时长：300ms ease-out
```

## 4. 页面布局设计

### 4.1 首页布局

#### 整体结构
```
Header Area (视口高度 100vh)
├── 导航栏 (可选，简洁版)
├── 主视觉区域 (60%)
│   ├── 权威标签
│   ├── 主标题
│   ├── 副标题
│   ├── 插画/视频
│   └── CTA按钮
└── 信任要素 (40%)
    ├── 用户数据统计
    ├── 权威认证
    └── 用户评价

Content Areas
├── 价值主张区域
├── 测试流程预览
├── 用户见证
└── FAQ (可选)
```

#### 视觉层次
```
1. 主标题 - 最大字号，最高对比度
2. CTA按钮 - 醒目的渐变色，阴影突出
3. 副标题 - 中等字号，适中对比度
4. 统计数据 - 数字放大，标签缩小
5. 其他内容 - 常规字号，较低对比度
```

### 4.2 测试页布局

#### 结构设计
```
Fixed Header (60px)
├── 进度条
└── 退出按钮 (可选)

Main Content Area
├── 题目区域 (40%)
│   ├── 题目编号
│   ├── 题目文本
│   └── 题目说明 (可选)
├── 选项区域 (50%)
│   └── 选项列表
└── 导航区域 (10%)
    ├── 上一题按钮
    └── 下一题按钮

Floating Elements
├── 激励提示 (定时显示)
└── 进度保存提示
```

#### 交互优化
```
手势支持：
- 左右滑动切换题目
- 双击选择选项
- 长按显示题目说明

键盘支持：
- 数字键选择选项
- 空格键确认选择
- 左右方向键导航
```

### 4.3 结果页布局

#### 信息架构
```
Hero Section
├── MBTI类型大字展示
├── 类型标题和描述
└── 核心特质标签

Free Content Section
├── 基础性格描述
├── 核心优势列表
└── 简要建议

Premium Preview Section
├── 6大板块卡片网格
├── 磨玻璃遮罩效果
└── 解锁提示

Payment CTA Section
├── 价值主张
├── 价格信息
├── 限时优惠
└── 支付按钮

Social Section
├── 分享标题
└── 分享按钮组
```

## 5. 交互设计规范

### 5.1 微交互设计

#### 按钮交互
```
点击反馈：
- 按下：transform: scale(0.98)
- 释放：回弹动画 transform: scale(1.02) → scale(1)
- 持续时间：150ms

加载状态：
- 文字透明度：0
- 显示旋转图标
- 图标动画：360度旋转，1s linear infinite
```

#### 页面转场
```
路由切换动画：
- 入场：从右侧滑入 + 透明度 0→1
- 出场：向左侧滑出 + 透明度 1→0
- 时长：300ms ease-out
- 同时进行：防止空白闪烁
```

#### 内容加载
```
骨架屏：
- 颜色：#F3F4F6 → #E5E7EB 渐变动画
- 形状：模拟实际内容布局
- 动画：shimmer 效果，从左到右扫过
- 时长：1.5s ease-in-out infinite
```

### 5.2 反馈机制

#### 触觉反馈
```
轻触反馈：
- 按钮点击：振动 10ms
- 选项选择：振动 5ms
- 错误操作：振动 20ms (双击模式)

实现方式：
navigator.vibrate([10]) // iOS/Android 兼容
```

#### 视觉反馈
```
状态指示：
- 成功：绿色对勾图标 + 文字提示
- 错误：红色感叹号图标 + 错误信息
- 加载：旋转图标 + "处理中..."
- 警告：橙色感叹号 + 警告文字

动画时序：
1. 图标先出现 (100ms)
2. 文字淡入 (200ms)
3. 整体停留 (2000ms)
4. 整体淡出 (300ms)
```

### 5.3 手势设计

#### 测试页手势
```
水平滑动：
- 左滑：下一题 (swipe velocity > 0.5)
- 右滑：上一题 (swipe velocity > 0.5)
- 视觉反馈：页面跟随手指移动

垂直滚动：
- 长题目内容滚动
- 防止与水平滑动冲突
- 滚动阻尼效果

双击选择：
- 快速选择选项
- 视觉反馈：选项快速闪烁
- 自动进入下一题
```

## 6. 响应式设计

### 6.1 断点系统
```
xs: 0px - 575px     (手机竖屏)
sm: 576px - 767px   (手机横屏)
md: 768px - 991px   (平板竖屏)
lg: 992px - 1199px  (平板横屏/小桌面)
xl: 1200px+         (桌面)
```

### 6.2 移动端优化

#### 字体缩放
```
最小字体：12px (避免iOS自动缩放)
触摸目标：最小 44px × 44px
行高调整：移动端增加 0.1-0.2
字间距：中文适当增加
```

#### 布局调整
```
xs设备：
- 单列布局
- 全宽卡片
- 底部固定导航

sm设备：
- 保持单列
- 适当增加间距
- 侧边栏收起

md+设备：
- 多列布局
- 侧边栏展开
- 悬浮操作
```

### 6.3 性能优化

#### 图片响应式
```html
<img 
  src="image-480w.jpg"
  srcset="
    image-320w.jpg 320w,
    image-480w.jpg 480w,
    image-800w.jpg 800w"
  sizes="
    (max-width: 480px) 100vw,
    (max-width: 800px) 50vw,
    25vw"
  alt="MBTI测试插画"
/>
```

#### 关键资源优化
```html
<!-- 关键CSS内联 -->
<style>
  /* 首屏关键样式内联 */
  .hero { /* ... */ }
  .cta-button { /* ... */ }
</style>

<!-- 非关键CSS异步加载 -->
<link rel="preload" href="styles.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
```

## 7. 可访问性设计

### 7.1 颜色对比度
```
文字对比度标准：
- 大文字 (18px+)：对比度 ≥ 3:1
- 小文字 (18px-)：对比度 ≥ 4.5:1
- 交互元素：对比度 ≥ 3:1

色盲友好：
- 避免仅用颜色传达信息
- 提供形状、图标等辅助标识
- 支持高对比度模式
```

### 7.2 键盘导航
```
Tab 顺序：
1. 跳过导航链接
2. 主要内容区域
3. 交互元素 (按钮、链接、表单)
4. 次要区域

焦点指示：
- 可见的焦点框
- 颜色：#6366F1
- 宽度：2px
- 样式：outline + box-shadow
```

### 7.3 屏幕阅读器支持
```html
<!-- 语义化HTML -->
<main role="main">
  <section aria-labelledby="test-section">
    <h2 id="test-section">MBTI性格测试</h2>
    <!-- 内容 -->
  </section>
</main>

<!-- ARIA标签 -->
<button 
  aria-label="开始MBTI性格测试"
  aria-describedby="test-description"
>
  开始测试
</button>

<!-- 动态内容更新 -->
<div aria-live="polite" id="status">
  <!-- 状态更新 -->
</div>
```

## 8. 动画效果库

### 8.1 入场动画
```css
/* 淡入向上 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 缩放淡入 */
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* 从左滑入 */
@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
```

### 8.2 交互动画
```css
/* 按钮悬停 */
.button-hover {
  transition: all 0.3s ease;
}

.button-hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(99, 102, 241, 0.3);
}

/* 卡片悬停 */
.card-hover {
  transition: all 0.3s ease;
}

.card-hover:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

/* 脉冲动画 */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
}
```

### 8.3 状态动画
```css
/* 加载旋转 */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.loading-spinner {
  animation: spin 1s linear infinite;
}

/* 进度条动画 */
.progress-bar {
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 摇摆提示 */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.shake-animation {
  animation: shake 0.5s ease-in-out;
}
```

## 9. 设计资源与规范

### 9.1 图标系统
```
风格：线性图标，2px 描边
大小：16px, 20px, 24px, 32px
颜色：继承文字颜色或主题色
来源：Heroicons, Lucide, 自定义绘制

常用图标：
- 箭头：导航、下拉
- 检查：完成、正确
- 感叹号：警告、提示
- 问号：帮助、疑问
- 心形：喜欢、收藏
- 分享：社交分享
- 锁：权限、安全
```

### 9.2 插画风格
```
风格：扁平化插画，渐变色彩
色彩：符合品牌色系
构图：简洁明了，突出主题
尺寸：矢量格式，支持缩放
用途：首页主视觉、空状态、引导页

主题：
- 自我探索：镜子、望远镜
- 成长发展：梯子、山峰
- 人际关系：握手、对话
- 职业发展：建筑、齿轮
```

### 9.3 照片处理规范
```
色调：暖色调，饱和度适中
构图：简洁背景，主体突出
尺寸：多尺寸适配
格式：WebP优先，JPEG备用
压缩：质量80-90%，文件大小控制

人物照片：
- 表情：自然、积极
- 服装：职业、休闲
- 背景：模糊、简洁
- 光线：柔和、自然
```

这份UI/UX设计规范为MBTI测试项目提供了完整的视觉和交互指导，确保产品在各个平台和设备上都能提供一致、优质的用户体验。