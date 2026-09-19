const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 8);
  });

  const toggle = document.getElementById('navToggle');
  const links = document.querySelector('.nav-links');
  toggle.addEventListener('click', () => {
    const open = links.style.display === 'flex';
    links.style.display = open ? 'none' : 'flex';
    if(!open){
      links.style.cssText = 'display:flex; flex-direction:column; position:absolute; top:72px; left:0; right:0; background:#fff; padding:20px 32px; border-bottom:1px solid #E4E1F0; gap:18px;';
    }
  });

  // Nav dropdowns (myBivy / Resources / Log in) -- click-toggle so it works
  // the same on touch and mouse, instead of a hover-only panel.
  document.querySelectorAll('.nav-dd-trigger').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const dd = btn.closest('.nav-dd');
      const wasOpen = dd.classList.contains('open');
      document.querySelectorAll('.nav-dd.open').forEach((o) => o.classList.remove('open'));
      if(!wasOpen) dd.classList.add('open');
    });
  });
  document.addEventListener('click', () => {
    document.querySelectorAll('.nav-dd.open').forEach((o) => o.classList.remove('open'));
  });

  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  revealEls.forEach(el => io.observe(el));

  // Team interest modal
  function openTeamModal(){
    const overlay = document.getElementById('teamModalOverlay');
    if(overlay) overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeTeamModal(){
    const overlay = document.getElementById('teamModalOverlay');
    if(overlay) overlay.classList.remove('open');
    document.body.style.overflow = '';
  }
  window.openTeamModal = openTeamModal;
  window.closeTeamModal = closeTeamModal;

  const teamOverlay = document.getElementById('teamModalOverlay');
  if(teamOverlay){
    teamOverlay.addEventListener('click', (e) => {
      if(e.target === teamOverlay) closeTeamModal();
    });
  }

  // Careers modal
  function openCareersModal(){
    const overlay = document.getElementById('careersModalOverlay');
    if(overlay) overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeCareersModal(){
    const overlay = document.getElementById('careersModalOverlay');
    if(overlay) overlay.classList.remove('open');
    document.body.style.overflow = '';
  }
  window.openCareersModal = openCareersModal;
  window.closeCareersModal = closeCareersModal;

  const careersOverlay = document.getElementById('careersModalOverlay');
  if(careersOverlay){
    careersOverlay.addEventListener('click', (e) => {
      if(e.target === careersOverlay) closeCareersModal();
    });
  }

  // Contact modal
  function openContactModal(){
    const overlay = document.getElementById('contactModalOverlay');
    if(overlay) overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeContactModal(){
    const overlay = document.getElementById('contactModalOverlay');
    if(overlay) overlay.classList.remove('open');
    document.body.style.overflow = '';
  }
  window.openContactModal = openContactModal;
  window.closeContactModal = closeContactModal;

  const contactOverlay = document.getElementById('contactModalOverlay');
  if(contactOverlay){
    contactOverlay.addEventListener('click', (e) => {
      if(e.target === contactOverlay) closeContactModal();
    });
  }

  const teamForm = document.getElementById('teamForm');
  if(teamForm){
    teamForm.addEventListener('submit', function(e){
      e.preventDefault();
      const data = new FormData(teamForm);
      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(data).toString(),
      })
        .then(() => {
          document.getElementById('teamModalForm').style.display = 'none';
          document.getElementById('teamModalSuccess').style.display = 'block';
        })
        .catch(() => {
          document.getElementById('teamModalForm').style.display = 'none';
          document.getElementById('teamModalSuccess').style.display = 'block';
        });
    });
  }

  // Topographic contour-line backgrounds (canvas-drawn, matches the redesign mockup).
  // Draws layered elevation-ring shapes around 1-2 "peak" points; reused across the
  // hero and the dark sections with different tints/peaks.
  (function(){
    function cssVar(name, fallback){
      const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
      return v || fallback;
    }
    function hexToRgb(hex){
      const h = hex.replace('#','');
      const n = parseInt(h.length===3 ? h.split('').map(c=>c+c).join('') : h, 16);
      return [(n>>16)&255, (n>>8)&255, n&255];
    }
    const ropeDeepRgb = hexToRgb(cssVar('--rope-deep', '#B94B2C'));
    const creamRgb = [255, 224, 179];

    function drawContours(canvas, opts){
      if(!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      function size(){
        const r = canvas.getBoundingClientRect();
        canvas.width = Math.max(1, Math.round(r.width * dpr));
        canvas.height = Math.max(1, Math.round(r.height * dpr));
      }
      size();
      const ctx = canvas.getContext('2d');

      function draw(){
        const w = canvas.width, h = canvas.height;
        ctx.clearRect(0, 0, w, h);
        ctx.lineWidth = (opts.lineWidth || 1.1) * dpr;
        opts.peaks.forEach(function(peak){
          const cx = peak.x * w, cy = peak.y * h;
          const rings = opts.rings || 15;
          for(let i = 1; i <= rings; i++){
            const base = (opts.spacing || 26) * dpr * i;
            ctx.beginPath();
            const steps = 120;
            for(let s = 0; s <= steps; s++){
              const t = (s / steps) * Math.PI * 2;
              const wobble =
                Math.sin(t*3 + peak.seed) * (base*0.10) +
                Math.sin(t*7 + peak.seed*1.7) * (base*0.045) +
                Math.sin(t*2 + peak.seed*0.6) * (base*0.06);
              const r = base + wobble;
              const x = cx + Math.cos(t) * r * peak.stretchX;
              const y = cy + Math.sin(t) * r * peak.stretchY;
              if(s === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            }
            ctx.closePath();
            const fade = 1 - (i / rings) * 0.75;
            const [r0,g0,b0] = opts.rgb;
            ctx.strokeStyle = `rgba(${r0},${g0},${b0},${(opts.baseAlpha * fade).toFixed(3)})`;
            ctx.stroke();
          }
        });
      }
      draw();
      let to;
      window.addEventListener('resize', function(){
        clearTimeout(to);
        to = setTimeout(function(){ size(); draw(); }, 120);
      });
    }

    drawContours(document.getElementById('topoHero'), {
      rgb: ropeDeepRgb, baseAlpha: 0.5, lineWidth: 1.3, rings: 14, spacing: 24,
      peaks: [
        { x: 0.85, y: 0.05, seed: 1.2, stretchX: 1.6, stretchY: 1.0 },
        { x: 0.1, y: 0.7, seed: 3.4, stretchX: 1.3, stretchY: 0.9 }
      ]
    });
    drawContours(document.getElementById('topoNextLevelIntro'), {
      rgb: ropeDeepRgb, baseAlpha: 0.45, lineWidth: 1.2, rings: 12, spacing: 24,
      peaks: [ { x: 0.85, y: -0.1, seed: 6.3, stretchX: 1.5, stretchY: 1.0 } ]
    });
    drawContours(document.getElementById('topoPhilosophy'), {
      rgb: creamRgb, baseAlpha: 0.16, lineWidth: 1, rings: 13, spacing: 26,
      peaks: [ { x: 0.85, y: 0.1, seed: 2.6, stretchX: 1.5, stretchY: 1.0 } ]
    });
    drawContours(document.getElementById('topoStats'), {
      rgb: creamRgb, baseAlpha: 0.14, lineWidth: 1, rings: 14, spacing: 26,
      peaks: [ { x: 0.15, y: 0.05, seed: 0.7, stretchX: 1.6, stretchY: 1.0 } ]
    });
    drawContours(document.getElementById('topoName'), {
      rgb: creamRgb, baseAlpha: 0.16, lineWidth: 1, rings: 15, spacing: 24,
      peaks: [
        { x: 0.9, y: 0.85, seed: 2.1, stretchX: 1.4, stretchY: 1.0 },
        { x: 0.12, y: 0.1, seed: 5.6, stretchX: 1.2, stretchY: 1.3 }
      ]
    });
    drawContours(document.getElementById('topoCta'), {
      rgb: creamRgb, baseAlpha: 0.18, lineWidth: 1, rings: 11, spacing: 30,
      peaks: [ { x: 0.5, y: 0.5, seed: 4.4, stretchX: 1.8, stretchY: 1.0 } ]
    });
    drawContours(document.getElementById('topoNextLevel'), {
      rgb: creamRgb, baseAlpha: 0.18, lineWidth: 1, rings: 11, spacing: 30,
      peaks: [ { x: 0.5, y: 0.5, seed: 7.1, stretchX: 1.8, stretchY: 1.0 } ]
    });
  })();
