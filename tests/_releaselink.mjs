import fs from "node:fs";
let p="README.md"; let c=fs.readFileSync(p,"utf8");
c=c.replace("- 许可：MIT","- 许可：MIT\n- 发布说明：[RELEASE-NOTES.md](RELEASE-NOTES.md)");
fs.writeFileSync(p,c,"utf8");
p="README.en.md"; c=fs.readFileSync(p,"utf8");
c=c.replace("- License: MIT","- License: MIT\n- Release notes: [RELEASE-NOTES.md](RELEASE-NOTES.md)");
fs.writeFileSync(p,c,"utf8");
console.log("README release notes links");
