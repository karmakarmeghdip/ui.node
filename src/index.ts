// Core UI node factory functions
export { Element, Image, Path, Text } from "./elements/canvas";

// Window management
export { createWindow, closeWindow, closeWindowId, getWindow } from "./core/Window";

// Core types
export type { UINode } from "./elements/canvas";
export type { Style } from "./style/Style";

// Re-export enums and types from Yoga Layout for convenience
export {
    Align,
    Direction,
    Display,
    Edge,
    FlexDirection,
    Gutter,
    Justify,
    MeasureMode,
    NodeType,
    Overflow,
    PositionType,
    Unit,
    Wrap,
} from "yoga-layout";
