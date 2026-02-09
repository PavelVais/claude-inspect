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

export interface SettingsData {
  permissions: PermissionGroup[]
  mcpTools: string[]
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
    return { permissions: [], mcpTools: [], raw: {} }
  }

  const content = await readFile(settingsPath, 'utf-8')
  const settings = JSON.parse(content) as Record<string, unknown>

  const allowList = (settings.permissions?.allow ?? []) as string[]
  const denyList = (settings.permissions?.deny ?? []) as string[]

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

  return { permissions, mcpTools, raw: settings }
}
