import { zipSync, unzipSync } from "fflate";
const z=zipSync({"word/document.xml":new Uint8Array(2*1024*1024)});
unzipSync(z,{filter:(f)=>{console.log(f);return false;}});
