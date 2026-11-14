import fs from "node:fs";
let p="lib/index.js"; let c=fs.readFileSync(p,"utf8");
const old=`      output: { schema: { type: 'object', additionalProperties: true }, render: (_args, value) => textRender(
        value.cacheFound
          ? \`已链接本地索引：\${value.cacheDir}\\n文件 \${value.documents} 个；本机匹配 \${value.matched}，需更新 \${value.changed}，缓存多余 \${value.missing}；缓存 \${humanBytes(value.cacheBytes)}\${value.repaired ? \`\\n本次修复：更新 \${value.repaired.changed}，删除 \${value.repaired.removed}，剩余待索引 \${value.repaired.pending}\` : ''}\`
          : \`未找到现成索引（\${value.cacheDir}）；首次检索会按预算建立。\`,
      ) },`;
const neu=`      output: { schema: { type: 'object', additionalProperties: true }, render: (_args, value) => textRender(
        value?.text ?? (value.cacheFound
          ? \`已链接本地索引：\${value.cacheDir}\\n文件 \${value.documents} 个；本机匹配 \${value.matched}，需更新 \${value.changed}，缓存多余 \${value.missing}；缓存 \${humanBytes(value.cacheBytes)}\${value.repaired ? \`\\n本次修复：更新 \${value.repaired.changed}，删除 \${value.repaired.removed}，剩余待索引 \${value.repaired.pending}\` : ''}\`
          : \`未找到现成索引（\${value.cacheDir}）；首次检索会按预算建立。\`),
      ) },`;
if(!c.includes(old)) throw new Error('status render marker');
c=c.replace(old,neu);
const execOld=`      async execute(args) {
        const { settings, config, library, index } = await prepareTool(args, resolved);
        return libraryStatus(index, args ?? {}, config);
      },`;
const execNew=`      async execute(args) {
        const { settings, config, indexes } = await prepareTool(args, resolved);
        const values = [];
        for (const entry of indexes) values.push({ ...(await libraryStatus(entry.index, args ?? {}, config)), library: entry.library });
        if (values.length === 1) return values[0];
        const text = values.map((value) => value.cacheFound
          ? \`\${value.library}\\n已链接本地索引：\${value.cacheDir}\\n文件 \${value.documents} 个；本机匹配 \${value.matched}，需更新 \${value.changed}，缓存多余 \${value.missing}；缓存 \${humanBytes(value.cacheBytes)}\`
          : \`\${value.library}\\n未找到现成索引（\${value.cacheDir}）；首次检索会按预算建立。\`).join('\\n\\n');
        return {
          text,
          libraries: values,
          cacheFound: values.some((value) => value.cacheFound),
          cacheDir: \`\${values.length} 个库\`,
          documents: values.reduce((n, value) => n + (value.documents ?? 0), 0),
          matched: values.reduce((n, value) => n + (value.matched ?? 0), 0),
          changed: values.reduce((n, value) => n + (value.changed ?? 0), 0),
          failed: values.reduce((n, value) => n + (value.failed ?? 0), 0),
          missing: values.reduce((n, value) => n + (value.missing ?? 0), 0),
          cacheBytes: values.reduce((n, value) => n + (value.cacheBytes ?? 0), 0),
        };
      },`;
if(!c.includes(execOld)) throw new Error('status exec marker');
c=c.replace(execOld,execNew);
fs.writeFileSync(p,c,"utf8");
console.log("multi status aggregation");
