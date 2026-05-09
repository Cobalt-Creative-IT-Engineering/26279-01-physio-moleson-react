import { usePage } from "../hooks/useWordPress";
import { Skeleton, ErrorBanner, WPContent } from "../components/ui";

// Lit une page WordPress au slug "legal-notice".
export function LegalNoticePage() {
  const { data, status, error } = usePage("legal-notice");

  if (status === "loading" && !data) {
    return (
      <main className="page-content">
        <Skeleton className="h-8 w-1/2 mb-6" />
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full mb-3" />
        ))}
      </main>
    );
  }

  if (status === "error") return <ErrorBanner message={error ?? "Erreur de chargement"} />;
  if (!data)              return <ErrorBanner message="Page introuvable" />;

  return (
    <main className="page-content">
      <h1 className="page-title">{data.title || "Mentions légales"}</h1>
      <WPContent html={data.content} className="prose-custom" />
    </main>
  );
}
