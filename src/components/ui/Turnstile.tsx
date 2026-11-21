import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { TURNSTILE_SITE_KEY } from "../../config/site";

/**
 * Captcha Cloudflare Turnstile. Le script n'est chargé que sur la page qui
 * affiche le widget. `onToken` reçoit le jeton (chaîne vide quand il expire) ;
 * `reset()` en demande un nouveau (un jeton ne sert qu'une fois).
 */

type TurnstileApi = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  reset: (id?: string) => void;
  remove: (id: string) => void;
};
declare global {
  interface Window { turnstile?: TurnstileApi }
}

const SCRIPT = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
let chargement: Promise<TurnstileApi> | null = null;

function chargerTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  chargement ??= new Promise((ok, ko) => {
    const s = document.createElement("script");
    s.src = SCRIPT;
    s.async = true;
    s.onload = () => (window.turnstile ? ok(window.turnstile) : ko(new Error("turnstile")));
    s.onerror = () => { chargement = null; ko(new Error("turnstile")); };
    document.head.appendChild(s);
  });
  return chargement;
}

export type TurnstileHandle = { reset: () => void };

export const Turnstile = forwardRef<TurnstileHandle, { onToken: (jeton: string) => void; className?: string }>(
  function Turnstile({ onToken, className = "" }, ref) {
    const conteneur = useRef<HTMLDivElement>(null);
    const widget = useRef<string | null>(null);
    // Dernier rappel, sans recréer le widget à chaque rendu.
    const rappel = useRef(onToken);
    rappel.current = onToken;

    useImperativeHandle(ref, () => ({
      reset: () => {
        rappel.current("");
        if (widget.current) window.turnstile?.reset(widget.current);
      },
    }));

    useEffect(() => {
      if (!TURNSTILE_SITE_KEY) return;
      let actif = true;
      chargerTurnstile()
        .then((api) => {
          if (!actif || !conteneur.current) return;
          widget.current = api.render(conteneur.current, {
            sitekey: TURNSTILE_SITE_KEY,
            language: "fr",
            theme: "light",
            callback: (t: string) => rappel.current(t),
            "expired-callback": () => rappel.current(""),
            "error-callback": () => rappel.current(""),
          });
        })
        .catch(() => {});
      return () => {
        actif = false;
        if (widget.current) window.turnstile?.remove(widget.current);
        widget.current = null;
      };
    }, []);

    if (!TURNSTILE_SITE_KEY) return null;
    return <div ref={conteneur} className={className} />;
  }
);
