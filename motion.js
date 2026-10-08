/* ===== Motion design – Charles Marti ===== */
(() => {
    'use strict';
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    window.MOTION_VERSION = 45;
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
    addEventListener('pointermove', e => { pointer.x = e.clientX; pointer.y = e.clientY; pointer.t = performance.now(); }, { passive: true });
    const touchPos = e => { const t = e.touches && e.touches[0]; if (t) { pointer.x = t.clientX; pointer.y = t.clientY; pointer.t = performance.now(); } };
    addEventListener('touchstart', touchPos, { passive: true });
    addEventListener('touchmove', touchPos, { passive: true });

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
    const startDraw = () => requestAnimationFrame(() => requestAnimationFrame(drawLogo));
    if (document.readyState === 'complete') startDraw(); else addEventListener('load', startDraw, { once: true });

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
    const cssHero = !!(window.CSS && CSS.supports && CSS.supports('animation-timeline', 'scroll()'));
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
            if (!cssHero) heroInner.style.opacity = String(clamp(1 - y / (innerHeight * 0.9), 0, 1)); // sinon : CSS (voir motion.css)
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
float hash(vec2 p){vec3 p3=fract(vec3(p.xyx)*.1031);p3+=dot(p3,p3.yzx+33.33);return fract((p3.x+p3.y)*p3.z);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1.,0.)),u.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*noise(p);p=p*2.02+vec2(5.2,1.3);a*=.5;}return v;}
float gT, gAsp, gA, gB;

// ondulation de la vague : trois houles de tailles différentes + une variation organique ; la phase suit la progression
float wave(float X,float seed,float ph){
  return .10*sin(X*3.4+ph+seed)
       + .055*sin(X*6.3-ph*1.4+seed*2.1)
       + .022*sin(X*11.+ph*2.2+seed*.7)
       + (fbm(vec2(X*1.3+seed,ph*.2))-.45)*.12;
}

// distance signée au fluide : positive à l'intérieur ; la vague monte du bas, puis continue pour libérer la page
float metric(vec2 uv){
  float X=uv.x*gAsp;
  float m1=(gA+wave(X,uS,uP*4.))-uv.y;                 // crête qui avance
  float m2=uv.y-(gB+wave(X,uS+17.,uP*3.2+2.));         // bord de fuite
  return min(m1,m2);
}
// épaisseur du liquide : profil en dôme près des bords
float domeH(float m){ float k=clamp(m/.14,0.,1.); return sqrt(max(0.,1.-(1.-k)*(1.-k)))*.14; }

void main(){
  vec2 uv=gl_FragCoord.xy/uRes;
  gAsp=uRes.x/uRes.y; gT=uTime; gA=uP*1.6-.3; gB=(uP-1.)*1.6-.3;

  float m=metric(uv);
  if(m<-.13){ gl_FragColor=vec4(0.); return; }

  // relief : la normale se déduit de la variation d'épaisseur
  vec3 n=vec3(0.,0.,1.);
  if(m<.25){
    float e=1.6/uRes.y;
    float hx=domeH(metric(uv+vec2(e,0.)))-domeH(metric(uv-vec2(e,0.)));
    float hy=domeH(metric(uv+vec2(0.,e)))-domeH(metric(uv-vec2(0.,e)));
    n=normalize(vec3(-hx/(2.*e)*.9,-hy/(2.*e)*.9,1.));
  }

  // mêmes nappes marbrées que le fond ; la réfraction déforme les couleurs vues à travers le liquide
  vec2 p=(uv-.5)*vec2(gAsp,1.)*1.5+n.xy*.35;
  float t=gT;
  vec2 q=vec2(fbm(p+t*.7),fbm(p+vec2(5.2,1.3)-t*.6));
  vec2 s=vec2(fbm(p+2.*q+vec2(1.7,9.2)+t*.5),fbm(p+2.*q+vec2(8.3,2.8)-t*.45));
  float f=fbm(p+2.*s);
  vec3 col=mix(uC1,uC2,smoothstep(.3,.7,f));
  col=mix(col,uC3,smoothstep(.55,1.,length(q))*.8);
  col=mix(col,uC4,smoothstep(.55,1.,s.x)*.6);
  col=mix(uBase,col,uK);

  // rides : de fines vagues successives derrière la crête, qui s'estompent en profondeur
  float ripple=sin(m*42.-uP*9.)*smoothstep(.45,.0,m)*smoothstep(-.02,.03,m);
  col*=1.+.05*ripple;

  // lumière : ombrage doux, reflet brillant, bord irisé, transparence aux endroits fins
  vec3 L=normalize(vec3(-.45,.7,.55));
  col*=mix(.9,1.08,clamp(dot(n,L),0.,1.));
  float spec=pow(max(reflect(-L,n).z,0.),26.);
  float fres=pow(1.-n.z,2.2);
  vec3 irid=.5+.5*cos(6.2831*(vec3(0.,.33,.67)+fres*1.1+uv.y*.4+t*.3));
  col=mix(col,irid,fres*.3);
  col+=spec*.5;

  // écume sur la crête
  float nz=fbm(vec2(uv.x*14.+uP*3.,uv.y*38.));
  float foam=(1.-clamp(m/.075,0.,1.))*(.45+1.1*nz);
  col=mix(col,vec3(1.),clamp(foam,0.,1.)*.6);

  float cov=smoothstep(-.006,.006,m);
  // ombre portée au-dessus de la crête qui monte
  float sh=(1.-smoothstep(0.,.12,-m))*step(m,0.)*(1.-step(1.,uP))*.07;
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
            const k = lite ? 0.45 : 0.85;
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

    /* ---------- Fond fluide WebGL : couleurs qui se mélangent, avec mémoire du passage ---------- */
    (function initFluid() {
        const host = $('.fluid-container');
        if (!host) return;
        const canvas = document.createElement('canvas');
        canvas.className = 'bg-canvas';
        const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
        if (!gl) return; // repli : les bulles CSS d'origine restent affichées

        const hp = gl.getShaderPrecisionFormat && gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
        const highp = !!(hp && hp.precision > 0);
        const PREC = highp ? 'precision highp float;' : 'precision mediump float;';
        const vs = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';

        /* Le déplacement laissé par le curseur est stocké sur 16 bits (2 canaux par axe), lu avec une interpolation manuelle :
           c'est précis et ça marche sur tous les appareils, sans textures flottantes. */
        const LIB = `
const float MAXD=.35;
vec2 decodeTex(vec4 c){
  float qx=floor(c.r*255.+.5)*256.+floor(c.g*255.+.5);
  float qy=floor(c.b*255.+.5)*256.+floor(c.a*255.+.5);
  return ((vec2(qx,qy)/65535.)-.5)*2.*MAXD;
}
vec4 encodeTex(vec2 v){
  vec2 q=floor(clamp(v/MAXD*.5+.5,0.,1.)*65535.+.5);
  vec2 hi=floor(q/256.); vec2 lo=q-hi*256.;
  return vec4(hi.x,lo.x,hi.y,lo.y)/255.;
}
vec2 sampleD(sampler2D tex,vec2 uv,vec2 size){
  vec2 p=uv*size-.5; vec2 i=floor(p); vec2 f=p-i;
  vec2 a=decodeTex(texture2D(tex,(i+.5)/size));
  vec2 b=decodeTex(texture2D(tex,(i+vec2(1.5,.5))/size));
  vec2 c=decodeTex(texture2D(tex,(i+vec2(.5,1.5))/size));
  vec2 d=decodeTex(texture2D(tex,(i+1.5)/size));
  return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);
}`;

        const fsDisplay = `
${PREC}
uniform vec2 uRes; uniform float uTime; uniform float uScroll;
uniform vec3 uC1; uniform vec3 uC2; uniform vec3 uC3; uniform vec3 uC4; uniform vec3 uBase; uniform float uK;
uniform sampler2D uSim; uniform vec2 uSimSize; uniform float uSimOn;
${LIB}
float hash(vec2 p){vec3 p3=fract(vec3(p.xyx)*.1031);p3+=dot(p3,p3.yzx+33.33);return fract((p3.x+p3.y)*p3.z);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1.,0.)),u.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*noise(p);p=p*2.02+vec2(5.2,1.3);a*=.5;}return v;}
void main(){
  vec2 uv=gl_FragCoord.xy/uRes; float asp=uRes.x/uRes.y;
  vec2 p=(uv-.5)*vec2(asp,1.)*1.5; p.y+=uScroll;
  if(uSimOn>.5){
    vec2 off=sampleD(uSim,uv,uSimSize);            // trace laissée par le curseur / le doigt
    p-=off*vec2(asp,1.)*1.5*4.2;                    // les couleurs sont entraînées puis se mélangent
  }
  float t=uTime;
  vec2 q=vec2(fbm(p+t*.7),fbm(p+vec2(5.2,1.3)-t*.6));
  vec2 s=vec2(fbm(p+2.*q+vec2(1.7,9.2)+t*.5),fbm(p+2.*q+vec2(8.3,2.8)-t*.45));
  float f=fbm(p+2.*s);
  f=clamp((f-.5)*1.5+.5,0.,1.);                    // contraste : les nappes se distinguent mieux
  vec3 col=mix(uC1,uC2,smoothstep(.3,.7,f));
  col=mix(col,uC3,smoothstep(.45,.95,length(q))*.85);
  col=mix(col,uC4,smoothstep(.5,.95,s.x)*.7);
  col=mix(uBase,col,uK);
  gl_FragColor=vec4(col,1.);
}`;

        /* Simulation : à chaque image, le déplacement est entraîné par lui-même (advection), légèrement diffusé,
           atténué, puis augmenté là où passe le curseur. */
        const fsSim = `
precision highp float;
uniform sampler2D uPrev; uniform vec2 uSimSize; uniform vec2 uPtr; uniform vec2 uVel;
uniform float uAsp; uniform float uDecay; uniform float uRad; uniform float uAdv;
${LIB}
void main(){
  vec2 uv=gl_FragCoord.xy/uSimSize;
  vec2 d=sampleD(uPrev,uv,uSimSize);
  vec2 src=uv-d*uAdv;
  vec2 e=1./uSimSize;
  vec2 c0=sampleD(uPrev,src,uSimSize);
  vec2 n=(sampleD(uPrev,src+vec2(e.x,0.),uSimSize)+sampleD(uPrev,src-vec2(e.x,0.),uSimSize)
         +sampleD(uPrev,src+vec2(0.,e.y),uSimSize)+sampleD(uPrev,src-vec2(0.,e.y),uSimSize))*.25;
  vec2 v=mix(c0,n,.25)*uDecay;                      // diffusion + atténuation lente
  vec2 dp=(uv-uPtr)*vec2(uAsp,1.);
  v+=uVel*exp(-dot(dp,dp)/(uRad*uRad));            // le curseur pousse le fluide
  gl_FragColor=encodeTex(clamp(v,-vec2(MAXD),vec2(MAXD)));
}`;

        const compile = (type, src) => {
            const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
            return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
        };
        const link = (fsSrc) => {
            const v = compile(gl.VERTEX_SHADER, vs), f = compile(gl.FRAGMENT_SHADER, fsSrc);
            if (!v || !f) return null;
            const p = gl.createProgram();
            gl.attachShader(p, v); gl.attachShader(p, f); gl.linkProgram(p);
            return gl.getProgramParameter(p, gl.LINK_STATUS) ? p : null;
        };
        const progDisp = link(fsDisplay);
        if (!progDisp) return;
        const progSim = highp ? link(fsSim) : null;

        gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
        [progDisp, progSim].forEach(p => {
            if (!p) return;
            gl.useProgram(p);
            const l = gl.getAttribLocation(p, 'a');
            gl.enableVertexAttribArray(l);
            gl.vertexAttribPointer(l, 2, gl.FLOAT, false, 0, 0);
        });

        const UD = n => gl.getUniformLocation(progDisp, n);
        const dRes = UD('uRes'), dTime = UD('uTime'), dScroll = UD('uScroll'), dBase = UD('uBase'), dK = UD('uK');
        const dC = [UD('uC1'), UD('uC2'), UD('uC3'), UD('uC4')];
        const dSim = UD('uSim'), dSimSize = UD('uSimSize'), dSimOn = UD('uSimOn');
        const US = n => gl.getUniformLocation(progSim, n);
        const sPrev = progSim && US('uPrev'), sSize = progSim && US('uSimSize'), sPtr = progSim && US('uPtr'), sVel = progSim && US('uVel');
        const sAsp = progSim && US('uAsp'), sDecay = progSim && US('uDecay'), sRad = progSim && US('uRad'), sAdv = progSim && US('uAdv');

        // textures de simulation (ping-pong)
        let SW = 0, SH = 0, simOK = false, rd = 0;
        const tex = [null, null], fbo = [null, null];
        function buildSim() {
            if (!progSim) return;
            [0, 1].forEach(i => { if (tex[i]) gl.deleteTexture(tex[i]); if (fbo[i]) gl.deleteFramebuffer(fbo[i]); });
            SW = lite ? 112 : 160;
            SH = Math.max(2, Math.round(SW * innerHeight / innerWidth));
            const zero = new Uint8Array(SW * SH * 4);
            for (let i = 0; i < zero.length; i += 4) { zero[i] = 128; zero[i + 2] = 128; } // déplacement nul
            simOK = true;
            for (let i = 0; i < 2; i++) {
                tex[i] = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_2D, tex[i]);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, SW, SH, 0, gl.RGBA, gl.UNSIGNED_BYTE, zero);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                fbo[i] = gl.createFramebuffer();
                gl.bindFramebuffer(gl.FRAMEBUFFER, fbo[i]);
                gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex[i], 0);
                if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) simOK = false;
            }
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            rd = 0;
        }

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
        let kNow = startDark ? 1.0 : 0.8;

        function resize() {
            const k = lite ? 0.3 : 0.4; // rendu basse résolution : le flou est naturel, le GPU respire
            canvas.width = Math.max(2, Math.round(innerWidth * k));
            canvas.height = Math.max(2, Math.round(innerHeight * k));
            gl.viewport(0, 0, canvas.width, canvas.height);
            buildSim();
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
            tAcc += dt * (lite ? 0.15 : 0.1) * (1 + pulse * 10);
            pulse *= 0.96;

            // pointeur actif (souris ou doigt récent) : le fluide le suit ; sinon, un parcours doux et continu
            const touched = pointer.x > -999 && (now - (pointer.t || 0)) < 2500;
            const tx = touched ? pointer.x / innerWidth : 0.5 + 0.3 * Math.sin(tAcc * 1.6);
            const ty = touched ? 1 - pointer.y / innerHeight : 0.5 + 0.25 * Math.cos(tAcc * 1.2 + 1);
            const pmx = mx, pmy = my, follow = touched ? 0.3 : 0.04;
            mx += (tx - mx) * follow;
            my += (ty - my) * follow;

            // 1) simulation : la trace du passage est entraînée, diffusée et s'estompe lentement
            if (simOK) {
                const gain = touched ? 1.1 : 0.5, lim = 0.09;
                const vx = Math.max(-lim, Math.min(lim, (mx - pmx) * gain));
                const vy = Math.max(-lim, Math.min(lim, (my - pmy) * gain));
                gl.useProgram(progSim);
                gl.bindFramebuffer(gl.FRAMEBUFFER, fbo[1 - rd]);
                gl.viewport(0, 0, SW, SH);
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, tex[rd]);
                gl.uniform1i(sPrev, 0);
                gl.uniform2f(sSize, SW, SH);
                gl.uniform2f(sPtr, mx, my);
                gl.uniform2f(sVel, vx, vy);
                gl.uniform1f(sAsp, innerWidth / innerHeight);
                gl.uniform1f(sDecay, lite ? 0.987 : 0.994);
                gl.uniform1f(sRad, touched ? 0.1 : 0.14);
                gl.uniform1f(sAdv, 0.06);
                gl.drawArrays(gl.TRIANGLES, 0, 3);
                rd = 1 - rd;
                gl.bindFramebuffer(gl.FRAMEBUFFER, null);
                gl.viewport(0, 0, canvas.width, canvas.height);
            }

            // 2) affichage : les couleurs du fond, déformées par cette trace
            const dark = root.classList.contains('dark');
            const set = dark ? palettesDark : palettes;
            const target = set[root.dataset.page] || set.cv;
            const baseT = dark ? DARK_BASE : LIGHT_BASE;
            const spd = 0.05;
            current.forEach((c, i) => c.forEach((_, k) => { c[k] += (target[i][k] - c[k]) * spd; }));
            baseNow.forEach((_, k) => { baseNow[k] += (baseT[k] - baseNow[k]) * spd; });
            kNow += ((dark ? 1.0 : 0.8) - kNow) * spd;

            gl.useProgram(progDisp);
            current.forEach((c, i) => gl.uniform3f(dC[i], c[0], c[1], c[2]));
            gl.uniform3f(dBase, baseNow[0], baseNow[1], baseNow[2]);
            gl.uniform1f(dK, kNow);
            gl.uniform2f(dRes, canvas.width, canvas.height);
            gl.uniform1f(dTime, tAcc);
            gl.uniform1f(dScroll, scrollY * 0.0004);
            gl.uniform1f(dSimOn, simOK ? 1 : 0);
            if (simOK) {
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, tex[rd]);
                gl.uniform1i(dSim, 0);
                gl.uniform2f(dSimSize, SW, SH);
            }
            gl.drawArrays(gl.TRIANGLES, 0, 3);
            requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
    })();

    /* Les cartes qui contiennent un dégradé (chiffres clés, logo SVG) restent en 2D : dans un rendu 3D,
       le navigateur peut les faire disparaître ou clignoter au survol. */
    $$('.modern-card').forEach(c => { if (c.querySelector('.text-gradient, svg')) c.classList.add('no3d'); });

    /* ---------- Cartes : le contenu se décale en profondeur au survol (3D) ---------- */
    $$('.modern-card:not(.form-card):not(.no3d)').forEach(card => {
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
        spans.forEach(s => { s.textContent = '0' + (s.dataset.suffix || ''); });
        const io = new IntersectionObserver(es => es.forEach(e => {
            if (!e.isIntersecting) return;
            io.unobserve(e.target);
            const to = +e.target.dataset.to, suffix = e.target.dataset.suffix || '', t0 = performance.now();
            (function tick(now) {
                const k = Math.min(1, (now - t0) / 1500);
                e.target.textContent = String(Math.round(to * (1 - Math.pow(1 - k, 3)))) + suffix;
                if (k < 1) requestAnimationFrame(tick);
            })(t0);
        }), { threshold: 0.3 });
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
    $$('.modern-card:not(.form-card):not(.no3d), .gallery-item').forEach(bindTilt);
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
