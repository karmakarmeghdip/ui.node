# Using Yoga Layout Efficiently

This document provides guidance on how to best use the Yoga Layout library within this project to ensure high performance and maintainability. The key is to move from a "rebuild everything" approach to a "mutate and update" approach, leveraging Yoga's powerful internal optimizations.

## 1. Core Principle: A Persistent Yoga Tree

Instead of destroying and recreating the Yoga layout tree on every change, you should maintain a **persistent Yoga tree** that mirrors the structure of the application's UI element tree.

- **Creation:** When a UI element is created, its corresponding `yogaNode` should be created at the same time using `Yoga.Node.create()`. This node should be stored on the element for future access.
- **Manipulation:** When the UI tree changes, the Yoga tree should be updated using Yoga's tree manipulation functions:
  - `parent.insertChild(child, index)`
  - `parent.removeChild(child)`

This creates a stable structure that Yoga can analyze and optimize over time.

## 2. Leveraging Yoga's Internal Dirty Tracking

Yoga has a highly optimized dirty tracking mechanism built-in. Any time you call a setter on a Yoga node (e.g., `setWidth`), Yoga marks that node and its ancestors as "dirty." This is the most important feature to leverage for performance.

- **How it Works:** When you call `Yoga.Node.calculateLayout()` on the root of the tree, Yoga traverses the node hierarchy. It checks the dirty flag on each node. If a node is not dirty, it completely skips recalculating the layout for it and its entire subtree, saving significant computation time.
- **Your Responsibility:** Your task is to simply tell Yoga what has changed. When a style property that affects layout (like `width`, `margin`, `flexDirection`, etc.) is modified on a UI element, you must call the corresponding setter on the element's `yogaNode`.

**Example: Updating a style**
```typescript
// Get the yogaNode associated with your UI element
const yogaNode = element.yogaNode;

// Update layout properties directly on the node
yogaNode.setWidth(200);
yogaNode.setMargin(Yoga.EDGE_LEFT, 10);
yogaNode.setFlexGrow(1);

// You do NOT need to set a manual `isDirty` flag. Yoga does this internally.
```

## 3. The Layout and Render Workflow

The rendering pipeline should be updated to take advantage of this approach.

1.  **Initialization:** Build the initial UI tree and the corresponding Yoga tree.
2.  **State Change:** An event handler or application logic updates a style signal on one or more elements.
3.  **Style Application:** The `StyleEngine` reacts to the signal change and calls the appropriate `yogaNode.set...()` methods for each modified layout property.
4.  **Layout Pass:** In the main render loop, call `Yoga.Node.calculateLayout()` on the **root node only**. Yoga handles the rest, efficiently computing new layouts for only the affected nodes.
5.  **Paint Pass:** Traverse the UI tree and read the newly computed layout for each element using:
    - `yogaNode.getComputedLayout()`
    This returns an object with `left`, `top`, `width`, and `height` that you can use for drawing.

## 4. Handling High-DPI Displays

To ensure layouts are rendered correctly on displays with different pixel densities, you must set the point scale factor.

- **API:** `config.setPointScaleFactor(scaleFactor)`
- **Usage:** This should be configured once on the root node's configuration object. The `scaleFactor` (e.g., `window.devicePixelRatio`) scales all layout values appropriately, preventing blurry or incorrectly sized elements on high-DPI screens.

## Summary of Best Practices

- **DO** maintain a persistent Yoga tree that lives alongside the UI tree.
- **DO** call specific `yogaNode.set...()` methods when layout styles change.
- **DO** call `calculateLayout()` only on the root node of the tree.
- **DO NOT** rebuild the Yoga tree on every frame or change.
- **DO NOT** use a manual `isDirty` flag for layout. Rely on Yoga's internal mechanism.
