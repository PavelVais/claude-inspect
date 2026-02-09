import { join } from 'path'

export function getProjectPath(): string {
  const config = useRuntimeConfig()
  return config.projectPath as string
}

export function getClaudeDir(): string {
  return join(getProjectPath(), '.claude')
}

export function getClaudeMdPath(): string {
  return join(getProjectPath(), 'CLAUDE.md')
}
