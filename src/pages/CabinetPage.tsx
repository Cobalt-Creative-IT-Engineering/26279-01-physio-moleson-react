import { useState, useEffect } from "react";
import { useCabinetOptions } from "../hooks/useWordPress";
import type { WPImage, ScheduleDay } from "../types/wordpress";
import { Skeleton, ErrorBanner, WPContent } from "../components/ui";
import { CONTACT } from "../config/site";
import { setPageMeta } from "../lib/meta";

/* ─── Lightbox galerie ─────────────────────────────────────────────────── */

function Lightbox({
  images,
  index,
  onClose,
  onNav,
}: {
  images: WPImage[];
  index: number;
  onClose: () => void;
  onNav: (i: number) => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNav((index + 1) % images.length);
      if (e.key === "ArrowLeft") onNav((index - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [index, images.length, onClose, onNav]);

  const img = images[index];
  const many = images.length > 1;

  return (
    <div
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10"
      style={{ background: "var(--scrim)", backdropFilter: "blur(6px)", animation: "fadeIn 200ms ease-out" }}
    >
      <button
        onClick={onClose}
        aria-label="Fermer"
        className="absolute top-5 right-5 w-10 h-10 rounded-full inline-flex items-center justify-center text-on-dark-soft hover:text-on-dark border border-[rgb(247_240_231_/_0.3)] hover:border-[rgb(247_240_231_/_0.6)] transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 6L6 18M6 6l12 12" /></svg>
      </button>

      {many && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); onNav((index - 1 + images.length) % images.length); }}
            aria-label="Image précédente"
            className="absolute left-4 md:left-8 w-11 h-11 rounded-full inline-flex items-center justify-center text-on-dark-soft hover:text-on-dark border border-[rgb(247_240_231_/_0.3)] hover:border-[rgb(247_240_231_/_0.6)] transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onNav((index + 1) % images.length); }}
            aria-label="Image suivante"
            className="absolute right-4 md:right-8 w-11 h-11 rounded-full inline-flex items-center justify-center text-on-dark-soft hover:text-on-dark border border-[rgb(247_240_231_/_0.3)] hover:border-[rgb(247_240_231_/_0.6)] transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
          </button>
        </>
      )}

      <figure onClick={(e) => e.stopPropagation()} className="flex flex-col items-center gap-3" style={{ animation: "slideUp 300ms cubic-bezier(0.2,0,0,1)" }}>
        <img
          src={img.url}
          alt={img.alt || "Cabinet"}
          className="max-h-[82vh] max-w-[90vw] object-contain rounded-card shadow-lg"
        />
        {many && (
          <figcaption className="label text-[11px] text-on-dark-soft">
            {index + 1} / {images.length}
          </figcaption>
        )}
      </figure>
    </div>
  );
}

/* ─── Galerie d'un cabinet ─────────────────────────────────────────────── */

function CabinetGallery({ images, tag, n }: { images: WPImage[]; tag: string; n: number }) {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const slot = (i: number) => images[i] ?? null;
  const labels = [
    `Vue principale · cabinet n°${n}`,
    "Salle de traitement",
    "Fitness médical",
    "Salle d'attente",
  ];

  const Cell = ({ i, label }: { i: number; label: string }) => {
    const img = slot(i);
    if (!img) {
      return (
        <div className="ph w-full h-full">
          <span className="ph-label">{label}</span>
        </div>
      );
    }
    return (
      <button
        type="button"
        onClick={() => setLightbox(i)}
        aria-label={`Agrandir : ${img.alt || label}`}
        className="group block w-full h-full cursor-zoom-in"
      >
        <img
          src={img.url}
          alt={img.alt || label}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </button>
    );
  };

  return (
    <div>
      <div className="grid grid-cols-3 grid-rows-[220px_100px] sm:grid-rows-[300px_140px] gap-2">
        <div className="col-span-3 row-start-1 relative overflow-hidden rounded-card shadow-lg">
          <Cell i={0} label={labels[0]} />
          {tag && (
            <div
              className="absolute top-3.5 left-3.5 px-3 py-1.5 rounded-btn label text-[10px] pointer-events-none z-[2]"
              style={{ background: "var(--scrim-strong)", color: "var(--color-on-dark)", backdropFilter: "blur(8px)" }}
            >
              {tag}
            </div>
          )}
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="relative overflow-hidden rounded-card">
            <Cell i={i} label={labels[i]} />
          </div>
        ))}
      </div>
      <div className="mt-2.5 label text-[11px] text-ink-mute">
        Galerie · cabinet n°{n}
      </div>

      {lightbox !== null && images[lightbox] && (
        <Lightbox
          images={images}
          index={lightbox}
          onClose={() => setLightbox(null)}
          onNav={setLightbox}
        />
      )}
    </div>
  );
}

/* ─── Planning hebdomadaire ────────────────────────────────────────────── */

function SchedulePanel({ schedule, n }: { schedule: ScheduleDay[]; n: number }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-5">
        <h2 className="text-[26px]">Qui consulte au n°{n} ?</h2>
        <span className="label text-[10px] text-ink-mute">
          Planning hebdo
        </span>
      </div>

      {schedule.length === 0 ? (
        <div className="bg-surface border border-line rounded-card px-6 py-8 text-[13.5px] text-ink-mute">
          Planning à venir.
        </div>
      ) : (
        <div className="bg-surface border border-line rounded-card overflow-hidden">
          {schedule.map((row, i) => (
            <div
              key={row.day}
              className="grid grid-cols-[110px_1fr] items-center gap-4 px-5 py-4"
              style={{ borderBottom: i < schedule.length - 1 ? "1px solid var(--color-line)" : "none" }}
            >
              <div className="font-display text-lg text-ink">{row.day}</div>
              <div className="flex flex-wrap gap-1.5">
                {row.names.map((name) => (
                  <span
                    key={name}
                    className="px-3 py-1 text-[13px] rounded-btn bg-primary-bg text-primary-text border border-primary-soft"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-[12.5px] text-ink-mute mt-3.5 leading-relaxed">
        Le planning peut varier selon les semaines et les absences. Pour une
        consultation avec un·e thérapeute spécifique, mentionnez-le lors de
        votre prise de rendez-vous.
      </p>
    </div>
  );
}

/* ─── Page ─────────────────────────────────────────────────────────────── */

export function CabinetPage() {
  const { data, status, error } = useCabinetOptions();
  const [activeId, setActiveId] = useState<number>(CONTACT.addresses[0].id);

  useEffect(() => {
    setPageMeta({
      title: "Cabinet",
      description:
        "Les deux cabinets du Cabinet physio du Moléson, rue Saint-Denis à Bulle : salles de traitement et fitness médical.",
    });
  }, []);

  const is66 = activeId === 66;
  const tag = data ? (is66 ? data.tag66 : data.tag68) : "";
  const images = data ? (is66 ? data.images66 : data.images68) : [];
  const schedule = data ? (is66 ? data.schedule66 : data.schedule68) : [];

  return (
    <section className="section-y">
      <div className="container-x">
        <div className="section-header">
          <span className="eyebrow">Le cabinet</span>
          <h1>{data?.title || "Deux cabinets à la rue Saint-Denis."}</h1>
          {data?.intro ? (
            <WPContent html={data.intro} className="text-lg text-ink-soft max-w-[560px]" />
          ) : (
            <p>
              Au centre de Bulle, rue Saint-Denis — deux espaces avec salles de
              traitement, salle d'attente et fitness médical.
            </p>
          )}
        </div>

        {status === "loading" && !data && (
          <div className="grid lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-16">
            <Skeleton className="h-[460px]" />
            <Skeleton className="h-[200px]" />
          </div>
        )}

        {status === "error" && !data && (
          <ErrorBanner message={`Impossible de charger le cabinet${error ? ` — ${error}` : ""}.`} />
        )}

        {data && (
          <div className="grid lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-16 items-start">
            {/* Colonne gauche : galerie + sélecteur cabinet */}
            <div className="flex flex-col gap-4">
              <CabinetGallery images={images} tag={tag} n={activeId} />

              <div className="grid grid-cols-2 gap-3">
                {CONTACT.addresses.map((a) => {
                  const isActive = a.id === activeId;
                  return (
                    <button
                      key={a.id}
                      onClick={() => setActiveId(a.id)}
                      className="text-left rounded-card px-5 py-4 border bg-surface transition-all"
                      style={{
                        borderColor: isActive ? "var(--color-primary)" : "var(--color-line)",
                        background: isActive ? "var(--color-primary-bg)" : "var(--color-surface)",
                      }}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-6 h-6 rounded-full inline-flex items-center justify-center text-[11px] label"
                          style={{
                            background: isActive ? "var(--color-primary)" : "var(--color-primary-bg)",
                            color: isActive ? "var(--color-on-primary)" : "var(--color-primary-text)",
                          }}
                        >
                          {a.id === 66 ? "A" : "B"}
                        </span>
                        <div>
                          <div
                            className="font-display text-base leading-none"
                            style={{ color: isActive ? "var(--color-primary-text)" : "var(--color-ink)" }}
                          >
                            {a.label}
                          </div>
                          <div className="text-[11px] text-ink-mute mt-1">
                            {a.street}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Colonne droite : planning hebdomadaire */}
            <SchedulePanel schedule={schedule} n={activeId} />
          </div>
        )}
      </div>
    </section>
  );
}
