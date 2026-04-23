import express from 'express'
import cron from 'node-cron'
import { readFile } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { searchRecords } from '../src/utils/searchUtils.js'
import { runSync, isSyncRunning } from './sync.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const DATA_DIR = join(ROOT, 'data')
const SHARD_DIR = join(DATA_DIR, 'shards')
const MANIFEST_PATH = join(DATA_DIR, 'manifest.json')
const DIST_DIR = join(ROOT, 'dist')

const NOISE_WORDS = new Set([
  'regular', 'print', 'printed', 'license', 'licence', 'driving',
  'details', 'detail', 'cards', 'card', 'list', 'holder', 'holders',
  'in', 'of', 'the', 'and',
])

function fallbackDisplayName(o) {
  const source = (o.slug || o.file || o.shard || '').replace(/\.(json|pdf)$/i, '')
  const parts = source.toLowerCase().split(/[-_]/).filter(Boolean)
  const kept = parts
    .filter(p => !NOISE_WORDS.has(p))
    .map(p => p.replace(/(tmso|tmo|office)$/i, ''))
    .filter(Boolean)
  if (kept.length === 0) return source
  return kept.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

let manifestCache = null
let validShards = null
const shardCache = new Map()

function resetCaches() {
  manifestCache = null
  validShards = null
  shardCache.clear()
  console.log('[cache] cleared')
}

async function loadManifest() {
  if (manifestCache) return manifestCache
  const raw = JSON.parse(await readFile(MANIFEST_PATH, 'utf8'))
  const offices = (raw.offices || [])
    .filter(o => o.shard)
    .map(o => ({
      shard: o.shard,
      office: o.office || '',
      count: o.count || 0,
      displayName: o.displayName || fallbackDisplayName(o),
      title: o.title || '',
      lastFetchedAt: o.lastFetchedAt || null,
    }))
  offices.sort((a, b) => a.displayName.localeCompare(b.displayName))
  manifestCache = {
    totalRecords: raw.totalRecords || offices.reduce((s, o) => s + o.count, 0),
    generatedAt: raw.generatedAt || null,
    source: raw.source || null,
    offices,
  }
  validShards = new Set(offices.map(o => o.shard))
  return manifestCache
}

async function loadShard(shard) {
  if (shardCache.has(shard)) return shardCache.get(shard)
  const data = JSON.parse(await readFile(join(SHARD_DIR, shard), 'utf8'))
  shardCache.set(shard, data)
  return data
}

const app = express()
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, syncing: isSyncRunning() })
})

app.get('/api/offices', async (_req, res) => {
  try {
    const m = await loadManifest()
    res.json({
      totalRecords: m.totalRecords,
      generatedAt: m.generatedAt,
      source: m.source,
      offices: m.offices,
    })
  } catch (e) {
    console.error('offices error', e)
    res.status(500).json({ error: e.message })
  }
})

app.get('/api/search', async (req, res) => {
  const office = typeof req.query.office === 'string' ? req.query.office : ''
  const q = typeof req.query.q === 'string' ? req.query.q : ''
  if (!office) return res.status(400).json({ error: 'office is required' })
  if (!q.trim()) return res.status(400).json({ error: 'q is required' })

  try {
    await loadManifest()
    if (!validShards.has(office)) {
      return res.status(400).json({ error: 'Unknown office' })
    }
    const records = await loadShard(office)
    const t0 = Date.now()
    const all = searchRecords(records, q)
    const elapsed = Date.now() - t0
    const limit = Math.min(200, Math.max(1, parseInt(req.query.limit, 10) || 100))
    res.json({
      total: all.length,
      truncated: all.length > limit,
      elapsedMs: elapsed,
      results: all.slice(0, limit),
    })
  } catch (e) {
    console.error('search error', e)
    res.status(500).json({ error: e.message })
  }
})

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || ''
function requireAdmin(req, res, next) {
  if (!ADMIN_TOKEN) return next()
  const auth = req.headers.authorization || ''
  const bearer = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  if (bearer !== ADMIN_TOKEN) {
    return res.status(401).json({ error: 'unauthorized' })
  }
  next()
}

app.post('/api/admin/reload', requireAdmin, (_req, res) => {
  resetCaches()
  res.json({ ok: true })
})

app.post('/api/admin/sync', requireAdmin, async (_req, res) => {
  if (isSyncRunning()) {
    return res.status(409).json({ error: 'sync already running' })
  }
  runSync()
    .then(() => resetCaches())
    .catch(e => console.error('[admin/sync]', e))
  res.json({ ok: true, started: true })
})

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(DIST_DIR))
  app.get('*', (_req, res) => res.sendFile(join(DIST_DIR, 'index.html')))
}

const PORT = process.env.PORT || 8787
const SYNC_CRON = process.env.SYNC_CRON || '15 */3 * * *'
const SYNC_ON_STARTUP = process.env.SYNC_ON_STARTUP === 'true'

app.listen(PORT, async () => {
  console.log(`API listening on http://localhost:${PORT}`)
  try {
    const m = await loadManifest()
    console.log(`Manifest: ${m.offices.length} offices, ${m.totalRecords.toLocaleString()} records`)
  } catch (e) {
    console.warn(`No manifest yet (${e.message}). Run sync to populate.`)
  }

  if (SYNC_CRON && SYNC_CRON !== 'off' && cron.validate(SYNC_CRON)) {
    console.log(`[cron] sync scheduled: ${SYNC_CRON}`)
    cron.schedule(SYNC_CRON, async () => {
      console.log('[cron] triggering sync')
      try {
        await runSync()
        resetCaches()
      } catch (e) {
        console.error('[cron] sync failed:', e.message)
      }
    })
  } else {
    console.log('[cron] sync schedule disabled (set SYNC_CRON to enable)')
  }

  if (SYNC_ON_STARTUP) {
    console.log('[startup] running initial sync (SYNC_ON_STARTUP=true)')
    runSync().then(() => resetCaches()).catch(e => console.error('[startup] sync failed:', e))
  }
})
