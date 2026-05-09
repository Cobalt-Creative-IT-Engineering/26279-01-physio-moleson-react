import { useEffect } from "react";
import { useRoute, navigate } from "./hooks/useRoute";
import { Nav, Footer } from "./components/layout";
import { CookieBanner } from "./components/ui";
import { HomePage }      from "./pages/HomePage";
import { ServicesPage }  from "./pages/ServicesPage";
import { SensoproPage }  from "./pages/SensoproPage";
import { EquipePage }    from "./pages/EquipePage";
import { CabinetPage }   from "./pages/CabinetPage";
import { ContactPage }   from "./pages/ContactPage";
import { ComingSoonPage } from "./pages/ComingSoonPage";
import { NotFoundPage }  from "./pages/NotFoundPage";
import { ACTIVE_THEME, FORCE_COMING_SOON, COMING_SOON_UNTIL } from "./config/site";
import { THEMES }      from "./themes/index";
import { Decorations } from "./themes/Decorations";
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
  if (href.startsWith("#")) return;
  e.preventDefault();
  navigate(href);
});

const PAGE_LABELS: Record<string, string> = {
  "/services": "Nos services",
  "/sensopro": "Sensopro",
  "/equipe":   "Thérapeutes",
  "/cabinet":  "Cabinet",
  "/contact":  "Contact",
};

function getPageLabel(route: string): string | undefined {
  if (route === "/" || route === "") return undefined;
  return PAGE_LABELS[route];
}

/** Retourne true tant que la page d'attente doit être affichée. */
function shouldShowComingSoon(): boolean {
  if (FORCE_COMING_SOON) return true;
  if (COMING_SOON_UNTIL && new Date() < COMING_SOON_UNTIL) return true;
  return false;
}

export default function App() {
  const { route, anchor } = useRoute();

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
      <main>
        <PageView route={route} />
      </main>
      <Footer />
      <CookieBanner />
    </div>
  );
}

function PageView({ route }: { route: string }) {
  if (route === "/" || route === "") return <HomePage />;
  if (route === "/services")          return <ServicesPage />;
  if (route === "/sensopro")          return <SensoproPage />;
  if (route === "/equipe")            return <EquipePage />;
  if (route === "/cabinet")           return <CabinetPage />;
  if (route === "/contact")           return <ContactPage />;
  return <NotFoundPage />;
}
