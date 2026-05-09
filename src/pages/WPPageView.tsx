import { usePage } from "../hooks/useWordPress";
import { Skeleton, ErrorBanner, WPContent } from "../components/ui";

/**
 * Rendu générique d'une page WordPress par slug.
 * Accessible via la route #/page/:slug
 */
export function WPPageView({ slug }: { slug: string }) {
  const { status, data: page, error } = usePage(slug);

  if (status === "loading" && !page) {
    return (
      <main className="page-content">
        <Skeleton className="h-8 w-1/2 mb-6" />
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      </main>
    );
  }

  if (status === "error") return <ErrorBanner message={error ?? "Erreur de chargement"} />;
  if (!page)              return <ErrorBanner message="Page introuvable" />;

  return (
    <main className="page-content">
      <h1 className="page-title">{page.title}</h1>
      <WPContent html={page.content} />
      {Object.keys(page.acf).length > 0 && (
        <section className="acf-section">
          <h2 className="acf-section-title">Champs ACF</h2>
          <p className="text-text-secondary text-sm">
            Des champs ACF sont disponibles pour cette page.
          </p>
        </section>
      )}
    </main>
  );
}
