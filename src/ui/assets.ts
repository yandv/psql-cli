import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// The SPA payloads live as real files under ./web/ (so editors/tooling treat
// them as HTML/CSS/JS). They are copied into dist/ui/web/ at build time by
// scripts/copy-web.mjs. assets.ts compiles to dist/ui/assets.js, so the
// relative './web/' URL resolves to dist/ui/web/ at runtime.
const dir = fileURLToPath(new URL('./web/', import.meta.url));

export const INDEX_HTML = readFileSync(dir + 'index.html', 'utf8');
export const STYLES_CSS = readFileSync(dir + 'styles.css', 'utf8');
export const APP_JS = readFileSync(dir + 'app.js', 'utf8');
