import fs from "node:fs";
let p="lib/settings-host.js"; let c=fs.readFileSync(p,"utf8");
const old=`  await fs.mkdir(to, { recursive: true });
  let moved = 0;
  let skipped = 0;
  for (const entry of entries) {
    if (!entry.isDirectory() || !entry.name.startsWith('lib-')) continue;
    const source = path.join(from, entry.name);
    const target = path.join(to, entry.name);
    if (await fs.stat(target).then(() => true).catch(() => false)) {
      skipped += 1;
      continue;
    }
    await fs.cp(source, target, { recursive: true });
    moved += 1;
  }
  return { from, to, moved, skipped };`;
const neu=`  await fs.mkdir(to, { recursive: true });
  let moved = 0;
  let skipped = 0;
  const copiedSources = [];
  for (const entry of entries) {
    if (!entry.isDirectory() || !entry.name.startsWith('lib-')) continue;
    const source = path.join(from, entry.name);
    const target = path.join(to, entry.name);
    if (await fs.stat(target).then(() => true).catch(() => false)) {
      skipped += 1;
      continue;
    }
    await fs.cp(source, target, { recursive: true });
    copiedSources.push(source);
    moved += 1;
  }
  let removed = 0;
  const removeFailed = [];
  for (const source of copiedSources) {
    try {
      await fs.rm(source, { recursive: true, force: true });
      removed += 1;
    } catch (error) {
      removeFailed.push(path.basename(source));
    }
  }
  return { from, to, moved, skipped, removed, removeFailed };`;
if(!c.includes(old)) throw new Error('migration copy block marker missing');
c=c.replace(old,neu);
fs.writeFileSync(p,c,"utf8");
console.log("migration delete old");
