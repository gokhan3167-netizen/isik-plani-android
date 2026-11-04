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
   const h=()=>{ const k=(location.hash||'').slice(1); if(k) sel(k); else { const ua=navigator.userAgent; sel(/android/i.test(ua)?'android':/iphone|ipad|macintosh.*mobile/i.test(ua)?'ios':/mac/i.test(ua)?'mac':/win/i.test(ua)?'windows':'web'); } };
   h(); addEventListener('hashchange',h); }
})();
