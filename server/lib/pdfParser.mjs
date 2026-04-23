import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'
import { readFile } from 'node:fs/promises'
import { parseItems } from '../../src/utils/parseItems.js'

export async function parsePdfPath(path) {
  const data = await readFile(path)
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
      for (const r of parseItems(items)) records.push(r)
      page.cleanup()
    } catch (e) {
      console.warn(`[pdfParser] page ${p} failed: ${e.message}`)
    }
  }
  await pdf.destroy()
  return records
}
