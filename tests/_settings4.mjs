import fs from "node:fs";
let p="lib/settings-host.js"; let c=fs.readFileSync(p,"utf8");
c=c.replace("export function apply(ctx) {\n  const web = ctx.get('webServer');\n  if (!web || typeof web.register !== 'function') return;\n  ctx.effect(() =>", "export function registerSettingsRoute(ctx) {\n  const web = ctx.get('webServer');\n  if (!web || typeof web.register !== 'function') return;\n  return ctx.effect(() =>");
c=c.replace("\n}\n", "\n}\n\nexport function apply(ctx) {\n  registerSettingsRoute(ctx);\n}\n",1);
fs.writeFileSync(p,c,"utf8");
p="lib/index.js"; c=fs.readFileSync(p,"utf8");
c=c.replace("import { loadSettings } from './settings-store.js';","import { loadSettings } from './settings-store.js';\nimport { registerSettingsRoute } from './settings-host.js';");
c=c.replace("export function apply(ctx, config) {\n  const resolved = normalizeConfig(config);", "export function apply(ctx, config) {\n  const resolved = normalizeConfig(config);\n  registerSettingsRoute(ctx);");
fs.writeFileSync(p,c,"utf8");
// remove host insert from patch
p="cordis.patch.yml"; c=fs.readFileSync(p,"utf8");
c=c.replace(/\n- insert:\n    - id: library-search-settings-host\n      name: 'dsh-library-search\/settings-host'\n?/,"\n");
fs.writeFileSync(p,c,"utf8");
// client error hint
p="lib/client.js"; c=fs.readFileSync(p,"utf8");
c=c.replace("setStatus('读取失败：' + String(error))","setStatus('读取失败：请先在任意会话里使用一次「文件库检索模式」，再打开本页。')");
fs.writeFileSync(p,c,"utf8");
const pkg=JSON.parse(fs.readFileSync("package.json","utf8")); pkg.version="0.3.1"; fs.writeFileSync("package.json",JSON.stringify(pkg,null,2)+"\n","utf8");
const rd=fs.readFileSync("README.md","utf8").replace("- 版本：`0.3.0`","- 版本：`0.3.1`"); fs.writeFileSync("README.md",rd,"utf8");
console.log("0.3.1 route moved into tool plugin");
