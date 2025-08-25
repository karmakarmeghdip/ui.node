# Project Architecture

This document outlines the architecture for the Node Skia UI library, a simple and efficient UI framework for creating graphical user interfaces in Node.js. The library is built on the principles of retained-mode rendering, a multi-pass layout and paint system, and a reactive state management model using signals.

## Core Principles

The architecture is designed around three core principles to ensure efficiency, maintainability, and ease of use.

### 1. Retained-Mode UI Tree
The UI is represented as a persistent tree of element objects, known as the UI Tree. Instead of re-creating the entire scene on every frame, the library "retains" the tree and only processes the nodes that have changed. Each node in the tree is a plain object containing its style, children, and other properties.

### 2. Multi-Pass Rendering
The rendering process is broken down into distinct passes, which allows for better optimization and separation of concerns. This moves away from a single, recursive draw function to a more robust, iterative process.

1.  **Layout Pass:** Calculates the size and position of every element in the tree using the **Yoga Layout** engine.
2.  **Paint Pass:** Traverses the UI tree and generates a flat list of drawing commands (a "display list") for all visible elements.
3.  **Draw Pass:** Executes the commands in the display list on the **skia-canvas** context to render the final image.

### 3. Reactive State with Signals
State management is handled through a signal-based system. UI properties are bound to signals. When a signal's value changes, it automatically marks the dependent UI elements as "dirty." The rendering engine then uses this information to efficiently update only the necessary parts of the UI during the next frame, triggering the layout and paint passes as needed.

## Modules

The library is composed of several distinct modules, each with a specific responsibility.

### 1. UI Tree (`src/core/Element.ts`)
-   **Responsibility:** Defines the fundamental structure of a UI node. It's the backbone of the UI representation.
-   **Components:**
    -   **Element Factory:** A function to create new UI element objects. Each element contains:
        -   `style`: A signal containing style properties (e.g., `width`, `flexDirection`, `color`).
        -   `children`: An array of child elements.
        -   `parent`: A reference to its parent element.
        -   `yogaNode`: A reference to its corresponding node in the persistent Yoga layout tree.
        -   `isDirty`: A flag to indicate if the element needs a **paint** update (layout dirtiness is handled by Yoga).
-   **Interaction:**
    -   The UI Tree is constructed by the application developer.
    -   The **Layout Engine** maintains a parallel, persistent tree of `yogaNode`s.
    -   The **Renderer** traverses this tree to generate draw commands.

### 2. Layout Engine (`src/core/Layout.ts`)
-   **Responsibility:** Manages all layout calculations by interfacing with the **Yoga Layout** library. It maintains a persistent Yoga tree that mirrors the UI tree.
-   **API Reference:** [Yoga Layout Best Practices](./YogaLayout.md)
-   **Interaction:**
    -   It maintains a persistent Yoga tree. When UI elements are added or removed, it uses `insertChild()` and `removeChild()` to keep the Yoga tree in sync.
    -   It listens for style changes on UI elements. When a layout-related style is updated, it calls the corresponding setter (e.g., `yogaNode.setWidth()`) on the Yoga node. This automatically marks the node as dirty within Yoga's internal system.
    -   During the render loop's layout phase, it calls `Yoga.Node.calculateLayout()` on the **root** of the Yoga tree. Yoga then performs an optimized calculation, only updating nodes that are dirty.
    -   The calculated layout (`left`, `top`, `width`, `height`) is read back from the Yoga nodes after calculation.

### 3. Style Engine (`src/core/Style.ts`)
-   **Responsibility:** Parses and applies styles to UI elements.
-   **Components:**
    -   **Style Parser:** A function to convert string-based styles into a style object.
    -   **Style Signal:** Each element's `style` property is a signal. When its value changes, it triggers the necessary updates.
-   **Interaction:**
    -   When a layout-related style property changes (e.g., `flex`, `margin`), the Style Engine calls the appropriate setter function on the element's `yogaNode` in the **Layout Engine**.
    -   It provides non-layout styles (e.g., `backgroundColor`, `color`) to the **Renderer** for the paint pass.

### 4. Renderer (`src/core/Renderer.ts`)
-   **Responsibility:** Orchestrates the rendering pipeline. It triggers the paint pass when needed and executes drawing commands on the canvas during the `draw` event.
-   **API Reference:** [Paint Process](./Paint-Process.md)
-   **Components:**
    -   **Draw Command List:** A shared array that holds the drawing commands for a single frame. It is populated by the Paint Pass and consumed by the Draw Pass.
-   **Interaction:**
    -   The **Paint Pass** is triggered by state changes in the application. It runs an optimized traversal of the UI tree and populates the `Draw Command List` with a complete set of instructions for rendering the new frame.
    -   The **Draw Pass** is triggered by the `skia-canvas` `Window`'s `draw` event. It checks if the `Draw Command List` is populated. If it is, it renders the commands to the canvas and then clears the list. If the list is empty, it does nothing.

### 5. Event Manager (`src/core/EventManager.ts`)
-   **Responsibility:** Handles user input from the `skia-canvas` `Window` (e.g., `mousedown`, `keydown`).
-   **Interaction:**
    -   It listens for UI events from the `Window`.
    -   When an event occurs (e.g., a click at coordinates `(x, y)`), it performs a hit-test by traversing the rendered UI Tree (using the computed layout data) to find the element that should receive the event.
    -   It then invokes the appropriate event handler on the target element, which may in turn update one or more **signals**, triggering the Paint Pass.

## Rendering Pipeline Overview

The rendering loop uses a highly efficient producer-consumer model.

1.  **State Change (Producer Trigger):** An event handler or application logic updates a signal. This is the trigger to generate a new frame.
2.  **Layout & Paint Pass (Producer):**
    -   The signal change triggers the **Layout Pass**. `calculateLayout()` is called on the root Yoga node to efficiently update the layout tree.
    -   Immediately after, the **Paint Pass** runs. It performs an optimized iterative traversal of the UI tree, checking for nodes that need repainting (due to layout or style changes). It generates a **new, complete** list of drawing commands and places them in the shared `Draw Command List`.
3.  **Draw Pass (Consumer):**
    -   The `Window`'s `draw` event fires independently (e.g., on a vsync timer).
    -   The event handler checks if the `Draw Command List` has any commands. 
    -   If **yes**, it clears the canvas, executes every command in the list, and then **clears the list**.
    -   If **no** (the default state), it does nothing, consuming no resources.
4.  **Idle State:** The system is now idle. The `draw` event continues to fire, but the handler does nothing until the `Draw Command List` is populated again by another state change.

This architecture provides a solid foundation for building a performant and scalable UI library, separating concerns cleanly between layout, styling, state management, and rendering.