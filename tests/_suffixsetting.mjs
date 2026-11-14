import fs from "node:fs";
let p="lib/settings-store.js"; let c=fs.readFileSync(p,"utf8");
c=c.replace("  strongGateRatio: 20,","  strongGateRatio: 20,\n  strongGateSuffixes: ['题目', '试题', '领域', '行业', '产业'],");
c=c.replace("  base.strongGateRatio = integer(source.strongGateRatio, 1, 100, base.strongGateRatio);","  base.strongGateRatio = integer(source.strongGateRatio, 1, 100, base.strongGateRatio);\n  const suffixSource = Array.isArray(source.strongGateSuffixes) ? source.strongGateSuffixes.join('\\n') : source.strongGateSuffixes;\n  base.strongGateSuffixes = String(suffixSource ?? base.strongGateSuffixes.join('\\n')).split(/[,，\\n]/).map((item) => item.trim()).filter(Boolean).slice(0, 50);");
fs.writeFileSync(p,c,"utf8");
console.log("suffix setting");
