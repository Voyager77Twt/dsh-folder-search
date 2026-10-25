import fs from "node:fs";
let p="lib/settings-store.js"; let c=fs.readFileSync(p,"utf8");
c=c.replace("  strongLimit: 1,\n  dedupe: false,","  strongLimit: 1,\n  enableStrong: true,\n  enableGeneral: true,\n  dedupe: false,");
c=c.replace("  base.strongLimit = integer(source.strongLimit, 0, 4, base.strongLimit);","  base.strongLimit = integer(source.strongLimit, 0, 4, base.strongLimit);\n  if (typeof source.enableStrong === 'boolean') base.enableStrong = source.enableStrong;\n  if (typeof source.enableGeneral === 'boolean') base.enableGeneral = source.enableGeneral;");
fs.writeFileSync(p,c,"utf8");
p="lib/search.js"; c=fs.readFileSync(p,"utf8");
c=c.replace("  const strongTerms = (Array.isArray(args.strongTerms) ? args.strongTerms : []).map((term) => String(term).trim()).filter(Boolean).slice(0, Number(settings.strongLimit ?? 1));\n  const generalTerms = (Array.isArray(args.generalTerms) ? args.generalTerms : []).map((term) => String(term).trim()).filter(Boolean).slice(0, Number(settings.associationLimit ?? 4));",
"  const strongTerms = settings.enableStrong === false ? [] : (Array.isArray(args.strongTerms) ? args.strongTerms : []).map((term) => String(term).trim()).filter(Boolean).slice(0, Number(settings.strongLimit ?? 1));\n  const generalTerms = settings.enableGeneral === false ? [] : (Array.isArray(args.generalTerms) ? args.generalTerms : []).map((term) => String(term).trim()).filter(Boolean).slice(0, Number(settings.associationLimit ?? 4));");
fs.writeFileSync(p,c,"utf8");
const pkg=JSON.parse(fs.readFileSync("package.json","utf8")); pkg.version="0.5.3"; fs.writeFileSync("package.json",JSON.stringify(pkg,null,2)+"\n","utf8");
const rd=fs.readFileSync("README.md","utf8").replace("- 版本：`0.5.2`","- 版本：`0.5.3`"); fs.writeFileSync("README.md",rd,"utf8");
console.log("step toggles wired");
