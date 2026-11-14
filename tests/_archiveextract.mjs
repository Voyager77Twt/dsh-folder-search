import fs from "node:fs";
let p="lib/extract.js"; let c=fs.readFileSync(p,"utf8");
c=c.replace("import fs from 'node:fs/promises';\nimport path from 'node:path';","import fs from 'node:fs/promises';\nimport os from 'node:os';\nimport path from 'node:path';");
c=c.replace("    maxTextChars: num(security.maxTextMB, 20, 1, 200) * 1024 * 1024,","    maxTextChars: num(security.maxTextMB, 20, 1, 200) * 1024 * 1024,\n    archiveMaxDepth: num(security.archiveMaxDepth, 2, 1, 10),\n    archiveTreeMaxEntries: num(security.archiveTreeMaxEntries, 10000, 100, 100000),\n    archiveTreeMaxBytes: num(security.archiveTreeMaxMB, 1024, 32, 8192) * 1024 * 1024,");
c=c.replace("    text: (name) => (files[name] ? strFromU8(files[name]) : null),\n  };","    text: (name) => (files[name] ? strFromU8(files[name]) : null),\n    entry: (name) => files[name] || null,\n  };");
// Insert extractArchive before extractPdf section
const marker="/* ------------------------------------------------------------------- pdf */";
const archive=`/* ------------------------------------------------------------------ zip */
async function extractArchive(buf, options = {}) {
  const limits = securityLimits(options);
  const budget = options.archiveBudget || { entries: 0, totalBytes: 0 };
  const depth = Number(options.archiveDepth ?? 1);
  if (depth > limits.archiveMaxDepth) return finalize('zip', [], undefined, options);
  const zip = openZip(buf, options);
  const names = zip.names();
  if (budget.entries + names.length > limits.archiveTreeMaxEntries) throw new Error('安全限制：嵌套压缩包条目过多');
  budget.entries += names.length;
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'dsh-folder-search-archive-'));
  const blocks = [];
  try {
    let index = 0;
    for (const name of names) {
      if (!name || name.endsWith('/')) continue;
      const ext = path.extname(name).toLowerCase();
      if (!SUPPORTED.has(ext)) continue;
      const data = zip.entry(name);
      if (!data) continue;
      if (budget.totalBytes + data.byteLength > limits.archiveTreeMaxBytes) throw new Error('安全限制：嵌套压缩包解压体积过大');
      budget.totalBytes += data.byteLength;
      const safeExt = SUPPORTED.has(ext) ? ext : '.bin';
      const memberPath = path.join(tmp, String(index++) + safeExt);
      await fs.writeFile(memberPath, data);
      try {
        const result = await extractFile(memberPath, safeExt, { ...options, archiveDepth: depth + 1, archiveBudget: budget });
        const member = String(name).replace(/\\\\/g, '/').slice(0, 240);
        for (const block of result.blocks || []) blocks.push({ ...block, loc: { ...block.loc, member } });
      } catch {
        // A single bad member does not invalidate the rest of the archive.
      }
    }
    return finalize('zip', blocks, undefined, options);
  } finally {
    await fs.rm(tmp, { recursive: true, force: true }).catch(() => {});
  }
}

/* ------------------------------------------------------------------- pdf */`;
if(!c.includes(marker)) throw new Error('pdf marker'); c=c.replace(marker,archive);
// Add zip case in switch
c=c.replace("    case 'text':\n      return extractTextFile(buf, options);","    case 'zip':\n      return extractArchive(buf, options);\n    case 'text':\n      return extractTextFile(buf, options);");
// Add kind labels in search.js later
fs.writeFileSync(p,c,"utf8");
console.log("archive extractor");
