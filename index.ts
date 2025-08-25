import { Window } from "skia-canvas";
import { demo_app } from "./test/demo_app";
import { Direction } from "yoga-layout";
import { Text } from "./src/elements/canvas/Text";

const win = new Window(400, 400, {
  background: "black",
  title: "Node UI - Yoga Layout Demo",
  fit: "resize",
});

const root = demo_app();


win.on("setup", e => {
  const ctx = e.target.canvas.getContext("2d");
  Text.calculateTextElementsDimensions(ctx);
  root.getYogaNode().calculateLayout(e.target.width, e.target.height, Direction.LTR);
  root.render(ctx, 0, 0);
});


// win.on("draw", (e) => {
// });

win.on("resize", (e) => {
  const ctx = e.target.canvas.getContext("2d");
  Text.calculateTextElementsDimensions(ctx);
  root.getYogaNode().calculateLayout(e.width, e.height, Direction.LTR);
  root.render(ctx, 0, 0);
});

win.on("mouseup", e => {
  root.handleMouseEvent(e);
});

win.on("mousemove", e => {
  root.handleMouseEvent(e);
});

// Cleanup when window closes
win.on("close", (e) => {
  root.getYogaNode().freeRecursive();
});

// Handle process termination
process.on("SIGINT", () => {
  root.getYogaNode().freeRecursive();
  process.exit(0);
});