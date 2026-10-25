import fs from "node:fs";
let p="cordis.patch.yml"; let c=fs.readFileSync(p,"utf8");
c=c.replace(`            config:
              libraries: []
              indexBudgetPerCall: 25
              maxFiles: 25
              maxBlocksPerFile: 4
              cacheCapMB: 250
              maxFileMB: 60`, `            config:
              libraries: []
              indexBudgetPerCall: 25
              maxFiles: 6
              maxBlocksPerFile: 2
              snippetChars: 60
              cacheCapMB: 250
              maxFileMB: 60`);
c=c.replace("                - 只读命中片段；需要看完整题目时才用 library_read（并尽量用 question 限定到某题）。绝不通读整份文件，也绝不声称读过没读的内容。",
"                - 只读命中片段；需要看完整题目时才用 library_read（并尽量用 question 限定到某题）。绝不通读整份文件，也绝不声称读过没读的内容。\n                - 控制成本：同一轮不要连续 outline → search → read 全跑。用户没要目录就直接 search，只回前几个文件；需要更多再追问。");
fs.writeFileSync(p,c,"utf8");
p="README.md"; c=fs.readFileSync(p,"utf8");
c=c.replace("- 版本：`0.2.3`","- 版本：`0.2.4`");
c=c.replace("| `maxFiles` / `maxBlocksPerFile` | `25` / `4` | 检索返回上限 |","| `maxFiles` / `maxBlocksPerFile` | `6` / `2` | 检索返回上限（控制回传 token） |\n| `snippetChars` | `60` | 每处片段字符数 |\n| `dedupe` | `true` | 合并命中内容相同的重复文件 |");
fs.writeFileSync(p,c,"utf8");
p="package.json"; const pkg=JSON.parse(fs.readFileSync(p,"utf8")); pkg.version="0.2.4"; fs.writeFileSync(p,JSON.stringify(pkg,null,2)+"\n","utf8");
console.log("0.2.4");
