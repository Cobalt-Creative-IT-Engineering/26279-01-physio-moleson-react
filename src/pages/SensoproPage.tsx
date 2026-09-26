import { useEffect } from "react";
import { useSensoproOptions } from "../hooks/useWordPress";
import { Skeleton, ErrorBanner, WPContent } from "../components/ui";
import { CONTACT } from "../config/site";
import { setPageMeta } from "../lib/meta";

export function SensoproPage() {
  const { data, status, error } = useSensoproOptions();

  useEffect(() => {
    setPageMeta({
      title: "Sensopro",
      description:
        "Entraînement Sensopro Luna au Cabinet physio du Moléson : coordination, équilibre et renforcement global, pour tous les niveaux.",
    });
  }, []);

  return (
    <section className="section-y">
      <div className="container-x">
        <div className="section-header">
          <span className="eyebrow">Entraînement Sensopro</span>
          <h1>{data?.title || "Sensopro Luna — le mouvement intelligent."}</h1>
          {data?.intro && (
            <WPContent html={data.intro} className="text-lg text-ink-soft max-w-[560px]" />
          )}
        </div>

        {status === "loading" && !data && (
          <div className="grid lg:grid-cols-2 gap-16">
            <Skeleton className="aspect-[4/5]" />
            <div className="flex flex-col gap-6">
              <Skeleton className="h-40" />
              <Skeleton className="h-40" />
            </div>
          </div>
        )}

        {status === "error" && !data && (
          <ErrorBanner message={`Impossible de charger la page Sensopro${error ? ` — ${error}` : ""}.`} />
        )}

        {data && (
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Visuel */}
            <div className="lg:sticky lg:top-28">
              <div className="relative aspect-[4/5] rounded-card shadow-lg overflow-hidden">
                {data.image ? (
                  <img
                    src={data.image.url}
                    alt={data.image.alt || "Sensopro Luna"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="ph w-full h-full">
                    <span className="ph-label">PHOTO · SENSOPRO LUNA</span>
                  </div>
                )}
                <div className="absolute top-6 right-6 inline-flex items-center gap-2 px-3.5 py-2 rounded-btn bg-surface border border-line label text-[11px] text-primary-text">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Swiss made
                </div>
              </div>
            </div>

            {/* Contenu */}
            <div className="flex flex-col gap-14">
              {/* Bénéfices */}
              {data.benefits.length > 0 && (
                <div>
                  <h2 className="text-[22px] mb-6">Pour qui, pour quoi ?</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-line rounded-card overflow-hidden border border-line">
                    {data.benefits.map((b, i) => (
                      <div key={i} className="bg-surface p-6">
                        {b.number && (
                          <div className="label text-[11px] text-primary-text mb-2.5">
                            {b.number}
                          </div>
                        )}
                        <div className="font-display text-[19px] mb-1.5">{b.title}</div>
                        <p className="text-[13px] text-ink-soft leading-snug">{b.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Étapes */}
              {data.steps.length > 0 && (
                <div>
                  <h2 className="text-[22px] mb-1.5">C'est si simple.</h2>
                  <p className="text-sm text-ink-soft mb-6">Quelques étapes pour démarrer.</p>
                  <div className="flex flex-col border-t border-line">
                    {data.steps.map((s, i) => (
                      <div key={i} className="grid grid-cols-[48px_1fr] gap-[18px] items-baseline py-5 border-b border-line">
                        <span className="w-9 h-9 rounded-full border border-primary text-primary-text inline-flex items-center justify-center font-display text-base">
                          {s.number || i + 1}
                        </span>
                        <div>
                          <div className="font-display text-lg mb-1">{s.title}</div>
                          <p className="text-[13.5px] text-ink-soft leading-snug">{s.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bloc première séance + CTA */}
              {(data.firstSessionTitle || data.firstSessionText) && (
                <div className="bg-surface border border-line rounded-card p-7" style={{ borderLeft: "3px solid var(--color-primary)" }}>
                  <div className="label text-[10px] text-primary-text mb-3.5">
                    Important · première séance
                  </div>
                  {data.firstSessionTitle && (
                    <div className="font-display text-xl mb-2">{data.firstSessionTitle}</div>
                  )}
                  {data.firstSessionText && (
                    <WPContent html={data.firstSessionText} className="text-[14.5px] text-ink leading-relaxed mb-5" />
                  )}
                  <div className="flex flex-wrap gap-2.5">
                    <a href={`tel:${CONTACT.phoneTel}`} className="btn btn-primary">
                      {CONTACT.phone}
                    </a>
                    <a href={`mailto:${CONTACT.email}`} className="btn btn-ghost">
                      {CONTACT.email}
                    </a>
                    <a href="/#contact" className="btn btn-ghost">
                      Demander un RDV via le formulaire
                    </a>
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
