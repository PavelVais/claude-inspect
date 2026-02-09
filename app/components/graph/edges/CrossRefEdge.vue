<script setup lang="ts">
import { BezierEdge } from '@vue-flow/core'

defineProps<{
  id: string
  source: string
  target: string
  sourceX: number
  sourceY: number
  targetX: number
  targetY: number
  sourcePosition: string
  targetPosition: string
  data?: { color?: string; label?: string }
  markerEnd?: string
  style?: Record<string, string>
}>()
</script>

<template>
  <BezierEdge
    :id="id"
    :source="source"
    :target="target"
    :source-x="sourceX"
    :source-y="sourceY"
    :target-x="targetX"
    :target-y="targetY"
    :source-position="sourcePosition as any"
    :target-position="targetPosition as any"
    :marker-end="markerEnd"
    :style="{
      stroke: data?.color || '#f59e0b',
      strokeWidth: '1.5',
      strokeDasharray: '6 4',
      filter: `drop-shadow(0 0 3px ${data?.color || '#f59e0b'}50)`,
      opacity: 0.7,
      ...style,
    }"
  />
</template>
