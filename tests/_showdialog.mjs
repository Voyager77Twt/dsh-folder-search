import fs from "node:fs";
let p="lib/settings-host.js"; let c=fs.readFileSync(p,"utf8");
c=c.replace("const { stdout } = await execFileAsync(command, ['-NoProfile', '-STA', '-ExecutionPolicy', 'Bypass', '-Command', script], {\n    timeout: 5 * 60 * 1000,\n    windowsHide: true,","const { stdout } = await execFileAsync(command, ['-NoProfile', '-STA', '-WindowStyle', 'Hidden', '-ExecutionPolicy', 'Bypass', '-Command', script], {\n    timeout: 5 * 60 * 1000,\n    windowsHide: false,");
fs.writeFileSync(p,c,"utf8");
console.log("show native dialog");
