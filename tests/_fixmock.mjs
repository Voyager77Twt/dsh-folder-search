import fs from "node:fs";
let t=fs.readFileSync("tests/_clientrender.mjs","utf8");
t=t.replace("  useEffect() {},","  useEffect() {},\n  useCallback(fn) { return fn; },\n  useMemo(fn) { return fn(); },");
fs.writeFileSync("tests/_clientrender.mjs",t,"utf8");
