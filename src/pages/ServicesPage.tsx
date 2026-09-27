import { useState, useEffect, useMemo } from "react";
import { useServices } from "../hooks/useWordPress";
import { Skeleton, ErrorBanner, WPContent } from "../components/ui";
import { setPageMeta } from "../lib/meta";

export function ServicesPage() {
  const { services, status, error } = useServices();
  const [activeId, setActiveId] = useState<number | null>(null);

  useEffect(() => {
    setPageMeta({
      title: "Nos services",
      description:
        "Les domaines d'expertise du Cabinet physio du Moléson à Bulle : physiothérapie générale, santé de la femme, sport et soins à domicile.",
    });
  }, []);

  // Sélectionne le 1er service dès que les données arrivent.
  const active = useMemo(
    () => services.find((s) => s.id === activeId) ?? services[0] ?? null,
    [services, activeId]
  );

  return (
    <section className="section-y">
      <div className="container-x">
        <div className="section-header">
          <span className="eyebrow">Nos services</span>
          <h1>Nos domaines<br />d'expertise complémentaires.</h1>
          <p>
            De la prise en charge générale à la santé de la femme, du sport au
            domicile : un accompagnement adapté à votre pathologie et à vos
            objectifs.
          </p>
        </div>

        {status === "loading" && services.length === 0 && (
          <div className="grid lg:grid-cols-[1fr_1.4fr] gap-10 lg:gap-16">
            <div className="flex flex-col gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
            <Skeleton className="h-[420px]" />
          </div>
        )}

        {status === "error" && services.length === 0 && (
          <ErrorBanner message={`Impossible de charger les services${error ? ` — ${error}` : ""}.`} />
        )}

        {status === "success" && services.length === 0 && (
          <p className="text-ink-soft">Aucun service publié pour le moment.</p>
        )}

        {active && (
          <div className="grid lg:grid-cols-[1fr_1.4fr] gap-10 lg:gap-16">
            {/* Liste d'onglets */}
            <div className="flex flex-col border-t border-line">
              {services.map((s) => {
                const isActive = s.id === active.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setActiveId(s.id)}
                    className="grid grid-cols-[auto_1fr_auto] gap-5 items-center py-7 border-b border-line text-left transition-colors"
                  >
                    <span
                      className="label text-[11px]"
                      style={{ color: isActive ? "var(--color-primary)" : "var(--color-ink-mute)" }}
                    >
                      {s.num || "—"}
                    </span>
                    <span>
                      <span
                        className="block font-display text-2xl mb-1 transition-colors"
                        style={{ color: isActive ? "var(--color-primary)" : "var(--color-ink)" }}
                      >
                        {s.title}
                      </span>
                      {s.short && (
                        <span className="block text-[13px] text-ink-mute">{s.short}</span>
                      )}
                    </span>
                    <span
                      className="flex items-center justify-center w-8 h-8 rounded-full border transition-colors"
                      style={{
                        borderColor: isActive ? "var(--color-primary)" : "var(--color-line)",
                        color: isActive ? "var(--color-primary)" : "var(--color-ink-mute)",
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d={isActive ? "M5 12h14" : "M5 12h14M13 6l6 6-6 6"} />
                      </svg>
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Panneau détail */}
            <div
              key={active.id}
              className={`grid gap-6 ${active.image ? "grid-rows-[auto_1fr_auto]" : "grid-rows-[1fr_auto]"}`}
            >
              {active.image && (
                <img
                  src={active.image.url}
                  alt={active.image.alt || active.title}
                  className="w-full h-80 object-cover rounded-card"
                />
              )}

              <div>
                {active.short && <h2 className="text-[28px] mb-4">{active.short}</h2>}
                {active.description && (
                  <WPContent html={active.description} className="text-base leading-relaxed text-ink-soft" />
                )}
              </div>

              {active.tags.length > 0 && (
                <div>
                  <div className="label text-[11px] text-ink-mute mb-3.5">
                    Pathologies prises en charge
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {active.tags.map((t) => (
                      <span
                        key={t}
                        className="px-3.5 py-1.5 text-[13px] rounded-btn bg-primary-bg text-primary-text border border-primary-soft"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
