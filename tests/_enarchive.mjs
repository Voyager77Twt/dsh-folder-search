import fs from "node:fs";
let p="README.en.md"; let c=fs.readFileSync(p,"utf8");
c=c.replace("- Version: `0.5.52`","- Version: `0.5.53`");
c=c.replace("| `.rar` / `.zip` / images / video | File name only |","| `.zip` | Extracts and indexes supported docx/pdf/pptx/xlsx/txt members; temp files are deleted, links point to the original zip |\n| `.rar` / `.7z` / images / video | File name only |");
const marker="### Additional Protections";
const section=[
'### ZIP Archives',
'',
'`.zip` files are safely extracted to a random temporary directory. Supported members are extracted, their text is written to the index cache, and temporary files are deleted in `finally`.',
'',
'- Search result links still point to the original `.zip`;',
'- Location labels include the member path, e.g. “Archive: folder/a.docx · paragraph 12”;',
'- Nested ZIPs are bounded by max depth and tree-wide entry/size budgets;',
'- Corrupt or encrypted members are skipped without breaking others;',
'- `.rar` / `.7z` remain file-name-only.',
'',
'### Additional Protections'
].join('\n');
if(!c.includes(marker)) throw new Error('EN marker'); c=c.replace(marker,section);
c=c.replace("| Max ZIP entries | 5000 | Entries allowed inside one docx/pptx/xlsx |","| Max ZIP entries | 5000 | Entries allowed in one Office file or .zip archive |");
c=c.replace("| Max extracted text (MB) | 20 | Text characters retained per file; excess is truncated |","| Max extracted text (MB) | 20 | Text characters retained per file; excess is truncated |\n| Max archive depth | 2 | Maximum nested extraction depth; deeper archives are skipped |\n| Nested tree max entries | 10000 | Total entries across one archive and all nested archives |\n| Nested tree extracted cap (MB) | 1024 | Total uncompressed size across one archive and all nested archives |");
fs.writeFileSync(p,c,"utf8");
console.log("English archive docs");
