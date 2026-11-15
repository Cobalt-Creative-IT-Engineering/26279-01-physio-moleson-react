import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { NAV_ITEMS, TBOOKING_URL } from "../../config/site";
import { useGlobalOptions } from "../../hooks/useWordPress";
import { lienTel } from "../../lib/telephone";
import { useRoute } from "../../hooks/useRoute";
import { Logo } from "../ui";

function PhoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden>
      <path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2z" />
    </svg>
  );
}

/**
 * En-tête du site, posé DANS chaque bannière verte (pas d'en-tête fixe).
 *
 * Sous 1280 px la navigation complète ne tient plus sur une ligne : elle
 * passe dans un menu plein écran (non dessiné dans la maquette). Le menu est
 * rendu dans <body> par un portail, sans quoi le clip-path de la bannière le
 * découperait.
 */
export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { route } = useRoute();
  // Téléphone des options globales ACF ; masqué tant qu'il est vide.
  const { data: g } = useGlobalOptions();
  const phone = g?.phone ?? "";

  const isActive = (url: string) => (url === "/" ? route === "/" : route.startsWith(url));

  // Fermeture à la navigation, à Échap, et verrouillage du défilement.
  useEffect(() => setOpen(false), [route]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="container-x relative z-[2] flex items-center justify-between gap-6 py-[22px]">
      <a href="/" aria-label="Physio du Moléson — accueil">
        <Logo
          variant="light"
          size={150}
          className="w-[110px] h-[110px] md:w-[150px] md:h-[150px]"
        />
      </a>

      <nav aria-label="Navigation principale" className="hidden xl:flex items-center gap-[clamp(16px,2.6vw,36px)]">
        {NAV_ITEMS.map((item) => (
          <a
            key={item.id}
            href={item.url}
            aria-current={isActive(item.url) ? "page" : undefined}
            className="nav-lien"
          >
            {item.title}
          </a>
        ))}
        {phone && (
          <a href={`tel:${lienTel(phone)}`} className="nav-lien inline-flex items-center gap-2 whitespace-nowrap">
            <PhoneIcon />
            {phone}
          </a>
        )}
        <a href={TBOOKING_URL} target="_blank" rel="noopener" className="btn btn-jaune btn-nav">
          Prendre rendez-vous
        </a>
      </nav>

      <button
        type="button"
        className="xl:hidden inline-flex items-center gap-3 nav-lien py-2"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="menu-mobile"
      >
        Menu
        <span aria-hidden className="flex flex-col gap-[5px]">
          <span className="block w-6 h-0.5 bg-on-dark" />
          <span className="block w-6 h-0.5 bg-on-dark" />
          <span className="block w-6 h-0.5 bg-on-dark" />
        </span>
      </button>

      {open && createPortal(
        <div
          id="menu-mobile"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="on-dark fixed inset-0 z-[90] overflow-y-auto"
          style={{ animation: "fadeIn 200ms ease-out" }}
        >
          <div className="container-x flex items-center justify-between py-[22px]">
            <Logo variant="light" size={84} className="w-[84px] h-[84px]" />
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fermer le menu"
              className="rond w-11 h-11 border-[1.5px] border-on-dark hover:bg-on-dark hover:text-ink"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          </div>
          <nav aria-label="Navigation principale" className="container-x flex flex-col pt-4 pb-12">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.id}
                href={item.url}
                aria-current={isActive(item.url) ? "page" : undefined}
                onClick={() => setOpen(false)}
                className="nav-lien font-display font-medium text-[28px] py-3"
              >
                {item.title}
              </a>
            ))}
            {phone && (
              <a href={`tel:${lienTel(phone)}`} className="nav-lien inline-flex items-center gap-2 mt-8 text-[17px]">
                <PhoneIcon />
                {phone}
              </a>
            )}
            <a href={TBOOKING_URL} target="_blank" rel="noopener" className="btn btn-jaune self-start mt-6">
              Prendre rendez-vous <span aria-hidden>→</span>
            </a>
          </nav>
        </div>,
        document.body
      )}
    </header>
  );
}
