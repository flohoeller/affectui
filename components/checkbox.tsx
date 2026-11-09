"use client";

import { useEffect, useId, useRef, type ComponentPropsWithRef, type ReactNode } from "react";

/*
 * Checkbox – a single self-contained file.
 * A real checkbox with a label and a quiet second line, a third "some of them" state, an error, and a card variant
 * where the whole row is the target. The box fills and its check draws itself. Focus shows a ring only from the
 * keyboard. The styles are injected below, so no extra files are needed.
 */

export type CheckboxProps = Omit<ComponentPropsWithRef<"input">, "type" | "size"> & {
  /** Shown next to the box; clicking it toggles */
  label?: ReactNode;
  /** A quiet second line under the label */
  description?: ReactNode;
  /** "Some of them" – a dash instead of the check, e.g. for Select all */
  indeterminate?: boolean;
  /** Marks it invalid and shows this under it */
  error?: ReactNode;
  /** plain: the box and its text · card: a bordered row that is clickable as a whole and lights up when checked */
  variant?: "plain" | "card";
};

export function Checkbox({
  label,
  description,
  indeterminate = false,
  error,
  variant = "plain",
  className,
  id,
  disabled,
  ref,
  "aria-describedby": describedBy,
  ...rest
}: CheckboxProps) {
  const autoId = useId();
  const inputId = id ?? `${autoId}-input`;
  const descId = `${autoId}-desc`;
  const errorId = `${autoId}-error`;
  const input = useRef<HTMLInputElement | null>(null);
  const showsError = error != null && typeof error !== "boolean" && error !== "";

  // Indeterminate is a property, not an attribute
  useEffect(() => {
    if (input.current) input.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <div
      className={["ui-chk", className].filter(Boolean).join(" ")}
      data-variant={variant === "card" ? "card" : "plain"}
      data-invalid={error ? true : undefined}
      data-disabled={disabled || undefined}
    >
      {/* React 19 hoists this into <head> once, no matter how many checkboxes render */}
      <style href="ui-checkbox" precedence="default">
        {css}
      </style>
      <label className="ui-chk__row" htmlFor={inputId}>
        <span className="ui-chk__control">
          <input
            {...rest}
            ref={(el) => {
              input.current = el;
              if (el) el.indeterminate = indeterminate;
              if (typeof ref === "function") ref(el);
              else if (ref) ref.current = el;
            }}
            id={inputId}
            type="checkbox"
            className="ui-chk__input"
            disabled={disabled}
            aria-invalid={error ? true : undefined}
            aria-describedby={[describedBy, description ? descId : null, showsError ? errorId : null].filter(Boolean).join(" ") || undefined}
            data-indeterminate={indeterminate || undefined}
          />
          <span className="ui-chk__box" aria-hidden="true">
            <svg className="ui-chk__mark" viewBox="0 0 16 16" width="16" height="16">
              <path className="ui-chk__tick" d="M4 8.5 6.75 11.25 12 5" pathLength={1} />
              <path className="ui-chk__dash" d="M4.5 8h7" pathLength={1} />
            </svg>
          </span>
        </span>
        {(label != null || description != null) && (
          <span className="ui-chk__text">
            {label != null && <span className="ui-chk__label">{label}</span>}
            {description != null && (
              <span className="ui-chk__desc" id={descId}>
                {description}
              </span>
            )}
          </span>
        )}
      </label>
      {showsError && (
        <p className="ui-chk__error" id={errorId} aria-live="polite">
          {error}
        </p>
      )}
    </div>
  );
}

const css = /* css */ `
/* Colors and motion as variables – override them on .ui-chk (see Theming in the docs) */
.ui-chk {
  --ui-chk-ink: var(--aui-ink, #171717);
  --ui-chk-subtle: var(--aui-muted, #8f8f8f);
  --ui-chk-surface: var(--aui-surface, #ffffff);
  --ui-chk-edge: var(--aui-border-strong, #d4d4d8);
  --ui-chk-edge-hover: #a1a1aa;
  --ui-chk-fill: var(--aui-primary, #171717);
  --ui-chk-on-fill: var(--aui-on-primary, #ffffff);
  --ui-chk-card-shadow: 0 0 0 1px var(--aui-border, #e6e6e8), 0 1px 2px rgba(0, 0, 0, 0.04);
  --ui-chk-card-shadow-hover: 0 0 0 1px #e6e6e8, 0 4px 12px -6px rgba(0, 0, 0, 0.09), 0 1px 2px rgba(0, 0, 0, 0.04);
  --ui-chk-card-shadow-on: 0 0 0 1px #e6e6e8, 0 1px 2px rgba(0, 0, 0, 0.04);
  --ui-chk-card-wash: #f7f7f8;
  --ui-chk-danger: var(--aui-danger, #c4320a);
  --ui-chk-focus: var(--aui-focus, rgba(0, 96, 226, 0.7));
  --ui-chk-ease: cubic-bezier(0.22, 1, 0.36, 1);

  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  font-family: var(--aui-font, "Inter", "InterVariable", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif);
  font-size: 13.5px;
  line-height: 20px;
  color: var(--ui-chk-ink);
  -webkit-font-smoothing: antialiased;
}

.ui-chk__row { display: flex; align-items: flex-start; gap: 10px; min-width: 0; cursor: pointer; -webkit-tap-highlight-color: transparent; }
.ui-chk[data-disabled] .ui-chk__row { cursor: not-allowed; opacity: 0.5; }

/* The box sits on the first line of the label, centered on it */
.ui-chk__control { position: relative; display: grid; flex: none; place-items: center; width: 16px; height: 20px; }
/* The real input covers the box (and a bit more, for touch) – invisible, but it takes the clicks and the focus */
.ui-chk__input { position: absolute; inset: -6px; width: calc(100% + 12px); height: calc(100% + 12px); margin: 0; opacity: 0; cursor: inherit; }
.ui-chk__box {
  display: grid;
  place-items: center;
  width: 16px;
  height: 16px;
  box-sizing: border-box;
  border-radius: 5px;
  background: var(--ui-chk-surface);
  box-shadow: inset 0 0 0 1px var(--ui-chk-edge), 0 1px 1px rgba(0, 0, 0, 0.04);
  color: var(--ui-chk-on-fill);
  pointer-events: none;
  transition: background-color 160ms ease, box-shadow 160ms ease, transform 160ms var(--ui-chk-ease);
}
.ui-chk__row:hover .ui-chk__input:not(:checked):not(:indeterminate):not(:disabled) + .ui-chk__box { box-shadow: inset 0 0 0 1px var(--ui-chk-edge-hover), 0 1px 1px rgba(0, 0, 0, 0.04); }
.ui-chk__input:active:not(:disabled) + .ui-chk__box { transform: scale(0.9); }
.ui-chk__input:is(:checked, :indeterminate) + .ui-chk__box { background: var(--ui-chk-fill); box-shadow: none; }
.ui-chk__input:focus-visible + .ui-chk__box { outline: 2px solid var(--ui-chk-focus); outline-offset: 2px; }
.ui-chk[data-invalid] .ui-chk__input:not(:checked) + .ui-chk__box { box-shadow: inset 0 0 0 1px var(--ui-chk-danger); }

/* The check draws itself; the dash grows from the middle */
.ui-chk__mark { display: block; width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.ui-chk__tick, .ui-chk__dash { stroke-dasharray: 1; stroke-dashoffset: 1; }
.ui-chk__input:checked:not(:indeterminate) + .ui-chk__box .ui-chk__tick { stroke-dashoffset: 0; transition: stroke-dashoffset 260ms 40ms var(--ui-chk-ease); }
.ui-chk__input:indeterminate + .ui-chk__box .ui-chk__dash { stroke-dashoffset: 0; transition: stroke-dashoffset 200ms var(--ui-chk-ease); }

.ui-chk__text { display: grid; min-width: 0; }
.ui-chk__label { color: var(--ui-chk-ink); overflow-wrap: anywhere; }
.ui-chk__desc { font-size: 12.5px; line-height: 17px; color: var(--ui-chk-subtle); overflow-wrap: anywhere; }
.ui-chk__error { margin: 0 0 0 26px; font-size: 12px; line-height: 16px; color: var(--ui-chk-danger); overflow-wrap: anywhere; animation: ui-chk-message 260ms var(--ui-chk-ease); }

/* Card: a bordered row, clickable as a whole – a soft shadow on hover; checked, it takes a faint gray fill (no dark edge) */
.ui-chk[data-variant="card"] .ui-chk__row {
  padding: 12px 14px;
  border-radius: 12px;
  background: var(--ui-chk-surface);
  box-shadow: var(--ui-chk-card-shadow);
  transition: box-shadow 200ms ease, background-color 200ms ease;
}
.ui-chk[data-variant="card"]:not([data-disabled]) .ui-chk__row:hover { box-shadow: var(--ui-chk-card-shadow-hover); }
.ui-chk[data-variant="card"] .ui-chk__row:has(.ui-chk__input:checked) { background: var(--ui-chk-card-wash); box-shadow: var(--ui-chk-card-shadow-on); }
.ui-chk[data-variant="card"]:not([data-disabled]) .ui-chk__row:has(.ui-chk__input:checked):hover { box-shadow: var(--ui-chk-card-shadow-hover); }
.ui-chk[data-variant="card"] .ui-chk__label { font-weight: 500; }
.ui-chk[data-variant="card"] .ui-chk__error { margin-left: 2px; }

/* Touch screens: 16px text and a bigger box */
@media (pointer: coarse) {
  .ui-chk { font-size: 15px; line-height: 22px; }
  .ui-chk__control { width: 20px; height: 22px; }
  .ui-chk__box { width: 20px; height: 20px; border-radius: 5.5px; }
  .ui-chk__mark { width: 18px; height: 18px; }
}

@keyframes ui-chk-message {
  from { opacity: 0; transform: translateY(-3px); filter: blur(2px); }
}

@media (prefers-reduced-motion: reduce) {
  .ui-chk *, .ui-chk__row { transition-duration: 1ms !important; animation-duration: 1ms !important; }
}

/* Dark mode: follows a .dark class or data-theme="dark" on any ancestor, e.g. <html> */
:where(.dark, [data-theme="dark"]) .ui-chk {
  --ui-chk-ink: var(--aui-ink, #ededed);
  --ui-chk-subtle: var(--aui-muted, #8b8b92);
  --ui-chk-surface: var(--aui-surface, #19191b);
  --ui-chk-edge: var(--aui-border-strong, #3a3a40);
  --ui-chk-edge-hover: #55555c;
  --ui-chk-fill: var(--aui-primary, #ededed);
  --ui-chk-on-fill: var(--aui-on-primary, #161618);
  --ui-chk-card-shadow: 0 0 0 1px var(--aui-border, #2a2a2e), 0 1px 2px rgba(0, 0, 0, 0.2);
  --ui-chk-card-shadow-hover: 0 0 0 1px #2a2a2e, 0 6px 14px -6px rgba(0, 0, 0, 0.45);
  --ui-chk-card-shadow-on: 0 0 0 1px #2f2f34, 0 1px 2px rgba(0, 0, 0, 0.2);
  --ui-chk-card-wash: #1f1f22;
  --ui-chk-danger: var(--aui-danger, #ff8a7a);
  --ui-chk-focus: var(--aui-focus, rgba(77, 141, 255, 0.8));
}
`;
