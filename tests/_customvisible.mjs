import fs from "node:fs";
let p="lib/client.js"; let c=fs.readFileSync(p,"utf8");
const startMarker=`          h(
            Field,
            { note: '每行一个：关键词=关联词1,关联词2。同一个关键词的自定义词优先，剩余名额用内置词表补齐；不相关的自定义词不会参与检索。' },`;
const start=c.indexOf(startMarker);
if(start<0) throw new Error('custom block start missing');
const endMarker=`          h(
            'div',
            { style: { paddingLeft: '28px', display: 'flex', flexDirection: 'column', gap: '8px' } },`;
const end=c.indexOf(endMarker,start);
if(end<0) throw new Error('custom block end missing');
c=c.slice(0,start)+c.slice(end);
const wrapper=`          h(
            'div',
            { style: { display: customMode ? 'flex' : 'none', flexDirection: 'column', gap: '0px' } },`;
const insert=`          settings.searchMode === 'original' ? null : h(
            'div',
            { style: { display: 'flex', flexDirection: 'column', gap: '8px', padding: '10px 12px', border: '1px solid var(--dsw-alias-border-secondary, rgba(128,128,128,.28))', borderRadius: '8px' } },
            h('p', { style: title }, '自定义词表'),
            h(
              Field,
              { note: '每行一个：关键词=关联词1,关联词2。同一个关键词的自定义词优先。默认、全面、自定义模式都会使用此表；原词搜索不使用。' },
              h('textarea', {
                style: { ...input, width: '100%', minHeight: '78px', fontFamily: 'inherit', resize: 'vertical' },
                value: customText,
                onChange: (event) => {
                  setCustomText(event.target.value);
                  update({ customAssociations: parseAssocText(event.target.value) });
                },
              }),
            ),
          ),
${wrapper}`;
if(!c.includes(wrapper)) throw new Error('wrapper missing');
c=c.replace(wrapper,insert);
fs.writeFileSync(p,c,"utf8");
console.log("custom dictionary moved outside custom-only steps");
