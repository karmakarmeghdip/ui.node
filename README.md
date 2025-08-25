# Roadmap

This document outlines the development roadmap for refactoring the library to a more robust, maintainable, and performant architecture. The tasks are ordered by priority.

## Phase 1: Core Rendering Pipeline
*Goal: Implement the foundational, non-blocking rendering loop based on the new architecture. This is the highest priority.* 

1.  **Implement the Core Renderer:**
    -   Create the `Renderer` module (`src/core/Renderer.ts`).
    -   It will manage a shared `drawCommands` array.
    -   Implement the `onDraw` event handler (the "consumer") which, on each frame, checks if `drawCommands` is populated. If it is, it executes the commands and then clears the array.

2.  **Implement the Iterative Paint Pass:**
    -   Create the "Paint Pass" logic (the "producer"), which is triggered by state changes.
    -   This pass will perform an optimized, iterative traversal of the UI tree using a stack.
    -   It must check for dirty nodes using `yogaNode.getHasNewLayout()` for layout changes and a new `isStyleDirty` flag for visual-only changes.
    -   Its output will be a complete list of draw commands for the new frame, which it places in the shared `drawCommands` array.

3.  **Refactor Style Management:**
    -   Make the `style` property on `Element` private.
    -   Create a public `setStyle` method.
    -   This setter will be responsible for:
        -   Calling the appropriate `yogaNode.set...()` methods for layout-related properties.
        -   Setting an internal `isStyleDirty = true` flag for visual-only properties (e.g., `backgroundColor`).

4.  **Refactor the Main Loop (`index.ts`):**
    -   Remove the current `render` calls from the `setup` and `resize` event handlers.
    -   The main loop should only be responsible for triggering the initial Layout and Paint passes.
    -   The `onDraw` event should be bound to the new Core Renderer's drawing logic.

## Phase 2: Input and State Management
*Goal: Connect user interactions to the rendering pipeline.* 

1.  **Implement the EventManager:**
    -   Create the `EventManager` module (`src/core/EventManager.ts`).
    -   It will listen for mouse events from the `skia-canvas` window.
    -   It will perform hit-testing by traversing the UI tree and checking coordinates against each element's computed layout.

2.  **Connect State to Rendering:**
    -   Ensure that event handlers (e.g., `onClick`, `onHover`) can update state via signals.
    -   Verify that a signal change correctly triggers the **Paint Pass** to run, which in turn populates the `drawCommands` array for the renderer.

## Phase 3: Feature Enhancements
*Goal: Build out advanced features on top of the stable core.* 

1.  **Implement a Style Parser:**
    -   Flesh out the `StyleEngine` to parse a convenient syntax (e.g., Tailwind classes) into the style objects the library uses.

2.  **Implement a Scrollable Element:**
    -   This complex feature will require managing viewport state, scroll offsets, and clipping drawing commands that are outside the visible area.

3.  **Add TSX/JSX Support:**
    -   Investigate and implement a TSX-based syntax for defining UI trees, which would involve a transpilation step and a custom `jsx-runtime`.

## Phase 4: API Refinement & Polish
*Goal: Finalize the public API and improve developer experience.* 

1.  **Finalize Public API:**
    -   Review and simplify the methods for creating elements and managing the application.
    -   Ensure internal properties and methods are properly encapsulated (made private).

2.  **Write Documentation & Examples:**
    -   Create comprehensive documentation for the public API.
    -   Build more complex example applications to showcase the library's features.
