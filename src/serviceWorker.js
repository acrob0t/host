const cacheName = "OfflineCache";
const staticAssets = ["./", "./index.html", "./style.css", "./index.js"];

self.addEventListener("install", async (e) => {
  const cache = await caches.open(cacheName);
  await cache.addAll(staticAssets);
  return self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  self.clients.claim();
});

self.addEventListener("fetch", async (event) => {
  const req = event.request;

  const url = new URL(req.url);

  // check if the request is requiring data from our own application(location)

  if (url.origin === location.origin) {
    // check our cache

    event.respondWith(checkCache(req));
  }

  // else, fetch from the network and cache that result
  else {
    event.respondWith(checkNetwork(req));
  }
});

async function checkCache(req) {
  // open our cache

  const cache = await caches.open(cacheName);

  // check if there’s data there that match with what the request requires

  const cachedData = await cache.match(req);

  // if there’s data cached, return it, else fetch from the network

  return cachedData || fetch(req);
}

async function checkNetwork(req) {
  // open our cache

  const cache = await caches.open(cacheName);

  // try to fetch data from the network

  try {
    // save the fetched data

    const freshData = await fetch(req);

    // save a copy of the response to your cache

    await cache.put(req, freshData.clone());

    // send the response back (returned the fetched data)

    return freshData;
  } catch (err) {
    // if we are unable to fetch from the network (offline)

    // match the request with data from the cache

    const cachedData = await cache.match(req);

    // return the cached data

    return cachedData;
  }
}
