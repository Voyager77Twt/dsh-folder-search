import { spawn } from 'node:child_process';
import fsp from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { exists } from './util.js';

const SCRIPT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'scripts', 'word-to-pdf.ps1');

function run(command, args, timeoutMs) {
  return new Promise((resolve) => {
    const child = spawn(command, args, { windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    let killed = false;
    child.stdout.on('data', (chunk) => {
      stdout += chunk;
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk;
    });
    const timer = setTimeout(() => {
      killed = true;
      try {
        spawn('taskkill', ['/PID', String(child.pid), '/T', '/F'], { windowsHide: true });
      } catch {
        /* ignore */
      }
      try {
        child.kill();
      } catch {
        /* ignore */
      }
    }, timeoutMs);
    child.on('close', (code) => {
      clearTimeout(timer);
      resolve({ code, stdout, stderr, killed });
    });
    child.on('error', (error) => {
      clearTimeout(timer);
      resolve({ code: -1, stdout, stderr: String(error?.message ?? error), killed });
    });
  });
}

/**
 * Convert a legacy Office document (.doc/.rtf/.ppt) to PDF through the local
 * Word/PowerPoint COM automation. Returns the PDF bytes; writes only to a temp dir.
 */
export async function convertLegacyToPdf(inputPath, options = {}) {
  if (process.platform !== 'win32') throw new Error('旧版 Office 文件转换目前只支持 Windows');
  const tmpDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'dsh-library-search-'));
  const outputPdf = path.join(tmpDir, 'converted.pdf');
  const timeoutMs = Math.max(15000, Number(options.timeoutMs ?? 90000));
  try {
    const result = await run(
      'powershell.exe',
      ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', SCRIPT, '-InputPath', inputPath, '-OutputPath', outputPdf],
      timeoutMs,
    );
    if (!exists(outputPdf)) {
      const reason = result.killed ? `转换超时（${Math.round(timeoutMs / 1000)} 秒）` : (result.stderr || result.stdout || `退出码 ${result.code}`).trim();
      throw new Error(`旧版文件转换失败：${reason.slice(0, 160)}`);
    }
    return await fsp.readFile(outputPdf);
  } finally {
    await fsp.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}

const PPT_SCRIPT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'scripts', 'ppt-to-pdf.ps1');

/** Convert a legacy .ppt through PowerPoint COM and return the PDF bytes. */
export async function convertPptToPdf(inputPath, options = {}) {
  if (process.platform !== 'win32') throw new Error('旧版 .ppt 转换目前只支持 Windows');
  const tmpDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'dsh-library-search-ppt-'));
  const outputPdf = path.join(tmpDir, 'converted.pdf');
  const timeoutMs = Math.max(15000, Number(options.timeoutMs ?? 120000));
  try {
    const result = await run(
      'powershell.exe',
      ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', PPT_SCRIPT, '-InputPath', inputPath, '-OutputPath', outputPdf],
      timeoutMs,
    );
    if (!exists(outputPdf)) {
      const reason = result.killed ? `转换超时（${Math.round(timeoutMs / 1000)} 秒）` : (result.stderr || result.stdout || `退出码 ${result.code}`).trim();
      throw new Error(`.ppt 转换失败：${reason.slice(0, 160)}`);
    }
    return await fsp.readFile(outputPdf);
  } finally {
    await fsp.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}
