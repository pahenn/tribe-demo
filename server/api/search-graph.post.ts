import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

interface ChapterEntry {
  path: string
  title: string
  book: string
  chapter: number
  testament: string
  peopleNames: string[]
  topics: string[]
  locations: string[]
  events: string[]
  era: string
  keyVerses: number[]
  crossReferences: Array<{ book: string; chapter: number; label: string }>
}

// Load all metadata at startup — cached in memory
let chaptersIndex: ChapterEntry[] | null = null

function loadIndex(): ChapterEntry[] {
  if (chaptersIndex) return chaptersIndex

  const metadataDir = join(process.cwd(), '_artifacts/metadata')
  const entries: ChapterEntry[] = []

  try {
    const files = readdirSync(metadataDir).filter(f => f.endsWith('.json'))

    for (const file of files) {
      const data = JSON.parse(readFileSync(join(metadataDir, file), 'utf-8'))
      const testament = data.testament === '1.old-testament' ? 'old-testament' : 'new-testament'

      for (const [chNum, meta] of Object.entries(data.chapters) as [string, any][]) {
        const bookSlug = data.bookSlug.replace(/^\d+\./, '')
        entries.push({
          path: `/docs/${testament}/${bookSlug}/chapter-${chNum}`,
          title: `${data.book} ${chNum}`,
          book: data.book,
          chapter: parseInt(chNum),
          testament,
          peopleNames: meta.people?.map((p: any) => p.name) || meta.peopleNames || [],
          topics: meta.topics || [],
          locations: meta.locations || [],
          events: meta.events || [],
          era: meta.era || '',
          keyVerses: meta.keyVerses || [],
          crossReferences: meta.crossReferences || [],
        })
      }
    }
  } catch (err) {
    console.warn('Failed to load metadata index:', err)
  }

  chaptersIndex = entries
  return entries
}

export default defineEventHandler(async (event) => {
  const { query } = await readBody<{ query: string }>(event)

  if (!query?.trim()) {
    return { results: [], context: '' }
  }

  const stopWords = new Set(['what', 'who', 'where', 'when', 'why', 'how', 'the', 'and', 'was', 'were', 'are', 'about', 'does', 'did', 'tell', 'explain', 'mean', 'meaning', 'compare', 'between', 'with', 'from', 'this', 'that', 'have', 'has', 'for', 'not', 'but', 'all', 'can', 'you', 'his', 'her', 'its', 'they', 'them', 'will', 'would', 'could', 'should', 'shall', 'may', 'might', 'been', 'being', 'than', 'then', 'also', 'into', 'more', 'some', 'such', 'each', 'which', 'their', 'there', 'these', 'those', 'other'])

  const terms = query.toLowerCase()
    .split(/\s+/)
    .filter(t => t.length > 2 && !stopWords.has(t))

  if (terms.length === 0) {
    return { results: [], context: '' }
  }

  const index = loadIndex()

  // Score each chapter by how many terms match across fields
  const scored = index.map(entry => {
    let score = 0
    const peopleLower = entry.peopleNames.filter(p => typeof p === 'string').map(p => p.toLowerCase())
    const topicsLower = entry.topics.filter(t => typeof t === 'string').map(t => t.toLowerCase())
    const locationsLower = entry.locations.filter(l => typeof l === 'string').map(l => l.toLowerCase())
    const eventsLower = entry.events.filter(e => typeof e === 'string').map(e => e.toLowerCase())
    const bookLower = entry.book.toLowerCase()
    const eraLower = entry.era.toLowerCase()

    for (const term of terms) {
      if (peopleLower.some(p => p.includes(term))) score += 4
      if (topicsLower.some(t => t.includes(term))) score += 3
      if (locationsLower.some(l => l.includes(term))) score += 3
      if (eventsLower.some(e => e.includes(term))) score += 2
      if (bookLower.includes(term)) score += 2
      if (eraLower.includes(term)) score += 1
    }

    return { ...entry, score }
  })
    .filter(e => e.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)

  // Build context string for the LLM
  const contextParts = scored.map(r => {
    const parts = [`**${r.title}** — [Read chapter](${r.path})`]
    if (r.peopleNames.length) parts.push(`- People: ${r.peopleNames.join(', ')}`)
    if (r.topics.length) parts.push(`- Topics: ${r.topics.join(', ')}`)
    if (r.locations.length) parts.push(`- Locations: ${r.locations.join(', ')}`)
    if (r.events.length) parts.push(`- Events: ${r.events.join('; ')}`)
    if (r.era) parts.push(`- Era: ${r.era}`)
    if (r.keyVerses.length) parts.push(`- Key verses: ${r.keyVerses.join(', ')}`)
    if (r.crossReferences.length) {
      parts.push(`- Cross-references: ${r.crossReferences.map(cr => `${cr.book} ${cr.chapter} (${cr.label})`).join('; ')}`)
    }
    return parts.join('\n')
  })

  return {
    results: scored,
    context: contextParts.length > 0
      ? `\n\n---\n**Knowledge graph results for "${query}":**\n\n${contextParts.join('\n\n')}\n\n---`
      : '',
  }
})
