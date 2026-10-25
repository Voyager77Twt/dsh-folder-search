import fs from "node:fs";
const p="tests/preconvert_chunked.mjs";
let c=fs.readFileSync(p,"utf8");
c=c.replace("async function convert(chunk) {\n  if (!chunk.length) return;", `async function convert(chunk) {
  if (!chunk.length) return;
  if (chunk.length > 15) {
    for (let i = 0; i < chunk.length; i += 15) {
      await convert(chunk.slice(i, i + 15));
    }
    return;
  }`);
c=c.replace("  const timeout = 60000 + stillMissing.length * 5000;","  const timeout = 30000 + stillMissing.length * 5000;");
fs.writeFileSync(p,c,"utf8");
console.log("chunking fixed");
