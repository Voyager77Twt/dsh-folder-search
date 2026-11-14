import fs from "node:fs";
let p="tests/_detailed-static.mjs"; let c=fs.readFileSync(p,"utf8");
const marker="// 6. strong gate / categories";
const add=`// 5d. full/original mode output policy
const fullMode = await searchLibrary(idx, { keywords: ['侯氏制碱法'], strongTerms: ['侯德榜'], generalTerms: ['纯碱'], refresh: 'never' }, cfg, { ...base, searchMode: 'full', dedupe: false });
check(fullMode.totals.shownFiles === fullMode.totals.files, 'full mode opens file limits', String(fullMode.totals.shownFiles) + '/' + String(fullMode.totals.files));
check(fullMode.files.every((file) => (file.blocks?.length ?? 0) <= 2), 'full mode keeps per-file hit limit');
const originalMode = await searchLibrary(idx, { keywords: ['有机'], subject: '化学', strongTerms: ['侯德榜'], generalTerms: ['纯碱'], refresh: 'never' }, cfg, { ...base, searchMode: 'original', dedupe: false });
check(JSON.stringify(originalMode.query.expanded['有机']) === JSON.stringify(['有机']), 'original mode ignores subject/dictionary expansion');
check(originalMode.totals.relatedFiles === 0 && originalMode.totals.generalFiles === 0, 'original mode only direct');
check(originalMode.files.length <= 30, 'original mode final cap 30');

// 6. strong gate / categories`;
if(!c.includes(marker)) throw new Error('full test marker'); c=c.replace(marker,add);
fs.writeFileSync(p,c,"utf8");
fs.copyFileSync(p,"tests/detailed-static.mjs");
console.log("full/original tests added");
