# Vercel for the frontend, Convex for the backend

The Vue frontend and all bundled official assets are served from Vercel, and Convex holds rosters, proxies the franchise source APIs (whose keys cannot sit in the browser) and stores user-added portraits. We chose this over Cloudflare (Pages, Workers, D1, R2) because Vercel is already the owner's host and Convex covers data, server functions, file storage and auth hooks in one service; Cloudflare's advantage was free image egress.

## Consequences

- Convex has no official Vue SDK, so the app talks to it through a thin wrapper of our own (or a community library) rather than depending on first-party bindings.
- Convex file bandwidth is metered and small on the free plan. Only user-added portraits are served from Convex, kept as small cropped images, and they sit behind the asset layer so they can move to cheaper storage if traffic demands it.
