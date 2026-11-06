(()=>{
// plan ↔ 3D kaydırıcı
document.querySelectorAll('.cmp').forEach(c=>{
  const r=c.querySelector('input');
  const set=v=>c.style.setProperty('--p',v+'%');
  r.addEventListener('input',()=>set(r.value));
  set(r.value);
  // ilk görünüşte kısa bir tanıtım hareketi
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
    const io=new IntersectionObserver(e=>{if(!e[0].isIntersecting)return;io.disconnect();
      let t0=null;const step=t=>{if(r.dataset.touched)return;t0=t0||t;const k=(t-t0)/1800;if(k>=1){set(50);r.value=50;return}
        const v=50+Math.sin(k*Math.PI*2)*22;set(v);r.value=v;requestAnimationFrame(step)};requestAnimationFrame(step)},{threshold:.5});
    io.observe(c);
    ['pointerdown','keydown','touchstart'].forEach(ev=>r.addEventListener(ev,()=>r.dataset.touched=1,{passive:true}));
  }
});
// ürün menüsünde etkin bölüm
const links=[...document.querySelectorAll('.pnav a[href^="#"]')];
if(links.length){
  const secs=links.map(a=>document.querySelector(a.getAttribute('href'))).filter(Boolean);
  const on=()=>{const y=innerHeight*.35;let cur=secs[0];secs.forEach(s=>{if(s.getBoundingClientRect().top<y)cur=s});
    links.forEach(a=>a.classList.toggle('on',a.getAttribute('href')==='#'+cur.id))};
  addEventListener('scroll',on,{passive:true});on();
}
// görüntü büyütme
const box=document.createElement('div');box.className='lbx';box.setAttribute('role','dialog');box.setAttribute('aria-label',document.documentElement.lang==='en'?'Image':'Görüntü');
const im=document.createElement('img');im.alt='';box.appendChild(im);document.body.appendChild(box);
const close=()=>box.classList.remove('on');
box.addEventListener('click',close);addEventListener('keydown',e=>{if(e.key==='Escape')close()});
document.querySelectorAll('.mos a').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();im.src=a.href;box.classList.add('on')}));
})();
