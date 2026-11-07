/* Home (see home.css). Skipped for reduced motion (static sections).
   Each stage is a pure function of its own eased progress. Layout reads happen before writes. The playing films are never transformed;
   only one backdrop film plays at a time (the other is paused once its opacity is 0). */
(function(){
  var S=document.querySelector('.hp-s');
  if(!S)return;
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root=document.documentElement,$=function(s,c){return (c||document).querySelector(s)},$$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};
  if(reduce)return;
  root.classList.add('hp-js');
  var cl=function(v){return Math.min(1,Math.max(0,v))},T=function(p,a,b){return cl((p-a)/(b-a))};
  var io=function(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2};
  var sv=function(el,on){var v=on?'visible':'hidden';if(el._sv!==v){el._sv=v;el.style.visibility=v}};
  var prog=function(el){var r=el.getBoundingClientRect(),tot=r.height-innerHeight;return tot>0?cl(-r.top/tot):0};
  var vis=function(el){var r=el.getBoundingClientRect();return r.bottom>-100&&r.top<innerHeight+100};

  /* 1. statement */
  var v0=$('#bg0'),v1=$('#bg1'),b2=$('#bg2'),aid=$('.hp-aid',S),ls=$('.hp-ls',S),lines=$$('.hp-l',S),fills=lines.map(function(l){return $('.f',l)}),cue=$('.hp-cue',S),film=$('.film-btn',S);
  var want=function(v,on){if(on){if(v.paused)v.play().catch(function(){})}else if(!v.paused)v.pause()};
  var drawS=function(p){
    var a=1-T(p,.04,.16);
    aid.style.opacity=a.toFixed(3);aid.style.transform='translate3d(0,'+(-T(p,.04,.16)*innerHeight*.18).toFixed(1)+'px,0)';sv(aid,a>0);
    var lo=T(p,.12,.2)*(1-T(p,.93,.99));ls.style.opacity=lo.toFixed(3);sv(ls,lo>0);
    lines.forEach(function(l,i){
      var s=[.14,.42,.66][i],f=io(T(p,s,s+.15));
      fills[i].style.opacity=f.toFixed(3);
      l.style.transform='translate3d('+((1-f)*-3).toFixed(2)+'vw,0,0)';
    });
    /* backdrop: film > film > still */
    var c1=io(T(p,.36,.5)),c2=io(T(p,.6,.74));
    v1.style.opacity=(c1*(1-c2)).toFixed(3);b2.style.opacity=c2.toFixed(3);
    v0.style.opacity=(1-c1).toFixed(3);
    if(p>.2&&!v1.getAttribute('src')){v1.src=v1.dataset.hp;v1.load()}
    want(v0,c1<.98);want(v1,c1>0&&c2<.98&&!!v1.getAttribute('src'));
    cue.style.opacity=1-T(p,.02,.08);
    var fo=1-T(p,.06,.14);film.style.opacity=fo;film.style.pointerEvents=fo>.5?'auto':'none';
  };
  new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting){v0.pause();v1.pause()}})},{threshold:0}).observe($('.hp-st',S));

  /* 2. fly-through */
  var Tt=$('.hp-t'),its=$$('.hp-it',Tt),go=$('.hp-go',Tt),fade=$('.hp-fade',Tt),N=its.length,GAP=560;
  var xs=[-.27,.25,-.22,.28,-.29,.23,-.24,.27,-.25,.22],ys=[-.12,.1,.19,-.19,.05,-.17,.16,.11,-.09,.19];
  var drawT=function(p){
    var mob=innerWidth<=700,vw=innerWidth,vh=innerHeight,camMax=N*GAP+700+900+560,cam=camMax*T(p,0,.92);
    for(var i=0;i<N;i++){
      var z=-700-i*GAP+cam,el=its[i],x=xs[i]*vw*(mob?.62:1),y=ys[i]*vh*(mob?1.15:1);
      var o=cl((z+3400)/1300)*cl((620-z)/380);
      el.style.transform='translate(-50%,-50%) translate3d('+x.toFixed(1)+'px,'+y.toFixed(1)+'px,'+z.toFixed(1)+'px)';
      el.style.opacity=o.toFixed(3);sv(el,o>.01);
    }
    var zg=-(N*GAP+700)-900+cam,og=cl((zg+3600)/1500)*(1-T(p,.9,.97));
    go.style.transform='translate(-50%,-50%) translate3d(0,0,'+zg.toFixed(1)+'px)';
    go.style.opacity=og.toFixed(3);sv(go,og>.01);
    fade.style.opacity=T(p,.9,.99).toFixed(3);
  };

  /* 3. close: the line rises out of its mask */
  var rise=$('.hp-rise');
  new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)rise.classList.add('in')})},{threshold:.4}).observe(rise);

  var tick=false,sm={s:0,t:0},first=true,tLast=0,K=1,need=false;
  var ease=function(key,el,visible){
    var t=prog(el);
    if(first||!visible)sm[key]=t;else{sm[key]+=(t-sm[key])*K;if(Math.abs(t-sm[key])<.0004)sm[key]=t;else need=true}
    return sm[key];
  };
  var draw=function(){
    tick=false;
    var now=performance.now(),dt=Math.min(64,now-tLast||16);tLast=now;K=1-Math.exp(-dt/80);need=false;
    var vs=vis(S),vt=vis(Tt);
    var ps=ease('s',S,vs),pt=ease('t',Tt,vt);first=false;
    if(vs)drawS(ps);if(vt)drawT(pt);
    if(need)req();
  };
  var req=function(){if(!tick){tick=true;requestAnimationFrame(draw)}};
  addEventListener('scroll',req,{passive:true});
  addEventListener('resize',function(){first=true;req()});
  var init=function(){first=true;draw()};
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(init);
  init();
})();
