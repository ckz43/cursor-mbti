/**
 * MBTI测试系统 - 手动测试脚本
 * 在浏览器控制台中运行，验证用户流程和数据完整性
 */

class MBTIManualTester {
  constructor() {
    this.testResults = [];
    this.startTime = Date.now();
    this.currentTest = null;
  }

  // 记录测试结果
  logResult(testName, status, details = '') {
    const result = {
      testName,
      status,
      details,
      timestamp: new Date().toISOString()
    };
    this.testResults.push(result);
    
    const emoji = status === 'PASS' ? '✅' : '❌';
    console.log(`${emoji} [${testName}] ${details}`);
  }

  // 等待元素出现
  async waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const checkElement = () => {
        const element = document.querySelector(selector);
        if (element) {
          resolve(element);
        } else if (Date.now() - startTime > timeout) {
          reject(new Error(`元素 ${selector} 在 ${timeout}ms 内未找到`));
        } else {
          setTimeout(checkElement, 100);
        }
      };
      checkElement();
    });
  }

  // 等待指定时间
  async wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 检查本地存储
  checkLocalStorage() {
    console.log('\n🔍 检查本地存储数据...');
    
    const storageKeys = [
      'mbti_users',
      'mbti_sessions', 
      'mbti_answers',
      'mbti_payments',
      'mbti_behaviors',
      'mbti_shares'
    ];

    storageKeys.forEach(key => {
      const data = localStorage.getItem(key);
      if (data) {
        try {
          const parsed = JSON.parse(data);
          this.logResult('LocalStorage', 'PASS', `${key}: ${Array.isArray(parsed) ? parsed.length : 1} 条记录`);
        } catch (e) {
          this.logResult('LocalStorage', 'FAIL', `${key}: 数据格式错误`);
        }
      } else {
        this.logResult('LocalStorage', 'INFO', `${key}: 无数据`);
      }
    });
  }

  // 检查Pinia状态
  checkPiniaState() {
    console.log('\n🔍 检查Pinia状态管理...');
    
    try {
      // 检查assessment store
      if (window.__VUE_DEVTOOLS_GLOBAL_HOOK__ && window.__VUE_DEVTOOLS_GLOBAL_HOOK__.apps) {
        this.logResult('Pinia', 'PASS', 'Vue DevTools 可用');
      }
      
      // 检查全局状态（如果可访问）
      if (window.pinia || window.$pinia) {
        this.logResult('Pinia', 'PASS', 'Pinia 实例可访问');
      } else {
        this.logResult('Pinia', 'INFO', 'Pinia 实例不可直接访问（正常）');
      }
    } catch (error) {
      this.logResult('Pinia', 'FAIL', `状态检查失败: ${error.message}`);
    }
  }

  // 检查网络请求
  checkNetworkRequests() {
    console.log('\n🔍 监控网络请求...');
    
    // 监听fetch请求
    const originalFetch = window.fetch;
    let requestCount = 0;
    
    window.fetch = async (...args) => {
      requestCount++;
      this.logResult('Network', 'INFO', `发起请求 #${requestCount}: ${args[0]}`);
      
      try {
        const response = await originalFetch(...args);
        this.logResult('Network', response.ok ? 'PASS' : 'FAIL', 
          `请求 #${requestCount} 响应: ${response.status}`);
        return response;
      } catch (error) {
        this.logResult('Network', 'FAIL', `请求 #${requestCount} 失败: ${error.message}`);
        throw error;
      }
    };
    
    // 5秒后恢复原始fetch
    setTimeout(() => {
      window.fetch = originalFetch;
      this.logResult('Network', 'INFO', '网络监控已停止');
    }, 5000);
  }

  // 检查控制台错误
  checkConsoleErrors() {
    console.log('\n🔍 监控控制台错误...');
    
    const originalError = console.error;
    const originalWarn = console.warn;
    
    console.error = (...args) => {
      this.logResult('Console', 'FAIL', `错误: ${args.join(' ')}`);
      originalError.apply(console, args);
    };
    
    console.warn = (...args) => {
      this.logResult('Console', 'WARN', `警告: ${args.join(' ')}`);
      originalWarn.apply(console, args);
    };
    
    // 5秒后恢复
    setTimeout(() => {
      console.error = originalError;
      console.warn = originalWarn;
      this.logResult('Console', 'INFO', '控制台监控已停止');
    }, 5000);
  }

  // 模拟用户答题流程
  async simulateAnswering() {
    console.log('\n🎯 开始模拟答题流程...');
    
    try {
      // 检查是否在测试页面
      if (!window.location.pathname.includes('/test')) {
        this.logResult('UserFlow', 'INFO', '不在测试页面，跳过答题模拟');
        return;
      }

      // 查找答题选项
      const answerButtons = document.querySelectorAll('[data-testid="answer-option"], .answer-option, button[class*="answer"]');
      
      if (answerButtons.length === 0) {
        // 尝试其他选择器
        const alternativeButtons = document.querySelectorAll('button:not([class*="nav"]):not([class*="back"])');
        if (alternativeButtons.length > 0) {
          this.logResult('UserFlow', 'PASS', `找到 ${alternativeButtons.length} 个可能的答题按钮`);
        } else {
          this.logResult('UserFlow', 'FAIL', '未找到答题选项按钮');
          return;
        }
      } else {
        this.logResult('UserFlow', 'PASS', `找到 ${answerButtons.length} 个答题选项`);
      }

      // 模拟点击第一个选项
      const firstOption = answerButtons[0] || alternativeButtons[0];
      if (firstOption) {
        firstOption.click();
        this.logResult('UserFlow', 'PASS', '模拟点击答题选项');
        
        // 等待页面响应
        await this.wait(500);
        
        // 检查是否有进度变化
        const progressElements = document.querySelectorAll('[class*="progress"], .progress-bar, [role="progressbar"]');
        if (progressElements.length > 0) {
          this.logResult('UserFlow', 'PASS', '检测到进度指示器');
        }
      }
    } catch (error) {
      this.logResult('UserFlow', 'FAIL', `答题模拟失败: ${error.message}`);
    }
  }

  // 检查页面性能
  checkPerformance() {
    console.log('\n⚡ 检查页面性能...');
    
    try {
      const navigation = performance.getEntriesByType('navigation')[0];
      if (navigation) {
        const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
        const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
        
        this.logResult('Performance', loadTime < 3000 ? 'PASS' : 'WARN', 
          `页面加载时间: ${loadTime.toFixed(2)}ms`);
        this.logResult('Performance', domContentLoaded < 1000 ? 'PASS' : 'WARN', 
          `DOM加载时间: ${domContentLoaded.toFixed(2)}ms`);
      }
      
      // 检查内存使用（如果可用）
      if (performance.memory) {
        const memoryMB = (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2);
        this.logResult('Performance', memoryMB < 50 ? 'PASS' : 'WARN', 
          `内存使用: ${memoryMB}MB`);
      }
    } catch (error) {
      this.logResult('Performance', 'FAIL', `性能检查失败: ${error.message}`);
    }
  }

  // 检查响应式设计
  checkResponsiveDesign() {
    console.log('\n📱 检查响应式设计...');
    
    const viewports = [
      { name: '移动端', width: 375, height: 667 },
      { name: '平板', width: 768, height: 1024 },
      { name: '桌面', width: 1920, height: 1080 }
    ];
    
    const currentWidth = window.innerWidth;
    const currentHeight = window.innerHeight;
    
    this.logResult('Responsive', 'INFO', `当前视口: ${currentWidth}x${currentHeight}`);
    
    // 检查是否有响应式类名
    const responsiveElements = document.querySelectorAll('[class*="sm:"], [class*="md:"], [class*="lg:"], [class*="xl:"]');
    if (responsiveElements.length > 0) {
      this.logResult('Responsive', 'PASS', `发现 ${responsiveElements.length} 个响应式元素`);
    } else {
      this.logResult('Responsive', 'WARN', '未发现明显的响应式类名');
    }
  }

  // 检查可访问性
  checkAccessibility() {
    console.log('\n♿ 检查可访问性...');
    
    try {
      // 检查alt属性
      const images = document.querySelectorAll('img');
      let imagesWithAlt = 0;
      images.forEach(img => {
        if (img.alt) imagesWithAlt++;
      });
      
      if (images.length > 0) {
        this.logResult('Accessibility', imagesWithAlt === images.length ? 'PASS' : 'WARN',
          `图片alt属性: ${imagesWithAlt}/${images.length}`);
      }
      
      // 检查语义化标签
      const semanticTags = ['main', 'nav', 'header', 'footer', 'section', 'article'];
      const foundTags = semanticTags.filter(tag => document.querySelector(tag));
      
      this.logResult('Accessibility', foundTags.length > 0 ? 'PASS' : 'WARN',
        `语义化标签: ${foundTags.join(', ') || '无'}`);
      
      // 检查按钮和链接
      const buttons = document.querySelectorAll('button, [role="button"]');
      const links = document.querySelectorAll('a');
      
      this.logResult('Accessibility', 'INFO', 
        `交互元素: ${buttons.length} 个按钮, ${links.length} 个链接`);
        
    } catch (error) {
      this.logResult('Accessibility', 'FAIL', `可访问性检查失败: ${error.message}`);
    }
  }

  // 生成测试报告
  generateReport() {
    console.log('\n📊 生成测试报告...');
    
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.status === 'PASS').length;
    const failedTests = this.testResults.filter(r => r.status === 'FAIL').length;
    const warnTests = this.testResults.filter(r => r.status === 'WARN').length;
    const infoTests = this.testResults.filter(r => r.status === 'INFO').length;
    
    const duration = Date.now() - this.startTime;
    
    console.log('\n' + '='.repeat(60));
    console.log('📈 MBTI测试系统 - 手动测试报告');
    console.log('='.repeat(60));
    console.log(`⏱️  测试时长: ${duration}ms`);
    console.log(`📊 总测试数: ${totalTests}`);
    console.log(`✅ 通过: ${passedTests}`);
    console.log(`❌ 失败: ${failedTests}`);
    console.log(`⚠️  警告: ${warnTests}`);
    console.log(`ℹ️  信息: ${infoTests}`);
    console.log(`📈 通过率: ${((passedTests / (totalTests - infoTests)) * 100).toFixed(2)}%`);
    
    if (failedTests > 0) {
      console.log('\n❌ 失败的测试:');
      this.testResults
        .filter(r => r.status === 'FAIL')
        .forEach(r => console.log(`  - ${r.testName}: ${r.details}`));
    }
    
    if (warnTests > 0) {
      console.log('\n⚠️  警告的测试:');
      this.testResults
        .filter(r => r.status === 'WARN')
        .forEach(r => console.log(`  - ${r.testName}: ${r.details}`));
    }
    
    console.log('\n' + '='.repeat(60));
    
    return {
      totalTests,
      passedTests,
      failedTests,
      warnTests,
      infoTests,
      duration,
      passRate: ((passedTests / (totalTests - infoTests)) * 100).toFixed(2),
      results: this.testResults
    };
  }

  // 执行所有测试
  async runAllTests() {
    console.log('🚀 开始MBTI测试系统手动测试...');
    console.log('当前页面:', window.location.href);
    
    // 基础检查
    this.checkLocalStorage();
    this.checkPiniaState();
    this.checkPerformance();
    this.checkResponsiveDesign();
    this.checkAccessibility();
    
    // 启动监控
    this.checkNetworkRequests();
    this.checkConsoleErrors();
    
    // 用户流程测试
    await this.simulateAnswering();
    
    // 等待监控完成
    await this.wait(2000);
    
    // 生成报告
    return this.generateReport();
  }
}

// 使用说明
console.log(`
🔧 MBTI测试系统手动测试脚本已加载

使用方法:
1. 创建测试实例: const tester = new MBTIManualTester();
2. 运行所有测试: await tester.runAllTests();
3. 或运行单个测试: tester.checkLocalStorage();

快速开始:
const tester = new MBTIManualTester();
tester.runAllTests().then(report => console.log('测试完成', report));
`);

// 导出测试类
window.MBTIManualTester = MBTIManualTester;