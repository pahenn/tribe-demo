# Artifacts

Scripts used to build and enrich the Bible knowledge graph content.

## Scripts

### `split-books.mjs`

Splits the original 66 single-file KJV books into per-chapter markdown files with structured frontmatter.

**Input:** Flat book files in `content/1.old-testament/` and `content/2.new-testament/` (the original KJV markdown files, one per book, with `## Chapter N` headings).

**Output:** `content/docs/` directory with:
- `1.old-testament/` and `2.new-testament/` subdirectories
- Each book as a numbered directory (e.g., `01.genesis/`)
- Book-level `index.md` with metadata (title, author, genre, themes, chapter count)
- Per-chapter files (e.g., `1.chapter-1.md`) with frontmatter (title, book, chapter, testament, verse count)

**Usage:**
```bash
node _artifacts/split-books.mjs
```

**What it handles:**
- Parses `## Chapter N` boundaries in each book file
- Single-chapter books (Obadiah, Philemon, 2 John, 3 John, Jude) that have no chapter headings
- Strips `## eof` markers from end of files
- Counts verses per chapter
- Generates book-level metadata (author, genre, themes) from a built-in lookup table

**To reproduce from scratch:**
1. Place the original KJV markdown files in `content/1.old-testament/` and `content/2.new-testament/`
2. Run `node _artifacts/split-books.mjs`
3. Remove the original flat files: `rm -rf content/1.old-testament content/2.new-testament`
