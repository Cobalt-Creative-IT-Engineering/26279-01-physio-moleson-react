import { SITE_CONFIG, SOCIAL_LINKS, COMING_SOON_UNTIL } from "../config/site";

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
    <main className="coming-soon">
      <div className="coming-soon-inner">
        <h1 className="coming-soon-title">{SITE_CONFIG.name}</h1>
        <p className="coming-soon-lead">Site en préparation.</p>
        {dateLabel && (
          <p className="coming-soon-eta">
            Ouverture prévue le <strong>{dateLabel}</strong>.
          </p>
        )}
        {socials.length > 0 && (
          <ul className="coming-soon-social">
            {socials.map(([name, url]) => (
              <li key={name}>
                <a href={url} target="_blank" rel="noreferrer">{name}</a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
