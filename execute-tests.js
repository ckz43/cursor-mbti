// MBTI测试系统 - 测试执行脚本
// 此脚本用于验证关键功能和数据节点

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 测试结果收集器
class TestResultCollector {
  constructor() {
    this.results = [];
    this.startTime = new Date();
  }

  addResult(category, testName, status, details = '') {
    this.results.push({
      category,
      testName,
      status, // 'PASS', 'FAIL', 'SKIP'
      details,
      timestamp: new Date().toISOString()
    });
    
    const emoji = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⏭️';
    console.log(`${emoji} [${category}] ${testName}${details ? ': ' + details : ''}`);
  }

  generateReport() {
    const endTime = new Date();
    const duration = endTime - this.startTime;
    
    const summary = {
      total: this.results.length,
      passed: this.results.filter(r => r.status === 'PASS').length,
      failed: this.results.filter(r => r.status === 'FAIL').length,
      skipped: this.results.filter(r => r.status === 'SKIP').length,
      duration: `${duration}ms`,
      passRate: 0
    };
    
    summary.passRate = summary.total > 0 ? ((summary.passed / summary.total) * 100).toFixed(2) : 0;
    
    return {
      summary,
      results: this.results,
      timestamp: endTime.toISOString()
    };
  }
}

// 文件系统测试
class FileSystemTests {
  constructor(collector) {
    this.collector = collector;
    this.projectRoot = process.cwd();
  }

  // 检查关键文件是否存在
  checkCriticalFiles() {
    const criticalFiles = [
      'src/services/dataService.ts',
      'src/services/localStorageService.ts',
      'src/services/database.ts',
      'src/services/index.ts',
      'src/stores/assessment.ts',
      'src/stores/enhancedAssessment.ts',
      'src/views/Home.vue',
      'src/views/Test.vue',
      'src/views/Generating.vue',
      'src/views/Result.vue',
      'src/views/Report.vue',
      'src/main.ts',
      'package.json',
      'vite.config.ts'
    ];

    criticalFiles.forEach(file => {
      const filePath = path.join(this.projectRoot, file);
      const exists = fs.existsSync(filePath);
      this.collector.addResult(
        'FileSystem',
        `检查关键文件: ${file}`,
        exists ? 'PASS' : 'FAIL',
        exists ? '文件存在' : '文件缺失'
      );
    });
  }

  // 检查数据服务文件内容
  checkDataServiceContent() {
    const dataServicePath = path.join(this.projectRoot, 'src/services/dataService.ts');
    
    if (fs.existsSync(dataServicePath)) {
      const content = fs.readFileSync(dataServicePath, 'utf8');
      
      // 检查关键方法是否存在
      const requiredMethods = [
        'createUser',
        'getUserById',
        'createTestSession',
        'getTestHistory',
        'saveAnswer',
        'getSessionAnswers',
        'createPaymentOrder',
        'getPaymentOrderById',
        'saveBehaviorLog',
        'createShareRecord'
      ];

      requiredMethods.forEach(method => {
        const hasMethod = content.includes(method);
        this.collector.addResult(
          'DataService',
          `检查数据服务方法: ${method}`,
          hasMethod ? 'PASS' : 'FAIL',
          hasMethod ? '方法存在' : '方法缺失'
        );
      });

      // 检查错误处理
      const hasErrorHandling = content.includes('try') && content.includes('catch');
      this.collector.addResult(
        'DataService',
        '检查错误处理机制',
        hasErrorHandling ? 'PASS' : 'FAIL',
        hasErrorHandling ? '包含错误处理' : '缺少错误处理'
      );
    } else {
      this.collector.addResult(
        'DataService',
        '数据服务文件检查',
        'FAIL',
        'dataService.ts文件不存在'
      );
    }
  }

  // 检查Vue组件结构
  checkVueComponents() {
    const components = [
      { file: 'src/views/Test.vue', requiredElements: ['selectAnswer', 'nextQuestion', 'recordAnswer'] },
      { file: 'src/views/Result.vue', requiredElements: ['proceedPayment', 'dataService', 'createPaymentOrder'] },
      { file: 'src/views/Report.vue', requiredElements: ['mbtiType', 'dimensionScores', 'proportions'] },
      { file: 'src/views/Home.vue', requiredElements: ['router', 'startTest', 'useRouter'] }
    ];

    components.forEach(({ file, requiredElements }) => {
      const filePath = path.join(this.projectRoot, file);
      
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        requiredElements.forEach(element => {
          const hasElement = content.toLowerCase().includes(element.toLowerCase());
          this.collector.addResult(
            'VueComponents',
            `${path.basename(file)} - ${element}`,
            hasElement ? 'PASS' : 'FAIL',
            hasElement ? '元素存在' : '元素缺失'
          );
        });
      } else {
        this.collector.addResult(
          'VueComponents',
          `检查组件文件: ${file}`,
          'FAIL',
          '文件不存在'
        );
      }
    });
  }

  // 检查Pinia stores
  checkPiniaStores() {
    const stores = [
      { file: 'src/stores/assessment.ts', requiredFeatures: ['defineStore', 'answers', 'recordAnswer'] },
      { file: 'src/stores/enhancedAssessment.ts', requiredFeatures: ['dataService', 'batchSaveAnswers', 'sessionInfo'] }
    ];

    stores.forEach(({ file, requiredFeatures }) => {
      const filePath = path.join(this.projectRoot, file);
      
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        requiredFeatures.forEach(feature => {
          const hasFeature = content.includes(feature);
          this.collector.addResult(
            'PiniaStores',
            `${path.basename(file)} - ${feature}`,
            hasFeature ? 'PASS' : 'FAIL',
            hasFeature ? '特性存在' : '特性缺失'
          );
        });
      } else {
        this.collector.addResult(
          'PiniaStores',
          `检查Store文件: ${file}`,
          'FAIL',
          '文件不存在'
        );
      }
    });
  }

  runAllTests() {
    console.log('🔍 开始文件系统和代码结构测试...');
    this.checkCriticalFiles();
    this.checkDataServiceContent();
    this.checkVueComponents();
    this.checkPiniaStores();
  }
}

// 配置文件测试
class ConfigurationTests {
  constructor(collector) {
    this.collector = collector;
    this.projectRoot = process.cwd();
  }

  checkPackageJson() {
    const packagePath = path.join(this.projectRoot, 'package.json');
    
    if (fs.existsSync(packagePath)) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        
        // 检查关键依赖
        const requiredDeps = ['vue', 'pinia', 'vue-router', 'typescript'];
        const requiredDevDeps = ['vite', '@vitejs/plugin-vue'];
        
        requiredDeps.forEach(dep => {
          const hasDep = packageJson.dependencies && packageJson.dependencies[dep];
          this.collector.addResult(
            'Configuration',
            `检查生产依赖: ${dep}`,
            hasDep ? 'PASS' : 'FAIL',
            hasDep ? `版本: ${packageJson.dependencies[dep]}` : '依赖缺失'
          );
        });
        
        requiredDevDeps.forEach(dep => {
          const hasDevDep = packageJson.devDependencies && packageJson.devDependencies[dep];
          this.collector.addResult(
            'Configuration',
            `检查开发依赖: ${dep}`,
            hasDevDep ? 'PASS' : 'FAIL',
            hasDevDep ? `版本: ${packageJson.devDependencies[dep]}` : '依赖缺失'
          );
        });
        
        // 检查脚本
        const hasDevScript = packageJson.scripts && packageJson.scripts.dev;
        const hasBuildScript = packageJson.scripts && packageJson.scripts.build;
        
        this.collector.addResult(
          'Configuration',
          '检查开发脚本',
          hasDevScript ? 'PASS' : 'FAIL',
          hasDevScript ? packageJson.scripts.dev : '脚本缺失'
        );
        
        this.collector.addResult(
          'Configuration',
          '检查构建脚本',
          hasBuildScript ? 'PASS' : 'FAIL',
          hasBuildScript ? packageJson.scripts.build : '脚本缺失'
        );
        
      } catch (error) {
        this.collector.addResult(
          'Configuration',
          'package.json解析',
          'FAIL',
          `解析错误: ${error.message}`
        );
      }
    } else {
      this.collector.addResult(
        'Configuration',
        'package.json存在性检查',
        'FAIL',
        '文件不存在'
      );
    }
  }

  checkViteConfig() {
    const viteConfigPath = path.join(this.projectRoot, 'vite.config.ts');
    
    if (fs.existsSync(viteConfigPath)) {
      const content = fs.readFileSync(viteConfigPath, 'utf8');
      
      const hasVuePlugin = content.includes('@vitejs/plugin-vue');
      const hasDefineConfig = content.includes('defineConfig');
      
      this.collector.addResult(
        'Configuration',
        'Vite Vue插件配置',
        hasVuePlugin ? 'PASS' : 'FAIL',
        hasVuePlugin ? '插件已配置' : '插件未配置'
      );
      
      this.collector.addResult(
        'Configuration',
        'Vite配置结构',
        hasDefineConfig ? 'PASS' : 'FAIL',
        hasDefineConfig ? '配置正确' : '配置错误'
      );
    } else {
      this.collector.addResult(
        'Configuration',
        'vite.config.ts存在性检查',
        'FAIL',
        '文件不存在'
      );
    }
  }

  runAllTests() {
    console.log('⚙️ 开始配置文件测试...');
    this.checkPackageJson();
    this.checkViteConfig();
  }
}

// 主测试执行器
class MainTestExecutor {
  constructor() {
    this.collector = new TestResultCollector();
  }

  async runAllTests() {
    console.log('🚀 开始执行MBTI测试系统完整测试套件');
    console.log('=' .repeat(60));
    
    // 文件系统测试
    const fsTests = new FileSystemTests(this.collector);
    fsTests.runAllTests();
    
    console.log('');
    
    // 配置文件测试
    const configTests = new ConfigurationTests(this.collector);
    configTests.runAllTests();
    
    console.log('');
    
    // 生成最终报告
    this.generateFinalReport();
  }

  generateFinalReport() {
    console.log('📊 生成测试报告...');
    console.log('=' .repeat(60));
    
    const report = this.collector.generateReport();
    
    console.log(`\n📈 测试统计:`);
    console.log(`总测试数: ${report.summary.total}`);
    console.log(`通过: ${report.summary.passed}`);
    console.log(`失败: ${report.summary.failed}`);
    console.log(`跳过: ${report.summary.skipped}`);
    console.log(`通过率: ${report.summary.passRate}%`);
    console.log(`执行时间: ${report.summary.duration}`);
    
    // 按类别统计
    const categories = {};
    report.results.forEach(result => {
      if (!categories[result.category]) {
        categories[result.category] = { total: 0, passed: 0, failed: 0 };
      }
      categories[result.category].total++;
      if (result.status === 'PASS') categories[result.category].passed++;
      if (result.status === 'FAIL') categories[result.category].failed++;
    });
    
    console.log(`\n📋 分类统计:`);
    Object.entries(categories).forEach(([category, stats]) => {
      const rate = ((stats.passed / stats.total) * 100).toFixed(1);
      console.log(`${category}: ${stats.passed}/${stats.total} (${rate}%)`);
    });
    
    // 显示失败的测试
    const failedTests = report.results.filter(r => r.status === 'FAIL');
    if (failedTests.length > 0) {
      console.log(`\n❌ 失败的测试:`);
      failedTests.forEach(test => {
        console.log(`  [${test.category}] ${test.testName}: ${test.details}`);
      });
    }
    
    // 保存详细报告到文件
    this.saveReportToFile(report);
    
    console.log('\n' + '=' .repeat(60));
    const overallStatus = report.summary.passRate >= 80 ? '✅ 测试整体通过' : '❌ 测试存在问题，需要修复';
    console.log(overallStatus);
    console.log('=' .repeat(60));
    
    return report;
  }

  saveReportToFile(report) {
    const reportPath = path.join(process.cwd(), '测试执行结果.json');
    try {
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
      console.log(`\n💾 详细测试报告已保存到: ${reportPath}`);
    } catch (error) {
      console.log(`\n❌ 保存测试报告失败: ${error.message}`);
    }
  }
}

// 执行测试
const executor = new MainTestExecutor();
executor.runAllTests().catch(error => {
  console.error('❌ 测试执行失败:', error);
  process.exit(1);
});

export { MainTestExecutor, TestResultCollector };