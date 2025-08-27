import type { CanvasRenderingContext2D } from "skia-canvas";
import type { UINode } from "../elements/canvas";

export function paintBackround(ctx: CanvasRenderingContext2D, x: number, y: number, element: UINode) {
    const style = element.style.value;
    if (!style.backgroundColor) return;
    const width = element.yogaNode.getComputedWidth();
    const height = element.yogaNode.getComputedHeight();
    ctx.fillStyle = style.backgroundColor;
    ctx.fillRect(x, y, width, height);
}