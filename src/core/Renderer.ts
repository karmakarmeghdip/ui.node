import type { CanvasRenderingContext2D } from "skia-canvas";

type DrawCommand = (ctx: CanvasRenderingContext2D) => void;

export const drawQueue: DrawCommand[] = [];

export function enqueueDrawCommand(command: DrawCommand) {
    drawQueue.push(command);
}

// Must be called in onDraw handler
export function processDrawQueue(ctx: CanvasRenderingContext2D) {
    while (drawQueue.length > 0) {
        const command = drawQueue.shift();
        if (command) {
            command(ctx);
        }
    }
}