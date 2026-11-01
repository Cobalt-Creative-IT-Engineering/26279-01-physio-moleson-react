import logoSrc from "../../assets/logo/logo-moleson-complet.avif";

type Props = {
  size?: number;
  className?: string;
  /** « light » : version blanche, pour les aplats vert Moléson. */
  variant?: "dark" | "light";
};

/**
 * Logo complet (symbole + nom, bloc indissociable). Fichier raster fourni
 * avec la charte, en noir uniquement : la version blanche est obtenue par
 * inversion, fondue dans l'aplat (classe .logo-inverse). Le SVG reste à
 * obtenir du client.
 */
export function Logo({ size = 140, className = "", variant = "dark" }: Props) {
  return (
    <img
      src={logoSrc}
      alt="Physio du Moléson"
      width={size}
      height={size}
      className={`block object-contain ${variant === "light" ? "logo-inverse" : ""} ${className}`}
    />
  );
}
