/* ------------------------------------------------------------------ CRC32 */

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[i] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = CRC_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function u16(value) {
  const buf = Buffer.alloc(2);
  buf.writeUInt16LE(value & 0xffff, 0);
  return buf;
}

function u32(value) {
  const buf = Buffer.alloc(4);
  buf.writeUInt32LE(value >>> 0, 0);
  return buf;
}

/** Minimal ZIP writer using stored (uncompressed) entries; enough for OOXML. */
function zipStore(entries) {
  const locals = [];
  const centrals = [];
  let offset = 0;
  for (const entry of entries) {
    const name = Buffer.from(entry.name, 'utf8');
    const data = Buffer.isBuffer(entry.data) ? entry.data : Buffer.from(entry.data, 'utf8');
    const crc = crc32(data);
    const local = Buffer.concat([
      u32(0x04034b50),
      u16(20),
      u16(0x0800), // UTF-8 names
      u16(0), // stored
      u16(0),
      u16(0),
      u32(crc),
      u32(data.length),
      u32(data.length),
      u16(name.length),
      u16(0),
      name,
      data,
    ]);
    locals.push(local);
    centrals.push(
      Buffer.concat([
        u32(0x02014b50),
        u16(20),
        u16(20),
        u16(0x0800),
        u16(0),
        u16(0),
        u16(0),
        u32(crc),
        u32(data.length),
        u32(data.length),
        u16(name.length),
        u16(0),
        u16(0),
        u16(0),
        u16(0),
        u32(0),
        u32(offset),
        name,
      ]),
    );
    offset += local.length;
  }
  const central = Buffer.concat(centrals);
  const eocd = Buffer.concat([u32(0x06054b50), u16(0), u16(0), u16(entries.length), u16(entries.length), u32(central.length), u32(offset), u16(0)]);
  return Buffer.concat([...locals, central, eocd]);
}

/* ------------------------------------------------------------------- XML */

function esc(text) {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function run(text, options = {}) {
  const props = [];
  if (options.bold) props.push('<w:b/>');
  if (options.italics) props.push('<w:i/>');
  if (options.size) props.push(`<w:sz w:val="${options.size}"/>`);
  if (options.color) props.push(`<w:color w:val="${options.color}"/>`);
  const rPr = props.length ? `<w:rPr>${props.join('')}</w:rPr>` : '';
  return `<w:r>${rPr}<w:t xml:space="preserve">${esc(text)}</w:t></w:r>`;
}

function paragraph(runs, options = {}) {
  const pPr = [];
  if (options.center) pPr.push('<w:jc w:val="center"/>');
  else if (options.right) pPr.push('<w:jc w:val="right"/>');
  if (options.indent) pPr.push(`<w:ind w:firstLine="${options.indent}"/>`);
  if (options.spacingAfter != null) pPr.push(`<w:spacing w:after="${options.spacingAfter}"/>`);
  const pPrXml = pPr.length ? `<w:pPr>${pPr.join('')}</w:pPr>` : '';
  return `<w:p>${pPrXml}${runs.join('')}</w:p>`;
}

const STYLES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault><w:rPr><w:rFonts w:ascii="宋体" w:eastAsia="宋体" w:hAnsi="宋体"/><w:sz w:val="24"/></w:rPr></w:rPrDefault>
    <w:pPrDefault><w:pPr><w:spacing w:after="80"/></w:pPr></w:pPrDefault>
  </w:docDefaults>
</w:styles>`;

/**
 * Build a minimal but valid .docx from simple paragraph specifications.
 * Each item: { kind: 'title'|'meta'|'question'|'line'|'score'|'source'|'heading'|'gap', text, ... }
 */
export function buildDocx(items) {
  const body = [];
  for (const item of items) {
    switch (item.kind) {
      case 'title':
        body.push(paragraph([run(item.text, { bold: true, size: 36 })], { center: true, spacingAfter: 120 }));
        break;
      case 'meta':
        body.push(paragraph([run(item.text, { size: 18, color: '666666' })], { center: true, spacingAfter: 240 }));
        break;
      case 'heading':
        body.push(paragraph([run(item.text, { bold: true, size: 28 })], { spacingAfter: 160 }));
        break;
      case 'question': {
        const runs = [run(`${item.number}. `, { bold: true }), run(item.text)];
        if (item.score) runs.push(run(`（${item.score} 分）`));
        body.push(paragraph(runs, { spacingAfter: 80 }));
        break;
      }
      case 'answer':
        body.push(paragraph([run(`${item.number}. `, { bold: true }), run(item.text)], { spacingAfter: 60 }));
        break;
      case 'line':
        body.push(paragraph([run(item.text)], { indent: 480 }));
        break;
      case 'score':
        body.push(paragraph([run(`（${item.score} 分）`)], { right: true }));
        break;
      case 'source':
        body.push(paragraph([run(`来源：${item.text}`, { italics: true, size: 18, color: '777777' })]));
        break;
      case 'gap':
      default:
        body.push('<w:p/>');
        break;
    }
  }
  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:body>${body.join('')}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/></w:sectPr></w:body>
</w:document>`;
  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>`;
  const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;
  const docRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;
  return zipStore([
    { name: '[Content_Types].xml', data: contentTypes },
    { name: '_rels/.rels', data: rels },
    { name: 'word/document.xml', data: documentXml },
    { name: 'word/_rels/document.xml.rels', data: docRels },
    { name: 'word/styles.xml', data: STYLES },
  ]);
}

export { zipStore, crc32 };
