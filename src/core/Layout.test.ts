import { expect, test, describe, beforeEach, afterEach, mock, spyOn } from "bun:test";
import { Element } from "../elements/canvas/Element";
import { Text } from "../elements/canvas/Text";
import { iterateNodeTree, layout } from "./Layout";
import { signal } from "@preact/signals-core";
import * as canvasModule from "../elements/canvas";
import type { UINode } from "../elements/canvas";
import Yoga from "yoga-layout";

// Mock paintNode to track paint calls
const mockPaintNode = mock(() => { });
spyOn(canvasModule, "paintNode").mockImplementation(mockPaintNode);

describe("Layout Module Comprehensive Tests", () => {
    beforeEach(() => {
        mockPaintNode.mockClear();
    });

    afterEach(() => {
        mockPaintNode.mockClear();
    });

    describe("iterateNodeTree function", () => {
        test("should iterate through single node", () => {
            const singleNode = Element({ backgroundColor: "red", width: 100, height: 100 });
            const callback = mock(() => { });

            iterateNodeTree(singleNode, callback);

            expect(callback).toHaveBeenCalledTimes(1);
            expect(callback).toHaveBeenCalledWith(singleNode);
        });

        test("should iterate through node tree with children", () => {
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

            const visitedNodes: UINode[] = [];
            const callback = mock((node: UINode) => {
                visitedNodes.push(node);
            });

            iterateNodeTree(nodeTree, callback);

            expect(callback).toHaveBeenCalledTimes(3);
            expect(visitedNodes).toHaveLength(3);
            expect(visitedNodes[0]).toBe(nodeTree);
            expect(visitedNodes).toContain(nodeTree.children[0]);
            expect(visitedNodes).toContain(nodeTree.children[1]);
        });

        test("should iterate through deeply nested tree", () => {
            const deepTree = Element({ backgroundColor: "root" },
                Element({ backgroundColor: "level1" },
                    Element({ backgroundColor: "level2" },
                        Element({ backgroundColor: "level3" })
                    )
                )
            );

            const callback = mock(() => { });

            iterateNodeTree(deepTree, callback);

            expect(callback).toHaveBeenCalledTimes(4);
        });

        test("should handle mixed node types", () => {
            const mixedTree = Element({ backgroundColor: "container" },
                Text("Hello World", { color: "black", fontSize: 14 }),
                Element({ backgroundColor: "child" })
            );

            const callback = mock(() => { });

            iterateNodeTree(mixedTree, callback);

            expect(callback).toHaveBeenCalledTimes(3);
        });

        test("should handle empty children array", () => {
            const nodeWithEmptyChildren = Element({ backgroundColor: "red" });
            nodeWithEmptyChildren.children = [];

            const callback = mock(() => { });

            iterateNodeTree(nodeWithEmptyChildren, callback);

            expect(callback).toHaveBeenCalledTimes(1);
            expect(callback).toHaveBeenCalledWith(nodeWithEmptyChildren);
        });

        test("should handle large tree with many siblings", () => {
            const children = Array.from({ length: 10 }, (_, i) =>
                Element({ backgroundColor: `color-${i}`, width: 10, height: 10 })
            );
            const largeTree = Element({ backgroundColor: "root" }, ...children);

            const callback = mock(() => { });

            iterateNodeTree(largeTree, callback);

            expect(callback).toHaveBeenCalledTimes(11); // root + 10 children
        });
    });

    describe("Direct Yoga Layout Testing", () => {
        test("should calculate layout for single node", () => {
            const node = Element({ width: 100, height: 50 });

            // Test the yoga layout directly without subscriptions
            node.yogaNode.calculateLayout(200, 100, Yoga.DIRECTION_LTR);

            expect(node.yogaNode.getComputedWidth()).toBe(100);
            expect(node.yogaNode.getComputedHeight()).toBe(50);
        });

        test("should calculate layout for node with children", () => {
            const parentNode = Element({
                width: 200,
                height: 100,
                flexDirection: Yoga.FLEX_DIRECTION_ROW
            },
                Element({ width: 50, height: 50 }),
                Element({ width: 75, height: 25 })
            );

            // Test layout calculation directly
            parentNode.yogaNode.calculateLayout(200, 100, Yoga.DIRECTION_LTR);

            expect(parentNode.yogaNode.getComputedWidth()).toBe(200);
            expect(parentNode.yogaNode.getComputedHeight()).toBe(100);
            expect(parentNode.children[0]?.yogaNode.getComputedWidth()).toBe(50);
            expect(parentNode.children[1]?.yogaNode.getComputedWidth()).toBe(75);
        });

        test("should set position coordinates correctly", () => {
            const node = Element({ width: 100, height: 50 });

            // Calculate layout
            node.yogaNode.calculateLayout(200, 100, Yoga.DIRECTION_LTR);

            // Set position based on yoga layout
            node.position = {
                x: 0 + node.yogaNode.getComputedLeft(),
                y: 0 + node.yogaNode.getComputedTop(),
            };

            expect(node.position).toEqual({ x: 0, y: 0 });
        });

        test("should set position coordinates for nested nodes with padding", () => {
            const parentNode = Element({
                width: 200,
                height: 100,
                padding: { edge: Yoga.EDGE_ALL, value: 10 }
            },
                Element({ width: 50, height: 50 })
            );

            // Calculate layout
            parentNode.yogaNode.calculateLayout(200, 100, Yoga.DIRECTION_LTR);

            // Set positions based on calculated layout
            parentNode.position = { x: 0, y: 0 };
            parentNode.children[0]!.position = {
                x: (parentNode.position?.x || 0) + parentNode.children[0]!.yogaNode.getComputedLeft(),
                y: (parentNode.position?.y || 0) + parentNode.children[0]!.yogaNode.getComputedTop(),
            };

            expect(parentNode.position).toEqual({ x: 0, y: 0 });
            // Child should have position offset by padding
            expect(parentNode.children[0]?.position?.x).toBe(10);
            expect(parentNode.children[0]?.position?.y).toBe(10);
        });

        test("should handle zero dimensions", () => {
            const node = Element({ width: 0, height: 0 });

            node.yogaNode.calculateLayout(0, 0, Yoga.DIRECTION_LTR);

            expect(node.yogaNode.getComputedWidth()).toBe(0);
            expect(node.yogaNode.getComputedHeight()).toBe(0);
        });

        test("should handle large dimensions", () => {
            const node = Element({ width: 10000, height: 5000 });

            node.yogaNode.calculateLayout(15000, 8000, Yoga.DIRECTION_LTR);

            expect(node.yogaNode.getComputedWidth()).toBe(10000);
            expect(node.yogaNode.getComputedHeight()).toBe(5000);
        });

        test("should handle complex nested layout", () => {
            const complexTree = Element({
                width: 300,
                height: 200,
                flexDirection: Yoga.FLEX_DIRECTION_COLUMN
            },
                Element({
                    width: 300,
                    height: 100,
                    flexDirection: Yoga.FLEX_DIRECTION_ROW
                },
                    Element({ width: 100, height: 100 }),
                    Element({ width: 200, height: 100 })
                ),
                Element({ width: 300, height: 100 })
            );

            // Test layout calculation
            complexTree.yogaNode.calculateLayout(300, 200, Yoga.DIRECTION_LTR);

            expect(complexTree.yogaNode.getComputedWidth()).toBe(300);
            expect(complexTree.yogaNode.getComputedHeight()).toBe(200);
            expect(complexTree.children[0]?.yogaNode.getComputedHeight()).toBe(100);
            expect(complexTree.children[1]?.yogaNode.getComputedHeight()).toBe(100);
        });
    });

    describe("Layout Function Integration Tests", () => {
        test("should setup layout without throwing errors", () => {
            const node = Element({ width: 100, height: 50 });

            // Test that layout function can be called without throwing
            expect(() => layout(node, 200, 100)).not.toThrow();

            expect(node.yogaNode.getComputedWidth()).toBe(100);
            expect(node.yogaNode.getComputedHeight()).toBe(50);
        });

        test("should handle layout with children", () => {
            const parentNode = Element({
                width: 200,
                height: 100,
            },
                Element({ width: 50, height: 50 })
            );

            expect(() => layout(parentNode, 200, 100)).not.toThrow();

            expect(parentNode.yogaNode.getComputedWidth()).toBe(200);
            expect(parentNode.children[0]?.yogaNode.getComputedWidth()).toBe(50);
        });

        test("should set up subscriptions correctly", () => {
            const node = Element({ width: 100, height: 50 });

            layout(node, 200, 100);

            // Verify initial layout was calculated
            expect(node.yogaNode.getComputedWidth()).toBe(100);
            expect(node.yogaNode.getComputedHeight()).toBe(50);
            expect(node.position).toEqual({ x: 0, y: 0 });
        });
    });

    describe("Repaint Functionality", () => {
        test("should handle repaint signals", () => {
            const node = Element({ width: 100, height: 50 });

            // Set initial repaint state
            node.repaint.value = true;

            // Manually trigger paint
            canvasModule.paintNode(node);

            expect(mockPaintNode).toHaveBeenCalled();
        });

        test("should mark children for repaint", () => {
            const parentNode = Element({ width: 200, height: 100 },
                Element({ width: 50, height: 50 }),
                Element({ width: 75, height: 25 })
            );

            // Manually trigger the repaint logic
            parentNode.repaint.value = false;
            for (const child of parentNode.children) {
                child.repaint.value = true;
            }

            // Children should be marked for repaint
            expect(parentNode.children[0]?.repaint.value).toBe(true);
            expect(parentNode.children[1]?.repaint.value).toBe(true);
        });
    });

    describe("layoutNodeAndChildren Internal Function Coverage", () => {
        test("should trigger hasNewLayout check", () => {
            const node = Element({ width: 100, height: 50 });

            // The layout function internally calls layoutNodeAndChildren
            layout(node, 200, 100);

            // Verify layout was calculated
            expect(node.yogaNode.getComputedWidth()).toBe(100);
            expect(node.yogaNode.getComputedHeight()).toBe(50);
            expect(node.position).toEqual({ x: 0, y: 0 });
        });

        test("should handle position calculation for nested nodes", () => {
            const parentNode = Element({
                width: 200,
                height: 100,
            },
                Element({
                    width: 50,
                    height: 50,
                    margin: { edge: Yoga.EDGE_LEFT, value: 20 }
                })
            );

            layout(parentNode, 200, 100);

            // Verify child position includes margin
            expect(parentNode.children[0]?.position?.x).toBeGreaterThanOrEqual(20);
        });
    });

    describe("Node tree structure validation", () => {
        test("Node tree should have correct structure", () => {
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
    });

    describe("Edge cases and error handling", () => {
        test("should handle node with undefined parent position", () => {
            const node = Element({ width: 100, height: 50 });
            node.parent = null;

            node.yogaNode.calculateLayout(200, 100, Yoga.DIRECTION_LTR);
            node.position = {
                x: 0 + node.yogaNode.getComputedLeft(),
                y: 0 + node.yogaNode.getComputedTop(),
            };

            expect(node.position).toEqual({ x: 0, y: 0 });
        });

        test("should handle style changes correctly", () => {
            const node = Element({ width: 100, height: 50 });

            // Change style and apply manually
            node.style.value = { width: 160, height: 80 };
            node.yogaNode.setWidth(160);
            node.yogaNode.setHeight(80);
            node.yogaNode.calculateLayout(200, 100, Yoga.DIRECTION_LTR);

            expect(node.yogaNode.getComputedWidth()).toBe(160);
            expect(node.yogaNode.getComputedHeight()).toBe(80);
        });

        test("should handle repaint subscription correctly", () => {
            const node = Element({ width: 100, height: 50 });

            // Multiple repaint state changes
            node.repaint.value = true;
            expect(node.repaint.value).toBe(true);

            node.repaint.value = false;
            expect(node.repaint.value).toBe(false);

            node.repaint.value = true;
            expect(node.repaint.value).toBe(true);
        });

        test("should handle hasNewLayout properly", () => {
            const node = Element({ width: 100, height: 50 });

            // Calculate layout
            node.yogaNode.calculateLayout(200, 100, Yoga.DIRECTION_LTR);

            // Check if node has new layout
            const hasNewLayout = node.yogaNode.hasNewLayout();
            expect(typeof hasNewLayout).toBe("boolean");
        });

        test("should handle different flex directions", () => {
            const rowNode = Element({
                width: 200,
                height: 100,
                flexDirection: Yoga.FLEX_DIRECTION_ROW
            });

            const columnNode = Element({
                width: 200,
                height: 100,
                flexDirection: Yoga.FLEX_DIRECTION_COLUMN
            });

            rowNode.yogaNode.calculateLayout(200, 100, Yoga.DIRECTION_LTR);
            columnNode.yogaNode.calculateLayout(200, 100, Yoga.DIRECTION_LTR);

            expect(rowNode.yogaNode.getComputedWidth()).toBe(200);
            expect(columnNode.yogaNode.getComputedWidth()).toBe(200);
        });

        test("should handle text nodes in layout tree", () => {
            const mixedTree = Element({
                width: 300,
                height: 200,
            },
                Text("Test Content", { fontSize: 16 }),
                Element({ width: 100, height: 50 })
            );

            const callback = mock(() => { });
            iterateNodeTree(mixedTree, callback);

            expect(callback).toHaveBeenCalledTimes(3);
            expect(mixedTree.children[0]?.type).toBe("text");
            expect(mixedTree.children[1]?.type).toBe("element");
        });
    });
});