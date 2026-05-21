import type { GraphNode, GraphEdge } from '../types/graph'
import { RELATION_COLORS, RELATION_LABELS } from '../constants/colors'

interface Props {
  node: GraphNode | null
  edges: GraphEdge[]
  allNodes: GraphNode[]
  onRelationClick: (targetId: string, targetLabel: string) => void
}

export function Sidebar({ node, edges, allNodes, onRelationClick }: Props) {
  if (!node) return null

  const nodeEdges = edges.filter(e => {
    const srcId = typeof e.source === 'string' ? e.source : e.source.id
    const tgtId = typeof e.target === 'string' ? e.target : e.target.id
    return srcId === node.id || tgtId === node.id
  })

  const relations = nodeEdges.map(e => {
    const srcId = typeof e.source === 'string' ? e.source : e.source.id
    const tgtId = typeof e.target === 'string' ? e.target : e.target.id
    const isSource = srcId === node.id
    const otherId = isSource ? tgtId : srcId
    const otherNode = allNodes.find(n => n.id === otherId)
    return {
      id: otherId,
      label: otherNode?.label ?? otherId,
      relation: e.relation,
    }
  })

  return (
    <aside style={{
      position: 'fixed',
      top: 0,
      right: 0,
      width: '300px',
      height: '100vh',
      background: '#0d0d14',
      borderLeft: '1px solid rgba(255,255,255,0.06)',
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
      zIndex: 50,
      animation: 'slideIn 0.2s ease-out',
    }}>
      {node.thumbnailUrl && (
        <div style={{
          width: '100%',
          height: '200px',
          overflow: 'hidden',
          flexShrink: 0,
          position: 'relative',
        }}>
          <img
            src={node.thumbnailUrl}
            alt={node.label}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.85,
              display: 'block',
            }}
          />
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '80px',
            background: 'linear-gradient(transparent, #0d0d14)',
          }} />
        </div>
      )}

      <div style={{ padding: '24px', flex: 1 }}>
        <h2 style={{
          margin: '0 0 6px',
          color: '#f8fafc',
          fontSize: '18px',
          fontWeight: 600,
          fontFamily: 'Inter, system-ui, sans-serif',
          lineHeight: 1.3,
        }}>
          {node.label}
        </h2>

        {node.description && (
          <p style={{
            margin: '0 0 24px',
            color: '#64748b',
            fontSize: '13px',
            lineHeight: 1.6,
            fontFamily: 'Inter, system-ui, sans-serif',
          }}>
            {node.description}
          </p>
        )}

        {relations.length > 0 && (
          <>
            <div style={{
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.08em',
              color: '#475569',
              textTransform: 'uppercase',
              marginBottom: '10px',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}>
              Relations
            </div>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
              {relations.map((r, i) => (
                <li
                  key={`${r.id}-${i}`}
                  onClick={() => onRelationClick(r.id, r.label)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 10px',
                    marginBottom: '2px',
                    borderRadius: '7px',
                    cursor: 'pointer',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLLIElement).style.background = 'rgba(255,255,255,0.04)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLLIElement).style.background = 'transparent' }}
                >
                  <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: RELATION_COLORS[r.relation],
                    flexShrink: 0,
                  }} />
                  <div>
                    <div style={{ color: '#e2e8f0', fontSize: '13px', fontFamily: 'Inter, system-ui, sans-serif' }}>
                      {r.label}
                    </div>
                    <div style={{ color: '#475569', fontSize: '11px', fontFamily: 'Inter, system-ui, sans-serif' }}>
                      {RELATION_LABELS[r.relation]}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </aside>
  )
}
