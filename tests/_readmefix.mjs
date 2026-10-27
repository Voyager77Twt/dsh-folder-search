import fs from "node:fs";
let p="README.md"; let c=fs.readFileSync(p,"utf8");
c=c.replace("git tag v0.5.18\n","git tag v0.5.27\n");
c=c.replace("git push origin v0.5.18\n","git push origin v0.5.27\n");
fs.writeFileSync(p,c,"utf8");
console.log("readme version examples");
