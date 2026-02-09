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
  tools?: string[]
  disallowedTools?: string[]
  model?: string
  permissionMode?: string
  maxTurns?: number
  skills?: string[]
  mcpServers?: string[]
  hooks?: Record<string, unknown>
  memory?: string
}

export interface McpToolData {
  fullName: string
  service: string
  tool: string
}

export interface HookHandler {
  type: 'command' | 'prompt' | 'agent'
  command?: string
  prompt?: string
  timeout?: number
  statusMessage?: string
  async?: boolean
  once?: boolean
  model?: string
}

export interface HookMatcher {
  matcher: string
  hooks: HookHandler[]
}

export interface HookEventGroup {
  event: string
  matchers: HookMatcher[]
  totalHandlers: number
}

export interface TodoData {
  id: string
  subject: string
  description: string
  status: 'pending' | 'in_progress' | 'completed'
  activeForm?: string
}

export interface CrossReference {
  fromType: 'skill' | 'command' | 'agent'
  fromIndex: number
  toType: 'skill' | 'command' | 'agent'
  toIndex: number
}

export interface ClaudeConfig {
  project: ProjectInfo
  skills: SkillData[]
  commands: CommandData[]
  agents: AgentData[]
  permissions: PermissionGroup[]
  mcpTools: McpToolData[]
  hooks: HookEventGroup[]
  todos: TodoData[]
  crossReferences: CrossReference[]
}
