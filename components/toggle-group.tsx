"use client";

import { useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

/*
 * Toggle Group – a row of toggle buttons, in a single self-contained file.
 * type="multiple" (the default): any number can be on – filters, formatting, visible columns.
 * type="single": at most one is on, and pressing it again turns it off – unlike the Segmented Control, which always
 * keeps one picked. "tray" (the default) sits them in a light-gray track like the Segmented Control, pressed ones
 * raised as white pills; "buttons" are separate white chips with an edge that wrap onto a new line when there are many.
 * A pressed item's fill grows in from its middle. One tab stop for the whole group; arrow keys move between the items,
 * Space or Enter flips one.
 * The styles are injected below, so no extra files are needed.
 */

export type ToggleGroupItem<T extends string = string> = {
  value: T;
  label?: ReactNode;
  icon?: ReactNode;
  /** Accessible name and tooltip – needed when the item only shows an icon */
  ariaLabel?: string;
  disabled?: boolean;
};

type Shared<T extends string> = {
  items: ToggleGroupItem<T>[];
  /** sm 26 · md 30 · lg 36 high – bigger on touch screens */
  size?: "sm" | "md" | "lg";
  /** "tray" = a light-gray track, pressed items raised as white pills · "buttons" = separate chips with an edge that wrap */
  variant?: "buttons" | "tray";
  /** Disables every item */
  disabled?: boolean;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  className?: string;
};

export type ToggleGroupProps<T extends string = string> = Shared<T> &
  (
    | {
        /** Any number of items can be on */
        type?: "multiple";
        value?: T[];
        defaultValue?: T[];
        onChange?: (value: T[]) => void;
      }
    | {
        /** At most one item is on; pressing it again turns it off (null) */
        type: "single";
        value?: T | null;
        defaultValue?: T | null;
        onChange?: (value: T | null) => void;
      }
  );

export function ToggleGroup<T extends string = string>(props: ToggleGroupProps<T>) {
  const {
    items: rawItems,
    size: sizeProp = "md",
    variant: variantProp = "tray",
    disabled = false,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledby,
    className,
  } = props;
  const single = props.type === "single";

  // Gaps and repeated values are dropped – one value, one item
  const items = useMemo(() => {
    const seen = new Set<string>();
    return (Array.isArray(rawItems) ? rawItems : []).filter((it): it is ToggleGroupItem<T> => {
      if (!it || it.value == null || seen.has(String(it.value))) return false;
      seen.add(String(it.value));
      return true;
    });
  }, [rawItems]);
  // Unknown sizes and variants fall back to the defaults
  const size = sizeProp === "sm" || sizeProp === "lg" ? sizeProp : "md";
  const variant = variantProp === "buttons" ? "buttons" : "tray";

  const [inner, setInner] = useState<T[]>(() => toList(props.defaultValue));
  const controlled = props.value !== undefined;
  const on = controlled ? toList(props.value) : inner;

  const group = useRef<HTMLDivElement>(null);
  const [focused, setFocused] = useState<T | null>(null);

  const toggle = (v: T) => {
    const item = items.find((it) => it.value === v);
    if (!item || item.disabled || disabled) return;
    const pressed = on.includes(v);
    // Multiple keeps the items' order, whatever order they were pressed in
    const next = single ? (pressed ? [] : [v]) : items.map((it) => it.value).filter((x) => (x === v ? !pressed : on.includes(x)));
    if (!controlled) setInner(next);
    if (props.type === "single") props.onChange?.(next[0] ?? null);
    else props.onChange?.(next);
  };

  const enabled = items.filter((it) => !it.disabled && !disabled);
  // One tab stop: the item last focused, else the first one that's on, else the first one
  const stop =
    enabled.find((it) => it.value === focused)?.value ??
    enabled.find((it) => on.includes(it.value))?.value ??
    enabled[0]?.value;

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!enabled.length || e.altKey || e.ctrlKey || e.metaKey) return;
    const buttons = Array.from(group.current?.querySelectorAll<HTMLButtonElement>(":scope > .ui-tgl__item:not(:disabled)") ?? []);
    const at = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (at < 0) return;
    // In right-to-left pages the left arrow goes on to the next item
    const rtl = group.current ? getComputedStyle(group.current).direction === "rtl" : false;
    const fwd = rtl ? "ArrowLeft" : "ArrowRight";
    const back = rtl ? "ArrowRight" : "ArrowLeft";
    let to = -1;
    if (e.key === fwd || e.key === "ArrowDown") to = (at + 1) % buttons.length;
    else if (e.key === back || e.key === "ArrowUp") to = (at - 1 + buttons.length) % buttons.length;
    else if (e.key === "Home") to = 0;
    else if (e.key === "End") to = buttons.length - 1;
    if (to < 0) return;
    e.preventDefault();
    buttons[to].focus();
  };

  return (
    <div
      ref={group}
      role="group"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
      aria-disabled={disabled || undefined}
      className={["ui-tgl", className].filter(Boolean).join(" ")}
      data-size={size}
      data-variant={variant}
      data-disabled={disabled || undefined}
      onKeyDown={onKeyDown}
    >
      {/* React 19 hoists this into <head> once, no matter how many groups render */}
      <style href="ui-toggle-group" precedence="default">
        {css}
      </style>
      {items.map((it) => {
        const pressed = on.includes(it.value);
        // Without a label or icon the value names the item
        const label = it.label ?? (it.icon ? null : String(it.value));
        const iconOnly = label == null;
        return (
          <button
            key={String(it.value)}
            type="button"
            className="ui-tgl__item"
            aria-pressed={pressed}
            aria-label={it.ariaLabel}
            title={iconOnly ? it.ariaLabel : undefined}
            data-icon-only={iconOnly || undefined}
            disabled={it.disabled || disabled}
            tabIndex={it.value === stop ? 0 : -1}
            onFocus={() => setFocused(it.value)}
            onClick={() => toggle(it.value)}
          >
            {it.icon != null && (
              <span className="ui-tgl__icon" aria-hidden="true">
                {it.icon}
              </span>
            )}
            {label != null && (
              <span className="ui-tgl__label" dir="auto">
                {label}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/** Value or values → a list; null, undefined and gaps drop out */
function toList<T extends string>(v: T | T[] | null | undefined): T[] {
  if (Array.isArray(v)) return v.filter((x) => x != null);
  return v == null ? [] : [v];
}

/* ---------- Styles ---------- */

const css = /* css */ `
/* Colors as variables – override them on .ui-tgl (see Theming in the docs) */
.ui-tgl {
  --ui-tgl-tray: var(--aui-subtle, #f0f0f0);
  --ui-tgl-pill: var(--aui-surface, #ffffff);
  --ui-tgl-pill-shadow: 0 0 0 0.5px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.08), 0 2px 8px -2px rgba(0, 0, 0, 0.06);
  --ui-tgl-line: var(--aui-border, #e5e5e5);
  --ui-tgl-line-strong: #d4d4d4;
  --ui-tgl-chip: var(--aui-surface, #ffffff);
  --ui-tgl-fill: #f0f0f0;
  --ui-tgl-wash: rgba(0, 0, 0, 0.04);
  --ui-tgl-ink: var(--aui-ink, #171717);
  --ui-tgl-text: var(--aui-muted, #737373);
  --ui-tgl-hover-text: var(--aui-ink, #404040);
  --ui-tgl-focus: var(--aui-focus, rgba(0, 96, 226, 0.7));
  --ui-tgl-ease: var(--aui-ease, cubic-bezier(0.22, 1, 0.36, 1));
  /* Size: md */
  --ui-tgl-h: 30px;
  --ui-tgl-px: 12px;
  --ui-tgl-fs: 13.5px;
  --ui-tgl-icon-size: 15px;
  --ui-tgl-gap: 8px;
  --ui-tgl-pad: 3px;
  --ui-tgl-r: calc(var(--aui-radius, 10px) + 1px);

  box-sizing: border-box;
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--ui-tgl-gap);
  max-width: 100%;
  min-width: 0;
  vertical-align: middle;
  font-family: var(--aui-font, "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif);
  font-size: var(--ui-tgl-fs);
  font-weight: 500;
  line-height: 20px;
  color: var(--ui-tgl-text);
  -webkit-font-smoothing: antialiased;
}
.ui-tgl[data-size="sm"] { --ui-tgl-h: 26px; --ui-tgl-px: 10px; --ui-tgl-fs: 12.5px; --ui-tgl-icon-size: 14px; --ui-tgl-gap: 6px; --ui-tgl-pad: 2px; --ui-tgl-r: calc(var(--aui-radius, 10px) - 1px); }
.ui-tgl[data-size="lg"] { --ui-tgl-h: 36px; --ui-tgl-px: 16px; --ui-tgl-fs: 14px; --ui-tgl-icon-size: 16px; --ui-tgl-pad: 4px; --ui-tgl-r: calc(var(--aui-radius, 10px) + 3px); }
.ui-tgl[data-disabled] { opacity: 0.5; }
.ui-tgl *, .ui-tgl *::before, .ui-tgl *::after { box-sizing: border-box; }
/* Nothing to show – no empty track */
.ui-tgl:not(:has(> .ui-tgl__item)) { display: none; }

/* An item: the pressed fill is its own layer, so it can grow in from the middle */
.ui-tgl__item {
  position: relative;
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  gap: 6px;
  max-width: 100%;
  min-width: var(--ui-tgl-h);
  height: var(--ui-tgl-h);
  margin: 0;
  padding: 0 var(--ui-tgl-px);
  border: 0;
  border-radius: calc(var(--ui-tgl-r) - var(--ui-tgl-pad));
  background: transparent;
  color: inherit;
  font: inherit;
  white-space: nowrap;
  cursor: pointer;
  -webkit-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  transition: color 200ms ease, background-color 160ms ease, box-shadow 160ms ease, transform 200ms var(--ui-tgl-ease);
}
.ui-tgl__item::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: var(--ui-tgl-pill);
  box-shadow: var(--ui-tgl-pill-shadow);
  opacity: 0;
  transform: scale(0.86);
  pointer-events: none;
  transition: opacity 160ms ease, transform 320ms var(--ui-tgl-ease);
}
.ui-tgl__item[aria-pressed="true"] { color: var(--ui-tgl-ink); }
.ui-tgl__item[aria-pressed="true"]::before { opacity: 1; transform: none; }
.ui-tgl__item[data-icon-only] { padding: 0; width: var(--ui-tgl-h); }
.ui-tgl__item:active:not(:disabled) { transform: scale(0.96); }
.ui-tgl__item:disabled { opacity: 0.4; cursor: not-allowed; }
.ui-tgl[data-disabled] .ui-tgl__item:disabled { opacity: 1; }
.ui-tgl__item:focus-visible { outline: 2px solid var(--ui-tgl-focus); outline-offset: 2px; }
@media (hover: hover) {
  .ui-tgl__item:not([aria-pressed="true"]):not(:disabled):hover { color: var(--ui-tgl-hover-text); }
}

.ui-tgl__icon, .ui-tgl__label { position: relative; z-index: 1; }
.ui-tgl__icon { display: grid; flex: none; place-items: center; width: var(--ui-tgl-icon-size); height: var(--ui-tgl-icon-size); overflow: hidden; }
.ui-tgl__icon svg, .ui-tgl__icon img { display: block; width: 100%; height: 100%; object-fit: contain; }
/* Long labels end in … instead of pushing the row wider than its container */
.ui-tgl__label { min-width: 0; overflow: hidden; text-overflow: ellipsis; }

/* Tray (default): the light-gray track of the Segmented Control; it scrolls sideways if it doesn't fit */
.ui-tgl[data-variant="tray"] {
  flex-wrap: nowrap;
  gap: 0;
  padding: var(--ui-tgl-pad);
  overflow-x: auto;
  border-radius: var(--ui-tgl-r);
  background: var(--ui-tgl-tray);
  scrollbar-width: none;
}
.ui-tgl[data-variant="tray"]::-webkit-scrollbar { display: none; }
.ui-tgl[data-variant="tray"] .ui-tgl__item:focus-visible { outline-offset: -2px; }

/* Buttons: separate white chips with an edge; pressed ones sink into a gray fill. Many of them wrap */
.ui-tgl[data-variant="buttons"] .ui-tgl__item {
  border-radius: calc(var(--ui-tgl-r) - 2px);
  background: var(--ui-tgl-chip);
  box-shadow: inset 0 0 0 1px var(--ui-tgl-line), 0 1px 2px rgba(0, 0, 0, 0.04);
}
.ui-tgl[data-variant="buttons"] .ui-tgl__item::before { background: var(--ui-tgl-fill); box-shadow: inset 0 0 0 1px var(--ui-tgl-line-strong); }
.ui-tgl[data-variant="buttons"] .ui-tgl__item[aria-pressed="true"] { box-shadow: none; }
@media (hover: hover) {
  .ui-tgl[data-variant="buttons"] .ui-tgl__item:not([aria-pressed="true"]):not(:disabled):hover { background: var(--aui-subtle, #fafafa); box-shadow: inset 0 0 0 1px var(--ui-tgl-line-strong), 0 1px 2px rgba(0, 0, 0, 0.04); }
}

/* Touch screens: every item at least 36px tall */
@media (pointer: coarse) {
  .ui-tgl[data-size] { --ui-tgl-h: 36px; }
  .ui-tgl[data-size="lg"] { --ui-tgl-h: 40px; }
}
@media (prefers-reduced-motion: reduce) {
  .ui-tgl__item, .ui-tgl__item::before { transition: none; }
  .ui-tgl__item:active:not(:disabled) { transform: none; }
}

/* Dark mode: follows a .dark class or data-theme="dark" on any ancestor, e.g. <html> */
:where(.dark, [data-theme="dark"]) .ui-tgl {
  --ui-tgl-tray: var(--aui-subtle, #111113);
  --ui-tgl-pill: var(--aui-surface, #26262a);
  --ui-tgl-pill-shadow: 0 0 0 1px rgba(255, 255, 255, 0.06), 0 1px 2px rgba(0, 0, 0, 0.4);
  --ui-tgl-line: var(--aui-border, #2a2a2e);
  --ui-tgl-line-strong: #3a3a3f;
  --ui-tgl-chip: var(--aui-surface, #161618);
  --ui-tgl-fill: #26262a;
  --ui-tgl-wash: rgba(255, 255, 255, 0.05);
  --ui-tgl-ink: var(--aui-ink, #ededed);
  --ui-tgl-text: var(--aui-muted, #8b8b92);
  --ui-tgl-hover-text: var(--aui-ink, #c8c8cc);
  --ui-tgl-focus: var(--aui-focus, rgba(77, 141, 255, 0.8));
}
:where(.dark, [data-theme="dark"]) .ui-tgl[data-variant="buttons"] .ui-tgl__item { box-shadow: inset 0 0 0 1px var(--ui-tgl-line); }
`;
