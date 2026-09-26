import { SITE_CONFIG, SOCIAL_LINKS, CONTACT, NAV_ITEMS } from "../../config/site";
import { useGlobalOptions } from "../../hooks/useWordPress";
import { Logo, Icon } from "../ui";
import type { IconName } from "../ui";
import { MountainFooter } from "../animation";

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
      <MountainFooter />
      <footer
        className="py-20 pb-8"
        style={{ background: "var(--color-dark)", color: "var(--color-on-dark-soft)" }}
      >
      <div className="container-x">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr] gap-12 pb-12 border-b" style={{ borderColor: "var(--color-dark-line)" }}>
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <Logo size={36} className="invert opacity-80" />
              <div className="font-display text-xl" style={{ color: "var(--color-on-dark)" }}>
                {SITE_CONFIG.name}
              </div>
            </div>
            <p className="text-[15px] max-w-[340px]" style={{ color: "var(--color-on-dark-soft)" }}>
              {SITE_CONFIG.description}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <div className="label text-[11px] mb-4" style={{ color: "var(--color-sauge)" }}>
              Navigation
            </div>
            <ul className="flex flex-col gap-2.5 text-[15px]" style={{ color: "var(--color-on-dark-soft)" }}>
              {NAV_ITEMS.map((item) => (
                <li key={item.id}>
                  <a href={item.url} className="hover:text-on-dark transition-colors">{item.title}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Cabinet */}
          <div>
            <div className="label text-[11px] mb-4" style={{ color: "var(--color-sauge)" }}>
              Cabinet
            </div>
            <ul className="flex flex-col gap-2.5 text-[15px]" style={{ color: "var(--color-on-dark-soft)" }}>
              {addresses.map((a) => (
                <li key={a.id}>{a.street}</li>
              ))}
              <li>{addresses[0]?.postcode} {addresses[0]?.city}, Suisse</li>
              <li>
                <a href={`tel:${CONTACT.phoneTel}`} className="hover:text-on-dark transition-colors">{phone}</a>
              </li>
              <li>
                <a href={`mailto:${email}`} className="hover:text-on-dark transition-colors">{email}</a>
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
                      className="w-8 h-8 rounded-full border inline-flex items-center justify-center transition-colors hover:text-on-dark"
                      style={{ borderColor: "var(--color-dark-line)", color: "var(--color-sauge)" }}
                    >
                      <Icon name={name as IconName} size={14} />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center pt-7 text-[11.5px] tracking-[0.04em] flex-wrap gap-4" style={{ color: "var(--color-on-dark-mute)" }}>
          <div className="flex gap-6 items-center flex-wrap">
            <span>© {new Date().getFullYear()} {SITE_CONFIG.name}</span>
            <span style={{ opacity: 0.5 }}>·</span>
            <span>
              Développé par{" "}
              <a
                href="https://cobalt-it.ch/"
                target="_blank"
                rel="noreferrer"
                className="border-b pb-px"
                style={{ color: "var(--color-sauge)", borderColor: "var(--color-dark-line)" }}
              >
                Cobalt
              </a>
            </span>
          </div>
        </div>
      </div>
      </footer>
    </div>
  );
}
