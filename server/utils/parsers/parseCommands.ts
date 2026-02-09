import { readFile, readdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'
import { getClaudeDir } from '../config'

export interface CommandData {
  name: string
  title: string
  description: string
  raw: string
}

export async function parseCommands(): Promise<CommandData[]> {
  const commandsDir = join(getClaudeDir(), 'commands')

  if (!existsSync(commandsDir)) {
    return []
  }

  const files = await readdir(commandsDir)
  const mdFiles = files.filter((f) => f.endsWith('.md'))

  const commands: CommandData[] = []

  for (const file of mdFiles) {
    const content = await readFile(join(commandsDir, file), 'utf-8')
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

    commands.push({ name, title, description, raw: content })
  }

  return commands
}
