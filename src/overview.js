import { STOPS } from './data.js';
import { COURSES } from './food-data.js';
import { ACTIVITIES } from './activities-data.js';
import { SHOPS } from './shopping-data.js';
import { esc, initFx } from './gallery.js';

initFx();

const stars = (n) => (n ? ' ' + '★'.repeat(n) : '');

const HIGHLIGHTS = [
  'Saint-Jean-de-Luz — the non-negotiable postcard stop, last morning in France',
  'Monte Igueldo first — the dodgy funfair with the best view of San Sebastián',
  'Gaztelugatxe — 241 steps to Dragonstone (book the free slot)',
  'The coast road, not the highway — Lekeitio straight to Mundaka',
  'Etxebarri alarm — reservations open the 1st of the month and vanish in minutes',
  'Echaurren El Portal — the 4–5 hour Michelin lunch, then the river walk and pass out',
  'The oyster ladder — Marennes benchmark → Île de Ré posh → Capbreton with surf',
  'Surf comp window — check WSL France dates against Fri 8 – Sat 9 Oct',
  'Barrio de la Estación, Haro — century-old wineries in harvest colours',
  'As many tomato salads as possible in Basque country. Best cheesecake on the planet at La Viña.',
];

const destRows = STOPS.map(
  (s, i) => `<tr>
    <td class="sm-date">${esc(s.dates)}</td>
    <td class="sm-stop"><a href="index.html#stop-${s.id}">${i + 1}. ${esc(s.name)}</a><span>${esc(s.sub)}</span></td>
    <td>${esc(s.nights)}</td>
    <td class="sm-cost">${esc(s.cost ?? '')}</td>
  </tr>`
).join('');

const foodRows = COURSES.map(
  (c) => `<tr>
    <td class="sm-date">${esc(c.date)}</td>
    <td class="sm-stop"><a href="${esc(c.url)}" target="_blank" rel="noopener">${esc(c.name)}${stars(c.stars)}</a><span>${esc(c.town)} · ${esc(c.badge)}</span></td>
    <td class="sm-cost">${esc(c.cost)}</td>
  </tr>`
).join('');

const actRows = ACTIVITIES.map(
  (a) => `<tr>
    <td class="sm-date">${esc(a.date)}</td>
    <td class="sm-stop"><a href="${esc(a.url)}" target="_blank" rel="noopener">${esc(a.name)}</a><span>${esc(a.town)} · ${esc(a.badge)}</span></td>
    <td class="sm-cost">${esc(a.cost)}</td>
  </tr>`
).join('');

const shopRows = SHOPS.map(
  (s) => `<tr>
    <td class="sm-date">${esc(s.date)}</td>
    <td class="sm-stop"><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.name)}</a><span>${esc(s.town)} · ${esc(s.badge)}</span></td>
    <td class="sm-cost">${esc(s.cost)}</td>
  </tr>`
).join('');

document.getElementById('ovBody').innerHTML = `
  <section class="ov-section">
    <h2>Destinations <a class="ov-more" href="index.html">open the map →</a></h2>
    <table class="sm-table">
      <thead><tr><th>Dates</th><th>Stop</th><th>Nights</th><th>€ ballpark</th></tr></thead>
      <tbody>${destRows}</tbody>
    </table>
  </section>

  <section class="ov-section">
    <h2>Food <a class="ov-more" href="food.html">full food tour →</a></h2>
    <table class="sm-table">
      <thead><tr><th>When</th><th>Table</th><th>€ ballpark</th></tr></thead>
      <tbody>${foodRows}</tbody>
    </table>
  </section>

  <section class="ov-section">
    <h2>Activities <a class="ov-more" href="activities.html">full list →</a></h2>
    <table class="sm-table">
      <thead><tr><th>When</th><th>Activity</th><th>€ ballpark</th></tr></thead>
      <tbody>${actRows}</tbody>
    </table>
  </section>

  <section class="ov-section">
    <h2>Shopping <a class="ov-more" href="shopping.html">full list →</a></h2>
    <table class="sm-table">
      <thead><tr><th>When</th><th>Shop</th><th>€ ballpark</th></tr></thead>
      <tbody>${shopRows}</tbody>
    </table>
  </section>

  <section class="ov-section">
    <h2>Don't-miss highlights</h2>
    <ol class="ov-highlights">${HIGHLIGHTS.map((h) => `<li>${esc(h)}</li>`).join('')}</ol>
  </section>
`;

document.getElementById('ovPrint').addEventListener('click', () => window.print());
