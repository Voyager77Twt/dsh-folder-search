import fs from "node:fs";
let p="lib/client.js"; let c=fs.readFileSync(p,"utf8");
c=c.replace("              setCustomText(assocTextOf(data.settings.customAssociations));\n        setSuffixText((data.settings.strongGateSuffixes || []).join('\\n'));\n              setSuffixText((data.settings.strongGateSuffixes || []).join('\\n'));","              setCustomText(assocTextOf(data.settings.customAssociations));\n              setSuffixText((data.settings.strongGateSuffixes || []).join('\\n'));");
c=c.replace("          setSettings(data.settings);\n          setCustomText(assocTextOf(data.settings.customAssociations));\n          setDefaults(data.defaults || defaults);","          setSettings(data.settings);\n          setCustomText(assocTextOf(data.settings.customAssociations));\n          setSuffixText((data.settings.strongGateSuffixes || []).join('\\n'));\n          setDefaults(data.defaults || defaults);");
c=c.replace("过宽或非最窄的降级","过宽或超出数量上限的降级");
c=c.replace("领域词结尾仍降级；只保留最窄的 1 个强关联词。","领域词结尾仍降级；最多保留「强关联词上限」个，只有过宽或超出上限才降级。");
fs.writeFileSync(p,c,"utf8");
console.log("suffix sync and gate copy");
