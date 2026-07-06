import { STOPS, CHAPTERS } from './data.js';
import { initFx } from './gallery.js';

initFx();

/* ── helpers ─────────────────────────────────────────────── */

const haversineKm = ([lat1, lon1], [lat2, lon2]) => {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
};

// cumulative km at each stop (straight-line, good enough for a plan)
const cumKm = STOPS.reduce((acc, s, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + haversineKm(STOPS[i - 1].coords, s.coords));
  return acc;
}, []);

const esc = (str) =>
  str.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ── render stop cards ───────────────────────────────────── */

const feed = document.getElementById('stops');
let lastChapter = null;

STOPS.forEach((s, i) => {
  if (s.chapter !== lastChapter) {
    lastChapter = s.chapter;
    const count = STOPS.filter((x) => x.chapter === s.chapter).length;
    const div = document.createElement('div');
    div.className = 'chapter';
    div.innerHTML = `${esc(CHAPTERS[s.chapter])}<small>${count} stop${count > 1 ? 's' : ''}</small>`;
    feed.appendChild(div);
  }

  const art = document.createElement('article');
  art.className = 'stop';
  art.id = `stop-${s.id}`;
  art.dataset.idx = i;
  art.dataset.leg = s.leg;
  const highlights = (s.highlights ?? [])
    .map((h) => {
      // thumbnail search query: anchor generic titles to the stop's town
      const town = s.name.split(/[&→,]/)[0].trim();
      const q = h.title.toLowerCase().includes(town.toLowerCase()) ? h.title : `${h.title} ${town}`;
      return `<li>
        <span class="hl-thumb" data-q="${esc(q)}"></span>
        <span class="hl-body">
          <a href="${esc(h.url)}" target="_blank" rel="noopener">${esc(h.title)}</a>
          ${h.note ? `<span class="hl-note">${esc(h.note)}</span>` : ''}
          ${h.cost ? `<span class="hl-cost">${esc(h.cost)}</span>` : ''}
        </span>
      </li>`;
    })
    .join('');

  art.innerHTML = `
    <div class="stop-head">
      <span class="stop-no">${i + 1}</span>
      <h2>${esc(s.name)}</h2>
    </div>
    <p class="stop-sub">${esc(s.sub)}</p>
    <div class="stop-meta">
      <span class="stop-dates">${esc(s.dates)}</span>
      <span>Nights <b>${esc(s.nights)}</b></span>
      <span>By <b>${s.leg}</b></span>
      <span>~<b>${Math.round(cumKm[i])} km</b> in</span>
    </div>
    <figure class="photo" data-wiki="${esc(s.wiki)}">
      <div class="ph-fallback">${esc(s.name.slice(0, 12))}</div>
    </figure>
    ${
      s.wikiExtra?.length
        ? `<div class="gallery">${s.wikiExtra
            .map(
              (w) => `<figure class="photo mini" data-wiki="${esc(w)}" title="${esc(w.replace(/ \(.+\)$/, ''))}">
                <div class="ph-fallback">${esc(w.slice(0, 10))}</div>
              </figure>`
            )
            .join('')}</div>`
        : ''
    }
    <p class="stop-desc">${esc(s.desc)}</p>
    <blockquote class="annette">${esc(s.annette)}</blockquote>
    ${highlights ? `<div class="hl"><h3>Highlights</h3><ul>${highlights}</ul></div>` : ''}
    ${s.booking ? `<p class="booking"><b>Booking</b> ${esc(s.booking)}</p>` : ''}
    ${s.cost ? `<p class="cost-line">${esc(s.cost)}</p>` : ''}
    <div class="tags">${s.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</div>
  `;
  feed.appendChild(art);
});

/* ── trip summary overlay ────────────────────────────────── */

const summaryEl = document.getElementById('summary');
const summaryBody = document.getElementById('summaryBody');

function buildSummary() {
  const rows = STOPS.map(
    (s, i) => `<tr>
      <td class="sm-date">${esc(s.dates)}</td>
      <td class="sm-stop"><a href="#stop-${s.id}" data-goto="${s.id}">${i + 1}. ${esc(s.name)}</a>
        <span>${esc(s.sub)}</span></td>
      <td>${esc(s.nights)}</td>
      <td class="sm-book">${esc(s.booking ?? '')}</td>
      <td class="sm-cost">${esc(s.cost ?? '')}</td>
    </tr>`
  ).join('');

  summaryBody.innerHTML = `
    <table class="sm-table">
      <thead><tr><th>Dates</th><th>Stop</th><th>Nights</th><th>Book / do now</th><th>€ ballpark</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="sm-foot">
      <p><b>Frame.</b> Depart Sydney Wed 29/Thu 30 Sep 2027 · on the ground Fri 1 Oct · fly Bilbao→Paris→Sydney Fri 22 Oct · land Sun 24 Oct (Mon 25 deadline clear). 21 nights, ~${Math.round(cumKm[cumKm.length - 1])} km as the crow flies.</p>
      <p><b>Book-now list.</b> ① Leave request 29/30 Sep → 22 Oct. ② Long-haul flights + BIO→CDG hop. ③ Rental car (check France→Spain one-way fee). ④ Etxebarri — alarm for the 1st of the month, target Tue 19 Oct lunch. ⑤ Echaurren El Portal, Wed 20 Oct lunch. ⑥ Hétéroclito Bayonne, sunset table. ⑦ Bordeaux château visits. ⑧ Gaztelugatxe free ticket. ⑨ Watch WSL France dates vs 8–9 Oct.</p>
      <p><b>Still to decide.</b> Bamberg keep/cut (frees ~3 nights) · Île de Ré keep/drop (Royan covers oysters) · car return country.</p>
      <p><a class="summary-open food-link" href="food.html">Eat the route → Cob Food Tour ↗</a></p>
    </div>`;

  summaryBody.querySelectorAll('[data-goto]').forEach((a) =>
    a.addEventListener('click', (e) => {
      e.preventDefault();
      closeSummary();
      document.getElementById(`stop-${a.dataset.goto}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    })
  );
}

function openSummary() {
  if (!summaryBody.querySelector('.sm-table')) buildSummary();
  summaryEl.hidden = false;
  document.body.style.overflow = 'hidden';
}
function closeSummary() {
  summaryEl.hidden = true;
  document.body.style.overflow = '';
}

document.getElementById('summaryOpen').addEventListener('click', openSummary);
document.getElementById('summaryClose').addEventListener('click', closeSummary);
document.getElementById('summaryPrint').addEventListener('click', () => window.print());
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !summaryEl.hidden) closeSummary();
});

/* ── photos from Wikipedia REST API ──────────────────────── */

async function fetchSummary(title, attempt = 0) {
  const res = await fetch(
    `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
    { headers: { Accept: 'application/json' } }
  );
  if (!res.ok) {
    if (attempt < 2) {
      await new Promise((r) => setTimeout(r, 600 * (attempt + 1)));
      return fetchSummary(title, attempt + 1);
    }
    throw new Error(`wiki ${res.status}`);
  }
  return res;
}

async function loadPhoto(fig) {
  const title = fig.dataset.wiki;
  try {
    const res = await fetchSummary(title);
    const json = await res.json();
    const thumb = json.thumbnail?.source;
    const origW = json.originalimage?.width ?? 0;
    // Commons only renders bucketed widths (960 works) and 400s on upscales
    const src =
      origW && origW <= 960
        ? json.originalimage.source
        : thumb
          ? thumb.replace(/\/\d+px-/, '/960px-')
          : json.originalimage?.source;
    if (!src) return; // keep fallback tile
    const img = new Image();
    img.alt = title.replace(/_/g, ' ');
    img.loading = 'lazy';
    img.onload = () => fig.querySelector('.ph-fallback')?.remove();
    img.onerror = () => {
      if (thumb && img.src !== thumb) img.src = thumb; // API-provided size always exists
      else img.remove();
    };
    img.src = src;
    fig.appendChild(img);
  } catch {
    /* photo unavailable — the fallback tile stays */
  }
}
// stagger requests so we don't burst the Wikipedia API with 20 at once
document.querySelectorAll('.photo').forEach((fig, i) => setTimeout(() => loadPhoto(fig), i * 150));

/* ── highlight thumbnails from Wikimedia Commons search ──── */

async function loadHighlightThumb(el) {
  const q = el.dataset.q;
  try {
    const url =
      'https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*' +
      '&generator=search&gsrnamespace=6&gsrlimit=3' +
      `&gsrsearch=${encodeURIComponent(q + ' filetype:bitmap')}` +
      '&prop=imageinfo&iiprop=url|mime&iiurlwidth=200';
    const res = await fetch(url);
    if (!res.ok) throw new Error(`commons ${res.status}`);
    const json = await res.json();
    const pages = Object.values(json.query?.pages ?? {}).sort((a, b) => a.index - b.index);
    const hit = pages.find((p) => /image\/(jpeg|png)/.test(p.imageinfo?.[0]?.mime ?? ''));
    const thumb = hit?.imageinfo?.[0]?.thumburl;
    if (!thumb) { el.remove(); return; }
    const img = new Image();
    img.alt = q;
    img.loading = 'lazy';
    img.onerror = () => el.remove();
    img.src = thumb;
    el.appendChild(img);
  } catch {
    el.remove(); // no thumbnail — the list item just stays text-only
  }
}
document.querySelectorAll('.hl-thumb').forEach((el, i) => setTimeout(() => loadHighlightThumb(el), 400 + i * 120));

/* ── hover to expand any picture ─────────────────────────── */

const peek = document.createElement('div');
peek.id = 'peek';
peek.innerHTML = '<img alt="">';
document.body.appendChild(peek);
const peekImg = peek.querySelector('img');

const PEEKABLE = '.photo img, .hl-thumb img';

document.addEventListener('mouseover', (e) => {
  const img = e.target.closest?.(PEEKABLE);
  if (!img) return;
  // small Commons thumbs look blurry blown up — ask for the 960px bucket, fall back if it 400s
  const big = img.src.includes('px-') ? img.src.replace(/\/\d+px-/, '/960px-') : img.src;
  peekImg.onerror = () => { peekImg.onerror = null; peekImg.src = img.src; };
  peekImg.src = big;
  peek.classList.add('show');
});
document.addEventListener('mouseout', (e) => {
  if (e.target.closest?.(PEEKABLE)) peek.classList.remove('show');
});
// touch devices get tap-to-toggle instead of hover
document.addEventListener('click', (e) => {
  if (peek.classList.contains('show') && !e.target.closest?.(PEEKABLE)) peek.classList.remove('show');
});

/* ── map ─────────────────────────────────────────────────── */

const map = L.map('map', { zoomControl: true, scrollWheelZoom: false });
L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
  subdomains: 'abcd',
  maxZoom: 19,
}).addTo(map);

// the square map container resizes with the viewport — keep Leaflet in sync
new ResizeObserver(() => map.invalidateSize()).observe(document.getElementById('map'));

const latlngs = STOPS.map((s) => s.coords);
map.fitBounds(L.latLngBounds(latlngs).pad(0.12));

// full route, ghosted: flight/train legs dotted, drive legs dashed
for (let i = 1; i < STOPS.length; i++) {
  const drive = STOPS[i].leg === 'drive';
  L.polyline([STOPS[i - 1].coords, STOPS[i].coords], {
    color: '#46595f',
    weight: drive ? 3 : 2,
    opacity: 0.45,
    dashArray: drive ? '8 8' : '2 8',
  }).addTo(map);
}

// progress line: redrawn in Rioja red as the reader advances
const progressLine = L.polyline([], { color: '#a4212e', weight: 4, opacity: 0.9 }).addTo(map);

const markers = STOPS.map((s, i) => {
  const icon = L.divIcon({
    className: '',
    html: `<div class="mk" id="mk-${i}">${i + 1}</div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
  const m = L.marker(s.coords, { icon }).addTo(map);
  m.bindPopup(`<b>${esc(s.name)}</b><br>${esc(s.sub)}`);
  m.on('click', () => {
    document.getElementById(`stop-${s.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  return m;
});

/* ── scroll ⇄ map sync ───────────────────────────────────── */

const tickerStop = document.getElementById('tickerStop');
const tickerKm = document.getElementById('tickerKm');
const cards = [...document.querySelectorAll('.stop')];
let activeIdx = -1;

function activate(idx) {
  if (idx === activeIdx) return;
  activeIdx = idx;

  cards.forEach((c, i) => c.classList.toggle('active', i === idx));

  STOPS.forEach((_, i) => {
    const mk = document.getElementById(`mk-${i}`);
    if (!mk) return;
    mk.classList.toggle('current', i === idx);
    mk.classList.toggle('visited', i < idx);
  });

  progressLine.setLatLngs(latlngs.slice(0, idx + 1));

  const s = STOPS[idx];
  map.flyTo(s.coords, s.zoom, { duration: 1.1 });

  tickerStop.textContent = `${String(idx + 1).padStart(2, '0')} · ${s.name}`;
  tickerKm.textContent = `${Math.round(cumKm[idx])} km`;
}

const observer = new IntersectionObserver(
  (entries) => {
    // pick the visible card closest to the upper third of the viewport
    const visible = entries.filter((e) => e.isIntersecting);
    if (!visible.length) return;
    const target = visible.reduce((best, e) =>
      Math.abs(e.boundingClientRect.top) < Math.abs(best.boundingClientRect.top) ? e : best
    );
    activate(Number(target.target.dataset.idx));
  },
  { rootMargin: '-25% 0px -55% 0px', threshold: 0 }
);
cards.forEach((c) => observer.observe(c));

// hero in view → overview
const hero = document.querySelector('.hero');
new IntersectionObserver(
  (entries) => {
    if (entries[0].isIntersecting && entries[0].intersectionRatio > 0.5) {
      activeIdx = -1;
      cards.forEach((c) => c.classList.remove('active'));
      STOPS.forEach((_, i) => {
        const mk = document.getElementById(`mk-${i}`);
        mk?.classList.remove('current', 'visited');
      });
      progressLine.setLatLngs([]);
      map.flyToBounds(L.latLngBounds(latlngs).pad(0.12), { duration: 1.1 });
      tickerStop.textContent = 'Start';
      tickerKm.textContent = '0 km';
    }
  },
  { threshold: [0, 0.5, 1] }
).observe(hero);
