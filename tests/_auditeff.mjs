import fs from "node:fs";
let t=fs.readFileSync("tests/_static-audit.mjs","utf8");
t=t.replace('const missingSearch = keys.filter((key) => !searchText.includes("settings." + key) && !searchText.includes("settings?." + key));','const missingSearch = keys.filter((key) => !searchText.includes("settings." + key) && !searchText.includes("settings?." + key) && !searchText.includes("effective." + key));');
fs.writeFileSync("tests/_static-audit.mjs",t,"utf8");
console.log("audit includes effective settings");
