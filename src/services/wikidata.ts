import type { WikidataRelation, WikidataSearchResult, NodeType } from '../types/graph'

const SPARQL_ENDPOINT = 'https://query.wikidata.org/sparql'
const WIKIDATA_API = 'https://www.wikidata.org/w/api.php'
const USER_AGENT = 'map-of-influence/1.0 (benni@bensn.me)'

const PERSON_QID = 'Q5'

const NOISE_TERMS = [
  'award', 'prize', 'medal', 'honor',
  'book by', 'novel by', 'anthology', 'bibliography', 'discography', 'filmography',
  'album by', 'film by', 'television series', 'tv series',
  'list of', 'category of',
  'newspaper', 'magazine',
]

function isNoise(description: string): boolean {
  const lower = description.toLowerCase()
  return NOISE_TERMS.some(term => lower.includes(term))
}

function resolveNodeType(instanceOfIds: string[]): NodeType {
  if (instanceOfIds.includes(PERSON_QID)) return 'person'
  if (instanceOfIds.length > 0) return 'concept'
  return 'unknown'
}

export async function searchWikidata(query: string): Promise<WikidataSearchResult[]> {
  const params = new URLSearchParams({
    action: 'wbsearchentities',
    search: query,
    language: 'en',
    limit: '15',
    format: 'json',
    origin: '*',
  })

  const res = await fetch(`${WIKIDATA_API}?${params}`, {
    headers: { 'User-Agent': USER_AGENT },
  })

  if (!res.ok) return []

  const data = await res.json() as {
    search: Array<{ id: string; label: string; description?: string }>
  }

  return (data.search ?? [])
    .filter(item => !isNoise(item.description ?? ''))
    .slice(0, 5)
    .map(item => ({
      id: item.id,
      label: item.label,
      description: item.description ?? '',
    }))
}

interface SparqlBinding {
  relType?: { value: string }
  targetId?: { value: string }
  targetLabel?: { value: string }
  targetTypeId?: { value: string }
  subjectLabel?: { value: string }
  wpTitle?: { value: string }
}

export async function fetchNodeRelations(qid: string): Promise<{
  label: string
  type: NodeType
  wikipediaTitle: string | undefined
  relations: WikidataRelation[]
}> {
  const sparql = `
SELECT DISTINCT ?relType ?targetId ?targetLabel ?targetTypeId ?subjectLabel ?wpTitle WHERE {
  BIND(wd:${qid} AS ?subject)
  {
    { ?subject wdt:P737 ?target . BIND("influenced_by" AS ?relType) }
    UNION
    { ?target wdt:P737 ?subject . BIND("influenced" AS ?relType) }
    UNION
    { ?subject wdt:P463 ?target . BIND("member_of" AS ?relType) }
    UNION
    { ?subject wdt:P1344 ?target . BIND("associated_with" AS ?relType) }
    UNION
    { ?subject wdt:P1365 ?target . BIND("opponent_of" AS ?relType) }
  }
  OPTIONAL { ?target wdt:P31 ?targetTypeId }
  OPTIONAL {
    ?wpArticle schema:about ?subject ;
               schema:inLanguage "en" ;
               schema:isPartOf <https://en.wikipedia.org/> .
    BIND(REPLACE(STR(?wpArticle), "https://en.wikipedia.org/wiki/", "") AS ?wpTitle)
  }
  SERVICE wikibase:label {
    bd:serviceParam wikibase:language "en".
    ?subject rdfs:label ?subjectLabel .
    ?target rdfs:label ?targetLabel .
  }
  BIND(REPLACE(STR(?target), "http://www.wikidata.org/entity/", "") AS ?targetId)
}
LIMIT 50
`

  const res = await fetch(`${SPARQL_ENDPOINT}?query=${encodeURIComponent(sparql)}`, {
    headers: {
      Accept: 'application/sparql-results+json',
      'User-Agent': USER_AGENT,
    },
  })

  if (!res.ok) throw new Error(`Wikidata SPARQL error: ${res.status}`)

  const data = await res.json() as { results: { bindings: SparqlBinding[] } }
  const bindings = data.results.bindings

  if (bindings.length === 0) {
    return { label: qid, type: 'unknown', wikipediaTitle: undefined, relations: [] }
  }

  const first = bindings[0]
  const label = first.subjectLabel?.value ?? qid
  const wpTitle = first.wpTitle?.value

  const relations: WikidataRelation[] = []
  const seen = new Set<string>()

  for (const row of bindings) {
    const targetId = row.targetId?.value
    const targetLabel = row.targetLabel?.value
    const relType = row.relType?.value as WikidataRelation['relation'] | undefined
    const targetTypeId = row.targetTypeId?.value?.replace('http://www.wikidata.org/entity/', '')

    if (!targetId || !targetLabel || !relType) continue
    const key = `${targetId}:${relType}`
    if (seen.has(key)) continue
    seen.add(key)

    relations.push({
      targetId,
      targetLabel,
      targetType: resolveNodeType(targetTypeId ? [targetTypeId] : []),
      relation: relType,
    })
  }

  return { label, type: 'person', wikipediaTitle: wpTitle, relations }
}
