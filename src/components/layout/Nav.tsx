import { useState, useEffect } from "react";
import { NAV_ITEMS, SITE_CONFIG, CONTACT } from "../../config/site";
import { useRoute } from "../../hooks/useRoute";
import { Logo } from "../ui";

const leftItems  = NAV_ITEMS.filter((i) => !i.cta);
const rightItems = NAV_ITEMS.filter((i) =>  i.cta);

export function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { route } = useRoute();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (url: string) => route === url || (url !== "/" && route.startsWith(url));

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgb(255 253 250 / 0.9)" : "transparent",
        backdropFilter: scrolled ? "saturate(1.4) blur(14px)" : "none",
        WebkitBackdropFilter: scrolled ? "saturate(1.4) blur(14px)" : "none",
        borderBottom: scrolled ? "1px solid var(--color-line-soft)" : "1px solid transparent",
      }}
    >
      <div
        className="flex items-center justify-between px-12 transition-all duration-300"
        style={{ padding: scrolled ? "14px 48px" : "20px 48px" }}
      >
        <a href="/" className="flex items-center gap-3 cursor-pointer" onClick={() => setOpen(false)}>
          <Logo size={36} />
          <div className="leading-tight">
            <div className="font-display font-medium text-[18px] tracking-[0.02em] text-ink">{SITE_CONFIG.name}</div>
            <div className="label text-[12px] text-ink-mute">Bulle depuis 2021</div>
          </div>
        </a>

        <nav className="hidden lg:flex gap-9 text-[15px] tracking-[0.01em]">
          {leftItems.map((item) => {
            const active = isActive(item.url);
            return (
              <a
                key={item.id}
                href={item.url}
                aria-current={active ? "page" : undefined}
                className={`group relative py-1.5 transition-colors duration-200 hover:text-primary-text ${
                  active ? "text-primary-text" : "text-ink"
                }`}
              >
                {item.title}
                {/* Filet terracotta : plein sur la page active, déployé depuis
                    la gauche au survol pour les autres. */}
                <span
                  aria-hidden
                  className={`absolute bottom-0 left-0 right-0 h-px bg-primary origin-left transition-transform duration-300 ease-out motion-reduce:transition-none ${
                    active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100 group-focus-visible:scale-x-100"
                  }`}
                />
              </a>
            );
          })}
        </nav>

        <div className="hidden lg:flex gap-3 items-center">
          <a href={`tel:${CONTACT.phoneTel}`} className="text-[15px] text-ink-soft hover:text-primary-text transition-colors">
            {CONTACT.phone}
          </a>
          {rightItems.map((item) => (
            <a
              key={item.id}
              href={item.url}
              className="btn btn-primary"
              style={{ padding: "10px 20px" }}
            >
              {item.title}
            </a>
          ))}
        </div>

        <button
          className="lg:hidden flex flex-col gap-1 p-2"
          onClick={() => setOpen((o) => !o)}
          aria-label="Menu"
          aria-expanded={open}
        >
          <span className={`block w-5 h-0.5 bg-ink transition-transform ${open ? "translate-y-[6px] rotate-45" : ""}`} />
          <span className={`block w-5 h-0.5 bg-ink transition-opacity ${open ? "opacity-0" : ""}`} />
          <span className={`block w-5 h-0.5 bg-ink transition-transform ${open ? "-translate-y-[6px] -rotate-45" : ""}`} />
        </button>
      </div>

      {open && (
        <div className="lg:hidden flex flex-col bg-surface border-t border-line-soft px-12 py-4">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.id}
              href={item.url}
              className="py-3 text-ink hover:text-primary-text transition-colors border-b border-line-soft last:border-0"
              onClick={() => setOpen(false)}
            >
              {item.title}
            </a>
          ))}
          <a href={`tel:${CONTACT.phoneTel}`} className="py-3 text-ink-soft">
            {CONTACT.phone}
          </a>
        </div>
      )}
    </header>
  );
}
