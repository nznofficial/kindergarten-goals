/**
 * Cross-checks the asset inventory against what the app actually asks for, and
 * reports which files are still missing on disk. Run any time:
 *
 *   npx tsx scripts/check-assets.ts
 */
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { audioAssets, imageAssets } from './assets'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

const report = (label: string, missing: string[], total: number) => {
  const have = total - missing.length
  console.log(`${label}: ${have}/${total} present`)
  if (missing.length) {
    const preview = missing.slice(0, 12).join(', ')
    console.log(`  missing ${missing.length}: ${preview}${missing.length > 12 ? ' …' : ''}`)
  }
}

const images = imageAssets()
const audio = audioAssets()

report(
  'images',
  images.filter((a) => !existsSync(join(root, 'public/assets/images', `${a.key}.webp`))).map((a) => a.key),
  images.length,
)
report(
  'audio ',
  audio.filter((a) => !existsSync(join(root, 'public/assets/audio', `${a.key}.mp3`))).map((a) => a.key),
  audio.length,
)
