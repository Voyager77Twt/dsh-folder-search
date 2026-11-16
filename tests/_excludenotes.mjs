import fs from "node:fs";
let p="package.json"; let c=fs.readFileSync(p,"utf8");
c=c.replace('    "README.md",\n    "README.en.md",\n    "RELEASE-NOTES.md",\n    "LICENSE"','    "README.md",\n    "README.en.md",\n    "LICENSE"');
fs.writeFileSync(p,c,"utf8");
p="README.md"; c=fs.readFileSync(p,"utf8").replace("- 发布说明：[RELEASE-NOTES.md](RELEASE-NOTES.md)\n",""); fs.writeFileSync(p,c,"utf8");
p="README.en.md"; c=fs.readFileSync(p,"utf8").replace("- Release notes: [RELEASE-NOTES.md](RELEASE-NOTES.md)\n",""); fs.writeFileSync(p,c,"utf8");
console.log("release notes excluded");
