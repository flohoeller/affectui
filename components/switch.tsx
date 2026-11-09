"use client";

import { useId, type ComponentPropsWithRef, type ReactNode } from "react";

/*
 * Switch – a single self-contained file.
 * On or off for something that takes effect right away: a real checkbox with role="switch", a label and a quiet
 * second line, the switch at the start or at the end of the row (settings rows put it on the right). The thumb
 * slides and stretches while it's pressed. Focus shows a ring only from the keyboard.
 * The styles are injected below, so no extra files are needed.
 */

export type SwitchProps = Omit<ComponentPropsWithRef<"input">, "type" | "size" | "role"> & {
  /** Shown next to the switch; clicking it toggles */
  label?: ReactNode;
  /** A quiet second line under the label */
  description?: ReactNode;
  /** start: the switch before the text · end: after it, across the row – the settings look */
  placement?: "start" | "end";
  /** sm 16 · md 20 high */
  size?: "sm" | "md";
};

export function Switch({ label, description, placement = "start", size = "md", className, id, disabled, ref, "aria-describedby": describedBy, ...rest }: SwitchProps) {
  const autoId = useId();
  const inputId = id ?? `${autoId}-input`;
  const descId = `${autoId}-desc`;

  return (
    <div
      className={["ui-sw", className].filter(Boolean).join(" ")}
      data-placement={placement === "end" ? "end" : "start"}
      data-size={size === "sm" ? "sm" : "md"}
      data-disabled={disabled || undefined}
    >
      {/* React 19 hoists this into <head> once, no matter how many switches render */}
      <style href="ui-switch" precedence="default">
        {css}
      </style>
      <label className="ui-sw__row" htmlFor={inputId}>
        <span className="ui-sw__control">
          <input
            {...rest}
            ref={ref}
            id={inputId}
            type="checkbox"
            role="switch"
            className="ui-sw__input"
            disabled={disabled}
            aria-describedby={[describedBy, description ? descId : null].filter(Boolean).join(" ") || undefined}
          />
          <span className="ui-sw__track" aria-hidden="true">
            <span className="ui-sw__thumb" />
          </span>
        </span>
        {(label != null || description != null) && (
          <span className="ui-sw__text">
            {label != null && <span className="ui-sw__label">{label}</span>}
            {description != null && (
              <span className="ui-sw__desc" id={descId}>
                {description}
              </span>
            )}
          </span>
        )}
      </label>
    </div>
  );
}

const css = /* css */ `
/* Colors and motion as variables – override them on .ui-sw (see Theming in the docs) */
.ui-sw {
  --ui-sw-ink: var(--aui-ink, #171717);
  --ui-sw-subtle: var(--aui-muted, #8f8f8f);
  --ui-sw-off: #e2e2e2;
  --ui-sw-off-hover: #d4d4d8;
  --ui-sw-on: var(--aui-primary, #171717);
  --ui-sw-on-hover: #2e2e2e;
  --ui-sw-thumb: #ffffff;
  --ui-sw-thumb-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  --ui-sw-focus: var(--aui-focus, rgba(0, 96, 226, 0.7));
  --ui-sw-ease: cubic-bezier(0.22, 1, 0.36, 1);

  /* The track: --w × --h, the thumb --h minus 4px */
  --w: 32px;
  --h: 20px;

  min-width: 0;
  font-family: var(--aui-font, "Inter", "InterVariable", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif);
  font-size: 13.5px;
  line-height: 20px;
  color: var(--ui-sw-ink);
  -webkit-font-smoothing: antialiased;
}
.ui-sw[data-size="sm"] { --w: 26px; --h: 16px; }

.ui-sw__row { display: flex; align-items: flex-start; gap: 10px; min-width: 0; cursor: pointer; -webkit-tap-highlight-color: transparent; }
/* At the end: the text first, the switch on the far right */
.ui-sw[data-placement="end"] .ui-sw__row { flex-direction: row-reverse; justify-content: space-between; gap: 16px; }
.ui-sw[data-disabled] .ui-sw__row { cursor: not-allowed; opacity: 0.5; }

/* The switch sits on the first line of the label, centered on it */
.ui-sw__control { position: relative; display: grid; flex: none; place-items: center; height: max(var(--h), 20px); }
.ui-sw__input { position: absolute; inset: -6px; width: calc(100% + 12px); height: calc(100% + 12px); margin: 0; opacity: 0; cursor: inherit; }
.ui-sw__track {
  position: relative;
  display: block;
  width: var(--w);
  height: var(--h);
  border-radius: 999px;
  background: var(--ui-sw-off);
  pointer-events: none;
  transition: background-color 200ms ease;
}
.ui-sw__thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: calc(var(--h) - 4px);
  height: calc(var(--h) - 4px);
  border-radius: 999px;
  background: var(--ui-sw-thumb);
  box-shadow: var(--ui-sw-thumb-shadow);
  transition: transform 260ms var(--ui-sw-ease), width 160ms var(--ui-sw-ease);
}
.ui-sw__row:hover .ui-sw__input:not(:disabled):not(:checked) + .ui-sw__track { background: var(--ui-sw-off-hover); }
.ui-sw__input:checked + .ui-sw__track { background: var(--ui-sw-on); }
.ui-sw__row:hover .ui-sw__input:not(:disabled):checked + .ui-sw__track { background: var(--ui-sw-on-hover); }
.ui-sw__input:checked + .ui-sw__track .ui-sw__thumb { transform: translateX(calc(var(--w) - var(--h))); }
/* Pressed: the thumb stretches toward where it's going */
.ui-sw__input:active:not(:disabled) + .ui-sw__track .ui-sw__thumb { width: calc(var(--h) + 1px); }
.ui-sw__input:active:not(:disabled):checked + .ui-sw__track .ui-sw__thumb { transform: translateX(calc(var(--w) - var(--h) - 5px)); }
.ui-sw__input:focus-visible + .ui-sw__track { outline: 2px solid var(--ui-sw-focus); outline-offset: 2px; }

.ui-sw__text { display: grid; flex: 1; min-width: 0; }
.ui-sw__label { color: var(--ui-sw-ink); overflow-wrap: anywhere; }
.ui-sw__desc { font-size: 12.5px; line-height: 17px; color: var(--ui-sw-subtle); overflow-wrap: anywhere; }

/* Touch screens: a bigger switch and 15px text */
@media (pointer: coarse) {
  .ui-sw { --w: 40px; --h: 24px; font-size: 15px; line-height: 22px; }
  .ui-sw[data-size="sm"] { --w: 34px; --h: 20px; }
  .ui-sw__control { height: max(var(--h), 22px); }
}

@media (prefers-reduced-motion: reduce) {
  .ui-sw__track, .ui-sw__thumb { transition-duration: 1ms; }
}

/* Dark mode: follows a .dark class or data-theme="dark" on any ancestor, e.g. <html> */
:where(.dark, [data-theme="dark"]) .ui-sw {
  --ui-sw-ink: var(--aui-ink, #ededed);
  --ui-sw-subtle: var(--aui-muted, #8b8b92);
  --ui-sw-off: #3a3a3f;
  --ui-sw-off-hover: #46464c;
  --ui-sw-on: var(--aui-primary, #ededed);
  --ui-sw-on-hover: #d4d4d8;
  --ui-sw-thumb: #ffffff;
  --ui-sw-focus: var(--aui-focus, rgba(77, 141, 255, 0.8));
}
:where(.dark, [data-theme="dark"]) .ui-sw__input:checked + .ui-sw__track .ui-sw__thumb { background: #161618; box-shadow: none; }
`;
