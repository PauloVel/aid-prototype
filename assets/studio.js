/* Studio (see studio.css). Four pinned stories driven by eased progress; the helmet (assets/helmet.js, window.AIDHelmet) is drawn straight into the page
   while its stage is on screen and turns with the scroll or with a drag. Skipped for reduced motion (static sections + poster fallback). */
(function(){
  var Hh=document.querySelector('.sx-hero');
  if(!Hh)return;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  var root=document.documentElement,$=function(s,c){return (c||document).querySelector(s)},$$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};
  root.classList.add('sx-js');
  var cl=function(v){return Math.min(1,Math.max(0,v))},T=function(p,a,b){return cl((p-a)/(b-a))};
  var io=function(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2},out=function(t){return 1-Math.pow(1-t,3)},inn=function(t){return t*t};
  var prog=function(el){var r=el.getBoundingClientRect(),tot=r.height-innerHeight;return tot>0?cl(-r.top/tot):0};
  var vis=function(el){var r=el.getBoundingClientRect();return r.bottom>-100&&r.top<innerHeight+100};

  /* 1. be unmistakable: identical tiles, the one that is you grows to fill the screen */
  var gw=$('.sx-gw',Hh),full=$('.sx-full',Hh),h1=$('.sx-h1',Hh),cue=$('.sx-cue',Hh),fade=$('.sx-fade',Hh),dimH=$('.sx-hdim',Hh);
  var grid=document.createElement('div');grid.className='sx-g';
  for(var gi=0;gi<63;gi++){var t=document.createElement('div');t.className='sx-t';if(gi===31){t.className+=' me';t.style.backgroundImage='url(assets/BK_passage.jpg)'}grid.appendChild(t)}
  gw.appendChild(grid);var me=grid.children[31];
  var drawH=function(p){
    var mob=innerWidth<=700,S=100/(mob?22:16),e=io(T(p,.06,.74)),s=Math.exp(Math.log(S)*e);
    me.style.boxShadow=p<.5?'0 0 0 2px rgba(255,30,30,'+(1-T(p,.3,.5)).toFixed(2)+')':'none';
    grid.style.transform='translate(-50%,-50%) scale('+s.toFixed(4)+')';
    full.style.opacity=io(T(p,.62,.78)).toFixed(3);
    dimH.style.opacity=T(p,.5,.7).toFixed(3);
    cue.style.opacity=1-T(p,0,.06);
    fade.style.opacity=io(T(p,.88,1)).toFixed(3);
    h1.style.opacity=(1-T(p,.86,.97)).toFixed(3);
  };

  /* 2. campaigns: a ring of posters turns with the page */
  var C=$('.sx-camp'),ring=$('.sx-rot',C),cs=$$('.sx-c',C),ccB=$('.sx-cc b',C),ccS=$('.sx-cc span',C),NC=cs.length,R=0,shown=-1,STEP=360/NC;
  var measureC=function(){var w=cs[0].offsetWidth||200;R=w/2/Math.tan(Math.PI/NC)*1.25};
  var drawC=function(p){
    var e=io(T(p,.05,.95)),rot=-e*(NC-1)*STEP;
    ring.style.transform='translate3d(0,0,'+(-R*.55).toFixed(1)+'px) rotateX(-5deg) rotateY('+rot.toFixed(2)+'deg)';
    var near=0,best=-2;
    cs.forEach(function(el,i){
      var ang=(i*STEP+rot)*Math.PI/180,cz=Math.cos(ang),f=Math.max(0,cz);f=f*f*f;
      el.style.transform='rotateY('+(i*STEP)+'deg) translateZ('+(R+150*f).toFixed(1)+'px)';
      el.style.opacity=(.18+.82*f).toFixed(3);
      if(cz>best){best=cz;near=i}
    });
    if(near!==shown){shown=near;ccB.textContent='0'+(near+1);ccS.textContent=cs[near].dataset.n}
  };

  /* 3. interface: the phone turns, its screen scrolls with the page */
  var U=$('.sx-ui'),dev=$('.sx-dev',U),scr=$('.sx-scr',U),inn2=$('.sx-in',U),range=0;
  var measureU=function(){inn2.style.transform='none';range=Math.max(0,inn2.offsetHeight-scr.offsetHeight)};
  var drawU=function(p){
    var e=io(T(p,.04,.96)),sc=io(T(p,.1,.92));
    dev.style.transform='rotateY('+(-24+48*e).toFixed(2)+'deg) rotateX('+(10-10*e).toFixed(2)+'deg)';
    inn2.style.transform='translate3d(0,'+(-range*sc).toFixed(1)+'px,0)';
  };

  /* 4. product: the helmet */
  var P=$('.sx-prod'),hv=$('#sxhv',P),spice=$('.sx-spice',P),HM=null,rotBase=.785,drag=0,vel=0,dragging=false,lastX=0,hp=0,sizeKey='',looping=false;
  var attach=function(){
    var m=window.AIDHelmet;if(!m||!m.ready||!m.canvas||HM)return;
    HM=m;hv.insertBefore(m.canvas,hv.firstChild);hv.classList.add('on');sizeKey='';startLoop();
  };
  addEventListener('aidhelmet',attach);
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
    var hi=T(p,.55,.72),o=out(hi);
    spice.style.opacity=hi>0?1:(p>.5?.01:0);
    spice.style.transform='translate3d(0,'+((1-o)*18).toFixed(2)+'rem,0) scale('+(1.25-.25*o).toFixed(4)+')';spice.style.transformOrigin='0 100%';
  };

  var tick=false,sm={h:0,c:0,u:0,p:0},first=true,tLast=0,K=1,need=false;
  var ease=function(key,el,visible){
    var t=prog(el);
    if(first||!visible)sm[key]=t;else{sm[key]+=(t-sm[key])*K;if(Math.abs(t-sm[key])<.0004)sm[key]=t;else need=true}
    return sm[key];
  };
  var draw=function(){
    tick=false;
    var now=performance.now(),dt=Math.min(64,now-tLast||16);tLast=now;K=1-Math.exp(-dt/80);need=false;
    var vh=vis(Hh),vc=vis(C),vu=vis(U),vp=vis(P);
    var ph=ease('h',Hh,vh),pc=ease('c',C,vc),pu=ease('u',U,vu),pp=ease('p',P,vp);first=false;
    if(vh)drawH(ph);if(vc)drawC(pc);if(vu)drawU(pu);if(vp)drawP(pp);
    if(need)req();
  };
  var req=function(){if(!tick){tick=true;requestAnimationFrame(draw)}};
  addEventListener('scroll',req,{passive:true});
  addEventListener('resize',function(){measureU();measureC();sizeKey='';first=true;req()});
  var init=function(){measureU();measureC();first=true;draw();attach()};
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(init);
  $$('img',U).concat($$('img',C)).forEach(function(i){if(!i.complete)i.addEventListener('load',function(){measureU();measureC();req()})});
  init();
})();
