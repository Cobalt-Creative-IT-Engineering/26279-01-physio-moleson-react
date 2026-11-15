# CLAUDE.md — Cabinet physio du Moléson

Guide rapide pour assister sur ce dépôt. Voir [README.md](README.md) pour la mise en route détaillée.

## Contexte projet

- **Site** : physio-moleson.ch — site vitrine du Cabinet physio du Moléson
- **Architecture** : WordPress headless. WP = source de contenu (REST + ACF + GraphQL). Frontend React livré en fichiers statiques sur un hébergement Apache (Infomaniak) : la CI GitHub builde et publie un `dist.zip` qu'on décompresse dans le web root. Plus de Netlify.
- **Origine** : dérivé du blueprint interne [`wp-react-headless-blueprint`](https://github.com/Cobalt-Creative-IT-Engineering/wp-react-headless-blueprint). Si une question d'architecture revient sur "pourquoi c'est fait comme ça", la réponse est probablement "convention du blueprint".
- **Langue** : tout est en français (UI, commentaires, doc, commits).

## Stack

React 18 · TypeScript · Vite · Tailwind 3 · WordPress (REST + ACF + WPGraphQL)

## Commandes

```bash
npm install          # installer les deps
npm run dev          # http://localhost:5173 (proxy /wp-json et /graphql → VITE_WP_URL)
npm run build        # tsc --noEmit + vite build → dist/
npm run preview      # servir dist/ localement
npx tsc --noEmit     # typecheck seul
```

Aucun lint/test runner configuré. Si on en ajoute un : Vitest pour les tests, ESLint/Prettier au choix.

## Conventions à respecter

- **Une page = un fichier** dans [src/pages/](src/pages/), routée explicitement dans `resolvePage` de [src/App.tsx](src/App.tsx). Pas de routing implicite, pas de react-router. Le routing utilise [src/hooks/useRoute.ts](src/hooks/useRoute.ts) (History API maison).
- **Table de routes unique** : `resolvePage` renvoie l'élément de page ou `null`. Le mince `PageView` transforme ce `null` en `NotFoundPage`, et `App()` s'appuie sur la **même** fonction pour décider du `noindex`. L'hébergement statique répond 200 à toute URL inconnue, donc sans ce drapeau une faute de frappe s'indexerait comme une page valide (« soft 404 »). Ne pas dupliquer cette liste ailleurs : elle dériverait. Ajouter une route = une entrée dans `resolvePage`, une dans `NAV_ITEMS` ([src/config/site.ts](src/config/site.ts)) et une dans [public/sitemap.xml](public/sitemap.xml).
- **Données WP** : passer **toujours** par les hooks de [src/hooks/useWordPress.ts](src/hooks/useWordPress.ts) (`usePost`, `usePage`, `useACFOptionsPage`, `useCPT`, etc.) plutôt que d'appeler `fetch` directement. Ces hooks gèrent le cache mémoire + `sessionStorage` et l'état `loading/error/success`.
- **Champs ACF** : ne jamais référencer un slug ACF brut (`"hero_title"`) dans un composant. Déclarer le mapping dans [src/config/acf-schemas.ts](src/config/acf-schemas.ts) puis lire via `acfReader(data, MonSchema).text("title")`. Quand un champ est renommé côté WP, on ne touche qu'au schéma.
- **Meta tags** : utiliser `setPageMeta({ title, description, image })` depuis [src/lib/meta.ts](src/lib/meta.ts) dans chaque page de détail. Le shell `App.tsx` pose déjà des valeurs par défaut.
- **Liens internes** : un simple `<a href="/about">` suffit — l'intercepteur global de `App.tsx` convertit le clic en `navigate()` History API. Pas besoin d'un composant `<Link>`.
- **Tailwind** : utiliser les classes utilitaires + les design tokens définis dans [src/index.css](src/index.css). Éviter le CSS inline ad-hoc, et **ne jamais écrire une couleur en dur** : tout passe par les variables.
- **Maquette de référence** : [doc/maquette/](doc/maquette/) (handoff haute fidélité, voir son README) fait foi pour les écrans ; elle remplace les règles d'usage de l'ancienne charte « Alpage » ([doc/charte/](doc/charte/) reste la source du logo et des couleurs de marque). Valeurs figées dans `:root` (`--brand-*`), classes Tailwind par rôle (`bg` blanc #FDFDFD, `sable`, `ink`, `muted`, `vert`, `jaune`, `olive`, `line`, `field`, `on-dark`, `on-dark-soft`). Règles :
  - **Fond de page blanc** (`bg`), texte anthracite, secondaire en `muted`. Encadrés, pastilles et formulaire en **sable**.
  - **Bannières vertes à pointe** sur chaque page interne : `<PageBanner title>` ([PageBanner.tsx](src/components/layout/PageBanner.tsx)) pose l'en-tête, le relief, la pointe, la tige olive foncé et le h1. L'en-tête vit **dans** la bannière (pas d'en-tête fixe) ; sous 1280 px la nav passe dans un menu plein écran rendu par portail (le `clip-path` de la bannière le couperait).
  - **Jaune = prise de rendez-vous** (`.btn-jaune`, Tbooking via `TBOOKING_URL`). Autres boutons : `.btn-contour`, `.btn-vert`, `.btn-ligne` ; tous en pilule.
  - **Formes** : cartes 14–20 px, portraits 18 px, photos des valeurs 16 px ; pas d'ombre sauf le soulèvement des cartes de prestation au survol (`--shadow-card`). Les transparences (voiles, dégradé du héros) passent par `color-mix()` sur les variables.
- **Animations** (toutes `aria-hidden` si décoratives, et respectant `prefers-reduced-motion` — la patientèle va « de l'enfant sportif à la personne âgée ») :
  - Héros de l'accueil : vidéo en boucle sur fond rayé (champ ACF `banner.video` ; non chargée si mouvement réduit), apparition mot à mot du nom puis accroche et boutons (`.hero-*`).
  - Valeurs de l’accueil : bande en biseau sur photo N&B sous voile olive (`.valeurs`, bord bas droit qui passe derrière la crête du pied de page en fin de page), cartes en quinconce dès 1100 px, apparition au défilement, photo N&B qui passe en couleur au survol. Pictogrammes animés des prestations ([PrestationIcon](src/components/ui/PrestationIcon.tsx), keyframes `pm-*`).
  - Apparition au défilement : `useReveal()` ([src/hooks/useReveal.ts](src/hooks/useReveal.ts)) sur la section, classe `.reveal` sur les enfants (+ `.reveal-gauche` / `.reveal-droite` pour une arrivée latérale), décalage via `[--reveal-delay:…]`. Ne pas poser `.reveal` directement sur un `.btn` (sa transition écraserait celle du bouton) : l'envelopper.
  - Rebond de tous les boutons `.btn` au survol et au clic ([src/lib/rebond.ts](src/lib/rebond.ts), un seul écouteur délégué posé par `App.tsx`).
- **Décors** : relief `relief.jpeg` dans les bannières ; pied de page à bord supérieur en ligne de crête (`--crete`, liseré olive = fond de `.pied` visible sous l'aplat `::before` décalé de 3 px). Tout décor qui déborde à droite est coupé par `overflow-x: clip` sur `.app`.
- **Typographie** : Rubik pour les titres et boutons (400/500/600), Mulish pour les textes (300/400/600/700), chargées dans [index.html](index.html). H1 de page via `.titre-page`, H2 via `.h2`, intitulés en `.intitule`. Corps de texte 16 px, interligne 1,6.
- **Contenus de repli** : [src/config/contenu.ts](src/config/contenu.ts) reprend les constantes de la maquette (planning, prestations, valeurs, équipe, bios, langues, FAQ). Chaque page lit d'abord WordPress et n'utilise ces valeurs que si le champ est vide ou indisponible. **Exception : l'accueil** n'a aucun repli, tout vient d'ACF (`banner`, `slogan`, `imageSection1` = montagne au-dessus des valeurs, `valeurs.imageDeFond` = fond de la bande olive, `valeur1`→`valeur4`) ; un champ vide n'est pas rendu.

## Pièges connus

- **Variable d'env manquante** : si `VITE_WP_URL` n'est pas défini, le client tape `https://votre-wordpress.com` (placeholder). Vérifier `.env.local` avant de débugger un 404.
- **CORS en prod uniquement** : en dev, Vite proxifie `/wp-json` et `/graphql`. Si une requête échoue en prod mais marche en local, c'est presque toujours du CORS (voir snippet `functions.php` dans le README).
- **Format réponse ACF** : selon le plugin/version, ACF retourne soit `{ acf: { ... } }`, soit directement `{ ... }`. La fonction `normalizeACFResponse` dans [src/lib/wordpress.ts](src/lib/wordpress.ts) gère les deux — ne pas court-circuiter.
- **Images ACF en REST** : ACF peut retourner un `integer` (ID d'attachment) au lieu de l'objet image complet selon la config "Return format". Utiliser `useMediaBatch(ids)` pour résoudre en lot.
- **Cache `sessionStorage`** : TTL 30 min par défaut. Si on modifie du contenu côté WP et qu'on ne le voit pas, vider le sessionStorage du navigateur ou attendre l'invalidation.
- **Coming Soon** : `FORCE_COMING_SOON` dans [src/config/site.ts](src/config/site.ts) ou `VITE_COMING_SOON_UNTIL=YYYY-MM-DDTHH:mm` dans `.env.local` permettent de bloquer le site sur la page d'attente. Penser à les désactiver avant un go-live.
- **`VITE_*` gravées au build** : ces variables sont inlinées dans le bundle par Vite au moment du `npm run build`. Les définir sur le serveur de destination n'a **aucun effet** (aucun process Node n'y tourne). En production, `VITE_WP_URL` se définit dans les variables du dépôt GitHub ; changer d'URL WordPress impose un rebuild.
- **`include-hidden-files: true` dans la CI** : `upload-artifact` exclut les fichiers cachés par défaut, et [public/.htaccess](public/.htaccess) en est un. Sans cette ligne, le zip part sans les règles de réécriture et chaque lien profond tombe en 404.
- **Mode maintenance = fichier drapeau** : `.htaccess` sert la page de maintenance en 503 tant qu'un fichier `.maintenance` existe à la racine du site. Le drapeau est un fichier **séparé** et non une ligne à décommenter, parce que le `.htaccess` est écrasé à chaque déploiement du zip. Le bloc maintenance doit rester **au-dessus** de la réécriture SPA, dont le `[L]` capterait sinon toutes les requêtes. Le point initial de `.infomaniak-maintenance.html` est imposé par Infomaniak : ne pas le renommer.
- **Un seul domaine indexable** : le `.htaccess` pose `X-Robots-Tag: noindex, nofollow` sur tout hôte autre que `physio-moleson.ch`, les adresses de recette servant la même racine. La redirection 301 des alias vers le domaine canonique est présente mais commentée — à activer après la bascule DNS et le certificat, pas avant.
- **`sitemap.xml` tenu à la main** : rien ne le régénère. Il décrit les routes du front React, pas les permaliens WordPress. Une route ajoutée ou retirée dans `resolvePage` doit y être reportée.
- **Logo** : `src/assets/logo/logo-moleson-complet.avif` (raster noir fourni avec la charte), passé en blanc sur vert par `.logo-inverse` (`invert` + `mix-blend-mode: screen`). Le SVG vectoriel reste à demander au client.
- **Page FAQ** : lit la page d'options ACF `faqs` (pas encore créée côté WordPress, voir README) ; en attendant, elle affiche les catégories de la maquette (`FAQ_THEMES` de [contenu.ts](src/config/contenu.ts)). Côté WP : répéteur `categoriesFaq` { `titre`, `questions` { `question`, `reponse` } }.
- **Liens saisis dans WordPress** : les rédacteurs collent des URL absolues (`http://localhost/cabinet`). Les passer par `lienInterne()` ([src/lib/wordpress.ts](src/lib/wordpress.ts)) au mapping : tout lien vers le site lui-même devient un chemin relatif, les liens externes (Tbooking) restent intacts.
- **Formulaire de contact simulé** : [ContactPage](src/pages/ContactPage.tsx) n'envoie rien (comme la maquette). Brancher un backend avant le go-live.
- **Anciennes routes** : `/services` et `/sensopro` redirigent (remplacement d'historique) vers `/prestations` via `REDIRECTS` dans `App.tsx`.
- **Thème actif** : `ACTIVE_THEME` est typé comme littéral pour permettre le tree-shaking. Pour ajouter un thème il faut étendre `ThemeName`, créer le bloc CSS `html.theme-<nom>` et ajouter une entrée dans `THEMES` (voir commentaire dans [src/themes/index.ts](src/themes/index.ts)).

## Points d'extension fréquents

- **Ajouter une page WP statique** : créer `src/pages/MaPage.tsx` qui consomme `usePage("slug-wp")`, puis ajouter la route dans `resolvePage` de `App.tsx` (+ `PAGE_LABELS`) et dans [public/sitemap.xml](public/sitemap.xml). Pour une route dynamique style `/mon-cpt/:slug`, suivre le pattern de `ArticleDetailPage`.
- **Ajouter un schéma ACF** : déclarer un nouveau `const MonSchema = { ... } as const` dans [src/config/acf-schemas.ts](src/config/acf-schemas.ts), puis le consommer via `acfReader`.
- **Nouvelle variable d'env** : ajouter dans `.env.example` (commiter), typer dans [src/vite-env.d.ts](src/vite-env.d.ts), lire via `import.meta.env.VITE_*`.
- **Nouveau CPT** : utiliser `useCPT<MonType>("mon-cpt", { ... })`. Pas besoin d'écrire un fetcher dédié.

## Ce qu'on ne fait PAS dans ce dépôt

- Pas de SSR/SSG : tout est rendu côté client. Vite produit un SPA statique.
- Pas de state global (Redux/Zustand). Le cache de `useWordPress` joue ce rôle.
- Pas de CSS-in-JS. Tailwind + `index.css` uniquement.
- Pas de modification de contenu depuis le frontend (lecture seule via WP REST/GraphQL).
