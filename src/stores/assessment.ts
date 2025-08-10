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
    answers: [],
    finished: false,
    paid: false,
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
      // 归一化到 0-100 用于可视化；当答案为空时返回0，避免 undefined 报错
      const s = this.dimensionScores as Record<DimensionKey, number>
      const normalize = (x: number) => Math.max(0, Math.min(100, Math.round(((x ?? 0) + 30) / 60 * 100)))
      return { EI: normalize(s.EI ?? 0), NS: normalize(s.NS ?? 0), TF: normalize(s.TF ?? 0), JP: normalize(s.JP ?? 0) }
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

