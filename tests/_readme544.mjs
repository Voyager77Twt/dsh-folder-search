import fs from "node:fs";
let r=fs.readFileSync("README.md","utf8").replace("- 版本：`0.5.42`","- 版本：`0.5.44`");
fs.writeFileSync("README.md",r,"utf8");
console.log("README version");
