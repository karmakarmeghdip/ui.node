import { Display, Edge, Gutter, Wrap, type Align, type Direction, type FlexDirection, type Justify, type Node } from "yoga-layout";
import type { UINode } from "../elements/canvas";

export type Style = {
    flexDirection?: FlexDirection;
    direction?: Direction;
    justifyContent?: Justify;
    alignContent?: Align;
    alignItems?: Align;
    padding?: { edge: Edge, value: number | `${number}%` | undefined };
    margin?: { edge: Edge, value: number | `${number}%` | undefined };
    border?: { edge: Edge, width: number };
    width?: number | `${number}%` | "auto" | undefined;
    height?: number | `${number}%` | "auto" | undefined;
    minWidth?: number | `${number}%` | undefined;
    minHeight?: number | `${number}%` | undefined;
    maxWidth?: number | `${number}%` | undefined;
    maxHeight?: number | `${number}%` | undefined;
    aspectRatio?: number;
    display?: Display;
    flexGrow?: number;
    flexShrink?: number;
    flexBasis?: number | "auto" | `${number}%` | undefined;
    flexWrap?: Wrap;
    gap?: { gutter: Gutter, gapLength: number | `${number}%` | undefined };
    position?: { edge: Edge, position: number | `${number}%` | undefined };
    color?: string;
    backgroundColor?: string;
    borderColor?: string;
    fontFamily?: string;
    fontSize?: number;
}

export function applyStyleToNode(node: Node, style: Style) {
    if (style.flexDirection) {
        node.setFlexDirection(style.flexDirection);
    }
    if (style.direction) {
        node.setDirection(style.direction);
    }
    if (style.justifyContent) {
        node.setJustifyContent(style.justifyContent);
    }
    if (style.alignContent) {
        node.setAlignContent(style.alignContent);
    }
    if (style.alignItems) {
        node.setAlignItems(style.alignItems);
    }
    if (style.padding) {
        node.setPadding(style.padding.edge, style.padding.value);
    }
    if (style.margin) {
        node.setMargin(style.margin.edge, style.margin.value);
    }
    if (style.border) {
        node.setBorder(style.border.edge, style.border.width);
    }
    if (style.width) {
        node.setWidth(style.width);
    }
    if (style.height) {
        node.setHeight(style.height);
    }
    if (style.minWidth) {
        node.setMinWidth(style.minWidth);
    }
    if (style.minHeight) {
        node.setMinHeight(style.minHeight);
    }
    if (style.maxWidth) {
        node.setMaxWidth(style.maxWidth);
    }
    if (style.maxHeight) {
        node.setMaxHeight(style.maxHeight);
    }
    if (style.aspectRatio) {
        node.setAspectRatio(style.aspectRatio);
    }
    if (style.display) {
        node.setDisplay(style.display);
    }
    if (style.flexGrow) {
        node.setFlexGrow(style.flexGrow);
    }
    if (style.flexShrink) {
        node.setFlexShrink(style.flexShrink);
    }
    if (style.flexBasis) {
        node.setFlexBasis(style.flexBasis);
    }
    if (style.flexWrap) {
        node.setFlexWrap(style.flexWrap);
    }
    if (style.gap) {
        node.setGap(style.gap.gutter, style.gap.gapLength);
    }
    if (style.position) {
        node.setPosition(style.position.edge, style.position.position);
    }
}
