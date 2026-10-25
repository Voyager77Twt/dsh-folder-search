import fs from "node:fs";
const p="tests/preconvert_chunked.mjs";
let c=fs.readFileSync(p,"utf8");
c=c.replace("  const timeout = 30000 + stillMissing.length * 8000;","  const timeout = 20000 + stillMissing.length * 4000;");
c=c.replace(`  const missingAfter = stillMissing.filter((item) => !fs.existsSync(item.out));
  for (const item of stillMissing) if (!missingAfter.includes(item)) converted += 1;
  console.log(\`chunk=\${stillMissing.length} done=\${stillMissing.length - missingAfter.length} missingAfter=\${missingAfter.length}\${timedOut ? ' timeout' : ''}\`);
  if (!missingAfter.length) return;
  if (!timedOut) {
    // Individual failures, not a hang: split to isolate.
  }
  const mid = Math.ceil(missingAfter.length / 2);
  await convert(missingAfter.slice(0, mid));
  await convert(missingAfter.slice(mid));`,
`  const missingAfter = stillMissing.filter((item) => !fs.existsSync(item.out));
  for (const item of stillMissing) if (!missingAfter.includes(item)) converted += 1;
  console.log(\`chunk=\${stillMissing.length} done=\${stillMissing.length - missingAfter.length} missingAfter=\${missingAfter.length}\${timedOut ? ' timeout' : ''}\`);
  if (!missingAfter.length) return;
  if (timedOut) {
    const stuck = missingAfter[0];
    failed.push({ src: stuck.src, timedOut: true });
    console.log('SKIP', path.basename(stuck.src));
    await convert(missingAfter.slice(1));
    return;
  }
  const mid = Math.ceil(missingAfter.length / 2);
  await convert(missingAfter.slice(0, mid));
  await convert(missingAfter.slice(mid));`);
fs.writeFileSync(p,c,"utf8");
console.log("patched skip-first");
