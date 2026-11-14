import fs from "node:fs";
let p="lib/client.js"; let src=fs.readFileSync(p,"utf8");
const start=src.indexOf("    const EN = "); const end=src.indexOf("\n    const isEnglish",start);
const raw=src.slice(start+"    const EN = ".length,end).trim().replace(/;$/,'');
const en=JSON.parse(raw);
Object.assign(en,{
  '这里控制检索输出、题库位置和索引位置。只改输出不会重建索引；修改题库/索引路径并保存后会自动开始建库。':'Controls search output, library path and index path. Output-only changes do not rebuild; saving a path change starts indexing.',
  '仅保存设置':'Save settings only',
  '保存并开始/继续建库':'Save & start/continue indexing',
  '正在保存并启动建索引…':'Saving and starting indexing…',
  '已保存；已开始建索引。':'Saved; indexing started.',
  '启动建索引失败：':'Failed to start indexing: ',
  '正在启动建索引…':'Starting indexing…',
  '已开始建索引。':'Indexing started.',
  '读取失败':'Read failed',
  '读取失败：':'Read failed: ',
  '保存失败：':'Save failed: '
});
src=src.slice(0,start)+"    const EN = "+JSON.stringify(en,null,2)+";"+src.slice(end);
fs.writeFileSync(p,src,"utf8");
console.log("remaining EN added");
