import { useState, useCallback } from 'react'
import { GraphCanvas } from './components/GraphCanvas'
import { SearchBar } from './components/SearchBar'
import { Sidebar } from './components/Sidebar'
import { LoadingOverlay } from './components/LoadingOverlay'
import { ParticleBackground } from './components/ParticleBackground'
import { fetchNodeRelations } from './services/wikidata'
import { fetchWikipediaInfo } from './services/wikipedia'
import type { GraphNode, GraphEdge, WikidataSearchResult } from './types/graph'

export default function App() {
  const [nodes, setNodes] = useState<GraphNode[]>([])
  const [edges, setEdges] = useState<GraphEdge[]>([])
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEmpty = nodes.length === 0

  const loadNode = useCallback(async (qid: string, label: string) => {
    setLoading(true)
    setError(null)
    try {
      const nodeData = await fetchNodeRelations(qid)

      const rootNode: GraphNode = {
        id: qid,
        label: nodeData.label || label,
        type: nodeData.type,
        wikidataId: qid,
        wikipediaTitle: nodeData.wikipediaTitle,
      }

      if (nodeData.wikipediaTitle) {
        const info = await fetchWikipediaInfo(nodeData.wikipediaTitle)
        rootNode.thumbnailUrl = info.thumbnailUrl
        rootNode.description = info.description
      }

      setNodes(prev => {
        const existingIds = new Set(prev.map(n => n.id))
        const newRelNodes: GraphNode[] = nodeData.relations
          .filter(rel => !existingIds.has(rel.targetId))
          .map(rel => ({
            id: rel.targetId,
            label: rel.targetLabel,
            type: rel.targetType,
            wikidataId: rel.targetId,
          }))

        const updated = prev.map(n => n.id === qid ? rootNode : n)
        if (!existingIds.has(qid)) updated.push(rootNode)
        return [...updated, ...newRelNodes]
      })

      setEdges(prev => {
        const existingKeys = new Set(
          prev.map(e => {
            const s = typeof e.source === 'string' ? e.source : (e.source as GraphNode).id
            const t = typeof e.target === 'string' ? e.target : (e.target as GraphNode).id
            return `${s}:${t}:${e.relation}`
          })
        )
        const newEdges: GraphEdge[] = nodeData.relations
          .filter(rel => !existingKeys.has(`${qid}:${rel.targetId}:${rel.relation}`))
          .map(rel => ({
            source: qid,
            target: rel.targetId,
            relation: rel.relation,
          }))
        return [...prev, ...newEdges]
      })

      setSelectedNode(rootNode)
    } catch (e) {
      setError('Could not load data. Try a different search.')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleSearch = useCallback((result: WikidataSearchResult) => {
    void loadNode(result.id, result.label)
  }, [loadNode])

  const handleNodeClick = useCallback((node: GraphNode) => {
    setSelectedNode(node)
    void loadNode(node.wikidataId, node.label)
  }, [loadNode])

  const handleRelationClick = useCallback((targetId: string, targetLabel: string) => {
    void loadNode(targetId, targetLabel)
  }, [loadNode])

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: '#0a0a0f',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {isEmpty && <ParticleBackground />}

      {!isEmpty && (
        <GraphCanvas
          nodes={nodes}
          edges={edges}
          selectedNodeId={selectedNode?.id ?? null}
          onNodeClick={handleNodeClick}
        />
      )}

      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: selectedNode ? '300px' : 0,
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: isEmpty ? 'center' : 'flex-start',
        height: isEmpty ? '100vh' : 'auto',
        padding: isEmpty ? '0' : '20px 24px',
        pointerEvents: 'none',
        transition: 'right 0.2s ease',
      }}>
        {isEmpty && (
          <div style={{ textAlign: 'center', marginBottom: '32px', pointerEvents: 'none' }}>
            <h1 style={{
              margin: '0 0 8px',
              color: '#f8fafc',
              fontSize: '28px',
              fontWeight: 600,
              fontFamily: 'Inter, system-ui, sans-serif',
              letterSpacing: '-0.02em',
            }}>
              Map of Influence
            </h1>
            <p style={{
              margin: 0,
              color: '#475569',
              fontSize: '15px',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}>
              Explore the intellectual lineage of ideas
            </p>
          </div>
        )}
        <div style={{ pointerEvents: 'auto', width: '100%', maxWidth: '480px' }}>
          <SearchBar onSelect={handleSearch} disabled={loading} />
        </div>

        {error && (
          <div style={{
            marginTop: '12px',
            padding: '8px 14px',
            background: 'rgba(248,113,113,0.1)',
            border: '1px solid rgba(248,113,113,0.2)',
            borderRadius: '7px',
            color: '#f87171',
            fontSize: '13px',
            fontFamily: 'Inter, system-ui, sans-serif',
            pointerEvents: 'auto',
          }}>
            {error}
          </div>
        )}
      </div>

      <Sidebar
        node={selectedNode}
        edges={edges}
        allNodes={nodes}
        onRelationClick={handleRelationClick}
      />

      {loading && <LoadingOverlay message="Fetching connections…" />}
    </div>
  )
}
