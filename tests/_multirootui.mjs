import fs from "node:fs";
let p="lib/client.js"; let c=fs.readFileSync(p,"utf8");
const old=`            { note: '题库/数据库文件夹的绝对路径。填好后新会话会自动使用，不再先问路径；留空则仍需在对话里提供。' },
            h('span', { style: label }, '题库位置'),
            h('input', {
              type: 'text',
              style: { ...input, width: '100%' },
              value: settings.libraryRoot || '',
              onChange: (e) => update({ libraryRoot: e.target.value }),
            }),`;
const neu=`            { note: '一个或多个题库文件夹的绝对路径，用逗号或换行分隔。每个题库单独建索引；删除其中一个不会影响其他题库的缓存。' },
            h('span', { style: label }, '题库位置'),
            h('textarea', {
              style: { ...input, width: '100%', minHeight: '64px', fontFamily: 'inherit', resize: 'vertical' },
              value: (settings.libraryRoots || (settings.libraryRoot ? [settings.libraryRoot] : [])).join('\\n'),
              onChange: (e) => {
                const roots = e.target.value.split(/[,，\\n]/).map((item) => item.trim()).filter(Boolean);
                update({ libraryRoots: roots, libraryRoot: roots[0] || '' });
              },
            }),`;
if(!c.includes(old)) throw new Error('library field marker missing');
c=c.replace(old,neu);
c=c.replace("disabled: indexBusy || idx.running || !settings.libraryRoot","disabled: indexBusy || idx.running || !(settings.libraryRoots?.length || settings.libraryRoot)");
fs.writeFileSync(p,c,"utf8");
console.log("multi library UI");
