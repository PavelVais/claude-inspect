export interface ProjectInfo {
  name: string
  overview: string
}

export interface SkillData {
  name: string
  description: string
  raw: string
}

export interface CommandData {
  name: string
  title: string
  description: string
  raw: string
}

export interface PermissionEntry {
  type: 'allow' | 'deny'
  pattern: string
}

export interface PermissionGroup {
  category: string
  entries: PermissionEntry[]
}

export interface AgentData {
  name: string
  title: string
  description: string
  raw: string
}

export interface McpToolData {
  fullName: string
  service: string
  tool: string
}

export interface ClaudeConfig {
  project: ProjectInfo
  skills: SkillData[]
  commands: CommandData[]
  agents: AgentData[]
  permissions: PermissionGroup[]
  mcpTools: McpToolData[]
}
