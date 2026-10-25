import fs from "node:fs";
function patch(file, pairs){
  let c=fs.readFileSync(file,"utf8");
  for(const [a,b] of pairs){ if(!c.includes(a)){ console.log("MISS "+file+": "+a.split("\n")[0]); continue; } c=c.split(a).join(b); }
  fs.writeFileSync(c.trimEnd()+"\n" === c ? c : c, "utf8");
}
// export bug: build meta.files from successfully added docs
let p="lib/index-package.js"; let c=fs.readFileSync(p,"utf8");
c=c.replace(`  const meta = {
    format: FORMAT,
    version: VERSION,
    createdAt: new Date().toISOString(),
    rootName: path.basename(index.root),
    documents: stats.documents,
    cacheBytes: stats.cacheBytes,
    files: manifest.files,
  };
  const entries = { 'index.json': strToU8(JSON.stringify(meta)) };
  for (const [rel, entry] of Object.entries(manifest.files)) {
    if (!entry?.id) continue;
    try {
      entries[\`docs/\${entry.id}.txt\`] = new Uint8Array(await fs.readFile(index.docPath(entry.id)));
    } catch {
      /* missing cache file: keep the entry out of the package */
      delete entries[rel];
    }
  }`, `  const entries = {};
  const packagedFiles = {};
  for (const [rel, entry] of Object.entries(manifest.files)) {
    if (!entry?.id) continue;
    try {
      entries[\`docs/\${entry.id}.txt\`] = new Uint8Array(await fs.readFile(index.docPath(entry.id)));
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
  entries['index.json'] = strToU8(JSON.stringify(meta));`);
fs.writeFileSync(p,c,"utf8");
// strict legacy skip
p="lib/extract.js"; c=fs.readFileSync(p,"utf8");
c=c.replace(`      const pdfBuffer = await convertLegacyToPdf(absPath, { timeoutMs: options.convertTimeoutMs ?? 90000 });`,
`      if (legacyDir && process.env.DSH_LIBSEARCH_LEGACY_STRICT === '1') {
        throw new Error('旧版文档批量预转换失败，已跳过');
      }
      const pdfBuffer = await convertLegacyToPdf(absPath, { timeoutMs: options.convertTimeoutMs ?? 90000 });`);
fs.writeFileSync(p,c,"utf8");
console.log("patched");
