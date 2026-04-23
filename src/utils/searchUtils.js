export function searchRecords(records, rawQuery) {
  const query = (rawQuery || '').trim()
  if (!query) return []

  if (looksLikeLicenseNumber(query)) {
    const stripped = query.replace(/[-\s]/g, '').toLowerCase()
    return records
      .filter(r => r.licenseNumber.replace(/-/g, '').toLowerCase().includes(stripped))
      .sort((a, b) => a.sn - b.sn)
  }

  const norm = query.toLowerCase().replace(/\s+/g, ' ').trim()
  const terms = norm.split(' ').filter(Boolean)
  return records
    .filter(r => {
      const hay = r.name.toLowerCase().replace(/\s+/g, ' ')
      return terms.every(t => hay.includes(t))
    })
    .sort((a, b) => a.sn - b.sn)
}

export function looksLikeLicenseNumber(q) {
  const stripped = q.replace(/[-\s]/g, '')
  return stripped.length >= 2 && /^\d+$/.test(stripped)
}
