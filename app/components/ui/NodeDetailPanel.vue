<script setup lang="ts">
import { computed } from 'vue'
import type { Node } from '@vue-flow/core'

const props = defineProps<{
  node: Node | null
}>()

const emit = defineEmits<{
  close: []
}>()

const title = computed<string>(() => {
  if (!props.node) return ''
  const d = props.node.data
  switch (props.node.type) {
    case 'project': return d.name
    case 'category': return d.label
    case 'skill': return d.skill.name
    case 'command': return `/${d.command.name}`
    case 'agent': return d.agent.title
    case 'permission': return `${d.group.category} Permissions`
    case 'mcpTool': return `${d.tool.service} / ${d.tool.tool}`
    default: return 'Details'
  }
})

const accentColor = computed<string>(() => {
  if (!props.node) return '#3b82f6'
  switch (props.node.type) {
    case 'project':
    case 'skill': return '#3b82f6'
    case 'command': return '#22c55e'
    case 'agent': return '#06b6d4'
    case 'permission': return '#f59e0b'
    case 'mcpTool': return '#8b5cf6'
    case 'category': return props.node.data.color || '#64748b'
    default: return '#64748b'
  }
})

function onBackdropClick(e: MouseEvent) {
  if (e.target === e.currentTarget) {
    emit('close')
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="node"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click="onBackdropClick"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

        <!-- Modal -->
        <div class="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-900 shadow-2xl">
          <!-- Accent top bar -->
          <div class="h-1" :style="{ background: `linear-gradient(90deg, ${accentColor}, ${accentColor}80)` }"></div>

          <!-- Header -->
          <div class="flex items-start justify-between px-6 pt-5 pb-0">
            <div class="flex items-center gap-3">
              <div
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                :style="{ backgroundColor: accentColor + '20', color: accentColor }"
              >
                <IconsIconProject v-if="node.type === 'project'" class="h-5 w-5" />
                <IconsIconSkill v-else-if="node.type === 'skill'" class="h-5 w-5" />
                <IconsIconCommand v-else-if="node.type === 'command'" class="h-5 w-5" />
                <IconsIconAgent v-else-if="node.type === 'agent'" class="h-5 w-5" />
                <IconsIconPermission v-else-if="node.type === 'permission'" class="h-5 w-5" />
                <IconsIconMcpTool v-else-if="node.type === 'mcpTool'" class="h-5 w-5" />
                <IconsIconProject v-else class="h-5 w-5" />
              </div>
              <div>
                <h3 class="text-base font-semibold text-white">{{ title }}</h3>
                <span
                  v-if="node.type !== 'project' && node.type !== 'category'"
                  class="mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider"
                  :style="{ backgroundColor: accentColor + '20', color: accentColor }"
                >
                  {{ node.type === 'mcpTool' ? 'MCP Tool' : node.type }}
                </span>
              </div>
            </div>
            <button
              class="mt-0.5 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
              @click="emit('close')"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>

          <!-- Content -->
          <div class="max-h-[60vh] overflow-y-auto px-6 pt-4 pb-6">
            <!-- Project -->
            <template v-if="node.type === 'project'">
              <div class="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">Project Overview</div>
              <p class="whitespace-pre-wrap text-sm leading-relaxed text-slate-300">{{ node.data.overview || 'No overview available.' }}</p>
            </template>

            <!-- Skill -->
            <template v-if="node.type === 'skill'">
              <div class="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">Description</div>
              <p class="text-sm leading-relaxed text-slate-300">{{ node.data.skill.description || 'No description.' }}</p>
              <div class="mt-5 mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">Source</div>
              <pre class="max-h-64 overflow-auto rounded-xl bg-slate-950 p-4 text-xs leading-relaxed text-slate-400">{{ node.data.skill.raw }}</pre>
            </template>

            <!-- Command -->
            <template v-if="node.type === 'command'">
              <div class="mb-3 flex items-center gap-2">
                <span class="rounded-md bg-green-500/15 px-2.5 py-1 font-mono text-xs text-green-400">/{{ node.data.command.name }}</span>
                <span class="text-sm text-slate-300">{{ node.data.command.title }}</span>
              </div>
              <div class="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">Description</div>
              <p class="text-sm leading-relaxed text-slate-300">{{ node.data.command.description || 'No description.' }}</p>
              <div class="mt-5 mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">Source</div>
              <pre class="max-h-64 overflow-auto rounded-xl bg-slate-950 p-4 text-xs leading-relaxed text-slate-400">{{ node.data.command.raw }}</pre>
            </template>

            <!-- Agent -->
            <template v-if="node.type === 'agent'">
              <div class="mb-3">
                <span class="rounded-md bg-cyan-500/15 px-2.5 py-1 font-mono text-xs text-cyan-400">{{ node.data.agent.name }}</span>
              </div>
              <div class="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">Description</div>
              <p class="text-sm leading-relaxed text-slate-300">{{ node.data.agent.description || 'No description.' }}</p>
              <div class="mt-5 mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">Source</div>
              <pre class="max-h-64 overflow-auto rounded-xl bg-slate-950 p-4 text-xs leading-relaxed text-slate-400">{{ node.data.agent.raw }}</pre>
            </template>

            <!-- Permission Group -->
            <template v-if="node.type === 'permission'">
              <div class="mb-3 flex items-center gap-2">
                <span class="text-xs font-medium uppercase tracking-wider text-slate-500">{{ node.data.group.entries.length }} Rules</span>
              </div>
              <div class="space-y-2">
                <div
                  v-for="(entry, i) in node.data.group.entries"
                  :key="i"
                  class="flex items-start gap-2 rounded-lg bg-slate-950 px-3 py-2.5"
                >
                  <span
                    class="mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase"
                    :class="entry.type === 'allow' ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'"
                  >
                    {{ entry.type }}
                  </span>
                  <span class="break-all font-mono text-xs leading-relaxed text-slate-300">{{ entry.pattern }}</span>
                </div>
              </div>
            </template>

            <!-- MCP Tool -->
            <template v-if="node.type === 'mcpTool'">
              <div class="space-y-3">
                <div>
                  <div class="mb-1 text-xs font-medium uppercase tracking-wider text-slate-500">Service</div>
                  <p class="text-sm font-medium text-violet-300">{{ node.data.tool.service }}</p>
                </div>
                <div>
                  <div class="mb-1 text-xs font-medium uppercase tracking-wider text-slate-500">Tool</div>
                  <p class="text-sm text-slate-300">{{ node.data.tool.tool }}</p>
                </div>
                <div>
                  <div class="mb-1 text-xs font-medium uppercase tracking-wider text-slate-500">Full Name</div>
                  <p class="break-all rounded-lg bg-slate-950 p-3 font-mono text-xs text-slate-400">{{ node.data.tool.fullName }}</p>
                </div>
              </div>
            </template>

            <!-- Category -->
            <template v-if="node.type === 'category'">
              <p class="text-sm text-slate-300">{{ node.data.label }} — {{ node.data.count }} items</p>
            </template>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active {
  transition: opacity 0.2s ease;
}
.modal-enter-active > .relative {
  transition: transform 0.2s ease, opacity 0.2s ease;
}
.modal-leave-active {
  transition: opacity 0.15s ease;
}
.modal-leave-active > .relative {
  transition: transform 0.15s ease, opacity 0.15s ease;
}

.modal-enter-from {
  opacity: 0;
}
.modal-enter-from > .relative {
  opacity: 0;
  transform: scale(0.95) translateY(10px);
}

.modal-leave-to {
  opacity: 0;
}
.modal-leave-to > .relative {
  opacity: 0;
  transform: scale(0.95) translateY(10px);
}
</style>
