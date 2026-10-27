import fs from "node:fs";
let p="lib/indexer.js"; let c=fs.readFileSync(p,"utf8");
const old=`    const totalWork = candidates.length;
    let processed = 0;
    const report = () => {
      if (typeof options.onProgress !== 'function') return;
      options.onProgress({ documents: files.length, workTotal: totalWork, processed, pending, changed });
    };
    report();`;
const neu=`    const totalWork = candidates.length;
    let processed = 0;
    const report = () => {
      if (typeof options.onProgress !== 'function') return;
      const entries = Object.values(manifest.files);
      const ready = entries.filter((entry) => entry && !entry.err).length;
      const failed = entries.filter((entry) => entry && entry.err).length;
      options.onProgress({
        documents: files.length,
        ready,
        failed,
        pending: Math.max(0, files.length - ready - failed),
        changed,
      });
    };
    report();`;
if(!c.includes(old)) throw new Error('progress block missing');
c=c.replace(old,neu);
fs.writeFileSync(p,c,"utf8");
console.log("overall progress");
