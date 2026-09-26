import { useEffect, useRef } from "react";

/**
 * « Footer montagne » — porté depuis doc/animation/.
 *
 * Paysage en couches posé juste au-dessus du pied de page : massif enneigé,
 * contreforts, crête boisée, un haltérophile et un coureur qui suit le relief
 * de la crête (la hauteur du sol est échantillonnée sur le tracé réel, via
 * getPointAtLength).
 *
 * ── Écart charte assumé ────────────────────────────────────────────────────
 * La charte pose que le Moléson « n'est jamais redessiné, décliné en motif ou
 * répété en fond : une seule présence par support suffit ». Cette illustration
 * le redessine, et le logo est déjà présent dans l'en-tête et le pied de page.
 * L'intégration a été validée en connaissance de cause ; à revoir avec la
 * graphiste si le sujet est rouvert.
 * ───────────────────────────────────────────────────────────────────────────
 *
 * Seule adaptation à la charte : la crête de premier plan et les sapins sont
 * en encre (et non dans le vert foncé du fichier d'origine), pour que la base
 * du dessin se fonde exactement dans le pied de page.
 */

interface Props {
  /** Enneigement du sommet. */
  snow?: boolean;
  /** Multiplicateur de vitesse. */
  speed?: number;
}

/** Sapins : sommet, puis base gauche / base droite. Coordonnées du fichier d'origine. */
const SPRUCES: [number, number, number][] = [
  [70, 232, 266], [92, 228, 262], [180, 226, 260], [205, 222, 256], [228, 225, 259],
  [610, 226, 260], [632, 222, 256], [1010, 224, 258], [1034, 220, 254], [1058, 223, 257],
  [1260, 222, 256], [1284, 218, 252], [1380, 220, 254],
];

const RIDGE_D =
  "M0 320 L0 268 Q120 240 240 258 Q360 236 480 262 Q620 240 760 258 Q900 234 1040 256 " +
  "Q1180 238 1300 254 Q1380 246 1440 252 L1440 320 Z";
const PEAK_D =
  "M0 320 L0 250 Q150 235 260 200 Q380 160 470 108 L520 72 Q560 66 590 62 L630 46 L662 60 " +
  "L690 64 L722 48 Q750 50 766 72 L800 120 L842 166 Q882 196 930 200 Q990 186 1040 176 " +
  "Q1100 168 1150 180 Q1250 200 1440 215 L1440 320 Z";

/** Table de pose de l'haltérophile : [temps, genou, hanche, buste, épaule, coude]. */
const LIFT_KEYS: number[][] = [
  [0, .05, -.05, .05, 0, 0], [.8, .05, -.05, .05, 0, 0], [1.8, .55, -1.25, .95, 0, 0],
  [2.3, .55, -1.25, .95, 0, 0], [3.1, .05, -.05, .05, 0, 0], [3.5, .05, -.05, .05, 0, 0],
  [3.95, .25, -.35, -.02, 1.7, 3.9], [4.5, .1, -.1, 0, 1.7, 3.9], [4.8, .3, -.4, -.02, 1.7, 3.9],
  [5.15, .05, -.05, -.04, 3.05, 3.1], [6.1, .05, -.05, -.04, 3.05, 3.1],
  [6.8, .12, -.15, 0, 1.7, 3.9], [7.4, .05, -.05, .05, 0, 0], [8, .05, -.05, .05, 0, 0],
];

export function MountainFooter({ snow = true, speed = 1 }: Props) {
  const svgRef  = useRef<SVGSVGElement | null>(null);
  const ridgeEl = useRef<SVGPathElement | null>(null);
  const L = useRef<Record<string, SVGElement | null>>({});
  const R = useRef<Record<string, SVGElement | null>>({});
  const speedRef = useRef(speed);
  speedRef.current = speed;

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    let t = 0, raf = 0, visible = true;
    let last = performance.now();
    let ridge: number[] | null = null;

    const set = (el: SVGElement | null, o: Record<string, number>) => {
      if (!el) return;
      for (const k in o) el.setAttribute(k, String(o[k]));
    };

    /** Hauteur du sol sous x, échantillonnée une fois sur le tracé de la crête. */
    const ridgeY = (x: number) => {
      const path = ridgeEl.current;
      if (!path) return 256;
      if (!ridge) {
        const n = path.getTotalLength();
        const arr = new Array(1441).fill(400);
        for (let l = 0; l <= n; l += 2) {
          const pt = path.getPointAtLength(l);
          if (pt.y < 300) {
            const xi = Math.round(pt.x);
            if (xi >= 0 && xi <= 1440) arr[xi] = Math.min(arr[xi], pt.y);
          }
        }
        for (let i = 0; i <= 1440; i++) if (arr[i] >= 400) arr[i] = arr[i - 1] || 256;
        ridge = arr;
      }
      return ridge[Math.max(0, Math.min(1440, Math.round(x)))];
    };

    const drawRunner = () => {
      const r = R.current;
      if (!r.torso) return;
      const s = 0.5, th = 26 * s, sh = 26 * s, to = 40 * s, ua = 19 * s, la = 17 * s, hr = 11 * s;
      const x = ((t * 95) % 1600) - 80;
      const ph = t * Math.PI * 2 * 1.45;
      const pt = (px: number, py: number, a: number, l: number): [number, number] =>
        [px + Math.sin(a) * l, py + Math.cos(a) * l];

      const legs = [0, Math.PI].map((o) => {
        const p = ph + o, a = 0.82 * Math.sin(p);
        const fl = 0.1 + 1.7 * Math.max(0, Math.cos(p)) ** 1.5;
        return [a, a - fl] as [number, number];
      });
      const arms = [0, Math.PI].map((o) => [-0.75 * Math.sin(ph + o), 1.6] as [number, number]);

      let maxY = 0;
      legs.forEach(([a, b]) => {
        const k = pt(0, 0, a, th), ft = pt(k[0], k[1], b, sh);
        maxY = Math.max(maxY, ft[1] + 2.5 * s, k[1]);
      });

      const g = ridgeY(x) - 1;
      const hop = Math.abs(Math.sin(ph)) * 6 * s, lean = 0.26;
      const hx = x, hy = g - maxY - hop;
      const shx = hx + Math.sin(lean) * to, shy = hy - Math.cos(lean) * to;

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

      r.legB?.setAttribute("d", lp[1]);
      r.legF?.setAttribute("d", lp[0]);
      r.armB?.setAttribute("d", ap[1]);
      r.armF?.setAttribute("d", ap[0]);
      r.torso?.setAttribute("d", `M${hx} ${hy}L${shx} ${shy}`);
      set(r.head, {
        cx: shx + Math.sin(lean) * (hr + 4 * s),
        cy: shy - Math.cos(lean) * (hr + 4 * s),
        r: hr,
      });
    };

    const draw = () => {
      const l = L.current;
      if (!l.torso) return;
      const s = 0.55, fx = 700, ground = 251;
      const th = 26 * s, sh = 26 * s, to = 40 * s, ua = 19 * s, la = 17 * s, hr = 11 * s;
      const P = (x: number, y: number, a: number, len: number): [number, number] =>
        [x + Math.sin(a) * len, y + Math.cos(a) * len];

      const c = t % 8;
      let i = 0;
      while (i < LIFT_KEYS.length - 2 && c >= LIFT_KEYS[i + 1][0]) i++;
      const a = LIFT_KEYS[i], b = LIFT_KEYS[i + 1];
      let k = (c - a[0]) / (b[0] - a[0]);
      k = k * k * (3 - 2 * k);
      const q = a.map((v, j) => v + (b[j] - v) * k);

      // Vu de profil et quasi immobile : les deux jambes et les deux bras sont
      // superposés et d'une seule couleur, sans décalage de profondeur (qui
      // dédoublait les membres). Le coureur, lui, garde ses deux tons.
      const legs = [fx, fx].map((x) => {
        const kn: [number, number] = [x + Math.sin(q[1]) * sh, ground - Math.cos(q[1]) * sh];
        const hp: [number, number] = [kn[0] + Math.sin(q[2]) * th, kn[1] - Math.cos(q[2]) * th];
        return [x, kn, hp] as [number, [number, number], [number, number]];
      });
      const hp = legs[1][2];
      const sho: [number, number] = [hp[0] + Math.sin(q[3]) * to, hp[1] - Math.cos(q[3]) * to];
      const head: [number, number] = [
        sho[0] + Math.sin(q[3]) * (hr + 4 * s),
        sho[1] - Math.cos(q[3]) * (hr + 4 * s),
      ];
      const s2: [number, number] = [sho[0] - Math.sin(q[3]) * 5 * s, sho[1] + Math.cos(q[3]) * 5 * s];
      const el = P(s2[0], s2[1], q[4], ua), hd = P(el[0], el[1], q[5], la);

      legs.forEach(([x, kn, h], j) =>
        l[`leg${j}`]?.setAttribute("d",
          `M${h[0]} ${h[1]}L${kn[0]} ${kn[1]}L${x} ${ground - 2.5 * s}L${x + 7 * s} ${ground - 2.5 * s}`));
      l.torso?.setAttribute("d", `M${hp[0]} ${hp[1]}L${sho[0]} ${sho[1]}`);
      set(l.head, { cx: head[0], cy: head[1], r: hr });
      l.arm0?.setAttribute("d", `M${s2[0]} ${s2[1]}L${el[0]} ${el[1]}L${hd[0]} ${hd[1]}`);
      l.arm1?.setAttribute("d", `M${s2[0]} ${s2[1]}L${el[0]} ${el[1]}L${hd[0]} ${hd[1]}`);

      drawRunner();

      set(l.plateB, { cx: hd[0] - 3 * s, cy: hd[1], r: 21 * s });
      set(l.plate,  { cx: hd[0], cy: hd[1], r: 21 * s });
      set(l.hub,    { cx: hd[0], cy: hd[1], r: 5 * s });
    };

    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 });
    io.observe(svg);

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!reduced && visible) t += dt * speedRef.current;
      if (visible) draw();
      raf = requestAnimationFrame(loop);
    };
    draw();
    raf = requestAnimationFrame(loop);

    return () => { cancelAnimationFrame(raf); io.disconnect(); };
  }, []);

  const rl = (n: string) => (el: SVGElement | null) => { L.current[n] = el; };
  const rr = (n: string) => (el: SVGElement | null) => { R.current[n] = el; };
  const stroke = (c: string, w: number) => ({
    fill: "none", stroke: c, strokeWidth: w,
    strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
  });

  const terra = "var(--anim-terracotta-500)";
  const terraBack = "var(--anim-terracotta-300)";
  // Encre plutôt que vert foncé : la base du dessin se fond dans le pied de page.
  const ridgeColor = "var(--color-dark)";

  return (
    <svg
      ref={svgRef}
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 1440 320"
      /* « meet » + hauteur automatique : la scène entière est toujours visible.
         Le fichier d'origine utilisait « slice » avec une hauteur plafonnée
         (clamp(160px,22vw,320px)) ; ça tient à la largeur de sa maquette, mais
         au-delà d'environ 1500 px le facteur d'échelle horizontal dépasse le
         vertical et le recadrage mange le haut du dessin — le sommet se
         retrouve tranché net. La bande grandit donc avec la largeur, au lieu
         d'être rognée. */
      preserveAspectRatio="xMidYMax meet"
      /* Ciel transparent : le fond de page (blanc cassé) traverse, sans
         rupture de ton avec la section qui précède. */
      style={{ display: "block", width: "100%", height: "auto", marginBottom: -2 }}
    >
      <defs>
        <clipPath id="massif-clip"><path d={PEAK_D} /></clipPath>
      </defs>

      {/* Contreforts lointains */}
      <path
        d="M0 320 L0 190 L60 150 L110 176 L170 118 L222 160 L282 104 L334 142 L392 92 L452 134 L500 120 L560 96 L620 124 L690 90 L750 118 L800 94 L852 126 L906 100 L958 134 L1000 122 L1080 108 L1130 150 L1190 82 L1242 128 L1300 98 L1352 146 L1402 112 L1440 138 L1440 320 Z"
        style={{ fill: "var(--anim-sauge-200)", stroke: "var(--anim-sauge-200)", strokeWidth: 8, strokeLinejoin: "round" }}
      />
      <path
        d="M880 320 L880 170 L940 128 L985 150 L1030 112 L1075 150 L1110 136 L1170 175 L1440 190 L1440 320 Z"
        style={{ fill: "var(--anim-sauge-300)", stroke: "var(--anim-sauge-300)", strokeWidth: 8, strokeLinejoin: "round" }}
      />
      {/* Massif principal */}
      <path
        d={PEAK_D}
        style={{ fill: "var(--anim-sauge-400)", stroke: "var(--anim-sauge-400)", strokeWidth: 6, strokeLinejoin: "round" }}
      />

      {snow && (
        <g clipPath="url(#massif-clip)">
          <path
            d="M340 0 L880 0 L880 150 Q850 128 822 152 Q800 118 772 140 Q748 104 720 128 Q698 98 672 122 Q648 92 622 118 Q598 88 572 112 Q548 86 520 114 Q494 96 468 128 Q440 116 400 128 Q370 134 340 138 Z"
            style={{ fill: "var(--anim-neutre-100)" }}
          />
          <path
            d="M1060 150 Q1100 140 1150 150 Q1250 170 1440 190 L1440 212 Q1300 198 1150 186 Q1100 176 1060 180 Z"
            style={{ fill: "var(--anim-neutre-100)", opacity: 0.7 }}
          />
        </g>
      )}

      {/* Crête de premier plan — sert aussi de sol au coureur. */}
      <path ref={ridgeEl} d={RIDGE_D} style={{ fill: ridgeColor }} />
      {SPRUCES.map(([x, top, base], i) => (
        <polygon key={i} points={`${x},${top} ${x - 9},${base} ${x + 9},${base}`} style={{ fill: ridgeColor }} />
      ))}

      {/* Haltérophile + coureur */}
      <g>
        <circle ref={rl("plateB")} style={{ fill: "var(--anim-sauge-600)" }} />
        <path   ref={rl("arm0")}  style={stroke(terra, 5)} />
        <path   ref={rl("leg0")}  style={stroke(terra, 5)} />
        <path   ref={rl("torso")} style={stroke(terra, 5)} />
        <path   ref={rl("leg1")}  style={stroke(terra, 5)} />
        <circle ref={rl("head")}  style={{ fill: terra }} />
        <path   ref={rl("arm1")}  style={stroke(terra, 5)} />
        <circle ref={rl("plate")} style={{ fill: "var(--anim-neutre-100)" }} />
        <circle ref={rl("hub")}   style={{ fill: "var(--anim-sauge-700)" }} />
        <g>
          <path   ref={rr("armB")}  style={stroke(terraBack, 4.5)} />
          <path   ref={rr("legB")}  style={stroke(terraBack, 4.5)} />
          <path   ref={rr("torso")} style={stroke(terra, 4.5)} />
          <path   ref={rr("legF")}  style={stroke(terra, 4.5)} />
          <path   ref={rr("armF")}  style={stroke(terra, 4.5)} />
          <circle ref={rr("head")}  style={{ fill: terra }} />
        </g>
      </g>
    </svg>
  );
}
