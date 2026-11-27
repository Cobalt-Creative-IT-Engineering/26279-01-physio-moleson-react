import { SITE_CONFIG, NAV_ITEMS, TBOOKING_URL, PAGE_CONFIDENTIALITE } from "../../config/site";
import { lienTel } from "../../lib/telephone";
import { useGlobalOptions } from "../../hooks/useWordPress";
import { Logo, SocialLinks } from "../ui";

/**
 * Pied de page : logo, résumé, téléphone, e-mail, adresses et réseaux sociaux
 * viennent des options globales ACF (`options_globale`). Champ vide = rien
 * d'affiché.
 */
export function Footer() {
  const { data: g } = useGlobalOptions();

  const phone     = g?.phone ?? "";
  const tel       = lienTel(phone);
  const email     = g?.email ?? "";
  // Ordre de la rue (66 avant 68), quel que soit celui saisi dans WordPress.
  const addresses = [...(g?.addresses ?? [])]
    .sort((x, y) => x.street.localeCompare(y.street, "fr", { numeric: true }));

  return (
    <footer className="pied on-dark">
      {/* Colonnes à la largeur de leur contenu, réparties sur toute la
          largeur : la dernière s'aligne sur le bord droit du trait. */}
      <div className="flex flex-wrap justify-between gap-x-[clamp(24px,4vw,64px)] gap-y-8 max-w-container mx-auto">
        <div className="flex flex-col gap-5 max-w-[320px]">
          {/* -ml : le fichier du logo a ~14 px de marge transparente à gauche ;
              on la compense pour aligner le dessin sur le texte du dessous. */}
          {g?.logo ? (
            // Même traitement que le logo local (raster noir passé en blanc).
            <img
              src={g.logo.url}
              alt={g.logo.alt || SITE_CONFIG.name}
              width={110}
              height={110}
              className="block object-contain logo-inverse w-[110px] h-[110px] -ml-[14px] opacity-90"
            />
          ) : (
            <Logo variant="light" size={110} className="w-[110px] h-[110px] -ml-[14px] opacity-90" />
          )}
          {g?.resume && <p className="text-on-dark-soft whitespace-pre-line">{g.resume}</p>}
          <SocialLinks variant="contour" links={g?.social} tel={phone ? tel : undefined} />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="pied-titre">Navigation</div>
          {NAV_ITEMS.map((item) => (
            <a key={item.id} href={item.url}>{item.title}</a>
          ))}
          <a href={TBOOKING_URL} target="_blank" rel="noopener">Prendre rendez-vous</a>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="pied-titre">Cabinet</div>
          {addresses.map((a) => (
            <span key={a.id}>{a.street}</span>
          ))}
          {addresses[0] && <span>{addresses[0].postcode} {addresses[0].city}, Suisse</span>}
          {phone && <a href={`tel:${tel}`}>{phone}</a>}
          {email && <a href={`mailto:${email}`}>{email}</a>}
        </div>
      </div>

      {/* Trois colonnes dès 768 px : ©, lien juridique centré, crédit à droite.
          En dessous, les trois l'un sous l'autre, alignés à gauche. */}
      <div className="pied-bas max-w-container mx-auto mt-8 pt-5 grid gap-3 md:grid-cols-[1fr_auto_1fr] md:items-baseline text-[14px]">
        <span>© {new Date().getFullYear()} {SITE_CONFIG.name}</span>
        <a href={PAGE_CONFIDENTIALITE} className="md:text-center">
          Conditions d'utilisation et protection des données
        </a>
        <span className="md:text-right">
          Développé par{" "}
          <a href="https://cobalt-it.ch/" target="_blank" rel="noreferrer" className="font-bold">
            Cobalt
          </a>
        </span>
      </div>
    </footer>
  );
}
