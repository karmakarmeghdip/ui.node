# Project Architecture

This document outlines the architecture for the Node Skia UI library, a simple and efficient UI framework for creating graphical user interfaces in Node.js. The library is built on the principles of retained-mode rendering, a multi-pass layout and paint system, and a reactive state management model using signals.

## Core Principles

**Current Implementation Status**: This architecture describes the target design. The current implementation has most core components in place and is nearly complete.

The architecture is designed around three core principles to ensure efficiency, maintainability, and ease of use.

### 1. Retained-Mode UI Tree ✅ **IMPLEMENTED**
The UI is represented as a persistent tree of element objects, known as the UI Tree. Each node in the tree is a plain object containing its style, children, and other properties.

**Current Implementation**: 
- ✅ BaseElement type with id, style signals, yogaNode references, parent/children relationships
- ✅ Element, Text, Image, Path node types implemented
- ✅ Tree manipulation functions (addChild, removeChild)
- ✅ Persistent Yoga node management with proper cleanup

### 2. Multi-Pass Rendering ✅ **IMPLEMENTED**
The rendering process is broken down into distinct passes for optimization.

**Current Implementation**: 
1.  **Layout Pass ✅**: Implemented using Yoga Layout engine. When a node's layout changes, it is marked as dirty.
2.  **Paint Pass ✅**: Integrated directly into the layout pass. When `layoutNodeAndChildren` detects a node with a new layout (`hasNewLayout()`), it immediately calls `paintNode()` for that node, which enqueues draw commands.
3.  **Draw Pass ✅**: Implemented with a draw queue system. The `window`'s `frame` event processes this queue, executing the draw commands on the canvas.

### 3. Reactive State with Signals ✅ **IMPLEMENTED**
State management is handled through the Preact signals system.

**Current Implementation**: 
- ✅ Style properties are bound to signals.
- ✅ `clicked` and `hovered` states are implemented as signals.
- ✅ Style change subscriptions automatically trigger a layout recalculation.
- ✅ Layout changes trigger the paint process, ensuring the UI is always up-to-date.

## Modules

The library is composed of several distinct modules, each with a specific responsibility.

### 1. UI Tree (`src/elements/canvas/`) ✅ **IMPLEMENTED**
-   **Responsibility:** Defines the fundamental structure of a UI node. It's the backbone of the UI representation.
-   **Current Implementation:**
    -   **Element Factory Functions:** `Element()`, `Text()`, `Image()`, `Path()` functions create typed UI nodes.
    -   **BaseElement Structure:** Each element contains an `id`, `type`, `style` signal, `children`, `parent`, `yogaNode`, and state signals like `clicked` and `hovered`.
    -   **Tree Management:** `addChild()` and `removeChild()` functions with proper Yoga node synchronization.
-   **Current Status:**
    -   ✅ Fully functional UI tree with proper parent/child relationships.
    -   ✅ Automatic Yoga node management and cleanup.
    -   ✅ Type-safe node creation with factory functions.

### 2. Layout Engine (`src/core/Layout.ts`) ✅ **IMPLEMENTED**
-   **Responsibility:** Manages all layout calculations by interfacing with the **Yoga Layout** library and triggers the paint process.
-   **Current Implementation:**
    -   **Layout Orchestration:** `layoutNodeAndChildren()` function that:
        -   Calls `calculateLayout()` on the root Yoga node.
        -   Iterates the tree and checks for `hasNewLayout()`.
        -   Updates node positions based on the computed layout.
        -   **Triggers `paintNode()` for any node whose layout has changed.**
    -   **Reactive Updates:** `setupLayout` subscribes to style signal changes, which re-runs the layout calculation.
-   **Current Status:**
    -   ✅ Fully functional layout system integrated with painting.
    -   ✅ Style changes correctly trigger relayout and repaint.
    -   ⚠️ Style changes trigger a full tree recalculation, which could be optimized.

### 3. Style Engine (`src/style/`) ✅ **IMPLEMENTED**
-   **Responsibility:** Defines and applies styles to UI elements.
-   **Current Implementation:**
    -   **Style Type Definition:** Comprehensive `Style` type covering Flexbox, layout, and visual properties.
    -   **Style Application:** `applyStyleToNode()` function maps style properties to Yoga node setters.
    -   **Visual Rendering:** Separate modules for background (`paintBackground`) and border (`paintBorder`) painting.
-   **Current Status:**
    -   ✅ Complete style system with Yoga integration.
    -   ✅ Proper separation of layout and visual properties.
    -   ❌ String-based style parsing not implemented (uses object syntax).

### 4. Renderer (`src/core/Renderer.ts`) ✅ **IMPLEMENTED**
-   **Responsibility:** Manages the draw command queue for rendering.
-   **Current Implementation:**
    -   **Draw Queue:** A `drawQueue` array holds drawing commands.
    -   **Command Enqueueing:** `enqueueDrawCommand()` adds commands to the queue.
    -   **Queue Processing:** `processDrawQueue()` is called on every `frame` event from the window, executing all commands in the queue.
-   **Current Status:**
    -   ✅ Fully functional producer-consumer draw queue.
    -   ✅ Automatically driven by the window's render loop (`frame` event).

### 5. Input Manager (`src/core/Input.ts`) ✅ **IMPLEMENTED**
-   **Responsibility:** Handles user input from the `skia-canvas` `Window`.
-   **Current Status:**
    -   ✅ `Input.ts` module exists and is connected in `Window.ts`.
    -   ✅ Implements basic hit-testing by checking mouse coordinates against the computed layout of elements.
    -   ✅ Manages a `currentHoveredNode` signal.
    -   ✅ Updates the `clicked` signal on nodes.
    -   ❌ Event handler properties (`onClick`, `onHover`) are not yet implemented on UI nodes.

## Current Rendering Pipeline Status

**Implementation Status**: The rendering pipeline is fully implemented and functional.

### ✅ **WORKING COMPONENTS**

1.  **Signal-Based State Changes**: 
    -   ✅ Preact signals are used for style and input state (`hovered`, `clicked`).
    -   ✅ Style signal changes correctly trigger a relayout.

2.  **Layout and Paint Pass**: 
    -   ✅ `layoutNodeAndChildren` is called on window resize or style changes.
    -   ✅ It efficiently checks for dirty nodes using `hasNewLayout()`.
    -   ✅ For each updated node, it recalculates its position and calls `paintNode` to enqueue new draw commands.

3.  **Draw Pass**: 
    -   ✅ The `window.on("frame", ...)` event handler calls `processDrawQueue()` on every frame.
    -   ✅ This provides a clean, non-blocking render loop that only draws when there are commands in the queue.

### 🎯 **NEXT STEPS FOR COMPLETION**

1.  **Implement Element Renderers**: Add paint logic for `Text`, `Image`, and `Path` elements.
2.  **Add Event Handlers**: Implement `onClick`, `onHover`, etc., on UI nodes to respond to input.
3.  **Optimize Layout**: Prevent full tree recalculation on localized style changes.
