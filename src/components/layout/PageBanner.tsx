import { useEffect, useRef, type ReactNode } from "react";
import reliefSrc from "../../assets/decor/relief.jpeg";
import { SiteHeader } from "./Header";

/**
 * Vidéo de fond en boucle, muette et décorative. Non rendue si l'utilisateur
 * a demandé moins d'animations : l'aplat vert et le relief restent seuls.
 */
function BannerVideo({ src }: { src: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  // Certains navigateurs ignorent autoplay tant que muted n'est pas posé en
  // propriété (et non en attribut).
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true;
    if (v.paused) v.play().catch(() => {});
  }, [src]);

  return (
    <>
      <video
        key={src}
        ref={ref}
        aria-hidden
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src={src} />
      </video>
      <div aria-hidden className="banniere-voile" />
    </>
  );
}

const mouvementReduit = () =>
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

/**
 * Bannière des pages internes : aplat vert à bord bas en pointe, relief à
 * droite (ou vidéo de fond si `video` est fourni et que le mouvement n'est
 * pas réduit), en-tête, texte d'accompagnement centré ; puis la tige qui
 * descend de la pointe et le nom de la page (h1) dessous.
 */
export function PageBanner({
  title,
  children,
  video,
}: {
  title: string;
  children?: ReactNode;
  video?: string | null;
}) {
  const avecVideo = !!video && !mouvementReduit();
  return (
    <>
      <section className="banniere on-dark">
        {avecVideo ? (
          <BannerVideo src={video} />
        ) : (
          <div aria-hidden className="banniere-relief" style={{ backgroundImage: `url(${reliefSrc})` }} />
        )}
        <SiteHeader />
        <div className="container-x relative z-[1] flex flex-col items-center text-center gap-5 pt-[clamp(48px,7vw,96px)] pb-[clamp(48px,6vw,80px)]">
          {children}
        </div>
      </section>
      <div aria-hidden className="tige" />
      <h1 className="titre-page">{title}</h1>
    </>
  );
}

/** Paragraphe d'accompagnement d'une bannière. `soft` : texte sable, 16 px. */
export function BannerText({ children, soft = false }: { children: ReactNode; soft?: boolean }) {
  return (
    <p
      className={`text-center ${
        soft
          ? "max-w-[680px] text-[clamp(17px,1.5vw,20px)] leading-[1.6] text-on-dark-soft"
          : "max-w-[820px] font-display font-medium text-[clamp(26px,3.2vw,44px)] leading-[1.15] tracking-[-0.01em]"
      }`}
    >
      {children}
    </p>
  );
}
