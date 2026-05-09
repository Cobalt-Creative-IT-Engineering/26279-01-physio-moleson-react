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
    <main className="min-h-screen flex items-center justify-center px-12 bg-bg-alt">
      <div className="max-w-xl text-center flex flex-col items-center gap-6">
        <Logo size={64} />
        <span className="eyebrow">{SITE_CONFIG.tagline}</span>
        <h1 className="font-display text-5xl md:text-6xl leading-none">
          {SITE_CONFIG.name}
        </h1>
        <p className="text-lg text-ink-soft">Site en préparation.</p>
        {dateLabel && (
          <p className="text-ink-mute">
            Ouverture prévue le <strong className="text-ink">{dateLabel}</strong>.
          </p>
        )}
        {socials.length > 0 && (
          <ul className="flex gap-6 mt-2">
            {socials.map(([name, url]) => (
              <li key={name}>
                <a href={url} target="_blank" rel="noreferrer" className="text-ink-soft hover:text-primary capitalize">
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
