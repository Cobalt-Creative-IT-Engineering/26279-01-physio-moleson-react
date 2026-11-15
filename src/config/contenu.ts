import type { FaqItem, FaqTheme, ScheduleDay } from "../types/wordpress";
export type { FaqTheme };

/**
 * Contenus de la maquette (doc/maquette/, constantes PLANNING, SERVICES,
 * VALUES, TEAM, LANGS, BIOS, FAQ).
 *
 * Ils servent de REPLI : chaque page lit d'abord WordPress et n'affiche ces
 * valeurs que si le champ correspondant est vide ou indisponible. Les textes
 * marqués « à valider » dans le handoff le sont toujours : valeurs, planning
 * du n°68, bios et langues de quatre thérapeutes.
 */

// ─── Accueil ──────────────────────────────────────────────────────────────
// Tout vient d'ACF (page d'options « Accueil ») : aucun repli ici.

// ─── Cabinet ──────────────────────────────────────────────────────────────

export const INTRO_CABINET =
  "Situé au centre de Bulle à la rue Saint-Denis, votre cabinet est divisé en deux parties distinctes. Toutes deux possèdent des salles de traitement, une salle d'attente ainsi qu'un fitness médical / salle d'exercice.";

/** Planning hebdomadaire par cabinet (celui du n°68 est un exemple). */
export const PLANNING: Record<66 | 68, ScheduleDay[]> = {
  66: [
    { day: "Lundi",    names: ["Mégane", "Andrzej"] },
    { day: "Mardi",    names: ["Mégane", "Noa", "Maëlle", "Andrzej"] },
    { day: "Mercredi", names: ["Mégane", "Noa", "Maëlle", "Andrzej"] },
    { day: "Jeudi",    names: ["Noa", "Andrzej"] },
    { day: "Vendredi", names: ["Andrzej", "Lauriane"] },
  ],
  68: [
    { day: "Lundi",    names: ["Lauriane", "Maëlle"] },
    { day: "Mardi",    names: ["Lauriane"] },
    { day: "Mercredi", names: ["Lauriane"] },
    { day: "Jeudi",    names: ["Mégane", "Maëlle", "Lauriane"] },
    { day: "Vendredi", names: ["Mégane", "Noa", "Maëlle"] },
  ],
};

// ─── Prestations ──────────────────────────────────────────────────────────

export type PrestationIconName = "dumbbell" | "run" | "pregnant" | "house";

export const INTRO_PRESTATIONS =
  "De la rééducation après une blessure à l'entraînement de l'équilibre, chaque prise en charge est adaptée à vos objectifs.";

export const PRESTATIONS: { titre: string; texte: string; icone: PrestationIconName }[] = [
  { titre: "Physiothérapie générale",   icone: "dumbbell", texte: "Douleurs de dos, de nuque ou d'articulations, rééducation après une opération ou un accident : bilan, traitement manuel et exercices adaptés." },
  { titre: "Physiothérapie du sport",   icone: "run",      texte: "Prise en charge des blessures sportives, réathlétisation et retour progressif à l'entraînement et à la compétition." },
  { titre: "Santé de la femme",         icone: "pregnant", texte: "Rééducation périnéale, accompagnement pendant la grossesse et après l'accouchement." },
  { titre: "Physiothérapie à domicile", icone: "house",    texte: "Pour les personnes qui ne peuvent pas se déplacer, sur prescription médicale." },
];

export const SENSOPRO = {
  titre:  "Sensopro Luna",
  texte:  "Un appareil d'entraînement de la coordination et de l'équilibre. Suspendu dans un système de cordes, le corps travaille en continu pour se stabiliser : la musculature profonde, la proprioception et la posture sont sollicitées en même temps.",
  points: [
    "Rééducation après une blessure ou une opération",
    "Prévention des chutes et travail de l'équilibre",
    "Préparation et performance sportive",
  ],
  premiereSeance: "La première séance se fait avec un·e thérapeute.",
} as const;

// ─── Équipe ───────────────────────────────────────────────────────────────

export const INTRO_EQUIPE = {
  accroche: "Cinq physiothérapeutes diplômé·e·s à votre écoute, au pied du Moléson.",
  // À valider : les spécialités ne figurent plus que dans le portrait, plus
  // sur la carte (remarque du handoff).
  texte:    "Chacun et chacune prend en charge l'ensemble des services de base. Les certifications complémentaires sont indiquées sur chaque carte.",
} as const;

export const EQUIPE: { nom: string; depuis: number; specialites: string[] }[] = [
  { nom: "Andrzej Wesolowski", depuis: 2025, specialites: [] },
  { nom: "Noa Martelli",       depuis: 2024, specialites: ["Dry needling", "Crochets & Ventouses"] },
  { nom: "Maëlle Nève",        depuis: 2016, specialites: ["Ostéopathie", "Rééducation posturale", "Crochets", "Nutrithérapie"] },
  { nom: "Lauriane Robert",    depuis: 2019, specialites: ["Rééducation du périnée", "Méthode Busquet", "Thérapie manuelle", "Taping"] },
  { nom: "Mégane Pharisa",     depuis: 2021, specialites: ["Clinique du coureur", "Swiss Shoulder Clinic - Epaule au top"] },
];

/** Langues par prénom ; « Français » par défaut. */
export const LANGUES: Record<string, string[]> = {
  Andrzej: ["Français", "Espagnol", "Polonais"],
};
export const LANGUE_PAR_DEFAUT = ["Français"];

/** Bios par prénom, en paragraphes (seule celle d'Andrzej est rédigée). */
export const BIOS: Record<string, string[]> = {
  Andrzej: [
    "Fort d'une solide expérience tant en milieu clinique que sportif, je m'efforce toujours d'apporter rigueur, chaleur humaine et sens de l'humour à tous mes traitements.",
    "En raison de mon intérêt pour la physiothérapie neurologique et sportive, ma formation a toujours été liée à la compréhension de l'origine de la blessure et du contexte de la personne qui en souffre. Je suis titulaire d'un master en physiothérapie sportive et en réadaptation à l'activité physique obtenu à Barcelone, ainsi que d'un master en physiologie du corps humain. En combinant ces connaissances avec de nombreux autres outils tels que le dry needling, la thérapie manuelle et l'exercice thérapeutique, je m'efforce de créer un environnement à la fois efficace et bienveillant, propice à un rétablissement rapide.",
    "Je me réjouis de faire votre connaissance et de travailler avec vous.",
    "NB : je parle aussi espagnol et polonais.",
  ],
};
export const BIO_A_COMPLETER = "Portrait à compléter.";

// ─── FAQ ──────────────────────────────────────────────────────────────────
// Affichée tant que la page d'options ACF « FAQ » n'existe pas côté WordPress
// (ou ne contient aucune question). Réponses en HTML, comme celles de WP.


const q = (question: string, answer: string): FaqItem => ({ question, answer: `<p>${answer}</p>` });

export const FAQ_THEMES: FaqTheme[] = [
  { title: "Avant la première séance", items: [
    q("Ai-je besoin d'une ordonnance médicale ?", "Pour que la séance soit remboursée par l'assurance, une prescription de votre médecin est nécessaire. Sans ordonnance, la séance est à votre charge."),
    q("Que dois-je apporter ?", "Votre ordonnance, votre carte d'assurance, et une tenue dans laquelle vous êtes à l'aise pour bouger. Si vous avez des imageries ou des rapports médicaux, apportez-les aussi."),
    q("Combien de temps dure une séance ?", "Une séance dure en général 30 minutes. La première peut être un peu plus longue pour faire le bilan."),
  ]},
  { title: "Remboursement", items: [
    q("La physiothérapie est-elle remboursée ?", "Oui, sur prescription médicale, par l'assurance maladie de base (LAMal) ou par l'assurance accident (LAA) en cas d'accident."),
    q("Combien de séances couvre une ordonnance ?", "Une ordonnance couvre généralement jusqu'à 9 séances. Votre médecin peut la renouveler si nécessaire."),
  ]},
  { title: "Rendez-vous", items: [
    q("Comment prendre rendez-vous ?", "En ligne via Tbooking, à toute heure, ou par téléphone au 026 303 93 43 pendant les horaires du secrétariat."),
    q("Comment annuler ou déplacer un rendez-vous ?", "Prévenez-nous le plus tôt possible, idéalement 24 heures à l'avance, par téléphone ou via Tbooking."),
  ]},
  { title: "Sensopro", items: [
    q("Qu'est-ce que Sensopro Luna ?", "Un appareil d'entraînement de la coordination et de l'équilibre, utilisé en rééducation et en prévention."),
    q("Puis-je venir directement sur Sensopro ?", "La première séance se fait avec un·e thérapeute, qui vous montre l'appareil et adapte les exercices."),
  ]},
  { title: "Domicile", items: [
    q("Proposez-vous des séances à domicile ?", "Oui, lorsque votre état de santé ne vous permet pas de vous déplacer. L'ordonnance doit mentionner le traitement à domicile."),
  ]},
];
