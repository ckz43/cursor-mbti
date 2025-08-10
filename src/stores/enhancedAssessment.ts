// 增强的评估状态管理 - 集成数据库保存功能
import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { 
  dataService, 
  generateUserId, 
  generateSessionId, 
  getDeviceInfo, 
  getBrowserInfo,
  type User,
  type TestSession,
  type AnswerRecord,
  type UserBehaviorLog
} from '@/services/database';
import { questions93 } from '@/data/questions-93';
import { mapping93, type Dimension } from '@/data/mapping-93';

// 答案选项映射
const answerOptions = [
  { text: '非常符合', score: 1.5 },
  { text: '比较符合', score: 0.5 },
  { text: '不太符合', score: -0.5 },
  { text: '完全不符合', score: -1.5 }
];

// 设备类型检测
const getDeviceType = (): string => {
  const userAgent = navigator.userAgent;
  if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
    return 'tablet';
  }
  if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
    return 'mobile';
  }
  return 'desktop';
};

export const useEnhancedAssessmentStore = defineStore('enhancedAssessment', () => {
  // 基础状态
  const answers = ref<number[]>(new Array(93).fill(-1));
  const isCompleted = ref(false);
  const isPaid = ref(false);
  const overrideType = ref<string | null>(null);
  const currentQuestionIndex = ref(0);
  const startTime = ref<Date | null>(null);
  const questionStartTime = ref<Date | null>(null);
  const questionTimes = ref<number[]>([]);
  
  // 用户和会话信息
  const userId = ref<string>(generateUserId());
  const sessionId = ref<string>(generateSessionId());
  const userInfo = ref<User | null>(null);
  const sessionInfo = ref<TestSession | null>(null);
  
  // 性能优化：批量保存
  const pendingAnswers = ref<AnswerRecord[]>([]);
  const saveTimeout = ref<number | null>(null);
  const isSaving = ref(false);
  
  // 错误处理
  const lastError = ref<string | null>(null);
  const retryCount = ref(0);
  const maxRetries = 3;
  
  // 计算属性
  const dimensionScores = computed(() => {
    const scores: Record<Dimension, number> = { EI: 0, NS: 0, TF: 0, JP: 0 };
    
    answers.value.forEach((answer, index) => {
      if (answer !== -1) {
        const mapping = mapping93[index];
        const score = answerOptions[answer].score * mapping.direction;
        scores[mapping.dimension] += score;
      }
    });
    
    return scores;
  });
  
  const mbtiType = computed(() => {
    if (overrideType.value) return overrideType.value;
    
    const scores = dimensionScores.value;
    return (
      (scores.EI > 0 ? 'E' : 'I') +
      (scores.NS > 0 ? 'N' : 'S') +
      (scores.TF > 0 ? 'T' : 'F') +
      (scores.JP > 0 ? 'J' : 'P')
    );
  });
  
  const shadowType = computed(() => {
    const type = mbtiType.value;
    if (!type || type.length !== 4) return '';
    
    return type.split('').map(char => {
      switch (char) {
        case 'E': return 'I';
        case 'I': return 'E';
        case 'N': return 'S';
        case 'S': return 'N';
        case 'T': return 'F';
        case 'F': return 'T';
        case 'J': return 'P';
        case 'P': return 'J';
        default: return char;
      }
    }).join('');
  });
  
  const percentages = computed(() => {
    const scores = dimensionScores.value;
    const maxScore = answers.value.filter(a => a !== -1).length * 1.5;
    
    if (maxScore === 0) {
      return { EI: 50, NS: 50, TF: 50, JP: 50 };
    }
    
    return {
      EI: Math.round(((scores.EI / maxScore) + 1) * 50),
      NS: Math.round(((scores.NS / maxScore) + 1) * 50),
      TF: Math.round(((scores.TF / maxScore) + 1) * 50),
      JP: Math.round(((scores.JP / maxScore) + 1) * 50)
    };
  });
  
  const progress = computed(() => {
    const answeredCount = answers.value.filter(a => a !== -1).length;
    return Math.round((answeredCount / 93) * 100);
  });
  
  const confidenceScore = computed(() => {
    const answeredCount = answers.value.filter(a => a !== -1).length;
    if (answeredCount === 0) return 0;
    
    // 基于答题完整度和答案分布计算置信度
    const completeness = answeredCount / 93;
    const extremeAnswers = answers.value.filter(a => a === 0 || a === 3).length;
    const extremeRatio = extremeAnswers / answeredCount;
    
    return Math.round((completeness * 0.7 + (1 - extremeRatio) * 0.3) * 100) / 100;
  });
  
  // 初始化用户和会话
  const initializeSession = async (userOverrides: Partial<User> = {}) => {
    try {
      const deviceInfo = getDeviceInfo();
      const browserInfo = getBrowserInfo();
      
      // 创建用户记录
      const newUser: Omit<User, 'id' | 'created_at' | 'updated_at'> = {
        user_id: userId.value,
        registration_source: 'direct',
        device_info: deviceInfo,
        ip_address: '', // 需要从后端获取
        user_agent: navigator.userAgent,
        status: 1,
        ...userOverrides
      };
      
      userInfo.value = await dataService.createUser(newUser);
      
      // 创建测试会话
      const newSession: Omit<TestSession, 'id' | 'created_at' | 'updated_at'> = {
        session_id: sessionId.value,
        user_id: userId.value,
        test_type: 'mbti_93',
        test_version: '1.0',
        status: 0, // 进行中
        total_questions: 93,
        answered_questions: 0,
        current_question_index: 0,
        device_type: getDeviceType(),
        browser_info: `${browserInfo.name} ${browserInfo.version}`,
        source_page: window.location.href,
        utm_source: new URLSearchParams(window.location.search).get('utm_source') || undefined,
        utm_medium: new URLSearchParams(window.location.search).get('utm_medium') || undefined,
        utm_campaign: new URLSearchParams(window.location.search).get('utm_campaign') || undefined
      };
      
      sessionInfo.value = await dataService.createTestSession(newSession);
      startTime.value = new Date();
      
      // 记录开始测试行为
      await logBehavior('test_start', 'test', 'start_test', 'MBTI测试开始');
      
      console.log('✅ 会话初始化成功:', { userId: userId.value, sessionId: sessionId.value });
    } catch (error) {
      console.error('❌ 会话初始化失败:', error);
      lastError.value = '初始化失败，请刷新页面重试';
    }
  };
  
  // 记录用户行为
  const logBehavior = async (
    eventType: string,
    category?: string,
    action?: string,
    label?: string,
    customData?: any
  ) => {
    try {
      const log: Omit<UserBehaviorLog, 'id' | 'created_at'> = {
        user_id: userId.value,
        session_id: sessionId.value,
        event_type: eventType,
        event_category: category,
        event_action: action,
        event_label: label,
        page_url: window.location.href,
        page_title: document.title,
        referrer_url: document.referrer,
        custom_data: customData,
        viewport_width: window.innerWidth,
        viewport_height: window.innerHeight,
        device_type: getDeviceType(),
        ...getBrowserInfo(),
        user_agent: navigator.userAgent
      };
      
      await dataService.logUserBehavior(log);
    } catch (error) {
      console.warn('行为日志记录失败:', error);
    }
  };
  
  // 批量保存答案（性能优化）
  const batchSaveAnswers = async () => {
    if (pendingAnswers.value.length === 0 || isSaving.value) return;
    
    isSaving.value = true;
    
    try {
      // 批量保存所有待保存的答案
      for (const answer of pendingAnswers.value) {
        await dataService.saveAnswer(answer);
      }
      
      // 更新会话进度
      if (sessionInfo.value) {
        const answeredCount = answers.value.filter(a => a !== -1).length;
        const timeSpent = startTime.value ? Math.floor((Date.now() - startTime.value.getTime()) / 1000) : 0;
        const avgTime = answeredCount > 0 ? timeSpent / answeredCount : 0;
        
        await dataService.updateTestSession(sessionId.value, {
          answered_questions: answeredCount,
          current_question_index: currentQuestionIndex.value,
          time_spent_seconds: timeSpent,
          avg_time_per_question: Math.round(avgTime * 100) / 100
        });
      }
      
      pendingAnswers.value = [];
      retryCount.value = 0;
      lastError.value = null;
      
    } catch (error) {
      console.error('批量保存失败:', error);
      
      if (retryCount.value < maxRetries) {
        retryCount.value++;
        // 指数退避重试
        setTimeout(() => batchSaveAnswers(), Math.pow(2, retryCount.value) * 1000);
      } else {
        lastError.value = '数据保存失败，请检查网络连接';
      }
    } finally {
      isSaving.value = false;
    }
  };
  
  // 记录答案
  const recordAnswer = async (questionIndex: number, answerIndex: number) => {
    const previousAnswer = answers.value[questionIndex];
    answers.value[questionIndex] = answerIndex;
    
    // 记录答题时间
    if (questionStartTime.value) {
      const timeSpent = Math.floor((Date.now() - questionStartTime.value.getTime()) / 1000);
      questionTimes.value[questionIndex] = timeSpent;
    }
    
    // 准备答案记录
    const mapping = mapping93[questionIndex];
    const answerOption = answerOptions[answerIndex];
    
    const answerRecord: Omit<AnswerRecord, 'id' | 'answer_time'> = {
      session_id: sessionId.value,
      user_id: userId.value,
      question_index: questionIndex,
      question_text: questions93[questionIndex],
      dimension: mapping.dimension,
      direction: mapping.direction,
      answer_index: answerIndex,
      answer_text: answerOption.text,
      answer_score: answerOption.score * mapping.direction,
      time_spent_seconds: questionTimes.value[questionIndex] || 0,
      is_changed: previousAnswer !== -1,
      change_count: previousAnswer !== -1 ? 1 : 0,
      previous_answer_index: previousAnswer !== -1 ? previousAnswer : undefined
    };
    
    // 添加到待保存队列
    pendingAnswers.value.push(answerRecord);
    
    // 清除之前的保存定时器
    if (saveTimeout.value) {
      clearTimeout(saveTimeout.value);
    }
    
    // 设置新的保存定时器（防抖）
    saveTimeout.value = window.setTimeout(() => {
      batchSaveAnswers();
    }, 2000); // 2秒后保存
    
    // 记录答题行为
    await logBehavior('answer_question', 'test', 'answer', `问题${questionIndex + 1}`, {
      questionIndex,
      answerIndex,
      answerText: answerOption.text,
      dimension: mapping.dimension,
      timeSpent: questionTimes.value[questionIndex] || 0
    });
    
    // 更新当前题目索引
    if (questionIndex === currentQuestionIndex.value) {
      currentQuestionIndex.value = Math.min(questionIndex + 1, 92);
    }
    
    // 开始下一题计时
    questionStartTime.value = new Date();
  };
  
  // 完成测试
  const completeTest = async () => {
    if (isCompleted.value) return;
    
    // 立即保存所有待保存的答案
    if (saveTimeout.value) {
      clearTimeout(saveTimeout.value);
      saveTimeout.value = null;
    }
    await batchSaveAnswers();
    
    isCompleted.value = true;
    const completeTime = new Date();
    const totalTimeSpent = startTime.value ? Math.floor((completeTime.getTime() - startTime.value.getTime()) / 1000) : 0;
    
    try {
      // 更新会话状态
      const scores = dimensionScores.value;
      const percentageScores = percentages.value;
      
      await dataService.updateTestSession(sessionId.value, {
        status: 1, // 已完成
        complete_time: completeTime,
        answered_questions: 93,
        time_spent_seconds: totalTimeSpent,
        avg_time_per_question: Math.round((totalTimeSpent / 93) * 100) / 100,
        mbti_type: mbtiType.value,
        ei_score: scores.EI,
        ns_score: scores.NS,
        tf_score: scores.TF,
        jp_score: scores.JP,
        ei_percentage: percentageScores.EI,
        ns_percentage: percentageScores.NS,
        tf_percentage: percentageScores.TF,
        jp_percentage: percentageScores.JP,
        confidence_score: confidenceScore.value
      });
      
      // 记录完成行为
      await logBehavior('test_complete', 'test', 'complete', 'MBTI测试完成', {
        mbtiType: mbtiType.value,
        totalTime: totalTimeSpent,
        confidenceScore: confidenceScore.value
      });
      
      console.log('✅ 测试完成，结果已保存:', {
        mbtiType: mbtiType.value,
        scores: scores,
        percentages: percentageScores
      });
      
    } catch (error) {
      console.error('❌ 完成测试时保存失败:', error);
      lastError.value = '结果保存失败，请稍后重试';
    }
  };
  
  // 重置测试
  const reset = () => {
    answers.value = new Array(93).fill(-1);
    isCompleted.value = false;
    isPaid.value = false;
    overrideType.value = null;
    currentQuestionIndex.value = 0;
    startTime.value = null;
    questionStartTime.value = null;
    questionTimes.value = [];
    pendingAnswers.value = [];
    lastError.value = null;
    retryCount.value = 0;
    
    // 生成新的会话ID
    sessionId.value = generateSessionId();
    
    if (saveTimeout.value) {
      clearTimeout(saveTimeout.value);
      saveTimeout.value = null;
    }
  };
  
  // 设置付费状态
  const setPaid = async (paid: boolean) => {
    isPaid.value = paid;
    
    if (paid) {
      await logBehavior('payment_success', 'payment', 'success', '支付成功');
    }
  };
  
  // 设置覆盖类型
  const setOverrideType = (type: string | null) => {
    overrideType.value = type;
  };
  
  // 开始答题计时
  const startQuestionTimer = () => {
    questionStartTime.value = new Date();
  };
  
  // 监听答案变化，自动保存
  watch(
    () => answers.value.filter(a => a !== -1).length,
    (newCount, oldCount) => {
      if (newCount > oldCount && newCount % 10 === 0) {
        // 每答完10题强制保存一次
        batchSaveAnswers();
      }
    }
  );
  
  // 页面卸载前保存数据
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      if (pendingAnswers.value.length > 0) {
        // 使用 sendBeacon 在页面卸载时发送数据
        navigator.sendBeacon('/api/answers/batch', JSON.stringify(pendingAnswers.value));
      }
    });
  }
  
  return {
    // 状态
    answers,
    isCompleted,
    isPaid,
    overrideType,
    currentQuestionIndex,
    userId,
    sessionId,
    userInfo,
    sessionInfo,
    isSaving,
    lastError,
    
    // 计算属性
    dimensionScores,
    mbtiType,
    shadowType,
    percentages,
    progress,
    confidenceScore,
    
    // 方法
    initializeSession,
    recordAnswer,
    completeTest,
    reset,
    setPaid,
    setOverrideType,
    startQuestionTimer,
    logBehavior,
    batchSaveAnswers
  };
});