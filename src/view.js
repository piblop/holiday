// Cob Trip Book — read-only, illustrated view of the current plan.
// Reads the same plan as planner.html: #plan= share hash first, then the browser's
// saved plan, then the suggested Cobs plan. Never writes to storage.

import { esc, initFx, loadAllThumbs, initPeek } from './gallery.js';
import { TYPE_META, hasCoords, encodePlanHash, loadPlan } from './plan-model.js';

initFx();

const { plan, source } = loadPlan();

const TYPE_LABEL = {
  flight: 'Flight', train: 'Train', drive: 'Drive', stay: 'Stay',
  meal: 'Meal', activity: 'Activity', note: 'Note',
};

/* ── header copy reflects where the plan came from ───────── */

const eyebrow = document.getElementById('vwEyebrow');
if (source === 'hash') eyebrow.textContent = 'a shared plan · view only';
else if (source === 'stored') eyebrow.textContent = 'your saved plan, illustrated';
else eyebrow.textContent = 'the suggested Cobs plan, illustrated';

// keep "edit" pointing at the same plan the reader is looking at
if (source === 'hash') document.getElementById('vwEdit').href = `planner.html#plan=${encodePlanHash(plan)}`;

/* ── steps with pictures ─────────────────────────────────── */

document.getElementById('vwList').innerHTML = plan
  .map((it, i) => {
    const title = it.title || it.place || 'Untitled step';
    const q = `${title.split('—')[0].trim()} ${it.place && !title.includes(it.place) ? it.place : ''}`.trim();
    return `<li class="ft-course vw-step">
      <span class="ft-no">${String(i + 1).padStart(2, '0')}</span>
      <figure class="photo vw-photo" data-q="${esc(q)}" data-fb="${esc(it.place || title)}" data-j="${i % 3}">
        <div class="ph-fallback">${esc(title.slice(0, 10))}</div>
      </figure>
      <div class="ft-body">
        <h2>${TYPE_META[it.type]?.icon ?? '📍'} ${esc(title)}</h2>
        <p class="ft-meta">
          ${it.date ? `<span class="stop-dates">${esc(it.date)}</span> ` : ''}
          <b>${esc(it.place || '')}</b> · <span class="ft-badge">${esc(TYPE_LABEL[it.type] ?? 'Step')}</span>
        </p>
        ${it.notes ? `<p class="ft-note">${esc(it.notes)}</p>` : ''}
      </div>
    </li>`;
  })
  .join('');

document.getElementById('vwOutro').textContent =
  plan.length ? `${plan.length} steps. See you at the oyster shack.` : 'Nothing planned yet — open the planner and add something.';

loadAllThumbs('.vw-photo');
initPeek('.photo img');

/* ── overview map ────────────────────────────────────────── */

const map = L.map('vwMap', { scrollWheelZoom: false });
L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
  subdomains: 'abcd',
  maxZoom: 19,
}).addTo(map);
new ResizeObserver(() => map.invalidateSize()).observe(document.getElementById('vwMap'));

const mappable = plan.filter(hasCoords);
const pts = mappable.map((it) => it.coords);
for (let i = 1; i < pts.length; i++) {
  L.polyline([pts[i - 1], pts[i]], {
    color: '#a4212e', weight: 3, opacity: 0.8,
    dashArray: TYPE_META[mappable[i].type]?.dash ?? '8 8',
  }).addTo(map);
}
plan.forEach((it, i) => {
  if (!hasCoords(it)) return;
  const icon = L.divIcon({ className: '', html: `<div class="mk visited">${i + 1}</div>`, iconSize: [26, 26], iconAnchor: [13, 13] });
  L.marker(it.coords, { icon })
    .bindPopup(`<b>${esc(it.title || it.place || 'Untitled step')}</b><br>${esc([it.date, it.place].filter(Boolean).join(' · '))}`)
    .addTo(map);
});
if (pts.length) map.fitBounds(L.latLngBounds(pts).pad(0.15));
else map.setView([45.5, -1.0], 5);
