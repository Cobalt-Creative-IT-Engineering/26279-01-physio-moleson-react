import { useState, useEffect } from "react";
import { useCabinetOptions } from "../hooks/useWordPress";
import type { WPImage } from "../types/wordpress";
import { Skeleton, ErrorBanner, WPContent } from "../components/ui";
import { CONTACT } from "../config/site";
import { setPageMeta } from "../lib/meta";

/* ─── Galerie d'un cabinet ─────────────────────────────────────────────── */

function CabinetGallery({ images, tag, n }: { images: WPImage[]; tag: string; n: number }) {
  const slot = (i: number) => images[i] ?? null;
  const labels = [
    `Vue principale · cabinet n°${n}`,
    "Salle de traitement",
    "Fitness médical",
    "Salle d'attente",
  ];

  const Img = ({ img, label, className }: { img: WPImage | null; label: string; className?: string }) =>
    img ? (
      <img src={img.url} alt={img.alt || label} loading="lazy" className={`w-full h-full object-cover ${className ?? ""}`} />
    ) : (
      <div className={`ph ph-dark w-full h-full ${className ?? ""}`}>
        <span className="ph-label">{label}</span>
      </div>
    );

  return (
    <div>
      <div className="grid grid-cols-3 grid-rows-[300px_140px] gap-2">
        <div className="col-span-3 row-start-1 relative overflow-hidden rounded-card shadow-lg">
          <Img img={slot(0)} label={labels[0]} />
          {tag && (
            <div
              className="absolute top-3.5 left-3.5 px-3 py-1.5 rounded-btn text-[10px] tracking-[0.18em] uppercase font-mono pointer-events-none z-[2]"
              style={{ background: "oklch(0.22 0.02 200 / 0.85)", color: "oklch(0.96 0.01 155)", backdropFilter: "blur(8px)" }}
            >
              {tag}
            </div>
          )}
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="relative overflow-hidden rounded-card">
            <Img img={slot(i)} label={labels[i]} />
          </div>
        ))}
      </div>
      <div className="mt-2.5 font-mono text-[11px] tracking-[0.14em] uppercase" style={{ color: "oklch(0.78 0.025 155)" }}>
        Galerie · cabinet n°{n}
      </div>
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

  return (
    <section className="section-y" style={{ background: "var(--color-primary)", color: "oklch(0.96 0.01 155)" }}>
      <div className="container-x">
        <div className="section-header" style={{ marginBottom: 56 }}>
          <span className="eyebrow" style={{ color: "oklch(0.88 0.025 155)" }}>Le cabinet</span>
          <h1 style={{ color: "oklch(0.98 0.008 100)" }}>
            {data?.title || "Deux cabinets à la rue Saint-Denis."}
          </h1>
          {data?.intro
            ? <WPContent html={data.intro} className="text-[17px] leading-relaxed max-w-[560px]" />
            : (
              <p style={{ color: "oklch(0.88 0.025 155)" }}>
                Au centre de Bulle, rue Saint-Denis — deux espaces avec salles de
                traitement, salle d'attente et fitness médical.
              </p>
            )}
        </div>

        {status === "loading" && !data && (
          <div className="grid lg:grid-cols-[1.1fr_1fr] gap-16">
            <Skeleton className="h-[460px]" />
            <Skeleton className="h-[200px]" />
          </div>
        )}

        {status === "error" && !data && (
          <ErrorBanner message={`Impossible de charger le cabinet${error ? ` — ${error}` : ""}.`} />
        )}

        {data && (
          <div className="grid lg:grid-cols-[1.1fr_1fr] gap-16 items-start">
            <CabinetGallery images={images} tag={tag} n={activeId} />

            <div className="flex flex-col gap-3">
              {CONTACT.addresses.map((a) => {
                const isActive = a.id === activeId;
                return (
                  <button
                    key={a.id}
                    onClick={() => setActiveId(a.id)}
                    className="text-left rounded-card px-6 py-5 border transition-all"
                    style={{
                      background: isActive ? "oklch(0.98 0.008 100)" : "oklch(0.5 0.05 165 / 0.4)",
                      color: isActive ? "var(--color-primary)" : "oklch(0.96 0.01 155)",
                      borderColor: isActive ? "oklch(0.98 0.008 100)" : "oklch(0.5 0.05 165)",
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-6 h-6 rounded-full inline-flex items-center justify-center text-[11px] font-mono"
                        style={{
                          background: isActive ? "var(--color-primary)" : "oklch(0.5 0.05 165)",
                          color: isActive ? "oklch(0.98 0.008 100)" : "oklch(0.88 0.025 155)",
                        }}
                      >
                        {a.id === 66 ? "A" : "B"}
                      </span>
                      <div>
                        <div className="font-display text-lg leading-none">{a.label}</div>
                        <div className="text-[11px] opacity-70 mt-1">{a.street} · {a.postcode} {a.city}</div>
                      </div>
                    </div>
                  </button>
                );
              })}

              <a
                href={`tel:${CONTACT.phoneTel}`}
                className="mt-2 text-[13px] underline underline-offset-4"
                style={{ color: "oklch(0.88 0.025 155)" }}
              >
                {CONTACT.phone}
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
