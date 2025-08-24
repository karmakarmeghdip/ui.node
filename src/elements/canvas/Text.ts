import type { CanvasRenderingContext2D } from "skia-canvas";
import { Element } from "./Element";
import type { Style } from "../../types/Style";

export class Text extends Element {
    private static textElems: Text[] = [];
    private content: string;

    constructor(content: string, style: Style) {
        super(style);
        this.content = content;
        Text.textElems.push(this);
    }

    override render(ctx: CanvasRenderingContext2D, x: number, y: number) {
        super.render(ctx, x, y);
        ctx.fillStyle = this.style.color || "black";
        ctx.font = `${this.style.fontSize || 16}px ${this.style.fontFamily || "Arial"}`;

        const textX = x + this.yogaNode.getComputedLeft();
        const textY = y + this.yogaNode.getComputedTop();

        const textMetrics = ctx.measureText(this.content);

        ctx.fillText(this.content, textX, textY + (this.style.fontSize || 16));
    }

    setMeasuredDimensions(ctx: CanvasRenderingContext2D) {
        const textMetrics = ctx.measureText(this.content);
        this.yogaNode.setWidth(textMetrics.width);
        this.yogaNode.setHeight(textMetrics.lines.length * (this.style.fontSize || 16));
    }

    static getTextElements(): Text[] {
        return Text.textElems;
    }

    static calculateTextElementsDimensions(ctx: CanvasRenderingContext2D) {
        Text.textElems.forEach(textElem => {
            textElem.setMeasuredDimensions(ctx);
        });
    }

    override appendChild(child: Element): void {
        throw new Error("Text elements cannot have children.");
    }

    override removeChild(child: Element): void {
        throw new Error("Text elements cannot have children.");
    }

    override removeChildAt(index: number): void {
        throw new Error("Text elements cannot have children.");
    }
}