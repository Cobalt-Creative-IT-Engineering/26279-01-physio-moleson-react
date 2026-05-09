import type { MouseEvent } from "react";
import { usePage } from "../hooks/useWordPress";
import { useScrollSpy } from "../hooks/useScrollSpy";
import { acfReader } from "../components/acf";
import { InfoACF } from "../config/acf-schemas";
import { Skeleton, ErrorBanner, WPContent } from "../components/ui";

type InfoSection = { id?: string; title?: string; content?: string };

function scrollToSection(id: string) {
  return (e: MouseEvent) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
}

// Lit la page WP "info" + son repeater ACF `info_sections` pour construire
// une mise en page 2 colonnes avec scroll-spy. Si le repeater est vide,
// on retombe sur le contenu WYSIWYG de la page.
export function InfoPage() {
  const { data, status, error } = usePage("info");
  const info     = acfReader(data?.acf, InfoACF);
  const sections = info.repeater<InfoSection>("sections")
    .filter((s): s is Required<InfoSection> => !!s.id && !!s.title);
  const activeId = useScrollSpy(sections.map((s) => s.id));

  if (status === "loading" && !data) {
    return (
      <main className="page-content">
        <Skeleton className="h-10 w-1/2 mb-6" />
        {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-4 w-full mb-3" />)}
      </main>
    );
  }

  if (status === "error") return <ErrorBanner message={error ?? "Erreur de chargement"} />;
  if (!data)              return <ErrorBanner message="Page introuvable" />;

  return (
    <main className="page-content">
      <h1 className="page-title">{data.title || "Informations"}</h1>

      {sections.length > 0 ? (
        <div className="two-col">
          <aside className="side-links">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                onClick={scrollToSection(s.id)}
                className={`side-link${activeId === s.id ? " side-link--active" : ""}`}
              >
                {s.title}
              </a>
            ))}
          </aside>
          <section className="content-column">
            {sections.map((s) => (
              <div key={s.id} id={s.id} className="info-section">
                <h2>{s.title}</h2>
                {s.content && <WPContent html={s.content} className="prose-custom" />}
              </div>
            ))}
          </section>
        </div>
      ) : (
        <WPContent html={data.content} className="prose-custom" />
      )}
    </main>
  );
}
