import { useEffect } from "react";
import { useFaqOptions, usePageFaq } from "../hooks/useWordPress";
import type { FaqEntry, FaqTheme } from "../types/wordpress";
import { PageBanner, BannerText } from "../components/layout";
import { Skeleton, WPContent } from "../components/ui";
import { setPageMeta } from "../lib/meta";

/**
 * Regroupement par catégorie, dans l'ordre de première apparition. Une
 * question cochée dans plusieurs catégories figure dans chacune ; sans
 * catégorie, elle rejoint « Questions générales ».
 */
function parCategorie(questions: FaqEntry[]): FaqTheme[] {
  const groupes = new Map<string, FaqTheme["items"]>();
  for (const q of questions) {
    for (const cat of q.categories.length ? q.categories : ["Questions générales"]) {
      if (!groupes.has(cat)) groupes.set(cat, []);
      groupes.get(cat)!.push({ question: q.question, answer: q.answer });
    }
  }
  return [...groupes].map(([title, items]) => ({ title, items }));
}

export function FaqPage() {
  const { data, status } = useFaqOptions();
  const { data: page } = usePageFaq();

  useEffect(() => {
    setPageMeta({
      title: "Questions fréquentes",
      description:
        "Les réponses aux questions fréquentes sur Physio du Moléson à Bulle : ordonnance, remboursement, rendez-vous, Sensopro, séances à domicile.",
    });
  }, []);

  // Questions WordPress (type `faqQuestion`). Sélection de la page FAQ
  // (champ Relation) : ces questions, dans cet ordre ; sinon toutes.
  const loading = status === "loading" && !data;
  const toutes = data?.questions ?? [];
  const choix = page?.questions ?? [];
  const questions = choix.length
    ? choix.map((id) => toutes.find((q) => q.id === id)).filter((q): q is FaqEntry => !!q)
    : toutes;
  const themes = parCategorie(questions);
  const banner = page?.banner;

  return (
    <>
      <PageBanner title={banner?.titre || "Questions fréquentes"} video={banner?.video}>
        {banner?.sousTitre && <BannerText>{banner.sousTitre}</BannerText>}
        {banner?.description && <BannerText soft>{banner.description}</BannerText>}
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

          <div className="on-dark bg-olive text-on-dark rounded-[20px] p-[clamp(24px,3.4vw,40px)] flex flex-wrap items-center justify-between gap-5">
            <h2 className="text-[clamp(22px,2.2vw,28px)]">Vous ne trouvez pas votre réponse ?</h2>
            <a href="/contact" className="btn btn-jaune">Nous contacter →</a>
          </div>
        </div>
      </div>
    </>
  );
}
