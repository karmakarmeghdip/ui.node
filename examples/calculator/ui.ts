import { Align, Display, Edge, FlexDirection, Gutter, Justify } from "yoga-layout";
import { Element, Text } from "../../src/elements/canvas";
import { effect } from "@preact/signals-core";

// Palette inspired by the dark mockup
const colors = {
    appBg: "#1e1e2e",
    cardBg: "#0f1117",
    textPrimary: "#f2d5cf",
    textMuted: "#c6d0f5",
    gridBg: "#11131b",
    keyBg: "#151828",
    keyHover: "#1b1e30",
    accent: "#f38ba8",
};

type ButtonVariant = "default" | "accent" | "subtle";

function Button(label: string, variant: ButtonVariant = "default") {
    const baseBg = variant === "accent" ? colors.accent : variant === "subtle" ? colors.gridBg : colors.keyBg;
    const baseColor = variant === "accent" ? colors.cardBg : colors.textPrimary;

    const btn = Element(
        {
            backgroundColor: baseBg,
            borderRadius: 14,
            padding: { edge: Edge.All, value: 14 },
            // Add margin so keys never visually overlap even if Yoga gap isn't applied
            // margin: { edge: Edge.All, value: 6 },
            flexGrow: 1,
            justifyContent: Justify.Center,
            alignItems: Align.Center,
            display: Display.Flex,
        },
        Text(label, {
            fontFamily: "Inter, Arial",
            fontSize: 20,
            color: baseColor,
        })
    );

    // Simple hover effect
    effect(() => {
        const hovered = btn.hovered.value != null;
        const newBg = hovered
            ? variant === "accent"
                ? "#ff9bb6"
                : colors.keyHover
            : baseBg;
        btn.style.value = { ...btn.style.peek(), backgroundColor: newBg };
    });

    // Click feedback (for now just log)
    effect(() => {
        if (btn.clicked.value) {
            console.log("Pressed:", label);
        }
    });

    return btn;
}

function Row(...children: ReturnType<typeof Element>[]) {
    return Element(
        {
            display: Display.Flex,
            flexDirection: FlexDirection.Row,
            // Horizontal spacing between keys in a row
            gap: { gutter: Gutter.Row, gapLength: 8 },
        },
        ...children,
    );
}

// Display area with expression and result aligned to right
const display = Element(
    {
        backgroundColor: colors.cardBg,
        width: "100%",
        // flexDirection: FlexDirection.Column,
        // display: Display.Flex,
        padding: { edge: Edge.All, value: 20 },
        border: { edge: Edge.All, width: 1 },
        borderRadius: 18,
        gap: { gutter: Gutter.Column, gapLength: 6 },
    },
    Element(
        {
            display: Display.Flex,
            width: "100%",
            justifyContent: Justify.FlexEnd,
            border: { edge: Edge.All, width: 1 },
        },
        Text("15 x 10", {
            fontFamily: "Inter, Arial",
            fontSize: 28,
            color: colors.accent,
            border: { edge: Edge.All, width: 1 },
        }),
    ),
    Element(
        {
            display: Display.Flex,
            width: "100%",
            justifyContent: Justify.FlexEnd,
            border: { edge: Edge.All, width: 1 },
        },
        Text("= 150", {
            fontFamily: "Inter, Arial",
            fontSize: 18,
            color: colors.textMuted,
            border: { edge: Edge.All, width: 1 },
        }),
    ),
);

// Keypad grid
const keypad = Element(
    {
        backgroundColor: colors.gridBg,
        width: "100%",
        padding: { edge: Edge.All, value: 12 },
        borderRadius: 18,
        gap: { gutter: Gutter.Column, gapLength: 8 },
        border: { edge: Edge.All, width: 1 },
    },
    Row(Button("C", "subtle"), Button("⌫", "subtle"), Button("()", "subtle"), Button("+")),
    Row(Button("7"), Button("8"), Button("9"), Button("-")),
    Row(Button("4"), Button("5"), Button("6"), Button("×")),
    Row(Button("1"), Button("2"), Button("3"), Button("÷")),
    Row(Button("."), Button("0"), Button("%"), Button("=", "accent")),
);

export const app = Element(
    {
        backgroundColor: colors.appBg,
        width: "100%",
        height: "100%",
        display: Display.Flex,
        flexDirection: FlexDirection.Column,
        alignItems: Align.Center,
        justifyContent: Justify.Center,
    },
    Element(
        {
            backgroundColor: colors.cardBg,
            width: 360,
            padding: { edge: Edge.All, value: 16 },
            borderRadius: 28,
            gap: { gutter: Gutter.Column, gapLength: 12 },
            border: { edge: Edge.All, width: 1 },
        },
        Element(
            {
                width: "100%",
                display: Display.Flex,
                flexDirection: FlexDirection.Row,
                justifyContent: Justify.SpaceBetween,
                alignItems: Align.Center,
                border: { edge: Edge.All, width: 1 },
            },
            Text("Calculator", { fontFamily: "Inter, Arial", fontSize: 16, color: colors.textMuted, border: { edge: Edge.All, width: 1 }, }),
            // three-dots placeholder
            Text("⋮", { fontFamily: "Inter, Arial", fontSize: 18, color: colors.textMuted, border: { edge: Edge.All, width: 1 }, })
        ),
        display,
        keypad,
    ),
);

export default app;

