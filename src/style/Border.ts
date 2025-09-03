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
  // const pdWidth = element.yogaNode.()
  const height = element.yogaNode.getComputedHeight();
  ctx.fillStyle = style.borderColor ?? "black";

  const radius = style.borderRadius ?? 0;

  const leftBorder = element.yogaNode.getComputedBorder(Edge.Left);
  const rightBorder = element.yogaNode.getComputedBorder(Edge.Right);
  const topBorder = element.yogaNode.getComputedBorder(Edge.Top);
  const bottomBorder = element.yogaNode.getComputedBorder(Edge.Bottom);

  // Check if any border exists
  if (leftBorder <= 0 && rightBorder <= 0 && topBorder <= 0 && bottomBorder <= 0) {
    return;
  }

  // Normalize radius to array format [topLeft, topRight, bottomRight, bottomLeft]
  const normalizeRadius = (r: number | number[]): number[] => {
    if (typeof r === 'number') {
      return [r, r, r, r];
    }
    if (r.length === 1) return [r[0] || 0, r[0] || 0, r[0] || 0, r[0] || 0];
    if (r.length === 2) return [r[0] || 0, r[1] || 0, r[0] || 0, r[1] || 0];
    if (r.length === 3) return [r[0] || 0, r[1] || 0, r[2] || 0, r[1] || 0];
    return r.slice(0, 4);
  };

  const outerRadius = normalizeRadius(radius);

  // Calculate inner radius by subtracting border widths
  const innerRadius = [
    Math.max(0, outerRadius[0] || 0 - Math.max(leftBorder, topBorder)),
    Math.max(0, outerRadius[1] || 0 - Math.max(rightBorder, topBorder)),
    Math.max(0, outerRadius[2] || 0 - Math.max(rightBorder, bottomBorder)),
    Math.max(0, outerRadius[3] || 0 - Math.max(leftBorder, bottomBorder))
  ];

  // Draw border using path subtraction
  ctx.beginPath();
  // Outer rectangle
  ctx.roundRect(x, y, width, height, outerRadius);
  // Inner rectangle (subtract)
  ctx.roundRect(
    x + leftBorder,
    y + topBorder,
    width - leftBorder - rightBorder,
    height - topBorder - bottomBorder,
    innerRadius
  );
  ctx.fill('evenodd');
  ctx.closePath();
}
