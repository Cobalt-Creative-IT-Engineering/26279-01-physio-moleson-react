# Récapitulatif du Projet

## Pages Finales (11 au total)

| Page | Description |
|------|-------------|
| **HomePage** | Hero via `HeroACF` Options + derniers articles + partners |
| **ArticlesPage** | Listing paginé via `usePosts` |
| **ArticleDetailPage** | Article WP standard via `usePost(slug)` |
| **AboutPage** | Page WP + schéma `AboutACF` (team repeater) |
| **InfoPage** | Page WP + scroll-spy + repeater `InfoACF` (fallback sur `page.content`) |
| **ContactPage** | Options Sub-Page ACF `contact` via `useACFOptionsPage` |
| **TwoColumnPage** | Layout 2 colonnes générique (slug prop + sidebar ACF) |
| **WPPageView** | Fallback `/page/:slug` |
| **LegalNoticePage** | Lecture page WP par slug |
| **TermsPage** | Lecture page WP par slug |
| **ComingSoonPage** | Flag `FORCE_COMING_SOON` + date `VITE_COMING_SOON_UNTIL` |

---

## Suppressions

### Pages
- `ProgrammationPage`
- `BilletteriePage`
- `AncieneEditionPage`
- `ArtistModal`
- `StagingGate`

### Composants UI
- `Sticker`
- `HeroCanvas`

### Ressources
- `src/assets/` (~30MB de polices, stickers, logos)
- `src/themes/2026/`
- Classe theme-2026 dans CSS
- `public/themes/` (stickers SVG)

### Requêtes GraphQL
- Toutes les queries festival et leurs hooks associés
  - `GQL_ALL_OPTIONS`
  - `GQL_PAGE_ATTENTE`
  - *et autres*

---

## Généralisations

### Configuration
- **`site.ts`** : placeholders, 4 items de nav (`/about`, `/articles`, `/info`, `/contact`), flag coming-soon basé env

### Schémas ACF
- **`acf-schemas.ts`** : 5 schémas génériques
  - `HeroACF`
  - `PartnersACF`
  - `ContactACF`
  - `AboutACF`
  - `InfoACF`

### Hooks WordPress
- **`useWordPress.ts`** : hooks REST conservés, `useGraphQLSiteSettings` comme exemple commenté

### Types
- **`types/wordpress.ts`** : types core uniquement

### Composants
- **`Nav`** : version neutre lisant `SITE_CONFIG` + `NAV_ITEMS` + `SOCIAL_LINKS`
- **`Footer`** : version neutre lisant `SITE_CONFIG` + `NAV_ITEMS` + `SOCIAL_LINKS`

### Métadonnées
- **`meta.ts`** : placeholders neutres
- **`index.html`** : placeholders neutres
- **`favicon.svg`** : placeholders neutres
- **`robots.txt`** : placeholders neutres
- **`.env.example`** : placeholders neutres

### Thèmes
- **`themes/index.ts`** : un seul thème `base` documenté

### Styles
- **`src/index.css`** : 428 lignes (was 3000+)
  - Design tokens neutres noir/blanc
  - Rebuild from scratch

---

## Ajouts

- **`src/vite-env.d.ts`** : typage `ImportMetaEnv` pour les variables d'environnement

---

## Prochaines Étapes

### Validation
- [ ] `npm run dev` pour valider le rendu dans le navigateur

### Versioning
- [ ] Premier commit de baseline

### Optimisation
- [ ] Éventuellement : affiner le design des tokens CSS selon les standards Cobalt