import fs from "node:fs";
let p="lib/indexer.js"; let c=fs.readFileSync(p,"utf8");
const start=c.indexOf("  async _sync(options = {}) {");
const end=c.indexOf("  async readDoc(id) {", start);
if(start<0||end<0) throw new Error("sync block markers missing");
const method=`  async _sync(options = {}) {
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
    const candidates = [];

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
        const id = sha1(rel).slice(0, 20);
        const line = \`\${JSON.stringify({ k: 'name' })}\\t\${JSON.stringify(rel)}\`;
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
      candidates.push({ absPath, rel, ext, kind, stat });
    }

    const totalWork = candidates.length;
    let processed = 0;
    const report = () => {
      if (typeof options.onProgress !== 'function') return;
      options.onProgress({ documents: files.length, workTotal: totalWork, processed, pending, changed });
    };
    report();

    const processOne = async (item) => {
      const { absPath, rel, ext, kind, stat } = item;
      const id = sha1(rel).slice(0, 20);
      try {
        const result = await extractFile(absPath, ext, { maxFileMB: this.config.maxFileMB ?? 60 });
        const lines = result.blocks.map((block) => \`\${JSON.stringify(block.loc)}\\t\${JSON.stringify(block.text)}\`).join('\\n');
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
      } finally {
        processed += 1;
        report();
      }
    };

    const concurrency = Math.max(1, Math.min(8, Number(this.config.indexConcurrency ?? 3)));
    const isLegacy = (item) => item.ext === '.doc' || item.ext === '.ppt' || item.ext === '.rtf';
    const normal = candidates.filter((item) => !isLegacy(item));
    const legacy = candidates.filter(isLegacy);
    await runPool(normal, concurrency, processOne);
    for (const item of legacy) await processOne(item);

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
      workTotal,
      processed,
    };
  }

`;
c=c.slice(0,start)+method+c.slice(end);
// add runPool helper before class/export (after imports/constants)
const helper=`async function runPool(items, limit, worker) {
  let cursor = 0;
  const count = Math.max(1, Math.min(limit, items.length));
  const runners = Array.from({ length: count }, async () => {
    while (true) {
      const index = cursor;
      cursor += 1;
      if (index >= items.length) return;
      await worker(items[index]);
    }
  });
  await Promise.all(runners);
}

`;
const anchor="function extentOf(blocks) {";
if(!c.includes(anchor)) throw new Error("helper anchor missing");
c=c.replace(anchor, helper+anchor);
fs.writeFileSync(p,c,"utf8");
console.log("parallel sync + progress");
