import { searchKnowledgeGraph, getChapterByPath } from '../utils/search-graph'

export default defineEventHandler(async (event) => {
  const { messages, currentPage } = await readBody<{
    messages: Array<{ role: string; content: string }>
    currentPage?: string
  }>(event)

  const baseURL = process.env.LMSTUDIO_BASE_URL || 'http://localhost:1234/v1'
  const model = process.env.LMSTUDIO_MODEL || 'lmstudio-community/Meta-Llama-3.1-8B-Instruct-GGUF'

  // Get the latest user message
  const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')?.content || ''

  // Build context from current page + knowledge graph search
  let contextParts: string[] = []

  // If on a chapter page, include its full metadata
  if (currentPage?.startsWith('/docs/')) {
    const chapter = getChapterByPath(currentPage)
    if (chapter) {
      const parts = [`**Currently viewing: ${chapter.title}** (${chapter.path})`]
      if (chapter.peopleNames.length) parts.push(`- People: ${chapter.peopleNames.join(', ')}`)
      if (chapter.topics.length) parts.push(`- Topics: ${chapter.topics.join(', ')}`)
      if (chapter.locations.length) parts.push(`- Locations: ${chapter.locations.join(', ')}`)
      if (chapter.events.length) parts.push(`- Events: ${chapter.events.join('; ')}`)
      if (chapter.era) parts.push(`- Era: ${chapter.era}`)
      if (chapter.keyVerses.length) parts.push(`- Key verses: ${chapter.keyVerses.join(', ')}`)
      if (chapter.crossReferences.length) {
        parts.push(`- Cross-references: ${chapter.crossReferences.map(cr => `${cr.book} ${cr.chapter} (${cr.label})`).join('; ')}`)
      }
      contextParts.push(parts.join('\n'))
    }
  }

  // Also search the knowledge graph based on the user's question
  const graphContext = searchKnowledgeGraph(lastUserMessage)
  if (graphContext) {
    contextParts.push(graphContext)
  }

  const fullContext = contextParts.length > 0
    ? `\n\n---\n${contextParts.join('\n\n')}\n---`
    : ''

  if (fullContext) {
    console.log(`[KnowledgeGraph] Context for "${lastUserMessage}" on ${currentPage || '/'} (${fullContext.length} chars)`)
  }

  const response = await fetch(`${baseURL}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content: `You are a knowledgeable Bible scholar helping users explore the King James Version knowledge graph.

**Context:**
- The user is currently viewing a page on the site. If "Currently viewing" is shown below, the user is likely asking about that specific chapter.
- Additional knowledge graph search results may also be provided based on the user's question.

**Response format:**
- Use markdown: **bold**, *italic*, bullet points, and block quotes for scripture
- Quote scripture in block quotes with the reference, like:
  > "In the beginning God created the heaven and the earth." — **Genesis 1:1**
- When referencing a book/chapter, link to it: [Genesis 1](/docs/old-testament/genesis/chapter-1)
- Never use markdown headings (#, ##). Use **bold** for section labels instead.
- Be concise but thorough.

**Using the context:**
- Use the people, topics, locations, events, eras, and cross-references to give rich, connected answers
- Mention cross-references to help users explore related passages
- Use the paths provided to create clickable links
- Ground your answer in the provided context when relevant${fullContext}`,
        },
        ...messages,
      ],
      stream: true,
    }),
  })

  setResponseHeader(event, 'Content-Type', 'text/event-stream')
  setResponseHeader(event, 'Cache-Control', 'no-cache')
  setResponseHeader(event, 'Connection', 'keep-alive')

  return response.body
})
