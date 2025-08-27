import { expect, test, describe, beforeEach, afterEach, mock } from "bun:test";
import { enqueueDrawCommand, processDrawQueue, drawQueue } from "./Renderer";
import type { CanvasRenderingContext2D } from "skia-canvas";

// Mock CanvasRenderingContext2D for testing
const createMockContext = (): CanvasRenderingContext2D => {
    return {
        fillRect: mock(() => { }),
        strokeRect: mock(() => { }),
        clearRect: mock(() => { }),
        fill: mock(() => { }),
        stroke: mock(() => { }),
        beginPath: mock(() => { }),
        closePath: mock(() => { }),
        moveTo: mock(() => { }),
        lineTo: mock(() => { }),
        arc: mock(() => { }),
        rect: mock(() => { }),
        save: mock(() => { }),
        restore: mock(() => { }),
        translate: mock(() => { }),
        scale: mock(() => { }),
        rotate: mock(() => { }),
        setTransform: mock(() => { }),
        transform: mock(() => { }),
        resetTransform: mock(() => { }),
        fillStyle: "black",
        strokeStyle: "black",
        lineWidth: 1,
        lineCap: "butt",
        lineJoin: "miter",
        miterLimit: 10,
        lineDash: [],
        lineDashOffset: 0,
        shadowBlur: 0,
        shadowColor: "transparent",
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        globalAlpha: 1,
        globalCompositeOperation: "source-over",
        imageSmoothingEnabled: true,
        imageSmoothingQuality: "low",
        font: "10px sans-serif",
        textAlign: "start",
        textBaseline: "alphabetic",
        direction: "inherit",
        fillText: mock(() => { }),
        strokeText: mock(() => { }),
        measureText: mock(() => ({ width: 100 })),
        drawImage: mock(() => { }),
        createImageData: mock(() => ({})),
        getImageData: mock(() => ({})),
        putImageData: mock(() => { }),
        createLinearGradient: mock(() => ({})),
        createRadialGradient: mock(() => ({})),
        createConicGradient: mock(() => ({})),
        createPattern: mock(() => ({})),
        getLineDash: mock(() => []),
        setLineDash: mock(() => { }),
        clip: mock(() => { }),
        isPointInPath: mock(() => false),
        isPointInStroke: mock(() => false),
        canvas: {},
    } as unknown as CanvasRenderingContext2D;
};

describe("Renderer Module Tests", () => {
    let mockCtx: CanvasRenderingContext2D;

    beforeEach(() => {
        // Clear the draw queue before each test
        drawQueue.length = 0;
        mockCtx = createMockContext();
    });

    afterEach(() => {
        // Clean up after each test
        drawQueue.length = 0;
    });

    describe("drawQueue export", () => {
        test("should be an empty array initially", () => {
            expect(drawQueue).toEqual([]);
            expect(Array.isArray(drawQueue)).toBe(true);
        });

        test("should be accessible and modifiable", () => {
            expect(drawQueue.length).toBe(0);

            const testCommand = mock((ctx: CanvasRenderingContext2D) => {
                ctx.fillRect(0, 0, 10, 10);
            });

            drawQueue.push(testCommand);
            expect(drawQueue.length).toBe(1);
            expect(drawQueue[0]).toBe(testCommand);
        });
    });

    describe("enqueueDrawCommand function", () => {
        test("should add a single command to the queue", () => {
            const command = mock((ctx: CanvasRenderingContext2D) => {
                ctx.fillRect(10, 20, 30, 40);
            });

            enqueueDrawCommand(command);

            expect(drawQueue.length).toBe(1);
            expect(drawQueue[0]).toBe(command);
        });

        test("should add multiple commands in order", () => {
            const command1 = mock((ctx: CanvasRenderingContext2D) => {
                ctx.fillRect(0, 0, 10, 10);
            });
            const command2 = mock((ctx: CanvasRenderingContext2D) => {
                ctx.strokeRect(10, 10, 20, 20);
            });
            const command3 = mock((ctx: CanvasRenderingContext2D) => {
                ctx.clearRect(20, 20, 30, 30);
            });

            enqueueDrawCommand(command1);
            enqueueDrawCommand(command2);
            enqueueDrawCommand(command3);

            expect(drawQueue.length).toBe(3);
            expect(drawQueue[0]).toBe(command1);
            expect(drawQueue[1]).toBe(command2);
            expect(drawQueue[2]).toBe(command3);
        });

        test("should handle many commands", () => {
            const commands = Array.from({ length: 100 }, (_, i) =>
                mock((ctx: CanvasRenderingContext2D) => {
                    ctx.fillRect(i, i, i + 1, i + 1);
                })
            );

            commands.forEach(enqueueDrawCommand);

            expect(drawQueue.length).toBe(100);
            commands.forEach((command, index) => {
                expect(drawQueue[index]).toBe(command);
            });
        });

        test("should accept different types of draw commands", () => {
            const fillCommand = mock((ctx: CanvasRenderingContext2D) => {
                ctx.fillRect(0, 0, 10, 10);
            });

            const strokeCommand = mock((ctx: CanvasRenderingContext2D) => {
                ctx.beginPath();
                ctx.arc(50, 50, 20, 0, 2 * Math.PI);
                ctx.stroke();
            });

            const textCommand = mock((ctx: CanvasRenderingContext2D) => {
                ctx.fillText("Hello World", 100, 100);
            });

            enqueueDrawCommand(fillCommand);
            enqueueDrawCommand(strokeCommand);
            enqueueDrawCommand(textCommand);

            expect(drawQueue.length).toBe(3);
            expect(drawQueue[0]).toBe(fillCommand);
            expect(drawQueue[1]).toBe(strokeCommand);
            expect(drawQueue[2]).toBe(textCommand);
        });
    });

    describe("processDrawQueue function", () => {
        test("should process empty queue without errors", () => {
            expect(drawQueue.length).toBe(0);
            expect(() => processDrawQueue(mockCtx)).not.toThrow();
            expect(drawQueue.length).toBe(0);
        });

        test("should execute single command and clear queue", () => {
            const command = mock((ctx: CanvasRenderingContext2D) => {
                ctx.fillRect(10, 20, 30, 40);
            });

            enqueueDrawCommand(command);
            expect(drawQueue.length).toBe(1);

            processDrawQueue(mockCtx);

            expect(command).toHaveBeenCalledTimes(1);
            expect(command).toHaveBeenCalledWith(mockCtx);
            expect(drawQueue.length).toBe(0);
        });

        test("should execute multiple commands in FIFO order", () => {
            const executionOrder: number[] = [];

            const command1 = mock((ctx: CanvasRenderingContext2D) => {
                executionOrder.push(1);
                ctx.fillRect(0, 0, 10, 10);
            });
            const command2 = mock((ctx: CanvasRenderingContext2D) => {
                executionOrder.push(2);
                ctx.strokeRect(10, 10, 20, 20);
            });
            const command3 = mock((ctx: CanvasRenderingContext2D) => {
                executionOrder.push(3);
                ctx.clearRect(20, 20, 30, 30);
            });

            enqueueDrawCommand(command1);
            enqueueDrawCommand(command2);
            enqueueDrawCommand(command3);
            expect(drawQueue.length).toBe(3);

            processDrawQueue(mockCtx);

            expect(executionOrder).toEqual([1, 2, 3]);
            expect(command1).toHaveBeenCalledTimes(1);
            expect(command2).toHaveBeenCalledTimes(1);
            expect(command3).toHaveBeenCalledTimes(1);
            expect(command1).toHaveBeenCalledWith(mockCtx);
            expect(command2).toHaveBeenCalledWith(mockCtx);
            expect(command3).toHaveBeenCalledWith(mockCtx);
            expect(drawQueue.length).toBe(0);
        });

        test("should handle commands that modify context state", () => {
            const command = mock((ctx: CanvasRenderingContext2D) => {
                ctx.save();
                ctx.fillStyle = "red";
                ctx.strokeStyle = "blue";
                ctx.lineWidth = 5;
                ctx.fillRect(0, 0, 100, 100);
                ctx.restore();
            });

            enqueueDrawCommand(command);
            processDrawQueue(mockCtx);

            expect(command).toHaveBeenCalledTimes(1);
            expect(command).toHaveBeenCalledWith(mockCtx);
            expect(mockCtx.save).toHaveBeenCalledTimes(1);
            expect(mockCtx.restore).toHaveBeenCalledTimes(1);
            expect(mockCtx.fillRect).toHaveBeenCalledWith(0, 0, 100, 100);
        });

        test("should handle commands that throw errors gracefully", () => {
            const goodCommand = mock((ctx: CanvasRenderingContext2D) => {
                ctx.fillRect(0, 0, 10, 10);
            });

            const errorCommand = mock((ctx: CanvasRenderingContext2D) => {
                throw new Error("Test error");
            });

            const anotherGoodCommand = mock((ctx: CanvasRenderingContext2D) => {
                ctx.strokeRect(20, 20, 30, 30);
            });

            enqueueDrawCommand(goodCommand);
            enqueueDrawCommand(errorCommand);
            enqueueDrawCommand(anotherGoodCommand);

            // Process queue should handle the error and continue
            expect(() => processDrawQueue(mockCtx)).toThrow("Test error");

            // The queue should still be processed up to the error
            expect(goodCommand).toHaveBeenCalledTimes(1);
            expect(errorCommand).toHaveBeenCalledTimes(1);
            // anotherGoodCommand won't be called due to the error
        });

        test("should process large number of commands efficiently", () => {
            const commands = Array.from({ length: 1000 }, (_, i) =>
                mock((ctx: CanvasRenderingContext2D) => {
                    ctx.fillRect(i, i, 1, 1);
                })
            );

            commands.forEach(enqueueDrawCommand);
            expect(drawQueue.length).toBe(1000);

            processDrawQueue(mockCtx);

            commands.forEach((command, index) => {
                expect(command).toHaveBeenCalledTimes(1);
                expect(command).toHaveBeenCalledWith(mockCtx);
            });
            expect(drawQueue.length).toBe(0);
        });

        test("should handle multiple processDrawQueue calls on empty queue", () => {
            processDrawQueue(mockCtx);
            processDrawQueue(mockCtx);
            processDrawQueue(mockCtx);

            expect(drawQueue.length).toBe(0);
        });

        test("should work with different canvas context methods", () => {
            const pathCommand = mock((ctx: CanvasRenderingContext2D) => {
                ctx.beginPath();
                ctx.moveTo(10, 10);
                ctx.lineTo(100, 10);
                ctx.lineTo(100, 100);
                ctx.closePath();
                ctx.fill();
            });

            const textCommand = mock((ctx: CanvasRenderingContext2D) => {
                ctx.font = "16px Arial";
                ctx.fillText("Test Text", 50, 50);
            });

            const imageCommand = mock((ctx: CanvasRenderingContext2D) => {
                ctx.save();
                ctx.translate(100, 100);
                ctx.rotate(Math.PI / 4);
                ctx.fillRect(-25, -25, 50, 50);
                ctx.restore();
            });

            enqueueDrawCommand(pathCommand);
            enqueueDrawCommand(textCommand);
            enqueueDrawCommand(imageCommand);

            processDrawQueue(mockCtx);

            expect(pathCommand).toHaveBeenCalledWith(mockCtx);
            expect(textCommand).toHaveBeenCalledWith(mockCtx);
            expect(imageCommand).toHaveBeenCalledWith(mockCtx);

            expect(mockCtx.beginPath).toHaveBeenCalledTimes(1);
            expect(mockCtx.moveTo).toHaveBeenCalledWith(10, 10);
            expect(mockCtx.lineTo).toHaveBeenCalledWith(100, 10);
            expect(mockCtx.lineTo).toHaveBeenCalledWith(100, 100);
            expect(mockCtx.closePath).toHaveBeenCalledTimes(1);
            expect(mockCtx.fill).toHaveBeenCalledTimes(1);

            expect(mockCtx.fillText).toHaveBeenCalledWith("Test Text", 50, 50);

            expect(mockCtx.save).toHaveBeenCalledTimes(1);
            expect(mockCtx.translate).toHaveBeenCalledWith(100, 100);
            expect(mockCtx.rotate).toHaveBeenCalledWith(Math.PI / 4);
            expect(mockCtx.fillRect).toHaveBeenCalledWith(-25, -25, 50, 50);
            expect(mockCtx.restore).toHaveBeenCalledTimes(1);

            expect(drawQueue.length).toBe(0);
        });
    });

    describe("Integration tests", () => {
        test("should handle enqueue and process cycle multiple times", () => {
            // First cycle
            const command1 = mock((ctx: CanvasRenderingContext2D) => {
                ctx.fillRect(0, 0, 10, 10);
            });
            enqueueDrawCommand(command1);
            processDrawQueue(mockCtx);

            expect(command1).toHaveBeenCalledTimes(1);
            expect(drawQueue.length).toBe(0);

            // Second cycle
            const command2 = mock((ctx: CanvasRenderingContext2D) => {
                ctx.strokeRect(10, 10, 20, 20);
            });
            enqueueDrawCommand(command2);
            processDrawQueue(mockCtx);

            expect(command2).toHaveBeenCalledTimes(1);
            expect(drawQueue.length).toBe(0);

            // Third cycle with multiple commands
            const command3 = mock((ctx: CanvasRenderingContext2D) => {
                ctx.clearRect(0, 0, 100, 100);
            });
            const command4 = mock((ctx: CanvasRenderingContext2D) => {
                ctx.fillText("Done", 50, 50);
            });

            enqueueDrawCommand(command3);
            enqueueDrawCommand(command4);
            processDrawQueue(mockCtx);

            expect(command3).toHaveBeenCalledTimes(1);
            expect(command4).toHaveBeenCalledTimes(1);
            expect(drawQueue.length).toBe(0);
        });

        test("should maintain command integrity across operations", () => {
            const commands: ReturnType<typeof mock>[] = [];

            // Create complex drawing scenario
            for (let i = 0; i < 10; i++) {
                const command = mock((ctx: CanvasRenderingContext2D) => {
                    ctx.save();
                    ctx.fillStyle = `hsl(${i * 36}, 50%, 50%)`;
                    ctx.fillRect(i * 10, i * 10, 10, 10);
                    ctx.restore();
                });
                commands.push(command);
                enqueueDrawCommand(command);
            }

            expect(drawQueue.length).toBe(10);
            processDrawQueue(mockCtx);

            commands.forEach((command) => {
                expect(command).toHaveBeenCalledTimes(1);
                expect(command).toHaveBeenCalledWith(mockCtx);
            });

            expect(mockCtx.save).toHaveBeenCalledTimes(10);
            expect(mockCtx.restore).toHaveBeenCalledTimes(10);
            expect(mockCtx.fillRect).toHaveBeenCalledTimes(10);
            expect(drawQueue.length).toBe(0);
        });

        test("should handle edge case of command that modifies the queue", () => {
            const normalCommand = mock((ctx: CanvasRenderingContext2D) => {
                ctx.fillRect(0, 0, 10, 10);
            });

            const newCommand = mock((ctx: CanvasRenderingContext2D) => {
                ctx.fillRect(50, 50, 10, 10);
            });

            // This command tries to add more commands during processing
            const queueModifyingCommand = mock((ctx: CanvasRenderingContext2D) => {
                ctx.strokeRect(10, 10, 20, 20);
                // Try to add another command during processing
                enqueueDrawCommand(newCommand);
            });

            enqueueDrawCommand(normalCommand);
            enqueueDrawCommand(queueModifyingCommand);

            expect(drawQueue.length).toBe(2);
            processDrawQueue(mockCtx);

            expect(normalCommand).toHaveBeenCalledTimes(1);
            expect(queueModifyingCommand).toHaveBeenCalledTimes(1);

            // The processDrawQueue processes until the queue is empty,
            // so the new command added during processing would also be processed
            expect(newCommand).toHaveBeenCalledTimes(1);
            expect(drawQueue.length).toBe(0);
        });
    });

    describe("Type safety and edge cases", () => {
        test("should handle commands with no operations", () => {
            const emptyCommand = mock((ctx: CanvasRenderingContext2D) => {
                // Command that does nothing
            });

            enqueueDrawCommand(emptyCommand);
            processDrawQueue(mockCtx);

            expect(emptyCommand).toHaveBeenCalledTimes(1);
            expect(emptyCommand).toHaveBeenCalledWith(mockCtx);
            expect(drawQueue.length).toBe(0);
        });

        test("should handle commands with complex context operations", () => {
            const complexCommand = mock((ctx: CanvasRenderingContext2D) => {
                // Create a complex drawing
                ctx.save();
                ctx.setTransform(2, 0, 0, 2, 100, 100);
                ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
                ctx.shadowBlur = 10;
                ctx.shadowOffsetX = 5;
                ctx.shadowOffsetY = 5;

                ctx.beginPath();
                ctx.arc(0, 0, 50, 0, 2 * Math.PI);
                ctx.fillStyle = "red";
                ctx.fill();

                ctx.strokeStyle = "blue";
                ctx.lineWidth = 3;
                ctx.stroke();
                ctx.restore();
            });

            enqueueDrawCommand(complexCommand);
            processDrawQueue(mockCtx);

            expect(complexCommand).toHaveBeenCalledWith(mockCtx);
            expect(mockCtx.save).toHaveBeenCalledTimes(1);
            expect(mockCtx.setTransform).toHaveBeenCalledWith(2, 0, 0, 2, 100, 100);
            expect(mockCtx.beginPath).toHaveBeenCalledTimes(1);
            expect(mockCtx.arc).toHaveBeenCalledWith(0, 0, 50, 0, 2 * Math.PI);
            expect(mockCtx.fill).toHaveBeenCalledTimes(1);
            expect(mockCtx.stroke).toHaveBeenCalledTimes(1);
            expect(mockCtx.restore).toHaveBeenCalledTimes(1);
        });
    });
});