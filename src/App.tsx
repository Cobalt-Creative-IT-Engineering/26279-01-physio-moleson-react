import { useEffect } from "react";
import { useRoute, navigate } from "./hooks/useRoute";
import { Nav, Footer } from "./components/layout";
import { ErrorBanner } from "./components/ui";
import { HomePage }            from "./pages/HomePage";
import { ArticlesPage }        from "./pages/ArticlesPage";
import { ArticleDetailPage }   from "./pages/ArticleDetailPage";
import { AboutPage }           from "./pages/AboutPage";
import { InfoPage }            from "./pages/InfoPage";
import { ContactPage }         from "./pages/ContactPage";
import { LegalNoticePage }     from "./pages/LegalNoticePage";
import { TermsPage }           from "./pages/TermsPage";
import { ComingSoonPage }      from "./pages/ComingSoonPage";
import { WPPageView }          from "./pages/WPPageView";
import { ACTIVE_THEME, FORCE_COMING_SOON, COMING_SOON_UNTIL } from "./config/site";
import { THEMES }              from "./themes/index";
import { Decorations }         from "./themes/Decorations";
import { initMeta, setPageMeta } from "./lib/meta";

// ─── Application du thème ─────────────────────────────────────────────────────
const _theme = THEMES[ACTIVE_THEME];
document.documentElement.classList.add(_theme.cssClass);
if (_theme.fontsUrl) {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = _theme.fontsUrl;
  document.head.appendChild(link);
}

// ─── Intercepteur de liens SPA (History API) ──────────────────────────────────
// Intercepte les clics sur <a href="/..."> internes pour éviter le rechargement.
document.addEventListener("click", (e) => {
  const a = (e.target as Element).closest("a");
  if (!a) return;
  const href = a.getAttribute("href");
  if (!href) return;
  if (href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
  if (a.getAttribute("target") === "_blank") return;
  if (a.getAttribute("download") != null) return;
  if (href.startsWith("#")) return; // ancres de page
  e.preventDefault();
  navigate(href);
});

const PAGE_LABELS: Record<string, string> = {
  "/articles":      "Articles",
  "/about":         "À propos",
  "/info":          "Infos",
  "/contact":       "Contact",
  "/legal-notice":  "Mentions légales",
  "/terms":         "Conditions générales",
};

function getPageLabel(route: string): string | undefined {
  if (route === "/" || route === "") return undefined;
  if (PAGE_LABELS[route]) return PAGE_LABELS[route];
  if (route.startsWith("/articles/")) return "Article";
  return undefined;
}

/** Retourne true tant que la page d'attente doit être affichée. */
function shouldShowComingSoon(): boolean {
  if (FORCE_COMING_SOON) return true;
  if (COMING_SOON_UNTIL && new Date() < COMING_SOON_UNTIL) return true;
  return false;
}

export default function App() {
  const { route, slug, anchor } = useRoute();

  // Infos du site WordPress (une seule fois) → initialise le module meta.
  useEffect(() => {
    fetch("/wp-json/")
      .then((r) => r.json())
      .then((d) => { initMeta(d?.name ?? "", d?.description ?? ""); })
      .catch(() => {});
  }, []);

  // Meta par défaut selon la route (les pages de détail écrasent avec leurs propres infos).
  useEffect(() => {
    setPageMeta({ title: getPageLabel(route) });
  }, [route]);

  // Scroll : ancre si présente, sinon remonte en haut.
  useEffect(() => {
    if (anchor) {
      const t = setTimeout(() => {
        document.getElementById(anchor)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 120);
      return () => clearTimeout(t);
    }
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [route, anchor]);

  if (shouldShowComingSoon()) return <ComingSoonPage />;

  return (
    <div className="app">
      <Decorations />
      <Nav />
      <PageView route={route} slug={slug} />
      <Footer />
    </div>
  );
}

function PageView({ route, slug }: { route: string; slug: string | null }) {
  if (route === "/" || route === "")       return <HomePage />;
  if (route === "/articles")               return <ArticlesPage />;
  if (route.startsWith("/articles/"))      return <ArticleDetailPage slug={route.replace("/articles/", "")} />;
  if (route === "/about")                  return <AboutPage />;
  if (route === "/info")                   return <InfoPage />;
  if (route === "/contact")                return <ContactPage />;
  if (route === "/legal-notice")           return <LegalNoticePage />;
  if (route === "/terms")                  return <TermsPage />;
  if (route.startsWith("/page/") && slug)  return <WPPageView slug={slug} />;
  return <ErrorBanner message="Page non trouvée" />;
}
