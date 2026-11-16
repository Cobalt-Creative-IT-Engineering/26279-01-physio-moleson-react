import { useMemo } from "react";

/**
 * Nettoie le HTML d'un éditeur WYSIWYG WordPress avant affichage.
 *
 * Les rédacteurs collent parfois du HTML copié depuis le site lui-même : il
 * arrive avec ses classes Tailwind (`flex`, `max-w-[480px]`…) que le CSS du
 * site applique aussitôt (listes sans puces, largeurs figées). On ne garde
 * donc que la structure : les attributs `class`, `style`, `id` et les
 * gestionnaires `on*` sont retirés, ainsi que les balises exécutables. Les
 * liens `javascript:` sont neutralisés.
 */
const BALISES_RETIREES = "script, style, iframe, object, embed, form, input, button, link, meta";
const ATTRIBUTS_RETIRES = /^(class|style|id|on.+)$/i;

function nettoyer(html: string): string {
  if (!html || typeof DOMParser === "undefined") return html;
  const doc = new DOMParser().parseFromString(html, "text/html");
  doc.body.querySelectorAll(BALISES_RETIREES).forEach((el) => el.remove());
  doc.body.querySelectorAll("*").forEach((el) => {
    for (const attr of [...el.attributes]) {
      if (ATTRIBUTS_RETIRES.test(attr.name)) el.removeAttribute(attr.name);
    }
    const href = el.getAttribute("href");
    if (href && /^\s*javascript:/i.test(href)) el.removeAttribute("href");
  });
  return doc.body.innerHTML;
}

/**
 * Rendu du HTML provenant de WordPress, nettoyé (voir `nettoyer`).
 * Les styles `.prose-custom` sont définis dans src/index.css.
 */
export function WPContent({ html, className = "" }: { html: string; className?: string }) {
  const propre = useMemo(() => nettoyer(html), [html]);
  return (
    <div
      className={`prose-custom ${className}`}
      dangerouslySetInnerHTML={{ __html: propre }}
    />
  );
}
