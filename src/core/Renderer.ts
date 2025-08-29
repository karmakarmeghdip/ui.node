import type { CanvasRenderingContext2D } from "skia-canvas";

/**
 * Represents a function that executes a drawing operation on a canvas context.
 * @param ctx The 2D canvas rendering context.
 */
type DrawCommand = (ctx: CanvasRenderingContext2D) => void;

/**
 * A queue that holds all the drawing commands for the current frame.
 * This operates as the "producer" side of the rendering pipeline.
 */
export const drawQueue: DrawCommand[] = [];

/**
 * Adds a draw command to the end of the draw queue.
 * This is called by paint functions to build up the frame.
 * @param command The draw command function to enqueue.
 */
export function enqueueDrawCommand(command: DrawCommand) {
  drawQueue.push(command);
}

/**
 * Processes all draw commands in the queue in a FIFO manner.
 * This should be called by the rendering loop (e.g., window's `frame` event) for every frame.
 * It acts as the "consumer" in the rendering pipeline.
 * @param ctx The 2D canvas rendering context to execute the commands on.
 */
export function processDrawQueue(ctx: CanvasRenderingContext2D) {
  while (drawQueue.length > 0) {
    const command = drawQueue.shift();
    if (command) {
      command(ctx);
    }
  }
}
