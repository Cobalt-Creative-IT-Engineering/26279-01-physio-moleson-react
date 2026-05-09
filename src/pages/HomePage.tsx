import { useACFOptions, usePosts } from "../hooks/useWordPress";
import { acfReader } from "../components/acf";
import { HeroACF, PartnersACF } from "../config/acf-schemas";
import { PostCard, PostCardSkeleton } from "../components/ui";

type Partner = { logo?: { url: string; alt?: string } | number | null; url?: string; name?: string };

export function HomePage() {
  const { data: options } = useACFOptions();
  const hero     = acfReader(options, HeroACF);
  const partners = acfReader(options, PartnersACF);

  const heroTitle    = hero.text("title");
  const heroSubtitle = hero.text("subtitle");
  const heroCta      = hero.text("cta");
  const heroCtaUrl   = hero.text("ctaUrl");
  const heroImage    = hero.image("image");
  const partnersList = partners.repeater<Partner>("list");

  const { posts, status } = usePosts({ perPage: 3, orderby: "date", order: "desc" });

  return (
    <main className="home">

      <section className="home-hero">
        {heroImage?.url && (
          <img src={heroImage.url} alt={heroImage.alt ?? ""} className="home-hero-image" />
        )}
        <div className="home-hero-content">
          <h1 className="home-hero-title">{heroTitle || "Bienvenue"}</h1>
          {heroSubtitle && <p className="home-hero-subtitle">{heroSubtitle}</p>}
          {heroCta && heroCtaUrl && (
            <a href={heroCtaUrl} className="btn btn-primary">{heroCta}</a>
          )}
        </div>
      </section>

      <section className="home-section">
        <div className="home-section-header">
          <h2>Derniers articles</h2>
          <a href="/articles" className="home-section-link">Tous les articles →</a>
        </div>
        <div className="articles-grid">
          {status === "loading" && posts.length === 0
            ? Array.from({ length: 3 }).map((_, i) => <PostCardSkeleton key={i} />)
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
      </section>

      {partnersList.length > 0 && (
        <section className="home-section home-partners">
          <h2>Partenaires</h2>
          <div className="partners-grid">
            {partnersList.map((p, i) => {
              const logoUrl = typeof p.logo === "object" && p.logo && "url" in p.logo
                ? p.logo.url
                : null;
              const inner = logoUrl
                ? <img src={logoUrl} alt={p.name ?? ""} className="partner-logo" />
                : <span className="partner-name">{p.name}</span>;
              return p.url ? (
                <a key={i} href={p.url} target="_blank" rel="noreferrer" className="partner-item">{inner}</a>
              ) : (
                <div key={i} className="partner-item">{inner}</div>
              );
            })}
          </div>
        </section>
      )}

    </main>
  );
}
