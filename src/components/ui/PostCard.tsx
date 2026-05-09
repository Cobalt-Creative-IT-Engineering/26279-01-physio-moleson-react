import type { WPTerm } from "../../types/wordpress";

interface PostCardProps {
  title: string;
  excerpt: string;
  date: string;
  image?: { url: string; alt: string } | null;
  categories?: WPTerm[];
  href: string;
}

export function PostCard({ title, excerpt, date, image, categories, href }: PostCardProps) {
  const formattedDate = new Date(date).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <a href={href} className="card">
      {image && (
        <div className="card-media">
          <img src={image.url} alt={image.alt} loading="lazy" decoding="async" />
        </div>
      )}
      {categories && categories.length > 0 && (
        <div className="card-tags">
          {categories.map((c) => (
            <span key={c.id} className="tag">{c.name}</span>
          ))}
        </div>
      )}
      <h2 className="card-title">{title}</h2>
      <p className="card-excerpt" dangerouslySetInnerHTML={{ __html: excerpt }} />
      <time className="card-date">{formattedDate}</time>
    </a>
  );
}
