/**
 * MBTI测试系统 - 浏览器端测试执行器
 * 直接在浏览器控制台中运行，无需额外依赖
 */

class BrowserTestRunner {
  constructor() {
    this.testResults = [];
    this.startTime = Date.now();
    this.manualTester = null;
  }

  async loadManualTestScript() {
    console.log('📥 加载手动测试脚本...');
    
    try {
      // 检查是否已经加载
      if (window.MBTIManualTester) {
        console.log('✅ 手动测试脚本已存在');
        return true;
      }
      
      // 尝试从服务器加载
      const response = await fetch('/manual-test-script.js');
      if (response.ok) {
        const scriptContent = await response.text();
        eval(scriptContent);
        console.log('✅ 从服务器加载手动测试脚本成功');
        return true;
      } else {
        console.log('⚠️ 无法从服务器加载脚本，请手动复制脚本内容');
        return false;
      }
    } catch (error) {
      console.log('⚠️ 自动加载失败，请手动复制脚本内容:', error.message);
      return false;
    }
  }

  async runTestOnCurrentPage() {
    console.log(`\n🔍 在当前页面运行测试...`);
    console.log(`📍 URL: ${window.location.href}`);
    
    try {
      // 确保手动测试脚本可用
      if (!window.MBTIManualTester) {
        const loaded = await this.loadManualTestScript();
        if (!loaded) {
          throw new Error('手动测试脚本不可用，请先加载脚本');
        }
      }
      
      // 创建测试实例并运行
      this.manualTester = new window.MBTIManualTester();
      const report = await this.manualTester.runAllTests();
      
      const result = {
        success: true,
        report,
        url: window.location.href,
        pageName: this.getPageName(),
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      };
      
      this.testResults.push(result);
      
      console.log(`✅ 当前页面测试完成`);
      console.log(`📊 通过率: ${report.passRate}%`);
      console.log(`📈 测试结果: ${report.passedTests}/${report.totalTests}`);
      
      return result;
      
    } catch (error) {
      console.error(`❌ 当前页面测试失败:`, error.message);
      const result = {
        success: false,
        error: error.message,
        url: window.location.href,
        pageName: this.getPageName(),
        timestamp: new Date().toISOString()
      };
      
      this.testResults.push(result);
      return result;
    }
  }

  getPageName() {
    const path = window.location.pathname;
    const pageMap = {
      '/': '首页',
      '/test': '测试页面',
      '/result': '结果页面',
      '/report': '报告页面',
      '/debug': '调试页面'
    };
    
    return pageMap[path] || `未知页面 (${path})`;
  }

  async runMultiPageTest() {
    console.log('🎯 开始多页面测试...');
    console.log('请按照提示手动导航到不同页面并运行测试');
    
    const pages = [
      { name: '首页', path: '/' },
      { name: '测试页面', path: '/test' },
      { name: '结果页面', path: '/result' },
      { name: '报告页面', path: '/report' }
    ];
    
    console.log('\n📋 测试页面列表:');
    pages.forEach((page, index) => {
      console.log(`${index + 1}. ${page.name}: ${window.location.origin}${page.path}`);
    });
    
    console.log('\n🔧 使用方法:');
    console.log('1. 手动导航到每个页面');
    console.log('2. 在每个页面运行: await runner.runTestOnCurrentPage()');
    console.log('3. 完成所有页面后运行: runner.generateFinalReport()');
    
    return pages;
  }

  async testResponsiveDesign() {
    console.log('\n📱 测试响应式设计...');
    
    const viewports = [
      { name: '移动端', width: 375, height: 667 },
      { name: '平板', width: 768, height: 1024 },
      { name: '桌面', width: 1920, height: 1080 }
    ];
    
    console.log('\n📐 建议测试的视口尺寸:');
    viewports.forEach((viewport, index) => {
      console.log(`${index + 1}. ${viewport.name}: ${viewport.width}x${viewport.height}`);
    });
    
    console.log('\n🔧 测试方法:');
    console.log('1. 打开浏览器开发者工具');
    console.log('2. 切换到设备模拟模式');
    console.log('3. 设置不同的视口尺寸');
    console.log('4. 在每个尺寸下运行: await runner.runTestOnCurrentPage()');
    
    // 在当前视口运行响应式测试
    if (this.manualTester) {
      this.manualTester.checkResponsiveDesign();
      this.manualTester.checkAccessibility();
      console.log('✅ 当前视口响应式测试完成');
    }
  }

  async simulateUserInteraction() {
    console.log('\n👤 模拟用户交互...');
    
    try {
      // 检查当前页面类型并执行相应操作
      const currentPath = window.location.pathname;
      
      if (currentPath === '/') {
        // 首页：查找开始测试按钮
        const startButtons = document.querySelectorAll(
          'button[class*="start"], .start-button, [data-testid="start-test"], a[href*="test"]'
        );
        
        if (startButtons.length > 0) {
          console.log(`✅ 找到 ${startButtons.length} 个开始测试按钮`);
          console.log('💡 可以点击按钮开始测试');
        } else {
          console.log('⚠️ 未找到开始测试按钮');
        }
      } else if (currentPath === '/test') {
        // 测试页面：模拟答题
        if (this.manualTester) {
          await this.manualTester.simulateAnswering();
        }
        
        // 额外的交互检查
        const answerButtons = document.querySelectorAll(
          'button[class*="answer"], .answer-option, [data-testid="answer-option"]'
        );
        
        const navigationButtons = document.querySelectorAll(
          'button[class*="next"], button[class*="prev"], .next-button, .prev-button'
        );
        
        console.log(`📝 答题选项: ${answerButtons.length} 个`);
        console.log(`🔄 导航按钮: ${navigationButtons.length} 个`);
        
      } else if (currentPath === '/result' || currentPath === '/report') {
        // 结果/报告页面：检查内容展示
        const resultElements = document.querySelectorAll(
          '[class*="result"], [class*="score"], [class*="type"], .mbti-type'
        );
        
        const shareButtons = document.querySelectorAll(
          'button[class*="share"], .share-button, [data-testid="share"]'
        );
        
        console.log(`📊 结果元素: ${resultElements.length} 个`);
        console.log(`📤 分享按钮: ${shareButtons.length} 个`);
      }
      
      console.log('✅ 用户交互模拟完成');
      
    } catch (error) {
      console.error('❌ 用户交互模拟失败:', error.message);
    }
  }

  checkPageSpecificFeatures() {
    console.log('\n🔍 检查页面特定功能...');
    
    const currentPath = window.location.pathname;
    const features = [];
    
    // 通用检查
    const navigation = document.querySelector('nav, [role="navigation"]');
    if (navigation) features.push('导航栏');
    
    const header = document.querySelector('header, [role="banner"]');
    if (header) features.push('页头');
    
    const footer = document.querySelector('footer, [role="contentinfo"]');
    if (footer) features.push('页脚');
    
    // 页面特定检查
    switch (currentPath) {
      case '/':
        const hero = document.querySelector('[class*="hero"], .hero-section');
        if (hero) features.push('主要展示区域');
        
        const features_section = document.querySelector('[class*="feature"], .features');
        if (features_section) features.push('功能介绍');
        break;
        
      case '/test':
        const questionArea = document.querySelector('[class*="question"], .question-area');
        if (questionArea) features.push('题目区域');
        
        const progressBar = document.querySelector('[class*="progress"], .progress-bar');
        if (progressBar) features.push('进度条');
        break;
        
      case '/result':
      case '/report':
        const resultDisplay = document.querySelector('[class*="result"], .result-display');
        if (resultDisplay) features.push('结果展示');
        
        const chartArea = document.querySelector('[class*="chart"], .chart-container');
        if (chartArea) features.push('图表区域');
        break;
    }
    
    console.log(`✅ 发现页面功能: ${features.join(', ')}`);
    return features;
  }

  generateFinalReport() {
    console.log('\n📊 生成最终测试报告...');
    
    const duration = Date.now() - this.startTime;
    const successfulTests = this.testResults.filter(r => r.success);
    const failedTests = this.testResults.filter(r => !r.success);
    
    let totalTests = 0;
    let passedTests = 0;
    let failedTestCount = 0;
    
    successfulTests.forEach(result => {
      if (result.report) {
        totalTests += result.report.totalTests;
        passedTests += result.report.passedTests;
        failedTestCount += result.report.failedTests;
      }
    });
    
    const overallPassRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(2) : 0;
    
    const report = {
      testSuite: 'MBTI测试系统浏览器端测试',
      timestamp: new Date().toISOString(),
      duration,
      summary: {
        totalPages: this.testResults.length,
        successfulPages: successfulTests.length,
        failedPages: failedTests.length,
        totalTests,
        passedTests,
        failedTests: failedTestCount,
        overallPassRate
      },
      results: this.testResults
    };
    
    console.log('\n' + '='.repeat(60));
    console.log('📈 MBTI测试系统 - 浏览器端测试报告');
    console.log('='.repeat(60));
    console.log(`⏱️ 测试时长: ${duration}ms`);
    console.log(`📊 测试页面: ${report.summary.totalPages}`);
    console.log(`✅ 成功页面: ${report.summary.successfulPages}`);
    console.log(`❌ 失败页面: ${report.summary.failedPages}`);
    console.log(`📈 总体通过率: ${overallPassRate}%`);
    console.log(`🔢 测试统计: ${passedTests}/${totalTests}`);
    
    if (failedTests.length > 0) {
      console.log('\n❌ 失败的页面:');
      failedTests.forEach(test => {
        console.log(`  - ${test.pageName}: ${test.error}`);
      });
    }
    
    console.log('\n💾 完整报告数据:');
    console.log(report);
    
    // 保存到本地存储
    try {
      localStorage.setItem('mbti_test_report', JSON.stringify(report));
      console.log('\n💾 报告已保存到本地存储 (key: mbti_test_report)');
    } catch (error) {
      console.log('⚠️ 无法保存到本地存储:', error.message);
    }
    
    console.log('='.repeat(60));
    
    return report;
  }

  showQuickStart() {
    console.log(`
🚀 MBTI测试系统浏览器端测试执行器

📋 快速开始:
1. 单页面测试:
   await runner.runTestOnCurrentPage()

2. 多页面测试:
   await runner.runMultiPageTest()
   // 然后在每个页面运行: await runner.runTestOnCurrentPage()

3. 响应式测试:
   await runner.testResponsiveDesign()

4. 用户交互测试:
   await runner.simulateUserInteraction()

5. 页面功能检查:
   runner.checkPageSpecificFeatures()

6. 生成最终报告:
   runner.generateFinalReport()

💡 建议的完整测试流程:
   1. 在首页运行: await runner.runTestOnCurrentPage()
   2. 导航到测试页面，运行: await runner.runTestOnCurrentPage()
   3. 完成测试，在结果页面运行: await runner.runTestOnCurrentPage()
   4. 最后生成报告: runner.generateFinalReport()
`);
  }
}

// 自动创建实例并显示使用说明
const runner = new BrowserTestRunner();
runner.showQuickStart();

// 导出到全局
window.BrowserTestRunner = BrowserTestRunner;
window.runner = runner;

console.log('✅ 浏览器端测试执行器已加载');
console.log('💡 使用 runner 变量开始测试');