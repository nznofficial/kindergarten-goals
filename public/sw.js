/**
 * Offline support. The point is an iPad in a car with no signal: once the game
 * has been opened on wifi, every picture and every voice clip is already on the
 * device, so it plays exactly the same with the network off.
 *
 * CACHE_VERSION is rewritten on each build so a deploy cannot be served stale.
 */
const CACHE_VERSION = 'kg-__BUILD_ID__'
/** Every file in the build, injected by scripts/stamp-sw.ts. */
const PRECACHE = "__PRECACHE__"
const scope = new URL(self.registration.scope).pathname

/**
 * ignoreVary is essential, not a nicety. Servers that send `Vary: Origin` -
 * vite preview does - make an exact cache match fail for module scripts, so the
 * app caches perfectly and then still refuses to start offline.
 */
const MATCH = { ignoreVary: true }

/** Precache in batches; a single addAll of ~550 files fails as a unit. */
async function precache(cache, urls, batchSize = 24) {
  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize)
    await Promise.all(
      batch.map((url) =>
        cache.add(new Request(url, { cache: 'reload' })).catch(() => {
          // One missing asset must not abort the whole install.
        }),
      ),
    )
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_VERSION)
      await precache(cache, [scope, ...PRECACHE.map((f) => scope + f)])
      await self.skipWaiting()
    })(),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
      await self.clients.claim()
    })(),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  // Navigations come from the network first so a new deploy is picked up, and
  // fall back to the cached page when there is no network at all.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone()
          caches.open(CACHE_VERSION).then((c) => c.put(scope + 'index.html', copy))
          return res
        })
        .catch(async () => (await caches.match(scope + 'index.html', MATCH)) ?? Response.error()),
    )
    return
  }

  // Everything else is a hashed build file or a generated asset: both are
  // immutable for the life of a cache version, so serve from cache first.
  event.respondWith(
    caches.match(request, MATCH).then(
      (hit) =>
        hit ??
        fetch(request).then((res) => {
          if (res.ok) {
            const copy = res.clone()
            caches.open(CACHE_VERSION).then((c) => c.put(request, copy))
          }
          return res
        }),
    ),
  )
})
