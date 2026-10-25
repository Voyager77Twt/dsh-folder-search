import path from 'node:path';
import fsp from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { extractFile } from '../lib/extract.js';
import { indexFor } from '../lib/indexer.js';
import { searchLibrary, renderSearchResult } from '../lib/search.js';
import { outlineLibrary } from '../lib/outline.js';
import { readLibraryDocument, renderReadResult } from '../lib/read.js';
import { exportPaper } from '../lib/export.js';
import { humanBytes } from '../lib/util.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.dirname(here);
const library = path.join(root, 'fixtures', 'library');
const config = {
  libraries: [library],
  cacheDir: path.join(root, 'fixtures', '.cache'),
  rgPath: 'D:/AI/deepseek-harness/DSH Desktop/resources/app.asar.unpacked/node_modules/@vscode/ripgrep-win32-x64/bin/rg.exe',
  indexBudgetPerCall: 50,
  forceBudget: 100,
  maxFiles: 10,
  maxBlocksPerFile: 4,
  maxFileMB: 60,
  cacheCapMB: 250,
  associations: {
    有机: ['有机', '有机化学', '有机物', '烃', '醇', '醛', '羧酸', '酯', '同分异构', '官能团'],
    沉淀溶解平衡: ['沉淀溶解平衡', '溶度积', 'Ksp', '难溶电解质', '沉淀转化'],
  },
};

function timed(label, fn) {
  const start = Date.now();
  return Promise.resolve(fn()).then((value) => {
    console.log(`[${label}] ${Date.now() - start} ms`);
    return value;
  });
}

const files = [
  ['化学/2024模拟卷.docx', '.docx'],
  ['化学/2024模拟卷.pdf', '.pdf'],
  ['化学/有机专题.docx', '.docx'],
  ['化学/沉淀溶解平衡专题.docx', '.docx'],
  ['化学/实验数据.xlsx', '.xlsx'],
  ['化学/课件.pptx', '.pptx'],
  ['物理/力学.docx', '.docx'],
];

console.log('=== extraction ===');
for (const [rel, ext] of files) {
  try {
    const result = await extractFile(path.join(library, rel), ext, { maxFileMB: 60 });
    console.log(`${rel}: kind=${result.kind} blocks=${result.blocks.length} chars=${result.chars} sections=${result.sections.length} questions=${result.questions.length}`);
    if (rel.endsWith('.pdf')) console.log('  first block:', JSON.stringify(result.blocks[0]?.text.slice(0, 120)));
    if (result.questions.length) console.log('  questions:', result.questions.slice(0, 4).map((q) => `${q.no}@${q.loc.page ?? q.loc.p ?? q.loc.slide}`).join(', '));
  } catch (error) {
    console.log(`${rel}: ERROR ${error.message}`);
  }
}

console.log('\n=== index sync ===');
const index = indexFor(library, config);
const first = await timed('index-sync-1', () => index.sync({ budget: 50 }));
console.log(JSON.stringify({ documents: first.documents, ready: first.ready, pending: first.pending, cacheBytes: first.cacheBytes, libraryBytes: first.libraryBytes }));

console.log('\n=== search: 沉淀溶解平衡 ===');
const s1 = await timed('search-1', () => searchLibrary(index, { keywords: ['沉淀溶解平衡'], match: 'any', refresh: 'never' }, config));
console.log(renderSearchResult(s1));

console.log('\n=== search: 有机 + 同分异构 (all) ===');
const s2 = await timed('search-2', () => searchLibrary(index, { keywords: ['有机', '同分异构'], match: 'all', refresh: 'never' }, config));
console.log(renderSearchResult(s2));

console.log('\n=== search: 溶度积 (expand) ===');
const s3 = await timed('search-3', () => searchLibrary(index, { keywords: ['溶度积'], match: 'any', refresh: 'never', maxFiles: 5 }, config));
console.log(renderSearchResult(s3));

console.log('\n=== outline ===');
const outline = await timed('outline', () => outlineLibrary(index, { refresh: 'never', maxFiles: 10 }));
console.log(outline.text);

console.log('\n=== read question 17 from pdf ===');
const read = await timed('read', () => readLibraryDocument(index, { path: '化学/2024模拟卷.pdf', question: '17', maxChars: 4000 }, config));
console.log(renderReadResult(read));

console.log('\n=== second search timing (warm) ===');
await timed('search-warm', () => searchLibrary(index, { keywords: ['有机'], match: 'any', refresh: 'never' }, config));

console.log('\n=== export docx ===');
const exported = await timed('export', () => exportPaper({
  title: '沉淀溶解平衡小测（实验）',
  outputDir: path.join(root, 'fixtures', 'out'),
  questions: [
    { number: '1', text: '已知 Mg(OH)2 的 Ksp = 5.6×10^-12，求饱和溶液中 Mg2+ 的浓度。', score: '10', answer: 'c(Mg2+) = 2.4×10^-4 mol/L', source: '化学/2024模拟卷.pdf 第17题' },
    { number: '2', text: '写出 BaSO4 的沉淀溶解平衡表达式，并说明沉淀转化的条件。', score: '12', answer: 'BaSO4(s) ⇌ Ba2+(aq) + SO4^2-(aq)', source: '化学/沉淀溶解平衡专题.docx' },
  ],
}, config));
console.log(JSON.stringify(exported));

const cacheStat = await index.stats();
console.log('\n=== cache ===');
console.log(`cache=${humanBytes(cacheStat.cacheBytes)} documents=${cacheStat.documents} ready=${cacheStat.ready}`);
