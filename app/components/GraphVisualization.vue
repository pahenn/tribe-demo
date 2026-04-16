<script setup lang="ts">
import * as d3 from 'd3'

interface GraphNode extends d3.SimulationNodeDatum {
  id: string
  label: string
  type: 'chapter' | 'person' | 'topic' | 'location'
  group: string
  path?: string
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  type: 'cross-reference' | 'person' | 'topic' | 'location'
  label?: string
}

const props = defineProps<{
  nodes: GraphNode[]
  links: GraphLink[]
}>()

const emit = defineEmits<{
  nodeClick: [node: GraphNode]
}>()

const containerRef = ref<HTMLElement>()
const tooltip = ref({ show: false, x: 0, y: 0, text: '', type: '', path: '', id: '' })
const tooltipHovered = ref(false)
let tooltipTimeout: ReturnType<typeof setTimeout> | null = null

function hideTooltip() {
  tooltipTimeout = setTimeout(() => {
    if (!tooltipHovered.value) {
      tooltip.value.show = false
    }
  }, 200)
}

function getNodeLink(node: { type: string; path?: string; label: string }) {
  if (node.path) return node.path
  if (node.type === 'person') return `/explore/people/${encodeURIComponent(node.label.toLowerCase())}`
  if (node.type === 'topic') return `/explore/topics/${encodeURIComponent(node.label)}`
  if (node.type === 'location') return `/explore/locations/${encodeURIComponent(node.label.toLowerCase())}`
  return ''
}

const colorMap: Record<string, string> = {
  'old-testament': '#6366f1',
  'new-testament': '#10b981',
  'person': '#f59e0b',
  'topic': '#ec4899',
  'location': '#06b6d4',
}

function getColor(node: GraphNode) {
  return colorMap[node.group] || colorMap[node.type] || '#94a3b8'
}

function getRadius(node: GraphNode) {
  if (node.type === 'person' || node.type === 'topic' || node.type === 'location') return 10
  return 5
}

let simulation: d3.Simulation<GraphNode, GraphLink> | null = null

function renderGraph() {
  if (!containerRef.value || props.nodes.length === 0) return

  // Clean up previous
  if (simulation) simulation.stop()
  d3.select(containerRef.value).select('svg').remove()

  const width = containerRef.value.clientWidth
  const height = containerRef.value.clientHeight

  const svg = d3.select(containerRef.value)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', [0, 0, width, height])

  // Zoom
  const g = svg.append('g')
  svg.call(
    d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 5])
      .on('zoom', (event) => {
        g.attr('transform', event.transform)
      }) as any,
  )

  // Deep clone nodes/links so D3 can mutate them
  const nodes: GraphNode[] = props.nodes.map(n => ({ ...n }))
  const links: GraphLink[] = props.links.map(l => ({
    ...l,
    source: l.source,
    target: l.target,
  }))

  simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink<GraphNode, GraphLink>(links).id(d => d.id).distance(60))
    .force('charge', d3.forceManyBody().strength(-120))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide().radius(12))

  // Links
  const link = g.append('g')
    .selectAll('line')
    .data(links)
    .join('line')
    .attr('stroke', '#e2e8f0')
    .attr('stroke-width', 1)
    .attr('stroke-opacity', 0.6)

  // Nodes
  const node = g.append('g')
    .selectAll('circle')
    .data(nodes)
    .join('circle')
    .attr('r', d => getRadius(d))
    .attr('fill', d => getColor(d))
    .attr('stroke', '#fff')
    .attr('stroke-width', 1.5)
    .attr('cursor', d => d.path ? 'pointer' : 'default')
    .on('click', (_event, d) => {
      emit('nodeClick', d)
    })
    .on('mouseenter', (event, d) => {
      if (tooltipTimeout) clearTimeout(tooltipTimeout)
      const rect = containerRef.value!.getBoundingClientRect()
      tooltip.value = {
        show: true,
        x: event.clientX - rect.left,
        y: event.clientY - rect.top - 10,
        text: d.label,
        type: d.type,
        path: getNodeLink(d),
        id: d.id,
      }
      // Highlight connected
      link.attr('stroke', l =>
        (l.source as any).id === d.id || (l.target as any).id === d.id ? getColor(d) : '#e2e8f0',
      ).attr('stroke-width', l =>
        (l.source as any).id === d.id || (l.target as any).id === d.id ? 2 : 1,
      )
    })
    .on('mouseleave', () => {
      hideTooltip()
      link.attr('stroke', '#e2e8f0').attr('stroke-width', 1)
    })
    .call(
      d3.drag<SVGCircleElement, GraphNode>()
        .on('start', (event, d) => {
          if (!event.active) simulation!.alphaTarget(0.3).restart()
          d.fx = d.x
          d.fy = d.y
        })
        .on('drag', (event, d) => {
          d.fx = event.x
          d.fy = event.y
        })
        .on('end', (event, d) => {
          if (!event.active) simulation!.alphaTarget(0)
          d.fx = null
          d.fy = null
        }),
    )

  // Labels for non-chapter nodes (people, topics, locations)
  const labels = g.append('g')
    .selectAll('text')
    .data(nodes.filter(n => n.type !== 'chapter'))
    .join('text')
    .text(d => d.label)
    .attr('font-size', 10)
    .attr('dx', 14)
    .attr('dy', 4)
    .attr('fill', '#64748b')
    .attr('pointer-events', 'none')

  simulation.on('tick', () => {
    link
      .attr('x1', d => (d.source as any).x)
      .attr('y1', d => (d.source as any).y)
      .attr('x2', d => (d.target as any).x)
      .attr('y2', d => (d.target as any).y)

    node
      .attr('cx', d => d.x!)
      .attr('cy', d => d.y!)

    labels
      .attr('x', d => d.x!)
      .attr('y', d => d.y!)
  })
}

onMounted(() => renderGraph())
watch(() => [props.nodes, props.links], () => nextTick(renderGraph), { deep: true })

onBeforeUnmount(() => {
  if (simulation) simulation.stop()
})
</script>

<template>
  <div ref="containerRef" class="relative w-full h-full min-h-[500px] bg-default rounded-lg border border-default overflow-hidden">
    <!-- Tooltip -->
    <div
      v-if="tooltip.show"
      class="absolute z-10 rounded-md bg-inverted px-2.5 py-1.5 text-xs text-inverted shadow-lg"
      :style="{ left: `${tooltip.x}px`, top: `${tooltip.y}px`, transform: 'translate(-50%, -100%)' }"
      @mouseenter="tooltipHovered = true; if (tooltipTimeout) clearTimeout(tooltipTimeout)"
      @mouseleave="tooltipHovered = false; hideTooltip()"
    >
      <span class="capitalize text-dimmed">{{ tooltip.type }}:</span> {{ tooltip.text }}
      <NuxtLink
        v-if="tooltip.path"
        :to="tooltip.path"
        class="ml-1.5 text-primary underline hover:no-underline"
      >
        open →
      </NuxtLink>
    </div>

    <!-- Legend -->
    <div class="absolute bottom-3 left-3 flex flex-wrap gap-3 text-xs text-muted bg-default/80 backdrop-blur-sm rounded-md px-3 py-2 border border-default">
      <div class="flex items-center gap-1.5">
        <span class="size-2.5 rounded-full bg-[#6366f1]" />
        Old Testament
      </div>
      <div class="flex items-center gap-1.5">
        <span class="size-2.5 rounded-full bg-[#10b981]" />
        New Testament
      </div>
      <div class="flex items-center gap-1.5">
        <span class="size-2.5 rounded-full bg-[#f59e0b]" />
        Person
      </div>
      <div class="flex items-center gap-1.5">
        <span class="size-2.5 rounded-full bg-[#ec4899]" />
        Topic
      </div>
      <div class="flex items-center gap-1.5">
        <span class="size-2.5 rounded-full bg-[#06b6d4]" />
        Location
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="nodes.length === 0" class="absolute inset-0 flex items-center justify-center text-muted text-sm">
      Select a filter to visualize the graph
    </div>
  </div>
</template>
