import fs from "node:fs";
let p="lib/index.js"; let c=fs.readFileSync(p,"utf8");
c=c.replace("description: '模型自检：这道题的核心对象有没有“人 / 旧称 / 缩写 / 别名”？有就填 1 个专名到 strongTerms，没有就留空。强关联词 = 与主题指向同一对象的专名；不要填父类/领域词。数量由设置页第3步上限限制，关闭第3步则忽略。'","description: '模型自检：这道题的核心对象有没有“人 / 旧称 / 缩写 / 别名 / 近义词 / 标准术语”？有就填 1 个到 strongTerms，没有就留空。强关联词允许与主题同指或近义；不要填父类/领域词。数量由设置页第3步上限限制，关闭第3步则忽略。'");
fs.writeFileSync(p,c,"utf8");
p="cordis.patch.yml"; c=fs.readFileSync(p,"utf8");
c=c.replace("                - 第一次检索前自检：这道题的核心对象有没有“人 / 旧称 / 缩写 / 别名”？有就填 1 个专名到 strongTerms，没有就留空；强关联词不是同义词，不要填父类/领域词。一般关联词放 generalTerms；数量受设置页上限约束。不要为补词再搜第二次。","                - 第一次检索前自检：这道题的核心对象有没有“人 / 旧称 / 缩写 / 别名 / 近义词 / 标准术语”？有就填 1 个到 strongTerms，没有就留空；允许近义词/标准术语，但不要填父类/领域词。一般关联词放 generalTerms；数量受设置页上限约束。不要为补词再搜第二次。");
fs.writeFileSync(p,c,"utf8");
p="lib/client.js"; c=fs.readFileSync(p,"utf8");
c=c.replace("index: 3, note: '执行 1 次，与第 2 步合并扫描。模型自检：主题有没有“人 / 旧称 / 缩写 / 别名”？有就填 1 个专名，没有就留空；不要填父类/领域词。工具会检查广度，过宽或非最窄的降级，不会二次搜索。'","index: 3, note: '执行 1 次，与第 2 步合并扫描。模型自检：主题有没有“人 / 旧称 / 缩写 / 别名 / 近义词 / 标准术语”？有就填 1 个，没有就留空；不要填父类/领域词。工具会检查广度，过宽或非最窄的降级，不会二次搜索。'");
c=c.replace("note: '默认保留规则：超过直接命中文件数的 2 倍，或全库占比超过 20%，或以领域词结尾，任一即降级；只保留最窄的 1 个强关联词。'","note: '默认保留规则：直接命中 >5 时，超过其 2 倍或全库 20% 即降级；直接命中 ≤5 时这两条不启用。领域词结尾仍降级；只保留最窄的 1 个强关联词。'");
c=c.replace("index: 5, note: '执行 1 次，与第 2 步合并扫描。模型补充的一般关联词；与第 4 步共用“关联词数量上限”和下方“关联词输出”上限。它不会新增文件，只在已命中原词的文件里补段落，避免“纯碱”这类泛词爆炸。'","index: 5, note: '执行 1 次，与第 2 步合并扫描。模型补充的一般关联词；与第 4 步共用“关联词数量上限”和“关联词输出”上限。默认不新增文件，只在已命中原词的文件里补段落；零命中兜底时会自动带入。'");
const step5=`          h(
            Step,
            { index: 5, note: '执行 1 次，与第 2 步合并扫描。模型补充的一般关联词；与第 4 步共用“关联词数量上限”和“关联词输出”上限。默认不新增文件，只在已命中原词的文件里补段落；零命中兜底时会自动带入。' },
            h('input', { type: 'checkbox', style: checkbox, checked: settings.enableGeneral !== false, onChange: (e) => update({ enableGeneral: e.target.checked }) }),
            h('span', { style: { fontSize: '13px' } }, '一般关联词'),
          ),`;
const step5new=`${step5}
          h(
            'div',
            { style: { paddingLeft: '28px', display: 'flex', flexDirection: 'column', gap: '6px' } },
            h(
              Field,
              { note: '开启后：自动词表文件名额未满时，允许一般关联词补文件，和自动扩展共用最多文件数。直接命中与强关联都 0 时，即使关闭也会自动兜底带入。' },
              h('input', { type: 'checkbox', style: checkbox, checked: settings.allowGeneralFiles === true, onChange: (e) => update({ allowGeneralFiles: e.target.checked }) }),
              h('span', { style: { fontSize: '13px' } }, '允许一般关联词带入文件'),
            ),
          ),`;
if(!c.includes(step5)) throw new Error('step5 marker missing');
c=c.replace(step5,step5new);
fs.writeFileSync(p,c,"utf8");
console.log("prompt/UI strong synonyms + general files");
