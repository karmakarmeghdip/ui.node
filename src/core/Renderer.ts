import type { CanvasRenderingContext2D } from "skia-canvas";

type DrawCommand = (ctx: CanvasRenderingContext2D) => void;

export const drawQueue: DrawCommand[] = [];

export function enqueueDrawCommand(command: DrawCommand) {
    console.log("Enqueuing draw command number", drawQueue.length + 1);
    drawQueue.push(command);
}

// Must be called in onDraw handler
export function processDrawQueue(ctx: CanvasRenderingContext2D) {
    while (drawQueue.length > 0) {
        const command = drawQueue.shift();
        if (command) {
            console.log("Processing draw command");
            command(ctx);
        }
    }
}