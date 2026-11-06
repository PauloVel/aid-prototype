/* Product: poster tilt (pointer + scroll), chapters that tilt in, mobile bar price. site.js owns gallery, price and add to cart. */
(function(){
  var pdp=document.querySelector('.pdp');
  if(!pdp)return;
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine=matchMedia('(hover: hover) and (pointer: fine)').matches;
  var img=document.getElementById('pdpmain'),media=pdp.querySelector('.pd-media'),chs=[].slice.call(pdp.querySelectorAll('.ch'));

  /* mobile bar shows the same price as the buy box */
  var price=document.getElementById('price'),bar=document.querySelector('[data-bar-price]');
  if(price&&bar){var sync=function(){bar.textContent=price.textContent};sync();new MutationObserver(sync).observe(price,{childList:true,characterData:true,subtree:true})}

  if(reduce)return;
  var px=0,py=0,rx=0,ry=0,sy=0,tick=false,wide=function(){return innerWidth>900};

  /* the poster leans with the pointer and turns slowly as the page scrolls past it (eased once per frame) */
  if(fine)media.addEventListener('pointermove',function(e){
    var r=media.getBoundingClientRect();px=((e.clientX-r.left)/r.width-.5)*2;py=((e.clientY-r.top)/r.height-.5)*2;req();
  });
  media.addEventListener('pointerleave',function(){px=0;py=0;req()});

  var draw=function(){
    tick=false;
    var r=pdp.getBoundingClientRect(),tot=r.height-innerHeight,p=tot>0?Math.min(1,Math.max(0,-r.top/tot)):0;
    sy=wide()?(p-.5)*-18:0;
    var tx=py*-7,ty=px*9+sy;
    rx+=(tx-rx)*.14;ry+=(ty-ry)*.14;
    img.style.setProperty('--rx',rx.toFixed(2)+'deg');img.style.setProperty('--ry',ry.toFixed(2)+'deg');
    /* chapters arrive tilted back and settle flat near the middle of the screen */
    var vh=innerHeight;
    var rects=chs.map(function(c){var b=c.getBoundingClientRect();return (b.top+b.height/2-vh*.6)/vh});
    chs.forEach(function(c,i){
      if(!wide()){c.style.transform='';c.style.opacity='';return}
      var d=Math.max(-1,Math.min(1,rects[i]));
      c.style.transform='rotateX('+(d*14)+'deg) translateY('+(Math.max(0,d)*26)+'px) scale('+(1-Math.abs(d)*.04)+')';
      c.style.opacity=Math.max(.25,Math.min(1,1.35-Math.max(0,Math.abs(d)-.45)*1.7));
    });
    if(Math.abs(tx-rx)>.05||Math.abs(ty-ry)>.05)req();
  };
  var req=function(){if(!tick){tick=true;requestAnimationFrame(draw)}};
  addEventListener('scroll',req,{passive:true});addEventListener('resize',req);
  req();
})();
