import { useEffect } from "react";
import { usePost } from "../hooks/useWordPress";
import { Skeleton, ErrorBanner, WPContent } from "../components/ui";
import { setPageMeta } from "../lib/meta";

// Affiche un article WordPress (post standard) via usePost(slug).
export function ArticleDetailPage({ slug }: { slug: string }) {
  const { data: post, status, error } = usePost(slug);

  useEffect(() => {
    if (!post) return;
    const description = post.excerpt
      ? post.excerpt.replace(/<[^>]*>/g, "").trim().slice(0, 160)
      : undefined;
    setPageMeta({
      title:       post.title,
      description,
      image:       post.featuredImage?.url,
      type:        "article",
    });
  }, [post]);

  if (status === "loading" && !post) {
    return (
      <main className="page-content">
        <Skeleton className="h-10 w-3/4 mb-4" />
        <Skeleton className="h-4 w-32 mb-8" />
        <Skeleton className="h-64 w-full mb-6" />
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full mb-3" />
        ))}
      </main>
    );
  }

  if (status === "error") return <ErrorBanner message={error ?? "Erreur de chargement"} />;
  if (!post)              return <ErrorBanner message="Article introuvable" />;

  const date = new Date(post.date).toLocaleDateString("fr-FR", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <main className="page-content article-detail">
      <a href="/articles" className="back-link">← Retour</a>
      <time className="article-date">{date}</time>
      <h1 className="article-title">{post.title}</h1>

      {post.categories.length > 0 && (
        <div className="article-categories">
          {post.categories.map((c) => <span key={c.id} className="tag">{c.name}</span>)}
        </div>
      )}

      {post.featuredImage && (
        <img
          src={post.featuredImage.url}
          alt={post.featuredImage.alt || post.title}
          className="article-cover"
        />
      )}

      <WPContent html={post.content} className="prose-custom article-content" />
    </main>
  );
}
