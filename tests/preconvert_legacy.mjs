import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { sha1, toPosix, exists } from '../lib/util.js';
import { indexFor } from '../lib/indexer.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = 'D:/AI/work/kw-search-mode/fixtures/选题';
const cacheDir = path.join(process.env.LOCALAPPDATA ?? '', 'dsh-library-search');
const outDir = path.join(cacheDir, 'legacy-pdf-build');
const config = { libraries: [root], cacheDir, indexBudgetPerCall: 40, maxFileMB: 60 };

await fsp.rm(outDir, { recursive: true, force: true });
await fsp.mkdir(outDir, { recursive: true });

const index = indexFor(root, config);
const manifest = await index.loadManifest();
const done = new Set(Object.keys(manifest.files));

async function walk(dir, out = []) {
  for (const entry of await fsp.readdir(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('~$')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(full, out);
      continue;
    }
    const ext = path.extname(entry.name).toLowerCase();
    if ((ext === '.doc' || ext === '.rtf') && entry.isFile()) out.push(full);
  }
  return out;
}

const files = await walk(root);
const items = [];
for (const full of files) {
  const rel = toPosix(path.relative(root, full));
  if (done.has(rel)) continue;
  const stat = await fsp.stat(full);
  const key = sha1(`${full.toLowerCase()}|${stat.mtimeMs}|${stat.size}`);
  items.push({ src: full, out: path.join(outDir, `${key}.pdf`) });
}
const listPath = path.join(outDir, 'list.json');
await fsp.writeFile(listPath, JSON.stringify(items), 'utf8');
console.log(`legacy files to convert: ${items.length} (already indexed skipped: ${files.length - items.length})`);

if (!items.length) process.exit(0);

const script = path.join(here, 'word-batch-pdf.ps1');
const started = Date.now();
const child = spawn(
  'powershell.exe',
  ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', script, '-ListPath', listPath, '-OutDir', outDir],
  { windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] },
);
let stdout = '';
let stderr = '';
child.stdout.on('data', (chunk) => {
  stdout += chunk;
  process.stdout.write(chunk);
});
child.stderr.on('data', (chunk) => {
  stderr += chunk;
});
const timer = setTimeout(() => {
  console.error('batch conversion timeout, killing');
  spawn('taskkill', ['/PID', String(child.pid), '/T', '/F'], { windowsHide: true });
}, 60 * 60 * 1000);
child.on('close', async (code) => {
  clearTimeout(timer);
  const pdfs = (await fsp.readdir(outDir)).filter((name) => name.endsWith('.pdf'));
  console.log(`batch done code=${code} time=${((Date.now() - started) / 1000).toFixed(1)}s pdfs=${pdfs.length}`);
  if (stderr) console.log('stderr:', stderr.slice(0, 1000));
  if (!exists(path.join(outDir, 'errors.json'))) console.log('(no errors.json)');
});
