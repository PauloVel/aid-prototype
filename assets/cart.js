/* Cart: keeps the poster strip and count in step with the lines (site.js does the maths), and tilts each poster in as you scroll. */
(function(){
  var cart=document.getElementById('cart');
  if(!cart)return;
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var strip=cart.querySelector('.ct-strip'),nEl=cart.querySelector('[data-ct-n]'),wEl=cart.querySelector('[data-ct-w]');
  var lines=function(){return [].slice.call(cart.querySelectorAll('.line'))};

  var sync=function(){
    var n=0;strip.textContent='';
    lines().forEach(function(l){
      var q=Math.max(1,+l.querySelector('input').value||1);n+=q;
      var li=document.createElement('li'),b=document.createElement('button'),im=document.createElement('img'),t=document.createElement('b');
      im.src=l.querySelector('img').currentSrc||l.querySelector('img').src;im.alt='';
      t.textContent='×'+q;
      b.type='button';b.setAttribute('aria-label','Go to '+l.querySelector('h3').textContent+', quantity '+q);
      b.appendChild(im);b.appendChild(t);li.appendChild(b);strip.appendChild(li);
      b.addEventListener('click',function(){l.scrollIntoView({behavior:reduce?'auto':'smooth',block:'center'});l.classList.add('hl');setTimeout(function(){l.classList.remove('hl')},1200)});
      b.addEventListener('mouseenter',function(){l.classList.add('hl')});
      b.addEventListener('mouseleave',function(){l.classList.remove('hl')});
    });
    nEl.textContent=n;wEl.textContent=n===1?'poster':'posters';
    req();
  };
  cart.addEventListener('change',sync);
  cart.addEventListener('click',function(e){if(e.target.closest('.rm'))setTimeout(sync,0)});

  /* scroll story: posters arrive tilted back and settle flat at the middle of the screen, then lean away as they leave */
  var tick=false;
  var draw=function(){
    tick=false;
    if(reduce||innerWidth<=900){lines().forEach(function(l){l.style.transform='';l.style.opacity=''});return}
    var vh=innerHeight;
    lines().forEach(function(l){
      var r=l.getBoundingClientRect(),o=(r.top+r.height/2-vh*.55)/vh,d=Math.max(-1,Math.min(1,o));
      l.style.transform='rotateX('+(d*16)+'deg) translateY('+(Math.max(0,d)*30)+'px) scale('+(1-Math.abs(d)*.04)+')';
      l.style.opacity=Math.max(.2,Math.min(1,1.35-Math.max(0,Math.abs(d)-.45)*1.7));
    });
  };
  var req=function(){if(!tick){tick=true;requestAnimationFrame(draw)}};
  addEventListener('scroll',req,{passive:true});addEventListener('resize',req);
  sync();
})();
