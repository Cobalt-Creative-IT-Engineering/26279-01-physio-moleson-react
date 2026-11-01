import { useEffect, useRef, Fragment } from "react";
import { useAccueilOptions } from "../hooks/useWordPress";
import { SiteHeader } from "../components/layout";
import { HERO_VIDEO_SOURCES, TBOOKING_URL } from "../config/site";
import { HEROS, INTRO_ACCUEIL, VALEURS } from "../config/contenu";
import { setPageMeta } from "../lib/meta";

/** Nom du héros, sur deux lignes comme dans la maquette. */
const HERO_LIGNES = ["Physio", "du Moléson"];

const reducedMotion = () =>
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

/** Lien externe → nouvel onglet ; interne → navigation SPA. */
function linkProps(url: string) {
  return /^https?:/.test(url) ? { href: url, target: "_blank", rel: "noopener" } : { href: url };
}

/* ─── Héros : vidéo en boucle sur fond rayé ────────────────────────────── */

function Heros() {
  const { data, status } = useAccueilOptions();
  const videoRef = useRef<HTMLVideoElement>(null);
  // Pas de vidéo en mouvement pour qui a demandé moins d'animations : le
  // fond rayé reste seul.
  const showVideo = !reducedMotion();

  // Certains navigateurs ignorent autoplay tant que muted n'est pas posé
  // en propriété (et non en attribut).
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    if (v.paused) v.play().catch(() => {});
  }, []);

  const loading = status === "loading" && !data;
  const words = HERO_LIGNES.map((l) => l.split(" "));
  const afterTitle = 300 + words.flat().length * 140;
  let w = 0;

  const primary   = data?.ctaPrimary?.url   ? data.ctaPrimary   : { label: "Prendre rendez-vous", url: TBOOKING_URL };
  const secondary = data?.ctaSecondary?.url ? data.ctaSecondary : { label: "Découvrir nos services", url: "/prestations" };

  return (
    <section className="banniere heros on-dark">
      <div aria-hidden className="heros-rayures" />
      {showVideo && (
        <video
          ref={videoRef}
          aria-hidden
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
        >
          {HERO_VIDEO_SOURCES.map((src) => (
            <source key={src} src={src} type="video/mp4" />
          ))}
        </video>
      )}
      <div aria-hidden className="heros-voile" />

      <SiteHeader />

      <div className="container-x relative z-[2] mt-auto pb-[clamp(64px,9vw,112px)] flex flex-col gap-[22px]">
        <h1
          className="font-medium text-[clamp(48px,7.5vw,104px)] leading-[0.98] tracking-[-0.025em]"
          aria-label={HERO_LIGNES.join(" ")}
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

        {/* Accroche, présentation et boutons : éditables dans WordPress, avec
            les textes de la maquette en repli. Rendus une fois la donnée
            connue, pour ne pas animer un texte aussitôt remplacé. */}
        {!loading && (
          <>
            <p
              className="hero-tagline font-display text-[clamp(22px,2.4vw,32px)] leading-[1.25] max-w-[640px]"
              style={{ animationDelay: `${afterTitle}ms` }}
            >
              {data?.title || HEROS.accroche}
            </p>
            <p
              className="hero-tagline text-[clamp(16px,1.3vw,18px)] leading-[1.6] max-w-[560px] text-on-dark-soft"
              style={{ animationDelay: `${afterTitle + 200}ms` }}
            >
              {data?.subtitle || HEROS.presentation}
            </p>
            <div
              className="hero-tagline flex flex-wrap gap-3.5 mt-2"
              style={{ animationDelay: `${afterTitle + 400}ms` }}
            >
              <a {...linkProps(primary.url)} className="btn btn-jaune">
                {primary.label} <span aria-hidden>→</span>
              </a>
              <a {...linkProps(secondary.url)} className="btn btn-contour">
                {secondary.label}
              </a>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

/* ─── Mosaïque des valeurs ─────────────────────────────────────────────── */

type Valeur = (typeof VALEURS)[number];

function ValeurCase({ v, className }: { v: Valeur; className: string }) {
  return (
    <div className={`valeur ${className}`}>
      <img src={v.photo} alt="" loading="lazy" className="valeur-photo" />
      <div aria-hidden className="valeur-voile" />
      <a
        href={v.creditUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-3 right-4 z-[1] text-[11px] text-on-dark-soft"
      >
        Photo : {v.credit} / Unsplash
      </a>
      <div className="absolute inset-x-0 bottom-0 pointer-events-none p-[clamp(18px,2.2vw,28px)] flex flex-col gap-2.5 text-on-dark">
        <h3 className="text-on-dark text-[clamp(24px,2.4vw,32px)] leading-[1.1]">{v.titre}</h3>
        <p className="valeur-texte text-[15.5px] leading-[1.55] max-w-[440px]">{v.texte}</p>
      </div>
    </div>
  );
}

function Valeurs() {
  const [haut, grand, petit1, petit2] = VALEURS;
  return (
    <section id="valeurs" aria-label="Nos valeurs" className="section-y">
      <div className="container-x flex flex-col gap-3">
        <ValeurCase v={haut} className="h-[clamp(180px,20vw,240px)]" />
        <div className="flex flex-wrap gap-3">
          <ValeurCase v={grand} className="flex-[2_1_420px] min-h-[clamp(360px,40vw,520px)]" />
          <div className="flex-[1_1_280px] flex flex-col gap-3">
            <ValeurCase v={petit1} className="flex-[1_1_0] min-h-[220px]" />
            <ValeurCase v={petit2} className="flex-[1_1_0] min-h-[220px]" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Page ─────────────────────────────────────────────────────────────── */

export function HomePage() {
  useEffect(() => {
    setPageMeta({
      title: undefined,
      description:
        "Cabinet de physiothérapie à Bulle. Une équipe de cinq thérapeutes diplômé·e·s à votre écoute, au pied du Moléson.",
    });
  }, []);

  return (
    <>
      <Heros />

      <section id="a-propos" className="pt-[clamp(72px,9vw,128px)]">
        <div className="container-x grid grid-cols-[repeat(auto-fit,minmax(min(100%,360px),1fr))] gap-[clamp(28px,5vw,80px)] items-start">
          <h2 className="text-vert text-[clamp(44px,6vw,84px)] leading-none tracking-[-0.025em]">
            {INTRO_ACCUEIL.titre}
          </h2>
          <div className="flex flex-col gap-[22px] items-start">
            <p className="text-[clamp(16px,1.35vw,19px)] leading-[1.65]">{INTRO_ACCUEIL.texte}</p>
            <a href="/cabinet" className="btn btn-ligne">Découvrir le cabinet →</a>
          </div>
        </div>
      </section>

      <Valeurs />
    </>
  );
}
