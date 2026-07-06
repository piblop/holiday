# Cobs on Tour — Spain/France trip planner

Interactive scrollytelling map of the October 2027 trip, built from
`Spain advice from annette.docx` plus the date-anchored plan (Fri 1 Oct → Fri 22 Oct 2027,
one direction north→south via La Rochelle).

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

## Editing the plan

All content lives in `app/src/data.js` (one object per stop: coords, dates, highlights,
booking, cost). `app/src/app.js` renders cards, map and summary; `app/styles.css` holds
the Basque-linen design system.

## Open decisions (mirrored in the app hero)

1. Bamberg — keep or cut (frees ~3 nights).
2. Île de Ré — priciest, most optional.
3. Rental car one-way France→Spain fee — check, or return the car in France.
