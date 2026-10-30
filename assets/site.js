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

  // scroll-driven poster sequence
  var seq=document.querySelector('.seq');
  if(seq&&!reduce){
    var simg=seq.querySelectorAll('.seq img'),sw=seq.querySelectorAll('.seq-word'),cur=-1;
    var upd=function(){
      var r=seq.getBoundingClientRect();
      var total=r.height-innerHeight;
      var p=Math.min(1,Math.max(0,total>0?-r.top/total:0));
      var i=Math.min(simg.length-1,Math.floor(p*simg.length));
      if(i!==cur){
        cur=i;
        simg.forEach(function(im,k){im.classList.toggle('on',k===i)});
        sw.forEach(function(w,k){w.classList.toggle('on',k===i)});
        var c=seq.querySelector('.seq-count');
        if(c)c.textContent='0'+(i+1)+' / 0'+simg.length;
      }
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
})();
