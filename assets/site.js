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
