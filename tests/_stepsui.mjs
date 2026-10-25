import fs from "node:fs";
let p="lib/client.js"; let c=fs.readFileSync(p,"utf8");
const old=`        h(
          'div',
          { style: card },
          h('p', { style: title }, '结果去重与目录'),`;
const add=`        h(
          'div',
          { style: card },
          h('p', { style: title }, '搜索步骤'),
          h(
            Field,
            { note: '搜索前检查题库更新并补索引；关闭后只查现有缓存，新文件/改动不会出现。' },
            h('input', { type: 'checkbox', style: checkbox, checked: settings.syncBeforeSearch !== false, onChange: (event) => update({ syncBeforeSearch: event.target.checked }) }),
            h('span', { style: { fontSize: '13px' } }, '自动补索引'),
          ),
          h(
            Field,
            { note: '同文件=整个文件里出现即可；同段/页=必须同一段、同一页或同一单元格。越严命中越少。' },
            h('span', { style: label }, '匹配范围'),
            h('select', {
              style: { ...input, width: '120px' },
              value: settings.matchScope || 'file',
              onChange: (event) => update({ matchScope: event.target.value }),
            }, h('option', { value: 'file' }, '同文件'), h('option', { value: 'block' }, '同段/页')),
          ),
          h(
            Field,
            { note: '关闭后只给文件和位置，不回传片段；最省 token，但看不到原句。' },
            h('input', { type: 'checkbox', style: checkbox, checked: settings.includeSnippets !== false, onChange: (event) => update({ includeSnippets: event.target.checked }) }),
            h('span', { style: { fontSize: '13px' } }, '显示命中片段'),
          ),
          h(
            Field,
            { note: '在位置后标出文中题号；汇编卷题号可能重排，关闭可少一点文字。' },
            h('input', { type: 'checkbox', style: checkbox, checked: settings.includeQuestionNumbers !== false, onChange: (event) => update({ includeQuestionNumbers: event.target.checked }) }),
            h('span', { style: { fontSize: '13px' } }, '显示题号'),
          ),
        ),
${old}`;
if(!c.includes(old)) throw new Error('dedupe card marker not found');
c=c.replace(old, add);
fs.writeFileSync(p,c,"utf8");
const pkg=JSON.parse(fs.readFileSync("package.json","utf8")); pkg.version="0.3.4"; fs.writeFileSync("package.json",JSON.stringify(pkg,null,2)+"\n","utf8");
const rd=fs.readFileSync("README.md","utf8").replace("- 版本：`0.3.3`","- 版本：`0.3.4`"); fs.writeFileSync("README.md",rd,"utf8");
console.log("0.3.4 steps ui");
