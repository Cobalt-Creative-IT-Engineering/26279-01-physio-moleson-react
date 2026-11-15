import { useEffect, Fragment } from "react";
import { useCabinetOptions } from "../hooks/useWordPress";
import type { CabinetItem, WPImage } from "../types/wordpress";
import { PageBanner, BannerText } from "../components/layout";
import { setPageMeta } from "../lib/meta";

/** Ancre d'un cabinet, dérivée de son titre (« Cabinet n°66 » → cab-cabinet-n-66). */
const ancre = (titre: string) =>
  "cab-" +
  titre
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

function Photo({ img, alt, className }: { img: WPImage; alt: string; className: string }) {
  return (
    <div className={`relative rounded-[14px] overflow-hidden ${className}`}>
      <img src={img.url} alt={img.alt || alt} loading="lazy" className="w-full h-full object-cover" />
    </div>
  );
}

/** Un cabinet : tag, titre et planning à gauche, galerie à droite. */
function Cabinet({ c }: { c: CabinetItem }) {
  const [principale, ...autres] = c.images;
  return (
    <section id={ancre(c.titre)} className="section-y scroll-mt-4">
      <div className="container-x flex flex-wrap gap-[clamp(28px,4vw,64px)] items-start">
        <div className="flex-[1_1_340px] flex flex-col gap-[18px]">
          {c.tag && <span className="intitule">{c.tag}</span>}
          <h2 className="text-[clamp(22px,2vw,28px)] leading-[1.15] tracking-[-0.01em]">{c.titre}</h2>
          {c.schedule.length > 0 && (
            <div className="flex flex-col gap-3.5 mt-1.5">
              <h3 className="text-[20px]">Planning par thérapeute</h3>
              <div className="border border-line rounded-[14px] overflow-hidden">
                {c.schedule.map((d, i) => (
                  <div
                    key={`${i}-${d.day}`}
                    className={`flex items-center gap-3 px-4 py-3 overflow-x-auto ${i > 0 ? "border-t border-line" : ""}`}
                  >
                    <span className="flex-[0_0_78px] font-display text-[15px]">{d.day}</span>
                    <div className="flex gap-1.5">
                      {d.names.map((n) => (
                        <span key={n} className="chip">{n}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[13px] leading-[1.55] text-muted">
                Le planning peut varier selon les semaines et les absences.
              </p>
            </div>
          )}
        </div>

        {/* Galerie ACF : première photo en grand, les suivantes (3 au plus)
            en vignettes dessous. Sans photo, pas de colonne. */}
        {principale && (
          <div className="flex-[2_1_520px] min-w-0 grid grid-cols-3 gap-3">
            <Photo img={principale} alt={c.titre} className="col-span-3 h-[clamp(260px,34vw,460px)]" />
            {autres.slice(0, 3).map((img) => (
              <Photo key={img.id} img={img} alt={c.titre} className="h-[clamp(110px,13vw,180px)]" />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/** Image de section pleine largeur, recadrée en bandeau. Décorative. */
function ImageSection({ img }: { img: WPImage }) {
  return (
    <div className="section-y">
      <img
        src={img.url}
        alt=""
        loading="lazy"
        width={img.width || undefined}
        height={img.height || undefined}
        className="block w-full h-[clamp(240px,34vw,520px)] object-cover"
      />
    </div>
  );
}

/**
 * Page Cabinet : tout vient de la page d'options ACF `pageCabinet` (groupe
 * `cabinet`) : bannière et un bloc par ligne du répéteur des cabinets.
 */
export function CabinetPage() {
  const { data } = useCabinetOptions();

  useEffect(() => {
    setPageMeta({
      title: "Le cabinet",
      description:
        "Les deux cabinets de Physio du Moléson, rue Saint-Denis 66 et 68 à Bulle : salles de traitement, salle d'attente et fitness médical.",
    });
  }, []);

  const banner = data?.banner;
  const cabinets = data?.cabinets ?? [];
  const imageSection = data?.imageSection ?? null;

  return (
    <>
      <PageBanner title={banner?.titre || "Le cabinet"} video={banner?.video}>
        {banner?.sousTitre && <BannerText>{banner.sousTitre}</BannerText>}
        {banner?.description && <BannerText soft>{banner.description}</BannerText>}
        {cabinets.length > 1 && (
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {cabinets.map((c) => (
              <a key={c.titre} href={`/cabinet#${ancre(c.titre)}`} className="btn btn-contour">
                {c.titre}
              </a>
            ))}
          </div>
        )}
      </PageBanner>

      {/* L'image de section s'intercale après le premier cabinet. */}
      {cabinets.map((c, i) => (
        <Fragment key={c.titre}>
          {i === 1 && imageSection && <ImageSection img={imageSection} />}
          <Cabinet c={c} />
        </Fragment>
      ))}
    </>
  );
}
