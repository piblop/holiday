// Shared: Wikimedia Commons thumbnails + hover-to-expand peek. Used by food.js and activities.js.

export async function commonsSearch(q, pick = 0) {
  const url =
    'https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*' +
    '&generator=search&gsrnamespace=6&gsrlimit=8' +
    `&gsrsearch=${encodeURIComponent(q + ' filetype:bitmap')}` +
    '&prop=imageinfo&iiprop=url|mime&iiurlwidth=640';
  const res = await fetch(url);
  if (!res.ok) throw new Error(`commons ${res.status}`);
  const json = await res.json();
  const pages = Object.values(json.query?.pages ?? {}).sort((a, b) => a.index - b.index);
  const photos = pages.filter((p) => /image\/(jpeg|png)/.test(p.imageinfo?.[0]?.mime ?? ''));
  return photos[Math.min(pick, photos.length - 1)]?.imageinfo?.[0]?.thumburl ?? null;
}

export async function loadThumb(fig, { eager = false } = {}) {
  try {
    // primary query first; if Commons has nothing, refill from the fallback query,
    // offset by slot index so the tiles of one entry stay distinct
    const thumb =
      (await commonsSearch(fig.dataset.q)) ??
      (await commonsSearch(fig.dataset.fb ?? '', Number(fig.dataset.j ?? 0)));
    if (!thumb) return;
    const img = new Image();
    img.alt = fig.dataset.q;
    // lazy imgs inside closed <details> never load (Chrome treats them as off-screen) — allow eager
    img.loading = eager ? 'eager' : 'lazy';
    img.onload = () => fig.querySelector('.ph-fallback')?.remove();
    img.onerror = () => img.remove();
    img.src = thumb;
    fig.appendChild(img);
  } catch {
    /* fallback tile stays */
  }
}

export function loadAllThumbs(selector = '.ft-photo', opts = {}) {
  document.querySelectorAll(selector).forEach((fig, i) => setTimeout(() => loadThumb(fig, opts), i * 130));
}

export function initPeek(selector = '.photo img') {
  const peek = document.createElement('div');
  peek.id = 'peek';
  peek.innerHTML = '<img alt="">';
  document.body.appendChild(peek);
  const peekImg = peek.querySelector('img');

  document.addEventListener('mouseover', (e) => {
    const img = e.target.closest?.(selector);
    if (!img) return;
    const big = img.src.includes('px-') ? img.src.replace(/\/\d+px-/, '/960px-') : img.src;
    peekImg.onerror = () => { peekImg.onerror = null; peekImg.src = img.src; };
    peekImg.src = big;
    peek.classList.add('show');
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest?.(selector)) peek.classList.remove('show');
  });
  document.addEventListener('click', (e) => {
    if (peek.classList.contains('show') && !e.target.closest?.(selector)) peek.classList.remove('show');
  });
}

export const esc = (str) =>
  str.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// Live AUD⇄EUR note (ECB daily rate via frankfurter.app) — fills every element with class "fx"
export async function initFx() {
  const els = document.querySelectorAll('.fx');
  if (!els.length) return;
  try {
    let rate, date;
    try {
      const json = await fetch('https://api.frankfurter.dev/v1/latest?base=EUR&symbols=AUD').then((r) => r.json());
      rate = json.rates?.AUD;
      date = json.date;
    } catch {
      const json = await fetch('https://open.er-api.com/v6/latest/EUR').then((r) => r.json());
      rate = json.rates?.AUD;
      date = (json.time_last_update_utc ?? '').slice(0, 16);
    }
    if (!rate) throw new Error('no rate');
    const text = `€1 ≈ A$${rate.toFixed(2)} · A$100 ≈ €${(100 / rate).toFixed(0)} — live rate, ${date}`;
    els.forEach((el) => { el.textContent = text; el.hidden = false; });
  } catch {
    els.forEach((el) => el.remove()); // no rate available — hide rather than mislead
  }
}
