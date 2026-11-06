(()=>{const R=matchMedia('(prefers-reduced-motion: reduce)').matches;
const sh=document.querySelector('.sh');
if(sh){requestAnimationFrame(()=>setTimeout(()=>sh.classList.add('up'),60));
  const bg=sh.querySelector('.sh-bg');let tx=.62,ty=.46,x=tx,y=ty,user=0,t0=performance.now(),vis=true;
  const io0=new IntersectionObserver(e=>{vis=e[0].isIntersecting});io0.observe(sh);
  const fine=matchMedia('(pointer:fine)').matches;
  if(fine) sh.addEventListener('pointermove',e=>{const r=bg.getBoundingClientRect();tx=(e.clientX-r.left)/r.width;ty=(e.clientY-r.top)/r.height;user=performance.now()});
  const size=()=>bg.style.setProperty('--r',Math.max(180,Math.min(380,bg.clientWidth*.24))+'px');size();addEventListener('resize',size);
  const tick=n=>{if(vis){if(n-user>2500&&!R){const s=(n-t0)/1000;tx=.62+.2*Math.sin(s*.35);ty=.45+.12*Math.sin(s*.53+1)}
    x+=(tx-x)*.07;y+=(ty-y)*.07;bg.style.setProperty('--mx',(x*100).toFixed(2)+'%');bg.style.setProperty('--my',(y*100).toFixed(2)+'%')}
    requestAnimationFrame(tick)};requestAnimationFrame(tick)}
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.18});
document.querySelectorAll('.rv,.stack').forEach(el=>io.observe(el));
document.querySelectorAll('[data-toggle]').forEach(fig=>{const ov=fig.querySelector('.ov'),b=fig.querySelector('button.chip');let auto=!R,tm;
  const set=v=>{ov.classList.toggle('on',v);b.setAttribute('aria-pressed',v)};
  b.addEventListener('click',()=>{auto=false;clearInterval(tm);set(b.getAttribute('aria-pressed')!=='true')});
  new IntersectionObserver(e=>{clearInterval(tm);if(e[0].isIntersecting&&auto)tm=setInterval(()=>set(b.getAttribute('aria-pressed')!=='true'),3600)},{threshold:.4}).observe(fig)});
document.querySelectorAll('.looks').forEach(w=>{const im=[...w.querySelectorAll('.shot img')],bt=[...w.querySelectorAll('.cuebar button')];let i=0,tm,auto=!R,T=5000;
  w.style.setProperty('--t',T/1000+'s');
  const go=k=>{i=k;im.forEach((m,j)=>m.classList.toggle('on',j===k));bt.forEach((b,j)=>{b.setAttribute('aria-current',j===k);const n=b.querySelector('i');n.style.animation='none';n.offsetWidth;n.style.animation=''})};
  bt.forEach((b,j)=>b.addEventListener('click',()=>{auto=false;clearInterval(tm);go(j);bt.forEach(x=>x.querySelector('i').style.animation='none')}));
  new IntersectionObserver(e=>{clearInterval(tm);if(e[0].isIntersecting&&auto){go(i);tm=setInterval(()=>go((i+1)%im.length),T)}},{threshold:.35}).observe(w)});
})();
(()=>{ if(matchMedia('(prefers-reduced-motion: reduce)').matches) return;
const G=[['L201','#d6e6ff'],['L147','#ffb347'],['L119','#3f6bff'],['L128','#ff3da5'],['L132','#3fb6ff'],['L106','#ff3348'],['L104','#ffd84d'],['L139','#4dff8a']];
let k=0, L=null; const layer=()=>{ if(!L){ L=document.createElement('div'); L.className='fxl'; L.setAttribute('aria-hidden','true'); document.body.appendChild(L); } return L; };
document.addEventListener('click',e=>{
  const b=e.target.closest('.btn,.chip,.cuebar button,.lang'); if(b){ b.classList.remove('flash'); void b.offsetWidth; b.classList.add('flash'); setTimeout(()=>b.classList.remove('flash'),600); }
  if(e.target.closest('input,textarea,select,summary')) return;
  const [code,c]=G[k++%G.length], x=e.clientX, y=e.clientY; if(!x&&!y) return;
  const W=innerWidth, s=Math.max(120,Math.min(220,W*.16)), fx=x+(x<W/2?-1:1)*Math.min(160,W*.12), fy=-20;
  const dx=x-fx, dy=y-fy, len=Math.hypot(dx,dy), ang=Math.atan2(dx,dy)*180/Math.PI;
  const P=layer(), bm=document.createElement('i'), pl=document.createElement('i'), gl=document.createElement('i');
  bm.className='bm'; bm.style.cssText=`left:${fx-s/2}px;top:${fy}px;width:${s}px;height:${len}px;transform:rotate(${-ang}deg);--c:${c}`;
  pl.className='pl'; pl.style.cssText=`left:${x}px;top:${y}px;--s:${s}px;--c:${c}`;
  gl.className='gl'; gl.style.cssText=`left:${x+s*.32}px;top:${y+s*.2}px;--c:${c}`; gl.textContent=code;
  P.append(bm,pl,gl); setTimeout(()=>{ bm.remove(); pl.remove(); gl.remove(); },1500);
},{passive:true});
})();
(()=>{ const mn=document.getElementById('mn'), bg=document.querySelector('.burger');
 const close=()=>document.querySelectorAll('.dd.open').forEach(d=>{ d.classList.remove('open'); d.querySelector('.ddb').setAttribute('aria-expanded','false'); });
 const wide=()=>!matchMedia('(max-width:1000px)').matches;
 document.querySelectorAll('.dd').forEach(d=>{ const b=d.querySelector('.ddb'); let t;
   b.addEventListener('click',e=>{ e.stopPropagation(); const o=!d.classList.contains('open'); if(wide()) close(); d.classList.toggle('open',o); b.setAttribute('aria-expanded',o); });
   d.addEventListener('mouseenter',()=>{ if(!wide()||!matchMedia('(hover:hover)').matches) return; clearTimeout(t); close(); d.classList.add('open'); b.setAttribute('aria-expanded','true'); });
   d.addEventListener('mouseleave',()=>{ if(!wide()||!matchMedia('(hover:hover)').matches) return; t=setTimeout(()=>{ d.classList.remove('open'); b.setAttribute('aria-expanded','false'); },160); }); });
 document.addEventListener('click',e=>{ if(wide()&&!e.target.closest('.dd')) close(); });
 document.addEventListener('keydown',e=>{ if(e.key==='Escape'){ close(); if(mn&&mn.classList.contains('open')) bg.click(); } });
 if(bg&&mn) bg.addEventListener('click',()=>{ const o=!mn.classList.contains('open'); mn.classList.toggle('open',o); bg.setAttribute('aria-expanded',o); document.body.classList.toggle('navopen',o); });
 if(mn) mn.addEventListener('click',e=>{ if(e.target.closest('a')&&mn.classList.contains('open')){ mn.classList.remove('open'); bg.setAttribute('aria-expanded','false'); document.body.classList.remove('navopen'); } });
 const tl=document.querySelector('.tabs');
 if(tl){ const bs=[...tl.querySelectorAll('[role=tab]')];
   const sel=k=>{ const b=bs.find(x=>x.dataset.k===k)||bs[0]; bs.forEach(x=>{ const on=x===b; x.setAttribute('aria-selected',on); x.tabIndex=on?0:-1; document.getElementById(x.getAttribute('aria-controls')).hidden=!on; }); };
   bs.forEach(b=>b.addEventListener('click',()=>{ sel(b.dataset.k); try{ history.replaceState(null,'','#'+b.dataset.k); }catch(_){} }));
   tl.addEventListener('keydown',e=>{ const i=bs.findIndex(x=>x.getAttribute('aria-selected')==='true'); if(e.key==='ArrowRight'||e.key==='ArrowLeft'){ const n=bs[(i+(e.key==='ArrowRight'?1:-1)+bs.length)%bs.length]; n.click(); n.focus(); } });
   const h=()=>{ const k=(location.hash||'').slice(1); if(k) sel(k); else { const ua=navigator.userAgent; sel(/iphone|ipad|macintosh.*mobile/i.test(ua)?'ios':'android'); } };
   h(); addEventListener('hashchange',h); }
})();
(()=>{const R=matchMedia('(prefers-reduced-motion: reduce)').matches, vis=(el,cb,th)=>new IntersectionObserver(e=>cb(e[0].isIntersecting),{threshold:th||.3}).observe(el);
/* cue listesi */
document.querySelectorAll('[data-cues]').forEach(B=>{const G=[...B.querySelectorAll('.cq')],Rw=[...B.querySelectorAll('.cr')];let i=-1,tm=0,auto=!R,on=false;
  const go=k=>{i=(k+Rw.length)%Rw.length;const t=+Rw[i].dataset.t||2;B.style.setProperty('--ft',t+'s');G.forEach((g,j)=>{g.style.transitionDuration=t+'s';g.classList.toggle('on',j===i)});Rw.forEach((r,j)=>{r.classList.toggle('on',j===i);const b=r.querySelector('i');b.style.animation='none';b.offsetWidth;b.style.animation=''});
    clearTimeout(tm);if(auto&&on)tm=setTimeout(()=>go(i+1),t*1000+2600)};
  Rw.forEach((r,j)=>r.addEventListener('click',()=>{auto=false;go(j)}));
  B.querySelector('[data-go]').addEventListener('click',()=>{auto=false;go(i+1)});B.querySelector('[data-back]').addEventListener('click',()=>{auto=false;go(i-1)});
  vis(B,v=>{on=v;if(v){if(i<0)go(0);else if(auto)go(i)}else clearTimeout(tm)},.35)});
/* joystick + fotometri */
document.querySelectorAll('[data-joy]').forEach(B=>{const S=B.querySelector('svg'),beam=S.querySelector('#jbeam'),pool=S.querySelector('#jpool'),head=S.querySelector('#jhead'),cm=S.querySelector('#jcm'),pad=B.querySelector('.joypad'),kn=pad.querySelector('i'),V=[0,1,2,3,4].map(k=>B.querySelector('#jv'+k));
  const PX=35.7,O=[460,128],BA=18*Math.PI/180,LM=18000;let pan=0,tilt=28,ux=0,uy=0,drag=false,last=performance.now(),idle=0,on=false;
  const hitRay=(dx,dy)=>{let best=null;const tr=(t,x,y,s)=>{if(t>1e-3&&(!best||t<best.t))best={t,x,y,s}};
    if(dy>1e-4){const t=(380-O[1])/dy,x=O[0]+dx*t;if(x>=56)tr(t,x,380,'f')}
    if(dx<-1e-4){const t=(56-O[0])/dx,y=O[1]+dy*t;if(y>=40&&y<=380)tr(t,56,y,'c')}
    if(dy<-1e-4){const t=(40-O[1])/dy,x=O[0]+dx*t;if(x>=56&&x<=640)tr(t,x,40,'k')}
    if(dx>1e-4){const t=(640-O[0])/dx;tr(t,640,O[1]+dy*t,'h')}return best};
  const fm=v=>(Math.round(v*10)/10).toLocaleString(document.documentElement.lang||'tr');
  const draw=()=>{const p=pan*Math.PI/180,t=tilt*Math.PI/180,hx=-Math.sin(t)*Math.cos(p),vy=Math.cos(t),lz=Math.sin(t)*Math.sin(p),n2=Math.hypot(hx,vy);const nn=n2||1;O[0]=460+28*hx/nn;O[1]=100+28*vy/nn;
    head.setAttribute('transform',`rotate(${(-Math.atan2(hx,vy)*180/Math.PI).toFixed(1)})`);
    const rot=(a)=>{const c=Math.cos(a),s=Math.sin(a);return [hx*c-vy*s,hx*s+vy*c]};const e1=rot(BA/2*n2),e2=rot(-BA/2*n2),c0=hitRay(hx,vy),a=hitRay(...e1),b=hitRay(...e2);
    if(a&&b&&c0&&n2>.08){let pts=[O,[a.x,a.y]];if(a.s!==b.s){const cx=(a.s==='c'||b.s==='c')&&(a.s==='f'||b.s==='f')?[56,380]:(a.s==='c'||b.s==='c')&&(a.s==='k'||b.s==='k')?[56,40]:null;if(cx)pts.push(cx)}pts.push([b.x,b.y]);
      beam.setAttribute('d','M'+pts.map(q=>q.join(' ')).join('L')+'Z');const s3=Math.hypot(c0.x-O[0],c0.y-O[1])/PX/n2,dia=2*s3*Math.tan(BA/2),w=Math.hypot(a.x-b.x,a.y-b.y)/2;
      pool.setAttribute('cx',c0.x);pool.setAttribute('cy',c0.y);pool.setAttribute('rx',c0.s==='c'?6:Math.max(8,w));pool.setAttribute('ry',c0.s==='c'?Math.max(8,w):6);pool.style.opacity=c0.s==='h'?0:.75;
      const om=2*Math.PI*(1-Math.cos(BA/2)),I=LM*.7/om,inc=c0.s==='c'?Math.abs(hx/n2):c0.s==='f'?Math.abs(vy/n2):.8,lux=Math.round(I*inc/(s3*s3)/10)*10;
      V[2].textContent=c0.s==='h'?'–':fm(s3)+' m';V[3].textContent=c0.s==='h'?'–':fm(dia)+' m';V[4].textContent=c0.s==='h'?'–':'≈ '+(lux>=1000?fm(lux/1000)+'k':lux)+' lux'}
    else{beam.setAttribute('d','');pool.style.opacity=0;V[2].textContent=V[3].textContent=V[4].textContent='–'}
    V[0].textContent=Math.round(pan)+'°';V[1].textContent=Math.round(tilt)+'°';pad.setAttribute('aria-valuetext',`Pan ${Math.round(pan)}°, Tilt ${Math.round(tilt)}°`);
    cm.innerHTML=`<circle cx="600" cy="30" r="22" fill="#101216" stroke="#2c3138"/><path d="M600 30l${(Math.sin(p)*18).toFixed(1)} ${(-Math.cos(p)*18).toFixed(1)}" stroke="#F29A1F" stroke-width="3" stroke-linecap="round"/><text x="600" y="66" text-anchor="middle" font-family="Barlow Condensed,sans-serif" font-size="11" fill="#8A9099">PAN</text>`};
  const loop=n=>{const dt=Math.min(.1,(n-last)/1000);last=n;if(on){if(drag){pan=Math.max(-270,Math.min(270,pan+ux*Math.abs(ux)*140*dt));tilt=Math.max(-135,Math.min(135,tilt-uy*Math.abs(uy)*100*dt));draw()}
      else if(!R&&n-idle>2500){const s=n/1000;pan=Math.sin(s*.3)*55;tilt=48+Math.sin(s*.47)*72;draw()}}requestAnimationFrame(loop)};
  const mv=e=>{const r=pad.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,rad=r.width/2-21;let dx=e.clientX-cx,dy=e.clientY-cy;const d=Math.hypot(dx,dy);if(d>rad){dx*=rad/d;dy*=rad/d}ux=dx/rad;uy=dy/rad;kn.style.transform=`translate(${dx}px,${dy}px)`};
  pad.addEventListener('pointerdown',e=>{drag=true;idle=performance.now();pad.setPointerCapture(e.pointerId);mv(e);e.preventDefault()});pad.addEventListener('pointermove',e=>{if(drag)mv(e)});
  const up=()=>{drag=false;ux=uy=0;kn.style.transform='';idle=performance.now()};pad.addEventListener('pointerup',up);pad.addEventListener('pointercancel',up);
  pad.addEventListener('keydown',e=>{const k={ArrowLeft:[-5,0],ArrowRight:[5,0],ArrowUp:[0,5],ArrowDown:[0,-5]}[e.key];if(!k)return;e.preventDefault();idle=performance.now()+5000;pan=Math.max(-270,Math.min(270,pan+k[0]));tilt=Math.max(-135,Math.min(135,tilt+k[1]));draw()});
  vis(B,v=>{on=v},.2);draw();requestAnimationFrame(loop)});
/* görüş hatları */
document.querySelectorAll('[data-sl]').forEach(B=>{const S=B.querySelector('svg'),rg=B.querySelector('input'),ob=B.querySelector('.slr b'),st=B.querySelector('.slst'),K=34,F=320,X0=30,D=10,lang=document.documentElement.lang||'tr';
  const X=m=>X0+m*K,Y=h=>F-h*K,P=[1.4,3.8,6.2,8.4],PH=[7,7,7,7],E1=[D+2.5,.1],EN=[D+18,5];
  const ext=(E,b,brd,x)=>E[1]+(brd-E[1])*(E[0]-x)/(E[0]-b);
  const draw=()=>{const brd=+rg.value;ob.textContent=brd.toLocaleString(lang,{minimumFractionDigits:1})+' m';const MB=P.map(p=>Math.min(D-.15,p+.45));let o='';
    o+=`<rect width="720" height="360" fill="#07080a"/><path d="M${X(0)} ${F}H${X(D)}V${F+26}H${X(D+2)}L${X(D+21)} ${Y(4.3)}" fill="none" stroke="#3a342e" stroke-width="3"/><rect x="${X(0)}" y="${F}" width="${D*K}" height="26" fill="#141210"/><rect x="${X(0)-8}" y="${Y(9.5)}" width="8" height="${9.5*K}" fill="#121317"/>`;
    for(let r=0;r<9;r++){const m=D+2.5+r*2,h=-.75+r*.55;if(X(m)<720)o+=`<path d="M${X(m)-8} ${Y(h)}h16v-12" stroke="#5a1520" stroke-width="5" fill="none"/>`}
    MB.forEach(b=>{o+=`<rect x="${X(b)-3}" y="${Y(brd+1.4)}" width="6" height="${1.4*K}" fill="#2b2f35" stroke="#454b53"/>`});
    let vis=0;P.forEach((p,i)=>{const hh=PH[i],v=!MB.some(b=>b>p&&hh>ext(E1,b,brd,p));if(v)vis++;o+=`<rect x="${X(p)-6}" y="${Y(hh)-6}" width="12" height="12" fill="none" stroke="${v?'#ff6b5c':'#8A9099'}" stroke-width="2"/><path d="M${X(p)} ${Y(hh)+6}v10" stroke="${v?'#ff6b5c':'#8A9099'}" stroke-width="2"/>`+(v?`<text x="${X(p)}" y="${Y(hh)-12}" text-anchor="middle" font-family="Barlow,sans-serif" font-size="15" font-weight="700" fill="#ff6b5c">⚠</text>`:'')});
    MB.forEach(b=>{const y0=ext(E1,b,brd,0);o+=`<path d="M${X(E1[0])} ${Y(E1[1])}L${X(b)} ${Y(brd)}L${X(0)} ${Y(y0)}" fill="none" stroke="#5B9BFF" stroke-width="1.6" stroke-dasharray="6 4" opacity=".9"/>`;
      const xr=(720-X0)/K, yr=ext(EN,b,brd,xr), dn=EN[1]>brd, fl=dn?EN[0]-(0-EN[1])*(EN[0]-b)/(brd-EN[1]):-1, xf=Math.max(0,Math.min(b,fl)), ye=dn&&xf>0?0:ext(EN,b,brd,0);o+=`<path d="M720 ${Y(yr)}L${X(b)} ${Y(brd)}L${X(xf)} ${Y(ye)}" fill="none" stroke="#FF5D8F" stroke-width="1.4" stroke-dasharray="3 5" opacity=".85"/>`});
    o+=`<circle cx="${X(E1[0])}" cy="${Y(E1[1])}" r="5" fill="#5B9BFF"/><text x="${X(E1[0])}" y="${Y(E1[1])+20}" text-anchor="middle" font-family="Barlow,sans-serif" font-size="12" font-weight="700" fill="#5B9BFF">${B.dataset.r1}</text><text x="712" y="24" text-anchor="end" font-family="Barlow,sans-serif" font-size="12" font-weight="700" fill="#FF5D8F">${B.dataset.rn} →</text>`;
    S.innerHTML=o;st.textContent=vis?`⚠ ${vis} · ${B.dataset.vis}`:B.dataset.ok;st.classList.toggle('bad',!!vis)};
  rg.addEventListener('input',draw);draw();
  if(!R){let t0=0,done=false;vis(B,v=>{if(v&&!done){done=true;const a=+rg.value,s=performance.now(),f=n=>{const k=Math.min(1,(n-s)/2600),q=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;rg.value=(a+Math.sin(q*Math.PI)*1.0).toFixed(1);draw();if(k<1)requestAnimationFrame(f);else{rg.value=a;draw()}};requestAnimationFrame(f)}},.5)}});
/* sayaçlar */
document.querySelectorAll('.stats b[data-n]').forEach(b=>{const raw=b.dataset.n,dec=/[.,]/.test(raw)?1:0,sep=raw.includes(',')?',':'.',val=parseFloat(raw.replace(',','.'));if(R)return;b.textContent='0';
  vis(b,v=>{if(!v||b._d)return;b._d=1;const s=performance.now(),f=n=>{const k=Math.min(1,(n-s)/1400),e=1-Math.pow(1-k,3);b.textContent=(val*e).toFixed(dec).replace('.',sep);if(k<1)requestAnimationFrame(f)};requestAnimationFrame(f)},.6)});
/* evrak duvarı */
document.querySelectorAll('.ppwall').forEach(w=>{vis(w,v=>{if(v)w.classList.add('in')},.15);const d=w.parentElement.parentElement.querySelector('.ppd');if(!d)return;const im=d.querySelector('img');
  w.querySelectorAll('.ppg').forEach(b=>b.addEventListener('click',()=>{im.src=b.dataset.src;im.alt=b.querySelector('img').alt;try{d.showModal()}catch(_){d.setAttribute('open','')}}));
  d.addEventListener('click',e=>{if(e.target===d||e.target.closest('.x'))d.close()})});
})();
/* 2D ↔ 3D kaydırıcı */
document.querySelectorAll('.cmp2').forEach(c=>{const r=c.querySelector('input'),set=v=>c.style.setProperty('--p',v+'%');
r.addEventListener('input',()=>set(r.value));set(r.value);
if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;let touched=false;['pointerdown','keydown','touchstart'].forEach(e=>r.addEventListener(e,()=>touched=true,{passive:true}));
const io=new IntersectionObserver(e=>{if(!e[0].isIntersecting)return;io.disconnect();let t0=null;const st=t=>{if(touched)return;t0=t0||t;const k=(t-t0)/2200;if(k>=1){set(50);r.value=50;return}const v=50+Math.sin(k*Math.PI*2)*28;set(v);r.value=v;requestAnimationFrame(st)};setTimeout(()=>requestAnimationFrame(st),500)},{threshold:.6});io.observe(c)});
