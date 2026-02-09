import type { SkillData, CommandData, AgentData, PermissionGroup, McpToolData } from './claude-config'

export type CategoryType = 'skills' | 'commands' | 'agents' | 'permissions' | 'mcpTools'

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
}

export interface PermissionNodeData {
  group: PermissionGroup
}

export interface McpToolNodeData {
  tool: McpToolData
}
