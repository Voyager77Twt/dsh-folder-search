import fs from "node:fs";
let p="lib/settings-host.js"; let c=fs.readFileSync(p,"utf8");
c=c.replace("import { loadSettings, saveSettings, DEFAULT_SETTINGS } from './settings-store.js';","import fs from 'node:fs/promises';\nimport path from 'node:path';\nimport { loadSettings, saveSettings, DEFAULT_SETTINGS } from './settings-store.js';\nimport { resolveCacheRoot } from './util.js';");
const helper=`export async function migrateCacheRoots(fromSetting, toSetting) {
  const from = path.resolve(resolveCacheRoot({ cacheDir: fromSetting || undefined }));
  const to = path.resolve(resolveCacheRoot({ cacheDir: toSetting || undefined }));
  if (from.toLowerCase() === to.toLowerCase()) return null;
  let entries = [];
  try {
    entries = await fs.readdir(from, { withFileTypes: true });
  } catch {
    return { from, to, moved: 0, skipped: 0 };
  }
  await fs.mkdir(to, { recursive: true });
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
  return { from, to, moved, skipped };
}

`;
if(!c.includes("export async function migrateCacheRoots")) c=c.replace("async function readJson(request) {", helper+"async function readJson(request) {");
c=c.replace("          const body = await readJson(request);\n          const settings = await saveSettings(body?.settings ?? body ?? {});\n          send(response, 200, { settings, defaults: DEFAULT_SETTINGS });",
"          const body = await readJson(request);\n          const before = await loadSettings();\n          const requested = body?.settings ?? body ?? {};\n          const nextCache = typeof requested.cacheDir === 'string' ? requested.cacheDir.trim() : before.cacheDir;\n          const migration = nextCache === before.cacheDir ? null : await migrateCacheRoots(before.cacheDir, nextCache);\n          const settings = await saveSettings(requested);\n          send(response, 200, { settings, defaults: DEFAULT_SETTINGS, migration });");
fs.writeFileSync(p,c,"utf8");
console.log("auto migration");
