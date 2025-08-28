import { Align, Edge, FlexDirection, Justify } from "yoga-layout";
import { Element } from "../src/elements/canvas";
import { createWindow } from "../src/core/Window";
import { printTree } from "../src/utils/printTree";
import { App } from "skia-canvas";

const app = Element({
    backgroundColor: "white",
    width: "100%",
    height: "100%",
    flexDirection: FlexDirection.Column,
    alignItems: Align.Center,
    justifyContent: Justify.Center,
},
    Element({
        backgroundColor: "lightblue",
        height: "50%",
        width: "50%",
        border: { edge: Edge.All, width: 2 },
        borderColor: "blue"
    }),
    Element({
        backgroundColor: "coral",
        height: "50%",
        width: "50%",
        border: { edge: Edge.All, width: 2 },
        borderColor: "deepred"
    })
);

printTree(app);

app.hovered.subscribe(() => {
    console.log(`App hovered: ${app.hovered.value}`);
});
app.children.map((c, i) => c.hovered.subscribe(() => {
    console.log(`Child ${i + 1} hovered: ${c.hovered.value}`);
}));

const { id } = createWindow(app, 800, 600, "Basic Example");


console.log("Window created with ID:", id);

App.launch().then(() => {
    console.log("App closed");
})