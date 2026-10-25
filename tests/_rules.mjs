import fs from "node:fs";
// settings: factor
let p="lib/settings-store.js"; let c=fs.readFileSync(p,"utf8");
c=c.replace("  strongGateFiles: 50,","  strongGateFiles: 50,\n  strongGateFactor: 2,");
c=c.replace("  base.strongGateFiles = integer(source.strongGateFiles, 1, 5000, base.strongGateFiles);","  base.strongGateFiles = integer(source.strongGateFiles, 1, 5000, base.strongGateFiles);\n  base.strongGateFactor = integer(source.strongGateFactor, 1, 10, base.strongGateFactor);");
fs.writeFileSync(p,c,"utf8");
// search: restore 2x direct rule + ratio + domain
p="lib/search.js"; c=fs.readFileSync(p,"utf8");
c=c.replace("    const maxFiles = Number(settings.strongGateFiles ?? 30);\n    const maxRatio = Number(settings.strongGateRatio ?? 20);\n    const isBroad = (term, count) => {\n      const overFiles = count > maxFiles;\n      const overRatio = (count / totalDocs) * 100 > maxRatio;\n      const domain = domainWord.test(term);\n      if (mode === 'files') return overFiles;\n      if (mode === 'ratio') return overRatio;\n      if (mode === 'domain') return domain;\n      return overFiles || overRatio || domain;\n    };",
"    const maxFiles = Number(settings.strongGateFiles ?? 50);\n    const maxRatio = Number(settings.strongGateRatio ?? 20);\n    const factor = Math.max(1, Number(settings.strongGateFactor ?? 2));\n    const isBroad = (term, count) => {\n      const overFactor = count > directFiles * factor;\n      const overFiles = count > maxFiles;\n      const overRatio = (count / totalDocs) * 100 > maxRatio;\n      const domain = domainWord.test(term);\n      if (mode === 'factor') return overFactor;\n      if (mode === 'files') return overFiles;\n      if (mode === 'ratio') return overRatio;\n      if (mode === 'domain') return domain;\n      return overFactor || overRatio || domain;\n    };");
fs.writeFileSync(p,c,"utf8");
// UI: factor field, mode options, default all
p="lib/client.js"; c=fs.readFileSync(p,"utf8");
c=c.replace("h('option', { value: 'files' }, '文件数超过阈值'),","h('option', { value: 'factor' }, '超过直接命中数的倍数'),\n                h('option', { value: 'files' }, '超过固定文件数'),");
c=c.replace("h('span', { style: label }, '文件数阈值'),","h('span', { style: label }, '倍数 / 固定文件数'),");
const thresholdField=`h(
              Field,
              { note: '强关联词单独命中超过多少个文件就降级；模式含“固定文件数”时生效。' },
              h('span', { style: label }, '文件数阈值'),
              h('input', { type: 'number', min: 1, max: 5000, style: input, value: num(settings.strongGateFiles, 50), onChange: (e) => update({ strongGateFiles: num(e.target.value, 50) }) }),
            ),`;
const newThreshold=`h(
              Field,
              { note: '默认保留规则：超过直接命中文件数的 2 倍，或全库占比超过 20%，或以领域词结尾，任一即降级；只保留最窄的 1 个强关联词。' },
              h('span', { style: label }, '倍数阈值'),
              h('input', { type: 'number', min: 1, max: 10, style: input, value: num(settings.strongGateFactor, 2), onChange: (e) => update({ strongGateFactor: num(e.target.value, 2) }) }),
            ),
            h(
              Field,
              { note: '固定文件数阈值；仅在“超过固定文件数”模式下生效，默认规则不使用它。' },
              h('span', { style: label }, '固定文件数'),
              h('input', { type: 'number', min: 1, max: 5000, style: input, value: num(settings.strongGateFiles, 50), onChange: (e) => update({ strongGateFiles: num(e.target.value, 50) }) }),
            ),`;
if(!c.includes(thresholdField)) throw new Error('threshold field marker missing');
c=c.replace(thresholdField,newThreshold);
const pkg=JSON.parse(fs.readFileSync("package.json","utf8")); pkg.version="0.5.9"; fs.writeFileSync("package.json",JSON.stringify(pkg,null,2)+"\n","utf8");
fs.writeFileSync("README.md",fs.readFileSync("README.md","utf8").replace("- 版本：`0.5.8`","- 版本：`0.5.9`"),"utf8");
console.log("0.5.9 gate rules restored");
