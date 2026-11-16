import fs from "node:fs";
for (const file of ["tests/_detailed-static.mjs","tests/detailed-static.mjs"]) {
  let c=fs.readFileSync(file,"utf8");
  c=c.replace("const values = [settings, null, '', '', '', '', false, false, mockIndexStatus, false, '', ''];","const values = [settings, null, '', '', '', '', false, mockIndexStatus, false, '', ''];");
  c=c.replace("check(routes.length === 3, 'settings + index + folder picker routes registered');\ncheck(routes.some((route) => route.path === '/api/dsh-folder-search/pick-folder'), 'folder picker route registered');","check(routes.length === 2, 'settings + index routes registered');");
  c=c.replaceAll("0.6.14","0.6.6");
  c=c.replaceAll("126 checks","125 checks");
  fs.writeFileSync(file,c,"utf8");
}
let p="tests/_static-audit.mjs"; let s=fs.readFileSync(p,"utf8");
s=s.replace('ok(routes.length === 3 && routes.map((r) => r.path).includes(\'/api/dsh-folder-search/settings\') && routes.map((r) => r.path).includes(\'/api/dsh-folder-search/index\') && routes.map((r) => r.path).includes(\'/api/dsh-folder-search/pick-folder\'), "settings host registers settings + index + picker routes");','ok(routes.length === 2 && routes.map((r) => r.path).includes(\'/api/dsh-folder-search/settings\') && routes.map((r) => r.path).includes(\'/api/dsh-folder-search/index\'), "settings host registers settings + index routes");');
s=s.replaceAll("0.6.14","0.6.6");
fs.writeFileSync(p,s,"utf8");
console.log("tests rollback");
