import logoSrc from "../../assets/logo/logo_base.webp";

type Props = {
  size?: number;
  className?: string;
};

export function Logo({ size = 36, className }: Props) {
  return (
    <img
      src={logoSrc}
      alt="Physio du Moléson"
      width={size}
      height={size}
      className={className}
      style={{ display: "block", objectFit: "contain" }}
    />
  );
}
