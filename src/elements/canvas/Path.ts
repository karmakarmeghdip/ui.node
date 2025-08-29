import { Element, type BaseElement } from "./Element";
import { type Style } from "../../style/Style";

/**
 * Represents a Path element in the UI tree, used for drawing vector graphics.
 */
export type Path = BaseElement & {
  /** The type discriminator for this node. */
  type: "path";
  /** The SVG path data string. */
  d: string;
};

/**
 * Factory function to create a new Path node.
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
