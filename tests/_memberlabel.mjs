import fs from "node:fs";
let p="lib/extract.js"; let c=fs.readFileSync(p,"utf8");
const marker="function assertSafeXml(xml, label) {";
const helper=`function displayMemberName(name) {
  return String(name || '').replace(/\\\\/g, '/').split('/').filter((part) => part && part !== '.' && part !== '..').join('/').slice(0, 240);
}

`;
if(!c.includes("function displayMemberName")) c=c.replace(marker,helper+marker);
c=c.replace("        const inner = String(name).replace(/\\\\/g, '/').slice(0, 240);","        const inner = displayMemberName(name);");
fs.writeFileSync(p,c,"utf8");
console.log("member display sanitized");
