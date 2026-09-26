import { useEffect, useRef } from "react";

/**
 * « Grimpeur à la corde » — porté depuis doc/animation/Haltero et rope.
 *
 * L'haltérophile du fichier d'origine n'est pas repris : seule la corde est
 * gardée, en bande étroite sur le bord droit de l'accueil.
 *
 * La position du grimpeur suit la progression du défilement (lissée), et la
 * corde reçoit une impulsion proportionnelle à la VITESSE de défilement,
 * amortie par un ressort — d'où le balancement quand on descend vite.
 * Au repos, un léger mouvement subsiste : lent balancement de pendule et onde
 * qui descend la corde, de faible amplitude pour rester en arrière-plan.
 *
 * Décoratif : aria-hidden. La boucle s'arrête hors écran, et le composant ne
 * s'affiche pas du tout si le visiteur a demandé moins de mouvement — une
 * animation pilotée au défilement n'a pas d'état statique intéressant.
 */

interface Props {
  className?: string;
}

/** Cinématique inverse à deux segments : place le coude / le genou. */
function ik(
  ax: number, ay: number, bx: number, by: number,
  l1: number, l2: number, sg: number,
): [number, number] {
  const dx = bx - ax, dy = by - ay;
  const d = Math.min(Math.hypot(dx, dy), l1 + l2 - 0.01);
  const base = Math.atan2(dy, dx);
  const al = Math.acos(Math.max(-1, Math.min(1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d))));
  const a = base + sg * al;
  return [ax + Math.cos(a) * l1, ay + Math.sin(a) * l1];
}

export function RopeClimber({ className = "" }: Props) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const els = useRef<Record<string, SVGElement | null>>({});

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const host = svg.parentElement;
    if (!host) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    let W = 0, H = 0, raf = 0, visible = true;
    let p = 0, pPrev = 0, phi = 0, theta = 0, omega = 0, t = 0;
    let last = performance.now();

    const resize = () => {
      // Sous 2xl le conteneur est en display:none : clientWidth vaut 0, et on
      // laisse W à 0 pour que la boucle ne calcule rien plutôt que de dessiner
      // une scène invisible.
      W = host.clientWidth;
      H = host.clientHeight;
      if (W) svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    };

    const scrollP = () => {
      const se = document.scrollingElement || document.documentElement;
      const max = se.scrollHeight - window.innerHeight;
      return max > 0 ? Math.max(0, Math.min(1, window.scrollY / max)) : 0;
    };

    const set = (el: SVGElement | null, o: Record<string, number>) => {
      if (!el) return;
      for (const k in o) el.setAttribute(k, String(o[k]));
    };

    const step = (dt: number) => {
      if (!W) return;
      const E = els.current;
      const s = Math.max(0.75, Math.min(1.4, H / 800));
      const ground = H * 0.86;
      const th = 26 * s, sh = 26 * s, to = 40 * s, ua = 19 * s, la = 17 * s, hr = 11 * s;

      // Lissage du défilement, puis ressort amorti alimenté par la vitesse.
      const target = scrollP();
      p += (target - p) * Math.min(1, dt * 7);
      const dp = p - pPrev;
      pPrev = p;
      const vel = dt > 0 ? dp / dt : 0;
      omega += (-theta * 18 - omega * 3.5 + vel * 0.06) * dt;
      theta += omega * dt;

      // Mouvement de repos : balancement de ~1° sur ~5 s, et onde qui descend
      // la corde en s'amplifiant vers l'extrémité libre (nulle au point
      // d'attache).
      t += dt;
      const sway = 0.018 * Math.sin(t * 1.3);
      const wave = 4 * s * Math.sin(t * 0.9 + 0.8);

      const rx0 = W * 0.5, topY = 0, len = ground - 6 * s;
      const ropeX = (y: number) => {
        const u = Math.max(0, Math.min(1, (y - topY) / len));
        return rx0 + Math.tan(theta + sway) * (y - topY) + wave * u * Math.sin(t * 2.1 - u * 4);
      };

      let d = `M${rx0} ${topY}`;
      for (let i = 1; i <= 24; i++) {
        const y = topY + (len * i) / 24;
        d += `L${ropeX(y)} ${y}`;
      }
      E.rope?.setAttribute("d", d);
      E.rope2?.setAttribute("d", d);
      set(E.knot,  { cx: ropeX(len), cy: len, r: 6 * s });

      const Ytop = H * 0.12, Ybot = ground - to - 42 * s;
      const Y = Ytop + (Ybot - Ytop) * p;
      phi += ((Ybot - Ytop) * dp) / (26 * s) * Math.PI;
      const sn = Math.sin(phi);

      const shx = ropeX(Y) - 13 * s, shy = Y;
      const hpx = shx - 3 * s, hpy = Y + to;

      const hy1 = Y - 12 * s - 22 * s * (0.5 + 0.5 * sn);
      const hy2 = Y - 12 * s - 22 * s * (0.5 - 0.5 * sn);
      ([[hy1, "arm1"], [hy2, "arm0"]] as [number, string][]).forEach(([hy, n], j) => {
        const hx = ropeX(hy) - (j ? 1 : -1) * 1.5 * s;
        const e = ik(shx, shy, hx, hy, ua, la, -1);
        E[n]?.setAttribute("d", `M${shx} ${shy}L${e[0]} ${e[1]}L${hx} ${hy}`);
      });

      ([[hpy + 38 * s + 5 * s * sn, 2, "leg1"], [hpy + 44 * s - 5 * s * sn, -4, "leg0"]] as
        [number, number, string][]).forEach(([fy, ox, n]) => {
        const fxr = ropeX(fy) + ox * s;
        const kn = ik(hpx, hpy, fxr, fy, th, sh, -1);
        E[n]?.setAttribute("d",
          `M${hpx} ${hpy}L${kn[0]} ${kn[1]}L${fxr} ${fy}L${fxr + 6 * s} ${fy + 2 * s}`);
      });

      E.torso?.setAttribute("d", `M${hpx} ${hpy}L${shx} ${shy}`);
      set(E.head, { cx: shx - 2 * s, cy: Y - hr - 4 * s, r: hr });

      const sw = 9 * s;
      ["leg0", "leg1", "arm0", "arm1", "torso"].forEach((n) =>
        E[n]?.style.setProperty("stroke-width", String(sw)));
      E.rope?.style.setProperty("stroke-width", String(7 * s));
      E.rope2?.style.setProperty("stroke-width", String(7 * s));
    };

    const ro = new ResizeObserver(resize);
    ro.observe(host);
    resize();

    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 });
    io.observe(host);

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (visible) step(dt);
      raf = requestAnimationFrame(loop);
    };
    step(0);
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  const r = (name: string) => (el: SVGElement | null) => { els.current[name] = el; };
  const st = (c: string) => ({
    fill: "none", stroke: c,
    strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
  });
  const front = "var(--anim-sauge-500)";
  const back  = "var(--anim-sauge-300)";

  return (
    <svg
      ref={svgRef}
      aria-hidden="true"
      focusable="false"
      width="100%"
      height="100%"
      className={className}
      style={{ display: "block" }}
    >
      <path   ref={r("rope")}  style={{ fill: "none", stroke: "var(--anim-neutre-500)", strokeLinecap: "round", strokeLinejoin: "round" }} />
      <path   ref={r("rope2")} style={{ fill: "none", stroke: "var(--anim-neutre-400)", strokeDasharray: "5 7", strokeLinecap: "round", strokeLinejoin: "round" }} />
      <circle ref={r("knot")}  style={{ fill: "var(--anim-neutre-500)" }} />
      <g>
        <path   ref={r("arm0")}  style={st(back)} />
        <path   ref={r("leg0")}  style={st(back)} />
        <path   ref={r("torso")} style={st(front)} />
        <path   ref={r("leg1")}  style={st(front)} />
        <circle ref={r("head")}  style={{ fill: front }} />
        <path   ref={r("arm1")}  style={st(front)} />
      </g>
    </svg>
  );
}
