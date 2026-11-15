import { SITE_CONFIG, COMING_SOON_UNTIL } from "../config/site";
import { Logo, SocialLinks } from "../components/ui";
import { useGlobalOptions } from "../hooks/useWordPress";

// Affichée via App.tsx quand FORCE_COMING_SOON=true ou que la date
// VITE_COMING_SOON_UNTIL n'est pas encore atteinte.
export function ComingSoonPage() {
  const dateLabel = COMING_SOON_UNTIL
    ? COMING_SOON_UNTIL.toLocaleDateString("fr-FR", {
        day: "numeric", month: "long", year: "numeric",
      })
    : null;

  // Réseaux sociaux des options globales ACF.
  const { data: g } = useGlobalOptions();

  return (
    <main className="min-h-screen flex items-center justify-center px-4 sm:px-12">
      <div className="max-w-xl text-center flex flex-col items-center gap-6">
        <Logo size={160} />
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
        <div className="mt-2">
          <SocialLinks links={g?.social} />
        </div>
      </div>
    </main>
  );
}
