import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { sha1, toPosix, exists } from './util.js';
import { convertLegacyToPdf } from './office-convert.js';

const SCRIPT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'scripts', 'word-batch-to-pdf.ps1');

export function legacyPdfKey(absPath, stat) {
  return sha1(`${absPath.toLowerCase()}|${stat.mtimeMs}|${stat.size}`);
}

/** Legacy files that are missing from the cache or changed since it was built. */
export async function collectPendingLegacy(index, limit = 60, exclude = new Set()) {
  const manifest = await index.loadManifest();
  const files = await index.walk();
  const pending = [];
  for (const abs of files) {
    const ext = path.extname(abs).toLowerCase();
    if (ext !== '.doc' && ext !== '.rtf') continue;
    if (exclude.has(abs)) continue;
    const rel = toPosix(path.relative(index.root, abs));
    let stat;
    try {
      stat = await fs.stat(abs);
    } catch {
      continue;
    }
    const entry = manifest.files[rel];
    if (entry && !entry.err && entry.mtimeMs === stat.mtimeMs && entry.size === stat.size) continue;
    pending.push({ abs, rel, stat });
    if (pending.length >= limit) break;
  }
  return pending;
}

function runOnce(listPath, outDir, timeoutMs) {
  return new Promise((resolve) => {
    const child = spawn(
      'powershell.exe',
      ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', SCRIPT, '-ListPath', listPath, '-OutDir', outDir],
      { windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] },
    );
    let output = '';
    child.stdout.on('data', (chunk) => {
      output += chunk;
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
      if (timedOut) await new Promise((done) => setTimeout(done, 3000));
      resolve({ timedOut, output });
    });
  });
}

/**
 * Convert pending legacy Office files in batches, one Word session per batch.
 * A document that hangs is isolated by recursively splitting the batch; it is
 * reported as failed instead of blocking the rest of the library.
 */
export async function preconvertLegacy(index, items) {
  const dir = path.join(index.cacheDir, `legacy-pdf-${process.pid}-${Date.now()}`);
  await fs.mkdir(dir, { recursive: true });
  const entries = items.map((item) => ({
    src: item.abs,
    out: path.join(dir, `${legacyPdfKey(item.abs, item.stat)}.pdf`),
  }));
  let failed = [];
  let converted = 0;

  async function convert(chunk) {
    if (!chunk.length) return;
    const missing = chunk.filter((entry) => !exists(entry.out));
    if (!missing.length) return;
    if (missing.length > 10) {
      for (let i = 0; i < missing.length; i += 10) await convert(missing.slice(i, i + 10));
      return;
    }
    const listPath = path.join(dir, `batch-${Date.now()}-${Math.random().toString(16).slice(2)}.json`);
    await fs.writeFile(listPath, JSON.stringify(missing), 'utf8');
    const timeout = missing.length === 1 ? 45000 : 30000 + missing.length * 8000;
    const { timedOut } = await runOnce(listPath, dir, timeout);
    await fs.rm(listPath, { force: true }).catch(() => {});
    const after = missing.filter((entry) => !exists(entry.out));
    const done = missing.length - after.length;
    converted += done;
    if (!after.length) return;
    if (after.length === 1 || timedOut) {
      for (const entry of after) {
        if (exists(entry.out)) continue;
        if (after.length === 1) {
          failed.push({ src: entry.src, timedOut });
          return;
        }
      }
    }
    if (after.length <= 1) {
      if (!exists(after[0].out)) failed.push({ src: after[0].src, timedOut });
      return;
    }
    const mid = Math.ceil(after.length / 2);
    await convert(after.slice(0, mid));
    await convert(after.slice(mid));
  }

  await convert(entries);

  // 批量脚本失败时，逐个文件单独转换；只有单文件也失败才记为失败。
  if (failed.length) {
    const remaining = [];
    for (const item of failed) {
      const entry = entries.find((candidate) => candidate.src === item.src);
      if (!entry || exists(entry.out)) continue;
      try {
        const pdf = await convertLegacyToPdf(item.src, { timeoutMs: 90000 });
        await fs.writeFile(entry.out, pdf);
        converted += 1;
      } catch {
        remaining.push(item);
      }
    }
    failed = remaining;
  }

  return { dir, converted, failed, entries };
}
