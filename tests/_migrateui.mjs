import fs from "node:fs";
let p="lib/client.js"; let c=fs.readFileSync(p,"utf8");
c=c.replace("          setStatus('已保存；下一次检索/目录调用生效。');","          const migration = data.migration;\n          setStatus(migration && migration.moved\n            ? `已保存；已自动迁移 ${migration.moved} 个索引目录${migration.skipped ? `，跳过 ${migration.skipped} 个已存在的目标目录` : ''}。`\n            : '已保存；下一次检索/目录调用生效。');");
c=c.replace("note: '索引缓存目录。留空使用默认 %LOCALAPPDATA%\\\\dsh-library-search；修改后已有索引不会自动搬到新位置，可先复制整个 lib-<hash> 文件夹。'","note: '索引缓存目录。留空使用默认 %LOCALAPPDATA%\\\\dsh-library-search；保存时会自动把旧索引复制到新位置，目标已有同名索引则跳过。'");
fs.writeFileSync(p,c,"utf8");
const pkg=JSON.parse(fs.readFileSync("package.json","utf8")); pkg.version="0.5.19"; fs.writeFileSync("package.json",JSON.stringify(pkg,null,2)+"\n","utf8");
fs.writeFileSync("README.md",fs.readFileSync("README.md","utf8").replace("- 版本：`0.5.18`","- 版本：`0.5.19`"),"utf8");
console.log("0.5.19 migration UI");
