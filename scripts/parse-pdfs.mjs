import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'
import { readFile, writeFile, readdir, mkdir, stat } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseItems } from '../src/utils/parseItems.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const OUT_DIR = join(ROOT, 'data')
const SHARD_DIR = join(OUT_DIR, 'shards')

function safeName(file) {
  return file.replace(/\.pdf$/i, '').replace(/[^a-zA-Z0-9-_]+/g, '_')
}

function fmtBytes(n) {
  if (n >= 1024 * 1024) return (n / 1024 / 1024).toFixed(1) + 'MB'
  if (n >= 1024) return (n / 1024).toFixed(1) + 'KB'
  return n + 'B'
}

async function parsePdf(filePath) {
  const data = await readFile(filePath)
  const pdf = await getDocument({
    data: new Uint8Array(data),
    useWorkerFetch: false,
    isEvalSupported: false,
    useSystemFonts: false,
    verbosity: 0,
  }).promise
  const records = []
  for (let p = 1; p <= pdf.numPages; p++) {
    try {
      const page = await pdf.getPage(p)
      const content = await page.getTextContent()
      const items = content.items.map(i => (i.str || '').trim()).filter(Boolean)
      records.push(...parseItems(items))
      page.cleanup()
    } catch (e) {
      console.warn(`    page ${p} failed: ${e.message}`)
    }
  }
  await pdf.destroy()
  return records
}

async function main() {
  await mkdir(SHARD_DIR, { recursive: true })

  const files = (await readdir(ROOT))
    .filter(f => f.toLowerCase().endsWith('.pdf'))
    .sort()

  console.log(`Found ${files.length} PDFs\n`)

  const manifest = []

  for (const file of files) {
    const shardPath = join(SHARD_DIR, safeName(file) + '.json')
    const pdfSize = (await stat(join(ROOT, file))).size
    console.log(`${file} (${fmtBytes(pdfSize)})`)

    if (existsSync(shardPath)) {
      const existing = JSON.parse(await readFile(shardPath, 'utf8'))
      console.log(`  → cached: ${existing.length} records`)
      manifest.push({
        file,
        shard: safeName(file) + '.json',
        office: existing[0]?.office || '',
        count: existing.length,
      })
      continue
    }

    const t0 = Date.now()
    try {
      const records = await parsePdf(join(ROOT, file))
      const elapsed = ((Date.now() - t0) / 1000).toFixed(1)
      await writeFile(shardPath, JSON.stringify(records))
      const shardSize = (await stat(shardPath)).size
      console.log(`  → ${records.length} records, ${fmtBytes(shardSize)} (${elapsed}s)`)
      manifest.push({
        file,
        shard: safeName(file) + '.json',
        office: records[0]?.office || '',
        count: records.length,
      })
    } catch (e) {
      console.error(`  ✗ FAILED: ${e.message}`)
      manifest.push({ file, error: e.message })
    }
  }

  const allRecords = []
  const seenLicense = new Set()
  let duplicates = 0
  for (const entry of manifest) {
    if (!entry.shard) continue
    const shardPath = join(SHARD_DIR, entry.shard)
    const recs = JSON.parse(await readFile(shardPath, 'utf8'))
    for (const r of recs) {
      if (seenLicense.has(r.licenseNumber)) { duplicates++; continue }
      seenLicense.add(r.licenseNumber)
      allRecords.push(r)
    }
  }

  await writeFile(join(OUT_DIR, 'records.json'), JSON.stringify(allRecords))
  const totalSize = (await stat(join(OUT_DIR, 'records.json'))).size

  const summary = {
    totalRecords: allRecords.length,
    duplicatesSkipped: duplicates,
    generatedAt: new Date().toISOString(),
    offices: manifest,
  }
  await writeFile(join(OUT_DIR, 'manifest.json'), JSON.stringify(summary, null, 2))

  console.log('\n=== Summary ===')
  console.log(`Total unique records: ${allRecords.length.toLocaleString()}`)
  console.log(`Duplicates skipped:   ${duplicates}`)
  console.log(`records.json size:    ${fmtBytes(totalSize)}`)
  console.log(`Output:               ${OUT_DIR}`)
}

main().catch(e => { console.error(e); process.exit(1) })
