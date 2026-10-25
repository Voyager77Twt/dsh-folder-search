import { loadSettings, saveSettings, DEFAULT_SETTINGS } from './settings-store.js';

export const name = 'folder-search-settings';
export const inject = ['webServer'];

const ROUTE = '/api/dsh-folder-search/settings';
const MAX_BODY = 64 * 1024;

function sameOrigin(request) {
  const origin = request.headers?.origin;
  if (!origin) return true;
  const host = request.headers?.host;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function apply(ctx) {
  registerSettingsRoute(ctx);
}

async function readJson(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > MAX_BODY) throw new Error('请求体过大');
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

function send(response, status, value) {
  response.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  response.end(JSON.stringify(value));
}

export function registerSettingsRoute(ctx) {
  const web = ctx.get('webServer');
  if (!web || typeof web.register !== 'function') return;
  return ctx.effect(() =>
    web.register({
      kind: 'exact',
      path: ROUTE,
      handler: async (request, response) => {
        try {
          if (!sameOrigin(request)) {
            send(response, 403, { error: '只允许本机同源请求' });
            return;
          }
          if (request.method === 'GET' || request.method === 'HEAD') {
            const settings = await loadSettings();
            send(response, 200, { settings, defaults: DEFAULT_SETTINGS });
            return;
          }
          if (request.method !== 'POST') {
            response.writeHead(405, { allow: 'GET, HEAD, POST' });
            response.end();
            return;
          }
          const body = await readJson(request);
          const settings = await saveSettings(body?.settings ?? body ?? {});
          send(response, 200, { settings, defaults: DEFAULT_SETTINGS });
        } catch (error) {
          send(response, 400, { error: error instanceof Error ? error.message : String(error) });
        }
      },
    }),
  );
}
