import { defineStore } from 'pinia'
import { mapping93, type QuestionMapping } from '../data/mapping-93'

type DimensionKey = 'EI' | 'NS' | 'TF' | 'JP'

export interface AssessmentState {
  answers: number[]
  finished: boolean
  paid: boolean
  overrideType: string | null
}

const scaleValues = [1.5, 0.5, -0.5, -1.5] // 与选项顺序对应：非常符合→完全不符合

export const useAssessmentStore = defineStore('assessment', {
  state: (): AssessmentState => ({
    answers: [
      // 创建更合理的测试数据分布 - 生成ENFP类型
      ...Array(23).fill(0).map(() => Math.floor(Math.random() * 2)), // EI维度：偏向E
      ...Array(23).fill(0).map(() => Math.floor(Math.random() * 3) + 1), // NS维度：偏向N
      ...Array(24).fill(0).map(() => Math.floor(Math.random() * 2) + 2), // TF维度：偏向F
      ...Array(23).fill(0).map(() => Math.floor(Math.random() * 2))  // JP维度：偏向P
    ],
    finished: true, // 设置为已完成
    paid: true, // 设置为已付费
    overrideType: null,
  }),
  getters: {
    totalQuestions: () => mapping93.length,
    dimensionScores(state) {
      const scores: Record<DimensionKey, number> = { EI: 0, NS: 0, TF: 0, JP: 0 }
      state.answers.forEach((answerIdx, i) => {
        const map: QuestionMapping | undefined = mapping93[i]
        if (!map) return
        const v = scaleValues[answerIdx] ?? 0
        scores[map.dimension] += v * map.direction
      })
      return scores
    },
    mbtiType(): string {
      if (this.overrideType) return this.overrideType
      const s = this.dimensionScores as Record<DimensionKey, number>
      const e = s.EI >= 0 ? 'E' : 'I'
      const n = s.NS >= 0 ? 'N' : 'S'
      const t = s.TF >= 0 ? 'T' : 'F'
      const j = s.JP >= 0 ? 'J' : 'P'
      return `${e}${n}${t}${j}`
    },
    shadowType(): string {
      // 影子人格：四维全部取反
      return flipType(this.mbtiType)
    },
    proportions(): Record<DimensionKey, number> {
      // 归一化到 0-100 用于可视化；当答案为空时返回50（中性）
      const s = this.dimensionScores as Record<DimensionKey, number>
      
      // 计算每个维度的题目数量
      const dimensionCounts: Record<DimensionKey, number> = { EI: 0, NS: 0, TF: 0, JP: 0 }
      mapping93.forEach(map => {
        dimensionCounts[map.dimension]++
      })
      
      const normalize = (score: number, dimension: DimensionKey) => {
        if (this.answers.length === 0) return 50 // 未答题时显示中性
        
        // 计算该维度的理论最大分数（题目数 × 1.5）
        const maxScore = dimensionCounts[dimension] * 1.5
        
        // 将分数从 [-maxScore, +maxScore] 映射到 [0, 100]
        // 负分表示第二个字母（I/S/F/P），正分表示第一个字母（E/N/T/J）
        const percentage = Math.max(0, Math.min(100, Math.round(((score + maxScore) / (2 * maxScore)) * 100)))
        return percentage
      }
      
      return { 
        EI: normalize(s.EI ?? 0, 'EI'), 
        NS: normalize(s.NS ?? 0, 'NS'), 
        TF: normalize(s.TF ?? 0, 'TF'), 
        JP: normalize(s.JP ?? 0, 'JP') 
      }
    }
  },
  actions: {
    reset() {
      this.answers = []
      this.finished = false
      // 不重置 paid，允许同一用户多次测试且保留解锁状态
      // 不重置 overrideType，便于开发者在一次会话内切换演示
    },
    recordAnswer(answerIdx: number) {
      this.answers.push(answerIdx)
    },
    setFinished(v: boolean) {
      this.finished = v
    },
    setPaid(v: boolean) {
      this.paid = v
    },
    setOverrideType(type: string | null) {
      this.overrideType = type
    }
  }
})

function flipType(type: string): string {
  const flipLetter = (c: string) => ({ E: 'I', I: 'E', N: 'S', S: 'N', T: 'F', F: 'T', J: 'P', P: 'J' } as Record<string, string>)[c] || c
  return type.split('').map(flipLetter).join('')
}

