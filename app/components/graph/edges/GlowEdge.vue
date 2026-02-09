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
  data?: { color?: string }
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
      stroke: data?.color || '#3b82f6',
      strokeWidth: '2',
      filter: `drop-shadow(0 0 4px ${data?.color || '#3b82f6'}40)`,
      ...style,
    }"
  />
</template>
