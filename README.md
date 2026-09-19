# ZOO Wrocław

GPS navigator for [ZOO Wrocław](https://zoo.wroclaw.pl) — walking routes along the park paths, feeding times, and the official illustrated plan.

**Live:** [shatytskyi.github.io/Zoo-Wroclaw](https://shatytskyi.github.io/Zoo-Wroclaw/)

## Features

- Live GPS on the grounds (falls back to the main gate in preview)
- Walking routes along zoo paths to animals, toilets, food, and smoking areas
- Feeding schedule with countdown and one-tap navigation to the next feeding
- Official illustrated plan with tappable hotspots
- PL / RU / EN
- Walk simulation for trying a route before you go

Unofficial companion. Feeding times follow the zoo’s public schedule and may change without notice.

## GitHub Pages

The site is a static SPA. Each push to `main` builds with `npm run build:pages` and deploys via GitHub Actions.

Local production-style build:

```sh
npm install
npm run build:pages
```

## License

MIT. Map tiles © [CARTO](https://carto.com) / [OpenStreetMap](https://www.openstreetmap.org/copyright). Illustrated plan © ZOO Wrocław.
