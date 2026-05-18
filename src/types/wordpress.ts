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

/** Une statistique du Hero (Hero stats repeater). */
export type HeroStat = { number: string; label: string };

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
  youtube?: string;
};

/** Options Page "Global" — données de site réutilisables partout. */
export interface GlobalOptions {
  logo:      WPImage | null;
  phone:     string;
  email:     string;
  addresses: CabinetAddress[];
  social:    SocialLinks;
}

/** Options Page "Hero" — bloc d'accueil. */
export interface HeroOptions {
  eyebrow:         string;
  titlePart1:      string;
  titleEmphasis:   string;
  titlePart2:      string;
  subtitle:        string;
  ctaPrimary:      { label: string; url: string };
  ctaSecondary:    { label: string; url: string };
  stats:           HeroStat[];
  imageMain:       WPImage | null;
  imageSecondary:  WPImage | null;
}

/** Options Page "Sensopro". */
export interface SensoproOptions {
  eyebrow:           string;
  title:             string;
  intro:             string; // HTML wysiwyg
  image:             WPImage | null;
  benefits:          SensoproItem[];
  steps:             SensoproItem[];
  firstSessionTitle: string;
  firstSessionText:  string; // HTML wysiwyg
}

/** Options Page "Cabinet" — galeries des deux cabinets. */
export interface CabinetOptions {
  eyebrow:  string;
  title:    string;
  intro:    string; // HTML wysiwyg
  tag66:    string;
  images66: WPImage[];
  tag68:    string;
  images68: WPImage[];
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
