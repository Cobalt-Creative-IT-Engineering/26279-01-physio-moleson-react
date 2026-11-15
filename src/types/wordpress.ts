// ─── WordPress Core Types ─────────────────────────────────────────────────

export interface WPImage {
  id: number;
  url: string;
  alt: string;
  width: number;
  height: number;
}

export interface WPTerm {
  id: number;
  name: string;
  slug: string;
}

export interface WPTaxonomyTerm {
  id: number;
  name: string;
  slug: string;
  taxonomy?: string;
}

export interface WPPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  modified: string;
  featuredImage: WPImage | null;
  categories: WPTerm[];
  tags: WPTerm[];
  acf: Record<string, unknown>;
}

export interface WPPage {
  id: number;
  slug: string;
  title: string;
  content: string;
  acf: Record<string, unknown>;
}

export interface WPMenuItem {
  id: number;
  title: string;
  url: string;
  order: number;
  parent: number;
  children?: WPMenuItem[];
}

// ─── API Params ────────────────────────────────────────────────────────────

export interface QueryParams {
  page?: number;
  perPage?: number;
  search?: string;
  categories?: number[];
  tags?: number[];
  slug?: string;
  orderby?: "date" | "title" | "menu_order";
  order?: "asc" | "desc";
  status?: "publish" | "draft" | "any";
  embed?: boolean;
  /** Filtrage par IDs (include=1,2,3 → /wp/v2/cpt?include=1,2,3) */
  include?: number[];
  /** Filtres par taxonomies personnalisées, ex: { categorie: 5, jour: [2,3] } */
  taxonomies?: Record<string, number | string | (number | string)[]>;
}

export interface ACFOptions {
  [key: string]: unknown;
}

// ─── Hook Types ────────────────────────────────────────────────────────────

export type FetchStatus = "idle" | "loading" | "success" | "error";

export type FetchState<T> = {
  status: FetchStatus;
  data: T | null;
  error: string | null;
  isFetching: boolean;
};

export interface UsePostsOptions extends QueryParams {
  enabled?: boolean;
}

// ─── GraphQL (WPGraphQL + ACF) ────────────────────────────────────────────
//
// Types généraux pour les réponses WPGraphQL.
// Déclarez vos propres types d'Options pages par projet.

export type GQLImage = {
  sourceUrl: string;
  altText?: string;
};

// ─── Domain Types — Physio du Moléson ─────────────────────────────────────
//
// Types métier consommés par les composants. Les hooks de useWordPress.ts
// transforment les réponses brutes ACF en ces objets typés (mappage des
// repeaters, normalisation des images, etc.).

/** Bouton d'appel à l'action. */
export type CTA = { label: string; url: string };

/** Un bénéfice ou une étape Sensopro. */
export type SensoproItem = { number: string; title: string; description: string };

/** Adresse d'un cabinet. */
export type CabinetAddress = {
  id: number;
  label: string;
  street: string;
  postcode: string;
  city: string;
};

/** Liens sociaux globaux. */
export type SocialLinks = {
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  whatsapp?: string;
};

/** Options Page "Global" — données de site réutilisables partout. */
export interface GlobalOptions {
  logo:      WPImage | null;
  resume:    string;
  phone:     string;
  email:     string;
  addresses: CabinetAddress[];
  social:    SocialLinks;
}

/** Options Page "Accueil" — bloc hero de la page d'accueil. */
export interface AccueilOptions {
  heros: {
    titre:       string;
    sousTitre:   string;
    description: string;
    cta1:        CTA;
    cta2:        CTA;
    video:       string | null;  // URL du fichier
  };
  slogan: {
    titre:       string;
    description: string;
    cta:         CTA;
  };
  imageSection1: WPImage | null;
  valeurs: {
    fond:  WPImage | null;
    items: AccueilValeur[];      // toujours 4 entrées (valeur1 → valeur4)
  };
}

/** Une valeur de l'accueil (groupe `valeurN`). */
export type AccueilValeur = { titre: string; description: string; image: WPImage | null };

/** Options Page "Sensopro". */
export interface SensoproOptions {
  title:             string;
  intro:             string; // HTML wysiwyg
  image:             WPImage | null;
  benefits:          SensoproItem[];
  steps:             SensoproItem[];
  firstSessionTitle: string;
  firstSessionText:  string; // HTML wysiwyg
}

/** Options Page "FAQ". */
export type FaqItem = { question: string; answer: string /* HTML wysiwyg */ };

/** Une catégorie de la FAQ et ses questions. */
export type FaqTheme = { title: string; items: FaqItem[] };

export interface FaqOptions {
  title:  string;
  intro:  string; // HTML wysiwyg
  themes: FaqTheme[];
}

/** Options Page "Cabinet" — galeries des deux cabinets. */
/** Une journée du planning hebdomadaire d'un cabinet. */
export type ScheduleDay = { day: string; names: string[] };

export interface CabinetOptions {
  title:      string;
  intro:      string; // HTML wysiwyg
  tag66:      string;
  images66:   WPImage[];
  schedule66: ScheduleDay[];
  tag68:      string;
  images68:   WPImage[];
  schedule68: ScheduleDay[];
}

/** Service (CPT). Le titre WordPress est le nom du service. */
export interface Service {
  id:          number;
  slug:        string;
  title:       string;
  num:         string;
  short:       string;
  description: string; // HTML wysiwyg
  tags:        string[];
  image:       WPImage | null;
}

/** Thérapeute (CPT). Le titre WordPress est le nom du/de la thérapeute. */
export interface Therapeute {
  id:           number;
  slug:         string;
  name:         string;
  role:         string;
  since:        number | null;
  certifs:      string[];
  bio:          string; // HTML wysiwyg
  bioShort:     string;
  extras:       string;
  photo:        WPImage | null;
  tbookingUrl:  string;
}
