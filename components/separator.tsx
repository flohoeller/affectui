"use client";

import type { ComponentPropsWithRef, ReactNode } from "react";

/*
 * Separator – a single self-contained file.
 * A 1px line between groups: across a card or a list, or upright between tools in a bar. It can carry a short
 * label in its middle – "or" between two ways in, "Earlier" above older rows.
 * The styles are injected below, so no extra files are needed.
 */

export type SeparatorProps = Omit<ComponentPropsWithRef<"div">, "children"> & {
  /** horizontal: a line across, as wide as its container · vertical: an upright line, 18px high in a row */
  orientation?: "horizontal" | "vertical";
  /**
   * true (the default): only a visual line, hidden from screen readers · false: a real separator (role="separator")
   * that splits content into sections screen readers announce
   */
  decorative?: boolean;
  /** A short word in the middle of a horizontal line – "or", "Earlier", "Today" */
  label?: ReactNode;
};

export function Separator({ orientation = "horizontal", decorative = true, label, className, ...rest }: SeparatorProps) {
  const vertical = orientation === "vertical";
  const hasLabel = !vertical && label != null && label !== false && label !== "";
  // A labelled separator names itself after its label, when the label is text
  const name = hasLabel && (typeof label === "string" || typeof label === "number") ? String(label) : undefined;
  const a11y = decorative
    ? // A decorative line with a label: the label stays readable as plain text, only the lines are hidden
      hasLabel
      ? {}
      : { role: "none" as const }
    : {
        role: "separator" as const,
        "aria-orientation": vertical ? ("vertical" as const) : undefined,
        "aria-label": name,
      };

  return (
    <>
      {/* React 19 hoists this into <head> once, no matter how many separators render */}
      <style href="ui-separator" precedence="default">
        {css}
      </style>
      <div
        className={["ui-sep", className].filter(Boolean).join(" ")}
        data-orientation={vertical ? "vertical" : "horizontal"}
        data-label={hasLabel ? "" : undefined}
        {...a11y}
        {...rest}
      >
        {hasLabel && (
          <>
            <span className="ui-sep__line" aria-hidden="true" />
            <span className="ui-sep__label">{label}</span>
            <span className="ui-sep__line" aria-hidden="true" />
          </>
        )}
      </div>
    </>
  );
}

/* ---------- Styles ---------- */

const css = /* css */ `
/* Colors as variables – override them on .ui-sep (see Theming in the docs) */
.ui-sep {
  --ui-sep-line: var(--aui-border, #ececec);
  --ui-sep-text: var(--aui-muted, #8f8f8f);
  --ui-sep-weight: 1px;
  flex: none;
  box-sizing: border-box;
}

/* A line across: a border, so it stays one crisp device pixel on any screen */
.ui-sep[data-orientation="horizontal"]:not([data-label]) {
  width: 100%;
  height: 0;
  border-top: var(--ui-sep-weight) solid var(--ui-sep-line);
}

/* Upright between tools: 18px high, centred in its row – set height to change it */
.ui-sep[data-orientation="vertical"] {
  display: inline-block;
  align-self: center;
  width: 0;
  vertical-align: middle;
  height: 18px;
  border-inline-start: var(--ui-sep-weight) solid var(--ui-sep-line);
}

/* With a label: line · word · line, the word in the middle */
.ui-sep[data-label] {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-width: 0;
  font-family: var(--aui-font, "Inter", "InterVariable", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif);
  font-size: 12.5px;
  line-height: 18px;
  color: var(--ui-sep-text);
  -webkit-font-smoothing: antialiased;
}
.ui-sep__line {
  flex: 1 1 0;
  min-width: 12px;
  height: 0;
  border-top: var(--ui-sep-weight) solid var(--ui-sep-line);
}
/* A long label wraps inside the middle rather than pushing the lines out */
.ui-sep__label {
  flex: 0 1 auto;
  min-width: 0;
  max-width: 80%;
  text-align: center;
  overflow-wrap: anywhere;
}

/* Windows high contrast: the line keeps a system color */
@media (forced-colors: active) {
  .ui-sep { --ui-sep-line: CanvasText; }
}

/* Dark mode: follows a .dark class or data-theme="dark" on any ancestor, e.g. <html> */
:where(.dark, [data-theme="dark"]) .ui-sep {
  --ui-sep-line: var(--aui-border, #2a2a2e);
  --ui-sep-text: var(--aui-muted, #8b8b92);
}
`;
