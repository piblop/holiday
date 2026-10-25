# Cobs on Tour — Spain/France trip planner

Interactive scrollytelling map of the October 2027 trip, built from
`Spain advice from annette.docx` plus the date-anchored plan (Fri 1 Oct → Fri 22 Oct 2027,
one direction north→south via La Rochelle, finishing with the Bamberg beer finale
before flying home from Frankfurt).

## Run

```
node app/server.mjs
# → http://localhost:8793
```

No build step, no dependencies. Leaflet + Google Fonts load from CDN;
destination photos load live from the Wikipedia REST API (fallback tiles offline).

## What it does

- **Scroll to drive the route** — the sticky map flies stop-to-stop as you read;
  the route draws itself in red, visited markers turn gold, a ticker tracks stop + km.
- **19 stop cards** with dates, photos, Annette's verbatim advice, clickable highlight
  links (restaurants/sights → official sites or Google Maps), booking notes and € ballparks.
- **Trip summary** (button in the hero) — the whole itinerary as one table with the
  book-now list and open decisions. Print/save-PDF friendly.

## Cobs on Tour — the game (`app/game.html`)

A phone-first, pass-the-phone road-trip game over the same itinerary: 18 stops, Paris to
Bamberg. Each stop is a 3D toy diorama (three.js) you walk around; the first visit to a place
plays a 10-second cinematic tour, then one easy mini-game, then the place's card (eat, shop,
photo, fact). Leaving a stop pays the nights, stamps the passport, sends a postcard and drives
the coast road to the next stop on the map. Progress saves in `localStorage`
(`cobs-on-tour-v2`). Linked from the site nav ("Game") and the hero.

`window.__cobs` and `window.__cobsTour` expose the state and tour/mini-game hooks for
scripted testing.

## Editing the plan

All content lives in `app/src/data.js` (one object per stop: coords, dates, highlights,
booking, cost). `app/src/app.js` renders cards, map and summary; `app/styles.css` holds
the Basque-linen design system.

## Open decisions (mirrored in the app hero)

1. ~~Bamberg — keep or cut~~ — **settled**: moved to the end of the trip (Tue 19 – Thu 21 Oct,
   2 nights minimum), fly Bilbao → Germany, home from Frankfurt Fri 22.
2. Île de Ré — priciest, most optional.
3. Rental car one-way France→Spain fee — check, or return the car in France.
