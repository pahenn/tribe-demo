/**
 * Generate rich frontmatter metadata for each Bible chapter using the Claude API.
 *
 * Usage:
 *   ANTHROPIC_API_KEY=sk-... node _artifacts/generate-metadata.mjs
 *   ANTHROPIC_API_KEY=sk-... node _artifacts/generate-metadata.mjs --book genesis
 *   ANTHROPIC_API_KEY=sk-... node _artifacts/generate-metadata.mjs --dry-run
 *
 * Requires: npm install @anthropic-ai/sdk
 */

import Anthropic from '@anthropic-ai/sdk'
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname
const DOCS_DIR = join(ROOT, 'content/docs')

const client = new Anthropic()

const SCHEMA = {
  name: 'chapter_metadata',
  description: 'Structured metadata for a Bible chapter',
  input_schema: {
    type: 'object',
    properties: {
      genre: {
        type: 'array',
        items: { type: 'string', enum: ['narrative', 'law', 'poetry', 'prophecy', 'wisdom', 'epistle', 'apocalyptic', 'gospel', 'genealogy'] },
      },
      people: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Canonical name (e.g. "Peter" not "Simon Peter" or "Cephas")' },
            role: { type: 'string', enum: ['protagonist', 'antagonist', 'mentioned', 'author', 'recipient', 'speaker'] },
          },
          required: ['name', 'role'],
        },
      },
      locations: { type: 'array', items: { type: 'string' } },
      timePeriod: { type: 'string' },
      era: {
        type: 'string',
        enum: [
          'primeval-history', 'patriarchal', 'exodus', 'conquest', 'judges',
          'united-monarchy', 'divided-monarchy', 'exile', 'post-exile',
          'intertestamental', 'life-of-christ', 'early-church',
        ],
      },
      topics: { type: 'array', items: { type: 'string' } },
      events: { type: 'array', items: { type: 'string' } },
      keyVerses: { type: 'array', items: { type: 'integer' } },
      crossReferences: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            book: { type: 'string' },
            chapter: { type: 'integer' },
            label: { type: 'string' },
          },
          required: ['book', 'chapter', 'label'],
        },
      },
    },
    required: ['genre', 'people', 'locations', 'era', 'topics', 'events', 'keyVerses'],
  },
}

const SYSTEM_PROMPT = `You are a biblical scholar analyzing King James Version Bible chapters. For each chapter, extract structured metadata. Be accurate and concise.

Guidelines:
- people: Use canonical names. "God" for God/LORD. "Jesus" not "Jesus Christ" for brevity. "Peter" not "Simon Peter". Include only people explicitly mentioned or addressed.
- locations: Use canonical place names. Include only locations explicitly mentioned.
- topics: Use lowercase kebab-case tags (e.g., "faith", "covenant", "prayer", "sin-and-redemption"). 2-5 topics per chapter.
- events: Short descriptions of significant events in the chapter. Only major events.
- keyVerses: The 1-3 most significant/well-known verse numbers in this chapter.
- crossReferences: 1-3 of the strongest cross-references to other Bible chapters.
- era: Choose the single best-fit era for when the events described take place (not when it was written).`

async function processChapter(filePath) {
  const content = readFileSync(filePath, 'utf-8')
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!fmMatch) return null

  const frontmatter = fmMatch[1]
  const bodyText = fmMatch[2].trim()
  const titleMatch = frontmatter.match(/title:\s*"(.+?)"/)
  const title = titleMatch?.[1] || 'Unknown'

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    tools: [SCHEMA],
    tool_choice: { type: 'tool', name: 'chapter_metadata' },
    messages: [
      { role: 'user', content: `Analyze this KJV Bible chapter and extract metadata:\n\n# ${title}\n\n${bodyText}` },
    ],
  })

  const toolUse = response.content.find(c => c.type === 'tool_use')
  return toolUse?.input || null
}

function applyMetadata(filePath, metadata) {
  const content = readFileSync(filePath, 'utf-8')
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!fmMatch) return

  let fm = fmMatch[1]
  const body = fmMatch[2]

  // Add new fields
  const peopleNames = metadata.people?.map(p => p.name) || []
  const yamlLines = []

  if (metadata.genre) yamlLines.push(`genre: [${metadata.genre.map(g => `"${g}"`).join(', ')}]`)
  if (metadata.people?.length) {
    yamlLines.push('people:')
    for (const p of metadata.people) {
      yamlLines.push(`  - name: "${p.name}"`)
      yamlLines.push(`    role: "${p.role}"`)
    }
  }
  if (peopleNames.length) yamlLines.push(`peopleNames: [${peopleNames.map(n => `"${n}"`).join(', ')}]`)
  if (metadata.locations?.length) yamlLines.push(`locations: [${metadata.locations.map(l => `"${l}"`).join(', ')}]`)
  if (metadata.timePeriod) yamlLines.push(`timePeriod: "${metadata.timePeriod}"`)
  if (metadata.era) yamlLines.push(`era: "${metadata.era}"`)
  if (metadata.topics?.length) yamlLines.push(`topics: [${metadata.topics.map(t => `"${t}"`).join(', ')}]`)
  if (metadata.events?.length) yamlLines.push(`events: [${metadata.events.map(e => `"${e}"`).join(', ')}]`)
  if (metadata.keyVerses?.length) yamlLines.push(`keyVerses: [${metadata.keyVerses.join(', ')}]`)
  if (metadata.crossReferences?.length) {
    yamlLines.push('crossReferences:')
    for (const ref of metadata.crossReferences) {
      yamlLines.push(`  - book: "${ref.book}"`)
      yamlLines.push(`    chapter: ${ref.chapter}`)
      yamlLines.push(`    label: "${ref.label}"`)
    }
  }

  const newFm = fm + '\n' + yamlLines.join('\n')
  writeFileSync(filePath, `---\n${newFm}\n---\n${body}`)
}

// Main
const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const bookFilter = args.find((_, i) => args[i - 1] === '--book')

const testaments = ['1.old-testament', '2.new-testament']
let processed = 0
let errors = 0

for (const testament of testaments) {
  const testamentDir = join(DOCS_DIR, testament)
  const books = readdirSync(testamentDir).filter(d => !d.startsWith('.')).sort()

  for (const book of books) {
    if (bookFilter && !book.includes(bookFilter)) continue

    const bookDir = join(testamentDir, book)
    const chapters = readdirSync(bookDir)
      .filter(f => f.match(/^\d+\.chapter-/))
      .sort()

    console.log(`\n📖 ${book} (${chapters.length} chapters)`)

    for (const chapter of chapters) {
      const filePath = join(bookDir, chapter)
      try {
        if (dryRun) {
          console.log(`  [dry-run] ${chapter}`)
          continue
        }

        const metadata = await processChapter(filePath)
        if (metadata) {
          applyMetadata(filePath, metadata)
          console.log(`  ✓ ${chapter}`)
        } else {
          console.log(`  ✗ ${chapter} (no metadata returned)`)
          errors++
        }
        processed++

        // Rate limiting: ~50 requests per minute for Sonnet
        await new Promise(r => setTimeout(r, 1200))
      } catch (err) {
        console.error(`  ✗ ${chapter}: ${err.message}`)
        errors++
      }
    }
  }
}

console.log(`\nDone: ${processed} processed, ${errors} errors`)
