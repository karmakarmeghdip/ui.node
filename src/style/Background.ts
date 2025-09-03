import type { CanvasRenderingContext2D } from "skia-canvas";
import type { UINode } from "../elements/canvas";

/**
 * Paints the background color of a UI node.
 * @param ctx The 2D canvas rendering context.
 * @param x The absolute x-coordinate of the node.
 * @param y The absolute y-coordinate of the node.
 * @param element The UI node to paint the background for.
 */
export function paintBackground(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  element: UINode,
) {
  const style = element.style.value;
  if (!style.backgroundColor) return;
  const width = element.yogaNode.getComputedWidth();
  const height = element.yogaNode.getComputedHeight();
  ctx.fillStyle = style.backgroundColor;
  if (style.borderRadius) {
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, style.borderRadius);
    ctx.closePath();
    ctx.fill();
    return;
  }
  ctx.fillRect(x, y, width, height);
}
