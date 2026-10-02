import { SITE_CONFIG, SOCIAL_LINKS, COMING_SOON_UNTIL } from "../config/site";
import { Logo } from "../components/ui";

// Affichée via App.tsx quand FORCE_COMING_SOON=true ou que la date
// VITE_COMING_SOON_UNTIL n'est pas encore atteinte.
export function ComingSoonPage() {
  const dateLabel = COMING_SOON_UNTIL
    ? COMING_SOON_UNTIL.toLocaleDateString("fr-FR", {
        day: "numeric", month: "long", year: "numeric",
      })
    : null;

  const socials = Object.entries(SOCIAL_LINKS).filter(([, url]) => !!url);

  return (
    <main className="min-h-screen flex items-center justify-center px-4 sm:px-12">
      <div className="max-w-xl text-center flex flex-col items-center gap-6">
        <Logo full size={160} />
        <span className="eyebrow">{SITE_CONFIG.tagline}</span>
        {/* Le nom figure déjà dans le logo complet : pas de réécriture en
            Rubik (interdit par la charte), titre réservé aux lecteurs d'écran. */}
        <h1 className="sr-only">{SITE_CONFIG.name}</h1>
        <p className="text-lg text-ink">Site en préparation.</p>
        {dateLabel && (
          <p className="text-ink">
            Ouverture prévue le <strong className="text-ink">{dateLabel}</strong>.
          </p>
        )}
        {socials.length > 0 && (
          <ul className="flex gap-6 mt-2">
            {socials.map(([name, url]) => (
              <li key={name}>
                <a href={url} target="_blank" rel="noreferrer" className="link capitalize">
                  {name}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
