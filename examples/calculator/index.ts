import { App } from "skia-canvas";
import { createWindow } from "../../src/core/Window";
import app from "./ui";

const { id } = createWindow(app, 420, 760, "Calculator");
console.log("Window created with ID:", id);

App.launch().then(() => {
    console.log("App closed");
});

