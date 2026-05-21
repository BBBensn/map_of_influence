import { useEffect, useRef, useCallback } from 'react'
import * as d3 from 'd3'
import type { GraphNode, GraphEdge } from '../types/graph'
import { RELATION_COLORS, NODE_COLORS, GRAPH_COLORS } from '../constants/colors'

interface Props {
  nodes: GraphNode[]
  edges: GraphEdge[]
  selectedNodeId: string | null
  onNodeClick: (node: GraphNode) => void
}

const NODE_RADIUS = 8
const SELECTED_RADIUS = 12

export function GraphCanvas({ nodes, edges, selectedNodeId, onNodeClick }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const simulationRef = useRef<d3.Simulation<GraphNode, GraphEdge> | null>(null)
  const onNodeClickRef = useRef(onNodeClick)
  onNodeClickRef.current = onNodeClick

  const initSimulation = useCallback(() => {
    const svg = svgRef.current
    if (!svg) return

    const width = svg.clientWidth || window.innerWidth
    const height = svg.clientHeight || window.innerHeight

    d3.select(svg).selectAll('*').remove()

    const defs = d3.select(svg).append('defs')
    Object.entries(RELATION_COLORS).forEach(([rel, color]) => {
      defs.append('marker')
        .attr('id', `arrow-${rel}`)
        .attr('viewBox', '0 -4 8 8')
        .attr('refX', NODE_RADIUS + 10)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-4L8,0L0,4')
        .attr('fill', color)
        .attr('opacity', 0.6)
    })

    const root = d3.select(svg).append('g').attr('class', 'root')

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        root.attr('transform', event.transform.toString())
      })

    d3.select(svg).call(zoom)

    const edgeGroup = root.append('g').attr('class', 'edges')
    const nodeGroup = root.append('g').attr('class', 'nodes')

    const nodeCopies: GraphNode[] = nodes.map(n => ({ ...n }))
    const edgeCopies: GraphEdge[] = edges.map(e => ({ ...e }))

    if (simulationRef.current) simulationRef.current.stop()

    const simulation = d3.forceSimulation<GraphNode>(nodeCopies)
      .force('link', d3.forceLink<GraphNode, GraphEdge>(edgeCopies)
        .id(d => d.id)
        .distance(120)
        .strength(0.4)
      )
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide(NODE_RADIUS + 20))

    simulationRef.current = simulation

    const link = edgeGroup.selectAll<SVGLineElement, GraphEdge>('line')
      .data(edgeCopies)
      .join('line')
      .attr('stroke', d => RELATION_COLORS[d.relation] ?? GRAPH_COLORS.edgeDefault)
      .attr('stroke-width', 1.5)
      .attr('stroke-opacity', 0.4)
      .attr('marker-end', d => `url(#arrow-${d.relation})`)

    const nodeEl = nodeGroup.selectAll<SVGGElement, GraphNode>('g')
      .data(nodeCopies, d => d.id)
      .join('g')
      .attr('class', 'node')
      .style('cursor', 'pointer')
      .call(
        d3.drag<SVGGElement, GraphNode>()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart()
            d.fx = d.x
            d.fy = d.y
          })
          .on('drag', (event, d) => {
            d.fx = event.x
            d.fy = event.y
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0)
            d.fx = null
            d.fy = null
          })
      )
      .on('click', (_event, d) => {
        onNodeClickRef.current(d)
      })

    nodeEl.append('circle')
      .attr('r', d => d.id === selectedNodeId ? SELECTED_RADIUS : NODE_RADIUS)
      .attr('fill', d => {
        const base = NODE_COLORS[d.type] ?? NODE_COLORS.unknown
        return d.id === selectedNodeId ? NODE_COLORS.selected : base
      })
      .attr('stroke', d => d.id === selectedNodeId ? '#6366f1' : GRAPH_COLORS.nodeStroke)
      .attr('stroke-width', d => d.id === selectedNodeId ? 2 : 1)
      .attr('opacity', 0.9)

    nodeEl.append('text')
      .text(d => d.label)
      .attr('dy', d => (d.id === selectedNodeId ? SELECTED_RADIUS : NODE_RADIUS) + 14)
      .attr('text-anchor', 'middle')
      .attr('fill', d => d.id === selectedNodeId ? GRAPH_COLORS.textSelected : GRAPH_COLORS.text)
      .attr('font-size', '11px')
      .attr('font-family', 'Inter, system-ui, sans-serif')
      .attr('pointer-events', 'none')

    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as GraphNode).x ?? 0)
        .attr('y1', d => (d.source as GraphNode).y ?? 0)
        .attr('x2', d => (d.target as GraphNode).x ?? 0)
        .attr('y2', d => (d.target as GraphNode).y ?? 0)

      nodeEl.attr('transform', d => `translate(${d.x ?? 0},${d.y ?? 0})`)
    })
  }, [nodes, edges, selectedNodeId])

  useEffect(() => {
    initSimulation()
    return () => {
      simulationRef.current?.stop()
    }
  }, [initSimulation])

  return (
    <svg
      ref={svgRef}
      style={{
        width: '100%',
        height: '100%',
        background: GRAPH_COLORS.background,
        display: 'block',
      }}
    />
  )
}
