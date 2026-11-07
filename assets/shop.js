/* Shop: a gallery wall you walk along (see shop.css).
   1) Pick of the week: the poster arrives alone (flip-in as the page transition lifts), then slides aside while the buy panel comes in.
   2) The wall: every poster gets its own screen: it flips in big, holds, leaves, sides alternate; the collection word flips when the chapter changes; chapters at the bottom jump.
   3) The drop list: its heading flips in.
   Progress is eased once per frame; every layout read happens before the writes. site.js owns the pick's price and add to cart. */
(function(){
  var pick=document.querySelector('.sp-pick');
  if(!pick)return;
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root=document.documentElement,$=function(s,c){return (c||document).querySelector(s)},$$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};
  var flip=$('.sp-flip');
  $$('.sp-flip span:not(.sp)').forEach(function(s,i){s.style.setProperty('--i',i)});
  if(reduce)return;
  root.classList.add('sp-js');
  var cl=function(v){return Math.min(1,Math.max(0,v))},T=function(p,a,b){return cl((p-a)/(b-a))};
  var io=function(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2},inn=function(t){return t*t*t};
  var sv=function(el,on){var v=on?'visible':'hidden';if(el._sv!==v){el._sv=v;el.style.visibility=v}};
  var prog=function(el){var r=el.getBoundingClientRect(),tot=r.height-innerHeight;return tot>0?cl(-r.top/tot):0};
  var vis=function(el){var r=el.getBoundingClientRect();return r.bottom>-100&&r.top<innerHeight+100};

  /* the pick arrives as the curtain lifts */
  var arrive=function(){pick.classList.add('sp-go')};
  if(window.aidOnLift)window.aidOnLift(arrive);else setTimeout(arrive,200);
  setTimeout(arrive,6500);

  var poster=$('.sp-poster'),word=$('.sp-word'),hint=$('.sp-hint'),buy=$('.sp-buy');
  var drawPick=function(p){
    var mob=innerWidth<=900,e=io(T(p,.3,.7));
    var tx=mob?0:-innerWidth*.2*e,ty=mob?-innerHeight*.17*e:0,s=mob?1-.3*e:1-.04*e;
    poster.style.transform='translate3d('+tx.toFixed(1)+'px,'+ty.toFixed(1)+'px,0) scale('+s.toFixed(4)+')';
    var wo=1-T(p,.22,.4);word.style.opacity=wo;sv(word,wo>0);
    hint.style.opacity=1-T(p,.02,.12);
    var bo=T(p,.5,.76);buy.style.opacity=bo;sv(buy,bo>0);
    buy.style.transform=mob?'translate3d(0,'+((1-bo)*30).toFixed(1)+'px,0)':'translate3d('+((1-bo)*50).toFixed(1)+'px,-50%,0)';
  };

  /* the wall: a deck. f = which print is on top (0..N-1, continuous) */
  var wall=$('.sp-wall'),deck=$('.sp-deck'),cards=$$('.sp-card',deck),words=$$('.sp-cw'),chaps=$$('.sp-chap button'),cap=$('.sp-cap'),cn=$('.sp-cn'),cpz=$('.sp-cpz'),cv=$('.sp-view'),cnt=$('.sp-count b'),N=cards.length,on=-1,chOn=-1;
  var chIdx=words.map(function(w){return cards.findIndex(function(c){return c.dataset.cat===w.dataset.ch})});
  var yFor=function(p){var r=wall.getBoundingClientRect(),tot=r.height-innerHeight;return scrollY+r.top+tot*p};
  chaps.forEach(function(b,k){b.addEventListener('click',function(){scrollTo({top:yFor(chIdx[k]/(N-1)),behavior:'smooth'})})});
  var setTop=function(i){
    if(i===on)return;on=i;var c=cards[i];
    cn.textContent=c.dataset.n;cpz.textContent=c.dataset.p;cv.href=c.getAttribute('href');
    cnt.textContent=(i<9?'0':'')+(i+1);
    cap.classList.toggle('r',i%2===0);cap.classList.remove('pop');void cap.offsetWidth;cap.classList.add('pop');
    cards.forEach(function(el,j){el.style.pointerEvents=j===i?'auto':'none';el.tabIndex=j===i?0:-1});
    var k=0;chIdx.forEach(function(s,j){if(i>=s)k=j});
    if(k!==chOn){chOn=k;
      words.forEach(function(w,j){var o=j===k;w.style.opacity=o?1:0;w.style.visibility=o?'visible':'hidden';w.classList.remove('pop');if(o){void w.offsetWidth;w.classList.add('pop')}});
      chaps.forEach(function(b,j){b.classList.toggle('on',j===k)});
    }
  };
  var drawWall=function(p){
    var u=p*(N-1),mob=innerWidth<=900,vh=innerHeight,vw=innerWidth;
    cards.forEach(function(el,i){
      var d=u-i,sg=i%2?1:-1,e=io(T(d,-.5,-.2)),x=io(T(d,.2,.5)),o=cl(e*1.6)*(1-cl(x*1.6)),ty=0,rx=0,s=1;
      if(d<0){var q=1-e;ty=-sg*q*vh*.45;rx=sg*q*75;s=1-.12*q}
      else{ty=-sg*x*vh*.45;rx=-sg*x*75;s=1-.12*x}
      var tx=mob?0:sg*vw*.17;
      el.style.transform='translate(-50%,-50%) translate3d('+tx.toFixed(1)+'px,'+ty.toFixed(1)+'px,0) rotateX('+rx.toFixed(2)+'deg) scale('+s.toFixed(4)+')';
      el.style.opacity=o.toFixed(3);sv(el,o>.01);
    });
    setTop(Math.min(N-1,Math.round(u)));
  };

  /* the drop list heading flips in */
  new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)flip.classList.add('in')})},{threshold:.4}).observe(flip);

  /* one frame, progress eased toward the scroll position (80ms) */
  var tick=false,sm={p:0,w:0},first=true,tLast=0,K=1,need=false;
  var ease=function(key,el,visible){
    var t=prog(el);
    if(first||!visible)sm[key]=t;else{sm[key]+=(t-sm[key])*K;if(Math.abs(t-sm[key])<.0004)sm[key]=t;else need=true}
    return sm[key];
  };
  var draw=function(){
    tick=false;
    var now=performance.now(),dt=Math.min(64,now-tLast||16);tLast=now;K=1-Math.exp(-dt/80);need=false;
    var vp=vis(pick),vw=vis(wall);
    var pp=ease('p',pick,vp),pw=ease('w',wall,vw);first=false;
    if(vp)drawPick(pp);if(vw)drawWall(pw);
    if(need)req();
  };
  var req=function(){if(!tick){tick=true;requestAnimationFrame(draw)}};
  addEventListener('scroll',req,{passive:true});
  addEventListener('resize',function(){first=true;req()});
  var init=function(){first=true;draw()};
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(init);
  init();
})();
