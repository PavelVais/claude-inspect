export interface McpToolData {
  fullName: string
  service: string
  tool: string
}

export function parseMcpTools(mcpEntries: string[]): McpToolData[] {
  return mcpEntries.map((entry) => {
    // Pattern: mcp__serviceName__toolName or mcp__serviceName__toolName(args)
    const cleaned = entry.replace(/\(.*\)$/, '')
    const parts = cleaned.split('__')

    const service = parts[1] || 'unknown'
    const tool = parts.slice(2).join('__') || entry

    return { fullName: entry, service, tool }
  })
}
