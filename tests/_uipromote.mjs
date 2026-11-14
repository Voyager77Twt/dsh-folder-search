import fs from "node:fs";
let p="lib/client.js"; let c=fs.readFileSync(p,"utf8");
const pairs=[
 ["normalMaxFiles: e.target.checked ? 'all' : 12","normalMaxFiles: e.target.checked ? 'all' : 16"],
 ["num(settings.normalMaxFiles, 12)","num(settings.normalMaxFiles, 16)"],
 ["strongMaxFiles: e.target.checked ? 'all' : 6","strongMaxFiles: e.target.checked ? 'all' : 8"],
 ["num(settings.strongMaxFiles, 6)","num(settings.strongMaxFiles, 8)"],
 ["num(settings.strongSnippetChars, 45)","num(settings.strongSnippetChars, 60)"],
 ["num(settings.associationLimit, 4)","num(settings.associationLimit, 2)"],
 ["num(settings.expandSnippetChars, 45)","num(settings.expandSnippetChars, 30)"],
 ["num(settings.generalLimit ?? settings.associationLimit, 2)","num(settings.generalLimit ?? settings.associationLimit, 1)"],
 ["num(settings.finalMaxFiles, 20)","num(settings.finalMaxFiles, 30)"],
 ["finalMaxFiles: e.target.checked ? 'all' : 20","finalMaxFiles: e.target.checked ? 'all' : 30"]
];
for(const [a,b] of pairs) c=c.replaceAll(a,b);
fs.writeFileSync(p,c,"utf8");
console.log("UI defaults promoted");
