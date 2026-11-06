/* Abrasive: scroll stories (see lab.css). Skipped for reduced motion: the page then reads as static sections. */
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

  /* 1. letters flip upright in a wave, then we zoom into the S until the video fills the screen */
  var hl=$$('.lb-h1 span:not(.sp)'),zoom=$('.lb-zoom'),mask=$('.lb-mask'),hv=$('.lb-vid'),dim=$('.lb-dim'),cue=$('.lb-cue');
  var origin=function(){
    zoom.style.transformOrigin='50% 50%';var keep=zoom.style.transform;zoom.style.transform='none';
    var zr=zoom.getBoundingClientRect(),r=hl[4].getBoundingClientRect();
    zoom.style.transformOrigin=((r.left+r.width/2-zr.left)/zr.width*100)+'% '+((r.top+r.height/2-zr.top)/zr.height*100)+'%';
    zoom.style.transform=keep;
  };
  var drawHero=function(){
    var p=prog(hero);
    hl.forEach(function(s,i){
      var f=io(T(p,.03+i*.035,.2+i*.035));
      s.style.transform='rotateX('+(180*(1-f))+'deg) translateY('+((1-f)*-12)+'%)';
    });
    zoom.style.transform='scale('+Math.exp(Math.log(40)*io(T(p,.46,.84)))+')';
    var mo=1-T(p,.76,.86);mask.style.opacity=mo;mask.style.visibility=mo>0?"visible":"hidden";
    hv.style.transform='scale('+(1.18-.18*T(p,.3,.9))+')';
    cue.style.opacity=1-T(p,.04,.12);
    var dm=.5*(1-T(p,.5,.84));dim.style.opacity=dm;dim.style.visibility=dm>0?'visible':'hidden';
  };

  /* 2. TESTED / IN PUBLIC. / NO FILLER. flip through over a video window that grows to full-bleed */
  var pan=$('.lb-pan'),ww=$$('.lb-w'),wb=ww.map(function(w){var t=w.textContent;w.innerHTML='<b>'+t+'</b>';return w.firstChild});
  var span=[[0,.34],[.34,.67],[.67,1]];
  var drawWords=function(){
    var p=prog(words),ins=1-out(T(p,.02,.8));
    pan.style.clipPath='inset('+(38*ins)+'svh '+(38*ins)+'vw round '+(1.2*ins)+'rem)';
    ww.forEach(function(w,i){
      var a=span[i][0],b=span[i][1],ein=out(T(p,a+.01,a+.1)),eout=inn(T(p,b-.09,b-.01));
      var on=p>=a&&p<b+.001&&!(p<.01&&i===0);
      var rx=i===1?180*(1-ein)-90*eout:-95*(1-ein)+95*eout; // the middle word arrives upside down
      w.style.opacity=on?1:0;w.style.visibility=on?'visible':'hidden';
      wb[i].style.transform='rotateX('+rx+'deg) scale('+(1+.1*T(p,a,b))+')';
    });
  };

  /* 3. sideways reel; cards and big words tilt in 3D as they pass the centre */
  var track=$('.lb-track'),cards=$$('.lb-card',track),big=$$('.lb-big',track),tw=0;
  var measure=function(){track.style.transform='none';tw=track.scrollWidth-innerWidth;origin()};
  var drawReel=function(){
    var p=prog(reel),c=innerWidth/2;
    track.style.transform='translate3d('+(-tw*io(T(p,.02,.98)))+'px,0,0)';
    cards.forEach(function(el){
      var r=el.getBoundingClientRect(),o=(r.left+r.width/2-c)/innerWidth,d=cl(Math.abs(o)*1.6);
      el.style.transform='rotateY('+(-(o>0?1:-1)*45*inn(d))+'deg) scale('+(1-.16*d)+')';
    });
    big.forEach(function(el){
      var r=el.getBoundingClientRect(),o=(r.left+r.width/2-c)/innerWidth;
      el.style.transform='rotateX('+(cl(Math.abs(o))*40*(o>0?1:-1))+'deg)';
    });
  };

  /* 4. finish: letters flip in when it arrives */
  new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)flip.classList.add('in')})},{threshold:.4}).observe(flip);

  var tick=false;
  /* nav + cursor tone without blend modes: dark text on the white page, white text once footage fills the top of the screen */
  var tone='',setTone=function(dark){var t=dark?'#f0f0f0':'#0a0a0a';if(t!==tone){tone=t;root.style.setProperty('--navc',t)}};
  var navTone=function(){
    var hr=hero.getBoundingClientRect(),wr=words.getBoundingClientRect(),dark=false;
    if(hr.top<=40&&hr.bottom>40)dark=prog(hero)>.72;
    else if(wr.top<=40&&wr.bottom>40)dark=prog(words)>.4;
    setTone(dark);
  };
  var draw=function(){tick=false;if(vis(hero))drawHero();if(vis(words))drawWords();if(vis(reel))drawReel();navTone()};
  var req=function(){if(!tick){tick=true;requestAnimationFrame(draw)}};
  addEventListener('scroll',req,{passive:true});
  addEventListener('resize',function(){measure();req()});
  var go=function(){measure();draw()};
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(go);
  go();
})();
