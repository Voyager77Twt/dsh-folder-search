import fs from "node:fs";
let p="lib/client.js"; let c=fs.readFileSync(p,"utf8");
c=c.split("(data.settings.strongGateSuffixes || []).join('\\n')").join("(data.settings.strongGateSuffixes || []).join(', ')");
c=c.split("(defaults.strongGateSuffixes || []).join('\\n')").join("(defaults.strongGateSuffixes || []).join(', ')");
fs.writeFileSync(p,c,"utf8");
console.log("comma suffix");
