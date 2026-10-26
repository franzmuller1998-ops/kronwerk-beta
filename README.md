# KRONWERK music

Production-ready Next.js concept for KRONWERK music.

## Run
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
npm start
```

Routes:
- /
- /apply
- /events
- /events/bar-x-krasnodar
- /about
- /contact

The ColorFlow component uses a lightweight WebGL fragment shader with a CSS fallback.
It supports cursor interaction on fine pointers and respects prefers-reduced-motion.


### Offline/local development
This version does not use `next/font/google`, so Next.js does not need to download Google Fonts during `next dev`. This avoids long startup/compile delays on networks where Google font requests are blocked or slow.
