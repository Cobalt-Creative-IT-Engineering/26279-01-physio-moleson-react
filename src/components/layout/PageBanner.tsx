import type { ReactNode } from "react";
import reliefSrc from "../../assets/decor/relief.jpeg";
import { SiteHeader } from "./Header";

/**
 * Bannière des pages internes : aplat vert à bord bas en pointe, relief à
 * droite, en-tête, texte d'accompagnement centré ; puis la tige qui descend
 * de la pointe et le nom de la page (h1) dessous.
 */
export function PageBanner({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <>
      <section className="banniere on-dark">
        <div aria-hidden className="banniere-relief" style={{ backgroundImage: `url(${reliefSrc})` }} />
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
      className={`max-w-[640px] text-center ${
        soft ? "text-[16px] leading-[1.6] text-on-dark-soft" : "text-[clamp(17px,1.6vw,20px)] leading-[1.55]"
      }`}
    >
      {children}
    </p>
  );
}
