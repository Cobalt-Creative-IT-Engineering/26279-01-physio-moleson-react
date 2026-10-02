import { SITE_CONFIG, SOCIAL_LINKS, CONTACT, NAV_ITEMS } from "../../config/site";
import { useGlobalOptions } from "../../hooks/useWordPress";
import { Logo, Icon } from "../ui";
import foretSrc from "../../assets/decor/footer-foret.svg";
import type { IconName } from "../ui";

export function Footer() {
  const { data: g } = useGlobalOptions();

  const phone     = g?.phone || CONTACT.phone;
  const email     = g?.email || CONTACT.email;
  const addresses = g && g.addresses.length ? g.addresses : CONTACT.addresses;

  const socials = Object.entries({
    instagram: g?.social.instagram ?? SOCIAL_LINKS.instagram,
    facebook:  g?.social.facebook  ?? SOCIAL_LINKS.facebook,
  }).filter(([, url]) => !!url) as [string, string][];

  return (
    <div className="mt-auto">
      {/* Lisière de forêt (doc/footer/footer-foret.svg), statique. Le dessin
          sert de masque et la couleur vient du token --color-dark : la base
          se fond dans le pied de page sans couleur codée en dur. Boîte au
          ratio du viewBox (1440 × 264), donc aucune déformation ; -1 px pour
          éviter un liseré d'anticrénelage entre le dessin et l'aplat. */}
      <div
        aria-hidden
        className="w-full aspect-[1440/264] -mb-px"
        style={{
          background: "var(--color-dark)",
          WebkitMaskImage: `url(${foretSrc})`,
          maskImage: `url(${foretSrc})`,
          WebkitMaskSize: "100% 100%",
          maskSize: "100% 100%",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
        }}
      />
      {/* Aplat vert Moléson, texte sable (8.2:1), logo en réserve claire. */}
      <footer className="on-dark py-20 pb-8">
      <div className="container-x">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr] gap-12 pb-12 border-b border-on-dark">
          {/* Brand */}
          <div>
            {/* Logo complet en réserve claire. 160 px : à cette largeur le nom
                du bloc reste lisible ; zone de protection d'un quart de la
                largeur assurée par la marge basse. */}
            <Logo full variant="light" size={160} className="mb-10" />
            <p className="text-[16px] max-w-[340px]">
              {SITE_CONFIG.description}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <div className="label text-[13px] mb-4">
              Navigation
            </div>
            <ul className="flex flex-col gap-2.5 text-[16px]">
              {NAV_ITEMS.map((item) => (
                <li key={item.id}>
                  <a href={item.url} className="underline-offset-4 decoration-2 decoration-on-dark hover:underline">{item.title}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Cabinet */}
          <div>
            <div className="label text-[13px] mb-4">
              Cabinet
            </div>
            <ul className="flex flex-col gap-2.5 text-[16px]">
              {addresses.map((a) => (
                <li key={a.id}>{a.street}</li>
              ))}
              <li>{addresses[0]?.postcode} {addresses[0]?.city}, Suisse</li>
              <li>
                <a href={`tel:${CONTACT.phoneTel}`} className="underline-offset-4 decoration-2 decoration-on-dark hover:underline">{phone}</a>
              </li>
              <li>
                <a href={`mailto:${email}`} className="underline-offset-4 decoration-2 decoration-on-dark hover:underline">{email}</a>
              </li>
            </ul>

            {socials.length > 0 && (
              <ul className="flex gap-2.5 mt-4">
                {socials.map(([name, url]) => (
                  <li key={name}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={name}
                      className="w-11 h-11 inline-flex items-center justify-center rounded-full transition-colors hover:bg-sable hover:text-vert"
                    >
                      <Icon name={name as IconName} size={22} />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center pt-7 text-[14px] flex-wrap gap-4">
          <span>© {new Date().getFullYear()} {SITE_CONFIG.name}</span>
          <span>
            Développé par{" "}
            <a
              href="https://cobalt-it.ch/"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4 decoration-2 decoration-on-dark"
            >
              Cobalt
            </a>
          </span>
        </div>
      </div>
      </footer>
    </div>
  );
}
