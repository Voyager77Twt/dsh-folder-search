import fs from "node:fs";
let p="lib/client.js"; let c=fs.readFileSync(p,"utf8");
c=c.replace("        localeFace = ctx.get('locale');\n        if (localeFace) activeLocale = localeFace.getLocale().active;","        localeFace = typeof ctx.get === 'function' ? ctx.get('locale') : null;\n        if (localeFace?.getLocale) activeLocale = localeFace.getLocale().active;");
fs.writeFileSync(p,c,"utf8");
console.log("locale guard");
