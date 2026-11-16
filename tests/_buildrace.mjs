import fs from "node:fs";
let p="lib/client.js"; let c=fs.readFileSync(p,"utf8");
c=c.replace("      const persistSettings = async () => {","      const persistSettings = async (refreshIndex = true) => {");
c=c.replace("        setDefaults(data.defaults || defaults);\n        loadIndex();\n        return data;","        setDefaults(data.defaults || defaults);\n        if (refreshIndex) loadIndex();\n        return data;");
c=c.replace("          const data = await persistSettings();\n          if (data.buildError)","          const data = await persistSettings(false);\n          if (data.buildError)");
c=c.replace("          if (data.buildQueued) {\n            setStatus('已保存；已开始自动建索引。');\n            return;\n          }","          if (data.buildQueued) {\n            setIndexStatus((current) => ({ ...(current || {}), running: true, phase: 'sync' }));\n            setStatus('已保存；已开始自动建索引。');\n            return;\n          }");
fs.writeFileSync(p,c,"utf8");
console.log("build optimistic race fix");
