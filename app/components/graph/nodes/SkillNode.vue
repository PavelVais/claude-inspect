<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import type { SkillNodeData } from '~/types/graph'

defineProps<{ data: SkillNodeData }>()
</script>

<template>
  <div
    class="relative w-[220px] rounded-lg border border-blue-500/30 bg-slate-900/80 px-3 py-2.5 shadow-sm transition-all hover:border-blue-500/50 hover:shadow-blue-500/10"
  >
    <div class="mb-0.5 flex items-center gap-1.5">
      <IconsIconSkill class="h-3.5 w-3.5 shrink-0 text-blue-400" />
      <span class="text-sm font-medium text-blue-300">{{ data.skill.name }}</span>
    </div>
    <p v-if="data.skill.description" class="line-clamp-2 pl-5 text-xs text-slate-400">
      {{ data.skill.description }}
    </p>
    <Handle type="target" :position="Position.Left" class="!bg-blue-500" />
  </div>
</template>
