import { powershellCommand } from "../lib/util.js";
console.log("chosen:", powershellCommand());
console.log("office32 word:", exists("C:\\Program Files (x86)\\Microsoft Office\\root\\Office16\\WINWORD.EXE"));
console.log("office64 word:", exists("C:\\Program Files\\Microsoft Office\\root\\Office16\\WINWORD.EXE"));
function exists(p){ try { return require("node:fs").existsSync(p); } catch { return false; } }
