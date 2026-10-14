const CACHE_VERSION = 'lakon-v2'
const HALAMAN_PRIBADI = ['/profil']
const PAGE_CACHE = `${CACHE_VERSION}-pages`
const ASSET_CACHE = `${CACHE_VERSION}-assets`

const PRECACHE_PAGES = [
  '/',
  '/skenario',
  '/skenario/kedai-kopi',
  '/skenario/puskesmas',
  '/skenario/transportasi',
  '/skenario/wawancara-kerja',
  '/skenario/darurat',
  '/masuk',
  '/daftar',
  '/api/content',
]

const ASSET_HOSTS = ['cdn.jsdelivr.net', 'storage.googleapis.com']

const isAssetRequest = (url) => {
  if (ASSET_HOSTS.includes(url.hostname)) return true
  if (url.origin !== self.location.origin) return false
  return (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/models/') ||
    url.pathname.startsWith('/mediapipe/') ||
    /\.(vrm|onnx|wasm|task|woff2?)$/.test(url.pathname)
  )
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(PAGE_CACHE)
      .then((cache) =>
        Promise.allSettled(
          PRECACHE_PAGES.map(async (page) => {
            const response = await fetch(page)
            if (response.ok && !response.redirected) await cache.put(page, response)
          }),
        ),
      )
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => !key.startsWith(CACHE_VERSION)).map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('message', (event) => {
  if (event.data === 'lakon-keluar') event.waitUntil(caches.delete(PAGE_CACHE))
})

const cacheFirst = async (request) => {
  const cache = await caches.open(ASSET_CACHE)
  const cached = await cache.match(request, { ignoreVary: true })
  if (cached) return cached
  const response = await fetch(request)
  if (response.ok || response.type === 'opaque') {
    cache.put(request, response.clone())
  }
  return response
}

const networkFirst = async (request, fallbackUrl) => {
  const cache = await caches.open(PAGE_CACHE)
  const pribadi = HALAMAN_PRIBADI.includes(new URL(request.url).pathname)
  try {
    const response = await fetch(request)
    if (response.ok && !response.redirected && !pribadi) cache.put(request, response.clone())
    return response
  } catch (err) {
    const cached = pribadi
      ? null
      : await cache.match(request, { ignoreVary: true, ignoreSearch: true })
    if (cached) return cached
    if (fallbackUrl) {
      const fallback = await cache.match(fallbackUrl)
      if (fallback) return fallback
    }
    throw err
  }
}

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return
  const url = new URL(request.url)

  if (isAssetRequest(url)) {
    event.respondWith(cacheFirst(request))
    return
  }

  if (url.origin === self.location.origin && url.pathname === '/api/content') {
    event.respondWith(networkFirst(request))
    return
  }

  if (url.origin === self.location.origin && url.pathname.startsWith('/api/')) {
    return
  }

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, '/'))
  }
})
