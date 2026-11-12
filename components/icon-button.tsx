"use client";

import { createElement, type ComponentPropsWithRef, type ReactNode } from "react";

/*
 * Icon Button – a single self-contained file.
 * A square button that is only an icon: quiet ghost, a white button with a 1px edge, or a dark gradient. It can stay
 * pressed (a toggle), and its label is both the accessible name and the tooltip.
 * The styles are injected below, so no extra files are needed.
 */

/** An icon from Hugeicons (e.g. `import { Search01Icon } from "@hugeicons/core-free-icons"`) – drawn inline */
export type HugeIcon = readonly (readonly [string, { readonly [key: string]: string | number }])[];

export type IconButtonProps = Omit<ComponentPropsWithRef<"button">, "children"> & {
  /** The glyph: any element (an inline SVG) or a Hugeicons icon object */
  icon: ReactNode | HugeIcon;
  /** What the button does – read out by screen readers and shown as the tooltip */
  label: string;
  /** ghost: just the icon, a soft wash on hover · secondary: white with a 1px edge · primary: a dark gradient */
  variant?: "ghost" | "secondary" | "primary";
  /** sm: 32 × 32 · md: 40 × 40 – the same heights as the Button – the hit area grows on touch screens */
  size?: "sm" | "md";
  /** Makes it a toggle: true or false sets aria-pressed and keeps it looking pressed while true */
  pressed?: boolean;
};

export function IconButton({
  icon,
  label,
  variant = "ghost",
  size = "md",
  pressed,
  title,
  className,
  type = "button",
  ...rest
}: IconButtonProps) {
  // Unknown values fall back to the defaults instead of an unstyled button
  const tone = VARIANTS.includes(variant) ? variant : "ghost";
  const scale = size === "sm" ? "sm" : "md";

  return (
    <>
      {/* React 19 hoists this into <head> once, no matter how many buttons render */}
      <style href="ui-icon-button" precedence="default">
        {css}
      </style>
      <button
        type={type}
        className={["ui-icb", className].filter(Boolean).join(" ")}
        data-variant={tone}
        data-size={scale}
        aria-label={label}
        // The label doubles as the tooltip; pass title="" to leave it out
        title={title ?? label}
        aria-pressed={pressed}
        {...rest}
      >
        <span className="ui-icb__icon" aria-hidden="true">
          <Glyph icon={icon} />
        </span>
      </button>
    </>
  );
}

const VARIANTS = ["ghost", "secondary", "primary"];

const isHugeIcon = (icon: unknown): icon is HugeIcon =>
  Array.isArray(icon) && icon.length > 0 && icon.every((part) => Array.isArray(part) && typeof part[0] === "string");

/** Draws a Hugeicons icon object as an inline SVG at the button's stroke; anything else is shown as it is */
function Glyph({ icon }: { icon: ReactNode | HugeIcon }) {
  if (!isHugeIcon(icon)) return <>{icon}</>;
  return (
    <svg viewBox="0 0 24 24" fill="none" focusable="false">
      {icon.map(([tag, { key, ...attrs }], i) =>
        createElement(tag, { ...attrs, key: String(key ?? i), ...("strokeWidth" in attrs ? { strokeWidth: STROKE } : null) }),
      )}
    </svg>
  );
}
const STROKE = 1.75;

/* ---------- Styles ---------- */

const css = /* css */ `
/* Colors as variables – override them on .ui-icb (see Theming in the docs) */
.ui-icb {
  --ui-icb-icon: var(--aui-muted, #737373);
  --ui-icb-ink: var(--aui-ink, #171717);
  --ui-icb-hover: #404040;
  --ui-icb-fill: #f0f0f0;
  --ui-icb-pressed: #e8e8e8;
  --ui-icb-surface: var(--aui-surface, #ffffff);
  --ui-icb-surface-hover: #fafafa;
  --ui-icb-surface-shadow: rgba(0, 0, 0, 0.06);
  --ui-icb-line: var(--aui-border, #e5e5e5);
  --ui-icb-on-ink: #fafafa;
  --ui-icb-dark-top: #323137;
  --ui-icb-dark-bottom: #201e25;
  --ui-icb-dark-hover-top: #3c3b42;
  --ui-icb-dark-hover-bottom: #29272f;
  --ui-icb-edge-top: #4b4951;
  --ui-icb-edge-mid: #31303a;
  --ui-icb-edge-bottom: #18171b;
  --ui-icb-ring: #0d0d0d;
  --ui-icb-dark-shadow: rgba(0, 0, 0, 0.1);
  --ui-icb-focus: var(--aui-focus, rgba(0, 96, 226, 0.7));
  --ui-icb-ease: cubic-bezier(0.22, 1, 0.36, 1);

  --size: 40px;
  --icon: 18px;
  --radius: var(--aui-radius, 12px);

  position: relative;
  display: inline-grid;
  place-items: center;
  flex: none;
  box-sizing: border-box;
  width: var(--size);
  height: var(--size);
  padding: 0;
  margin: 0;
  border: 1px solid transparent;
  border-radius: var(--radius);
  background: transparent;
  color: var(--ui-icb-icon);
  font: inherit;
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  transition:
    background-color 160ms ease,
    border-color 160ms ease,
    color 160ms ease,
    box-shadow 160ms ease,
    transform 160ms var(--ui-icb-ease),
    opacity 160ms ease;
}
.ui-icb[data-size="sm"] {
  --size: 32px;
  --icon: 16px;
  --radius: calc(var(--aui-radius, 12px) - 2px);
}

.ui-icb__icon {
  display: grid;
  place-items: center;
  width: var(--icon);
  height: var(--icon);
  pointer-events: none;
}
.ui-icb__icon > svg,
.ui-icb__icon > img {
  display: block;
  width: 100%;
  height: 100%;
}

/* ghost: just the icon, the gray layer appears on hover */
.ui-icb[data-variant="ghost"]:hover:not(:disabled) {
  background: var(--ui-icb-fill);
  color: var(--ui-icb-hover);
}
.ui-icb[data-variant="ghost"][aria-pressed="true"] {
  background: var(--ui-icb-pressed);
  color: var(--ui-icb-ink);
}

/* secondary: white with the card outline */
.ui-icb[data-variant="secondary"] {
  background: var(--ui-icb-surface);
  border-color: var(--ui-icb-line);
  box-shadow: 0 1px 2px var(--ui-icb-surface-shadow);
}
.ui-icb[data-variant="secondary"]:hover:not(:disabled) {
  background: var(--ui-icb-surface-hover);
  color: var(--ui-icb-hover);
}
/* Pressed sinks into the gray layer, the shadow goes */
.ui-icb[data-variant="secondary"][aria-pressed="true"] {
  background: var(--ui-icb-fill);
  box-shadow: none;
  color: var(--ui-icb-ink);
}

/* primary: a dark gradient with a light edge running down the border and a 1px ring, like the Button */
.ui-icb[data-variant="primary"] {
  background:
    linear-gradient(var(--ui-icb-dark-top), var(--ui-icb-dark-bottom)) padding-box,
    linear-gradient(var(--ui-icb-edge-top), var(--ui-icb-edge-mid), var(--ui-icb-edge-bottom)) border-box;
  color: var(--ui-icb-on-ink);
  box-shadow:
    0 0 0 1px var(--ui-icb-ring),
    0 2px 4px var(--ui-icb-dark-shadow);
}
.ui-icb[data-variant="primary"]:hover:not(:disabled) {
  background:
    linear-gradient(var(--ui-icb-dark-hover-top), var(--ui-icb-dark-hover-bottom)) padding-box,
    linear-gradient(var(--ui-icb-edge-top), var(--ui-icb-edge-mid), var(--ui-icb-edge-bottom)) border-box;
}

.ui-icb:active:not(:disabled) {
  transform: scale(0.95);
}
.ui-icb:focus-visible {
  outline: 2px solid var(--ui-icb-focus);
  outline-offset: 2px;
}
.ui-icb:disabled {
  opacity: 0.4;
  cursor: default;
}

/* Touch screens: the small size gets an invisible ring around it that takes the tap (40 × 40) */
@media (pointer: coarse) {
  .ui-icb[data-size="sm"]::after {
    content: "";
    position: absolute;
    inset: -5px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ui-icb {
    transition-duration: 1ms;
  }
  .ui-icb:active:not(:disabled) {
    transform: none;
  }
}

/* Dark mode: follows a .dark class or data-theme="dark" on any ancestor, e.g. <html> */
:where(.dark, [data-theme="dark"]) .ui-icb {
  --ui-icb-icon: var(--aui-muted, #8f8f8f);
  --ui-icb-ink: var(--aui-ink, #ededed);
  --ui-icb-hover: #ededed;
  --ui-icb-fill: rgba(255, 255, 255, 0.06);
  --ui-icb-pressed: rgba(255, 255, 255, 0.1);
  --ui-icb-surface: var(--aui-surface, #232326);
  --ui-icb-surface-hover: #2a2a2d;
  --ui-icb-surface-shadow: rgba(0, 0, 0, 0.4);
  --ui-icb-line: var(--aui-border, rgba(255, 255, 255, 0.1));
  /* primary inverts: a light gradient with dark glyph */
  --ui-icb-on-ink: #121213;
  --ui-icb-dark-top: #f4f4f5;
  --ui-icb-dark-bottom: #e4e4e7;
  --ui-icb-dark-hover-top: #ffffff;
  --ui-icb-dark-hover-bottom: #ececef;
  --ui-icb-edge-top: #ffffff;
  --ui-icb-edge-mid: #ececef;
  --ui-icb-edge-bottom: #d4d4d8;
  --ui-icb-ring: rgba(0, 0, 0, 0.6);
  --ui-icb-dark-shadow: rgba(0, 0, 0, 0.4);
  --ui-icb-focus: var(--aui-focus, rgba(77, 141, 255, 0.8));
}
`;
