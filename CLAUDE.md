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
- **Données WP** : passer **toujours** par les hooks de [src/hooks/useWordPress.ts](src/hooks/useWordPress.ts) plutôt que d'appeler `fetch` directement. Tout le contenu est lu en **WPGraphQL** : une requête `GQL_*`, une fonction de mapping `fromGQL*` et un hook par page (`useAccueilOptions`, `usePagePrestations`, `useCabinetOptions`, `usePageEquipe`, `useTherapeutes`, `useFaqOptions`, `usePageFaq`, `useGlobalOptions`). Ces hooks gèrent le cache mémoire + `localStorage` et l'état `loading/error/success`.
- **Champs ACF** : les composants ne voient jamais les noms de champs GraphQL : ils lisent les types métier de [src/types/wordpress.ts](src/types/wordpress.ts), produits par les fonctions `fromGQL*`. Quand un champ est renommé côté WP, on n'adapte que la requête `GQL_*` et sa fonction `fromGQL*`. Le HTML des éditeurs WYSIWYG s'affiche via `<WPContent>`, qui retire les classes, styles et scripts collés.
- **Meta tags** : utiliser `setPageMeta({ title, description, image })` depuis [src/lib/meta.ts](src/lib/meta.ts) dans chaque page de détail. Le shell `App.tsx` pose déjà des valeurs par défaut.
- **Liens internes** : un simple `<a href="/about">` suffit — l'intercepteur global de `App.tsx` convertit le clic en `navigate()` History API. Pas besoin d'un composant `<Link>`.
- **Tailwind** : utiliser les classes utilitaires + les design tokens définis dans [src/index.css](src/index.css). Éviter le CSS inline ad-hoc, et **ne jamais écrire une couleur en dur** : tout passe par les variables.
- **Maquette de référence** : [doc/maquette/](doc/maquette/) (handoff haute fidélité, voir son README) fait foi pour les écrans ; elle remplace les règles d'usage de l'ancienne charte « Alpage » ([doc/charte/](doc/charte/) reste la source du logo et des couleurs de marque). Valeurs figées dans `:root` (`--brand-*`), classes Tailwind par rôle (`bg` blanc #FDFDFD, `sable`, `ink`, `muted`, `vert`, `jaune`, `olive`, `line`, `field`, `on-dark`, `on-dark-soft`). Règles :
  - **Fond de page blanc** (`bg`), texte anthracite, secondaire en `muted`. Pastilles en **sable**. **Olive** pour les cartes et encadrés mis en avant : formulaire de contact et encadré « Vous ne trouvez pas votre réponse ? » en `on-dark bg-olive` (texte blanc, bouton jaune qui passe en blanc au survol) ; cartes de prestation olive au survol ; bandes des valeurs et du carrousel Équipe sous voile olive. Blanc sur olive ≈ 3,4:1 : réserver aux titres, libellés et survols.
  - **Bannières vertes à pointe** sur chaque page interne : `<PageBanner title video>` ([PageBanner.tsx](src/components/layout/PageBanner.tsx)) pose l'en-tête, le relief (ou la vidéo ACF en fond sous `.banniere-voile`, absente si mouvement réduit), la pointe, la tige olive foncé et le h1 (`.titre-page`, 40–76 px). Dans la bannière : `<BannerText>` = sous-titre en Rubik 26–44 px, `<BannerText soft>` = description 17–20 px. L'en-tête vit **dans** la bannière (pas d'en-tête fixe) ; sous 1280 px la nav passe dans un menu plein écran rendu par portail (le `clip-path` de la bannière le couperait).
  - **Jaune = prise de rendez-vous et appels à l'action des encadrés olive** (`.btn-jaune`). Autres boutons : `.btn-contour`, `.btn-vert`, `.btn-ligne` ; tous en pilule. **Bouton dont l'URL vient d'ACF : masqué si l'URL est vide** (Tbooking des thérapeutes, Sensopro, boutons de l'accueil) ; seuls l'en-tête et le pied de page utilisent `TBOOKING_URL`.
  - **Formes** : cartes 14–20 px, portraits 18 px, photos des valeurs 16 px ; pas d'ombre sauf le soulèvement des cartes de prestation au survol (`--shadow-card`). Les transparences (voiles, dégradé du héros) passent par `color-mix()` sur les variables.
- **Animations** (toutes `aria-hidden` si décoratives, et respectant `prefers-reduced-motion` — la patientèle va « de l'enfant sportif à la personne âgée ») :
  - Héros de l'accueil : vidéo en boucle sur fond rayé (champ ACF `banner.video` ; non chargée si mouvement réduit), apparition mot à mot du nom puis accroche et boutons (`.hero-*`).
  - Valeurs de l’accueil : bande en biseau sur photo N&B sous voile olive (`.valeurs`, bord bas droit qui passe derrière la crête du pied de page en fin de page), cartes en quinconce dès 1100 px, apparition au défilement, photo N&B qui passe en couleur au survol. Pictogrammes des prestations : deux SVG fournis par ACF (fixe au repos, animé en boucle au survol de la carte) ; sources dans [doc/pictogrammes/](doc/pictogrammes/).
  - Apparition au défilement : `useReveal()` ([src/hooks/useReveal.ts](src/hooks/useReveal.ts)) sur la section, classe `.reveal` sur les enfants (+ `.reveal-gauche` / `.reveal-droite` pour une arrivée latérale), décalage via `[--reveal-delay:…]` (fondu de 600 ms, décalages appliqués à 60 % : rester court, une page ne doit pas paraître vide en attendant ses animations). Ne pas poser `.reveal` directement sur un `.btn` (sa transition écraserait celle du bouton) : l'envelopper. Utilisé sur l'accueil (intro, valeurs) et sur toutes les pages internes. Pour un bloc qui dépend de données WordPress, envelopper avec `<Apparition>` ([src/components/ui/Apparition.tsx](src/components/ui/Apparition.tsx)) rendu **une fois les données chargées** (l'observateur se pose au montage) ; cascade via `delaiApparition(i)`. Sur une carte qui a son propre mouvement au survol (`.prestation`), poser `.reveal` sur une enveloppe, pas sur la carte.
  - Page Équipe : slider de portraits en losange (`.equipe-slider`, `.eq-*`) ; actif au centre en couleur, voisins réduits en N&B ; flèches, clavier, glissé, clic sur un voisin ; clic sur le central = fiche complète (modale). Pas de défilement automatique. Sous 640 px, seul le portrait central reste visible.
  - Rebond de tous les boutons `.btn` au survol et au clic ([src/lib/rebond.ts](src/lib/rebond.ts), un seul écouteur délégué posé par `App.tsx`).
- **Décors** : relief `relief.avif` (1024 px, 128 Ko) dans les bannières ; pied de page à bord supérieur en ligne de crête (`--crete`, liseré olive = fond de `.pied` visible sous l'aplat `::before` décalé de 3 px). Tout décor qui déborde à droite est coupé par `overflow-x: clip` sur `.app`.
- **Typographie** : Rubik pour les titres et boutons (400/500/600), Mulish pour les textes (300/400/600/700), chargées dans [index.html](index.html). H1 de page via `.titre-page`, H2 via `.h2`, intitulés en `.intitule`. Corps de texte 16 px, interligne 1,6.
- **Contenu : tout vient d'ACF, sans repli.** Un champ vide n'est simplement pas rendu. Ne pas réintroduire de textes de la maquette en dur. Seules exceptions, faute de champ ACF : les langues des thérapeutes ([src/config/contenu.ts](src/config/contenu.ts)), `TBOOKING_URL` de l'en-tête et du pied de page ([site.ts](src/config/site.ts)), et les textes d'intro de la page Contact. Les options globales (`optGlobale`) fournissent téléphone, e-mail, adresses, horaires du secrétariat (`horaireSecretariat`), réseaux sociaux (WhatsApp : un numéro est converti en lien `wa.me` par `lienWhatsapp`), carte Google Maps (`carteGoogle`, seules les URL `google.*/maps` sont acceptées dans l'iframe ; sinon recherche sur la première adresse), logo et résumé. La carte page par page des sources ACF (noms GraphQL) est dans le README, section « Contenu WordPress (ACF) ». Chaque page d'options a son hook (`useAccueilOptions`, `usePagePrestations`, `useCabinetOptions`, `usePageEquipe`, `usePageFaq`, `useGlobalOptions`) ; la page Contact reprend la vidéo de la bannière de l'accueil. Les champs **Relation** des pages Équipe et FAQ filtrent et ordonnent les entrées ; vides = tout afficher.

## Pièges connus

- **Variable d'env manquante** : si `VITE_WP_URL` n'est pas défini, le client tape `https://votre-wordpress.com` (placeholder). Vérifier `.env.local` avant de débugger un 404.
- **CORS en prod uniquement** : en dev, Vite proxifie `/wp-json` et `/graphql`. Si une requête échoue en prod mais marche en local, c'est presque toujours du CORS (voir snippet `functions.php` dans le README).
- **Fichiers non photo en GraphQL** (vidéo, SVG) : `sourceUrl` est vide, lire `mediaItemUrl`.
- **Cache durable (`localStorage`, préfixe `wp:`)** : le dernier contenu connu s'affiche aussitôt (7 jours max), puis chaque hook le rafraîchit en arrière-plan ; une modification WP apparaît donc dès la requête suivante. Les clés GraphQL sont versionnées par l'empreinte du texte de la requête (`cleGQL`) : modifier une requête invalide son cache, inutile de le vider à la main.
- **Préchargement** : `prechargerPages()` ([useWordPress.ts](src/hooks/useWordPress.ts)), lancé par `App.tsx` 1,2 s après le premier affichage, récupère les données de toutes les pages. **Toute nouvelle requête de page doit y être ajoutée**, avec le même nom et la même requête que son hook, sinon cette page attendra WordPress à la première visite.
- **Coming Soon** : `FORCE_COMING_SOON` dans [src/config/site.ts](src/config/site.ts) ou `VITE_COMING_SOON_UNTIL=YYYY-MM-DDTHH:mm` dans `.env.local` permettent de bloquer le site sur la page d'attente. Penser à les désactiver avant un go-live.
- **`VITE_*` gravées au build** : ces variables sont inlinées dans le bundle par Vite au moment du `npm run build`. Les définir sur le serveur de destination n'a **aucun effet** (aucun process Node n'y tourne). En production, `VITE_WP_URL` se définit dans les variables du dépôt GitHub ; changer d'URL WordPress impose un rebuild.
- **`include-hidden-files: true` dans la CI** : `upload-artifact` exclut les fichiers cachés par défaut, et [public/.htaccess](public/.htaccess) en est un. Sans cette ligne, le zip part sans les règles de réécriture et chaque lien profond tombe en 404.
- **Mode maintenance = fichier drapeau** : `.htaccess` sert la page de maintenance en 503 tant qu'un fichier `.maintenance` existe à la racine du site. Le drapeau est un fichier **séparé** et non une ligne à décommenter, parce que le `.htaccess` est écrasé à chaque déploiement du zip. Le bloc maintenance doit rester **au-dessus** de la réécriture SPA, dont le `[L]` capterait sinon toutes les requêtes. Le point initial de `.infomaniak-maintenance.html` est imposé par Infomaniak : ne pas le renommer.
- **Un seul domaine indexable** : le `.htaccess` pose `X-Robots-Tag: noindex, nofollow` sur tout hôte autre que `physio-moleson.ch`, les adresses de recette servant la même racine. La redirection 301 des alias vers le domaine canonique est présente mais commentée — à activer après la bascule DNS et le certificat, pas avant.
- **`sitemap.xml` tenu à la main** : rien ne le régénère. Il décrit les routes du front React, pas les permaliens WordPress. Une route ajoutée ou retirée dans `resolvePage` doit y être reportée.
- **Logo** : `src/assets/logo/logo-moleson-complet.avif` (raster noir fourni avec la charte), passé en blanc sur vert par `.logo-inverse` (`invert` + `mix-blend-mode: screen`). Le SVG vectoriel reste à demander au client.
- **Page FAQ** : questions du type `faqQuestion` (groupe ACF `faq` : `question`, `reponse`, `categorie` à choix multiple), regroupées par catégorie dans `FaqPage.tsx` ; bannière et sélection via la page d'options `pageFAQs` (groupe `pageFaq`). Le sous-champ du sous-titre s'appelle **`sousTitrre`** côté ACF (faute conservée) : s'il est renommé, adapter `GQL_PAGE_FAQ`. Ne pas renommer le type en `FAQ` dans GraphQL : il écraserait le type du groupe `Faq`.
- **Noms GraphQL ACF** : une page d'options ou un type de publication ne doit jamais porter le même nom GraphQL que le groupe de champs qu'il contient (`FAQ` + `Faq`, `Sensopro` + `Sensopro`) : l'un écrase l'autre et les champs deviennent introuvables. Pas d'accent non plus (`pageéQuipe` empêche le rattachement), et « Manually Set GraphQL Types » désactivé. Couples en place : `accueil`/`Accueils`, `prestationPage`/`Prestations`, `pageCabinet`/`Cabinet`, `pageEquipe`/`Equipe`, `pageFAQs`/`PageFaq`, `faqQuestion`/`Faq`, `optGlobale`/`OptionsGlobale`.
- **Pages d'options = un seul stockage** : ACF range toutes les pages d'options sous `options_<nom du champ>`. Deux champs de même nom sur deux pages partagent leurs valeurs (les bannières se recopiaient d'une page à l'autre). Noms de champ uniques (`banner-accueil`, `banner-prestations`, `banner-cabinet`, `banner-equipe`, `banner-faq`), le GraphQL Field Name pouvant rester `banner`. Le « Custom Storage » d'ACF n'a pas été retenu.
- **Média rattaché à une entrée à la corbeille** : WordPress le rend privé (REST 401) et le champ image ACF renvoie `null` en GraphQL, alors qu'il apparaît sélectionné dans l'admin. Vider la corbeille ou « Détacher » le fichier.
- **Vérifier une modification ACF** : interroger `/graphql` (introspection `__type` puis la requête du hook). Wordfence bloque (403) les rafales de requêtes : rester sobre.
- **Champ ACF renommé ou supprimé** : la requête GraphQL de la page échoue entièrement (aucune donnée). Adapter la requête du hook concerné dans `useWordPress.ts`.
- **Liens saisis dans WordPress** : les rédacteurs collent des URL absolues (`http://localhost/cabinet`). Les passer par `lienInterne()` ([src/lib/wordpress.ts](src/lib/wordpress.ts)) au mapping : tout lien vers le site lui-même devient un chemin relatif, les liens externes (Tbooking) restent intacts.
- **Formulaire de contact simulé** : [ContactPage](src/pages/ContactPage.tsx) n'envoie rien (comme la maquette). Brancher un backend avant le go-live.
- **Anciennes routes** : `/services` et `/sensopro` redirigent (remplacement d'historique) vers `/prestations` via `REDIRECTS` dans `App.tsx`.
- **Thème actif** : `ACTIVE_THEME` est typé comme littéral pour permettre le tree-shaking. Pour ajouter un thème il faut étendre `ThemeName`, créer le bloc CSS `html.theme-<nom>` et ajouter une entrée dans `THEMES` (voir commentaire dans [src/themes/index.ts](src/themes/index.ts)).

## Points d'extension fréquents

- **Ajouter une page alimentée par ACF** : côté WordPress, une page d'options et son groupe (noms GraphQL distincts, champs de premier niveau uniques : voir « Pièges connus »). Côté code, dans `useWordPress.ts` : la requête `GQL_*`, son type de réponse, la fonction `fromGQL*`, le hook avec `cacheKey: cleGQL(...)`, **et l'entrée dans `prechargerPages()`** ; le type métier dans `types/wordpress.ts`. Puis `src/pages/MaPage.tsx`, la route dans `resolvePage` de `App.tsx` (+ `PAGE_LABELS`), `NAV_ITEMS` et [public/sitemap.xml](public/sitemap.xml).
- **Nouveau type de publication** : même démarche, avec une requête de liste (modèles : `GQL_THERAPEUTES`, `GQL_FAQ` ; `first`, tri `MENU_ORDER` puis `DATE`).
- **Nouvelle variable d'env** : ajouter dans `.env.example` (commiter), typer dans [src/vite-env.d.ts](src/vite-env.d.ts), lire via `import.meta.env.VITE_*`.

## Ce qu'on ne fait PAS dans ce dépôt

- Pas de SSR/SSG : tout est rendu côté client. Vite produit un SPA statique.
- Pas de state global (Redux/Zustand). Le cache de `useWordPress` joue ce rôle.
- Pas de CSS-in-JS. Tailwind + `index.css` uniquement.
- Pas de modification de contenu depuis le frontend (lecture seule via WP REST/GraphQL).
