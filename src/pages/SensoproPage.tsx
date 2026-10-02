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
            <WPContent html={data.intro} className="text-lg max-w-[560px]" />
          )}
        </div>

        {status === "loading" && !data && (
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
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
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            {/* Visuel */}
            <div className="lg:sticky lg:top-28">
              <div className="relative aspect-[4/5] rounded-card overflow-hidden">
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
                {/* Texte sur photo : uniquement en bandeau plein vert Moléson. */}
                <div className="on-dark absolute top-6 right-6 inline-flex items-center gap-2 px-4 py-2 rounded-full label text-[13px]">
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {data.benefits.map((b, i) => (
                      <div key={i} className="card p-6">
                        {b.number && (
                          <div className="label text-[13px] text-vert mb-2.5">
                            {b.number}
                          </div>
                        )}
                        <div className="font-display text-[20px] mb-1.5">{b.title}</div>
                        <p className="text-[16px]">{b.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Étapes */}
              {data.steps.length > 0 && (
                <div>
                  <h2 className="text-[22px] mb-1.5">C'est si simple.</h2>
                  <p className="text-[16px] text-ink mb-6">Quelques étapes pour démarrer.</p>
                  <div className="flex flex-col border-t border-line">
                    {data.steps.map((s, i) => (
                      <div key={i} className="grid grid-cols-[48px_1fr] gap-[18px] items-baseline py-5 border-b border-line">
                        <span className="w-9 h-9 rounded-full border-[1.5px] border-ink text-ink inline-flex items-center justify-center font-display text-base">
                          {s.number || i + 1}
                        </span>
                        <div>
                          <div className="font-display text-lg mb-1">{s.title}</div>
                          <p className="text-[16px] text-ink">{s.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bloc première séance + CTA */}
              {(data.firstSessionTitle || data.firstSessionText) && (
                <div className="card p-7">
                  <div className="eyebrow mb-3.5">
                    Important · première séance
                  </div>
                  {data.firstSessionTitle && (
                    <div className="font-display text-xl mb-2">{data.firstSessionTitle}</div>
                  )}
                  {data.firstSessionText && (
                    <WPContent html={data.firstSessionText} className="text-[16px] text-ink mb-5" />
                  )}
                  <div className="flex flex-wrap gap-2.5">
                    <a href={`tel:${CONTACT.phoneTel}`} className="btn btn-primary">
                      {CONTACT.phone}
                    </a>
                    <a href={`mailto:${CONTACT.email}`} className="btn btn-ghost hover:bg-bg">
                      {CONTACT.email}
                    </a>
                    <a href="/#contact" className="btn btn-ghost hover:bg-bg">
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
