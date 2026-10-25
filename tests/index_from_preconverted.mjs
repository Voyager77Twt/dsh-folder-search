import path from 'node:path';
import fs from 'node:fs/promises';
import { indexFor } from '../lib/indexer.js';
import { humanBytes } from '../lib/util.js';

const root = 'D:/AI/work/kw-search-mode/fixtures/选题';
const legacyDir = path.join(process.env.LOCALAPPDATA ?? '', 'dsh-library-search', 'legacy-pdf-build');
const config = {
  libraries: [root],
  rgPath: 'D:/AI/deepseek-harness/DSH Desktop/resources/app.asar.unpacked/node_modules/@vscode/ripgrep-win32-x64/bin/rg.exe',
  indexBudgetPerCall: 50,
  forceBudget: 200,
  maxFiles: 25,
  maxBlocksPerFile: 4,
  maxFileMB: 60,
  cacheCapMB: 300,
};
process.env.DSH_LIBSEARCH_LEGACY_PDF_DIR = legacyDir;
process.env.DSH_LIBSEARCH_LEGACY_STRICT = '1';
const index = indexFor(root, config);
const deadline = Date.now() + 45 * 60 * 1000;
let round = 0;
for (;;) {
  round += 1;
  const started = Date.now();
  const s = await index.sync({ budget: 50 });
  console.log(
    `${new Date().toLocaleTimeString('zh-CN')} round=${round} docs=${s.documents} ready=${s.ready} failed=${s.failed} empty=${s.empty} pending=${s.pending} changed=${s.changed} cache=${humanBytes(s.cacheBytes)} time=${((Date.now() - started) / 1000).toFixed(1)}s`,
  );
  if (s.pending === s.failed || s.pending === 0) break;
  if (Date.now() > deadline) {
    console.log('deadline');
    break;
  }
}
const stats = await index.stats();
console.log('DONE', JSON.stringify(stats));
await fs.rm(legacyDir, { recursive: true, force: true }).catch(() => {});
console.log('legacy pdf temp removed');
