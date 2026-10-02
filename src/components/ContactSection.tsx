import { useState, Fragment } from "react";
import { useTherapeutes, useGlobalOptions } from "../hooks/useWordPress";
import type { Therapeute } from "../types/wordpress";
import { ErrorBanner, Icon } from "./ui";
import { CONTACT } from "../config/site";

/* ─── Bloc réservation tbooking ────────────────────────────────────────── */

function BookingBlock({ therapeutes }: { therapeutes: Therapeute[] }) {
  const [hover, setHover] = useState<number | null>(null);

  return (
    /* Encadré sable (charte : « encadrés horaires, cours : fond sable »),
       anthracite 8.7:1. Le survol d'un thérapeute le met en évidence en
       jaune, comme le prévoit la charte pour l'état actif. */
    <div className="relative overflow-hidden rounded-card p-6 md:p-10 grid lg:grid-cols-[1fr_1.2fr] gap-8 lg:gap-12 items-center card">
      <div className="relative">
        <div className="eyebrow inline-flex items-center gap-2 mb-5">
          <span className="point" />
          tbooking réservation 24/7
        </div>
        <h3 className="font-display text-3xl md:text-4xl leading-tight mb-3.5 text-ink">
          Choisissez votre<br />thérapeute.
        </h3>
        <p className="text-[16px] max-w-[360px]">
          Cliquez sur un nom pour accéder directement à son agenda en ligne.
        </p>
        <div className="mt-6 pt-6 border-t border-line">
          <p className="text-[16px] mb-4">
            <strong className="font-bold text-ink">Sensopro Luna :</strong> la première séance se fait avec un·e thérapeute.
          </p>
          <a href="/sensopro" className="btn btn-ghost hover:bg-bg">
            En savoir plus sur Sensopro
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </a>
        </div>
      </div>

      <div className="relative flex flex-col rounded-card overflow-hidden divide-y divide-line">
        {therapeutes.map((t) => {
          const active = hover === t.id;
          return (
            <a
              key={t.id}
              href={t.tbookingUrl || undefined}
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={() => setHover(t.id)}
              onMouseLeave={() => setHover(null)}
              className="px-6 py-[18px] grid grid-cols-[1fr_auto] items-center gap-4 transition-colors"
              style={{
                background: active ? "var(--color-jaune)" : "var(--color-bg)",
                color: "var(--color-ink)",
                pointerEvents: t.tbookingUrl ? "auto" : "none",
                opacity: t.tbookingUrl ? 1 : 0.6,
              }}
            >
              <div>
                {/* Pas d'italique : « pas d'italique pour insister » (charte). */}
                <div className="font-display text-xl">{t.name}</div>
                <div className="caption mt-0.5">{t.role || t.extras}</div>
              </div>
              <span className="label inline-flex items-center gap-1.5 text-[13px] text-vert">
                Réserver
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Formulaire (UI seulement — envoi à configurer plus tard) ─────────── */

const SUBJECTS = ["Question administrative", "Tarifs / assurance", "Annulation", "Autre"];

function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: brancher l'envoi (SMTP / webhook / plugin WP Forms) — non configuré.
    setSent(true);
    setTimeout(() => setSent(false), 4000);
  };

  // Filet anthracite atténué (et non la bordure sable, 1.3:1) : le champ doit
  // rester repérable (3:1). Au focus, le filet passe en vert Moléson.
  const field = "w-full bg-transparent border-b border-ink py-3.5 text-[16px] text-ink placeholder:text-vert outline-none focus:border-vert focus:border-b-2 transition-colors";

  return (
    <form onSubmit={submit} className="card p-6 md:p-10 flex flex-col gap-1.5">
      <div className="font-display text-[28px] mb-1">Écrivez-nous.</div>
      <p className="text-[16px] text-ink mb-5">
        Pour une question administrative ou une demande non urgente. Réponse sous 24h ouvrables.
      </p>

      <input className={field} placeholder="Nom complet" required
             value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input className={field} type="email" placeholder="Email" required
               value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input className={field} type="tel" placeholder="Téléphone"
               value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      </div>

      <div className="mt-4">
        <div className="label text-[13px] text-ink mb-2.5 mt-3.5">Sujet</div>
        <div className="flex flex-wrap gap-1.5">
          {SUBJECTS.map((s) => {
            const on = form.subject === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setForm({ ...form, subject: s })}
                aria-pressed={on}
                className="px-3.5 py-2 text-[14px] rounded-btn border-[1.5px] transition-colors"
                style={{
                  // Filet anthracite pour tous (contour de contrôle ≥ 3:1) ;
                  // le sujet choisi passe en jaune et en gras.
                  borderColor: "var(--color-ink)",
                  background: on ? "var(--color-jaune)" : "transparent",
                  color: "var(--color-ink)",
                  fontWeight: on ? 700 : 400,
                }}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      <textarea
        className={`${field} min-h-[72px] resize-y mt-1`}
        placeholder="Votre message — motif, disponibilités…"
        required
        value={form.message}
        onChange={(e) => setForm({ ...form, message: e.target.value })}
      />

      <button type="submit" className="btn btn-primary mt-6 self-stretch">
        {sent ? "✓ Message envoyé" : "Envoyer le message"}
        {!sent && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 12h14M13 6l6 6-6 6" /></svg>}
      </button>
      <div className="caption mt-3 text-center">
        En envoyant ce formulaire, vous acceptez notre politique de confidentialité.
      </div>
    </form>
  );
}

/* ─── Section Contact (intégrée à la page d'accueil) ───────────────────── */

export function ContactSection() {
  const { therapeutes, status, error } = useTherapeutes();
  const { data: g } = useGlobalOptions();

  const phone     = g?.phone || CONTACT.phone;
  const email     = g?.email || CONTACT.email;
  const addresses = g && g.addresses.length ? g.addresses : CONTACT.addresses;
  const mapQuery  = encodeURIComponent(
    `${addresses[0]?.street ?? "Rue Saint-Denis"}, ${addresses[0]?.postcode ?? "1630"} ${addresses[0]?.city ?? "Bulle"}`
  );

  return (
    <section id="contact" className="section-y scroll-mt-24">
      <div className="container-x">
        <div className="section-header">
          <span className="eyebrow">Prendre rendez-vous</span>
          <h2>Réservez en ligne,<br />en quelques clics.</h2>
          <p>
            Choisissez votre thérapeute et accédez directement à son agenda.
            Pour toute autre demande, écrivez-nous via le formulaire ci-dessous.
          </p>
        </div>

        {status === "error" && therapeutes.length === 0 ? (
          <ErrorBanner message={`Impossible de charger les thérapeutes${error ? ` — ${error}` : ""}.`} />
        ) : (
          therapeutes.length > 0 && <BookingBlock therapeutes={therapeutes} />
        )}

        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-12 mt-20">
          {/* Colonne gauche : carte + coordonnées */}
          <div className="flex flex-col gap-4">
            <div className="rounded-card overflow-hidden aspect-[16/11]">
              <iframe
                title="Plan d'accès — Cabinet physio du Moléson"
                src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
                className="w-full h-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {addresses.map((a) => (
                <div key={a.id} className="card px-5 py-4">
                  <div className="flex items-center gap-2 text-[16px] font-bold mb-1">
                    <Icon name="map-pin" size={16} className="text-vert" />
                    {a.label || `Cabinet`}
                  </div>
                  <div className="caption">
                    {a.street}<br />{a.postcode} {a.city}
                  </div>
                </div>
              ))}
            </div>

            <div className="card p-6">
              <div className="label flex items-center gap-2 text-[13px] mb-4">
                <Icon name="phone" size={16} className="text-vert" />
                <span>
                  Secrétariat téléphonique{" "}
                  <a href={`tel:${CONTACT.phoneTel}`} className="link normal-case tracking-normal">
                    {phone}
                  </a>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-x-5 gap-y-1 sm:gap-y-3 text-[16px]">
                {CONTACT.secretariat.map((s) => (
                  <Fragment key={s.days}>
                    <span className="inline-flex items-center gap-2.5">
                      {/* Point jaune pour le créneau mis en avant, cerclé seul sinon. */}
                      <span className={`point ${s.highlight ? "" : "bg-transparent"}`} />
                      <span style={{
                        fontWeight: s.highlight ? 700 : 400,
                      }}>
                        {s.days}
                      </span>
                    </span>
                    <span className="pl-[18px] sm:pl-0 mb-2 sm:mb-0 sm:text-right">{s.hours}</span>
                  </Fragment>
                ))}
              </div>

              <div className="mt-5 pt-4 border-t border-line flex justify-between items-center flex-wrap gap-3">
                <a href={`mailto:${email}`} className="inline-flex items-center gap-2 text-[16px] link">
                  <Icon name="email" size={16} className="text-vert" />
                  {email}
                </a>
                {g && (g.social.instagram || g.social.facebook) && (
                  <div className="flex gap-2">
                    {g.social.instagram && (
                      <a href={g.social.instagram} target="_blank" rel="noreferrer" aria-label="Instagram"
                         className="w-11 h-11 rounded-full inline-flex items-center justify-center text-ink hover:bg-bg transition-colors">
                        <Icon name="instagram" size={22} />
                      </a>
                    )}
                    {g.social.facebook && (
                      <a href={g.social.facebook} target="_blank" rel="noreferrer" aria-label="Facebook"
                         className="w-11 h-11 rounded-full inline-flex items-center justify-center text-ink hover:bg-bg transition-colors">
                        <Icon name="facebook" size={22} />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Colonne droite : formulaire */}
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
