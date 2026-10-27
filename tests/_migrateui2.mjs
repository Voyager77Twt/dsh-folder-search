import fs from "node:fs";
let p="lib/client.js"; let c=fs.readFileSync(p,"utf8");
c=c.replace(`          const migration = data.migration;
          setStatus(migration && migration.moved
            ? \`已保存；已自动迁移 \${migration.moved} 个索引目录\${migration.skipped ? \`，跳过 \${migration.skipped} 个已存在的目标目录\` : ''}。\`
            : '已保存；下一次检索/目录调用生效。');`,
`          const migration = data.migration;
          if (migration && migration.moved) {
            const bits = [\`已自动迁移 \${migration.moved} 个索引目录\`];
            if (migration.removed) bits.push(\`已删除 \${migration.removed} 个旧索引\`);
            if (migration.skipped) bits.push(\`跳过 \${migration.skipped} 个目标已存在的目录\`);
            if (migration.removeFailed?.length) bits.push(\`旧索引删除失败：\${migration.removeFailed.join('、')}\`);
            setStatus('已保存；' + bits.join('；') + '。');
          } else {
            setStatus('已保存；下一次检索/目录调用生效。');
          }`);
c=c.replace("note: '索引缓存目录。留空使用默认 %LOCALAPPDATA%\\\\dsh-library-search；保存时会自动把旧索引复制到新位置，目标已有同名索引则跳过。'","note: '索引缓存目录。留空使用默认 %LOCALAPPDATA%\\\\dsh-library-search；保存时会自动迁移并删除旧索引，目标已有同名索引则跳过并保留旧目录。'");
c=c.replace("              value: settings.cacheDir || '',\n              onChange: (e) => update({ cacheDir: e.target.value }),","              value: settings.cacheDir || '',\n              placeholder: '默认：%LOCALAPPDATA%\\\\dsh-library-search',\n              onChange: (e) => update({ cacheDir: e.target.value }),");
const pkg=JSON.parse(fs.readFileSync("package.json","utf8")); pkg.version="0.5.20"; fs.writeFileSync("package.json",JSON.stringify(pkg,null,2)+"\n","utf8");
fs.writeFileSync("README.md",fs.readFileSync("README.md","utf8").replace("- 版本：`0.5.19`","- 版本：`0.5.20`"),"utf8");
console.log("0.5.20 migration UI/placeholder");
