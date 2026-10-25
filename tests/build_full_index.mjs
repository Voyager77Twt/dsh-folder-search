import path from 'node:path';
import { indexFor } from '../lib/indexer.js';
import { humanBytes } from '../lib/util.js';

const root = 'D:/AI/work/kw-search-mode/fixtures/选题';
const rgPath = 'D:/AI/deepseek-harness/DSH Desktop/resources/app.asar.unpacked/node_modules/@vscode/ripgrep-win32-x64/bin/rg.exe';
const config = {
  libraries: [root],
  rgPath,
  indexBudgetPerCall: 40,
  forceBudget: 400,
  maxFiles: 25,
  maxBlocksPerFile: 4,
  maxFileMB: 60,
  cacheCapMB: 300,
};
const index = indexFor(root, config);
let round = 0;
for (;;) {
  round += 1;
  const started = Date.now();
  const s = await index.sync({ budget: 40 });
  const secs = ((Date.now() - started) / 1000).toFixed(1);
  console.log(
    `${new Date().toLocaleTimeString('zh-CN')} round=${round} docs=${s.documents} ready=${s.ready} pending=${s.pending} failed=${s.failed} empty=${s.empty} changed=${s.changed} cache=${humanBytes(s.cacheBytes)} time=${secs}s`,
  );
  if (s.pending === 0) break;
  if (round > 200) {
    console.log('round limit');
    break;
  }
}
console.log('DONE', JSON.stringify(await index.stats()));
