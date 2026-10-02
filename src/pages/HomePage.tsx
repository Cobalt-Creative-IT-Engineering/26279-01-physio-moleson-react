import { useEffect, Fragment } from "react";
import { useAccueilOptions } from "../hooks/useWordPress";
import { SITE_CONFIG } from "../config/site";
import reliefSrc from "../assets/decor/relief-topo.webp";
import { ContactSection } from "../components/ContactSection";
import { setPageMeta } from "../lib/meta";

/**
 * Fondu du relief : droit, le long des bords (et non en ellipse). Deux
 * dégradés linéaires intersectés — vers la gauche (côté texte) et vers le
 * bas (côté crête) —, le relief reste plein dans le haut à droite.
 */
const RELIEF_MASK =
  "linear-gradient(to left, #000 40%, transparent 100%), linear-gradient(to bottom, #000 55%, transparent 100%)";

export function HomePage() {
  const { data, status } = useAccueilOptions();

  useEffect(() => {
    setPageMeta({
      title: undefined,
      description:
        "Cabinet de physiothérapie à Bulle. Une équipe de cinq thérapeutes diplômé·e·s à votre écoute, au pied du Moléson.",
    });
  }, []);

  const loading = status === "loading" && !data;
  // Délai d'apparition du premier élément qui suit le nom (ms).
  const afterTitle = 300 + SITE_CONFIG.name.split(" ").length * 140;

  return (
    <>
      {/* Hero — aplat vert Moléson, texte sable (charte, composant « Héros »).
          Volontairement épuré : le nom du cabinet et sa phrase d'accroche,
          rien d'autre. */}
      <section className="on-dark relative overflow-hidden min-h-[560px] lg:min-h-[680px] flex items-center pt-[112px] pb-16 lg:pt-[140px] lg:pb-[120px]">
        {/* Relief topographique (lignes de doc/print/relief_2.jpeg recolorées
            en sable sur le vert Moléson exact) posé en haut à droite, fondu
            vers le texte et vers le bas, et atténué pour se fondre dans
            l'aplat. */}
        <img
          src={reliefSrc}
          alt=""
          aria-hidden
          className="hero-relief absolute top-0 right-0 h-full w-full sm:w-[90%] lg:w-[70%] max-w-[1100px] object-cover object-right-top pointer-events-none select-none"
          style={{
            WebkitMaskImage: RELIEF_MASK,
            maskImage: RELIEF_MASK,
            WebkitMaskComposite: "source-in",
            maskComposite: "intersect",
          }}
        />

        <div className="container-x relative">
          <h1 className="h1 hero-title" aria-label={SITE_CONFIG.name}>
            {SITE_CONFIG.name.split(" ").map((word, i) => (
              <Fragment key={i}>
                {i > 0 && " "}
                <span
                  aria-hidden
                  className="hero-word"
                  style={{ animationDelay: `${150 + i * 140}ms` }}
                >
                  {word}
                </span>
              </Fragment>
            ))}
          </h1>

          {/* Accroche, présentation et appels à l'action : éditables dans
              WordPress (page d'accueil), avec des valeurs par défaut. Rendus
              une fois la donnée connue, pour ne pas animer un texte de repli
              aussitôt remplacé ; ils apparaissent l'un après l'autre, après
              le nom. */}
          {!loading && (
            <>
              <p
                className="hero-tagline font-display text-[24px] md:text-[30px] lg:text-[36px] leading-[1.2] max-w-[720px] mt-6 md:mt-8"
                style={{ animationDelay: `${afterTitle}ms` }}
              >
                {data?.title || "Une équipe à votre écoute, votre santé en mouvement."}
              </p>

              <p
                className="hero-tagline text-[17px] md:text-[18px] max-w-[520px] mt-6"
                style={{ animationDelay: `${afterTitle + 200}ms` }}
              >
                {data?.subtitle ||
                  "Cinq thérapeutes diplômés vous accompagnent avec passion dans votre rééducation pour soulager vos douleurs et retrouver votre mobilité, au pied du Moléson."}
              </p>

              <div
                className="hero-tagline flex flex-wrap gap-3.5 items-center mt-8 md:mt-10"
                style={{ animationDelay: `${afterTitle + 400}ms` }}
              >
                <a href={data?.ctaPrimary?.url || "/#contact"} className="btn btn-primary">
                  {data?.ctaPrimary?.label || "Prendre rendez-vous"}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                </a>
                <a href={data?.ctaSecondary?.url || "/services"} className="btn btn-ghost">
                  {data?.ctaSecondary?.label || "Découvrir nos services"}
                </a>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Bord inférieur du héros en relief : crête de collines irrégulière
          plutôt qu'une coupe droite. Couleur via --color-dark ; étiré en
          largeur (preserveAspectRatio « none »), hauteur fixe par palier.
          -1 px pour éviter un liseré d'anticrénelage avec l'aplat. */}
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 1440 90"
        preserveAspectRatio="none"
        className="block w-full h-10 md:h-16 lg:h-24 -mt-px"
      >
        <path
          d="M0 0 H1440 V22 C1400 30 1370 52 1320 58 C1270 64 1245 44 1200 42 C1150 40 1120 70 1050 82 C985 92 940 66 900 54 C860 42 830 50 790 60 C740 72 700 56 655 40 C610 24 560 30 515 50 C470 70 430 86 370 84 C310 82 290 60 245 52 C200 44 175 58 130 62 C80 66 40 46 0 38 Z"
          style={{ fill: "var(--color-dark)" }}
        />
      </svg>

      {/* Contact (intégré à l'accueil) */}
      <ContactSection />
    </>
  );
}
