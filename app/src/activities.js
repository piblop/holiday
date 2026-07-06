import { ACTIVITIES } from './activities-data.js';
import { esc, loadAllThumbs, initPeek, initFx } from './gallery.js';

initFx();

const list = document.getElementById('activities');
list.innerHTML = ACTIVITIES.map(
  (a, i) => `<li class="ft-course">
    <span class="ft-no">${String(i + 1).padStart(2, '0')}</span>
    <div class="ft-photos">${a.qs
      .map(
        (q, j) => `<figure class="photo ft-photo ${j === 0 ? 'ft-lead' : ''}" data-q="${esc(q)}" data-fb="${esc(a.town)}" data-j="${j}" title="${esc(q)}">
          <div class="ph-fallback">${esc((j === 0 ? a.name : q).slice(0, 10))}</div>
        </figure>`
      )
      .join('')}</div>
    <div class="ft-body">
      <h2><a href="${esc(a.url)}" target="_blank" rel="noopener">${esc(a.name)}</a></h2>
      <p class="ft-meta"><span class="stop-dates">${esc(a.date)}</span> <b>${esc(a.town)}</b> · <span class="ft-badge">${esc(a.badge)}</span></p>
      <p class="ft-note">${esc(a.note)}</p>
      <p class="ft-cost">${esc(a.cost)}</p>
    </div>
  </li>`
).join('');

loadAllThumbs('.ft-photo');
initPeek('.photo img');
