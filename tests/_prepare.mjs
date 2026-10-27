import fs from "node:fs";
let p="lib/index.js"; let c=fs.readFileSync(p,"utf8");
const helper=`function resolveLibrary(args, config, settings = {}) {
  const explicit = args?.library && String(args.library).trim();
  const root = explicit || settings.libraryRoot || config.libraries[0];
  if (!root) {
    throw new Error('还没有指定题库文件夹。请在「本地搜索设置」里填写题库位置，或把绝对路径作为 library 参数传入（例如 D:\\\\题库）。');
  }
  return path.resolve(root);
}

async function prepareTool(args, resolved) {
  const settings = await loadSettings();
  const config = { ...resolved, cacheDir: settings.cacheDir ? path.resolve(settings.cacheDir) : resolved.cacheDir };
  const library = resolveLibrary(args, resolved, settings);
  const index = indexFor(library, config);
  return { settings, config, library, index };
}`;
c=c.replace(`function resolveLibrary(args, config, settings = {}) {
  const explicit = args?.library && String(args.library).trim();
  const root = explicit || settings.libraryRoot || config.libraries[0];
  if (!root) {
    throw new Error('还没有指定题库文件夹。请在「本地搜索设置」里填写题库位置，或把绝对路径作为 library 参数传入（例如 D:\\\\题库）。');
  }
  return path.resolve(root);
}`, helper);
c=c.replaceAll("        const library = resolveLibrary(args, resolved);\n        const index = indexFor(library, resolved);","        const { settings, config, library, index } = await prepareTool(args, resolved);");
c=c.replaceAll("        const settings = await loadSettings();\n","");
c=c.replaceAll("searchLibrary(index, args ?? {}, resolved, settings)","searchLibrary(index, args ?? {}, config, settings)");
c=c.replaceAll("resolved.indexBudgetPerCall","config.indexBudgetPerCall");
c=c.replaceAll("resolved.cacheCapMB","config.cacheCapMB");
c=c.replaceAll("libraryStatus(index, args ?? {}, resolved)","libraryStatus(index, args ?? {}, config)");
fs.writeFileSync(p,c,"utf8");
console.log("prepareTool wired");
