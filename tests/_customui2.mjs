import fs from "node:fs";
let p="lib/client.js"; let c=fs.readFileSync(p,"utf8");
c=c.replace("      const allFiles = settings.normalMaxFiles === 'all';","      const allFiles = settings.normalMaxFiles === 'all';\n      const customKeys = Object.keys(settings.customAssociations || {});\n      const customDisabled = new Set(Array.isArray(settings.customDisabled) ? settings.customDisabled : []);");
c=c.replace("                update({ customAssociations: parseAssocText(event.target.value) });","                const parsed = parseAssocText(event.target.value);\n                update({ customAssociations: parsed, customDisabled: (settings.customDisabled || []).filter((key) => parsed[key]) });");
const customBlock=`          h(
            Field,
            { note: '每行一个：关键词=关联词1,关联词2。留空使用内置词表；同名关键词会覆盖内置条目，新增条目会追加。' },
            h('span', { style: label }, '自定义词表'),
            h('textarea', {
              style: { ...input, width: '100%', minHeight: '78px', fontFamily: 'inherit', resize: 'vertical' },
              value: customText,
              onChange: (event) => {
                const parsed = parseAssocText(event.target.value);
                update({ customAssociations: parsed, customDisabled: (settings.customDisabled || []).filter((key) => parsed[key]) });
              },
            }),
          ),`;
const customNew=`          h(
            Field,
            { note: '每行一个：关键词=关联词1,关联词2。留空使用内置词表；同名关键词会覆盖内置条目，新增条目会追加。只有下面勾选的条目参与检索。' },
            h('span', { style: label }, '自定义词表'),
            h('textarea', {
              style: { ...input, width: '100%', minHeight: '78px', fontFamily: 'inherit', resize: 'vertical' },
              value: customText,
              onChange: (event) => {
                const parsed = parseAssocText(event.target.value);
                update({ customAssociations: parsed, customDisabled: (settings.customDisabled || []).filter((key) => parsed[key]) });
              },
            }),
          ),
          h(
            'div',
            { style: { paddingLeft: '28px', display: 'flex', flexDirection: 'column', gap: '6px' } },
            h(
              Field,
              { note: '关闭后整张自定义词表都不参与检索，内置词表仍按第 4 步开关执行。' },
              h('input', { type: 'checkbox', style: checkbox, checked: settings.customEnabled !== false, onChange: (e) => update({ customEnabled: e.target.checked }) }),
              h('span', { style: { fontSize: '13px' } }, '启用自定义词表'),
            ),
            customKeys.length ? h('p', { style: note }, '勾选参与检索的条目；不勾选的词条不会被搜索：') : null,
            ...customKeys.map((key) => h(
              'label',
              { key, style: { display: 'flex', gap: '8px', alignItems: 'center', fontSize: '13px' } },
              h('input', {
                type: 'checkbox',
                style: checkbox,
                checked: !customDisabled.has(key),
                disabled: settings.customEnabled === false,
                onChange: (e) => {
                  const next = new Set(settings.customDisabled || []);
                  if (e.target.checked) next.delete(key); else next.add(key);
                  update({ customDisabled: [...next] });
                },
              }),
              key,
            )),
          ),`;
if(!c.includes(customBlock)) throw new Error('custom block marker missing');
c=c.replace(customBlock,customNew);
fs.writeFileSync(p,c,"utf8");
console.log("custom selection ui");
