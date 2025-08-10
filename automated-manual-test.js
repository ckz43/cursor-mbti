/**
 * MBTI测试系统 - 自动化手动测试脚本
 * 自动在不同页面运行手动测试，收集完整测试结果
 */

import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class AutomatedManualTester {
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || 'http://localhost:5174';
    this.headless = options.headless !== false;
    this.browser = null;
    this.page = null;
    this.testResults = [];
    this.startTime = Date.now();
  }

  async init() {
    console.log('🚀 启动自动化手动测试...');
    
    this.browser = await puppeteer.launch({
      headless: this.headless,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    this.page = await this.browser.newPage();
    
    // 设置视口
    await this.page.setViewport({ width: 1920, height: 1080 });
    
    // 监听控制台输出
    this.page.on('console', msg => {
      if (msg.text().includes('MBTI测试系统手动测试脚本已加载')) {
        console.log('✅ 手动测试脚本已加载');
      }
    });
    
    // 监听页面错误
    this.page.on('pageerror', error => {
      console.error('❌ 页面错误:', error.message);
    });
  }

  async loadManualTestScript() {
    console.log('📥 加载手动测试脚本...');
    
    try {
      // 读取手动测试脚本
      const scriptPath = path.join(__dirname, 'manual-test-script.js');
      const scriptContent = await fs.readFile(scriptPath, 'utf8');
      
      // 在页面中执行脚本
      await this.page.evaluate(scriptContent);
      
      console.log('✅ 手动测试脚本加载成功');
      return true;
    } catch (error) {
      console.error('❌ 加载手动测试脚本失败:', error.message);
      return false;
    }
  }

  async runTestsOnPage(pageName, url) {
    console.log(`\n🔍 在 ${pageName} 页面运行测试...`);
    console.log(`📍 URL: ${url}`);
    
    try {
      // 导航到页面
      await this.page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // 等待页面稳定
      await this.page.waitForTimeout(2000);
      
      // 加载手动测试脚本
      const scriptLoaded = await this.loadManualTestScript();
      if (!scriptLoaded) {
        return { pageName, error: '脚本加载失败' };
      }
      
      // 运行测试
      const testResult = await this.page.evaluate(async () => {
        try {
          const tester = new MBTIManualTester();
          const report = await tester.runAllTests();
          return {
            success: true,
            report,
            url: window.location.href,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
          };
        } catch (error) {
          return {
            success: false,
            error: error.message,
            stack: error.stack
          };
        }
      });
      
      if (testResult.success) {
        console.log(`✅ ${pageName} 测试完成`);
        console.log(`📊 通过率: ${testResult.report.passRate}%`);
        console.log(`📈 测试结果: ${testResult.report.passedTests}/${testResult.report.totalTests}`);
      } else {
        console.error(`❌ ${pageName} 测试失败:`, testResult.error);
      }
      
      return { pageName, ...testResult };
      
    } catch (error) {
      console.error(`❌ ${pageName} 页面测试异常:`, error.message);
      return { pageName, error: error.message };
    }
  }

  async runFullTestSuite() {
    console.log('🎯 开始完整测试套件...');
    
    const testPages = [
      { name: '首页', url: `${this.baseUrl}/` },
      { name: '测试页面', url: `${this.baseUrl}/test` },
      { name: '结果页面', url: `${this.baseUrl}/result` },
      { name: '报告页面', url: `${this.baseUrl}/report` }
    ];
    
    const results = [];
    
    for (const testPage of testPages) {
      const result = await this.runTestsOnPage(testPage.name, testPage.url);
      results.push(result);
      
      // 页面间等待
      await this.page.waitForTimeout(1000);
    }
    
    return results;
  }

  async runResponsiveTests() {
    console.log('\n📱 开始响应式测试...');
    
    const viewports = [
      { name: '移动端', width: 375, height: 667 },
      { name: '平板', width: 768, height: 1024 },
      { name: '桌面', width: 1920, height: 1080 }
    ];
    
    const responsiveResults = [];
    
    for (const viewport of viewports) {
      console.log(`\n📐 测试 ${viewport.name} 视口 (${viewport.width}x${viewport.height})`);
      
      await this.page.setViewport(viewport);
      await this.page.waitForTimeout(1000);
      
      // 在首页运行响应式测试
      const result = await this.page.evaluate(async (viewportInfo) => {
        try {
          const tester = new MBTIManualTester();
          tester.checkResponsiveDesign();
          tester.checkAccessibility();
          
          const report = tester.generateReport();
          return {
            viewport: viewportInfo,
            success: true,
            report
          };
        } catch (error) {
          return {
            viewport: viewportInfo,
            success: false,
            error: error.message
          };
        }
      }, viewport);
      
      responsiveResults.push(result);
    }
    
    return responsiveResults;
  }

  async simulateUserJourney() {
    console.log('\n👤 模拟完整用户旅程...');
    
    try {
      // 1. 访问首页
      await this.page.goto(`${this.baseUrl}/`, { waitUntil: 'networkidle2' });
      await this.loadManualTestScript();
      
      // 2. 点击开始测试（如果有的话）
      const startButton = await this.page.$('button[class*="start"], .start-button, [data-testid="start-test"]');
      if (startButton) {
        await startButton.click();
        console.log('✅ 点击开始测试按钮');
        await this.page.waitForTimeout(2000);
      }
      
      // 3. 在测试页面进行答题
      if (this.page.url().includes('/test')) {
        console.log('📝 开始模拟答题...');
        
        // 模拟回答几个问题
        for (let i = 0; i < 5; i++) {
          const answerButtons = await this.page.$$('button[class*="answer"], .answer-option, [data-testid="answer-option"]');
          
          if (answerButtons.length > 0) {
            // 随机选择一个答案
            const randomIndex = Math.floor(Math.random() * answerButtons.length);
            await answerButtons[randomIndex].click();
            console.log(`✅ 回答第 ${i + 1} 题`);
            
            await this.page.waitForTimeout(1000);
            
            // 检查是否有下一题按钮
            const nextButton = await this.page.$('button[class*="next"], .next-button, [data-testid="next-question"]');
            if (nextButton) {
              await nextButton.click();
              await this.page.waitForTimeout(1000);
            }
          } else {
            console.log('⚠️ 未找到答题选项');
            break;
          }
        }
      }
      
      // 4. 运行用户旅程测试
      const journeyResult = await this.page.evaluate(async () => {
        const tester = new MBTIManualTester();
        await tester.simulateAnswering();
        tester.checkLocalStorage();
        tester.checkPiniaState();
        return tester.generateReport();
      });
      
      console.log('✅ 用户旅程模拟完成');
      return journeyResult;
      
    } catch (error) {
      console.error('❌ 用户旅程模拟失败:', error.message);
      return { error: error.message };
    }
  }

  async generateComprehensiveReport(allResults) {
    console.log('\n📊 生成综合测试报告...');
    
    const report = {
      testSuite: 'MBTI测试系统自动化手动测试',
      timestamp: new Date().toISOString(),
      duration: Date.now() - this.startTime,
      summary: {
        totalPages: 0,
        successfulPages: 0,
        failedPages: 0,
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        overallPassRate: 0
      },
      pageResults: allResults.pageTests || [],
      responsiveResults: allResults.responsiveTests || [],
      userJourneyResult: allResults.userJourney || {},
      recommendations: []
    };
    
    // 计算汇总数据
    if (report.pageResults.length > 0) {
      report.summary.totalPages = report.pageResults.length;
      report.summary.successfulPages = report.pageResults.filter(r => r.success).length;
      report.summary.failedPages = report.pageResults.filter(r => !r.success).length;
      
      const successfulResults = report.pageResults.filter(r => r.success && r.report);
      if (successfulResults.length > 0) {
        report.summary.totalTests = successfulResults.reduce((sum, r) => sum + r.report.totalTests, 0);
        report.summary.passedTests = successfulResults.reduce((sum, r) => sum + r.report.passedTests, 0);
        report.summary.failedTests = successfulResults.reduce((sum, r) => sum + r.report.failedTests, 0);
        report.summary.overallPassRate = ((report.summary.passedTests / report.summary.totalTests) * 100).toFixed(2);
      }
    }
    
    // 生成建议
    if (report.summary.overallPassRate < 80) {
      report.recommendations.push('整体测试通过率较低，建议检查失败的测试项目');
    }
    
    if (report.summary.failedPages > 0) {
      report.recommendations.push('部分页面测试失败，建议检查页面加载和脚本执行');
    }
    
    // 保存报告
    const reportPath = path.join(__dirname, `automated-test-report-${Date.now()}.json`);
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`📄 测试报告已保存: ${reportPath}`);
    return report;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      console.log('🧹 浏览器已关闭');
    }
  }

  async run() {
    try {
      await this.init();
      
      const allResults = {};
      
      // 1. 运行页面测试
      allResults.pageTests = await this.runFullTestSuite();
      
      // 2. 运行响应式测试
      allResults.responsiveTests = await this.runResponsiveTests();
      
      // 3. 运行用户旅程测试
      allResults.userJourney = await this.simulateUserJourney();
      
      // 4. 生成综合报告
      const finalReport = await this.generateComprehensiveReport(allResults);
      
      console.log('\n' + '='.repeat(60));
      console.log('🎉 自动化手动测试完成!');
      console.log('='.repeat(60));
      console.log(`📊 总体通过率: ${finalReport.summary.overallPassRate}%`);
      console.log(`📈 成功页面: ${finalReport.summary.successfulPages}/${finalReport.summary.totalPages}`);
      console.log(`⏱️ 测试时长: ${finalReport.duration}ms`);
      
      if (finalReport.recommendations.length > 0) {
        console.log('\n💡 建议:');
        finalReport.recommendations.forEach(rec => console.log(`  - ${rec}`));
      }
      
      return finalReport;
      
    } catch (error) {
      console.error('❌ 自动化测试失败:', error.message);
      throw error;
    } finally {
      await this.cleanup();
    }
  }
}

// 命令行执行
// 检查是否为主模块
if (import.meta.url === `file://${process.argv[1]}`) {
  const options = {
    baseUrl: process.env.BASE_URL || 'http://localhost:5174',
    headless: process.env.HEADLESS !== 'false'
  };
  
  const tester = new AutomatedManualTester(options);
  
  tester.run()
    .then(report => {
      console.log('\n🎉 自动化测试完成!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ 自动化测试失败:', error);
      process.exit(1);
    });
}

export default AutomatedManualTester;