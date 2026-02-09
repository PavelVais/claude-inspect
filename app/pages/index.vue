<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import type { Node, Edge } from '@vue-flow/core'
import type { CategoryType } from '~/types/graph'
import { useGraphData } from '~/composables/useGraphData'
import { useGraphSearch } from '~/composables/useGraphSearch'
import { useSectionToggle } from '~/composables/useSectionToggle'
import { useNodeExpansion } from '~/composables/useNodeExpansion'

const { nodes, edges, config, loading, error, fetchAndBuild, rebuildGraph } = useGraphData()
const { searchQuery, getFilteredNodeIds } = useGraphSearch()
const { visibleSections, showCrossRefs, toggle, toggleCrossRefs } = useSectionToggle()
const { expandedNodes, collapseAll } = useNodeExpansion()
const selectedNode = ref<Node | null>(null)
const headerRef = ref<InstanceType<typeof import('~/components/ui/AppHeader.vue').default> | null>(null)

const availableSections = computed<CategoryType[]>(() => {
  if (!config.value) return []
  const sections: { type: CategoryType; items: unknown[] }[] = [
    { type: 'skills', items: config.value.skills },
    { type: 'commands', items: config.value.commands },
    { type: 'agents', items: config.value.agents },
    { type: 'hooks', items: config.value.hooks },
    { type: 'todos', items: config.value.todos },
    { type: 'mcpTools', items: config.value.mcpTools },
    { type: 'permissions', items: config.value.permissions },
  ]
  return sections.filter((s) => s.items.length > 0).map((s) => s.type)
})

function onToggleSection(category: CategoryType): void {
  toggle(category)
  rebuildGraph(visibleSections, showCrossRefs.value)
}

function onToggleCrossRefs(): void {
  toggleCrossRefs()
  rebuildGraph(visibleSections, showCrossRefs.value)
}

watch(expandedNodes, () => {
  rebuildGraph(visibleSections, showCrossRefs.value)
})

function onRefresh(): void {
  collapseAll()
  fetchAndBuild(visibleSections, showCrossRefs.value)
}

const styledNodes = computed<Node[]>(() => {
  const filtered = getFilteredNodeIds(nodes.value)

  return nodes.value.map((node) => ({
    ...node,
    style: !filtered || filtered.has(node.id)
      ? { opacity: 1, pointerEvents: 'auto' }
      : { opacity: 0.15, pointerEvents: 'none' },
  }))
})

const styledEdges = computed<Edge[]>(() => {
  const filtered = getFilteredNodeIds(nodes.value)

  return edges.value.map((edge) => ({
    ...edge,
    style: !filtered || (filtered.has(edge.source) && filtered.has(edge.target))
      ? { opacity: 1 }
      : { opacity: 0.08 },
  }))
})

function onNodeClick(node: Node): void {
  selectedNode.value = node
}

function closePanel(): void {
  selectedNode.value = null
}

function onGlobalKeydown(e: KeyboardEvent): void {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    headerRef.value?.focusSearch()
  }
}

onMounted(() => {
  fetchAndBuild(visibleSections, showCrossRefs.value)
  window.addEventListener('keydown', onGlobalKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onGlobalKeydown)
})
</script>

<template>
  <div class="flex h-screen flex-col">
    <UiAppHeader
      ref="headerRef"
      :project-name="config?.project.name || 'Claude Inspect'"
      :search-query="searchQuery"
      :visible-sections="visibleSections"
      :available-sections="availableSections"
      :show-cross-refs="showCrossRefs"
      :has-cross-refs="(config?.crossReferences.length ?? 0) > 0"
      @refresh="onRefresh"
      @update:search-query="searchQuery = $event"
      @toggle-section="onToggleSection"
      @toggle-cross-refs="onToggleCrossRefs"
    />

    <div class="relative flex-1">
      <UiLoadingOverlay v-if="loading" />
      <UiErrorOverlay v-else-if="error" :message="error" @retry="fetchAndBuild" />

      <ClientOnly>
        <GraphInspectGraph
          :nodes="styledNodes"
          :edges="styledEdges"
          @node-click="onNodeClick"
        />
      </ClientOnly>

      <UiNodeDetailPanel
        :node="selectedNode"
        @close="closePanel"
      />
    </div>
  </div>
</template>
