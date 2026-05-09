import { useACFOptionsPage } from "../hooks/useWordPress";
import { acfReader } from "../components/acf";
import { ContactACF } from "../config/acf-schemas";
import { Skeleton, WPContent } from "../components/ui";

type SocialItem = { platform?: string; url?: string };

// Exemple d'Options Sub-Page ACF : menu_slug="contact".
// Les champs sont définis dans src/config/acf-schemas.ts (ContactACF).
export function ContactPage() {
  const { data, status } = useACFOptionsPage("contact");
  const contact = acfReader(data, ContactACF);

  const title    = contact.text("title") || "Contact";
  const intro    = contact.text("intro");
  const email    = contact.text("email");
  const phone    = contact.text("phone");
  const address  = contact.text("address");
  const social   = contact.repeater<SocialItem>("social");

  if (status === "loading" && !data) {
    return (
      <main className="page-content">
        <Skeleton className="h-8 w-1/2 mb-6" />
        <Skeleton className="h-4 w-full mb-3" />
        <Skeleton className="h-4 w-full mb-3" />
        <Skeleton className="h-4 w-2/3" />
      </main>
    );
  }

  return (
    <main className="page-content contact-page">
      <h1 className="page-title">{title}</h1>
      {intro && <WPContent html={intro} className="prose-custom contact-intro" />}

      <dl className="contact-info">
        {email && (
          <>
            <dt>Email</dt>
            <dd><a href={`mailto:${email}`}>{email}</a></dd>
          </>
        )}
        {phone && (
          <>
            <dt>Téléphone</dt>
            <dd><a href={`tel:${phone.replace(/\s/g, "")}`}>{phone}</a></dd>
          </>
        )}
        {address && (
          <>
            <dt>Adresse</dt>
            <dd><WPContent html={address} /></dd>
          </>
        )}
      </dl>

      {social.length > 0 && (
        <ul className="contact-social">
          {social.map((s, i) => s.url ? (
            <li key={i}>
              <a href={s.url} target="_blank" rel="noreferrer">
                {s.platform || s.url}
              </a>
            </li>
          ) : null)}
        </ul>
      )}
    </main>
  );
}
