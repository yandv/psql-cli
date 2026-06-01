// Copy the SPA payload files (index.html, styles.css, app.js) from src/ui/web
// into dist/ui/web so that dist/ui/assets.js can readFileSync them at runtime.
// tsc does not copy non-.ts files, so this runs after the TypeScript build.
// Dependency-free: uses only node:fs / node:url.
import { mkdirSync, copyFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const srcDir = root + 'src/ui/web/';
const outDir = root + 'dist/ui/web/';

mkdirSync(outDir, { recursive: true });

for (const file of ['index.html', 'styles.css', 'app.js']) {
  copyFileSync(srcDir + file, outDir + file);
}

console.log('copy-web: copied index.html, styles.css, app.js -> dist/ui/web/');
