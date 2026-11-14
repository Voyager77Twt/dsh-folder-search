import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { zipSync, strToU8 } from 'fflate';
import { indexFor } from '../lib/indexer.js';
import { searchLibrary, renderSearchResult } from '../lib/search.js';
import { loadSettings, sanitizeSettings, DEFAULT_SETTINGS } from '../lib/settings-store.js';
import { extractFile } from '../lib/extract.js';
import { extractFileIsolated } from '../lib/parse-isolate.js';
import { QUESTION_RE, detectStructure } from '../lib/extract.js';
import { apply, mergeSearchResults } from '../lib/index.js';

const root = path.resolve('.');
const library = path.join(root, 'fixtures', '选题');
const failures = [];
const passes = [];
function check(condition, label, detail = '') {
  if (condition) passes.push(label);
  else failures.push(label + (detail ? ' :: ' + detail : ''));
}
function includes(haystack, needle, label) { check(haystack.includes(needle), label); }

// 1. syntax and manifest shape
for (const file of fs.readdirSync(path.join(root, 'lib')).filter((f) => f.endsWith('.js'))) {
  try { execFileSync('node', ['--check', path.join(root, 'lib', file)], { stdio: 'pipe' }); }
  catch (error) { failures.push('syntax lib/' + file); }
}
check(fs.existsSync(path.join(root, 'lib', 'subject-dictionaries.js')), 'subject dictionaries file exists');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
check(pkg.name === 'dsh-folder-search', 'package name');
check(pkg.version === '0.5.52', 'package version 0.5.52', pkg.version);
check(pkg.dependencies?.['unpdf'] === '^2.1.0', 'unpdf upgraded');
check(pkg.dependencies?.xlsx === '0.18.5', 'xlsx pinned');
check(pkg.dependencies?.fflate === '0.8.2', 'fflate pinned');
check(fs.existsSync(path.join(root, 'README.md')), 'README exists');
const readme = fs.readFileSync(path.join(root, 'README.md'), 'utf8');
includes(readme, '## 安全', 'README security section');
includes(readme, '0.5.52', 'README version follows package');
includes(readme, '解析隔离', 'README parser isolation documented');
check(!/^## .*安装/m.test(readme), 'README has no install section');

// 2. settings shape and clamping
const keys = Object.keys(DEFAULT_SETTINGS);
check(keys.length === 45, '45 settings keys', String(keys.length));
for (const key of ['zipMaxEntries','zipMaxEntryMB','zipMaxTotalMB','zipMaxRatio','maxTextMB','parseIsolation','parseWorkerMB','officeAllowMacros','strongGateSuffixes']) check(key in DEFAULT_SETTINGS, 'security setting present: ' + key);
check(DEFAULT_SETTINGS.finalMaxFiles === 30, 'default finalMaxFiles is 30');
check(Array.isArray(DEFAULT_SETTINGS.strongGateSuffixes), 'suffix default is array');
check(DEFAULT_SETTINGS.strongGateSuffixes.join(',') === '题目,试题,领域,行业,产业', 'suffix default is meta-only');
const dirty = sanitizeSettings({ zipMaxEntries: 999999, zipMaxEntryMB: 0, zipMaxTotalMB: 999999, zipMaxRatio: 1, maxTextMB: 9999, parseWorkerMB: 99999, generalLimit: 99 });
check(dirty.zipMaxEntries === 20000, 'zip entries clamp high');
check(dirty.zipMaxEntryMB === 1, 'zip entry clamp low');
check(dirty.zipMaxTotalMB === 4096, 'zip total clamp high');
check(dirty.zipMaxRatio === 2, 'zip ratio clamp low');
check(dirty.maxTextMB === 200, 'text cap clamp high');
check(dirty.parseWorkerMB === 1024, 'worker memory clamp high');
check(dirty.generalLimit === 8, 'general limit clamp high');

// 3. client locale and settings page render
const clientSource = fs.readFileSync(path.join(root, 'lib', 'client.js'), 'utf8');
includes(clientSource, "inject: ['slots', 'locale']", 'client injects locale');
includes(clientSource, 'registerSection', 'client re-registers section on locale');
includes(clientSource, "join(', ')", 'suffix UI uses comma display');
includes(clientSource, 'buildIndex', 'build button action present');
includes(clientSource, '仅保存设置', 'save-only button present');

const settings = await loadSettings();
settings.libraryRoot = library;
let factory = null;
globalThis.window = { __ModuleLoader__: { load(spec) { factory = spec.factory; } } };
let registered = null;
const makeReact = () => ({
  createElement(type, props, ...children) { return { type, props: props || {}, children }; },
  useState(initial) {
    const values = [settings, null, '', false, '', null, false, '', ''];
    const index = (this._hook = (this._hook ?? -1) + 1);
    return [values[index] ?? initial, () => {}];
  },
  useEffect() {},
  useCallback(fn) { return fn; },
  useMemo(fn) { return fn(); },
  Fragment: 'Fragment',
});
let mockIndexStatus = null;
const React = makeReact();
const originalUseState = React.useState;
React.useState = function(initial) {
  const values = [settings, null, '', false, '', false, mockIndexStatus, false, '', ''];
  const index = (this._hook = (this._hook ?? -1) + 1);
  return [values[index] ?? initial, () => {}];
};
await import('../lib/client.js');
const clientModule = factory((name) => { if (name === 'react') return React; throw new Error('unexpected require ' + name); });
function renderWithLocale(active) {
  const locale = { getLocale: () => ({ active, locales: [], revision: 1 }), subscribe: () => () => {} };
  const ctx = {
    locale,
    slots: {
      inject(_name, fn) { fn(); },
      register(def, component) { registered = { def, component }; return () => {}; },
    },
  };
  clientModule.apply(ctx);
  React._hook = -1;
  const tree = registered.component();
  const strings = [];
  const walk = (node) => {
    if (typeof node === 'string') strings.push(node);
    else if (Array.isArray(node)) node.forEach(walk);
    else if (node && typeof node === 'object') {
      if (typeof node.props?.note === 'string') strings.push(node.props.note);
      if (Array.isArray(node.children)) node.children.forEach(walk);
    }
  };
  walk(tree);
  return { tree, strings, def: registered.def };
}
const en = renderWithLocale('en-US');
check(en.def.label === 'Local Search Settings', 'sidebar label English');
check(en.strings.includes('Local Search Settings'), 'page title English');
check(en.strings.includes('Security'), 'security card English');
check(!en.strings.some((s) => /[\u4e00-\u9fff]/.test(s)), 'English page has no Chinese static strings', en.strings.filter((s) => /[\u4e00-\u9fff]/.test(s)).slice(0, 3).join(' | '));
mockIndexStatus = { configured: true, running: false, ready: 1760, documents: 1767, pending: 0, failed: 7, cacheBytes: 24117248, cacheDir: 'C:\\Users\\hhh\\AppData\\Local\\dsh-library-search\\lib-f89d4ef01f30' };
const enIndex = renderWithLocale('en-US');
check(!enIndex.strings.some((s) => /[\u4e00-\u9fff]/.test(s)), 'English dynamic index status has no Chinese', enIndex.strings.filter((s) => /[\u4e00-\u9fff]/.test(s)).slice(0, 2).join(' | '));
check(enIndex.strings.some((s) => s.includes('Index size:')), 'English index size label');
check(enIndex.strings.some((s) => s.includes('Index directory:')), 'English index directory label');
check(enIndex.strings.some((s) => s.includes('Indexed 1760, failed 7')), 'English index count label');
mockIndexStatus = null;
const zh = renderWithLocale('zh-CN');
check(zh.def.label === '本地搜索设置', 'sidebar label Chinese');
check(zh.strings.includes('本地搜索设置'), 'page title Chinese');

// 4. tool registration / routes
const tools = [];
const routes = [];
const webServer = { register: (route) => { routes.push(route); return () => {}; } };
const ctx = { tools: { register: (def) => { tools.push(def); return () => {}; } }, get: (name) => name === 'webServer' ? webServer : undefined, effect: (fn) => fn(), logger: () => ({ info() {}, warn() {} }) };
apply(ctx, { libraries: [library] });
check(tools.length === 8, '8 tools registered', String(tools.length));
check(routes.length === 0, 'preset registers no settings route');
apply(ctx, { settingsOnly: true });
check(routes.length === 2, 'settings + index routes registered');
const searchTool = tools.find((t) => t.name === 'library_search');
check(Boolean(searchTool?.parameters?.properties?.subject), 'library_search exposes optional subject');
check(searchTool?.parameters?.properties?.subject?.enum?.length === 9, 'subject enum has 9 subjects');
check(!clientSource.includes('DEFAULT_ASSOCIATIONS'), 'client no old chemistry default');

// 5. dictionaries / expansion behavior
const generalSource = fs.readFileSync(path.join(root, 'lib', 'subject-dictionaries.js'), 'utf8');
for (const subject of ['语文','数学','英语','物理','化学','生物','历史','地理','政治']) includes(generalSource, subject + ':', 'subject dictionary: ' + subject);
check(!/DEFAULT_ASSOCIATIONS/.test(fs.readFileSync(path.join(root, 'lib', 'index.js'), 'utf8')), 'no hardcoded chemistry DEFAULT_ASSOCIATIONS');
const cfg = { libraries: [library], associations: {} };
const idx = indexFor(library, cfg);
const base = { ...settings, libraryRoot: library, finalMaxFiles: 60, dedupe: false, allowGeneralFiles: false };
const none = await searchLibrary(idx, { keywords: ['有机'], refresh: 'never' }, cfg, base);
check(JSON.stringify(none.query.expanded['有机']) === JSON.stringify(['有机']), 'no subject does not activate subject dictionary', JSON.stringify(none.query.expanded['有机']));
const chem = await searchLibrary(idx, { keywords: ['有机'], subject: '化学', refresh: 'never' }, cfg, { ...base, associationLimit: 8 });
check(chem.query.expanded['有机'].includes('烃'), 'subject=化学 activates chemistry dictionary');
const general = await searchLibrary(idx, { keywords: ['原因'], refresh: 'never' }, cfg, { ...base, expand: false });
check(general.query.expanded['原因'].includes('成因'), 'general dictionary works with auto expansion off');
const custom = await searchLibrary(idx, { keywords: ['沉淀溶解平衡'], refresh: 'never' }, cfg, { ...base, associationLimit: 2, customAssociations: { 沉淀溶解平衡: ['Ksp'] } });
check(custom.query.expanded['沉淀溶解平衡'][1] === 'Ksp', 'custom dictionary priority');

// 5b. multi-library configuration and merge
const multiSettings = sanitizeSettings({ libraryRoots: 'D:\\A\nD:\\B,D:\\A' });
check(multiSettings.libraryRoots.length === 2, 'multi roots dedupe and split', JSON.stringify(multiSettings.libraryRoots));
check(multiSettings.libraryRoot === multiSettings.libraryRoots[0], 'legacy libraryRoot derives first root');
const rootA = indexFor(library, { ...cfg, cacheDir: path.join(os.tmpdir(), 'folder-search-a') });
const rootB = indexFor(path.join(os.tmpdir(), 'folder-search-b'), { ...cfg, cacheDir: path.join(os.tmpdir(), 'folder-search-b-cache') });
check(rootA.cacheDir !== rootB.cacheDir, 'separate roots use separate cache directories');
const synthetic = (root, direct, expanded) => ({
  library: root,
  files: [
    ...direct.map((name) => ({ name, path: root + '\\' + name, directKeywords: ['k'], expandedOnly: false, relatedOnly: false, generalOnly: false, blocks: [{ label: 'x' }] })),
    ...expanded.map((name) => ({ name, path: root + '\\' + name, directKeywords: [], expandedOnly: true, relatedOnly: false, generalOnly: false, blocks: [{ label: 'x' }] })),
  ],
  totals: { files: direct.length + expanded.length, directFiles: direct.length, expandedFiles: expanded.length, relatedFiles: 0, generalFiles: 0, blocks: direct.length + expanded.length, directBlocks: direct.length, expandedBlocks: expanded.length, relatedBlocks: 0, generalBlocks: 0, shownFiles: 0, shownBlocks: 0, fallback: false },
  stats: { documents: direct.length + expanded.length, ready: direct.length + expanded.length, pending: 0, failed: 0, cacheBytes: 1, libraryBytes: 1, errors: [] },
  query: { keywords: ['k'], expanded: {} }, caps: {}, truncated: false, strongGate: null,
});
const merged = mergeSearchResults([synthetic('A', ['a1'], ['ae']), synthetic('B', ['b1'], ['be'])], { finalMaxFiles: 1 });
check(merged.libraries?.length === 2, 'merged report lists libraries');
check(merged.files.length === 1 && merged.files[0].name === 'a1', 'merged final cap keeps direct result');
check(merged.files[0].library === 'A', 'merged files carry source library');

// 5c. compact output defaults and explicit all
const compact = await searchLibrary(idx, { keywords: ['侯氏制碱法'], strongTerms: ['侯德榜'], refresh: 'never' }, cfg, { ...base, searchMode: 'default', dedupe: false });
check(compact.files.length <= 30, 'compact default caps files', String(compact.files.length));
check(compact.files.every((file) => (file.blocks?.length ?? 0) <= 2), 'compact default caps blocks per file');
check(renderSearchResult(compact).includes('另有'), 'compact summary shows remaining files');
const allList = await searchLibrary(idx, { keywords: ['侯氏制碱法'], strongTerms: ['侯德榜'], all: true, refresh: 'never' }, cfg, { ...base, searchMode: 'default', dedupe: false });
check(allList.totals.shownFiles === allList.totals.files, 'explicit all opens file cap', String(allList.totals.shownFiles) + '/' + String(allList.totals.files));
check(allList.files.every((file) => (file.blocks?.length ?? 0) <= 2), 'explicit all still caps blocks per file');
const multiRoots = sanitizeSettings({ libraryRoots: 'D:\\A\nD:\\B,D:\\A' });
check(multiRoots.libraryRoots.length === 2, 'multi-root setting splits/dedupes');

// 5d. full/original mode output policy
const fullMode = await searchLibrary(idx, { keywords: ['侯氏制碱法'], strongTerms: ['侯德榜'], generalTerms: ['纯碱'], refresh: 'never' }, cfg, { ...base, searchMode: 'full', dedupe: false });
check(fullMode.totals.shownFiles === fullMode.totals.files, 'full mode opens file limits', String(fullMode.totals.shownFiles) + '/' + String(fullMode.totals.files));
check(fullMode.files.every((file) => (file.blocks?.length ?? 0) <= 2), 'full mode keeps per-file hit limit');
const originalMode = await searchLibrary(idx, { keywords: ['有机'], subject: '化学', strongTerms: ['侯德榜'], generalTerms: ['纯碱'], refresh: 'never' }, cfg, { ...base, searchMode: 'original', dedupe: false });
check(JSON.stringify(originalMode.query.expanded['有机']) === JSON.stringify(['有机']), 'original mode ignores subject/dictionary expansion');
check(originalMode.totals.relatedFiles === 0 && originalMode.totals.generalFiles === 0, 'original mode only direct');
check(originalMode.files.length <= 30, 'original mode final cap 30');

// 6. strong gate / categories
const gate = await searchLibrary(idx, { keywords: ['侯氏制碱法'], strongTerms: ['侯德榜','纯碱'], generalTerms: ['联合制碱'], refresh: 'never' }, cfg, { ...base, strongLimit: 2, strongGateMode: 'domain', strongGateSuffixes: ['题目','试题'] });
const gateTerms = new Set(gate.files.flatMap((f) => f.strongTerms || []));
check(!gate.strongGate && gateTerms.has('侯德榜') && gateTerms.has('纯碱'), 'gate keeps both non-broad terms', JSON.stringify(gate.strongGate));
const demoted = await searchLibrary(idx, { keywords: ['侯氏制碱法'], strongTerms: ['侯德榜','纯碱'], refresh: 'never' }, cfg, { ...base, strongLimit: 2, strongGateMode: 'files', strongGateFiles: 10 });
check(demoted.strongGate?.kept?.length === 0 && demoted.strongGate?.demoted?.length === 2, 'gate demotes broad terms', JSON.stringify(demoted.strongGate));
check(gate.files.every((f) => !(f.generalOnly && f.relatedOnly)), 'no general/strong category overlap');
const totalCategories = gate.totals.directFiles + gate.totals.expandedFiles + gate.totals.relatedFiles + gate.totals.generalFiles;
check(totalCategories === gate.totals.files, 'totals include general category', `${totalCategories} vs ${gate.totals.files}`);
check(gate.totals.shownFiles === gate.files.length, 'shown files equals returned files');

const allow = await searchLibrary(idx, { keywords: ['侯氏制碱法'], strongTerms: ['侯德榜'], generalTerms: ['纯碱'], refresh: 'never' }, cfg, { ...base, allowGeneralFiles: true, dedupe: false });
check(allow.files.every((f) => !(f.generalOnly && f.relatedOnly)), 'allow general: no overlap');

const fallback = await searchLibrary(idx, { keywords: ['空气除硫'], generalTerms: ['脱硫'], refresh: 'never' }, cfg, { ...base, dedupe: false });
check(fallback.totals.fallback === true, 'zero-hit fallback triggers');
check(fallback.totals.generalFiles > 0, 'fallback brings general files');
check(renderSearchResult(fallback).includes('兜底关联命中'), 'fallback render label');
check(fallback.files.length <= 60, 'default final output cap 60');

const suffixWithout = await searchLibrary(idx, { keywords: ['侯氏制碱法'], strongTerms: ['化学实验'], refresh: 'never' }, cfg, { ...base, strongGateMode: 'domain', strongGateSuffixes: ['题目'] });
const suffixWith = await searchLibrary(idx, { keywords: ['侯氏制碱法'], strongTerms: ['化学实验'], subject: '化学', refresh: 'never' }, cfg, { ...base, strongGateMode: 'domain', strongGateSuffixes: ['题目'] });
check(!suffixWithout.strongGate, 'subject suffix not active without subject');
check(suffixWith.strongGate?.demoted?.includes('化学实验'), 'subject suffix only affects gate');
check(suffixWith.query.expanded['侯氏制碱法'].length === 1, 'subject suffix does not enter expansion');

// 7. question numbers
for (const [line, no] of [['第1题 题干','1'], ['1. 题干','1'], ['Question 12: 题干','12'], ['Q1 题干','1'], ['Q.3 题干','3'], ['Q 4 题干','4']]) {
  const out = { sections: [], questions: [] }; detectStructure({ text: line, loc: {} }, out);
  check(out.questions[0]?.no === no, 'question number: ' + line, JSON.stringify(out.questions));
}
check(QUESTION_RE.test('(1) 小问') === false, 'sub-question not treated as main question');

// 8. security extraction
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'folder-search-static-'));
try {
  const bombPath = path.join(temp, 'bomb.docx');
  fs.writeFileSync(bombPath, Buffer.from(zipSync({ 'word/document.xml': new Uint8Array(2 * 1024 * 1024) })));
  let blocked = false;
  try { await extractFile(bombPath, '.docx', { maxFileMB: 200, security: { zipMaxEntryMB: 1, zipMaxTotalMB: 8, zipMaxRatio: 1000 } }); }
  catch (error) { blocked = /安全限制/.test(error.message); }
  check(blocked, 'zip bomb entry cap blocks extraction');
  const dtdPath = path.join(temp, 'dtd.docx');
  fs.writeFileSync(dtdPath, Buffer.from(zipSync({ 'word/document.xml': strToU8('<!DOCTYPE x [<!ENTITY e "x">]><w:document/>') })));
  let dtdBlocked = false;
  try { await extractFile(dtdPath, '.docx', { maxFileMB: 200, security: {} }); }
  catch (error) { dtdBlocked = /DTD|ENTITY/.test(error.message); }
  check(dtdBlocked, 'DTD/entity declaration rejected');
  const fixture = path.join(library, '模拟试题', '2025届高三资料', '2025二模原题分类汇编', '2025二模分类汇编——原理大题.docx');
  if (fs.existsSync(fixture)) {
    const normal = await extractFile(fixture, '.docx', { maxFileMB: 200, security: {} });
    check(normal.blocks.length > 0, 'normal docx still extracts');
    const isolated = await extractFileIsolated(fixture, '.docx', { maxFileMB: 200, security: {}, workerMaxMB: 256 });
    check(isolated.blocks.length > 0, 'worker isolation extracts');
  }
} finally { fs.rmSync(temp, { recursive: true, force: true }); }

// 9. Office/security scripts and worker wiring
const legacySource = fs.readFileSync(path.join(root, 'lib', 'office-convert.js'), 'utf8');
includes(legacySource, 'powershellCommand()', 'office conversion uses bitness-aware powershell');
includes(legacySource, 'allowMacros', 'office macro policy threaded');
for (const file of ['word-batch-to-pdf.ps1','word-to-pdf.ps1','ppt-to-pdf.ps1']) {
  const text = fs.readFileSync(path.join(root, 'scripts', file), 'utf8');
  includes(text, 'AutomationSecurity', file + ' disables automation security by default');
  includes(text, 'AllowMacros', file + ' exposes macro override');
}
const indexerSource = fs.readFileSync(path.join(root, 'lib', 'indexer.js'), 'utf8');
includes(indexerSource, 'extractFileIsolated', 'indexer uses parser worker');
includes(fs.readFileSync(path.join(root, 'lib', 'parse-isolate.js'), 'utf8'), 'resourceLimits', 'worker has memory limits');

const switchLocale = { active: 'zh-CN', listener: null, getLocale() { return { active: this.active, locales: [], revision: 1 }; }, subscribe(fn) { this.listener = fn; return () => {}; } };
let switchedLabel = null;
const switchCtx = { locale: switchLocale, slots: { inject(_n, fn) { fn(); }, register(def) { switchedLabel = def.label; return () => {}; } } };
clientModule.apply(switchCtx);
check(switchedLabel === '本地搜索设置', 'sidebar label initial Chinese');
switchLocale.active = 'en-US';
switchLocale.listener?.();
check(switchedLabel === 'Local Search Settings', 'sidebar label updates to English');

console.log(JSON.stringify({ ok: failures.length === 0, passCount: passes.length, failures }, null, 2));
