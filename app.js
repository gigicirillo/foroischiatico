(() => {
'use strict';
const $ = (s) => document.querySelector(s);
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const prefersReduced = () => reduced.matches || new URLSearchParams(location.search).get('motion') === 'reduce';
const mobile = matchMedia('(max-width: 760px)');
const sections = [...document.querySelectorAll('.chapter')];
const clamp = (v, a=0, b=1) => Math.min(b, Math.max(a,v));
const loader = $('.loader');
const percent = $('#load-percent');
let staticMode = prefersReduced() || mobile.matches;
let paused = false, lenis, active = 0, frame = 0, lastPaint = '', drawPending = false;
const blobs = new Map(), bitmaps = new Map(), pending = new Map(), loads = new Map();
const names = sections.map(s => s.dataset.sequence);
const regions = [
 ['CERVICALE','Mobilità e postura','Valutazione posturale e rieducazione globale.'],
 ['DORSALE','Equilibrio e catene muscolari','Uno sguardo alle relazioni tra postura e movimento.'],
 ['LOMBARE','Colonna e dischi intervertebrali','Posturologia e decompressione spinale: percorsi definiti dopo una valutazione.'],
 ['SACRO E BACINO','Stabilità e movimento','Il viaggio continua tra bacino, appoggio e funzione.']
];
let regionIndex=-1, canvasSizes=[];
function unlock(){loader.classList.add('done');document.body.classList.remove('is-loading');document.body.classList.add('experience-ready');loader.setAttribute('aria-hidden','true');}
function setPercent(v){percent.textContent=`${v}%`;$('#load-bar').style.width=`${v}%`;}
function setStatic(){
 staticMode=true; document.body.classList.add('static-mode');
 document.body.classList.toggle('reduced',prefersReduced());
 lenis?.destroy(); lenis=null;
 bitmaps.forEach(b=>b.close());bitmaps.clear();
 if(!prefersReduced()){
 const obs=new IntersectionObserver(entries=>entries.forEach(e=>{
 const v=e.target;
 if(e.isIntersecting&&!paused){if(!v.src){v.src=v.dataset.src;v.load();}v.play().catch(()=>{});}else v.pause();
 }),{threshold:.15});document.querySelectorAll('video').forEach(v=>obs.observe(v));
 }
 setPercent(100);unlock();
}
async function fetchFrame(key){
 if(blobs.has(key))return blobs.get(key);
 const [name,n]=key.split('/');
 const response=await fetch(`frames/${name}/frame_${String(+n+1).padStart(4,'0')}.jpg`,{signal:AbortSignal.timeout(20000)});
 if(!response.ok)throw new Error('Frame unavailable');
 const blob=await response.blob();blobs.set(key,blob);return blob;
}
function loadChapter(index,onProgress){
 if(loads.has(index))return loads.get(index);
 let next=0,done=0;
 const job=Promise.all(Array.from({length:6},async()=>{
 while(next<150&&!staticMode){const n=next++;await fetchFrame(`${names[index]}/${n}`);onProgress?.(++done/150);}
 }));loads.set(index,job);return job;
}
async function bitmap(key){
 if(bitmaps.has(key)){const b=bitmaps.get(key);bitmaps.delete(key);bitmaps.set(key,b);return b;}
 if(pending.has(key))return pending.get(key);
 const promise=(async()=>{
 const b=await createImageBitmap(await fetchFrame(key));
 if(staticMode){b.close();return null;}
 bitmaps.set(key,b);
 while(bitmaps.size>32){const first=bitmaps.keys().next().value;bitmaps.get(first).close();bitmaps.delete(first);}
 return b;
 })();pending.set(key,promise);
 try{return await promise;}finally{pending.delete(key);}
}
function sizeCanvases(){
 canvasSizes=sections.map(s=>{const c=s.querySelector('canvas'),r=s.querySelector('.scene').getBoundingClientRect();const dpr=Math.min(devicePixelRatio||1,1.5);c.width=Math.round(r.width*dpr);c.height=Math.round(r.height*dpr);return [c.width,c.height];});
 lastPaint='';
}
function paint(index,n){
 const key=`${names[index]}/${n}`;
 if(lastPaint===key||drawPending||staticMode)return;
 drawPending=true;
 bitmap(key).then(b=>{
 if(!b||staticMode||index!==active)return;
 const c=sections[index].querySelector('canvas'),ctx=c.getContext('2d'),[w,h]=canvasSizes[index];
 const scale=Math.max(w/b.width,h/b.height),dw=b.width*scale,dh=b.height*scale;
 ctx.drawImage(b,(w-dw)*.65,(h-dh)/2,dw,dh);c.classList.add('ready');lastPaint=key;
 }).catch(()=>{sections[index].querySelector('canvas').classList.remove('ready');}).finally(()=>{drawPending=false;});
 // Keep only a small decoded neighborhood in memory; compressed frames can remain cached.
 for(const offset of [1,2,4,8,-1,-3]){const next=clamp(n+offset,0,149),near=`${names[index]}/${next}`;if(blobs.has(near)&&!bitmaps.has(near)&&pending.size<8)bitmap(near).catch(()=>{});}
}
function bg(progress){const a=progress<.5?[14,58,92]:[7,27,48],b=progress<.5?[7,27,48]:[0,0,0],t=progress<.5?progress*2:(progress-.5)*2;return `rgb(${a.map((v,i)=>Math.round(v+(b[i]-v)*t)).join(',')})`;}
function loop(time){
 lenis?.raf(time);
 $('.header').classList.toggle('scrolled',scrollY>40);
 if(!staticMode&&!paused){
 let chosen=0,p=0;
 sections.forEach((s,i)=>{const r=s.getBoundingClientRect();if(r.top<=innerHeight*.4){chosen=i;p=clamp(-r.top/(s.offsetHeight-innerHeight));}});
 if(chosen!==active){active=chosen;frame=p*149;lastPaint='';}else frame+=(p*149-frame)*.14;
 const visible=sections[active].getBoundingClientRect().bottom>0;
 if(visible)paint(active,Math.round(frame));
 const r=sections[1].getBoundingClientRect(),jp=clamp(-r.top/(sections[1].offsetHeight-innerHeight));
 document.body.style.backgroundColor=bg(jp);
 sections[1].querySelector('.scene').style.backgroundColor=bg(jp);
 sections[1].querySelector('.visual').style.filter=`brightness(${1-jp*.5})`;
 $('#progress').textContent=Math.round(jp*100);
 $('.meter-track i').style.width=`${jp*100}%`;
 const ri=Math.min(3,Math.floor(jp*4));
 if(ri!==regionIndex){regionIndex=ri;$('#region').textContent=regions[ri][0];$('#region-title').textContent=regions[ri][1];$('#region-copy').textContent=regions[ri][2];}
 }
 requestAnimationFrame(loop);
}
$('.menu-toggle').addEventListener('click',()=>{const open=$('.menu-toggle').getAttribute('aria-expanded')!=='true';$('.menu-toggle').setAttribute('aria-expanded',open);$('.menu-toggle').setAttribute('aria-label',open?'Chiudi menu':'Apri menu');$('#mobile-menu').hidden=!open;});
$('#mobile-menu').querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{$('#mobile-menu').hidden=true;$('.menu-toggle').setAttribute('aria-expanded','false');$('.menu-toggle').setAttribute('aria-label','Apri menu');}));
document.addEventListener('keydown',e=>{if(e.key==='Escape'){$('#mobile-menu').hidden=true;$('.menu-toggle').setAttribute('aria-expanded','false');$('.menu-toggle').setAttribute('aria-label','Apri menu');}});
$('.motion-toggle').addEventListener('click',()=>{
 paused=!paused;const b=$('.motion-toggle');b.textContent=paused?'Riprendi animazioni ▷':'Pausa animazioni Ⅱ';b.setAttribute('aria-label',paused?'Riprendi le animazioni':'Metti in pausa le animazioni');
 document.querySelectorAll('video').forEach(v=>{if(paused)v.pause();else if(v.src&&!prefersReduced())v.play().catch(()=>{});});
});
$('#year').textContent=new Date().getFullYear();
window.addEventListener('resize',()=>{if(mobile.matches&&!staticMode)setStatic();sizeCanvases();lenis?.resize();});
reduced.addEventListener('change',()=>{if(reduced.matches){setStatic();document.querySelectorAll('video').forEach(v=>v.pause());}});
sizeCanvases();requestAnimationFrame(loop);
if(staticMode){setStatic();}else{
 document.body.classList.add('is-loading');
 const deadline=setTimeout(()=>{setStatic();},22000);
 loadChapter(0,p=>setPercent(Math.floor(p*100))).then(async()=>{
 if(staticMode)return;
 await bitmap('reveal/0');setPercent(100);clearTimeout(deadline);unlock();
 if(window.Lenis)lenis=new Lenis({duration:1.15,smoothWheel:true,anchors:true});
 loadChapter(1).then(()=>loadChapter(2)).catch(()=>{});
 }).catch(()=>{clearTimeout(deadline);setStatic();});
}
})();
