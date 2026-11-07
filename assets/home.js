/* Home: five scroll stories (see home.css). Skipped for reduced motion (static sections).
   Every stage is a pure function of its own eased progress (0..1); layout reads happen before writes; the playing videos are never transformed per frame
   (stage B grows a window and counter-scales the video inside it, so the video's net scale stays 1). */
(function(){
  var A=document.querySelector('.hp-a');
  if(!A)return;
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root=document.documentElement,$=function(s,c){return (c||document).querySelector(s)},$$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};
  ['.hp-flip','.hp-ab'].forEach(function(q){$$(q+' span:not(.sp)').forEach(function(s,i){s.style.setProperty('--i',i)})});
  if(reduce)return;
  root.classList.add('hp-js');
  var cl=function(v){return Math.min(1,Math.max(0,v))},T=function(p,a,b){return cl((p-a)/(b-a))};
  var out=function(t){return 1-Math.pow(1-t,3)},inn=function(t){return t*t*t},io=function(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2};
  var sv=function(el,on){var v=on?'visible':'hidden';if(el._sv!==v){el._sv=v;el.style.visibility=v}};
  var prog=function(el){var r=el.getBoundingClientRect(),tot=r.height-innerHeight;return tot>0?cl(-r.top/tot):0};
  var vis=function(el){var r=el.getBoundingClientRect();return r.bottom>-100&&r.top<innerHeight+100};

  /* word helper: wrap text in <b> so the flip does not fight the flex centring */
  var words=function(sec){return $$('.hp-w',sec).map(function(w){var t=w.textContent;w.innerHTML='<b>'+t+'</b>';return {el:w,b:w.firstChild}})};
  var flipWords=function(ws,spans,p,alt){
    ws.forEach(function(w,i){
      var a=spans[i][0],b=spans[i][1],ein=out(T(p,a+.01,a+.1)),eout=inn(T(p,b-.09,b-.01));
      var on=p>=a&&p<b+.001;
      var up=alt&&i===1;
      var rx=up?180*(1-ein)-90*eout:-95*(1-ein)+95*eout;
      w.el.style.opacity=on?1:0;sv(w.el,on);
      w.b.style.transform='rotateX('+rx.toFixed(2)+'deg) scale('+(1+.08*T(p,a,b)).toFixed(4)+')';
    });
  };

  /* A */
  var aWords=words(A),aL=$$('.hp-aid span:not(.sp)',A),aid=$('.hp-aid',A),shade=$('.hp-shade',A),cue=$('.hp-cue',A),film=$('.film-btn',A);
  var drawA=function(p){
    aL.forEach(function(s,i){
      var f=io(T(p,.02+i*.05,.2+i*.05)),x=io(T(p,.3+i*.025,.4+i*.025));
      s.style.transform='rotateX('+(180*(1-f)-95*x).toFixed(2)+'deg) translateY('+((1-f)*-12).toFixed(1)+'%)';
      s.style.opacity=1-x;
    });
    sv(aid,p<.42);
    flipWords(aWords,[[.38,.58],[.58,.78],[.78,1]],p,true);
    shade.style.opacity=(.5-.18*T(p,.4,.6)).toFixed(3);
    cue.style.opacity=1-T(p,.03,.1);
    var fo=1-T(p,.3,.4);film.style.opacity=fo;film.style.pointerEvents=fo>.5?'auto':'none';
  };

  /* B */
  var B=$('.hp-b'),pan=$('.hp-pan',B),pin=$('.hp-pin',B),bWords=words(B);
  var drawB=function(p){
    var ins=1-out(T(p,.02,.7)),mob=innerWidth<=700,ix=mob?.22:.38,iy=mob?.34:.38;
    var sx=1-2*ix*ins,sy=1-2*iy*ins;
    pan.style.transform='scale('+sx.toFixed(4)+','+sy.toFixed(4)+')';pan.style.borderRadius=(1.2*ins/((sx+sy)/2)).toFixed(3)+'rem';pin.style.transform='scale('+(1/sx).toFixed(4)+','+(1/sy).toFixed(4)+')';
    flipWords(bWords,[[0,.34],[.34,.67],[.67,1]].map(function(s,i){return i===0?[.04,s[1]]:s}),p,true);
  };

  /* C */
  var C=$('.hp-c'),cols=$$('.hp-col',C),shop=$('.hp-shop',C),big=$('.hp-big',C),cr=[];
  var measureC=function(){cr=cols.map(function(c){c.style.transform='none';return Math.max(0,c.offsetHeight-innerHeight*.94)})};
  var drawC=function(p){
    var e=io(T(p,.04,.96));
    cols.forEach(function(c,i){
      var d=i===1?1-e:e,k=i===1?1:(i===2?1.15:1),y=-cr[i]*d*k;
      c.style.transform='translate3d(0,'+y.toFixed(1)+'px,0)';
    });
    var so=T(p,.88,.96);shop.style.opacity=so;sv(shop,so>0);
  };

  /* D */
  var D=$('.hp-d'),frs=$$('.hp-fr',D),ab=$('.hp-ab',D),cnt=$('.hp-n b',D),watch=$('.hp-watch',D),cur=-1;
  var drawD=function(p){
    var k=Math.min(frs.length-1,Math.floor(p*frs.length));
    if(k!==cur){cur=k;frs.forEach(function(f,i){f.style.opacity=i===k?1:0});cnt.textContent='0'+(k+1)}
    var wo=T(p,.82,.92);watch.style.opacity=wo;sv(watch,wo>0);
  };
  new IntersectionObserver(function(es){es.forEach(function(e){ab.classList.toggle('in',e.isIntersecting)})},{threshold:.6}).observe($('.hp-st',D));

  /* E */
  var flip=$('.hp-flip');
  new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)flip.classList.add('in')})},{threshold:.4}).observe(flip);

  var tick=false,sm={a:0,b:0,c:0,d:0},first=true,tLast=0,K=1,need=false;
  var ease=function(key,el,visible){
    var t=prog(el);
    if(first||!visible)sm[key]=t;else{sm[key]+=(t-sm[key])*K;if(Math.abs(t-sm[key])<.0004)sm[key]=t;else need=true}
    return sm[key];
  };
  var draw=function(){
    tick=false;
    var now=performance.now(),dt=Math.min(64,now-tLast||16);tLast=now;K=1-Math.exp(-dt/80);need=false;
    var va=vis(A),vb=vis(B),vc=vis(C),vd=vis(D);
    var pa=ease('a',A,va),pb=ease('b',B,vb),pc=ease('c',C,vc),pd=ease('d',D,vd);first=false;
    if(va)drawA(pa);if(vb)drawB(pb);if(vc)drawC(pc);if(vd)drawD(pd);
    if(need)req();
  };
  var req=function(){if(!tick){tick=true;requestAnimationFrame(draw)}};
  addEventListener('scroll',req,{passive:true});
  addEventListener('resize',function(){measureC();first=true;req()});
  var init=function(){measureC();first=true;draw()};
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(init);
  var imgs=$$('img',C);imgs.forEach(function(i){if(!i.complete)i.addEventListener('load',function(){measureC();req()})});
  init();
})();
