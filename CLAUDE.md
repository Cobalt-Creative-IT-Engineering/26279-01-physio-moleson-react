# CLAUDE.md — Cabinet physio du Moléson

Guide rapide pour assister sur ce dépôt. Voir [README.md](README.md) pour la mise en route détaillée.

## Contexte projet

- **Site** : physio-moleson.ch — site vitrine du Cabinet physio du Moléson
- **Architecture** : WordPress headless. WP = source de contenu (REST + ACF + GraphQL). Frontend React déployé sur Netlify.
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

- **Une page = un fichier** dans [src/pages/](src/pages/), routée explicitement dans le `PageView` de [src/App.tsx](src/App.tsx). Pas de routing implicite, pas de react-router. Le routing utilise [src/hooks/useRoute.ts](src/hooks/useRoute.ts) (History API maison).
- **Données WP** : passer **toujours** par les hooks de [src/hooks/useWordPress.ts](src/hooks/useWordPress.ts) (`usePost`, `usePage`, `useACFOptionsPage`, `useCPT`, etc.) plutôt que d'appeler `fetch` directement. Ces hooks gèrent le cache mémoire + `sessionStorage` et l'état `loading/error/success`.
- **Champs ACF** : ne jamais référencer un slug ACF brut (`"hero_title"`) dans un composant. Déclarer le mapping dans [src/config/acf-schemas.ts](src/config/acf-schemas.ts) puis lire via `acfReader(data, MonSchema).text("title")`. Quand un champ est renommé côté WP, on ne touche qu'au schéma.
- **Meta tags** : utiliser `setPageMeta({ title, description, image })` depuis [src/lib/meta.ts](src/lib/meta.ts) dans chaque page de détail. Le shell `App.tsx` pose déjà des valeurs par défaut.
- **Liens internes** : un simple `<a href="/about">` suffit — l'intercepteur global de `App.tsx` convertit le clic en `navigate()` History API. Pas besoin d'un composant `<Link>`.
- **Tailwind** : utiliser les classes utilitaires + les design tokens définis dans [src/index.css](src/index.css) (variables CSS sous `html.theme-base`). Éviter le CSS inline ad-hoc.

## Pièges connus

- **Variable d'env manquante** : si `VITE_WP_URL` n'est pas défini, le client tape `https://votre-wordpress.com` (placeholder). Vérifier `.env.local` avant de débugger un 404.
- **CORS en prod uniquement** : en dev, Vite proxifie `/wp-json` et `/graphql`. Si une requête échoue en prod mais marche en local, c'est presque toujours du CORS (voir snippet `functions.php` dans le README).
- **Format réponse ACF** : selon le plugin/version, ACF retourne soit `{ acf: { ... } }`, soit directement `{ ... }`. La fonction `normalizeACFResponse` dans [src/lib/wordpress.ts](src/lib/wordpress.ts) gère les deux — ne pas court-circuiter.
- **Images ACF en REST** : ACF peut retourner un `integer` (ID d'attachment) au lieu de l'objet image complet selon la config "Return format". Utiliser `useMediaBatch(ids)` pour résoudre en lot.
- **Cache `sessionStorage`** : TTL 30 min par défaut. Si on modifie du contenu côté WP et qu'on ne le voit pas, vider le sessionStorage du navigateur ou attendre l'invalidation.
- **Coming Soon** : `FORCE_COMING_SOON` dans [src/config/site.ts](src/config/site.ts) ou `VITE_COMING_SOON_UNTIL=YYYY-MM-DDTHH:mm` dans `.env.local` permettent de bloquer le site sur la page d'attente. Penser à les désactiver avant un go-live.
- **Thème actif** : `ACTIVE_THEME` est typé comme littéral pour permettre le tree-shaking. Pour ajouter un thème il faut étendre `ThemeName`, créer le bloc CSS `html.theme-<nom>` et ajouter une entrée dans `THEMES` (voir commentaire dans [src/themes/index.ts](src/themes/index.ts)).

## Points d'extension fréquents

- **Ajouter une page WP statique** : créer `src/pages/MaPage.tsx` qui consomme `usePage("slug-wp")`, puis ajouter la route dans `App.tsx` (`PageView` + `PAGE_LABELS`). Pour une route dynamique style `/mon-cpt/:slug`, suivre le pattern de `ArticleDetailPage`.
- **Ajouter un schéma ACF** : déclarer un nouveau `const MonSchema = { ... } as const` dans [src/config/acf-schemas.ts](src/config/acf-schemas.ts), puis le consommer via `acfReader`.
- **Nouvelle variable d'env** : ajouter dans `.env.example` (commiter), typer dans [src/vite-env.d.ts](src/vite-env.d.ts), lire via `import.meta.env.VITE_*`.
- **Nouveau CPT** : utiliser `useCPT<MonType>("mon-cpt", { ... })`. Pas besoin d'écrire un fetcher dédié.

## Ce qu'on ne fait PAS dans ce dépôt

- Pas de SSR/SSG : tout est rendu côté client. Vite produit un SPA statique.
- Pas de state global (Redux/Zustand). Le cache de `useWordPress` joue ce rôle.
- Pas de CSS-in-JS. Tailwind + `index.css` uniquement.
- Pas de modification de contenu depuis le frontend (lecture seule via WP REST/GraphQL).
