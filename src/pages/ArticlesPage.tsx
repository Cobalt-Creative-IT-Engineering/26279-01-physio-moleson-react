import { usePosts } from "../hooks/useWordPress";
import { PostCard, PostCardSkeleton, ErrorBanner, Pagination } from "../components/ui";

// Listing paginé des articles WordPress (posts standards).
// Montre : pagination, skeleton, WPTerm (categories).
export function ArticlesPage() {
  const { posts, total, totalPages, page, setPage, status, error, isFetching } = usePosts({
    perPage: 9,
    orderby: "date",
    order:   "desc",
  });

  if (status === "error") return <ErrorBanner message={error ?? "Erreur de chargement"} />;

  return (
    <main className="page-content">
      <h1 className="page-title">Articles</h1>
      {total > 0 && (
        <p className="articles-count">{total} article{total > 1 ? "s" : ""}</p>
      )}

      <div className={`articles-grid${isFetching ? " articles-grid--loading" : ""}`}>
        {status === "loading" && posts.length === 0
          ? Array.from({ length: 6 }).map((_, i) => <PostCardSkeleton key={i} />)
          : posts.map((p) => (
              <PostCard
                key={p.id}
                title={p.title}
                excerpt={p.excerpt}
                date={p.date}
                image={p.featuredImage}
                categories={p.categories}
                href={`/articles/${p.slug}`}
              />
            ))}
      </div>

      <Pagination page={page} totalPages={totalPages} onPage={setPage} />
    </main>
  );
}
