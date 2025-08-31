import type { CanvasRenderingContext2D } from "skia-canvas";
import { Edge } from "yoga-layout";
import type { UINode } from "../elements/canvas";

/**
 * Paints the borders of a UI node.
 * It reads the computed border widths from the Yoga node and draws them individually.
 * @param ctx The 2D canvas rendering context.
 * @param x The absolute x-coordinate of the node.
 * @param y The absolute y-coordinate of the node.
 * @param element The UI node to paint the borders for.
 */
export function paintBorder(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  element: UINode,
) {
  const style = element.style.value;
  // The `border` property in style is used to set the width, but we read the computed
  // values from the Yoga node to draw them.
  if (!style.border) return;

  const width = element.yogaNode.getComputedWidth();
  const height = element.yogaNode.getComputedHeight();
  ctx.strokeStyle = style.borderColor ?? "black";

  const leftBorder = element.yogaNode.getComputedBorder(Edge.Left);
  const rightBorder = element.yogaNode.getComputedBorder(Edge.Right);
  const topBorder = element.yogaNode.getComputedBorder(Edge.Top);
  const bottomBorder = element.yogaNode.getComputedBorder(Edge.Bottom);

  if (leftBorder > 0) {
    ctx.lineWidth = leftBorder;
    ctx.beginPath();
    ctx.moveTo(x + leftBorder / 2, y);
    ctx.lineTo(x + leftBorder / 2, y + height);
    ctx.stroke();
  }
  if (rightBorder > 0) {
    ctx.lineWidth = rightBorder;
    ctx.beginPath();
    ctx.moveTo(x + width - rightBorder / 2, y);
    ctx.lineTo(x + width - rightBorder / 2, y + height);
    ctx.stroke();
  }
  if (topBorder > 0) {
    ctx.lineWidth = topBorder;
    ctx.beginPath();
    ctx.moveTo(x, y + topBorder / 2);
    ctx.lineTo(x + width, y + topBorder / 2);
    ctx.stroke();
  }
  if (bottomBorder > 0) {
    ctx.lineWidth = bottomBorder;
    ctx.beginPath();
    ctx.moveTo(x, y + height - bottomBorder / 2);
    ctx.lineTo(x + width, y + height - bottomBorder / 2);
    ctx.stroke();
  }
}
