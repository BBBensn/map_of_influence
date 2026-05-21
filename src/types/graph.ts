import type { SimulationNodeDatum, SimulationLinkDatum } from 'd3'

export type RelationType =
  | 'influenced_by'
  | 'influenced'
  | 'member_of'
  | 'associated_with'
  | 'opponent_of'

export type NodeType = 'person' | 'movement' | 'concept' | 'unknown'

export interface GraphNode extends SimulationNodeDatum {
  id: string
  label: string
  type: NodeType
  wikidataId: string
  wikipediaTitle?: string
  description?: string
  thumbnailUrl?: string
}

export interface GraphEdge extends SimulationLinkDatum<GraphNode> {
  source: string | GraphNode
  target: string | GraphNode
  relation: RelationType
}

export interface WikidataRelation {
  targetId: string
  targetLabel: string
  targetType: NodeType
  relation: RelationType
}

export interface WikidataSearchResult {
  id: string
  label: string
  description: string
}
