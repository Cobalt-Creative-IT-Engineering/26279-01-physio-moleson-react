import { useEffect } from "react";
import { useFaqOptions } from "../hooks/useWordPress";
import { PageBanner } from "../components/layout";
import { Skeleton, WPContent } from "../components/ui";
import { FAQ_THEMES, type FaqTheme } from "../config/contenu";
import { setPageMeta } from "../lib/meta";

export function FaqPage() {
  const { data, status } = useFaqOptions();

  useEffect(() => {
    setPageMeta({
      title: "Questions fréquentes",
      description:
        "Les réponses aux questions fréquentes sur Physio du Moléson à Bulle : ordonnance, remboursement, rendez-vous, Sensopro, séances à domicile.",
    });
  }, []);

  // Catégories du répéteur ACF `categoriesFaq`. Tant que la page d'options
  // n'existe pas côté WordPress, la requête échoue (champ `faqs` inconnu) :
  // on affiche alors les catégories de la maquette.
  const loading = status === "loading" && !data;
  const themes: FaqTheme[] = data?.themes.length ? data.themes : loading ? [] : FAQ_THEMES;

  return (
    <>
      <PageBanner title="Questions fréquentes">
        {themes.length > 1 && (
          <div className="flex flex-wrap justify-center gap-2.5 mt-2">
            {themes.map((t, i) => (
              <a key={t.title} href={`/faq#faq-${i}`} className="btn btn-contour">
                {t.title}
              </a>
            ))}
          </div>
        )}
      </PageBanner>

      <div className="container-x pt-[clamp(40px,5vw,72px)]">
        <div className="max-w-[960px] mx-auto flex flex-col gap-[clamp(48px,6vw,80px)]">
          {loading && (
            <div className="flex flex-col gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          )}

          {themes.map((t, ti) => (
            <section
              key={t.title}
              id={`faq-${ti}`}
              className="scroll-mt-4 grid grid-cols-[repeat(auto-fit,minmax(min(100%,240px),1fr))] gap-x-[clamp(24px,4vw,56px)] gap-y-4 items-start"
            >
              <h2 className="text-[clamp(24px,2.4vw,30px)] leading-[1.15]">{t.title}</h2>
              {/* Accordéon natif <details>/<summary> : ouverture au clavier et
                  annonce de l'état par les lecteurs d'écran sans JavaScript. */}
              <div className="sm:col-span-2 min-w-0 flex flex-col border-t border-line">
                {t.items.map((q) => (
                  <details key={q.question} className="group border-b border-line">
                    <summary className="flex justify-between items-center gap-5 py-5 cursor-pointer list-none [&::-webkit-details-marker]:hidden text-[17px] font-semibold">
                      <span>{q.question}</span>
                      <span
                        aria-hidden
                        className="flex-none w-8 h-8 rounded-full bg-sable flex items-center justify-center font-display text-[18px]"
                      >
                        <span className="group-open:hidden">+</span>
                        <span className="hidden group-open:inline">–</span>
                      </span>
                    </summary>
                    <WPContent html={q.answer} className="pr-[52px] pb-[22px] text-[16px]" />
                  </details>
                ))}
              </div>
            </section>
          ))}

          <div className="bg-sable rounded-[20px] p-[clamp(24px,3.4vw,40px)] flex flex-wrap items-center justify-between gap-5">
            <h2 className="text-[clamp(22px,2.2vw,28px)]">Vous ne trouvez pas votre réponse ?</h2>
            <a href="/contact" className="btn btn-vert">Nous contacter →</a>
          </div>
        </div>
      </div>
    </>
  );
}
