import fs from "node:fs";
let p="README.en.md"; let c=fs.readFileSync(p,"utf8");
c=c.replace("Only Custom expands the detailed steps; the other modes show preset descriptions.\n\nThe selected mode is saved",`Only Custom expands the detailed steps; the other modes show preset descriptions.

**Full mode already opens the file limit, so it does not need \`all=true\`.** \`all=true\` is relevant to Original, Default, and Custom: it expands only the final displayed file count, not the search terms or association scope.

The selected mode is saved`);
c=c.replace("Only when the user explicitly says “list all / show every file” does the model pass `all=true` to open the file limit. Each file still lists at most 2 hits. Use `library\\_read` for full text.","Only when the user explicitly says “list all / show every file” does the model pass `all=true` to open the file limit. Each file still lists at most 2 hits. `all=true` affects output count only, not search scope; Full mode already opens file limits. Use `library_read` for full text.");
c=c.replace("The cache does not lose hits: it is a complete copy of extracted text, scanned line by line—no sampling, summarization, or truncation.","For documents successfully extracted into the index, search scans all saved text in the cache—no sampling, summary, or truncation. However, the per-file extraction cap, cache capacity, index status, and format support still limit what can be searched.");
c=c.replace("* Index build not finished;\n* Word headers/footers/footnotes/formulas; PPT notes; Excel formulas/comments; text inside scanned PDF images;\n* Archives/images/video are indexed by file name only;\n* Cache cap reached;","* Index build not finished, or paused after reaching the cache cap with pending files;\n* Word headers/footers/footnotes/formulas; PPT notes; Excel formulas/comments; text inside scanned PDF images;\n* `.rar` / `.7z` / images / video are indexed by file name only; `.zip` indexes only supported members;");
const api=`### Local API

Two routes are exposed through the DSH Web Server:

\`\`\`text
/api/dsh-folder-search/settings
/api/dsh-folder-search/index
\`\`\`

| Item | Current handling |
|---|---|
| Same-origin check | If \`Origin\` is present it must match \`Host\`; requests without \`Origin\` (local tools) are allowed |
| Methods | Settings: GET/HEAD/POST; Index: GET status, POST only \`action=build\` |
| Body size | 64 KB upper bound |
| Parameter checks | Index POST requires existing directories; settings fields are sanitized |
| Concurrent builds | Different library sets are refused while one runs; the same set returns the active job |
| Authentication | No plugin-level token or role check; relies on the DSH Web Server local-access boundary |

Do not expose the DSH Web Server directly to untrusted networks. Add authentication and access control at a reverse proxy if remote access is needed. The settings GET response includes library paths and should be treated as sensitive.

### ZIP Archives`;
if(!c.includes("### ZIP Archives")) throw new Error('EN zip marker'); c=c.replace("### ZIP Archives",api);
fs.writeFileSync(p,c,"utf8");
console.log("English accuracy updates");
