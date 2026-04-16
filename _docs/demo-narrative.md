# Demo Narrative: Knowledge Graphs as Product Engines

**Total time: 30 minutes** (20 min demo + 10 min Q&A)

---

## The Thesis

Every company sits on a mountain of unstructured knowledge — docs, wikis, support tickets, product specs, research, customer conversations. Most of it lives in silos. Most of it is unsearchable. And most of it gets recreated from scratch every time someone needs it.

**The thesis:** If you organize that knowledge into a backlinked knowledge graph — structured, annotated, connected — you don't just make it searchable. You make it *buildable*. New products, new features, new interfaces become trivial because the hard part (the data layer) is already done.

This demo proves it. We took one corpus (the King James Bible) and built four products from the same knowledge graph in a single session. The Bible is a stand-in for your company's knowledge — the pattern works the same.

---

## Setup Before the Demo

- Have the app running locally (`pnpm dev`)
- Have LM Studio running with a model loaded
- Open the browser to the landing page
- Have this narrative on a second screen or printout

---

## Act 1: The Problem (2 minutes)

**Open with the raw material.**

> "Every company has something like this."

Show the `_artifacts/` folder — 66 raw markdown files. This is what most company knowledge looks like: a pile of documents. Maybe it's in Notion. Maybe it's in Confluence. Maybe it's markdown in a Git repo. Either way, it's flat files with no structure, no connections, no metadata.

> "You can search it with Ctrl+F. You can read it top to bottom. But you can't ask it questions. You can't explore it by concept. You can't see how ideas connect across documents. And you definitely can't build products on top of it."

**Key point:** Unstructured knowledge is a cost center. Structured knowledge is a product engine.

---

## Act 2: The Knowledge Graph (4 minutes)

**Show a chapter page.** Navigate to Genesis 1.

> "This is the same text. But now every chapter has been annotated with structured metadata."

Point out the metadata badges at the top of the page:
- **People** — who appears in this chapter
- **Topics** — what themes it covers
- **Locations** — where events take place
- **Era** — when in history
- **Cross-references** — how it connects to other chapters

> "This isn't hand-curated. We ran Claude Code's parallel agents across all 1,189 chapters. Eight agents, each responsible for a section, each reading every chapter and extracting structured metadata. The whole annotation took minutes, not months."

**Click a person badge** (e.g., "God") — it links to the explore page showing every chapter where God appears.

**Click a cross-reference** — it links to the related chapter.

> "Every annotation is a link. Every link is a connection. Every connection is a potential product feature."

---

## Act 3: Browse & Explore (3 minutes)

**Navigate to `/explore`.** Show the four cards.

> "Once you have structured data, browsing becomes trivial."

**Click into People.** Type "Moses" in the filter. Show the results — every chapter where Moses appears, with a click to jump to any of them.

> "This is like having a company directory that shows you not just who someone is, but every document they're mentioned in, every project they touched, every decision they were part of."

**Click into Topics.** Filter for "covenant."

> "These are your company's themes. Your product principles. Your recurring patterns. Instead of searching keyword by keyword, you can browse by concept."

**Click into Eras.** Show the timeline.

> "This is your company timeline. Product launches. Organizational phases. Market shifts. Each era links to everything that happened in it."

**Key point:** Four different products — a people directory, a topic browser, a location explorer, a timeline — all built from the same metadata. No new data collection. Just different views of the same graph.

---

## Act 4: The Graph Visualizer (2 minutes)

**Navigate to `/explore/graph`.**

> "This is where it gets interesting. Let's actually see the graph."

**Click "Moses" in the presets.** Watch the force graph render — Moses at the center, all connected chapters radiating out.

> "You can see at a glance how central Moses is to the narrative. The Old Testament clusters around him."

**Click a chapter node** (e.g., Exodus 14). Watch it expand to show that chapter's people, topics, locations, and cross-references.

> "Every node is explorable. Click to expand. Follow the connections. This isn't a static diagram — it's a live interface on top of the knowledge graph."

**Click "Cross-References" tab.** Show the web of connections between chapters.

> "These are explicit links between documents. In your company, these would be links between a product spec and a support article, between a design doc and a customer complaint, between a quarterly OKR and the features that shipped against it."

**Key point:** The graph isn't just pretty. It reveals structure that's invisible in flat documents. Clusters, connections, patterns — things you can't see when knowledge lives in silos.

---

## Act 5: The AI Layer (4 minutes)

**Click the "Ask" button to open the chat panel.** Show the dynamic suggestions generated from the current page's knowledge graph.

> "The AI isn't just a chatbot. It's an agent with tools."

**Ask:** "How is Moses connected to the exodus?"

Watch the thinking block show `[Searching: find_person_chapters]`, then `[Searching: find_topic_chapters]`, then the response streams in with links.

> "The LLM just searched our knowledge graph — found all chapters with Moses, all chapters about the exodus, looked up specific chapters for detail, then synthesized an answer grounded in our data. Not hallucinated. Not from its training data. From OUR data."

**Click one of the links in the response.** It navigates to the actual chapter.

> "Every mention is a link. The AI doesn't just answer — it creates a web of references you can follow."

**Navigate to a different chapter** (e.g., Revelation 21). **Open the chat.** Show the suggestions change.

> "The chat is context-aware. It knows what page you're on. The suggestions come from that chapter's knowledge graph — its people, topics, cross-references. Ask 'explain this chapter' and the AI already knows which chapter you mean."

**Key point:** The AI layer is the most visible product, but it's the least amount of code. The knowledge graph does the heavy lifting. The AI just queries it.

---

## Act 6: The Meta Point (2 minutes)

**Navigate to `/docs/how-this-was-built/building-the-knowledge-graph`.**

> "Everything you just saw was built in one Claude Code session. One conversation. No team. No sprints. No Jira tickets."

Scroll through the actual prompts.

> "These are the real prompts. 'Familiarize yourself with the repo.' 'I want to transform this into a knowledge graph.' 'Use as many parallel agents as you can.' That's it. The AI did the engineering."

**Show the branch history:**

```
v1 — Knowledge graph + chat
v2 — Custom app + explore pages
v3 — Graph visualizer + dynamic UI
v4 — Agentic chat with tool calling
```

> "Four product iterations in one session. Each branch is a shippable product."

---

## Act 7: The Application to Your Company (2 minutes)

> "The Bible is a stand-in. Replace it with your data."

Walk through the analogy:

| Bible | Your Company |
|-------|-------------|
| 66 books | Your products, departments, or domains |
| 1,189 chapters | Your documents, specs, articles, tickets |
| People (Moses, David, Paul) | Your team members, customers, stakeholders |
| Topics (covenant, faith, prophecy) | Your themes, principles, product areas |
| Locations (Jerusalem, Egypt, Rome) | Your markets, regions, offices |
| Eras (patriarchal, exodus, early church) | Your company phases, quarters, product generations |
| Cross-references | Links between docs, deps between systems |

> "The workflow is the same:"

1. **Collect** your knowledge (markdown, exports from Notion/Confluence, support ticket dumps)
2. **Annotate** with Claude Code's parallel agents (people, topics, categories, relationships)
3. **Index** the metadata for search and aggregation
4. **Build surfaces** — browse, explore, visualize, chat
5. **Ship** — each surface is a product

> "The first time takes a session. Every new product after that takes a prompt."

---

## The Close (1 minute)

> "Most companies treat their knowledge as something to store. We're saying treat it as something to build on."

> "A knowledge graph isn't a documentation project. It's infrastructure. Once you have it, new products are just new views of the same data."

> "The competitive advantage isn't the code — AI writes the code now. The advantage is having your knowledge structured so that AI can actually use it."

> "I have about 10 minutes for questions."

---

**Running time check:** Acts 1-7 + close = ~20 minutes. Leaves 10 minutes for Q&A.

---

## Q&A (10 minutes)

Let the audience drive. Below are prepared answers for likely questions.

### Backup Demos (if asked)

**"How long did this actually take?"**
Show the git log — four commits, one session. The timestamps don't lie.

**"What if my data is in [Notion/Confluence/Google Docs]?"**
Export to markdown. Every platform has an export. Claude Code can parse any format.

**"What about keeping it updated?"**
The annotation scripts are reproducible (`_artifacts/`). Re-run when content changes. Or set up a CI hook.

**"What about sensitive company data?"**
LM Studio runs locally. Nothing leaves your machine. The chat, the search, the graph — all local.

**"What model do you use?"**
Whatever's loaded in LM Studio. This demo ran on a 9B parameter model on a MacBook. Bigger models give better answers but the architecture is the same.

**"Can the AI modify the knowledge graph?"**
Not yet — it reads but doesn't write. But that's the next step: an agent that can propose new annotations, flag outdated content, or suggest missing cross-references.
