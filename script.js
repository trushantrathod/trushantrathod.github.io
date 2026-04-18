// ── CURSOR ──
const dot = document.getElementById('cursor-dot');
const ring = document.getElementById('cursor-ring');
let mx=0,my=0,rx=0,ry=0;
document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;dot.style.left=mx+'px';dot.style.top=my+'px';});
(function animRing(){rx+=(mx-rx)*0.12;ry+=(my-ry)*0.12;ring.style.left=rx+'px';ring.style.top=ry+'px';requestAnimationFrame(animRing);})();
document.querySelectorAll('a,button').forEach(el=>{
  el.addEventListener('mouseenter',()=>{dot.style.transform='translate(-50%,-50%) scale(0)';ring.style.width='56px';ring.style.height='56px';ring.style.borderColor='var(--gold)';});
  el.addEventListener('mouseleave',()=>{dot.style.transform='translate(-50%,-50%) scale(1)';ring.style.width='36px';ring.style.height='36px';});
});

// ── SCROLL REVEAL ──
const observer = new IntersectionObserver(entries=>{
  entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('visible'); });
},{threshold:0.1});
document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));

// ── HERO CANVAS: Floating particle constellation ──
(function(){
  const c=document.getElementById('hero-canvas');
  const ctx=c.getContext('2d');
  let W,H,pts=[];
  function resize(){W=c.width=c.offsetWidth;H=c.height=c.offsetHeight;init();}
  function init(){
    pts=[];
    for(let i=0;i<80;i++) pts.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-0.5)*0.3,vy:(Math.random()-0.5)*0.3,r:Math.random()*1.5+0.5});
  }
  function draw(){
    ctx.clearRect(0,0,W,H);
    pts.forEach(p=>{
      p.x+=p.vx; p.y+=p.vy;
      if(p.x<0)p.x=W; if(p.x>W)p.x=0;
      if(p.y<0)p.y=H; if(p.y>H)p.y=0;
    });
    for(let i=0;i<pts.length;i++){
      for(let j=i+1;j<pts.length;j++){
        const dx=pts[i].x-pts[j].x, dy=pts[i].y-pts[j].y;
        const d=Math.sqrt(dx*dx+dy*dy);
        if(d<120){
          ctx.beginPath();
          ctx.strokeStyle=`rgba(212,168,67,${0.12*(1-d/120)})`;
          ctx.lineWidth=0.5;
          ctx.moveTo(pts[i].x,pts[i].y);
          ctx.lineTo(pts[j].x,pts[j].y);
          ctx.stroke();
        }
      }
      ctx.beginPath();
      ctx.arc(pts[i].x,pts[i].y,pts[i].r,0,Math.PI*2);
      ctx.fillStyle='rgba(212,168,67,0.5)';
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  window.addEventListener('resize',resize);
  resize(); draw();
})();

// ── CONSCIA CANVAS: Neural network animation ──
(function(){
  const c=document.getElementById('conscia-canvas');
  const ctx=c.getContext('2d');
  let W,H,t=0;
  function resize(){W=c.width=c.offsetWidth;H=c.height=c.offsetHeight;}
  function draw(){
    t+=0.008;
    ctx.fillStyle='rgba(14,12,8,0.06)';
    ctx.fillRect(0,0,W,H);
    // Draw neural net layers
    const layers=[[0.15,3],[0.38,5],[0.62,5],[0.85,3]];
    const nodes=[];
    layers.forEach(([xr,n])=>{
      const arr=[];
      for(let i=0;i<n;i++){
        const y=H*(0.2+0.6*(n===1?0.5:i/(n-1)));
        arr.push({x:xr*W,y});
      }
      nodes.push(arr);
    });
    // Connections
    for(let l=0;l<nodes.length-1;l++){
      nodes[l].forEach(a=>{
        nodes[l+1].forEach(b=>{
          const pulse=(Math.sin(t*2+a.x*0.01+b.y*0.01)+1)/2;
          ctx.beginPath();
          ctx.strokeStyle=`rgba(212,168,67,${0.06+pulse*0.12})`;
          ctx.lineWidth=0.5+pulse*0.5;
          ctx.moveTo(a.x,a.y);
          ctx.lineTo(b.x,b.y);
          ctx.stroke();
        });
      });
    }
    // Nodes
    nodes.forEach((layer,li)=>{
      layer.forEach((n,ni)=>{
        const pulse=(Math.sin(t*3+li+ni)+1)/2;
        ctx.beginPath();
        ctx.arc(n.x,n.y,4+pulse*3,0,Math.PI*2);
        ctx.fillStyle=`rgba(212,168,67,${0.3+pulse*0.5})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(n.x,n.y,8+pulse*6,0,Math.PI*2);
        ctx.strokeStyle=`rgba(212,168,67,${0.08+pulse*0.1})`;
        ctx.lineWidth=1;
        ctx.stroke();
      });
    });
    // Floating data tokens
    for(let i=0;i<6;i++){
      const x=(Math.sin(t*0.7+i*1.2)+1)/2*W;
      const y=(Math.cos(t*0.5+i*0.8)+1)/2*H;
      ctx.fillStyle=`rgba(44,184,160,${0.15+Math.sin(t+i)*0.08})`;
      ctx.fillRect(x-12,y-4,24,8);
      ctx.fillStyle='rgba(44,184,160,0.6)';
      ctx.font='7px DM Mono';
      ctx.fillText('token',x-10,y+3);
    }
    requestAnimationFrame(draw);
  }
  window.addEventListener('resize',resize);
  resize(); draw();
})();

// ── BLOCKCHAIN CANVAS: Block chain animation ──
(function(){
  const c=document.getElementById('blockchain-canvas');
  const ctx=c.getContext('2d');
  let W,H,t=0;
  const blocks=[];
  function resize(){W=c.width=c.offsetWidth;H=c.height=c.offsetHeight;initBlocks();}
  function initBlocks(){
    blocks.length=0;
    for(let i=0;i<6;i++){
      blocks.push({
        x: W*0.1+i*(W*0.16),
        y: H/2,
        hash: Math.random().toString(16).substr(2,6),
        glow:Math.random()*Math.PI*2,
        verified: i<4
      });
    }
  }
  function draw(){
    t+=0.012;
    ctx.fillStyle='rgba(14,12,8,0.08)';
    ctx.fillRect(0,0,W,H);
    // Chain links
    for(let i=0;i<blocks.length-1;i++){
      const a=blocks[i],b=blocks[i+1];
      const pulse=(Math.sin(t*2+i)+1)/2;
      ctx.beginPath();
      ctx.strokeStyle=`rgba(212,168,67,${0.15+pulse*0.25})`;
      ctx.lineWidth=1.5;
      ctx.setLineDash([4,3]);
      ctx.moveTo(a.x+28,a.y);
      ctx.lineTo(b.x-28,b.y);
      ctx.stroke();
      ctx.setLineDash([]);
      // Moving packet
      const px=a.x+28+(b.x-28-(a.x+28))*((t*0.4+i*0.5)%1);
      const py=a.y;
      ctx.beginPath();
      ctx.arc(px,py,3,0,Math.PI*2);
      ctx.fillStyle='rgba(212,168,67,0.9)';
      ctx.fill();
    }
    // Blocks
    blocks.forEach((bl,i)=>{
      bl.glow+=0.04;
      const glow=(Math.sin(bl.glow)+1)/2;
      const bw=56,bh=40;
      // Block body
      ctx.save();
      ctx.shadowBlur=glow*20;
      ctx.shadowColor=bl.verified?'rgba(212,168,67,0.5)':'rgba(232,98,58,0.5)';
      ctx.strokeStyle=bl.verified?`rgba(212,168,67,${0.4+glow*0.4})`:`rgba(232,98,58,${0.4+glow*0.4})`;
      ctx.lineWidth=1;
      ctx.fillStyle=`rgba(26,21,8,${0.7+glow*0.2})`;
      ctx.beginPath();
      ctx.rect(bl.x-bw/2,bl.y-bh/2,bw,bh);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      // Hash text
      ctx.font='7px DM Mono';
      ctx.fillStyle=bl.verified?'rgba(212,168,67,0.7)':'rgba(232,98,58,0.7)';
      ctx.textAlign='center';
      ctx.fillText('#'+bl.hash,bl.x,bl.y+3);
      ctx.fillStyle='rgba(245,240,232,0.25)';
      ctx.font='6px DM Mono';
      ctx.fillText('BLOCK '+(i+1),bl.x,bl.y-8);
    });
    // IPFS nodes floating around
    for(let i=0;i<4;i++){
      const nx=W*0.08+Math.sin(t*0.4+i*1.5)*W*0.04;
      const ny=H*0.15+i*(H*0.2)+Math.cos(t*0.3+i)*20;
      ctx.beginPath();
      ctx.arc(nx,ny,5,0,Math.PI*2);
      ctx.strokeStyle='rgba(124,79,224,0.5)';
      ctx.lineWidth=1;
      ctx.stroke();
      ctx.font='6px DM Mono';
      ctx.fillStyle='rgba(124,79,224,0.5)';
      ctx.textAlign='center';
      ctx.fillText('IPFS',nx,ny+14);
    }
    requestAnimationFrame(draw);
  }
  window.addEventListener('resize',resize);
  resize(); draw();
})();

// ── SOCIAL CANVAS: Real-time analytics streams ──
(function(){
  const c=document.getElementById('social-canvas');
  const ctx=c.getContext('2d');
  let W,H,t=0;
  const streams=[];
  function resize(){W=c.width=c.offsetWidth;H=c.height=c.offsetHeight;initStreams();}
  function initStreams(){
    streams.length=0;
    for(let i=0;i<5;i++){
      const pts=[];
      const base=H*(0.2+i*0.15);
      for(let x=0;x<W;x+=4) pts.push({x,y:base,vy:0});
      streams.push({pts,color:`rgba(44,184,160,${0.3-i*0.04})`,phase:Math.random()*Math.PI*2,freq:0.5+i*0.2,amp:15-i*2});
    }
  }
  function draw(){
    t+=0.02;
    ctx.fillStyle='rgba(14,12,8,0.07)';
    ctx.fillRect(0,0,W,H);
    // Draw streams
    streams.forEach(s=>{
      ctx.beginPath();
      s.pts.forEach((p,i)=>{
        p.y=H*(0.2+streams.indexOf(s)*0.15)+Math.sin(t*s.freq+i*0.1+s.phase)*s.amp;
        if(i===0) ctx.moveTo(p.x,p.y);
        else ctx.lineTo(p.x,p.y);
      });
      ctx.strokeStyle=s.color;
      ctx.lineWidth=1;
      ctx.stroke();
    });
    // Metric cards floating
    const metrics=[
      {label:'Followers',val:Math.floor(12400+Math.sin(t*0.3)*200),x:W*0.2,y:H*0.78},
      {label:'Engagement',val:(4.2+Math.sin(t*0.2)*0.3).toFixed(1)+'%',x:W*0.5,y:H*0.82},
      {label:'Velocity',val:Math.floor(380+Math.sin(t*0.4)*40)+'/hr',x:W*0.78,y:H*0.76}
    ];
    metrics.forEach(m=>{
      ctx.fillStyle='rgba(14,12,8,0.8)';
      ctx.strokeStyle='rgba(44,184,160,0.3)';
      ctx.lineWidth=0.5;
      ctx.beginPath();
      ctx.rect(m.x-42,m.y-20,84,36);
      ctx.fill();
      ctx.stroke();
      ctx.font='8px DM Mono';
      ctx.fillStyle='rgba(44,184,160,0.6)';
      ctx.textAlign='center';
      ctx.fillText(m.label,m.x,m.y-7);
      ctx.font='bold 11px Syne,sans-serif';
      ctx.fillStyle='rgba(245,240,232,0.85)';
      ctx.fillText(m.val,m.x,m.y+8);
    });
    requestAnimationFrame(draw);
  }
  window.addEventListener('resize',resize);
  resize(); draw();
})();

// ── CONFERENCE CANVAS: Scattered data particles ──
(function(){
  const c=document.getElementById('conf-canvas');
  const ctx=c.getContext('2d');
  let W,H,t=0,pts=[];
  function resize(){W=c.width=c.offsetWidth;H=c.height=c.offsetHeight;
    pts=[]; for(let i=0;i<40;i++) pts.push({x:Math.random()*W,y:Math.random()*H,v:Math.random()*0.2+0.05});}
  function draw(){
    t+=0.01;
    ctx.fillStyle='rgba(14,12,8,0.04)';
    ctx.fillRect(0,0,W,H);
    pts.forEach(p=>{
      p.y-=p.v; if(p.y<0){p.y=H;p.x=Math.random()*W;}
      const a=0.1+Math.sin(t+p.x*0.01)*0.05;
      ctx.beginPath(); ctx.arc(p.x,p.y,1,0,Math.PI*2);
      ctx.fillStyle=`rgba(212,168,67,${a})`; ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  window.addEventListener('resize',resize); resize(); draw();
})();

// ── CONTACT CANVAS: Pulsing grid ──
(function(){
  const c=document.getElementById('contact-canvas');
  const ctx=c.getContext('2d');
  let W,H,t=0;
  function resize(){W=c.width=c.offsetWidth;H=c.height=c.offsetHeight;}
  function draw(){
    t+=0.008;
    ctx.clearRect(0,0,W,H);
    const spacing=60;
    for(let x=0;x<W;x+=spacing){
      for(let y=0;y<H;y+=spacing){
        const d=Math.sqrt((x-W/2)**2+(y-H/2)**2);
        const pulse=Math.sin(t*1.5-d*0.02)*0.5+0.5;
        ctx.beginPath(); ctx.arc(x,y,1+pulse*1.5,0,Math.PI*2);
        ctx.fillStyle=`rgba(212,168,67,${0.04+pulse*0.08})`; ctx.fill();
      }
    }
    requestAnimationFrame(draw);
  }
  window.addEventListener('resize',resize); resize(); draw();
})();

(function(){
  const c = document.getElementById('galaxy-canvas');
  const ctx = c.getContext('2d');
  let W, H, stars = [];

  function resize(){
    W = c.width = c.offsetWidth;
    H = c.height = c.offsetHeight;

    stars = [];
    for(let i=0;i<120;i++){
      stars.push({
        x: Math.random()*W,
        y: Math.random()*H,
        r: Math.random()*1.5,
        speed: Math.random()*0.3 + 0.05
      });
    }
  }

  function draw(){
    ctx.fillStyle = "rgba(14,12,8,0.4)";
    ctx.fillRect(0,0,W,H);

    stars.forEach(s=>{
      s.y += s.speed;
      if(s.y > H){
        s.y = 0;
        s.x = Math.random()*W;
      }

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
      ctx.fillStyle = "rgba(212,168,67,0.8)";
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  draw();
})();
