// MBTI测试系统 - 自动化测试脚本
// 在浏览器控制台中运行此脚本来验证关键功能

class MBTITestAutomation {
  constructor() {
    this.testResults = [];
    this.currentTest = 0;
    this.totalTests = 0;
  }

  // 记录测试结果
  logResult(testId, description, expected, actual, status) {
    const result = {
      testId,
      description,
      expected,
      actual,
      status,
      timestamp: new Date().toISOString()
    };
    this.testResults.push(result);
    console.log(`${status === 'PASS' ? '✅' : '❌'} ${testId}: ${description}`);
    if (status === 'FAIL') {
      console.log(`   Expected: ${expected}`);
      console.log(`   Actual: ${actual}`);
    }
  }

  // 等待函数
  async wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 检查元素是否存在
  checkElement(selector, description) {
    const element = document.querySelector(selector);
    const exists = element !== null;
    this.logResult(
      `TC${String(++this.currentTest).padStart(3, '0')}`,
      description,
      '元素存在',
      exists ? '元素存在' : '元素不存在',
      exists ? 'PASS' : 'FAIL'
    );
    return element;
  }

  // 检查本地存储
  checkLocalStorage(key, description) {
    const value = localStorage.getItem(key);
    const exists = value !== null;
    this.logResult(
      `TC${String(++this.currentTest).padStart(3, '0')}`,
      description,
      '数据存在',
      exists ? '数据存在' : '数据不存在',
      exists ? 'PASS' : 'FAIL'
    );
    return value;
  }

  // 检查Pinia状态
  checkPiniaState(storeName, property, description) {
    try {
      const app = document.querySelector('#app').__vue_app__;
      const store = app.config.globalProperties.$pinia._s.get(storeName);
      const value = store ? store[property] : undefined;
      const exists = value !== undefined;
      this.logResult(
        `TC${String(++this.currentTest).padStart(3, '0')}`,
        description,
        '状态存在',
        exists ? '状态存在' : '状态不存在',
        exists ? 'PASS' : 'FAIL'
      );
      return value;
    } catch (error) {
      this.logResult(
        `TC${String(++this.currentTest).padStart(3, '0')}`,
        description,
        '状态存在',
        `错误: ${error.message}`,
        'FAIL'
      );
      return null;
    }
  }

  // 模拟点击事件
  async simulateClick(selector, description) {
    const element = document.querySelector(selector);
    if (element) {
      element.click();
      await this.wait(500); // 等待响应
      this.logResult(
        `TC${String(++this.currentTest).padStart(3, '0')}`,
        description,
        '点击成功',
        '点击成功',
        'PASS'
      );
      return true;
    } else {
      this.logResult(
        `TC${String(++this.currentTest).padStart(3, '0')}`,
        description,
        '点击成功',
        '元素不存在',
        'FAIL'
      );
      return false;
    }
  }

  // 检查网络请求
  checkNetworkRequests() {
    const performanceEntries = performance.getEntriesByType('navigation');
    const resourceEntries = performance.getEntriesByType('resource');
    
    this.logResult(
      `TC${String(++this.currentTest).padStart(3, '0')}`,
      '页面加载性能检查',
      '加载时间 < 2000ms',
      `加载时间: ${Math.round(performanceEntries[0]?.loadEventEnd - performanceEntries[0]?.navigationStart)}ms`,
      performanceEntries[0]?.loadEventEnd - performanceEntries[0]?.navigationStart < 2000 ? 'PASS' : 'FAIL'
    );

    const failedRequests = resourceEntries.filter(entry => 
      entry.transferSize === 0 && entry.decodedBodySize === 0
    );
    
    this.logResult(
      `TC${String(++this.currentTest).padStart(3, '0')}`,
      '网络请求检查',
      '无失败请求',
      `失败请求数: ${failedRequests.length}`,
      failedRequests.length === 0 ? 'PASS' : 'FAIL'
    );
  }

  // 检查控制台错误
  checkConsoleErrors() {
    const originalError = console.error;
    const errors = [];
    
    console.error = function(...args) {
      errors.push(args.join(' '));
      originalError.apply(console, args);
    };

    setTimeout(() => {
      this.logResult(
        `TC${String(++this.currentTest).padStart(3, '0')}`,
        '控制台错误检查',
        '无错误',
        `错误数: ${errors.length}`,
        errors.length === 0 ? 'PASS' : 'FAIL'
      );
      console.error = originalError;
    }, 1000);
  }

  // 测试数据服务功能
  async testDataService() {
    console.log('\n🔍 开始测试数据服务功能...');
    
    // 检查dataService是否可用
    try {
      const dataServiceExists = window.dataService !== undefined;
      this.logResult(
        `TC${String(++this.currentTest).padStart(3, '0')}`,
        'dataService可用性检查',
        'dataService存在',
        dataServiceExists ? 'dataService存在' : 'dataService不存在',
        dataServiceExists ? 'PASS' : 'FAIL'
      );
    } catch (error) {
      this.logResult(
        `TC${String(++this.currentTest).padStart(3, '0')}`,
        'dataService可用性检查',
        'dataService存在',
        `错误: ${error.message}`,
        'FAIL'
      );
    }

    // 检查本地存储数据
    this.checkLocalStorage('mbti-user-data', '用户数据本地存储检查');
    this.checkLocalStorage('mbti-test-sessions', '测试会话本地存储检查');
    this.checkLocalStorage('mbti-answers', '答题记录本地存储检查');
    this.checkLocalStorage('mbti-payment-orders', '支付订单本地存储检查');
  }

  // 测试页面功能
  async testPageFunctionality() {
    console.log('\n🔍 开始测试页面功能...');
    
    // 检查当前页面的关键元素
    const currentPath = window.location.pathname;
    
    if (currentPath === '/' || currentPath === '/home') {
      this.checkElement('.hero-section', '首页英雄区域检查');
      this.checkElement('.start-test-btn', '开始测试按钮检查');
      this.checkElement('.find-report-btn', '找回报告按钮检查');
    } else if (currentPath === '/test') {
      this.checkElement('.question-container', '题目容器检查');
      this.checkElement('.answer-options', '答案选项检查');
      this.checkElement('.progress-bar', '进度条检查');
    } else if (currentPath === '/result') {
      this.checkElement('.result-summary', '结果摘要检查');
      this.checkElement('.unlock-btn', '解锁按钮检查');
      this.checkElement('.payment-modal', '支付弹窗检查');
    } else if (currentPath === '/report') {
      this.checkElement('.report-content', '报告内容检查');
      this.checkElement('.share-btn', '分享按钮检查');
    }
  }

  // 测试状态管理
  async testStateManagement() {
    console.log('\n🔍 开始测试状态管理...');
    
    // 检查Pinia stores
    this.checkPiniaState('assessment', 'currentQuestion', '当前题目状态检查');
    this.checkPiniaState('assessment', 'answers', '答案状态检查');
    this.checkPiniaState('assessment', 'result', '结果状态检查');
    this.checkPiniaState('enhancedAssessment', 'testSession', '测试会话状态检查');
  }

  // 执行完整测试套件
  async runFullTestSuite() {
    console.log('🚀 开始执行MBTI测试系统完整测试套件...');
    console.log('=' .repeat(60));
    
    this.currentTest = 0;
    this.testResults = [];
    
    // 基础功能测试
    console.log('\n📋 基础功能测试');
    this.checkNetworkRequests();
    this.checkConsoleErrors();
    
    // 页面功能测试
    await this.testPageFunctionality();
    
    // 数据服务测试
    await this.testDataService();
    
    // 状态管理测试
    await this.testStateManagement();
    
    // 生成测试报告
    this.generateTestReport();
  }

  // 生成测试报告
  generateTestReport() {
    console.log('\n' + '=' .repeat(60));
    console.log('📊 测试报告总结');
    console.log('=' .repeat(60));
    
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.status === 'PASS').length;
    const failedTests = this.testResults.filter(r => r.status === 'FAIL').length;
    const passRate = ((passedTests / totalTests) * 100).toFixed(2);
    
    console.log(`总测试用例数: ${totalTests}`);
    console.log(`通过测试数: ${passedTests}`);
    console.log(`失败测试数: ${failedTests}`);
    console.log(`通过率: ${passRate}%`);
    
    if (failedTests > 0) {
      console.log('\n❌ 失败的测试用例:');
      this.testResults
        .filter(r => r.status === 'FAIL')
        .forEach(r => {
          console.log(`  ${r.testId}: ${r.description}`);
          console.log(`    预期: ${r.expected}`);
          console.log(`    实际: ${r.actual}`);
        });
    }
    
    console.log('\n' + '=' .repeat(60));
    console.log(passRate >= 80 ? '✅ 测试整体通过' : '❌ 测试存在问题，需要修复');
    console.log('=' .repeat(60));
    
    // 返回测试结果供进一步处理
    return {
      totalTests,
      passedTests,
      failedTests,
      passRate: parseFloat(passRate),
      results: this.testResults
    };
  }

  // 模拟用户完整流程测试
  async simulateUserJourney() {
    console.log('\n🎭 开始模拟用户完整流程测试...');
    
    // 如果不在首页，先导航到首页
    if (window.location.pathname !== '/') {
      window.location.href = '/';
      await this.wait(1000);
    }
    
    // 模拟开始测试
    const startBtn = await this.simulateClick('.start-test-btn', '点击开始测试按钮');
    if (startBtn) {
      await this.wait(2000);
      
      // 如果成功跳转到测试页面，模拟答题
      if (window.location.pathname === '/test') {
        console.log('✅ 成功跳转到测试页面');
        
        // 模拟答题（选择第一个选项）
        for (let i = 0; i < 3; i++) {
          await this.simulateClick('.answer-option:first-child', `模拟第${i+1}题答题`);
          await this.wait(1000);
        }
      }
    }
  }
}

// 创建测试实例并提供全局访问
window.mbtiTester = new MBTITestAutomation();

// 提供快速测试命令
window.runQuickTest = () => window.mbtiTester.runFullTestSuite();
window.runUserJourney = () => window.mbtiTester.simulateUserJourney();

console.log('🔧 MBTI自动化测试工具已加载');
console.log('使用 runQuickTest() 执行快速测试');
console.log('使用 runUserJourney() 模拟用户完整流程');
console.log('使用 window.mbtiTester 访问完整测试功能');

// 自动执行基础测试
if (typeof window !== 'undefined') {
  setTimeout(() => {
    console.log('\n🔄 自动执行基础功能测试...');
    window.mbtiTester.runFullTestSuite();
  }, 2000);
}