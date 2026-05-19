import phone from "../../assets/icon/phone.svg";
import email from "../../assets/icon/email.svg";
import mapPin from "../../assets/icon/map-pin.svg";
import instagram from "../../assets/icon/instagram.svg";
import facebook from "../../assets/icon/facebook.svg";

const SRC = {
  phone,
  email,
  "map-pin": mapPin,
  instagram,
  facebook,
} as const;

export type IconName = keyof typeof SRC;

/**
 * Icône monochrome basée sur les SVG de src/assets/icon.
 * Rendue via masque CSS → hérite de la couleur du texte (`currentColor`),
 * donc colorable avec les classes texte Tailwind (text-ink-soft, etc.).
 */
export function Icon({
  name,
  size = 16,
  className = "",
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  const url = SRC[name];
  return (
    <span
      aria-hidden
      className={`inline-block shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: "currentColor",
        maskImage: `url(${url})`,
        WebkitMaskImage: `url(${url})`,
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskPosition: "center",
        WebkitMaskPosition: "center",
      }}
    />
  );
}
