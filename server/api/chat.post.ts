import { searchKnowledgeGraph, getChapterByPath, getAllPeople, getAllTopics, getAllLocations, loadIndex } from '../utils/search-graph'

const MAX_TOOL_ROUNDS = 5

const tools = [
  {
    type: 'function',
    function: {
      name: 'search_bible',
      description: 'Search the Bible knowledge graph by keywords. Returns chapters matching people, topics, locations, or events. Use this when you need to find relevant chapters for a question.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search query — a person name, topic, location, event, or general question' },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_chapter',
      description: 'Get the full metadata for a specific Bible chapter including people, topics, locations, events, key verses, and cross-references. Use the chapter path like /docs/old-testament/genesis/chapter-1',
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'The chapter path, e.g. /docs/old-testament/genesis/chapter-1' },
        },
        required: ['path'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'find_person_chapters',
      description: 'Find all Bible chapters where a specific person appears. Returns chapter titles and paths.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'The person name, e.g. Moses, David, Jesus, Paul' },
        },
        required: ['name'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'find_topic_chapters',
      description: 'Find all Bible chapters tagged with a specific topic or theme. Returns chapter titles and paths.',
      parameters: {
        type: 'object',
        properties: {
          topic: { type: 'string', description: 'The topic, e.g. covenant, faith, prophecy, creation' },
        },
        required: ['topic'],
      },
    },
  },
]

function executeTool(name: string, args: Record<string, string>): string {
  if (name === 'search_bible') {
    const context = searchKnowledgeGraph(args.query || '')
    return context || 'No results found for that query.'
  }

  if (name === 'get_chapter') {
    const chapter = getChapterByPath(args.path || '')
    if (!chapter) return `Chapter not found at path: ${args.path}`
    const parts = [`**${chapter.title}** (${chapter.path})`]
    if (chapter.peopleNames.length) parts.push(`People: ${chapter.peopleNames.join(', ')}`)
    if (chapter.topics.length) parts.push(`Topics: ${chapter.topics.join(', ')}`)
    if (chapter.locations.length) parts.push(`Locations: ${chapter.locations.join(', ')}`)
    if (chapter.events.length) parts.push(`Events: ${chapter.events.join('; ')}`)
    if (chapter.era) parts.push(`Era: ${chapter.era}`)
    if (chapter.keyVerses.length) parts.push(`Key verses: ${chapter.keyVerses.join(', ')}`)
    if (chapter.crossReferences.length) {
      parts.push(`Cross-references: ${chapter.crossReferences.map(cr => `${cr.book} ${cr.chapter} — ${cr.label}`).join('; ')}`)
    }
    return parts.join('\n')
  }

  if (name === 'find_person_chapters') {
    const index = loadIndex()
    const chapters = index.filter(ch =>
      ch.peopleNames.some(p => p.toLowerCase() === (args.name || '').toLowerCase()),
    )
    if (chapters.length === 0) return `No chapters found for person: ${args.name}`
    return `${args.name} appears in ${chapters.length} chapters:\n${chapters.slice(0, 20).map(ch => `- ${ch.title} (${ch.path})`).join('\n')}${chapters.length > 20 ? `\n...and ${chapters.length - 20} more` : ''}`
  }

  if (name === 'find_topic_chapters') {
    const index = loadIndex()
    const chapters = index.filter(ch =>
      ch.topics.some(t => t.toLowerCase() === (args.topic || '').toLowerCase()),
    )
    if (chapters.length === 0) return `No chapters found for topic: ${args.topic}`
    return `Topic "${args.topic}" appears in ${chapters.length} chapters:\n${chapters.slice(0, 20).map(ch => `- ${ch.title} (${ch.path})`).join('\n')}${chapters.length > 20 ? `\n...and ${chapters.length - 20} more` : ''}`
  }

  return `Unknown tool: ${name}`
}

export default defineEventHandler(async (event) => {
  const { messages, currentPage } = await readBody<{
    messages: Array<{ role: string; content: string }>
    currentPage?: string
  }>(event)

  const baseURL = process.env.LMSTUDIO_BASE_URL || 'http://localhost:1234/v1'
  const model = process.env.LMSTUDIO_MODEL || 'lmstudio-community/Meta-Llama-3.1-8B-Instruct-GGUF'

  // Build current page context
  let pageContext = ''
  if (currentPage?.startsWith('/docs/')) {
    const chapter = getChapterByPath(currentPage)
    if (chapter) {
      const parts = [`Currently viewing: ${chapter.title} (${chapter.path})`]
      if (chapter.peopleNames.length) parts.push(`People: ${chapter.peopleNames.join(', ')}`)
      if (chapter.topics.length) parts.push(`Topics: ${chapter.topics.join(', ')}`)
      if (chapter.locations.length) parts.push(`Locations: ${chapter.locations.join(', ')}`)
      if (chapter.events.length) parts.push(`Events: ${chapter.events.join('; ')}`)
      if (chapter.era) parts.push(`Era: ${chapter.era}`)
      if (chapter.crossReferences.length) {
        parts.push(`Cross-references: ${chapter.crossReferences.map(cr => `${cr.book} ${cr.chapter} — ${cr.label}`).join('; ')}`)
      }
      pageContext = `\n\nThe user is currently viewing:\n${parts.join('\n')}`
    }
  }

  const systemMessage = {
    role: 'system',
    content: `You are a knowledgeable Bible scholar with access to a knowledge graph of the King James Version.

You have tools to search the Bible, look up specific chapters, and find where people or topics appear. USE THESE TOOLS to find accurate information before answering. Don't guess — look it up.

**When to use tools:**
- Use search_bible for general questions
- Use get_chapter when you need details about a specific chapter
- Use find_person_chapters to see everywhere a person appears
- Use find_topic_chapters to see all chapters about a theme
- You can call multiple tools to build a comprehensive answer

**Response format:**
- Use markdown: **bold**, *italic*, bullet points, and block quotes for scripture
- Quote scripture with: > "verse text" — **Book Chapter:Verse**
- Never use markdown headings (#, ##). Use **bold** for section labels.
- Be concise but thorough.

**CRITICAL — Always create links:**
- Every chapter you mention MUST be a clickable link using the path from tool results: [Genesis 1](/docs/old-testament/genesis/chapter-1)
- Every person you mention should link to their explore page: [Moses](/explore/people/moses)
- Every topic should link to its explore page: [covenant](/explore/topics/covenant)
- Every location should link to its explore page: [Jerusalem](/explore/locations/jerusalem)
- Tool results include paths — always use them to create links
- The more links, the better. Your response should be a web of clickable references the user can follow.
- Link format for explore pages: /explore/people/{lowercase-name}, /explore/topics/{topic}, /explore/locations/{lowercase-name}${pageContext}`,
  }

  // Build conversation with system message
  const conversationMessages: Array<{ role: string; content?: string; tool_calls?: any[]; tool_call_id?: string; name?: string }> = [
    systemMessage,
    ...messages,
  ]

  // Agent loop: keep calling LLM until we get a text response (not tool calls)
  setResponseHeader(event, 'Content-Type', 'text/event-stream')
  setResponseHeader(event, 'Cache-Control', 'no-cache')
  setResponseHeader(event, 'Connection', 'keep-alive')

  const nodeRes = event.node.res

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const response = await fetch(`${baseURL}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: conversationMessages,
        tools,
        tool_choice: 'auto',
        stream: true,
      }),
    })

    if (!response.ok || !response.body) {
      nodeRes.end()
      return
    }

    // Read the full streamed response to check for tool calls
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let fullContent = ''
    let toolCalls: Array<{ id: string; function: { name: string; arguments: string } }> = []
    let hasToolCalls = false

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split('\n')

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const data = line.slice(6)
        if (data === '[DONE]') continue

        try {
          const parsed = JSON.parse(data)
          const choice = parsed.choices?.[0]

          // Accumulate tool calls
          if (choice?.delta?.tool_calls) {
            hasToolCalls = true
            for (const tc of choice.delta.tool_calls) {
              const idx = tc.index || 0
              if (!toolCalls[idx]) {
                toolCalls[idx] = { id: tc.id || `call_${idx}`, function: { name: '', arguments: '' } }
              }
              if (tc.function?.name) toolCalls[idx].function.name += tc.function.name
              if (tc.function?.arguments) toolCalls[idx].function.arguments += tc.function.arguments
            }
          }

          // If no tool calls, stream content directly to client
          if (!hasToolCalls) {
            nodeRes.write(`${line}\n\n`)
          }
        } catch {}
      }
    }

    // If no tool calls, we're done — the response was streamed to the client
    if (!hasToolCalls) {
      nodeRes.write('data: [DONE]\n\n')
      nodeRes.end()
      return
    }

    // Execute tool calls and add results to conversation
    console.log(`[Agent] Round ${round + 1}: ${toolCalls.length} tool call(s)`)

    // Add assistant message with tool calls
    conversationMessages.push({
      role: 'assistant',
      tool_calls: toolCalls.map(tc => ({
        id: tc.id,
        type: 'function',
        function: tc.function,
      })),
    })

    // Send a "searching" indicator to the client
    const searchingMsg = toolCalls.map(tc => tc.function.name).join(', ')
    nodeRes.write(`data: ${JSON.stringify({
      choices: [{ delta: { reasoning_content: `[Searching: ${searchingMsg}]\n` } }],
    })}\n\n`)

    // Execute each tool call and add results
    for (const tc of toolCalls) {
      let args: Record<string, string> = {}
      try {
        args = JSON.parse(tc.function.arguments)
      } catch {}

      const result = executeTool(tc.function.name, args)
      console.log(`[Agent] Tool ${tc.function.name}(${JSON.stringify(args)}) → ${result.length} chars`)

      conversationMessages.push({
        role: 'tool',
        tool_call_id: tc.id,
        content: result,
      })
    }

    // Reset for next round
    toolCalls = []
    hasToolCalls = false
  }

  // If we hit max rounds, end the stream
  nodeRes.write('data: [DONE]\n\n')
  nodeRes.end()
})
