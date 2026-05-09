<div align="center">

 ![linkedin-shield] ![facebook-shield]  ![insta-shield]

</div>

<div align="center">
  <img src="https://avatars.githubusercontent.com/u/145210822?s=48&v=4" alt="Logo" width="80" height="80" />
  <h1 align="center">Cabinet physio du Moléson — site React</h1>
  <p align="center">
    Frontend React + TypeScript du site <strong>physio-moleson.ch</strong>, alimenté par WordPress en headless.
  </p>
</div>

<div align="center">

![React.js] ![TypeScript] ![Vite] ![Tailwind] ![wp.dev]

</div>

## À propos du projet

Site vitrine du **Cabinet physio du Moléson** (physio-moleson.ch).

L'application est un frontend React + TypeScript découplé : WordPress sert uniquement de source de contenu (API REST, ACF et WPGraphQL), et le site est déployé sous forme de fichiers statiques sur Netlify. Le projet est dérivé du blueprint interne [`wp-react-headless-blueprint`](https://github.com/Cobalt-Creative-IT-Engineering/wp-react-headless-blueprint) qui fournit une couche de données typée, un cache mémoire + `sessionStorage`, un système de schémas ACF, un routeur basé sur l'History API et un système de thèmes.

> **Backend WordPress** : la procédure pour déployer/configurer l'instance WP côté backend est documentée en interne — voir [Cobalt Knowledge #150](https://cobalt-it.odoo.com/odoo/knowledge/150). À suivre **avant** de configurer ce frontend.

## Stack technique

- [React 18](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [WordPress](https://wordpress.org/) (API REST + [ACF](https://www.advancedcustomfields.com/) + [WPGraphQL](https://www.wpgraphql.com/))
- Hébergement frontend : [Netlify](https://www.netlify.com/)

## Structure du projet

```
.                               <- Racine du projet
├── index.html                  <- Point d'entrée HTML (Vite)
├── package.json                <- Dépendances et scripts npm
├── vite.config.ts              <- Config Vite (proxy dev /wp-json et /graphql)
├── tsconfig.json               <- Options du compilateur TypeScript
├── tailwind.config.js          <- Configuration Tailwind
├── postcss.config.js
├── netlify.toml                <- Configuration de build/deploy Netlify
├── .env.example                <- Template d'environnement (à copier en .env.local)
├── README.md                   <- Ce fichier
├── CLAUDE.md                   <- Guide pour l'assistant Claude Code
├── doc/                        <- Notes de projet (résumés, décisions)
├── public/                     <- Assets statiques (favicon, OG images, _redirects, robots.txt)
└── src/
    ├── main.tsx                <- Point d'entrée Vite
    ├── App.tsx                 <- Shell de l'app + table de routage
    ├── index.css               <- Couches Tailwind, design tokens, blocs de thème
    ├── types/
    │   └── wordpress.ts        <- Toutes les interfaces TypeScript WP / ACF
    ├── lib/
    │   ├── wordpress.ts        <- Client REST + ACF + WPGraphQL
    │   └── meta.ts             <- Mise à jour des balises <title>, og:*, twitter:*
    ├── hooks/
    │   ├── useRoute.ts         <- Routing basé sur l'History API
    │   ├── useScrollSpy.ts
    │   └── useWordPress.ts     <- Hooks de données + couche de cache
    ├── config/
    │   ├── acf-schemas.ts      <- Schémas ACF (clé sémantique → slug WP)
    │   └── site.ts             <- Nom du site, items de navigation, thème actif
    ├── components/
    │   ├── acf/                <- ACFField / ACFRenderer / helpers acfReader
    │   ├── layout/             <- Nav, Footer
    │   └── ui/                 <- Primitives UI génériques (Skeleton, PostCard, …)
    ├── pages/                  <- Un fichier par route
    └── themes/                 <- Système de thèmes (Decorations + classes CSS)
```

## Mise en route rapide

Installation du projet dans votre environnement de **développement local**.

### Prérequis

Les outils suivants doivent être installés sur votre système :
- [Node.js](https://nodejs.org/) ≥ 18
- [npm](https://www.npmjs.com/) (livré avec Node)

Vous devez également avoir accès à l'instance WordPress du Cabinet physio du Moléson, configurée selon la section [Backend WordPress](#backend-wordpress) ci-dessous.

### Environnement

- Copiez `.env.example` en `.env.local` et renseignez `VITE_WP_URL` avec l'URL de l'instance WordPress (sans slash final).
- Lorsque vous ajoutez une nouvelle variable à `.env.local`, mettez à jour `.env.example` en conséquence et commitez-le pour que l'équipe ait toujours le template à jour.

### Installation

```shell
npm install
```

### Backend WordPress

> **Déploiement d'une nouvelle instance** : suivez la [procédure interne](https://cobalt-it.odoo.com/odoo/knowledge/150).

Plugins requis côté WordPress :

| Plugin | Rôle |
|---|---|
| Advanced Custom Fields (ACF) | Champs personnalisés |
| ACF to REST API | Expose les champs ACF sur `/wp-json/acf/v3/*` |
| WPGraphQL | Options pages et champs non exposés par REST |
| WPGraphQL for ACF | Expose les champs ACF dans le schéma GraphQL |
| WP REST API Menus (optionnel) | Uniquement si `getMenu()` est utilisé |

Le CORS doit être activé pour l'origine du frontend. Ajoutez ceci dans le `functions.php` du thème WP :

```php
add_action('init', function () {
    $origin  = $_SERVER['HTTP_ORIGIN'] ?? '';
    $allowed = ['http://localhost:5173', 'https://physio-moleson.ch'];

    if (in_array($origin, $allowed)) {
        header("Access-Control-Allow-Origin: $origin");
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Headers: Authorization, Content-Type');
    }

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        status_header(200);
        exit();
    }
});
```

> **REMARQUE** : en développement, Vite proxifie `/wp-json` et `/graphql` vers `VITE_WP_URL`, donc le CORS n'est strictement requis que pour les builds de production.

### Configuration

Les principaux points d'entrée de configuration :

- `src/config/site.ts`
  - `SITE_CONFIG` — nom du site, langue, description (utilisés comme valeurs par défaut pour les meta tags)
  - `SOCIAL_LINKS` — liens vers les réseaux sociaux (vides = ignorés)
  - `NAV_ITEMS` — items de navigation (`cta: true` pour afficher un item sous forme de bouton)
  - `ACTIVE_THEME` — sélectionne le thème visuel actif (voir [src/themes/](src/themes/))
- `src/config/acf-schemas.ts` — mapping clé sémantique TypeScript → slug ACF dans WordPress

> **ATTENTION** : ne jamais pointer un environnement de développement local vers la base WordPress de production.

### Lancer les tests

Aucun runner de tests n'est configuré pour l'instant. Lors de l'ajout d'un runner, [Vitest](https://vitest.dev/) est recommandé pour rester aligné avec Vite.

### Lancer le projet

```shell
# Serveur de développement sur http://localhost:5173
npm run dev

# Build de production → dist/ (inclut un typecheck tsc)
npm run build

# Servir dist/ en local pour valider le build de production
npm run preview
```

### Vérifier la qualité du code

Le typecheck est intégré à la commande de build (`tsc && vite build`). Pour le lancer seul :

```shell
npx tsc --noEmit
```

Aucun linter ni formateur n'est préconfiguré.

## Déploiement

Le frontend est déployé sur **Netlify** (configuration dans [netlify.toml](netlify.toml)).

- Build command : `npm run build`
- Publish directory : `dist`
- Variable d'environnement requise sur Netlify : `VITE_WP_URL`

## Contribuer

Merci de ne pas travailler directement sur `main`. Suivez les recommandations ci-dessous et créez une branche dédiée.

1. Créer une branche de feature (`git checkout -b feature/amazing_feature`)
2. Committer vos changements (`git commit -m '[VP] Add some amazing feature'`)
3. Pousser la branche (`git push origin feature/amazing_feature`)
4. Ouvrir une Pull Request et ajouter des reviewers

## Licence

Ce projet est sous licence BUSL 1.1 (Business Source License 1.1).

## Contact

Email : contact@cobalt-it.ch


<!-- MARKDOWN LINKS & IMAGES -->

<!-- Social -->

[linkedin-shield]: https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white
[linkedin-url]: https://www.linkedin.com/company/cobalt-it-ch/
[facebook-shield]: https://img.shields.io/badge/Facebook-%231877F2.svg?style=for-the-badge&logo=Facebook&logoColor=white
[facebook-url]: https://www.facebook.com/CobaltIT?locale=fr_FR
[insta-shield]: https://img.shields.io/badge/Cobalt-%23E4405F.svg?style=for-the-badge&logo=Instagram&logoColor=white
[insta-url]: https://www.instagram.com/cobalt.it/

<!-- Framework -->

[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[TypeScript]: https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white
[Vite]: https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white
[Tailwind]: https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white
[wp.dev]: https://img.shields.io/badge/WordPress-%23117AC9.svg?style=for-the-badge&logo=WordPress&logoColor=white
