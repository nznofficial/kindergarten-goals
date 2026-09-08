# My BIG List of Kindergarten Goals

An offline-friendly web game covering the twenty goals on the kindergarten goals
sheet, plus the school's own quarter-by-quarter sight word list. Twenty
selectable mini-games, a star map that mirrors the paper checklist, and a fox
who reads every instruction out loud — because kindergartners can't read the UI yet.

Live at **https://nznofficial.github.io/kindergarten-goals/**

## How it is put together

Twenty goals, six engines. Each goal is *data*, not its own code:

| Engine | Goals it drives |
| --- | --- |
| `TapPick` | capitals, lowercase, letter sounds, first sounds, last sounds, rhyme matching, sight words, CVC words, number ID, more/less, add within 5, subtract within 5 |
| `Trace` | write my name, write numbers 0–20 |
| `BuildIt` | produce a rhyme, write a sentence |
| `Sequence` | count to 100 by 1s, count to 100 by 10s |
| `CountIt` | count objects 1–20 |
| `SortBin` | compare and classify objects |

Shared rules live in `src/components/useRound.ts`: eight items a round, three
tries an item, then the answer is shown. Stars come from first-try accuracy, so
a revealed answer costs a star but never ends the round.

Letters and numerals are drawn from `src/data/strokes.ts` rather than set in a
font. Ordinary fonts render a two-story `a` and `g`, which are not the shapes a
kindergartner is taught to write; drawing from the stroke data means what they
recognize and what they trace are the same letterforms.

## Running it

```bash
npm install
npm run dev            # http://localhost:5173
npm run dev -- --host  # also reachable from an iPad on the same network
npm run build
```

## Making it yours

Edit `src/config/child.ts` with the child's name, then regenerate the spoken
name clips:

```bash
OPENAI_API_KEY=sk-... npx tsx scripts/gen-audio.ts --only name
```

## Generated assets

Art and voice are generated **at build time on a developer machine** and
committed. GitHub Pages is static — there is nowhere to hide an API key — so the
deployed game makes no API calls, costs nothing per play, and works offline.

```bash
OPENAI_API_KEY=sk-... npm run gen:images -- --anchor  # style anchor first, then look at it
OPENAI_API_KEY=sk-... npm run gen:images              # the remaining ~173
OPENAI_API_KEY=sk-... npm run gen:audio               # ~390 clips
npx tsx scripts/check-assets.ts                       # what is still missing
```

Every prompt lives in `scripts/assets.ts`, derived from the same data files the
app reads — add a word to `src/data/objects.ts` and its picture and voice clip
are queued automatically. Existing files are skipped, so a re-run only fills gaps.

**The letter-sound clips need a human ear.** No TTS model will say a bare `/b/`
on request; it says "buh". Those clips use the classroom pattern instead —
letter, keyword, keyword — and all twenty-six should be listened to before
shipping.

## Offline

The point is an iPad in a car with no signal. A service worker precaches the
whole build - every bundle, picture and voice clip, 565 files - on first visit,
so once it has been opened on wifi the game plays identically with the network
off. `scripts/stamp-sw.ts` builds that list by walking the real `dist/` after
vite runs, and stamps a build id so a deploy can never be served stale.

Add it to the iPad home screen from Safari's share sheet and it launches
full-screen with its own icon.

## Deploying

Pushing to `main` builds and publishes via `.github/workflows/deploy.yml`.
`vite.config.ts` sets `base` to the repo name, which is what makes assets resolve
under the `github.io/kindergarten-goals/` subpath.
