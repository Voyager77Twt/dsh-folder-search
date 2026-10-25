import fs from 'node:fs/promises';
import path from 'node:path';
import { zipSync, unzipSync, strToU8, strFromU8 } from 'fflate';
import { isInside } from './util.js';

const FORMAT = 'dsh-library-search-index';
const VERSION = 1;
const MAX_PACKAGE_BYTES = 2 * 1024 * 1024 * 1024;

/** Bundle the local text cache into a portable zip (no absolute paths). */
export async function exportIndexPackage(index, outputPath) {
  const manifest = await index.loadManifest();
  const stats = await index.stats();
  const entries = {};
  const packagedFiles = {};
  for (const [rel, entry] of Object.entries(manifest.files)) {
    if (!entry?.id) continue;
    try {
      entries[`docs/${entry.id}.txt`] = new Uint8Array(await fs.readFile(index.docPath(entry.id)));
      packagedFiles[rel] = entry;
    } catch {
      /* missing cache file: skip this document */
    }
  }
  const meta = {
    format: FORMAT,
    version: VERSION,
    createdAt: new Date().toISOString(),
    rootName: path.basename(index.root),
    documents: Object.keys(packagedFiles).length,
    cacheBytes: stats.cacheBytes,
    files: packagedFiles,
  };
  entries['index.json'] = strToU8(JSON.stringify(meta));
  const data = Buffer.from(zipSync(entries, { level: 6 }));
  const target = path.resolve(outputPath);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, data);
  return { path: target, bytes: data.length, documents: stats.documents, cacheBytes: stats.cacheBytes };
}

/**
 * Import a shared index zip. Each entry is validated against the local files;
 * mismatched or missing files are dropped. `dryRun` reports without writing.
 * verify: 'mtime' (size + modification time, default), 'size', or 'none'.
 */
export async function importIndexPackage(index, packagePath, options = {}) {
  const verify = options.verify === 'size' || options.verify === 'none' ? options.verify : 'mtime';
  const dryRun = options.dryRun === true;
  const buf = await fs.readFile(packagePath);
  if (buf.length > MAX_PACKAGE_BYTES) throw new Error('索引包超过 2 GB 上限');
  let entries;
  try {
    entries = unzipSync(new Uint8Array(buf));
  } catch {
    throw new Error('不是有效的索引包 zip');
  }
  const metaRaw = entries['index.json'];
  if (!metaRaw) throw new Error('索引包缺少 index.json');
  let meta;
  try {
    meta = JSON.parse(strFromU8(metaRaw));
  } catch {
    throw new Error('索引包 index.json 无法解析');
  }
  if (meta.format !== FORMAT || meta.version !== VERSION) throw new Error('索引包格式/版本不匹配');
  const files = meta.files && typeof meta.files === 'object' ? meta.files : {};
  if (Object.keys(files).length > 5000) throw new Error('索引包文件条目过多');

  const kept = {};
  let dropped = 0;
  let copiedBytes = 0;
  for (const [rel, entry] of Object.entries(files)) {
    if (!entry || typeof entry !== 'object') {
      dropped += 1;
      continue;
    }
    const abs = path.resolve(index.root, rel);
    if (!isInside(index.root, abs)) {
      dropped += 1;
      continue;
    }
    let stat;
    try {
      stat = await fs.stat(abs);
    } catch {
      dropped += 1;
      continue;
    }
    let matches = verify === 'none';
    if (verify === 'size') matches = stat.size === entry.size;
    if (verify === 'mtime') matches = stat.size === entry.size && Math.abs(stat.mtimeMs - Number(entry.mtimeMs ?? 0)) <= 2000;
    if (!matches) {
      dropped += 1;
      continue;
    }
    const id = String(entry.id ?? '');
    const data = entries[`docs/${id}.txt`];
    if (!/^[a-f0-9]{20}$/.test(id) || !data) {
      dropped += 1;
      continue;
    }
    if (!dryRun) {
      await fs.mkdir(index.docsDir, { recursive: true });
      await fs.writeFile(index.docPath(id), Buffer.from(data));
    }
    kept[rel] = entry;
    copiedBytes += data.length;
  }

  if (!dryRun) {
    const manifest = await index.loadManifest();
    const keepIds = new Set(Object.values(kept).map((entry) => entry.id));
    let names = [];
    try {
      names = await fs.readdir(index.docsDir);
    } catch {
      names = [];
    }
    for (const name of names) {
      const id = name.replace(/\.txt$/, '');
      if (!keepIds.has(id)) await fs.rm(path.join(index.docsDir, name), { force: true }).catch(() => {});
    }
    manifest.files = kept;
    manifest.updatedAt = Date.now();
    manifest.cacheBytes = copiedBytes;
    await index.saveManifest();
  }

  return {
    package: path.resolve(packagePath),
    verify,
    dryRun,
    total: Object.keys(files).length,
    kept: Object.keys(kept).length,
    dropped,
    missing: dropped,
    cacheBytes: copiedBytes,
    rootName: meta.rootName,
  };
}
