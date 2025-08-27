# Project Architecture

This document outlines the architecture for the Node Skia UI library, a simple and efficient UI framework for creating graphical user interfaces in Node.js. The library is built on the principles of retained-mode rendering, a multi-pass layout and paint system, and a reactive state management model using signals.

## Core Principles

**Current Implementation Status**: This architecture describes the target design. The current implementation has most core components in place but is partially implemented.

The architecture is designed around three core principles to ensure efficiency, maintainability, and ease of use.

### 1. Retained-Mode UI Tree ✅ **IMPLEMENTED**
The UI is represented as a persistent tree of element objects, known as the UI Tree. Each node in the tree is a plain object containing its style, children, and other properties.

**Current Implementation**: 
- ✅ BaseElement type with id, style signals, yogaNode references, parent/children relationships
- ✅ Element, Text, Image, Path node types implemented
- ✅ Tree manipulation functions (addChild, removeChild)
- ✅ Persistent Yoga node management with proper cleanup

### 2. Multi-Pass Rendering ⚠️ **PARTIALLY IMPLEMENTED**
The rendering process is intended to be broken down into distinct passes for optimization.

**Current Implementation**: 
1.  **Layout Pass ✅**: Implemented using Yoga Layout engine with proper node synchronization
2.  **Paint Pass ⚠️**: Partially implemented - basic paint functions exist but full iterative traversal missing
3.  **Draw Pass ✅**: Implemented with draw queue system and command processing

### 3. Reactive State with Signals ✅ **IMPLEMENTED**
State management is handled through Preact signals system.

**Current Implementation**: 
- ✅ Style properties bound to signals
- ✅ Repaint signals for dirty tracking
- ✅ Style change subscriptions trigger layout recalculation
- ✅ Signal changes properly trigger repaints

## Modules

The library is composed of several distinct modules, each with a specific responsibility.

### 1. UI Tree (`src/elements/canvas/`) ✅ **IMPLEMENTED**
-   **Responsibility:** Defines the fundamental structure of a UI node. It's the backbone of the UI representation.
-   **Current Implementation:**
    -   **Element Factory Functions:** `Element()`, `Text()`, `Image()`, `Path()` functions create typed UI nodes
    -   **BaseElement Structure:** Each element contains:
        -   `id`: Unique identifier (crypto.randomUUID())
        -   `type`: Node type discriminator ("element", "text", "image", "path")
        -   `style`: Preact signal containing style properties
        -   `children`: Array of child UINode elements
        -   `parent`: Reference to parent UINode or null
        -   `yogaNode`: Reference to corresponding Yoga layout node
        -   `repaint`: Signal flag for paint dirty tracking
        -   `position`: Calculated absolute position {x, y}
    -   **Tree Management:** `addChild()` and `removeChild()` functions with proper Yoga node synchronization
-   **Current Status:**
    -   ✅ Fully functional UI tree with proper parent/child relationships
    -   ✅ Automatic Yoga node management and cleanup
    -   ✅ Type-safe node creation with factory functions

### 2. Layout Engine (`src/core/Layout.ts`) ✅ **IMPLEMENTED**
-   **Responsibility:** Manages all layout calculations by interfacing with the **Yoga Layout** library.
-   **Current Implementation:**
    -   **Tree Traversal:** `iterateNodeTree()` function for efficient tree iteration
    -   **Layout Orchestration:** `layout()` function that:
        -   Calls `calculateLayout()` on root Yoga node
        -   Updates node positions based on computed layout
        -   Sets up style change subscriptions
        -   Manages repaint subscriptions and triggers
    -   **Yoga Integration:** 
        -   ✅ Persistent Yoga tree maintained alongside UI tree
        -   ✅ Automatic `hasNewLayout()` checking for optimization
        -   ✅ Position calculation with parent offset handling
        -   ✅ Style subscription system triggers layout recalculation
-   **Current Status:**
    -   ✅ Fully functional layout system
    -   ✅ Comprehensive test coverage (Layout.test.ts)
    -   ⚠️ Style changes trigger full tree recalculation (could be optimized)

### 3. Style Engine (`src/style/`) ✅ **IMPLEMENTED**
-   **Responsibility:** Defines and applies styles to UI elements.
-   **Current Implementation:**
    -   **Style Type Definition:** Comprehensive `Style` type covering:
        -   ✅ Flexbox properties (flexDirection, justifyContent, alignItems, etc.)
        -   ✅ Layout properties (width, height, margin, padding, border)
        -   ✅ Visual properties (color, backgroundColor, borderColor)
        -   ✅ Typography (fontFamily, fontSize)
    -   **Style Application:** `applyStyleToNode()` function:
        -   ✅ Maps style properties to Yoga node setters
        -   ✅ Distinguishes layout vs visual-only changes
        -   ✅ Returns whether repaint is needed
    -   **Style Subscription:** `listenToStyleChanges()` for reactive updates
    -   **Visual Rendering:** Separate modules for background and border painting
-   **Current Status:**
    -   ✅ Complete style system with Yoga integration
    -   ✅ Proper separation of layout and visual properties
    -   ❌ String-based style parsing not implemented (uses object syntax)

### 4. Renderer (`src/core/Renderer.ts`) ✅ **IMPLEMENTED**
-   **Responsibility:** Manages the draw command queue system for rendering.
-   **Current Implementation:**
    -   **Draw Queue:** `drawQueue` array holds drawing commands as functions
    -   **Command Enqueueing:** `enqueueDrawCommand()` adds commands to queue
    -   **Queue Processing:** `processDrawQueue()` executes and clears all commands
    -   **Command Type:** Simple function signature `(ctx: CanvasRenderingContext2D) => void`
-   **Current Status:**
    -   ✅ Fully functional producer-consumer draw queue
    -   ✅ Comprehensive test coverage (Renderer.test.ts)
    -   ✅ FIFO command execution with error handling
    -   ❌ Paint Pass orchestration not implemented
    -   ❌ Automatic draw event integration missing

### 5. Event Manager ❌ **NOT IMPLEMENTED**
-   **Responsibility:** Would handle user input from the `skia-canvas` `Window`.
-   **Current Status:**
    -   ❌ No EventManager module exists
    -   ❌ No hit-testing implementation
    -   ❌ No event handler system for UI elements
    -   ⚠️ Basic mouse events handled directly in main entry point (index.ts)
-   **Required Implementation:**
    -   Create `src/core/EventManager.ts`
    -   Implement hit-testing algorithm using computed layout
    -   Add event handler system to UINode types
    -   Connect to window event listeners

## Current Rendering Pipeline Status

**Implementation Status**: The rendering pipeline is partially implemented with key components working but integration incomplete.

### ✅ **WORKING COMPONENTS**

1.  **Signal-Based State Changes**: 
    -   ✅ Preact signals trigger layout and repaint updates
    -   ✅ Style subscriptions properly connected

2.  **Layout Pass**: 
    -   ✅ `calculateLayout()` called on root Yoga node
    -   ✅ Position updates based on computed layout
    -   ✅ Efficient dirty checking with `hasNewLayout()`

3.  **Draw Queue System**: 
    -   ✅ Command enqueueing and processing
    -   ✅ FIFO execution with proper cleanup

### ⚠️ **MISSING INTEGRATION**

1.  **Paint Pass**: 
    -   ✅ Individual paint functions exist (paintElement, paintBackground, paintBorder)
    -   ❌ Complete iterative tree traversal missing
    -   ❌ Automatic draw command generation incomplete

2.  **Producer-Consumer Integration**:
    -   ❌ `draw` event not connected to `processDrawQueue`
    -   ❌ Signal changes don't automatically trigger paint pass
    -   ❌ Manual render calls still needed

### 🚧 **CURRENT WORKFLOW**

The current implementation uses a manual rendering approach:
1. Layout calculation on setup/resize events
2. Direct rendering calls instead of command queue
3. No automatic repainting on signal changes

### 🎯 **NEXT STEPS FOR COMPLETION**

1. Implement complete paint pass with iterative traversal
2. Connect draw event to processDrawQueue
3. Remove manual render calls from main loop
4. Add automatic paint pass triggering on signal changes