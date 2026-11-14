import fs from "node:fs";
let p="lib/settings-host.js"; let c=fs.readFileSync(p,"utf8");
const old=`    for (const root of job.libraryRoots) {
      if (job.cancelled) break;
      const result = await buildRoot(job, root, dirs);
      aggregate.documents += result.documents ?? 0;`;
const neu=`    for (const root of job.libraryRoots) {
      if (job.cancelled) break;
      let result;
      try {
        result = await buildRoot(job, root, dirs);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        aggregate.errors.push({ library: root, message });
        job.last = { ...aggregate, phase: 'sync', libraryCurrent: root };
        continue;
      }
      aggregate.documents += result.documents ?? 0;`;
if(!c.includes(old)) throw new Error('build loop marker');
c=c.replace(old,neu);
fs.writeFileSync(p,c,"utf8");
console.log("per-root build error isolation");
