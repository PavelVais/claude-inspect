import type { SkillData } from './parseSkills'
import type { CommandData } from './parseCommands'
import type { AgentData } from './parseAgents'

export interface CrossReference {
  fromType: 'skill' | 'command' | 'agent'
  fromIndex: number
  toType: 'skill' | 'command' | 'agent'
  toIndex: number
}

export function parseCrossReferences(
  skills: SkillData[],
  commands: CommandData[],
  agents: AgentData[],
): CrossReference[] {
  const refs: CrossReference[] = []
  const seen = new Set<string>()

  function addRef(ref: CrossReference) {
    const key = `${ref.fromType}-${ref.fromIndex}-${ref.toType}-${ref.toIndex}`
    if (seen.has(key)) return
    // Don't self-reference
    if (ref.fromType === ref.toType && ref.fromIndex === ref.toIndex) return
    seen.add(key)
    refs.push(ref)
  }

  function contentMentions(content: string, name: string): boolean {
    // Names without hyphens/underscores are likely common words (e.g. "check", "release")
    // Only match those if they appear with / prefix or in quotes
    const isSimpleName = !/[-_]/.test(name)
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

    if (isSimpleName) {
      // Require / prefix, backticks, or quotes for simple names
      const strictRe = new RegExp(`(?:\\/|["'\`])${escaped}(?:["'\`]|\\b)`, 'i')
      return strictRe.test(content)
    }

    // Hyphenated names are specific enough for word-boundary match
    const re = new RegExp(`\\b${escaped}\\b`, 'i')
    return re.test(content)
  }

  // Skills referencing other skills (by name)
  for (const [si, skill] of skills.entries()) {
    for (const [si2, skill2] of skills.entries()) {
      if (si === si2) continue
      if (contentMentions(skill.raw, skill2.name)) {
        addRef({ fromType: 'skill', fromIndex: si, toType: 'skill', toIndex: si2 })
      }
    }
  }

  // Skills referencing agents
  for (const [si, skill] of skills.entries()) {
    for (const [ai, agent] of agents.entries()) {
      if (contentMentions(skill.raw, agent.name)) {
        addRef({ fromType: 'skill', fromIndex: si, toType: 'agent', toIndex: ai })
      }
    }
  }

  // Commands referencing agents
  for (const [ci, command] of commands.entries()) {
    for (const [ai, agent] of agents.entries()) {
      if (contentMentions(command.raw, agent.name)) {
        addRef({ fromType: 'command', fromIndex: ci, toType: 'agent', toIndex: ai })
      }
    }
  }

  // Skills referencing commands (by name)
  for (const [si, skill] of skills.entries()) {
    for (const [ci, command] of commands.entries()) {
      if (contentMentions(skill.raw, command.name) || contentMentions(skill.raw, `/${command.name}`)) {
        addRef({ fromType: 'skill', fromIndex: si, toType: 'command', toIndex: ci })
      }
    }
  }

  // Commands referencing skills (by name)
  for (const [ci, command] of commands.entries()) {
    for (const [si, skill] of skills.entries()) {
      if (contentMentions(command.raw, skill.name)) {
        addRef({ fromType: 'command', fromIndex: ci, toType: 'skill', toIndex: si })
      }
    }
  }

  // Commands referencing other commands (by name)
  for (const [ci, command] of commands.entries()) {
    for (const [ci2, command2] of commands.entries()) {
      if (ci === ci2) continue
      if (contentMentions(command.raw, command2.name)) {
        addRef({ fromType: 'command', fromIndex: ci, toType: 'command', toIndex: ci2 })
      }
    }
  }

  // Agents referencing other agents (by name)
  for (const [ai, agent] of agents.entries()) {
    for (const [ai2, agent2] of agents.entries()) {
      if (ai === ai2) continue
      if (contentMentions(agent.raw, agent2.name)) {
        addRef({ fromType: 'agent', fromIndex: ai, toType: 'agent', toIndex: ai2 })
      }
    }
  }

  // Agents referencing skills or commands
  for (const [ai, agent] of agents.entries()) {
    for (const [si, skill] of skills.entries()) {
      if (contentMentions(agent.raw, skill.name)) {
        addRef({ fromType: 'agent', fromIndex: ai, toType: 'skill', toIndex: si })
      }
    }
    for (const [ci, command] of commands.entries()) {
      if (contentMentions(agent.raw, command.name)) {
        addRef({ fromType: 'agent', fromIndex: ai, toType: 'command', toIndex: ci })
      }
    }
  }

  return refs
}
