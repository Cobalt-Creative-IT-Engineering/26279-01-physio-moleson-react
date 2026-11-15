import { SOCIAL_LINKS } from "../../config/site";
import type { SocialLinks as SocialLinksData } from "../../types/wordpress";

type Network = keyof typeof SOCIAL_LINKS;

const LABELS: Record<Network, string> = {
  instagram: "Instagram",
  facebook:  "Facebook",
  linkedin:  "LinkedIn",
  whatsapp:  "WhatsApp",
};

function Glyph({ name }: { name: Network }) {
  if (name === "instagram") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  if (name === "facebook") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M14 8h3V4h-3c-2.8 0-4.5 1.8-4.5 4.6V11H7v4h2.5v7h4v-7H16l.6-4h-3.1V8.9c0-.6.3-.9.5-.9z" />
      </svg>
    );
  }
  if (name === "linkedin") {
    return (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.5h4V21H3zM9.5 9.5h3.8v1.6h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.1c0-1.22-.02-2.78-1.7-2.78-1.7 0-1.96 1.33-1.96 2.7V21h-4z" />
      </svg>
    );
  }
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden>
      <path d="M3.5 20.5l1.3-4.2A8.5 8.5 0 1 1 8 19.3z" />
      <path d="M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.6-2-1-1 .8c-1.2-.5-2.2-1.5-2.7-2.7l.8-1-1-2z" fill="currentColor" stroke="none" />
    </svg>
  );
}

/**
 * Pastilles rondes des réseaux sociaux. Un réseau sans URL n'est pas affiché.
 * `links` : liens des options globales WordPress. Dès qu'ils sont chargés,
 * ils font foi (champ vide = réseau masqué) ; SOCIAL_LINKS ne sert que tant
 * que WordPress n'a pas répondu.
 * `variant` : « sable » sur fond clair, « contour » sur aplat vert.
 */
export function SocialLinks({
  links: wp,
  variant = "sable",
}: {
  links?: SocialLinksData;
  variant?: "sable" | "contour";
}) {
  const source: Partial<Record<Network, string>> = wp ?? SOCIAL_LINKS;
  const links = (Object.keys(SOCIAL_LINKS) as Network[])
    .map((name) => [name, source[name]] as const)
    .filter((l): l is readonly [Network, string] => !!l[1]);

  if (links.length === 0) return null;

  const cls =
    variant === "sable"
      ? "rond bg-sable text-ink hover:bg-vert hover:text-on-dark"
      : "rond border-[1.5px] border-on-dark-soft text-on-dark-soft hover:bg-sable hover:text-vert";

  return (
    <div className="flex gap-2.5">
      {links.map(([name, url]) => (
        <a key={name} href={url} target="_blank" rel="noopener noreferrer" aria-label={LABELS[name]} className={cls}>
          <Glyph name={name} />
        </a>
      ))}
    </div>
  );
}
