// Shared plan model for planner.html (editor) and view.html (trip book).
// A plan is an array of {type, title, date, notes, place, coords:[lat,lng]}.

import { STOPS } from './data.js';

export const STORE_KEY = 'cob-planner-v1';

export const TYPE_META = {
  flight: { icon: '✈', dash: '2 8' },
  train: { icon: '🚆', dash: '2 8' },
  drive: { icon: '🚗', dash: '8 8' },
  stay: { icon: '🛏', dash: '8 8' },
  meal: { icon: '🍴', dash: '8 8' },
  activity: { icon: '⛰', dash: '8 8' },
  note: { icon: '📍', dash: '8 8' },
};

export const hasCoords = (it) =>
  Array.isArray(it?.coords) && it.coords.length === 2 && it.coords.every(Number.isFinite);

export function decodeHashPlan() {
  const m = location.hash.match(/plan=([A-Za-z0-9+/=_-]+)/);
  if (!m) return null;
  try {
    const bytes = Uint8Array.from(atob(m[1].replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));
    const items = JSON.parse(new TextDecoder().decode(bytes));
    return Array.isArray(items) ? items.filter(hasCoords) : null;
  } catch {
    return null;
  }
}

export function encodePlanHash(plan) {
  const bytes = new TextEncoder().encode(JSON.stringify(plan));
  let bin = '';
  bytes.forEach((b) => { bin += String.fromCharCode(b); }); // avoid spread arg limits on big plans
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_');
}

// the suggested plan: every stop of the Cobs route, with the flagship bookings woven in
export function suggestedPlan() {
  const extrasAfter = {
    bayonne: [{ type: 'meal', title: 'Hétéroclito — sunset dinner', date: 'Sun 10 or Mon 11 Oct', notes: 'book ahead, outside table', place: 'Bayonne', coords: [43.4929, -1.4748] }],
    sansebastian: [{ type: 'activity', title: 'Monte Igueldo — do it first', date: 'Tue 12 Oct', notes: 'funicular + the view', place: 'San Sebastián', coords: [43.3219, -2.0058] }],
    bilbao: [{ type: 'meal', title: 'Asador Etxebarri — the big lunch', date: 'Tue 19 Oct', notes: 'alarm on the 1st of the month', place: 'Axpe', coords: [43.1136, -2.6035] }],
    ezcaray: [{ type: 'meal', title: 'Echaurren El Portal — 4–5 h lunch', date: 'Wed 20 Oct', notes: 'book 2–4 weeks out', place: 'Ezcaray', coords: [42.3251, -3.0087] }],
  };
  const items = [];
  for (const s of STOPS) {
    items.push({
      type: s.leg === 'fly' ? 'flight' : s.leg === 'train' ? 'train' : 'drive',
      title: s.name,
      date: s.dates,
      notes: s.nights ? `${s.nights} nights` : '',
      place: s.name,
      coords: s.coords,
    });
    if (extrasAfter[s.id]) items.push(...extrasAfter[s.id]);
  }
  return items;
}

export function loadPlan() {
  const fromHash = decodeHashPlan();
  if (fromHash) return { plan: fromHash, source: 'hash' };
  try {
    const stored = JSON.parse(localStorage.getItem(STORE_KEY));
    if (Array.isArray(stored) && stored.length) return { plan: stored, source: 'stored' };
  } catch { /* fall through to the suggested plan */ }
  return { plan: suggestedPlan(), source: 'suggested' };
}
