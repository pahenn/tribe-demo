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
          peopleNames: (meta.people?.map((p: any) => p.name) || meta.peopleNames || []).filter((v: any) => typeof v === 'string'),
          topics: (meta.topics || []).filter((v: any) => typeof v === 'string'),
          locations: (meta.locations || []).filter((v: any) => typeof v === 'string'),
          events: (meta.events || []).filter((v: any) => typeof v === 'string'),
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

const STOP_WORDS = new Set(['what', 'who', 'where', 'when', 'why', 'how', 'the', 'and', 'was', 'were', 'are', 'about', 'does', 'did', 'tell', 'explain', 'mean', 'meaning', 'compare', 'between', 'with', 'from', 'this', 'that', 'have', 'has', 'for', 'not', 'but', 'all', 'can', 'you', 'his', 'her', 'its', 'they', 'them', 'will', 'would', 'could', 'should', 'shall', 'may', 'might', 'been', 'being', 'than', 'then', 'also', 'into', 'more', 'some', 'such', 'each', 'which', 'their', 'there', 'these', 'those', 'other'])

export function searchKnowledgeGraph(query: string): string {
  const queryLower = query.toLowerCase()
  const terms = queryLower
    .split(/\s+/)
    .filter(t => t.length > 2 && !STOP_WORDS.has(t))

  const index = loadIndex()

  // Step 1: Check for direct chapter references like "psalm 23", "genesis 1", "1 john 3"
  const chapterPatterns = queryLower.match(/(\d?\s*[a-z]+)\s+(\d+)/g) || []
  const directMatches: ChapterEntry[] = []

  for (const pattern of chapterPatterns) {
    const parts = pattern.trim().split(/\s+/)
    const chapterNum = parseInt(parts[parts.length - 1]!)
    const bookPart = parts.slice(0, -1).join(' ')

    for (const entry of index) {
      if (
        entry.book.toLowerCase().includes(bookPart) &&
        entry.chapter === chapterNum
      ) {
        directMatches.push(entry)
      }
    }
  }

  // Step 2: Score all chapters by keyword relevance
  const directPaths = new Set(directMatches.map(r => r.path))

  const scored = terms.length > 0
    ? index
        .filter(e => !directPaths.has(e.path))
        .map(entry => {
          let score = 0
          const peopleLower = entry.peopleNames.map(p => p.toLowerCase())
          const topicsLower = entry.topics.map(t => t.toLowerCase())
          const locationsLower = entry.locations.map(l => l.toLowerCase())
          const eventsLower = entry.events.map(e => e.toLowerCase())
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
        .slice(0, 5)
    : []

  // Step 3: Combine — direct matches first, then keyword matches
  const allResults = [
    ...directMatches.map(e => ({ ...e, score: 100 })),
    ...scored,
  ].slice(0, 8)

  if (allResults.length === 0) return ''

  const contextParts = allResults.map(r => {
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

  return `\n\n---\n**Knowledge graph results for "${query}":**\n\n${contextParts.join('\n\n')}\n\n---`
}
