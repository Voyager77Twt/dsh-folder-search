import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { load as yamlLoad } from "js-yaml";
import { apply } from "../lib/index.js";
import { indexFor } from "../lib/indexer.js";
import { searchLibrary, renderSearchResult } from "../lib/search.js";
import { loadSettings, DEFAULT_SETTINGS } from "../lib/settings-store.js";

const root = "D:/AI/work/kw-search-mode";
const lib = root + "/fixtures/选题";
const failures = [];
const notes = [];
const ok = (condition, label) => { if (!condition) failures.push(label); else notes.push("PASS " + label); };

// 1 syntax
for (const file of fs.readdirSync(root + "/lib").filter((f) => f.endsWith(".js"))) {
  try { execFileSync("node", ["--check", root + "/lib/" + file], { stdio: "pipe" }); }
  catch { failures.push("syntax lib/" + file); }
}
ok(true, "lib/*.js syntax");

// 2 package
const pkg = JSON.parse(fs.readFileSync(root + "/package.json", "utf8"));
ok(pkg.name === "dsh-folder-search", "package.name");
ok(pkg.version === "0.5.32", "package.version 0.5.32");
ok(pkg.dsh?.bundle?.patch === "./cordis.patch.yml", "dsh.bundle.patch");
ok(pkg.dsh?.client?.platform === "web", "dsh.client web");
ok(pkg.exports?.["./client"] && pkg.exports?.["./settings-host"], "exports client/settings-host");

// 3 patch
const patch = yamlLoad(fs.readFileSync(root + "/cordis.patch.yml", "utf8"));
ok(Array.isArray(patch) && patch.length === 2, "patch has 2 inserts");
const rows = patch.flatMap((entry) => entry.insert || []);
const preset = rows.find((row) => row.id === "preset-folder-search");
const host = rows.find((row) => row.id === "folder-search-settings-host");
ok(Boolean(preset), "preset row present");
ok(preset?.config?.name === "本地文件夹检索模式", "preset display name");
ok(preset?.config?.id === "folder-search", "preset config id");
ok(Boolean(host), "settings host row present");
ok(host?.config?.settingsOnly === true, "settingsOnly true");

// 4 keys + UI/static
const keys = Object.keys(DEFAULT_SETTINGS);
ok(keys.length === 33, "33 settings keys, got " + keys.length);
const searchText = fs.readFileSync(root + "/lib/search.js", "utf8") + fs.readFileSync(root + "/lib/outline.js", "utf8") + fs.readFileSync(root + "/lib/index.js", "utf8") + fs.readFileSync(root + "/lib/settings-host.js", "utf8");
const clientText = fs.readFileSync(root + "/lib/client.js", "utf8");
const missingSearch = keys.filter((key) => !searchText.includes("settings." + key) && !searchText.includes("settings?." + key));
const missingClient = keys.filter((key) => !clientText.includes(key));
ok(missingSearch.length === 0, "all settings used by search: " + missingSearch.join(","));
ok(missingClient.length === 0, "all settings present in client: " + missingClient.join(","));
ok(clientText.includes("id: 'dsh-folder-search'"), "client loader id");
ok(clientText.includes("'/api/dsh-folder-search/settings'"), "client API path");
ok(fs.readFileSync(root + "/lib/settings-host.js", "utf8").includes("'/api/dsh-folder-search/settings'"), "host route path");

// 5 tool registration and settings route mock
const tools = []; const routes = [];
const webServer = { register: (route) => { routes.push(route); return () => {}; } };
const ctx = { tools: { register: (def) => { tools.push(def); return () => {}; } }, get: (name) => name === 'webServer' ? webServer : undefined, effect: (fn) => fn(), logger: () => ({ info(){}, warn(){} }) };
apply(ctx, { libraries: [lib] });
ok(tools.length === 8, "8 tools registered, got " + tools.length);
ok(routes.length === 0, "preset does not register settings route");
apply(ctx, { settingsOnly: true });
ok(routes.length === 2 && routes.map((r) => r.path).includes('/api/dsh-folder-search/settings') && routes.map((r) => r.path).includes('/api/dsh-folder-search/index'), "settings host registers settings + index routes");

// 6 search static behavior
const cfg = { libraries: [lib], rgPath: "D:/AI/deepseek-harness/DSH Desktop/resources/app.asar.unpacked/node_modules/@vscode/ripgrep-win32-x64/bin/rg.exe", associations: { 沉淀溶解平衡: ["溶度积", "Ksp", "难溶电解质", "沉淀转化"] } };
const settings = await loadSettings();
const idx = indexFor(lib, cfg);
const baseArgs = { keywords: ["侯氏制碱法"], strongTerms: ["侯德榜"], generalTerms: ["联合制碱", "索尔维", "碳酸钠"], refresh: "never" };
for (const dedupe of [true, false]) {
  const r = await searchLibrary(idx, baseArgs, cfg, { ...settings, dedupe });
  ok(r.files.length === r.totals.shownFiles, "shownFiles matches files dedupe=" + dedupe);
  ok(r.totals.directFiles + r.totals.expandedFiles + r.totals.relatedFiles === r.totals.files, "category totals sum dedupe=" + dedupe);
  const text = renderSearchResult(r);
  ok(text.includes("**直接命中（原词）**") && text.includes("**自动扩展命中**") && text.includes("**强关联命中**"), "three sections dedupe=" + dedupe);
  if (dedupe) ok(r.files.filter((f) => f.directKeywords?.length).length === r.totals.directFiles, "direct files not lost");
}
const custom = await searchLibrary(idx, { keywords: ["沉淀溶解平衡"], refresh: "never" }, cfg, { ...settings, associationLimit: 2, customAssociations: { 沉淀溶解平衡: ["Ksp"] } });
ok(JSON.stringify(custom.query.expanded["沉淀溶解平衡"]) === JSON.stringify(["沉淀溶解平衡", "Ksp", "溶度积"]), "custom term priority");
const final10 = await searchLibrary(idx, { keywords: ["沉淀溶解平衡"], refresh: "never" }, cfg, { ...settings, finalMaxFiles: 10, dedupe: false });
ok(final10.files.length === 10 && final10.files.every((f) => (f.directKeywords?.length ?? 0) > 0), "finalMax keeps direct first");

console.log(JSON.stringify({ ok: failures.length === 0, failures, passCount: notes.length, notes }, null, 2));

