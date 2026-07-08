import { COURSES } from './food-data.js';
import { LOCAL_LIST, localMaps } from './local-list-data.js';
import { esc, loadAllThumbs, initPeek, initFx, commonsSearch } from './gallery.js';

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
          const area = sp.area ?? cat.area;
          const mapsUrl = localMaps(`${sp.name} ${area}`);
          const main = sp.url ?? mapsUrl;
          return `<li data-vname="${esc(sp.name)}" data-varea="${esc(area)}" data-vcat="${esc(cat.title)}"${
            sp.note ? ` data-vnote="${esc(sp.note)}"` : ''
          }${sp.flag ? ` data-vflag="${sp.flag}"` : ''}><a href="${esc(main)}" target="_blank" rel="noopener">${esc(sp.name)}</a>${FLAG[sp.flag] ?? ''}${
            sp.url ? `<a class="ll-maps" href="${esc(mapsUrl)}" target="_blank" rel="noopener" title="find on Google Maps">📍</a>` : ''
          }${sp.note ? `<span class="ll-note">${esc(sp.note)}</span>` : ''}</li>`;
        })
        .join('')}</ul>
    </div>
  </article>`
).join('');

/* ── venue hover card: lazy photo + composed description ── */

const FLAG_TEXT = { fav: 'Local favourite ❤', top: 'Top pick', star: 'Michelin-starred ★' };

const vc = document.createElement('div');
vc.id = 'venueCard';
vc.innerHTML = `<figure class="vc-photo"><img alt="" hidden><div class="vc-fallback"></div></figure>
  <div class="vc-text"><h4></h4><p class="vc-meta"></p><p class="vc-desc"></p></div>`;
document.body.appendChild(vc);
const vcImg = vc.querySelector('img');
const vcFall = vc.querySelector('.vc-fallback');
const vcName = vc.querySelector('h4');
const vcMeta = vc.querySelector('.vc-meta');
const vcDesc = vc.querySelector('.vc-desc');

const photoCache = new Map(); // venue query → thumb url | null
let hoverToken = 0;

async function venuePhoto(li) {
  const q = `${li.dataset.vname} ${li.dataset.varea}`;
  if (!photoCache.has(q)) {
    // venue first; tiny bars rarely have Commons photos, so fall back to the area
    let url = null;
    try { url = (await commonsSearch(q)) ?? (await commonsSearch(li.dataset.varea)); } catch { /* offline — text-only card */ }
    photoCache.set(q, url);
  }
  return photoCache.get(q);
}

function moveCard(e) {
  const pad = 14;
  const w = vc.offsetWidth || 280;
  const h = vc.offsetHeight || 220;
  let x = e.clientX + pad;
  let y = e.clientY + pad;
  if (x + w > innerWidth - 8) x = e.clientX - w - pad;
  if (y + h > innerHeight - 8) y = e.clientY - h - pad;
  vc.style.left = `${Math.max(8, x)}px`;
  vc.style.top = `${Math.max(8, y)}px`;
}

async function showCard(li, e) {
  const token = ++hoverToken;
  const { vname, varea, vcat, vnote, vflag } = li.dataset;
  vcName.textContent = vname;
  vcMeta.textContent = `${vcat.replace(/ · .*$/, '')} · ${varea}`;
  const bits = [];
  if (vflag) bits.push(FLAG_TEXT[vflag]);
  if (vnote) bits.push(vnote.charAt(0).toUpperCase() + vnote.slice(1));
  bits.push('From the Bilbao insider list — click to open.');
  vcDesc.textContent = bits.join(' · ');
  vcImg.hidden = true;
  vcFall.textContent = vname.slice(0, 14);
  vcFall.hidden = false;
  moveCard(e);
  vc.classList.add('show');
  const url = await venuePhoto(li);
  if (token !== hoverToken) return; // pointer moved on — a newer card owns the element
  if (url) {
    vcImg.onload = () => { if (token === hoverToken) { vcFall.hidden = true; vcImg.hidden = false; } };
    vcImg.src = url;
  }
}

let currentLi = null;
document.addEventListener('mouseover', (e) => {
  const li = e.target.closest?.('.ll-spots li');
  if (li && li !== currentLi) {
    currentLi = li;
    showCard(li, e);
  }
});
document.addEventListener('mousemove', (e) => {
  if (vc.classList.contains('show') && e.target.closest?.('.ll-spots li')) moveCard(e);
});
document.addEventListener('mouseout', (e) => {
  const from = e.target.closest?.('.ll-spots li');
  if (from && e.relatedTarget?.closest?.('.ll-spots li') !== from) {
    hoverToken++;
    currentLi = null;
    vc.classList.remove('show');
  }
});

loadAllThumbs('.ft-photo');
initPeek('.photo img');
