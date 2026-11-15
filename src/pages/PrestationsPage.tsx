import { useEffect } from "react";
import { usePagePrestations } from "../hooks/useWordPress";
import { PageBanner, BannerText } from "../components/layout";
import { WPContent, Apparition, delaiApparition } from "../components/ui";
import { setPageMeta } from "../lib/meta";

/**
 * Pictogramme venant de WordPress : deux SVG superposés, la version fixe au
 * repos et la version animée (en boucle) au survol de la carte. Une seule
 * des deux fournie = affichée en permanence. Images décoratives : alt vide.
 */
function IconeWP({ fixe, mouvement }: { fixe: string | null; mouvement: string | null }) {
  const repos = fixe ?? mouvement;
  if (!repos) return null;
  return (
    <div aria-hidden className="prestation-icone">
      <img src={repos} alt="" className={`prestation-svg ${fixe && mouvement ? "prestation-svg-repos" : ""}`} />
      {fixe && mouvement && <img src={mouvement} alt="" className="prestation-svg prestation-svg-survol" />}
    </div>
  );
}

/** Lien externe → nouvel onglet ; interne → navigation SPA. */
function linkProps(url: string) {
  return /^https?:/.test(url) ? { href: url, target: "_blank", rel: "noopener" } : { href: url };
}

/**
 * Page Prestations : tout vient de la page d'options ACF « Page prestations »
 * (`prestationPage`, groupe `prestations`) : bannière, répéteur des prestations
 * et sous-groupe Sensopro. Un champ vide n'est pas affiché.
 */
export function PrestationsPage() {
  const { data } = usePagePrestations();

  useEffect(() => {
    setPageMeta({
      title: "Prestations",
      description:
        "Les prestations de Physio du Moléson à Bulle : physiothérapie générale, du sport, santé de la femme, à domicile, et entraînement Sensopro Luna.",
    });
  }, []);

  const banner = data?.banner;
  const prestations = data?.prestations ?? [];
  // Encadré Sensopro rendu seulement si le sous-groupe a un titre.
  const senso = data?.sensopro.titre ? data.sensopro : null;
  // Bouton affiché seulement si une URL est saisie dans ACF.
  const sensoBouton = senso?.bouton.url
    ? { label: senso.bouton.label || "Prendre rendez-vous", url: senso.bouton.url }
    : null;

  return (
    <>
      <PageBanner title={banner?.titre || "Prestations"} video={banner?.video}>
        {banner?.sousTitre && <BannerText>{banner.sousTitre}</BannerText>}
        {banner?.description && <BannerText soft>{banner.description}</BannerText>}
      </PageBanner>

      <section className="section-y">
        {/* Apparition en cascade. L'animation est posée sur une enveloppe :
            sur la carte, elle écraserait le soulèvement au survol. */}
        {prestations.length > 0 && (
          <Apparition className="container-x grid grid-cols-[repeat(auto-fit,minmax(min(100%,max(340px,calc((100%_-_16px)_/_2))),1fr))] gap-4">
            {prestations.map((p, i) => (
              <div key={`${i}-${p.titre}`} className={`reveal ${delaiApparition(i)} flex`}>
                <article className="prestation flex-1">
                  <IconeWP fixe={p.icone.fixe} mouvement={p.icone.mouvement} />
                  <h2 className="text-[24px]">{p.titre}</h2>
                  {p.description && <WPContent html={p.description} className="text-[16px] leading-[1.6]" />}
                </article>
              </div>
            ))}
          </Apparition>
        )}
      </section>

      {senso && (
        <section id="sensopro" className="section-y scroll-mt-4">
          <Apparition className="container-x">
            <div className="reveal on-dark rounded-[24px] overflow-hidden flex flex-wrap">
              <div className="reveal reveal-gauche [--reveal-delay:150ms] flex-[1_1_380px] p-[clamp(28px,4vw,56px)] flex flex-col gap-5 justify-center">
                <h2 className="text-[clamp(32px,3.6vw,52px)] leading-[1.05] tracking-[-0.02em]">{senso.titre}</h2>
                {senso.sousTitre && (
                  <p className="font-display text-[clamp(19px,1.8vw,24px)] leading-[1.3]">{senso.sousTitre}</p>
                )}
                {senso.description && (
                  <WPContent html={senso.description} className="text-[17px] leading-[1.6] text-on-dark-soft max-w-[520px]" />
                )}
                {sensoBouton && (
                  <div className="flex flex-wrap gap-3 mt-1">
                    <a {...linkProps(sensoBouton.url)} className="btn btn-jaune">
                      {sensoBouton.label} <span aria-hidden>→</span>
                    </a>
                  </div>
                )}
              </div>
              {/* Galerie ACF en grille : une image pleine colonne, puis deux
                  par ligne ; une dernière image seule prend toute la ligne.
                  Images recadrées. Pas d'image = pas de colonne. */}
              {senso.galerie.length > 0 && (
                <div
                  className={`reveal reveal-droite [--reveal-delay:250ms] flex-[1_1_380px] min-h-[360px] grid gap-[3px] bg-vert ${
                    senso.galerie.length > 1 ? "grid-cols-2" : "grid-cols-1"
                  }`}
                >
                  {senso.galerie.map((img, i) => (
                    <img
                      key={img.id}
                      src={img.url}
                      alt={img.alt || senso.titre}
                      loading="lazy"
                      className={`w-full h-full min-h-[180px] object-cover ${
                        i === senso.galerie.length - 1 && i % 2 === 0 ? "col-span-full" : ""
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </Apparition>
        </section>
      )}
    </>
  );
}
