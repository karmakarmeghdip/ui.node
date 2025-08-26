import { expect, test } from "bun:test";
import { Element } from "../elements/canvas/Element";
import { iterateNodeTree } from "./Layout";

const nodeTree = Element({
    backgroundColor: "red",
    width: 100,
    height: 100,
},
    Element({
        backgroundColor: "blue",
        width: 50,
        height: 50,
    }),
    Element({
        backgroundColor: "green",
        width: 50,
        height: 50,
    })
);

test("Node tree should have correct structure", () => {
    expect(nodeTree.children.length).toBe(2);
    expect(nodeTree.children[0]?.style.value.backgroundColor).toBe("blue");
    expect(nodeTree.children[1]?.style.value.backgroundColor).toBe("green");
    expect(nodeTree.children[0]?.parent).toBe(nodeTree);
    expect(nodeTree.children[1]?.parent).toBe(nodeTree);
    expect(nodeTree.yogaNode.getChildCount()).toBe(2);
    iterateNodeTree(nodeTree, (node) => {
        expect(node.yogaNode.getChildCount()).toBe(node.children.length);
    });
});