/**
 * Bakes the precache list and a build id into the service worker.
 *
 * Runs after `vite build`, so it can walk the real dist/ output. That matters:
 * an earlier version built the list from public/ alone and silently missed the
 * hashed JS and CSS bundles, which meant the app cached every picture and voice
 * clip but could not actually start with the network off.
 */
import { createHash } from 'node:crypto'
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')

async function walk(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true })
  const nested = await Promise.all(
    entries.map((e) => (e.isDirectory() ? walk(join(dir, e.name)) : Promise.resolve([join(dir, e.name)]))),
  )
  return nested.flat()
}

const files = (await walk(dist))
  .map((f) => relative(dist, f).split('\\').join('/'))
  // sw.js is fetched by the browser, not from the cache, and .DS_Store is noise.
  .filter((f) => f !== 'sw.js' && !f.endsWith('.DS_Store'))
  .sort()

const buildId = createHash('sha256').update(files.join('\n')).digest('hex').slice(0, 12)

const swPath = join(dist, 'sw.js')
const sw = await readFile(swPath, 'utf8')
await writeFile(
  swPath,
  sw.replace('__BUILD_ID__', buildId).replace('"__PRECACHE__"', JSON.stringify(files)),
)

const bytes = files.length
console.log(`sw.js: build ${buildId}, ${bytes} files precached for offline play`)
