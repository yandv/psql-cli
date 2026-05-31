// Self-contained UI assets, embedded so they survive `tsc` compilation with no
// asset-copy step and no runtime dependencies.

export const STYLES_CSS = `
:root {
  --bg: #0f1115; --panel: #171a21; --panel2: #1e222b; --border: #2a2f3a;
  --text: #e6e9ef; --muted: #9aa3b2; --accent: #4f8cff; --ro: #3fb950; --rw: #f0883e;
  --danger: #f85149;
}
* { box-sizing: border-box; }
body { margin: 0; font: 14px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background: var(--bg); color: var(--text); }
header { display: flex; align-items: center; gap: 16px; padding: 14px 20px;
  border-bottom: 1px solid var(--border); background: var(--panel); position: sticky; top: 0; z-index: 5; }
header h1 { font-size: 16px; margin: 0; letter-spacing: .5px; }
header .spacer { flex: 1; }
.wrap { max-width: 1100px; margin: 0 auto; padding: 20px; }
.row-top { display: flex; gap: 20px; align-items: flex-start; }
.col-projects { width: 260px; flex: none; }
.col-main { flex: 1; min-width: 0; }
.card { background: var(--panel); border: 1px solid var(--border); border-radius: 10px;
  padding: 16px; margin-bottom: 16px; }
.card h2 { font-size: 13px; text-transform: uppercase; letter-spacing: .6px; color: var(--muted);
  margin: 0 0 12px; }
.db { background: var(--panel2); border: 1px solid var(--border); border-radius: 8px;
  padding: 12px 14px; margin-bottom: 10px; }
.db .top { display: flex; align-items: center; gap: 10px; }
.db .slug { font-weight: 600; font-size: 15px; }
.db .conn { color: var(--muted); font-size: 12px; margin-top: 4px; font-family: ui-monospace, monospace; }
.db .desc { color: var(--muted); font-size: 12px; margin-top: 4px; }
.db .actions { margin-top: 10px; display: flex; gap: 8px; flex-wrap: wrap; }
.badge { font-size: 11px; padding: 2px 8px; border-radius: 999px; font-weight: 600; }
.badge.ro { background: rgba(63,185,80,.15); color: var(--ro); }
.badge.rw { background: rgba(240,136,62,.15); color: var(--rw); }
.badge.def { background: rgba(79,140,255,.15); color: var(--accent); }
button { font: inherit; cursor: pointer; border: 1px solid var(--border); background: var(--panel2);
  color: var(--text); border-radius: 6px; padding: 6px 12px; }
button:hover { border-color: var(--accent); }
button.primary { background: var(--accent); border-color: var(--accent); color: #fff; }
button.danger { color: var(--danger); }
button.small { padding: 4px 9px; font-size: 12px; }
.proj { padding: 8px 10px; border-radius: 6px; cursor: default; }
.proj .name { font-weight: 600; }
.proj .meta { color: var(--muted); font-size: 12px; }
input, select, textarea { font: inherit; width: 100%; background: var(--bg); color: var(--text);
  border: 1px solid var(--border); border-radius: 6px; padding: 8px 10px; }
label { display: block; font-size: 12px; color: var(--muted); margin: 10px 0 4px; }
.grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0 14px; }
.modal-bg { position: fixed; inset: 0; background: rgba(0,0,0,.6); display: none;
  align-items: flex-start; justify-content: center; padding: 40px 16px; overflow: auto; z-index: 10; }
.modal-bg.open { display: flex; }
.modal { background: var(--panel); border: 1px solid var(--border); border-radius: 12px;
  padding: 22px; width: 520px; max-width: 100%; }
.modal h3 { margin: 0 0 6px; }
.modal .hint { color: var(--muted); font-size: 12px; margin: 0 0 12px; }
.modal .foot { display: flex; gap: 10px; justify-content: flex-end; margin-top: 18px; }
.switch { display: flex; align-items: center; gap: 8px; margin-top: 12px; }
.toast { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
  background: var(--panel2); border: 1px solid var(--border); padding: 10px 16px; border-radius: 8px;
  opacity: 0; transition: opacity .2s; pointer-events: none; z-index: 1000; }
.toast.show { opacity: 1; }
.toast.err { border-color: var(--danger); color: var(--danger); }
.toast.ok { border-color: var(--ro); color: var(--ro); }
.empty { color: var(--muted); padding: 8px 0; }
.pillrow { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 14px; }
.pill { padding: 4px 12px; border-radius: 999px; font-size: 12px; }
.pill.active { background: var(--accent); border-color: var(--accent); color: #fff; }
.proj-toolbar { display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
  background: var(--panel2); border: 1px solid var(--border); border-radius: 8px;
  padding: 8px 12px; margin-bottom: 14px; }
.proj-toolbar .proj-name { font-weight: 600; margin-right: 4px; }
.proj-toolbar .spacer { flex: 1; }
button:disabled { opacity: .4; cursor: not-allowed; border-color: var(--border); }
button:disabled:hover { border-color: var(--border); }

/* ---- data-browser dashboard ---- */
.db .slug.clickable { cursor: pointer; }
.db .slug.clickable:hover { color: var(--accent); text-decoration: underline; }
.dash-bg { position: fixed; inset: 0; background: var(--bg); display: none; z-index: 50;
  flex-direction: column; }
.dash-bg.open { display: flex; }
.dash-head { display: flex; align-items: center; gap: 12px; padding: 12px 18px;
  border-bottom: 1px solid var(--border); background: var(--panel); flex: none; }
.dash-head .slug { font-weight: 600; font-size: 15px; }
.dash-head .conn { color: var(--muted); font-size: 12px; font-family: ui-monospace, monospace; }
.dash-head .spacer { flex: 1; }
.dash-body { flex: 1; display: flex; min-height: 0; }
.dash-side { width: 280px; flex: none; border-right: 1px solid var(--border);
  display: flex; flex-direction: column; min-height: 0; background: var(--panel); }
.dash-side .search { padding: 10px; border-bottom: 1px solid var(--border); flex: none; }
.dash-tables { flex: 1; overflow: auto; padding: 6px 0; }
.dash-tables .schema { font-size: 11px; text-transform: uppercase; letter-spacing: .6px;
  color: var(--muted); padding: 8px 12px 4px; }
.dash-tables .tbl { padding: 5px 12px 5px 18px; cursor: pointer; font-size: 13px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.dash-tables .tbl:hover { background: var(--panel2); }
.dash-tables .tbl.active { background: var(--accent); color: #fff; }
.dash-main { flex: 1; display: flex; flex-direction: column; min-width: 0; min-height: 0; }
.dash-tabs { display: flex; gap: 4px; padding: 8px 12px 0; border-bottom: 1px solid var(--border);
  flex: none; }
.dash-tab { padding: 6px 14px; border: 1px solid transparent; border-bottom: none; cursor: pointer;
  border-radius: 6px 6px 0 0; color: var(--muted); background: none; }
.dash-tab.active { color: var(--text); background: var(--panel); border-color: var(--border); }
.dash-pane { flex: 1; display: none; flex-direction: column; min-height: 0; padding: 12px; }
.dash-pane.active { display: flex; }
.filters-bar { display: flex; flex-direction: column; gap: 6px; flex: none; margin-bottom: 10px; }
.filter-row { display: flex; gap: 6px; align-items: center; }
.filter-row select, .filter-row input { width: auto; flex: 1; min-width: 0; }
.filter-row .op { flex: 0 0 110px; }
.filter-row button { flex: none; }
.filters-actions { display: flex; gap: 8px; }
.grid-wrap { flex: 1; overflow: auto; border: 1px solid var(--border); border-radius: 8px;
  min-height: 0; background: var(--panel); }
table.grid { border-collapse: collapse; width: max-content; min-width: 100%; font-size: 13px; }
table.grid th, table.grid td { border: 1px solid var(--border); padding: 5px 9px; text-align: left;
  max-width: 320px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
table.grid th { background: var(--panel2); position: sticky; top: 0; cursor: pointer;
  user-select: none; z-index: 1; }
table.grid th:hover { color: var(--accent); }
table.grid td.null { color: var(--muted); }
table.grid tr:hover td { background: var(--panel2); }
.grid-empty { color: var(--muted); padding: 14px; }
.dash-foot { display: flex; align-items: center; gap: 10px; flex: none; margin-top: 10px; }
.dash-foot .spacer { flex: 1; }
.dash-foot select { width: auto; }
.dash-foot .info { color: var(--muted); font-size: 12px; }
.query-editor { display: flex; flex-direction: column; gap: 8px; flex: none; }
.query-editor textarea { font-family: ui-monospace, monospace; min-height: 120px; resize: vertical; }
.query-editor .toolbar { display: flex; align-items: center; gap: 10px; }
.query-results { flex: 1; display: flex; flex-direction: column; min-height: 0; margin-top: 10px; }
.banner { padding: 10px 14px; border-radius: 8px; margin-bottom: 10px; font-size: 13px; }
.banner.err { background: rgba(248,81,73,.12); border: 1px solid var(--danger); color: var(--danger); }
.hint-ro { color: var(--rw); font-size: 12px; }

/* ---- skeleton shimmer ---- */
.skeleton { position: relative; overflow: hidden; background: var(--panel2);
  border-radius: 6px; }
.skeleton::after { content: ''; position: absolute; inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.08), transparent);
  transform: translateX(-100%); animation: shimmer 1.2s infinite; }
@keyframes shimmer { 100% { transform: translateX(100%); } }
.skel-line { height: 14px; margin: 8px 12px; }
.skel-cell { height: 12px; }
table.grid td.skel-cell-wrap { padding: 6px 9px; }

/* ---- recents ---- */
.recent-row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.recent-chip { padding: 5px 12px; border-radius: 999px; font-size: 12px;
  background: var(--panel2); border: 1px solid var(--border); cursor: pointer; }
.recent-chip:hover { border-color: var(--accent); color: var(--accent); }
.recent-clear { margin-left: auto; }

/* ---- schema filter ---- */
.dash-side .search .schema-sel { margin-bottom: 8px; }
`;

export const INDEX_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>psql-cli</title>
<link rel="stylesheet" href="/styles.css" />
</head>
<body>
<header>
  <h1>🐘 psql-cli</h1>
  <div class="spacer"></div>
  <label style="margin:0">default</label>
  <select id="defaultSel" style="width:auto"></select>
  <button id="addProjBtn">+ Project</button>
  <button class="primary" id="addDbBtn">+ Database</button>
</header>
<div class="wrap">
  <div class="col-main">
    <div class="card">
      <h2>Recent</h2>
      <div id="recentList"></div>
    </div>
    <div class="card">
      <h2>Databases</h2>
      <div id="projFilter" class="pillrow"></div>
      <div id="projToolbar" class="proj-toolbar" style="display:none"></div>
      <div id="dbList"></div>
    </div>
  </div>
</div>

<div class="modal-bg" id="dbModalBg">
  <div class="modal">
    <h3 id="dbModalTitle">Add database</h3>
    <p class="hint">The password is stored in the macOS Keychain — never in the config file and never shown to an LLM.</p>
    <label for="f_paste">Paste a connection (optional)</label>
    <textarea id="f_paste" rows="3" placeholder="Paste a connection: postgres://… , jdbc:postgresql://… , host=… , JSON, or host / port / user / password on separate lines"></textarea>
    <div style="margin-top:6px"><button id="dbParseBtn" class="small">Parse &amp; fill</button></div>
    <label>Slug (LLM-facing id, lowercase-kebab)</label>
    <input id="f_slug" placeholder="analytics-prod" />
    <div class="grid2">
      <div><label>Host</label><input id="f_host" /></div>
      <div><label>Port</label><input id="f_port" value="5432" /></div>
    </div>
    <div class="grid2">
      <div><label>User</label><input id="f_user" /></div>
      <div>
        <label>Database name</label>
        <input id="f_database" list="dblist" />
        <datalist id="dblist"></datalist>
        <div style="margin-top:6px"><button id="dbListBtn" class="small">List databases</button></div>
      </div>
    </div>
    <label>Password <span id="pwState" class="hint"></span></label>
    <input id="f_password" type="password" placeholder="•••••••" autocomplete="new-password" />
    <div class="grid2">
      <div>
        <label>Project</label>
        <select id="f_project"></select>
      </div>
      <div>
        <label>SSL mode</label>
        <select id="f_sslmode">
          <option value="">(default)</option>
          <option>disable</option><option>allow</option><option>prefer</option>
          <option>require</option><option>verify-ca</option><option>verify-full</option>
        </select>
      </div>
    </div>
    <label>Description (helps the LLM choose)</label>
    <input id="f_desc" placeholder="Production analytics DB" />
    <div class="switch">
      <input type="checkbox" id="f_readonly" checked style="width:auto" />
      <label for="f_readonly" style="margin:0">Read-only (block all write statements)</label>
    </div>
    <div class="foot">
      <button id="dbTestBtn">Test connection</button>
      <div class="spacer" style="flex:1"></div>
      <button id="dbCancelBtn">Cancel</button>
      <button class="primary" id="dbSaveBtn">Save</button>
    </div>
  </div>
</div>

<div class="modal-bg" id="projModalBg">
  <div class="modal">
    <h3 id="projModalTitle">Add project</h3>
    <label>Slug</label>
    <input id="p_slug" placeholder="acme" />
    <label>Name</label>
    <input id="p_name" placeholder="Acme Corp" />
    <label>Description</label>
    <input id="p_desc" />
    <div class="foot">
      <button id="projCancelBtn">Cancel</button>
      <button class="primary" id="projSaveBtn">Save</button>
    </div>
  </div>
</div>

<div class="dash-bg" id="dashBg">
  <div class="dash-head">
    <span class="slug" id="dashSlug"></span>
    <span class="badge" id="dashBadge"></span>
    <span class="conn" id="dashConn"></span>
    <div class="spacer"></div>
    <button id="dashCloseBtn" title="Close (Esc)">✕</button>
  </div>
  <div class="dash-body">
    <div class="dash-side">
      <div class="search">
        <select id="dashSchemaSel" class="schema-sel"></select>
        <input id="dashTableSearch" placeholder="Filter tables…" />
      </div>
      <div class="dash-tables" id="dashTables"></div>
    </div>
    <div class="dash-main">
      <div class="dash-tabs">
        <button class="dash-tab active" id="dashTabData">Data</button>
        <button class="dash-tab" id="dashTabQuery">Query</button>
      </div>
      <div class="dash-pane active" id="dashPaneData">
        <div class="filters-bar">
          <div id="dashFilters"></div>
          <div class="filters-actions">
            <button class="small" id="dashAddFilter">+ filter</button>
            <button class="small primary" id="dashApply">Apply</button>
          </div>
        </div>
        <div class="grid-wrap" id="dashGrid"></div>
        <div class="dash-foot">
          <span class="info" id="dashPageInfo"></span>
          <div class="spacer"></div>
          <label style="margin:0">rows</label>
          <select id="dashPageSize">
            <option value="25">25</option>
            <option value="50" selected>50</option>
            <option value="100">100</option>
            <option value="200">200</option>
          </select>
          <button class="small" id="dashPrev">Prev</button>
          <button class="small" id="dashNext">Next</button>
        </div>
      </div>
      <div class="dash-pane" id="dashPaneQuery">
        <div class="query-editor">
          <div class="toolbar">
            <button class="primary small" id="dashRun">Run</button>
            <span class="badge" id="dashQueryBadge"></span>
            <span class="hint-ro" id="dashQueryHint"></span>
            <span class="info">Cmd/Ctrl+Enter to run</span>
          </div>
          <textarea id="dashSql" placeholder="SELECT * FROM …"></textarea>
        </div>
        <div class="query-results" id="dashQueryResults"></div>
      </div>
    </div>
  </div>
</div>

<div class="toast" id="toast"></div>
<script src="/app.js"></script>
</body>
</html>`;

export const APP_JS = `
const TOKEN_KEY = 'psqlcli.token';
const RECENT_KEY = 'psqlcli.recent';
// On startup, lift any ?token= from the URL into sessionStorage, then strip it
// from the visible address bar so the token never lingers there.
const URL_TOKEN = new URLSearchParams(location.search).get('token') || '';
if (URL_TOKEN) {
  try { sessionStorage.setItem(TOKEN_KEY, URL_TOKEN); } catch (e) {}
  history.replaceState({}, '', location.pathname);
}
function getToken() {
  try { return sessionStorage.getItem(TOKEN_KEY) || URL_TOKEN; } catch (e) { return URL_TOKEN; }
}
let state = { projects: {}, databases: {}, defaultDatabase: null };
let editingSlug = null;
let currentProjectFilter = ''; // '' = all projects

function toast(msg, kind) {
  // kind: 'ok' (green) | 'err'/true (red) | undefined (neutral)
  const t = document.getElementById('toast');
  t.textContent = msg;
  const cls = (kind === true || kind === 'err') ? ' err' : (kind === 'ok' ? ' ok' : '');
  t.className = 'toast show' + cls;
  setTimeout(() => { t.className = 'toast'; }, 2600);
}
async function api(method, path, body) {
  const headers = { 'Content-Type': 'application/json', 'x-psql-cli-token': getToken() };
  const r = await fetch('/api' + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const data = await r.json().catch(() => ({}));
  if (r.status === 403) {
    toast('Session token missing/expired — reopen the URL printed by \`psql-cli ui\`.', true);
    throw new Error('forbidden');
  }
  if (!r.ok) throw new Error(data.error || ('HTTP ' + r.status));
  return data;
}
async function refresh() { state = await api('GET', '/state'); render(); }

// Canonical order: ascending by 'order' (missing = +Infinity), tiebreak by slug.
function orderedSlugs(map) {
  return Object.keys(map).sort((a, b) => {
    const ao = map[a].order == null ? Infinity : map[a].order;
    const bo = map[b].order == null ? Infinity : map[b].order;
    if (ao !== bo) return ao - bo;
    return a < b ? -1 : a > b ? 1 : 0;
  });
}

async function reorder(kind, slug, dir) {
  try {
    await api('POST', '/reorder', { kind, slug, dir });
    await refresh();
  } catch (e) { toast(e.message, true); }
}

function el(tag, attrs, ...kids) {
  const e = document.createElement(tag);
  for (const k in (attrs || {})) {
    const v = attrs[k];
    if (k === 'class') e.className = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else if (v === null || v === undefined || v === false) continue;
    else e.setAttribute(k, v);
  }
  for (const kid of kids) if (kid != null) e.append(kid.nodeType ? kid : document.createTextNode(kid));
  return e;
}

// ---- skeleton loaders ----
// A skeleton list (for the tables sidebar): n shimmering lines.
function skeletonList(n) {
  const frag = document.createDocumentFragment();
  for (let i = 0; i < n; i++) {
    frag.append(el('div', { class: 'skeleton skel-line', style: 'width:' + (55 + (i * 13) % 40) + '%' }));
  }
  return frag;
}
// A skeleton grid (for Data/Query): n rows x cols shimmering cells.
function skeletonRows(n, cols) {
  const c = Math.max(1, cols || 5);
  const table = el('table', { class: 'grid' });
  const head = el('tr');
  for (let j = 0; j < c; j++) {
    head.append(el('th', null, el('div', { class: 'skeleton skel-cell', style: 'width:70px' })));
  }
  table.append(el('thead', null, head));
  const tbody = el('tbody');
  for (let i = 0; i < n; i++) {
    const tr = el('tr');
    for (let j = 0; j < c; j++) {
      tr.append(el('td', { class: 'skel-cell-wrap' },
        el('div', { class: 'skeleton skel-cell', style: 'width:' + (40 + (i * 7 + j * 11) % 50) + '%' })));
    }
    tbody.append(tr);
  }
  table.append(tbody);
  return table;
}
function showGridSkeleton(container, cols) {
  container.innerHTML = '';
  container.append(skeletonRows(6, cols));
}

// ---- recently-opened sessions (localStorage) ----
function loadRecent() {
  try {
    const v = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
    return Array.isArray(v) ? v.filter(x => x && typeof x.slug === 'string') : [];
  } catch (e) { return []; }
}
function pushRecent(slug) {
  let list = loadRecent().filter(x => x.slug !== slug);
  list.unshift({ slug, ts: Date.now() });
  list = list.slice(0, 8);
  try { localStorage.setItem(RECENT_KEY, JSON.stringify(list)); } catch (e) {}
}
function clearRecent() {
  try { localStorage.removeItem(RECENT_KEY); } catch (e) {}
  renderRecent();
}
function renderRecent() {
  const wrap = document.getElementById('recentList');
  if (!wrap) return;
  wrap.innerHTML = '';
  const list = loadRecent().filter(x => state.databases[x.slug]);
  if (!list.length) { wrap.append(el('div', { class: 'empty' }, 'No recently opened databases.')); return; }
  const row = el('div', { class: 'recent-row' });
  list.forEach(x => {
    row.append(el('button', { class: 'recent-chip', onclick: () => openDash(x.slug) }, x.slug));
  });
  row.append(el('button', { class: 'small recent-clear', onclick: clearRecent }, 'clear'));
  wrap.append(row);
}

// ---- History-API routing ----
function navigate(path) {
  if (location.pathname !== path) history.pushState({}, '', path);
}
function route() {
  const p = location.pathname || '/';
  const m = p.match(/^\\/db\\/(.+)$/);
  if (m) {
    const slug = decodeURIComponent(m[1]);
    if (state.databases[slug]) { openDash(slug, true); return; }
    toast('Unknown database "' + slug + '"', true);
    navigate('/');
  }
  // Any other path -> main list view; ensure the dashboard is closed.
  if (dashBg.classList.contains('open')) closeDash(true);
}
window.onpopstate = route;

function render() {
  renderRecent();
  // default selector
  const sel = document.getElementById('defaultSel');
  sel.innerHTML = '';
  sel.append(el('option', { value: '' }, '(none)'));
  orderedSlugs(state.databases).forEach(s => {
    const o = el('option', { value: s }, s);
    if (s === state.defaultDatabase) o.selected = true;
    sel.append(o);
  });

  // canonical project order
  const projSlugs = orderedSlugs(state.projects);
  // If the filtered project was deleted, fall back to "All".
  if (currentProjectFilter && !state.projects[currentProjectFilter]) currentProjectFilter = '';

  // project filter (pill row): "All projects" first + pre-selected.
  const pf = document.getElementById('projFilter');
  pf.innerHTML = '';
  const mkPill = (value, label) => {
    const active = currentProjectFilter === value;
    return el('button', {
      class: 'small pill' + (active ? ' active' : ''),
      onclick: () => { currentProjectFilter = value; render(); },
    }, label);
  };
  pf.append(mkPill('', 'All projects'));
  projSlugs.forEach(s => pf.append(mkPill(s, state.projects[s].name)));

  // project toolbar: shown only when a specific project is selected.
  const pt = document.getElementById('projToolbar');
  pt.innerHTML = '';
  if (currentProjectFilter && state.projects[currentProjectFilter]) {
    const ps = currentProjectFilter;
    const p = state.projects[ps];
    const pIdx = projSlugs.indexOf(ps);
    pt.style.display = 'flex';
    pt.append(
      el('span', { class: 'proj-name' }, p.name),
      el('span', { class: 'meta', style: 'color:var(--muted);font-size:12px' }, ps),
      el('span', { class: 'spacer' }),
      el('button', { class: 'small', onclick: () => openProj(ps) }, 'Edit'),
      el('button', { class: 'small danger', onclick: () => delProj(ps) }, 'Delete'),
      el('button', { class: 'small', disabled: pIdx <= 0 ? '' : null, onclick: () => reorder('project', ps, 'up') }, '◀ Move'),
      el('button', { class: 'small', disabled: pIdx >= projSlugs.length - 1 ? '' : null, onclick: () => reorder('project', ps, 'down') }, 'Move ▶'));
  } else {
    pt.style.display = 'none';
  }

  // databases (canonical order, filtered by selected project)
  const dl = document.getElementById('dbList');
  dl.innerHTML = '';
  let dbSlugs = orderedSlugs(state.databases);
  if (currentProjectFilter) {
    dbSlugs = dbSlugs.filter(s => state.databases[s].project === currentProjectFilter);
  }
  if (!dbSlugs.length) dl.append(el('div', { class: 'empty' },
    currentProjectFilter ? 'No databases in this project.' : 'No databases yet. Click "+ Database".'));
  dbSlugs.forEach((s, i) => {
    const d = state.databases[s];
    const badges = el('div', { style: 'display:flex;gap:6px' },
      el('span', { class: 'badge ' + (d.readOnly ? 'ro' : 'rw') }, d.readOnly ? 'read-only' : 'read-write'));
    if (s === state.defaultDatabase) badges.append(el('span', { class: 'badge def' }, 'default'));
    dl.append(el('div', { class: 'db' },
      el('div', { class: 'top' }, el('span', { class: 'slug clickable', title: 'Browse data', onclick: () => openDash(s) }, s), badges),
      el('div', { class: 'conn' }, d.user + '@' + d.host + ':' + d.port + '/' + d.database +
        (d.hasPassword ? '' : '  ⚠ no password set')),
      d.description ? el('div', { class: 'desc' }, d.description) : null,
      el('div', { class: 'actions' },
        el('button', { class: 'small', disabled: i === 0 ? '' : null, onclick: () => reorder('database', s, 'up') }, '▲'),
        el('button', { class: 'small', disabled: i === dbSlugs.length - 1 ? '' : null, onclick: () => reorder('database', s, 'down') }, '▼'),
        el('button', { class: 'small primary', onclick: () => openDash(s) }, 'Browse'),
        el('button', { class: 'small', onclick: () => openDb(s) }, 'Edit'),
        el('button', { class: 'small', onclick: () => testDb(s) }, 'Test'),
        el('button', { class: 'small', onclick: () => setDefault(s) }, 'Set default'),
        el('button', { class: 'small danger', onclick: () => delDb(s) }, 'Delete'))));
  });

  // project dropdown in db modal
  const fp = document.getElementById('f_project');
  const cur = fp.value;
  fp.innerHTML = '';
  fp.append(el('option', { value: '' }, '(none)'));
  projSlugs.forEach(s => fp.append(el('option', { value: s }, state.projects[s].name)));
  fp.value = cur;
}

// ---- database modal ----
const dbBg = document.getElementById('dbModalBg');
function openDb(slug) {
  editingSlug = slug || null;
  const d = slug ? state.databases[slug] : null;
  document.getElementById('dbModalTitle').textContent = slug ? 'Edit ' + slug : 'Add database';
  document.getElementById('f_slug').value = d ? d.slug : '';
  document.getElementById('f_slug').disabled = !!slug;
  document.getElementById('f_host').value = d ? d.host : '';
  document.getElementById('f_port').value = d ? d.port : 5432;
  document.getElementById('f_user').value = d ? d.user : '';
  document.getElementById('f_database').value = d ? d.database : '';
  document.getElementById('f_password').value = '';
  document.getElementById('pwState').textContent = d ? (d.hasPassword ? '(leave blank to keep current)' : '(none set)') : '';
  // When adding while a project filter is active, pre-select that project.
  document.getElementById('f_project').value = d ? (d.project || '') : currentProjectFilter;
  document.getElementById('f_sslmode').value = d ? (d.sslmode || '') : '';
  document.getElementById('f_desc').value = d ? (d.description || '') : '';
  document.getElementById('f_readonly').checked = d ? d.readOnly : true;
  document.getElementById('f_paste').value = '';
  document.getElementById('dblist').innerHTML = '';
  dbBg.classList.add('open');
}
function closeDb() { dbBg.classList.remove('open'); }
function dbFormBody() {
  const body = {
    slug: document.getElementById('f_slug').value.trim(),
    host: document.getElementById('f_host').value.trim(),
    port: Number(document.getElementById('f_port').value) || 5432,
    user: document.getElementById('f_user').value.trim(),
    database: document.getElementById('f_database').value.trim(),
    project: document.getElementById('f_project').value || undefined,
    sslmode: document.getElementById('f_sslmode').value || undefined,
    description: document.getElementById('f_desc').value.trim() || undefined,
    readOnly: document.getElementById('f_readonly').checked,
  };
  const pw = document.getElementById('f_password').value;
  if (pw) body.password = pw;
  return body;
}
async function saveDb() {
  try { await api('POST', '/database', dbFormBody()); closeDb(); await refresh(); toast('Saved', 'ok'); }
  catch (e) { toast(e.message, true); }
}
async function testDb(slug) {
  try { const r = await api('POST', '/test', slug ? { slug } : dbFormBody()); toast(r.message, r.ok ? 'ok' : 'err'); }
  catch (e) { toast(e.message, true); }
}
async function delDb(slug) {
  if (!confirm('Delete "' + slug + '" and its stored password?')) return;
  try { await api('DELETE', '/database/' + encodeURIComponent(slug)); await refresh(); toast('Deleted', 'ok'); }
  catch (e) { toast(e.message, true); }
}
async function setDefault(slug) {
  try { await api('POST', '/default', { slug }); await refresh(); toast('Default: ' + slug, 'ok'); }
  catch (e) { toast(e.message, true); }
}

// ---- paste-to-fill ----
async function parseFill() {
  const input = document.getElementById('f_paste').value;
  if (!input.trim()) { toast('Paste a connection first', true); return; }
  try {
    const p = await api('POST', '/parse', { input });
    if (p.host) document.getElementById('f_host').value = p.host;
    if (p.port) document.getElementById('f_port').value = p.port;
    if (p.user) document.getElementById('f_user').value = p.user;
    if (p.database) document.getElementById('f_database').value = p.database;
    if (p.password) document.getElementById('f_password').value = p.password;
    if (p.sslmode) document.getElementById('f_sslmode').value = p.sslmode;
    if (p.warnings && p.warnings.length) toast(p.warnings.join('; '), true);
    document.getElementById('f_paste').value = '';
  } catch (e) { toast(e.message, true); }
}

// ---- database picker ----
async function listDatabases() {
  const body = {
    host: document.getElementById('f_host').value.trim(),
    port: Number(document.getElementById('f_port').value) || 5432,
    user: document.getElementById('f_user').value.trim(),
    sslmode: document.getElementById('f_sslmode').value || undefined,
  };
  const pw = document.getElementById('f_password').value;
  if (pw) body.password = pw;
  try {
    const r = await api('POST', '/list-databases', body);
    if (r.ok) {
      const dlist = document.getElementById('dblist');
      dlist.innerHTML = '';
      (r.databases || []).forEach(name => dlist.append(el('option', { value: name })));
      const dbInput = document.getElementById('f_database');
      if (!dbInput.value) dbInput.focus();
      toast((r.databases ? r.databases.length : 0) + ' databases found — pick one', 'ok');
    } else {
      toast(r.error || 'Could not list databases.', true);
    }
  } catch (e) { toast(e.message, true); }
}

// ---- project modal ----
const projBg = document.getElementById('projModalBg');
let editingProj = null;
function openProj(slug) {
  editingProj = slug || null;
  const p = slug ? state.projects[slug] : null;
  document.getElementById('projModalTitle').textContent = slug ? 'Edit project' : 'Add project';
  document.getElementById('p_slug').value = p ? p.slug : '';
  document.getElementById('p_slug').disabled = !!slug;
  document.getElementById('p_name').value = p ? p.name : '';
  document.getElementById('p_desc').value = p ? (p.description || '') : '';
  projBg.classList.add('open');
}
function closeProj() { projBg.classList.remove('open'); }
async function saveProj() {
  try {
    await api('POST', '/project', {
      slug: document.getElementById('p_slug').value.trim(),
      name: document.getElementById('p_name').value.trim(),
      description: document.getElementById('p_desc').value.trim() || undefined,
    });
    closeProj(); await refresh(); toast('Saved', 'ok');
  } catch (e) { toast(e.message, true); }
}
async function delProj(slug) {
  if (!confirm('Delete project "' + slug + '"?')) return;
  try { await api('DELETE', '/project/' + encodeURIComponent(slug)); await refresh(); toast('Deleted', 'ok'); }
  catch (e) { toast(e.message, true); }
}

document.getElementById('addDbBtn').onclick = () => openDb(null);
document.getElementById('addProjBtn').onclick = () => openProj(null);
document.getElementById('dbSaveBtn').onclick = saveDb;
document.getElementById('dbCancelBtn').onclick = closeDb;
document.getElementById('dbTestBtn').onclick = () => testDb(null);
document.getElementById('dbParseBtn').onclick = parseFill;
document.getElementById('dbListBtn').onclick = listDatabases;
document.getElementById('projSaveBtn').onclick = saveProj;
document.getElementById('projCancelBtn').onclick = closeProj;
document.getElementById('defaultSel').onchange = (e) => setDefault(e.target.value);
[dbBg, projBg].forEach(bg => bg.addEventListener('click', e => { if (e.target === bg) bg.classList.remove('open'); }));

// ---- data-browser dashboard ----
const dashBg = document.getElementById('dashBg');
let dash = null; // { slug, tables, table, columns, filters, orderBy, limit, offset, readOnly }

function resetDash(slug) {
  dash = {
    slug,
    tables: [],
    table: null,        // { schema, name, type }
    columns: [],        // string[] column names for the selected table
    filters: [],        // [{ column, op, value }]
    orderBy: null,      // { column, dir }
    limit: 50,
    offset: 0,
    schema: '',         // '' = all schemas
    readOnly: !!(state.databases[slug] && state.databases[slug].readOnly),
  };
}

async function openDash(slug, fromRoute) {
  const d = state.databases[slug];
  if (!d) { toast('Unknown database', true); return; }
  pushRecent(slug);
  renderRecent();
  if (!fromRoute) navigate('/db/' + encodeURIComponent(slug));
  resetDash(slug);
  document.getElementById('dashSlug').textContent = slug;
  const badge = document.getElementById('dashBadge');
  badge.className = 'badge ' + (d.readOnly ? 'ro' : 'rw');
  badge.textContent = d.readOnly ? 'read-only' : 'read-write';
  document.getElementById('dashConn').textContent = d.host + ':' + d.port + '/' + d.database;
  document.getElementById('dashTableSearch').value = '';
  document.getElementById('dashSchemaSel').innerHTML = '';
  document.getElementById('dashFilters').innerHTML = '';
  document.getElementById('dashGrid').innerHTML = '';
  document.getElementById('dashPageInfo').textContent = '';
  document.getElementById('dashPageSize').value = '50';
  document.getElementById('dashSql').value = '';
  document.getElementById('dashQueryResults').innerHTML = '';
  const qBadge = document.getElementById('dashQueryBadge');
  qBadge.className = 'badge ' + (d.readOnly ? 'ro' : 'rw');
  qBadge.textContent = d.readOnly ? 'read-only' : 'read-write';
  document.getElementById('dashQueryHint').textContent = d.readOnly ? 'Write statements are blocked.' : '';
  dashSetTab('data');
  dashBg.classList.add('open');
  // Skeleton list while /tables is in flight.
  const tablesWrap = document.getElementById('dashTables');
  tablesWrap.innerHTML = '';
  tablesWrap.append(skeletonList(8));
  try {
    const r = await api('GET', '/db/' + encodeURIComponent(slug) + '/tables');
    dash.tables = r.tables || [];
    populateSchemaSel();
    renderDashTables();
  } catch (e) { tablesWrap.innerHTML = ''; toast(e.message, true); }
}

function closeDash(fromRoute) {
  dashBg.classList.remove('open');
  dash = null;
  if (!fromRoute) navigate('/');
}

// Distinct schemas present in the loaded tables, defaulting to "public" when present.
function populateSchemaSel() {
  const sel = document.getElementById('dashSchemaSel');
  sel.innerHTML = '';
  const schemas = [];
  dash.tables.forEach(t => { if (schemas.indexOf(t.schema) === -1) schemas.push(t.schema); });
  sel.append(el('option', { value: '' }, 'All schemas'));
  schemas.forEach(s => sel.append(el('option', { value: s }, s)));
  dash.schema = schemas.indexOf('public') !== -1 ? 'public' : '';
  sel.value = dash.schema;
}

function dashSetTab(name) {
  const onData = name === 'data';
  document.getElementById('dashTabData').classList.toggle('active', onData);
  document.getElementById('dashTabQuery').classList.toggle('active', !onData);
  document.getElementById('dashPaneData').classList.toggle('active', onData);
  document.getElementById('dashPaneQuery').classList.toggle('active', !onData);
  // Nice-to-have: prefill query editor when switching to an empty Query tab.
  if (!onData && dash && dash.table) {
    const ta = document.getElementById('dashSql');
    if (!ta.value.trim()) {
      ta.value = 'SELECT * FROM "' + dash.table.schema + '"."' + dash.table.name + '" LIMIT 50';
    }
  }
}

function renderDashTables() {
  const wrap = document.getElementById('dashTables');
  wrap.innerHTML = '';
  const q = document.getElementById('dashTableSearch').value.trim().toLowerCase();
  if (!dash.tables.length) {
    wrap.append(el('div', { class: 'empty', style: 'padding:8px 12px' }, 'No tables in this database.'));
    return;
  }
  let tables = dash.tables;
  if (dash.schema) tables = tables.filter(t => t.schema === dash.schema);
  if (q) tables = tables.filter(t => t.name.toLowerCase().includes(q));
  if (!tables.length) {
    const msg = dash.schema
      ? 'No tables in schema "' + dash.schema + '".'
      : 'No tables match.';
    wrap.append(el('div', { class: 'empty', style: 'padding:8px 12px' }, msg));
    return;
  }
  // group by schema, preserving server order
  const order = [];
  const groups = {};
  tables.forEach(t => {
    if (!groups[t.schema]) { groups[t.schema] = []; order.push(t.schema); }
    groups[t.schema].push(t);
  });
  order.forEach(schema => {
    wrap.append(el('div', { class: 'schema' }, schema));
    groups[schema].forEach(t => {
      const active = dash.table && dash.table.schema === t.schema && dash.table.name === t.name;
      const icon = t.type === 'view' ? '👁 ' : '📄 ';
      wrap.append(el('div', {
        class: 'tbl' + (active ? ' active' : ''),
        title: t.schema + '.' + t.name,
        onclick: () => selectTable(t),
      }, icon + t.name));
    });
  });
}

async function selectTable(t) {
  dash.table = t;
  dash.filters = [];
  dash.orderBy = null;
  dash.offset = 0;
  dash.columns = [];
  dashSetTab('data');
  renderDashTables();
  document.getElementById('dashFilters').innerHTML = '';
  showGridSkeleton(document.getElementById('dashGrid'), 5);
  try {
    const r = await api('GET', '/db/' + encodeURIComponent(dash.slug) +
      '/columns?schema=' + encodeURIComponent(t.schema) + '&table=' + encodeURIComponent(t.name));
    dash.columns = (r.columns || []).map(c => c.name);
  } catch (e) { toast(e.message, true); }
  await loadBrowse();
}

const NULL_OPS = ['is null', 'is not null'];
const FILTER_OPS = ['=', '<>', '<', '<=', '>', '>=', 'like', 'ilike', 'is null', 'is not null'];

function renderFilters() {
  const wrap = document.getElementById('dashFilters');
  wrap.innerHTML = '';
  dash.filters.forEach((f, idx) => {
    const colSel = el('select', { onchange: e => { f.column = e.target.value; } });
    dash.columns.forEach(c => {
      const o = el('option', { value: c }, c);
      if (c === f.column) o.selected = true;
      colSel.append(o);
    });
    if (!f.column && dash.columns.length) f.column = dash.columns[0];
    const valInput = el('input', {
      value: f.value || '',
      placeholder: 'value',
      oninput: e => { f.value = e.target.value; },
    });
    const opSel = el('select', {
      class: 'op',
      onchange: e => {
        f.op = e.target.value;
        valInput.disabled = NULL_OPS.includes(f.op);
      },
    });
    FILTER_OPS.forEach(op => {
      const o = el('option', { value: op }, op);
      if (op === f.op) o.selected = true;
      opSel.append(o);
    });
    valInput.disabled = NULL_OPS.includes(f.op);
    wrap.append(el('div', { class: 'filter-row' },
      colSel, opSel, valInput,
      el('button', { class: 'small', title: 'Remove', onclick: () => { dash.filters.splice(idx, 1); renderFilters(); } }, '✕')));
  });
}

function addFilter() {
  if (!dash.columns.length) { toast('Select a table first', true); return; }
  dash.filters.push({ column: dash.columns[0], op: '=', value: '' });
  renderFilters();
}

function activeFilters() {
  return dash.filters
    .filter(f => f.column && f.op)
    .map(f => NULL_OPS.includes(f.op)
      ? { column: f.column, op: f.op }
      : { column: f.column, op: f.op, value: f.value || '' });
}

async function loadBrowse() {
  if (!dash || !dash.table) return;
  const filters = activeFilters();
  const body = {
    schema: dash.table.schema,
    table: dash.table.name,
    filters: filters,
    orderBy: dash.orderBy || undefined,
    limit: dash.limit,
    offset: dash.offset,
  };
  const grid = document.getElementById('dashGrid');
  showGridSkeleton(grid, dash.columns.length || 5);
  try {
    const r = await api('POST', '/db/' + encodeURIComponent(dash.slug) + '/browse', body);
    if (!r.ok) { grid.innerHTML = ''; toast(r.error || 'Query failed', true); return; }
    if (!r.rows || !r.rows.length) {
      grid.innerHTML = '';
      const msg = filters.length ? 'No rows (active filters).' : 'No rows.';
      grid.append(el('div', { class: 'grid-empty' }, msg));
      document.getElementById('dashPageInfo').textContent = 'Showing 0 of ' + r.total;
      dash._total = r.total;
      document.getElementById('dashPrev').disabled = dash.offset <= 0;
      document.getElementById('dashNext').disabled = true;
      return;
    }
    renderGrid(grid, r.columns, r.rows, true);
    const start = r.rows.length ? r.offset + 1 : 0;
    const end = r.offset + r.rows.length;
    document.getElementById('dashPageInfo').textContent =
      'Showing ' + start + '–' + end + ' of ' + r.total;
    dash._total = r.total;
    document.getElementById('dashPrev').disabled = dash.offset <= 0;
    document.getElementById('dashNext').disabled = end >= r.total;
  } catch (e) { grid.innerHTML = ''; toast(e.message, true); }
}

// Shared grid renderer. sortable=true wires column-header sorting for the Data tab.
function renderGrid(container, columns, rows, sortable) {
  container.innerHTML = '';
  if (!columns || !columns.length) {
    container.append(el('div', { class: 'grid-empty' }, 'No columns.'));
    return;
  }
  const table = el('table', { class: 'grid' });
  const headRow = el('tr');
  columns.forEach(col => {
    let label = col;
    if (sortable && dash && dash.orderBy && dash.orderBy.column === col) {
      label = col + (dash.orderBy.dir === 'asc' ? ' ▲' : ' ▼');
    }
    const th = el('th', sortable ? { onclick: () => sortBy(col), title: 'Sort' } : { title: col }, label);
    headRow.append(th);
  });
  table.append(el('thead', null, headRow));
  const tbody = el('tbody');
  (rows || []).forEach(row => {
    const tr = el('tr');
    columns.forEach((c, ci) => {
      const v = row[ci];
      const isNull = v === null || v === undefined || v === '';
      tr.append(el('td', { class: isNull ? 'null' : null, title: isNull ? '' : String(v) }, isNull ? '∅' : String(v)));
    });
    tbody.append(tr);
  });
  table.append(tbody);
  if (!(rows && rows.length)) container.append(el('div', { class: 'grid-empty' }, 'No rows.'));
  container.append(table);
}

function sortBy(col) {
  if (dash.orderBy && dash.orderBy.column === col) {
    dash.orderBy.dir = dash.orderBy.dir === 'asc' ? 'desc' : 'asc';
  } else {
    dash.orderBy = { column: col, dir: 'asc' };
  }
  dash.offset = 0;
  loadBrowse();
}

async function runQuery() {
  if (!dash) return;
  const sql = document.getElementById('dashSql').value.trim();
  const out = document.getElementById('dashQueryResults');
  if (!sql) { toast('Enter a SQL statement', true); return; }
  out.innerHTML = '';
  const skelWrap = el('div', { class: 'grid-wrap' });
  skelWrap.append(skeletonRows(6, 5));
  out.append(skelWrap);
  try {
    const r = await api('POST', '/db/' + encodeURIComponent(dash.slug) + '/query', { sql });
    out.innerHTML = '';
    if (r.ok) {
      if (!r.rows || !r.rows.length) {
        out.append(el('div', { class: 'empty' }, 'Query returned no rows.'));
        return;
      }
      out.append(el('div', { class: 'info', style: 'margin-bottom:8px' }, r.rowCount + ' rows'));
      const wrap = el('div', { class: 'grid-wrap' });
      out.append(wrap);
      renderGrid(wrap, r.columns, r.rows, false);
    } else if (r.blocked) {
      out.append(el('div', { class: 'banner err' }, 'Blocked: ' + (r.error || 'read-only database')));
    } else {
      out.append(el('div', { class: 'banner err' }, r.error || 'Query failed'));
    }
  } catch (e) {
    out.innerHTML = '';
    out.append(el('div', { class: 'banner err' }, e.message));
  }
}

document.getElementById('dashCloseBtn').onclick = () => closeDash();
document.getElementById('dashTabData').onclick = () => dashSetTab('data');
document.getElementById('dashTabQuery').onclick = () => dashSetTab('query');
document.getElementById('dashTableSearch').oninput = renderDashTables;
document.getElementById('dashSchemaSel').onchange = (e) => { dash.schema = e.target.value; renderDashTables(); };
document.getElementById('dashAddFilter').onclick = addFilter;
document.getElementById('dashApply').onclick = () => { dash.offset = 0; loadBrowse(); };
document.getElementById('dashPageSize').onchange = (e) => { dash.limit = Number(e.target.value) || 50; dash.offset = 0; loadBrowse(); };
document.getElementById('dashPrev').onclick = () => { dash.offset = Math.max(0, dash.offset - dash.limit); loadBrowse(); };
document.getElementById('dashNext').onclick = () => { dash.offset = dash.offset + dash.limit; loadBrowse(); };
document.getElementById('dashRun').onclick = runQuery;
document.getElementById('dashSql').addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); runQuery(); }
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && dashBg.classList.contains('open')) closeDash();
});

// Initial load: fetch state, then resolve the current path (so a direct
// /db/<slug> deep link opens the dashboard).
refresh().then(() => route()).catch(e => toast(e.message, true));
`;
