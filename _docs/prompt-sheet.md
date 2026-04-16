# Prompt Sheet

Fallback branches: `v1-knowledge-graph-with-chat`, `v2-custom-app-with-explore`, `v3-graph-visualizer`, `v4-agentic-chat`

---

## 1. Organize (3 min)

```
Familiarize yourself with the repo. I have the King James Bible in markdown. Clean this up and organize it appropriately.
```

---

## 2. Knowledge Graph (5 min)

```
I want to transform this into a detailed knowledge graph. Create rich frontmatter with topics, tags, people, locations, events, cross-references. Do it at the chapter level. Restructure the repo to accommodate this.
```

```
Chapter level. Use as many parallel agents as you can.
```

---

## 3. Build App (5 min)

```
Set up a Nuxt app with @nuxt/ui and @nuxt/content to browse this knowledge graph. I want a sidebar with navigation, a header, and pages that show the chapter content with the metadata rendered as clickable badges.
```

---

## 4. Explore Pages (3 min)

```
Build explore pages so I can browse the knowledge graph by people, topics, locations, and eras. Add search filtering.
```

---

## 5. Graph Visualizer (3 min)

```
Build a D3 force-directed graph visualizer. Let me see the connections visually.
```

---

## 6a. Basic Chat (1 min)

```
Add a chat panel that connects to LM Studio for local AI chat.
```

Demo question: *"What is Genesis 1 about?"*

---

## 6b. Context-Aware Chat (2 min)

```
When the chat opens, feed the current page's metadata into the context automatically. The user is probably asking about whatever they're looking at.
```

Navigate to a chapter, then ask: *"Explain this chapter to me."*

---

## 6c. Research Agent (4 min)

```
Make the chat an agent. Give it tools to search the knowledge graph, look up specific chapters, and find where people and topics appear. Let it dig on its own.
```

Demo question: *"How is Moses connected to the exodus?"*

Watch for `[Searching: ...]` in the thinking block. Click links in the response.
