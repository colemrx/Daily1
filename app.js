'use strict';
/* =========================================================
   Daily — weight, water, Spanish goals & an offline library
   All your data stays on your phone (localStorage + IndexedDB).
   ========================================================= */

const STORE_KEY = 'daily.v1';
const META_KEY = 'daily.library.v1';
const KG_PER_LB = 0.45359237;
const ML_PER_OZ = 29.5735;

/* ---------- helpers ---------- */
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = n => String(n).padStart(2, '0');
const dkey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseKey = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const fmtDate = (k, o = { month: 'short', day: 'numeric' }) => parseKey(k).toLocaleDateString(undefined, o);
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const slug = t => t.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const num = v => { const n = parseFloat(String(v).replace(',', '.')); return isFinite(n) ? n : NaN; };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const daysSinceEpoch = (d = new Date()) => Math.floor(new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() / 864e5);

/* ---------- state ---------- */
const defaults = () => ({
  settings: { weightUnit: 'lb', waterUnit: 'oz', waterGoalMl: Math.round(64 * ML_PER_OZ), spanishGoalMin: 15, weightGoalKg: null, readerSize: 19 },
  weights: [],                 // [{id, d:'YYYY-MM-DD', kg}]
  water: {},                   // {'YYYY-MM-DD': [{t, ml}]}
  spanish: { minutes: {}, goals: [] },
  read: {}                     // {articleId: timestamp}
});
function merge(base, obj) {
  for (const k in obj) {
    const a = base[k], b = obj[k];
    if (a && b && typeof a === 'object' && typeof b === 'object' && !Array.isArray(a) && !Array.isArray(b)) base[k] = merge(a, b);
    else base[k] = b;
  }
  return base;
}
function load() {
  try { const raw = JSON.parse(localStorage.getItem(STORE_KEY)); if (raw) return merge(defaults(), raw); } catch (e) {}
  return defaults();
}
let S = load();
function save() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(S)); }
  catch (e) { alert('Could not save — your phone storage may be full.'); }
}

/* ---------- units ---------- */
const wUnit = () => S.settings.weightUnit;
const kgTo = kg => wUnit() === 'lb' ? kg / KG_PER_LB : kg;
const toKg = v => wUnit() === 'lb' ? v * KG_PER_LB : v;
const fmtW = kg => kgTo(kg).toFixed(1);
const vUnit = () => S.settings.waterUnit;
const mlTo = ml => vUnit() === 'oz' ? ml / ML_PER_OZ : ml;
const toMl = v => vUnit() === 'oz' ? v * ML_PER_OZ : v;
const fmtV = ml => vUnit() === 'oz' ? String(Math.round(ml / ML_PER_OZ)) : (ml >= 1000 ? (ml / 1000).toFixed(2).replace(/0$/, '') : String(Math.round(ml)));
const vLabel = ml => vUnit() === 'oz' ? 'oz' : (ml >= 1000 ? 'L' : 'ml');

/* ---------- tiny UI bits ---------- */
const ICON = {
  plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
  gear: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
  search: '<svg viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M20 20l-4.8-4.8"/></svg>',
  drop: '<svg class="glyph" viewBox="0 0 24 24"><path d="M12 2.8c3.4 4.3 6.4 7.8 6.4 11.4a6.4 6.4 0 0 1-12.8 0C5.6 10.6 8.6 7.1 12 2.8z"/></svg>',
  scale: '<svg class="glyph" viewBox="0 0 24 24"><path d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm5 4.2a5.4 5.4 0 0 0-4.6 2.6l1.7 1a3.4 3.4 0 0 1 2.2-1.5l-.3 1.4h2l.4-2.2a5.4 5.4 0 0 0-1.4-.3z"/></svg>',
  bubble: '<svg class="glyph" viewBox="0 0 24 24"><path d="M6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H11l-4.5 4v-4A2.5 2.5 0 0 1 4 13.5v-8A2.5 2.5 0 0 1 6.5 3z"/></svg>',
  book: '<svg class="glyph" viewBox="0 0 24 24"><path d="M11 6C9 4.6 6.4 4.2 3.5 4.5v13.4c2.9-.2 5.5.2 7.5 1.6zm2 0v13.5c2-1.4 4.6-1.8 7.5-1.6V4.5C17.6 4.2 15 4.6 13 6z"/></svg>',
  flame: '<svg class="glyph" viewBox="0 0 24 24"><path d="M12 2c1 3.5 5.5 6 5.5 11a5.5 5.5 0 0 1-11 0c0-2.4 1.2-4 2.4-5.3.2 1.7 1 2.8 2.1 3.3C10.6 8 11.2 5 12 2z"/></svg>'
};

let toastTimer;
function toast(msg) {
  let t = $('.toast');
  if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 1600);
}

function ring(pct, color, size = 120, stroke = 12, inner = '') {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r, p = clamp(pct, 0, 1);
  return `<div class="ring" style="width:${size}px;height:${size}px">
    <svg viewBox="0 0 ${size} ${size}">
      <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${color}" stroke-opacity=".2" stroke-width="${stroke}"/>
      <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round"
        stroke-dasharray="${c.toFixed(2)}" stroke-dashoffset="${(c * (1 - p)).toFixed(2)}" transform="rotate(-90 ${size / 2} ${size / 2})"/>
    </svg><div class="ring-inner">${inner}</div></div>`;
}

function barChart(values, labels, goal, color, fmt) {
  const W = 340, H = 160, T = 14, B = 22, L = 4, R = 4;
  const max = Math.max(goal || 0, ...values, 1) * 1.12;
  const n = values.length, slot = (W - L - R) / n, bw = Math.min(26, slot * .6);
  const y = v => T + (1 - v / max) * (H - T - B);
  let s = `<svg viewBox="0 0 ${W} ${H}">`;
  s += `<line class="grid" x1="0" x2="${W}" y1="${H - B}" y2="${H - B}"/>`;
  values.forEach((v, i) => {
    const x = L + slot * i + (slot - bw) / 2, h = Math.max(H - B - y(v), v > 0 ? 3 : 0);
    s += `<rect x="${x}" y="${H - B - h}" width="${bw}" height="${h}" rx="${Math.min(5, bw / 2)}" fill="${color}" ${goal && v < goal ? 'fill-opacity=".55"' : ''}/>`;
    s += `<text class="axis" x="${x + bw / 2}" y="${H - 6}" text-anchor="middle">${esc(labels[i])}</text>`;
  });
  if (goal) s += `<line class="goal" x1="0" x2="${W}" y1="${y(goal)}" y2="${y(goal)}" stroke="${color}"/><text class="axis" x="${W}" y="${y(goal) - 4}" text-anchor="end">Goal ${esc(fmt(goal))}</text>`;
  return s + '</svg>';
}

function last7() {
  const out = [];
  for (let i = 6; i >= 0; i--) { const d = addDays(new Date(), -i); out.push({ k: dkey(d), l: d.toLocaleDateString(undefined, { weekday: 'narrow' }) }); }
  return out;
}

/* ---------- navigation ---------- */
let tab = localStorage.getItem('daily.tab') || 'today';
function setTab(t) {
  tab = t; localStorage.setItem('daily.tab', t);
  window.scrollTo(0, 0); render();
}
function render() {
  document.querySelectorAll('.view').forEach(v => v.classList.toggle('active', v.id === 'view-' + tab));
  document.querySelectorAll('#tabbar button').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  ({ today: renderToday, weight: renderWeight, water: renderWater, spanish: renderSpanish, read: renderRead })[tab]();
}

/* =========================================================
   SUMMARY
   ========================================================= */
function waterToday() { return (S.water[dkey()] || []).reduce((a, e) => a + e.ml, 0); }
function minutesToday() { return S.spanish.minutes[dkey()] || 0; }
function streak() {
  let d = new Date(), n = 0;
  if (!(S.spanish.minutes[dkey(d)] > 0)) d = addDays(d, -1);
  while (S.spanish.minutes[dkey(d)] > 0) { n++; d = addDays(d, -1); }
  return n;
}
function sortedWeights() { return [...S.weights].sort((a, b) => a.d.localeCompare(b.d)); }

function renderToday() {
  const now = new Date();
  const hour = now.getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const w = waterToday(), wg = S.settings.waterGoalMl;
  const ws = sortedWeights(), latest = ws[ws.length - 1];
  const m = minutesToday(), mg = S.settings.spanishGoalMin, st = streak();
  const lib = libMeta();
  const aotd = articleOfTheDay();

  let weightBody = `<div class="note">No weigh-ins yet. Tap to add your first.</div>`;
  if (latest) {
    const first = ws[0];
    const diff = kgTo(latest.kg) - kgTo(first.kg);
    let goalNote = '';
    if (S.settings.weightGoalKg != null) {
      const togo = kgTo(latest.kg) - kgTo(S.settings.weightGoalKg);
      goalNote = Math.abs(togo) < 0.05 ? ' · Goal reached 🎉' : ` · ${Math.abs(togo).toFixed(1)} ${wUnit()} to goal`;
    }
    weightBody = `<div><div class="big">${fmtW(latest.kg)}<small>${wUnit()}</small></div>
      <div class="note">${ws.length > 1 ? `${diff > 0 ? '+' : ''}${diff.toFixed(1)} ${wUnit()} since ${fmtDate(first.d)}` : 'First entry'}${goalNote}</div></div>`;
  }

  $('#view-today').innerHTML = `
    <div class="nav-top"><button class="icon-btn" data-action="settings" aria-label="Settings">${ICON.gear}</button></div>
    <h1 class="large-title">Summary</h1>
    <div class="subtitle">${greet} · ${now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</div>

    <button class="card" data-action="tab" data-tab="water">
      <div class="card-head" style="color:var(--water)">${ICON.drop} Water<span class="chev"></span></div>
      <div class="card-body">
        <div><div class="big">${fmtV(w)}<small>/ ${fmtV(wg)} ${vLabel(wg)}</small></div>
        <div class="note">${w >= wg ? 'Goal reached — nice work 💧' : `${fmtV(wg - w)} ${vLabel(wg - w)} to go today`}</div></div>
        ${ring(w / wg, 'var(--water)', 64, 9)}
      </div>
    </button>

    <button class="card" data-action="tab" data-tab="weight">
      <div class="card-head" style="color:var(--weight)">${ICON.scale} Weight${latest ? `<span class="time">${fmtDate(latest.d)}</span>` : ''}<span class="chev"></span></div>
      <div class="card-body">${weightBody}</div>
    </button>

    <button class="card" data-action="tab" data-tab="spanish">
      <div class="card-head" style="color:var(--spanish)">${ICON.bubble} Español<span class="chev"></span></div>
      <div class="card-body">
        <div><div class="big">${m}<small>/ ${mg} min</small></div>
        <div class="note">${st ? `🔥 ${st}-day streak` : 'Start a streak today'} · ${(n => `${n} active goal${n === 1 ? '' : 's'}`)(S.spanish.goals.filter(g => g.progress < g.target).length)}</div></div>
        ${ring(m / mg, 'var(--spanish)', 64, 9)}
      </div>
    </button>

    <button class="card" data-action="${aotd ? 'open-article' : 'tab'}" data-tab="read" data-id="${aotd ? esc(aotd.id) : ''}">
      <div class="card-head" style="color:var(--read)">${ICON.book} ${aotd ? 'Today’s Read' : 'Read'}<span class="chev"></span></div>
      ${aotd
        ? `<div style="font-family:var(--serif);font-size:22px;font-weight:600;letter-spacing:0">${esc(aotd.title)}</div><div class="note">${esc(aotd.cat)} · ${aotd.min} min read</div>`
        : `<div class="note">${lib.length ? `${lib.length} articles saved` : 'Download your offline library (one time, on Wi‑Fi).'}</div>`}
    </button>
  `;
}

/* =========================================================
   WEIGHT
   ========================================================= */
let weightRange = '3M';
function renderWeight() {
  const ws = sortedWeights(), latest = ws[ws.length - 1];
  const days = { '1M': 31, '3M': 92, '1Y': 366, 'All': 1e6 }[weightRange];
  const cutoff = dkey(addDays(new Date(), -days));
  const pts = ws.filter(p => p.d >= cutoff);
  let changeNote = '';
  if (pts.length > 1) {
    const diff = kgTo(pts[pts.length - 1].kg) - kgTo(pts[0].kg);
    const goal0 = S.settings.weightGoalKg;
    const toward = goal0 == null ? null : (kgTo(goal0) < kgTo(pts[0].kg) ? diff < 0 : diff > 0);
    changeNote = `<div class="note ${toward == null ? '' : toward ? 'down' : 'up'}">${diff > 0 ? '▲' : '▼'} ${Math.abs(diff).toFixed(1)} ${wUnit()} in this range</div>`;
  }
  const goal = S.settings.weightGoalKg;

  $('#view-weight').innerHTML = `
    <div class="nav-top"><button class="icon-btn" data-action="add-weight" aria-label="Add weight">${ICON.plus}</button></div>
    <h1 class="large-title">Weight</h1>
    <div class="subtitle">${latest ? `Latest ${fmtDate(latest.d, { month: 'long', day: 'numeric' })}` : 'Track your progress over time'}</div>

    <div class="hero" style="align-items:flex-start;padding-top:0">
      <div class="big" style="font-size:44px">${latest ? fmtW(latest.kg) : '—'}<small>${wUnit()}</small></div>
      ${changeNote}
    </div>

    <div class="seg">${['1M', '3M', '1Y', 'All'].map(r => `<button class="${r === weightRange ? 'active' : ''}" data-action="weight-range" data-r="${r}">${r}</button>`).join('')}</div>
    <div class="chart">${pts.length >= 2 ? lineChart(pts, goal) : `<div class="empty">${pts.length ? 'Add one more weigh-in to see your trend.' : 'No entries in this range yet.'}</div>`}</div>

    <div class="pad" style="margin-top:16px"><button class="btn" data-action="add-weight">Log Weight</button></div>

    <div class="section-header">Goal</div>
    <div class="group">
      <button class="row tap" data-action="weight-goal"><span class="grow">Goal weight</span><span class="value">${goal != null ? `${fmtW(goal)} ${wUnit()}` : 'Not set'}</span><span class="chev"></span></button>
      ${goal != null && latest ? `<div class="row"><span class="grow">Remaining</span><span class="value">${Math.abs(kgTo(latest.kg) - kgTo(goal)).toFixed(1)} ${wUnit()}</span></div>` : ''}
    </div>

    <div class="section-header">History</div>
    <div class="group">
      ${ws.length ? [...ws].reverse().slice(0, 120).map((p, i, arr) => {
        const prev = arr[i + 1];
        const d = prev ? kgTo(p.kg) - kgTo(prev.kg) : null;
        return `<button class="row tap" data-action="edit-weight" data-id="${p.id}">
          <span class="grow">${fmtDate(p.d, { weekday: 'short', month: 'short', day: 'numeric', year: parseKey(p.d).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined })}</span>
          ${d != null ? `<span class="value" style="font-size:13px">${d > 0 ? '+' : ''}${d.toFixed(1)}</span>` : ''}
          <span style="font-weight:600;font-family:var(--rounded)">${fmtW(p.kg)} ${wUnit()}</span><span class="chev"></span></button>`;
      }).join('') : '<div class="empty-state">Your weigh-ins will appear here.</div>'}
    </div>
    ${ws.length ? '<div class="section-footer">Tip: weigh yourself at the same time each day (like right after waking) for the most consistent trend.</div>' : ''}
  `;
}

function lineChart(pts, goalKg) {
  const W = 340, H = 200, L = 36, R = 10, T = 14, B = 24;
  const vals = pts.map(p => kgTo(p.kg));
  let lo = Math.min(...vals), hi = Math.max(...vals);
  const g = goalKg != null ? kgTo(goalKg) : null;
  const span0 = Math.max(hi - lo, 4);
  const showGoal = g != null && g > lo - span0 * 1.5 && g < hi + span0 * 1.5;
  if (showGoal) { lo = Math.min(lo, g); hi = Math.max(hi, g); }
  if (hi - lo < 2) { const mid = (hi + lo) / 2; lo = mid - 1; hi = mid + 1; }
  const padv = (hi - lo) * .12; lo -= padv; hi += padv;
  const t0 = parseKey(pts[0].d).getTime(), t1 = parseKey(pts[pts.length - 1].d).getTime(), span = Math.max(t1 - t0, 1);
  const x = p => L + (parseKey(p.d).getTime() - t0) / span * (W - L - R);
  const y = v => T + (hi - v) / (hi - lo) * (H - T - B);
  let s = `<svg viewBox="0 0 ${W} ${H}"><defs><linearGradient id="wg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--weight)" stop-opacity=".3"/><stop offset="1" stop-color="var(--weight)" stop-opacity="0"/></linearGradient></defs>`;
  for (let i = 0; i <= 3; i++) {
    const v = lo + (hi - lo) * i / 3;
    s += `<line class="grid" x1="${L}" x2="${W}" y1="${y(v)}" y2="${y(v)}"/><text class="axis" x="${L - 6}" y="${y(v) + 4}" text-anchor="end">${v.toFixed(0)}</text>`;
  }
  if (showGoal) s += `<line class="goal" x1="${L}" x2="${W}" y1="${y(g)}" y2="${y(g)}" stroke="var(--green)"/><text class="axis" x="${W}" y="${y(g) - 5}" text-anchor="end" style="fill:var(--green)">Goal</text>`;
  const path = pts.map((p, i) => `${i ? 'L' : 'M'}${x(p).toFixed(1)},${y(kgTo(p.kg)).toFixed(1)}`).join('');
  s += `<path d="${path}L${x(pts[pts.length - 1]).toFixed(1)},${H - B}L${x(pts[0]).toFixed(1)},${H - B}Z" fill="url(#wg)"/>`;
  s += `<path d="${path}" fill="none" stroke="var(--weight)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>`;
  if (pts.length <= 60) pts.forEach(p => { s += `<circle cx="${x(p)}" cy="${y(kgTo(p.kg))}" r="3.2" fill="var(--card)" stroke="var(--weight)" stroke-width="2"/>`; });
  s += `<text class="axis" x="${L}" y="${H - 6}">${fmtDate(pts[0].d)}</text><text class="axis" x="${W}" y="${H - 6}" text-anchor="end">${fmtDate(pts[pts.length - 1].d)}</text>`;
  return s + '</svg>';
}

function weightSheet(entry) {
  openSheet({
    title: entry ? 'Edit Weight' : 'Log Weight',
    body: `<div class="group">
        <div class="row field"><label>Weight</label><input name="v" inputmode="decimal" placeholder="0.0" value="${entry ? fmtW(entry.kg) : ''}"><span class="unit">${wUnit()}</span></div>
        <div class="row field"><label>Date</label><input name="d" type="date" value="${entry ? entry.d : dkey()}" max="${dkey()}"></div>
      </div>
      ${entry ? `<div class="group" style="margin-top:24px"><button type="button" class="row destructive" data-sheet-act="delete">Delete Entry</button></div>` : ''}`,
    onSave(f) {
      const v = num(f.get('v')); const d = f.get('d') || dkey();
      if (!(v > 0 && v < 1500)) { toast('Enter a valid weight'); return false; }
      if (entry) S.weights = S.weights.filter(w => w.id !== entry.id);
      S.weights = S.weights.filter(w => w.d !== d);   // one entry per day
      S.weights.push({ id: entry ? entry.id : uid(), d, kg: toKg(v) });
      save(); toast('Saved');
    },
    actions: { delete() { if (confirm('Delete this weigh-in?')) { S.weights = S.weights.filter(w => w.id !== entry.id); save(); closeSheet(); render(); } } }
  });
}

function weightGoalSheet() {
  const g = S.settings.weightGoalKg;
  openSheet({
    title: 'Goal Weight',
    body: `<div class="group"><div class="row field"><label>Goal</label><input name="v" inputmode="decimal" placeholder="0.0" value="${g != null ? fmtW(g) : ''}"><span class="unit">${wUnit()}</span></div></div>
      ${g != null ? `<div class="group" style="margin-top:24px"><button type="button" class="row destructive" data-sheet-act="clear">Remove Goal</button></div>` : ''}`,
    onSave(f) {
      const v = num(f.get('v'));
      if (!(v > 0 && v < 1500)) { toast('Enter a valid weight'); return false; }
      S.settings.weightGoalKg = toKg(v); save();
    },
    actions: { clear() { S.settings.weightGoalKg = null; save(); closeSheet(); render(); } }
  });
}

/* =========================================================
   WATER
   ========================================================= */
function renderWater() {
  const today = S.water[dkey()] || [];
  const w = waterToday(), g = S.settings.waterGoalMl;
  const quick = vUnit() === 'oz' ? [8, 12, 16, 24] : [250, 330, 500, 750];
  const week = last7();
  const vals = week.map(d => (S.water[d.k] || []).reduce((a, e) => a + e.ml, 0));
  const hit = vals.filter(v => v >= g).length;

  $('#view-water').innerHTML = `
    <div class="nav-top"><button class="icon-btn" data-action="water-custom" aria-label="Add custom amount">${ICON.plus}</button></div>
    <h1 class="large-title">Water</h1>
    <div class="subtitle">Today</div>

    <div class="hero">
      ${ring(w / g, 'var(--water)', 200, 20, `<div class="big">${fmtV(w)}</div><div class="muted" style="font-size:15px;font-weight:600">of ${fmtV(g)} ${vLabel(g)}</div>`)}
      <div class="note" style="margin-top:12px">${w >= g ? 'Daily goal complete 🎉' : `${Math.round(w / g * 100)}% · ${fmtV(g - w)} ${vLabel(g - w)} to go`}</div>
    </div>

    <div class="pills" style="--accent:var(--water)">
      ${quick.map(q => `<button class="pill accent" data-action="water-add" data-ml="${toMl(q)}">+${q}<small>${vUnit()}</small></button>`).join('')}
    </div>
    <div class="pad" style="margin-top:10px;display:flex;justify-content:space-between">
      <button class="link-btn" data-action="water-custom">Custom amount</button>
      ${today.length ? `<button class="link-btn" data-action="water-undo">Undo last</button>` : ''}
    </div>

    <div class="section-header">Last 7 Days</div>
    <div class="chart"><div class="chart-title"><span>Goal met ${hit} of 7 days</span><span>${vUnit()}</span></div>
      ${barChart(vals.map(mlTo), week.map(d => d.l), mlTo(g), 'var(--water)', v => Math.round(v))}</div>

    <div class="section-header">Today’s Log</div>
    <div class="group">
      ${today.length ? [...today].reverse().map((e, i) => `
        <button class="row tap" data-action="water-del" data-i="${today.length - 1 - i}">
          <span style="color:var(--water)">${ICON.drop.replace('class="glyph"', 'class="glyph" style="width:18px;height:18px;fill:currentColor"')}</span>
          <span class="grow">${fmtV(e.ml)} ${vLabel(e.ml)}</span>
          <span class="value">${new Date(e.t).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}</span></button>`).join('')
        : '<div class="empty-state">Tap a button above each time you drink.</div>'}
    </div>

    <div class="section-header">Settings</div>
    <div class="group">
      <button class="row tap" data-action="water-goal"><span class="grow">Daily goal</span><span class="value">${fmtV(g)} ${vLabel(g)}</span><span class="chev"></span></button>
    </div>
    <div class="section-footer">Needs vary with body size, activity and heat. Thirst and pale-yellow urine are good everyday guides.</div>
  `;
}
function addWater(ml) {
  const k = dkey();
  const before = waterToday();
  (S.water[k] = S.water[k] || []).push({ t: Date.now(), ml: Math.round(ml) });
  save(); render();
  if (before < S.settings.waterGoalMl && waterToday() >= S.settings.waterGoalMl) toast('💧 Daily goal reached!');
  else toast(`+${fmtV(ml)} ${vLabel(ml)}`);
}
function waterCustomSheet() {
  openSheet({
    title: 'Add Water',
    body: `<div class="group"><div class="row field"><label>Amount</label><input name="v" inputmode="decimal" placeholder="0"><span class="unit">${vUnit()}</span></div></div>`,
    onSave(f) { const v = num(f.get('v')); if (!(v > 0 && v < 10000)) { toast('Enter an amount'); return false; } closeSheet(); addWater(toMl(v)); }
  });
}
function waterGoalSheet() {
  openSheet({
    title: 'Daily Water Goal',
    body: `<div class="group"><div class="row field"><label>Goal</label><input name="v" inputmode="decimal" value="${Math.round(mlTo(S.settings.waterGoalMl))}"><span class="unit">${vUnit()}</span></div></div>`,
    onSave(f) { const v = num(f.get('v')); if (!(v > 0)) { toast('Enter a goal'); return false; } S.settings.waterGoalMl = Math.round(toMl(v)); save(); }
  });
}

/* =========================================================
   SPANISH
   ========================================================= */
const WORDS = [
  ['agua', 'water', 'Bebo agua todos los días.', 'I drink water every day.'],
  ['dormir', 'to sleep', 'Necesito dormir ocho horas.', 'I need to sleep eight hours.'],
  ['despertarse', 'to wake up', 'Me despierto a las seis.', 'I wake up at six.'],
  ['cansado / cansada', 'tired', 'Estoy muy cansado hoy.', 'I am very tired today.'],
  ['el desayuno', 'breakfast', 'El desayuno está listo.', 'Breakfast is ready.'],
  ['el almuerzo', 'lunch', '¿Dónde comemos el almuerzo?', 'Where are we eating lunch?'],
  ['la cena', 'dinner', 'La cena es a las ocho.', 'Dinner is at eight.'],
  ['la salud', 'health', 'La salud es lo más importante.', 'Health is the most important thing.'],
  ['el peso', 'weight', 'Mi peso bajó un poco.', 'My weight went down a little.'],
  ['el hábito', 'habit', 'Leer es un buen hábito.', 'Reading is a good habit.'],
  ['la meta', 'goal', 'Mi meta es hablar español.', 'My goal is to speak Spanish.'],
  ['aprender', 'to learn', 'Quiero aprender algo nuevo.', 'I want to learn something new.'],
  ['leer', 'to read', 'Me gusta leer por la noche.', 'I like to read at night.'],
  ['escribir', 'to write', 'Escribo en mi diario.', 'I write in my journal.'],
  ['hablar', 'to speak', '¿Hablas inglés?', 'Do you speak English?'],
  ['escuchar', 'to listen', 'Escucho música en español.', 'I listen to music in Spanish.'],
  ['entender', 'to understand', 'No entiendo la pregunta.', 'I don’t understand the question.'],
  ['poco a poco', 'little by little', 'Poco a poco se va lejos.', 'Little by little, you go far.'],
  ['todavía', 'still / yet', 'Todavía estoy aprendiendo.', 'I am still learning.'],
  ['ya', 'already', 'Ya terminé la tarea.', 'I already finished the homework.'],
  ['siempre', 'always', 'Siempre llevo una botella de agua.', 'I always carry a water bottle.'],
  ['nunca', 'never', 'Nunca es tarde para aprender.', 'It’s never too late to learn.'],
  ['a veces', 'sometimes', 'A veces corro en la playa.', 'Sometimes I run on the beach.'],
  ['mañana', 'tomorrow / morning', 'Nos vemos mañana por la mañana.', 'See you tomorrow morning.'],
  ['ayer', 'yesterday', 'Ayer caminé mucho.', 'Yesterday I walked a lot.'],
  ['hoy', 'today', 'Hoy es un buen día.', 'Today is a good day.'],
  ['temprano', 'early', 'Me acuesto temprano.', 'I go to bed early.'],
  ['tarde', 'late / afternoon', 'Llegamos tarde.', 'We arrived late.'],
  ['caminar', 'to walk', 'Vamos a caminar después de cenar.', 'Let’s walk after dinner.'],
  ['correr', 'to run', 'Corro tres veces por semana.', 'I run three times a week.'],
  ['nadar', 'to swim', 'Los niños nadan en el mar.', 'The kids swim in the sea.'],
  ['fuerte', 'strong', 'Estás más fuerte que antes.', 'You are stronger than before.'],
  ['feliz', 'happy', 'Estoy feliz con mi progreso.', 'I am happy with my progress.'],
  ['tranquilo / tranquila', 'calm', 'Tranquilo, todo va a salir bien.', 'Relax, everything will be fine.'],
  ['el esfuerzo', 'effort', 'Vale la pena el esfuerzo.', 'The effort is worth it.'],
  ['lograr', 'to achieve', 'Lo vas a lograr.', 'You are going to achieve it.'],
  ['mejorar', 'to improve', 'Quiero mejorar mi pronunciación.', 'I want to improve my pronunciation.'],
  ['olvidar', 'to forget', 'No olvides tomar agua.', 'Don’t forget to drink water.'],
  ['recordar', 'to remember', '¿Recuerdas su nombre?', 'Do you remember her name?'],
  ['la pregunta', 'question', 'Tengo una pregunta.', 'I have a question.'],
  ['la respuesta', 'answer', 'La respuesta es correcta.', 'The answer is correct.'],
  ['el amigo / la amiga', 'friend', 'Mi amiga habla español.', 'My friend speaks Spanish.'],
  ['la familia', 'family', 'Ceno con mi familia.', 'I eat dinner with my family.'],
  ['el trabajo', 'work / job', 'Voy al trabajo en carro.', 'I go to work by car.'],
  ['la playa', 'beach', 'La playa está cerca.', 'The beach is close.'],
  ['el mar', 'sea', 'El mar está tranquilo hoy.', 'The sea is calm today.'],
  ['la lluvia', 'rain', 'Me gusta el sonido de la lluvia.', 'I like the sound of the rain.'],
  ['el libro', 'book', 'Este libro es interesante.', 'This book is interesting.'],
  ['la palabra', 'word', '¿Qué significa esta palabra?', 'What does this word mean?'],
  ['el idioma', 'language', 'El español es un idioma bonito.', 'Spanish is a beautiful language.'],
  ['¡Ánimo!', 'Keep going! / Cheer up!', '¡Ánimo! Ya casi terminas.', 'Keep going! You’re almost done.'],
  ['aprovechar', 'to make the most of', 'Aprovecha el día.', 'Make the most of the day.'],
  ['la sobremesa', 'time chatting at the table after a meal', 'La sobremesa duró dos horas.', 'The after-dinner chat lasted two hours.'],
  ['estrenar', 'to use/wear for the first time', 'Hoy estreno mis zapatos.', 'Today I’m wearing my shoes for the first time.'],
  ['madrugar', 'to get up very early', 'No me gusta madrugar.', 'I don’t like getting up early.'],
  ['la siesta', 'afternoon nap', 'Tomo una siesta corta.', 'I take a short nap.'],
  ['sano / sana', 'healthy', 'Comemos comida sana.', 'We eat healthy food.'],
  ['el vaso', 'glass (for drinking)', 'Un vaso de agua, por favor.', 'A glass of water, please.'],
  ['tener sed', 'to be thirsty', 'Tengo mucha sed.', 'I am very thirsty.'],
  ['echar de menos', 'to miss (someone)', 'Te echo de menos.', 'I miss you.']
];
let wordRevealed = false;
const todaysWord = () => WORDS[daysSinceEpoch() % WORDS.length];

const GOAL_TEMPLATES = [
  { title: 'Learn new words', target: 100, unit: 'words' },
  { title: 'Finish lessons', target: 30, unit: 'lessons' },
  { title: 'Read articles in Spanish', target: 10, unit: 'articles' },
  { title: 'Watch shows in Spanish', target: 10, unit: 'episodes' },
  { title: 'Have conversations', target: 5, unit: 'chats' },
  { title: 'Learn verb tenses', target: 6, unit: 'tenses' }
];

function renderSpanish() {
  const m = minutesToday(), mg = S.settings.spanishGoalMin, st = streak();
  const week = last7(), vals = week.map(d => S.spanish.minutes[d.k] || 0);
  const total = Object.values(S.spanish.minutes).reduce((a, b) => a + b, 0);
  const w = todaysWord();
  const goals = S.spanish.goals;
  const active = goals.filter(g => g.progress < g.target), done = goals.filter(g => g.progress >= g.target);

  const goalRow = g => {
    const pct = g.progress / g.target;
    const due = g.due ? ` · due ${fmtDate(g.due)}` : '';
    const late = g.due && g.due < dkey() && pct < 1;
    return `<div class="row goal-row">
      <button class="grow" style="text-align:left" data-action="edit-goal" data-id="${g.id}">
        <div class="title" style="white-space:normal">${esc(g.title)}</div>
        <div class="sub">${pct >= 1 ? '<span class="done-badge">✓ Completed</span>' : `${g.progress} / ${g.target} ${esc(g.unit)}`}<span style="${late ? 'color:var(--red)' : ''}">${due}</span></div>
        <div class="bar" style="--accent:${pct >= 1 ? 'var(--green)' : 'var(--spanish)'}"><i style="width:${clamp(pct, 0, 1) * 100}%"></i></div>
      </button>
      <div class="stepper"><button data-action="goal-step" data-id="${g.id}" data-n="-1" aria-label="Decrease">−</button><button data-action="goal-step" data-id="${g.id}" data-n="1" aria-label="Increase">+</button></div>
    </div>`;
  };

  $('#view-spanish').innerHTML = `
    <div class="nav-top"><button class="icon-btn" data-action="add-goal" aria-label="Add goal">${ICON.plus}</button></div>
    <h1 class="large-title">Español</h1>
    <div class="subtitle">${st ? `🔥 ${st}-day streak` : 'Practice today to start a streak'} · ${Math.round(total / 60 * 10) / 10} hrs total</div>

    <div class="card">
      <div class="card-head" style="color:var(--spanish)">${ICON.flame} Practice Today</div>
      <div class="card-body">
        <div><div class="big">${m}<small>/ ${mg} min</small></div>
          <div class="note">${m >= mg ? '¡Excelente! Goal done.' : `${mg - m} min to go`}</div></div>
        ${ring(m / mg, 'var(--spanish)', 72, 10)}
      </div>
    </div>
    <div class="pills" style="--accent:var(--spanish)">
      ${[5, 10, 15, 30].map(q => `<button class="pill accent" data-action="min-add" data-n="${q}">+${q}<small>min</small></button>`).join('')}
    </div>
    <div class="pad" style="margin-top:10px;display:flex;justify-content:space-between">
      <button class="link-btn" data-action="min-custom">Custom / edit today</button>
      <button class="link-btn" data-action="min-goal">Daily goal</button>
    </div>

    <div class="section-header big-h">Palabra del día</div>
    <button class="card" data-action="reveal-word">
      <div class="word">${esc(w[0])}</div>
      ${wordRevealed
        ? `<div class="word-meaning">${esc(w[1])}</div><div class="word-example">${esc(w[2])}<span>${esc(w[3])}</span></div>`
        : `<div class="reveal-hint">Tap to reveal meaning</div>`}
    </button>

    <div class="section-header big-h" style="display:flex;justify-content:space-between;align-items:center">Goals
      <button class="round-add" data-action="add-goal" aria-label="Add goal">${ICON.plus}</button></div>
    ${goals.length ? '' : `<div class="section-footer" style="margin:0 16px 10px">Pick a starter goal or tap + to make your own:</div>
      <div class="chips">${GOAL_TEMPLATES.map((t, i) => `<button class="chip" data-action="goal-template" data-i="${i}">${esc(t.title)}</button>`).join('')}</div>`}
    ${active.length ? `<div class="group">${active.map(goalRow).join('')}</div>` : (goals.length ? '<div class="empty-state">All goals complete. Add a new one!</div>' : '')}
    ${done.length ? `<div class="section-header">Completed</div><div class="group">${done.map(goalRow).join('')}</div>` : ''}

    <div class="section-header">Last 7 Days</div>
    <div class="chart"><div class="chart-title"><span>Minutes practiced</span><span>${vals.reduce((a, b) => a + b, 0)} min this week</span></div>
      ${barChart(vals, week.map(d => d.l), mg, 'var(--spanish)', v => v + ' min')}</div>
    <div class="section-footer">The Read tab has a Spanish section about the language, its history and how people learn it.</div>
  `;
}
function addMinutes(n) {
  const k = dkey(), before = minutesToday();
  S.spanish.minutes[k] = Math.max(0, (S.spanish.minutes[k] || 0) + n);
  save(); render();
  if (before < S.settings.spanishGoalMin && minutesToday() >= S.settings.spanishGoalMin) toast('¡Muy bien! Goal reached 🎉');
  else toast(`+${n} min`);
}
function goalSheet(goal, tpl) {
  const g = goal || tpl || {};
  openSheet({
    title: goal ? 'Edit Goal' : 'New Goal',
    body: `<div class="group">
        <div class="row field"><input name="title" style="text-align:left" placeholder="Goal (e.g. Learn food words)" value="${esc(g.title || '')}"></div>
        <div class="row field"><label>Target</label><input name="target" inputmode="numeric" placeholder="100" value="${g.target || ''}"></div>
        <div class="row field"><label>Counting</label><input name="unit" placeholder="words" value="${esc(g.unit || '')}"></div>
        ${goal ? `<div class="row field"><label>Progress</label><input name="progress" inputmode="numeric" value="${goal.progress}"></div>` : ''}
        <div class="row field"><label>Due date</label><input name="due" type="date" value="${g.due || ''}"></div>
      </div>
      <div class="section-footer">Optional due date. Use + and − on the goal to update progress.</div>
      ${goal ? `<div class="group" style="margin-top:24px"><button type="button" class="row destructive" data-sheet-act="delete">Delete Goal</button></div>` : ''}`,
    onSave(f) {
      const title = String(f.get('title') || '').trim(), target = Math.round(num(f.get('target')));
      if (!title) { toast('Give your goal a name'); return false; }
      if (!(target > 0)) { toast('Enter a target number'); return false; }
      const data = { title, target, unit: String(f.get('unit') || '').trim() || 'times', due: f.get('due') || '' };
      if (goal) { Object.assign(goal, data); const p = num(f.get('progress')); if (p >= 0) goal.progress = Math.round(p); }
      else S.spanish.goals.push({ id: uid(), progress: 0, created: dkey(), ...data });
      save(); toast(goal ? 'Goal updated' : 'Goal added');
    },
    actions: { delete() { if (confirm('Delete this goal?')) { S.spanish.goals = S.spanish.goals.filter(x => x.id !== goal.id); save(); closeSheet(); render(); } } }
  });
}

/* =========================================================
   LIBRARY (offline articles)
   ========================================================= */
const CAT_COLORS = {}; const ORDER = {}; const ALL_TITLES = [];
(window.LIBRARY || []).forEach(c => {
  CAT_COLORS[c.cat] = c.color;
  c.titles.forEach(t => { const id = slug(t); if (!(id in ORDER)) { ORDER[id] = ALL_TITLES.length; ALL_TITLES.push({ id, title: t, cat: c.cat }); } });
});

let _meta = null;
function libMeta() {
  if (!_meta) { try { _meta = JSON.parse(localStorage.getItem(META_KEY)) || []; } catch (e) { _meta = []; } }
  return _meta;
}
function saveMeta() { try { localStorage.setItem(META_KEY, JSON.stringify(_meta)); } catch (e) {} }

const IDB = {
  db: null,
  open() {
    if (this.db) return Promise.resolve(this.db);
    return new Promise((res, rej) => {
      const r = indexedDB.open('daily-library', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('articles', { keyPath: 'id' });
      r.onsuccess = () => { this.db = r.result; res(this.db); };
      r.onerror = () => rej(r.error);
    });
  },
  async put(a) { const db = await this.open(); return new Promise((res, rej) => { const tx = db.transaction('articles', 'readwrite'); tx.objectStore('articles').put(a); tx.oncomplete = res; tx.onerror = () => rej(tx.error); }); },
  async get(id) { const db = await this.open(); return new Promise((res, rej) => { const q = db.transaction('articles').objectStore('articles').get(id); q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error); }); },
  async clear() { const db = await this.open(); return new Promise((res, rej) => { const tx = db.transaction('articles', 'readwrite'); tx.objectStore('articles').clear(); tx.oncomplete = res; tx.onerror = () => rej(tx.error); }); }
};

function articleOfTheDay() {
  const lib = libMeta(); if (!lib.length) return null;
  const unread = lib.filter(a => !S.read[a.id]);
  const pool = unread.length ? unread : lib;
  const sorted = [...pool].sort((a, b) => a.id.localeCompare(b.id));
  return sorted[(daysSinceEpoch() * 7919) % sorted.length];
}

/* --- download --- */
const DL = { running: false, done: 0, total: 0, failed: 0 };
const STOP_SECTIONS = /^(see also|references|notes|external links|further reading|bibliography|sources|citations|footnotes|works cited|notes and references|explanatory notes|general and cited references|gallery)$/i;

function stripMath(t) {
  let i;
  while ((i = t.indexOf('{\\displaystyle')) !== -1) {
    let depth = 0, j = i;
    for (; j < t.length; j++) { if (t[j] === '{') depth++; else if (t[j] === '}') { depth--; if (depth === 0) break; } }
    t = t.slice(0, i) + t.slice(j + 1);
  }
  return t;
}
function toBlocks(extract) {
  const blocks = [];
  for (const raw of stripMath(extract).split('\n')) {
    const line = raw.trim(); if (!line) continue;
    const m = line.match(/^(={2,})\s*(.*?)\s*\1$/);
    if (m) { if (STOP_SECTIONS.test(m[2])) break; blocks.push({ h: Math.min(m[1].length, 3), t: m[2] }); }
    else blocks.push({ p: line });
  }
  // drop headings with nothing under them
  return blocks.filter((b, i) => !b.h || (blocks[i + 1] && blocks[i + 1].p));
}

async function fetchArticle(title, tries = 3) {
  const url = 'https://en.wikipedia.org/w/api.php?' + new URLSearchParams({
    action: 'query', format: 'json', formatversion: '2', origin: '*', redirects: '1',
    prop: 'extracts', explaintext: '1', exsectionformat: 'wiki', titles: title
  });
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url);
      if (r.status === 429 || r.status >= 500) throw new Error('busy');
      if (!r.ok) return null;
      const j = await r.json();
      const p = j.query && j.query.pages && j.query.pages[0];
      if (!p || p.missing || !p.extract) return null;
      return { title: p.title, extract: p.extract };
    } catch (e) {
      if (!navigator.onLine) throw new Error('offline');
      await new Promise(r => setTimeout(r, 1200 * (i + 1)));
    }
  }
  return null;
}

async function downloadLibrary() {
  if (DL.running) return;
  if (!navigator.onLine) { alert('You’re offline. Connect to Wi‑Fi and try again.'); return; }
  try { if (navigator.storage && navigator.storage.persist) await navigator.storage.persist(); } catch (e) {}
  const lib = libMeta();
  const have = new Set(lib.map(a => a.id));
  const haveTitles = new Set(lib.map(a => a.title));
  const queue = ALL_TITLES.filter(a => !have.has(a.id));
  Object.assign(DL, { running: true, done: 0, total: queue.length, failed: 0 });
  updateDL();
  let stopped = false;
  const worker = async () => {
    while (queue.length && !stopped) {
      const item = queue.shift();
      try {
        const res = await fetchArticle(item.title);
        if (res && !haveTitles.has(res.title)) {
          const blocks = toBlocks(res.extract);
          const words = blocks.reduce((a, b) => a + (b.p ? b.p.split(/\s+/).length : 0), 0);
          if (words > 80) {
            await IDB.put({ id: item.id, title: res.title, cat: item.cat, blocks });
            haveTitles.add(res.title);
            lib.push({ id: item.id, title: res.title, cat: item.cat, min: Math.max(1, Math.round(words / 230)) });
            if (lib.length % 10 === 0) saveMeta();
          } else DL.failed++;
        } else DL.failed++;
      } catch (e) {
        if (e.message === 'offline') { stopped = true; break; }
        DL.failed++;
      }
      DL.done++; updateDL();
    }
  };
  await Promise.all([worker(), worker(), worker(), worker()]);
  saveMeta();
  DL.running = false;
  render();
  toast(stopped ? 'Paused — you went offline' : `Library ready: ${lib.length} articles`);
}
function updateDL() {
  const el = $('#dl-progress'); if (!el) return;
  const pct = DL.total ? DL.done / DL.total : 0;
  el.innerHTML = `<div class="bar" style="--accent:var(--read)"><i style="width:${pct * 100}%"></i></div>
    <div class="note">Downloading ${DL.done} of ${DL.total}… keep the app open.</div>`;
}

/* --- Read tab --- */
let readCat = 'All', readQuery = '';
function filteredLib() {
  const q = readQuery.trim().toLowerCase();
  return libMeta()
    .filter(a => readCat === 'All' || (readCat === 'Unread' ? !S.read[a.id] : a.cat === readCat))
    .filter(a => !q || a.title.toLowerCase().includes(q) || a.cat.toLowerCase().includes(q))
    .sort((a, b) => (ORDER[a.id] ?? 1e9) - (ORDER[b.id] ?? 1e9));
}
function listHTML() {
  const items = filteredLib();
  if (!items.length) return `<div class="empty-state">${libMeta().length ? 'No matching articles.' : ''}</div>`;
  return `<div class="group">${items.map(a => `
    <button class="row tap" data-action="open-article" data-id="${esc(a.id)}">
      ${S.read[a.id] ? '<span class="read-check"></span>' : '<span class="unread-dot"></span>'}
      <span class="grow"><div class="title">${esc(a.title)}</div><div class="sub"><span style="color:${CAT_COLORS[a.cat] || 'inherit'}">●</span> ${esc(a.cat)} · ${a.min} min</div></span>
      <span class="chev"></span></button>`).join('')}</div>`;
}
function renderRead() {
  const lib = libMeta(), total = ALL_TITLES.length;
  const readCount = lib.filter(a => S.read[a.id]).length;
  const missing = total - lib.length;
  const cats = ['All', 'Unread', ...Object.keys(CAT_COLORS)];
  const aotd = articleOfTheDay();

  let dlCard = '';
  if (!lib.length || DL.running) {
    dlCard = `<div class="card">
      <div class="card-head" style="color:var(--read)">${ICON.book} Offline Library</div>
      <div style="font-size:15px;line-height:1.4">${total} articles on sleep, health, habits, water, Spanish, science, history, nature and more. Downloads once (about 15–25 MB), then works with no internet.</div>
      <div id="dl-progress" class="progress-wrap">${DL.running ? '' : `<button class="btn" style="background:var(--read)" data-action="download">Download Library</button>`}</div>
    </div>`;
  } else if (missing > 40) {
    dlCard = `<div class="pad" style="margin-bottom:12px"><button class="btn tinted" data-action="download">Finish downloading (${lib.length} of ${total})</button></div>`;
  }

  $('#view-read').innerHTML = `
    <div class="nav-top"></div>
    <h1 class="large-title">Read</h1>
    <div class="subtitle">${lib.length ? `${readCount} of ${lib.length} read · works offline` : 'Your offline library'}</div>
    ${dlCard}
    ${lib.length ? `
      ${aotd && readCat === 'All' && !readQuery ? `<button class="card" data-action="open-article" data-id="${esc(aotd.id)}">
        <div class="card-head" style="color:var(--read)">${ICON.book} Today’s Pick<span class="chev"></span></div>
        <div style="font-family:var(--serif);font-size:22px;font-weight:600;letter-spacing:0">${esc(aotd.title)}</div>
        <div class="note">${esc(aotd.cat)} · ${aotd.min} min read</div></button>` : ''}
      <div class="search">${ICON.search}<input id="read-search" type="search" placeholder="Search" value="${esc(readQuery)}" autocomplete="off"></div>
      <div class="chips" style="margin-bottom:14px">${cats.map(c => `<button class="chip ${c === readCat ? 'active' : ''}" data-action="read-cat" data-c="${esc(c)}">${esc(c)}</button>`).join('')}</div>
      <div id="read-list">${listHTML()}</div>` : ''}
  `;
  if (DL.running) updateDL();
  const s = $('#read-search');
  if (s) s.addEventListener('input', e => { readQuery = e.target.value; $('#read-list').innerHTML = listHTML(); });
}

/* --- reader --- */
let currentArticle = null;
async function openArticle(id) {
  let a;
  try { a = await IDB.get(id); } catch (e) {}
  if (!a) { toast('Article not downloaded yet'); return; }
  currentArticle = a;
  const meta = libMeta().find(m => m.id === id) || {};
  S.read[id] = S.read[id] || Date.now(); save();
  const r = $('#reader');
  r.style.setProperty('--reader-size', S.settings.readerSize + 'px');
  r.innerHTML = `
    <div class="reader-bar"><button class="back" data-action="close-reader">Read</button>
      <div class="tools"><button data-action="font" data-n="-1" aria-label="Smaller text" style="font-size:14px">A</button><button data-action="font" data-n="1" aria-label="Larger text" style="font-size:20px">A</button></div></div>
    <article class="article">
      <div class="kicker" style="color:${CAT_COLORS[a.cat] || 'var(--read)'}">${esc(a.cat)}</div>
      <h1>${esc(a.title)}</h1>
      <div class="meta">${meta.min || 1} min read</div>
      <div class="body">${a.blocks.map(b => b.p ? `<p>${esc(b.p)}</p>` : `<h${b.h}>${esc(b.t)}</h${b.h}>`).join('')}</div>
      <div class="end-actions">
        <button class="btn tinted" data-action="toggle-read">Mark as Unread</button>
        <button class="btn" data-action="next-article">Next Article</button>
      </div>
      <div class="source">Text from the Wikipedia article “${esc(a.title)}”, available under the
        <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener">CC BY-SA 4.0</a> license.
        <a href="https://en.wikipedia.org/wiki/${encodeURIComponent(a.title.replace(/ /g, '_'))}" target="_blank" rel="noopener">View original</a> (needs internet).</div>
    </article>`;
  r.scrollTop = 0;
  r.classList.add('open'); r.setAttribute('aria-hidden', 'false');
}
function closeReader() {
  const r = $('#reader'); r.classList.remove('open'); r.setAttribute('aria-hidden', 'true');
  render();
}
function nextArticle() {
  const list = filteredLib().length ? filteredLib() : libMeta();
  const i = list.findIndex(a => a.id === (currentArticle && currentArticle.id));
  const after = [...list.slice(i + 1), ...list.slice(0, Math.max(i, 0))];
  const next = after.find(a => !S.read[a.id]) || after[0];
  if (next) openArticle(next.id);
}

/* =========================================================
   SETTINGS & BACKUP
   ========================================================= */
function settingsSheet() {
  const lib = libMeta();
  openSheet({
    title: 'Settings',
    body: `
      <div class="section-header" style="margin-top:4px">Units</div>
      <div class="group">
        <div class="row"><span class="grow">Weight</span>
          <div class="seg in-row">${['lb', 'kg'].map(u => `<label><input type="radio" name="wu" value="${u}" ${wUnit() === u ? 'checked' : ''}><span>${u}</span></label>`).join('')}</div></div>
        <div class="row"><span class="grow">Water</span>
          <div class="seg in-row">${['oz', 'ml'].map(u => `<label><input type="radio" name="vu" value="${u}" ${vUnit() === u ? 'checked' : ''}><span>${u}</span></label>`).join('')}</div></div>
      </div>
      <div class="section-header">Library</div>
      <div class="group">
        <div class="row"><span class="grow">Saved articles</span><span class="value">${lib.length} of ${ALL_TITLES.length}</span></div>
        <button type="button" class="row link" data-sheet-act="download">Download missing articles</button>
        <button type="button" class="row link" data-sheet-act="unreadAll">Mark all as unread</button>
        <button type="button" class="row" style="color:var(--red)" data-sheet-act="wipeLib">Delete library from phone</button>
      </div>
      <div class="section-header">Backup</div>
      <div class="group">
        <button type="button" class="row link" data-sheet-act="export">Export data</button>
        <button type="button" class="row link" data-sheet-act="import">Import data</button>
      </div>
      <div class="section-footer">Your data is stored only on this phone. Export a backup now and then — paste it somewhere safe like Notes.</div>
      <div class="group" style="margin-top:24px"><button type="button" class="row destructive" data-sheet-act="reset">Erase All Data</button></div>
      <div class="section-footer" style="text-align:center;margin-top:18px">Daily · v1.0</div>`,
    save: 'Done',
    onSave(f) { S.settings.weightUnit = f.get('wu') || 'lb'; S.settings.waterUnit = f.get('vu') || 'oz'; save(); },
    actions: {
      download() { closeSheet(); setTab('read'); downloadLibrary(); },
      unreadAll() { if (confirm('Mark every article as unread?')) { S.read = {}; save(); toast('Done'); } },
      async wipeLib() { if (confirm('Remove all downloaded articles from this phone? You can download them again later.')) { await IDB.clear(); _meta = []; saveMeta(); closeSheet(); render(); toast('Library removed'); } },
      export() { backupSheet('export'); },
      import() { backupSheet('import'); },
      reset() {
        if (confirm('Erase all weight, water, Spanish and reading data? This cannot be undone.') && confirm('Are you sure?')) {
          S = defaults(); save(); closeSheet(); render(); toast('All data erased');
        }
      }
    }
  });
}
function backupSheet(mode) {
  const data = JSON.stringify(S);
  openSheet({
    title: mode === 'export' ? 'Export Data' : 'Import Data',
    body: `<div class="group"><div class="row"><textarea class="code" name="json" ${mode === 'export' ? 'readonly' : 'placeholder="Paste your backup here"'}>${mode === 'export' ? esc(data) : ''}</textarea></div></div>
      ${mode === 'export' ? `<div class="pad" style="margin-top:16px"><button type="button" class="btn" data-sheet-act="copy">Copy Backup</button></div>
        <div class="section-footer">Paste it into Notes or email it to yourself.</div>`
      : `<div class="section-footer">This replaces the data currently in the app.</div>`}`,
    save: mode === 'export' ? 'Done' : 'Import',
    onSave(f) {
      if (mode === 'export') return;
      try {
        const obj = JSON.parse(f.get('json'));
        if (!obj || typeof obj !== 'object' || !obj.settings) throw 0;
        if (!confirm('Replace current data with this backup?')) return false;
        S = merge(defaults(), obj); save(); toast('Backup restored');
      } catch (e) { toast('That doesn’t look like a backup'); return false; }
    },
    actions: {
      async copy() {
        try { await navigator.clipboard.writeText(data); toast('Copied'); }
        catch (e) { const t = $('#sheet-root textarea'); t.removeAttribute('readonly'); t.select(); document.execCommand('copy'); t.setAttribute('readonly', ''); toast('Copied'); }
      }
    }
  });
}

/* =========================================================
   SHEET (iOS-style modal)
   ========================================================= */
let sheet = null;
function openSheet(opts) {
  const root = $('#sheet-root');
  sheet = opts;
  root.innerHTML = `<div class="sheet-backdrop" data-sheet-close></div>
    <div class="sheet" role="dialog" aria-modal="true">
      <div class="sheet-grabber"></div>
      <div class="sheet-head">
        <button type="button" class="link-btn left" data-sheet-close>Cancel</button>
        <div class="sheet-title">${esc(opts.title)}</div>
        <button type="button" class="link-btn right" data-sheet-save>${esc(opts.save || 'Save')}</button>
      </div>
      <form class="sheet-body" autocomplete="off">${opts.body}<button type="submit" hidden></button></form>
    </div>`;
  root.querySelector('form').addEventListener('submit', e => { e.preventDefault(); submitSheet(); });
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('open')));
}
function submitSheet() {
  if (!sheet) return;
  const form = $('#sheet-root form');
  const r = sheet.onSave ? sheet.onSave(new FormData(form), form) : undefined;
  if (r === false) return;
  closeSheet(); render();
}
function closeSheet() {
  const root = $('#sheet-root');
  root.classList.remove('open');
  sheet = null;
  setTimeout(() => { if (!root.classList.contains('open')) root.innerHTML = ''; }, 380);
  if (document.activeElement) document.activeElement.blur();
}

/* =========================================================
   EVENTS
   ========================================================= */
document.addEventListener('click', e => {
  if (e.target.closest('[data-sheet-close]')) { closeSheet(); return; }
  if (e.target.closest('[data-sheet-save]')) { submitSheet(); return; }
  const sa = e.target.closest('[data-sheet-act]');
  if (sa && sheet && sheet.actions) { sheet.actions[sa.dataset.sheetAct](); return; }

  const el = e.target.closest('[data-action]'); if (!el) return;
  const d = el.dataset;
  switch (d.action) {
    case 'tab': setTab(d.tab); break;
    case 'settings': settingsSheet(); break;
    case 'add-weight': weightSheet(); break;
    case 'edit-weight': weightSheet(S.weights.find(w => w.id === d.id)); break;
    case 'weight-goal': weightGoalSheet(); break;
    case 'weight-range': weightRange = d.r; render(); break;
    case 'water-add': addWater(+d.ml); break;
    case 'water-custom': waterCustomSheet(); break;
    case 'water-goal': waterGoalSheet(); break;
    case 'water-undo': { const t = S.water[dkey()]; if (t && t.length) { t.pop(); save(); render(); toast('Removed'); } break; }
    case 'water-del': {
      const t = S.water[dkey()], i = +d.i;
      if (t && t[i] && confirm(`Remove ${fmtV(t[i].ml)} ${vLabel(t[i].ml)}?`)) { t.splice(i, 1); save(); render(); }
      break;
    }
    case 'min-add': addMinutes(+d.n); break;
    case 'min-custom':
      openSheet({
        title: 'Today’s Practice',
        body: `<div class="group"><div class="row field"><label>Minutes today</label><input name="v" inputmode="numeric" value="${minutesToday()}"><span class="unit">min</span></div></div>`,
        onSave(f) { const v = Math.round(num(f.get('v'))); if (!(v >= 0)) { toast('Enter minutes'); return false; } S.spanish.minutes[dkey()] = v; save(); }
      }); break;
    case 'min-goal':
      openSheet({
        title: 'Daily Practice Goal',
        body: `<div class="group"><div class="row field"><label>Goal</label><input name="v" inputmode="numeric" value="${S.settings.spanishGoalMin}"><span class="unit">min / day</span></div></div>`,
        onSave(f) { const v = Math.round(num(f.get('v'))); if (!(v > 0)) { toast('Enter a goal'); return false; } S.settings.spanishGoalMin = v; save(); }
      }); break;
    case 'reveal-word': wordRevealed = !wordRevealed; render(); break;
    case 'add-goal': goalSheet(); break;
    case 'goal-template': goalSheet(null, GOAL_TEMPLATES[+d.i]); break;
    case 'edit-goal': goalSheet(S.spanish.goals.find(g => g.id === d.id)); break;
    case 'goal-step': {
      const g = S.spanish.goals.find(x => x.id === d.id); if (!g) break;
      const wasDone = g.progress >= g.target;
      g.progress = Math.max(0, g.progress + (+d.n)); save(); render();
      if (!wasDone && g.progress >= g.target) toast('🎉 ¡Meta cumplida!');
      break;
    }
    case 'download': downloadLibrary(); break;
    case 'read-cat': readCat = d.c; render(); break;
    case 'open-article': if (d.id) openArticle(d.id); else setTab('read'); break;
    case 'close-reader': closeReader(); break;
    case 'next-article': nextArticle(); break;
    case 'toggle-read':
      if (currentArticle) {
        if (S.read[currentArticle.id]) { delete S.read[currentArticle.id]; el.textContent = 'Mark as Read'; }
        else { S.read[currentArticle.id] = Date.now(); el.textContent = 'Mark as Unread'; }
        save();
      } break;
    case 'font':
      S.settings.readerSize = clamp(S.settings.readerSize + (+d.n) * 2, 14, 30); save();
      $('#reader').style.setProperty('--reader-size', S.settings.readerSize + 'px'); break;
  }
});

// re-render when coming back to the app (e.g. a new day started)
document.addEventListener('visibilitychange', () => { if (!document.hidden && !sheet) render(); });

/* ---------- offline support ---------- */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}

render();
