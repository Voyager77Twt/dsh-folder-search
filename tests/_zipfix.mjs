import fs from "node:fs";
let p="lib/extract.js"; let c=fs.readFileSync(p,"utf8");
const start=c.indexOf("function checkZipLimit(");
const end=c.indexOf("function assertSafeXml(");
if(start<0||end<0) throw new Error('zip block markers');
const block=`function checkZipLimit(file, state, limits, compressedBytes) {
  state.entries += 1;
  if (state.entries > limits.zipMaxEntries) {
    state.error ||= '安全限制：压缩包条目过多';
    return false;
  }
  const size = Math.max(0, Number(file.originalSize) || 0);
  if (size > limits.zipMaxEntryBytes) {
    state.error ||= '安全限制：压缩包单个条目解压后过大';
    return false;
  }
  state.total += size;
  if (state.total > limits.zipMaxTotalBytes) {
    state.error ||= '安全限制：压缩包总解压体积过大';
    return false;
  }
  if (compressedBytes > 0 && state.total / compressedBytes > limits.zipMaxRatio) {
    state.error ||= '安全限制：压缩比异常';
    return false;
  }
  return true;
}

function inspectZipSafety(buf, options = {}) {
  const limits = securityLimits(options);
  const bytes = new Uint8Array(buf);
  const state = { entries: 0, total: 0, error: null };
  unzipSync(bytes, { filter: (file) => { checkZipLimit(file, state, limits, bytes.byteLength); return false; } });
  if (state.error) throw new Error(state.error);
}

function assertZipSafe(buf, options = {}) {
  try {
    inspectZipSafety(buf, options);
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('安全限制：')) throw error;
    throw new Error('不是有效的压缩文件：' + (error instanceof Error ? error.message : String(error)));
  }
}

function openZip(buf, options = {}) {
  inspectZipSafety(buf, options);
  const files = unzipSync(new Uint8Array(buf));
  return {
    names: () => Object.keys(files),
    text: (name) => (files[name] ? strFromU8(files[name]) : null),
  };
}

`;
c=c.slice(0,start)+block+c.slice(end);
fs.writeFileSync(p,c,"utf8");
console.log("zip safety preflight fixed");
