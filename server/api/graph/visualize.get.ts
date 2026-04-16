import { loadIndex } from '../../utils/search-graph'

interface GraphNode {
  id: string
  label: string
  type: 'chapter' | 'person' | 'topic' | 'location'
  group: string // testament or category
  path?: string
}

interface GraphLink {
  source: string
  target: string
  type: 'cross-reference' | 'person' | 'topic' | 'location'
  label?: string
}

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const filterType = (query.type as string) || 'cross-references'
  const filterValue = query.value as string | undefined
  const limit = parseInt(query.limit as string) || 150

  const index = loadIndex()
  const nodes = new Map<string, GraphNode>()
  const links: GraphLink[] = []

  if (filterType === 'cross-references') {
    // Show cross-reference network — chapters linked by explicit cross-refs
    const chaptersWithRefs = index.filter(ch => ch.crossReferences.length > 0)
    const selected = filterValue
      ? chaptersWithRefs.filter(ch =>
          ch.book.toLowerCase().includes(filterValue.toLowerCase())
          || ch.title.toLowerCase().includes(filterValue.toLowerCase()),
        )
      : chaptersWithRefs.slice(0, limit)

    for (const ch of selected) {
      nodes.set(ch.path, {
        id: ch.path,
        label: ch.title,
        type: 'chapter',
        group: ch.testament,
        path: ch.path,
      })

      for (const ref of ch.crossReferences) {
        const refSlug = ref.book.toLowerCase().replace(/\s+/g, '-')
        // Try to find the referenced chapter in our index
        const target = index.find(e =>
          e.book.toLowerCase() === ref.book.toLowerCase() && e.chapter === ref.chapter,
        )
        if (target) {
          nodes.set(target.path, {
            id: target.path,
            label: target.title,
            type: 'chapter',
            group: target.testament,
            path: target.path,
          })
          links.push({
            source: ch.path,
            target: target.path,
            type: 'cross-reference',
            label: ref.label,
          })
        }
      }
    }
  } else if (filterType === 'person' && filterValue) {
    // Show all chapters connected to a person
    const personChapters = index.filter(ch =>
      ch.peopleNames.some(p => p.toLowerCase() === filterValue.toLowerCase()),
    )

    const personId = `person:${filterValue}`
    nodes.set(personId, {
      id: personId,
      label: filterValue,
      type: 'person',
      group: 'person',
    })

    for (const ch of personChapters.slice(0, limit)) {
      nodes.set(ch.path, {
        id: ch.path,
        label: ch.title,
        type: 'chapter',
        group: ch.testament,
        path: ch.path,
      })
      links.push({
        source: personId,
        target: ch.path,
        type: 'person',
      })
    }
  } else if (filterType === 'topic' && filterValue) {
    // Show all chapters connected to a topic
    const topicChapters = index.filter(ch =>
      ch.topics.some(t => t.toLowerCase() === filterValue.toLowerCase()),
    )

    const topicId = `topic:${filterValue}`
    nodes.set(topicId, {
      id: topicId,
      label: filterValue,
      type: 'topic',
      group: 'topic',
    })

    for (const ch of topicChapters.slice(0, limit)) {
      nodes.set(ch.path, {
        id: ch.path,
        label: ch.title,
        type: 'chapter',
        group: ch.testament,
        path: ch.path,
      })
      links.push({
        source: topicId,
        target: ch.path,
        type: 'topic',
      })
    }
  } else if (filterType === 'location' && filterValue) {
    const locChapters = index.filter(ch =>
      ch.locations.some(l => l.toLowerCase() === filterValue.toLowerCase()),
    )

    const locId = `location:${filterValue}`
    nodes.set(locId, {
      id: locId,
      label: filterValue,
      type: 'location',
      group: 'location',
    })

    for (const ch of locChapters.slice(0, limit)) {
      nodes.set(ch.path, {
        id: ch.path,
        label: ch.title,
        type: 'chapter',
        group: ch.testament,
        path: ch.path,
      })
      links.push({
        source: locId,
        target: ch.path,
        type: 'location',
      })
    }
  } else if (filterType === 'chapter' && filterValue) {
    // Show everything connected to a specific chapter
    const chapter = index.find(ch => ch.path === filterValue || ch.title.toLowerCase() === filterValue.toLowerCase())
    if (chapter) {
      nodes.set(chapter.path, {
        id: chapter.path,
        label: chapter.title,
        type: 'chapter',
        group: chapter.testament,
        path: chapter.path,
      })

      // Add people
      for (const name of chapter.peopleNames) {
        const pid = `person:${name}`
        nodes.set(pid, { id: pid, label: name, type: 'person', group: 'person' })
        links.push({ source: chapter.path, target: pid, type: 'person' })
      }

      // Add topics
      for (const topic of chapter.topics) {
        const tid = `topic:${topic}`
        nodes.set(tid, { id: tid, label: topic, type: 'topic', group: 'topic' })
        links.push({ source: chapter.path, target: tid, type: 'topic' })
      }

      // Add locations
      for (const loc of chapter.locations.filter(l => typeof l === 'string')) {
        const lid = `location:${loc}`
        nodes.set(lid, { id: lid, label: loc, type: 'location', group: 'location' })
        links.push({ source: chapter.path, target: lid, type: 'location' })
      }

      // Add cross-references
      for (const ref of chapter.crossReferences) {
        const target = index.find(e =>
          e.book.toLowerCase() === ref.book.toLowerCase() && e.chapter === ref.chapter,
        )
        if (target) {
          nodes.set(target.path, {
            id: target.path,
            label: target.title,
            type: 'chapter',
            group: target.testament,
            path: target.path,
          })
          links.push({ source: chapter.path, target: target.path, type: 'cross-reference', label: ref.label })
        }
      }
    }
  }

  return {
    nodes: Array.from(nodes.values()),
    links,
  }
})
