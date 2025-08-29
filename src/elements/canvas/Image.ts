import { type Style } from "../../style/Style";
import { Element, type BaseElement } from "./Element";

/**
 * Represents an Image element in the UI tree.
 */
export type Image = BaseElement & {
  /** The type discriminator for this node. */
  type: "image";
  /** The source URL or file path for the image. */
  src: string;
};

/**
 * Factory function to create a new Image node.
 * @param src The source URL or file path for the image.
 * @param style The style properties for the image element.
 * @returns A new Image node.
 */
export function Image(src: string, style: Style): Image {
  const image: Image = {
    ...Element(style),
    type: "image",
    src,
  };
  return image;
}
