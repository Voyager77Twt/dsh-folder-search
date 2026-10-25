import fs from "node:fs";
let p="lib/client.js"; let c=fs.readFileSync(p,"utf8");
c=c.replace("      const customKeys = Object.keys(settings.customAssociations || {});\n      const customDisabled = new Set(Array.isArray(settings.customDisabled) ? settings.customDisabled : []);\n","");
const start=c.indexOf("          h(\n            Field,\n            { note: '每行一个：关键词=关联词1,关联词2。");
const end=c.indexOf("          h(\n            'div',\n            { style: { paddingLeft: '28px', display: 'flex', flexDirection: 'column', gap: '8px' } },", start);
if(start<0||end<0) throw new Error('custom block markers missing');
const field=`          h(
            Field,
            { note: '每行一个：关键词=关联词1,关联词2。同一个关键词的自定义词优先，剩余名额用内置词表补齐；不相关的自定义词不会参与检索。' },
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
`;
c=c.slice(0,start)+field+c.slice(end);
fs.writeFileSync(p,c,"utf8");
const pkg=JSON.parse(fs.readFileSync("package.json","utf8")); pkg.version="0.5.15"; fs.writeFileSync("package.json",JSON.stringify(pkg,null,2)+"\n","utf8");
fs.writeFileSync("README.md",fs.readFileSync("README.md","utf8").replace("- 版本：`0.5.14`","- 版本：`0.5.15`"),"utf8");
console.log("custom priority UI");
