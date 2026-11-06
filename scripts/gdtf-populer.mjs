// En çok kullanılan cihazların GDTF dosyalarını GDTF Share'den indirir (3D model + plan sembolü çıkarmak için).
// Kullanım (derleme sunucusunda): GDTF_USER=... GDTF_PASS=... node scripts/gdtf-populer.mjs
// Çıktı: gdtf-populer/<rid>.gdtf + gdtf-populer/liste.json (hangi cihaz, hangi dosya, içinde model/svg var mı)
import { writeFileSync, mkdirSync } from 'fs';
import zlib from 'zlib';
const API='https://gdtf-share.com/apis/public/', USER=process.env.GDTF_USER, PASS=process.env.GDTF_PASS, OUT='gdtf-populer';
// [üretici (regex), cihaz adı (regex)] — sahada en sık görülenler; sıra önem sırası
const POP=[
 ['robe','robin t1 profile'],['robe','robin t2 profile'],['robe','megapointe'],['robe','^(robin )?pointe$'],['robe','bmfl spot'],['robe','bmfl blade'],['robe','bmfl wash ?beam'],
 ['robe','robin 600 ledwash'],['robe','robin 800 ledwash'],['robe','robin 1200 ledwash'],['robe','ledbeam 150'],['robe','ledbeam 350'],['robe','spiider'],['robe','esprite'],['robe','forte'],
 ['robe','painte'],['robe','tetra ?2'],['robe','t11 profile'],['robe','t11 fresnel'],['robe','parfect 150'],['robe','ledwash 300'],['robe','ledwash 600'],
 ['martin','mac aura$'],['martin','mac aura xb'],['martin','mac aura pxl'],['martin','mac viper profile'],['martin','mac viper performance'],['martin','mac encore performance'],
 ['martin','mac quantum wash'],['martin','mac ultra performance'],['martin','mac ultra wash'],['martin','mac axiom hybrid'],['martin','mac allure profile'],['martin','era 400 performance'],
 ['martin','era 600 performance'],['martin','atomic 3000 led'],['martin','elp'],
 ['clay ?paky','^sharpy$'],['clay ?paky','sharpy plus'],['clay ?paky','mythos 2'],['clay ?paky','scenius unico'],['clay ?paky','axcor profile 900'],['clay ?paky','k10 b-?eye'],
 ['clay ?paky','k20 b-?eye'],['clay ?paky','alpha spot hpe 1500'],['clay ?paky','sharpy x frame'],['clay ?paky','xtylos'],['clay ?paky','arolla profile mp'],['clay ?paky','volero wave'],
 ['ayrton','diablo'],['ayrton','perseo'],['ayrton','khamsin'],['ayrton','domino'],['ayrton','magicpanel'],['ayrton','ghibli'],['ayrton','mistral'],['ayrton','cobra'],
 ['etc','source four led series 2'],['etc','source four led series 3'],['etc','colorsource par'],['etc','colorsource spot'],['etc','lustr'],['etc','desire d40'],['etc','fos/4'],['etc','source four'],
 ['chauvet','maverick mk3 profile'],['chauvet','maverick force'],['chauvet','rogue r2 wash'],['chauvet','rogue r2x spot'],['chauvet','rogue r1 beam'],['chauvet','colorado 1 quad zoom'],
 ['chauvet','ovation e-910fc'],['chauvet','ovation f-915fc'],['chauvet','strike 1'],
 ['glp','impression x4$'],['glp','impression x4 bar 20'],['glp','jdc1'],['glp','impression x5'],['glp','knv'],
 ['elation','proteus maximus'],['elation','proteus hybrid'],['elation','artiste picasso'],['elation','artiste monet'],['elation','fuze wash'],['elation','smarty hybrid'],['elation','chorus line 16'],
 ['high ?end','solaframe 3000'],['high ?end','solaspot pro'],['vari-?lite','vl2600 profile'],['vari-?lite','vl3500'],
 ['sgm','p-?5'],['sgm','q-?7'],['sgm','g-?7'],['arri','skypanel s60'],['arri','l7-c'],['arri','orbiter'],['astera','ax1'],['astera','titan tube'],
 ['mdg','theone'],['look solutions','unique 2'],['antari','hz-?500'],['prolights','eclipse'],['showtec','phantom'],
];
const norm=s=>String(s||'').toLowerCase().replace(/[™®]/g,'').replace(/\s+/g,' ').trim();
let cookie=''; async function api(p,o={}){ const h=Object.assign({},o.headers||{}); if(cookie) h.Cookie=cookie; const r=await fetch(API+p,Object.assign({signal:AbortSignal.timeout(90000)},o,{headers:h}));
  const sc=typeof r.headers.getSetCookie==='function'?r.headers.getSetCookie():[]; if(sc.length) cookie=sc.map(c=>c.split(';')[0]).join('; '); return r; }
function zipNames(buf){ let e=buf.length-22; while(e>=0&&buf.readUInt32LE(e)!==0x06054b50) e--; if(e<0) return []; const n=buf.readUInt16LE(e+10); let p=buf.readUInt32LE(e+16); const out=[];
  for(let i=0;i<n;i++){ if(buf.readUInt32LE(p)!==0x02014b50) break; const nl=buf.readUInt16LE(p+28), xl=buf.readUInt16LE(p+30), cl=buf.readUInt16LE(p+32), us=buf.readUInt32LE(p+24); out.push([buf.toString('utf8',p+46,p+46+nl),us]); p+=46+nl+xl+cl; } return out; }
if(!USER||!PASS){ console.log('GDTF_USER/GDTF_PASS yok'); process.exit(1); }
const lj=await (await api('login.php',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({user:USER,password:PASS})})).json(); if(!lj.result) throw new Error('giriş: '+lj.error);
const lst=await (await api('getList.php')).json(); const L=lst.list||[]; console.log(L.length+' dosya; örnek alanlar:', Object.keys(L[0]||{}).join(','));
mkdirSync(OUT,{recursive:true}); const picked=[], seen=new Set();
for(const [mf,fx] of POP){ const rm=new RegExp(mf,'i'), rf=new RegExp(fx,'i');
  const c=L.filter(it=>rm.test(norm(it.manufacturer))&&rf.test(norm(it.fixture)));
  if(!c.length){ console.log('YOK:',mf,fx); continue; }
  // Üretici yüklemesi önce, sonra en yüksek puan/en yeni
  c.sort((a,b)=>((b.uploader==='Manuf.')-(a.uploader==='Manuf.'))||((+b.rating||0)-(+a.rating||0))||((+b.lastModified||0)-(+a.lastModified||0)));
  const it=c[0], k=it.uuid||(it.manufacturer+'|'+it.fixture); if(seen.has(k)) continue; seen.add(k); picked.push(it); }
console.log(picked.length+' cihaz seçildi');
const rows=[]; for(const it of picked){ let buf=null; for(let t=0;t<3&&!buf;t++){ try{ const r=await api('downloadFile.php?rid='+it.rid); const b=Buffer.from(await r.arrayBuffer()); if(r.ok&&b[0]===0x50&&b[1]===0x4B) buf=b; }catch(_){ } }
  if(!buf){ console.log('İNMEDİ',it.manufacturer,it.fixture); continue; }
  writeFileSync(`${OUT}/${it.rid}.gdtf`,buf); const names=zipNames(buf);
  const has=re=>names.filter(([n])=>re.test(n)).length;
  const row={rid:it.rid,b:it.manufacturer,m:it.fixture,up:it.uploader,rev:it.revision,mb:+(buf.length/1048576).toFixed(2),glb:has(/^models\/gltf\/.+\.(glb|gltf)$/i),'3ds':has(/^models\/3ds\/.+\.3ds$/i),svg:has(/^models\/svg\/.+\.svg$/i),svgS:has(/^models\/svg_side\//i),svgF:has(/^models\/svg_front\//i)};
  rows.push(row); console.log(JSON.stringify(row)); await new Promise(r=>setTimeout(r,200)); }
writeFileSync(`${OUT}/liste.json`,JSON.stringify(rows,null,1));
console.log(`Bitti: ${rows.length} dosya, ${rows.filter(r=>r.glb||r['3ds']).length} tanesinde 3D model, ${rows.filter(r=>r.svg).length} tanesinde üstten SVG`);
