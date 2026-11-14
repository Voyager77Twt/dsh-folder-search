import fs from "node:fs";
let p="lib/client.js"; let c=fs.readFileSync(p,"utf8");
c=c.replace("      inject: ['slots'],","      inject: ['slots', 'locale'],");
c=c.replace("        localeFace = typeof ctx.get === 'function' ? ctx.get('locale') : null;\n        if (localeFace?.getLocale) activeLocale = localeFace.getLocale().active;","        localeFace = ctx.locale || (typeof ctx.get === 'function' ? ctx.get('locale') : null);\n        if (localeFace?.getLocale) activeLocale = localeFace.getLocale().active;\n        else if (typeof document !== 'undefined' && document.documentElement?.lang) activeLocale = document.documentElement.lang;");
fs.writeFileSync(p,c,"utf8");
console.log("locale injection");
