import { searchKnowledgeGraph } from '../utils/search-graph'

export default defineEventHandler(async (event) => {
  const { messages } = await readBody<{ messages: Array<{ role: string; content: string }> }>(event)

  const baseURL = process.env.LMSTUDIO_BASE_URL || 'http://localhost:1234/v1'
  const model = process.env.LMSTUDIO_MODEL || 'lmstudio-community/Meta-Llama-3.1-8B-Instruct-GGUF'

  // Get the latest user message
  const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')?.content || ''

  // Search the knowledge graph directly (no internal HTTP call)
  const graphContext = searchKnowledgeGraph(lastUserMessage)
  if (graphContext) {
    console.log(`[KnowledgeGraph] Found context for: "${lastUserMessage}" (${graphContext.length} chars)`)
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

**Response format:**
- Use markdown: **bold**, *italic*, bullet points, and block quotes for scripture
- Quote scripture in block quotes with the reference, like:
  > "In the beginning God created the heaven and the earth." — **Genesis 1:1**
- When referencing a book/chapter, link to it using the path from the knowledge graph results: [Genesis 1](/docs/old-testament/genesis/chapter-1)
- Never use markdown headings (#, ##). Use **bold** for section labels instead.
- Be concise but thorough.

**Using knowledge graph context:**
- Below you may find knowledge graph results with metadata about relevant chapters
- Use the people, topics, locations, events, eras, and cross-references to give rich, connected answers
- Mention cross-references to help users explore related passages
- Use the paths provided to create clickable links
- If the knowledge graph results are relevant, ground your answer in them
- If they're not relevant to the question, use your general knowledge instead${graphContext}`,
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
