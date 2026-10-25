import fs from "node:fs";
let r=fs.readFileSync("README.md","utf8");
r=r.replace("先在 DSH 里装好本仓库（`fan20071202` 换成实际 GitHub 用户名）：","先在 DSH 里装好本仓库：");
fs.writeFileSync("README.md",r,"utf8");
console.log("readme wording fixed");
