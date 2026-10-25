import fs from "node:fs";
let p="lib/client.js"; let c=fs.readFileSync(p,"utf8");
// helpers + state
c=c.replace("    function num(value, fallback) {", `    function strongTextOf(map) {
      return Object.entries(map || {}).map(([key, values]) => key + '=' + values.join(',')).join('\\n');
    }
    function parseStrongText(text) {
      const out = {};
      for (const line of String(text || '').split(/\\r?\\n/)) {
        const at = line.indexOf('=');
        if (at <= 0) continue;
        const key = line.slice(0, at).trim();
        const values = line.slice(at + 1).split(/[,，]/).map((v) => v.trim()).filter(Boolean).slice(0, 4);
        if (key && values.length) out[key] = values;
      }
      return out;
    }

    function num(value, fallback) {`);
c=c.replace("      const [status, setStatus] = React.useState('');","      const [status, setStatus] = React.useState('');\n      const [strongText, setStrongText] = React.useState('');");
c=c.replace("              setSettings(data.settings);\n              setDefaults(data.defaults || null);","              setSettings(data.settings);\n              setStrongText(strongTextOf(data.settings.strongAssociations));\n              setDefaults(data.defaults || null);");
c=c.replace("          setSettings(data.settings);\n          setDefaults(data.defaults || defaults);","          setSettings(data.settings);\n          setStrongText(strongTextOf(data.settings.strongAssociations));\n          setDefaults(data.defaults || defaults);");
// insert strong card before 搜索步骤 card
const marker=`        h(
          'div',
          { style: card },
          h('p', { style: title }, '搜索步骤'),`;
const strongCard=`        h(
          'div',
          { style: card },
          h('p', { style: title }, '强关联词'),
          h(
            Field,
            { note: '每次检索至少带 1 个强关联词（例如 侯氏制碱法 → 侯德榜），在第一次检索就一起搜，避免为了补别名再搜一次。默认 1，不能为 0。' },
            h('span', { style: label }, '每轮强关联词数'),
            h('input', {
              type: 'number',
              min: 1,
              max: 4,
              style: input,
              value: num(settings.strongLimit, 1),
              onChange: (event) => update({ strongLimit: Math.max(1, num(event.target.value, 1)) }),
            }),
          ),
          h(
            Field,
            { note: '每行一个：关键词=关联词1,关联词2。用于侯氏制碱法=侯德榜这类固定别名；最多每行 4 个。' },
            h('textarea', {
              style: { ...input, width: '100%', minHeight: '84px', fontFamily: 'inherit', resize: 'vertical' },
              value: strongText,
              onChange: (event) => {
                setStrongText(event.target.value);
                update({ strongAssociations: parseStrongText(event.target.value) });
              },
            }),
          ),
        ),
${marker}`;
if(!c.includes(marker)) throw new Error('step card marker not found');
c=c.replace(marker, strongCard);
fs.writeFileSync(p,c,"utf8");
// persona rule
p="cordis.patch.yml"; c=fs.readFileSync(p,"utf8");
c=c.replace("                - 多关键词的匹配方式按用户说法决定：", "                - 第一次检索会自动带上强关联词（如 侯氏制碱法 → 侯德榜），不要把同一个问题先搜一次再补别名；一次把关键词给全，必要时再补搜。\n                - 多关键词的匹配方式按用户说法决定：");
fs.writeFileSync(p,c,"utf8");
const pkg=JSON.parse(fs.readFileSync("package.json","utf8")); pkg.version="0.4.0"; fs.writeFileSync("package.json",JSON.stringify(pkg,null,2)+"\n","utf8");
const rd=fs.readFileSync("README.md","utf8").replace("- 版本：`0.3.8`","- 版本：`0.4.0`"); fs.writeFileSync("README.md",rd,"utf8");
console.log("0.4.0 strong ui");
