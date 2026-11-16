import fs from "node:fs";
let p="lib/client.js"; let c=fs.readFileSync(p,"utf8");
c=c.replace("let pickerRequestOpen = false;","let lastPickerTrigger = 0;");
c=c.replace("      const selectFolder = async () => {\n        if (pickerRequestOpen) return;\n        pickerRequestOpen = true;\n        setFolderPicking(true);","      const selectFolder = async () => {\n        const now = Date.now();\n        if (now - lastPickerTrigger < 1200) return;\n        lastPickerTrigger = now;\n        setFolderPicking(true);");
c=c.replace("        } finally {\n          pickerRequestOpen = false;\n          setFolderPicking(false);\n        }","        } finally {\n          setFolderPicking(false);\n        }");
fs.writeFileSync(p,c,"utf8");
console.log("remove stuck picker guard");
