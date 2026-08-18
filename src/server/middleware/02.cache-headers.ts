import { defineEventHandler, getRequestHeader, getRequestURL, setHeader } from 'h3';

// Cache policy:
// - HTML: no-store so the shell revalidates on each visit
// - Static assets (hashed by Vite): cache forever with immutable
// - API routes: short public cache so CDN/proxies can serve repeat requests
const ASSET_EXT_RE = /\.(?:js|mjs|css|map|png|jpe?g|gif|svg|webp|ico|woff2?|woff|ttf|eot|mp3|mp4|wav|ogg)$/i;

export default defineEventHandler((event) => {
  if (event.method !== 'GET' && event.method !== 'HEAD') return;

  const url = getRequestURL(event);
  const pathname = url.pathname || '';

  if (ASSET_EXT_RE.test(pathname)) {
    setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable');
    return;
  }

  if (pathname.startsWith('/api/v1/')) {
    // Cache API responses for 5 minutes. Stale data fine for this use case;
    // the server-side MongoDB cache (12h TTL) already does the heavy lifting.
    setHeader(event, 'Cache-Control', 'public, max-age=300, s-maxage=300, stale-while-revalidate=60');
    return;
  }

  const accept = getRequestHeader(event, 'accept') || '';
  if (accept.includes('text/html')) {
    // Allow storing but force revalidation on each navigation/load
    setHeader(event, 'Cache-Control', 'no-cache, must-revalidate, max-age=0');
    setHeader(event, 'Pragma', 'no-cache');
  }
});
