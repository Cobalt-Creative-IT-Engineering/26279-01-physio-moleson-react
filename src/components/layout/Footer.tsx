import { SITE_CONFIG, SOCIAL_LINKS, CONTACT, NAV_ITEMS } from "../../config/site";
import { Logo } from "../ui";

export function Footer() {
  const socials = Object.entries(SOCIAL_LINKS).filter(([, url]) => !!url);

  return (
    <footer
      className="mt-auto py-20 pb-8"
      style={{ background: "var(--color-ink)", color: "oklch(0.85 0.01 200)" }}
    >
      <div className="container-x">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr] gap-12 pb-12 border-b" style={{ borderColor: "oklch(0.35 0.015 200)" }}>
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <Logo size={36} className="invert opacity-80" />
              <div className="font-display text-xl" style={{ color: "oklch(0.96 0.01 100)" }}>
                {SITE_CONFIG.name}
              </div>
            </div>
            <p className="text-[13.5px] leading-relaxed max-w-[340px]" style={{ color: "oklch(0.7 0.015 200)" }}>
              {SITE_CONFIG.description}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <div className="text-[10px] tracking-[0.2em] uppercase mb-4" style={{ color: "oklch(0.78 0.03 155)" }}>
              Navigation
            </div>
            <ul className="flex flex-col gap-2.5 text-[13.5px]" style={{ color: "oklch(0.7 0.015 200)" }}>
              {NAV_ITEMS.map((item) => (
                <li key={item.id}>
                  <a href={item.url} className="hover:text-bg transition-colors">{item.title}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Cabinet */}
          <div>
            <div className="text-[10px] tracking-[0.2em] uppercase mb-4" style={{ color: "oklch(0.78 0.03 155)" }}>
              Cabinet
            </div>
            <ul className="flex flex-col gap-2.5 text-[13.5px]" style={{ color: "oklch(0.7 0.015 200)" }}>
              {CONTACT.addresses.map((a) => (
                <li key={a.id}>{a.street}</li>
              ))}
              <li>{CONTACT.addresses[0].postcode} {CONTACT.addresses[0].city}, Suisse</li>
              <li>
                <a href={`tel:${CONTACT.phoneTel}`} className="hover:text-bg transition-colors">{CONTACT.phone}</a>
              </li>
              <li>
                <a href={`mailto:${CONTACT.email}`} className="hover:text-bg transition-colors">{CONTACT.email}</a>
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
                      className="w-8 h-8 rounded-full border inline-flex items-center justify-center capitalize text-xs transition-colors"
                      style={{ borderColor: "oklch(0.35 0.015 200)", color: "oklch(0.78 0.03 155)" }}
                    >
                      {name[0]}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center pt-7 text-[11.5px] tracking-[0.04em] flex-wrap gap-4" style={{ color: "oklch(0.6 0.015 200)" }}>
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
                style={{ color: "oklch(0.78 0.03 155)", borderColor: "oklch(0.4 0.03 155)" }}
              >
                Cobalt
              </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
