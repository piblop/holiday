// Cob Planner — build a custom plan and see it on the map.
// Items: {type, title, date, notes, place, coords:[lat,lng]}. Persisted in localStorage;
// shareable via #plan= base64 in the URL (hash wins over storage on load).

import { esc, initFx } from './gallery.js';
import { STORE_KEY, TYPE_META, hasCoords, encodePlanHash, suggestedPlan, loadPlan } from './plan-model.js';

initFx();

/* ── state ───────────────────────────────────────────────── */

const loaded = loadPlan();
let plan = loaded.plan;
let picked = null; // {place, coords}

// A plan opened from a share link stays read-only in storage terms until the viewer
// edits it — otherwise merely opening a friend's link would wipe your own saved plan.
let viewingSharedPlan = loaded.source === 'hash';
const touch = () => { viewingSharedPlan = false; };

const save = () => { if (!viewingSharedPlan) localStorage.setItem(STORE_KEY, JSON.stringify(plan)); };

/* ── map ─────────────────────────────────────────────────── */

const map = L.map('map', { scrollWheelZoom: true });
L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
  subdomains: 'abcd',
  maxZoom: 19,
}).addTo(map);
map.setView([45.5, -1.0], 5);
new ResizeObserver(() => map.invalidateSize()).observe(document.getElementById('map'));

const planLayer = L.layerGroup().addTo(map);
let pickMarker = null;

map.on('click', (e) => {
  setPicked({ place: `Pin (${e.latlng.lat.toFixed(3)}, ${e.latlng.lng.toFixed(3)})`, coords: [e.latlng.lat, e.latlng.lng] });
});

function setPicked(p) {
  picked = p;
  document.getElementById('plPicked').textContent = `📍 ${p.place}`;
  if (pickMarker) pickMarker.remove();
  pickMarker = L.marker(p.coords, { opacity: 0.7 }).addTo(map);
  map.panTo(p.coords);
}

/* ── rendering ───────────────────────────────────────────── */

const listEl = document.getElementById('plList');

function render() {
  document.getElementById('plCount').textContent = plan.length ? `· ${plan.length} steps` : '';
  document.getElementById('plTicker').textContent = `${plan.length} step${plan.length === 1 ? '' : 's'}`;
  document.getElementById('plEmpty').hidden = plan.length > 0;

  listEl.innerHTML = plan
    .map(
      (it, i) => `<li class="pl-item" data-i="${i}">
        <span class="pl-no">${i + 1}</span>
        <span class="pl-icon">${TYPE_META[it.type]?.icon ?? '📍'}</span>
        <span class="pl-body">
          <b>${esc(it.title || it.place || 'Untitled step')}</b>
          <small>${esc([it.date, it.place, it.notes].filter(Boolean).join(' · '))}</small>
        </span>
        <span class="pl-btns">
          <button data-act="up" title="Move up">↑</button>
          <button data-act="down" title="Move down">↓</button>
          <button data-act="del" title="Remove">✕</button>
        </span>
      </li>`
    )
    .join('');

  planLayer.clearLayers();
  const mappable = plan.filter(hasCoords);
  const pts = mappable.map((it) => it.coords);
  for (let i = 1; i < pts.length; i++) {
    L.polyline([pts[i - 1], pts[i]], {
      color: '#a4212e',
      weight: 3,
      opacity: 0.8,
      dashArray: TYPE_META[mappable[i].type]?.dash ?? '8 8',
    }).addTo(planLayer);
  }
  plan.forEach((it, i) => {
    if (!hasCoords(it)) return;
    const icon = L.divIcon({ className: '', html: `<div class="mk visited">${i + 1}</div>`, iconSize: [26, 26], iconAnchor: [13, 13] });
    L.marker(it.coords, { icon })
      .bindPopup(`<b>${esc(it.title || it.place || 'Untitled step')}</b><br>${esc([it.date, it.place].filter(Boolean).join(' · '))}`)
      .addTo(planLayer);
  });
  if (pts.length) map.fitBounds(L.latLngBounds(pts).pad(0.2));
  save();
}

listEl.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  const i = Number(btn.closest('.pl-item').dataset.i);
  let changed = false;
  if (btn.dataset.act === 'del') { plan.splice(i, 1); changed = true; }
  if (btn.dataset.act === 'up' && i > 0) { [plan[i - 1], plan[i]] = [plan[i], plan[i - 1]]; changed = true; }
  if (btn.dataset.act === 'down' && i < plan.length - 1) { [plan[i + 1], plan[i]] = [plan[i], plan[i + 1]]; changed = true; }
  if (changed) { touch(); render(); }
});

/* ── place search (Nominatim) ────────────────────────────── */

const resultsEl = document.getElementById('plResults');

async function searchPlace() {
  const q = document.getElementById('plSearch').value.trim();
  if (!q) return;
  resultsEl.hidden = false;
  resultsEl.innerHTML = '<p>Searching…</p>';
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&q=${encodeURIComponent(q)}`,
      { headers: { Accept: 'application/json' } }
    );
    const hits = await res.json();
    if (!hits.length) { resultsEl.innerHTML = '<p>No matches — try adding the country.</p>'; return; }
    resultsEl.innerHTML = hits
      .map((h, i) => `<button type="button" data-i="${i}">${esc(h.display_name)}</button>`)
      .join('');
    resultsEl.querySelectorAll('button').forEach((b) =>
      b.addEventListener('click', () => {
        const h = hits[Number(b.dataset.i)];
        setPicked({ place: h.display_name.split(',').slice(0, 2).join(','), coords: [Number(h.lat), Number(h.lon)] });
        resultsEl.hidden = true;
      })
    );
  } catch {
    resultsEl.innerHTML = '<p>Search unavailable — click the map to drop a pin instead.</p>';
  }
}

document.getElementById('plSearchBtn').addEventListener('click', searchPlace);
document.getElementById('plSearch').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') { e.preventDefault(); searchPlace(); }
});

/* ── actions ─────────────────────────────────────────────── */

document.getElementById('plAdd').addEventListener('click', () => {
  if (!picked) { document.getElementById('plPicked').textContent = '⚠ Set a location first — search or click the map.'; return; }
  touch();
  plan.push({
    type: document.getElementById('plType').value,
    title: document.getElementById('plTitle').value.trim(),
    date: document.getElementById('plDate').value.trim(),
    notes: document.getElementById('plNotes').value.trim(),
    place: picked.place,
    coords: picked.coords,
  });
  ['plTitle', 'plNotes'].forEach((id) => (document.getElementById(id).value = ''));
  if (pickMarker) { pickMarker.remove(); pickMarker = null; }
  picked = null;
  document.getElementById('plPicked').textContent = 'No location set — search above or click the map.';
  render();
});

// destructive buttons ask twice instead of using blocking confirm() dialogs
function armTwice(btn, armedLabel, action) {
  btn.addEventListener('click', () => {
    if (btn.dataset.armed === '1') {
      btn.dataset.armed = '';
      btn.textContent = btn.dataset.label;
      action();
      return;
    }
    btn.dataset.label = btn.textContent;
    btn.dataset.armed = '1';
    btn.textContent = armedLabel;
    setTimeout(() => { if (btn.dataset.armed === '1') { btn.dataset.armed = ''; btn.textContent = btn.dataset.label; } }, 3000);
  });
}

armTwice(document.getElementById('plSeed'), 'Replace current plan?', () => {
  touch();
  plan = suggestedPlan();
  render();
});

armTwice(document.getElementById('plClear'), 'Really clear?', () => {
  touch();
  plan = [];
  history.replaceState(null, '', location.pathname); // drop any #plan= from the URL
  render();
});

document.getElementById('plShare').addEventListener('click', async () => {
  const b64 = encodePlanHash(plan);
  const url = `${location.origin}${location.pathname}#plan=${b64}`;
  location.hash = `plan=${b64}`; // the address bar now IS the share link
  try {
    await navigator.clipboard.writeText(url);
    document.getElementById('plShare').textContent = 'Link copied ✓';
  } catch {
    document.getElementById('plShare').textContent = 'Copy from address bar ↑';
  }
  setTimeout(() => (document.getElementById('plShare').textContent = 'Copy share link'), 3500);
});

render();
