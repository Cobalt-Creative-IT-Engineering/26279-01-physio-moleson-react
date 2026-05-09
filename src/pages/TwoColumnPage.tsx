import { usePage } from "../hooks/useWordPress";
import { Skeleton, ErrorBanner, WPContent } from "../components/ui";

type SidebarLink = { label: string; url: string };

/** Extrait les liens de sidebar depuis des clés ACF courantes. */
function extractACFLinks(acf: Record<string, unknown>): SidebarLink[] {
  const keys = ["sidebar_links", "links", "navigation"];
  for (const key of keys) {
    const raw = acf[key];
    if (!Array.isArray(raw)) continue;
    const links = raw
      .map((item) => {
        if (typeof item !== "object" || item === null) return null;
        const obj = item as Record<string, unknown>;
        const label = obj.label ?? obj.title ?? obj.text;
        const url   = obj.url ?? obj.link ?? obj.href;
        if (typeof label === "string" && typeof url === "string") return { label, url };
        return null;
      })
      .filter(Boolean) as SidebarLink[];
    if (links.length > 0) return links;
  }
  return [];
}

interface TwoColumnPageProps {
  slug: string;
}

// Layout 2 colonnes générique : WP page + sidebar ACF.
// Wire cette page dans App.tsx sur n'importe quel slug.
export function TwoColumnPage({ slug }: TwoColumnPageProps) {
  const { data: page, status, error } = usePage(slug);

  if (status === "loading" && !page) {
    return (
      <main className="page-content">
        <Skeleton className="h-8 w-1/2 mb-6" />
        <div className="two-col">
          <div className="side-links">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
          </div>
          <div className="content-column">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
          </div>
        </div>
      </main>
    );
  }

  if (status === "error") return <ErrorBanner message={error ?? "Erreur de chargement"} />;
  if (!page)              return <ErrorBanner message="Page introuvable" />;

  const sidebarLinks = extractACFLinks(page.acf);

  return (
    <main className="page-content">
      <h1 className="page-title">{page.title}</h1>
      <div className="two-col">
        <aside className="side-links">
          {sidebarLinks.length > 0 ? (
            sidebarLinks.map((link) => (
              <a key={link.url} href={link.url} className="side-link">{link.label}</a>
            ))
          ) : (
            <p className="text-sm text-text-muted">
              Ajoute un repeater ACF <code>sidebar_links</code> (label + url) pour peupler cette colonne.
            </p>
          )}
        </aside>
        <section className="content-column">
          <WPContent html={page.content} />
        </section>
      </div>
    </main>
  );
}
