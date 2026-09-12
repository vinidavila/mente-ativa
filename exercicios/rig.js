/* rig.js — Figura articulada paramétrica (SVG) para demonstração de exercícios.
   Uso: RIG.svg(exercicio, pose) → string SVG estática
        RIG.animar(el, exercicio, opcoes) → controlador {parar(), velocidade(v), erro(bool)}
   Pose (graus, salvo indicado):
     tor  inclinação do tronco à frente (+) / trás (−)
     lean inclinação do corpo inteiro sobre o tornozelo (flexão na parede)
     hL/hR flexão de quadril (+ à frente, − atrás)   kL/kR flexão de joelho (0 = reto)
     aL/aR abdução de quadril (vista frontal)         sL/sR flexão de ombro (vista lateral)
     bL/bR abdução de ombro (vista frontal)           eL/eR flexão de cotovelo
     wr punho (+ flexão)  head inclinação da cabeça   heel 0–1 elevação do calcanhar
     toe 0–1 elevação da ponta do pé   grip 0–1 (bola)  lift eleva o quadril (tríceps na cadeira)
     elev altura do apoio (degrau)  dx deslocamento horizontal  livre: quadril fixo (sem gravidade)
*/
const RIG = (() => {
  const L = { head: 11, neck: 7, torso: 50, uarm: 29, farm: 27, hand: 8, thigh: 44, shank: 42, foot: 18, shW: 15, hipW: 9 };
  const D = Math.PI / 180;
  const W = 240, H = 270, GROUND = 246;
  const BASE = { tor: 0, lean: 0, hL: 0, hR: 0, kL: 0, kR: 0, aL: 0, aR: 0, sL: 0, sR: 0, bL: 0, bR: 0, eL: 0, eR: 0,
    wr: 0, head: 0, heel: 0, toe: 0, grip: 1, lift: 0, elev: 0, dx: 0, livre: 0 };

  const merge = (...ps) => Object.assign({}, BASE, ...ps);
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  const mix = (p, q, t) => { const r = {}; for (const k in BASE) r[k] = lerp(p[k], q[k], t); return r; };
  const v = (a) => [Math.sin(a * D), Math.cos(a * D)];
  const add = (p, d, len) => [p[0] + d[0] * len, p[1] + d[1] * len];

  /* ---------- cinemática ---------- */
  function pontosLateral(p) {
    const hip = [0, 0];
    const up = v(p.tor); // direção do tronco (para cima): sin(tor) à frente
    const sh = [hip[0] + up[0] * L.torso, hip[1] - up[1] * L.torso];
    const hd = v(p.tor + p.head);
    const neck = [sh[0] + hd[0] * L.neck, sh[1] - hd[1] * L.neck];
    const head = [neck[0] + hd[0] * L.head, neck[1] - hd[1] * L.head];
    const arm = (s, e, w) => {
      const el = add(sh, v(s), L.uarm);
      const wr = add(el, v(s + e), L.farm);
      const ha = add(wr, v(s + e + w), L.hand);
      return { el, wr, ha };
    };
    const leg = (h, k, heel, toe) => {
      const kn = add(hip, v(h), L.thigh);
      const an = add(kn, v(h - k), L.shank);
      // pé: calcanhar atrás/abaixo, ponta à frente
      let hl = [an[0] - 6, an[1] + 5], tp = [an[0] + L.foot - 4, an[1] + 5];
      if (heel > 0) { hl = [hl[0] + 3 * heel, hl[1] - 11 * heel]; an[1] -= 8 * heel; an[0] += 2 * heel; }
      if (toe > 0) { tp = [tp[0] - 2 * toe, tp[1] - 9 * toe]; }
      return { kn, an, hl, tp };
    };
    return { hip, sh, neck, head, aL: arm(p.sL, p.eL, p.wr), aR: arm(p.sR, p.eR, p.wr), lL: leg(p.hL, p.kL, p.heel, p.toe), lR: leg(p.hR, p.kR, p.heel, p.toe) };
  }
  function pontosFrontal(p) {
    const hip = [0, 0];
    const sh = [0, -L.torso], shL = [-L.shW, -L.torso], shR = [L.shW, -L.torso];
    const neck = [0, -L.torso - L.neck], head = [0, -L.torso - L.neck - L.head];
    const arm = (side, b, e) => { // side −1 esquerda (tela), +1 direita
      const o = side < 0 ? shL : shR;
      const el = [o[0] + side * Math.sin(b * D) * L.uarm, o[1] + Math.cos(b * D) * L.uarm];
      const a2 = b - e; // flexão em direção à linha média
      const wr = [el[0] + side * Math.sin(a2 * D) * L.farm, el[1] + Math.cos(a2 * D) * L.farm];
      const ha = [wr[0] + side * Math.sin(a2 * D) * L.hand, wr[1] + Math.cos(a2 * D) * L.hand];
      return { el, wr, ha };
    };
    const leg = (side, a, k, h) => {
      const o = [side * L.hipW, 0];
      const ft = Math.max(0.08, Math.cos(h * D)); // encurtamento da coxa por flexão de quadril (sai do plano)
      const kn = [o[0] + side * Math.sin(a * D) * L.thigh * ft, o[1] + Math.cos(a * D) * L.thigh * ft];
      const f = Math.max(0.08, Math.cos((k - h) * D)); // encurtamento da perna
      const an = [kn[0] + side * Math.sin(a * D) * L.shank * f, kn[1] + Math.cos(a * D) * L.shank * f];
      return { kn, an, hl: [an[0] - 5, an[1] + 5], tp: [an[0] + 5, an[1] + 5] };
    };
    return { hip, sh, neck, head, shL, shR, aL: arm(-1, p.bL, p.eL), aR: arm(1, p.bR, p.eR), lL: leg(-1, p.aL, p.kL, p.hL), lR: leg(1, p.aR, p.kR, p.hR) };
  }

  /* ---------- transformação para o mundo (gravidade / âncora) ---------- */
  function mundo(ex, p) {
    const P = ex.vista === 'frontal' ? pontosFrontal(p) : pontosLateral(p);
    // aplica inclinação do corpo inteiro sobre o tornozelo (lean)
    let pts = coletar(P);
    if (p.lean) {
      const piv = P.lL.an; const c = Math.cos(p.lean * D), s = Math.sin(p.lean * D);
      for (const pt of pts) { const x = pt[0] - piv[0], y = pt[1] - piv[1]; pt[0] = piv[0] + x * c - y * s; pt[1] = piv[1] + x * s + y * c; }
    }
    let ox = 0, oy = 0;
    if (p.livre) { ox = W / 2 - 10; oy = 150; }
    else {
      const lows = [P.lL.hl, P.lL.tp, P.lR.hl, P.lR.tp];
      const ymax = Math.max(...lows.map(q => q[1]));
      const suporte = (P.lL.hl[1] >= P.lR.hl[1] - 0.5) ? P.lL : P.lR;
      ox = W / 2 - suporte.an[0]; oy = GROUND - p.elev - ymax - p.lift;
    }
    ox += p.dx;
    for (const pt of pts) { pt[0] += ox; pt[1] += oy; }
    P.origem = [ox, oy];
    return P;
  }
  function coletar(P) {
    const out = [P.hip, P.sh, P.neck, P.head];
    if (P.shL) out.push(P.shL, P.shR);
    for (const k of ['aL', 'aR']) out.push(P[k].el, P[k].wr, P[k].ha);
    for (const k of ['lL', 'lR']) out.push(P[k].kn, P[k].an, P[k].hl, P[k].tp);
    return out;
  }

  /* ---------- desenho ---------- */
  const f = n => n.toFixed(1);
  const seg = (a, b, w, cls) => `<line class="${cls}" x1="${f(a[0])}" y1="${f(a[1])}" x2="${f(b[0])}" y2="${f(b[1])}" stroke-width="${w}"/>`;
  const dot = (a, r, cls) => `<circle class="${cls}" cx="${f(a[0])}" cy="${f(a[1])}" r="${r}"/>`;

  function membroBraco(A, cls, halter, bola, grip) {
    let s = seg(A.sh, A.el, 8, cls) + seg(A.el, A.wr, 7, cls) + seg(A.wr, A.ha, 5, cls) + dot(A.el, 3.2, cls + ' art');
    if (halter) s += `<g class="prop halter" transform="translate(${f(A.ha[0])},${f(A.ha[1])})"><rect x="-4" y="-9" width="8" height="18" rx="2"/><rect x="-7" y="-11" width="14" height="4" rx="1"/><rect x="-7" y="7" width="14" height="4" rx="1"/></g>`;
    if (bola) s += `<circle class="prop bola" cx="${f(A.ha[0])}" cy="${f(A.ha[1])}" r="${(7 * grip).toFixed(1)}"/>`;
    return s;
  }
  function membroPerna(Lg, cls, frontal) {
    let s = seg(Lg.hip, Lg.kn, 9, cls) + seg(Lg.kn, Lg.an, 8, cls) + dot(Lg.kn, 3.5, cls + ' art');
    s += frontal ? `<ellipse class="${cls} pe" cx="${f(Lg.an[0])}" cy="${f(Lg.an[1] + 5)}" rx="7" ry="4"/>`
                 : `<path class="${cls} pe" d="M${f(Lg.hl[0])},${f(Lg.hl[1])} L${f(Lg.an[0])},${f(Lg.an[1])} L${f(Lg.tp[0])},${f(Lg.tp[1])} Z" stroke-width="5" stroke-linejoin="round"/>`;
    return s;
  }

  function props(ex, p, P) {
    const o = P.origem; const g = GROUND - p.elev;
    const s = [];
    const pr = ex.props || [];
    if (pr.includes('cadeira') && ex.vista === 'frontal') { const y = GROUND - 46 + 6; s.push(`<g class="prop cadeira"><rect x="${o[0] - 24}" y="${y - 54}" width="48" height="60" rx="3"/><line x1="${o[0] - 21}" y1="${y + 6}" x2="${o[0] - 21}" y2="${GROUND}"/><line x1="${o[0] + 21}" y1="${y + 6}" x2="${o[0] + 21}" y2="${GROUND}"/></g>`); }
    else if (pr.includes('cadeira')) { // cadeira fixa no mundo: assento centrado onde o quadril fica na pose sentada (pé de apoio em W/2, coxa horizontal = 44 à frente)
      const x = W / 2 + p.dx - 62, y = GROUND - 46 + 6;
      s.push(`<g class="prop cadeira"><rect x="${x - 2}" y="${y}" width="34" height="5" rx="1.5"/><rect x="${x - 2}" y="${y - 52}" width="5" height="56" rx="2"/><line x1="${x + 1}" y1="${y + 5}" x2="${x + 1}" y2="${GROUND}"/><line x1="${x + 29}" y1="${y + 5}" x2="${x + 29}" y2="${GROUND}"/></g>`);
    }
    if (pr.includes('apoio')) { // encosto de cadeira à frente para apoio das mãos
      const x = (ex.vista === 'frontal' ? W / 2 + 48 : W / 2 + 36) + p.dx, y = GROUND - 84;
      s.push(`<g class="prop cadeira"><rect x="${x}" y="${y}" width="5" height="84" rx="2"/><rect x="${x - 1}" y="${y}" width="${ex.vista === 'frontal' ? 26 : 7}" height="5" rx="1.5"/>${ex.vista === 'frontal' ? `<line x1="${x + 25}" y1="${y}" x2="${x + 25}" y2="${GROUND}"/>` : ''}</g>`);
    }
    if (pr.includes('parede')) { if (ex._px == null) { const P0 = mundo(ex, merge(ex.base || {}, ex.quadros[0][0])); ex._px = P0.aR.ha[0] - W / 2 + 5; } const x = W / 2 + p.dx + ex._px; s.push(`<g class="prop parede"><line x1="${x}" y1="20" x2="${x}" y2="${GROUND}"/><line x1="${x + 4}" y1="20" x2="${x + 4}" y2="${GROUND}" stroke-dasharray="3 5"/></g>`); }
    if (pr.includes('degrau')) { const x = W / 2 + 16; s.push(`<rect class="prop degrau" x="${x}" y="${GROUND - 16}" width="44" height="16" rx="1"/>`); }
    if (pr.includes('obstaculo')) { const x = W / 2 + 10; s.push(`<rect class="prop degrau" x="${x}" y="${GROUND - 10}" width="12" height="10" rx="1"/>`); }
    if (pr.includes('legpress')) {
      const hip = P.hip, sh = P.sh; const dxs = sh[0] - hip[0], dys = sh[1] - hip[1]; const nrm = Math.hypot(dxs, dys);
      const bx = -dys / nrm * 9, by = dxs / nrm * 9; // normal ao tronco (para trás)
      const enc = `M${f(hip[0] - bx - dxs * .3)},${f(hip[1] - by - dys * .3)} L${f(sh[0] - bx + dxs * .3)},${f(sh[1] - by + dys * .3)}`;
      const t = P.lR.tp, a = P.lR.an; const ddx = t[0] - a[0], ddy = t[1] - a[1]; const n2 = Math.hypot(ddx, ddy);
      const px = ddx / n2, py = ddy / n2; // direção do pé; placa perpendicular ao pé
      const c = [t[0] + px * 4, t[1] + py * 4];
      const plate = `M${f(c[0] - py * 34)},${f(c[1] + px * 34)} L${f(c[0] + py * 26)},${f(c[1] - px * 26)}`;
      s.push(`<g class="prop maquina"><path d="${enc}" stroke-width="12" stroke-linecap="round"/><path d="M${f(hip[0])},${f(hip[1] + 12)} L${f(hip[0] - 30)},${f(hip[1] + 12)} L${f(hip[0] - 30)},${GROUND}" fill="none"/><path d="${plate}" stroke-width="9" stroke-linecap="round"/></g>`);
    }
    if (pr.includes('elastico_pe')) { const a = P.lL.tp; s.push(`<path class="prop elastico" d="M${f(a[0])},${f(a[1])} L${f(P.aL.ha[0])},${f(P.aL.ha[1])}"/>`); }
    if (pr.includes('elastico_costas')) { const a = [W / 2 + p.dx - 62, GROUND - 46 - 40]; s.push(`<path class="prop elastico" d="M${f(P.aL.ha[0])},${f(P.aL.ha[1])} L${f(a[0])},${f(a[1])} L${f(P.aR.ha[0])},${f(P.aR.ha[1])}"/>`); }
    if (pr.includes('elastico_alto')) { const a = [W / 2 + p.dx, 6]; s.push(`<path class="prop elastico" d="M${f(P.aL.ha[0])},${f(P.aL.ha[1])} L${f(a[0])},${f(a[1])} L${f(P.aR.ha[0])},${f(P.aR.ha[1])}"/><circle class="prop ancora" cx="${a[0]}" cy="${a[1]}" r="3"/>`); }
    if (pr.includes('elastico_maos')) { s.push(`<path class="prop elastico" d="M${f(P.aL.ha[0])},${f(P.aL.ha[1])} L${f(P.aR.ha[0])},${f(P.aR.ha[1])}"/>`); }
    if (pr.includes('bastao')) { s.push(ex.vista === 'frontal' ? `<line class="prop bastao" x1="${f(P.aL.ha[0] - 8)}" y1="${f(P.aL.ha[1])}" x2="${f(P.aR.ha[0] + 8)}" y2="${f(P.aR.ha[1])}"/>` : `<circle class="prop bastao" cx="${f(P.aR.ha[0])}" cy="${f(P.aR.ha[1])}" r="4"/>`); }
    return s.join('');
  }

  function guias(ex, p, P, mostrar) {
    if (!mostrar || !ex.guias) return '';
    const s = [];
    for (const g of ex.guias) {
      if (g === 'joelho-pe') { const k = P.lR.kn; s.push(`<line class="guia" x1="${f(k[0])}" y1="${f(k[1])}" x2="${f(k[0])}" y2="${GROUND - p.elev}"/><text class="guia-t" x="${f(k[0] + 4)}" y="${GROUND - 6 - p.elev}">joelho sobre o pé</text>`); }
      if (g === 'coluna') { const a = P.hip, b = P.head; s.push(`<line class="guia" x1="${f(a[0])}" y1="${f(a[1] + 10)}" x2="${f(b[0] + (b[0] - a[0]) * .2)}" y2="${f(b[1] - 14)}"/><text class="guia-t" x="${f(b[0] + 14)}" y="${f(b[1] - 4)}">coluna neutra</text>`); }
      if (g === 'cotovelo-colado') { const e = P.aR.el; s.push(`<circle class="guia-c" cx="${f(e[0])}" cy="${f(e[1])}" r="9"/><text class="guia-t" x="${f(e[0] + 12)}" y="${f(e[1] + 4)}">cotovelo junto ao corpo</text>`); }
      if (g === 'ombros-baixos') { const a = P.sh; s.push(`<text class="guia-t" x="${f(a[0] + 14)}" y="${f(a[1] - 2)}">ombros longe das orelhas</text>`); }
      if (g === 'olhar-frente') { const h = P.head; s.push(`<line class="guia" x1="${f(h[0] + 8)}" y1="${f(h[1])}" x2="${f(h[0] + 40)}" y2="${f(h[1])}"/><text class="guia-t" x="${f(h[0] + 42)}" y="${f(h[1] + 4)}">olhar à frente</text>`); }
      if (g === 'apoio-mao') { const h = P.aR.ha; s.push(`<circle class="guia-c" cx="${f(h[0])}" cy="${f(h[1])}" r="8"/><text class="guia-t" x="${f(h[0] + 10)}" y="${f(h[1] - 10)}">mão no apoio</text>`); }
    }
    return s.join('');
  }

  function corpo(ex, p, opts) {
    const P = mundo(ex, p);
    const frontal = ex.vista === 'frontal';
    const cls = opts.erro ? 'ink erro' : 'ink';
    const far = cls + ' longe';
    const halt = (ex.props || []).includes('halteres'), bola = (ex.props || []).includes('bola');
    let s = `<line class="chao" x1="0" y1="${GROUND}" x2="${W}" y2="${GROUND}"/>`;
    s += props(ex, p, P);
    // ordem: membros distantes → tronco → membros próximos
    s += membroBraco(Object.assign({ sh: frontal ? P.shL : P.sh }, P.aL), frontal ? cls : far, halt, bola, p.grip);
    s += membroPerna(Object.assign({ hip: frontal ? [P.hip[0] - L.hipW, P.hip[1]] : P.hip }, P.lL), frontal ? cls : far, frontal);
    if (frontal) s += `<path class="${cls} tronco" d="M${f(P.shL[0])},${f(P.shL[1])} L${f(P.shR[0])},${f(P.shR[1])} L${f(P.hip[0] + L.hipW)},${f(P.hip[1])} L${f(P.hip[0] - L.hipW)},${f(P.hip[1])} Z"/>`;
    else s += seg(P.hip, P.sh, 13, cls + ' tronco') + dot(P.hip, 5, cls + ' art');
    s += seg(P.sh, P.neck, 6, cls) + dot(P.head, L.head, cls + ' cabeca');
    if (!frontal) s += dot([P.head[0] + 7 * Math.cos((p.tor + p.head - 5) * D), P.head[1] + 1], 1.8, 'olho');
    s += membroPerna(Object.assign({ hip: frontal ? [P.hip[0] + L.hipW, P.hip[1]] : P.hip }, P.lR), cls, frontal);
    s += membroBraco(Object.assign({ sh: frontal ? P.shR : P.sh }, P.aR), cls, halt, bola, p.grip);
    s += guias(ex, p, P, opts.guias);
    if (opts.erro && ex.erro) s += `<text class="erro-t" x="${W / 2}" y="18" text-anchor="middle">✕ ${ex.erro.rotulo}</text>`;
    return s;
  }

  const CSS = `.ink{stroke:#1d2b33;fill:none;stroke-linecap:round}.ink.longe{opacity:.42}.ink.cabeca{fill:#1d2b33;stroke:none}.ink.art{fill:#f6f2ea;stroke:#1d2b33;stroke-width:1.6}.ink.tronco{}.tronco{fill:#1d2b33;stroke:#1d2b33;stroke-linejoin:round}.ink.pe{fill:#1d2b33}.olho{fill:#f6f2ea}.ink.erro{stroke:#b3261e}.ink.erro.cabeca,.ink.erro.pe,.erro.tronco{fill:#b3261e;stroke:#b3261e}.ink.erro.art{fill:#fde7e5;stroke:#b3261e}.chao{stroke:#9aa5ab;stroke-width:1.5}.prop{fill:#dfe6e9;stroke:#7c8b93;stroke-width:1.6;stroke-linejoin:round}.prop.cadeira line,.prop.parede line{stroke:#7c8b93;stroke-width:2.5}.prop.cadeira rect{fill:#c9d3d8}.prop.parede{fill:none}.prop.halter{fill:#4a5a63;stroke:none}.prop.bola{fill:#e0b34a;stroke:#9a7a2a}.prop.elastico{fill:none;stroke:#0e7c78;stroke-width:2.5;stroke-dasharray:4 3}.prop.ancora{fill:#0e7c78}.prop.bastao{stroke:#8a6a3a;stroke-width:3.5;fill:#8a6a3a}.prop.degrau{fill:#b5c2c8;stroke:#5f6f78;stroke-width:2}.prop.maquina{fill:#c9d3d8;stroke:#7c8b93;stroke-width:2.5}.guia{stroke:#0e7c78;stroke-width:1.4;stroke-dasharray:5 4;fill:none}.guia-c{fill:none;stroke:#0e7c78;stroke-width:1.6;stroke-dasharray:3 3}.guia-t{font:600 8.5px system-ui,sans-serif;fill:#0e7c78}.erro-t{font:700 9px system-ui,sans-serif;fill:#b3261e}`;

  function svg(ex, pose, opts = {}) {
    const p = merge(pose);
    return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" class="figura"><style>${CSS}</style>${corpo(ex, p, opts)}</svg>`;
  }

  /* ---------- animação por quadros-chave ---------- */
  // ex.quadros = [[pose0], [pose1, dur], [pose2, dur], ...] ; o ciclo volta ao quadro 0 no fim (dur do último item → retorno)
  function expandir(ex) {
    const q = ex.quadros.map(k => ({ p: merge(ex.base || {}, k[0]), d: k[1] || 0 }));
    const segs = [];
    for (let i = 1; i < q.length; i++) segs.push({ a: q[i - 1].p, b: q[i].p, d: q[i].d });
    if (ex.retorno !== false) segs.push({ a: q[q.length - 1].p, b: q[0].p, d: ex.retornoDur || 1.2 });
    return segs;
  }
  function poseNoTempo(segs, t) {
    const total = segs.reduce((s, x) => s + x.d, 0);
    let u = t % total;
    for (const s of segs) { if (u <= s.d) return mix(s.a, s.b, ease(u / s.d)); u -= s.d; }
    return segs[0].a;
  }
  function animar(el, ex, opts = {}) {
    const segs = expandir(opts.erro && ex.erro ? Object.assign({}, ex, { quadros: ex.erro.quadros || ex.quadros, base: Object.assign({}, ex.base || {}, ex.erro.base || {}) }) : ex);
    let vel = opts.velocidade || 1, run = true, t0 = performance.now(), acc = 0, last = t0;
    const st = { erro: !!opts.erro, guias: opts.guias !== false && !opts.erro };
    el.innerHTML = svg(ex, segs[0].a, st);
    const svgEl = el.querySelector('svg');
    function frame(now) {
      if (!run) return;
      acc += (now - last) / 1000 * vel; last = now;
      const p = poseNoTempo(segs, acc);
      svgEl.innerHTML = `<style>${CSS}</style>` + corpo(ex, p, st);
      requestAnimationFrame(frame);
    }
    if (!window.matchMedia || !window.matchMedia('(prefers-reduced-motion: reduce)').matches) requestAnimationFrame(frame);
    return { parar() { run = false; }, velocidade(x) { vel = x; }, get pose() { return poseNoTempo(segs, acc); } };
  }
  // quadros estáticos para impressão (início, meio/pico, fim)
  function quadrosEstaticos(ex, opts = {}) {
    const q = ex.quadros.map(k => merge(ex.base || {}, k[0]));
    const picos = q.length <= 3 ? q : [q[0], q[Math.floor(q.length / 2)], q[q.length - 1]];
    return picos.map(p => svg(ex, p, { guias: opts.guias !== false }));
  }
  // anima todas as figuras de uma lista enquanto estiverem visíveis na tela (IntersectionObserver)
  function animarVisiveis(elementos, obterEx, opts = {}) {
    const ativos = new Map();
    const io = new IntersectionObserver(entries => {
      for (const en of entries) {
        const el = en.target;
        if (en.isIntersecting && !ativos.has(el)) ativos.set(el, animar(el, obterEx(el), Object.assign({ guias: false }, opts)));
        else if (!en.isIntersecting && ativos.has(el)) { ativos.get(el).parar(); ativos.delete(el); el.innerHTML = svg(obterEx(el), merge(obterEx(el).base || {}, obterEx(el).quadros[0][0]), { guias: false }); }
      }
    }, { rootMargin: '80px' });
    elementos.forEach(el => io.observe(el));
    return { parar() { ativos.forEach(a => a.parar()); ativos.clear(); io.disconnect(); } };
  }
  return { svg, animar, quadrosEstaticos, animarVisiveis, merge, BASE };
})();
if (typeof module !== 'undefined') module.exports = RIG;
