import { App, Window, type WindowOptions } from "skia-canvas";
import type { UINode } from "../elements/canvas";
import { layoutNodeAndChildren, setupLayout } from "./Layout";
import { processDrawQueue } from "./Renderer";

const rootNodes: { [key: number]: UINode } = {};

export function createWindow(root: UINode, width: number, height: number, title: string, options?: WindowOptions) {
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

export function getWindow(id: number): Window | undefined {
    return App.windows[id];
}

export function closeWindowId(id: number): void {
    const window = App.windows[id];
    if (window) {
        rootNodes[id]?.yogaNode.freeRecursive();
        delete rootNodes[id];
        window.close();
    }
}
export function closeWindow(window: Window): void {
    const id = App.windows.indexOf(window);
    if (id !== -1) {
        rootNodes[id]?.yogaNode.freeRecursive();
        delete rootNodes[id];
    }
    window.close();
}

function setupHandlers(window: Window, root: UINode) {

    // window.on("setup", (e) => {
    //     console.log("SETUP EVENT FIRED for window", App.windows.indexOf(e.target));
    //     setupLayout(root, e.target.width, e.target.height);
    // });

    setupLayout(root, window.width, window.height);

    window.on("resize", (e) => {
        console.log("RESIZE EVENT for window", App.windows.indexOf(e.target));
        layoutNodeAndChildren(root, e.target.width, e.target.height);
    });

    window.on("draw", (e) => {
        // console.log("DRAW EVENT for window", App.windows.indexOf(e.target));
        processDrawQueue(e.target.ctx);
    });

    window.on("close", (e) => {
        console.log("CLOSE EVENT for window", App.windows.indexOf(e.target));
        root.yogaNode.freeRecursive();
        delete rootNodes[App.windows.indexOf(e.target)]; // This will not work as indexOf will return -1
    });
}