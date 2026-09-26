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
- **Charte graphique** : la référence est [doc/new_design_v4/](doc/new_design_v4/) (« Piste A »). Les six couleurs de marque sont figées en hexadécimal dans `:root` sous les noms `--brand-*`, aux valeurs exactes du document. Trois règles s'appliquent à chaque nouvel écran :
  - **Terracotta = liens et boutons.** La charte réserve les aplats terracotta à la vitrine et à la signalétique ; à l'écran, le texte courant est en encre sur blanc cassé. Un grand panneau terracotta avec du texte clair ne passe pas les contrastes.
  - **Petit corps sur fond clair → `primary-text` (#8F4C35), pas `primary` (#B4644A).** Le terracotta plein ne donne que 4.25:1, la charte demande elle-même de foncer. Vaut aussi pour les survols.
  - **Couples interdits** : crème sur ocre (2.6:1, « à éviter ») et sauge sur terracotta (1.5:1, « interdit »). Ne jamais les employer en texte/fond.
- **Animations** : dans [src/components/animation/](src/components/animation/), portées depuis les exports `doc/animation/*.dc.html` (format « DC » propriétaire : runtime de 69 ko, balises `<x-dc>`, React exposé en global). **Ne pas réintroduire le runtime** — seule la logique est reprise, en React standard. Trois règles pour toute nouvelle animation :
  - **Couleurs via les rampes `--anim-*`** de [src/index.css](src/index.css), dérivées des couleurs de marque. Le design system d'origine a sa propre palette, proche mais pas identique : ne jamais recopier ses valeurs.
  - **Décoratif = invisible pour l'assistance** : `aria-hidden="true"` sur le `<svg>`, jamais de texte dedans.
  - **`prefers-reduced-motion` et `IntersectionObserver`** : la boucle `requestAnimationFrame` s'arrête hors écran et se fige (ou ne rend rien) si le visiteur a demandé moins de mouvement. La patientèle allant « de l'enfant sportif à la personne âgée », ce n'est pas optionnel. Toujours libérer `raf` + observers au démontage.
- **Typographie** : Rubik pour les titres (400/500), Mulish pour les textes (300/400/700), chargées dans [index.html](index.html). Pas de monospace — les surtitres et étiquettes utilisent la classe `.label` (Mulish Bold, capitales, 0,1 em). Corps de texte jamais sous 16 px, interligne 1,55, aligné à gauche, **sans italique** ni soulignement hors liens.

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
- **Massif du pied de page** : [MountainFooter](src/components/animation/MountainFooter.tsx) **déroge sciemment** à la charte, qui pose que le Moléson « n'est jamais redessiné, décliné en motif ou répété en fond ». Intégration validée en connaissance de cause ; ne pas la « corriger » sans arbitrage. Sa crête est en encre (et non dans le vert du fichier d'origine) pour se fondre dans le pied de page.
- **Contraste des boutons** : `.btn-primary` est en crème sur terracotta, soit 3.82:1 — conforme à la charte (« Crème sur terracotta · boutons · Recommandé ») mais sous le seuil AA de 4.5:1 pour du texte non large. C'est le seul écart connu ; assombrir le fond à `#A25A43` le porterait à 4.55:1 si le sujet est rouvert avec la graphiste.
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
