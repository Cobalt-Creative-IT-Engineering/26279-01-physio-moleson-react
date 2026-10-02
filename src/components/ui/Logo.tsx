import logoDark from "../../assets/logo/logo-dark.png";
import logoLight from "../../assets/logo/logo-white.png";
import logoFull from "../../assets/logo/logo-moleson-complet.avif";

type Props = {
  size?: number;
  className?: string;
  /** « light » : version en réserve claire, pour les aplats vert Moléson. */
  variant?: "dark" | "light";
  /**
   * Logo complet (symbole + nom, bloc indissociable) plutôt que le symbole
   * seul. La charte impose 60 px de large au minimum ; en dessous, symbole
   * seul. Fichier raster fourni avec la charte — le SVG reste à obtenir du
   * client.
   */
  full?: boolean;
};

export function Logo({ size = 36, className, variant = "dark", full = false }: Props) {
  const light = variant === "light";
  const src = full ? logoFull : light ? logoLight : logoDark;
  return (
    <img
      src={src}
      alt="Physio du Moléson"
      width={size}
      height={size}
      className={className}
      style={{
        display: "block",
        objectFit: "contain",
        // Le logo complet n'existe qu'en noir : la réserve claire est obtenue
        // par inversion, le tracé restant d'une seule couleur.
        filter: full && light ? "invert(1)" : undefined,
      }}
    />
  );
}
