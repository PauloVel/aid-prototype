(function(){
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine=matchMedia('(hover: hover) and (pointer: fine)').matches;

  // mobile menu
  var b=document.querySelector('.burger'),ul=document.querySelector('.nav ul');
  if(b)b.addEventListener('click',function(){var o=ul.classList.toggle('open');b.setAttribute('aria-expanded',o);b.textContent=o?'Close':'Menu'});

  // reveals
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12});
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
    var showPlay=function(on){pb.classList.toggle('off',!on)};
    pb.addEventListener('click',function(){fv.play().catch(function(){})});
    fv.addEventListener('click',function(){if(fv.paused)fv.play().catch(function(){});else fv.pause()});
    fv.addEventListener('play',function(){showPlay(false)});
    fv.addEventListener('pause',function(){showPlay(true)});
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
  var wk=document.querySelector('.wk');
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

/* studio: one continuous shot */
(function(){
  var story=document.querySelector('.as-story');
  if(!story)return;
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce){story.classList.add('rm')}
  var q=function(s){return story.querySelector(s)};
  var hero=q('.st-hero'),h1=q('.st-h1'),sp=h1.querySelectorAll('span'),film=q('.st-film'),vid=q('video'),line=q('.st-line'),pst=q('.st-poster'),fog=q('.st-fog'),fl=q('.fl'),fr=q('.fr'),h2=q('.st-h2');
  var cl=function(v){return Math.min(1,Math.max(0,v))},T=function(p,a,b){return cl((p-a)/(b-a))},out=function(t){return 1-Math.pow(1-t,3)},inn=function(t){return t*t};
  if(!reduce){
    vid.src='assets/hero.mp4';
    new IntersectionObserver(function(es){if(es[0].isIntersecting)vid.play().catch(function(){});else vid.pause()},{threshold:0}).observe(story);
  }
  var tick=false;
  function upd(){
    tick=false;
    var r=story.getBoundingClientRect(),tot=r.height-innerHeight,p=tot>0?cl(-r.top/tot):0;
    if(reduce){return}
    var a=T(p,0,.26);
    hero.style.transform='scale('+(1+1.6*inn(T(p,.02,.3)))+')';
    hero.style.opacity=1-T(p,.18,.3);
    h1.style.opacity=1-T(p,.12,.24);
    sp[0].style.transform='translate3d('+(-45*out(a))+'vw,'+(-30*out(a))+'vh,0)';
    sp[1].style.transform='translate3d('+(40*out(a))+'vw,'+(25*out(a))+'vh,0)';
    var op=out(T(p,.3,.52));
    film.style.clipPath='inset('+((1-op)*36)+'svh '+((1-op)*36)+'vw round '+((1-op)*1.2)+'rem)';
    vid.style.transform='scale('+(1.25-.25*op)+')';
    var li=T(p,.5,.58),lo=T(p,.62,.68);
    line.style.opacity=li*(1-lo);
    line.style.transform='translate3d(0,'+((1-out(li))*4+lo*-6)+'rem,0)';
    var fi=T(p,.66,.78),pt=T(p,.8,.95);
    film.style.opacity=T(p,.28,.33)*(1-T(p,.77,.79));
    fog.style.opacity=fi*(1-T(p,.9,.96));
    fog.style.transform='scale('+(1.35-.35*out(fi)+.12*pt)+')';
    fl.style.transform='translate3d('+(-110*out(pt))+'%,0,0)';
    fr.style.transform='translate3d('+(110*out(pt))+'%,0,0)';
    pst.style.opacity=p>=.79?1:0;
    pst.style.transform='scale('+(1.3-.3*out(T(p,.8,.97)))+')';
    var hi=T(p,.86,.94);
    h2.style.opacity=hi>0?1:0;
    h2.style.transform='translate3d(0,'+((1-out(hi))*18)+'rem,0) scale('+(1.25-.25*out(hi))+')';
    h2.style.transformOrigin='0 100%';
    story.classList.toggle('done',p>=.97);
  }
  function req(){if(!tick){tick=true;requestAnimationFrame(upd)}}
  addEventListener('scroll',req,{passive:true});
  addEventListener('resize',req);
  (pst.complete?Promise.resolve():new Promise(function(r){pst.addEventListener('load',r)})).then(req);
  req();
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
