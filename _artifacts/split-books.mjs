import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs'
import { join, basename } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname
const OT_SRC = join(ROOT, 'content/1.old-testament')
const NT_SRC = join(ROOT, 'content/2.new-testament')
const DOCS_DIR = join(ROOT, 'content/docs')

// Book metadata — traditional authors, genres, and short descriptions
const BOOK_META = {
  'Genesis': { author: 'Moses (traditional)', genre: ['narrative'], themes: ['creation', 'covenant', 'patriarchs', 'sin-and-redemption'] },
  'Exodus': { author: 'Moses (traditional)', genre: ['narrative', 'law'], themes: ['deliverance', 'covenant', 'law', 'worship'] },
  'Leviticus': { author: 'Moses (traditional)', genre: ['law'], themes: ['holiness', 'sacrifice', 'atonement', 'purity'] },
  'Numbers': { author: 'Moses (traditional)', genre: ['narrative', 'law'], themes: ['wilderness', 'faithfulness', 'judgment', 'census'] },
  'Deuteronomy': { author: 'Moses (traditional)', genre: ['law'], themes: ['covenant-renewal', 'obedience', 'blessing-and-curse'] },
  'Joshua': { author: 'Joshua (traditional)', genre: ['narrative'], themes: ['conquest', 'promised-land', 'faithfulness', 'inheritance'] },
  'Judges': { author: 'Samuel (traditional)', genre: ['narrative'], themes: ['cycles-of-sin', 'deliverance', 'leadership', 'apostasy'] },
  'Ruth': { author: 'Samuel (traditional)', genre: ['narrative'], themes: ['loyalty', 'redemption', 'providence', 'kindness'] },
  '1 Samuel': { author: 'Samuel, Nathan, Gad (traditional)', genre: ['narrative'], themes: ['kingship', 'obedience', 'anointing', 'faith'] },
  '2 Samuel': { author: 'Nathan, Gad (traditional)', genre: ['narrative'], themes: ['kingship', 'covenant', 'sin-and-consequences', 'worship'] },
  '1 Kings': { author: 'Jeremiah (traditional)', genre: ['narrative'], themes: ['kingship', 'wisdom', 'idolatry', 'prophets'] },
  '2 Kings': { author: 'Jeremiah (traditional)', genre: ['narrative'], themes: ['judgment', 'exile', 'prophets', 'apostasy'] },
  '1 Chronicles': { author: 'Ezra (traditional)', genre: ['narrative'], themes: ['genealogy', 'worship', 'davidic-covenant', 'temple'] },
  '2 Chronicles': { author: 'Ezra (traditional)', genre: ['narrative'], themes: ['temple', 'worship', 'kingship', 'revival'] },
  'Ezra': { author: 'Ezra', genre: ['narrative'], themes: ['restoration', 'temple', 'repentance', 'law'] },
  'Nehemiah': { author: 'Nehemiah', genre: ['narrative'], themes: ['rebuilding', 'prayer', 'leadership', 'covenant-renewal'] },
  'Esther': { author: 'Unknown', genre: ['narrative'], themes: ['providence', 'courage', 'deliverance', 'identity'] },
  'Job': { author: 'Unknown', genre: ['wisdom', 'poetry'], themes: ['suffering', 'sovereignty', 'faith', 'justice'] },
  'Psalms': { author: 'David and others', genre: ['poetry'], themes: ['worship', 'lament', 'praise', 'trust', 'messianic-hope'] },
  'Proverbs': { author: 'Solomon and others', genre: ['wisdom'], themes: ['wisdom', 'foolishness', 'righteousness', 'discipline'] },
  'Ecclesiastes': { author: 'Solomon (traditional)', genre: ['wisdom'], themes: ['meaning-of-life', 'vanity', 'wisdom', 'mortality'] },
  'The Song of Solomon': { author: 'Solomon', genre: ['poetry'], themes: ['love', 'beauty', 'marriage', 'desire'] },
  'Isaiah': { author: 'Isaiah', genre: ['prophecy'], themes: ['judgment', 'messianic-hope', 'salvation', 'holiness'] },
  'Jeremiah': { author: 'Jeremiah', genre: ['prophecy'], themes: ['judgment', 'repentance', 'new-covenant', 'exile'] },
  'Lamentations': { author: 'Jeremiah (traditional)', genre: ['poetry', 'prophecy'], themes: ['lament', 'judgment', 'suffering', 'hope'] },
  'Ezekiel': { author: 'Ezekiel', genre: ['prophecy'], themes: ['judgment', 'glory-of-god', 'restoration', 'visions'] },
  'Daniel': { author: 'Daniel', genre: ['prophecy', 'narrative'], themes: ['sovereignty', 'faithfulness', 'end-times', 'kingdoms'] },
  'Hosea': { author: 'Hosea', genre: ['prophecy'], themes: ['unfaithfulness', 'love', 'judgment', 'restoration'] },
  'Joel': { author: 'Joel', genre: ['prophecy'], themes: ['day-of-the-lord', 'repentance', 'restoration', 'spirit'] },
  'Amos': { author: 'Amos', genre: ['prophecy'], themes: ['justice', 'judgment', 'social-ethics', 'day-of-the-lord'] },
  'Obadiah': { author: 'Obadiah', genre: ['prophecy'], themes: ['judgment', 'pride', 'edom', 'justice'] },
  'Jonah': { author: 'Jonah', genre: ['narrative', 'prophecy'], themes: ['mercy', 'repentance', 'mission', 'sovereignty'] },
  'Micah': { author: 'Micah', genre: ['prophecy'], themes: ['justice', 'judgment', 'messianic-hope', 'mercy'] },
  'Nahum': { author: 'Nahum', genre: ['prophecy'], themes: ['judgment', 'nineveh', 'justice', 'sovereignty'] },
  'Habakkuk': { author: 'Habakkuk', genre: ['prophecy'], themes: ['faith', 'justice', 'judgment', 'theodicy'] },
  'Zephaniah': { author: 'Zephaniah', genre: ['prophecy'], themes: ['day-of-the-lord', 'judgment', 'remnant', 'restoration'] },
  'Haggai': { author: 'Haggai', genre: ['prophecy'], themes: ['temple', 'priorities', 'obedience', 'glory'] },
  'Zechariah': { author: 'Zechariah', genre: ['prophecy'], themes: ['messianic-hope', 'visions', 'restoration', 'end-times'] },
  'Malachi': { author: 'Malachi', genre: ['prophecy'], themes: ['covenant-faithfulness', 'worship', 'judgment', 'messenger'] },
  'The Gospel According to Matthew': { author: 'Matthew', genre: ['gospel'], themes: ['kingdom-of-heaven', 'messianic-fulfillment', 'discipleship', 'law'], shortTitle: 'Matthew' },
  'The Gospel According to Mark': { author: 'Mark', genre: ['gospel'], themes: ['servanthood', 'authority', 'suffering', 'discipleship'], shortTitle: 'Mark' },
  'The Gospel According to Luke': { author: 'Luke', genre: ['gospel'], themes: ['salvation', 'compassion', 'prayer', 'holy-spirit'], shortTitle: 'Luke' },
  'The Gospel According to John': { author: 'John', genre: ['gospel'], themes: ['deity-of-christ', 'belief', 'eternal-life', 'signs'], shortTitle: 'John' },
  'Acts': { author: 'Luke', genre: ['narrative'], themes: ['holy-spirit', 'church', 'mission', 'witness'] },
  'Romans': { author: 'Paul', genre: ['epistle'], themes: ['justification', 'grace', 'faith', 'righteousness'] },
  '1 Corinthians': { author: 'Paul', genre: ['epistle'], themes: ['church-unity', 'spiritual-gifts', 'love', 'resurrection'] },
  '2 Corinthians': { author: 'Paul', genre: ['epistle'], themes: ['suffering', 'ministry', 'generosity', 'reconciliation'] },
  'Galatians': { author: 'Paul', genre: ['epistle'], themes: ['freedom', 'grace', 'faith', 'law-vs-grace'] },
  'Ephesians': { author: 'Paul', genre: ['epistle'], themes: ['unity', 'grace', 'spiritual-warfare', 'church'] },
  'Philippians': { author: 'Paul', genre: ['epistle'], themes: ['joy', 'humility', 'contentment', 'christ-likeness'] },
  'Colossians': { author: 'Paul', genre: ['epistle'], themes: ['supremacy-of-christ', 'fullness', 'new-life', 'false-teaching'] },
  '1 Thessalonians': { author: 'Paul', genre: ['epistle'], themes: ['second-coming', 'holiness', 'encouragement', 'faith'] },
  '2 Thessalonians': { author: 'Paul', genre: ['epistle'], themes: ['second-coming', 'perseverance', 'judgment', 'work'] },
  '1 Timothy': { author: 'Paul', genre: ['epistle'], themes: ['church-leadership', 'sound-doctrine', 'godliness', 'faithfulness'] },
  '2 Timothy': { author: 'Paul', genre: ['epistle'], themes: ['endurance', 'sound-doctrine', 'faithfulness', 'ministry'] },
  'Titus': { author: 'Paul', genre: ['epistle'], themes: ['sound-doctrine', 'good-works', 'church-order', 'grace'] },
  'Philemon': { author: 'Paul', genre: ['epistle'], themes: ['forgiveness', 'reconciliation', 'brotherhood', 'grace'] },
  'Hebrews': { author: 'Unknown', genre: ['epistle'], themes: ['supremacy-of-christ', 'faith', 'new-covenant', 'priesthood'] },
  'James': { author: 'James', genre: ['epistle'], themes: ['faith-and-works', 'wisdom', 'trials', 'speech'] },
  '1 Peter': { author: 'Peter', genre: ['epistle'], themes: ['suffering', 'hope', 'holiness', 'submission'] },
  '2 Peter': { author: 'Peter', genre: ['epistle'], themes: ['false-teachers', 'knowledge', 'second-coming', 'growth'] },
  '1 John': { author: 'John', genre: ['epistle'], themes: ['love', 'truth', 'fellowship', 'assurance'] },
  '2 John': { author: 'John', genre: ['epistle'], themes: ['truth', 'love', 'false-teaching', 'obedience'] },
  '3 John': { author: 'John', genre: ['epistle'], themes: ['hospitality', 'truth', 'leadership', 'faithfulness'] },
  'Jude': { author: 'Jude', genre: ['epistle'], themes: ['false-teachers', 'contending-for-faith', 'judgment', 'perseverance'] },
  'Revelation': { author: 'John', genre: ['apocalyptic', 'prophecy'], themes: ['end-times', 'judgment', 'victory', 'worship', 'new-creation'] },
}

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/^the gospel according to /, '')
    .replace(/^the song of /, 'song-of-')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

function countVerses(text) {
  // Verses start with a number at the beginning of a line
  const matches = text.match(/^\d+\s/gm)
  return matches ? matches.length : 0
}

function processBook(filePath, bookNum, testament) {
  const raw = readFileSync(filePath, 'utf-8')

  // Extract title from frontmatter
  const fmMatch = raw.match(/^---\n([\s\S]*?)\n---/)
  const titleMatch = fmMatch?.[1]?.match(/title:\s*"(.+?)"/)
  const title = titleMatch?.[1] || basename(filePath, '.md')

  // Get content after frontmatter
  const content = raw.replace(/^---\n[\s\S]*?\n---\n*/, '')

  // Remove ## eof marker
  const cleanContent = content.replace(/\n*## eof\s*$/, '').trimEnd()

  // Split by ## Chapter N headings
  const chapterRegex = /^## Chapter (\d+)\s*$/gm
  const chapters = []
  let match
  const splits = []

  while ((match = chapterRegex.exec(cleanContent)) !== null) {
    splits.push({ num: parseInt(match[1]), index: match.index, headerEnd: match.index + match[0].length })
  }

  if (splits.length === 0) {
    // Single-chapter book (Obadiah, Philemon, 2 John, 3 John, Jude)
    const chapterText = cleanContent.trim()
    chapters.push({ num: 1, text: chapterText })
  } else {
    for (let i = 0; i < splits.length; i++) {
      const start = splits[i].headerEnd
      const end = i + 1 < splits.length ? splits[i + 1].index : cleanContent.length
      const chapterText = cleanContent.slice(start, end).trim()
      chapters.push({ num: splits[i].num, text: chapterText })
    }
  }

  const meta = BOOK_META[title] || { author: 'Unknown', genre: ['unknown'], themes: [] }
  const slug = slugify(title)
  const shortTitle = meta.shortTitle || title
  const testamentDir = testament === 'old' ? '1.old-testament' : '2.new-testament'
  const bookDir = join(DOCS_DIR, testamentDir, `${String(bookNum).padStart(2, '0')}.${slug}`)

  mkdirSync(bookDir, { recursive: true })

  // Write book index.md
  const bookFrontmatter = [
    '---',
    `title: "${title}"`,
    `bookNumber: ${bookNum}`,
    `testament: "${testament}"`,
    `author: "${meta.author}"`,
    `genre: [${meta.genre.map(g => `"${g}"`).join(', ')}]`,
    `themes: [${meta.themes.map(t => `"${t}"`).join(', ')}]`,
    `chapterCount: ${chapters.length}`,
    '---',
    '',
    `The book of ${shortTitle} contains ${chapters.length} chapter${chapters.length > 1 ? 's' : ''}.`,
    '',
  ].join('\n')

  writeFileSync(join(bookDir, 'index.md'), bookFrontmatter)

  // Write individual chapter files
  for (const ch of chapters) {
    const verseCount = countVerses(ch.text)
    const chapterFrontmatter = [
      '---',
      `title: "${shortTitle} ${ch.num}"`,
      `book: "${shortTitle}"`,
      `bookNumber: ${bookNum}`,
      `chapter: ${ch.num}`,
      `testament: "${testament}"`,
      `verseCount: ${verseCount}`,
      '---',
      '',
      ch.text,
      '',
    ].join('\n')

    const chapterFile = join(bookDir, `${String(ch.num).padStart(3, '0')}.chapter-${ch.num}.md`)
    writeFileSync(chapterFile, chapterFrontmatter)
  }

  return { title, slug, chapters: chapters.length }
}

// Main
mkdirSync(DOCS_DIR, { recursive: true })

let totalChapters = 0
let totalBooks = 0

// Process Old Testament
const otFiles = readdirSync(OT_SRC).filter(f => f.endsWith('.md')).sort()
for (const file of otFiles) {
  const numMatch = file.match(/^(\d+)/)
  const bookNum = numMatch ? parseInt(numMatch[1]) : 0
  const result = processBook(join(OT_SRC, file), bookNum, 'old')
  totalBooks++
  totalChapters += result.chapters
  console.log(`  OT ${String(bookNum).padStart(2, '0')} | ${result.title} -> ${result.chapters} chapters`)
}

// Process New Testament
const ntFiles = readdirSync(NT_SRC).filter(f => f.endsWith('.md')).sort()
for (const file of ntFiles) {
  const numMatch = file.match(/^(\d+)/)
  const bookNum = numMatch ? parseInt(numMatch[1]) : 0
  const result = processBook(join(NT_SRC, file), bookNum, 'new')
  totalBooks++
  totalChapters += result.chapters
  console.log(`  NT ${String(bookNum).padStart(2, '0')} | ${result.title} -> ${result.chapters} chapters`)
}

console.log(`\nDone: ${totalBooks} books, ${totalChapters} chapters`)
