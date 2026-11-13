import { Worker } from 'node:worker_threads';
import { fileURLToPath } from 'node:url';

const WORKER = fileURLToPath(new URL('./parse-worker.js', import.meta.url));

/** Parse one document in a worker so a parser OOM/crash cannot take down the host. */
export function extractFileIsolated(absPath, ext, options = {}) {
  return new Promise((resolve, reject) => {
    const timeoutMs = Math.max(5000, Number(options.workerTimeoutMs ?? 300000));
    const worker = new Worker(WORKER, {
      workerData: { absPath, ext, options },
      resourceLimits: {
        maxOldGenerationSizeMb: Math.max(64, Math.min(1024, Number(options.workerMaxMB ?? 256))),
        maxYoungGenerationSizeMb: 64,
      },
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
