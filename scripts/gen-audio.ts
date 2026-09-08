/**
 * Build-time voice generation. Run once:
 *
 *   OPENAI_API_KEY=sk-... npm run gen:audio
 *
 * Produces every spoken clip the game needs as an mp3 under public/assets/audio,
 * which is then committed. The deployed game never calls an API.
 *
 * Flags:
 *   --only <substring>   regenerate just the keys that match
 *   --force              redo clips that already exist
 *   --voice <name>       try a different narrator
 */
import { existsSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import OpenAI from 'openai'
import { audioAssets } from './assets'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'public/assets/audio')

const args = process.argv.slice(2)
const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : null
const force = args.includes('--force')
const voice = args.includes('--voice') ? args[args.indexOf('--voice') + 1] : 'coral'

const key = process.env.OPENAI_API_KEY
if (!key) {
  console.error('OPENAI_API_KEY is not set. Try: OPENAI_API_KEY=sk-... npm run gen:audio')
  process.exit(1)
}
const client = new OpenAI({ apiKey: key })

const filePath = (k: string) => join(outDir, `${k}.mp3`)

async function main() {
  const all = audioAssets()
  const queue = all.filter((a) => {
    if (only && !a.key.includes(only)) return false
    return force || !existsSync(filePath(a.key))
  })

  console.log(`${queue.length} clips to generate with voice "${voice}" (${all.length} in the set)`)

  let done = 0
  let failed = 0
  const workers = Array.from({ length: 6 }, async () => {
    for (;;) {
      const asset = queue.shift()
      if (!asset) return
      try {
        const speech = await client.audio.speech.create({
          model: 'gpt-4o-mini-tts',
          voice,
          input: asset.text,
          instructions: asset.instructions,
          response_format: 'mp3',
        })
        const buffer = Buffer.from(await speech.arrayBuffer())
        await mkdir(dirname(filePath(asset.key)), { recursive: true })
        await writeFile(filePath(asset.key), buffer)
        done += 1
        if (done % 25 === 0) console.log(`  ${done} done, ${queue.length} left`)
      } catch (err) {
        failed += 1
        console.error(`  FAILED ${asset.key}: ${(err as Error).message}`)
      }
    }
  })
  await Promise.all(workers)

  console.log(`\ndone: ${done} generated, ${failed} failed`)
  console.log('Now listen to public/assets/audio/letters/sound-*.mp3 before shipping -')
  console.log('the letter sounds are the one category a TTS model gets wrong.')
}

await main()
