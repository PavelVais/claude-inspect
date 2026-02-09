<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import type { ProjectNodeData } from '~/types/graph'

defineProps<{ data: ProjectNodeData }>()
</script>

<template>
  <div
    class="relative w-[320px] rounded-2xl border border-blue-500/50 bg-gradient-to-br from-slate-900 via-slate-800/95 to-slate-900 px-6 py-5"
    style="box-shadow: 0 0 20px rgba(59, 130, 246, 0.15), 0 8px 24px rgba(0, 0, 0, 0.4)"
  >
    <div class="mb-2 flex items-center gap-3">
      <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/30">
        <IconsIconProject class="h-6 w-6" />
      </div>
      <h3 class="text-lg font-bold text-white">{{ data.name }}</h3>
    </div>
    <p v-if="data.overview" class="line-clamp-3 text-sm leading-relaxed text-slate-400">
      {{ data.overview }}
    </p>
    <Handle type="source" :position="Position.Right" class="!bg-blue-500" />
  </div>
</template>
