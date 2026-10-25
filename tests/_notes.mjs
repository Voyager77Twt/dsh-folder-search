import fs from "node:fs";
let p="lib/client.js"; let c=fs.readFileSync(p,"utf8");
const old=`          h(
            Field,
            { note: '只有扩展真正生效时才用这三项；普通关键词仍用上面的普通检索设置。' },
            h('span', { style: label }, '扩展检索·最多文件数'),
            h('input', {
              type: 'number',
              min: 1,
              max: 5000,
              style: input,
              value: num(settings.expandMaxFiles, 8),
              onChange: (event) => update({ expandMaxFiles: num(event.target.value, 1) }),
            }),
            h('span', { style: label }, '扩展检索·每文件位置数'),
            h('input', {
              type: 'number',
              min: 1,
              max: 50,
              style: input,
              value: num(settings.expandMaxBlocksPerFile, 2),
              onChange: (event) => update({ expandMaxBlocksPerFile: num(event.target.value, 1) }),
            }),
            h('span', { style: label }, '扩展检索·片段长度'),
            h('input', {
              type: 'number',
              min: 20,
              max: 400,
              style: input,
              value: num(settings.expandSnippetChars, 45),
              onChange: (event) => update({ expandSnippetChars: num(event.target.value, 20) }),
            }),
          ),`;
const neu=`          h(
            Field,
            { note: '只有“自动关联词词表”真的被触发时才用这一项：最多列多少个文件。普通关键词检索不用它；数字越小越省 token。' },
            h('span', { style: label }, '扩展检索·最多文件数'),
            h('input', {
              type: 'number',
              min: 1,
              max: 5000,
              style: input,
              value: num(settings.expandMaxFiles, 8),
              onChange: (event) => update({ expandMaxFiles: num(event.target.value, 1) }),
            }),
          ),
          h(
            Field,
            { note: '扩展检索触发时，每个文件最多列几处命中位置；总数仍会显示“另有 N 处未显示”。' },
            h('span', { style: label }, '扩展检索·每文件位置数'),
            h('input', {
              type: 'number',
              min: 1,
              max: 50,
              style: input,
              value: num(settings.expandMaxBlocksPerFile, 2),
              onChange: (event) => update({ expandMaxBlocksPerFile: num(event.target.value, 1) }),
            }),
          ),
          h(
            Field,
            { note: '扩展检索触发时，每处命中截取多少字；越短越省 token，但可能看不全题干。' },
            h('span', { style: label }, '扩展检索·片段长度'),
            h('input', {
              type: 'number',
              min: 20,
              max: 400,
              style: input,
              value: num(settings.expandSnippetChars, 45),
              onChange: (event) => update({ expandSnippetChars: num(event.target.value, 20) }),
            }),
          ),`;
if(!c.includes(old)) throw new Error('expansion fields marker not found');
c=c.replace(old,neu);
c=c.replace("note: '打开后，“有机”会扩展成 烃/醇/醛/羧酸/酯 等常见关联词再搜，命中更多、范围更宽；关闭则只按原词匹配。'","note: '这是插件内置词表：打开后，“有机”会扩成 烃/醇/醛/羧酸/酯 等常见关联词再搜，命中更宽；关闭则只按原词和模型给的关联词匹配。它和下面的“模型补充关联词”是两套。'");
fs.writeFileSync(p,c,"utf8");
const pkg=JSON.parse(fs.readFileSync("package.json","utf8")); pkg.version="0.4.4"; fs.writeFileSync("package.json",JSON.stringify(pkg,null,2)+"\n","utf8");
const rd=fs.readFileSync("README.md","utf8").replace("- 版本：`0.4.3`","- 版本：`0.4.4`"); fs.writeFileSync("README.md",rd,"utf8");
console.log("0.4.4 notes completed");
