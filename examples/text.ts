import { Align, Display, Edge, FlexDirection, Justify } from "yoga-layout";
import { Element, Text } from "../src/elements/canvas"
import { createWindow } from "../src/core/Window";
import { App } from "skia-canvas";
import { printTree } from "../src/utils/printTree";
import { effect } from "@preact/signals-core";

const button = Element({
    backgroundColor: "#89b4fa",
    border: { width: 1, edge: Edge.All },
    borderRadius: 10,
    padding: { edge: Edge.All, value: 8 },
    margin: { edge: Edge.Top, value: 16 },

    display: Display.Flex,
    justifyContent: Justify.Center,
    alignItems: Align.Center,
},
    Text("Click Me", {
        fontFamily: "ZedMono Nerd Font",
        fontSize: 20,
        color: "#4c4f69",
        // border: { width: 1, edge: Edge.All },
    })
);



const app = Element({
    backgroundColor: "#1e1e2e",
    width: "100%",
    height: "100%",
    flexDirection: FlexDirection.Column,
    alignItems: Align.Center,
    justifyContent: Justify.Center
},
    button,
);
effect(() => {
    // console.log("Button hovered or child hovered:", button.hovered.value, button.children[0].hovered.value);
    if (button.hovered.value) {
        button.style.value = { ...button.style.peek(), backgroundColor: "#7287fd" };
    } else {
        button.style.value = { ...button.style.peek(), backgroundColor: "#89b4fa" };
    }
});

effect(() => {
    if (button.clicked.value) {
        console.log("Button Clicked")
    }
})

const win = createWindow(app, 800, 600, "Text Example");

console.log("Window created with ID:", win.id);

printTree(app);


App.launch().then(() => {
    console.log("App closed");
});