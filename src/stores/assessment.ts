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
    answers: loadPersistedAnswers(),
    finished: loadPersistedFlag('assessment_finished'),
    paid: loadPersistedFlag('assessment_paid'),
    overrideType: loadPersistedOverrideType(),
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
      // 不重置付费状态，用户已解锁的权限保留
      // 同步本地存储
      persistAnswers(this.answers)
      persistFlag('assessment_finished', this.finished)
    },
    recordAnswer(answerIdx: number) {
      this.answers.push(answerIdx)
      persistAnswers(this.answers)
    },
    setFinished(v: boolean) {
      this.finished = v
      persistFlag('assessment_finished', v)
    },
    setPaid(v: boolean) {
      this.paid = v
      persistFlag('assessment_paid', v)
    },
    setOverrideType(type: string | null) {
      this.overrideType = type
      persistOverrideType(type)
    }
  }
})

function flipType(type: string): string {
  const flipLetter = (c: string) => ({ E: 'I', I: 'E', N: 'S', S: 'N', T: 'F', F: 'T', J: 'P', P: 'J' } as Record<string, string>)[c] || c
  return type.split('').map(flipLetter).join('')
}

// ========== 本地持久化工具 ==========
function loadPersistedAnswers(): number[] {
  try {
    const raw = localStorage.getItem('assessment_answers')
    if (!raw) return []
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr.filter((n) => Number.isInteger(n)) : []
  } catch {
    return []
  }
}

function persistAnswers(answers: number[]): void {
  try {
    localStorage.setItem('assessment_answers', JSON.stringify(answers))
  } catch {}
}

function loadPersistedFlag(key: string): boolean {
  try {
    const raw = localStorage.getItem(key)
    return raw === 'true'
  } catch {
    return false
  }
}

function persistFlag(key: string, value: boolean): void {
  try {
    localStorage.setItem(key, value ? 'true' : 'false')
  } catch {}
}

function loadPersistedOverrideType(): string | null {
  try {
    return localStorage.getItem('assessment_overrideType') || null
  } catch {
    return null
  }
}

function persistOverrideType(type: string | null): void {
  try {
    if (type === null) {
      localStorage.removeItem('assessment_overrideType')
    } else {
      localStorage.setItem('assessment_overrideType', type)
    }
  } catch {}
}

