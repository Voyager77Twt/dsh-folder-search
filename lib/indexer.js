import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { SUPPORTED, SKIP_DIRS, sha1, rootKey, ensureDir, resolveCacheRoot, toPosix, humanBytes, exists } from './util.js';
import { extractFile } from './extract.js';

const MANIFEST_VERSION = 1;

/** Coarse per-document extent used by library_outline. */
function extentOf(blocks) {
  const extent = { pages: 0, slides: 0, paragraphs: 0, lines: 0, sheets: [] };
  const sheets = new Set();
  for (const block of blocks) {
    const loc = block.loc || {};
    if (loc.k === 'pdf') extent.pages = Math.max(extent.pages, Number(loc.page) || 0);
    else if (loc.k === 'pptx') extent.slides = Math.max(extent.slides, Number(loc.slide) || 0);
    else if (loc.k === 'docx') extent.paragraphs = Math.max(extent.paragraphs, Number(loc.p) || 0);
    else if (loc.k === 'text') extent.lines = Math.max(extent.lines, Number(loc.line) || 0);
    else if (loc.k === 'xlsx' && loc.sheet) sheets.add(loc.sheet);
  }
  extent.sheets = [...sheets];
  return extent;
}

async function pathSize(dir) {
  let total = 0;
  let names = [];
  try {
    names = await fsp.readdir(dir, { withFileTypes: true });
  } catch {
    return 0;
  }
  for (const entry of names) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) total += await pathSize(full);
    else {
      try {
        total += (await fsp.stat(full)).size;
      } catch {
        /* ignore */
      }
    }
  }
  return total;
}

/** One library root's on-disk text cache plus its manifest. */
export class LibraryIndex {
  constructor(root, config = {}) {
    this.root = path.resolve(root);
    this.config = config;
    this.key = rootKey(this.root);
    this.cacheDir = path.join(resolveCacheRoot(config), `lib-${this.key}`);
    this.docsDir = path.join(this.cacheDir, 'docs');
    this.manifestPath = path.join(this.cacheDir, 'manifest.json');
    this.manifest = null;
    this._syncPromise = null;
  }

  get relative() {
    return this.root;
  }

  docPath(id) {
    return path.join(this.docsDir, `${id}.txt`);
  }

  async loadManifest() {
    if (this.manifest) return this.manifest;
    let manifest = null;
    try {
      manifest = JSON.parse(await fsp.readFile(this.manifestPath, 'utf8'));
    } catch {
      manifest = null;
    }
    if (!manifest || manifest.version !== MANIFEST_VERSION || manifest.root !== this.root) {
      manifest = { version: MANIFEST_VERSION, root: this.root, updatedAt: 0, files: {}, cacheBytes: 0 };
    }
    this.manifest = manifest;
    return manifest;
  }

  async saveManifest() {
    await ensureDir(this.cacheDir);
    const tmp = `${this.manifestPath}.tmp`;
    await fsp.writeFile(tmp, JSON.stringify(this.manifest), 'utf8');
    await fsp.rename(tmp, this.manifestPath);
  }

  async walk() {
    const files = [];
    const stack = [this.root];
    const rootLower = this.root.toLowerCase();
    const cacheLower = path.resolve(resolveCacheRoot(this.config)).toLowerCase();
    while (stack.length) {
      const dir = stack.pop();
      let entries = [];
      try {
        entries = await fsp.readdir(dir, { withFileTypes: true });
      } catch {
        continue;
      }
      for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isSymbolicLink()) continue;
        if (entry.isDirectory()) {
          if (entry.name.startsWith('.')) continue;
          if (SKIP_DIRS.has(entry.name)) continue;
          if (full.toLowerCase().startsWith(cacheLower)) continue;
          if (full.toLowerCase() === rootLower) continue;
          stack.push(full);
          continue;
        }
        if (!entry.isFile()) continue;
        if (entry.name.startsWith('~$')) continue;
        if (entry.name.endsWith('.partial')) continue;
        files.push(full);
      }
    }
    return files;
  }

  /** Refresh changed documents. `budget` limits extractions done by this call. */
  sync(options = {}) {
    if (this._syncPromise) return this._syncPromise;
    this._syncPromise = this._sync(options).finally(() => {
      this._syncPromise = null;
    });
    return this._syncPromise;
  }

  async _sync(options = {}) {
    const manifest = await this.loadManifest();
    const budgetConfig = Math.max(1, Number(this.config.indexBudgetPerCall ?? 25));
    let budget = Number.isFinite(options.budget) ? Math.max(0, Math.floor(options.budget)) : budgetConfig;
    if (options.force) budget = Math.max(budget, Number(this.config.forceBudget ?? 300));
    const force = options.force === true;

    await ensureDir(this.docsDir);
    const files = await this.walk();
    const seen = new Set();
    const errors = [];
    let pending = 0;
    let changed = 0;
    let libraryBytes = 0;

    for (const absPath of files) {
      const rel = toPosix(path.relative(this.root, absPath));
      seen.add(rel);
      let stat;
      try {
        stat = await fsp.stat(absPath);
      } catch {
        continue;
      }
      libraryBytes += stat.size;
      const previous = manifest.files[rel];
      const same = previous && previous.mtimeMs === stat.mtimeMs && previous.size === stat.size;
      if (same) continue;
      const ext = path.extname(absPath).toLowerCase();
      const kind = SUPPORTED.get(ext) ?? 'unknown';
      if (!SUPPORTED.has(ext)) {
        // 没有文本抽取器的文件（压缩包/图片/视频等）仍然登记文件名，便于按名字检索。
        const id = sha1(rel).slice(0, 20);
        const line = `${JSON.stringify({ k: 'name' })}\t${JSON.stringify(rel)}`;
        await fsp.writeFile(this.docPath(id), line, 'utf8');
        manifest.files[rel] = { id, kind: 'name', mtimeMs: stat.mtimeMs, size: stat.size, blocks: 1, chars: rel.length, sections: [], questions: [], extent: {} };
        changed += 1;
        continue;
      }
      if (budget <= 0) {
        pending += 1;
        continue;
      }
      budget -= 1;
      const id = sha1(rel).slice(0, 20);
      try {
        const result = await extractFile(absPath, ext, { maxFileMB: this.config.maxFileMB ?? 60 });
        const lines = result.blocks.map((block) => `${JSON.stringify(block.loc)}\t${JSON.stringify(block.text)}`).join('\n');
        await fsp.writeFile(this.docPath(id), lines, 'utf8');
        manifest.files[rel] = {
          id,
          kind: result.kind,
          mtimeMs: stat.mtimeMs,
          size: stat.size,
          blocks: result.blocks.length,
          chars: result.chars,
          sections: result.sections,
          questions: result.questions,
          extent: extentOf(result.blocks),
        };
        changed += 1;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        errors.push({ path: rel, message: message.slice(0, 200) });
        manifest.files[rel] = {
          id,
          kind,
          mtimeMs: stat.mtimeMs,
          size: stat.size,
          blocks: 0,
          chars: 0,
          err: message.slice(0, 200),
        };
      }
    }

    let removed = 0;
    for (const rel of Object.keys(manifest.files)) {
      if (seen.has(rel)) continue;
      const entry = manifest.files[rel];
      delete manifest.files[rel];
      removed += 1;
      if (entry?.id) {
        try {
          await fsp.unlink(this.docPath(entry.id));
        } catch {
          /* already gone */
        }
      }
    }

    manifest.updatedAt = Date.now();
    const cacheBytes = await pathSize(this.cacheDir);
    manifest.cacheBytes = cacheBytes;
    await this.saveManifest();
    const cacheCapMB = Number(this.config.cacheCapMB ?? 250);
    const capReached = cacheBytes > cacheCapMB * 1024 * 1024;
    const entries = Object.values(manifest.files);
    const ready = entries.filter((entry) => entry && !entry.err).length;
    const empty = entries.filter((entry) => entry && !entry.err && (entry.blocks ?? 0) === 0).length;
    return {
      root: this.root,
      documents: files.length,
      files,
      ready,
      empty,
      pending: pending + entries.filter((entry) => entry && entry.err).length,
      failed: entries.filter((entry) => entry && entry.err).length,
      changed,
      removed,
      errors,
      cacheBytes,
      cacheCapMB,
      capReached,
      libraryBytes,
      partial: pending > 0,
    };
  }

  async readDoc(id) {
    const text = await fsp.readFile(this.docPath(id), 'utf8');
    const blocks = [];
    for (const line of text.split('\n')) {
      if (!line) continue;
      const tab = line.indexOf('\t');
      if (tab < 0) continue;
      try {
        blocks.push({ loc: JSON.parse(line.slice(0, tab)), text: JSON.parse(line.slice(tab + 1)) });
      } catch {
        /* skip corrupt line */
      }
    }
    return blocks;
  }

  async docFor(input) {
    const manifest = await this.loadManifest();
    const absolute = path.resolve(input);
    let rel = toPosix(path.relative(this.root, absolute));
    if (rel.startsWith('../') || path.isAbsolute(rel)) {
      rel = toPosix(String(input).replace(/\\/g, '/')).replace(/^\/+/, '');
    }
    const entry = manifest.files[rel];
    if (!entry) return null;
    return { rel, entry, absPath: path.join(this.root, rel) };
  }

  async stats() {
    const manifest = await this.loadManifest();
    const entries = Object.values(manifest.files);
    return {
      root: this.root,
      cacheDir: this.cacheDir,
      cacheBytes: manifest.cacheBytes ?? 0,
      documents: entries.length,
      ready: entries.filter((entry) => !entry.err).length,
      failed: entries.filter((entry) => entry.err).length,
      updatedAt: manifest.updatedAt,
    };
  }
}

const indexes = new Map();

/** Process-wide cache so repeated calls do not re-open the manifest. */
export function indexFor(root, config = {}) {
  const key = `${path.resolve(root).toLowerCase()}|${resolveCacheRoot(config)}`;
  let index = indexes.get(key);
  if (!index) {
    index = new LibraryIndex(root, config);
    indexes.set(key, index);
  } else {
    index.config = config;
  }
  return index;
}

export { humanBytes, exists };
