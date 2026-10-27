import fs from "node:fs";
let p="lib/settings-store.js"; let c=fs.readFileSync(p,"utf8");
c=c.replace("export const DEFAULT_SETTINGS = {","export const DEFAULT_SETTINGS = {\n  libraryRoot: '',\n  cacheDir: '',");
c=c.replace("  base.outlineMaxFiles = integer(source.outlineMaxFiles, 1, 200, base.outlineMaxFiles);","  base.outlineMaxFiles = integer(source.outlineMaxFiles, 1, 200, base.outlineMaxFiles);\n  base.libraryRoot = typeof source.libraryRoot === 'string' ? source.libraryRoot.trim() : base.libraryRoot;\n  base.cacheDir = typeof source.cacheDir === 'string' ? source.cacheDir.trim() : base.cacheDir;");
fs.writeFileSync(p,c,"utf8");
p="lib/index.js"; c=fs.readFileSync(p,"utf8");
c=c.replace("function resolveLibrary(args, config) {\n  const explicit = args?.library && String(args.library).trim();\n  const root = explicit || config.libraries[0];\n  if (!root) {\n    throw new Error('还没有指定题库文件夹。请先询问用户题库的绝对路径，再把该路径作为 library 参数传入（例如 D:\\\\题库）。');\n  }\n  return path.resolve(root);\n}",
"function resolveLibrary(args, config, settings = {}) {\n  const explicit = args?.library && String(args.library).trim();\n  const root = explicit || settings.libraryRoot || config.libraries[0];\n  if (!root) {\n    throw new Error('还没有指定题库文件夹。请在「本地搜索设置」里填写题库位置，或把绝对路径作为 library 参数传入（例如 D:\\\\题库）。');\n  }\n  return path.resolve(root);\n}");
fs.writeFileSync(p,c,"utf8");
console.log("settings paths added");
