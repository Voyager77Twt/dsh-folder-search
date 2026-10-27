import fs from "node:fs";
let p="lib/legacy-batch.js"; let c=fs.readFileSync(p,"utf8");
c=c.replace("import { sha1, toPosix, exists } from './util.js';","import { sha1, toPosix, exists } from './util.js';\nimport { convertLegacyToPdf } from './office-convert.js';");
c=c.replace("  const failed = [];\n  let converted = 0;","  let failed = [];\n  let converted = 0;");
c=c.replace("  await convert(entries);\n  return { dir, converted, failed, entries };",`  await convert(entries);

  // 批量脚本失败时，逐个文件单独转换；只有单文件也失败才记为失败。
  if (failed.length) {
    const remaining = [];
    for (const item of failed) {
      const entry = entries.find((candidate) => candidate.src === item.src);
      if (!entry || exists(entry.out)) continue;
      try {
        const pdf = await convertLegacyToPdf(item.src, { timeoutMs: 90000 });
        await fs.writeFile(entry.out, pdf);
        converted += 1;
      } catch {
        remaining.push(item);
      }
    }
    failed = remaining;
  }

  return { dir, converted, failed, entries };`);
fs.writeFileSync(p,c,"utf8");
const pkg=JSON.parse(fs.readFileSync("package.json","utf8")); pkg.version="0.5.26"; fs.writeFileSync("package.json",JSON.stringify(pkg,null,2)+"\n","utf8");
fs.writeFileSync("README.md",fs.readFileSync("README.md","utf8").replace("- 版本：`0.5.25`","- 版本：`0.5.26`"),"utf8");
console.log("individual legacy fallback");
