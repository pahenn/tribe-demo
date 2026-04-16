---
title: "How This Was Built"
description: "A step-by-step guide to building a knowledge graph from raw text using Claude Code, Nuxt Content, and Docus."
---

# How This Was Built

This page is a walkthrough of how this project was created — from a pile of raw markdown files to a structured, navigable knowledge graph with an AI chat interface. Every step was done inside a single Claude Code session. No manual editing of 1,189 chapter files. No custom pipelines cobbled together over weeks.

If you have a corpus of text you want to turn into structured, searchable, interconnected data with a conversational AI layer on top, you can follow this same process with your own material.

---

## What you need

- [Claude Code](https://claude.ai/code) (CLI, VS Code extension, or desktop app)
- [Node.js](https://nodejs.org/) 18+
- [pnpm](https://pnpm.io/) (or npm/yarn)
- A corpus of text in markdown format
- [LM Studio](https://lmstudio.ai/) (optional, for local AI chat)

## Step 1: Scaffold the project

Start with a Docus project. Docus is a documentation framework built on Nuxt Content — it gives you navigation, search, dark mode, and a clean layout out of the box.

```bash
npx create-docus@latest my-knowledge-graph
cd my-knowledge-graph
pnpm install
```

This gives you a working site with some placeholder content in `content/`. The first thing we did was tell Claude Code:

> *"Familiarize yourself with the repo. I have the generic docus starter here, but also in the content directory, I have the King James Bible in markdown. Clean up this repo so that it only has the bible material. Organize it appropriately."*

Claude read the repo structure, identified the template content vs. the actual source material, removed the boilerplate, and reorganized the Bible files into `Old Testament` and `New Testament` sections.

The key lesson: **start by telling Claude what the repo is and what you want it to become.** Don't jump to implementation. Let it understand the landscape first.

## Step 2: Restructure for the framework

The original Bible files were one markdown file per book — 66 files total. Each file contained all chapters as `## Chapter N` headings. This created two problems:

1. **Search duplicates.** Nuxt Content's search indexes every heading as a separate entry. A book with 50 chapters produced 50+ search results that all looked like the same book.
2. **No per-chapter metadata.** You can't add frontmatter to a heading inside a file. Only the file itself gets frontmatter.

The prompt that kicked off the restructuring:

> *"I want to transform this into a detailed knowledge graph. Let's start by creating some rich frontmatter with topics, tags, labels, people, etc."*

And when asked about granularity:

> *"I think probably the chapter level. Feel free to restructure the repo to accommodate this if it makes sense."*

Claude designed and executed a plan:

- Move content into `content/docs/` (the Docus convention)
- Split each book into a directory
- Split each chapter into its own file
- Generate a book-level `index.md` for each book with metadata (author, genre, themes)
- Generate minimal chapter frontmatter (title, book, chapter, testament, verse count)

This was done by writing a Node.js script (`_artifacts/split-books.mjs`) that parsed the markdown, identified chapter boundaries, handled edge cases (single-chapter books like Obadiah and Philemon that have no `## Chapter` headings), stripped end-of-file markers, and output 1,189 individual chapter files plus 66 book indexes.

**Result:** `content/docs/1.old-testament/01.genesis/001.chapter-1.md` through `content/docs/2.new-testament/66.revelation/022.chapter-22.md`

### The schema

Each chapter file got this initial frontmatter:

```yaml
---
title: "Genesis 1"
book: "Genesis"
bookNumber: 1
chapter: 1
testament: "old"
verseCount: 31
---
```

Each book's `index.md` got:

```yaml
---
title: "Genesis"
bookNumber: 1
testament: "old"
author: "Moses (traditional)"
genre: ["narrative"]
themes: ["creation", "covenant", "patriarchs", "sin-and-redemption"]
chapterCount: 50
---
```

## Step 3: Enrich with metadata

This is where the knowledge graph comes to life. The basic frontmatter gives you structure but no connections. The enrichment step adds:

- **People** — who appears in each chapter, with their role (protagonist, speaker, mentioned, antagonist)
- **Locations** — geographic places mentioned
- **Topics** — thematic tags like "covenant", "faith", "judgment"
- **Era** — historical period (patriarchal, exodus, divided-monarchy, life-of-christ, etc.)
- **Events** — major narrative events
- **Key verses** — the 1-3 most significant verse numbers
- **Cross-references** — links to related chapters in other books

The enriched frontmatter looks like:

```yaml
---
title: "Genesis 1"
book: "Genesis"
bookNumber: 1
chapter: 1
testament: "old"
verseCount: 31
genre: ["narrative"]
people:
  - name: "God"
    role: "protagonist"
peopleNames: ["God"]
locations: ["Heaven", "Earth"]
timePeriod: "Creation"
era: "primeval-history"
topics: ["creation", "light-and-darkness", "image-of-god", "sabbath"]
events: ["Creation of the heavens and earth", "Creation of humanity"]
keyVerses: [1, 27]
crossReferences:
  - book: "John"
    chapter: 1
    label: "In the beginning was the Word"
  - book: "Hebrews"
    chapter: 11
    label: "By faith we understand the worlds were framed"
---
```

Note the `peopleNames` field — it's a flat array that duplicates the names from the `people` array. This denormalization exists because querying nested objects in Nuxt Content's SQLite backend requires `LIKE` with JSON string matching. A flat array is simpler to search. Pragmatism over purity.

### How the metadata was generated

The prompt:

> *"Use as many parallel agents as you can to speed up the process, since the chapters are all broken down."*

Claude Code launched 8 parallel agents, each responsible for a section of the Bible:

| Agent | Books | Chapters |
|-------|-------|----------|
| Pentateuch | Genesis – Deuteronomy | 187 |
| History | Joshua – Esther | 249 |
| Poetry & Wisdom | Job – Song of Solomon | 243 |
| Major Prophets | Isaiah – Daniel | 183 |
| Minor Prophets | Hosea – Malachi | 67 |
| Gospels & Acts | Matthew – Acts | 117 |
| Pauline Epistles | Romans – Philemon | 87 |
| General Epistles | Hebrews – Revelation | 56 |

Each agent read every chapter file in its section, generated structured metadata based on the actual text content, and wrote the results as JSON files to `_artifacts/metadata/`. A second script (`_artifacts/apply-metadata.mjs`) then merged the metadata into each chapter's YAML frontmatter.

The 66 metadata JSON files are kept as the source of truth — they can be re-applied at any time, modified independently, or used to feed the knowledge graph search.

For reproducibility, there's also a script (`_artifacts/generate-metadata.mjs`) that does the same thing via the Claude API — useful if you want to re-run the enrichment with a different model or different schema.

## Step 4: Verify and iterate

After each major change, we tested:

```bash
pnpm dev
```

Then checked:
- Does the landing page load?
- Do book pages render? (`/docs/old-testament/genesis`)
- Do chapter pages render? (`/docs/old-testament/genesis/chapter-1`)
- Is the sidebar navigation correct and in order?
- Does search work without duplicates?

When chapters sorted alphabetically (1, 10, 11, ...) instead of numerically, we zero-padded the file prefixes (`001.chapter-1.md` instead of `1.chapter-1.md`). When search showed duplicates, we traced it to how Nuxt Content indexes headings and restructured the files to fix it.

**The pattern: prompt, execute, test, fix.** Each issue was caught by actually running the site, not by hoping the code was correct.

## Step 5: Build the knowledge graph search

With 1,189 chapters of metadata, we needed a way to search across people, topics, locations, and events. The search system (`server/utils/search-graph.ts`) works in two stages:

**Stage 1: Direct chapter matching.** If the query contains a specific chapter reference like "Psalm 23" or "Genesis 1", the search finds the exact chapter first. This is the highest-priority match.

**Stage 2: Keyword scoring.** For general queries like "Who was King David?" or "What about covenant?", the search scores every chapter by matching terms against its metadata:

- People matches score 4 points (highest — if you ask about Moses, you want chapters where Moses appears)
- Topics and locations score 3 points each
- Events score 2 points
- Book name and era score 1 point each

The top 8 results are returned with their full metadata — people, topics, locations, events, era, key verses, and cross-references.

This search runs entirely in memory. The 66 JSON metadata files are loaded once at startup and indexed. No database queries, no external services.

## Step 6: Add the AI chat interface

The final layer: a conversational AI that can answer questions about the Bible using the knowledge graph as context.

The prompt:

> *"Now I want to setup a chat interface with the project. I can add an anthropic key to use the anthropic API."*

After exploring several approaches — the Docus built-in assistant (dependency issues), a custom page with Vercel AI SDK (SSR conflicts), and direct API integration — we landed on the simplest architecture:

**A slide-out chat panel** (`app/components/ChatPanel.vue`) that:
- Floats on the right side of any page
- Expands to half-screen width for longer conversations
- Streams responses token-by-token with live markdown rendering via [Comark](https://comark.dev/)
- Separates model thinking/reasoning tokens into a collapsible, auto-scrolling block (like Claude Code's thinking UI)
- Shows suggested questions when empty

**A server API route** (`server/api/chat.post.ts`) that:
1. Takes the user's question
2. Searches the knowledge graph for relevant chapters
3. Injects the matching metadata (people, topics, events, cross-references) into the system prompt as context
4. Forwards to a local LLM via the OpenAI-compatible API (LM Studio)
5. Streams the response back as server-sent events

**The key insight:** the chat is not just a generic LLM wrapper. When you ask "What does Psalm 23 mean?", the system first searches the knowledge graph, finds Psalm 23 with its metadata (topics: shepherd, trust, comfort; era: united-monarchy; cross-references to John 10, Ezekiel 34), and injects all of that as context. The LLM answers grounded in the actual knowledge graph data, with links to the relevant chapter pages.

### Why LM Studio?

We started with the Anthropic API and the Vercel AI Gateway, but both required paid credits. LM Studio runs locally, is free, and exposes an OpenAI-compatible API at `localhost:1234`. Any model that supports chat completions works — we used `google/gemma-4-26b-a4b`. The `.env` file configures the model and endpoint:

```env
LMSTUDIO_BASE_URL=http://localhost:1234/v1
LMSTUDIO_MODEL=google/gemma-4-26b-a4b
```

Swapping to a cloud API (Anthropic, OpenAI, etc.) would require changing only the server route — the chat panel is provider-agnostic.

### Streaming markdown with Comark

A key UX detail: the chat renders markdown as it streams in, not after the response completes. We used [Comark](https://comark.dev/) (`@comark/nuxt`), which handles:

- Incremental markdown rendering (token by token)
- Auto-closing incomplete syntax (so `**bold` mid-stream renders correctly)
- A blinking caret indicator while streaming
- Nuxt UI prose styling integration

The Comark component is reactive — you just append to a ref and it re-renders:

```vue
<Comark :streaming="isStreaming" caret>{{ streamingContent }}</Comark>
```

### Thinking blocks

Some models (like QwQ, DeepSeek, and others) emit "reasoning" tokens before their actual response. These arrive as `delta.reasoning_content` in the SSE stream instead of `delta.content`. We separate them:

- **During streaming:** thinking tokens appear in a small, auto-scrolling box with a brain icon and "Thinking..." label — similar to Claude Code's thinking UI
- **After completion:** thinking collapses into a `<details>` element that's closed by default, expandable on click

This gives transparency into the model's reasoning process without cluttering the response.

---

## Do this with your own text

This process works with any corpus that can be broken into a hierarchy:

- **Legal codes** — statutes -> sections -> subsections, tagged with topics, cited cases, effective dates
- **Technical documentation** — products -> features -> pages, tagged with APIs, concepts, version history
- **Literary works** — books -> chapters -> scenes, tagged with characters, locations, themes
- **Research papers** — fields -> papers -> sections, tagged with authors, methods, citations
- **Religious texts** — any scripture, commentary, or theological work

The workflow is the same:

1. Get your text into markdown files
2. Scaffold a Docus project
3. Ask Claude Code to restructure and split the content
4. Design a frontmatter schema for your domain
5. Use parallel agents to generate metadata at scale
6. Build a search layer over the metadata
7. Add a chat interface that queries the search and feeds context to an LLM

The scripts in `_artifacts/` are specific to the KJV Bible, but the pattern — split, annotate, search, converse — is universal.

---

## Tools used

- **[Claude Code](https://claude.ai/code)** — AI-powered coding assistant (CLI, VS Code extension, and desktop app)
- **[Nuxt 4](https://nuxt.com)** — Vue framework with file-based routing
- **[Nuxt Content](https://content.nuxt.com)** — File-based CMS with SQLite-backed search and querying
- **[Docus](https://docus.dev)** — Documentation theme for Nuxt (navigation, search, layout)
- **[Nuxt UI](https://ui.nuxt.com)** — Component library for the page layout
- **[Comark](https://comark.dev/)** — Streaming markdown renderer for Vue/Nuxt
- **[LM Studio](https://lmstudio.ai/)** — Local LLM server with OpenAI-compatible API

The entire project — from empty repo to 1,189 annotated chapters with a knowledge graph and AI chat — was built in a single Claude Code session.
