import { useState, useEffect } from "react";
import { useGlobalOptions, useAccueilOptions } from "../hooks/useWordPress";
import { PageBanner } from "../components/layout";
import { SocialLinks, Apparition } from "../components/ui";
import { SECRETARIAT } from "../config/site";
import { lienTel } from "../lib/telephone";
import { setPageMeta } from "../lib/meta";

/* ─── Formulaire ───────────────────────────────────────────────────────── */

function ContactForm() {
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO : envoi SIMULÉ, comme dans la maquette. Brancher un vrai backend
    // (Formspree, endpoint WordPress…) avant la mise en ligne.
    e.currentTarget.reset();
    setSent(true);
  };

  if (sent) {
    return (
      <div role="status" className="flex flex-col gap-3.5 items-start py-5">
        <h3 className="text-[26px]">Merci, votre message est envoyé.</h3>
        <p>Nous vous répondons dans les meilleurs délais.</p>
        <button type="button" onClick={() => setSent(false)} className="btn btn-contour text-[14px] px-[18px] py-2.5">
          Écrire un autre message
        </button>
      </div>
    );
  }

  const label = "flex flex-col gap-2 text-[14px] font-semibold";

  return (
    <form onSubmit={submit} className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-[18px]">
      <label className={label}>
        Nom et prénom
        <input name="nom" required autoComplete="name" className="champ" />
      </label>
      <label className={label}>
        Téléphone
        <input name="tel" type="tel" autoComplete="tel" className="champ" />
      </label>
      <label className={`${label} col-span-full`}>
        E-mail
        <input name="email" type="email" required autoComplete="email" className="champ" />
      </label>
      <label className={`${label} col-span-full`}>
        Message
        <textarea name="message" required rows={5} className="champ resize-y" />
      </label>
      <div className="col-span-full flex flex-wrap items-center justify-between gap-3.5">
        <span className="text-[13px]">Pas de données médicales sensibles par ce formulaire.</span>
        <button type="submit" className="btn btn-jaune">Envoyer le message</button>
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
  const mapQuery  = first ? encodeURIComponent(`${first.street}, ${ville}`) : "";
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
        <Apparition className="container-x grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] gap-[clamp(32px,5vw,80px)]">
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
                {SECRETARIAT.map((s) => (
                  <div key={s.days} className="flex flex-wrap justify-between items-baseline gap-x-5 gap-y-1.5 py-3">
                    <span className="flex items-center gap-3">
                      <span
                        aria-hidden
                        className={`w-2 h-2 rounded-full flex-none ${s.highlight ? "bg-vert" : "bg-olive"}`}
                      />
                      {s.days}
                    </span>
                    <span>{s.hours}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-line mt-3 pt-[18px] flex flex-wrap justify-between items-center gap-x-6 gap-y-3">
                {email && <a href={`mailto:${email}`} className="font-semibold">{email}</a>}
                <SocialLinks links={g?.social} />
              </div>
            </div>

            {/* Même typographie que la carte : intitulé .intitule, valeur
                en corps de texte 16 px. */}
            {adresse && (
              <div className="flex flex-col gap-1">
                <span className="intitule">Adresse</span>
                <span>{adresse}</span>
              </div>
            )}
            {phone && (
              <div className="flex flex-col gap-1">
                <span className="intitule">Téléphone</span>
                <a href={`tel:${tel}`}>{phone}</a>
              </div>
            )}
          </div>

          {/* Encadré olive (on-dark : texte blanc, survol des boutons en blanc) ;
              les champs restent blancs. */}
          <div className="reveal reveal-droite [--reveal-delay:150ms] on-dark bg-olive text-on-dark rounded-[20px] p-[clamp(24px,3.4vw,40px)]">
            <ContactForm />
          </div>
        </Apparition>
      </section>

      {first && (
      <section id="contact-carte" className="section-y">
        <Apparition className="container-x flex flex-col gap-6">
          <h2 className="reveal reveal-gauche h2">Nous trouver</h2>
          <div className="reveal [--reveal-delay:150ms] flex flex-col gap-2.5">
            <div className="flex flex-col gap-0.5">
              <span className="font-display font-medium text-[20px]">Physio du Moléson</span>
              <span className="text-[15px] text-muted">{first.street}, {ville}</span>
            </div>
            <div className="rounded-tile overflow-hidden border border-line h-[clamp(320px,36vw,440px)] bg-sable">
              <iframe
                title={`Carte — ${first.street}, ${ville}`}
                src={`https://maps.google.com/maps?q=${mapQuery}&z=16&output=embed`}
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
