/* Performance HUD. Add ?perf to any page URL (e.g. design.html?perf) to see it. Not loaded otherwise.
   Shows live frame rate and the worst frames, what the screen/GPU is, and lets you copy a report to send back.
   Add ?lite to force the lighter rendering mode, ?lite=0 to turn it off again. */
(function(){
  var box=document.createElement('div');
  box.setAttribute('aria-hidden','true');
  box.style.cssText='position:fixed;left:8px;bottom:8px;z-index:2147483000;font:11px/1.45 ui-monospace,Consolas,monospace;color:#0f0;background:rgba(0,0,0,.82);padding:8px 10px;border:1px solid #0f0;min-width:220px;pointer-events:auto;white-space:pre';
  var btn=document.createElement('button');
  btn.textContent='copy report';btn.style.cssText='display:block;margin-top:6px;font:inherit;background:#0f0;color:#000;border:0;padding:3px 8px;cursor:pointer';
  var out=document.createElement('div');box.appendChild(out);box.appendChild(btn);document.body.appendChild(box);

  var gpu='n/a';
  try{var c=document.createElement('canvas'),g=c.getContext('webgl'),e=g&&g.getExtension('WEBGL_debug_renderer_info');if(e)gpu=g.getParameter(e.UNMASKED_RENDERER_WEBGL)}catch(x){}
  var frames=[],long=0,worst=[],last=performance.now(),scrolling=false,sT,scrollFrames=[],page=location.pathname.split('/').pop()||'index.html';
  addEventListener('scroll',function(){scrolling=true;clearTimeout(sT);sT=setTimeout(function(){scrolling=false},120)},{passive:true});
  try{new PerformanceObserver(function(l){l.getEntries().forEach(function(en){long++;worst.push('long task '+Math.round(en.duration)+'ms @'+Math.round(en.startTime)+'ms')})}).observe({entryTypes:['longtask']})}catch(x){}

  var pct=function(a,p){if(!a.length)return 0;var s=a.slice().sort(function(x,y){return x-y});return s[Math.min(s.length-1,Math.floor(s.length*p))]};
  var report=function(){
    var all=frames.slice(-300),sc=scrollFrames.slice(-300);
    return [
      'AID perf report','page: '+page,'time: '+new Date().toISOString(),
      'screen: '+screen.width+'x'+screen.height+'  viewport: '+innerWidth+'x'+innerHeight+'  dpr: '+(devicePixelRatio||1),
      'gpu: '+gpu,'cores: '+(navigator.hardwareConcurrency||'?')+'  memory: '+(navigator.deviceMemory||'?')+'GB',
      'lite mode: '+(document.documentElement.classList.contains('lite')?'ON':'off'),
      'frames (last 300): median '+pct(all,.5).toFixed(1)+'ms  p95 '+pct(all,.95).toFixed(1)+'ms  max '+(all.length?Math.max.apply(null,all):0).toFixed(1)+'ms',
      'WHILE SCROLLING (last 300): median '+pct(sc,.5).toFixed(1)+'ms  p95 '+pct(sc,.95).toFixed(1)+'ms  max '+(sc.length?Math.max.apply(null,sc):0).toFixed(1)+'ms',
      'frames over 33ms: '+all.filter(function(d){return d>33}).length+'   long tasks (>50ms): '+long,
      'scroll position: '+Math.round(scrollY)+' / '+Math.round(document.documentElement.scrollHeight-innerHeight),
      worst.slice(-8).join('\n')
    ].join('\n');
  };
  btn.addEventListener('click',function(){
    var t=report();
    try{navigator.clipboard.writeText(t);btn.textContent='copied'}catch(x){prompt('Copy this report:',t)}
    setTimeout(function(){btn.textContent='copy report'},1500);
  });

  var tick=0;
  var f=function(t){
    var d=t-last;last=t;
    if(d<500){frames.push(d);if(frames.length>600)frames.shift();if(scrolling){scrollFrames.push(d);if(scrollFrames.length>600)scrollFrames.shift()}}
    if(++tick%20===0){
      var a=frames.slice(-60),sa=scrollFrames.slice(-60),fps=a.length?1000/(a.reduce(function(x,y){return x+y},0)/a.length):0;
      var p95=pct(a,.95),bad=p95>33?'#f55':p95>20?'#fc3':'#0f0';
      box.style.color=bad;box.style.borderColor=bad;
      out.textContent='fps '+fps.toFixed(0)+'   p95 '+p95.toFixed(1)+'ms   max '+(a.length?Math.max.apply(null,a):0).toFixed(0)+'ms\nscrolling p95 '+pct(sa,.95).toFixed(1)+'ms\ndpr '+(devicePixelRatio||1)+'  '+innerWidth+'x'+innerHeight+(document.documentElement.classList.contains('lite')?'  LITE':'')+'\nlong tasks '+long+'\n'+gpu.slice(0,40);
    }
    requestAnimationFrame(f);
  };
  requestAnimationFrame(f);
})();
