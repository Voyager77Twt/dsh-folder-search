import fs from "node:fs";
let p="tests/_detailed-static.mjs"; let c=fs.readFileSync(p,"utf8");
c=c.replace("check(keys.length === 44, '45 settings keys', String(keys.length));","check(keys.length === 45, '45 settings keys', String(keys.length));");
const marker="// 6. strong gate / categories";
const add=`// 5c. compact output defaults and explicit all
const compact = await searchLibrary(idx, { keywords: ['侯氏制碱法'], strongTerms: ['侯德榜'], refresh: 'never' }, cfg, { ...base, searchMode: 'default', dedupe: false });
check(compact.files.length <= 20, 'compact default caps files', String(compact.files.length));
check(compact.files.every((file) => (file.blocks?.length ?? 0) <= 2), 'compact default caps blocks per file');
check(renderSearchResult(compact).includes('另有'), 'compact summary shows remaining files');
const allList = await searchLibrary(idx, { keywords: ['侯氏制碱法'], strongTerms: ['侯德榜'], all: true, refresh: 'never' }, cfg, { ...base, searchMode: 'default', dedupe: false });
check(allList.totals.shownFiles === allList.totals.files, 'explicit all opens file cap', String(allList.totals.shownFiles) + '/' + String(allList.totals.files));
check(allList.files.every((file) => (file.blocks?.length ?? 0) <= 2), 'explicit all still caps blocks per file');
const multiRoots = sanitizeSettings({ libraryRoots: 'D:\\\\A\\nD:\\\\B,D:\\\\A' });
check(multiRoots.libraryRoots.length === 2, 'multi-root setting splits/dedupes');

// 6. strong gate / categories`;
if(!c.includes(marker)) throw new Error('compact marker'); c=c.replace(marker,add);
fs.writeFileSync(p,c,"utf8");
console.log("compact tests added");
