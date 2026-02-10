import { join } from 'path'
import { existsSync } from 'fs'

export function getProjectPath(): string {
  const config = useRuntimeConfig()
  return config.projectPath as string
}

export function getClaudeDir(): string {
  const projectPath = getProjectPath()
  const standardPath = join(projectPath, '.claude')

  // Standard: whole project mounted, .claude/ exists inside
  if (existsSync(standardPath)) {
    return standardPath
  }

  // Direct mount: .claude/ contents are at projectPath root
  const directMountIndicators = ['settings.local.json', 'commands', 'skills', 'agents']
  const hasDirectMount = directMountIndicators.some(indicator =>
    existsSync(join(projectPath, indicator))
  )

  if (hasDirectMount) {
    return projectPath
  }

  // Fallback to standard path
  return standardPath
}

export function getClaudeMdPath(): string {
  return join(getProjectPath(), 'CLAUDE.md')
}
