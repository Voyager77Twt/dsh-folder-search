import fs from "node:fs";
let p="tests/_static-audit.mjs"; let c=fs.readFileSync(p,"utf8");
c=c.replace('ok(routes.length === 1 && routes[0].path === \'/api/dsh-folder-search/settings\', "settings host registers one route");','ok(routes.length === 2 && routes.map((r) => r.path).includes(\'/api/dsh-folder-search/settings\') && routes.map((r) => r.path).includes(\'/api/dsh-folder-search/index\'), "settings host registers settings + index routes");');
fs.writeFileSync(p,c,"utf8");
