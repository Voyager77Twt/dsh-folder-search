import fs from "node:fs";
let p="tests/_static-audit.mjs"; let c=fs.readFileSync(p,"utf8");
c=c.replace('ok(routes.length === 2 && routes.map((r) => r.path).includes(\'/api/dsh-folder-search/settings\') && routes.map((r) => r.path).includes(\'/api/dsh-folder-search/index\'), "settings host registers settings + index routes");','ok(routes.length === 3 && routes.map((r) => r.path).includes(\'/api/dsh-folder-search/settings\') && routes.map((r) => r.path).includes(\'/api/dsh-folder-search/index\') && routes.map((r) => r.path).includes(\'/api/dsh-folder-search/pick-folder\'), "settings host registers settings + index + picker routes");');
fs.writeFileSync(p,c,"utf8");
console.log("static route3");
