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
.db.dragging { opacity: .45; }
.db.drop-before { box-shadow: 0 -3px 0 0 var(--accent); }
.db.drop-after { box-shadow: 0 3px 0 0 var(--accent); }
.db .drag-handle { cursor: grab; color: var(--muted); font-size: 15px; user-select: none;
  padding: 0 2px; }
.db .drag-handle:active { cursor: grabbing; }
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
.dash-side .nav-divider { border-top: 1px solid var(--border); margin: 0; flex: none; }

/* ---- open tabs (horizontal top bar, ordered, drag-reorderable) ---- */
.dash-tabbar { flex: none; display: flex; align-items: stretch; gap: 0;
  overflow-x: auto; overflow-y: hidden; border-bottom: 1px solid var(--border);
  background: var(--panel); padding: 0 4px; min-height: 40px; white-space: nowrap; }
.dash-tab { display: inline-flex; align-items: center; gap: 6px; flex: none;
  padding: 8px 10px; cursor: pointer; font-size: 13px; max-width: 220px;
  border: 1px solid transparent; border-bottom: none; border-radius: 7px 7px 0 0;
  margin-top: 4px; }
.dash-tab:hover { background: var(--panel2); }
.dash-tab.active { background: var(--bg); border-color: var(--border);
  color: var(--text); position: relative; }
.dash-tab.active::after { content: ''; position: absolute; left: 0; right: 0; bottom: -1px;
  height: 1px; background: var(--bg); }
.dash-tab .handle { cursor: grab; color: var(--muted); font-size: 14px; user-select: none;
  flex: none; padding: 0 1px; }
.dash-tab .handle:active { cursor: grabbing; }
.dash-tab .ot-icon { flex: none; }
.dash-tab .ot-title { flex: 1; min-width: 0; white-space: nowrap; overflow: hidden;
  text-overflow: ellipsis; }
.dash-tab .x { flex: none; color: var(--muted); border: none; background: none; padding: 0 4px;
  border-radius: 4px; font-size: 13px; line-height: 1; opacity: .5; }
.dash-tab:hover .x { opacity: 1; }
.dash-tab.active .x { opacity: 1; }
.dash-tab .x:hover { color: var(--danger); border: none; }
.dash-tab.dragging { opacity: .45; }
.dash-tab.drop-left { box-shadow: inset 2px 0 0 0 var(--accent); }
.dash-tab.drop-right { box-shadow: inset -2px 0 0 0 var(--accent); }
.dash-tabbar .add-query { flex: none; align-self: center; margin: 0 4px; }
.dash-main { flex: 1; display: flex; flex-direction: column; min-width: 0; min-height: 0; }
.dash-panes { flex: 1; display: flex; min-height: 0; }
.dash-pane { flex: 1; display: none; flex-direction: column; min-height: 0; padding: 12px; min-width: 0; }
.dash-pane.active { display: flex; }
.dash-main .empty-main { flex: 1; display: flex; align-items: center; justify-content: center;
  color: var(--muted); padding: 24px; }
.query-pane { display: flex; flex-direction: column; min-height: 0; flex: 1; }
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
/* skeleton db card variant (home screen first paint) */
.db.skeleton { background: var(--panel2); pointer-events: none; }
.db.skeleton::after { content: ''; position: absolute; inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.08), transparent);
  transform: translateX(-100%); animation: shimmer 1.2s infinite; }
.db.skeleton .skel-line { margin: 0 0 8px; background: var(--bg); }
.db.skeleton .skel-line:last-child { margin-bottom: 0; }
.recent-chip.skeleton { width: 90px; height: 24px; border: none; }

/* ---- sort indicators (multi-column) ---- */
table.grid th .sort-ind { color: var(--accent); font-size: 11px; margin-left: 4px; }
table.grid th .sort-pri { font-size: 9px; vertical-align: super; opacity: .8; }

/* ---- inline editing / staged changes ---- */
table.grid td.editable { cursor: cell; }
table.grid td.dirty { outline: 2px solid var(--rw); outline-offset: -2px; }
table.grid td.cell-null { color: var(--muted); font-style: italic; }
table.grid tr.row-deleted td { text-decoration: line-through;
  background: rgba(248,81,73,.12) !important; color: var(--danger); }
table.grid td input.cell-edit { width: 100%; min-width: 80px; padding: 2px 4px;
  font: inherit; background: var(--bg); color: var(--text);
  border: 1px solid var(--accent); border-radius: 3px; }
.pending-bar { display: flex; align-items: center; gap: 10px; flex: none;
  background: rgba(240,136,62,.12); border: 1px solid var(--rw); color: var(--rw);
  border-radius: 8px; padding: 8px 12px; margin-bottom: 10px; position: sticky; top: 0; z-index: 2; }
.pending-bar .spacer { flex: 1; }
.pending-bar button { color: var(--text); }
.nopk-note { color: var(--muted); font-size: 12px; margin-bottom: 8px; }
.ctx-menu { position: fixed; z-index: 2000; background: var(--panel); border: 1px solid var(--border);
  border-radius: 8px; padding: 4px; min-width: 150px; box-shadow: 0 6px 24px rgba(0,0,0,.5); }
.ctx-menu .item { padding: 7px 12px; border-radius: 5px; cursor: pointer; font-size: 13px; }
.ctx-menu .item:hover { background: var(--panel2); }
.ctx-menu .item.danger { color: var(--danger); }

/* ---- recents ---- */
.recent-row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.recent-chip { padding: 5px 12px; border-radius: 999px; font-size: 12px;
  background: var(--panel2); border: 1px solid var(--border); cursor: pointer; }
.recent-chip:hover { border-color: var(--accent); color: var(--accent); }
.recent-clear { margin-left: auto; }

/* ---- schema filter ---- */
.dash-side .search .schema-sel { margin-bottom: 8px; }

/* ---- export/import ---- */
.modal .warn { background: rgba(240,136,62,.12); border: 1px solid var(--rw); color: var(--rw);
  border-radius: 8px; padding: 10px 12px; font-size: 12px; margin: 0 0 12px; }
.passphrase-box { display: flex; align-items: center; gap: 8px; margin: 10px 0 4px;
  background: var(--bg); border: 1px solid var(--accent); border-radius: 8px; padding: 10px 12px; }
.passphrase-box code { flex: 1; min-width: 0; font-family: ui-monospace, monospace; font-size: 14px;
  word-break: break-all; user-select: all; color: var(--text); }
.passphrase-box button { flex: none; }
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
  <button id="exportBtn">Export</button>
  <button id="importBtn">Import</button>
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

<div class="modal-bg" id="exportModalBg">
  <div class="modal">
    <h3>Export connections</h3>
    <p class="hint">Exports all connections AND their passwords, encrypted, so you can move them to another machine.</p>
    <p class="warn">Anyone with the file AND the passphrase can read your credentials — keep both safe.</p>
    <label for="ex_pass">Passphrase</label>
    <input id="ex_pass" type="password" placeholder="Choose a strong passphrase" autocomplete="new-password" />
    <label for="ex_pass2">Confirm passphrase</label>
    <input id="ex_pass2" type="password" placeholder="Repeat passphrase" autocomplete="new-password" />
    <div style="margin-top:10px"><button id="exGenBtn" class="small">Generate strong passphrase</button></div>
    <div id="exGenWrap" style="display:none">
      <p class="warn" style="margin-top:14px">Save this passphrase — you'll need it to import. It is not stored anywhere.</p>
      <div class="passphrase-box">
        <code id="exGenPass"></code>
        <button id="exCopyBtn" class="small">Copy</button>
      </div>
    </div>
    <div class="foot">
      <button id="exCancelBtn">Cancel</button>
      <button class="primary" id="exDownloadBtn">Export &amp; download</button>
    </div>
  </div>
</div>

<div class="modal-bg" id="importModalBg">
  <div class="modal">
    <h3>Import connections</h3>
    <p class="hint">Select an exported file and enter the passphrase used to create it.</p>
    <label for="im_file">Export file (.json)</label>
    <input id="im_file" type="file" accept=".json" />
    <label for="im_pass">Passphrase</label>
    <input id="im_pass" type="password" placeholder="Passphrase used at export" autocomplete="off" />
    <div class="switch">
      <input type="checkbox" id="im_replace" style="width:auto" />
      <label for="im_replace" style="margin:0">Replace existing (instead of merge)</label>
    </div>
    <div class="foot">
      <button id="imCancelBtn">Cancel</button>
      <button class="primary" id="imImportBtn">Import</button>
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
      <div class="dash-tabbar" id="dashTabBar"></div>
      <div class="dash-panes" id="dashPanes"></div>
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
const LAST_PROJECT_KEY = 'psqlcli.lastProject';
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

// Persist the selected project filter so reopening the UI restores it.
function loadLastProject() {
  try { return localStorage.getItem(LAST_PROJECT_KEY) || ''; } catch (e) { return ''; }
}
function setProjectFilter(value) {
  currentProjectFilter = value;
  try {
    if (value) localStorage.setItem(LAST_PROJECT_KEY, value);
    else localStorage.removeItem(LAST_PROJECT_KEY);
  } catch (e) {}
}

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

// Drag-and-drop database reorder: optimistically rewrite local order across the
// FULL set of databases (so the persisted index is global, not view-local),
// re-render immediately, then persist in the background.
function moveDatabase(fromSlug, toSlug, after) {
  if (fromSlug === toSlug) return;
  const all = orderedSlugs(state.databases);
  const from = all.indexOf(fromSlug);
  if (from === -1) return;
  all.splice(from, 1);
  let to = all.indexOf(toSlug);
  if (to === -1) return;
  if (after) to += 1;
  all.splice(to, 0, fromSlug);
  // Rewrite local order indices and re-render immediately (optimistic).
  all.forEach((s, i) => { state.databases[s].order = i; });
  render();
  persistOrder(all);
}
async function persistOrder(orderedList) {
  try {
    await api('POST', '/order', { databases: orderedList });
  } catch (e) {
    toast('Could not save order: ' + e.message, true);
    refresh();
  }
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
// Home-screen shimmer: render placeholder db cards + recent chips on first
// paint, before the initial /state fetch resolves. render() replaces them.
function renderHomeSkeleton() {
  const dl = document.getElementById('dbList');
  if (dl) {
    dl.innerHTML = '';
    for (let i = 0; i < 6; i++) {
      dl.append(el('div', { class: 'db skeleton' },
        el('div', { class: 'skeleton skel-line', style: 'width:' + (40 + (i * 17) % 40) + '%' }),
        el('div', { class: 'skeleton skel-line', style: 'width:' + (60 + (i * 11) % 30) + '%' })));
    }
  }
  const rl = document.getElementById('recentList');
  if (rl) {
    rl.innerHTML = '';
    const row = el('div', { class: 'recent-row' });
    for (let i = 0; i < 3; i++) row.append(el('div', { class: 'recent-chip skeleton' }));
    rl.append(row);
  }
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
// Each context owns its own URL:
//   /database/:slug                          -> dashboard open, no context
//   /database/:slug/table/:schema/:table     -> that table context
//   /database/:slug/query/:n                  -> the SQL editor context numbered n
function navigate(path) {
  if (location.pathname !== path) history.pushState({}, '', path);
}
const enc = encodeURIComponent;
// Ensure the dashboard is open for slug; returns true if usable. fromRoute
// suppresses navigate() side-effects so route() never fights the address bar.
async function ensureDash(slug, fromRoute) {
  if (!state.databases[slug]) { toast('Unknown database "' + slug + '"', true); navigate('/'); return false; }
  if (!dash || dash.slug !== slug || !dashBg.classList.contains('open')) {
    await openDash(slug, true);
  }
  return true;
}
async function route() {
  const p = location.pathname || '/';
  // /database/:slug/table/:schema/:table
  let m = p.match(/^\\/database\\/([^/]+)\\/table\\/([^/]+)\\/([^/]+)\\/?$/);
  if (m) {
    const slug = decodeURIComponent(m[1]);
    const schema = decodeURIComponent(m[2]);
    const name = decodeURIComponent(m[3]);
    if (!(await ensureDash(slug, true))) return;
    const t = (dash.tables || []).find(x => x.schema === schema && x.name === name);
    if (!t) { toast('Unknown table "' + schema + '.' + name + '"', true); navigate('/database/' + enc(slug)); return; }
    openTableContext(t, true);
    return;
  }
  // /database/:slug/query/:n  (n optional for backward-compat)
  m = p.match(/^\\/database\\/([^/]+)\\/query(?:\\/([0-9]+))?\\/?$/);
  if (m) {
    const slug = decodeURIComponent(m[1]);
    if (!(await ensureDash(slug, true))) return;
    const n = m[2] ? Number(m[2]) : null;
    openSqlContext(true, n);
    return;
  }
  // /database/:slug (no context)
  m = p.match(/^\\/database\\/([^/]+)\\/?$/);
  if (m) {
    const slug = decodeURIComponent(m[1]);
    if (!(await ensureDash(slug, true))) return;
    setContext(null, true);
    return;
  }
  // Any other path -> main list view; ensure the dashboard is closed.
  if (dashBg.classList.contains('open')) closeDash(true);
}
window.onpopstate = () => { route(); };

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
  if (currentProjectFilter && !state.projects[currentProjectFilter]) setProjectFilter('');

  // project filter (pill row): "All projects" first + pre-selected.
  const pf = document.getElementById('projFilter');
  pf.innerHTML = '';
  const mkPill = (value, label) => {
    const active = currentProjectFilter === value;
    return el('button', {
      class: 'small pill' + (active ? ' active' : ''),
      onclick: () => { setProjectFilter(value); render(); },
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
  dbSlugs.forEach((s) => {
    const d = state.databases[s];
    const badges = el('div', { style: 'display:flex;gap:6px' },
      el('span', { class: 'badge ' + (d.readOnly ? 'ro' : 'rw') }, d.readOnly ? 'read-only' : 'read-write'));
    if (s === state.defaultDatabase) badges.append(el('span', { class: 'badge def' }, 'default'));
    const card = el('div', { class: 'db', draggable: 'true' },
      el('div', { class: 'top' },
        el('span', { class: 'drag-handle', title: 'Drag to reorder' }, '⠿'),
        el('span', { class: 'slug clickable', title: 'Browse data', onclick: () => openDash(s) }, s), badges),
      el('div', { class: 'conn' }, d.user + '@' + d.host + ':' + d.port + '/' + d.database +
        (d.hasPassword ? '' : '  ⚠ no password set')),
      d.description ? el('div', { class: 'desc' }, d.description) : null,
      el('div', { class: 'actions' },
        el('button', { class: 'small primary', onclick: () => openDash(s) }, 'Browse'),
        el('button', { class: 'small', onclick: () => openDb(s) }, 'Edit'),
        el('button', { class: 'small', onclick: () => testDb(s) }, 'Test'),
        el('button', { class: 'small', onclick: () => setDefault(s) }, 'Set default'),
        el('button', { class: 'small danger', onclick: () => delDb(s) }, 'Delete')));
    card.dataset.slug = s;
    card.addEventListener('dragstart', (e) => {
      card.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      try { e.dataTransfer.setData('text/plain', s); } catch (err) {}
    });
    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
      dl.querySelectorAll('.db').forEach(c => c.classList.remove('drop-before', 'drop-after'));
    });
    card.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      const rect = card.getBoundingClientRect();
      const after = (e.clientY - rect.top) > rect.height / 2;
      card.classList.toggle('drop-after', after);
      card.classList.toggle('drop-before', !after);
    });
    card.addEventListener('dragleave', () => {
      card.classList.remove('drop-before', 'drop-after');
    });
    card.addEventListener('drop', (e) => {
      e.preventDefault();
      const from = (() => { try { return e.dataTransfer.getData('text/plain'); } catch (err) { return ''; } })();
      const rect = card.getBoundingClientRect();
      const after = (e.clientY - rect.top) > rect.height / 2;
      card.classList.remove('drop-before', 'drop-after');
      if (from) moveDatabase(from, s, after);
    });
    dl.append(card);
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

// ---- export modal ----
const exportBg = document.getElementById('exportModalBg');
function openExport() {
  document.getElementById('ex_pass').value = '';
  document.getElementById('ex_pass2').value = '';
  document.getElementById('exGenPass').textContent = '';
  document.getElementById('exGenWrap').style.display = 'none';
  exportBg.classList.add('open');
}
function closeExport() { exportBg.classList.remove('open'); }
// Create a Blob from the encrypted bundle and trigger a browser download.
function downloadBundle(bundle, filename) {
  const blob = new Blob([bundle], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = el('a', { href: url, download: filename || 'psql-cli-export.json' });
  document.body.append(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
// Generate path: ask the server for a strong passphrase, show it, download bundle.
async function generatePassphrase() {
  try {
    const r = await api('POST', '/export', { generate: true });
    if (r.passphrase) {
      document.getElementById('exGenPass').textContent = r.passphrase;
      document.getElementById('exGenWrap').style.display = 'block';
    }
    if (r.ok && r.bundle) {
      downloadBundle(r.bundle, r.filename);
      toast('Exported — save the generated passphrase!', 'ok');
    }
  } catch (e) { toast(e.message, true); }
}
// Typed-passphrase path: require matching passphrases, then export + download.
async function doExport() {
  const pass = document.getElementById('ex_pass').value;
  const pass2 = document.getElementById('ex_pass2').value;
  if (!pass) { toast('Enter a passphrase or click Generate.', true); return; }
  if (pass !== pass2) { toast('Passphrases do not match.', true); return; }
  try {
    const r = await api('POST', '/export', { passphrase: pass });
    if (r.ok && r.bundle) {
      downloadBundle(r.bundle, r.filename);
      closeExport();
      toast('Exported', 'ok');
    } else {
      toast(r.error || 'Export failed.', true);
    }
  } catch (e) { toast(e.message, true); }
}

// ---- import modal ----
const importBg = document.getElementById('importModalBg');
function openImport() {
  document.getElementById('im_file').value = '';
  document.getElementById('im_pass').value = '';
  document.getElementById('im_replace').checked = false;
  importBg.classList.add('open');
}
function closeImport() { importBg.classList.remove('open'); }
// Read the chosen file as text (FileReader), POST to /api/import, refresh on success.
async function doImport() {
  const fileInput = document.getElementById('im_file');
  const pass = document.getElementById('im_pass').value;
  const file = fileInput.files && fileInput.files[0];
  if (!file) { toast('Choose an export file first.', true); return; }
  if (!pass) { toast('Enter the passphrase.', true); return; }
  let bundle;
  try {
    bundle = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('Could not read file.'));
      reader.readAsText(file);
    });
  } catch (e) { toast(e.message, true); return; }
  try {
    const r = await api('POST', '/import', {
      bundle, passphrase: pass, replace: document.getElementById('im_replace').checked,
    });
    if (r.ok) {
      closeImport();
      await refresh();
      const n = r.imported || 0;
      toast('Imported ' + n + ' connection' + (n === 1 ? '' : 's'), 'ok');
    } else {
      toast(r.error || 'Import failed.', true);
    }
  } catch (e) { toast(e.message, true); }
}

document.getElementById('addDbBtn').onclick = () => openDb(null);
document.getElementById('addProjBtn').onclick = () => openProj(null);
document.getElementById('exportBtn').onclick = openExport;
document.getElementById('importBtn').onclick = openImport;
document.getElementById('exGenBtn').onclick = generatePassphrase;
document.getElementById('exCopyBtn').onclick = () => {
  const txt = document.getElementById('exGenPass').textContent || '';
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(txt).then(() => toast('Copied', 'ok'), () => toast('Copy failed', true));
  } else { toast('Copy not supported', true); }
};
document.getElementById('exDownloadBtn').onclick = doExport;
document.getElementById('exCancelBtn').onclick = closeExport;
document.getElementById('imImportBtn').onclick = doImport;
document.getElementById('imCancelBtn').onclick = closeImport;
[exportBg, importBg].forEach(bg => bg.addEventListener('click', e => { if (e.target === bg) bg.classList.remove('open'); }));
document.getElementById('dbSaveBtn').onclick = saveDb;
document.getElementById('dbCancelBtn').onclick = closeDb;
document.getElementById('dbTestBtn').onclick = () => testDb(null);
document.getElementById('dbParseBtn').onclick = parseFill;
document.getElementById('dbListBtn').onclick = listDatabases;
document.getElementById('projSaveBtn').onclick = saveProj;
document.getElementById('projCancelBtn').onclick = closeProj;
document.getElementById('defaultSel').onchange = (e) => setDefault(e.target.value);
[dbBg, projBg].forEach(bg => bg.addEventListener('click', e => { if (e.target === bg) bg.classList.remove('open'); }));

// ---- data-browser dashboard (sidebar-driven, one context at a time) ----
const dashBg = document.getElementById('dashBg');
// dash holds the per-database session: the sidebar tables + schema filter, plus
// a CACHE of built contexts keyed by context-id so returning to a context
// preserves its filters/sort/staged edits. Only the active context's pane is
// shown; the others are display:none.
//   dash = { slug, tables, schema, readOnly, panes: Map<ctxId, ctx>, order:[ctxId],
//            activeId, queryNo }
// Context ids: 'table:<schema>.<name>' and 'sql:<n>'.
// 'order' is the ordered list of OPEN tab ctxIds shown vertically in the
// sidebar (drag-reorderable). 'queryNo' is the per-database incrementing SQL
// tab counter (titles "Query N").
// Each context owns its OWN state object + DOM pane:
//   Table ctx: { id, kind:'table', table:{schema,name,type}, columns, filters,
//                orderBy, limit, offset, total, pane, els{...}, edits, ... }
//   SQL ctx:   { id:'sql:<n>', kind:'sql', n, title, sql, limit, offset, total, pane, els{...} }
let dash = null;

const PAGE_SIZES = [25, 50, 100, 200];
const NULL_OPS = ['is null', 'is not null'];
const FILTER_OPS = ['=', '<>', '<', '<=', '>', '>=', 'like', 'ilike', 'is null', 'is not null'];

function panesEl() { return document.getElementById('dashPanes'); }
function tableCtxId(t) { return 'table:' + t.schema + '.' + t.name; }
function sqlCtxId(n) { return 'sql:' + n; }
function tabsKey(slug) { return 'psqlcli.tabs.' + slug; }

function resetDash(slug) {
  dash = {
    slug,
    tables: [],         // [{ schema, name, type }]
    schema: '',         // '' = all schemas (shared sidebar filter)
    readOnly: !!(state.databases[slug] && state.databases[slug].readOnly),
    panes: new Map(),   // ctxId -> context object (cached, only active shown)
    order: [],          // ordered list of OPEN tab ctxIds (sidebar order)
    activeId: null,     // ctxId of the visible context, or null
    queryNo: 0,         // per-database incrementing SQL tab counter
  };
}

// ---- per-database open-tab persistence (localStorage) ----
// Stores { order:[ctxId], activeId, queryNo, tabs:{ctxId:descriptor} }.
// Table descriptor: {kind:'table', schema, table, filters, orderBy}.
// SQL descriptor:   {kind:'sql', n, sql}. Staged inline edits are NOT persisted.
function persistTabs() {
  if (!dash) return;
  const tabs = {};
  dash.order.forEach((id) => {
    const ctx = dash.panes.get(id);
    if (!ctx) return;
    if (ctx.kind === 'table') {
      tabs[id] = {
        kind: 'table',
        schema: ctx.table.schema,
        table: ctx.table.name,
        filters: (ctx.filters || []).map(f => ({ column: f.column, op: f.op, value: f.value })),
        orderBy: (ctx.orderBy || []).map(o => ({ column: o.column, dir: o.dir })),
      };
    } else if (ctx.kind === 'sql') {
      tabs[id] = { kind: 'sql', n: ctx.n, sql: (ctx.els && ctx.els.sql) ? ctx.els.sql.value : ctx.sql };
    }
  });
  const payload = { order: dash.order.slice(), activeId: dash.activeId, queryNo: dash.queryNo, tabs };
  try { localStorage.setItem(tabsKey(dash.slug), JSON.stringify(payload)); } catch (e) {}
}
function loadPersistedTabs(slug) {
  try {
    const v = JSON.parse(localStorage.getItem(tabsKey(slug)) || 'null');
    if (v && Array.isArray(v.order) && v.tabs) return v;
  } catch (e) {}
  return null;
}

async function openDash(slug, fromRoute) {
  const d = state.databases[slug];
  if (!d) { toast('Unknown database', true); return; }
  pushRecent(slug);
  renderRecent();
  if (!fromRoute) navigate('/database/' + encodeURIComponent(slug));
  resetDash(slug);
  document.getElementById('dashSlug').textContent = slug;
  const badge = document.getElementById('dashBadge');
  badge.className = 'badge ' + (d.readOnly ? 'ro' : 'rw');
  badge.textContent = d.readOnly ? 'read-only' : 'read-write';
  document.getElementById('dashConn').textContent = d.host + ':' + d.port + '/' + d.database;
  document.getElementById('dashTableSearch').value = '';
  document.getElementById('dashSchemaSel').innerHTML = '';
  panesEl().innerHTML = '';
  renderMainArea();
  dashBg.classList.add('open');
  // Skeleton list while /tables is in flight.
  const tablesWrap = document.getElementById('dashTables');
  tablesWrap.innerHTML = '';
  tablesWrap.append(skeletonList(8));
  renderOpenTabs();
  try {
    const r = await api('GET', '/db/' + encodeURIComponent(slug) + '/tables');
    dash.tables = r.tables || [];
    populateSchemaSel();
    renderDashTables();
    restoreTabs();
    renderOpenTabs();
  } catch (e) { tablesWrap.innerHTML = ''; toast(e.message, true); }
}

// Rebuild the open tabs saved for this database (after tables are loaded), in
// the saved order, and activate the saved activeId. Table tabs whose table no
// longer exists are dropped. SQL tabs restore their editor text. Returns true
// if anything was restored.
function restoreTabs() {
  const saved = loadPersistedTabs(dash.slug);
  if (!saved) return false;
  dash.queryNo = Number(saved.queryNo) || 0;
  let restored = 0;
  (saved.order || []).forEach((id) => {
    const desc = saved.tabs[id];
    if (!desc) return;
    if (desc.kind === 'table') {
      const t = dash.tables.find(x => x.schema === desc.schema && x.name === desc.table);
      if (!t) return; // table gone -> drop
      const tab = makeTableCtx(t);
      tab.filters = (desc.filters || []).map(f => ({ column: f.column, op: f.op || '=', value: f.value || '' }));
      tab.orderBy = (desc.orderBy || []).map(o => ({ column: o.column, dir: o.dir === 'desc' ? 'desc' : 'asc' }));
      buildTablePane(tab);
      dash.panes.set(tab.id, tab);
      dash.order.push(tab.id);
      restored++;
      loadTableData(tab);
    } else if (desc.kind === 'sql') {
      const n = Number(desc.n) || (dash.queryNo + 1);
      const tab = makeSqlCtx(n);
      tab.sql = desc.sql || '';
      buildSqlPane(tab);
      dash.panes.set(tab.id, tab);
      dash.order.push(tab.id);
      if (n > dash.queryNo) dash.queryNo = n;
      restored++;
    }
  });
  if (!restored) return false;
  const act = saved.activeId && dash.panes.has(saved.activeId) ? saved.activeId : null;
  if (act) setContext(act, true);
  else renderMainArea();
  return true;
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
  const active = activeCtx();
  const activeTbl = active && active.kind === 'table' ? active.table : null;
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
      const isActive = activeTbl && activeTbl.schema === t.schema && activeTbl.name === t.name;
      const icon = t.type === 'view' ? '👁 ' : '📄 ';
      wrap.append(el('div', {
        class: 'tbl' + (isActive ? ' active' : ''),
        title: t.schema + '.' + t.name,
        onclick: () => selectTable(t),
      }, icon + t.name));
    });
  });
}

// ---- open-tabs top bar (horizontal, ordered, drag-reorderable) ----
function tabTitle(ctx) {
  return ctx.kind === 'table' ? ctx.table.name : (ctx.title || ('Query ' + ctx.n));
}
function tabIcon(ctx) {
  if (ctx.kind === 'sql') return '⌑';
  return ctx.table.type === 'view' ? '👁' : '📄';
}
function renderOpenTabs() {
  const wrap = document.getElementById('dashTabBar');
  if (!wrap || !dash) return;
  wrap.innerHTML = '';
  dash.order.forEach((id) => {
    const ctx = dash.panes.get(id);
    if (!ctx) return;
    const isActive = id === dash.activeId;
    const close = el('button', {
      class: 'x', title: 'Close',
      onclick: (e) => { e.stopPropagation(); closeTab(id); },
    }, '✕');
    const row = el('div', {
      class: 'dash-tab' + (isActive ? ' active' : ''),
      draggable: 'true',
      title: ctx.kind === 'table' ? (ctx.table.schema + '.' + ctx.table.name) : tabTitle(ctx),
      onclick: () => selectTab(id),
    },
      el('span', { class: 'handle', title: 'Drag to reorder' }, '⋮'),
      el('span', { class: 'ot-icon' }, tabIcon(ctx)),
      el('span', { class: 'ot-title' }, tabTitle(ctx)),
      close);
    row.dataset.ctxid = id;
    row.addEventListener('dragstart', (e) => {
      row.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      try { e.dataTransfer.setData('text/plain', id); } catch (err) {}
    });
    row.addEventListener('dragend', () => {
      row.classList.remove('dragging');
      wrap.querySelectorAll('.dash-tab').forEach(c => c.classList.remove('drop-left', 'drop-right'));
    });
    row.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      const rect = row.getBoundingClientRect();
      const after = (e.clientX - rect.left) > rect.width / 2;
      row.classList.toggle('drop-right', after);
      row.classList.toggle('drop-left', !after);
    });
    row.addEventListener('dragleave', () => { row.classList.remove('drop-left', 'drop-right'); });
    row.addEventListener('drop', (e) => {
      e.preventDefault();
      const from = (() => { try { return e.dataTransfer.getData('text/plain'); } catch (err) { return ''; } })();
      const rect = row.getBoundingClientRect();
      const after = (e.clientX - rect.left) > rect.width / 2;
      row.classList.remove('drop-left', 'drop-right');
      if (from) moveTab(from, id, after);
    });
    wrap.append(row);
  });
  // ＋ Query affordance lives at the end of the bar.
  wrap.append(el('button', {
    class: 'small add-query', id: 'dashAddQueryBtn', title: 'New SQL query tab',
    onclick: () => newQueryTab(),
  }, '＋ Query'));
}
// Reorder dash.order (does NOT change which tab is active). Re-render + persist.
function moveTab(fromId, toId, after) {
  if (fromId === toId) return;
  const from = dash.order.indexOf(fromId);
  if (from === -1) return;
  dash.order.splice(from, 1);
  let to = dash.order.indexOf(toId);
  if (to === -1) { dash.order.splice(from, 0, fromId); return; }
  if (after) to += 1;
  dash.order.splice(to, 0, fromId);
  renderOpenTabs();
  persistTabs();
}
// Click an open-tab row -> push its URL, then activate.
function selectTab(id) {
  const ctx = dash.panes.get(id);
  if (!ctx) return;
  if (ctx.kind === 'table') {
    navigate('/database/' + enc(dash.slug) + '/table/' + enc(ctx.table.schema) + '/' + enc(ctx.table.name));
  } else {
    navigate('/database/' + enc(dash.slug) + '/query/' + ctx.n);
  }
  setContext(id, true);
}
// Close an open tab. The active tab activates a neighbour (or empty-main).
function closeTab(id) {
  const idx = dash.order.indexOf(id);
  if (idx === -1) return;
  const ctx = dash.panes.get(id);
  if (ctx && ctx.pane) ctx.pane.remove();
  dash.panes.delete(id);
  dash.order.splice(idx, 1);
  if (dash.activeId === id) {
    const neighbour = dash.order[idx] || dash.order[idx - 1] || null;
    if (neighbour) { selectTab(neighbour); }
    else { navigate('/database/' + enc(dash.slug)); setContext(null, true); }
  } else {
    renderOpenTabs();
  }
  persistTabs();
}

// ---- context activation (one at a time, sidebar-driven) ----
function activeCtx() {
  if (!dash || !dash.activeId) return null;
  return dash.panes.get(dash.activeId) || null;
}
// Show exactly one context (or none). Hides every other built pane and toggles
// the empty-main state. fromRoute is accepted for symmetry (no nav here).
function setContext(id, fromRoute) {
  if (!dash) return;
  dash.activeId = id;
  dash.panes.forEach((ctx, cid) => { ctx.pane.classList.toggle('active', cid === id); });
  renderMainArea();
  renderDashTables();
  renderOpenTabs();
  persistTabs();
  const t = activeCtx();
  if (t && t.kind === 'sql' && t.els.sql) t.els.sql.focus();
}
function renderMainArea() {
  // Empty-state when no context is selected.
  const panes = panesEl();
  const existing = panes.querySelector('.empty-main');
  if (!dash.activeId) {
    if (!existing) {
      panes.append(el('div', { class: 'empty-main' },
        'Pick a table on the left, or click ＋ Query for a SQL editor.'));
    }
    return;
  }
  if (existing) existing.remove();
}

// ---- table context ----
// User clicked a table in the sidebar -> push URL, then activate.
function selectTable(t) {
  navigate('/database/' + enc(dash.slug) + '/table/' + enc(t.schema) + '/' + enc(t.name));
  openTableContext(t, true);
}
// Build a fresh table-context state object (no pane, no data yet).
function makeTableCtx(t) {
  return {
    id: tableCtxId(t),
    kind: 'table',
    table: t,
    columns: [],
    filters: [],
    orderBy: [],         // [{ column, dir }] — multi-column sort
    limit: 50,
    offset: 0,
    total: null,
    readOnly: dash.readOnly,
    pk: null,            // null = unknown/loading, [] = no primary key
    edits: new Map(),    // rowIndex -> { set:{col:val}, deleted:bool }
    rows: [],            // last-loaded rows (original values for PK keys)
    gridColumns: [],     // column order of last-loaded rows
    els: {},
  };
}
// Fetch columns + pk, then the first page of rows for a built table pane.
async function loadTableData(tab) {
  const t = tab.table;
  showGridSkeleton(tab.els.grid, 5);
  try {
    const r = await api('GET', '/db/' + encodeURIComponent(dash.slug) +
      '/columns?schema=' + encodeURIComponent(t.schema) + '&table=' + encodeURIComponent(t.name));
    tab.columns = (r.columns || []).map(c => c.name);
  } catch (e) { toast(e.message, true); }
  // Fetch primary key (needed to safely target rows for edit/delete).
  if (!tab.readOnly) {
    try {
      const pkr = await api('GET', '/db/' + encodeURIComponent(dash.slug) +
        '/pk?schema=' + encodeURIComponent(t.schema) + '&table=' + encodeURIComponent(t.name));
      tab.pk = pkr.pk || [];
    } catch (e) { tab.pk = []; }
  } else {
    tab.pk = [];
  }
  renderFilters(tab);
  await loadBrowse(tab);
}
// Activate a table context, building (and caching) its pane on first use so
// returning preserves filters/sort/staged edits. Opening adds it to the
// open-tabs list and persists.
async function openTableContext(t, fromRoute) {
  const id = tableCtxId(t);
  if (dash.panes.has(id)) { setContext(id, fromRoute); return; }
  const tab = makeTableCtx(t);
  buildTablePane(tab);
  dash.panes.set(id, tab);
  dash.order.push(id);
  setContext(id, fromRoute);
  persistTabs();
  await loadTableData(tab);
}

function buildTablePane(tab) {
  const filters = el('div');
  const grid = el('div', { class: 'grid-wrap' });
  const pageInfo = el('span', { class: 'info' });
  const pageSize = el('select', null,
    ...PAGE_SIZES.map(n => {
      const o = el('option', { value: String(n) }, String(n));
      if (n === tab.limit) o.selected = true;
      return o;
    }));
  pageSize.onchange = (e) => { tab.limit = Number(e.target.value) || 50; tab.offset = 0; loadBrowse(tab); };
  const prev = el('button', { class: 'small' }, 'Prev');
  const next = el('button', { class: 'small' }, 'Next');
  prev.onclick = () => { tab.offset = Math.max(0, tab.offset - tab.limit); loadBrowse(tab); };
  next.onclick = () => { tab.offset = tab.offset + tab.limit; loadBrowse(tab); };
  const pending = el('div', { class: 'pending-bar', style: 'display:none' });
  const pane = el('div', { class: 'dash-pane' },
    pending,
    el('div', { class: 'filters-bar' },
      filters,
      el('div', { class: 'filters-actions' },
        el('button', { class: 'small', onclick: () => addFilter(tab) }, '+ filter'),
        el('button', { class: 'small primary', onclick: () => { tab.offset = 0; loadBrowse(tab); } }, 'Apply'))),
    grid,
    el('div', { class: 'dash-foot' },
      pageInfo,
      el('div', { class: 'spacer' }),
      el('label', { style: 'margin:0' }, 'rows'),
      pageSize, prev, next));
  tab.pane = pane;
  tab.els = { filters, grid, pageInfo, prev, next, pending };
  panesEl().append(pane);
  renderFilters(tab);
}

function renderFilters(tab) {
  const wrap = tab.els.filters;
  wrap.innerHTML = '';
  tab.filters.forEach((f, idx) => {
    const colSel = el('select', { onchange: e => { f.column = e.target.value; } });
    tab.columns.forEach(c => {
      const o = el('option', { value: c }, c);
      if (c === f.column) o.selected = true;
      colSel.append(o);
    });
    if (!f.column && tab.columns.length) f.column = tab.columns[0];
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
      el('button', { class: 'small', title: 'Remove', onclick: () => { tab.filters.splice(idx, 1); renderFilters(tab); } }, '✕')));
  });
}

function addFilter(tab) {
  if (!tab.columns.length) { toast('Columns still loading', true); return; }
  tab.filters.push({ column: tab.columns[0], op: '=', value: '' });
  renderFilters(tab);
}

function activeFilters(tab) {
  return tab.filters
    .filter(f => f.column && f.op)
    .map(f => NULL_OPS.includes(f.op)
      ? { column: f.column, op: f.op }
      : { column: f.column, op: f.op, value: f.value || '' });
}

async function loadBrowse(tab) {
  if (!dash || !tab || tab.kind !== 'table') return;
  // Persist the (possibly-changed) filters/sort for this table tab.
  persistTabs();
  // A fresh load invalidates any staged edits (rowIndex would no longer match).
  if (tab.edits) tab.edits.clear();
  const filters = activeFilters(tab);
  const body = {
    schema: tab.table.schema,
    table: tab.table.name,
    filters: filters,
    orderBy: (tab.orderBy && tab.orderBy.length) ? tab.orderBy : undefined,
    limit: tab.limit,
    offset: tab.offset,
  };
  const grid = tab.els.grid;
  showGridSkeleton(grid, tab.columns.length || 5);
  try {
    const r = await api('POST', '/db/' + encodeURIComponent(dash.slug) + '/browse', body);
    if (!r.ok) { grid.innerHTML = ''; toast(r.error || 'Query failed', true); return; }
    tab.total = r.total;
    tab.readOnly = !!r.readOnly || dash.readOnly;
    tab.rows = r.rows || [];
    tab.gridColumns = r.columns || [];
    renderPendingBar(tab);
    if (!r.rows || !r.rows.length) {
      grid.innerHTML = '';
      const msg = filters.length ? 'No rows (active filters).' : 'No rows.';
      grid.append(el('div', { class: 'grid-empty' }, msg));
      tab.els.pageInfo.textContent = 'Showing 0 of ' + r.total;
      tab.els.prev.disabled = tab.offset <= 0;
      tab.els.next.disabled = true;
      return;
    }
    renderGrid(grid, r.columns, r.rows, { tab });
    const start = r.offset + 1;
    const end = r.offset + r.rows.length;
    tab.els.pageInfo.textContent = 'Showing ' + start + '–' + end + ' of ' + r.total;
    tab.els.prev.disabled = tab.offset <= 0;
    tab.els.next.disabled = end >= r.total;
  } catch (e) { grid.innerHTML = ''; toast(e.message, true); }
}

// Multi-column sort. Normal click on a NEW column => single-sort on it.
// Click the SAME (only) sorted column => toggle its dir. Shift+click => add the
// column to the sort (or toggle its dir if present, or remove it on a third
// shift-click when already descending), keeping the others.
function sortBy(tab, col, shift) {
  const ob = tab.orderBy || (tab.orderBy = []);
  const idx = ob.findIndex(o => o.column === col);
  if (shift) {
    if (idx === -1) {
      ob.push({ column: col, dir: 'asc' });
    } else if (ob[idx].dir === 'asc') {
      ob[idx].dir = 'desc';
    } else {
      // third shift-click removes this column from the multi-sort
      ob.splice(idx, 1);
    }
  } else {
    if (idx !== -1 && ob.length === 1) {
      ob[0].dir = ob[0].dir === 'asc' ? 'desc' : 'asc';
    } else {
      tab.orderBy = [{ column: col, dir: 'asc' }];
    }
  }
  tab.offset = 0;
  loadBrowse(tab);
}

// ---- SQL contexts (multiple) ----
// Build a fresh SQL-context state object numbered n (no pane yet).
function makeSqlCtx(n) {
  return {
    id: sqlCtxId(n),
    kind: 'sql',
    n,
    title: 'Query ' + n,
    sql: '',
    limit: 50,
    offset: 0,
    total: null,
    hasMore: false,
    els: {},
  };
}
// ＋ Query button / new SQL tab: allocate the next number, build it, activate.
function newQueryTab() {
  if (!dash) return;
  dash.queryNo += 1;
  const n = dash.queryNo;
  const tab = makeSqlCtx(n);
  buildSqlPane(tab);
  dash.panes.set(tab.id, tab);
  dash.order.push(tab.id);
  navigate('/database/' + enc(dash.slug) + '/query/' + n);
  setContext(tab.id, true);
  persistTabs();
}
// Activate a SQL context. With n: that specific tab (create if absent). Without
// n: the most-recent open SQL tab, or a new one. Adds to open-tabs + persists.
function openSqlContext(fromRoute, n) {
  if (!dash) return;
  if (n == null) {
    // pick the most recently-ordered open SQL tab, else create a new one.
    for (let i = dash.order.length - 1; i >= 0; i--) {
      const ctx = dash.panes.get(dash.order[i]);
      if (ctx && ctx.kind === 'sql') {
        if (!fromRoute) navigate('/database/' + enc(dash.slug) + '/query/' + ctx.n);
        setContext(ctx.id, fromRoute);
        return;
      }
    }
    newQueryTab();
    return;
  }
  const id = sqlCtxId(n);
  if (dash.panes.has(id)) { setContext(id, fromRoute); return; }
  const tab = makeSqlCtx(n);
  buildSqlPane(tab);
  dash.panes.set(id, tab);
  dash.order.push(id);
  if (n > dash.queryNo) dash.queryNo = n;
  setContext(id, fromRoute);
  persistTabs();
}

function buildSqlPane(tab) {
  const ro = dash.readOnly;
  const badge = el('span', { class: 'badge ' + (ro ? 'ro' : 'rw') }, ro ? 'read-only' : 'read-write');
  const sql = el('textarea', { placeholder: 'SELECT * FROM …' });
  sql.value = tab.sql;
  sql.addEventListener('input', () => { tab.sql = sql.value; persistTabs(); });
  sql.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); tab.offset = 0; runQuery(tab); }
  });
  const results = el('div', { class: 'query-results' });
  const pageInfo = el('span', { class: 'info' });
  const pageSize = el('select', null,
    ...PAGE_SIZES.map(n => {
      const o = el('option', { value: String(n) }, String(n));
      if (n === tab.limit) o.selected = true;
      return o;
    }));
  pageSize.onchange = (e) => { tab.limit = Number(e.target.value) || 50; tab.offset = 0; runQuery(tab); };
  const prev = el('button', { class: 'small' }, 'Prev');
  const next = el('button', { class: 'small' }, 'Next');
  prev.onclick = () => { tab.offset = Math.max(0, tab.offset - tab.limit); runQuery(tab); };
  next.onclick = () => { tab.offset = tab.offset + tab.limit; runQuery(tab); };
  prev.disabled = true; next.disabled = true;
  const foot = el('div', { class: 'dash-foot' },
    pageInfo, el('div', { class: 'spacer' }),
    el('label', { style: 'margin:0' }, 'rows'),
    pageSize, prev, next);
  foot.style.display = 'none';
  const pane = el('div', { class: 'dash-pane query-pane' },
    el('div', { class: 'query-editor' },
      el('div', { class: 'toolbar' },
        el('button', { class: 'primary small', onclick: () => { tab.offset = 0; runQuery(tab); } }, 'Run'),
        badge,
        el('span', { class: 'hint-ro' }, ro ? 'writes are blocked on this database' : ''),
        el('span', { class: 'info' }, 'Cmd/Ctrl+Enter to run')),
      sql),
    results, foot);
  tab.pane = pane;
  tab.els = { sql, results, pageInfo, prev, next, foot };
  panesEl().append(pane);
}

async function runQuery(tab) {
  if (!dash || !tab || tab.kind !== 'sql') return;
  const sql = tab.els.sql.value.trim();
  const out = tab.els.results;
  if (!sql) { toast('Enter a SQL statement', true); return; }
  out.innerHTML = '';
  const skelWrap = el('div', { class: 'grid-wrap' });
  skelWrap.append(skeletonRows(6, 5));
  out.append(skelWrap);
  try {
    const r = await api('POST', '/db/' + encodeURIComponent(dash.slug) + '/query',
      { sql, limit: tab.limit, offset: tab.offset });
    out.innerHTML = '';
    if (r.ok) {
      if (!r.rows || !r.rows.length) {
        out.append(el('div', { class: 'empty' }, 'Query returned no rows.'));
        updateSqlFoot(tab, r, 0);
        return;
      }
      const wrap = el('div', { class: 'grid-wrap' });
      out.append(wrap);
      renderGrid(wrap, r.columns, r.rows, null);
      updateSqlFoot(tab, r, r.rows.length);
    } else if (r.blocked) {
      out.append(el('div', { class: 'banner err' }, 'Blocked: ' + (r.error || 'read-only database')));
      hideSqlFoot(tab);
    } else {
      out.append(el('div', { class: 'banner err' }, r.error || 'Query failed'));
      hideSqlFoot(tab);
    }
  } catch (e) {
    out.innerHTML = '';
    out.append(el('div', { class: 'banner err' }, e.message));
    hideSqlFoot(tab);
  }
}

// Show pagination only when the server ran the query paginated (echoed a limit).
function updateSqlFoot(tab, r, shown) {
  const paged = typeof r.limit === 'number';
  if (!paged) { hideSqlFoot(tab); return; }
  tab.els.foot.style.display = 'flex';
  const offset = typeof r.offset === 'number' ? r.offset : tab.offset;
  const start = shown ? offset + 1 : 0;
  const end = offset + shown;
  if (typeof r.total === 'number') {
    tab.els.pageInfo.textContent = 'Showing ' + start + '–' + end + ' of ' + r.total;
    tab.els.next.disabled = end >= r.total;
  } else {
    tab.els.pageInfo.textContent = shown ? ('Showing ' + start + '–' + end) : 'No more rows';
    // No total: assume more rows only if we filled the page.
    tab.els.next.disabled = shown < tab.limit;
  }
  tab.els.prev.disabled = offset <= 0;
}
function hideSqlFoot(tab) { tab.els.foot.style.display = 'none'; }

// Shared grid renderer. Pass { tab } to wire sortable Data-tab headers; pass a
// falsy 4th arg for a plain (non-sortable) grid. Cells carry data-row / data-col
// attributes so a later task can attach per-cell editing.
function renderGrid(container, columns, rows, opts) {
  container.innerHTML = '';
  const tab = opts && opts.tab ? opts.tab : null;
  if (!columns || !columns.length) {
    container.append(el('div', { class: 'grid-empty' }, 'No columns.'));
    return;
  }
  // Editing is only offered for read-write tabs that have a known primary key.
  const editable = !!(tab && tab.readOnly === false && tab.pk && tab.pk.length);
  const multi = !!(tab && tab.orderBy && tab.orderBy.length > 1);
  const table = el('table', { class: 'grid' });
  const headRow = el('tr');
  columns.forEach(col => {
    const th = el('th', tab ? { title: 'Click to sort, Shift+click to add' } : { title: col }, col);
    if (tab) {
      const oi = tab.orderBy ? tab.orderBy.findIndex(o => o.column === col) : -1;
      if (oi !== -1) {
        const o = tab.orderBy[oi];
        th.append(el('span', { class: 'sort-ind' }, o.dir === 'asc' ? '▲' : '▼'));
        if (multi) th.append(el('span', { class: 'sort-pri' }, String(oi + 1)));
      }
      th.addEventListener('click', (e) => sortBy(tab, col, e.shiftKey));
    }
    headRow.append(th);
  });
  table.append(el('thead', null, headRow));
  const tbody = el('tbody');
  (rows || []).forEach((row, ri) => {
    const tr = el('tr');
    const edit = tab && tab.edits ? tab.edits.get(ri) : null;
    if (edit && edit.deleted) tr.classList.add('row-deleted');
    columns.forEach((c, ci) => {
      const staged = edit && edit.set && Object.prototype.hasOwnProperty.call(edit.set, c);
      const v = staged ? edit.set[c] : row[ci];
      const isNull = v === null || v === undefined;
      const isEmpty = !isNull && v === '';
      const td = el('td', {
        class: isNull ? 'null cell-null' : (isEmpty ? 'null' : null),
        title: isNull ? '' : String(v),
        'data-row': String(ri),
        'data-col': c,
      }, isNull ? '∅' : String(v));
      if (staged) td.classList.add('dirty');
      if (editable) {
        td.classList.add('editable');
        td.addEventListener('dblclick', () => beginCellEdit(tab, td, ri, c));
        td.addEventListener('contextmenu', (e) => { e.preventDefault(); openCellMenu(tab, e, ri, c); });
      }
      tr.append(td);
    });
    tbody.append(tr);
  });
  table.append(tbody);
  if (!(rows && rows.length)) container.append(el('div', { class: 'grid-empty' }, 'No rows.'));
  container.append(table);
  if (tab) {
    if (tab.readOnly === false && tab.pk && tab.pk.length === 0) {
      container.insertBefore(
        el('div', { class: 'nopk-note' }, 'No primary key — read-only grid'),
        container.firstChild);
    }
    renderPendingBar(tab);
  }
}

// ---- inline editing / staged changes (read-write + has primary key) ----
function getEdit(tab, ri) {
  let e = tab.edits.get(ri);
  if (!e) { e = { set: {}, deleted: false }; tab.edits.set(ri, e); }
  return e;
}
function pruneEdit(tab, ri) {
  const e = tab.edits.get(ri);
  if (e && !e.deleted && (!e.set || Object.keys(e.set).length === 0)) tab.edits.delete(ri);
}
// Stage a new value for one cell (value may be a string or null) and re-render.
function stageSet(tab, ri, col, value) {
  const e = getEdit(tab, ri);
  const ci = tab.gridColumns.indexOf(col);
  const orig = ci !== -1 ? tab.rows[ri][ci] : undefined;
  // If the new value equals the original, drop the staged change for that cell.
  const same = (orig === value) || (orig == null && value == null);
  if (same) { if (e.set) delete e.set[col]; }
  else { e.set[col] = value; }
  pruneEdit(tab, ri);
  refreshGrid(tab);
}
function beginCellEdit(tab, td, ri, col) {
  if (closeCellMenu._open) closeCellMenu();
  const cur = td.classList.contains('cell-null') ? '' : td.textContent;
  td.textContent = '';
  const input = el('input', { class: 'cell-edit', value: cur });
  let done = false;
  const commit = () => {
    if (done) return; done = true;
    stageSet(tab, ri, col, input.value);
  };
  const cancel = () => { if (done) return; done = true; refreshGrid(tab); };
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); commit(); }
    else if (e.key === 'Escape') { e.preventDefault(); cancel(); }
  });
  input.addEventListener('blur', commit);
  td.append(input);
  input.focus();
  input.select();
}

// ---- right-click context menu on a cell ----
function closeCellMenu() {
  if (closeCellMenu._el) { closeCellMenu._el.remove(); closeCellMenu._el = null; }
  closeCellMenu._open = false;
  document.removeEventListener('click', closeCellMenu);
  document.removeEventListener('keydown', closeCellMenu._key);
}
function openCellMenu(tab, ev, ri, col) {
  closeCellMenu();
  const menu = el('div', { class: 'ctx-menu' },
    el('div', { class: 'item', onclick: () => { closeCellMenu(); stageSet(tab, ri, col, null); } }, 'Set NULL'),
    el('div', { class: 'item danger', onclick: () => { closeCellMenu(); getEdit(tab, ri).deleted = true; refreshGrid(tab); } }, 'Delete row'),
    el('div', { class: 'item', onclick: () => { closeCellMenu(); tab.edits.delete(ri); refreshGrid(tab); } }, 'Revert row'));
  menu.style.left = ev.clientX + 'px';
  menu.style.top = ev.clientY + 'px';
  document.body.append(menu);
  closeCellMenu._el = menu;
  closeCellMenu._open = true;
  closeCellMenu._key = (e) => { if (e.key === 'Escape') closeCellMenu(); };
  // Defer outside-click binding so this very contextmenu event doesn't close it.
  setTimeout(() => {
    document.addEventListener('click', closeCellMenu);
    document.addEventListener('keydown', closeCellMenu._key);
  }, 0);
}

// Re-render the currently-loaded rows (no network) reflecting staged edits.
function refreshGrid(tab) {
  if (!tab || tab.kind !== 'table') return;
  if (tab.rows && tab.rows.length) {
    renderGrid(tab.els.grid, tab.gridColumns, tab.rows, { tab });
  } else {
    renderPendingBar(tab);
  }
}

// Sticky pending-changes bar shown when a tab has staged edits.
function renderPendingBar(tab) {
  const bar = tab.els && tab.els.pending;
  if (!bar) return;
  const n = tab.edits ? tab.edits.size : 0;
  if (!n) { bar.style.display = 'none'; bar.innerHTML = ''; return; }
  bar.innerHTML = '';
  bar.style.display = 'flex';
  bar.append(
    el('span', null, n + ' pending change' + (n === 1 ? '' : 's')),
    el('span', { class: 'spacer' }),
    el('button', { class: 'small', onclick: () => discardEdits(tab) }, 'Discard'),
    el('button', { class: 'small primary', onclick: () => saveEdits(tab) }, 'Save'));
}

function discardEdits(tab) {
  if (tab.edits) tab.edits.clear();
  refreshGrid(tab);
}

// Build the apply payload from staged edits and POST it. On success: reload
// fresh rows. On failure: keep edits so the user can fix and retry.
async function saveEdits(tab) {
  if (!dash || !tab || tab.kind !== 'table') return;
  if (tab.readOnly) { toast('This database is read-only.', true); return; }
  if (!tab.pk || !tab.pk.length) { toast('No primary key — cannot save.', true); return; }
  if (!tab.edits || !tab.edits.size) return;
  const keyFor = (ri) => {
    const key = {};
    tab.pk.forEach(pkc => {
      const ci = tab.gridColumns.indexOf(pkc);
      key[pkc] = ci !== -1 ? tab.rows[ri][ci] : null;
    });
    return key;
  };
  const changes = [];
  tab.edits.forEach((e, ri) => {
    if (e.deleted) {
      changes.push({ type: 'delete', schema: tab.table.schema, table: tab.table.name, key: keyFor(ri) });
    } else if (e.set && Object.keys(e.set).length) {
      changes.push({ type: 'update', schema: tab.table.schema, table: tab.table.name, key: keyFor(ri), set: e.set });
    }
  });
  if (!changes.length) return;
  try {
    const r = await api('POST', '/db/' + encodeURIComponent(dash.slug) + '/apply', { changes });
    if (r.ok) {
      toast('Saved (applied ' + (r.applied != null ? r.applied : changes.length) + ')', 'ok');
      tab.edits.clear();
      await loadBrowse(tab);
    } else {
      toast(r.error || 'Apply failed (rolled back)', true);
    }
  } catch (e) { toast(e.message, true); }
}

document.getElementById('dashCloseBtn').onclick = () => closeDash();
document.getElementById('dashTableSearch').oninput = renderDashTables;
document.getElementById('dashSchemaSel').onchange = (e) => { dash.schema = e.target.value; renderDashTables(); };
document.addEventListener('keydown', (e) => {
  // Cmd/Ctrl+S saves staged edits in the active table tab (read-write only).
  if ((e.metaKey || e.ctrlKey) && (e.key === 's' || e.key === 'S')
      && dashBg.classList.contains('open')) {
    const t = activeCtx();
    if (t && t.kind === 'table' && t.edits && t.edits.size) {
      e.preventDefault();
      saveEdits(t);
      return;
    }
  }
  if (e.key === 'Escape') {
    if (closeCellMenu._open) { closeCellMenu(); return; }
    if (dashBg.classList.contains('open')) closeDash();
  }
});

// Initial load: fetch state, restore the last-selected project filter (only if
// it still exists), render, then resolve the current path (so a direct
// /db/<slug> deep link opens the dashboard).
renderHomeSkeleton(); // synchronous first paint, replaced when render() runs
(async () => {
  try {
    state = await api('GET', '/state');
    const last = loadLastProject();
    currentProjectFilter = (last && state.projects[last]) ? last : '';
    render();
    route();
  } catch (e) { toast(e.message, true); }
})();
`;
