import fs from "node:fs";
let p="lib/client.js"; let c=fs.readFileSync(p,"utf8");
c=c.replace("        setFolderPicking(true);\n        setStatus('');","        setFolderPicking(true);\n        setStatus('正在打开文件夹选择框…');");
fs.writeFileSync(p,c,"utf8");
console.log("picker visible status");
