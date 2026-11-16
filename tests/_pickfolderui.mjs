import fs from "node:fs";
let p="lib/client.js"; let c=fs.readFileSync(p,"utf8");
c=c.replace("const API = '/api/dsh-folder-search/settings';\nconst INDEX_API = '/api/dsh-folder-search/index';","const API = '/api/dsh-folder-search/settings';\nconst INDEX_API = '/api/dsh-folder-search/index';\nconst PICK_API = '/api/dsh-folder-search/pick-folder';");
c=c.replace("      const [libraryText, setLibraryText] = React.useState('');\n      const [busy, setBusy] = React.useState(false);","      const [libraryText, setLibraryText] = React.useState('');\n      const [folderPicking, setFolderPicking] = React.useState(false);\n      const [busy, setBusy] = React.useState(false);");
const marker="      const save = async () => {";
const add=`      const selectFolder = async () => {
        setFolderPicking(true);
        setStatus('');
        try {
          const response = await fetch(PICK_API, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: '{}',
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.error || 'HTTP ' + response.status);
          if (data.cancelled) return;
          const selected = String(data.path || '').trim();
          if (!selected) return;
          const current = (settings.libraryRoots?.length ? settings.libraryRoots : libraryText.split(/[,，\\n]/))
            .map((item) => String(item).trim()).filter(Boolean);
          if (current.some((item) => item.toLowerCase() === selected.toLowerCase())) {
            setStatus('该文件夹已在题库列表中。');
            return;
          }
          const next = [...current, selected];
          setLibraryText(next.join('\\n'));
          update({ libraryRoots: next, libraryRoot: next[0] || '' });
          setStatus('已添加题库：' + selected);
        } catch (error) {
          setStatus('选择文件夹失败：' + (error && error.message ? error.message : String(error)));
        } finally {
          setFolderPicking(false);
        }
      };

${marker}`;
if(!c.includes(marker)) throw new Error('save marker'); c=c.replace(marker,add);
const oldField=`            h('span', { style: label }, '题库位置'),
            h('textarea', {`;
const newField=`            h(
              'div',
              { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' } },
              h('span', { style: label }, '题库位置'),
              h('button', { type: 'button', style: button, disabled: busy || folderPicking, onClick: selectFolder }, folderPicking ? '选择中…' : '选择文件夹'),
            ),
            h('textarea', {`;
if(!c.includes(oldField)) throw new Error('library field marker'); c=c.replace(oldField,newField);
const start=c.indexOf("    const EN = "); const end=c.indexOf("\n    const isEnglish",start);
const en=JSON.parse(c.slice(start+"    const EN = ".length,end).trim().replace(/;$/,''));
Object.assign(en,{
  '选择文件夹':'Choose folder',
  '选择中…':'Choosing…',
  '该文件夹已在题库列表中。':'This folder is already in the library list.',
  '已添加题库：':'Library added: ',
  '选择文件夹失败：':'Choose folder failed: '
});
c=c.slice(0,start)+"    const EN = "+JSON.stringify(en,null,2)+";"+c.slice(end);
fs.writeFileSync(p,c,"utf8");
console.log("folder picker UI");
