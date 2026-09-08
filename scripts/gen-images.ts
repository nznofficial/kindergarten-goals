/**
 * Build-time illustration generation. Run once (or after adding words):
 *
 *   OPENAI_API_KEY=sk-... npm run gen:images
 *
 * The results are committed to the repo. Nothing in the deployed game ever
 * calls an API - GitHub Pages has no server to hide a key in.
 *
 * Flags:
 *   --only <a,b,c>       regenerate just the keys matching any of these substrings
 *   --force              redo assets that already exist
 *   --anchor             (re)generate only the style anchor, for approval
 */
import { createReadStream, existsSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import OpenAI, { toFile } from 'openai'
import sharp from 'sharp'
import { anchorKey, imageAssets, type ImageAsset } from './assets'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'public/assets/images')
const rawDir = join(root, '.asset-cache/images')

const args = process.argv.slice(2)
const only = args.includes('--only') ? args[args.indexOf('--only') + 1].split(',') : null
const force = args.includes('--force')
const anchorOnly = args.includes('--anchor')

const key = process.env.OPENAI_API_KEY
if (!key) {
  console.error('OPENAI_API_KEY is not set. Try: OPENAI_API_KEY=sk-... npm run gen:images')
  process.exit(1)
}
const client = new OpenAI({ apiKey: key })

const finalPath = (k: string) => join(outDir, `${k}.webp`)
const rawPath = (k: string) => join(rawDir, `${k}.png`)

/** Trim the transparent margin, square it up, and shrink to what the UI needs. */
async function postProcess(pngBuffer: Buffer, k: string) {
  await mkdir(dirname(finalPath(k)), { recursive: true })
  await mkdir(dirname(rawPath(k)), { recursive: true })
  await writeFile(rawPath(k), pngBuffer)

  await sharp(pngBuffer)
    .trim({ threshold: 10 })
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 88, effort: 6 })
    .toFile(finalPath(k))
}

function decode(result: { data?: { b64_json?: string }[] } | undefined): Buffer {
  const b64 = result?.data?.[0]?.b64_json
  if (!b64) throw new Error('no image returned')
  return Buffer.from(b64, 'base64')
}

/**
 * Every edit call uploads the anchor, and the account is capped at five input
 * images per minute. Concurrency alone cannot beat that, so requests are paced
 * through a rolling-window gate; the workers exist to overlap the ~30s the
 * model spends drawing, not to send more per minute.
 */
const RPM = 5
const sent: number[] = []

async function takeSlot(): Promise<void> {
  for (;;) {
    const now = Date.now()
    while (sent.length && now - sent[0] > 60_000) sent.shift()
    if (sent.length < RPM) {
      sent.push(now)
      return
    }
    await new Promise((r) => setTimeout(r, 60_000 - (now - sent[0]) + 250))
  }
}

/** Retries a 429 for as long as the server keeps telling us to wait. */
async function withRetry<T>(label: string, fn: () => Promise<T>, tries = 6): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    try {
      await takeSlot()
      return await fn()
    } catch (err) {
      const message = (err as Error).message ?? ''
      const rateLimited = message.includes('429') || message.includes('Rate limit')
      if (!rateLimited || attempt >= tries) throw err
      const suggested = Number(message.match(/try again in (\d+)/)?.[1] ?? 0)
      const waitMs = Math.max(suggested * 1000, 5_000) * attempt
      console.log(`  waiting ${Math.round(waitMs / 1000)}s after rate limit on ${label}`)
      await new Promise((r) => setTimeout(r, waitMs))
    }
  }
}

async function generate(asset: ImageAsset, anchor: string | null): Promise<Buffer> {
  // Everything after the anchor is generated as an edit against it, which is
  // what keeps 150 separate calls looking like one illustrator drew them.
  if (anchor && existsSync(anchor)) {
    // toFile attaches a filename and mimetype; a bare stream is rejected as
    // application/octet-stream.
    const result = await withRetry(asset.key, async () =>
      client.images.edit({
        model: 'gpt-image-1',
        image: [await toFile(createReadStream(anchor), 'anchor.png', { type: 'image/png' })],
        prompt: `${asset.prompt}\n\nMatch the art style, line weight, shading and finish of the reference image exactly. Draw the described subject only - do not copy the reference subject. Use the subject's own natural real-world colors; do not tint it toward the reference image's orange palette.`,
        size: '1024x1024',
        quality: 'medium',
        background: 'transparent',
      }),
    )
    return decode(result as never)
  }

  const result = await withRetry(asset.key, async () =>
    client.images.generate({
      model: 'gpt-image-1',
      prompt: asset.prompt,
      size: '1024x1024',
      quality: 'medium',
      background: 'transparent',
      output_format: 'png',
    }),
  )
  return decode(result as never)
}

async function main() {
  const all = imageAssets()
  const anchorAsset = all.find((a) => a.isAnchor)!
  const anchorFile = rawPath(anchorKey)

  // The anchor must exist before anything else, since every other call
  // references it.
  if (!existsSync(anchorFile) || force || anchorOnly) {
    console.log('generating style anchor…')
    await postProcess(await generate(anchorAsset, null), anchorKey)
    console.log(`  anchor ready: ${finalPath(anchorKey)}`)
    console.log('  Look at it before continuing - everything else copies its style.')
  }
  if (anchorOnly) return

  const queue = all.filter((a) => {
    if (a.isAnchor) return false
    if (only && !only.some((frag) => a.key.includes(frag))) return false
    return force || !existsSync(finalPath(a.key))
  })

  console.log(`${queue.length} images to generate (${all.length} total in the set)`)

  let done = 0
  let failed = 0
  // Five workers to overlap the draw time; the gate above sets the actual pace.
  const workers = Array.from({ length: 5 }, async () => {
    for (;;) {
      const asset = queue.shift()
      if (!asset) return
      try {
        await postProcess(await generate(asset, anchorFile), asset.key)
        done += 1
        console.log(`  [${done}/${done + queue.length + failed}] ${asset.key}`)
      } catch (err) {
        failed += 1
        console.error(`  FAILED ${asset.key}: ${(err as Error).message}`)
      }
    }
  })
  await Promise.all(workers)

  console.log(`\ndone: ${done} generated, ${failed} failed`)
  if (failed) console.log('Re-run the command to retry only the ones that are still missing.')
}

await main()
