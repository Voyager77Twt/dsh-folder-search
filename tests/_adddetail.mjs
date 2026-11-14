import fs from "node:fs";
let p="tests/_detailed-static.mjs"; let c=fs.readFileSync(p,"utf8");
c=c.replace("const React = makeReact();","let mockIndexStatus = null;\nconst React = makeReact();\nconst originalUseState = React.useState;\nReact.useState = function(initial) {\n  const values = [settings, null, '', false, '', mockIndexStatus, false, '', ''];\n  const index = (this._hook = (this._hook ?? -1) + 1);\n  return [values[index] ?? initial, () => {}];\n};");
const marker="const zh = renderWithLocale('zh-CN');";
const add=`mockIndexStatus = { configured: true, running: false, ready: 1760, documents: 1767, pending: 0, failed: 7, cacheBytes: 24117248, cacheDir: 'C:\\\\Users\\\\hhh\\\\AppData\\\\Local\\\\dsh-library-search\\\\lib-f89d4ef01f30' };
const enIndex = renderWithLocale('en-US');
check(!enIndex.strings.some((s) => /[\\u4e00-\\u9fff]/.test(s)), 'English dynamic index status has no Chinese', enIndex.strings.filter((s) => /[\\u4e00-\\u9fff]/.test(s)).slice(0, 2).join(' | '));
check(enIndex.strings.some((s) => s.includes('Index size:')), 'English index size label');
check(enIndex.strings.some((s) => s.includes('Index directory:')), 'English index directory label');
check(enIndex.strings.some((s) => s.includes('Indexed 1760, failed 7')), 'English index count label');
mockIndexStatus = null;
const zh = renderWithLocale('zh-CN');`;
if(!c.includes(marker)) throw new Error('zh marker missing'); c=c.replace(marker,add);
// Add sidebar re-registration test before final console
c=c.replace("console.log(JSON.stringify({ ok: failures.length === 0",`const switchLocale = { active: 'zh-CN', listener: null, getLocale() { return { active: this.active, locales: [], revision: 1 }; }, subscribe(fn) { this.listener = fn; return () => {}; } };
let switchedLabel = null;
const switchCtx = { locale: switchLocale, slots: { inject(_n, fn) { fn(); }, register(def) { switchedLabel = def.label; return () => {}; } } };
clientModule.apply(switchCtx);
check(switchedLabel === '本地搜索设置', 'sidebar label initial Chinese');
switchLocale.active = 'en-US';
switchLocale.listener?.();
check(switchedLabel === 'Local Search Settings', 'sidebar label updates to English');

console.log(JSON.stringify({ ok: failures.length === 0"`);
fs.writeFileSync(p,c,"utf8");
console.log("dynamic locale tests added");
