import fs from "node:fs";
const p="tests/preconvert_chunked.mjs";
let c=fs.readFileSync(p,"utf8");
c=c.replace("if (chunk.length > 15) {\n    for (let i = 0; i < chunk.length; i += 15) {\n      await convert(chunk.slice(i, i + 15));","if (chunk.length > 10) {\n    for (let i = 0; i < chunk.length; i += 10) {\n      await convert(chunk.slice(i, i + 10));");
c=c.replace("const timeout = 30000 + stillMissing.length * 5000;","const timeout = 30000 + stillMissing.length * 8000;");
c=c.replace("      try {\n        spawn('taskkill', ['/IM', 'WINWORD.EXE', '/F'], { windowsHide: true });\n      } catch {\n        /* ignore */\n      }","      try {\n        spawn('taskkill', ['/IM', 'WINWORD.EXE', '/F'], { windowsHide: true });\n      } catch {\n        /* ignore */\n      }");
c=c.replace("    child.on('close', async () => {\n      clearTimeout(timer);","    child.on('close', async () => {\n      clearTimeout(timer);\n      if (timedOut) await new Promise((resolve) => setTimeout(resolve, 3000));");
fs.writeFileSync(p,c,"utf8");
console.log("patched chunk timeouts");
