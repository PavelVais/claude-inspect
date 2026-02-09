import { readFile, readdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'
import matter from 'gray-matter'
import { getClaudeDir } from '../config'

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

function parseCommaSeparated(value: unknown): string[] | undefined {
  if (Array.isArray(value)) return value.map(String)
  if (typeof value === 'string') return value.split(',').map(s => s.trim()).filter(Boolean)
  return undefined
}

export async function parseAgents(): Promise<AgentData[]> {
  const agentsDir = join(getClaudeDir(), 'agents')

  if (!existsSync(agentsDir)) {
    return []
  }

  const files = await readdir(agentsDir)
  const mdFiles = files.filter((f: string) => f.endsWith('.md'))

  const agents: AgentData[] = []

  for (const file of mdFiles) {
    const content = await readFile(join(agentsDir, file), 'utf-8')
    const name = file.replace(/\.md$/, '')

    const { data: fm, content: body } = matter(content)
    const hasFrontmatter = Object.keys(fm).length > 0

    let title: string
    let description: string

    if (hasFrontmatter) {
      // Use frontmatter name/description, fall back to heading/body extraction
      title = (fm.name as string) || extractHeading(body) || name
      description = (fm.description as string) || extractFirstLine(body)
    } else {
      // Legacy: no frontmatter, extract from plain markdown
      title = extractHeading(content) || name
      description = extractFirstLine(content)
    }

    const agent: AgentData = { name, title, description, raw: content }

    if (hasFrontmatter) {
      const tools = parseCommaSeparated(fm.tools)
      if (tools) agent.tools = tools

      const disallowedTools = parseCommaSeparated(fm.disallowedTools)
      if (disallowedTools) agent.disallowedTools = disallowedTools

      if (fm.model) agent.model = String(fm.model)
      if (fm.permissionMode) agent.permissionMode = String(fm.permissionMode)
      if (typeof fm.maxTurns === 'number') agent.maxTurns = fm.maxTurns

      const skills = parseCommaSeparated(fm.skills)
      if (skills) agent.skills = skills

      const mcpServers = parseCommaSeparated(fm.mcpServers)
      if (mcpServers) agent.mcpServers = mcpServers

      if (fm.hooks && typeof fm.hooks === 'object') agent.hooks = fm.hooks as Record<string, unknown>
      if (fm.memory) agent.memory = String(fm.memory)
    }

    agents.push(agent)
  }

  return agents
}

function extractHeading(text: string): string | undefined {
  const match = text.match(/^#\s+(.+)$/m)
  return match?.[1]?.trim()
}

function extractFirstLine(text: string): string {
  const lines = text.split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#')) {
      return trimmed
    }
  }
  return ''
}
