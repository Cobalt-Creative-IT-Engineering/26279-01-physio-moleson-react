import { SITE_CONFIG, CONTACT, NAV_ITEMS, TBOOKING_URL } from "../../config/site";
import { useGlobalOptions } from "../../hooks/useWordPress";
import { Logo, SocialLinks } from "../ui";

export function Footer() {
  const { data: g } = useGlobalOptions();

  const phone     = g?.phone || CONTACT.phone;
  const email     = g?.email || CONTACT.email;
  // Ordre de la rue (66 avant 68), quel que soit celui saisi dans WordPress.
  const addresses = [...(g && g.addresses.length ? g.addresses : CONTACT.addresses)]
    .sort((x, y) => x.street.localeCompare(y.street, "fr", { numeric: true }));

  return (
    <footer className="pied on-dark">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-x-[clamp(24px,4vw,64px)] gap-y-10 max-w-container mx-auto">
        <div className="flex flex-col gap-8 max-w-[320px]">
          <Logo variant="light" size={140} className="w-[140px] h-[140px] opacity-90" />
          <p className="text-on-dark-soft">{SITE_CONFIG.description}</p>
          <SocialLinks variant="contour" overrides={{ instagram: g?.social.instagram, facebook: g?.social.facebook }} />
        </div>

        <div className="flex flex-col gap-2.5">
          <div className="pied-titre">Navigation</div>
          {NAV_ITEMS.map((item) => (
            <a key={item.id} href={item.url}>{item.title}</a>
          ))}
          <a href={TBOOKING_URL} target="_blank" rel="noopener">Prendre rendez-vous</a>
        </div>

        <div className="flex flex-col gap-2.5">
          <div className="pied-titre">Cabinet</div>
          {addresses.map((a) => (
            <span key={a.id}>{a.street}</span>
          ))}
          <span>{addresses[0]?.postcode} {addresses[0]?.city}, Suisse</span>
          <a href={`tel:${CONTACT.phoneTel}`}>{phone}</a>
          <a href={`mailto:${email}`}>{email}</a>
        </div>

        <div className="flex flex-col gap-2.5">
          <div className="pied-titre">Secrétariat</div>
          <a href={`tel:${CONTACT.phoneTel}`}>{phone}</a>
          {CONTACT.secretariat.map((s) => (
            <div key={s.days} className="flex flex-col">
              <span className="text-on-dark font-semibold">{s.days}</span>
              <span>{s.hours}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="pied-bas max-w-container mx-auto mt-12 pt-6 flex flex-wrap justify-between gap-3 text-[12px]">
        <span>© {new Date().getFullYear()} {SITE_CONFIG.name}</span>
        <span>
          Développé par{" "}
          <a href="https://cobalt-it.ch/" target="_blank" rel="noreferrer" className="underline underline-offset-4">
            Cobalt
          </a>
        </span>
      </div>
    </footer>
  );
}
