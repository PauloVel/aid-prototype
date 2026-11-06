/* Abrasive: scroll stories (see lab.css). Skipped for reduced motion: the page then reads as static sections.
   Performance rules: progress is eased once per frame (steady even with notched wheels); all layout reads happen before writes;
   the zoom into the S is drawn on a canvas as a white sheet with letter-shaped holes (no blend mode, GPU vector text);
   the video window grows by transform, not clip-path. */
(function(){
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root=document.documentElement,$=function(s,c){return (c||document).querySelector(s)},$$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};
  var hero=$('.lb-hero'),words=$('.lb-words'),reel=$('.lb-reel'),flip=$('.lb-flip');
  if(!hero)return;
  $$('.lb-flip span:not(.sp)').forEach(function(s,i){s.style.setProperty('--i',i)});
  if(reduce)return;
  root.classList.add('lb-js');
  var cl=function(v){return Math.min(1,Math.max(0,v))},T=function(p,a,b){return cl((p-a)/(b-a))};
  var out=function(t){return 1-Math.pow(1-t,3)},inn=function(t){return t*t*t},io=function(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2};
  var prog=function(el){var r=el.getBoundingClientRect(),tot=r.height-innerHeight;return tot>0?cl(-r.top/tot):0};
  var vis=function(el){var r=el.getBoundingClientRect();return r.bottom>-100&&r.top<innerHeight+100};

  /* 1. letters flip upright in a wave (DOM), then we zoom into the S (canvas) until the video fills the screen */
  var stage=$('.lb-st',hero),hl=$$('.lb-h1 span:not(.sp)'),h1=$('.lb-h1'),zoom=$('.lb-zoom'),mask=$('.lb-mask'),hv=$('.lb-vw'),dim=$('.lb-dim'),cue=$('.lb-cue'),hole=$('.lb-hole');
  var hctx=hole.getContext('2d'),L=[],fsz=0,asc=0,desc=0,ox=0,oy=0,hd=1,holeOK=false,lastSc=-1,lastW=-1;
  var geometry=function(){
    // letter boxes at rest (no flip, no zoom), relative to the stage, plus the S centre: used by the canvas and as the DOM zoom origin
    var kz=zoom.style.transform,ks=hl.map(function(s){return s.style.transform});
    zoom.style.transform='none';zoom.style.transformOrigin='50% 50%';hl.forEach(function(s){s.style.transform='none'});
    var sr=stage.getBoundingClientRect(),zr=zoom.getBoundingClientRect(),r4=hl[4].getBoundingClientRect();
    L=hl.map(function(s){var r=s.getBoundingClientRect();return {c:s.textContent,x:r.left-sr.left,top:r.top-sr.top,h:r.height,w:r.width}});
    ox=r4.left+r4.width/2-sr.left;oy=r4.top+r4.height/2-sr.top;
    zoom.style.transformOrigin=((r4.left+r4.width/2-zr.left)/zr.width*100)+'% '+((r4.top+r4.height/2-zr.top)/zr.height*100)+'%';
    fsz=parseFloat(getComputedStyle(h1).fontSize);
    hl.forEach(function(s,i){s.style.transform=ks[i]});zoom.style.transform=kz;
    hd=1; // CSS pixels: on a 1.5x screen this is 2.25x fewer pixels to fill per frame
    hole.width=Math.round(stage.clientWidth*hd);hole.height=Math.round(stage.clientHeight*hd);
    hctx.font='400 '+fsz+'px Anton';var m=hctx.measureText('A');
    holeOK=!!(m.fontBoundingBoxAscent&&document.fonts&&document.fonts.check('400 20px Anton'));
    asc=m.fontBoundingBoxAscent||0;desc=m.fontBoundingBoxDescent||0;lastSc=-1;
  };
  var paintHole=function(sc){
    if(sc===lastSc&&lastW===hole.width)return;lastSc=sc;lastW=hole.width;
    hctx.setTransform(1,0,0,1,0,0);hctx.globalCompositeOperation='source-over';hctx.fillStyle='#fff';hctx.fillRect(0,0,hole.width,hole.height);
    hctx.globalCompositeOperation='destination-out';
    hctx.setTransform(hd*sc,0,0,hd*sc,hd*ox*(1-sc),hd*oy*(1-sc));
    hctx.textBaseline='alphabetic';hctx.fillStyle='#000';
    var W=stage.clientWidth,H=stage.clientHeight;
    for(var i=0;i<L.length;i++){
      var q=L[i],x0=ox+(q.x-ox)*sc,x1=ox+(q.x+q.w-ox)*sc,y0=oy+(q.top-oy)*sc,y1=oy+(q.top+q.h-oy)*sc;
      if(x1<0||x0>W||y1<0||y0>H)continue; // off-screen letters are not drawn at all
      hctx.fillText(q.c,q.x,q.top+(q.h-(asc+desc))/2+asc);
    }
  };
  var drawHero=function(p){
    var sc=Math.exp(Math.log(40)*io(T(p,.46,.84))),mo=1-T(p,.76,.86),useCv=holeOK&&sc>=1.3;
    hl.forEach(function(s,i){
      var f=io(T(p,.03+i*.035,.2+i*.035));
      s.style.transform='rotateX('+(180*(1-f))+'deg) translateY('+((1-f)*-12)+'%)';
    });
    if(useCv){
      if(mo>0)paintHole(sc);
      hole.style.visibility=mo>0?'visible':'hidden';hole.style.opacity=mo;
      mask.style.visibility='hidden';
    }else{
      zoom.style.transform='scale('+sc+')';
      mask.style.opacity=mo;mask.style.visibility=mo>0?'visible':'hidden';
      hole.style.visibility='hidden';
    }
    // (the hero video is never scaled per frame: any animated transform above a playing video makes the compositor re-resample it every frame)
    cue.style.opacity=1-T(p,.04,.12);
    var dm=.5*(1-T(p,.5,.84));dim.style.opacity=dm;dim.style.visibility=dm>0?'visible':'hidden';
  };

  /* 2. TESTED / IN PUBLIC. / NO FILLER. flip through over a video window that grows to full-bleed (transform, not clip-path) */
  var pan=$('.lb-pan'),pin=$('.lb-pin'),ww=$$('.lb-w'),wb=ww.map(function(w){var t=w.textContent;w.innerHTML='<b>'+t+'</b>';return w.firstChild});
  var span=[[0,.34],[.34,.67],[.67,1]];
  var drawWords=function(p){
    var ins=1-out(T(p,.02,.8)),mob=innerWidth<=700,ix=mob?.22:.38,iy=mob?.34:.38;
    var sx=1-2*ix*ins,sy=1-2*iy*ins;
    pan.style.transform='scale('+sx+','+sy+')';pan.style.borderRadius=(1.2*ins/((sx+sy)/2))+'rem';pin.style.transform='scale('+(1/sx)+','+(1/sy)+')';
    ww.forEach(function(w,i){
      var a=span[i][0],b=span[i][1],ein=out(T(p,a+.01,a+.1)),eout=inn(T(p,b-.09,b-.01));
      var on=p>=a&&p<b+.001&&!(p<.01&&i===0);
      var rx=i===1?180*(1-ein)-90*eout:-95*(1-ein)+95*eout; // the middle word arrives upside down
      w.style.opacity=on?1:0;w.style.visibility=on?'visible':'hidden';
      wb[i].style.transform='rotateX('+rx+'deg) scale('+(1+.1*T(p,a,b))+')';
    });
  };

  /* 3. sideways reel; cards and big words tilt in 3D as they pass the centre (reads first, then writes: no layout thrash) */
  var track=$('.lb-track'),cards=$$('.lb-card',track),big=$$('.lb-big',track),tw=0;
  var measure=function(){track.style.transform='none';tw=track.scrollWidth-innerWidth;geometry()};
  var drawReel=function(p){
    var c=innerWidth/2,x=-tw*io(T(p,.02,.98));
    track.style.transform='translate3d('+x+'px,0,0)';
    var rc=cards.map(function(el){var r=el.getBoundingClientRect();return (r.left+r.width/2-c)/innerWidth});
    var rb=big.map(function(el){var r=el.getBoundingClientRect();return (r.left+r.width/2-c)/innerWidth});
    cards.forEach(function(el,i){var o=rc[i],d=cl(Math.abs(o)*1.6);el.style.transform='rotateY('+(-(o>0?1:-1)*45*inn(d))+'deg) scale('+(1-.16*d)+')'});
    big.forEach(function(el,i){var o=rb[i];el.style.transform='rotateX('+(cl(Math.abs(o))*40*(o>0?1:-1))+'deg)'});
  };

  /* 4. finish: letters flip in when it arrives */
  new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)flip.classList.add('in')})},{threshold:.4}).observe(flip);

  /* nav + cursor tone without blend modes: dark text on the white page, white text once footage fills the top of the screen */
  var tone='',setTone=function(dark){var t=dark?'#f0f0f0':'#0a0a0a';if(t!==tone){tone=t;root.style.setProperty('--navc',t)}};
  var navTone=function(ph,pw){
    var hr=hero.getBoundingClientRect(),wr=words.getBoundingClientRect(),dark=false;
    if(hr.top<=40&&hr.bottom>40)dark=ph>.58;
    else if(wr.top<=40&&wr.bottom>40)dark=pw>.4;
    setTone(dark);
  };

  /* one frame: progress of each stage is eased toward the scroll position (110ms time constant) */
  var tick=false,sm={h:0,w:0,r:0},first=true,tLast=0,K=1,need=false;
  var ease=function(key,el,visible){
    var t=prog(el);
    if(first||!visible)sm[key]=t;
    else{sm[key]+=(t-sm[key])*K;if(Math.abs(t-sm[key])<.0004)sm[key]=t;else need=true}
    return sm[key];
  };
  var draw=function(){
    tick=false;
    var now=performance.now(),dt=Math.min(64,now-tLast||16);tLast=now;K=1-Math.exp(-dt/80);need=false;
    var vh=vis(hero),vw=vis(words),vr=vis(reel);
    var ph=ease('h',hero,vh),pw=ease('w',words,vw),pr=ease('r',reel,vr);first=false;
    if(vh)drawHero(ph);if(vw)drawWords(pw);if(vr)drawReel(pr);
    navTone(ph,pw);
    if(need)req();
  };
  var req=function(){if(!tick){tick=true;requestAnimationFrame(draw)}};
  addEventListener('scroll',req,{passive:true});
  addEventListener('resize',function(){measure();first=true;req()});
  var go=function(){measure();first=true;draw()};
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(go);
  go();
})();
