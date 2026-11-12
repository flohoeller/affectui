"use client";

import { useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

/*
 * Toggle Group (Clean) – a row of toggle buttons, in a single self-contained file.
 * type="multiple" (the default): any number can be on – filters, formatting, visible columns.
 * type="single": at most one is on, and pressing it again turns it off – unlike the Segmented Control, which always
 * keeps one picked. Clean style: "buttons" (the default) are separate quiet chips with a hairline that wrap onto a
 * new line when there are many; "tray" sits them in a compact light-gray track, pressed ones raised in white.
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
  /** sm 24 · md 28 · lg 32 high – bigger on touch screens */
  size?: "sm" | "md" | "lg";
  /** "buttons" = separate chips with a hairline that wrap · "tray" = a compact light-gray track, pressed items raised */
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
    variant: variantProp = "buttons",
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
  const variant = variantProp === "tray" ? "tray" : "buttons";

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
    const buttons = Array.from(group.current?.querySelectorAll<HTMLButtonElement>(":scope > .ui-tglc__item:not(:disabled)") ?? []);
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
      className={["ui-tglc", className].filter(Boolean).join(" ")}
      data-size={size}
      data-variant={variant}
      data-disabled={disabled || undefined}
      onKeyDown={onKeyDown}
    >
      {/* React 19 hoists this into <head> once, no matter how many groups render */}
      <style href="ui-toggle-group-clean" precedence="default">
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
            className="ui-tglc__item"
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
              <span className="ui-tglc__icon" aria-hidden="true">
                {it.icon}
              </span>
            )}
            {label != null && (
              <span className="ui-tglc__label" dir="auto">
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
/* Colors as variables – override them on .ui-tglc (see Theming in the docs) */
.ui-tglc {
  --ui-tglc-ink: var(--aui-ink, rgba(0, 0, 0, 0.88));
  --ui-tglc-text: var(--aui-muted, rgba(0, 0, 0, 0.61));
  --ui-tglc-icon: var(--aui-muted, rgba(0, 0, 0, 0.447));
  --ui-tglc-line: var(--aui-border, rgba(0, 0, 0, 0.06));
  --ui-tglc-wash: var(--aui-subtle, rgba(0, 0, 0, 0.03));
  --ui-tglc-fill: rgba(0, 0, 0, 0.06);
  --ui-tglc-track: var(--aui-subtle, rgba(0, 0, 0, 0.04));
  --ui-tglc-card: var(--aui-surface, #ffffff);
  --ui-tglc-card-shadow: 0 0 0 0.5px rgba(0, 0, 0, 0.06), 0 1px 1px -1px rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --ui-tglc-focus: var(--aui-focus, rgba(0, 96, 226, 0.7));
  --ui-tglc-ease: cubic-bezier(0.25, 0.9, 0.3, 1);
  /* Size: md – 28px chips, 4px 10px */
  --ui-tglc-h: 28px;
  --ui-tglc-px: 10px;
  --ui-tglc-fs: 13px;
  --ui-tglc-lh: 20px;
  --ui-tglc-icon-size: 16px;
  --ui-tglc-gap: 8px;
  --ui-tglc-pad: 2px;
  --ui-tglc-r: var(--aui-radius, 6px);

  box-sizing: border-box;
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--ui-tglc-gap);
  max-width: 100%;
  min-width: 0;
  vertical-align: middle;
  font-family: var(--aui-font, "Inter", "InterVariable", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif);
  font-size: var(--ui-tglc-fs);
  font-weight: 500;
  line-height: var(--ui-tglc-lh);
  color: var(--ui-tglc-text);
  -webkit-font-smoothing: antialiased;
}
.ui-tglc[data-size="sm"] { --ui-tglc-h: 24px; --ui-tglc-px: 8px; --ui-tglc-fs: 12px; --ui-tglc-lh: 16px; --ui-tglc-icon-size: 14px; --ui-tglc-gap: 6px; }
.ui-tglc[data-size="lg"] { --ui-tglc-h: 32px; --ui-tglc-px: 12px; }
.ui-tglc[data-disabled] { opacity: 0.5; }
.ui-tglc *, .ui-tglc *::before, .ui-tglc *::after { box-sizing: border-box; }
/* Nothing to show – no empty track */
.ui-tglc:not(:has(> .ui-tglc__item)) { display: none; }

/* An item: the fill is its own layer, so it can grow in from the middle */
.ui-tglc__item {
  position: relative;
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  gap: 6px;
  max-width: 100%;
  min-width: var(--ui-tglc-h);
  height: var(--ui-tglc-h);
  margin: 0;
  padding: 0 var(--ui-tglc-px);
  border: 0;
  border-radius: var(--ui-tglc-r);
  background: transparent;
  color: inherit;
  font: inherit;
  white-space: nowrap;
  cursor: pointer;
  -webkit-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  transition: color 90ms ease, background-color 90ms ease, transform 160ms var(--ui-tglc-ease);
}
.ui-tglc__item::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: var(--ui-tglc-fill);
  opacity: 0;
  transform: scale(0.88);
  pointer-events: none;
  transition: opacity 120ms ease, transform 200ms var(--ui-tglc-ease);
}
.ui-tglc__item[aria-pressed="true"] { color: var(--ui-tglc-ink); }
.ui-tglc__item[aria-pressed="true"]::before { opacity: 1; transform: none; }
.ui-tglc__item[data-icon-only] { padding: 0; width: var(--ui-tglc-h); }
.ui-tglc__item:active:not(:disabled) { transform: scale(0.96); }
.ui-tglc__item:disabled { opacity: 0.4; cursor: not-allowed; }
.ui-tglc[data-disabled] .ui-tglc__item:disabled { opacity: 1; }
.ui-tglc__item:focus-visible { outline: 2px solid var(--ui-tglc-focus); outline-offset: 2px; }
@media (hover: hover) {
  .ui-tglc__item:not([aria-pressed="true"]):not(:disabled):hover { background-color: var(--ui-tglc-wash); color: var(--ui-tglc-ink); }
}

.ui-tglc__icon, .ui-tglc__label { position: relative; z-index: 1; }
.ui-tglc__icon { display: grid; flex: none; place-items: center; width: var(--ui-tglc-icon-size); height: var(--ui-tglc-icon-size); overflow: hidden; color: var(--ui-tglc-icon); transition: color 90ms ease; }
.ui-tglc__icon svg, .ui-tglc__icon img { display: block; width: 100%; height: 100%; object-fit: contain; }
.ui-tglc__item[aria-pressed="true"] .ui-tglc__icon { color: var(--ui-tglc-ink); }
@media (hover: hover) {
  .ui-tglc__item:not(:disabled):hover .ui-tglc__icon { color: var(--ui-tglc-ink); }
}
/* Long labels end in … instead of pushing the row wider than its container */
.ui-tglc__label { min-width: 0; overflow: hidden; text-overflow: ellipsis; }

/* Buttons (default): separate chips with a hairline; many of them wrap onto the next line */
.ui-tglc[data-variant="buttons"] .ui-tglc__item { box-shadow: inset 0 0 0 0.5px var(--ui-tglc-line); }

/* Tray: a compact light-gray track; pressed items are raised in white */
.ui-tglc[data-variant="tray"] {
  flex-wrap: nowrap;
  gap: 0;
  padding: var(--ui-tglc-pad);
  overflow-x: auto;
  border-radius: calc(var(--ui-tglc-r) + var(--ui-tglc-pad));
  background: var(--ui-tglc-track);
  scrollbar-width: none;
}
.ui-tglc[data-variant="tray"]::-webkit-scrollbar { display: none; }
.ui-tglc[data-variant="tray"] .ui-tglc__item { --ui-tglc-h-in: calc(var(--ui-tglc-h) - var(--ui-tglc-pad) * 2); height: var(--ui-tglc-h-in); min-width: var(--ui-tglc-h-in); }
.ui-tglc[data-variant="tray"] .ui-tglc__item[data-icon-only] { width: var(--ui-tglc-h-in); }
.ui-tglc[data-variant="tray"] .ui-tglc__item::before { background: var(--ui-tglc-card); box-shadow: var(--ui-tglc-card-shadow); }
.ui-tglc[data-variant="tray"] .ui-tglc__item:focus-visible { outline-offset: -2px; }
@media (hover: hover) {
  .ui-tglc[data-variant="tray"] .ui-tglc__item:not([aria-pressed="true"]):not(:disabled):hover { background-color: transparent; }
}

/* Touch screens: every item at least 36px tall */
@media (pointer: coarse) {
  .ui-tglc[data-size] { --ui-tglc-h: 36px; }
  .ui-tglc[data-size="lg"] { --ui-tglc-h: 40px; }
  .ui-tglc[data-variant="tray"][data-size] { --ui-tglc-h: 40px; }
}
@media (prefers-reduced-motion: reduce) {
  .ui-tglc__item, .ui-tglc__item::before, .ui-tglc__icon { transition: none; }
  .ui-tglc__item:active:not(:disabled) { transform: none; }
}

/* Dark mode: follows a .dark class or data-theme="dark" on any ancestor, e.g. <html> */
:where(.dark, [data-theme="dark"]) .ui-tglc {
  --ui-tglc-ink: var(--aui-ink, rgba(255, 255, 255, 0.9));
  --ui-tglc-text: var(--aui-muted, rgba(255, 255, 255, 0.62));
  --ui-tglc-icon: var(--aui-muted, rgba(255, 255, 255, 0.46));
  --ui-tglc-line: var(--aui-border, rgba(255, 255, 255, 0.08));
  --ui-tglc-wash: var(--aui-subtle, rgba(255, 255, 255, 0.04));
  --ui-tglc-fill: rgba(255, 255, 255, 0.08);
  --ui-tglc-track: var(--aui-subtle, rgba(255, 255, 255, 0.05));
  --ui-tglc-card: var(--aui-surface, #2c2c2f);
  --ui-tglc-card-shadow: 0 0 0 0.5px rgba(255, 255, 255, 0.1), 0 1px 2px rgba(0, 0, 0, 0.4);
  --ui-tglc-focus: var(--aui-focus, rgba(77, 141, 255, 0.8));
}
`;
