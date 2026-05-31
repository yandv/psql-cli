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

<div class="toast" id="toast"></div>
<script src="/app.js"></script>
</body>
</html>`;

export const APP_JS = `
const TOKEN = new URLSearchParams(location.search).get('token') || '';
const H = { 'Content-Type': 'application/json', 'x-psql-cli-token': TOKEN };
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
  const r = await fetch('/api' + path, { method, headers: H, body: body ? JSON.stringify(body) : undefined });
  const data = await r.json().catch(() => ({}));
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

function render() {
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
      el('div', { class: 'top' }, el('span', { class: 'slug' }, s), badges),
      el('div', { class: 'conn' }, d.user + '@' + d.host + ':' + d.port + '/' + d.database +
        (d.hasPassword ? '' : '  ⚠ no password set')),
      d.description ? el('div', { class: 'desc' }, d.description) : null,
      el('div', { class: 'actions' },
        el('button', { class: 'small', disabled: i === 0 ? '' : null, onclick: () => reorder('database', s, 'up') }, '▲'),
        el('button', { class: 'small', disabled: i === dbSlugs.length - 1 ? '' : null, onclick: () => reorder('database', s, 'down') }, '▼'),
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

refresh().catch(e => toast(e.message, true));
`;
