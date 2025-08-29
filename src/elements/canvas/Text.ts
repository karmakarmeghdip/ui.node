import { type Style } from "../../style/Style";
import { Element, type BaseElement } from "./Element";

/**
 * Represents a Text element in the UI tree.
 */
export type Text = BaseElement & {
  /** The type discriminator for this node. */
  type: "text";
  /** The string content of the text node. */
  content: string;
};

/**
 * Factory function to create a new Text node.
 * @param content The string content of the text.
 * @param style The style properties for the text element.
 * @returns A new Text node.
 */
export function Text(content: string, style: Style): Text {
  const text: Text = {
    ...Element(style),
    type: "text",
    content,
  };
  return text;
}

// TODO: Implement text measurement and painting
// export function paintText(text: Text) {
//     const x = (text.position?.x ?? 0);
//     const y = (text.position?.y ?? 0);
//     enqueueDrawCommand((ctx) => {
//         // ...
//     });
// }

// export function calculateTextElementsDimensions(text: Text) {
//     // ...
// }
