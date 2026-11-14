import fs from "node:fs";
let p="lib/client.js"; let c=fs.readFileSync(p,"utf8");
const start=c.indexOf("      const save = async () => {");
const end=c.indexOf("      const allFiles = settings.normalMaxFiles === 'all';");
if(start<0||end<0) throw new Error('save/build block markers');
const block=`      const persistSettings = async () => {
        const response = await fetch(API, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ settings }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'HTTP ' + response.status);
        setSettings(data.settings);
        setCustomText(assocTextOf(data.settings.customAssociations));
        setSuffixText((data.settings.strongGateSuffixes || []).join('\\n'));
        setDefaults(data.defaults || defaults);
        loadIndex();
        return data;
      };

      const save = async () => {
        setBusy(true);
        setStatus('');
        try {
          const data = await persistSettings();
          const migration = data.migration;
          if (data.buildError) {
            setStatus('已保存；但建索引未启动：' + data.buildError);
          } else if (data.buildQueued) {
            setStatus('已保存；已开始自动建索引。');
          } else if (migration && migration.moved) {
            const bits = [\`已自动迁移 \${migration.moved} 个索引目录\`];
            if (migration.removed) bits.push(\`已删除 \${migration.removed} 个旧索引\`);
            if (migration.skipped) bits.push(\`跳过 \${migration.skipped} 个目标已存在的目录\`);
            if (migration.removeFailed?.length) bits.push(\`旧索引删除失败：\${migration.removeFailed.join('、')}\`);
            setStatus('已保存；' + bits.join('；') + '。');
          } else {
            setStatus('已保存；下一次检索/目录调用生效。');
          }
        } catch (error) {
          setStatus('保存失败：' + (error && error.message ? error.message : String(error)));
        } finally {
          setBusy(false);
        }
      };

      const buildIndex = async () => {
        setIndexBusy(true);
        setStatus('正在保存并启动建索引…');
        try {
          const data = await persistSettings();
          if (data.buildError) {
            setStatus('已保存；但建索引未启动：' + data.buildError);
            return;
          }
          if (data.buildQueued) {
            setStatus('已保存；已开始自动建索引。');
            return;
          }
          const response = await fetch(INDEX_API, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ action: 'build' }),
          });
          const result = await response.json();
          if (!response.ok) throw new Error(result.error || 'HTTP ' + response.status);
          setIndexStatus(result.status || null);
          setStatus('已保存；已开始建索引。');
        } catch (error) {
          setStatus('启动建索引失败：' + (error && error.message ? error.message : String(error)));
        } finally {
          setIndexBusy(false);
        }
      };

`;
c=c.slice(0,start)+block+c.slice(end);
c=c.replace("idx.running ? '建库中…' : '开始/继续建库'","idx.running ? '建库中…' : '保存并开始/继续建库'");
c=c.replace("busy ? '保存中…' : '保存'","busy ? '保存中…' : '仅保存设置'");
c=c.replace("这里控制检索输出、题库位置和索引位置。只改输出不会重建索引；修改题库/索引路径并保存后会自动开始建库。","这里控制检索输出、题库位置和索引位置。只改输出用「仅保存设置」；修改路径后点「保存并开始/继续建库」，按钮会先保存再建库。");
fs.writeFileSync(p,c,"utf8");
console.log("build/save merged restored");
