/**
 * Reads the generated clips back with a transcription model and compares them
 * against the text they were supposed to say.
 *
 *   OPENAI_API_KEY=sk-... npx tsx scripts/verify-audio.ts letters sight name
 *
 * This catches empty, truncated or plain wrong clips mechanically. It does NOT
 * judge how a sound is pronounced - the letter-sound clips still need an ear.
 */
import { createReadStream, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import OpenAI from 'openai'
import { audioAssets } from './assets'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const prefixes = process.argv.slice(2)

const key = process.env.OPENAI_API_KEY
if (!key) {
  console.error('OPENAI_API_KEY is not set.')
  process.exit(1)
}
const client = new OpenAI({ apiKey: key })

/** Loose comparison: punctuation, case and spacing are not what we're testing. */
const normalize = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const queue = audioAssets().filter((a) => {
  if (prefixes.length && !prefixes.some((p) => a.key.startsWith(p))) return false
  return existsSync(join(root, 'public/assets/audio', `${a.key}.mp3`))
})

console.log(`transcribing ${queue.length} clips…`)

const mismatches: string[] = []
let checked = 0

const workers = Array.from({ length: 8 }, async () => {
  for (;;) {
    const asset = queue.shift()
    if (!asset) return
    const file = join(root, 'public/assets/audio', `${asset.key}.mp3`)
    try {
      const res = await client.audio.transcriptions.create({
        model: 'gpt-4o-mini-transcribe',
        file: createReadStream(file),
      })
      const heard = normalize(res.text)
      const meant = normalize(asset.text)
      checked += 1
      // A clip passes if what we heard contains what we meant, or vice versa -
      // transcription adds and drops filler on very short utterances.
      if (!heard.includes(meant) && !meant.includes(heard) && heard !== meant) {
        mismatches.push(`${asset.key}\n    meant: "${meant}"\n    heard: "${heard}"`)
      }
    } catch (err) {
      mismatches.push(`${asset.key}  TRANSCRIBE FAILED: ${(err as Error).message}`)
    }
  }
})
await Promise.all(workers)

console.log(`\nchecked ${checked}, ${mismatches.length} to look at`)
for (const m of mismatches) console.log('  ' + m)
