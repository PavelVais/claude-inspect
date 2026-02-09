import type { SkillData, CommandData, AgentData, PermissionGroup, PermissionEntry, McpToolData, HookEventGroup, TodoData } from './claude-config'

export type CategoryType = 'skills' | 'commands' | 'agents' | 'permissions' | 'mcpTools' | 'hooks' | 'todos'

export interface ProjectNodeData {
  name: string
  overview: string
}

export interface CategoryNodeData {
  category: CategoryType
  label: string
  count: number
  color: string
}

export interface SkillNodeData {
  skill: SkillData
}

export interface CommandNodeData {
  command: CommandData
}

export interface AgentNodeData {
  agent: AgentData
  crossRefCount: number
}

export interface PermissionNodeData {
  group: PermissionGroup
}

export interface McpToolNodeData {
  tool: McpToolData
}

export interface HookNodeData {
  hookGroup: HookEventGroup
}

export interface TodoNodeData {
  todo: TodoData
}

export interface PermissionEntryNodeData {
  entry: PermissionEntry
  parentId: string
}