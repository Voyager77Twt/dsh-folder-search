import fs from "node:fs";
const p="lib/extract.js";
let c=fs.readFileSync(p,"utf8");
c=c.replace("import fs from 'node:fs/promises';","import fs from 'node:fs/promises';\nimport path from 'node:path';");
c=c.replace("import { SUPPORTED, decodeXmlEntities, normalizeText, collapse, capList } from './util.js';","import { SUPPORTED, decodeXmlEntities, normalizeText, collapse, capList, sha1, exists } from './util.js';");
c=c.replace(`    case 'doc': {
      const pdfBuffer = await convertLegacyToPdf(absPath, { timeoutMs: options.convertTimeoutMs ?? 90000 });`,
`    case 'doc': {
      const legacyDir = options.legacyPdfDir ?? process.env.DSH_LIBSEARCH_LEGACY_PDF_DIR;
      if (legacyDir) {
        const key = sha1(\`\${absPath.toLowerCase()}|\${stat.mtimeMs}|\${stat.size}\`);
        const cachedPdf = path.join(legacyDir, \`\${key}.pdf\`);
        if (exists(cachedPdf)) {
          const pre = await extractPdf(await fs.readFile(cachedPdf));
          return { ...pre, kind: 'doc' };
        }
      }
      const pdfBuffer = await convertLegacyToPdf(absPath, { timeoutMs: options.convertTimeoutMs ?? 90000 });`);
fs.writeFileSync(p,c,"utf8");
console.log("patched legacy pdf cache");
