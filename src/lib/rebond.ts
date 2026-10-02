/**
 * « Rebond » — porté depuis doc/animation/react/Rebond.jsx.
 *
 * Petit saut avec écrasement / étirement, joué sur TOUS les boutons du site
 * (`.btn`) quand le pointeur y entre et au clic. Un seul écouteur délégué sur
 * le document, posé une fois par App.tsx (même principe que l'intercepteur de
 * liens) : aucun composant à envelopper, les boutons rendus depuis WordPress
 * ou ajoutés plus tard en profitent d'office.
 *
 * Joué via l'API Web Animations, sur `transform` : il se superpose aux
 * transitions de couleur du survol (index.css) sans les gêner. Rien n'est
 * joué si le visiteur a demandé moins de mouvement.
 */

const KEYS: Keyframe[] = [
  { transform: "none" },
  { transform: "scale(1.08, .9)", offset: 0.15 },
  { transform: "translateY(-14px) scale(.95, 1.07)", offset: 0.45 },
  { transform: "translateY(0) scale(1.05, .95)", offset: 0.75 },
  { transform: "none" },
];

const reduced = () =>
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

function jump(el: Element) {
  if (reduced()) return;
  // Un rebond déjà en cours est relancé plutôt qu'empilé.
  el.getAnimations().forEach((a) => a.id === "rebond" && a.cancel());
  const a = el.animate(KEYS, { duration: 560, easing: "ease-out" });
  a.id = "rebond";
}

let installed = false;

export function initRebond() {
  if (installed) return;
  installed = true;

  // Entrée du pointeur sur un bouton (et non sur chacun de ses enfants).
  document.addEventListener("pointerover", (e) => {
    const btn = (e.target as Element).closest?.(".btn");
    if (!btn) return;
    const from = e.relatedTarget as Node | null;
    if (from && btn.contains(from)) return;
    jump(btn);
  });

  document.addEventListener("click", (e) => {
    const btn = (e.target as Element).closest?.(".btn");
    if (btn) jump(btn);
  });
}
