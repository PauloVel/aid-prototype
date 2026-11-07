/* Home (see home.css). Skipped for reduced motion (static sections).
   Every pinned stage is a pure function of its own eased progress (0..1); layout reads happen before writes.
   The playing film is never transformed (the hero only darkens it). */
(function(){
  var H=document.querySelector('.hp-h');
  if(!H)return;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  var root=document.documentElement,$=function(s,c){return (c||document).querySelector(s)},$$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};
  root.classList.add('hp-js');
  var cl=function(v){return Math.min(1,Math.max(0,v))},T=function(p,a,b){return cl((p-a)/(b-a))};
  var io=function(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2},out=function(t){return 1-Math.pow(1-t,3)};
  var sv=function(el,on){var v=on?'visible':'hidden';if(el._sv!==v){el._sv=v;el.style.visibility=v}};
  var prog=function(el){var r=el.getBoundingClientRect(),tot=r.height-innerHeight;return tot>0?cl(-r.top/tot):0};
  var vis=function(el){var r=el.getBoundingClientRect();return r.bottom>-100&&r.top<innerHeight+100};
  var pass=function(el){var r=el.getBoundingClientRect();return cl((innerHeight-r.top)/(innerHeight+r.height))}; /* 0 when it enters at the bottom, 1 when it has left at the top */

  /* hero: AID sinks, the film goes to black */
  var vid=$('.hp-vid',H),shade=$('.hp-shade',H),aid=$('.hp-aid',H),cue=$('.hp-cue',H),film=$('.film-btn',H);
  var drawH=function(p){
    shade.style.opacity=(.4+.6*T(p,.25,1)).toFixed(3);
    aid.style.transform='translate3d(0,'+(p*innerHeight*.34).toFixed(1)+'px,0)';
    cue.style.opacity=1-T(p,0,.12);
    var fo=1-T(p,0,.18);film.style.opacity=fo;film.style.pointerEvents=fo>.5?'auto':'none';
  };
  new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)vid.play().catch(function(){});else vid.pause()})},{threshold:0}).observe($('.hp-st',H));

  /* be one of one: words drift apart, the mark turns and we fall into its hub */
  var I=$('.hp-i'),wa=$('.hp-iw.a',I),wb=$('.hp-iw.b',I),disc=$('.hp-disc',I),blk=$('.hp-black',I),dW=0,hx=0,hy=0,smax=40;
  var measureI=function(){
    disc.style.transform='none';
    dW=disc.offsetWidth;var dH=disc.offsetHeight;
    hx=(.612-.5)*dW;hy=(.40-.5)*dH;
    smax=1.08*Math.hypot(innerWidth,innerHeight)/2/(.1123*dW);
  };
  var drawI=function(p){
    var a=out(T(p,.06,.5));
    wa.style.transform='translate3d('+(-45*a).toFixed(2)+'vw,'+(-30*a).toFixed(2)+'vh,0)';
    wb.style.transform='translate3d('+(40*a).toFixed(2)+'vw,'+(25*a).toFixed(2)+'vh,0)';
    var e=io(T(p,.4,.93)),s=Math.exp(Math.log(smax)*e),rot=-30+120*p;
    disc.style.transform='translate3d('+(-hx*e).toFixed(1)+'px,'+(-hy*e).toFixed(1)+'px,0) rotate('+rot.toFixed(2)+'deg) scale('+s.toFixed(4)+')';
    blk.style.opacity=T(p,.88,.98).toFixed(3);
  };

  /* bold: the frame grows to full-bleed, then BOLD slams in front */
  var B=$('.hp-bd'),fr=$('.hp-fr',B),fi=$('.hp-fi',B),bw=$('.hp-bw',B),cap=$('.hp-cap',B),acts=$('.hp-acts',B),front=false;
  var drawB=function(p){
    var mob=innerWidth<=700,ix=mob?.56:.3,iy=mob?.4:.52;
    var g=io(T(p,.04,.6)),sx=ix+(1-ix)*g,sy=iy+(1-iy)*g;
    fr.style.transform='scale('+sx.toFixed(4)+','+sy.toFixed(4)+')';fi.style.transform='scale('+(1/sx).toFixed(4)+','+(1/sy).toFixed(4)+')';
    var f=p>=.56;
    if(f!==front){front=f;bw.classList.toggle('front',f)}
    bw.style.transform=f?'none':'scale('+(1+.04*T(p,0,.56)).toFixed(4)+')';
    var co=T(p,.78,.9);cap.style.opacity=co;acts.style.opacity=co;sv(cap,co>0);sv(acts,co>0);
  };

  /* evrabo: the word slides left while the section passes */
  var E=$('.hp-ev'),mq=$('.hp-mq',E),mw=0;
  var measureE=function(){mq.style.transform='none';mw=Math.max(0,mq.scrollWidth-innerWidth)};
  var drawE=function(){var p=pass(E);mq.style.transform='translate3d('+(-mw*p).toFixed(1)+'px,0,0)'};

  /* studio: the image drifts, the word rises */
  var D=$('.hp-sd'),di=$('.hp-sdi',D),dw=$('.hp-sdw',D);
  var drawD=function(){var p=pass(D);di.style.transform='translate3d(0,'+((p-.5)*-14).toFixed(2)+'%,0)';dw.style.transform='translate3d(0,'+((1-out(T(p,.3,.62)))*110).toFixed(1)+'%,0)'};

  var tick=false,sm={h:0,i:0,b:0},first=true,tLast=0,K=1,need=false;
  var ease=function(key,el,visible){
    var t=prog(el);
    if(first||!visible)sm[key]=t;else{sm[key]+=(t-sm[key])*K;if(Math.abs(t-sm[key])<.0004)sm[key]=t;else need=true}
    return sm[key];
  };
  var draw=function(){
    tick=false;
    var now=performance.now(),dt=Math.min(64,now-tLast||16);tLast=now;K=1-Math.exp(-dt/80);need=false;
    var vh=vis(H),vi=vis(I),vb=vis(B),ve=vis(E),vd=vis(D);
    var ph=ease('h',H,vh),pi=ease('i',I,vi),pb=ease('b',B,vb);first=false;
    if(vh)drawH(ph);if(vi)drawI(pi);if(vb)drawB(pb);if(ve)drawE();if(vd)drawD();
    if(need)req();
  };
  var req=function(){if(!tick){tick=true;requestAnimationFrame(draw)}};
  addEventListener('scroll',req,{passive:true});
  addEventListener('resize',function(){measureI();measureE();first=true;req()});
  var init=function(){measureI();measureE();first=true;draw()};
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(init);
  init();
})();
