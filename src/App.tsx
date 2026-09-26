import { useEffect } from "react";
import { useRoute, navigate } from "./hooks/useRoute";
import { Nav, Footer } from "./components/layout";
import { CookieBanner } from "./components/ui";
import { HomePage }      from "./pages/HomePage";
import { ServicesPage }  from "./pages/ServicesPage";
import { SensoproPage }  from "./pages/SensoproPage";
import { EquipePage }    from "./pages/EquipePage";
import { CabinetPage }   from "./pages/CabinetPage";
import { ComingSoonPage } from "./pages/ComingSoonPage";
import { NotFoundPage }  from "./pages/NotFoundPage";
import { ACTIVE_THEME, FORCE_COMING_SOON, COMING_SOON_UNTIL } from "./config/site";
import { THEMES }      from "./themes/index";
import { Decorations } from "./themes/Decorations";
import { FloatingBlobs, RopeClimber } from "./components/animation";
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
    // L'hébergement statique répond 200 à toute URL inconnue : c'est le routeur
    // client qui tranche. Sans ce noindex, un lien périmé ou une faute de frappe
    // s'indexerait comme une page valide.
    const found = resolvePage(route) !== null;
    setPageMeta({
      title:   found ? getPageLabel(route) : "Page non trouvée",
      noindex: !found,
    });
  }, [route]);

  // L'ancienne page /contact est désormais une section de l'accueil.
  useEffect(() => {
    if (route === "/contact") navigate("/#contact");
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
      {/* Décor de fond commun à toutes les pages.
          `-z-10` : au-dessus du fond de page, mais derrière le fond des blocs
          opaques — le pied de page en encre les masque donc de lui-même. */}
      <div aria-hidden className="fixed inset-0 -z-10 pointer-events-none">
        <FloatingBlobs />
      </div>

      {/* Grimpeur : bande fixe sur le bord droit, pilotée par le défilement.
          Réservée aux très grands écrans, où la marge à droite du conteneur
          (1280 px centré) est assez large pour ne rien recouvrir. */}
      <div
        aria-hidden
        className="hidden 2xl:block fixed right-0 top-[88px] w-[120px] h-[calc(100vh-88px)] pointer-events-none z-[1]"
      >
        <RopeClimber />
      </div>

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

/**
 * Résout une route vers sa page, ou null si aucune ne correspond.
 *
 * Table unique, volontairement : la garde noindex de App() s'appuie sur cette
 * même fonction. Une route ajoutée ici est donc automatiquement considérée
 * comme valide par les moteurs, sans second endroit à tenir à jour.
 * Toute route ajoutée ici doit aussi l'être dans public/sitemap.xml.
 */
function resolvePage(route: string) {
  if (route === "/" || route === "") return <HomePage />;
  if (route === "/services")          return <ServicesPage />;
  if (route === "/sensopro")          return <SensoproPage />;
  if (route === "/equipe")            return <EquipePage />;
  if (route === "/cabinet")           return <CabinetPage />;
  if (route === "/contact")           return <HomePage />; // redirigé vers /#contact
  return null;
}

function PageView({ route }: { route: string }) {
  return resolvePage(route) ?? <NotFoundPage />;
}
