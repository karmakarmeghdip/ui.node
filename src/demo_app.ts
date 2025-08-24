import { Edge, FlexDirection, Align, Justify } from "yoga-layout";
import { Element } from "./elements/canvas/Element"
import { Text } from "./elements/canvas/Text";


export const demo_app = () => {
    const root = new Element({
        backgroundColor: "#32302f",
        flexDirection: FlexDirection.Column,
        justifyContent: Justify.Center,
        alignItems: Align.Center,
        width: "100%",
        height: "100%",
    });

    const buttonContainer = new Element({
        backgroundColor: "#89b482",
        flexDirection: FlexDirection.Row,
        justifyContent: Justify.Center,
        alignItems: Align.Center,
        padding: { edge: Edge.All, value: 20 },
        // borderRadius: 8,
    });

    const buttonText = new Text("Hello Node + Skia = ❤️", {
        color: "#4b4233ff",
        flexDirection: FlexDirection.Row,
        borderColor: "#4b4233ff",
        backgroundColor: "transparent",
        fontFamily: "ZedMono Nerd Font",
        fontSize: 20,
    });

    root.appendChild(buttonContainer);
    buttonContainer.appendChild(buttonText);

    buttonContainer.onClick = () => {
        console.log("Button clicked!");
    };

    buttonContainer.hover.subscribe(e => {
        if (!e) return;
        if (e.hover) {
            console.log("Mouse entered button");
            buttonContainer.style.backgroundColor = "#3f653dff";
            buttonContainer.render(e.target.ctx)
        } else {
            console.log("Mouse left button");
            buttonContainer.style.backgroundColor = "#89b482";
            buttonContainer.render(e.target.ctx)
        }
    });

    return root;
}