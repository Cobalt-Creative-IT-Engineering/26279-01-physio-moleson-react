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

L'application est un frontend React + TypeScript découplé : WordPress sert uniquement de source de contenu (API REST, ACF et WPGraphQL), et le site est déployé sous forme de fichiers statiques sur un hébergement Apache classique (Infomaniak). Le projet est dérivé du blueprint interne [`wp-react-headless-blueprint`](https://github.com/Cobalt-Creative-IT-Engineering/wp-react-headless-blueprint) qui fournit une couche de données typée, un cache mémoire + `sessionStorage`, un système de schémas ACF, un routeur basé sur l'History API et un système de thèmes.

> **Backend WordPress** : la procédure pour déployer/configurer l'instance WP côté backend est documentée en interne — voir [Cobalt Knowledge #150](https://cobalt-it.odoo.com/odoo/knowledge/150). À suivre **avant** de configurer ce frontend.

## Stack technique

- [React 18](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [WordPress](https://wordpress.org/) (API REST + [ACF](https://www.advancedcustomfields.com/) + [WPGraphQL](https://www.wpgraphql.com/))
- Hébergement frontend : hébergement statique Apache (Infomaniak), build publié par GitHub Actions

## Structure du projet

```
.                               <- Racine du projet
├── index.html                  <- Point d'entrée HTML (Vite)
├── package.json                <- Dépendances et scripts npm
├── vite.config.ts              <- Config Vite (proxy dev /wp-json et /graphql)
├── tsconfig.json               <- Options du compilateur TypeScript
├── tailwind.config.js          <- Configuration Tailwind
├── postcss.config.js
├── .env.example                <- Template d'environnement (à copier en .env.local)
├── .github/workflows/ci.yml    <- Typecheck + build + publication de dist.zip
├── README.md                   <- Ce fichier
├── CLAUDE.md                   <- Guide pour l'assistant Claude Code
├── doc/                        <- Notes de projet (résumés, décisions)
├── public/                     <- Assets statiques livrés tels quels (favicon, robots.txt,
│                               sitemap.xml, .htaccess, page de maintenance)
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

### En résumé

1. `VITE_WP_URL` est définie **une seule fois**, dans les variables du dépôt GitHub.
2. La CI builde à chaque push sur `main` et publie un `dist.zip`.
3. On télécharge ce zip et on le décompresse dans le web root du serveur.

Il n'y a rien à configurer sur le serveur de destination, et rien à modifier après
déploiement.

### Pourquoi la variable se définit dans GitHub, et non sur le serveur

Vite **inline** la valeur de chaque `VITE_*` dans le bundle au moment du `npm run build`.
Ce n'est pas une lecture de variable différée : c'est une substitution de texte, faite une
fois pour toutes. Il ne reste **aucune variable** dans le code livré, seulement une chaîne
en dur. La distinction qui compte n'est donc pas « dev vs prod » mais **machine qui builde
vs machine qui sert** :

| | Rôle vis-à-vis de `VITE_WP_URL` |
|---|---|
| **Machine qui builde** — le runner GitHub Actions | La lit pendant `npm run build` et la grave dans le `.js`. **C'est le seul endroit où elle compte.** |
| **Machine qui sert** — Apache chez Infomaniak | N'envoie que des octets. Aucun process Node n'y tourne, rien n'y lit d'environnement. |

> **ATTENTION** : définir `VITE_WP_URL` sur le serveur de destination — variable système,
> `SetEnv` Apache, fichier `.env` déposé à côté des fichiers — n'a **aucun effet**. Pas
> d'erreur, pas d'avertissement : l'application continue simplement d'appeler l'URL gravée
> au build.
>
> **Corollaire** : changer d'URL WordPress impose toujours un rebuild.

### 1. Configurer la variable dans GitHub

`Settings` → `Secrets and variables` → `Actions` → onglet **Variables** → encadré
**Repository variables** → `New repository variable`

| Nom | Valeur |
|---|---|
| `VITE_WP_URL` | l'URL du WordPress du projet, sans slash final |

Deux précisions, la page prêtant à confusion :

- Onglet **Variables** et non *Secrets* : l'URL finit en clair dans le bundle, la masquer
  n'apporterait rien et empêcherait de la relire.
- Encadré **Repository variables**, pas *Environment variables* : ces dernières ne sont
  visibles que d'un job déclarant une clé `environment:`, ce que
  [.github/workflows/ci.yml](.github/workflows/ci.yml) ne fait pas — la variable serait
  ignorée et le build échouerait sur la garde.

Si la variable est absente, la CI **échoue volontairement**. Sans cette garde,
[src/lib/wordpress.ts](src/lib/wordpress.ts) retomberait sur son placeholder
`https://votre-wordpress.com` et produirait un zip qui se déploie sans erreur visible mais
ne charge aucun contenu.

### 2. Récupérer le zip

[.github/workflows/ci.yml](.github/workflows/ci.yml) typecheck, builde et publie `dist/`
à chaque push et chaque PR sur `main`.

Onglet **Actions** du dépôt → dernier run → section *Artifacts* → **dist**.

Le téléchargement produit un `dist.zip` dont la **racine** contient directement
`index.html`, `assets/` et `.htaccess` : il se décompresse tel quel dans le web root, sans
sous-dossier à aplatir.

Le déclencheur manuel (`Run workflow`) accepte une URL WordPress ponctuelle en paramètre,
pratique pour produire un build de recette sans toucher à la variable du dépôt.

### Build manuel (alternative)

Pour produire un `dist/` sans passer par la CI :

```bash
VITE_WP_URL=https://mon-wordpress.com npm run build
```

Le préfixe sur la ligne de commande est nécessaire : `.env.local` n'est pas destiné à la
production.

### Mode maintenance

[public/.infomaniak-maintenance.html](public/.infomaniak-maintenance.html) est livrée dans le
zip comme tous les fichiers de `public/`. Elle est autonome (styles en ligne) et n'a besoin
d'aucun asset du bundle.

Le **point initial du nom est imposé par Infomaniak**, qui attend ce fichier exact dans le web
root : ne pas le renommer. Deux conséquences traitées dans [public/.htaccess](public/.htaccess) —
c'est un fichier caché, donc `include-hidden-files: true` est indispensable côté CI, et un bloc
`<Files>` rouvre explicitement son accès, beaucoup d'hébergements refusant les fichiers en point
par défaut.

La bascule se fait par un **fichier drapeau** à la racine du site, à côté d'`index.html` :

```bash
touch .maintenance    # active : tout le site renvoie la page de maintenance
```

Par FTP ou via le gestionnaire de fichiers d'Infomaniak, il suffit de créer ou supprimer un
fichier vide portant ce nom. Aucun rebuild, aucun redéploiement.

Trois points de conception à connaître :

- **Le drapeau est un fichier séparé, pas une ligne à décommenter dans le `.htaccess`.** Ce
  dernier est écrasé à chaque déploiement du zip : une bascule inscrite dedans serait perdue
  à la mise en ligne suivante. `.maintenance` ne fait pas partie du zip, donc il survit.
- **La page est renvoyée en HTTP 503, pas en 200.** Un 200 dirait aux moteurs de recherche
  que la page de maintenance *est* le contenu du site, avec un risque de désindexation. Le 503,
  accompagné d'un en-tête `Retry-After`, signale une indisponibilité temporaire.
- **Un contournement par IP est prévu**, commenté en tête du bloc dans
  [public/.htaccess](public/.htaccess) : renseignez votre IP publique pour continuer à
  consulter le site pendant que les visiteurs voient la page.

### Réécriture SPA

Le routing utilise l'History API : toute URL profonde (`/services`) doit renvoyer
`index.html`, sinon le serveur répond 404.

**Apache — rien à faire.** [public/.htaccess](public/.htaccess) est copié tel quel dans `dist/`
au build : décompressez le zip dans le web root et tout est actif. Deux prérequis côté serveur :
`mod_rewrite` actif et `AllowOverride All` sur le vhost — sans ce dernier, Apache ignore le
fichier sans le moindre message.

Au-delà de la réécriture, le fichier prend en charge cinq choses, chacune commentée sur place :

| Bloc | Rôle |
|---|---|
| `X-Robots-Tag` hors domaine canonique | Seul `physio-moleson.ch` est indexable ; les adresses de recette Infomaniak servent la même racine et resteraient sinon indexées en double. |
| `DirectoryIndex` | Tranche entre `index.html` et `index.php` quand WordPress partage la racine. Sans effet sinon. |
| Mode maintenance | Voir la section précédente. |
| `/index.html` → `/` | Évite que l'accueil soit accessible, et indexé, sous deux URL. |
| Cache et compression | Assets hashés immuables, `index.html` jamais caché, fichiers de `public/` à une heure. |

Un bloc de redirection 301 des alias vers `physio-moleson.ch` est présent mais **commenté** :
à activer après la bascule DNS et l'émission du certificat, pas avant.

> Le cas du favicon mérite un mot : **Infomaniak pose ses propres en-têtes de cache au niveau
> serveur, par extension**. Un favicon s'y retrouve figé un an alors qu'il ne porte aucun hash —
> le remplacer n'atteindrait jamais les visiteurs déjà venus. Constaté en production ; la règle
> du `.htaccess` reprend la main.

**nginx** ne lit pas les `.htaccess`, les règles doivent être posées dans la configuration du site :

```nginx
location / {
  try_files $uri $uri/ /index.html;
}

# Accueil canonique : une seule URL pour la home.
location = /index.html {
  return 301 /;
}

# Les fichiers de /assets/ portent un hash de contenu : immuables.
location /assets/ {
  add_header Cache-Control "public, max-age=31536000, immutable";
}

# Pas de hash : cache court, pour pouvoir les remplacer.
location ~ ^/(favicon\.png|apple-touch-icon\.png|robots\.txt|sitemap\.xml)$ {
  add_header Cache-Control "public, max-age=3600";
}
```

### Référencement

L'hébergement statique répond **200 à toute URL inconnue** : le serveur sert `index.html` et c'est
le routeur client qui tranche. Sans précaution, un lien périmé ou une faute de frappe s'indexe donc
comme une page valide — un « soft 404 ». Trois pièces répondent à ça :

- **Le `noindex` automatique.** `resolvePage()` dans [src/App.tsx](src/App.tsx) est la table de
  routes unique ; lorsqu'elle ne reconnaît pas la route, la page reçoit
  `<meta name="robots" content="noindex, follow">`. Une route ajoutée à cette table est donc
  automatiquement considérée comme valide, sans second endroit à tenir à jour.
- **[public/sitemap.xml](public/sitemap.xml)** — à maintenir **à la main**, rien ne le régénère.
  Il décrit les routes du front React, pas les permaliens WordPress : le front WP est fermé et ses
  URL ne correspondent à aucune route ici, donc `/wp-sitemap.xml` n'a rien à y faire.
- **[public/robots.txt](public/robots.txt)** — pointe vers le sitemap en URL absolue.

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
