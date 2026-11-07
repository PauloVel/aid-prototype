/* Home (see home.css): one pinned statement. Beats are hard cuts at scroll thresholds; each cut slams, flashes and shakes the stage;
   inside a beat the word slowly pushes in with the scroll. The film is never transformed. Skipped for reduced motion. */
(function(){
  var S=document.querySelector('.hp-s');
  if(!S)return;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  var root=document.documentElement,$=function(s,c){return (c||document).querySelector(s)};
  root.classList.add('hp-js');
  var cl=function(v){return Math.min(1,Math.max(0,v))};
  var st=$('.hp-st',S),vid=$('.hp-vid',S),shade=$('.hp-shade',S),red=$('.hp-red',S),flash=$('.hp-flash',S),cue=$('.hp-cue',S),film=$('.film-btn',S);
  var bs=[0,1,2,3].map(function(i){var el=$('.b'+i,S);return {el:el,b:el.firstChild}});
  var cuts=[0,.1,.34,.58],shadeBy=[.4,.9,.9,.5],beat=-1;
  var prog=function(){var r=S.getBoundingClientRect(),tot=r.height-innerHeight;return tot>0?cl(-r.top/tot):0};
  var retrigger=function(el,cls,ms){el.classList.remove(cls);void el.offsetWidth;el.classList.add(cls);if(ms)setTimeout(function(){el.classList.remove(cls)},ms)};
  var setBeat=function(k,fromScroll){
    if(k===beat)return;var first=beat<0;beat=k;
    bs.forEach(function(x,i){x.el.classList.remove('on');if(i===k){void x.el.offsetWidth;x.el.classList.add('on')}});
    red.style.visibility=k===2?'visible':'hidden';
    shade.style.opacity=shadeBy[k];
    film.style.opacity=k===0?1:0;film.style.pointerEvents=k===0?'auto':'none';
    if(!first&&fromScroll){retrigger(flash,'go',260);retrigger(st,'shake',320)}
  };
  var tick=false,last=-1,pS=0,tLast=0,firstDraw=true;
  var draw=function(){
    tick=false;
    var r=S.getBoundingClientRect();if(r.bottom<-100||r.top>innerHeight+100){return}
    var now=performance.now(),dt=Math.min(64,now-tLast||16);tLast=now;
    var p=prog();
    if(firstDraw){pS=p;firstDraw=false}else{pS+=(p-pS)*(1-Math.exp(-dt/60));if(Math.abs(p-pS)<.0004)pS=p;else req()}
    var q=pS,k=q<cuts[1]?0:q<cuts[2]?1:q<cuts[3]?2:3;
    setBeat(k,true);
    /* slow push inside the beat */
    var lo=cuts[k],hi=k<3?cuts[k+1]:1,t=cl((q-lo)/(hi-lo));
    bs[k].b.style.transform='scale('+(1+.07*t).toFixed(4)+')';
    cue.style.opacity=1-cl(q/.05);
    if(vid.paused&&r.top<innerHeight)vid.play().catch(function(){});
  };
  var req=function(){if(!tick){tick=true;requestAnimationFrame(draw)}};
  addEventListener('scroll',req,{passive:true});
  addEventListener('resize',req);
  new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){vid.play().catch(function(){})}else vid.pause()})},{threshold:0}).observe(st);
  var init=function(){beat=-1;firstDraw=true;setBeat(0,false);draw()};
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(init);
  init();
})();
