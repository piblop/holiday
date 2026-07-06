import { COURSES } from './food-data.js';
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

loadAllThumbs('.ft-photo');
initPeek('.photo img');
