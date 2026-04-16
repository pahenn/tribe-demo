# Live Build Narrative: Knowledge Graph from Scratch

**Total time: 30 minutes** (25 min live build + 5 min Q&A)

**Fallback:** If anything goes wrong, this repo has branches at each checkpoint (`v1` through `v4`). You can `git checkout` to any working state and keep going.

---

## Before You Start

- Fresh terminal open
- Claude Code open in VS Code
- LM Studio running with a model loaded
- Browser open
- This narrative on a second screen
- The KJV markdown files ready (in a folder or GitHub repo)
- A fresh Nuxt project scaffolded (or start from `npx nuxi init`)

**Pre-check:** Make sure `pnpm`, `node`, and Claude Code are working. Nothing kills a live demo like a missing dependency.

---

## The Hook (1 minute)

Don't start with the computer. Start with the audience.

> "Every company has a pile of unstructured knowledge. Docs, wikis, specs, tickets. What if I told you that in the next 25 minutes, I'm going to turn a pile of raw text into a structured knowledge graph with search, explore pages, a graph visualizer, and an AI agent that can answer questions about it — and I'm going to do it live, with AI writing all the code?"

> "The corpus I'm using is the King James Bible — 66 books, 1,189 chapters. But the pattern works for any text. Your product docs. Your support tickets. Your internal wiki. By the end, you'll see how."

---

## Phase 1: Orient and Organize (3 minutes)

**Show the raw files.** Open the folder with the 66 KJV markdown files. Scroll through a few. It's just text.

> "This is what most company knowledge looks like. Flat files. No structure. No connections."

**Open Claude Code.** Type the first prompt live:

```
Familiarize yourself with the repo. I have the King James Bible 
in markdown. Clean this up and organize it appropriately.
```

**While Claude works,** narrate:

> "I'm not writing code. I'm not giving specifications. I'm telling the AI what I have and what I want. It reads the files, understands the structure, and reorganizes."

**Show the result:** Old Testament / New Testament directories. Clean structure.

> "30 seconds. 66 files reorganized. Let's keep going."

---

## Phase 2: Create the Knowledge Graph (5 minutes)

This is the big moment. Type the prompt:

```
I want to transform this into a detailed knowledge graph. 
Create rich frontmatter with topics, tags, people, locations, 
events, cross-references. Do it at the chapter level. 
Restructure the repo to accommodate this.
```

**While Claude plans,** explain what's about to happen:

> "Claude is going to split every book into individual chapter files — 1,189 of them — and add structured metadata to each one. People with roles, topics, locations, historical era, key verses, cross-references to other chapters."

When Claude asks about granularity:

```
Chapter level. Use as many parallel agents as you can.
```

**Show the agents launching.** 8 agents in parallel, each processing a section of the Bible.

> "Eight AI agents running simultaneously. Each one is reading every chapter in its section, understanding the content, and generating structured annotations. This would take a scholar weeks. It's going to take us minutes."

**While agents run,** you can show:
- The metadata schema (what fields each chapter gets)
- A preview of what the frontmatter will look like
- The agent table (Pentateuch, History, Poetry, Prophets, Gospels, Epistles...)

**When agents finish,** show a completed chapter file (Genesis 1):

> "People: God. Topics: creation, light-and-darkness. Era: primeval-history. Cross-references: John 1, Colossians 1, Hebrews 11. Every chapter has this. 1,189 of them."

---

## Phase 3: Build the App (5 minutes)

Now build the web interface. Type:

```
Set up a Nuxt app with @nuxt/ui and @nuxt/content to browse 
this knowledge graph. I want a sidebar with navigation, a 
header, and pages that show the chapter content with the 
metadata rendered as clickable badges.
```

**While Claude builds,** narrate:

> "The AI is creating layouts, page templates, components, and content configuration. It knows Nuxt UI's component library — headers, sidebars, navigation menus, search."

**Start the dev server:** `pnpm dev`

**Show it in the browser.** Navigate through Genesis. Click a chapter. Show the metadata badges — people, topics, locations linking to explore pages.

> "We went from raw text to a navigable, searchable app. Every person, topic, and location is a clickable link."

---

## Phase 4: Explore Pages (3 minutes)

```
Build explore pages so I can browse the knowledge graph 
by people, topics, locations, and eras. Add search filtering.
```

**Show the explore hub** at `/explore`. Click into People. Filter for "Moses."

> "440 people identified across the Bible. Every one linked to every chapter they appear in. This isn't a static list — it's a live query against the knowledge graph."

Click into a person. Show all their chapters.

> "In your company, this is every document where a specific customer, product, or team member is mentioned. One click."

---

## Phase 5: Graph Visualizer (3 minutes)

```
Build a D3 force-directed graph visualizer. Let me see 
the connections visually.
```

**Navigate to `/explore/graph`.** Click "Moses" preset.

> "This is the knowledge graph made visible. Moses at the center. Every connected chapter radiating out. Old Testament in blue, New Testament in green."

**Click a chapter node** to expand it. Show people, topics, cross-references appearing.

> "Click any node and it expands. Follow the connections. This is your company's knowledge as a living network."

**Click "Cross-References."** Show the web of connections between chapters.

> "Every line is an explicit link between documents. In your company, these are the dependencies you never knew existed."

---

## Phase 6: AI Chat with Agent (5 minutes)

This is the finale.

```
Add a chat panel that uses LM Studio. Make it an agent with 
tools to search the knowledge graph, look up chapters, and 
find people and topics.
```

**Open the chat panel.** Show the dynamic suggestions based on the current page.

> "The chat knows what page I'm on. The suggestions come from this chapter's knowledge graph."

**Ask a question:** "How is Moses connected to the exodus?"

**Show the thinking block** — `[Searching: find_person_chapters]`, `[Searching: find_topic_chapters]`.

> "The AI isn't guessing. It's searching our knowledge graph. It found all chapters with Moses, all chapters about the exodus, looked up specific chapters for detail. Now it's synthesizing an answer."

**Show the response** — formatted markdown with clickable links to chapters, people, topics.

> "Every mention is a link. Click any of them to explore further. The AI just turned a question into a web of references grounded in our data."

**Click a link in the response.** Navigate to the chapter. Open the chat again — new suggestions based on the new page.

> "The whole system is connected. Browse. Explore. Visualize. Ask. Every feature feeds into the others."

---

## The Punchline (1 minute)

Close the laptop (or step back from the screen).

> "What you just watched: a pile of raw text turned into a structured knowledge graph with browse, explore, graph visualization, and an AI agent — built live in 25 minutes."

> "The Bible is a stand-in. Replace it with your company's data and the pattern is identical. Annotate with AI. Index the metadata. Build surfaces. Ship products."

> "The code doesn't matter — AI writes the code now. What matters is the data layer. Get your knowledge into a graph, and new products become just new views of the same data."

> "Questions?"

---

## Timing Summary

| Phase | Time | What the audience sees |
|-------|------|----------------------|
| Hook | 1 min | You, talking |
| Organize | 3 min | Raw files → structured directories |
| Knowledge Graph | 5 min | 8 agents annotating 1,189 chapters |
| Build App | 5 min | Browsable site with metadata badges |
| Explore Pages | 3 min | People, topics, locations, eras |
| Graph Visualizer | 3 min | D3 force graph, click to expand |
| AI Agent Chat | 5 min | Agent searching the graph, streaming answer with links |
| Punchline | 1 min | Close |
| **Q&A** | **~4 min** | Audience questions |
| **Total** | **~30 min** | |

---

## If Things Go Wrong

**Claude Code is slow or stuck:**
> "AI isn't magic — sometimes it needs a moment. While it works, let me show you what the end result looks like."

Switch to this repo. `git checkout v1-knowledge-graph-with-chat` and continue from there.

**The dev server crashes:**
Kill it, `rm -rf .nuxt .data`, restart. If it persists, checkout a working branch.

**LM Studio isn't responding:**
> "The AI chat needs a local model running. Let me show you the pre-built version."

Checkout `v4-agentic-chat` and demo from the finished product. The agent tools still work — the chat just won't get responses.

**The metadata agents take too long:**
They run in parallel but can take 5-10 minutes for 1,189 chapters. If time is tight:
> "These agents are processing all 1,189 chapters. In the interest of time, let me jump to the finished result."

Checkout `v1-knowledge-graph-with-chat` which has all metadata applied.

**A component doesn't render:**
Hard refresh (Cmd+Shift+R). If that doesn't work, show it from a checkpoint branch.

**General rule:** Never debug live. If something breaks, narrate what went wrong, switch to a backup branch, and keep the energy moving.

---

## Key Lines to Memorize

- "Every company has something like this." (gesturing at raw files)
- "I'm not writing code. I'm describing what I want."
- "Eight agents, running in parallel, reading every chapter."
- "This would take a scholar weeks. It took us minutes."
- "Every annotation is a link. Every link is a product feature."
- "The AI isn't guessing — it's searching our data."
- "The code doesn't matter. The data layer matters."

---

## What NOT to Do

- Don't explain the tech stack unless asked. Nobody cares that it's Nuxt.
- Don't show terminal output for longer than 5 seconds. Narrate over it.
- Don't apologize for AI speed. Just narrate while it works.
- Don't get pulled into code review. "The code is in the repo — happy to walk through it after."
- Don't demo the "How It Was Built" pages live. That's for people to read later.
- Don't try to fix bugs live. Switch to a checkpoint branch.
