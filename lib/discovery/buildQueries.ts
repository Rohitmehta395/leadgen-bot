export function buildSearchQueries(input: {
  industry: string
  signalTypes: string[]
  keywords?: string
  location?: string
}): string[] {
  const { industry, signalTypes, keywords, location } = input
  const loc = location ? ` ${location}` : ''
  const queries: string[] = []

  if (signalTypes.includes('hiring')) {
    queries.push(
      `${industry} company hiring "sales development representative" OR "SDR" OR "BDR" OR "VP of Sales"${loc} 2024 2025`
    )
  }

  if (signalTypes.includes('funding')) {
    queries.push(
      `${industry} startup "series A" OR "series B" OR "seed round" OR "raised" funding${loc} 2024 2025`
    )
  }

  if (signalTypes.includes('growth') || signalTypes.includes('expansion')) {
    queries.push(
      `${industry} company growth expansion "new market" OR "new customers" OR "scaling"${loc} 2024 2025`
    )
  }

  if (keywords) {
    queries.push(`${industry} ${keywords}${loc}`)
  }

  // Always have at least one query
  if (queries.length === 0) {
    queries.push(`${industry} company sales growth${loc} 2024 2025`)
  }

  // Cap at 3 queries to control Firecrawl credit usage
  return queries.slice(0, 3)
}
