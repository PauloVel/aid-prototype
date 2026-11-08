/* Studio (see studio.css). One continuous story, no copy, driven by eased scroll progress:
   1. a moment: footage shows only through the headline letters, the page zooms into a letter until the footage is the whole screen
   2. the footage is framed down to a poster, in place, and becomes the first poster of a ring of campaigns (same video, same spot)
   3. the ring explodes away, a phone rises with the same footage on its screen, and zooms open
   4. the 3D helmet fades up out of the black; it turns with the scroll and can be dragged; "Add spice." slams in.
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
  var vis=function(el){var r=el.getBoundingClientRect();return r.bottom>-100&&r.top<innerHeight+100};
  var vplay=function(v,on){if(!v)return;if(on){if(v.paused)v.play().catch(function(){})}else if(!v.paused)v.pause()};

  /* the ring moves into the hero stage so the poster frame and the first poster are the same object */
  var stage=$('.sx-st',Hh),C=$('.sx-camp'),ringEl=$('.sx-ring',C),ccEl=$('.sx-cc',C),kick=$('.sx-k',C);
  stage.appendChild(ringEl);stage.appendChild(ccEl);stage.appendChild(kick);

  var vid=$('.sx-vid',Hh),mask=$('.sx-mask',Hh),h1=$('.sx-h1',Hh),cue=$('.sx-cue',Hh);
  var ring=$('.sx-rot',ringEl),cs=$$('.sx-c',ringEl),cv=cs[0],ccB=$('b',ccEl),ccS=$('span',ccEl),NC=cs.length,R=0,shown=-1,STEP=360/NC;
  var G={S:30,ox:0,oy:0,dx:0,dy:0,s:1,L:0},handed=false;
  var A_END=.46; /* share of the hero scroll used by the zoom and the framing; the rest is the ring */

  /* ring geometry: cards on a circle, the page turns it; the first card is the footage */
  var measureC=function(){var w=cs[0].offsetWidth||200;R=w/2/Math.tan(Math.PI/NC)*1.25};
  var drawC=function(p){
    var f=io(T(p,0,.22)),rot=-io(T(p,.16,.93))*(NC-1)*STEP,x=T(p,.9,1);
    ring.style.transform='translate3d(0,0,'+(-R*.55-x*x*R*2.2).toFixed(1)+'px) rotateX(-5deg) rotateY('+rot.toFixed(2)+'deg)';
    var near=0,best=-2;
    cs.forEach(function(el,i){
      var ang=(i*STEP+rot)*Math.PI/180,cz=Math.cos(ang),fr=Math.max(0,cz);fr=fr*fr*fr;
      var k=i?f:1;
      el.style.transform='rotateY('+(i*STEP)+'deg) translateZ('+((R+150*fr)*(i?(.25+.75*f):1)).toFixed(1)+'px)';
      el.style.opacity=((.18+.82*fr)*k*(1-x)).toFixed(3);
      if(cz>best){best=cz;near=i}
    });
    if(near!==shown){shown=near;ccB.textContent='0'+(near+1);ccS.textContent=cs[near].dataset.n}
    var cap=T(p,.06,.2)*(1-T(p,.9,1));ccEl.style.opacity=cap.toFixed(3);kick.style.opacity=cap.toFixed(3);
  };

  /* geometry shared by the two halves: where the first poster sits at the start of the ring, and which letter we zoom into */
  var measureH=function(){
    mask.style.transform='none';vid.style.transform='none';vid.style.clipPath='none';
    drawC(0);
    var sr=stage.getBoundingClientRect(),vw=sr.width,vh=sr.height,cr=cv.getBoundingClientRect();
    var tw=cr.width,th=cr.height,tcx=cr.left-sr.left+tw/2,tcy=cr.top-sr.top+th/2;
    G.s=th/vh;G.dx=tcx-vw/2;G.dy=tcy-vh/2;G.L=Math.max(0,(vw-tw/G.s)/2);
    var sp=h1.firstElementChild,tn=sp.firstChild,rg=document.createRange();rg.setStart(tn,0);rg.setEnd(tn,1);
    var br=rg.getBoundingClientRect(),F=parseFloat(getComputedStyle(sp).fontSize);
    G.ox=br.left-sr.left+br.width*.2;G.oy=br.top-sr.top+br.height*.5;
    G.S=Math.max(12,vw*1.5/(F*.12));
    mask.style.transformOrigin=G.ox.toFixed(1)+'px '+G.oy.toFixed(1)+'px';
  };

  var drawH=function(p){
    var pa=T(p,0,A_END),pc=T(p,A_END,1);
    /* zoom through the letter */
    var z=io(T(pa,.03,.4)),s=Math.exp(Math.log(G.S)*z);
    mask.style.transform='scale('+s.toFixed(3)+')';
    mask.style.opacity=(1-T(pa,.28,.42)).toFixed(3);
    cue.style.opacity=(1-T(pa,0,.05)).toFixed(3);
    /* footage drifts while it is the whole screen, then frames down to the poster */
    var k=io(T(pa,.6,.94)),sc=(1+.04*T(pa,.4,.6))+(G.s-(1+.04))*k;
    vid.style.transform='translate3d('+(G.dx*k).toFixed(1)+'px,'+(G.dy*k).toFixed(1)+'px,0) scale('+sc.toFixed(4)+')';
    vid.style.clipPath=k>0?'inset(0px '+(G.L*k).toFixed(1)+'px 0px '+(G.L*k).toFixed(1)+'px)':'none';
    /* handoff: the ring (whose first card is the same footage at the same place) takes over from the full-screen video */
    var on=pa>=.999;
    if(on!==handed){handed=on;if(on){try{cv.currentTime=vid.currentTime}catch(e){}}}
    vid.style.visibility=on?'hidden':'visible';
    ringEl.style.visibility=on?'visible':'hidden';ccEl.style.visibility=kick.style.visibility=ringEl.style.visibility;
    if(on)drawC(pc);
  };

  /* 3. interface: the phone rises, turns, its screen (with the same footage) scrolls, then it zooms open */
  var U=$('.sx-ui'),dev=$('.sx-dev',U),scr=$('.sx-scr',U),inn2=$('.sx-in',U),dw=$('.sx-dw',U),pv=$('.sx-pv',U),range=0;
  var measureU=function(){inn2.style.transform='none';range=Math.max(0,inn2.offsetHeight-scr.offsetHeight)};
  var drawU=function(p){
    var e=io(T(p,.1,.9)),sc=io(T(p,.14,.86)),rise=out(T(p,0,.16)),zo=io(T(p,.88,1));
    dev.style.transform='translate3d(0,'+((1-rise)*85).toFixed(1)+'svh,0) rotateY('+(-24+48*e).toFixed(2)+'deg) rotateX('+(10-10*e).toFixed(2)+'deg) scale('+(1+2.6*zo).toFixed(3)+')';
    dw.style.opacity=(1-T(p,.93,1)).toFixed(3);
    inn2.style.transform='translate3d(0,'+(-range*sc).toFixed(1)+'px,0)';
    vplay(pv,p>0&&p<1);
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
    var up=io(T(p,0,.14));hv.style.opacity=up.toFixed(3);
    var hi=T(p,.55,.72),o=out(hi);
    spice.style.opacity=hi>0?1:(p>.5?.01:0);
    spice.style.transform='translate3d(0,'+((1-o)*18).toFixed(2)+'rem,0) scale('+(1.25-.25*o).toFixed(4)+')';spice.style.transformOrigin='0 100%';
  };

  var tick=false,sm={h:0,u:0,p:0},first=true,tLast=0,K=1,need=false;
  var ease=function(key,el,visible){
    var t=prog(el);
    if(first||!visible)sm[key]=t;else{sm[key]+=(t-sm[key])*K;if(Math.abs(t-sm[key])<.0004)sm[key]=t;else need=true}
    return sm[key];
  };
  var draw=function(){
    tick=false;
    var now=performance.now(),dt=Math.min(64,now-tLast||16);tLast=now;K=1-Math.exp(-dt/80);need=false;
    var vh=vis(Hh),vu=vis(U),vp=vis(P);
    var ph=ease('h',Hh,vh),pu=ease('u',U,vu),pp=ease('p',P,vp);first=false;
    if(vh){drawH(ph);vplay(vid,ph<A_END);vplay(cv,ph>=A_END)}else{vplay(vid,false);vplay(cv,false)}
    if(vu)drawU(pu);else vplay(pv,false);
    if(vp)drawP(pp);
    if(need)req();
  };
  var req=function(){if(!tick){tick=true;requestAnimationFrame(draw)}};
  addEventListener('scroll',req,{passive:true});
  var remeasure=function(){measureC();measureH();measureU();sizeKey='';first=true;req()};
  addEventListener('resize',remeasure);
  var init=function(){remeasure();draw();attach()};
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(init);
  $$('img',U).concat($$('img',ringEl)).forEach(function(i){if(!i.complete)i.addEventListener('load',function(){remeasure()})});
  init();
})();
