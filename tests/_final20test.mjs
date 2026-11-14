import fs from "node:fs";
for (const file of ["tests/_detailed-static.mjs","tests/detailed-static.mjs"]) {
  let c=fs.readFileSync(file,"utf8");
  c=c.replace("check(DEFAULT_SETTINGS.finalMaxFiles === 60, 'default finalMaxFiles is 60');","check(DEFAULT_SETTINGS.finalMaxFiles === 20, 'default finalMaxFiles is 20');");
  fs.writeFileSync(file,c,"utf8");
}
console.log("default expectation");
