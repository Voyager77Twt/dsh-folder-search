import { parentPort, workerData } from 'node:worker_threads';
import { extractFile } from './extract.js';

try {
  const result = await extractFile(workerData.absPath, workerData.ext, workerData.options || {});
  parentPort?.postMessage({ ok: true, result });
} catch (error) {
  parentPort?.postMessage({ ok: false, error: error instanceof Error ? error.message : String(error) });
}
