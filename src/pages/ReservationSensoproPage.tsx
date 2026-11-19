import { useEffect, useRef, useState } from "react";
import { usePagePrestations } from "../hooks/useWordPress";
import { PageBanner, BannerText } from "../components/layout";
import { setPageMeta } from "../lib/meta";

/**
 * Adresse du formulaire de réservation Amelia (page WordPress
 * « reservation-sensopro »). Le paramètre `cadre` fait router la requête vers
 * WordPress par le .htaccess ; sans lui, la même URL sert cette page React.
 * Pas `embed` : réservé par WordPress, qui servirait sa carte de partage.
 */
const FORMULAIRE_URL = "/reservation-sensopro/?cadre=1";

/**
 * Styles injectés dans l'iframe (même origine) : masque l'en-tête, le pied,
 * le titre et les espacements du thème WordPress (Twenty Twenty-Four), fond
 * transparent, contenu pleine largeur. Seul le formulaire Amelia reste.
 * À revoir si le thème WordPress change.
 */
const HABILLAGE = `
  html, body, .wp-site-blocks, main, .wp-block-post-content { margin: 0 !important; padding: 0 !important; background: transparent !important; }
  #wpadminbar,
  .wp-site-blocks > header, .wp-site-blocks > footer,
  .wp-block-post-title, .wp-block-spacer { display: none !important; }
  .wp-site-blocks, main, .has-global-padding { padding: 0 !important; margin: 0 !important; }
  .is-layout-constrained > * { max-width: none !important; }
  .wp-block-post-content > p:empty { display: none !important; }
  /* Amelia pose 100 px de marge au-dessus et en dessous du formulaire. */
  .amelia-v2-booking { margin: 0 !important; }
  .am-fs__wrapper { margin: 0 auto !important; }
`;

/**
 * Réservation de la salle Sensopro : formulaire Amelia de WordPress dans un
 * iframe. Même origine que le site : la hauteur suit celle du formulaire
 * (pas de double barre de défilement au fil des étapes).
 * Titre et vidéo : sous-groupe Sensopro et bannière de la page Prestations.
 */
export function ReservationSensoproPage() {
  const { data } = usePagePrestations();
  const senso = data?.sensopro;
  const cadre = useRef<HTMLIFrameElement>(null);
  const [hauteur, setHauteur] = useState(900);

  useEffect(() => {
    setPageMeta({
      title: senso?.titre ? `Réservation — ${senso.titre}` : "Réservation Sensopro",
      description: "Réserver la salle Sensopro de Physio du Moléson à Bulle.",
    });
  }, [senso?.titre]);

  // Au chargement : ne garder du thème WordPress que le contenu de la page
  // (le formulaire), puis ajuster la hauteur de l'iframe à chaque étape.
  const suivre = () => {
    const doc = cadre.current?.contentDocument;
    if (!doc?.body) return;
    const style = doc.createElement("style");
    style.textContent = HABILLAGE;
    doc.head.appendChild(style);
    // Mesure du contenu seul : la hauteur du document vaut au moins celle de
    // l'iframe, elle ne redescendrait jamais d'une étape longue à une courte.
    const contenu = doc.querySelector<HTMLElement>(".wp-block-post-content") ?? doc.body;
    const mesurer = () => setHauteur(Math.max(400, Math.ceil(contenu.getBoundingClientRect().height)));
    mesurer();
    new ResizeObserver(mesurer).observe(contenu);
  };

  return (
    <>
      <PageBanner title={senso?.titre ?? ""} video={data?.banner.video}>
        {senso?.sousTitre && <BannerText>{senso.sousTitre}</BannerText>}
      </PageBanner>

      <section id="reservation" className="section-y">
        <div className="container-x max-w-[860px]">
          {/* Garde-fou : si la requête n'est pas routée vers WordPress, l'iframe
              recevrait cette même page React ; on ne l'imbrique pas une seconde fois. */}
          {window.self === window.top && (
          <iframe
            ref={cadre}
            src={FORMULAIRE_URL}
            title={senso?.titre ? `Réservation — ${senso.titre}` : "Réservation Sensopro"}
            onLoad={suivre}
            style={{ height: hauteur }}
            className="w-full border-0 block"
          />
          )}
        </div>
      </section>
    </>
  );
}
