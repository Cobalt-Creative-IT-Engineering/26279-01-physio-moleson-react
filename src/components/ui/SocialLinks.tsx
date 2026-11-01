import { SOCIAL_LINKS } from "../../config/site";

type Network = keyof typeof SOCIAL_LINKS;

const LABELS: Record<Network, string> = {
  instagram: "Instagram",
  facebook:  "Facebook",
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
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden>
      <path d="M3.5 20.5l1.3-4.2A8.5 8.5 0 1 1 8 19.3z" />
      <path d="M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.6-2-1-1 .8c-1.2-.5-2.2-1.5-2.7-2.7l.8-1-1-2z" fill="currentColor" stroke="none" />
    </svg>
  );
}

/**
 * Pastilles rondes des réseaux sociaux. Un réseau sans URL n'est pas affiché.
 * `overrides` : liens venant de WordPress (options globales), prioritaires.
 * `variant` : « sable » sur fond clair, « contour » sur aplat vert.
 */
export function SocialLinks({
  overrides = {},
  variant = "sable",
}: {
  overrides?: Partial<Record<Network, string | undefined>>;
  variant?: "sable" | "contour";
}) {
  const links = (Object.keys(SOCIAL_LINKS) as Network[])
    .map((name) => [name, overrides[name] || SOCIAL_LINKS[name]] as const)
    .filter(([, url]) => !!url);

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
