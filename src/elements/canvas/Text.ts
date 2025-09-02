import type { CanvasRenderingContext2D } from "skia-canvas";
import { type Style } from "../../style/Style";
import { Element, paintElement, type BaseElement } from "./Element";
import { enqueueDrawCommand } from "../../core/Renderer";
import { paintBackground } from "../../style/Background";
import { paintBorder } from "../../style/Border";

export type Text = BaseElement & {
    /** The type discriminator for this node. */
    type: "text";
    /** The string content of the text node. */
    content: string;
};

/**
 * Factory function to create a new Text element node.
 * Text elements are UI nodes that display textual content with customizable styling.
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

export function paintText(text: Text) {
    const x = (text.position?.x || 0);
    const y = (text.position?.y || 0);
    enqueueDrawCommand((ctx) => {
        ctx.font = (text.style.value.fontSize || 16) + "px " + (text.style.value.fontFamily || "Arial");
        ctx.fillStyle = text.style.value.color || "black";
        ctx.fillText(text.content, x, y + (text.style.value.fontSize || 16)); // Adjust y to account for font size
        paintBackground(ctx, x, y, text);
        paintBorder(ctx, x, y, text);
    });
}

export function calculateTextElementsDimensions(text: Text, ctx: CanvasRenderingContext2D) {
    ctx.font = `${text.style.value.fontSize || 16}px ${text.style.value.fontFamily || "Arial"}`;
    const metrics = ctx.measureText(text.content);
    console.log(`Measured text "${text.content}" width: ${metrics.width}`);
    text.style.value.width = metrics.width;
    text.style.value.height = text.style.value.fontSize || 16; // TODO: More accurate height calculation and handling multi-line text
}
