/**
 * Dispatcher des décorations selon le thème actif.
 *
 * ACTIVE_THEME étant un type littéral au moment du build,
 * Rollup élimine les branches inactives et n'inclut dans le bundle
 * final que les décors du thème déployé.
 */
import { ACTIVE_THEME } from "../config/site";
import { Decorations as DecoBase } from "./base/Decorations";

export function Decorations() {
  if (ACTIVE_THEME === "base") return <DecoBase />;
  return null;
}
