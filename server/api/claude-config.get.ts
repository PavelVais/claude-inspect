export default defineEventHandler(async () => {
  const [claudeMd, settings, commands, skills, agents] = await Promise.all([
    parseClaudeMd(),
    parseSettings(),
    parseCommands(),
    parseSkills(),
    parseAgents(),
  ])

  const mcpTools = parseMcpTools(settings.mcpTools)

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
  }
})
