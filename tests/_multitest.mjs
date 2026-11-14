import fs from "node:fs";
let p="lib/index.js"; let c=fs.readFileSync(p,"utf8");
c=c.replace("function mergeSearchResults(results, settings) {","export function mergeSearchResults(results, settings) {");
fs.writeFileSync(p,c,"utf8");
p="tests/_detailed-static.mjs"; c=fs.readFileSync(p,"utf8");
c=c.replace("import { apply } from '../lib/index.js';","import { apply, mergeSearchResults } from '../lib/index.js';");
const marker="// 6. strong gate / categories";
const add=`// 5b. multi-library configuration and merge
const multiSettings = sanitizeSettings({ libraryRoots: 'D:\\\\A\\nD:\\\\B,D:\\\\A' });
check(multiSettings.libraryRoots.length === 2, 'multi roots dedupe and split', JSON.stringify(multiSettings.libraryRoots));
check(multiSettings.libraryRoot === multiSettings.libraryRoots[0], 'legacy libraryRoot derives first root');
const rootA = indexFor(library, { ...cfg, cacheDir: path.join(os.tmpdir(), 'folder-search-a') });
const rootB = indexFor(path.join(os.tmpdir(), 'folder-search-b'), { ...cfg, cacheDir: path.join(os.tmpdir(), 'folder-search-b-cache') });
check(rootA.cacheDir !== rootB.cacheDir, 'separate roots use separate cache directories');
const synthetic = (root, direct, expanded) => ({
  library: root,
  files: [
    ...direct.map((name) => ({ name, path: root + '\\\\' + name, directKeywords: ['k'], expandedOnly: false, relatedOnly: false, generalOnly: false, blocks: [{ label: 'x' }] })),
    ...expanded.map((name) => ({ name, path: root + '\\\\' + name, directKeywords: [], expandedOnly: true, relatedOnly: false, generalOnly: false, blocks: [{ label: 'x' }] })),
  ],
  totals: { files: direct.length + expanded.length, directFiles: direct.length, expandedFiles: expanded.length, relatedFiles: 0, generalFiles: 0, blocks: direct.length + expanded.length, directBlocks: direct.length, expandedBlocks: expanded.length, relatedBlocks: 0, generalBlocks: 0, shownFiles: 0, shownBlocks: 0, fallback: false },
  stats: { documents: direct.length + expanded.length, ready: direct.length + expanded.length, pending: 0, failed: 0, cacheBytes: 1, libraryBytes: 1, errors: [] },
  query: { keywords: ['k'], expanded: {} }, caps: {}, truncated: false, strongGate: null,
});
const merged = mergeSearchResults([synthetic('A', ['a1'], ['ae']), synthetic('B', ['b1'], ['be'])], { finalMaxFiles: 1 });
check(merged.libraries?.length === 2, 'merged report lists libraries');
check(merged.files.length === 1 && merged.files[0].name === 'a1', 'merged final cap keeps direct result');
check(merged.files[0].library === 'A', 'merged files carry source library');

// 6. strong gate / categories`;
if(!c.includes(marker)) throw new Error('multi test marker'); c=c.replace(marker,add);
fs.writeFileSync(p,c,"utf8");
console.log("multi-library tests added");
