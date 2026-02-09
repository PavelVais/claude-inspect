<script setup lang="ts">
import { computed, watch, onBeforeUnmount, type Component } from 'vue'
import type { Node } from '@vue-flow/core'
import IconProject from '~/components/icons/IconProject.vue'
import IconSkill from '~/components/icons/IconSkill.vue'
import IconCommand from '~/components/icons/IconCommand.vue'
import IconAgent from '~/components/icons/IconAgent.vue'
import IconPermission from '~/components/icons/IconPermission.vue'
import IconMcpTool from '~/components/icons/IconMcpTool.vue'
import IconHook from '~/components/icons/IconHook.vue'
import IconTodo from '~/components/icons/IconTodo.vue'

const props = defineProps<{
  node: Node | null
}>()

const emit = defineEmits<{
  close: []
}>()

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    emit('close')
  }
}

watch(() => props.node, (val) => {
  if (val) {
    window.addEventListener('keydown', onKeydown)
  } else {
    window.removeEventListener('keydown', onKeydown)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
})

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
    case 'permissionEntry': return `${d.entry.type === 'allow' ? 'Allow' : 'Deny'} Rule`
    case 'mcpTool': return `${d.tool.service} / ${d.tool.tool}`
    case 'hook': return `${d.hookGroup.event} Hooks`
    case 'todo': return d.todo.subject
    default: return 'Details'
  }
})

const sortedPermissions = computed<import('~/types/claude-config').PermissionEntry[]>(() => {
  if (!props.node || props.node.type !== 'permission') return []
  return [...props.node.data.group.entries].sort((a: import('~/types/claude-config').PermissionEntry, b: import('~/types/claude-config').PermissionEntry) =>
    a.type === b.type ? 0 : a.type === 'deny' ? -1 : 1
  )
})

const iconMap: Record<string, Component> = {
  project: IconProject,
  skill: IconSkill,
  command: IconCommand,
  agent: IconAgent,
  permission: IconPermission,
  mcpTool: IconMcpTool,
  hook: IconHook,
  todo: IconTodo,
  permissionEntry: IconPermission,
  skills: IconSkill,
  commands: IconCommand,
  agents: IconAgent,
  permissions: IconPermission,
  mcpTools: IconMcpTool,
  hooks: IconHook,
  todos: IconTodo,
}

const iconComponent = computed<Component>(() => {
  if (!props.node) return IconProject
  const key = props.node.type === 'category' ? props.node.data.category : props.node.type
  return iconMap[key] || IconProject
})

const accentColor = computed<string>(() => {
  if (!props.node) return '#3b82f6'
  switch (props.node.type) {
    case 'project':
    case 'skill': return '#3b82f6'
    case 'command': return '#22c55e'
    case 'agent': return '#06b6d4'
    case 'permission': return '#f59e0b'
    case 'permissionEntry': return '#f59e0b'
    case 'mcpTool': return '#8b5cf6'
    case 'hook': return '#f43f5e'
    case 'todo': return '#f97316'
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
        <div class="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-900 shadow-2xl">
          <!-- Accent top bar -->
          <div class="h-1" :style="{ background: `linear-gradient(90deg, ${accentColor}, ${accentColor}80)` }"></div>

          <!-- Header -->
          <div class="flex items-start justify-between px-6 pt-5 pb-0">
            <div class="flex items-center gap-3">
              <div
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                :style="{ backgroundColor: accentColor + '20', color: accentColor }"
              >
                <component :is="iconComponent" class="h-5 w-5" />
              </div>
              <div>
                <h3 class="text-base font-semibold text-white">{{ title }}</h3>
                <span
                  v-if="node.type !== 'project' && node.type !== 'category'"
                  class="mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider"
                  :style="{ backgroundColor: accentColor + '20', color: accentColor }"
                >
                  {{ node.type === 'mcpTool' ? 'MCP Tool' : node.type === 'hook' ? 'Hook' : node.type === 'todo' ? 'Todo' : node.type === 'permissionEntry' ? 'Permission Entry' : node.type }}
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
          <div class="dark-scrollbar max-h-[60vh] overflow-y-auto px-6 pt-4 pb-6">
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
              <pre class="dark-scrollbar max-h-64 overflow-auto rounded-xl bg-slate-950 p-4 text-xs leading-relaxed text-slate-400">{{ node.data.skill.raw }}</pre>
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
              <pre class="dark-scrollbar max-h-64 overflow-auto rounded-xl bg-slate-950 p-4 text-xs leading-relaxed text-slate-400">{{ node.data.command.raw }}</pre>
            </template>

            <!-- Agent -->
            <template v-if="node.type === 'agent'">
              <div class="mb-3">
                <span class="rounded-md bg-cyan-500/15 px-2.5 py-1 font-mono text-xs text-cyan-400">{{ node.data.agent.name }}</span>
              </div>
              <div class="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">Description</div>
              <p class="text-sm leading-relaxed text-slate-300">{{ node.data.agent.description || 'No description.' }}</p>

              <!-- Metadata badges -->
              <div
                v-if="node.data.agent.model || node.data.agent.permissionMode || node.data.agent.maxTurns || node.data.agent.memory"
                class="mt-4 flex flex-wrap gap-1.5"
              >
                <span v-if="node.data.agent.model" class="rounded-full bg-cyan-500/15 px-2.5 py-0.5 text-xs font-medium text-cyan-400">
                  model: {{ node.data.agent.model }}
                </span>
                <span v-if="node.data.agent.permissionMode" class="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-medium text-amber-400">
                  {{ node.data.agent.permissionMode }}
                </span>
                <span v-if="node.data.agent.maxTurns" class="rounded-full bg-slate-500/20 px-2.5 py-0.5 text-xs font-medium text-slate-400">
                  {{ node.data.agent.maxTurns }} turns
                </span>
                <span v-if="node.data.agent.memory" class="rounded-full bg-purple-500/15 px-2.5 py-0.5 text-xs font-medium text-purple-400">
                  memory: {{ node.data.agent.memory }}
                </span>
              </div>

              <!-- Tools -->
              <template v-if="node.data.agent.tools?.length">
                <div class="mt-4 mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">Tools</div>
                <div class="flex flex-wrap gap-1.5">
                  <span
                    v-for="tool in node.data.agent.tools"
                    :key="tool"
                    class="rounded bg-green-500/15 px-2 py-0.5 font-mono text-xs text-green-400"
                  >
                    {{ tool }}
                  </span>
                </div>
              </template>

              <!-- Disallowed Tools -->
              <template v-if="node.data.agent.disallowedTools?.length">
                <div class="mt-4 mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">Disallowed Tools</div>
                <div class="flex flex-wrap gap-1.5">
                  <span
                    v-for="tool in node.data.agent.disallowedTools"
                    :key="tool"
                    class="rounded bg-red-500/15 px-2 py-0.5 font-mono text-xs text-red-400 line-through"
                  >
                    {{ tool }}
                  </span>
                </div>
              </template>

              <!-- Skills -->
              <template v-if="node.data.agent.skills?.length">
                <div class="mt-4 mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">Skills</div>
                <div class="flex flex-wrap gap-1.5">
                  <span
                    v-for="skill in node.data.agent.skills"
                    :key="skill"
                    class="rounded bg-blue-500/15 px-2 py-0.5 font-mono text-xs text-blue-400"
                  >
                    {{ skill }}
                  </span>
                </div>
              </template>

              <!-- MCP Servers -->
              <template v-if="node.data.agent.mcpServers?.length">
                <div class="mt-4 mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">MCP Servers</div>
                <div class="flex flex-wrap gap-1.5">
                  <span
                    v-for="server in node.data.agent.mcpServers"
                    :key="server"
                    class="rounded bg-violet-500/15 px-2 py-0.5 font-mono text-xs text-violet-400"
                  >
                    {{ server }}
                  </span>
                </div>
              </template>

              <!-- Hooks -->
              <template v-if="node.data.agent.hooks">
                <div class="mt-4 mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">Hooks</div>
                <pre class="dark-scrollbar max-h-40 overflow-auto rounded-xl bg-slate-950 p-3 text-xs leading-relaxed text-slate-400">{{ JSON.stringify(node.data.agent.hooks, null, 2) }}</pre>
              </template>

              <div class="mt-5 mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">Source</div>
              <pre class="dark-scrollbar max-h-64 overflow-auto rounded-xl bg-slate-950 p-4 text-xs leading-relaxed text-slate-400">{{ node.data.agent.raw }}</pre>
            </template>

            <!-- Permission Group -->
            <template v-if="node.type === 'permission'">
              <div class="mb-3 flex items-center gap-2">
                <span class="text-xs font-medium uppercase tracking-wider text-slate-500">{{ node.data.group.entries.length }} Rules</span>
              </div>
              <div class="space-y-2">
                <div
                  v-for="(entry, i) in sortedPermissions"
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

            <!-- Hook -->
            <template v-if="node.type === 'hook'">
              <div class="mb-3 flex items-center gap-2">
                <span class="text-xs font-medium uppercase tracking-wider text-slate-500">{{ node.data.hookGroup.totalHandlers }} Handlers</span>
                <span class="text-xs text-slate-600">across {{ node.data.hookGroup.matchers.length }} matchers</span>
              </div>
              <div class="space-y-3">
                <div
                  v-for="(matcher, mi) in node.data.hookGroup.matchers"
                  :key="mi"
                  class="rounded-xl bg-slate-950 p-3"
                >
                  <div class="mb-2 flex items-center gap-2">
                    <span class="rounded bg-rose-500/15 px-2 py-0.5 font-mono text-xs text-rose-400">{{ matcher.matcher }}</span>
                  </div>
                  <div class="space-y-2">
                    <div
                      v-for="(handler, hi) in matcher.hooks"
                      :key="hi"
                      class="rounded-lg bg-slate-900 px-3 py-2"
                    >
                      <div class="mb-1 flex flex-wrap items-center gap-1.5">
                        <span
                          class="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase"
                          :class="{
                            'bg-blue-500/15 text-blue-400': handler.type === 'command',
                            'bg-purple-500/15 text-purple-400': handler.type === 'prompt',
                            'bg-cyan-500/15 text-cyan-400': handler.type === 'agent',
                          }"
                        >
                          {{ handler.type }}
                        </span>
                        <span v-if="handler.async" class="rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-medium text-amber-400">async</span>
                        <span v-if="handler.once" class="rounded bg-slate-500/15 px-1.5 py-0.5 text-[10px] font-medium text-slate-400">once</span>
                        <span v-if="handler.timeout" class="rounded bg-slate-500/15 px-1.5 py-0.5 text-[10px] font-medium text-slate-400">{{ handler.timeout }}s</span>
                      </div>
                      <p v-if="handler.command" class="break-all font-mono text-xs leading-relaxed text-slate-300">{{ handler.command }}</p>
                      <p v-if="handler.prompt" class="text-xs leading-relaxed text-slate-300">{{ handler.prompt }}</p>
                      <p v-if="handler.statusMessage" class="mt-1 text-xs italic text-slate-500">{{ handler.statusMessage }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </template>

            <!-- Todo -->
            <template v-if="node.type === 'todo'">
              <div class="mb-3 flex items-center gap-2">
                <span
                  class="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
                  :class="{
                    'bg-slate-500/15 text-slate-400': node.data.todo.status === 'pending',
                    'bg-orange-500/15 text-orange-400': node.data.todo.status === 'in_progress',
                    'bg-green-500/15 text-green-400': node.data.todo.status === 'completed',
                  }"
                >
                  {{ node.data.todo.status === 'in_progress' ? 'in progress' : node.data.todo.status }}
                </span>
              </div>
              <p v-if="node.data.todo.activeForm" class="mb-3 text-sm italic text-orange-300/70">{{ node.data.todo.activeForm }}</p>
              <div class="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">Description</div>
              <p class="whitespace-pre-wrap text-sm leading-relaxed text-slate-300">{{ node.data.todo.description || 'No description.' }}</p>
            </template>

            <!-- Permission Entry -->
            <template v-if="node.type === 'permissionEntry'">
              <div class="flex items-center gap-2">
                <span
                  class="shrink-0 rounded px-2 py-0.5 text-xs font-bold uppercase"
                  :class="node.data.entry.type === 'allow' ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'"
                >
                  {{ node.data.entry.type }}
                </span>
              </div>
              <div class="mt-3 mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">Pattern</div>
              <p class="break-all rounded-lg bg-slate-950 p-3 font-mono text-xs text-slate-300">{{ node.data.entry.pattern }}</p>
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
