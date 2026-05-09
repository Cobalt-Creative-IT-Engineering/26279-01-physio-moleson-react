/**
 * Rendu du HTML provenant de WordPress.
 * Les styles `.prose-custom` sont définis dans src/index.css.
 */
export function WPContent({ html, className = "" }: { html: string; className?: string }) {
  return (
    <div
      className={`prose-custom ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
