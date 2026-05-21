interface WikipediaSummary {
  thumbnailUrl: string | undefined
  description: string
}

interface WikipediaApiResponse {
  thumbnail?: { source: string }
  extract?: string
  description?: string
}

async function fetchSummary(lang: string, title: string): Promise<WikipediaSummary | null> {
  const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const data = await res.json() as WikipediaApiResponse
    return {
      thumbnailUrl: data.thumbnail?.source,
      description: data.description ?? data.extract?.slice(0, 200) ?? '',
    }
  } catch {
    return null
  }
}

export async function fetchWikipediaInfo(title: string): Promise<WikipediaSummary> {
  const decoded = decodeURIComponent(title)
  const enResult = await fetchSummary('en', decoded)
  if (enResult) return enResult

  const deResult = await fetchSummary('de', decoded)
  if (deResult) return deResult

  return { thumbnailUrl: undefined, description: '' }
}
