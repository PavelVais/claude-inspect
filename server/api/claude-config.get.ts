export default defineEventHandler(async () => {
  const [claudeMd, settings, commands, skills, agents, todos] = await Promise.all([
    parseClaudeMd(),
    parseSettings(),
    parseCommands(),
    parseSkills(),
    parseAgents(),
    parseTodos(),
  ])

  const mcpTools = parseMcpTools(settings.mcpTools)
  const crossReferences = parseCrossReferences(skills, commands, agents)

  return {
    project: {
      name: claudeMd.projectName,
      overview: claudeMd.overview,
    },
    skills,
    commands,
    agents,
    permissions: settings.permissions,
    mcpTools,
    hooks: settings.hooks,
    todos,
    crossReferences,
  }
})
