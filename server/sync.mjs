import { readFile, writeFile, mkdir, rename } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  listCategoryEntries,
  extractPdfUrl,
  downloadPdf,
  pdfBasenameFromUrl,
  slugFromContentPath,
} from './lib/dotmScraper.mjs'
import { parsePdfPath } from './lib/pdfParser.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const DATA_DIR = join(ROOT, 'data')
const SHARD_DIR = join(DATA_DIR, 'shards')
const DOWNLOAD_DIR = join(DATA_DIR, 'downloads')
const MANIFEST_PATH = join(DATA_DIR, 'manifest.json')

const SOURCE_URL = 'https://dotm.gov.np/category/details-of-printed-licenses/'
const POLITE_DELAY_MS = 1500

let running = false

const NOISE_WORDS = new Set([
  'regular', 'print', 'printed', 'license', 'licence', 'driving',
  'details', 'detail', 'cards', 'card', 'list', 'holder', 'holders',
  'in', 'of', 'the', 'and',
])

function officeDisplayName(slug, title) {
  const parts = (slug || '').toLowerCase().split('-').filter(Boolean)
  const kept = parts
    .filter(p => !NOISE_WORDS.has(p))
    .map(p => p.replace(/(tmso|tmo|office)$/i, ''))
    .filter(Boolean)
  if (kept.length === 0) return title || slug || ''
  return kept.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

async function loadExistingManifest() {
  try {
    return JSON.parse(await readFile(MANIFEST_PATH, 'utf8'))
  } catch {
    return { offices: [] }
  }
}

async function writeAtomic(path, contents) {
  const tmp = path + '.tmp'
  await writeFile(tmp, contents)
  await rename(tmp, path)
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

export function isSyncRunning() {
  return running
}

export async function runSync({ onProgress } = {}) {
  if (running) {
    console.log('[sync] already running; skip')
    return { skipped: true }
  }
  running = true
  const startedAt = Date.now()

  try {
    await mkdir(SHARD_DIR, { recursive: true })
    await mkdir(DOWNLOAD_DIR, { recursive: true })

    const existing = await loadExistingManifest()
    const byContent = new Map((existing.offices || []).map(o => [o.contentPath, o]))

    console.log(`[sync] fetching listings from ${SOURCE_URL}`)
    const entries = await listCategoryEntries()
    console.log(`[sync] found ${entries.length} content pages`)

    const offices = []
    let downloaded = 0
    let parsed = 0
    let unchanged = 0
    let failed = 0

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i]
      const slug = slugFromContentPath(entry.contentPath)
      const shardName = `${slug}.json`
      const shardPath = join(SHARD_DIR, shardName)

      try {
        if (onProgress) onProgress({ stage: 'fetching', index: i, total: entries.length, slug })
        const pdfUrl = await extractPdfUrl(entry.contentPath)
        if (!pdfUrl) {
          console.warn(`[sync] ${slug}: no PDF link found`)
          failed++
          continue
        }

        const basename = pdfBasenameFromUrl(pdfUrl)
        if (!basename) {
          console.warn(`[sync] ${slug}: could not parse PDF filename`)
          failed++
          continue
        }
        const pdfPath = join(DOWNLOAD_DIR, basename)

        const prior = byContent.get(entry.contentPath)
        const priorIsCurrent =
          prior && prior.pdfBasename === basename && existsSync(shardPath) && existsSync(pdfPath)

        if (priorIsCurrent) {
          console.log(`[sync] ${slug}: unchanged (${basename})`)
          offices.push(prior)
          unchanged++
          continue
        }

        if (!existsSync(pdfPath)) {
          console.log(`[sync] ${slug}: downloading ${basename}`)
          await downloadPdf(pdfUrl, pdfPath)
          downloaded++
        } else {
          console.log(`[sync] ${slug}: pdf already present, re-parsing`)
        }

        if (onProgress) onProgress({ stage: 'parsing', index: i, total: entries.length, slug })
        const records = await parsePdfPath(pdfPath)

        if (records.length === 0) {
          console.warn(`[sync] ${slug}: 0 records parsed — skipping (likely not a print list)`)
          continue
        }

        await writeAtomic(shardPath, JSON.stringify(records))
        parsed++

        offices.push({
          contentPath: entry.contentPath,
          slug,
          title: entry.title,
          shard: shardName,
          pdfUrl,
          pdfBasename: basename,
          office: records[0]?.office || '',
          displayName: officeDisplayName(slug, entry.title),
          count: records.length,
          lastFetchedAt: new Date().toISOString(),
        })

        console.log(`[sync] ${slug}: ${records.length} records`)
      } catch (e) {
        console.error(`[sync] ${slug}: FAILED — ${e.message}`)
        failed++
        const prior = byContent.get(entry.contentPath)
        if (prior && prior.count > 0 && existsSync(join(SHARD_DIR, prior.shard))) {
          offices.push(prior)
        }
      }

      if (i < entries.length - 1) await sleep(POLITE_DELAY_MS)
    }

    const totalRecords = offices.reduce((s, o) => s + (o.count || 0), 0)
    const manifest = {
      source: SOURCE_URL,
      generatedAt: new Date().toISOString(),
      totalRecords,
      offices,
    }
    await writeAtomic(MANIFEST_PATH, JSON.stringify(manifest, null, 2))

    const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1)
    console.log(
      `[sync] done in ${elapsed}s — downloaded=${downloaded}, parsed=${parsed}, unchanged=${unchanged}, failed=${failed}, totalRecords=${totalRecords.toLocaleString()}`
    )
    return { elapsedSec: Number(elapsed), downloaded, parsed, unchanged, failed, totalRecords, offices: offices.length }
  } finally {
    running = false
  }
}

const isMainModule = import.meta.url === `file://${process.argv[1]}`
if (isMainModule) {
  runSync().catch(e => {
    console.error(e)
    process.exit(1)
  })
}
