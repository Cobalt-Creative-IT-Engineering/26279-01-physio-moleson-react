import type { FaqItem } from "../types/wordpress";

/**
 * Questions d'EXEMPLE, affichées tant que la page d'options ACF « FAQ » n'existe
 * pas côté WordPress (ou ne contient aucune question). Dès qu'elle répond, ce
 * contenu n'est plus utilisé.
 *
 * Les réponses reprennent les informations déjà présentes sur le site
 * (téléphone, adresses, réservation tbooking, Sensopro). Celles marquées
 * « à valider » sont génériques : à faire relire par le cabinet avant la mise
 * en ligne, ou à remplacer par le vrai contenu saisi dans WordPress.
 */
export const FAQ_EXEMPLE: FaqItem[] = [
  {
    question: "Comment prendre rendez-vous ?",
    answer:
      "<p>Vous pouvez réserver en ligne, 24h/24, directement dans l'agenda de la ou du thérapeute de votre choix depuis la section <a href=\"/#contact\">Prendre rendez-vous</a>. Vous pouvez aussi appeler notre secrétariat au 026 303 93 43.</p>",
  },
  {
    question: "Où se trouve le cabinet ?",
    answer:
      "<p>Nous avons deux cabinets à Bulle : Rue Saint-Denis 66 et Rue Saint-Denis 68, 1630 Bulle. Votre confirmation de rendez-vous indique le cabinet concerné. Le planning de chaque cabinet est visible sur la page <a href=\"/cabinet\">Cabinet</a>.</p>",
  },
  {
    question: "Quand puis-je joindre le secrétariat ?",
    answer:
      "<p>Le mercredi sans interruption, de 9h à 12h et de 13h à 17h. Les lundis, mardis, jeudis et vendredis, laissez-nous un message : nous vous rappelons entre 7h30 et 18h.</p>",
  },
  {
    question: "Comment se déroule une première séance de Sensopro ?",
    answer:
      "<p>La première séance sur le Sensopro Luna se fait toujours avec un·e thérapeute, qui adapte l'entraînement à votre niveau. Plus de détails sur la page <a href=\"/sensopro\">Sensopro</a>.</p>",
  },
  {
    question: "Ai-je besoin d'une ordonnance médicale ?",
    answer:
      "<p>(Exemple, à valider.) Pour un remboursement par l'assurance de base, la physiothérapie doit être prescrite par un médecin. Apportez votre ordonnance lors de la première séance.</p>",
  },
  {
    question: "Que dois-je apporter à ma première séance ?",
    answer:
      "<p>(Exemple, à valider.) Votre ordonnance, votre carte d'assurance et, si vous en avez, vos examens récents (radiographies, IRM, rapports). Prévoyez une tenue confortable.</p>",
  },
  {
    question: "Comment annuler ou déplacer un rendez-vous ?",
    answer:
      "<p>(Exemple, à valider.) Merci de nous prévenir au plus tôt par téléphone au 026 303 93 43, afin de libérer la place pour un autre patient.</p>",
  },
];
