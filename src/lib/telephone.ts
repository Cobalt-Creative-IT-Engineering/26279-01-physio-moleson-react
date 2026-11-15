/** « 026 303 93 43 » → « +41263039343 » pour un lien tel: (numéros suisses). */
export function lienTel(numero: string): string {
  const chiffres = numero.replace(/[^\d+]/g, "");
  if (chiffres.startsWith("+")) return chiffres;
  if (chiffres.startsWith("00")) return `+${chiffres.slice(2)}`;
  if (chiffres.startsWith("0")) return `+41${chiffres.slice(1)}`;
  return chiffres;
}
