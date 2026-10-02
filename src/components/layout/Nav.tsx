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
      /* Fond blanc plein, en permanence : la charte proscrit les transparences
         et, sur l'accueil, l'en-tête surplombe le héros vert Moléson — un
         en-tête transparent y poserait de l'anthracite sur du vert. */
      className={`fixed top-0 left-0 right-0 z-50 bg-bg border-b transition-colors duration-300 ${
        scrolled ? "border-line" : "border-transparent"
      }`}
    >
      <div
        className={`flex items-center justify-between px-4 sm:px-6 lg:px-12 transition-all duration-300 ${
          scrolled ? "py-3.5" : "py-5"
        }`}
      >
        <a href="/" className="flex items-center gap-3 cursor-pointer" onClick={() => setOpen(false)}>
          <Logo size={36} />
          <div className="leading-tight">
            <div className="font-display font-medium text-[18px] tracking-[0.02em] text-ink">{SITE_CONFIG.name}</div>
            <div className="label text-[13px] text-ink">Bulle depuis 2021</div>
          </div>
        </a>

        <nav className="hidden lg:flex gap-7 text-[16px]">
          {leftItems.map((item) => {
            const active = isActive(item.url);
            return (
              <a
                key={item.id}
                href={item.url}
                aria-current={active ? "page" : undefined}
                /* Page active : pilule jaune (« état actif » de la charte).
                   Autres pages : pilule sable au survol. */
                className={`py-1.5 px-3 rounded-full text-ink transition-colors duration-150 ${
                  active ? "bg-jaune" : "hover:bg-sable"
                }`}
              >
                {item.title}
              </a>
            );
          })}
        </nav>

        <div className="hidden lg:flex gap-3 items-center">
          <a href={`tel:${CONTACT.phoneTel}`} className="text-[16px] text-ink hover:text-vert transition-colors">
            {CONTACT.phone}
          </a>
          {rightItems.map((item) => (
            <a
              key={item.id}
              href={item.url}
              className="btn btn-primary"
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
        <div className="lg:hidden flex flex-col bg-bg border-t border-line px-4 sm:px-6 py-4">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.id}
              href={item.url}
              className={`py-3 text-ink hover:text-vert transition-colors border-b border-line last:border-0 ${isActive(item.url) ? "font-bold" : ""}`}
              onClick={() => setOpen(false)}
            >
              {item.title}
            </a>
          ))}
          <a href={`tel:${CONTACT.phoneTel}`} className="py-3 text-ink">
            {CONTACT.phone}
          </a>
        </div>
      )}
    </header>
  );
}
