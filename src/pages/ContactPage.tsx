import { useState, useEffect } from "react";
import { useGlobalOptions } from "../hooks/useWordPress";
import { PageBanner } from "../components/layout";
import { SocialLinks } from "../components/ui";
import { CONTACT } from "../config/site";
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
        <button type="button" onClick={() => setSent(false)} className="btn btn-ligne text-[14px] px-[18px] py-2.5">
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
        <span className="text-[13px] text-muted">Pas de données médicales sensibles par ce formulaire.</span>
        <button type="submit" className="btn btn-vert">Envoyer le message</button>
      </div>
    </form>
  );
}

/* ─── Page ─────────────────────────────────────────────────────────────── */

export function ContactPage() {
  const { data: g } = useGlobalOptions();

  useEffect(() => {
    setPageMeta({
      title: "Contact",
      description:
        "Contacter Physio du Moléson à Bulle : secrétariat téléphonique, e-mail, formulaire et plan d'accès, Rue Saint-Denis 66 et 68.",
    });
  }, []);

  const phone     = g?.phone || CONTACT.phone;
  const email     = g?.email || CONTACT.email;
  // Ordre de la rue (66 avant 68), quel que soit celui saisi dans WordPress.
  const addresses = [...(g && g.addresses.length ? g.addresses : CONTACT.addresses)]
    .sort((x, y) => x.street.localeCompare(y.street, "fr", { numeric: true }));
  const first     = addresses[0];
  const ville     = `${first?.postcode ?? "1630"} ${first?.city ?? "Bulle"}`;
  const mapQuery  = encodeURIComponent(`${first?.street ?? "Rue Saint-Denis 66"}, ${ville}`);
  // « Rue Saint-Denis 66 et 68 » quand les deux adresses partagent la rue.
  const numeros   = addresses.map((a) => a.street.match(/(\d+)$/)?.[1]).filter(Boolean);
  const adresse   = numeros.length === addresses.length && addresses.length > 1
    ? `${first.street.replace(/\s*\d+$/, "")} ${numeros.join(" et ")}, ${ville}`
    : addresses.map((a) => a.street).join(", ") + `, ${ville}`;

  return (
    <>
      <PageBanner title="Nous contacter" />

      <section id="contact-form" className="section-y">
        <div className="container-x grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] gap-[clamp(32px,5vw,80px)]">
          <div className="flex flex-col gap-[18px]">
            <h2 className="h2">Une question ? Écrivez-nous.</h2>
            <p className="max-w-[420px]">
              Nous vous répondons par e-mail ou par téléphone. Pour réserver une
              séance, utilisez la prise de rendez-vous en ligne.
            </p>

            <div className="card mt-2.5 p-[clamp(20px,2.6vw,28px)]">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1.5 pb-2">
                <span className="intitule">Secrétariat téléphonique</span>
                <a href={`tel:${CONTACT.phoneTel}`} className="font-bold">{phone}</a>
              </div>
              <div className="flex flex-col">
                {CONTACT.secretariat.map((s) => (
                  <div key={s.days} className="flex flex-wrap justify-between items-baseline gap-x-5 gap-y-1.5 py-3">
                    <span className="flex items-center gap-3">
                      <span
                        aria-hidden
                        className={`w-2 h-2 rounded-full flex-none ${s.highlight ? "bg-vert" : "bg-olive"}`}
                      />
                      {s.days}
                    </span>
                    <span className="text-[15px]">{s.hours}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-line mt-3 pt-[18px] flex flex-wrap justify-between items-center gap-x-6 gap-y-3 text-[15px]">
                <a href={`mailto:${email}`} className="font-semibold">{email}</a>
                <SocialLinks links={g?.social} />
              </div>
            </div>

            <div className="text-[15px] flex flex-col">
              <span className="font-semibold">Adresse</span>
              <span>{adresse}</span>
            </div>
            <div className="text-[15px] flex flex-col">
              <span className="font-semibold">Téléphone</span>
              <a href={`tel:${CONTACT.phoneTel}`}>{phone}</a>
            </div>
          </div>

          <div className="bg-sable rounded-[20px] p-[clamp(24px,3.4vw,40px)]">
            <ContactForm />
          </div>
        </div>
      </section>

      <section id="contact-carte" className="section-y">
        <div className="container-x flex flex-col gap-6">
          <h2 className="h2">Nous trouver</h2>
          <div className="flex flex-col gap-2.5">
            <div className="flex flex-col gap-0.5">
              <span className="font-display font-medium text-[20px]">Physio du Moléson</span>
              <span className="text-[15px] text-muted">{first?.street}, {ville}</span>
            </div>
            <div className="rounded-tile overflow-hidden border border-line h-[clamp(320px,36vw,440px)] bg-sable">
              <iframe
                title={`Carte — ${first?.street}, ${ville}`}
                src={`https://maps.google.com/maps?q=${mapQuery}&z=16&output=embed`}
                className="w-full h-full border-0 block"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
