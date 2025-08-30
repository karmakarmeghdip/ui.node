import { App, Window, type WindowOptions } from "skia-canvas";
import type { UINode } from "../elements/canvas";
import { layoutNodeAndChildren, paintNodeAndChildren, setupLayout } from "./Layout";
import { processDrawQueue } from "./Renderer";
import { handleEvents } from "./Input";

/**
 * A map to store the root UI node for each open window, keyed by the window's ID.
 */
const rootNodes: { [key: number]: UINode } = {};

/**
 * Creates a new window and associates it with a root UI node.
 * It sets up all the necessary event handlers for rendering, layout, and input.
 * @param root The root UINode of the UI tree to render in the window.
 * @param width The initial width of the window.
 * @param height The initial height of the window.
 * @param title The title of the window.
 * @param options Optional settings for the window, passed to `skia-canvas`.
 * @returns An object containing the new window's `id` and the `window` instance itself.
 */
export function createWindow(
  root: UINode,
  width: number,
  height: number,
  title: string,
  options?: WindowOptions,
) {
  const window = new Window(width, height, {
    background: "black",
    title,
    fit: "resize",
    ...options,
  });
  const id = App.windows.indexOf(window);
  rootNodes[id] = root;
  setupHandlers(window, root);
  return { id, window };
}

/**
 * Retrieves a window instance by its ID.
 * @param id The ID of the window to retrieve.
 * @returns The `Window` instance, or `undefined` if not found.
 */
export function getWindow(id: number): Window | undefined {
  return App.windows[id];
}

/**
 * Closes a window and cleans up associated resources, including the Yoga layout tree.
 * @param id The ID of the window to close.
 */
export function closeWindowId(id: number): void {
  const window = App.windows[id];
  if (window) {
    rootNodes[id]?.yogaNode.freeRecursive();
    delete rootNodes[id];
    window.close();
  }
}

/**
 * Closes a window and cleans up associated resources, including the Yoga layout tree.
 * @param window The `Window` instance to close.
 */
export function closeWindow(window: Window): void {
  const id = App.windows.indexOf(window);
  if (id !== -1) {
    rootNodes[id]?.yogaNode.freeRecursive();
    delete rootNodes[id];
  }
  window.close();
}

/**
 * Sets up all the event handlers for a given window.
 * This includes handlers for layout, rendering, input, and cleanup.
 * @param window The `Window` instance to attach the handlers to.
 * @param root The root `UINode` for this window's UI tree.
 * @private
 */
function setupHandlers(window: Window, root: UINode) {
  window.on("setup", (e) => {
    // This is not being fired?
    console.log("SETUP EVENT FIRED for window", App.windows.indexOf(e.target));
    //     setupLayout(root, e.target.width, e.target.height);
  });

  setupLayout(root, window);

  window.on("resize", (e) => {
    console.log("RESIZE EVENT for window", App.windows.indexOf(e.target));
    layoutNodeAndChildren(root, e.target.width, e.target.height);
    paintNodeAndChildren(root);
  });

  window.on("frame", (e) => {
    // console.log("DRAW EVENT for window", App.windows.indexOf(e.target));
    processDrawQueue(e.target.ctx);
  });

  window.on("mouseup", (e) => {
    handleEvents(e, root);
  });
  window.on("mousedown", (e) => {
    handleEvents(e, root);
  });
  window.on("mousemove", (e) => {
    handleEvents(e, root);
  });

  window.on("close", (e) => {
    console.log("CLOSE EVENT for window", App.windows.indexOf(e.target));
    root.yogaNode.freeRecursive();
    delete rootNodes[App.windows.indexOf(e.target)]; // This will not work as indexOf will return -1
  });
}
