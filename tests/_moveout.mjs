import fs from "node:fs";
let p="lib/client.js"; let c=fs.readFileSync(p,"utf8");
const startMarker=`        h(
          'div',
          { style: card },
          h('p', { style: title }, '输出与花费（普通检索）'),`;
const endMarker=`        h(
          'div',
          { style: card },
          h('p', { style: title }, '搜索步骤（按顺序执行，可单独关闭）'),`;
const i=c.indexOf(startMarker), j=c.indexOf(endMarker);
if(i<0||j<0||j<i) throw new Error('normal card markers missing');
c=c.slice(0,i)+c.slice(j);
const step2=`          h(
            Step,
            { index: 2, note: '执行 1 次，始终执行：用你给的关键词搜缓存；这是唯一必开的步骤。' },
            h('input', { type: 'checkbox', style: checkbox, checked: true, disabled: true }),
            h('span', { style: { fontSize: '13px' } }, '原词检索（必开）'),
          ),`;
const normalFields=`${step2}
          h(
            'div',
            { style: { paddingLeft: '28px', display: 'flex', flexDirection: 'column', gap: '8px' } },
            h(
              Field,
              { note: '只作用于直接命中原词的文件。“全部”最全也最贵；关联词命中的文件用下面第 4/5 步的“关联词输出”上限。' },
              h('span', { style: label }, '原词检索·输出文件数'),
              h('input', { type: 'checkbox', style: checkbox, checked: allFiles, onChange: (e) => update({ normalMaxFiles: e.target.checked ? 'all' : 25 }) }),
              h('span', { style: { fontSize: '13px' } }, '全部'),
              h('input', {
                type: 'number', min: 1, max: 5000, style: input, disabled: allFiles,
                value: allFiles ? '' : num(settings.normalMaxFiles, 25),
                onChange: (e) => update({ normalMaxFiles: num(e.target.value, 1) }),
              }),
            ),
            h(
              Field,
              { note: '直接命中的文件，每个最多列几处；总数仍会显示“另有 N 处未显示”。' },
              h('span', { style: label }, '原词检索·每文件位置数'),
              h('input', { type: 'number', min: 1, max: 50, style: input, value: num(settings.normalMaxBlocksPerFile, 4), onChange: (e) => update({ normalMaxBlocksPerFile: num(e.target.value, 1) }) }),
            ),
            h(
              Field,
              { note: '直接命中的片段截取多少字；越短越省 token。' },
              h('span', { style: label }, '原词检索·片段长度'),
              h('input', { type: 'number', min: 20, max: 400, style: input, value: num(settings.normalSnippetChars, 90), onChange: (e) => update({ normalSnippetChars: num(e.target.value, 20) }) }),
            ),
          ),`;
if(!c.includes(step2)) throw new Error('step2 marker missing');
c=c.replace(step2, normalFields);
fs.writeFileSync(p,c,"utf8");
console.log("normal output moved under step 2");
