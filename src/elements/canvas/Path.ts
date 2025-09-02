import { Element, type BaseElement } from "./Element";
import { type Style } from "../../style/Style";

export type Path = BaseElement & {
  /** The type discriminator for this node. */
  type: "path";
  /** The SVG path data string. */
  d: string;
};

/**
 * Factory function to create a new Path element node.
 * Paths are UI elements used for drawing vector graphics using SVG path data strings.
 * @param d The SVG path data string.
 * @param style The style properties for the path element.
 * @returns A new Path node.
 */
export function Path(d: string, style: Style): Path {
  const path: Path = {
    ...Element(style),
    type: "path",
    d,
  };
  return path;
}
