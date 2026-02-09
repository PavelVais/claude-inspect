<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import type { ComputedRef } from 'vue'
import type { SkillNodeData } from '~/types/graph'

const props = defineProps<{ data: SkillNodeData; nodeId: string }>()

const connectedSourceNodes = inject<ComputedRef<Set<string>>>('connectedSourceNodes')
const hasSourceEdge = computed<boolean>(() => connectedSourceNodes?.value.has(props.nodeId) ?? false)
</script>

<template>
  <div
    class="relative w-[220px] rounded-xl border border-blue-500/30 bg-gradient-to-br from-slate-900/90 to-slate-800/80 px-3 py-2.5 transition-all hover:border-blue-500/50"
    style="box-shadow: 0 0 8px rgba(59, 130, 246, 0.08), 0 4px 12px rgba(0, 0, 0, 0.3)"
  >
    <div class="mb-0.5 flex items-center gap-1.5">
      <IconsIconSkill class="h-3.5 w-3.5 shrink-0 text-blue-400" />
      <span class="text-sm font-medium text-blue-300">{{ data.skill.name }}</span>
    </div>
    <p v-if="data.skill.description" class="line-clamp-2 pl-5 text-xs text-slate-400">
      {{ data.skill.description }}
    </p>
    <Handle id="target" type="target" :position="Position.Left" class="!bg-blue-500" />
    <Handle id="source" type="source" :position="Position.Right" class="!bg-blue-500" :style="{ opacity: hasSourceEdge ? 1 : 0 }" />
  </div>
</template>
