import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'
import { getClaudeDir } from '../config'

export interface PermissionEntry {
  type: 'allow' | 'deny'
  pattern: string
}

export interface PermissionGroup {
  category: string
  entries: PermissionEntry[]
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

export interface SettingsData {
  permissions: PermissionGroup[]
  mcpTools: string[]
  hooks: HookEventGroup[]
  raw: Record<string, unknown>
}

function categorizePermission(pattern: string): string {
  if (pattern.startsWith('Bash(')) return 'Bash'
  if (pattern.startsWith('WebFetch') || pattern.startsWith('WebSearch')) return 'Web'
  if (pattern.startsWith('Read') || pattern.startsWith('Write') || pattern.startsWith('Edit')) return 'FileSystem'
  if (pattern.startsWith('mcp__')) return 'MCP'
  if (pattern.startsWith('Grep') || pattern.startsWith('Glob')) return 'Search'
  if (pattern.startsWith('Notebook')) return 'Notebook'
  return 'Other'
}

export async function parseSettings(): Promise<SettingsData> {
  const settingsPath = join(getClaudeDir(), 'settings.local.json')

  if (!existsSync(settingsPath)) {
    return { permissions: [], mcpTools: [], hooks: [], raw: {} }
  }

  const content = await readFile(settingsPath, 'utf-8')
  const settings = JSON.parse(content) as Record<string, unknown>

  const rawPerms = settings.permissions as { allow?: string[]; deny?: string[] } | undefined
  const allowList = rawPerms?.allow ?? []
  const denyList = rawPerms?.deny ?? []

  // Collect MCP tools
  const mcpTools: string[] = []
  const permEntries: PermissionEntry[] = []

  for (const pattern of allowList) {
    if (pattern.startsWith('mcp__')) {
      mcpTools.push(pattern)
    }
    permEntries.push({ type: 'allow', pattern })
  }

  for (const pattern of denyList) {
    permEntries.push({ type: 'deny', pattern })
  }

  // Group by category
  const groupMap = new Map<string, PermissionEntry[]>()
  for (const entry of permEntries) {
    if (entry.pattern.startsWith('mcp__')) continue // handled separately
    const cat = categorizePermission(entry.pattern)
    if (!groupMap.has(cat)) groupMap.set(cat, [])
    groupMap.get(cat)!.push(entry)
  }

  const permissions: PermissionGroup[] = Array.from(groupMap.entries()).map(
    ([category, entries]) => ({ category, entries }),
  )

  // Parse hooks
  const hooks: HookEventGroup[] = []
  const rawHooks = settings.hooks as Record<string, unknown[]> | undefined
  if (rawHooks && typeof rawHooks === 'object') {
    for (const [event, matcherList] of Object.entries(rawHooks)) {
      if (!Array.isArray(matcherList)) continue
      const matchers: HookMatcher[] = []
      let totalHandlers = 0
      for (const entry of matcherList) {
        const m = entry as Record<string, unknown>
        const matcher = (m.matcher as string) || '*'
        const hookHandlers = (m.hooks as HookHandler[]) || []
        totalHandlers += hookHandlers.length
        matchers.push({ matcher, hooks: hookHandlers })
      }
      hooks.push({ event, matchers, totalHandlers })
    }
  }

  return { permissions, mcpTools, hooks, raw: settings }
}
