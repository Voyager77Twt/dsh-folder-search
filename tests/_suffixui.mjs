import fs from "node:fs";
let p="lib/client.js"; let c=fs.readFileSync(p,"utf8");
if(!c.includes("function parseSuffixText")) c=c.replace("    function parseAssocText(text) {","    function parseSuffixText(text) {\n      return String(text || '').split(/[,，\\n]/).map((item) => item.trim()).filter(Boolean).slice(0, 50);\n    }\n\n    function parseAssocText(text) {");
c=c.replace("      const [customText, setCustomText] = React.useState('');","      const [customText, setCustomText] = React.useState('');\n      const [suffixText, setSuffixText] = React.useState('');");
c=c.replace("              setCustomText(assocTextOf(data.settings.customAssociations));","              setCustomText(assocTextOf(data.settings.customAssociations));\n              setSuffixText((data.settings.strongGateSuffixes || []).join('\\n'));");
c=c.replace("        setCustomText(assocTextOf(data.settings.customAssociations));","        setCustomText(assocTextOf(data.settings.customAssociations));\n        setSuffixText((data.settings.strongGateSuffixes || []).join('\\n'));");
const defaultsOld="h('button', { type: 'button', style: button, disabled: busy || !defaults, onClick: () => defaults && setSettings({ ...defaults }) }, '恢复默认')";
const defaultsNew="h('button', { type: 'button', style: button, disabled: busy || !defaults, onClick: () => { if (!defaults) return; setSettings({ ...defaults }); setCustomText(assocTextOf(defaults.customAssociations)); setSuffixText((defaults.strongGateSuffixes || []).join('\\n')); } }, '恢复默认')";
if(!c.includes(defaultsOld)) throw new Error('defaults button missing');
c=c.replace(defaultsOld,defaultsNew);
// Insert suffix field renderer before return
const returnMarker="      return h(\n        'div',\n        { style: { padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '820px' } },";
const suffixFn=`      const suffixField = () => h(
        Field,
        { note: '每行或逗号一个；留空关闭领域词降级。默认/全面/自定义模式都使用。默认只保留通用元词，化学或其他学科可自行追加。' },
        h('span', { style: label }, '强关联领域词后缀'),
        h('textarea', {
          style: { ...input, width: '100%', minHeight: '54px', fontFamily: 'inherit', resize: 'vertical' },
          value: suffixText,
          onChange: (event) => {
            setSuffixText(event.target.value);
            update({ strongGateSuffixes: parseSuffixText(event.target.value) });
          },
        }),
      );

`;
if(!c.includes(returnMarker)) throw new Error('return marker missing');
c=c.replace(returnMarker,suffixFn+returnMarker);
// Insert default/full suffix field after mode summary expression before custom dictionary
const marker="          settings.searchMode === 'original' ? null : h(\n            'div',\n            { style: { display: 'flex', flexDirection: 'column', gap: '8px', padding: '10px 12px', border: '1px solid var(--dsw-alias-border-secondary, rgba(128,128,128,.28))', borderRadius: '8px' } },\n            h('p', { style: title }, '自定义词表'),";
const inserted="          (settings.searchMode || 'default') === 'custom' || settings.searchMode === 'original' ? null : h(\n            'div',\n            { style: { display: 'flex', flexDirection: 'column', gap: '8px', padding: '10px 12px', border: '1px solid var(--dsw-alias-border-secondary, rgba(128,128,128,.28))', borderRadius: '8px' } },\n            suffixField(),\n          ),\n          settings.searchMode === 'original' ? null : h(\n            'div',\n            { style: { display: 'flex', flexDirection: 'column', gap: '8px', padding: '10px 12px', border: '1px solid var(--dsw-alias-border-secondary, rgba(128,128,128,.28))', borderRadius: '8px' } },\n            h('p', { style: title }, '自定义词表'),";
if(!c.includes(marker)) throw new Error('custom dictionary marker missing');
c=c.replace(marker,inserted);
// Insert suffix field in custom strong gate after ratio field
const ratioMarker="              h('input', { type: 'number', min: 1, max: 100, style: input, value: num(settings.strongGateRatio, 20), onChange: (e) => update({ strongGateRatio: num(e.target.value, 20) }) }),\n            ),";
const ratioInserted="              h('input', { type: 'number', min: 1, max: 100, style: input, value: num(settings.strongGateRatio, 20), onChange: (e) => update({ strongGateRatio: num(e.target.value, 20) }) }),\n            ),\n            suffixField(),";
if(!c.includes(ratioMarker)) throw new Error('ratio marker missing');
c=c.replace(ratioMarker,ratioInserted);
fs.writeFileSync(p,c,"utf8");
console.log("suffix UI");
