const LICENSE_RE = /^\d{2}-\d{2}-\d{8}$/
const DATE_RE = /^\d{4}-[A-Z]{3}-\d{2}$/
const CATEGORY_RE = /^[A-K]\d?([,/][A-K]\d?)*$/
const PAGE_MARKER_RE = /^\d+\s*of\s*\d+$/i
const INTEGER_RE = /^\d+$/

const HEADERS = new Set([
  'S.N.', 'S.N', 'SN', 'S/N',
  'License Holder Name', 'Licence Holder Name', 'Name', 'Holder Name',
  'License Number', 'Licence Number', 'License No.', 'Licence No.',
  'Category', 'Categories',
  'Office', 'Issuing Office',
  'License Printed Date', 'Licence Printed Date', 'Print Date', 'Printed Date', 'Date',
])

export function parseItems(rawItems) {
  const items = rawItems.filter(s => !PAGE_MARKER_RE.test(s) && !HEADERS.has(s))
  const records = []
  let i = 0
  while (i < items.length) {
    if (!INTEGER_RE.test(items[i])) { i++; continue }
    const sn = parseInt(items[i], 10)
    let j = i + 1

    const nameParts = []
    while (j < items.length && !LICENSE_RE.test(items[j]) && !INTEGER_RE.test(items[j])) {
      nameParts.push(items[j])
      j++
    }
    if (j >= items.length || !LICENSE_RE.test(items[j])) {
      i++
      continue
    }
    const licenseNumber = items[j]
    j++

    let category = ''
    if (j < items.length && CATEGORY_RE.test(items[j])) {
      category = items[j]
      j++
    }

    let office = ''
    if (j < items.length && !DATE_RE.test(items[j]) && !INTEGER_RE.test(items[j])) {
      office = items[j]
      j++
    }

    let printDate = ''
    if (j < items.length && DATE_RE.test(items[j])) {
      printDate = items[j]
      j++
    }

    if (nameParts.length > 0 && licenseNumber) {
      records.push({
        sn,
        name: nameParts.join(' ').replace(/\s+/g, ' ').trim(),
        licenseNumber,
        category,
        office,
        printDate,
      })
    }
    i = j
  }
  return records
}
