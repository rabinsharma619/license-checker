import { writeFile } from 'node:fs/promises'

const BASE = 'https://dotm.gov.np'
const UA = 'license-checker-sync/1.0'
const MAX_PAGES = 50

async function fetchText(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA, 'Accept': 'text/html' } })
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`)
  return res.text()
}

function extractListingEntries(html) {
  const out = []
  const re = /<h3 class="card__title">\s*<a href="\s*(\/content\/\d+\/[^"]+?)\s*"[^>]*>\s*([\s\S]*?)\s*<\/a>/g
  let m
  while ((m = re.exec(html))) {
    const contentPath = m[1].trim()
    const title = m[2].trim().replace(/\s+/g, ' ')
    out.push({ contentPath, title })
  }
  return out
}

export async function listCategoryEntries(categoryPath = '/category/details-of-printed-licenses/') {
  const entries = []
  const seen = new Set()
  for (let page = 1; page <= MAX_PAGES; page++) {
    const url = `${BASE}${categoryPath}?page=${page}`
    let html
    try {
      html = await fetchText(url)
    } catch (e) {
      console.warn(`[scraper] ${url} failed: ${e.message}`)
      break
    }
    const pageEntries = extractListingEntries(html)
    if (pageEntries.length === 0) break
    let newlyAdded = 0
    for (const e of pageEntries) {
      if (!seen.has(e.contentPath)) {
        seen.add(e.contentPath)
        entries.push(e)
        newlyAdded++
      }
    }
    if (newlyAdded === 0) break
  }
  return entries
}

export async function extractPdfUrl(contentPath) {
  const html = await fetchText(`${BASE}${contentPath}`)
  const m = html.match(/https:\/\/giwmscdnone\.gov\.np\/media\/pdf_upload\/[^"'\s<>]+\.pdf/i)
  return m ? m[0].replace(/&amp;/g, '&') : null
}

export async function downloadPdf(url, destPath) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  await writeFile(destPath, buf)
  return {
    bytes: buf.length,
    lastModified: res.headers.get('last-modified') || null,
    etag: res.headers.get('etag') || null,
  }
}

export function pdfBasenameFromUrl(url) {
  try {
    const u = new URL(url)
    return decodeURIComponent(u.pathname.split('/').pop() || '')
  } catch {
    return ''
  }
}

export function slugFromContentPath(path) {
  const parts = path.split('/').filter(Boolean)
  return parts[parts.length - 1] || parts.join('_')
}
