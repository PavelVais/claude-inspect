import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'
import { getClaudeDir } from '../config'

export interface TodoData {
  id: string
  subject: string
  description: string
  status: 'pending' | 'in_progress' | 'completed'
  activeForm?: string
}

export async function parseTodos(): Promise<TodoData[]> {
  const todosPath = join(getClaudeDir(), 'todos.json')

  if (!existsSync(todosPath)) {
    return []
  }

  try {
    const content = await readFile(todosPath, 'utf-8')
    const data = JSON.parse(content)

    if (!Array.isArray(data)) {
      return []
    }

    return data.map((item: Record<string, unknown>) => ({
      id: String(item.id || ''),
      subject: String(item.subject || ''),
      description: String(item.description || ''),
      status: (['pending', 'in_progress', 'completed'].includes(item.status as string)
        ? item.status
        : 'pending') as TodoData['status'],
      ...(item.activeForm ? { activeForm: String(item.activeForm) } : {}),
    }))
  } catch {
    return []
  }
}
