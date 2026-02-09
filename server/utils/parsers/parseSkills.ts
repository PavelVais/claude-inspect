import { readFile, readdir, stat } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'
import matter from 'gray-matter'
import { getClaudeDir } from '../config'

export interface SkillData {
  name: string
  description: string
  raw: string
}

export async function parseSkills(): Promise<SkillData[]> {
  const skillsDir = join(getClaudeDir(), 'skills')

  if (!existsSync(skillsDir)) {
    return []
  }

  const entries = await readdir(skillsDir)
  const skills: SkillData[] = []

  for (const entry of entries) {
    const entryPath = join(skillsDir, entry)
    const entryStat = await stat(entryPath)

    if (!entryStat.isDirectory()) continue

    const skillFile = join(entryPath, 'SKILL.md')
    if (!existsSync(skillFile)) continue

    const content = await readFile(skillFile, 'utf-8')
    const { data: frontmatter } = matter(content)

    const name = (frontmatter.name as string) || entry
    const description = (frontmatter.description as string) || ''

    skills.push({ name, description, raw: content })
  }

  return skills
}
