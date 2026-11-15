import { SITE_CONFIG, CONTACT, NAV_ITEMS, TBOOKING_URL } from "../../config/site";
import { useGlobalOptions } from "../../hooks/useWordPress";
import { Logo, SocialLinks } from "../ui";

/** « 026 303 93 43 » → « +41263039343 » pour un lien tel:. */
function lienTel(numero: string): string {
  const chiffres = numero.replace(/[^\d+]/g, "");
  if (chiffres.startsWith("+")) return chiffres;
  if (chiffres.startsWith("00")) return `+${chiffres.slice(2)}`;
  if (chiffres.startsWith("0")) return `+41${chiffres.slice(1)}`;
  return chiffres;
}

/**
 * Pied de page : logo, résumé, téléphone, e-mail, adresses et réseaux sociaux
 * viennent des options globales ACF (`options_globale`). Les valeurs de
 * CONTACT ne servent que tant que WordPress n'a pas répondu.
 */
export function Footer() {
  const { data: g } = useGlobalOptions();

  const phone     = g?.phone || CONTACT.phone;
  const tel       = lienTel(phone);
  const email     = g?.email || CONTACT.email;
  // Ordre de la rue (66 avant 68), quel que soit celui saisi dans WordPress.
  const addresses = [...(g && g.addresses.length ? g.addresses : CONTACT.addresses)]
    .sort((x, y) => x.street.localeCompare(y.street, "fr", { numeric: true }));

  return (
    <footer className="pied on-dark">
      {/* Colonnes à la largeur de leur contenu, réparties sur toute la
          largeur : la dernière s'aligne sur le bord droit du trait. */}
      <div className="flex flex-wrap justify-between gap-x-[clamp(24px,4vw,64px)] gap-y-8 max-w-container mx-auto">
        <div className="flex flex-col gap-5 max-w-[320px]">
          {g?.logo ? (
            // Même traitement que le logo local (raster noir passé en blanc).
            <img
              src={g.logo.url}
              alt={g.logo.alt || SITE_CONFIG.name}
              width={110}
              height={110}
              className="block object-contain logo-inverse w-[110px] h-[110px] opacity-90"
            />
          ) : (
            <Logo variant="light" size={110} className="w-[110px] h-[110px] opacity-90" />
          )}
          {g?.resume && <p className="text-on-dark-soft whitespace-pre-line">{g.resume}</p>}
          <SocialLinks variant="contour" links={g?.social} />
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
          <span>{addresses[0]?.postcode} {addresses[0]?.city}, Suisse</span>
          <a href={`tel:${tel}`}>{phone}</a>
          <a href={`mailto:${email}`}>{email}</a>
        </div>
      </div>

      <div className="pied-bas max-w-container mx-auto mt-8 pt-5 flex flex-wrap justify-between gap-3 text-[12px]">
        <span>© {new Date().getFullYear()} {SITE_CONFIG.name}</span>
        <span>
          Développé par{" "}
          <a href="https://cobalt-it.ch/" target="_blank" rel="noreferrer" className="font-bold">
            Cobalt
          </a>
        </span>
      </div>
    </footer>
  );
}
