(function(){
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine=matchMedia('(hover: hover) and (pointer: fine)').matches;
  var doc=document.documentElement;

  // ---- performance: lite mode (lighter rendering) and the ?perf HUD ----
  // ?lite forces it, ?lite=0 clears it. It also switches itself on (and is remembered) when scrolling is measurably slow on this machine.
  var setLite=function(on){doc.classList.toggle('lite',on);try{if(on)localStorage.setItem('aidlite','1');else localStorage.removeItem('aidlite')}catch(e){}};
  (function(){
    var m=location.search.match(/[?&]lite(?:=(\w+))?/);
    if(m)setLite(m[1]!=='0');
    else{try{if(localStorage.getItem('aidlite')==='1')doc.classList.add('lite')}catch(e){}}
    if(/[?&]perf\b/.test(location.search)){var sc=document.createElement('script');sc.src='assets/perf.js';document.body.appendChild(sc)}
    if(m||reduce)return;
    // sample frame times while the page is scrolling; two slow windows in a row = lite
    var samples=[],scr=false,sT=0,strikes=0,last=performance.now(),total=0;
    addEventListener('scroll',function(){scr=true;clearTimeout(sT);sT=setTimeout(function(){scr=false},120)},{passive:true});
    var f=function(t){
      var d=t-last;last=t;
      if(scr&&d<250){samples.push(d);if(samples.length>=75){
        var a=samples.slice().sort(function(x,y){return x-y});samples=[];total++;
        if(a[37]>26||a[67]>45){strikes++;if(strikes>=2){setLite(true);return}}else strikes=Math.max(0,strikes-1);
      }}
      if(total<40&&!doc.classList.contains('lite'))requestAnimationFrame(f);
    };
    requestAnimationFrame(f);
  })();


  // page transition engine (global; works on any multi-page site, Shopify themes included).
  // 1) links are prefetched on hover/touch/focus and when the browser is idle, so the next page is already in cache
  // 2) on click the curtain closes while the page is fetched in parallel; we leave only when it is closed AND the page is cached
  // 3) the next page keeps the curtain until fonts + two frames are ready, then lifts it
  // 4) the curtain is one real element driven by the Web Animations API: a click during the lift reverses it from where it is
  var ptClear=function(){doc.classList.remove('pt-out','pt-in','pt-go','pt-live');try{sessionStorage.removeItem('aidpt')}catch(e){}};
  var cur=null,going=false,target=null,NO=/^\/(checkouts?|account|admin)(\/|$)|\/cart\/(add|change|update|clear)/;
  var EASE='cubic-bezier(.76,0,.24,1)';
  var curtain=function(){
    if(cur)return cur;
    cur=document.createElement('div');cur.className='pt-curtain';cur.setAttribute('aria-hidden','true');cur.innerHTML='AID<i></i>';
    document.body.appendChild(cur);return cur;
  };
  var curY=function(){try{return new DOMMatrix(getComputedStyle(cur).transform).m42}catch(e){return 0}};
  var slide=function(from,to,ms,onEnd){
    cur.getAnimations().forEach(function(a){a.cancel()});
    cur.classList.add('on');
    var an=cur.animate([{transform:'translate3d(0,'+from+'px,0)'},{transform:'translate3d(0,'+to+'px,0)'}],{duration:ms,easing:EASE,fill:'forwards'});
    an.onfinish=function(){if(onEnd)onEnd()};
    return an;
  };
  var hide=function(){if(!cur)return;cur.getAnimations().forEach(function(a){a.cancel()});cur.classList.remove('on','busy');cur.style.transform=''};
  // heavy setup (WebGL, 3D models, big decodes) must not run while the curtain is moving: pages queue it here
  var liftCbs=[],liftOver=false;
  var fireLift=function(){if(liftOver)return;liftOver=true;setTimeout(function(){liftCbs.splice(0).forEach(function(f){try{f()}catch(e){}})},250)};
  window.aidAfterLift=function(f){if(liftOver)setTimeout(f,0);else liftCbs.push(f)};
  // entrances that should play AS the curtain lifts (not after it): fired when the lift starts, or just after load when there is no curtain
  var startCbs=[],liftStarted=false;
  var startLift=function(){if(liftStarted)return;liftStarted=true;startCbs.splice(0).forEach(function(f){try{f()}catch(e){}})};
  window.aidOnLift=function(f){if(liftStarted)f();else startCbs.push(f)};

  if(doc.classList.contains('pt-in')){
    if(reduce){ptClear()}
    else{
      var c0=curtain();c0.classList.add('on','busy');c0.style.transform='translate3d(0,0,0)';doc.classList.add('pt-live');
      var lifted=false,lift=function(){
        if(lifted||going)return;lifted=true;
        try{sessionStorage.removeItem('aidpt')}catch(e){}
        doc.classList.add('pt-go');startLift();flushHeld();
        slide(0,-innerHeight,720,function(){hide();fireLift();setTimeout(ptClear,1400)});
      };
      var ready=function(){
        var go=function(){requestAnimationFrame(function(){requestAnimationFrame(function(){setTimeout(lift,60)})})};
        var vids=[].slice.call(document.querySelectorAll('video[data-pt-wait]')).map(function(v){return new Promise(function(res){if(v.readyState>=2)return res();v.addEventListener('loadeddata',res,{once:true});setTimeout(res,1600)})});
        var imgs=[].slice.call(document.querySelectorAll('img[data-pt-wait]')).map(function(im){return new Promise(function(res){var d=function(){(im.decode?im.decode():Promise.resolve()).then(res,res)};if(im.complete)d();else{im.addEventListener('load',d,{once:true});im.addEventListener('error',res,{once:true})}setTimeout(res,2200)})});
        Promise.all([document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve()].concat(vids,imgs)).then(go);
      };
      if(document.readyState==='complete')ready();else addEventListener('load',ready);
      setTimeout(lift,2600);
    }
  }
  if(!doc.classList.contains('pt-in')||reduce){var go2=function(){setTimeout(startLift,80);setTimeout(fireLift,300)};if(document.readyState==='complete')go2();else addEventListener('load',go2)}
  setTimeout(fireLift,6000);setTimeout(startLift,6000);
  addEventListener('pageshow',function(e){if(e.persisted){hide();ptClear();going=false}});

  // which links get the transition
  var internal=function(a){
    if(!a||(a.target&&a.target!=='_self')||a.hasAttribute('download')||a.hasAttribute('data-pt-ignore'))return null;
    var u;try{u=new URL(a.href,location.href)}catch(x){return null}
    if(u.origin!==location.origin||!/^https?:$/.test(u.protocol)||NO.test(u.pathname))return null;
    if(u.pathname===location.pathname&&u.search===location.search)return null;
    return u;
  };

  // prefetch
  var seen={},conn=navigator.connection||{};
  var prefetch=function(u){
    if(!u||seen[u.href]||conn.saveData)return;seen[u.href]=1;
    var l=document.createElement('link');l.rel='prefetch';l.as='document';l.href=u.href;document.head.appendChild(l);
  };
  if(!reduce){
    var near=function(e){var a=e.target.closest&&e.target.closest('a[href]');if(a)prefetch(internal(a))};
    document.addEventListener('pointerover',near,{passive:true});
    document.addEventListener('touchstart',near,{passive:true});
    document.addEventListener('focusin',near);
    var idle=window.requestIdleCallback||function(f){setTimeout(f,1200)};
    addEventListener('load',function(){idle(function(){document.querySelectorAll('.nav a[href], .foot a[href]').forEach(function(a){prefetch(internal(a))})})});
  }

  if(!reduce)document.addEventListener('click',function(e){
    if(e.defaultPrevented||e.button||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
    var a=e.target.closest&&e.target.closest('a[href]'),u=internal(a);
    if(!u)return;
    e.preventDefault();
    target=u;                       // fast clicking: the last link clicked wins
    if(going)return;going=true;
    try{sessionStorage.setItem('aidpt','1')}catch(x){}
    doc.classList.add('pt-out');
    document.querySelectorAll('video').forEach(function(v){try{v.pause()}catch(x){}});
    var c=curtain(),H=innerHeight;
    // where is the curtain right now? hidden = below the screen; mid-lift = somewhere above
    var y=c.classList.contains('on')?curY():H;
    var closed=false,fetched=false,left=false;
    var leave=function(){if(left)return;if(closed&&fetched){left=true;c.classList.add('busy');location.href=target.href}};
    // fetch in parallel: puts the page in the HTTP cache so it appears at once after the curtain
    fetch(u.href,{credentials:'same-origin'}).then(function(r){return r.text()}).catch(function(){}).then(function(){fetched=true;leave()});
    slide(y,0,Math.max(240,560*Math.min(1,Math.abs(y)/H)),function(){closed=true;c.classList.add('busy');leave()});
    setTimeout(function(){fetched=true;closed=true;leave()},2200);
  });

  // mobile menu
  var b=document.querySelector('.burger'),ul=document.querySelector('.nav ul');
  if(b)b.addEventListener('click',function(){var o=ul.classList.toggle('open');b.setAttribute('aria-expanded',o);b.textContent=o?'Close':'Menu'});

  // reveals
  var held=[];
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){
    if(doc.classList.contains('pt-in')&&!doc.classList.contains('pt-go')){held.push(e.target)}else e.target.classList.add('in');
    io.unobserve(e.target)}})},{threshold:.12});
  // entrance choreography: reveals that are in view while the curtain is still down play as it lifts
  var flushHeld=function(){setTimeout(function(){held.forEach(function(el,i){setTimeout(function(){el.classList.add('in')},i*90)});held=[]},260)};
  document.querySelectorAll('.rv').forEach(function(el){io.observe(el)});

  // lazy video, plays only on screen
  document.querySelectorAll('video[data-src]').forEach(function(v){
    if(reduce)return;
    new IntersectionObserver(function(es){es.forEach(function(e){
      if(e.isIntersecting){if(!v.getAttribute('src')){v.src=v.dataset.src;v.load()}v.play().catch(function(){})}else v.pause();
    })},{threshold:.1}).observe(v);
  });

  // glitch
  if(!reduce){
    var gl=document.querySelectorAll('.glitch');
    var fire=function(el){el.classList.add('on');setTimeout(function(){el.classList.remove('on')},380)};
    gl.forEach(function(el){el.addEventListener('mouseenter',function(){fire(el)})});
    if(gl.length)setInterval(function(){fire(gl[0])},5000);
  }

  // poster series: vertical scroll drives the sideways track
  var seq=document.querySelector('.seq');
  if(seq&&!reduce){
    var trk=seq.querySelector('.seq-track'),bar=seq.querySelector('.seq-bar i'),cnt=seq.querySelector('.seq-count'),n=seq.querySelectorAll('.seq-item').length,last=-1;
    var upd=function(){
      var r=seq.getBoundingClientRect(),total=r.height-innerHeight;
      var p=Math.min(1,Math.max(0,total>0?-r.top/total:0));
      trk.style.transform='translate3d('+(-p*Math.max(0,trk.scrollWidth-innerWidth))+'px,0,0)';
      bar.style.transform='scaleX('+p+')';
      var i=Math.min(n-1,Math.floor(p*n));
      if(i!==last){last=i;cnt.textContent='0'+(i+1)+' / 0'+n}
    };
    addEventListener('scroll',upd,{passive:true});
    addEventListener('resize',upd);
    upd();
  }

  // custom cursor
  if(fine&&!reduce){
    document.body.classList.add('cur');
    var c=document.querySelector('.cursor'),f=document.querySelector('.cursor-f');
    if(c&&f){
      var x=innerWidth/2,y=innerHeight/2,fx=x,fy=y;
      addEventListener('mousemove',function(e){
        x=e.clientX;y=e.clientY;
        c.style.transform='translate('+x+'px,'+y+'px) translate(-50%,-50%)';
      });
      (function loop(){
        fx+=(x-fx)*.16;fy+=(y-fy)*.16;
        f.style.transform='translate('+fx+'px,'+fy+'px) translate(-50%,-50%)';
        requestAnimationFrame(loop);
      })();
      document.querySelectorAll('a,button,select,input,textarea,label').forEach(function(el){
        el.addEventListener('mouseenter',function(){c.classList.add('hov');f.classList.add('hov')});
        el.addEventListener('mouseleave',function(){c.classList.remove('hov');f.classList.remove('hov')});
      });
    }
  }

  // 3D product stage: tilt follows the pointer, thumbs swap the product
  var tw=document.getElementById('tiltwrap'),t=document.getElementById('tilt');
  if(tw&&t&&!reduce&&fine){
    var sh=t.querySelector('.pshine'),tx=0,ty=0,cx=0,cy=0;
    tw.addEventListener('mousemove',function(e){
      var r=tw.getBoundingClientRect();
      tx=((e.clientX-r.left)/r.width-.5)*2;
      ty=((e.clientY-r.top)/r.height-.5)*2;
      if(sh){sh.style.setProperty('--sx',((tx*.5+.5)*100)+'%');sh.style.setProperty('--sy',((ty*.5+.5)*100)+'%')}
    });
    tw.addEventListener('mouseleave',function(){tx=0;ty=0});
    (function loop(){
      cx+=(tx-cx)*.08;cy+=(ty-cy)*.08;
      t.style.transform='rotateY('+(cx*16)+'deg) rotateX('+(-cy*12)+'deg)';
      requestAnimationFrame(loop);
    })();
  }
  var main=document.getElementById('tiltimg');
  document.querySelectorAll('.pthumbs img').forEach(function(th){
    th.addEventListener('click',function(){
      document.querySelectorAll('.pthumbs img').forEach(function(x){x.classList.remove('on')});
      th.classList.add('on');
      if(main&&main.getAttribute('src')!==th.dataset.full){
        main.style.opacity=0;
        setTimeout(function(){main.src=th.dataset.full;main.style.opacity=1},220);
      }
    });
  });

  // triangle gate: white blast grows from the button, then the film opens
  var fb=document.getElementById('filmbtn'),boom=document.getElementById('boom');
  if(fb&&boom){
    fb.addEventListener('click',function(e){
      e.preventDefault();
      if(reduce){location.href=fb.getAttribute('href');return}
      var r=fb.getBoundingClientRect();
      var cx=e.clientX||r.left+r.width/2, cy=e.clientY||r.top+r.height/2;
      boom.style.setProperty('--bx',(cx/innerWidth*100).toFixed(2)+'%');
      boom.style.setProperty('--by',(cy/innerHeight*100).toFixed(2)+'%');
      boom.classList.add('go');
      setTimeout(function(){location.href=fb.getAttribute('href')},420);
    });
  }

  // the film page: sound on, tap video to pause/play
  var fv=document.getElementById('filmvid'),pb=document.getElementById('play');
  if(fv&&pb){
    var fh=document.getElementById('filmhero');var showPlay=function(on){pb.classList.toggle('off',!on);fh.classList.toggle('idle',on)};
    pb.addEventListener('click',function(){fv.play().catch(function(){})});
    fv.addEventListener('click',function(){if(fv.paused)fv.play().catch(function(){});else fv.pause()});
    fv.addEventListener('play',function(){showPlay(false)});
    fv.addEventListener('pause',function(){showPlay(true)});
    // timed captions, timecode and progress follow the film
    var caps=[].slice.call(document.querySelectorAll('.cap')),ftc=document.getElementById('ftc'),fp=document.getElementById('fprog'),cur=-1;
    var tick=function(){
      var t=fv.currentTime,d=fv.duration||1,k=-1;
      caps.forEach(function(c,i){if(t>=parseFloat(c.dataset.t))k=i});
      if(k!==cur){caps.forEach(function(c,i){c.classList.toggle('on',i===k)});cur=k}
      ftc.textContent=('0'+Math.floor(t/60)).slice(-2)+':'+('0'+Math.floor(t%60)).slice(-2);
      fp.style.width=(t/d*100).toFixed(2)+'%';
      if(!fv.paused)requestAnimationFrame(tick);
    };
    fv.addEventListener('play',function(){requestAnimationFrame(tick)});
    fv.addEventListener('seeked',tick);
    fv.addEventListener('loadedmetadata',tick);
  }

  // work filters
  var fbtns=document.querySelectorAll('.filters button');
  fbtns.forEach(function(btn){btn.addEventListener('click',function(){
    fbtns.forEach(function(x){x.setAttribute('aria-pressed',x===btn)});
    var f=btn.dataset.f;
    document.querySelectorAll('.grid .card').forEach(function(c){c.hidden=!(f==='all'||c.dataset.cat.split(' ').indexOf(f)>-1)});
  })});

  // contact routing
  var form=document.getElementById('f');
  if(form)form.addEventListener('submit',function(e){
    e.preventDefault();
    var d=new FormData(form),need=d.get('need');
    var body='Company: '+d.get('company')+'\nNeed: '+need+'\n\n'+d.get('message');
    var note=document.getElementById('note');
    if(need==='Design'){
      note.textContent='Opening your email app.';
      location.href='mailto:'+form.dataset.email+'?subject='+encodeURIComponent('AID — '+d.get('name'))+'&body='+encodeURIComponent(body);
    }else{
      note.textContent='Software is built by EVRABO. Sending you there.';
      setTimeout(function(){location.href=form.dataset.evrabo},900);
    }
  });

  // ---- shop (demo behaviour; Shopify replaces all of this with real cart/variant objects) ----
  var money=function(n){return '$'+n.toFixed(2)};
  var countEls=document.querySelectorAll('[data-cart-count]');
  var setCount=function(n){countEls.forEach(function(el){el.textContent=n})};

  // collection sort
  var sortSel=document.getElementById('sort');
  if(sortSel)sortSel.addEventListener('change',function(){
    var g=document.querySelector('.grid'),cs=[].slice.call(g.querySelectorAll('.card')),k=sortSel.value;
    cs.sort(function(a,b){
      if(k==='low')return a.dataset.price-b.dataset.price;
      if(k==='high')return b.dataset.price-a.dataset.price;
      return a.dataset.order-b.dataset.order;
    }).forEach(function(c){g.appendChild(c)});
  });

  // product gallery + variant price + add to cart
  var pm=document.getElementById('pdpmain'),pt=document.querySelectorAll('.pdp-thumbs button');
  pt.forEach(function(btn){btn.addEventListener('click',function(){
    pt.forEach(function(x){x.setAttribute('aria-pressed',x===btn)});
    var src=btn.dataset.full;
    if(pm&&pm.getAttribute('src')!==src){pm.style.opacity=0;setTimeout(function(){pm.src=src;pm.alt=btn.dataset.alt||pm.alt;pm.style.opacity=1},200)}
  })});
  var atc=document.getElementById('atc');
  if(atc){
    var pr=document.getElementById('price'),ab=document.getElementById('atc-btn'),an=document.getElementById('atc-note'),added=0;
    var upd2=function(){var v=atc.querySelector('input[name=size]:checked');if(v&&pr)pr.textContent=money(+v.dataset.price)};
    atc.addEventListener('change',upd2);upd2();
    atc.addEventListener('submit',function(e){
      e.preventDefault();
      added+=+atc.querySelector('input[name=qty]').value;
      setCount(added);
      an.innerHTML='Added. <a href="cart.html">View cart</a>';
    });
  }

  // quantity steppers (product + cart)
  document.querySelectorAll('.qty').forEach(function(q){
    var inp=q.querySelector('input');
    q.querySelectorAll('button').forEach(function(b){b.addEventListener('click',function(){
      inp.value=Math.max(1,Math.min(99,(+inp.value||1)+(b.dataset.d==='+'?1:-1)));
      inp.dispatchEvent(new Event('change',{bubbles:true}));
    })});
  });

  // cart totals, remove, empty state
  var cartEl=document.getElementById('cart');
  if(cartEl){
    var calc=function(){
      var sub=0,n=0;
      cartEl.querySelectorAll('.line').forEach(function(l){
        var q=Math.max(1,+l.querySelector('input').value||1),t=q*l.dataset.price;
        l.querySelector('.tot').textContent=money(t);sub+=t;n+=q;
      });
      document.getElementById('sub').textContent=money(sub);
      document.getElementById('total').textContent=money(sub);
      setCount(n);
      var none=!cartEl.querySelector('.line');
      cartEl.hidden=none;document.getElementById('empty').hidden=!none;
    };
    cartEl.addEventListener('change',calc);
    cartEl.addEventListener('click',function(e){var r=e.target.closest('.rm');if(r){r.closest('.line').remove();calc()}});
    calc();
  }

  // join the next drop (demo; Shopify customer form replaces this)
  var jf=document.getElementById('joinf');
  if(jf)jf.addEventListener('submit',function(e){
    e.preventDefault();
    var n=document.getElementById('join-note'),v=jf.querySelector('input[type=email]');
    n.textContent=v.checkValidity()&&v.value?'You are in. First access to the next drop.':'Enter a valid email.';
  });

  // pick of the week: scene activates on view, frame tilts with the pointer, size changes price
  var wk=document.querySelector('.wk,[data-wk]');
  if(wk){
    new IntersectionObserver(function(es){es.forEach(function(e){wk.classList.toggle('active',e.isIntersecting)})},{threshold:.4}).observe(wk);
    var wf=wk.querySelector('.wk-frame');
    if(wf&&fine&&!reduce)document.addEventListener('mousemove',function(e){
      if(!wk.classList.contains('active'))return;
      var rx=(e.clientX/innerWidth-.5)*6,ry=(e.clientY/innerHeight-.5)*6;
      wf.style.transform='perspective(1200px) rotateY('+rx+'deg) rotateX('+(-ry)+'deg) scale(1)';
    });
    var wb=wk.querySelector('[data-wk-buy]'),wp=wk.querySelector('[data-wk-price]'),wn=wk.querySelector('[data-wk-note]'),wadded=0;
    wb.addEventListener('change',function(e){if(e.target.dataset.price)wp.textContent=money(+e.target.dataset.price)});
    wb.addEventListener('submit',function(e){e.preventDefault();wadded++;setCount(wadded);wn.innerHTML='Added. <a href="cart.html">View cart</a>'});
  }
})();

(function(){
  /* Web3Forms public access key (free, tied to the destination inbox). Paste it here. */
  var W3F_KEY='c433599a-60cf-45df-8fc9-a80bcb283c1f';
  var say=document.querySelector('.say');
  if(say){say.addEventListener('submit',function(e){e.preventDefault();
    var f=say.elements.from,m=say.elements.msg,n=say.querySelector('.say-note'),btn=say.querySelector('.send'),ok=true;
    [f,m].forEach(function(x){var bad=!x.value.trim()||(x===f&&!/^\S+@\S+\.\S+$/.test(x.value));x.classList.toggle('bad',bad);if(bad)ok=false});
    if(!ok){n.textContent='Both, please.';return}
    btn.disabled=true;n.textContent='Sending...';
    var fd=new FormData();fd.append('access_key',W3F_KEY);fd.append('subject','AID Studio: message from '+f.value);fd.append('from_name','AID Studio site');fd.append('email',f.value);fd.append('message',m.value);
    fetch('https://api.web3forms.com/submit',{method:'POST',body:fd})
      .then(function(r){return r.json()})
      .then(function(d){if(!d.success)throw 0;f.value='';m.value='';n.textContent='Sent.'})
      .catch(function(){n.textContent="Didn't go. Try again."})
      .then(function(){btn.disabled=false});
  })}
})();
