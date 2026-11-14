import fs from "node:fs";
for (const file of ["tests/_detailed-static.mjs","tests/detailed-static.mjs"]) {
  let c=fs.readFileSync(file,"utf8");
  c=c.replace("check(DEFAULT_SETTINGS.finalMaxFiles === 20, 'default finalMaxFiles is 20');","check(DEFAULT_SETTINGS.finalMaxFiles === 30, 'default finalMaxFiles is 30');");
  fs.writeFileSync(file,c,"utf8");
}
console.log("default test promoted");
