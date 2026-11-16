import fs from "node:fs";
let p="lib/settings-host.js"; let c=fs.readFileSync(p,"utf8");
c=c.replace("import fs from 'node:fs/promises';\nimport fsSync from 'node:fs';\nimport path from 'node:path';","import fs from 'node:fs/promises';\nimport fsSync from 'node:fs';\nimport os from 'node:os';\nimport path from 'node:path';\nimport { execFile } from 'node:child_process';\nimport { promisify } from 'node:util';");
c=c.replace("const SETTINGS_ROUTE = '/api/dsh-folder-search/settings';\nconst INDEX_ROUTE = '/api/dsh-folder-search/index';","const SETTINGS_ROUTE = '/api/dsh-folder-search/settings';\nconst INDEX_ROUTE = '/api/dsh-folder-search/index';\nconst PICK_ROUTE = '/api/dsh-folder-search/pick-folder';\nconst execFileAsync = promisify(execFile);");
const marker="export function apply(ctx) {\n  registerSettingsRoute(ctx);\n}";
const helper=`async function pickFolder() {
  if (os.platform() !== 'win32') throw new Error('当前系统暂不支持原生文件夹选择，请直接粘贴绝对路径');
  const script = [
    'Add-Type -AssemblyName System.Windows.Forms',
    '$dialog = New-Object System.Windows.Forms.FolderBrowserDialog',
    "$dialog.Description = 'Select library folder'",
    '$dialog.ShowNewFolderButton = $true',
    'if ($dialog.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) { [Console]::OutputEncoding = [System.Text.Encoding]::UTF8; [Console]::Out.Write($dialog.SelectedPath) }',
  ].join('; ');
  const command = path.join(process.env.SystemRoot || 'C:\\\\Windows', 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe');
  const { stdout } = await execFileAsync(command, ['-NoProfile', '-STA', '-ExecutionPolicy', 'Bypass', '-Command', script], {
    timeout: 5 * 60 * 1000,
    windowsHide: true,
    encoding: 'utf8',
    maxBuffer: 1024 * 1024,
  });
  return String(stdout || '').trim();
}

${marker}`;
if(!c.includes(marker)) throw new Error('apply marker'); c=c.replace(marker,helper);
const routeMarker=`    return () => {
      disposeSettings();
      disposeIndex();
    };`;
const route=`    const disposePicker = web.register({
      kind: 'exact',
      path: PICK_ROUTE,
      handler: async (request, response) => {
        try {
          if (!sameOrigin(request)) {
            send(response, 403, { error: '只允许本机同源请求' });
            return;
          }
          if (request.method !== 'POST') {
            response.writeHead(405, { allow: 'POST' });
            response.end();
            return;
          }
          const selected = await pickFolder();
          if (!selected) {
            send(response, 200, { cancelled: true });
            return;
          }
          send(response, 200, { path: selected });
        } catch (error) {
          send(response, 400, { error: error instanceof Error ? error.message : String(error) });
        }
      },
    });

    return () => {
      disposeSettings();
      disposeIndex();
      disposePicker();
    };`;
if(!c.includes(routeMarker)) throw new Error('dispose marker'); c=c.replace(routeMarker,route);
fs.writeFileSync(p,c,"utf8");
console.log("folder picker host route");
