import { usePage } from "../hooks/useWordPress";
import { acfReader } from "../components/acf";
import { AboutACF } from "../config/acf-schemas";
import { Skeleton, ErrorBanner, WPContent } from "../components/ui";

type TeamMember = { name?: string; role?: string; photo?: { url: string; alt?: string } | null };

// Lit la page WP "about" (slug à adapter si besoin) + ses champs ACF typés
// via AboutACF. Montre le pattern `usePage + acfReader + repeater`.
export function AboutPage() {
  const { data, status, error } = usePage("about");
  const about = acfReader(data?.acf, AboutACF);

  if (status === "loading" && !data) {
    return (
      <main className="page-content">
        <Skeleton className="h-10 w-1/2 mb-6" />
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full mb-3" />
        ))}
      </main>
    );
  }

  if (status === "error") return <ErrorBanner message={error ?? "Erreur de chargement"} />;
  if (!data)              return <ErrorBanner message="Page introuvable" />;

  const presentation = about.text("presentation");
  const mission      = about.text("mission");
  const image        = about.image("image");
  const team         = about.repeater<TeamMember>("team");

  return (
    <main className="page-content about-page">
      <h1 className="page-title">{data.title || "À propos"}</h1>

      {image?.url && (
        <img src={image.url} alt={image.alt ?? ""} className="about-image" />
      )}

      {presentation
        ? <WPContent html={presentation} className="prose-custom" />
        : data.content && <WPContent html={data.content} className="prose-custom" />
      }

      {mission && (
        <section className="about-section">
          <h2>Mission</h2>
          <WPContent html={mission} className="prose-custom" />
        </section>
      )}

      {team.length > 0 && (
        <section className="about-section">
          <h2>Équipe</h2>
          <div className="team-grid">
            {team.map((m, i) => (
              <div key={i} className="team-member">
                {m.photo?.url && (
                  <img src={m.photo.url} alt={m.photo.alt || m.name || ""} className="team-photo" />
                )}
                <strong>{m.name}</strong>
                {m.role && <span>{m.role}</span>}
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
