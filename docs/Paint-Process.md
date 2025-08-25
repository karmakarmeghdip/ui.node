# The Iterative Paint Process

This document outlines the iterative approach for the "Paint Pass" as defined in the `ARCHITECTURE.md`. The goal of this process is to traverse the UI tree and generate a flat list of drawing commands (a "Draw Command List"), which can then be executed by the "Draw Pass".

Using an iterative method with an explicit stack is more memory-efficient and robust than recursion, as it avoids deep function call stacks that can lead to errors in complex UIs.

## Overall Workflow: The Producer-Consumer Model

The entire rendering pipeline operates on a simple but powerful producer-consumer model, which is highly efficient because it only performs work when the UI state has actually changed.

-   **The `Draw Command List`**: This is a shared array that holds the drawing commands for a single frame. It acts as the bridge between the producer and the consumer.

-   **The Producer (Paint Pass)**: This is triggered by a state change (e.g., a signal update). It is responsible for running the layout and paint passes to generate a new, complete list of drawing commands and placing them in the `Draw Command List`.

-   **The Consumer (Draw Pass)**: This is the `Window`'s `draw` event handler, which runs independently on a timer (e.g., vsync). It checks if the `Draw Command List` has any commands. If it does, it draws them and clears the list. If not, it does nothing.

This model ensures that the application remains idle and consumes no resources until a state change requires a new frame to be drawn.

## Algorithm: Generating the Draw Command List

The following algorithm describes how to perform an optimized, depth-first traversal of the UI tree to generate the commands.

### 1. Determining if a Repaint is Needed

To avoid generating commands for parts of the tree that haven't changed, we must first define what makes an element "dirty" for painting.

An element needs to be repainted if:
1.  Its visual style has changed (e.g., `backgroundColor`). This should be tracked with a flag on the element, like `isStyleDirty`.
2.  Its layout (position or size) has changed. This can be checked using the `yogaNode.getHasNewLayout()` function.
3.  One of its ancestors has moved, which means it has also moved. This state must be passed down during the traversal.

### 2. The Traversal Algorithm

- **`stack`**: The stack must now hold `[element, parentAbsoluteX, parentAbsoluteY, parentHasMoved]`.
- **Initialization**: `stack.push([rootElement, 0, 0, false])`

```typescript
// The new traversal loop
while (stack.length > 0) {
    const [currentElement, parentX, parentY, parentHasMoved] = stack.pop();

    const layoutChanged = currentElement.getYogaNode().getHasNewLayout();
    const needsRepaint = layoutChanged || currentElement.isStyleDirty || parentHasMoved;

    if (needsRepaint) {
        // 1. Calculate absolute position
        const layout = currentElement.getYogaNode().getComputedLayout();
        const absoluteX = parentX + layout.left;
        const absoluteY = parentY + layout.top;

        // 2. Generate draw commands and push to the list
        // ... (e.g., for background color, borders, text)
        drawCommandList.push({ type: 'RECT', ... });

        // 3. Reset the style dirty flag
        currentElement.isStyleDirty = false;

        // 4. Push children to stack
        const newParentHasMoved = layoutChanged || parentHasMoved;
        const children = currentElement.getChildren();
        for (let i = children.length - 1; i >= 0; i--) {
            stack.push([children[i], absoluteX, absoluteY, newParentHasMoved]);
        }
    }
}
```

## Conclusion

This optimized, iterative process ensures that command generation is as efficient as possible. It cleanly separates layout, paint, and draw logic, providing a solid foundation for a performant rendering pipeline.