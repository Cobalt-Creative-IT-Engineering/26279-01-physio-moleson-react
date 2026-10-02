import { useEffect } from "react";
import { useFaqOptions } from "../hooks/useWordPress";
import { Skeleton, WPContent } from "../components/ui";
import { CONTACT } from "../config/site";
import { FAQ_EXEMPLE } from "../config/faq-exemple";
import { setPageMeta } from "../lib/meta";

export function FaqPage() {
  const { data, status } = useFaqOptions();

  useEffect(() => {
    setPageMeta({
      title: "Questions fréquentes",
      description:
        "Les réponses aux questions fréquentes sur le Cabinet physio du Moléson à Bulle : rendez-vous, prise en charge, déroulement des séances.",
    });
  }, []);

  // Tant que la page d'options n'existe pas côté WordPress, la requête échoue
  // (champ `faqs` inconnu) : on affiche alors les questions d'exemple plutôt
  // qu'une erreur. Idem si la page existe mais ne contient aucune question.
  const loading = status === "loading" && !data;
  const items = data?.items.length ? data.items : loading ? [] : FAQ_EXEMPLE;

  return (
    <section className="section-y">
      <div className="container-x">
        <div className="section-header">
          <span className="eyebrow">Questions fréquentes</span>
          <h1>{data?.title || "Vos questions, nos réponses."}</h1>
          {data?.intro && (
            <WPContent html={data.intro} className="text-lg max-w-[560px]" />
          )}
        </div>

        <div className="grid lg:grid-cols-[1.6fr_1fr] gap-10 lg:gap-16 items-start">
          <div>
            {loading && (
              <div className="flex flex-col gap-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            )}

            {/* Accordéon natif <details>/<summary> : ouverture au clavier et
                annonce de l'état par les lecteurs d'écran sans JavaScript. */}
            {items.length > 0 && (
              <div className="flex flex-col border-t border-line">
                {items.map((q, i) => (
                  <details key={i} className="group border-b border-line">
                    <summary className="flex items-center justify-between gap-6 py-6 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                      <h2 className="font-display text-[20px] md:text-[22px]">{q.question}</h2>
                      {/* Pastille jaune quand la réponse est ouverte : l'« état
                          actif » de la charte. */}
                      <span
                        aria-hidden
                        className="flex items-center justify-center w-8 h-8 shrink-0 rounded-full border-[1.5px] border-ink text-ink transition-colors group-open:bg-jaune group-open:border-ink group-open:text-ink"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M5 12h14" />
                          <path d="M12 5v14" className="group-open:hidden" />
                        </svg>
                      </span>
                    </summary>
                    <WPContent html={q.answer} className="text-[16px] pb-7 pr-14 max-w-[680px]" />
                  </details>
                ))}
              </div>
            )}
          </div>

          {/* Encadré sable : pour toute question restée sans réponse. */}
          <aside className="card p-7 lg:sticky lg:top-28">
            <div className="eyebrow mb-3">Une autre question ?</div>
            <p className="text-[16px] mb-5">
              Notre secrétariat vous répond par téléphone ou par écrit.
            </p>
            <div className="flex flex-col items-start gap-2.5">
              <a href={`tel:${CONTACT.phoneTel}`} className="btn btn-primary">
                {CONTACT.phone}
              </a>
              <a href="/#contact" className="btn btn-ghost hover:bg-bg">
                Écrivez-nous
              </a>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
