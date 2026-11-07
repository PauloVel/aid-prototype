/* Product: the poster first, then Add to cart (see product.css).
   Story beats, as a fraction of the pinned scroll:  Look 0-.34  >  Closer .34-.70 (the footage behind brightens)  >  Yours .70-1 (it settles).
   The poster itself never moves, swaps or changes size. Then a closing headline whose letters flip in. site.js owns price, quantity and add to cart.
   Progress is eased once per frame; every layout read happens before the writes. */
(function(){
  var story=document.querySelector('.px-story');
  if(!story)return;
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root=document.documentElement,$=function(s,c){return (c||document).querySelector(s)},$$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};
  if(reduce)return; // static: nothing pinned, first word shown by CSS
  root.classList.add('px-js');

  var dim=$('.px-dim'),words=$$('.px-w'),end=$('.px-end'),flip=$('.px-flip');
  var cl=function(v){return Math.min(1,Math.max(0,v))},T=function(p,a,b){return cl((p-a)/(b-a))};
  var io=function(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2},mix=function(a,b,t){return a+(b-a)*t};
  var prog=function(el){var r=el.getBoundingClientRect(),tot=r.height-innerHeight;return tot>0?cl(-r.top/tot):0};
  var vis=function(el){var r=el.getBoundingClientRect();return r.bottom>-100&&r.top<innerHeight+100};
  $$('.px-flip span:not(.sp)').forEach(function(s,i){s.style.setProperty('--i',i)});

  /* arrival: the poster flips upright once the page transition is done */
  var arrive=function(){story.classList.add('px-go')};
  if(window.aidOnLift)window.aidOnLift(arrive);else setTimeout(arrive,200);
  setTimeout(arrive,6500);

  /* the poster itself never moves or changes size; the footage behind it brightens for "Closer" and settles for "Yours" */
  var beat=-1;
  var setBeat=function(b){
    if(b===beat)return;beat=b;
    words.forEach(function(w,i){var on=i===b;w.style.opacity=on?1:0;w.style.visibility=on?'visible':'hidden';w.classList.remove('pop');if(on){void w.offsetWidth;w.classList.add('pop')}});
  };
  var drawStory=function(p){
    setBeat(p<.34?0:p<.7?1:2);
    dim.style.opacity=(mix(mix(1,.3,io(T(p,.28,.42))),.75,io(T(p,.62,.76)))).toFixed(3);
  };

  /* the close: letters flip in when it arrives; "Back to the poster" scrolls up */
  new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)flip.classList.add('in')})},{threshold:.4}).observe(flip);
  var top=$('[data-top]');
  if(top)top.addEventListener('click',function(e){e.preventDefault();scrollTo({top:0,behavior:'smooth'})});

  /* one frame, progress eased toward the scroll position (80ms) */
  var tick=false,sm={s:0},first=true,tLast=0,K=1,need=false;
  var ease=function(key,el,visible){
    var t=prog(el);
    if(first||!visible)sm[key]=t;else{sm[key]+=(t-sm[key])*K;if(Math.abs(t-sm[key])<.0004)sm[key]=t;else need=true}
    return sm[key];
  };
  var draw=function(){
    tick=false;
    var now=performance.now(),dt=Math.min(64,now-tLast||16);tLast=now;K=1-Math.exp(-dt/80);need=false;
    var vs=vis(story);
    var ps=ease('s',story,vs);first=false;
    if(vs)drawStory(ps);
    if(need)req();
  };
  var req=function(){if(!tick){tick=true;requestAnimationFrame(draw)}};
  addEventListener('scroll',req,{passive:true});
  addEventListener('resize',function(){first=true;req()});
  var init=function(){first=true;draw()};
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(init);
  init();
})();
