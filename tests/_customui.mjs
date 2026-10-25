import fs from "node:fs";
let p="lib/client.js"; let c=fs.readFileSync(p,"utf8");
c=c.replace("    function num(value, fallback) {", `    function assocTextOf(map) {
      return Object.entries(map || {}).map(([key, values]) => key + '=' + values.join(',')).join('\\n');
    }
    function parseAssocText(text) {
      const out = {};
      for (const line of String(text || '').split(/\\r?\\n/)) {
        const at = line.indexOf('=');
        if (at <= 0) continue;
        const key = line.slice(0, at).trim();
        const values = line.slice(at + 1).split(/[,，]/).map((v) => v.trim()).filter(Boolean).slice(0, 8);
        if (key && values.length) out[key] = values;
      }
      return out;
    }

    function num(value, fallback) {`);
c=c.replace("      const [status, setStatus] = React.useState('');","      const [status, setStatus] = React.useState('');\n      const [customText, setCustomText] = React.useState('');");
c=c.replace("              setSettings(data.settings);\n              setDefaults(data.defaults || null);","              setSettings(data.settings);\n              setCustomText(assocTextOf(data.settings.customAssociations));\n              setDefaults(data.defaults || null);");
c=c.replace("          setSettings(data.settings);\n          setDefaults(data.defaults || defaults);","          setSettings(data.settings);\n          setCustomText(assocTextOf(data.settings.customAssociations));\n          setDefaults(data.defaults || defaults);");
c=c.replace("index: 3, note: '执行 1 次，与第 2 步合并扫描。让模型自己想一个与主题同指的专名（人物、旧称、别名、缩写、简称），不是“纯碱工业”这类领域词；开启后才接受模型的强关联词。过宽时按普通输出截断，不再补搜。'","index: 3, note: '执行 1 次，与第 2 步合并扫描。模型自检：主题有没有“人 / 旧称 / 缩写 / 别名”？有就填 1 个专名，没有就留空；不要填父类/领域词。工具会检查广度，过宽或非最窄的降级，不会二次搜索。'");
const marker = `          h(
            'div',
            { style: { paddingLeft: '28px', display: 'flex', flexDirection: 'column', gap: '8px' } },
            h(
              Field,
              { note: '第 4 步（自动词表）或第 5 步（一般关联）触发时共用：最多列多少文件。普通原词检索不用它。' },`;
const customField = `          h(
            Field,
            { note: '每行一个：关键词=关联词1,关联词2。留空使用内置词表；同名关键词会覆盖内置条目，新增条目会追加。' },
            h('span', { style: label }, '自定义词表'),
            h('textarea', {
              style: { ...input, width: '100%', minHeight: '78px', fontFamily: 'inherit', resize: 'vertical' },
              value: customText,
              onChange: (event) => {
                setCustomText(event.target.value);
                update({ customAssociations: parseAssocText(event.target.value) });
              },
            }),
          ),
          h(
            'div',
            { style: { paddingLeft: '28px', display: 'flex', flexDirection: 'column', gap: '8px' } },
            h(
              Field,
              { note: '第 4 步（自动词表）或第 5 步（一般关联）触发时共用：最多列多少文件。普通原词检索不用它。' },`;
if(!c.includes(marker)) throw new Error('step4 marker not found');
c=c.replace(marker, customField);
fs.writeFileSync(p,c,"utf8");
console.log("custom dictionary UI");
