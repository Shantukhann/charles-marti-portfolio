/* ===== Motion design – Charles Marti ===== */
(() => {
    'use strict';
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    window.MOTION_VERSION = 108;
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


    /* ---------- Nom du hero en lettres + ondes autour du logo ---------- */
    (function splitName() {
        const h1 = $('#home h1');
        if (!h1 || h1.classList.contains('split')) return;
        const txt = h1.textContent.trim();
        h1.setAttribute('aria-label', txt);
        h1.textContent = '';
        [...txt].forEach((c, i) => {
            const s = document.createElement('span');
            s.className = 'ch'; s.setAttribute('aria-hidden', 'true');
            s.style.setProperty('--i', i);
            s.textContent = c === ' ' ? '\u00A0' : c;
            h1.appendChild(s);
        });
        h1.classList.add('split');
    })();
    /* Logo : halo lumineux + reflet qui parcourt le tracé (copies du tracé ajoutées derrière/devant) */
    (function logoFx() {
        const svg = $('#home svg'), base = svg && svg.querySelector('path');
        if (!base || svg.querySelector('.logo-glow')) return;
        ['logo-glow', 'logo-glint'].forEach(c => {
            const p = base.cloneNode(false);
            p.setAttribute('class', c); p.setAttribute('pathLength', '100'); p.setAttribute('aria-hidden', 'true');
            svg.appendChild(p);
        });
    })();


    /* ---------- Brume de fond : un voile aux couleurs du fond recouvre la page, puis se dissipe pour révéler le texte ---------- */
    (function fogVeil() {
        const canvas = document.createElement('canvas');
        canvas.className = 'fog-canvas';
        const gl = canvas.getContext('webgl', { antialias: false, alpha: true, premultipliedAlpha: true, powerPreference: 'low-power' });
        if (!gl) return;
        const COLS = 160, ROWS = 2560, CELL = 8;           // grille de densité en coordonnées de la page (1 cellule = 8 px de haut)
        const DUR = 6000;                                  // levée de secours sans aucun geste (ms), après 14 s d'inactivité
        const REACH = 300;                                 // rayon (px) autour du passage où la brume peut se dissiper de proche en proche, de l'intérieur vers l'extérieur
        const HEAT = 900;                                  // durée pendant laquelle la réaction en chaîne reste active autour du passage (ms)
        const SPREAD = 42;                                // vitesse de la réaction en chaîne (ms par cellule) : plus petit = plus rapide
        const R = 100;                                     // rayon de dissipation autour du pointeur (px)
        const dens = new Uint8Array(COLS * ROWS).fill(255);
        const hp = gl.getShaderPrecisionFormat && gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
        const PREC = hp && hp.precision > 0 ? 'precision highp float;' : 'precision mediump float;';
        const vs = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
        const fs = PREC + `
        uniform sampler2D uTex; uniform sampler2D uBg; uniform vec2 uRes; uniform float uSY, uVH, uRows, uTime, uDark;
        float h(vec2 p){ vec3 q=fract(vec3(p.xyx)*.1031); q+=dot(q,q.yzx+33.33); return fract((q.x+q.y)*q.z); }
        float vn(vec2 p){ vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f);
            return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y); }
        float fbm(vec2 p){ float s=0.,a=.5; for(int i=0;i<4;i++){ s+=a*vn(p); p=p*2.03+vec2(7.1,3.7); a*=.5; } return s; }
        void main(){
            vec2 uv=gl_FragCoord.xy/uRes; float yt=1.-uv.y;
            float asp=uRes.x/uRes.y;
            vec2 pg=vec2(uv.x*asp, (uSY+yt*uVH)/uVH);
            vec2 w=(vec2(fbm(pg*3.+vec2(uTime*.12,0.)),fbm(pg*3.+vec2(7.,uTime*.1)))-.5);   // le bord ondule : jamais de ligne droite
            float d=texture2D(uTex, vec2(uv.x+w.x*.03, (uSY/${CELL}.+yt*uRows+w.y*34.)/${ROWS}.)).r;
            float n=fbm(pg*2.4+vec2(uTime*.05,-uTime*.03));
            float m=d*1.5-(1.-n)*.95*smoothstep(0.,.55,d);                 // alpha = 0 exactement quand la densité tombe à 0 : jamais de résidu
            float a=smoothstep(0.,.5,m)*.97;
            vec3 col=texture2D(uBg, vec2(uv.x, yt)).rgb;   // exactement l'image du fond : mêmes couleurs, mêmes mouvements
            gl_FragColor=vec4(col*a,a);
        }`;
        const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return gl.getShaderParameter(o, gl.COMPILE_STATUS) ? o : null; };
        const v = sh(gl.VERTEX_SHADER, vs), f = sh(gl.FRAGMENT_SHADER, fs);
        if (!v || !f) return;
        const prog = gl.createProgram(); gl.attachShader(prog, v); gl.attachShader(prog, f); gl.linkProgram(prog);
        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
        gl.useProgram(prog);
        gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
        const loc = gl.getAttribLocation(prog, 'a'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
        const U = n => gl.getUniformLocation(prog, n);
        gl.uniform1i(U('uTex'), 0); gl.uniform1i(U('uBg'), 1);
        const uRes = U('uRes'), uSY = U('uSY'), uVH = U('uVH'), uRows = U('uRows'), uTime = U('uTime'), uDark = U('uDark');
        const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, COLS, ROWS, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, dens);
        const bgTex = gl.createTexture(); gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, bgTex);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        document.body.appendChild(canvas);
        root.classList.add('fogv');

        const size = () => {
            const s = Math.max(.4, Math.min(.5, 520 / Math.max(innerWidth, 1)));
            canvas.width = Math.max(2, Math.round(innerWidth * s)); canvas.height = Math.max(2, Math.round(innerHeight * s));
            gl.viewport(0, 0, canvas.width, canvas.height);
        };
        size(); addEventListener('resize', size);

        const nxt = new Uint8Array(COLS * ROWS), rnd = new Uint8Array(COLS * ROWS);
        for (let i = 0; i < rnd.length; i++) rnd[i] = Math.random() * 255;
        /* champ de « turbulence » lisse : la vague avance par doigts et par poches, jamais en ligne droite */
        const wob = new Float32Array(COLS * ROWS);
        (function () {
            const mk = (step, amp) => { const gw = Math.ceil(COLS / step) + 2, gh = Math.ceil(ROWS / step) + 2, g = new Float32Array(gw * gh).map(() => Math.random()); return { step, amp, gw, g }; };
            const layers = [mk(5, .55), mk(11, .75), mk(24, .6)];
            for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
                let v = 0;
                for (const L of layers) {
                    const gx = c / L.step, gy = r / L.step, x0 = gx | 0, y0 = gy | 0, fx = gx - x0, fy = gy - y0, sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy), i0 = y0 * L.gw + x0;
                    v += L.amp * ((L.g[i0] * (1 - sx) + L.g[i0 + 1] * sx) * (1 - sy) + (L.g[i0 + L.gw] * (1 - sx) + L.g[i0 + L.gw + 1] * sx) * sy);
                }
                wob[r * COLS + c] = .15 + v * .9;
            }
        })();
        const heat = new Uint8Array(COLS * ROWS);          // « chaleur » laissée par le passage : la réaction en chaîne n'agit qu'autour
        const coarse = matchMedia('(pointer: coarse)').matches;
        let lastTouch = performance.now();                 // dernier geste de l'utilisateur
        let touchedEver = false, lastUser = -1e9;           // lastUser : dernier vrai geste de l'utilisateur (l'ouverture automatique ne compte pas)
        let simActive = true, anyVisible = true, lastSY = -1;   // la simulation ne tourne que quand un geste vient d'avoir lieu (économie de batterie)
        const live = new Uint8Array(COLS * ROWS);           // cellules « libérées » : seules celles proches d'un passage se dissipent de proche en proche
        const rowAct = new Uint8Array(ROWS), rowNext = new Uint8Array(ROWS), procRows = new Int32Array(ROWS);   // lignes à faire avancer
        let hold = performance.now(), lastT = performance.now(), lx = -999, ly = -999, lt = 0;
        /* La brume dégagée sur une page le reste : en revenant sur la page, on retrouve ce qu'on avait déjà découvert */
        const pagesFog = {};
        let curPage = ['page-cv', 'page-realisations', 'page-apropos'].find(id => { const el = document.getElementById(id); return el && !el.classList.contains('hidden'); }) || 'page-cv';
        window.__fogReset = (id) => {
            if (id && id === curPage) return;
            pagesFog[curPage] = { d: dens.slice(), l: live.slice() };
            curPage = id || curPage;
            const s = pagesFog[curPage];
            if (s) { dens.set(s.d); live.set(s.l); } else { dens.fill(255); live.fill(0); }
            heat.fill(0); rowAct.fill(1); lastTouch = performance.now(); canvas.style.display = ''; simActive = true; anyVisible = true; lastSY = -1;
            if (!s && !touchedEver) hint.classList.remove('gone');
            if (!s) window.__fogArm && window.__fogArm();
        };
        /* Indice discret, tant que l'utilisateur n'a rien gratté */
        const hint = document.createElement('div');
        hint.className = 'fog-hint';
        hint.setAttribute('aria-hidden', 'true');
        document.body.appendChild(hint);
        const setHint = () => {
            const en = (root.lang || 'fr').startsWith('en');
            const txt = en ? (coarse ? 'Swipe to clear the mist' : 'Move your mouse to clear the mist') : (coarse ? 'Glissez le doigt pour dissiper la brume' : 'Passez la souris pour dissiper la brume');
            hint.innerHTML = '<i class="fa-solid fa-hand-pointer fog-hint-icon" aria-hidden="true"></i><span></span>';
            hint.lastChild.textContent = txt;
        };
        setHint(); document.addEventListener('langchange', setHint);
        /* le pointeur (souris ou doigt) gratte la brume : elle se déchire autour de lui, puis le trou s'étend un peu de lui-même */
        const clearAt = (cx, cy, strength, rad = R) => {
            const px = (cx / innerWidth) * COLS, rr = rad / innerWidth * COLS, rry = rad / CELL;
            const py = (cy + scrollY) / CELL, hr = REACH / rad;       // zone d'influence autour du passage : la dissipation ne peut se propager que là
            for (let r = Math.max(0, Math.floor(py - rry * hr)); r <= Math.min(ROWS - 1, Math.ceil(py + rry * hr)); r++)
                for (let c = Math.max(0, Math.floor(px - rr * hr)); c <= Math.min(COLS - 1, Math.ceil(px + rr * hr)); c++) {
                    const dd = Math.hypot((c - px) / rr, (r - py) / rry), i = r * COLS + c;
                    if (dd < hr) { heat[i] = 255; live[i] = 1; rowAct[r] = 1; }
                    if (dd >= 1) continue;
                    const k = (1 - dd) * strength * 255;
                    dens[i] = dens[i] > k ? dens[i] - k : 0;
                }
        };
        const stroke = (x, y, auto) => {
            const now = performance.now();
            const sp = lx > -900 ? Math.hypot(x - lx, y - ly) / Math.max(1, now - lt) : 0;
            lx = x; ly = y; lt = now; lastTouch = now; simActive = true;
            if (!auto) { hint.classList.add('gone'); touchedEver = true; lastUser = performance.now(); }   // l'ouverture automatique ne compte pas comme un geste : l'indice reste visible tant que la brume est là
            /* chaque passage libère toute la brume affichée à l'écran : elle se dissipe à partir de l'épicentre, vers l'extérieur */
            for (let i = Math.max(0, Math.floor(scrollY / CELL)) * COLS, e = Math.min(ROWS, Math.ceil((scrollY + innerHeight) / CELL) + 1) * COLS; i < e; i++) { live[i] = 1; rowAct[(i / COLS) | 0] = 1; }
            clearAt(x, y, Math.min(.6, .12 + sp * .3));
        };
        window.__fogPoke = stroke;
        /* premier écran : si personne ne bouge, il se dégage seul après 2,5 s (le contenu d'accueil doit toujours être lisible) ; le reste attend le geste */
        let autoTimer = 0;
        const armAuto = () => { clearTimeout(autoTimer); autoTimer = setTimeout(() => { if (lastTouch < performance.now() - 2300) stroke(innerWidth * .5, Math.min(innerHeight * .5, 380), true); }, 2500); };
        window.__fogArm = armAuto; armAuto();
        /* clavier : un élément qui prend le focus (Tab…) est révélé là où il se trouve */
        document.addEventListener('focusin', e => { const r = e.target.getBoundingClientRect(); if (r.width && r.height && r.bottom > 0 && r.top < innerHeight) stroke(r.left + r.width / 2, r.top + r.height / 2); });
        addEventListener('pointermove', e => stroke(e.clientX, e.clientY), { passive: true });
        addEventListener('touchmove', e => { const t = e.touches[0]; if (t) stroke(t.clientX, t.clientY); }, { passive: true });
        addEventListener('touchstart', e => { const t = e.touches[0]; if (t) { lx = -999; stroke(t.clientX, t.clientY); } }, { passive: true });

        const t00 = performance.now();
        /* appelée par le fond juste après qu'il a dessiné son image : la brume en reprend les pixels */
        window.__fogDraw = function (src, now) {
            const dt = Math.min(64, now - lastT); lastT = now;
            const sy = Math.max(0, scrollY), vh = innerHeight;
            const r0 = Math.max(0, Math.floor(sy / CELL)), r1 = Math.min(ROWS, Math.ceil((sy + vh) / CELL) + 1);
            let any = anyVisible;
            /* filet de sécurité : sans aucun geste (clavier, lecteur d'écran…), la brume finit par se lever lentement */
            const idle = now - lastTouch > (coarse ? 5000 : 8000);
            const slow = idle ? dt / DUR * 255 : 0;
            if (idle) for (let r = r0; r < r1; r++) rowAct[r] = 1;
            if (simActive || idle) {
                const spr = dt / SPREAD * 255;                 // réaction en chaîne : une zone dégagée entraîne ses voisines
                const cool = dt / HEAT * 255, tail = dt / 450 * 255;   // « tail » : finit de dégager les derniers résidus dans la zone libérée
                let changedAll = false, nProc = 0;
                rowNext.fill(0);
                /* on ne traite que les lignes « actives », où qu'elles soient dans la page : rien ne reste figé à moitié en défilant */
                for (let r = 0; r < ROWS; r++) {
                    if (!rowAct[r]) continue;
                    let changed = false;
                    for (let c = 0, i = r * COLS; c < COLS; c++, i++) {
                        const x = dens[i], hh = heat[i], lv = live[i];
                        if (hh) { heat[i] = hh > cool ? hh - cool : 0; changed = true; }
                        if (!x) { nxt[i] = 0; continue; }
                        const l = c > 0 ? dens[i - 1] : x, rt = c < COLS - 1 ? dens[i + 1] : x;
                        const u = r > 0 ? dens[i - COLS] : x, d = r < ROWS - 1 ? dens[i + COLS] : x;
                        const ul = r > 0 && c > 0 ? dens[i - COLS - 1] : x, ur = r > 0 && c < COLS - 1 ? dens[i - COLS + 1] : x;
                        const dl = r < ROWS - 1 && c > 0 ? dens[i + COLS - 1] : x, dr = r < ROWS - 1 && c < COLS - 1 ? dens[i + COLS + 1] : x;
                        const gap = x - Math.min(l, rt, u, d, ul + 25, ur + 25, dl + 25, dr + 25);                  // à quel point un voisin est plus dégagé que moi
                        let y = x - slow - (lv && x < 110 ? tail : 0) - spr * Math.min(1, gap / 115) * (lv ? 1 : hh / 255) * wob[i] * (.8 + rnd[i] / 255 * .4);   // bord irrégulier, comme de la fumée
                        if (y < (lv ? 50 : 0)) y = 0;                 // plus de petits bouts de brume dans la zone libérée
                        if (y !== x) changed = true;
                        nxt[i] = y;
                    }
                    procRows[nProc++] = r;
                    if (changed) { changedAll = true; rowNext[r] = 1; if (r > 0) rowNext[r - 1] = 1; if (r < ROWS - 1) rowNext[r + 1] = 1; }
                }
                for (let k = 0; k < nProc; k++) { const r = procRows[k]; dens.set(nxt.subarray(r * COLS, (r + 1) * COLS), r * COLS); }
                rowAct.set(rowNext);
                if (!changedAll && !idle) simActive = false;
                any = false;
                for (let i = r0 * COLS, e = r1 * COLS; i < e; i++) if (dens[i]) { any = true; break; }
                anyVisible = any; lastSY = sy;
            } else if (sy !== lastSY) {                         // simple défilement : on regarde seulement s'il reste de la brume à l'écran
                any = false;
                for (let i = r0 * COLS, e = r1 * COLS; i < e; i++) if (dens[i]) { any = true; break; }
                anyVisible = any; lastSY = sy;
            }
            hint.classList.toggle('gone', !any || performance.now() - lastUser < 2500);   // l'indice s'affiche dès qu'il reste de la brume à l'écran et que rien ne bouge depuis 2,5 s (y compris sur les sections découvertes en défilant)
            if (any) {
                canvas.style.display = '';
                gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, bgTex);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
                gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex);
                gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, r0, COLS, r1 - r0, gl.LUMINANCE, gl.UNSIGNED_BYTE, dens.subarray(r0 * COLS, r1 * COLS));
                gl.uniform2f(uRes, canvas.width, canvas.height);
                gl.uniform1f(uSY, sy); gl.uniform1f(uVH, vh); gl.uniform1f(uRows, vh / CELL);
                gl.uniform1f(uTime, (now - t00) / 1000);
                gl.uniform1f(uDark, root.classList.contains('dark') ? 1 : 0);
                gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
                gl.drawArrays(gl.TRIANGLES, 0, 3);
            } else canvas.style.display = 'none';
        };
    })();

    /* ---------- Easter egg : 4 clics rapides sur le logo de l'accueil → les lignes du M prennent vie et serpentent, puis on joue à Snake ---------- */
    (function snakeEgg() {
        const svg = $('#home svg'), host = svg && svg.parentElement, logoPath = svg && svg.querySelector('path');
        if (!svg || !host || !logoPath) return;
        const N = 18;                                          // grille N × N
        const L = (fr, en) => (window.SITE && SITE.lang && SITE.lang() === 'en') ? en : fr;
        let back = null, wrap = null, cv = null, ctx = null, S = 520, cell = 0;
        let snake, dir, nextDir, cocktail, beers, score, best, state = 'off', morphT = 0, t0 = 0, lastStep = 0, speed, over = false, raf = 0, eaten = 0, fx = [], toast = null, paused = false, morphLen = 1250, prevPts = null;
        try { best = +localStorage.getItem('snake-best') || 0; } catch (e) { best = 0; }

        /* points échantillonnés le long du M du logo */
        const pts = [];
        (function () {
            const len = logoPath.getTotalLength(), n = 46;
            for (let i = 0; i < n; i++) { const p = logoPath.getPointAtLength(len * i / (n - 1)); pts.push({ x: p.x / 50, y: p.y / 50 }); }
        })();

        const lerp = (a, b, t) => a + (b - a) * t;
        const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        const col = t => { const a = [106, 140, 240], b = [221, 130, 159]; return `rgb(${a.map((v, i) => Math.round(lerp(v, b[i], t))).join(',')})`; };
        const dark = () => root.classList.contains('dark');

        function build() {
            back = document.createElement('div'); back.className = 'snake-back';
            wrap = document.createElement('div'); wrap.className = 'snake-wrap';
            wrap.innerHTML = '<canvas class="snake-cv" tabindex="0" aria-label="Snake"></canvas><button type="button" class="snake-x" aria-label="Fermer">✕</button><div class="snake-help"></div>';
            document.body.appendChild(back); document.body.appendChild(wrap);
            cv = wrap.querySelector('canvas'); ctx = cv.getContext('2d');
            wrap.querySelector('.snake-x').addEventListener('click', close);
            back.addEventListener('click', close);
            addEventListener('resize', fit);
            /* balayage du doigt */
            let tx = 0, ty = 0;
            cv.addEventListener('touchstart', e => { const t = e.touches[0]; tx = t.clientX; ty = t.clientY; e.preventDefault(); }, { passive: false });
            cv.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
            cv.addEventListener('touchend', e => {
                const t = e.changedTouches[0], dx = t.clientX - tx, dy = t.clientY - ty;
                if (Math.hypot(dx, dy) < 18) { if (over) restart(); else if (state === 'ready') startPlay(); return; }
                steer(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? [1, 0] : [-1, 0]) : (dy > 0 ? [0, 1] : [0, -1]));
                e.preventDefault();
            }, { passive: false });
            cv.addEventListener('click', () => { if (over) restart(); else if (state === 'ready') startPlay(); });
        }
        function fit() {
            if (!cv) return;
            S = Math.max(240, Math.round(Math.min(620, innerWidth - 24, innerHeight - 120)));
            const dpr = Math.min(2, devicePixelRatio || 1);
            wrap.style.width = wrap.style.height = S + 'px';
            wrap.style.marginLeft = wrap.style.marginTop = (-S / 2 - 12) + 'px';
            cv.style.width = cv.style.height = S + 'px';
            cv.width = cv.height = Math.round(S * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            cell = S / N;
        }
        const help = () => {
            const h = wrap.querySelector('.snake-help');
            h.textContent = over ? L('Perdu · ' + score + ' pts — touchez / Entrée pour rejouer', 'Game over · ' + score + ' pts — tap / Enter to retry')
                : L('Mangez les cocktails 🍸 — évitez les bières 🍺 · flèches, ZQSD ou glisser · Échap', 'Eat the cocktails 🍸 — avoid the beers 🍺 · arrows, WASD or swipe · Esc');
        };

        function reset() {
            const m = Math.floor(N / 2);
            snake = [{ x: m + 1, y: m }, { x: m, y: m }, { x: m - 1, y: m }, { x: m - 2, y: m }];
            prevPts = null; dir = nextDir = [1, 0]; score = 0; over = false; speed = 140; eaten = 0; beers = []; fx = []; toast = null;
            cocktail = null; placeCocktail(); help();
        }
        const free = (x, y) => !snake.some(s => s.x === x && s.y === y) && !(cocktail && cocktail.x === x && cocktail.y === y) && !beers.some(b => b.x === x && b.y === y);
        function randFree(minDist) {
            const cells = [];
            for (let x = 0; x < N; x++) for (let y = 0; y < N; y++) if (free(x, y) && Math.abs(x - snake[0].x) + Math.abs(y - snake[0].y) >= (minDist || 0)) cells.push({ x, y });
            return cells[Math.floor(Math.random() * cells.length)] || null;
        }
        function placeCocktail() { cocktail = null; cocktail = randFree(2); }
        function steer(d) {
            if (state === 'ready') { if (d[0] === -dir[0] && d[1] === -dir[1]) return; nextDir = d; startPlay(); return; }
            if (state !== 'play') return;
            if (d[0] === -dir[0] && d[1] === -dir[1]) return;      // pas de demi-tour
            nextDir = d;
        }
        function startPlay() { state = 'play'; lastStep = performance.now() - speed * .6; }
        function restart() { reset(); state = 'ready'; }

        function pee(now) {
            /* le serpent fait pipi : un jet jaune sur le côté de la tête */
            const h = snake[0], hx = (h.x + .5) * cell, hy = (h.y + .5) * cell, side = Math.random() < .5 ? 1 : -1, px = -dir[1] * side, py = dir[0] * side;
            for (let i = 0; i < 26; i++) {
                const a = (Math.random() - .5) * .35, sp = (2.2 + Math.random() * 2.2) * cell / 12;
                fx.push({ x: hx + px * cell * .4, y: hy + py * cell * .4, vx: (px * Math.cos(a) - py * Math.sin(a)) * sp, vy: (px * Math.sin(a) + py * Math.cos(a)) * sp - cell * .12, born: now + i * 18, life: 650 + Math.random() * 300 });
            }
            toast = { text: L('Pssssss…', 'Pssssss…'), x: hx, y: hy - cell * .9, born: now };
        }

        function step(now) {
            dir = nextDir;
            const h = { x: snake[0].x + dir[0], y: snake[0].y + dir[1] };
            const eatC = cocktail && h.x === cocktail.x && h.y === cocktail.y;
            const bi = beers.findIndex(b => b.x === h.x && b.y === h.y);
            const body = eatC ? snake : snake.slice(0, -1);
            if (h.x < 0 || h.y < 0 || h.x >= N || h.y >= N || body.some(s => s.x === h.x && s.y === h.y)) {
                over = true;
                if (score > best) { best = score; try { localStorage.setItem('snake-best', best); } catch (e) { } }
                help(); return;
            }
            const old = snake.map(s => ({ x: s.x, y: s.y }));
            snake.unshift(h); prevPts = old;
            if (eatC) {
                score++; eaten++; speed = Math.max(78, speed - 3); placeCocktail();
                /* de temps en temps, une bière apparaît : à ne pas boire ! */
                if (beers.length < 2 && Math.random() < .5) { const c = randFree(3); if (c) beers.push({ x: c.x, y: c.y, born: now, life: 9000 }); }
            } else snake.pop();
            if (bi >= 0) {
                beers.splice(bi, 1);
                const cut = Math.min(3, snake.length - 2);
                for (let i = 0; i < cut; i++) snake.pop();
                prevPts = null;
                score = Math.max(0, score - 1); pee(now);
            }
        }

        /* ---- dessins ---- */
        function drawCocktail(cx, cy, size, now) {
            const u = size, p = 1 + Math.sin(now / 220) * .05;
            ctx.save(); ctx.translate(cx, cy); ctx.scale(p, p); ctx.rotate(Math.sin(now / 500) * .06);
            const g = ctx.createRadialGradient(0, 0, 0, 0, 0, u * .9); g.addColorStop(0, 'rgba(255,170,200,.45)'); g.addColorStop(1, 'rgba(255,170,200,0)');
            ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, u * .9, 0, 7); ctx.fill();
            // verre à cocktail
            ctx.lineJoin = 'round'; ctx.lineCap = 'round';
            const lq = ctx.createLinearGradient(0, -u * .34, 0, u * .06); lq.addColorStop(0, '#ff8fb3'); lq.addColorStop(1, '#ffb15f');
            ctx.fillStyle = lq; ctx.beginPath(); ctx.moveTo(-u * .36, -u * .3); ctx.lineTo(u * .36, -u * .3); ctx.lineTo(0, u * .08); ctx.closePath(); ctx.fill();
            ctx.strokeStyle = dark() ? 'rgba(255,255,255,.85)' : 'rgba(80,90,120,.75)'; ctx.lineWidth = Math.max(1.6, u * .06);
            ctx.beginPath(); ctx.moveTo(-u * .36, -u * .3); ctx.lineTo(u * .36, -u * .3); ctx.lineTo(0, u * .08); ctx.closePath(); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, u * .08); ctx.lineTo(0, u * .36); ctx.moveTo(-u * .2, u * .38); ctx.lineTo(u * .2, u * .38); ctx.stroke();
            // cerise + pique + petit parasol
            ctx.strokeStyle = '#7a5a3a'; ctx.lineWidth = Math.max(1.2, u * .035);
            ctx.beginPath(); ctx.moveTo(u * .05, -u * .12); ctx.lineTo(u * .3, -u * .5); ctx.stroke();
            ctx.fillStyle = '#e0334f'; ctx.beginPath(); ctx.arc(u * .05, -u * .14, u * .09, 0, 7); ctx.fill();
            ctx.fillStyle = '#6A8CF0'; ctx.beginPath(); ctx.moveTo(u * .3, -u * .62); ctx.lineTo(u * .1, -u * .46); ctx.lineTo(u * .5, -u * .46); ctx.closePath(); ctx.fill();
            ctx.restore();
        }
        function drawBeer(cx, cy, size, now, alpha) {
            const u = size;
            ctx.save(); ctx.globalAlpha = alpha; ctx.translate(cx, cy); ctx.rotate(Math.sin(now / 260) * .07);
            const g = ctx.createRadialGradient(0, 0, 0, 0, 0, u * .85); g.addColorStop(0, 'rgba(255,200,70,.4)'); g.addColorStop(1, 'rgba(255,200,70,0)');
            ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, u * .85, 0, 7); ctx.fill();
            // chope
            ctx.strokeStyle = dark() ? 'rgba(255,255,255,.85)' : 'rgba(110,80,20,.85)'; ctx.lineWidth = Math.max(1.8, u * .07); ctx.lineCap = 'round';
            ctx.beginPath(); ctx.arc(u * .3, u * .02, u * .17, -1.1, 1.1); ctx.stroke();
            const b = ctx.createLinearGradient(0, -u * .3, 0, u * .4); b.addColorStop(0, '#ffd466'); b.addColorStop(1, '#e8961b');
            ctx.fillStyle = b; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(-u * .27, -u * .3, u * .54, u * .7, u * .07) : ctx.rect(-u * .27, -u * .3, u * .54, u * .7); ctx.fill(); ctx.stroke();
            ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(-u * .17, -u * .2, u * .07, u * .5);
            ctx.fillStyle = '#fffaf0';                                    // mousse
            [[-.2, -.34, .15], [0, -.4, .18], [.2, -.34, .15], [-.08, -.3, .13], [.1, -.3, .13]].forEach(a => { ctx.beginPath(); ctx.arc(u * a[0], u * a[1], u * a[2], 0, 7); ctx.fill(); });
            ctx.restore();
        }
        /* Le serpent est un seul corps continu : un trait épais et lisse qui épouse les virages et glisse d'une case à l'autre */
        function snakeBody(now) {
            const p = (state === 'play' && !over && !paused && prevPts) ? Math.min(1, Math.max(0, (now - lastStep) / speed)) : 1;
            const pos = snake.map((s, i) => {
                const o = prevPts ? prevPts[Math.min(i, prevPts.length - 1)] : s;
                return { x: (lerp(o.x, s.x, p) + .5) * cell, y: (lerp(o.y, s.y, p) + .5) * cell };
            });
            // chemin lissé : courbes quadratiques passant par les milieux des segments (virages arrondis)
            const path = [], n = pos.length;
            const mid = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
            const quad = (a, c, b, k) => { for (let s = 1; s <= k; s++) { const t = s / k, u = 1 - t; path.push({ x: u * u * a.x + 2 * u * t * c.x + t * t * b.x, y: u * u * a.y + 2 * u * t * c.y + t * t * b.y }); } };
            path.push(pos[0]);
            if (n === 1) path.push(pos[0]);
            else {
                let a = pos[0];
                for (let i = 1; i < n - 1; i++) { const m = mid(pos[i], pos[i + 1]); quad(a, pos[i], m, 6); a = m; }
                quad(a, pos[n - 1], pos[n - 1], 3);
            }
            // longueur cumulée pour le dégradé et l'effilement
            const cum = [0]; for (let i = 1; i < path.length; i++) cum.push(cum[i - 1] + Math.hypot(path[i].x - path[i - 1].x, path[i].y - path[i - 1].y));
            const total = cum[cum.length - 1] || 1;
            ctx.lineCap = 'round'; ctx.lineJoin = 'round';
            for (let i = path.length - 1; i > 0; i--) {
                const t = cum[i] / total;
                ctx.strokeStyle = col(t); ctx.lineWidth = cell * (.8 - t * .26);
                ctx.beginPath(); ctx.moveTo(path[i].x, path[i].y); ctx.lineTo(path[i - 1].x, path[i - 1].y); ctx.stroke();
            }
            // tête : un peu plus ronde, orientée dans le sens de la marche
            const hd = pos[0], nk = pos[1] || pos[0];
            let ex = hd.x - nk.x, ey = hd.y - nk.y; const el = Math.hypot(ex, ey) || 1; ex /= el; ey /= el;
            if (el < .01) { ex = dir[0]; ey = dir[1]; }
            ctx.fillStyle = col(0); ctx.beginPath(); ctx.arc(hd.x, hd.y, cell * .46, 0, 7); ctx.fill();
            const px = -ey, py = ex;
            ctx.fillStyle = '#fff';
            [-1, 1].forEach(sd => { ctx.beginPath(); ctx.arc(hd.x + ex * cell * .12 + px * sd * cell * .2, hd.y + ey * cell * .12 + py * sd * cell * .2, cell * .12, 0, 7); ctx.fill(); });
            ctx.fillStyle = '#2d3035';
            [-1, 1].forEach(sd => { ctx.beginPath(); ctx.arc(hd.x + ex * cell * .18 + px * sd * cell * .2, hd.y + ey * cell * .18 + py * sd * cell * .2, cell * .06, 0, 7); ctx.fill(); });
            // langue qui sort parfois
            if (Math.sin(now / 420) > .75) {
                ctx.strokeStyle = '#e0334f'; ctx.lineWidth = Math.max(1.5, cell * .06); ctx.lineCap = 'round';
                const sx = hd.x + ex * cell * .45, sy = hd.y + ey * cell * .45, tx = sx + ex * cell * .32, ty = sy + ey * cell * .32;
                ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(tx, ty);
                ctx.moveTo(tx, ty); ctx.lineTo(tx + ex * cell * .13 + px * cell * .1, ty + ey * cell * .13 + py * cell * .1);
                ctx.moveTo(tx, ty); ctx.lineTo(tx + ex * cell * .13 - px * cell * .1, ty + ey * cell * .13 - py * cell * .1);
                ctx.stroke();
            }
        }
        function plate(alpha) {
            ctx.save(); ctx.globalAlpha = alpha;
            ctx.fillStyle = dark() ? 'rgba(25,29,42,.82)' : 'rgba(255,255,255,.78)';
            ctx.strokeStyle = dark() ? 'rgba(143,168,255,.35)' : 'rgba(106,140,240,.28)'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.roundRect ? ctx.roundRect(1, 1, S - 2, S - 2, 26) : ctx.rect(1, 1, S - 2, S - 2); ctx.fill(); ctx.stroke();
            // damier très léger
            ctx.fillStyle = dark() ? 'rgba(255,255,255,.025)' : 'rgba(106,140,240,.045)';
            for (let x = 0; x < N; x++) for (let y = 0; y < N; y++) if ((x + y) % 2) ctx.fillRect(x * cell, y * cell, cell, cell);
            ctx.restore();
        }

        /* La transformation : les lignes du logo prennent vie, ondulent comme un serpent et glissent jusqu'à leur place sur la grille */
        function morph(now) {
            const el = now - t0, T = morphLen;
            morphT = Math.min(1, el / T);
            plate(Math.min(1, el / 300));
            const n = pts.length, t = ease(Math.max(0, (morphT - .15) / .85));          // 0 → 1 : du M vers le serpent aligné
            const amp = Math.sin(Math.PI * Math.min(1, morphT * 1.05)) * S * .045 * (.4 + .6 * Math.min(1, morphT * 3));
            const P = [];
            for (let j = 0; j < n; j++) {
                const k = (n - 1 - j) / (n - 1) * (snake.length - 1);                   // la tête = bout du tracé du M
                const bx = (snake[0].x - k + .5) * cell, by = (snake[0].y + .5) * cell;
                const x0 = pts[j].x * S, y0 = pts[j].y * S;
                const nx = lerp(x0, bx, t), ny = lerp(y0, by, t);
                // ondulation qui parcourt le corps de la queue vers la tête
                const w = Math.sin(j * .55 - el / 140) * amp * (1 - t * .85);
                const dx = j < n - 1 ? pts[j + 1].x - pts[j].x : pts[j].x - pts[j - 1].x, dy = j < n - 1 ? pts[j + 1].y - pts[j].y : pts[j].y - pts[j - 1].y, d = Math.hypot(dx, dy) || 1;
                const nvx = lerp(-dy / d, 0, t), nvy = lerp(dx / d, 1, t);
                P.push({ x: nx + nvx * w, y: ny + nvy * w });
            }
            ctx.lineCap = 'round'; ctx.lineJoin = 'round';
            const lw = lerp(S * .05, cell * .8, t);
            for (let j = 0; j < n - 1; j++) {
                ctx.strokeStyle = col(1 - j / (n - 1)); ctx.lineWidth = lw;
                ctx.beginPath(); ctx.moveTo(P[j].x, P[j].y); ctx.lineTo(P[j + 1].x, P[j + 1].y); ctx.stroke();
            }
            // la tête s'éveille : yeux qui apparaissent en fondu
            const hd = P[n - 1], a = Math.max(0, (morphT - .4) / .4), pd = { x: P[n - 1].x - P[n - 2].x, y: P[n - 1].y - P[n - 2].y }, dl = Math.hypot(pd.x, pd.y) || 1, ex = pd.x / dl, ey = pd.y / dl;
            ctx.globalAlpha = Math.min(1, a);
            ctx.fillStyle = '#fff';
            [-1, 1].forEach(sd => { ctx.beginPath(); ctx.arc(hd.x + ex * lw * .12 - ey * sd * lw * .22, hd.y + ey * lw * .12 + ex * sd * lw * .22, lw * .17, 0, 7); ctx.fill(); });
            ctx.fillStyle = '#2d3035';
            [-1, 1].forEach(sd => { ctx.beginPath(); ctx.arc(hd.x + ex * lw * .2 - ey * sd * lw * .22, hd.y + ey * lw * .2 + ex * sd * lw * .22, lw * .08, 0, 7); ctx.fill(); });
            ctx.globalAlpha = 1;
            if (morphT >= 1) { state = 'ready'; lastStep = now; prevPts = null; }
        }

        let lastFrame = 0;
        function draw() {
            raf = requestAnimationFrame(draw);
            try { drawFrame(performance.now()); } catch (e) { console.error(e); const h = wrap && wrap.querySelector('.snake-help'); if (h) h.textContent = 'Erreur : ' + e.message; }
        }
        function drawFrame(now) {
            if (now - lastFrame > 400) lastStep = now;      // retour d'un onglet en veille : pas de rattrapage brutal
            lastFrame = now;
            if (state === 'off') return;
            ctx.clearRect(0, 0, S, S);
            if (state === 'morph') { morph(now); return; }
            if (state === 'play' && !over && !paused && now - lastStep >= speed) { lastStep = now; step(now); }
            plate(1);
            if (cocktail) drawCocktail((cocktail.x + .5) * cell, (cocktail.y + .5) * cell, cell * 1.05, now);
            beers = beers.filter(b => now - b.born < b.life);
            beers.forEach(b => { const left = b.life - (now - b.born); drawBeer((b.x + .5) * cell, (b.y + .5) * cell, cell * 1.05, now, left < 2200 ? .45 + .55 * Math.abs(Math.sin(now / 130)) : 1); });
            snakeBody(now);
            // jet de pipi
            fx = fx.filter(f => now - f.born < f.life);
            fx.forEach(f => {
                const a = now - f.born; if (a < 0) return;
                const tt = a / 16, x = f.x + f.vx * tt, y = f.y + f.vy * tt + .09 * cell * .1 * tt * tt;
                ctx.fillStyle = `rgba(255,${200 + Math.round(30 * Math.sin(a / 60))},60,${1 - a / f.life})`;
                ctx.beginPath(); ctx.arc(x, y, cell * .08 * (1 - a / f.life * .4), 0, 7); ctx.fill();
            });
            if (toast && now - toast.born < 1100) {
                const a = (now - toast.born) / 1100;
                ctx.globalAlpha = 1 - a; ctx.fillStyle = '#d99a00'; ctx.font = `700 ${Math.round(cell * .62)}px Outfit, system-ui, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                ctx.fillText(toast.text, Math.min(S - 60, Math.max(60, toast.x)), toast.y - a * cell); ctx.globalAlpha = 1;
            }
            // score
            ctx.font = '600 14px Outfit, system-ui, sans-serif'; ctx.textBaseline = 'top';
            ctx.fillStyle = dark() ? 'rgba(230,232,238,.85)' : 'rgba(45,48,53,.7)';
            ctx.textAlign = 'left'; ctx.fillText('🍸 ' + score, 14, 12);
            ctx.textAlign = 'right'; ctx.fillText(L('Record ', 'Best ') + best, S - 44, 12);
            if (state === 'ready') {
                ctx.fillStyle = dark() ? 'rgba(20,23,33,.55)' : 'rgba(255,255,255,.65)';
                ctx.fillRect(0, S - 74, S, 46);
                ctx.fillStyle = dark() ? '#e6e8ee' : '#2d3035'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                ctx.globalAlpha = .65 + .35 * Math.sin(now / 260);
                ctx.font = '600 16px Outfit, system-ui, sans-serif';
                ctx.fillText(L('Appuyez sur une flèche pour démarrer', 'Press an arrow key to start'), S / 2, S - 51);
                ctx.globalAlpha = 1;
            }
            if (over) {
                ctx.fillStyle = dark() ? 'rgba(20,23,33,.65)' : 'rgba(255,255,255,.7)';
                ctx.fillRect(0, S / 2 - 44, S, 88);
                ctx.fillStyle = dark() ? '#e6e8ee' : '#2d3035'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                ctx.font = '600 28px Outfit, system-ui, sans-serif'; ctx.fillText(L('Perdu !', 'Game over'), S / 2, S / 2 - 12);
                ctx.font = '500 14px Outfit, system-ui, sans-serif'; ctx.fillText(L('Touchez ou Entrée pour rejouer', 'Tap or Enter to retry'), S / 2, S / 2 + 18);
            }
        }

        function open() {
            if (state !== 'off') return;
            if (!wrap) build();
            fit(); reset(); state = 'morph'; t0 = performance.now(); morphT = 0;
            back.classList.add('on'); wrap.classList.add('on'); svg.classList.add('snake-hide');
            // le plateau s'agrandit depuis le logo
            const r = svg.getBoundingClientRect(), w = wrap.getBoundingClientRect();
            const dx = r.left + r.width / 2 - (w.left + w.width / 2), dy = r.top + r.height / 2 - (w.top + w.height / 2), sc = r.width / w.width;
            wrap.animate([{ transform: `translate(${dx}px,${dy}px) scale(${sc})`, opacity: .0 }, { transform: 'none', opacity: 1 }], { duration: 650, easing: 'cubic-bezier(.25,1.12,.4,1)' });
            try { cv.focus({ preventScroll: true }); } catch (e) { }
            if (window.__fogPoke) window.__fogPoke(r.left + r.width / 2, r.top + r.height / 2);
            if (!raf) raf = requestAnimationFrame(draw);
        }
        function close() {
            if (state === 'off') return;
            state = 'off';
            back.classList.remove('on'); wrap.classList.remove('on'); svg.classList.remove('snake-hide');
            cancelAnimationFrame(raf); raf = 0;
        }

        /* 4 clics rapides sur le logo */
        let clicks = 0, lastClick = 0;
        svg.addEventListener('click', () => {
            const now = performance.now();
            clicks = now - lastClick < 1200 ? clicks + 1 : 1; lastClick = now;
            if (clicks >= 4) { clicks = 0; open(); }
        });
        document.addEventListener('keydown', e => {
            if (state === 'off') return;
            const k = e.key.toLowerCase(), map = { arrowup: [0, -1], w: [0, -1], z: [0, -1], arrowdown: [0, 1], s: [0, 1], arrowleft: [-1, 0], a: [-1, 0], q: [-1, 0], arrowright: [1, 0], d: [1, 0] };
            if (k === 'escape') { close(); return; }
            if (k === 'p' && state === 'play') { paused = !paused; lastStep = performance.now(); return; }
            if ((k === 'enter' || k === ' ') && over) { restart(); e.preventDefault(); return; }
            if ((k === 'enter' || k === ' ') && state === 'ready') { startPlay(); e.preventDefault(); return; }
            if (map[k]) { steer(map[k]); e.preventDefault(); }
        });
        /* pause quand l'onglet est caché */
        addEventListener('hashchange', () => { if (state !== 'off' && /^#(realisations|parcours)/.test(location.hash)) close(); });
        document.addEventListener('langchange', () => { if (wrap && state !== 'off') help(); });
        window.__snake = { open, close };
    })();

    /* Couleurs du nom et du logo : volontairement simples. Une couleur unie qui change doucement en dégradé dans le temps,
       entièrement gérée par le CSS (variables --ink / --ink2 animées dans motion.css) ; aucune réaction à la souris. */

    /* ---------- Logo du hero : tracé animé ---------- */
    function drawLogo() {
        const path = $('#home svg path');
        if (!path || !path.getTotalLength) return;
        path.style.setProperty('--len', Math.ceil(path.getTotalLength()));
        restart(path, 'draw');
        const svg = $('#home svg');
        if (svg) { svg.style.setProperty('--len', Math.ceil(path.getTotalLength())); svg.classList.remove('fx-done'); restart(svg, 'go'); }
    }
    /* l'animation d'eau est finie : on retire le masque (plus de coût, rien n'est rogné) */
    document.addEventListener('animationend', e => {
        if (/^(smoke-in|title-smoke|fog-logo)$/.test(e.animationName)) e.target.classList.add('fx-done');
    });
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
            if (!cssHero) heroInner.style.opacity = String(clamp(1 - (y - innerHeight * 0.4) / (innerHeight * 0.6), 0, 1)); // sinon : CSS (voir motion.css)
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
                if (window.__fogReset) window.__fogReset(page.id);
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
        let low = lite; // rendu allégé : d'office sur mobile, et automatiquement si l'appareil n'atteint pas ~40 images/s
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
            SW = low ? 112 : 160;
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
            const k = low ? 0.3 : 0.4; // rendu basse résolution : le flou est naturel, le GPU respire
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

        let skip = false, warm = 0, fpsAcc = 0, fpsN = 0;
        function frame(now) {
            if (low && (skip = !skip)) { requestAnimationFrame(frame); return; } // 30 i/s en mode allégé
            const raw = now - last;
            const dt = Math.min(0.05, raw / 1000);
            last = now;
            if (!low && raw < 200 && ++warm > 40) { // mesure après la mise en route, hors onglet en veille
                fpsAcc += raw;
                if (++fpsN >= 90) { if (fpsAcc / fpsN > 26) { low = true; resize(); } fpsAcc = 0; fpsN = 0; }
            }
            tAcc += dt * (low ? 0.15 : 0.1) * (1 + pulse * 10);
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
                gl.uniform1f(sDecay, low ? 0.987 : 0.994);
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
            if (window.__fogDraw) window.__fogDraw(canvas, now);
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
