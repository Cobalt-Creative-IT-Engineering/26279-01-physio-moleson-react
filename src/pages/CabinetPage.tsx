import { useEffect } from "react";
import { useCabinetOptions } from "../hooks/useWordPress";
import type { WPImage, ScheduleDay } from "../types/wordpress";
import { PageBanner, BannerText } from "../components/layout";
import { CONTACT } from "../config/site";
import { INTRO_CABINET, PLANNING } from "../config/contenu";
import { setPageMeta } from "../lib/meta";

const PHOTO_LABELS = ["Photo principale", "Salle de traitement", "Espace d'exercice", "Détail"];

/** Photo de la galerie, ou emplacement sable tant que WordPress n'en fournit pas. */
function Photo({ img, label, className }: { img: WPImage | undefined; label: string; className: string }) {
  return (
    <div className={`relative rounded-[14px] overflow-hidden ${className}`}>
      {img ? (
        <img src={img.url} alt={img.alt || label} loading="lazy" className="w-full h-full object-cover" />
      ) : (
        <div className="ph w-full h-full">
          <span className="ph-label">{label}</span>
        </div>
      )}
    </div>
  );
}

function Cabinet({
  id,
  street,
  schedule,
  images,
}: {
  id: number;
  street: string;
  schedule: ScheduleDay[];
  images: WPImage[];
}) {
  return (
    <section id={`cab-${id}`} className="section-y scroll-mt-4">
      <div className="container-x flex flex-wrap gap-[clamp(28px,4vw,64px)] items-start">
        <div className="flex-[1_1_340px] flex flex-col gap-[18px]">
          <h2 className="text-[clamp(22px,2vw,28px)] leading-[1.15] tracking-[-0.01em]">
            Cabinet - {street}
          </h2>
          <div className="flex flex-col gap-3.5 mt-1.5">
            <h3 className="text-[20px]">Planning par thérapeute</h3>
            <div className="border border-line rounded-[14px] overflow-hidden">
              {schedule.map((d, i) => (
                <div
                  key={d.day}
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
        </div>

        <div className="flex-[2_1_520px] min-w-0 grid grid-cols-3 gap-3">
          <Photo img={images[0]} label={PHOTO_LABELS[0]} className="col-span-3 h-[clamp(260px,34vw,460px)]" />
          {[1, 2, 3].map((i) => (
            <Photo key={i} img={images[i]} label={PHOTO_LABELS[i]} className="h-[clamp(110px,13vw,180px)]" />
          ))}
        </div>
      </div>
    </section>
  );
}

export function CabinetPage() {
  const { data } = useCabinetOptions();

  useEffect(() => {
    setPageMeta({
      title: "Le cabinet",
      description:
        "Les deux cabinets de Physio du Moléson, rue Saint-Denis 66 et 68 à Bulle : salles de traitement, salle d'attente et fitness médical.",
    });
  }, []);

  // Intro WordPress en HTML : réduite à son texte (entités décodées) pour
  // garder la mise en forme centrée de la bannière.
  const intro = data?.intro
    ? (new DOMParser().parseFromString(data.intro, "text/html").body.textContent ?? "").trim()
    : "";

  const cabinets = CONTACT.addresses.map((a) => {
    const is66 = a.id === 66;
    const wpSchedule = data ? (is66 ? data.schedule66 : data.schedule68) : [];
    return {
      id: a.id,
      street: a.street,
      schedule: wpSchedule.length ? wpSchedule : PLANNING[a.id],
      images: data ? (is66 ? data.images66 : data.images68) : [],
    };
  });

  return (
    <>
      <PageBanner title="Le cabinet">
        <BannerText>{intro || INTRO_CABINET}</BannerText>
        <div className="flex flex-wrap justify-center gap-3 mt-2">
          {cabinets.map((c) => (
            <a key={c.id} href={`/cabinet#cab-${c.id}`} className="btn btn-contour">
              Cabinet - {c.street}
            </a>
          ))}
        </div>
      </PageBanner>

      {cabinets.map((c) => (
        <Cabinet key={c.id} {...c} />
      ))}
    </>
  );
}
