import fs from "node:fs";
let p="lib/client.js"; let c=fs.readFileSync(p,"utf8");
c=c.replace("      const assocAll = settings.expandMaxFiles === 'all' || Number(settings.expandMaxFiles) >= 5000;","      const assocAll = settings.expandMaxFiles === 'all' || Number(settings.expandMaxFiles) >= 5000;\n      const strongAll = settings.strongMaxFiles === 'all' || Number(settings.strongMaxFiles) >= 5000;");
c=c.replace("1 → 2 → 3/4/5 → 6 → 7 → 8 → 9 执行","1 → 2 → 3/4/5 → 6 → 7 → 8 → 9 → 10 执行");
const step3=`          h(
            Step,
            { index: 3, note: '执行 1 次，与第 2 步合并扫描。模型自检：主题有没有“人 / 旧称 / 缩写 / 别名”？有就填 1 个专名，没有就留空；不要填父类/领域词。工具会检查广度，过宽或非最窄的降级，不会二次搜索。' },
            h('input', { type: 'checkbox', style: checkbox, checked: settings.enableStrong !== false, onChange: (e) => update({ enableStrong: e.target.checked }) }),
            h('span', { style: { fontSize: '13px' } }, '强关联词'),
            h('span', { style: { ...label, minWidth: 'auto' } }, '上限'),
            h('input', { type: 'number', min: 0, max: 4, style: input, value: num(settings.strongLimit, 1), onChange: (e) => update({ strongLimit: Math.max(0, num(e.target.value, 1)) }) }),
          ),`;
const strongFields=`${step3}
          h(
            'div',
            { style: { paddingLeft: '28px', display: 'flex', flexDirection: 'column', gap: '8px' } },
            h(
              Field,
              { note: '选择什么算“过宽”：文件数阈值、占全库比例、领域词结尾，或三者任一。' },
              h('span', { style: label }, '降级判定'),
              h('select', { style: { ...input, width: '150px' }, value: settings.strongGateMode || 'all', onChange: (e) => update({ strongGateMode: e.target.value }) },
                h('option', { value: 'files' }, '文件数超过阈值'),
                h('option', { value: 'ratio' }, '占比超过阈值'),
                h('option', { value: 'domain' }, '以领域词结尾'),
                h('option', { value: 'all' }, '以上任一'),
              ),
            ),
            h(
              Field,
              { note: '强关联词单独命中超过多少个文件就降级；模式含“文件数”时生效。' },
              h('span', { style: label }, '文件数阈值'),
              h('input', { type: 'number', min: 1, max: 5000, style: input, value: num(settings.strongGateFiles, 30), onChange: (e) => update({ strongGateFiles: num(e.target.value, 30) }) }),
            ),
            h(
              Field,
              { note: '强关联词命中文件占全库比例超过多少（%）就降级；模式含“占比”时生效。' },
              h('span', { style: label }, '占比阈值（%）'),
              h('input', { type: 'number', min: 1, max: 100, style: input, value: num(settings.strongGateRatio, 20), onChange: (e) => update({ strongGateRatio: num(e.target.value, 20) }) }),
            ),
            h(
              Field,
              { note: '强关联词命中的文件单独使用这些输出上限，不与第 4/5 步共用。' },
              h('span', { style: label }, '强关联输出·最多文件数'),
              h('input', { type: 'checkbox', style: checkbox, checked: strongAll, onChange: (e) => update({ strongMaxFiles: e.target.checked ? 'all' : 6 }) }),
              h('span', { style: { fontSize: '13px' } }, '全部'),
              h('input', { type: 'number', min: 1, max: 5000, style: input, disabled: strongAll, value: strongAll ? '' : num(settings.strongMaxFiles, 6), onChange: (e) => update({ strongMaxFiles: num(e.target.value, 6) }) }),
            ),
            h(
              Field,
              { note: '强关联命中的每个文件最多列几处位置。' },
              h('span', { style: label }, '强关联输出·每文件位置数'),
              h('input', { type: 'number', min: 1, max: 50, style: input, value: num(settings.strongMaxBlocksPerFile, 2), onChange: (e) => update({ strongMaxBlocksPerFile: num(e.target.value, 2) }) }),
            ),
            h(
              Field,
              { note: '强关联命中的每段片段多少字。' },
              h('span', { style: label }, '强关联输出·片段长度'),
              h('input', { type: 'number', min: 20, max: 400, style: input, value: num(settings.strongSnippetChars, 45), onChange: (e) => update({ strongSnippetChars: num(e.target.value, 45) }) }),
            ),
          ),`;
if(!c.includes(step3)) throw new Error('step3 marker missing');
c=c.replace(step3,strongFields);
const step9=`          h(
            Step,
            { index: 9, note: '合并命中内容完全相同的文件（同一套卷的 doc/pdf 等）；会少列文件，默认关闭。' },
            h('input', { type: 'checkbox', style: checkbox, checked: settings.dedupe === true, onChange: (e) => update({ dedupe: e.target.checked }) }),
            h('span', { style: { fontSize: '13px' } }, '合并重复文件'),
          ),`;
const step10=`${step9}
          h(
            Step,
            { index: 10, note: '第 3 步的强关联词被降级时，是否用剩余强关联词再搜；重复次数在本工具调用内完成，不增加模型往返。' },
            h('input', { type: 'checkbox', style: checkbox, checked: settings.strongRetry === true, onChange: (e) => update({ strongRetry: e.target.checked }) }),
            h('span', { style: { fontSize: '13px' } }, '降级后重复搜索'),
            h('span', { style: { ...label, minWidth: 'auto' } }, '最多'),
            h('input', { type: 'number', min: 0, max: 5, style: input, value: num(settings.strongRetryMax, 1), onChange: (e) => update({ strongRetryMax: num(e.target.value, 1) }) }),
            h('span', { style: { fontSize: '13px' } }, '遍'),
          ),`;
if(!c.includes(step9)) throw new Error('step9 marker missing');
c=c.replace(step9,step10);
fs.writeFileSync(p,c,"utf8");
console.log("step10 and strong controls");
