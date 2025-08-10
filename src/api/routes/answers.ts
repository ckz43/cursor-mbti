// 答题记录 API 路由
import type { AnswerRecord } from '../../services/database';

// 模拟的路由处理器类型
type RouteHandler = (req: any, res: any) => Promise<void>;

// 答题记录保存
export const saveAnswer: RouteHandler = async (req, res) => {
  try {
    const answerData: Omit<AnswerRecord, 'id' | 'answer_time'> = req.body;
    
    // 验证必填字段
    if (!answerData.session_id || !answerData.user_id || answerData.question_index === undefined) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: '缺少必填字段：session_id, user_id, question_index'
      });
    }
    
    // 验证问题索引范围
    if (answerData.question_index < 0 || answerData.question_index >= 93) {
      return res.status(400).json({
        error: 'Invalid question index',
        message: '问题索引超出范围 (0-92)'
      });
    }
    
    // 验证答案索引范围
    if (answerData.answer_index < 0 || answerData.answer_index > 3) {
      return res.status(400).json({
        error: 'Invalid answer index',
        message: '答案索引超出范围 (0-3)'
      });
    }
    
    const result = await req.dbService.saveAnswer(answerData);
    
    res.status(201).json({
      success: true,
      data: result,
      message: '答案保存成功'
    });
    
  } catch (error: any) {
    console.error('保存答案失败:', error);
    res.status(500).json({
      error: 'Save failed',
      message: '答案保存失败',
      details: error?.message || '未知错误'
    });
  }
};

// 批量保存答题记录
export const batchSaveAnswers: RouteHandler = async (req, res) => {
  try {
    const answers: Array<Omit<AnswerRecord, 'id' | 'answer_time'>> = req.body;
    
    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        error: 'Invalid data',
        message: '请提供有效的答案数组'
      });
    }
    
    // 验证每个答案
    for (let i = 0; i < answers.length; i++) {
      const answer = answers[i];
      if (!answer.session_id || !answer.user_id || answer.question_index === undefined) {
        return res.status(400).json({
          error: 'Invalid answer data',
          message: `第${i + 1}个答案缺少必填字段`
        });
      }
    }
    
    const results = [];
    for (const answer of answers) {
      try {
        const result = await req.dbService.saveAnswer(answer);
        results.push(result);
      } catch (error) {
        console.error(`保存答案失败 (问题${answer.question_index}):`, error);
        // 继续保存其他答案，不中断整个批次
      }
    }
    
    res.status(201).json({
      success: true,
      data: results,
      message: `成功保存 ${results.length}/${answers.length} 个答案`,
      saved_count: results.length,
      total_count: answers.length
    });
    
  } catch (error: any) {
    console.error('批量保存答案失败:', error);
    res.status(500).json({
      error: 'Batch save failed',
      message: '批量保存失败',
      details: error?.message || '未知错误'
    });
  }
};

// 获取用户答题记录
export const getUserAnswers: RouteHandler = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (!sessionId) {
      return res.status(400).json({
        error: 'Missing session ID',
        message: '缺少会话ID'
      });
    }
    
    const answers = await req.dbService.getAnswersBySession(sessionId);
    
    res.json({
      success: true,
      data: answers,
      count: answers.length
    });
    
  } catch (error: any) {
    console.error('获取答题记录失败:', error);
    res.status(500).json({
      error: 'Fetch failed',
      message: '获取答题记录失败',
      details: error?.message || '未知错误'
    });
  }
};

// 更新答题记录
export const updateAnswer: RouteHandler = async (req, res) => {
  try {
    const { answerId } = req.params;
    const updateData = req.body;
    
    if (!answerId) {
      return res.status(400).json({
        error: 'Missing answer ID',
        message: '缺少答案ID'
      });
    }
    
    const result = await req.dbService.updateAnswer(parseInt(answerId), updateData);
    
    if (!result) {
      return res.status(404).json({
        error: 'Answer not found',
        message: '答案记录不存在'
      });
    }
    
    res.json({
      success: true,
      data: result,
      message: '答案更新成功'
    });
    
  } catch (error: any) {
    console.error('更新答案失败:', error);
    res.status(500).json({
      error: 'Update failed',
      message: '答案更新失败',
      details: error?.message || '未知错误'
    });
  }
};

// 删除答题记录
export const deleteAnswer: RouteHandler = async (req, res) => {
  try {
    const { answerId } = req.params;
    
    if (!answerId) {
      return res.status(400).json({
        error: 'Missing answer ID',
        message: '缺少答案ID'
      });
    }
    
    const result = await req.dbService.deleteAnswer(parseInt(answerId));
    
    if (!result) {
      return res.status(404).json({
        error: 'Answer not found',
        message: '答案记录不存在'
      });
    }
    
    res.json({
      success: true,
      message: '答案删除成功'
    });
    
  } catch (error: any) {
    console.error('删除答案失败:', error);
    res.status(500).json({
      error: 'Delete failed',
      message: '答案删除失败',
      details: error?.message || '未知错误'
    });
  }
};

// 获取答题统计
export const getAnswerStats: RouteHandler = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (!sessionId) {
      return res.status(400).json({
        error: 'Missing session ID',
        message: '缺少会话ID'
      });
    }
    
    const stats = await req.dbService.getAnswerStats(sessionId);
    
    res.json({
      success: true,
      data: stats
    });
    
  } catch (error: any) {
    console.error('获取答题统计失败:', error);
    res.status(500).json({
      error: 'Stats fetch failed',
      message: '获取答题统计失败',
      details: error?.message || '未知错误'
    });
  }
};

// 导出路由配置
export const answerRoutes = {
  'POST /': saveAnswer,
  'POST /batch': batchSaveAnswers,
  'GET /:sessionId': getUserAnswers,
  'PUT /:answerId': updateAnswer,
  'DELETE /:answerId': deleteAnswer,
  'GET /:sessionId/stats': getAnswerStats
};

export default answerRoutes;