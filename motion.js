/* ===== Motion design – Charles Marti ===== */
(() => {
    'use strict';
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    window.MOTION_VERSION = 35;
    const root = document.documentElement;
    root.classList.add('motion');

    const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
    const lite = innerWidth < 768 || (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4;
    const $ = (s, c = document) => c.querySelector(s);
    const $$ = (s, c = document) => [...c.querySelectorAll(s)];
    const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
    const restart = (el, cls) => { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); };

    const nav = $('#navbar');
    const mobileMenu = $('#mobile-menu');
    const contactDropdown = $('#contact-dropdown');

    /* ---------- Barre de progression ---------- */
    const bar = document.createElement('div');
    bar.id = 'scroll-progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.prepend(bar);

    /* ---------- Bandeau défilant sous le hero ---------- */
    const home = $('#home');
    if (home) {
        const words = ['Séminaires', 'Galas', 'Soirées étudiantes', 'Événements corporate', 'Scénographie',
            "Jusqu'à 2000 participants", 'Budget & logistique', 'Paris'];
        const words2 = ['Rigueur', 'Sensibilité', 'Précision', 'Terrain', 'Créativité', 'Sang-froid', 'Fédérateur', 'Proactif'];
        const makeGroup = list => '<div class="ticker-group">' +
            list.map(w => `<span class="ticker-item">${w}<i>✦</i></span>`).join('') + '</div>';
        const g1 = makeGroup(words), g2 = makeGroup(words2);
        const ticker = document.createElement('div');
        ticker.className = 'ticker';
        ticker.setAttribute('aria-hidden', 'true');
        ticker.innerHTML = `<div class="ticker-track">${g1}${g1}</div><div class="ticker-track rev">${g2}${g2}</div>`;
        home.after(ticker);

        // Indicateur de scroll
        const cue = document.createElement('a');
        cue.href = '#experience';
        cue.className = 'scroll-cue';
        cue.setAttribute('aria-label', 'Défiler vers les expériences');
        cue.innerHTML = '<span></span>';
        home.append(cue);
    }
    const scrollCue = $('.scroll-cue');

    /* ---------- Position du pointeur (partagée) ---------- */
    const pointer = { x: -9999, y: -9999 };
    addEventListener('pointermove', e => { pointer.x = e.clientX; pointer.y = e.clientY; }, { passive: true });

    /* ---------- Indices de cascade (listes + pastilles) ---------- */
    $$('.reveal').forEach(r => {
        $$('ul > li, .flex-wrap > span', r).forEach((el, i) => el.style.setProperty('--si', Math.min(i, 14)));
    });

    /* ---------- Logo du hero : tracé animé ---------- */
    function drawLogo() {
        const path = $('#home svg path');
        if (!path || !path.getTotalLength) return;
        path.style.setProperty('--len', Math.ceil(path.getTotalLength()));
        restart(path, 'draw');
    }
    drawLogo();

    /* ---------- Timelines qui se remplissent ---------- */
    const timelines = $$('.timeline-line').map(el => {
        const fill = document.createElement('div');
        fill.className = 'timeline-fill';
        fill.setAttribute('aria-hidden', 'true');
        el.append(fill);
        return { el, fill, dots: $$(':scope > div > div.absolute', el) };
    });

    function updateTimelines() {
        const mark = innerHeight * 0.65;
        timelines.forEach(t => {
            if (!t.el.offsetParent) return;
            const r = t.el.getBoundingClientRect();
            t.fill.style.transform = `scaleY(${clamp((mark - r.top) / r.height, 0, 1)})`;
            t.dots.forEach(d => d.classList.toggle('dot-on', d.getBoundingClientRect().top < mark));
        });
    }

    /* ---------- Parallax (fond fluide + hero) ---------- */
    const shapes = $$('.fluid-shape');
    const heroInner = $('#home > div');
    const shapeScroll = [0.05, -0.04, 0.07, -0.06];
    const shapeMouse = [24, -32, 16, -26];
    let mouseX = 0, mouseY = 0;

    function applyParallax() {
        const y = scrollY;
        shapes.forEach((s, i) => {
            s.style.translate = `${mouseX * shapeMouse[i]}px ${y * shapeScroll[i] + mouseY * shapeMouse[i]}px`;
        });
    }

    /* ---------- Scroll : tout dans un seul rAF ---------- */
    let ticking = false, lastY = scrollY;

    function frame() {
        ticking = false;
        const y = scrollY;
        const max = root.scrollHeight - innerHeight;
        bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;

        nav.classList.toggle('nav-compact', y > 40);
        if (Math.abs(y - lastY) > 6) {
            const locked = !mobileMenu.classList.contains('hidden') || !contactDropdown.classList.contains('hidden');
            nav.classList.toggle('nav-hidden', y > lastY && y > 240 && !locked);
            lastY = y;
        }

        if (heroInner && y < innerHeight * 1.2) {
            heroInner.style.translate = `0 ${y * 0.18}px`;
            heroInner.style.opacity = String(clamp(1 - y / (innerHeight * 0.9), 0, 1));
            if (scrollCue) scrollCue.style.opacity = String(clamp(1 - y / 200, 0, 1));
        }

        applyParallax();
        updateTimelines();
    }
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll);
    addEventListener('hashchange', () => { nav.classList.remove('nav-hidden'); setTimeout(onScroll, 50); });
    frame();

    /* ---------- Transitions de page ---------- */
    const staggerGallery = () => {
        $$('.gallery-item:not(.hidden)').forEach((el, i) => {
            el.style.setProperty('--i', i);
            restart(el, 'g-in');
        });
    };

    /* Rideau de transition entre pages */
    const pageIds = ['page-cv', 'page-realisations', 'page-apropos'];
    const pageLabels = { 'page-cv': 'Charles Marti', 'page-realisations': 'Mes Réalisations', 'page-apropos': 'Mon Parcours' };
    const hashPage = h => ({
        '#realisations': 'page-realisations', '#parcours': 'page-apropos'
    })[h] || 'page-cv';
    const currentPage = () => pageIds.find(id => !document.getElementById(id).classList.contains('hidden'));
    root.dataset.page = (currentPage() || 'page-cv').replace('page-', '');

    const curtain = document.createElement('div');
    curtain.className = 'curtain';
    curtain.setAttribute('aria-hidden', 'true');
    curtain.innerHTML =
        '<div class="cv-panel"></div>' +
        '<div class="cv-label">' +
        '<svg class="cv-logo" viewBox="0 0 50 50"><defs><linearGradient id="cg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#6A8CF0"/><stop offset="100%" stop-color="#DD829F"/></linearGradient></defs>' +
        '<path d="M 24,37 A 14,14 0 0,1 24,13 L 32,25 L 40,13 L 40,42" fill="none" stroke="url(#cg)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" pathLength="1"/></svg>' +
        '<span class="cv-eyebrow">Charles Marti</span>' +
        '<span class="cv-title"><span></span></span><i class="cv-line"></i></div>';
    document.body.append(curtain);
    const curtainLabel = $('.cv-title span', curtain);

    /* Voile fluide : le même fluide que le fond, qui balaie l'écran pendant le changement de page */
    function initFluidOverlay() {
        const canvas = document.createElement('canvas');
        canvas.className = 'curtain-fluid';
        const gl = canvas.getContext('webgl', { antialias: false, alpha: true, premultipliedAlpha: true, powerPreference: 'low-power' });
        if (!gl) return null;

        const vs = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
        const fs = `
precision highp float;
uniform vec2 uRes; uniform float uTime; uniform float uP; uniform float uS;
uniform vec3 uC1; uniform vec3 uC2; uniform vec3 uC3; uniform vec3 uC4; uniform vec3 uBase; uniform float uK;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1.,0.)),u.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*noise(p);p=p*2.02+vec2(5.2,1.3);a*=.5;}return v;}
float smin(float a,float b,float k){float h=max(k-abs(a-b),0.)/k;return min(a,b)-h*h*k*.25;}
float tongueCell(float i,float fx,float cols,float seed,float Lmax,float rf,float t,float y){
  float h=hash(vec2(i,seed+uS));
  float h2=hash(vec2(i*1.7+3.1,seed*2.3+uS*.7));
  float h3=hash(vec2(i*2.9+7.7,seed+uS*1.3));
  float L=(.1+pow(h,1.3)*Lmax)*(.9+.1*sin(t*2.+i*2.3+uS));
  float r=rf*(.4+h3*1.0)/cols;                  // épaisseur différente d'une coulée à l'autre
  float off=(h2-.5)*.55/cols;                   // décalage latéral aléatoire
  float dx=fx/cols-off;
  float seg=max(L-r,0.);
  return length(vec2(dx,max(y-seg,0.)))-r;      // capsule : bout rond
}
float tongue(float X,float y,float cols,float seed,float Lmax,float rf,float t){
  float x=X*cols+seed+uS*1.7; float i=floor(x); float f=fract(x);
  float d=1e3;
  for(int k=-1;k<=1;k++){ d=min(d,tongueCell(i+float(k),f-.5-float(k),cols,seed,Lmax,rf,t,y)); }
  return d;
}
float shapeA(float X,float y,float t){
  float v=fract(uS*.137);
  float a=tongue(X,y,2.8*(.86+.28*v),0.,.85,.32,t);
  float b=tongue(X,y,6.3*(.9+.2*(1.-v)),5.3,.5,.30,t);
  float c=tongue(X,y,13.,11.1,.26,.26,t);
  return smin(smin(smin(a,b,.07),c,.05),y-.06,.10);
}
void main(){
  vec2 uv=gl_FragCoord.xy/uRes; float asp=uRes.x/uRes.y;
  float t=uTime;

  // mêmes nappes marbrées que le fond, un peu plus contrastées
  vec2 p=(uv-.5)*vec2(asp,1.)*1.5;
  vec2 q=vec2(fbm(p+t*.7),fbm(p+vec2(5.2,1.3)-t*.6));
  vec2 s=vec2(fbm(p+2.*q+vec2(1.7,9.2)+t*.5),fbm(p+2.*q+vec2(8.3,2.8)-t*.45));
  float f=fbm(p+2.*s);
  vec3 col=mix(uC1,uC2,smoothstep(.3,.7,f));
  col=mix(col,uC3,smoothstep(.55,1.,length(q))*.8);
  col=mix(col,uC4,smoothstep(.55,1.,s.x)*.6);
  col=mix(uBase,col,uK);

  // le fluide coule depuis le haut : épaisses coulées à bouts ronds, raccordées comme du miel
  float X=uv.x*asp;
  float dist=1.-uv.y;
  float A=uP*2.25-1.1;
  float Xw=X+(fbm(vec2(dist*2.6,t*.5))-.45)*.10+(fbm(vec2(dist*6.,t*.8+3.))-.45)*.03;
  float sA=shapeA(Xw,dist-A,t);
  float cov1=1.-smoothstep(-.008,.008,sA);

  // retour : le fluide descend en lobes lisses et libère la page par le haut
  float lobes=((fbm(vec2(X*(1.1+.5*fract(uS*.071))+4.+uS,t*.5))-.35)*.95+(fbm(vec2(X*2.6+uS,t*.7))-.35)*.1)*(.8+.4*fract(uS*.37));
  float fldB=dist-lobes;
  float B=(uP-1.)*2.1-.6;
  float cov2=smoothstep(B-.012,B+.012,fldB);
  float cov=cov1*cov2;

  // épaisseur : assombrissement doux, liseré brillant et reflet intérieur
  col*=1.-.03*(1.-clamp(-sA/.10,0.,1.))-.03*(1.-clamp((fldB-B)/.10,0.,1.));
  float rim=exp(-pow(sA/.012,2.))+exp(-pow((fldB-B)/.012,2.));
  float gloss=exp(-pow((sA+.05)/.014,2.))+exp(-pow((fldB-B-.05)/.014,2.));
  col=mix(col,vec3(1.),clamp(rim,0.,1.)*.5+clamp(gloss,0.,1.)*.2);

  // ombre portée sous le front d'attaque
  float sh=(1.-smoothstep(0.,.12,sA))*step(0.,sA)*(1.-step(1.,uP))*.06;
  gl_FragColor=vec4(col*cov+vec3(.15,.17,.28)*sh,cov+sh);
}`;
        const sh = (type, src) => { const x = gl.createShader(type); gl.shaderSource(x, src); gl.compileShader(x); return x; };
        const prog = gl.createProgram();
        gl.attachShader(prog, sh(gl.VERTEX_SHADER, vs));
        gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, fs));
        gl.linkProgram(prog);
        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
        gl.useProgram(prog);
        gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
        const loc = gl.getAttribLocation(prog, 'a');
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
        const U = n => gl.getUniformLocation(prog, n);
        const uS = U('uS'), uRes = U('uRes'), uTime = U('uTime'), uP = U('uP'), uBase = U('uBase'), uK = U('uK'), uC = ['uC1', 'uC2', 'uC3', 'uC4'].map(U);

        const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255);
        const palettes = {
            cv:           ['#bfe8ff', '#ffc6d4', '#e6f9c2', '#fffdf8'].map(rgb),
            realisations: ['#dcd0ff', '#ffc8d8', '#bfe8ff', '#fff0d9'].map(rgb),
            apropos:      ['#c9ecc2', '#cadcff', '#ffe5c2', '#fffdf8'].map(rgb)
        };
        const palettesDark = {
            cv:           ['#1b2a52', '#3a2347', '#143a3b', '#171a22'].map(rgb),
            realisations: ['#2a2455', '#43213f', '#1b2a52', '#221d2c'].map(rgb),
            apropos:      ['#16382f', '#1b2a52', '#3a2c1e', '#171a22'].map(rgb)
        };
        const LIGHT_BASE = [.99, .985, .975], DARK_BASE = [.063, .071, .086];
        const cur = (palettes[root.dataset.page] || palettes.cv).map(c => c.slice());
        let curBase = LIGHT_BASE.slice(), curK = 0.8;

        function resize() {
            const k = lite ? 0.35 : 0.6;
            canvas.width = Math.max(2, Math.round(innerWidth * k));
            canvas.height = Math.max(2, Math.round(innerHeight * k));
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.uniform2f(uRes, canvas.width, canvas.height);
        }
        resize();
        addEventListener('resize', resize);

        // la couleur du voile est figée au début de la transition (thème et page de départ)
        const snap = () => {
            const dark = root.classList.contains('dark');
            const set = dark ? palettesDark : palettes;
            (set[root.dataset.page] || set.cv).forEach((c, i) => { cur[i] = c.slice(); });
            curBase = (dark ? DARK_BASE : LIGHT_BASE).slice();
            curK = dark ? 1.0 : 0.8;
        };
        const ease = x => 0.5 - 0.5 * Math.cos(Math.PI * x);
        let from = 0, to = 0, t0 = 0, dur = 1, p = 0, running = false;

        function draw(now) {
            const k = Math.min(1, (now - t0) / dur);
            p = from + (to - from) * ease(k);
            cur.forEach((c, i) => gl.uniform3f(uC[i], c[0], c[1], c[2]));
            gl.uniform3f(uBase, curBase[0], curBase[1], curBase[2]);
            gl.uniform1f(uK, curK);
            gl.uniform1f(uTime, now * 0.00006);
            gl.uniform1f(uP, p);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.drawArrays(gl.TRIANGLES, 0, 3);
            if (running) requestAnimationFrame(draw);
        }
        const go = (a, b, ms) => {
            from = a; to = b; dur = ms; t0 = performance.now();
            if (!running) { running = true; requestAnimationFrame(draw); }
        };

        return {
            canvas,
            freeze(v) { running = false; from = to = v; dur = 1; t0 = -1e9; requestAnimationFrame(draw); },
            set(state) {
                if (state === 'is-in') { snap(); gl.uniform1f(uS, Math.random() * 100); go(0, 1, 1100); }
                else if (state === 'is-hold') { snap(); gl.uniform1f(uS, Math.random() * 100); from = to = 1; dur = 1; t0 = performance.now(); if (!running) { running = true; requestAnimationFrame(draw); } }
                else if (state === 'is-out') go(1, 2, 1100);
                else { running = false; p = 0; from = to = 0; }
            }
        };
    }
    const fluidFx = initFluidOverlay();
    window.__fluidFx = fluidFx;
    if (fluidFx) curtain.prepend(fluidFx.canvas);


    let busy = false, pendingCover = false, pendingHash = null;
    const setCurtain = (state, label) => {
        if (label) curtainLabel.textContent = label;
        curtain.className = 'curtain' + (fluidFx ? ' gl' : '') + (state ? ' ' + state : '');
        if (fluidFx) fluidFx.set(state);
    };
    const uncover = () => {
        setCurtain('is-out');
        setTimeout(() => { setCurtain(''); busy = false; }, 1200);
    };

    document.addEventListener('click', e => {
        if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        const a = e.target.closest('a[href^="#"]');
        if (!a) return;
        const h = a.getAttribute('href');
        if (h === '#') return;
        if (busy) {
            if (pendingCover) { e.preventDefault(); pendingHash = h; curtainLabel.textContent = pageLabels[hashPage(h)]; }
            return;
        }
        const target = hashPage(h);
        if (target === currentPage()) return;
        e.preventDefault();
        busy = true; pendingCover = true;
        setCurtain('is-in', pageLabels[target]);
        pageIds.forEach(id => document.getElementById(id).classList.toggle('page-leave', id === currentPage()));
        pendingHash = h;
        setTimeout(() => {
            location.hash = pendingHash;
            if (hashPage(pendingHash) === currentPage() && pendingCover) { pendingCover = false; uncover(); }
        }, 1200);
        setTimeout(() => { if (pendingCover) { pendingCover = false; uncover(); } }, 3000); // garde-fou
    }, true);

    let burst = () => {};

    $$('#page-cv, #page-realisations, #page-apropos').forEach(page => {
        let wasHidden = page.classList.contains('hidden');
        new MutationObserver(() => {
            const isHidden = page.classList.contains('hidden');
            if (wasHidden && !isHidden) {
                const curtained = pendingCover;
                pageIds.forEach(id => document.getElementById(id).classList.remove('page-leave'));
                page.style.animationDelay = curtained ? '.7s' : '';
                restart(page, 'page-enter');
                const newTint = page.id.replace('page-', '');
                if (fluidFx && (curtained || !busy)) setTimeout(() => { root.dataset.page = newTint; }, 1500);
                else root.dataset.page = newTint;
                burst();
                window.scrollTo({ top: 0, behavior: 'instant' });
                if (page.id === 'page-cv') drawLogo();
                if (page.id === 'page-realisations') staggerGallery();
                if (curtained) {
                    pendingCover = false;
                    setTimeout(uncover, 420);
                } else if (!busy) { // retour navigateur : rideau express
                    busy = true;
                    setCurtain('is-hold', pageLabels[page.id]);
                    void curtain.offsetWidth;
                    requestAnimationFrame(() => { uncover(); });
                }
                setTimeout(onScroll, 50);
            }
            wasHidden = isHidden;
        }).observe(page, { attributes: true, attributeFilter: ['class'] });
        page.addEventListener('animationend', e => {
            if (e.target === page) page.classList.remove('page-enter');
        });
    });

    window.__staggerGallery = staggerGallery;
    document.addEventListener('click', e => { if (e.target.closest('.filter-btn')) requestAnimationFrame(staggerGallery); });

    /* ---------- Modale ---------- */
    const modalImg = $('#modal-image');
    const modalCaption = $('#modal-caption');
    const modalVideo = $('#modal-video');
    const modalVideoBox = $('#modal-video-container');
    if (modalImg) new MutationObserver(() => { if (modalImg.getAttribute('src')) restart(modalImg, 'pop-in'); })
        .observe(modalImg, { attributes: true, attributeFilter: ['src'] });
    if (modalVideo) new MutationObserver(() => { if (modalVideo.getAttribute('src')) restart(modalVideoBox, 'pop-in'); })
        .observe(modalVideo, { attributes: true, attributeFilter: ['src'] });
    if (modalCaption) new MutationObserver(() => restart(modalCaption, 'fade-up'))
        .observe(modalCaption, { childList: true });

    /* ---------- Icône du menu mobile ---------- */
    const menuBtn = $('#mobile-menu-btn');
    if (menuBtn) {
        let open = menuBtn.getAttribute('aria-expanded') === 'true';
        new MutationObserver(() => {
            const now = menuBtn.getAttribute('aria-expanded') === 'true';
            if (now === open) return;
            open = now;
            const icon = $('i', menuBtn);
            icon.className = now ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
            restart(icon, 'icon-spin');
        }).observe(menuBtn, { attributes: true, attributeFilter: ['aria-expanded'] });
    }

    /* ---------- Fond fluide WebGL : couleurs qui se mélangent ---------- */
    (function initFluid() {
        const host = $('.fluid-container');
        if (!host) return;
        const canvas = document.createElement('canvas');
        canvas.className = 'bg-canvas';
        const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
        if (!gl) return; // repli : les bulles CSS d'origine restent affichées

        const vs = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
        const fs = `
precision mediump float;
uniform vec2 uRes; uniform float uTime; uniform vec2 uMouse; uniform float uScroll;
uniform vec3 uC1; uniform vec3 uC2; uniform vec3 uC3; uniform vec3 uC4; uniform vec3 uBase; uniform float uK;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1.,0.)),u.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*noise(p);p=p*2.02+vec2(5.2,1.3);a*=.5;}return v;}
void main(){
  vec2 uv=gl_FragCoord.xy/uRes; float asp=uRes.x/uRes.y;
  vec2 p=(uv-.5)*vec2(asp,1.)*1.5; p.y+=uScroll;
  vec2 m=(uMouse-.5)*vec2(asp,1.)*1.5; m.y+=uScroll;
  vec2 d=p-m; float r=length(d);
  p+=vec2(-d.y,d.x)*exp(-r*r*3.5)*.55;           // le curseur remue le fluide
  float t=uTime;
  vec2 q=vec2(fbm(p+t*.7),fbm(p+vec2(5.2,1.3)-t*.6));
  vec2 s=vec2(fbm(p+2.*q+vec2(1.7,9.2)+t*.5),fbm(p+2.*q+vec2(8.3,2.8)-t*.45));
  float f=fbm(p+2.*s);
  vec3 col=mix(uC1,uC2,smoothstep(.3,.7,f));
  col=mix(col,uC3,smoothstep(.55,1.,length(q))*.8);
  col=mix(col,uC4,smoothstep(.55,1.,s.x)*.6);
  col=mix(uBase,col,uK);
  gl_FragColor=vec4(col,1.);
}`;
        const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
        const prog = gl.createProgram();
        gl.attachShader(prog, sh(gl.VERTEX_SHADER, vs));
        gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, fs));
        gl.linkProgram(prog);
        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
        gl.useProgram(prog);

        gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
        const loc = gl.getAttribLocation(prog, 'a');
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

        const U = n => gl.getUniformLocation(prog, n);
        const uRes = U('uRes'), uTime = U('uTime'), uMouse = U('uMouse'), uScroll = U('uScroll');
        const uC = [U('uC1'), U('uC2'), U('uC3'), U('uC4')], uBase = U('uBase'), uK = U('uK');

        const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255);
        const palettes = {
            cv:           ['#bfe8ff', '#ffc6d4', '#e6f9c2', '#fffdf8'].map(rgb),
            realisations: ['#dcd0ff', '#ffc8d8', '#bfe8ff', '#fff0d9'].map(rgb),
            apropos:      ['#c9ecc2', '#cadcff', '#ffe5c2', '#fffdf8'].map(rgb)
        };
        const palettesDark = {
            cv:           ['#1b2a52', '#3a2347', '#143a3b', '#171a22'].map(rgb),
            realisations: ['#2a2455', '#43213f', '#1b2a52', '#221d2c'].map(rgb),
            apropos:      ['#16382f', '#1b2a52', '#3a2c1e', '#171a22'].map(rgb)
        };
        const LIGHT_BASE = [.99, .985, .975], DARK_BASE = [.063, .071, .086];
        const startDark = root.classList.contains('dark');
        const cur = (startDark ? palettesDark : palettes)[root.dataset.page] || palettes.cv;
        const current = cur.map(c => c.slice());
        const baseNow = (startDark ? DARK_BASE : LIGHT_BASE).slice();
        let kNow = startDark ? 0.92 : 0.68;

        function resize() {
            const k = lite ? 0.25 : 0.4; // rendu basse résolution : le flou est naturel, le GPU respire
            canvas.width = Math.max(2, Math.round(innerWidth * k));
            canvas.height = Math.max(2, Math.round(innerHeight * k));
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.uniform2f(uRes, canvas.width, canvas.height);
        }
        resize();
        addEventListener('resize', resize);
        host.append(canvas);
        host.classList.add('gl-on');

        let tAcc = 0, last = performance.now(), pulse = 0, mx = 0.5, my = 0.5;
        burst = () => { pulse = 1; };

        let skip = false;
        function frame(now) {
            if (lite && (skip = !skip)) { requestAnimationFrame(frame); return; } // 30 i/s en mode allégé
            const dt = Math.min(0.05, (now - last) / 1000);
            last = now;
            tAcc += dt * 0.08 * (1 + pulse * 10);
            pulse *= 0.96;

            if (pointer.x > -999) {
                mx += (pointer.x / innerWidth - mx) * 0.06;
                my += ((1 - pointer.y / innerHeight) - my) * 0.06;
            }
            const dark = root.classList.contains('dark');
            const set = dark ? palettesDark : palettes;
            const target = set[root.dataset.page] || set.cv;
            const baseT = dark ? DARK_BASE : LIGHT_BASE;
            const spd = 0.05;
            current.forEach((c, i) => c.forEach((_, k) => { c[k] += (target[i][k] - c[k]) * spd; }));
            baseNow.forEach((_, k) => { baseNow[k] += (baseT[k] - baseNow[k]) * spd; });
            kNow += ((dark ? 0.92 : 0.68) - kNow) * spd;
            current.forEach((c, i) => gl.uniform3f(uC[i], c[0], c[1], c[2]));
            gl.uniform3f(uBase, baseNow[0], baseNow[1], baseNow[2]);
            gl.uniform1f(uK, kNow);

            gl.uniform1f(uTime, tAcc);
            gl.uniform2f(uMouse, mx, my);
            gl.uniform1f(uScroll, scrollY * 0.0004);
            gl.drawArrays(gl.TRIANGLES, 0, 3);
            requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
    })();

    /* ---------- Cartes : le contenu se décale en profondeur au survol (3D) ---------- */
    $$('.modern-card:not(.form-card)').forEach(card => {
        $$('h4, h5', card).forEach(el => el.classList.add('z2'));
        $$('span.uppercase, p.font-bold', card).forEach(el => el.classList.add('z3'));
        $$('.w-14', card).forEach(el => el.classList.add('z3'));
        $$('[class*="lg:w-1/3"] > p, p.text-xs, [class*="lg:w-2/3"] > div.mt-6', card).forEach(el => el.classList.add('z1'));
    });
    /* ---------- Modale : le retournement 3D suit le sens de navigation ---------- */
    const flipDir = d => { [$('#modal-image'), $('#modal-video-container')].forEach(el => el && el.style.setProperty('--dir', d)); };
    $('#modal-prev') && $('#modal-prev').addEventListener('click', () => flipDir(1), true);
    $('#modal-next') && $('#modal-next').addEventListener('click', () => flipDir(-1), true);
    document.addEventListener('keydown', e => {
        if (e.key === 'ArrowLeft') flipDir(1);
        if (e.key === 'ArrowRight') flipDir(-1);
    }, true);

    /* ---------- Chiffres clés qui se comptent (1200, 2000 dans les expériences) ---------- */
    (function counters() {
        const spans = [];
        $$('#experience li').forEach(li => {
            if (!/\b(1200|2000)\b/.test(li.textContent)) return;
            // le texte de la ligne devient un seul bloc flex (la puce reste à part)
            const bullet = li.firstElementChild;
            const body = document.createElement('span');
            while (bullet && bullet.nextSibling) body.append(bullet.nextSibling);
            li.append(body);
            const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT);
            const nodes = [];
            while (walker.nextNode()) if (/\b(1200|2000)\b/.test(walker.currentNode.nodeValue)) nodes.push(walker.currentNode);
            nodes.forEach(n => {
                const frag = document.createDocumentFragment();
                n.nodeValue.split(/\b(1200|2000)\b/).forEach(part => {
                    if (part === '1200' || part === '2000') {
                        const s = document.createElement('span');
                        s.className = 'count'; s.dataset.to = part; s.textContent = part;
                        frag.append(s); spans.push(s);
                    } else frag.append(document.createTextNode(part));
                });
                n.replaceWith(frag);
            });
        });
        $$('#page-apropos .count[data-to]').forEach(s => spans.push(s));
        const io = new IntersectionObserver(es => es.forEach(e => {
            if (!e.isIntersecting) return;
            io.unobserve(e.target);
            const to = +e.target.dataset.to, suffix = e.target.dataset.suffix || '', t0 = performance.now();
            (function tick(now) {
                const k = Math.min(1, (now - t0) / 1500);
                e.target.textContent = String(Math.round(to * (1 - Math.pow(1 - k, 3)))) + suffix;
                if (k < 1) requestAnimationFrame(tick);
            })(t0);
        }), { threshold: 0.8 });
        spans.forEach(s => io.observe(s));
    })();
    /* ---------- Interactions souris (écrans précis uniquement) ---------- */
    if (!fine) return;

    // Titre du hero : le relief suit la souris
    const heroTitle = $('#home h1');
    if (heroTitle) addEventListener('pointermove', e => {
        heroTitle.style.setProperty('--tx', ((e.clientX / innerWidth) * 2 - 1).toFixed(3));
        heroTitle.style.setProperty('--ty', ((e.clientY / innerHeight) * 2 - 1).toFixed(3));
    }, { passive: true });
    // Boutons magnétiques
    $$('#home a.rounded-full, #navbar .contact-btn, #navbar a[download], footer a.rounded-full, .filter-btn').forEach(el => {
        el.classList.add('magnetic');
        el.addEventListener('pointermove', e => {
            const r = el.getBoundingClientRect();
            const x = (e.clientX - r.left - r.width / 2) * 0.25;
            const y = (e.clientY - r.top - r.height / 2) * 0.35;
            el.style.translate = `${x}px ${y}px`;
        });
        el.addEventListener('pointerleave', () => { el.style.translate = ''; });
    });

    // Cartes : tilt 3D + halo (aussi pour les tuiles de la galerie créées après le chargement)
    const bindTilt = card => {
        if (card.dataset.tilt !== undefined) return;
        card.setAttribute('data-tilt', '');
        card.addEventListener('pointermove', e => {
            const r = card.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width;
            const py = (e.clientY - r.top) / r.height;
            const amp = card.classList.contains('gallery-item') ? 3 : (r.width > 600 ? 2.6 : 5);
            card.style.setProperty('--mx', `${e.clientX - r.left}px`);
            card.style.setProperty('--my', `${e.clientY - r.top}px`);
            card.style.setProperty('--px', String((px - 0.5) * 2));
            card.style.setProperty('--py', String((py - 0.5) * 2));
            card.style.setProperty('--ry', `${(px - 0.5) * amp * 2}deg`);
            card.style.setProperty('--rx', `${-(py - 0.5) * amp * 2}deg`);
        });
        card.addEventListener('pointerleave', () => {
            card.style.removeProperty('--rx');
            card.style.removeProperty('--ry');
            card.style.removeProperty('--px');
            card.style.removeProperty('--py');
        });
    };
    $$('.modern-card:not(.form-card), .gallery-item').forEach(bindTilt);
    const galleryHost = $('#gallery-grid');
    if (galleryHost) new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => {
        if (n.nodeType === 1 && n.classList.contains('gallery-item')) bindTilt(n);
    }))).observe(galleryHost, { childList: true });

    // Souris : parallax du fond de repli (si WebGL indisponible)
    (function loop() {
        mouseX += ((pointer.x / innerWidth - 0.5) - mouseX) * 0.05;
        mouseY += ((pointer.y / innerHeight - 0.5) - mouseY) * 0.05;
        if (!document.querySelector('.gl-on')) applyParallax();
        requestAnimationFrame(loop);
    })();
})();
