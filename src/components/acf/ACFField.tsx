/**
 * ACFField — rendu automatique d'une valeur ACF selon son type.
 * Supporte : image, post lié, tableau, HTML, URL, booléen, groupe, texte.
 */

function isACFImage(v: unknown): v is { url: string; alt: string; width: number; height: number } {
  return typeof v === "object" && v !== null && "url" in v && "alt" in v;
}

function isACFPost(v: unknown): v is { ID: number; post_title: string; permalink: string } {
  return typeof v === "object" && v !== null && "ID" in v && "post_title" in v;
}

export function ACFField({ value }: { value: unknown }) {
  if (value === null || value === undefined || value === "") return null;

  if (isACFImage(value)) {
    return (
      <img
        src={value.url}
        alt={value.alt}
        width={value.width}
        height={value.height}
        className="rounded-lg w-full object-cover"
      />
    );
  }

  if (isACFPost(value)) {
    return (
      <a href={value.permalink} className="text-accent underline underline-offset-2">
        {value.post_title}
      </a>
    );
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return null;
    if (typeof value[0] === "string" || typeof value[0] === "number") {
      return (
        <ul className="flex flex-wrap gap-2">
          {value.map((item, i) => (
            <li key={i} className="px-2 py-0.5 bg-surface-2 rounded text-sm">
              {String(item)}
            </li>
          ))}
        </ul>
      );
    }
    // Repeater ACF : tableau d'objets
    return (
      <div className="space-y-3">
        {value.map((row, i) => (
          <ACFGroup key={i} fields={row as Record<string, unknown>} showLabels />
        ))}
      </div>
    );
  }

  if (typeof value === "string" && /<[a-z][\s\S]*>/i.test(value)) {
    return (
      <div
        className="prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: value }}
      />
    );
  }

  if (typeof value === "string" && value.startsWith("http")) {
    return (
      <a href={value} target="_blank" rel="noreferrer" className="text-accent break-all">
        {value}
      </a>
    );
  }

  if (typeof value === "boolean") {
    return (
      <span
        className={`px-2 py-0.5 rounded text-xs font-medium ${
          value ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
        }`}
      >
        {value ? "Oui" : "Non"}
      </span>
    );
  }

  // Groupe ACF (objet imbriqué)
  if (typeof value === "object") {
    return <ACFGroup fields={value as Record<string, unknown>} showLabels />;
  }

  return <span className="text-text-secondary">{String(value)}</span>;
}

/**
 * Rendu d'un groupe de champs ACF (objet ou repeater row).
 * Exporté pour permettre la récursivité dans ACFRenderer.
 */
export function ACFGroup({
  fields,
  className = "",
  showLabels = false,
}: {
  fields: Record<string, unknown>;
  className?: string;
  showLabels?: boolean;
}) {
  const entries = Object.entries(fields).filter(([, v]) => v !== null && v !== undefined && v !== "");
  if (entries.length === 0) return null;

  return (
    <div className={`acf-renderer space-y-4 ${className}`}>
      {entries.map(([key, value]) => (
        <div key={key} className="acf-field">
          {showLabels && (
            <p className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-1">
              {key.replace(/_/g, " ")}
            </p>
          )}
          <ACFField value={value} />
        </div>
      ))}
    </div>
  );
}
