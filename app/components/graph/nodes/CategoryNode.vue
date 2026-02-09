<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import type { CategoryNodeData } from '~/types/graph'

defineProps<{ data: CategoryNodeData }>()

const iconMap: Record<string, string> = {
  skills: 'IconsIconSkill',
  commands: 'IconsIconCommand',
  agents: 'IconsIconAgent',
  mcpTools: 'IconsIconMcpTool',
  permissions: 'IconsIconPermission',
}
</script>

<template>
  <div
    class="relative w-[200px] rounded-xl border bg-gradient-to-br from-slate-900/95 to-slate-800/90 px-4 py-3"
    :style="{
      borderColor: data.color + '50',
      boxShadow: `0 0 12px ${data.color}20, 0 4px 16px rgba(0,0,0,0.3)`,
    }"
  >
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div
          class="flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
          :style="{ backgroundColor: data.color + '20', color: data.color }"
        >
          <IconsIconSkill v-if="data.category === 'skills'" class="h-3.5 w-3.5" />
          <IconsIconCommand v-else-if="data.category === 'commands'" class="h-3.5 w-3.5" />
          <IconsIconAgent v-else-if="data.category === 'agents'" class="h-3.5 w-3.5" />
          <IconsIconMcpTool v-else-if="data.category === 'mcpTools'" class="h-3.5 w-3.5" />
          <IconsIconPermission v-else-if="data.category === 'permissions'" class="h-3.5 w-3.5" />
          <IconsIconHook v-else-if="data.category === 'hooks'" class="h-3.5 w-3.5" />
          <IconsIconTodo v-else-if="data.category === 'todos'" class="h-3.5 w-3.5" />
        </div>
        <span class="text-sm font-medium text-white">{{ data.label }}</span>
      </div>
      <span
        class="rounded-full px-2 py-0.5 text-xs font-medium"
        :style="{
          backgroundColor: data.color + '20',
          color: data.color,
        }"
      >
        {{ data.count }}
      </span>
    </div>
    <Handle type="target" :position="Position.Left" class="!bg-slate-500" />
    <Handle type="source" :position="Position.Right" class="!bg-slate-500" />
  </div>
</template>
