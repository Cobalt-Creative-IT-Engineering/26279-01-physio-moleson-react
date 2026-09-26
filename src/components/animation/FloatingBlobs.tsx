import { useEffect, useRef } from "react";

/**
 * Halos dérivants — extraits de « Bonhomme en mouvement » (doc/animation/).
 *
 * Trois disques très clairs qui dérivent et respirent lentement. Posés en
 * couche fixe derrière tout le site, ils donnent au fond uni son mouvement
 * sans rien coûter en lisibilité : leurs teintes sont les plus claires des
 * rampes, à quelques pour cent du fond de page.
 *
 * La couche se place en `-z-10` : elle passe au-dessus du fond de page mais
 * DERRIÈRE le fond des blocs opaques, donc le pied de page en encre la masque
 * naturellement, sans avoir à la désactiver page par page.
 *
 * Décoratif : aria-hidden, et figé si le visiteur a demandé moins de mouvement.
 */

export function FloatingBlobs() {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const blobs = useRef<(SVGCircleElement | null)[]>([]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const host = svg.parentElement;
    if (!host) return;

    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    let W = 0, H = 0, t = 0, raf = 0;
    let last = performance.now();

    const resize = () => {
      W = host.clientWidth || 1200;
      H = host.clientHeight || 800;
      svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    };

    const step = (dt: number) => {
      if (!W) return;
      t += dt;
      blobs.current.forEach((el, i) => {
        if (!el) return;
        const cx = W * [0.78, 0.12, 0.55][i] + Math.sin(t * 0.13 + i * 2) * 40;
        const cy = H * [0.22, 0.3, 0.08][i] + Math.cos(t * 0.11 + i) * 30;
        const rr = Math.min(W, H) * [0.32, 0.2, 0.14][i] * (1 + Math.sin(t * 0.2 + i) * 0.05);
        el.setAttribute("cx", String(cx));
        el.setAttribute("cy", String(cy));
        el.setAttribute("r", String(rr));
      });
    };

    const ro = new ResizeObserver(resize);
    ro.observe(host);
    resize();

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      step(reduced ? 0 : dt);
      raf = requestAnimationFrame(loop);
    };
    step(0);
    raf = requestAnimationFrame(loop);

    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return (
    <svg
      ref={svgRef}
      aria-hidden="true"
      focusable="false"
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid slice"
      style={{ display: "block" }}
    >
      {["var(--anim-sauge-200)", "var(--anim-neutre-100)", "var(--anim-terracotta-200)"].map((c, i) => (
        <circle key={i} ref={(el) => { blobs.current[i] = el; }} style={{ fill: c, opacity: 0.5 }} />
      ))}
    </svg>
  );
}
