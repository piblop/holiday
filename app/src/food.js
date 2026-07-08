import { COURSES } from './food-data.js';
import { LOCAL_LIST, localMaps } from './local-list-data.js';
import { esc, loadAllThumbs, initPeek, initFx } from './gallery.js';

initFx();

const stars = (n) => (n ? `<span class="ft-stars">${'★'.repeat(n)}</span>` : '');

const list = document.getElementById('courses');
list.innerHTML = COURSES.map(
  (c, i) => `<li class="ft-course">
    <span class="ft-no">${String(i + 1).padStart(2, '0')}</span>
    <div class="ft-photos">${c.qs
      .map(
        (q, j) => `<figure class="photo ft-photo ${j === 0 ? 'ft-lead' : ''}" data-q="${esc(q)}" data-fb="${esc(c.town)}" data-j="${j}" title="${esc(q)}">
          <div class="ph-fallback">${esc((j === 0 ? c.name : q).slice(0, 10))}</div>
        </figure>`
      )
      .join('')}</div>
    <div class="ft-body">
      <h2><a href="${esc(c.url)}" target="_blank" rel="noopener">${esc(c.name)}</a>${stars(c.stars)}</h2>
      <p class="ft-meta"><span class="stop-dates">${esc(c.date)}</span> <b>${esc(c.town)}</b> · <span class="ft-badge">${esc(c.badge)}</span></p>
      <p class="ft-note">${esc(c.note)}</p>
      <p class="ft-cost">${esc(c.cost)}</p>
    </div>
  </li>`
).join('');

/* ── the local list: Bilbao & Getxo little black book ────── */

const FLAG = {
  fav: '<span class="ll-flag ll-fav" title="local favourite">❤</span>',
  top: '<span class="ll-flag ll-top" title="top pick">TOP</span>',
  star: '<span class="ll-flag ll-star" title="Michelin star">★</span>',
};

const slug = (t) => 'll-' + t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const nav = document.getElementById('localNav');
nav.innerHTML = LOCAL_LIST.map((cat) => `<a href="#${slug(cat.title)}">${esc(cat.title)}</a>`).join('');

const localEl = document.getElementById('localList');
localEl.innerHTML = LOCAL_LIST.map(
  (cat) => `<article class="ll-cat" id="${slug(cat.title)}">
    <div class="ft-photos ll-photos">${cat.qs
      .map(
        (q, j) => `<figure class="photo ft-photo ${j === 0 ? 'ft-lead' : ''}" data-q="${esc(q)}" data-fb="${esc(cat.area)}" data-j="${j}" title="${esc(q)}">
          <div class="ph-fallback">${esc(q.slice(0, 10))}</div>
        </figure>`
      )
      .join('')}</div>
    <div class="ll-body">
      <h3>${esc(cat.title)}</h3>
      ${cat.sub ? `<p class="ll-sub">${esc(cat.sub)}</p>` : ''}
      <ul class="ll-spots">${cat.spots
        .map((sp) => {
          const mapsUrl = localMaps(`${sp.name} ${sp.area ?? cat.area}`);
          const main = sp.url ?? mapsUrl;
          return `<li><a href="${esc(main)}" target="_blank" rel="noopener">${esc(sp.name)}</a>${FLAG[sp.flag] ?? ''}${
            sp.url ? `<a class="ll-maps" href="${esc(mapsUrl)}" target="_blank" rel="noopener" title="find on Google Maps">📍</a>` : ''
          }${sp.note ? `<span class="ll-note">${esc(sp.note)}</span>` : ''}</li>`;
        })
        .join('')}</ul>
    </div>
  </article>`
).join('');

loadAllThumbs('.ft-photo');
initPeek('.photo img');
