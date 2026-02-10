import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import { basename, resolve } from 'path'
import { getClaudeMdPath, getProjectPath } from '../config'

function getEnvProjectName(): string {
  return process.env.PROJECT_NAME || ''
}

export interface ClaudeMdData {
  projectName: string
  overview: string
  raw: string
}

export async function parseClaudeMd(): Promise<ClaudeMdData> {
  const path = getClaudeMdPath()

  if (!existsSync(path)) {
    const envName = getEnvProjectName()
    return { projectName: envName || 'Unknown Project', overview: '', raw: '' }
  }

  const content = await readFile(path, 'utf-8')

  // Extract project name from first heading
  const nameMatch = content.match(/^#\s+(.+)$/m)
  const heading = nameMatch?.[1] ? nameMatch[1].trim() : ''
  const isGenericHeading = !heading || /^claude\.?md$/i.test(heading)

  // Priority: PROJECT_NAME env > CLAUDE.md heading > directory name
  const envName = getEnvProjectName()
  let projectName = envName || heading
  if (!projectName || isGenericHeading && !envName) {
    const dirName = basename(resolve(getProjectPath()))
    projectName = (dirName && dirName !== 'inspect') ? dirName : 'Unknown Project'
  }

  // Extract overview from ## Project Overview section
  let overview = ''
  const overviewMatch = content.match(/##\s+Project Overview\s*\n([\s\S]*?)(?=\n##\s|\n$|$)/)
  if (overviewMatch) {
    overview = overviewMatch[1]?.trim().split('\n').slice(0, 5).join('\n') ?? ''
  }

  return { projectName, overview, raw: content }
}
