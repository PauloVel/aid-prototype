/* Studio (see studio.css). The story is told with footage, posters and objects, driven by eased scroll progress:
   1. footage and the AID mark; the mark blows past the camera and the work slams in, poster after poster, faster and faster (flash + shake),
      then the pile snaps into a 3D ring of campaigns that the page turns, and flies apart
   2. motion: three films side by side; each takes over the whole screen in turn
   3. a phone rises with the shop; its last product photo is a live render of the 3D helmet; it zooms open
   4. the helmet fades up out of the black; it turns with the scroll and can be dragged; "Add spice." slams in.
   Skipped for reduced motion (static sections + poster fallback). */
(function(){
  var Hh=document.querySelector('.sx-hero');
  if(!Hh)return;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  var root=document.documentElement,$=function(s,c){return (c||document).querySelector(s)},$$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};
  root.classList.add('sx-js');
  var cl=function(v){return Math.min(1,Math.max(0,v))},T=function(p,a,b){return cl((p-a)/(b-a))};
  var io=function(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2},out=function(t){return 1-Math.pow(1-t,3)};
  var prog=function(el){var r=el.getBoundingClientRect(),tot=r.height-innerHeight;return tot>0?cl(-r.top/tot):0};
  var vis=function(el,m){m=m===undefined?100:m;var r=el.getBoundingClientRect();return r.bottom>-m&&r.top<innerHeight+m};
  var vplay=function(v,on){if(!v)return;if(on){if(v.paused)v.play().catch(function(){})}else if(!v.paused)v.pause()};
  var warm=function(v){if(v&&!v._w){v._w=1;v.preload='auto';try{v.load()}catch(e){}}};

  /* 1. footage, mark, slam, ring */
  var world=$('.sx-world',Hh),vid=$('.sx-vid',Hh),mark=$('.sx-mark',Hh),flash=$('.sx-flash',Hh),cue=$('.sx-cue',Hh),kick=$('.sx-kc',Hh),ccEl=$('.sx-cc',Hh);
  var ringEl=$('.sx-ring',Hh),ring=$('.sx-rot',Hh),cs=$$('.sx-c',ringEl),NC=cs.length,R=0,shown=-1,STEP=360/NC;
  var ccB=$('b',ccEl),ccS=$('span',ccEl);
  /* where each poster lands in the pile (fractions of the screen), its tilt, and when it slams in: the gaps get shorter and shorter */
  var PX=[-.29,.27,-.10,.17,-.34,.06,.33,-.21,0],PY=[-.08,.09,.15,-.13,.12,-.03,-.12,.03,0],PR=[-6,5,-3,7,-8,2,-5,4,0];
  var SL0=.10,SL1=.5,SW=.016,TS=[];
  for(var si=0;si<NC;si++)TS.push(SL0+(SL1-SL0)*Math.pow(si/(NC-1),.72));
  var PILE=1.5; /* the pile is bigger than the ring */
  var measureC=function(){var w=cs[0].offsetWidth||200;R=w/2/Math.tan(Math.PI/NC)*1.25};
  var drawH=function(p){
    var vw=innerWidth,vh=innerHeight;
    /* the mark blows past the camera */
    var m=io(T(p,0,.09));
    mark.style.transform='translate(-50%,-50%) scale('+(1+m*m*9).toFixed(3)+') rotate('+(p*60).toFixed(2)+'deg)';
    mark.style.opacity=(1-T(p,.04,.095)).toFixed(3);
    cue.style.opacity=(1-T(p,0,.04)).toFixed(3);
    vid.style.opacity=(1-.8*T(p,.1,.52)).toFixed(3);
    /* ring state */
    var f=io(T(p,.54,.68)),rot=-io(T(p,.64,.93))*(NC-1)*STEP,x=T(p,.93,1);
    ring.style.transform='translate3d(0,0,'+(-R*.55*f-x*x*R*2.2).toFixed(1)+'px) rotateX('+(-5*f).toFixed(2)+'deg) rotateY('+rot.toFixed(2)+'deg)';
    var near=0,best=-2,amp=0,fl=0;
    cs.forEach(function(el,i){
      var t=TS[i],a=T(p,t,t+SW),sl=out(a);
      var hit=p>=t&&p<t+.032?1-(p-t)/.032:0;amp+=hit;fl=Math.max(fl,hit);
      var ang=(i*STEP+rot)*Math.PI/180,cz=Math.cos(ang),fr=Math.max(0,cz);fr=fr*fr*fr;
      var s=(PILE+(1-PILE)*f)*(1+.5*(1-sl)*(1-f));
      var tx=PX[i]*vw*(1-f),ty=PY[i]*vh*(1-f),rz=PR[i]*(1-f),tz=i*3*(1-f);
      el.style.transform='translate3d('+tx.toFixed(1)+'px,'+ty.toFixed(1)+'px,'+tz.toFixed(1)+'px) rotateZ('+rz.toFixed(2)+'deg) rotateY('+(i*STEP*f).toFixed(2)+'deg) translateZ('+((R+150*fr)*f).toFixed(1)+'px) scale('+s.toFixed(4)+')';
      var ringO=.18+.82*fr,o=T(p,t,t+SW*.35)*(1-f)+ringO*f*(a>0?1:0);
      el.style.opacity=(o*(1-x)).toFixed(3);
      if(cz>best){best=cz;near=i}
    });
    if(near!==shown){shown=near;ccB.textContent='0'+(near+1);ccS.textContent=cs[near].dataset.n}
    /* impact: flash and shake */
    flash.style.opacity=(fl*.28).toFixed(3);
    var sh=Math.min(1.6,amp);
    world.style.transform=sh>0?'translate3d('+(sh*9*Math.sin(p*2600)).toFixed(1)+'px,'+(sh*7*Math.cos(p*2100)).toFixed(1)+'px,0)':'none';
    var cap=T(p,.68,.75)*(1-T(p,.92,.97));ccEl.style.opacity=cap.toFixed(3);kick.style.opacity=cap.toFixed(3);
  };

  /* 2. motion: three films, each takes the whole screen in turn */
  var M=$('.sx-mo'),pn=$('.sx-pn',M),ps=$$('.sx-p',M),pv=ps.map(function(e){return $('video',e)}),km=$('.sx-km',M);
  var drawM=function(p){
    pn.style.setProperty('--sw',pn.clientWidth+'px');
    var act=[io(T(p,.28,.4))*(1-io(T(p,.46,.58))),io(T(p,.46,.58))*(1-io(T(p,.64,.76))),io(T(p,.64,.76))];
    var K=16,w=act.map(function(a){return 1+K*a}),tot=w[0]+w[1]+w[2];
    ps.forEach(function(el,i){
      var y=(1-out(T(p,.02+.07*i,.16+.07*i)))*105;
      el.style.width=(w[i]/tot*100).toFixed(3)+'%';
      el.style.transform='translate3d(0,'+y.toFixed(2)+'%,0)';
    });
    pn.style.opacity=(1-io(T(p,.95,1))).toFixed(3);
    km.style.opacity=(T(p,.1,.18)*(1-T(p,.24,.32))).toFixed(3);
  };

  /* 3. interface: the phone rises, turns, its screen scrolls, then it zooms open */
  var U=$('.sx-ui'),dev=$('.sx-dev',U),scr=$('.sx-scr',U),inn2=$('.sx-in',U),dw=$('.sx-dw',U),range=0;
  var measureU=function(){inn2.style.transform='none';range=Math.max(0,inn2.offsetHeight-scr.offsetHeight)};
  var drawU=function(p){
    var e=io(T(p,.1,.9)),sc=io(T(p,.14,.86)),rise=out(T(p,0,.16)),zo=io(T(p,.88,1));
    dev.style.transform='translate3d(0,'+((1-rise)*85).toFixed(1)+'svh,0) rotateY('+(-24+48*e).toFixed(2)+'deg) rotateX('+(10-10*e).toFixed(2)+'deg) scale('+(1+2.6*zo).toFixed(3)+')';
    dw.style.opacity=(1-T(p,.93,1)).toFixed(3);
    inn2.style.transform='translate3d(0,'+(-range*sc).toFixed(1)+'px,0)';
  };

  /* 4. product: the helmet fades up out of the black */
  var P=$('.sx-prod'),hv=$('#sxhv',P),spice=$('.sx-spice',P),HM=null,rotBase=.785,drag=0,vel=0,dragging=false,lastX=0,hp=0,sizeKey='',looping=false;
  var attach=function(){
    var m=window.AIDHelmet;if(!m||!m.ready||!m.canvas||HM)return;
    HM=m;hv.insertBefore(m.canvas,hv.firstChild);hv.classList.add('on');sizeKey='';
    /* the phone's product photo is a real render of the helmet, so the zoom into the phone lands on the 3D object */
    try{fit();HM.render(rotBase);var ph=$('.sx-ph',U);if(ph){ph.removeAttribute('width');ph.removeAttribute('height');ph.onload=function(){measureU();req()};ph.src=HM.canvas.toDataURL('image/jpeg',.82)}}catch(e){}
    startLoop();
  };
  addEventListener('aidhelmet',attach);
  /* three.js + the model are fetched right after the page has settled (idle), well before anyone can scroll to the helmet */
  var loadHelmet=function(){var s=document.createElement('script');s.type='module';s.src='assets/helmet.js';document.head.appendChild(s)};
  var later=function(){(window.requestIdleCallback||function(f){setTimeout(f,400)})(loadHelmet,{timeout:3000})};
  if(document.readyState==='complete')setTimeout(later,800);else addEventListener('load',function(){setTimeout(later,800)});
  var fit=function(){
    if(!HM)return;var d=Math.min(devicePixelRatio||1,root.classList.contains('lite')?1:1.25),w=Math.round(hv.clientWidth*d),h=Math.round(hv.clientHeight*d),k=w+'x'+h;
    if(k!==sizeKey){sizeKey=k;HM.setSize(w,h)}
  };
  var frame=function(){
    looping=false;
    if(!HM||!vis(P))return;
    if(!dragging&&vel){drag+=vel;vel*=.94;if(Math.abs(vel)<.0001)vel=0}
    fit();HM.render(rotBase+hp*6.2832*.9+drag);
    looping=true;requestAnimationFrame(frame);
  };
  var startLoop=function(){if(!looping){looping=true;requestAnimationFrame(frame)}};
  hv.addEventListener('pointerdown',function(e){if(e.button>0)return;dragging=true;lastX=e.clientX;vel=0;hv.classList.add('grab');try{hv.setPointerCapture(e.pointerId)}catch(x){}});
  hv.addEventListener('pointermove',function(e){if(!dragging)return;var dx=e.clientX-lastX;lastX=e.clientX;drag+=dx*.011;vel=dx*.011});
  var end=function(){dragging=false;hv.classList.remove('grab')};
  hv.addEventListener('pointerup',end);hv.addEventListener('pointercancel',end);
  var drawP=function(p){
    hp=p;startLoop();
    hv.style.opacity=io(T(p,0,.14)).toFixed(3);
    var hi=T(p,.55,.72),o=out(hi);
    spice.style.opacity=hi>0?1:(p>.5?.01:0);
    spice.style.transform='translate3d(0,'+((1-o)*18).toFixed(2)+'rem,0) scale('+(1.25-.25*o).toFixed(4)+')';spice.style.transformOrigin='0 100%';
  };

  var tick=false,sm={h:0,m:0,u:0,p:0},first=true,tLast=0,K=1,need=false;
  var ease=function(key,el,visible){
    var t=prog(el);
    if(first||!visible)sm[key]=t;else{sm[key]+=(t-sm[key])*K;if(Math.abs(t-sm[key])<.0004)sm[key]=t;else need=true}
    return sm[key];
  };
  var draw=function(){
    tick=false;
    var now=performance.now(),dt=Math.min(64,now-tLast||16);tLast=now;K=1-Math.exp(-dt/80);need=false;
    var vh=vis(Hh),vm=vis(M),vu=vis(U),vp=vis(P);
    var ph=ease('h',Hh,vh),pm=ease('m',M,vm),pu=ease('u',U,vu),pp=ease('p',P,vp);first=false;
    if(vh)drawH(ph);vplay(vid,vh&&ph<.55);
    if(vis(M,innerHeight*2.5))pv.forEach(warm);
    if(vm)drawM(pm);
    pv.forEach(function(v){vplay(v,vm)});
    if(vu)drawU(pu);
    if(vp)drawP(pp);
    if(need)req();
  };
  var req=function(){if(!tick){tick=true;requestAnimationFrame(draw)}};
  addEventListener('scroll',req,{passive:true});
  var remeasure=function(){measureC();measureU();sizeKey='';first=true;req()};
  addEventListener('resize',remeasure);
  var init=function(){remeasure();draw();attach()};
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(init);
  $$('img',U).concat($$('img',ringEl)).forEach(function(i){if(!i.complete)i.addEventListener('load',function(){remeasure()})});
  init();
})();
