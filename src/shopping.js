import { SHOPS } from './shopping-data.js';
import { esc, loadAllThumbs, initPeek, initFx } from './gallery.js';

initFx();

const list = document.getElementById('shops');
list.innerHTML = SHOPS.map(
  (s, i) => `<li class="ft-course">
    <span class="ft-no">${String(i + 1).padStart(2, '0')}</span>
    <div class="ft-photos">${s.qs
      .map(
        (q, j) => `<figure class="photo ft-photo ${j === 0 ? 'ft-lead' : ''}" data-q="${esc(q)}" data-fb="${esc(s.town)}" data-j="${j}" title="${esc(q)}">
          <div class="ph-fallback">${esc((j === 0 ? s.name : q).slice(0, 10))}</div>
        </figure>`
      )
      .join('')}</div>
    <div class="ft-body">
      <h2><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.name)}</a></h2>
      <p class="ft-meta"><span class="stop-dates">${esc(s.date)}</span> <b>${esc(s.town)}</b> · <span class="ft-badge">${esc(s.badge)}</span></p>
      <p class="ft-note">${esc(s.note)}</p>
      <p class="ft-cost">${esc(s.cost)}</p>
    </div>
  </li>`
).join('');

loadAllThumbs('.ft-photo');
initPeek('.photo img');
