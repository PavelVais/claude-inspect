import { reactive, ref } from 'vue'
import type { CategoryType } from '~/types/graph'

const DEFAULT_VISIBILITY: Record<CategoryType, boolean> = {
  skills: true,
  commands: true,
  agents: true,
  permissions: true,
  mcpTools: true,
  hooks: false,
  todos: false,
}

export function useSectionToggle() {
  const visibleSections = reactive<Record<CategoryType, boolean>>({ ...DEFAULT_VISIBILITY })
  const showCrossRefs = ref<boolean>(false)

  function toggle(category: CategoryType): void {
    visibleSections[category] = !visibleSections[category]
  }

  function toggleCrossRefs(): void {
    showCrossRefs.value = !showCrossRefs.value
  }

  return { visibleSections, showCrossRefs, toggle, toggleCrossRefs }
}
