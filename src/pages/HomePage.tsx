import { useEffect, useRef, Fragment } from "react";
import { useAccueilOptions } from "../hooks/useWordPress";
import type { AccueilOptions, AccueilValeur } from "../types/wordpress";
import { SiteHeader } from "../components/layout";
import { setPageMeta } from "../lib/meta";
import { useReveal } from "../hooks/useReveal";

/* Tout le contenu de l'accueil vient d'ACF (page d'options « Accueil ») :
   pas de texte de repli. Un champ vide n'est simplement pas rendu. */

/** Titre sur deux lignes comme dans la maquette : premier mot, puis le reste. */
function lignesTitre(titre: string): string[] {
  const [premier, ...reste] = titre.trim().split(/\s+/);
  return reste.length ? [premier, reste.join(" ")] : [premier];
}

const reducedMotion = () =>
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

/** Lien externe → nouvel onglet ; interne → navigation SPA. */
function linkProps(url: string) {
  return /^https?:/.test(url) ? { href: url, target: "_blank", rel: "noopener" } : { href: url };
}

/* ─── Héros : vidéo en boucle sur fond rayé ────────────────────────────── */

function Heros({ data, loading }: { data: AccueilOptions["heros"] | undefined; loading: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  // Pas de vidéo en mouvement pour qui a demandé moins d'animations : le
  // fond rayé reste seul.
  const showVideo = !reducedMotion();

  const video = data?.video ?? null;

  // Certains navigateurs ignorent autoplay tant que muted n'est pas posé
  // en propriété (et non en attribut). Relancé quand l'URL ACF arrive.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    if (v.paused) v.play().catch(() => {});
  }, [video]);

  const lignes = data?.titre ? lignesTitre(data.titre) : [];
  const words = lignes.map((l) => l.split(" "));
  const afterTitle = 300 + words.flat().length * 140;
  let w = 0;

  const primary   = data?.cta1.url ? data.cta1 : null;
  const secondary = data?.cta2.url ? data.cta2 : null;

  return (
    <section className="banniere heros on-dark">
      <div aria-hidden className="heros-rayures" />
      {showVideo && video && (
        <div aria-hidden className="banniere-video">
          {/* Pas de `type` : le fichier ACF peut être un .mp4 ou un .mov. */}
          <video key={video} ref={videoRef} autoPlay muted loop playsInline preload="auto">
            <source src={video} />
          </video>
        </div>
      )}
      <div aria-hidden className="heros-voile" />

      <SiteHeader />

      {/* Tailles et espaces suivent aussi la hauteur (svh) : sur un écran bas,
          toute la bannière, pointe comprise, tient dans la fenêtre. */}
      <div className="container-x relative z-[2] mt-auto pb-[clamp(20px,min(9vw,30svh-180px),112px)] flex flex-col gap-[clamp(10px,2.2svh,22px)]">
        {lignes.length > 0 && (
          <h1
            className="font-medium text-[clamp(40px,min(7.5vw,11svh),104px)] leading-[0.98] tracking-[-0.025em]"
            aria-label={lignes.join(" ")}
          >
            {words.map((line, li) => (
              <Fragment key={li}>
                {li > 0 && <br />}
                {line.map((word, wi) => (
                  <Fragment key={wi}>
                    {wi > 0 && " "}
                    <span aria-hidden className="hero-word" style={{ animationDelay: `${150 + w++ * 140}ms` }}>
                      {word}
                    </span>
                  </Fragment>
                ))}
              </Fragment>
            ))}
          </h1>
        )}

        {/* Accroche, présentation et boutons : rendus une fois la donnée
            ACF connue. */}
        {!loading && (
          <>
            <p
              className="hero-tagline font-display text-[clamp(20px,min(2.4vw,3.8svh),32px)] leading-[1.25] max-w-[640px]"
              style={{ animationDelay: `${afterTitle}ms` }}
            >
              {data?.sousTitre}
            </p>
            <p
              className="hero-tagline text-[clamp(16px,1.3vw,18px)] leading-[1.6] max-w-[560px] text-on-dark-soft"
              style={{ animationDelay: `${afterTitle + 200}ms` }}
            >
              {data?.description}
            </p>
            <div
              className="hero-tagline flex flex-wrap gap-3.5 mt-2"
              style={{ animationDelay: `${afterTitle + 400}ms` }}
            >
              {primary && (
                <a {...linkProps(primary.url)} className="btn btn-jaune">
                  {primary.label} <span aria-hidden>→</span>
                </a>
              )}
              {secondary && (
                <a {...linkProps(secondary.url)} className="btn btn-contour">
                  {secondary.label}
                </a>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

/* ─── Valeurs : bande olive en biseau sur photo, cartes en quinconce ──── */

function ValeurCarte({ v, delai }: { v: AccueilValeur; delai: string }) {
  return (
    <article className={`valeur reveal ${delai}`}>
      {v.image && (
        <div className="valeur-cadre">
          <img src={v.image.url} alt={v.image.alt} loading="lazy" className="valeur-photo" />
        </div>
      )}
      <h3 className="text-on-dark text-[clamp(24px,2.2vw,30px)] leading-[1.1] mt-[clamp(18px,2vw,26px)]">
        {v.titre}
      </h3>
      {v.description && <p className="text-on-dark text-[15.5px] leading-[1.6] mt-3">{v.description}</p>}
    </article>
  );
}

/** Décalage d'apparition par carte (classes complètes pour Tailwind). */
const DELAIS = ["", "[--reveal-delay:120ms]", "[--reveal-delay:240ms]", "[--reveal-delay:360ms]"];

function Valeurs({ data, montagne }: { data: AccueilOptions["valeurs"]; montagne: string | null }) {
  const ref = useReveal<HTMLElement>(0.15);
  const valeurs = data.items.filter((v) => v.titre);
  // Montagne du haut : `imageSection1` ; fond de la bande : `imageDeFond`.
  // Chacune reprend l'autre si elle manque.
  const fond = data.fond?.url ?? montagne;
  const haut = montagne ?? fond;

  return (
    <div className="valeurs-bloc">
    {/* Montagne au-dessus de la bande, visible aussi dans le biseau. */}
    {haut && <div aria-hidden className="valeurs-montagne" style={{ backgroundImage: `url(${haut})` }} />}
    <section id="valeurs" ref={ref} aria-label="Nos valeurs" className="valeurs on-dark">
      {fond && <div aria-hidden className="valeurs-fond" style={{ backgroundImage: `url(${fond})` }} />}
      <div className="container-x relative">
        <div className="valeurs-grille">
          {valeurs.map((v, i) => (
            <ValeurCarte key={`${i}-${v.titre}`} v={v} delai={DELAIS[i] ?? ""} />
          ))}
        </div>
      </div>
    </section>
    </div>
  );
}

/* ─── Page ─────────────────────────────────────────────────────────────── */

export function HomePage() {
  // Un seul appel pour toute la page ; chaque section reçoit son groupe ACF.
  const { data, status } = useAccueilOptions();
  const loading = status === "loading" && !data;
  const introRef = useReveal<HTMLElement>();
  const slogan = data?.slogan;
  const sloganCta = slogan?.cta.url ? slogan.cta : null;
  useEffect(() => {
    setPageMeta({
      title: undefined,
      description:
        "Cabinet de physiothérapie à Bulle. Une équipe de cinq thérapeutes diplômé·e·s à votre écoute, au pied du Moléson.",
    });
  }, []);

  return (
    <>
      <Heros data={data?.heros} loading={loading} />

      <section id="a-propos" ref={introRef} className="pt-[clamp(72px,9vw,128px)]">
        {/* Dès 1024 px, le titre prend un peu plus de la moitié de la largeur :
            moins de lignes. Lignes équilibrées (text-wrap: balance). */}
        <div className="container-x grid grid-cols-1 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] gap-[clamp(28px,5vw,80px)] items-start">
          <h2 className="reveal reveal-gauche text-vert text-[clamp(36px,4.2vw,60px)] leading-[1.05] tracking-[-0.025em] [text-wrap:balance]">
            {slogan?.titre}
          </h2>
          <div className="flex flex-col gap-[22px] items-start">
            <p className="reveal reveal-droite [--reveal-delay:150ms] text-[clamp(16px,1.35vw,19px)] leading-[1.65]">{slogan?.description}</p>
            {/* Enveloppe : la transition de .reveal écraserait celles du bouton. */}
            {sloganCta && (
              <div className="reveal reveal-droite [--reveal-delay:300ms]">
                <a {...linkProps(sloganCta.url)} className="btn btn-ligne">{sloganCta.label} →</a>
              </div>
            )}
          </div>
        </div>
      </section>

      {data && <Valeurs data={data.valeurs} montagne={data.imageSection1?.url ?? null} />}
    </>
  );
}
