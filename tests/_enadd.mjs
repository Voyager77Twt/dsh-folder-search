import fs from "node:fs";
let p="lib/client.js"; let src=fs.readFileSync(p,"utf8");
const start=src.indexOf("    const EN = ");
const end=src.indexOf("\n    const isEnglish", start);
const raw=src.slice(start+"    const EN = ".length,end).trim().replace(/;$/,'');
const en=JSON.parse(raw);
const strings=[...new Set([...src.matchAll(/'([^'\\]*(?:\\.[^'\\]*)*)'/g)].map(x=>x[1]).filter(x=>/[\u4e00-\u9fff]/.test(x)))];
const missing=strings.filter(s=>!en[s]);
const translations=[
"Read failed",
"Read failed: ",
"Reading local search settings…",
"Saved; indexing was not started: ",
"Saved; automatic indexing started.",
"Saved; ",
"Saved; takes effect on the next search/outline call.",
"Save failed: ",
"Starting indexing…",
"Indexing started.",
"Failed to start indexing: ",
"Reading…",
"Indexing…",
"Pending ",
" files",
"Indexed ",
", failed ",
" files",
"Ready",
"Absolute path to the library folder. New sessions use it automatically; leave empty to provide it in chat.",
"Index cache directory. Empty uses the default %LOCALAPPDATA%\\dsh-library-search; saving migrates and removes the old index when possible.",
"Default: %LOCALAPPDATA%\\dsh-library-search",
"Reading index status…",
"Parallel extraction for docx/pdf/xlsx; .doc/.ppt/.rtf stay serial to avoid Office conflicts.",
"Per-file size limit; larger files are skipped. Large image-heavy docx files may need 200–500 MB.",
"Choose a mode first; only Custom expands the detailed settings below.",
"Runs once. Checks for library updates and fills the index; when off, only the existing cache is searched.",
"Runs once and is always on: searches the cache using your keywords.",
"Applies only to files that directly contain the original keyword. All is most complete and most expensive; association-only files use the output limits in steps 4/5.",
"Maximum positions listed per directly matched file; the total still reports hidden hits.",
"Characters captured for each direct-hit snippet; shorter saves tokens.",
"Runs once together with step 2. Put people, former names, aliases, abbreviations, synonyms and standard terms here; default maximum 2. Leave parent/domain terms out. The gate demotes overly broad terms or terms beyond the limit.",
"Choose what counts as too broad: file threshold, library ratio, domain suffix, or any of them.",
"Default gate: with more than 5 direct files, demote a term above 2× the direct count or 20% of the library; those two rules are off at 5 or fewer direct files. Domain suffixes still demote. Keep at most the strong-term limit; demote only broad terms or terms beyond the limit.",
"Fixed file threshold; effective only in the fixed-file-count mode.",
"Demote a strong term when its file count exceeds this percentage of the library; effective when the mode includes ratio.",
"Strong-only files use these output limits, separate from steps 4/5.",
"Maximum positions listed per strong-term file.",
"Characters captured per strong-term snippet.",
"Runs once with step 2. Built-in dictionary expansion (e.g. organic → hydrocarbons/alcohols/aldehydes); enabling it requires the association count limit and shares the association output limits below.",
"Shared by step 4 (dictionary) and step 5 (general): maximum files listed; All disables the file-count cap. Original-only search does not use it.",
"Shared by step 4 or 5: maximum positions per file.",
"Shared by step 4 or 5: characters per snippet.",
"Runs once with step 2. Put only broad domain/context terms here; people, proper names, aliases and synonyms belong in strong terms (step 3). By default it adds no files and only fills paragraphs in already matched files; zero-hit fallback may still bring files.",
"When on: if dictionary file slots are not full, general terms may add files and share the dictionary file cap. When direct and strong hits are both zero, fallback brings them in even when this is off.",
"Same file: the term may appear anywhere in the file. Same block/page: it must be in the same paragraph, page, slide or cell. Stricter is cheaper but may miss split terms.",
"When a strong term is demoted in step 3, retry with the remaining strong terms; retries stay inside this tool call and add no model round trip."
];
if(missing.length!==translations.length){ console.error('count mismatch',missing.length,translations.length); process.exit(1); }
for(let i=0;i<missing.length;i++) en[missing[i]]=translations[i];
const next=JSON.stringify(en,null,2);
src=src.slice(0,start)+"    const EN = "+next+";"+src.slice(end);
fs.writeFileSync(p,src,"utf8");
console.log('added',missing.length,'translations');
