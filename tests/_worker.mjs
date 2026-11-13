import fs from "node:fs";
fs.writeFileSync("lib/parse-worker.js", `import { parentPort, workerData } from 'node:worker_threads';
import { extractFile } from './extract.js';

try {
  const result = await extractFile(workerData.absPath, workerData.ext, workerData.options || {});
  parentPort?.postMessage({ ok: true, result });
} catch (error) {
  parentPort?.postMessage({ ok: false, error: error instanceof Error ? error.message : String(error) });
}
`, "utf8");
fs.writeFileSync("lib/parse-isolate.js", `import { Worker } from 'node:worker_threads';
import { fileURLToPath } from 'node:url';

const WORKER = fileURLToPath(new URL('./parse-worker.js', import.meta.url));

/** Parse one document in a worker so a parser OOM/crash cannot take down the host. */
export function extractFileIsolated(absPath, ext, options = {}) {
  return new Promise((resolve, reject) => {
    const timeoutMs = Math.max(5000, Number(options.workerTimeoutMs ?? 300000));
    const worker = new Worker(WORKER, {
      workerData: { absPath, ext, options },
      resourceLimits: { maxOldGenerationSizeMb: 256, maxYoungGenerationSizeMb: 64 },
      stdout: true,
      stderr: true,
    });
    let settled = false;
    const finish = (fn, value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      Promise.resolve(worker.terminate()).catch(() => {});
      fn(value);
    };
    const timer = setTimeout(() => finish(reject, new Error('解析超时')), timeoutMs);
    worker.once('message', (message) => {
      if (message?.ok) finish(resolve, message.result);
      else finish(reject, new Error(message?.error || '解析失败'));
    });
    worker.once('error', (error) => finish(reject, error));
    worker.once('exit', (code) => {
      if (!settled) finish(reject, new Error('解析进程异常退出：' + code));
    });
  });
}
`, "utf8");
let p="lib/indexer.js"; let c=fs.readFileSync(p,"utf8");
c=c.replace("import { extractFile } from './extract.js';","import { extractFile } from './extract.js';\nimport { extractFileIsolated } from './parse-isolate.js';");
c=c.replace("        const result = await extractFile(absPath, ext, { maxFileMB: this.config.maxFileMB ?? 60 });","        const parse = this.config.parseIsolation === true ? extractFileIsolated : extractFile;\n        const result = await parse(absPath, ext, {\n          maxFileMB: this.config.maxFileMB ?? 60,\n          security: this.config.security,\n          officeAllowMacros: this.config.officeAllowMacros === true,\n        });");
fs.writeFileSync(p,c,"utf8");
console.log("worker isolation");
