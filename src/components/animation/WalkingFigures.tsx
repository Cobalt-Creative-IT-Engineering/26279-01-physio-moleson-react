import { useEffect, useRef } from "react";

/**
 * « Bonhomme en mouvement » — porté depuis doc/animation/.
 *
 * Trois silhouettes marchent sur trois plans de profondeur, passent par une
 * phase de course puis un saut, devant des collines et des halos qui dérivent
 * lentement. Décor de bandeau : le composant se pose en fond absolu, le
 * contenu passe au-dessus.
 *
 * Le fichier source était un export « DC » (runtime propriétaire de 69 ko,
 * balises <x-dc>, React exposé en global). Seule la logique d'animation est
 * reprise ici, en React standard. Les couleurs passent par les rampes
 * --anim-* de index.css, dérivées des couleurs de la charte.
 *
 * L'animation est purement décorative : aria-hidden, et elle s'arrête à la
 * fois hors écran (IntersectionObserver) et si le visiteur a demandé moins de
 * mouvement (prefers-reduced-motion) — la charte s'adressant notamment à des
 * personnes âgées, ce second point n'est pas cosmétique.
 */

interface Props {
  /** Nombre de silhouettes affichées (1 à 3). */
  figures?: number;
  /** Multiplicateur de vitesse. */
  speed?: number;
  /**
   * Hauteur du « sol » en PIXELS depuis le bas de la scène.
   *
   * Tout le sol — collines, bande de sol et couloirs de marche — vit entre 0,68
   * et 1 de la hauteur dans le dessin d'origine. Ce réglage recomprime cette
   * zone dans les `groundPx` derniers pixels, ce qui fait descendre les
   * silhouettes sans rogner la scène : le conteneur reste PLEINE HAUTEUR, là où
   * le borner à une bande produisait une couture horizontale et coupait les
   * halos.
   *
   * En pixels et non en fraction, à dessein : la hauteur du bandeau dépend du
   * contenu venu de WordPress (sous-titre, chiffres clés). Un repère en
   * pourcentage se décale dès que ce contenu change et les silhouettes
   * remontent sur le texte ; un ancrage au bas de la section ne bouge pas.
   * Prévoir un `padding-bottom` au moins égal à cette valeur.
   */
  groundPx?: number;
  className?: string;
}

type Fig = { s: number; laneRaw: number; x: number; t: number; ph: number };
type Part = Record<string, SVGElement | null>;

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const smooth = (a: number, b: number, t: number) => {
  const x = Math.max(0, Math.min(1, (t - a) / (b - a)));
  return x * x * (3 - 2 * x);
};

/** Cycle de 24 s : marche, course (5,2 → 19,8 s), saut (12 → 15 s). */
function pose(t: number) {
  const c = t % 24;
  const r = smooth(5.2, 6.4, c) * (1 - smooth(18.6, 19.8, c));
  const j = c >= 12 && c < 15 ? smooth(12, 12.2, c) * (1 - smooth(14.8, 15, c)) : 0;
  return {
    r,
    j,
    A:    lerp(0.42, 0.82, r),
    K:    lerp(0.45, 1.7, r),
    lean: lerp(0.06, 0.26, r),
    S:    lerp(0.45, 0.75, r),
    E:    lerp(0.3, 1.6, r),
    fq:   lerp(0.95, 1.45, r),
    q:    c >= 12 && c < 15 ? (c - 12) % 1 : 0,
    spd:  lerp(lerp(62, 175, r), 120, j),
  };
}

export function WalkingFigures({ figures = 3, speed = 1, groundPx = 0, className = "" }: Props) {
  const svgRef   = useRef<SVGSVGElement | null>(null);
  const parts    = useRef<Record<string, Part>>({ p0: {}, p1: {}, p2: {} });
  const els      = useRef<Part>({});
  const figsRef  = useRef<Fig[]>([]);
  const propsRef = useRef({ figures, speed, groundPx });
  propsRef.current = { figures, speed, groundPx };

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const host = svg.parentElement;
    if (!host) return;

    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    let W = 0, H = 0, hillT = 0, raf = 0, visible = true;
    let last = performance.now();

    const resize = () => {
      W = host.clientWidth || 1200;
      H = host.clientHeight || 800;
      svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
      if (!figsRef.current.length) {
        figsRef.current = [
          { s: 1,    laneRaw: 0.88, x: 0.15 * W, t: 0,  ph: Math.random() * 6 },
          { s: 0.68, laneRaw: 0.79, x: 0.6  * W, t: 9,  ph: Math.random() * 6 },
          { s: 0.46, laneRaw: 0.72, x: 0.35 * W, t: 16, ph: Math.random() * 6 },
        ];
      }
    };

    const hill = (base: number, amp: number, k: number, sp: number, ph: number) => {
      let d = `M0 ${H} `;
      for (let x = 0; x <= W + 40; x += 40) {
        const y = base + Math.sin(x * k + hillT * sp + ph) * amp
                       + Math.sin(x * k * 2.3 + ph + hillT * sp * 1.7) * amp * 0.35;
        d += `L${x} ${y.toFixed(1)} `;
      }
      return `${d}L${W} ${H}Z`;
    };

    const step = (dt: number) => {
      if (!W) return;
      const n = Math.max(1, Math.min(3, propsRef.current.figures));
      // 0 = proportions d'origine (zone de sol = 32 % de la hauteur).
      const band = propsRef.current.groundPx || H * 0.32;
      const top = H - band;
      /** Fraction d'origine → pixel, recomprimé dans la bande de sol. */
      const remap = (y: number) => top + ((y - 0.68) / 0.32) * band;
      // L'amplitude des collines suit la compression, sinon les crêtes
      // remonteraient au-dessus de l'horizon voulu.
      const k = band / (H * 0.32);
      hillT += dt;

      els.current.h1?.setAttribute("d", hill(remap(0.68), 22 * k, 0.004, -0.05, 0));
      els.current.h2?.setAttribute("d", hill(remap(0.76), 14 * k, 0.006, -0.12, 2));

      const groundY = remap(0.84);
      els.current.sol?.setAttribute("y", String(groundY));
      els.current.sol?.setAttribute("height", String(Math.max(0, H - groundY)));

      figsRef.current.forEach((f, i) => {
        const g = els.current[`f${i}`] as SVGGElement | null;
        if (!g) return;
        g.style.display = i < n ? "" : "none";
        if (i >= n) return;

        f.t += dt;
        const P = pose(f.t);
        const s = f.s * Math.max(0.7, Math.min(1.3, H / 800));
        f.ph += dt * Math.PI * 2 * P.fq;
        f.x  += P.spd * s * dt;
        if (f.x > W + 80 * s) f.x = -80 * s;

        const th = 26 * s, sh = 26 * s, to = 40 * s, ua = 19 * s, la = 17 * s, hr = 11 * s;
        const pt = (x: number, y: number, a: number, l: number): [number, number] =>
          [x + Math.sin(a) * l, y + Math.cos(a) * l];

        // Phase de saut : accroupissement puis suspension.
        const q = P.q;
        const crouch = q < 0.3 ? Math.sin((Math.PI * q) / 0.3)
                               : q > 0.88 ? Math.sin((Math.PI * (q - 0.88)) / 0.12) * 0.5 : 0;
        const air = q >= 0.3 && q < 0.9 ? Math.sin((Math.PI * (q - 0.3)) / 0.6) : 0;

        const legs = [0, Math.PI].map((o) => {
          const ph = f.ph + o;
          let a = P.A * Math.sin(ph);
          let fl = 0.1 + P.K * Math.max(0, Math.cos(ph)) ** 1.5;
          const ja = 0.9 * crouch + 0.7 * air + (o ? 0.15 : -0.1) * air;
          const jf = 1.7 * crouch + 1.3 * air;
          a  = lerp(a, ja, P.j);
          fl = lerp(fl, jf, P.j);
          return [a, a - fl] as [number, number];
        });

        const arms = [0, Math.PI].map((o) => {
          const ph = f.ph + o;
          const a = -P.S * Math.sin(ph);
          const ja = lerp(-0.6 * crouch, 2.7, air);
          const je = lerp(0.3, 0.4, air);
          return [lerp(a, ja, P.j), lerp(P.E, je, P.j)] as [number, number];
        });

        const lean = lerp(P.lean, lerp(0.35 * crouch, 0.05, air), P.j);

        let maxY = 0;
        legs.forEach(([a, b]) => {
          const k = pt(0, 0, a, th), ft = pt(k[0], k[1], b, sh);
          maxY = Math.max(maxY, ft[1] + 2.5 * s, k[1]);
        });

        const ground = remap(f.laneRaw);
        const hop = P.j * air * 60 * s + (1 - P.j) * P.r * Math.abs(Math.sin(f.ph)) * 7 * s;
        const hx = f.x, hy = ground - maxY - hop;
        const shx = hx + Math.sin(lean) * to, shy = hy - Math.cos(lean) * to;
        const hdx = shx + Math.sin(lean) * (hr + 4 * s), hdy = shy - Math.cos(lean) * (hr + 4 * s);

        const lp = legs.map(([a, b]) => {
          const k = pt(hx, hy, a, th), ft = pt(k[0], k[1], b, sh);
          const toe = pt(ft[0], ft[1], b + Math.PI / 2 + 0.2, 6 * s);
          return `M${hx} ${hy}L${k[0]} ${k[1]}L${ft[0]} ${ft[1]}L${toe[0]} ${toe[1]}`;
        });

        const sx = shx - Math.sin(lean) * 5 * s, sy = shy + Math.cos(lean) * 5 * s;
        const ap = arms.map(([a, e]) => {
          const el = pt(sx, sy, a, ua), hd = pt(el[0], el[1], a + e, la);
          return `M${sx} ${sy}L${el[0]} ${el[1]}L${hd[0]} ${hd[1]}`;
        });

        const E = parts.current[`p${i}`];
        E.legB?.setAttribute("d", lp[1]);
        E.legF?.setAttribute("d", lp[0]);
        E.armB?.setAttribute("d", ap[1]);
        E.armF?.setAttribute("d", ap[0]);
        E.torso?.setAttribute("d", `M${hx} ${hy}L${shx} ${shy}`);
        E.head?.setAttribute("cx", String(hdx));
        E.head?.setAttribute("cy", String(hdy));
        E.head?.setAttribute("r",  String(hr));

        const hs = 1 - Math.min(0.6, hop / (80 * s));
        E.shadow?.setAttribute("cx", String(hx + 4 * s));
        E.shadow?.setAttribute("cy", String(ground + 3 * s));
        E.shadow?.setAttribute("rx", String(26 * s * hs));
        E.shadow?.setAttribute("ry", String(5 * s * hs));
      });
    };

    const ro = new ResizeObserver(resize);
    ro.observe(host);
    resize();

    // Hors écran, la boucle s'arrête : inutile de peindre un décor invisible.
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 });
    io.observe(host);

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (visible) step(reduced ? 0 : dt * propsRef.current.speed);
      raf = requestAnimationFrame(loop);
    };
    step(0); // première pose, même si l'animation est désactivée
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  const setPart = (fig: number, name: string) => (el: SVGElement | null) => {
    parts.current[`p${fig}`][name] = el;
  };
  const setEl = (name: string) => (el: SVGElement | null) => { els.current[name] = el; };

  /** i = 0 silhouette de premier plan, 2 = la plus lointaine. */
  const figure = (i: number) => {
    const col = [
      ["var(--anim-terracotta-500)", "var(--anim-terracotta-300)"],
      ["var(--anim-sauge-500)",      "var(--anim-sauge-300)"],
      ["var(--anim-neutre-400)",     "var(--anim-neutre-300)"],
    ][i];
    const w = 9 * [1, 0.68, 0.46][i] * 1.1;
    const st = (c: string) => ({
      fill: "none", stroke: c, strokeWidth: w,
      strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
    });
    return (
      <g key={i} ref={setEl(`f${i}`)} opacity={[1, 0.9, 0.75][i]}>
        <ellipse ref={setPart(i, "shadow")} style={{ fill: "var(--anim-neutre-300)", opacity: 0.5 }} />
        <path   ref={setPart(i, "armB")}  style={st(col[1])} />
        <path   ref={setPart(i, "legB")}  style={st(col[1])} />
        <path   ref={setPart(i, "torso")} style={st(col[0])} />
        <path   ref={setPart(i, "legF")}  style={st(col[0])} />
        <path   ref={setPart(i, "armF")}  style={st(col[0])} />
        <circle ref={setPart(i, "head")}  style={{ fill: col[0] }} />
      </g>
    );
  };

  return (
    <svg
      ref={svgRef}
      aria-hidden="true"
      focusable="false"
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      style={{ display: "block" }}
    >
      {/* Les halos ne sont plus dessinés ici : ils vivent dans FloatingBlobs,
          posé une fois pour tout le site. En garder une copie ici les
          doublerait sur l'accueil. */}
      <path ref={setEl("h1")} style={{ fill: "var(--anim-sauge-200)", opacity: 0.55 }} />
      <path ref={setEl("h2")} style={{ fill: "var(--anim-neutre-200)" }} />
      {/* Ordre de profondeur : la plus lointaine d'abord, la plus proche en dernier. */}
      {figure(2)}
      {figure(1)}
      <rect ref={setEl("sol")} x={0} width="100%" style={{ fill: "var(--anim-neutre-100)", opacity: 0.6 }} />
      {figure(0)}
    </svg>
  );
}
