import { useEffect, useRef, useState } from "react";
import { usePagePrestations } from "../hooks/useWordPress";
import { PageBanner, BannerText } from "../components/layout";
import { setPageMeta } from "../lib/meta";

/**
 * Adresse du formulaire de réservation Amelia (page WordPress
 * « reservation-sensopro »). Le paramètre `embed` fait router la requête vers
 * WordPress par le .htaccess ; sans lui, la même URL sert cette page React.
 */
const FORMULAIRE_URL = "/reservation-sensopro/?embed=1";

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

  // Ajuste la hauteur de l'iframe à son contenu, à chaque changement d'étape.
  const suivre = () => {
    const doc = cadre.current?.contentDocument;
    if (!doc?.body) return;
    const mesurer = () => setHauteur(Math.max(400, doc.documentElement.scrollHeight));
    mesurer();
    new ResizeObserver(mesurer).observe(doc.body);
  };

  return (
    <>
      <PageBanner title={senso?.titre ?? ""} video={data?.banner.video}>
        {senso?.sousTitre && <BannerText>{senso.sousTitre}</BannerText>}
      </PageBanner>

      <section id="reservation" className="section-y">
        <div className="container-x">
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
