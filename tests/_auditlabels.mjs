import fs from "node:fs";
let t=fs.readFileSync("tests/_static-audit.mjs","utf8");
t=t.replace('text.includes("**仅强关联命中**")','text.includes("**强关联命中**")');
fs.writeFileSync("tests/_static-audit.mjs",t,"utf8");
console.log("audit labels updated");
