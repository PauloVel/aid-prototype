/* Product: pinned scroll story (see product.css).
   Beats, as a fraction of the story's scroll: the poster flips in on arrival; .07-.57 scroll through its images (each flips edge-on and swaps at that instant);
   .60-.90 scroll through its sizes (the poster scales to real proportions, the chips preview the size); then the page moves on.
   Progress is eased once per frame; every layout read happens before the writes. site.js still owns price, quantity and add to cart. */
(function(){
  var story=document.querySelector('.px-story');
  if(!story)return;
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root=document.documentElement,$=function(s,c){return (c||document).querySelector(s)},$$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};
  var img=$('#pdpmain'),poster=$('.px-poster'),intro=$('.px-intro'),thumbs=$$('.pdp-thumbs button'),N=thumbs.length;
  var two=function(n){return (n<10?'0':'')+n};
  var iEl=$('[data-px-i]'),nEl=$('[data-px-n]'),cap=$('[data-px-cap]'),szN=$('[data-px-sz]'),szD=$('[data-px-dim]');
  if(nEl)nEl.textContent=two(N);

  /* price mirrored by site.js; also highlight which size the story is showing */
  var radios=$$('input[name=size]'),chips=radios.map(function(r){return r.nextElementSibling});
  var sizeNames=['A3','A2','A1'];

  if(reduce)return; // static: thumbs keep site.js's simple swap, nothing is pinned
  root.classList.add('px-js');
  var cl=function(v){return Math.min(1,Math.max(0,v))},T=function(p,a,b){return cl((p-a)/(b-a))};
  var out=function(t){return 1-Math.pow(1-t,3)},io=function(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2},mix=function(a,b,t){return a+(b-a)*t};
  var GAL0=.07,GALW=.5;
  thumbs.forEach(function(b){var im=new Image();im.src=b.dataset.full}); // swaps are instant

  /* arrival: the poster flips upright once the page transition is done */
  var arrive=function(){story.classList.add('px-go')};
  if(window.aidAfterLift)window.aidAfterLift(arrive);else setTimeout(arrive,300);
  setTimeout(arrive,7000);

  var cur=-1;
  var setImg=function(i){
    if(i===cur)return;cur=i;
    var b=thumbs[i];img.src=b.dataset.full;img.alt=b.dataset.alt||img.alt;
    thumbs.forEach(function(x){x.setAttribute('aria-pressed',x===b)});
    if(iEl)iEl.textContent=two(i+1);if(cap)cap.textContent=b.dataset.alt||'';
  };
  var szShown=-1;
  var setSize=function(k){
    if(k===szShown)return;szShown=k;
    var r=radios[k];if(!r)return;
    szN.textContent=sizeNames[k];szD.textContent=r.dataset.dim||'';
    szN.classList.remove('pop');void szN.offsetWidth;szN.classList.add('pop');
    chips.forEach(function(c,i){if(c)c.classList.toggle('peek',i===k)});
  };

  var yFor=function(p){var r=story.getBoundingClientRect(),tot=r.height-innerHeight;return scrollY+r.top+tot*p};
  var go=function(p){scrollTo({top:yFor(p),behavior:'smooth'})};
  var strip=$('.pdp-thumbs');
  strip.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;e.stopPropagation();go(GAL0+(thumbs.indexOf(b)+.5)/N*GALW)},true);
  radios.forEach(function(r,k){r.addEventListener('change',function(){
    if(prog(story)>=.58&&k<3)go([.69,.81,.92][k]);
  })});

  var head=$('.px-head'),crumbs=$('.px-crumbs'),meta=$('.px-meta'),size=$('.px-size'),hint=$('.px-hint'),vid=$('.px-vid');
  var prog=function(el){var r=el.getBoundingClientRect(),tot=r.height-innerHeight;return tot>0?cl(-r.top/tot):0};
  var vis=function(el){var r=el.getBoundingClientRect();return r.bottom>-100&&r.top<innerHeight+100};
  var sv=function(el,on){var v=on?'visible':'hidden';if(el._sv!==v){el._sv=v;el.style.visibility=v}};

  var drawStory=function(p){
    var g=cl((p-GAL0)/GALW)*N,idx=Math.min(N-1,Math.floor(g)),ang=0,k,u;
    for(k=1;k<N;k++){u=g-k;if(Math.abs(u)<.14)ang=u<0?-90*(1+u/.14):90*(1-u/.14)}
    setImg(idx);
    var sc=.86;
    sc=mix(sc,.5,io(T(p,.6,.66)));sc=mix(sc,.7,io(T(p,.72,.78)));sc=mix(sc,1,io(T(p,.84,.9)));
    poster.style.transform='rotateX('+ang.toFixed(2)+'deg) scale('+sc.toFixed(4)+')';
    var hf=1-T(p,.56,.64);
    head.style.opacity=hf;crumbs.style.opacity=hf;sv(head,hf>0);sv(crumbs,hf>0);
    var mo=T(p,.05,.09)*(1-T(p,.58,.62));meta.style.opacity=mo;sv(meta,mo>0);
    var so=T(p,.6,.63)*(1-T(p,.94,.98));size.style.opacity=so;sv(size,so>0);
    if(so>0)setSize(p<.72?0:p<.84?1:2);
    hint.style.opacity=1-T(p,.005,.04);
    vid.style.transform='scale('+(1.12-.1*p)+')';
  };

  /* sideways reel of more posters */
  var reel=$('.px-reel'),track=$('.px-track'),rcs=$$('.px-rc',track),tw=0;
  var measure=function(){track.style.transform='none';tw=track.scrollWidth-innerWidth};
  var drawReel=function(p){
    var c=innerWidth/2;
    track.style.transform='translate3d('+(-tw*io(T(p,.04,.96)))+'px,0,0)';
    var os=rcs.map(function(el){var r=el.getBoundingClientRect();return (r.left+r.width/2-c)/innerWidth});
    rcs.forEach(function(el,i){var o=os[i],d=cl(Math.abs(o)*1.6);el.style.transform='rotateY('+(-(o>0?1:-1)*42*d*d*d)+'deg) scale('+(1-.15*d)+')'});
  };

  /* one frame, progress eased toward the scroll position (110ms) */
  var tick=false,sm={s:0,r:0},first=true,tLast=0,K=1,need=false;
  var ease=function(key,el,visible){
    var t=prog(el);
    if(first||!visible)sm[key]=t;else{sm[key]+=(t-sm[key])*K;if(Math.abs(t-sm[key])<.0004)sm[key]=t;else need=true}
    return sm[key];
  };
  var draw=function(){
    tick=false;
    var now=performance.now(),dt=Math.min(64,now-tLast||16);tLast=now;K=1-Math.exp(-dt/110);need=false;
    var vs=vis(story),vr=vis(reel);
    var ps=ease('s',story,vs),pr=ease('r',reel,vr);first=false;
    if(vs)drawStory(ps);if(vr)drawReel(pr);
    if(need)req();
  };
  var req=function(){if(!tick){tick=true;requestAnimationFrame(draw)}};
  addEventListener('scroll',req,{passive:true});
  addEventListener('resize',function(){measure();first=true;req()});
  var init=function(){measure();first=true;draw()};
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(init);
  init();
})();
