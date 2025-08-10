export type Dimension = 'EI' | 'NS' | 'TF' | 'JP'
export interface QuestionMapping { dimension: Dimension; direction: 1 | -1 }

// 平衡分布的93题维度映射，按 EI -> NS -> TF -> JP 循环，方向交替
const cycle: Dimension[] = ['EI', 'NS', 'TF', 'JP']

export const mapping93: QuestionMapping[] = Array.from({ length: 93 }, (_, i) => {
  const dimension = cycle[i % cycle.length]
  const direction: 1 | -1 = (i % 2 === 0 ? 1 : -1)
  return { dimension, direction }
})

