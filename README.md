# UI.node

## Project Status: In Development

The core architecture is complete and functional. The library currently supports:
- A retained-mode UI tree with `Element`, `Text`, `Image`, and `Path` nodes.
- A reactive layout and styling system using Preact Signals and the Yoga Layout engine.
- An efficient rendering pipeline using a producer-consumer model with a draw queue.
- **Full text rendering** with font styling, measurement, and positioning.
- **Complete input handling** with hit-testing, mouse event processing, and reactive `clicked`/`hovered` signals.UI

A simple and efficient UI framework for creating graphical user interfaces in Node.js, powered by Skia and Yoga Layout.

## Project Status: In Development

The core architecture is complete and functional. The library currently supports:
- A retained-mode UI tree with `Element`, `Text`, `Image`, and `Path` nodes.
- A reactive layout and styling system using Preact Signals and the Yoga Layout engine.
- An efficient rendering pipeline using a producer-consumer model with a draw queue.
- **Full text rendering** with font styling, measurement, and positioning.
- Basic input handling for mouse hover and click states with hit-testing.

## Roadmap

This document outlines the development roadmap to reach a feature-complete state.

### Phase 0: Fix Event Loop Architecture (Critical Priority)
*Goal: Resolve Node.js event loop blocking for real desktop application usage.*

1.  **Event Loop Architecture**: The current implementation blocks the Node.js event loop, preventing asynchronous operations. Two solutions are being considered:
    - **Option A**: Use skia-canvas "node" event loop mode with continuous polling
    - **Option B**: Implement dual-thread architecture with a dedicated renderer worker thread

### Phase 1: Complete Remaining Element Renderers (High Priority)
*Goal: Implement the visual rendering for all standard UI elements.*

1.  **Image Rendering**: Implement the paint logic for `Image` nodes, including asynchronous image loading.
2.  **Path Rendering**: Implement the paint logic for `Path` nodes to render SVG-like path data.

~~**Text Rendering**: ✅ COMPLETED - Full text rendering with font styling and measurement is now implemented.~~

### Phase 2: Advanced Interactivity (Medium Priority)
*Goal: Connect user input to application logic.*

1.  **Create Demo Application**: Build a sample application to showcase interactive elements and validate the event system.

~~**Enhanced Input Manager**: ✅ COMPLETED - Hit-testing, mouse events, and reactive `clicked`/`hovered` signals are fully implemented.~~

### Phase 3: Advanced Features (Low Priority)
*Goal: Add powerful features for a better developer experience.*

1.  **Style Parser**: Implement a utility to parse CSS-like strings into the library's style objects.
2.  **Scrollable Elements**: Add support for scrollable containers with viewport clipping.
3.  **JSX/TSX Support**: Create a JSX runtime to enable defining UI with a familiar, declarative syntax.

### Phase 4: API Refinement & Polish
*Goal: Finalize the public API and improve documentation.*

1.  **Finalize Public API**: Review and simplify the methods for creating elements and managing the application.
2.  **Write Documentation & Examples**: Create comprehensive documentation and build more complex example applications.