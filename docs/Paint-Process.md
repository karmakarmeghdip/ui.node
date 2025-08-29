# The Layout-Integrated Paint Process

This document outlines the implemented approach for the "Paint Pass" as defined in the `ARCHITECTURE.md`. In the current implementation, the paint process is not a separate, distinct traversal of the UI tree. Instead, it is tightly integrated into the **Layout Pass** for efficiency.

This approach ensures that painting only occurs when a node's position, size, or appearance has actually changed.

## Overall Workflow: The Producer-Consumer Model

The rendering pipeline operates on a simple but powerful producer-consumer model:

-   **The `drawQueue`**: This is a shared array (`DrawCommand[]`) that holds drawing commands for the current frame. It acts as the bridge between the producer and the consumer.

-   **The Producer (Layout & Paint Pass)**: This process is triggered by a style change or a window resize. The `layoutNodeAndChildren` function in `src/core/Layout.ts` traverses the Yoga layout tree. If it finds a node where `yogaNode.hasNewLayout()` is `true`, it:
    1.  Calculates the node's new absolute position.
    2.  Immediately calls `paintNode(node)`.
    3.  The `paintNode` function (e.g., `paintElement`) then enqueues one or more draw commands into the `drawQueue`.

-   **The Consumer (Draw Pass)**: This is the `window`'s `frame` event handler. On every frame, it calls `processDrawQueue()`, which executes all commands currently in the `drawQueue` and then clears it. If the queue is empty, it does nothing.

This model is highly efficient because the application remains idle until a state or layout change requires a new frame to be drawn.

## Algorithm: The Integrated Layout and Paint Logic

The core logic resides within the `layoutNodeAndChildren` function. There is no separate, iterative paint pass; it all happens in one optimized flow.

```typescript
// Simplified logic from src/core/Layout.ts

export function layoutNodeAndChildren(node: UINode, width?: number, height?: number) {
    // 1. Calculate the layout for the entire tree
    node.yogaNode.calculateLayout(width, height, Yoga.DIRECTION_LTR);

    // 2. Iterate through the tree to find what's changed
    iterateNodeTree(node, (n) => {
        // 3. Check if Yoga's internal layout has changed for this node
        if (n.yogaNode.hasNewLayout()) {
            // 4. Update the node's stored position
            n.position = {
                x: (n.parent?.position?.x || 0) + n.yogaNode.getComputedLeft(),
                y: (n.parent?.position?.y || 0) + n.yogaNode.getComputedTop(),
            };

            // 5. Mark the layout as "seen" to prevent re-processing
            n.yogaNode.markLayoutSeen();

            // 6. TRIGGER THE PAINT PROCESS for this specific node
            paintNode(n);
        }
    });
}
```

### Determining if a Repaint is Needed

A repaint is triggered if:

1.  **Layout has changed**: `yogaNode.getHasNewLayout()` returns `true`. This is the primary trigger for painting.
2.  **Style has changed**: A style signal subscription calls `applyStyleToNode` and then triggers a new layout calculation by calling `layoutNodeAndChildren`, which in turn triggers the paint.

## Conclusion

This integrated process is highly efficient as it avoids traversing the tree multiple times. By leveraging Yoga's internal dirty-checking (`hasNewLayout`), we ensure that we only calculate positions and generate draw commands for the exact nodes that have been affected by a change. This creates a clean, performant rendering pipeline.
