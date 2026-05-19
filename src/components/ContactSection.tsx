import { useState, Fragment } from "react";
import { useTherapeutes, useGlobalOptions } from "../hooks/useWordPress";
import type { Therapeute } from "../types/wordpress";
import { ErrorBanner, Icon } from "./ui";
import { CONTACT } from "../config/site";

/* ─── Bloc réservation tbooking ────────────────────────────────────────── */

function BookingBlock({ therapeutes }: { therapeutes: Therapeute[] }) {
  const [hover, setHover] = useState<number | null>(null);

  return (
    <div
      className="relative overflow-hidden rounded-[6px] p-10 grid lg:grid-cols-[1fr_1.2fr] gap-12 items-center shadow-md"
      style={{ background: "var(--color-primary)", color: "oklch(0.96 0.01 155)" }}
    >
      <div
        aria-hidden
        className="absolute -right-20 -top-20 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, oklch(0.5 0.05 165 / 0.5) 0%, transparent 70%)" }}
      />
      <div className="relative">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-btn font-mono text-[10px] tracking-[0.18em] uppercase mb-5" style={{ background: "oklch(0.5 0.05 165)" }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: "oklch(0.85 0.1 130)" }} />
          tbooking · réservation 24/7
        </div>
        <h3 className="font-display text-4xl leading-tight mb-3.5" style={{ color: "oklch(0.98 0.008 100)" }}>
          Choisissez votre<br />thérapeute.
        </h3>
        <p className="text-[15px] leading-relaxed max-w-[360px]" style={{ color: "oklch(0.88 0.025 155)" }}>
          Cliquez sur un nom pour accéder directement à son agenda en ligne.
        </p>
        <div className="mt-6 pt-6" style={{ borderTop: "1px solid oklch(0.5 0.05 165 / 0.6)" }}>
          <p className="text-[12px] mb-2.5 leading-relaxed" style={{ color: "oklch(0.88 0.025 155)" }}>
            <strong style={{ color: "oklch(0.98 0.008 100)" }}>Sensopro Luna :</strong> la première séance se fait avec un·e thérapeute.
          </p>
          <a href="/sensopro" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-btn text-[13px] border" style={{ borderColor: "oklch(0.96 0.01 155 / 0.5)", color: "oklch(0.96 0.01 155)" }}>
            En savoir plus sur Sensopro
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </a>
        </div>
      </div>

      <div className="relative flex flex-col gap-px rounded-card overflow-hidden" style={{ background: "oklch(0.5 0.05 165)" }}>
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
                background: active ? "oklch(0.98 0.008 100)" : "oklch(0.46 0.052 165)",
                color: active ? "var(--color-primary)" : "oklch(0.96 0.01 155)",
                pointerEvents: t.tbookingUrl ? "auto" : "none",
                opacity: t.tbookingUrl ? 1 : 0.6,
              }}
            >
              <div>
                <div className="font-display text-xl italic">{t.name}</div>
                <div className="text-[12px] opacity-70 mt-0.5">{t.role || t.extras}</div>
              </div>
              <span className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.16em] uppercase">
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

  const field = "w-full bg-transparent border-b border-line py-3.5 text-[15px] text-ink outline-none focus:border-primary transition-colors";

  return (
    <form onSubmit={submit} className="bg-surface rounded-card p-10 border border-line-soft shadow-sm flex flex-col gap-1.5">
      <div className="font-display text-[28px] mb-1">Écrivez-nous.</div>
      <p className="text-[13px] text-ink-soft mb-5">
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
        <div className="text-[10px] tracking-[0.16em] uppercase text-ink-mute mb-2.5 mt-3.5">Sujet</div>
        <div className="flex flex-wrap gap-1.5">
          {SUBJECTS.map((s) => {
            const on = form.subject === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setForm({ ...form, subject: s })}
                className="px-3.5 py-[7px] text-[12.5px] rounded-btn border transition-colors"
                style={{
                  borderColor: on ? "var(--color-primary)" : "var(--color-line)",
                  background: on ? "var(--color-primary-bg)" : "transparent",
                  color: on ? "var(--color-primary)" : "var(--color-ink-soft)",
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
      <div className="text-[11px] text-ink-mute mt-3 text-center">
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
    <section id="contact" className="section-y bg-bg-alt border-t border-line-soft scroll-mt-24">
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
            <div className="rounded-card overflow-hidden border border-line aspect-[16/11]">
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
                <div key={a.id} className="bg-surface border border-line rounded-card px-5 py-4">
                  <div className="flex items-center gap-2 text-[13px] font-medium mb-1">
                    <Icon name="map-pin" size={14} className="text-primary" />
                    {a.label || `Cabinet`}
                  </div>
                  <div className="text-[13px] text-ink-soft">
                    {a.street}<br />{a.postcode} {a.city}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-surface border border-line-soft rounded-card p-6">
              <div className="flex items-center gap-2 text-[10px] tracking-[0.18em] uppercase text-ink-mute mb-4">
                <Icon name="phone" size={13} className="text-primary" />
                <span>
                  Secrétariat téléphonique ·{" "}
                  <a href={`tel:${CONTACT.phoneTel}`} className="text-ink hover:text-primary transition-colors normal-case tracking-normal">
                    {phone}
                  </a>
                </span>
              </div>

              <div className="grid grid-cols-[1fr_auto] gap-x-5 gap-y-3 text-[13.5px]">
                {CONTACT.secretariat.map((s) => (
                  <Fragment key={s.days}>
                    <span className="inline-flex items-center gap-2.5">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ background: s.highlight ? "var(--color-primary)" : "var(--color-line)" }}
                      />
                      <span style={{
                        fontWeight: s.highlight ? 500 : 400,
                        color: s.highlight ? "var(--color-ink)" : "var(--color-ink-soft)",
                      }}>
                        {s.days}
                      </span>
                    </span>
                    <span className="text-right text-ink-soft">{s.hours}</span>
                  </Fragment>
                ))}
              </div>

              <div className="mt-5 pt-4 border-t border-line-soft flex justify-between items-center flex-wrap gap-3">
                <a href={`mailto:${email}`} className="inline-flex items-center gap-2 text-[14px] text-ink-soft hover:text-primary transition-colors">
                  <Icon name="email" size={15} />
                  {email}
                </a>
                {g && (g.social.instagram || g.social.facebook) && (
                  <div className="flex gap-2">
                    {g.social.instagram && (
                      <a href={g.social.instagram} target="_blank" rel="noreferrer" aria-label="Instagram"
                         className="w-8 h-8 rounded-full border border-line inline-flex items-center justify-center text-ink-soft hover:text-primary hover:border-primary transition-colors">
                        <Icon name="instagram" size={14} />
                      </a>
                    )}
                    {g.social.facebook && (
                      <a href={g.social.facebook} target="_blank" rel="noreferrer" aria-label="Facebook"
                         className="w-8 h-8 rounded-full border border-line inline-flex items-center justify-center text-ink-soft hover:text-primary hover:border-primary transition-colors">
                        <Icon name="facebook" size={14} />
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
