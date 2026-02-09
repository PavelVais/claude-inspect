import { readFile, readdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'
import { getClaudeDir } from '../config'

export interface AgentData {
  name: string
  title: string
  description: string
  raw: string
}

export async function parseAgents(): Promise<AgentData[]> {
  const agentsDir = join(getClaudeDir(), 'agents')

  if (!existsSync(agentsDir)) {
    return []
  }

  const files = await readdir(agentsDir)
  const mdFiles = files.filter((f) => f.endsWith('.md'))

  const agents: AgentData[] = []

  for (const file of mdFiles) {
    const content = await readFile(join(agentsDir, file), 'utf-8')
    const name = file.replace(/\.md$/, '')

    // Extract title from first # heading
    const titleMatch = content.match(/^#\s+(.+)$/m)
    const title = titleMatch ? titleMatch[1].trim() : name

    // Extract description: first non-empty, non-heading line
    const lines = content.split('\n')
    let description = ''
    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith('#')) {
        description = trimmed
        break
      }
    }

    agents.push({ name, title, description, raw: content })
  }

  return agents
}
