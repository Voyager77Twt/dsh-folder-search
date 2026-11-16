import fs from "node:fs";
let p="tests/_detailed-static.mjs"; let c=fs.readFileSync(p,"utf8");
c=c.replace("check(routes.length === 2, 'settings + index routes registered');","check(routes.length === 3, 'settings + index + folder picker routes registered');\ncheck(routes.some((route) => route.path === '/api/dsh-folder-search/pick-folder'), 'folder picker route registered');");
fs.writeFileSync(p,c,"utf8");
fs.copyFileSync(p,"tests/detailed-static.mjs");
console.log("route test");
