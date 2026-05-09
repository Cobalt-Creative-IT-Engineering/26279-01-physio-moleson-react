import { useState, useEffect } from "react";

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
      aria-label="Consentement aux cookies"
      className="fixed inset-x-0 bottom-0 z-[60] px-4 pb-4 pointer-events-none"
      style={{ animation: "slideUp 350ms cubic-bezier(0.2,0,0,1)" }}
    >
      <div
        className="mx-auto max-w-3xl pointer-events-auto bg-surface border border-line rounded-card shadow-lg p-6 md:p-7 flex flex-col md:flex-row md:items-center gap-5"
      >
        <div className="flex-1">
          <div className="font-display text-lg text-ink mb-1">
            Cookies & confidentialité
          </div>
          <p className="text-sm text-ink-soft leading-relaxed">
            Nous utilisons des cookies pour mesurer l'audience du site et
            améliorer votre expérience. Aucun cookie publicitaire n'est déposé.
          </p>
        </div>

        <div className="flex gap-2.5 shrink-0">
          <button
            type="button"
            className="btn btn-ghost"
            style={{ padding: "10px 18px", fontSize: 13 }}
            onClick={() => choose("declined")}
          >
            Refuser
          </button>
          <button
            type="button"
            className="btn btn-primary"
            style={{ padding: "10px 20px", fontSize: 13 }}
            onClick={() => choose("accepted")}
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
}
