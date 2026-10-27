import fs from "node:fs/promises";
import fssync from "node:fs";
import os from "node:os";
import path from "node:path";
import http from "node:http";
import { apply } from "../lib/settings-host.js";
import { settingsPath } from "../lib/settings-store.js";

const root = await fs.mkdtemp(path.join(os.tmpdir(), "folder-search-index-test-"));
const library = path.join(root, "library");
const cache = path.join(root, "cache");
await fs.mkdir(library, { recursive: true });
await fs.writeFile(path.join(library, "a.txt"), "侯氏制碱法 测试一\n", "utf8");
await fs.writeFile(path.join(library, "b.txt"), "侯氏制碱法 测试二\n", "utf8");
const backupPath = settingsPath() + ".audit-backup";
let backup = null;
try { backup = await fs.readFile(settingsPath()); await fs.writeFile(backupPath, backup); } catch {}
const routes = [];
const ctx = { get: (name) => name === "webServer" ? { register: (route) => { routes.push(route); return () => {}; } } : undefined, effect: (fn) => fn() };
apply(ctx);
const settingsRoute = routes.find((r) => r.path.endsWith("/settings"));
const indexRoute = routes.find((r) => r.path.endsWith("/index"));
const server = http.createServer((req, res) => (req.url.includes("/settings") ? settingsRoute : indexRoute).handler(req, res));
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const port = server.address().port;
const base = `http://127.0.0.1:${port}`;
const settings = JSON.parse(await fs.readFile(settingsPath(), "utf8"));
const post = await fetch(base + "/api/dsh-folder-search/settings", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ settings: { ...settings, libraryRoot: library, cacheDir: cache } }) });
const postBody = await post.json();
let status = null;
for (let i = 0; i < 30; i += 1) {
  const r = await fetch(base + "/api/dsh-folder-search/index");
  status = (await r.json()).status;
  if (!status.running && status.documents > 0 && status.pending === 0) break;
  await new Promise((resolve) => setTimeout(resolve, 250));
}
console.log(JSON.stringify({ postStatus: post.status, buildQueued: postBody.buildQueued, status }, null, 2));
server.close();
if (backup) await fs.writeFile(settingsPath(), backup); else await fs.rm(settingsPath(), { force: true });
await fs.rm(root, { recursive: true, force: true });
await fs.rm(backupPath, { force: true });
