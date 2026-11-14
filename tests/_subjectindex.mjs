import fs from "node:fs";
let p="lib/index.js"; let c=fs.readFileSync(p,"utf8");
c=c.replace("import { registerSettingsRoute } from './settings-host.js';","import { registerSettingsRoute } from './settings-host.js';\nimport { SUBJECT_IDS } from './subject-dictionaries.js';");
// Remove hardcoded chemistry dictionary block
const start=c.indexOf("/** Common Chinese chemistry association terms, editable through plugin config. */");
const end=c.indexOf("\nfunction numberOr", start);
if(start>=0&&end>start){ c=c.slice(0,start)+c.slice(end+1); }
c=c.replace("    associations: { ...DEFAULT_ASSOCIATIONS, ...(input.associations && typeof input.associations === 'object' ? input.associations : {}) },","    associations: { ...(input.associations && typeof input.associations === 'object' ? input.associations : {}) },");
// Add subject param after keywords block; exact marker
const marker="  match: { type: 'string', enum: ['all', 'any'], description: 'all=文件需包含全部关键词；any=任一即可（默认 any）。' },";
const add="  subject: { type: 'string', enum: SUBJECT_IDS, description: '可选：如果题目明显属于某一学科，选一个以激活该学科的通用关联词；不确定就省略。学科词表只做扩展召回，不是硬分类，也不改变 keywords。' },\n"+marker;
if(!c.includes(marker)) throw new Error('match marker missing');
c=c.replace(marker,add);
fs.writeFileSync(p,c,"utf8");
console.log("subject schema/config");
