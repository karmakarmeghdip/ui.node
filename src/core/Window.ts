import { App, Window, type WindowOptions } from "skia-canvas";
import type { UINode } from "../elements";

const rootNodes: { [key: number]: UINode } = {};

export function createWindow(root: UINode, width: number, height: number, title: string, options?: WindowOptions) {
    const window = new Window(width, height, {
        background: "black",
        title,
        fit: "resize",
        ...options,
    });
    const id = App.windows.length - 1;
    rootNodes[id] = root;
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

