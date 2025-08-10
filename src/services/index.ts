// 数据服务统一导出和初始化
import { dataService } from './dataService';
import { localStorageService } from './localStorageService';

// 初始化数据服务
export const initializeDataServices = async () => {
  try {
    console.log('🚀 初始化数据服务...');
    
    // 检查网络状态
    const isOnline = navigator.onLine;
    console.log(`📡 网络状态: ${isOnline ? '在线' : '离线'}`);
    
    // 如果在线，记录状态
    if (isOnline) {
      console.log('🔄 在线模式，数据将实时同步');
    } else {
      console.log('📴 离线模式，数据将本地存储');
    }
    
    // 获取存储统计信息
    const stats = dataService.getStorageUsage();
    console.log('📊 存储统计:', stats);
    
    console.log('✅ 数据服务初始化完成');
    return true;
  } catch (error) {
    console.error('❌ 数据服务初始化失败:', error);
    return false;
  }
};

// 导出服务实例
export { dataService, localStorageService };

// 导出数据类型
export type {
  User,
  TestSession,
  AnswerRecord,
  PaymentOrder,
  UserBehaviorLog,
  ShareRecord
} from './database';

// 导出工具函数
export {
  generateUserId,
  generateSessionId,
  getDeviceInfo,
  getBrowserInfo
} from './database';

// 性能监控和错误处理
export const monitorDataService = () => {
  // 监控存储使用情况
  setInterval(() => {
    const stats = dataService.getStorageUsage();
    const storageUsed = parseFloat(stats.storageUsed.replace('MB', ''));
    
    // 如果存储使用超过80%，发出警告
    if (storageUsed > 4) { // 假设5MB为上限
      console.warn('⚠️ 本地存储使用量较高:', stats.storageUsed);
    }
  }, 60000); // 每分钟检查一次
  
  // 监控网络状态变化
  window.addEventListener('online', () => {
    console.log('🌐 网络连接恢复，数据将实时同步');
  });
  
  window.addEventListener('offline', () => {
    console.log('📴 网络连接断开，切换到离线模式');
  });
};

// 数据备份和恢复
export const backupData = (): string => {
  try {
    return localStorageService.exportData();
  } catch (error) {
    console.error('数据备份失败:', error);
    throw error;
  }
};

export const restoreData = (backupData: string): boolean => {
  try {
    return localStorageService.importData(backupData);
  } catch (error) {
    console.error('数据恢复失败:', error);
    return false;
  }
};

// 清理数据
export const clearAllData = (): void => {
  try {
    localStorageService.clearAllData();
    console.log('✅ 所有数据已清理');
  } catch (error) {
    console.error('清理数据失败:', error);
    throw error;
  }
};