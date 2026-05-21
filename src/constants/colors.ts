import type { RelationType } from '../types/graph'

export const RELATION_COLORS: Record<RelationType, string> = {
  influenced_by: '#6366f1',
  influenced: '#22d3ee',
  member_of: '#a78bfa',
  associated_with: '#34d399',
  opponent_of: '#f87171',
}

export const RELATION_LABELS: Record<RelationType, string> = {
  influenced_by: 'Influenced by',
  influenced: 'Influenced',
  member_of: 'Member of',
  associated_with: 'Associated with',
  opponent_of: 'Opponent of',
}

export const NODE_COLORS = {
  person: '#e2e8f0',
  movement: '#a78bfa',
  concept: '#34d399',
  unknown: '#94a3b8',
  selected: '#f8fafc',
  hover: '#ffffff',
}

export const GRAPH_COLORS = {
  background: '#0a0a0f',
  nodeStroke: '#1e1e2e',
  edgeDefault: '#2d2d3d',
  text: '#94a3b8',
  textSelected: '#f1f5f9',
}
