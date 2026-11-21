import { useState, useEffect, useRef } from "react";
import { useGlobalOptions, useAccueilOptions } from "../hooks/useWordPress";
import { PageBanner } from "../components/layout";
import { SocialLinks, Apparition, Turnstile } from "../components/ui";
import type { TurnstileHandle } from "../components/ui";
import { envoyerContact } from "../lib/contact";
import { TURNSTILE_SITE_KEY } from "../config/site";
import { lienTel } from "../lib/telephone";
import { setPageMeta } from "../lib/meta";

/* ─── Formulaire ───────────────────────────────────────────────────────── */

// Noms des champs = noms des balises du formulaire Contact Form 7.
const CHAMPS = { nom: "contact-nom", tel: "contact-telephone", email: "contact-email", message: "contact-message" };

function ContactForm() {
  const [etat, setEtat] = useState<"saisie" | "envoi" | "envoye">("saisie");
  const [jeton, setJeton] = useState("");
  const [erreur, setErreur] = useState("");
  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const captcha = useRef<TurnstileHandle>(null);
  // Sans clé Turnstile (formulaire non branché), pas d'attente de jeton.
  const captchaRequis = TURNSTILE_SITE_KEY !== "";

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setEtat("envoi");
    setErreur("");
    setErreurs({});
    const r = await envoyerContact(new FormData(form), jeton);
    if (r.ok) {
      form.reset();
      setEtat("envoye");
    } else {
      setErreur(r.message);
      setErreurs(r.champs);
      setEtat("saisie");
    }
    // Un jeton Turnstile ne sert qu'une fois.
    captcha.current?.reset();
  };

  if (etat === "envoye") {
    return (
      <div role="status" className="flex flex-col gap-3.5 items-start py-5">
        <h3 className="text-[26px]">Merci, votre message est envoyé.</h3>
        <p>Nous vous répondons dans les meilleurs délais.</p>
        <button type="button" onClick={() => setEtat("saisie")} className="btn btn-contour text-[14px] px-[18px] py-2.5">
          Écrire un autre message
        </button>
      </div>
    );
  }

  const label = "flex flex-col gap-2 text-[14px] font-semibold";
  const aide = (champ: string) =>
    erreurs[champ] && <span className="text-[13px] font-normal text-jaune">{erreurs[champ]}</span>;

  return (
    <form onSubmit={submit} className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-[18px]">
      <label className={label}>
        Nom et prénom
        <input name={CHAMPS.nom} required autoComplete="name" className="champ" />
        {aide(CHAMPS.nom)}
      </label>
      <label className={label}>
        Téléphone
        <input name={CHAMPS.tel} type="tel" autoComplete="tel" className="champ" />
        {aide(CHAMPS.tel)}
      </label>
      <label className={`${label} col-span-full`}>
        E-mail
        <input name={CHAMPS.email} type="email" required autoComplete="email" className="champ" />
        {aide(CHAMPS.email)}
      </label>
      <label className={`${label} col-span-full`}>
        Message
        <textarea name={CHAMPS.message} required rows={5} className="champ resize-y" />
        {aide(CHAMPS.message)}
      </label>
      <Turnstile ref={captcha} onToken={setJeton} className="col-span-full flex justify-center" />
      {erreur && (
        <p role="alert" className="col-span-full text-[14px] font-semibold text-jaune">{erreur}</p>
      )}
      <div className="col-span-full flex flex-wrap items-center justify-between gap-3.5">
        <span className="text-[13px]">Pas de données médicales sensibles par ce formulaire.</span>
        <button
          type="submit"
          disabled={etat === "envoi" || (captchaRequis && !jeton)}
          className="btn btn-jaune disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {etat === "envoi" ? "Envoi…" : "Envoyer le message"}
        </button>
      </div>
    </form>
  );
}

/* ─── Page ─────────────────────────────────────────────────────────────── */

export function ContactPage() {
  const { data: g } = useGlobalOptions();
  // Pas de page d'options Contact : la bannière reprend la vidéo de l'accueil.
  const { data: accueil } = useAccueilOptions();

  useEffect(() => {
    setPageMeta({
      title: "Contact",
      description:
        "Contacter Physio du Moléson à Bulle : secrétariat téléphonique, e-mail, formulaire et plan d'accès, Rue Saint-Denis 66 et 68.",
    });
  }, []);

  // Coordonnées des options globales ACF ; champ vide = rien d'affiché.
  const phone     = g?.phone ?? "";
  const tel       = lienTel(phone);
  const email     = g?.email ?? "";
  // Ordre de la rue (66 avant 68), quel que soit celui saisi dans WordPress.
  const addresses = [...(g?.addresses ?? [])]
    .sort((x, y) => x.street.localeCompare(y.street, "fr", { numeric: true }));
  const first     = addresses[0];
  const ville     = first ? `${first.postcode} ${first.city}`.trim() : "";
  // Carte : l'URL Google Maps saisie dans ACF (`carteGoogle`), sinon une
  // recherche sur la première adresse, elle aussi issue d'ACF.
  const carte     = g?.carte || (first
    ? `https://maps.google.com/maps?q=${encodeURIComponent(`${first.street}, ${ville}`)}&z=16&output=embed`
    : "");
  // « Rue Saint-Denis 66 et 68 » quand les deux adresses partagent la rue.
  const numeros   = addresses.map((a) => a.street.match(/(\d+)$/)?.[1]).filter(Boolean);
  const adresse   = !first
    ? ""
    : numeros.length === addresses.length && addresses.length > 1
      ? `${first.street.replace(/\s*\d+$/, "")} ${numeros.join(" et ")}, ${ville}`
      : addresses.map((a) => a.street).join(", ") + `, ${ville}`;

  return (
    <>
      <PageBanner title="Nous contacter" video={accueil?.heros.video} />

      <section id="contact-form" className="section-y">
        {/* Deux colonnes seulement si chacune a au moins 380 px : en tablette,
            coordonnées puis formulaire, l'un sous l'autre. */}
        <Apparition className="container-x grid grid-cols-[repeat(auto-fit,minmax(min(100%,380px),1fr))] gap-[clamp(32px,5vw,80px)]">
          <div className="reveal reveal-gauche flex flex-col gap-[18px]">
            <h2 className="h2">Une question ? Écrivez-nous.</h2>
            <p className="max-w-[420px]">
              Nous vous répondons par e-mail ou par téléphone. Pour réserver une
              séance, utilisez la prise de rendez-vous en ligne.
            </p>

            <div className="card mt-2.5 p-[clamp(20px,2.6vw,28px)]">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1.5 pb-2">
                <span className="intitule">Secrétariat téléphonique</span>
                {phone && <a href={`tel:${tel}`} className="font-bold">{phone}</a>}
              </div>
              <div className="flex flex-col">
                {(g?.secretariat ?? []).map((s) => (
                  <div key={s.jours} className="flex flex-wrap justify-between items-baseline gap-x-5 gap-y-1.5 py-3">
                    <span className="flex items-center gap-3">
                      <span aria-hidden className="w-2 h-2 rounded-full flex-none bg-olive" />
                      {s.jours}
                    </span>
                    <span>{s.horaires}</span>
                  </div>
                ))}
              </div>
              {/* Toutes les coordonnées dans la carte, une seule fois chacune :
                  téléphone (en tête), adresse, puis e-mail et réseaux. */}
              {adresse && (
                <div className="border-t border-line mt-3 pt-[18px] flex flex-col gap-1">
                  <span className="intitule">Adresse</span>
                  <span>{adresse}</span>
                </div>
              )}
              <div className="border-t border-line mt-[18px] pt-[18px] flex flex-wrap justify-between items-center gap-x-6 gap-y-3">
                {email && <a href={`mailto:${email}`} className="font-semibold">{email}</a>}
                <SocialLinks links={g?.social} />
              </div>
            </div>
          </div>

          {/* Encadré olive (on-dark : texte blanc, survol des boutons en blanc) ;
              les champs restent blancs. */}
          <div className="reveal reveal-droite [--reveal-delay:150ms] on-dark bg-olive text-on-dark rounded-[20px] p-[clamp(24px,3.4vw,40px)]">
            <ContactForm />
          </div>
        </Apparition>
      </section>

      {carte && (
      <section id="contact-carte" className="section-y">
        <Apparition className="container-x flex flex-col gap-6">
          <h2 className="reveal reveal-gauche h2">Nous trouver</h2>
          <div className="reveal [--reveal-delay:150ms] flex flex-col gap-2.5">
            <div className="flex flex-col gap-0.5">
              <span className="font-display font-medium text-[20px]">Physio du Moléson</span>
              {first && <span className="text-[15px] text-muted">{first.street}, {ville}</span>}
            </div>
            <div className="rounded-tile overflow-hidden border border-line h-[clamp(320px,36vw,440px)] bg-sable">
              <iframe
                title={first ? `Carte — ${first.street}, ${ville}` : "Carte — Physio du Moléson"}
                src={carte}
                className="w-full h-full border-0 block"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </Apparition>
      </section>
      )}
    </>
  );
}
