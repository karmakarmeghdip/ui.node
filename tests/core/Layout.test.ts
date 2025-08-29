import {
  expect,
  test,
  describe,
  beforeEach,
  afterEach,
  mock,
  spyOn,
} from "bun:test";
import { Element } from "../../src/elements/canvas/Element";
import { Text } from "../../src/elements/canvas/Text";
import {
  iterateNodeTree,
  layoutNodeAndChildren,
  setupLayout,
} from "../../src/core/Layout";
import * as canvasModule from "../../src/elements/canvas";
import type { UINode } from "../../src/elements/canvas";
import Yoga from "yoga-layout";

// Mock paintNode to track paint calls
const mockPaintNode = mock((node: UINode) => {});
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
      const singleNode = Element({
        backgroundColor: "red",
        width: 100,
        height: 100,
      });
      const callback = mock(() => {});

      iterateNodeTree(singleNode, callback);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(singleNode);
    });

    test("should iterate through node tree with children", () => {
      const nodeTree = Element(
        {
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
        }),
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
  });

  describe("Direct Yoga Layout Testing", () => {
    test("should calculate layout for single node", () => {
      const node = Element({ width: 100, height: 50 });

      node.yogaNode.calculateLayout(200, 100, Yoga.DIRECTION_LTR);

      expect(node.yogaNode.getComputedWidth()).toBe(100);
      expect(node.yogaNode.getComputedHeight()).toBe(50);
    });

    test("should set position coordinates for nested nodes with padding", () => {
      const parentNode = Element(
        {
          width: 200,
          height: 100,
          padding: { edge: Yoga.EDGE_ALL, value: 10 },
        },
        Element({ width: 50, height: 50 }),
      );

      parentNode.yogaNode.calculateLayout(200, 100, Yoga.DIRECTION_LTR);

      parentNode.position = { x: 0, y: 0 };
      parentNode.children[0]!.position = {
        x:
          (parentNode.position?.x || 0) +
          parentNode.children[0]!.yogaNode.getComputedLeft(),
        y:
          (parentNode.position?.y || 0) +
          parentNode.children[0]!.yogaNode.getComputedTop(),
      };

      expect(parentNode.position).toEqual({ x: 0, y: 0 });
      expect(parentNode.children[0]?.position?.x).toBe(10);
      expect(parentNode.children[0]?.position?.y).toBe(10);
    });
  });

  describe("Layout Function Integration Tests", () => {
    test("should setup layout without throwing errors", () => {
      const node = Element({ width: 100, height: 50 });

      expect(() => setupLayout(node, 200, 100)).not.toThrow();

      expect(node.yogaNode.getComputedWidth()).toBe(100);
      expect(node.yogaNode.getComputedHeight()).toBe(50);
    });

    test("should handle position calculation for nested nodes", () => {
      const parentNode = Element(
        {
          width: 200,
          height: 100,
        },
        Element({
          width: 50,
          height: 50,
          margin: { edge: Yoga.EDGE_LEFT, value: 20 },
        }),
      );

      setupLayout(parentNode, 200, 100);

      expect(parentNode.children[0]?.position?.x).toBeGreaterThanOrEqual(20);
    });
  });

  describe("Reactive Layout and Painting", () => {
    test("should trigger a repaint when a style signal changes", () => {
      const node = Element({ width: 100, height: 50, backgroundColor: "red" });

      // Set up the layout and reactive subscriptions
      setupLayout(node, 200, 100);

      // The initial layout should cause a paint call
      expect(mockPaintNode).toHaveBeenCalled();

      // Clear the mock for the next check
      mockPaintNode.mockClear();

      // Change a style property, which should trigger the subscription
      node.style.value = { ...node.style.value, backgroundColor: "blue" };

      // The style change should have triggered a relayout, which in turn calls paintNode
      expect(mockPaintNode).toHaveBeenCalled();
    });

    test("should only paint nodes that have a new layout", () => {
      const parent = Element(
        { width: 200, height: 200, flexDirection: Yoga.FLEX_DIRECTION_COLUMN },
        Element({ width: 100, height: 50 }),
        Element({ width: 100, height: 50 }),
      );

      setupLayout(parent, 200, 200);

      // Initial layout should paint all 3 nodes
      expect(mockPaintNode.mock.calls.length).toBe(3);
      mockPaintNode.mockClear();

      // Change a style on a child that affects its layout
      const childToChange = parent.children[0];
      if (childToChange) {
        childToChange.style.value = {
          ...childToChange.style.value,
          width: 120,
        };
      }

      // The change should trigger a repaint. In the current implementation, this will
      // repaint the node that changed and potentially its parent if the size change affects it.
      // The sibling node should not be repainted.
      expect(mockPaintNode).toHaveBeenCalled();

      // We can check which nodes were repainted by inspecting the mock calls
      const paintedNodes = mockPaintNode.mock.calls.map((call) => call[0]);

      // The child that changed must be in the list of painted nodes
      expect(paintedNodes).toContain(childToChange);

      // The sibling that did not change should NOT be in the list
      const sibling = parent.children[1];
      expect(paintedNodes).not.toContain(sibling);
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

    test("should handle hasNewLayout properly", () => {
      const node = Element({ width: 100, height: 50 });

      node.yogaNode.calculateLayout(200, 100, Yoga.DIRECTION_LTR);

      const hasNewLayout = node.yogaNode.hasNewLayout();
      expect(typeof hasNewLayout).toBe("boolean");
    });
  });
});
