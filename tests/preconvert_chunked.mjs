import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(process.env.LOCALAPPDATA ?? '', 'dsh-library-search', 'legacy-pdf-build');
const listPath = path.join(outDir, 'list.json');
const script = path.join(here, 'word-batch-pdf.ps1');
const items = JSON.parse(await fsp.readFile(listPath, 'utf8')).filter((item) => !fs.existsSync(item.out));
console.log('remaining to convert:', items.length);

let converted = 0;
const failed = [];

function runChunk(chunk, timeoutMs) {
  return new Promise(async (resolve) => {
    const chunkList = path.join(outDir, `chunk-${Date.now()}-${Math.random().toString(16).slice(2)}.json`);
    await fsp.writeFile(chunkList, JSON.stringify(chunk), 'utf8');
    const child = spawn(
      'powershell.exe',
      ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', script, '-ListPath', chunkList, '-OutDir', outDir],
      { windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] },
    );
    let output = '';
    child.stdout.on('data', (chunkData) => {
      output += chunkData;
    });
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      try {
        spawn('taskkill', ['/PID', String(child.pid), '/T', '/F'], { windowsHide: true });
      } catch {
        /* ignore */
      }
      try {
        spawn('taskkill', ['/IM', 'WINWORD.EXE', '/F'], { windowsHide: true });
      } catch {
        /* ignore */
      }
    }, timeoutMs);
    child.on('close', async () => {
      clearTimeout(timer);
      if (timedOut) await new Promise((resolve) => setTimeout(resolve, 3000));
      await fsp.rm(chunkList, { force: true }).catch(() => {});
      resolve({ timedOut, output });
    });
  });
}

async function convert(chunk) {
  if (!chunk.length) return;
  if (chunk.length > 10) {
    for (let i = 0; i < chunk.length; i += 10) {
      await convert(chunk.slice(i, i + 10));
    }
    return;
  }
  const stillMissing = chunk.filter((item) => !fs.existsSync(item.out));
  if (!stillMissing.length) return;
  if (stillMissing.length === 1) {
    const timeout = 45000;
    const { timedOut } = await runChunk(stillMissing, timeout);
    if (!fs.existsSync(stillMissing[0].out)) {
      failed.push({ src: stillMissing[0].src, timedOut });
      console.log('FAILED', path.basename(stillMissing[0].src), timedOut ? '(timeout)' : '');
    } else {
      converted += 1;
    }
    return;
  }
  const timeout = 20000 + stillMissing.length * 4000;
  const { timedOut } = await runChunk(stillMissing, timeout);
  const missingAfter = stillMissing.filter((item) => !fs.existsSync(item.out));
  for (const item of stillMissing) if (!missingAfter.includes(item)) converted += 1;
  console.log(`chunk=${stillMissing.length} done=${stillMissing.length - missingAfter.length} missingAfter=${missingAfter.length}${timedOut ? ' timeout' : ''}`);
  if (!missingAfter.length) return;
  if (timedOut) {
    const stuck = missingAfter[0];
    failed.push({ src: stuck.src, timedOut: true });
    console.log('SKIP', path.basename(stuck.src));
    await convert(missingAfter.slice(1));
    return;
  }
  const mid = Math.ceil(missingAfter.length / 2);
  await convert(missingAfter.slice(0, mid));
  await convert(missingAfter.slice(mid));
}

await convert(items);
console.log('converted this run:', converted, 'failed:', failed.length);
if (failed.length) console.log(JSON.stringify(failed, null, 2));
