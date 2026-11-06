/* Product: one pinned story about ONE poster (see product.css).
   Beats, as a fraction of the story's scroll:
     Look   0 - .22   the poster arrives (flip-in after the page transition), turns slightly
     Closer .22 - .49 we zoom into the print
     Size it .49 - .90 it shrinks to real proportions beside a 175 cm person: A3, then A2, then A1 (each one held)
     Hang it .90 - 1  it settles on the wall, the Add to cart button pulses
   Scrolling never swaps the poster. site.js still owns price, quantity and add to cart.
   Progress is eased once per frame; every layout read happens before the writes. */
(function(){
  var story=document.querySelector('.px-story');
  if(!story)return;
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root=document.documentElement,$=function(s,c){return (c||document).querySelector(s)},$$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};
  if(reduce)return; // static: nothing pinned, first word shown by CSS
  root.classList.add('px-js');

  var img=$('#pdpmain'),poster=$('.px-poster'),stage=$('.px-stage'),room=$('.px-room'),floor=$('.px-floor'),person=$('.px-person'),pl=$('.px-pl'),size=$('.px-size');
  var words=$$('.px-w'),nav=$$('.px-nav button');
  var szN=$('[data-px-sz]'),szD=$('[data-px-dim]'),szT=$('[data-px-tag]');
  var radios=$$('input[name=size]'),chips=radios.map(function(r){return r.nextElementSibling});
  var cl=function(v){return Math.min(1,Math.max(0,v))},T=function(p,a,b){return cl((p-a)/(b-a))};
  var io=function(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2},mix=function(a,b,t){return a+(b-a)*t};
  var mixp=function(a,b,t){return {s:mix(a.s,b.s,t),tx:mix(a.tx,b.tx,t),ty:mix(a.ty,b.ty,t),ry:mix(a.ry,b.ry,t)}};
  var CM=[42,59,84];

  /* arrival: the poster flips upright once the page transition is done */
  var arrive=function(){story.classList.add('px-go')};
  if(window.aidAfterLift)window.aidAfterLift(arrive);else setTimeout(arrive,300);
  setTimeout(arrive,7000);

  /* geometry (layout px, unaffected by transforms) */
  var G={ok:false};
  var geo=function(){
    var H0=img.offsetHeight,W0=img.offsetWidth;
    if(!H0||!W0)return;
    var cs=getComputedStyle(stage),vw=innerWidth,vh=innerHeight,mob=vw<=900;
    var cx=vw/2,cy=(parseFloat(cs.paddingTop)+vh-parseFloat(cs.paddingBottom))/2;
    var floorY=vh*(mob?.64:.79),pH=Math.min(vh*(mob?.34:.6),floorY-(mob?150:120)),pc=pH/175;
    var tX=vw*(mob?.64:.58),fx=parseFloat(img.dataset.fx)||.5,fy=parseFloat(img.dataset.fy)||.4;
    var sA1=CM[2]*pc/H0,pers=60*pc,pX=tX-W0*sA1/2-pers-(mob?8:22);
    G={ok:true,H0:H0,W0:W0,cx:cx,cy:cy,floorY:floorY,pc:pc,
      zoom:{s:2.5,tx:-(fx-.5)*W0*2.5,ty:-(fy-.5)*H0*2.5,ry:0},
      sz:CM.map(function(cm){var s=cm*pc/H0;return {s:s,tx:tX-cx,ty:(floorY-150*pc)-cy,ry:0}}),
      hang:{s:.92,tx:0,ty:0,ry:0}};
    floor.style.top=floorY+'px';
    person.style.width=pers+'px';person.style.height=(175*pc)+'px';person.style.left=pX+'px';person.style.top=(floorY-175*pc)+'px';
    pl.style.left=pX+'px';pl.style.top=(floorY+8)+'px';
  };
  if(img.complete)geo();else img.addEventListener('load',function(){geo();req()});

  var yFor=function(p){var r=story.getBoundingClientRect(),tot=r.height-innerHeight;return scrollY+r.top+tot*p};
  var go=function(p){scrollTo({top:yFor(p),behavior:'smooth'})};
  nav.forEach(function(b){b.addEventListener('click',function(){go([.03,.33,.6,.96][+b.dataset.b])})});
  radios.forEach(function(r,k){r.addEventListener('change',function(){if(prog(story)>=.5&&k<3)go([.6,.72,.84][k])})});

  var beat=-1,szShown=-1;
  var setBeat=function(b){
    if(b===beat)return;beat=b;
    words.forEach(function(w,i){
      var on=i===b;w.style.opacity=on?1:0;w.style.visibility=on?'visible':'hidden';
      w.classList.remove('pop');if(on){void w.offsetWidth;w.classList.add('pop')}
    });
    nav.forEach(function(n,i){n.classList.toggle('on',i===b)});
  };
  var setSize=function(k){
    if(k===szShown)return;szShown=k;
    var r=radios[k];if(!r)return;
    szN.textContent=r.value;szD.textContent=r.dataset.dim||'';szT.textContent=r.dataset.tag||'';
    szN.classList.remove('pop');void szN.offsetWidth;szN.classList.add('pop');
    chips.forEach(function(c,i){if(c)c.classList.toggle('peek',i===k)});
  };
  var sv=function(el,on){var v=on?'visible':'hidden';if(el._sv!==v){el._sv=v;el.style.visibility=v}};

  var prog=function(el){var r=el.getBoundingClientRect(),tot=r.height-innerHeight;return tot>0?cl(-r.top/tot):0};
  var vis=function(el){var r=el.getBoundingClientRect();return r.bottom>-100&&r.top<innerHeight+100};
  var vid=$('.px-vid');

  var drawStory=function(p){
    setBeat(p<.22?0:p<.49?1:p<.9?2:3);
    story.classList.toggle('px-end',p>=.9);
    if(G.ok){
      var pose={s:1,tx:0,ty:0,ry:mix(-9,9,T(p,0,.22))};
      pose=mixp(pose,G.zoom,io(T(p,.2,.3)));
      pose=mixp(pose,G.sz[0],io(T(p,.44,.54)));
      pose=mixp(pose,G.sz[1],io(T(p,.62,.68)));
      pose=mixp(pose,G.sz[2],io(T(p,.74,.8)));
      pose=mixp(pose,G.hang,io(T(p,.88,.95)));
      poster.style.transform='translate3d('+pose.tx.toFixed(1)+'px,'+pose.ty.toFixed(1)+'px,0) rotateY('+pose.ry.toFixed(2)+'deg) scale('+pose.s.toFixed(4)+')';
    }
    var ro=T(p,.46,.52)*(1-T(p,.9,.94));room.style.opacity=ro;sv(room,ro>0);
    var so=T(p,.55,.58)*(1-T(p,.9,.93));size.style.opacity=so;sv(size,so>0);
    if(p>=.5)setSize(p<.65?0:p<.77?1:2);
    vid.style.transform='scale('+(1.12-.1*p)+')';
  };

  /* sideways reel of more posters */
  var reel=$('.px-reel'),track=$('.px-track'),rcs=$$('.px-rc',track),tw=0;
  var measure=function(){track.style.transform='none';tw=track.scrollWidth-innerWidth;geo()};
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
