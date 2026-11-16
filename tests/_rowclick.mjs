import fs from "node:fs";
let p="lib/client.js"; let c=fs.readFileSync(p,"utf8");
const old=`            h(
              'div',
              { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' } },
              h('span', { style: label }, '题库位置'),
              h('button', {`;
const neu=`            h(
              'div',
              {
                role: 'button',
                tabIndex: 0,
                style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', cursor: 'pointer' },
                onClick: (event) => { event.preventDefault(); selectFolder(); },
                onKeyDown: (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); selectFolder(); } },
              },
              h('span', { style: label }, '题库位置'),
              h('button', {`;
if(!c.includes(old)) throw new Error('heading marker'); c=c.replace(old,neu);
c=c.replace("style: { ...button, opacity: folderPicking ? 0.65 : 1 },","style: { ...button, opacity: folderPicking ? 0.65 : 1, pointerEvents: 'none' },");
fs.writeFileSync(p,c,"utf8");
console.log("row click fallback");
