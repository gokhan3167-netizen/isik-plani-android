// GDTF dosyalarından (gdtf-populer/*.gdtf) uygulamaya gömülen 3D gövde + plan sembolü paketini üretir: www/fx3d/lib.js
// Kullanım: node scripts/fx3d-build.mjs [klasör]
import fs from 'fs'; import zlib from 'zlib'; import { createRequire } from 'module';
const require = createRequire(import.meta.url); const C = require('../www/fx3d/conv.js');
const dir = process.argv[2] || 'gdtf-populer';
function readZip(buf){ let e=buf.length-22; while(e>=0&&buf.readUInt32LE(e)!==0x06054b50) e--; if(e<0) return ()=>null; const count=buf.readUInt16LE(e+10); let p=buf.readUInt32LE(e+16); const files=new Map();
  for(let i=0;i<count;i++){ if(buf.readUInt32LE(p)!==0x02014b50) break; const method=buf.readUInt16LE(p+10), csize=buf.readUInt32LE(p+20), nlen=buf.readUInt16LE(p+28), xlen=buf.readUInt16LE(p+30), clen=buf.readUInt16LE(p+32), off=buf.readUInt32LE(p+42);
    files.set(buf.toString('utf8',p+46,p+46+nlen),{method,csize,off}); p+=46+nlen+xlen+clen; }
  return n=>{ const f=files.get(n); if(!f) return null; const ln=buf.readUInt16LE(f.off+26), lx=buf.readUInt16LE(f.off+28), d=buf.subarray(f.off+30+ln+lx,f.off+30+ln+lx+f.csize); return new Uint8Array(f.method===8?zlib.inflateRawSync(d):Buffer.from(d)); }; }
const list=[]; let skip=0;
for (const fn of fs.readdirSync(dir).filter(n=>/\.gdtf$/i.test(n)).sort()) {
  let r=null; try { r=C.convert(readZip(fs.readFileSync(dir+'/'+fn))); } catch(e) { console.log('HATA', fn, e.message); }
  if (!r) { skip++; continue; }
  if (r.sym && Math.max(r.sym.w, r.sym.l) < 0.1) r.sym = null; // tüp gibi ince cihaz: uygulamanın simgesi daha okunur
  delete r.tri; list.push(r);
}
list.sort((a,b)=>(a.b+a.m).localeCompare(b.b+b.m));
const date=new Date().toISOString().slice(0,10);
fs.mkdirSync('www/fx3d',{recursive:true});
fs.writeFileSync('www/fx3d/lib.js','/* LampOff — GDTF Share (gdtf-share.com) cihaz gövdeleri ve plan sembolleri, '+date+' */\nwindow.FX3D_LIB='+JSON.stringify({v:1,date,list})+';\n');
console.log(`${list.length} cihaz (${skip} atlandı: modelsiz), ${(fs.statSync('www/fx3d/lib.js').size/1048576).toFixed(2)} MB`);
