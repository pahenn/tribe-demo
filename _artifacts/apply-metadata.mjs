/**
 * Apply metadata from a JSON file to chapter markdown files.
 *
 * Usage:
 *   node _artifacts/apply-metadata.mjs _artifacts/metadata/genesis.json
 *   node _artifacts/apply-metadata.mjs _artifacts/metadata/*.json
 *
 * JSON format:
 * {
 *   "book": "Genesis",
 *   "bookSlug": "01.genesis",
 *   "testament": "1.old-testament",
 *   "chapters": {
 *     "1": { "genre": [...], "people": [...], ... },
 *     "2": { ... }
 *   }
 * }
 */

import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname
const DOCS_DIR = join(ROOT, 'content/docs')

function yamlValue(val) {
  if (typeof val === 'string') return `"${val.replace(/"/g, '\\"')}"`
  if (typeof val === 'number') return String(val)
  if (typeof val === 'boolean') return String(val)
  return String(val)
}

function metadataToYaml(meta) {
  const lines = []

  if (meta.genre?.length) lines.push(`genre: [${meta.genre.map(g => yamlValue(g)).join(', ')}]`)

  if (meta.people?.length) {
    lines.push('people:')
    for (const p of meta.people) {
      lines.push(`  - name: ${yamlValue(p.name)}`)
      lines.push(`    role: ${yamlValue(p.role)}`)
    }
    const names = meta.people.map(p => p.name)
    lines.push(`peopleNames: [${names.map(n => yamlValue(n)).join(', ')}]`)
  }

  if (meta.locations?.length) lines.push(`locations: [${meta.locations.map(l => yamlValue(l)).join(', ')}]`)
  if (meta.timePeriod) lines.push(`timePeriod: ${yamlValue(meta.timePeriod)}`)
  if (meta.era) lines.push(`era: ${yamlValue(meta.era)}`)
  if (meta.topics?.length) lines.push(`topics: [${meta.topics.map(t => yamlValue(t)).join(', ')}]`)
  if (meta.events?.length) lines.push(`events: [${meta.events.map(e => yamlValue(e)).join(', ')}]`)
  if (meta.keyVerses?.length) lines.push(`keyVerses: [${meta.keyVerses.join(', ')}]`)

  if (meta.crossReferences?.length) {
    lines.push('crossReferences:')
    for (const ref of meta.crossReferences) {
      lines.push(`  - book: ${yamlValue(ref.book)}`)
      lines.push(`    chapter: ${ref.chapter}`)
      lines.push(`    label: ${yamlValue(ref.label)}`)
    }
  }

  return lines.join('\n')
}

function applyToFile(filePath, metadata) {
  const content = readFileSync(filePath, 'utf-8')
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!fmMatch) {
    console.error(`  ✗ No frontmatter in ${filePath}`)
    return false
  }

  // Strip any existing enriched fields from frontmatter
  let fm = fmMatch[1]
    .replace(/^genre:.*\n/gm, '')
    .replace(/^people:[\s\S]*?(?=^\w|\n---)/gm, '')
    .replace(/^peopleNames:.*\n/gm, '')
    .replace(/^locations:.*\n/gm, '')
    .replace(/^timePeriod:.*\n/gm, '')
    .replace(/^era:.*\n/gm, '')
    .replace(/^topics:.*\n/gm, '')
    .replace(/^events:.*\n/gm, '')
    .replace(/^keyVerses:.*\n/gm, '')
    .replace(/^crossReferences:[\s\S]*?(?=^\w|\n---)/gm, '')
    .trimEnd()

  const body = fmMatch[2]
  const yamlMeta = metadataToYaml(metadata)

  writeFileSync(filePath, `---\n${fm}\n${yamlMeta}\n---\n${body}`)
  return true
}

// Main
const jsonFiles = process.argv.slice(2)
if (jsonFiles.length === 0) {
  console.error('Usage: node apply-metadata.mjs <metadata.json> [metadata2.json ...]')
  process.exit(1)
}

let applied = 0
let errors = 0

for (const jsonFile of jsonFiles) {
  const data = JSON.parse(readFileSync(jsonFile, 'utf-8'))
  const bookDir = join(DOCS_DIR, data.testament, data.bookSlug)

  console.log(`\n📖 ${data.book} (${bookDir})`)

  const chapterFiles = readdirSync(bookDir)
    .filter(f => f.match(/^\d+\.chapter-/))
    .sort()

  for (const file of chapterFiles) {
    const chapterNum = file.match(/chapter-(\d+)/)?.[1]
    if (!chapterNum || !data.chapters[chapterNum]) {
      console.log(`  - ${file} (no metadata)`)
      continue
    }

    const filePath = join(bookDir, file)
    if (applyToFile(filePath, data.chapters[chapterNum])) {
      console.log(`  ✓ ${file}`)
      applied++
    } else {
      errors++
    }
  }
}

console.log(`\nDone: ${applied} applied, ${errors} errors`)
