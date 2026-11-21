import { useState, useEffect } from "react";
import { PAGE_CONFIDENTIALITE } from "../../config/site";

const STORAGE_KEY = "physio-moleson:cookie-consent";

type Consent = "accepted" | "declined";

function readConsent(): Consent | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === "accepted" || v === "declined" ? v : null;
  } catch {
    return null;
  }
}

function writeConsent(value: Consent) {
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch { /* private mode / quota — ignore */ }
}

/**
 * Hook utilitaire pour lire le consentement courant ailleurs dans l'app
 * (par exemple, conditionner le chargement d'un script analytics).
 */
export function useCookieConsent(): Consent | null {
  const [consent, setConsent] = useState<Consent | null>(readConsent);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setConsent(readConsent());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return consent;
}

export function CookieBanner() {
  const [consent, setConsent] = useState<Consent | null>(readConsent);

  if (consent !== null) return null;

  const choose = (value: Consent) => {
    writeConsent(value);
    setConsent(value);
  };

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookies"
      className="fixed inset-x-0 bottom-0 z-[60] px-4 pb-4 pointer-events-none"
      style={{ animation: "slideUp 350ms cubic-bezier(0.2,0,0,1)" }}
    >
      <div className="mx-auto max-w-3xl pointer-events-auto card p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
        <p className="flex-1 text-[15px] text-ink">
          Ce site utilise des cookies afin de vous offrir une expérience optimale
          de navigation. En continuant de visiter ce site, vous acceptez
          l'utilisation de ces cookies.{" "}
          <a href={PAGE_CONFIDENTIALITE} className="underline underline-offset-2 font-semibold">
            En savoir plus
          </a>
        </p>
        {/* Enveloppe : bouton aligné à droite en ligne, à gauche en colonne. */}
        <div className="shrink-0">
          <button
            type="button"
            className="btn btn-jaune text-[15px] px-5 py-2.5"
            onClick={() => choose("accepted")}
          >
            J'ai compris
          </button>
        </div>
      </div>
    </div>
  );
}
