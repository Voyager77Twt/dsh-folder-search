import fs from "node:fs";
let p="lib/search.js"; let c=fs.readFileSync(p,"utf8");
c=c.replace("    if (subpath && !doc.rel.startsWith(subpath === '' ? '' : `${subpath}/`) && doc.rel !== subpath) continue;\n    totalFilesHit += 1;","    if (subpath && !doc.rel.startsWith(subpath === '' ? '' : `${subpath}/`) && doc.rel !== subpath) continue;");
c=c.replace("    const sortedBlocks = blocks.slice(0, maxBlocksPerFile);\n    fileResults.push({","    totalFilesHit += 1;\n    const sortedBlocks = blocks.slice(0, maxBlocksPerFile);\n    fileResults.push({");
fs.writeFileSync(p,c,"utf8");
const pkg=JSON.parse(fs.readFileSync("package.json","utf8")); pkg.version="0.4.3"; fs.writeFileSync("package.json",JSON.stringify(pkg,null,2)+"\n","utf8");
const rd=fs.readFileSync("README.md","utf8").replace("- 版本：`0.4.2`","- 版本：`0.4.3`"); fs.writeFileSync("README.md",rd,"utf8");
console.log("0.4.3 totals");
