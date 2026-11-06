/* Product: the poster first, then Add to cart (see product.css).
   Story beats, as a fraction of the pinned scroll:  Look 0-.34 (the poster arrives, turns slightly)  >  Closer .34-.70 (we zoom into the print)  >  Yours .70-1 (it settles, Add to cart pulses).
   Then the corridor: the other posters hang on two walls and scrolling walks you down the gallery (3D depth, transforms only).
   Scrolling never swaps the poster. site.js owns price, quantity and add to cart.
   Progress is eased once per frame; every layout read happens before the writes. */
(function(){
  var story=document.querySelector('.px-story');
  if(!story)return;
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root=document.documentElement,$=function(s,c){return (c||document).querySelector(s)},$$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};
  if(reduce)return; // static: nothing pinned, first word shown by CSS
  root.classList.add('px-js');

  var img=$('#pdpmain'),poster=$('.px-poster'),stage=$('.px-stage'),words=$$('.px-w');
  var cl=function(v){return Math.min(1,Math.max(0,v))},T=function(p,a,b){return cl((p-a)/(b-a))};
  var io=function(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2},mix=function(a,b,t){return a+(b-a)*t};
  var sv=function(el,on){var v=on?'visible':'hidden';if(el._sv!==v){el._sv=v;el.style.visibility=v}};
  var prog=function(el){var r=el.getBoundingClientRect(),tot=r.height-innerHeight;return tot>0?cl(-r.top/tot):0};
  var vis=function(el){var r=el.getBoundingClientRect();return r.bottom>-100&&r.top<innerHeight+100};

  /* arrival: the poster flips upright once the page transition is done */
  var arrive=function(){story.classList.add('px-go')};
  if(window.aidOnLift)window.aidOnLift(arrive);else setTimeout(arrive,200);
  setTimeout(arrive,6500);

  /* the zoom aims at a focal point of the print (data-fx / data-fy on the image) */
  var G={ok:false};
  var geo=function(){
    var H0=img.offsetHeight,W0=img.offsetWidth;
    if(!H0||!W0)return;
    var fx=parseFloat(img.dataset.fx)||.5,fy=parseFloat(img.dataset.fy)||.4,s=Math.max(2.1,innerHeight*.95/H0*1.4);
    G={ok:true,zoom:{s:s,tx:-(fx-.5)*W0*s,ty:-(fy-.5)*H0*s}};
  };
  if(img.complete)geo();else img.addEventListener('load',function(){geo();req()});

  var beat=-1;
  var setBeat=function(b){
    if(b===beat)return;beat=b;
    words.forEach(function(w,i){var on=i===b;w.style.opacity=on?1:0;w.style.visibility=on?'visible':'hidden';w.classList.remove('pop');if(on){void w.offsetWidth;w.classList.add('pop')}});
  };
  var drawStory=function(p){
    setBeat(p<.34?0:p<.7?1:2);
    if(!G.ok)return;
    var e1=io(T(p,.28,.42)),e2=io(T(p,.62,.76));
    var s=mix(1,G.zoom.s,e1),tx=G.zoom.tx*e1,ty=G.zoom.ty*e1;
    s=mix(s,.98,e2);tx*=1-e2;ty*=1-e2;
    poster.style.transform='translate3d('+tx.toFixed(1)+'px,'+ty.toFixed(1)+'px,0) scale('+s.toFixed(4)+')';
  };

  /* the corridor */
  var cor=$('.px-cor'),cps=$$('.px-cp'),clb=$('.px-cl'),cch=$('.px-ch'),call=$('.px-call'),N=cps.length,D=900,shown=-1;
  var cb=$('b',clb),ci=$('i',clb);
  var drawCor=function(p){
    var vw=innerWidth,mob=vw<=900,cam=p*(N*D+450),near=-1,bestd=1e9,i,z,x,o;
    for(i=0;i<N;i++){
      z=-700-i*D+cam;x=(i%2?1:-1)*vw*(mob?.2:.23);
      o=cl((z+2500)/600)*cl((380-z)/480);
      var el=cps[i];
      el.style.transform='translate(-50%,-50%) translate3d('+x.toFixed(1)+'px,0,'+z.toFixed(1)+'px) rotateY('+((i%2?-1:1)*22)+'deg)';
      el.style.opacity=o.toFixed(3);sv(el,o>.01);el.style.pointerEvents=o>.7?'auto':'none';
      var d=Math.abs(z+260);if(d<bestd&&o>.3){bestd=d;near=i}
    }
    if(near>=0&&near!==shown){shown=near;cb.textContent=cps[near].dataset.n;ci.textContent=cps[near].dataset.p+'  /  View poster';clb.href=cps[near].getAttribute('href')}
    var lo=near>=0?cl(1.7-bestd/500):0;clb.style.opacity=lo;sv(clb,lo>.02);clb.tabIndex=lo>.5?0:-1;
    cch.style.opacity=1-T(p,.0,.1);sv(cch,p<.1);
    var co=T(p,.86,.95);call.style.opacity=co;sv(call,co>0);
  };

  /* one frame, progress eased toward the scroll position (80ms) */
  var tick=false,sm={s:0,c:0},first=true,tLast=0,K=1,need=false;
  var ease=function(key,el,visible){
    var t=prog(el);
    if(first||!visible)sm[key]=t;else{sm[key]+=(t-sm[key])*K;if(Math.abs(t-sm[key])<.0004)sm[key]=t;else need=true}
    return sm[key];
  };
  var draw=function(){
    tick=false;
    var now=performance.now(),dt=Math.min(64,now-tLast||16);tLast=now;K=1-Math.exp(-dt/80);need=false;
    var vs=vis(story),vc=vis(cor);
    var ps=ease('s',story,vs),pc=ease('c',cor,vc);first=false;
    if(vs)drawStory(ps);if(vc)drawCor(pc);
    if(need)req();
  };
  var req=function(){if(!tick){tick=true;requestAnimationFrame(draw)}};
  addEventListener('scroll',req,{passive:true});
  addEventListener('resize',function(){geo();first=true;req()});
  var init=function(){geo();first=true;draw()};
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(init);
  init();
})();
