import type { CanvasRenderingContext2D, MouseEventProps, Window } from "skia-canvas";
import { applyStyleToNode, type Style } from "../../types/Style";
import Yoga, { type Node } from "yoga-layout";
import { signal, Signal } from "@preact/signals-core";

export class Element {
    style: Style;
    protected yogaNode: Node;
    private x: number = 0;
    private y: number = 0;
    private children: Element[];
    onClick: ((e: {
        target: Window;
    } & MouseEventProps) => void) | null;
    hover: Signal<({
        hover: boolean;
        target: Window;
    } & MouseEventProps) | null>;
    constructor(style: Style) {
        this.children = [];
        this.style = style;
        this.yogaNode = Yoga.Node.create();
        applyStyleToNode(this.yogaNode, this.style);
        this.onClick = null;
        this.hover = signal(null);
    }
    getYogaNode() {
        return this.yogaNode;
    }
    appendChild(child: Element) {
        // Inherit styles from parent
        child.style = { ...this.style, ...child.style };
        this.children.push(child);
        this.yogaNode.insertChild(child.getYogaNode(), this.yogaNode.getChildCount());
    }
    removeChild(child: Element) {
        const index = this.children.indexOf(child);
        if (index !== -1) {
            this.children.splice(index, 1);
            const childNode = child.getYogaNode();
            this.yogaNode.removeChild(childNode);
            childNode.freeRecursive();
        }
    }
    removeChildAt(index: number) {
        const child = this.children[index];
        if (!child) return;
        this.children.splice(index, 1);
        const childNode = child.getYogaNode();
        this.yogaNode.removeChild(childNode);
        childNode.freeRecursive();
    }
    render(ctx: CanvasRenderingContext2D, x?: number, y?: number) {
        this.x = x || 0;
        this.y = y || 0;
        if (this.style.backgroundColor) {
            ctx.fillStyle = this.style.backgroundColor;
            ctx.fillRect(
                this.x + this.yogaNode.getComputedLeft(),
                this.y + this.yogaNode.getComputedTop(),
                this.yogaNode.getComputedWidth(),
                this.yogaNode.getComputedHeight()
            );
        }
        if (this.style.borderColor) {
            ctx.strokeStyle = this.style.borderColor;
            ctx.lineWidth = this.style.border?.width || 1;
            ctx.strokeRect(
                this.x + this.yogaNode.getComputedLeft(),
                this.y + this.yogaNode.getComputedTop(),
                this.yogaNode.getComputedWidth(),
                this.yogaNode.getComputedHeight()
            );
        }
        this.children.forEach(child => child.render(ctx, this.x + this.yogaNode.getComputedLeft(), this.y + this.yogaNode.getComputedTop()));
    }
    handleMouseEvent(event: {
        target: Window;
        type: "mouseup" | "mousedown" | "mousemove";
    } & MouseEventProps) {
        const x = event.x;
        const y = event.y;
        const left = this.x + this.yogaNode.getComputedLeft();
        const top = this.y + this.yogaNode.getComputedTop();
        const width = this.yogaNode.getComputedWidth();
        const height = this.yogaNode.getComputedHeight();
        // console.log(`Mouse event: ${event.type} at (${x}, ${y}), Left: ${left}, Top: ${top}, Width: ${width}, Height: ${height}`);
        if (x >= left && x <= left + width && y >= top && y <= top + height) {
            this.children.forEach(child => child.handleMouseEvent(event));
            if (event.type === "mouseup" && this.onClick) {
                this.onClick(event);
            }
            if (event.type === "mousemove" && !this.hover.value?.hover) {
                this.hover.value = { ...event, hover: true };
            }
        } else {
            if (event.type === "mousemove" && this.hover.value?.hover) {
                this.hover.value = { ...event, hover: false };
            }
        }
    }
}