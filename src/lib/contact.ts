import { CONTACT_FORM_ID } from "../config/site";

/**
 * Envoi du formulaire de contact à Contact Form 7, par son API REST :
 * POST /wp-json/contact-form-7/v1/contact-forms/{id}/feedback (multipart).
 * WordPress partage l'origine du site : pas de CORS. Le jeton Turnstile part
 * dans `_wpcf7_turnstile_response`, le champ que lit l'intégration Turnstile
 * native de CF7 (Contact → Intégration), qui le vérifie auprès de Cloudflare.
 */

export type EnvoiResultat =
  | { ok: true; message: string }
  | { ok: false; message: string; champs: Record<string, string> };

type ReponseCF7 = {
  status?: string; // mail_sent | validation_failed | mail_failed | spam | aborted
  message?: string;
  invalid_fields?: { field: string; message: string }[];
};

export const formulaireBranche = () => CONTACT_FORM_ID !== "";

export async function envoyerContact(donnees: FormData, jeton: string): Promise<EnvoiResultat> {
  if (!formulaireBranche()) {
    return { ok: false, message: "Le formulaire n'est pas encore disponible. Contactez-nous par téléphone ou par e-mail.", champs: {} };
  }
  // CF7 (5.8+) exige l'identifiant d'instance du formulaire.
  donnees.set("_wpcf7_unit_tag", `wpcf7-f${CONTACT_FORM_ID}-o1`);
  donnees.set("_wpcf7_turnstile_response", jeton);

  try {
    const r = await fetch(`/wp-json/contact-form-7/v1/contact-forms/${CONTACT_FORM_ID}/feedback`, {
      method: "POST",
      body: donnees,
    });
    const d = (await r.json()) as ReponseCF7;
    if (d.status === "mail_sent") return { ok: true, message: d.message ?? "" };
    const champs: Record<string, string> = {};
    for (const f of d.invalid_fields ?? []) champs[f.field] = f.message;
    const message =
      d.status === "spam"
        ? "La vérification anti-spam a échoué. Rechargez la page et réessayez."
        : d.status === "validation_failed"
          ? "Certains champs sont incomplets ou invalides."
          : "Le message n'a pas pu être envoyé. Réessayez plus tard, ou contactez-nous par téléphone.";
    return { ok: false, message, champs };
  } catch {
    return { ok: false, message: "Le message n'a pas pu être envoyé. Vérifiez votre connexion et réessayez.", champs: {} };
  }
}
