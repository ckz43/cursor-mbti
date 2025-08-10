<template>
  <div class="w-full flex items-center justify-center">
    <svg :width="size" :height="size" :viewBox="`0 0 ${size} ${size}`" role="img" aria-label="维度雷达图">
      <!-- 背景网格圈 -->
      <g :transform="centerTransform">
        <circle v-for="r in rings" :key="r" :cx="0" :cy="0" :r="r" class="fill-none stroke-gray-200" stroke-width="1" />
        <!-- 十字轴线 -->
        <line v-for="(angle, idx) in angles" :key="`axis-${idx}`" x1="0" y1="0" :x2="axisEnd(angle).x" :y2="axisEnd(angle).y" class="stroke-gray-300" stroke-width="1" />
      </g>

      <!-- 数据多边形 -->
      <g :transform="centerTransform">
        <polygon :points="polygonPoints" fill="url(#radarGradient)" class="opacity-70">
          <animate attributeName="points" :to="polygonPoints" dur="0.6s" fill="freeze" />
        </polygon>
        <!-- 顶点小圆点 -->
        <circle v-for="(pt, i) in vertexPoints" :key="`pt-${i}`" :cx="pt.x" :cy="pt.y" r="3" class="fill-primary-500 stroke-white" stroke-width="1" />
      </g>

      <!-- 渐变定义 -->
      <defs>
        <linearGradient id="radarGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" :stop-color="primary" stop-opacity="0.9" />
          <stop offset="100%" :stop-color="secondary" stop-opacity="0.9" />
        </linearGradient>
      </defs>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Values { EI: number; NS: number; TF: number; JP: number }

const props = defineProps<{
  values: Values
  size?: number
  primaryColor?: string
  secondaryColor?: string
}>()

const size = computed(() => props.size ?? 260)
const radius = computed(() => (size.value / 2) - 16)
const center = computed(() => ({ x: size.value / 2, y: size.value / 2 }))
const centerTransform = computed(() => `translate(${center.value.x}, ${center.value.y})`)

// 四轴角度（-90, 0, 90, 180 度）顺时针
const angles = [-90, 0, 90, 180].map(a => (a * Math.PI) / 180)
const rings = computed(() => [radius.value * 0.2, radius.value * 0.4, radius.value * 0.6, radius.value * 0.8, radius.value])

const clamp = (v: number) => Math.max(0, Math.min(100, v))
const norm = (v: number) => (clamp(v) / 100) * radius.value

const axisEnd = (angle: number) => ({ x: Math.cos(angle) * radius.value, y: Math.sin(angle) * radius.value })

const primary = computed(() => props.primaryColor ?? '#6366f1')
const secondary = computed(() => props.secondaryColor ?? '#8b5cf6')

const valuesArr = computed(() => [props.values.NS, props.values.TF, props.values.JP, props.values.EI])
// 顺序：NS(上) -> TF(右) -> JP(下) -> EI(左)，避免相邻维度交叉太多

const vertexPoints = computed(() => valuesArr.value.map((v, i) => {
  const r = norm(v)
  const angle = angles[i]
  return { x: Math.cos(angle) * r, y: Math.sin(angle) * r }
}))

const polygonPoints = computed(() => vertexPoints.value.map(p => `${p.x},${p.y}`).join(' '))
</script>

<style scoped>
.stroke-gray-200 { stroke: #e5e7eb; }
.stroke-gray-300 { stroke: #d1d5db; }
.fill-primary-500 { fill: #6366f1; }
</style>

