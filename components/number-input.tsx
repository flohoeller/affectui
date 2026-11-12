"use client";

import { useEffect, useId, useMemo, useRef, useState, type ComponentPropsWithRef, type ReactNode } from "react";

/*
 * Number Input – a single self-contained file.
 * A field for one number: − and + to step it (hold to keep going), the arrow keys, Page Up / Page Down for big steps,
 * Home / End for the limits. A unit sits right after the value ("4,000 tokens", "25 %"), the value is formatted for
 * the locale when you leave the field and kept between min and max. Label, hint and error like the Text Field; a white
 * field with a soft gray edge that only darkens on focus – the buttons get the ring. The styles are injected below, so no extra files are needed.
 */

export type NumberInputProps = Omit<
  ComponentPropsWithRef<"input">,
  "type" | "size" | "prefix" | "value" | "defaultValue" | "onChange" | "min" | "max" | "step"
> & {
  /** The number; null is an empty field. Pass it with onValueChange to control the field */
  value?: number | null;
  /** The starting number when the field keeps its own value */
  defaultValue?: number | null;
  /** Called with the new number after a step, or when typing is done (blur or Enter) – null when emptied */
  onValueChange?: (value: number | null) => void;
  /** The lowest value – typing less is raised to it, − stops there */
  min?: number;
  /** The highest value – typing more is lowered to it, + stops there */
  max?: number;
  /** How much − / + and the arrow keys change the value */
  step?: number;
  /** How much Page Up / Page Down change it – 10 steps by default */
  largeStep?: number;
  /** Text after the value – e.g. "tokens" or "%" */
  unit?: ReactNode;
  /** Text or an icon before the value – e.g. "$" */
  prefix?: ReactNode;
  /** The locale the value is shown and read in – the browser's by default */
  locale?: string;
  /** How the value is shown, e.g. { maximumFractionDigits: 2 } or { style: "percent" } */
  formatOptions?: Intl.NumberFormatOptions;
  /** Shown above the field and tied to it */
  label?: ReactNode;
  /** A quiet line under the field – the error takes its place while there is one */
  hint?: ReactNode;
  /** Marks the field invalid and shows this under it, in place of the hint */
  error?: ReactNode;
  /** "Optional" next to the label */
  optional?: boolean;
  /** sm 32 · md 36 · lg 40 high */
  size?: "sm" | "md" | "lg";
  /** Extra class on the input itself; className goes on the wrapper */
  inputClassName?: string;
};

export function NumberInput({
  value,
  defaultValue = null,
  onValueChange,
  min,
  max,
  step = 1,
  largeStep,
  unit,
  prefix,
  locale,
  formatOptions,
  label,
  hint,
  error,
  optional = false,
  size = "md",
  className,
  inputClassName,
  id,
  name,
  form,
  disabled,
  readOnly,
  placeholder,
  onKeyDown,
  onBlur,
  ref,
  "aria-describedby": describedBy,
  ...rest
}: NumberInputProps) {
  const autoId = useId();
  const inputId = id ?? `${autoId}-input`;
  const messageId = `${autoId}-message`;
  const input = useRef<HTMLInputElement | null>(null);

  const [own, setOwn] = useState<number | null>(defaultValue);
  const controlled = value !== undefined;
  const current = controlled ? value : own;
  const num = current != null && Number.isFinite(current) ? current : null;
  // What's typed while the field is being edited; null shows the formatted value
  const [draft, setDraft] = useState<string | null>(null);

  const stepSize = step > 0 && Number.isFinite(step) ? step : 1;
  const bigStep = largeStep && largeStep > 0 ? largeStep : stepSize * 10;
  const lo = min ?? -Infinity;
  const hi = max ?? Infinity;

  const fmt = useMemo(() => {
    try {
      return new Intl.NumberFormat(locale, formatOptions);
    } catch {
      return new Intl.NumberFormat(undefined, formatOptions);
    }
  }, [locale, formatOptions]);
  const percent = formatOptions?.style === "percent";
  const marks = useMemo(() => separators(fmt), [fmt]);

  const shown = draft ?? (num === null ? "" : fmt.format(num));
  const invalid = Boolean(error) || rest["aria-invalid"] === true || rest["aria-invalid"] === "true";
  const message = shows(error) ? error : shows(hint) ? hint : null;
  const scale = SIZES.includes(size) ? size : "md";
  const fallbackName = label == null && !rest["aria-label"] && !rest["aria-labelledby"] && typeof placeholder === "string" ? placeholder : undefined;

  const clamp = (v: number) => Math.min(hi, Math.max(lo, v));
  const set = (next: number | null) => {
    if (!controlled) setOwn(next);
    if (next !== num) onValueChange?.(next);
  };

  /** Reads what's typed: the locale's separators, a minus, a percent – null when empty, NaN when it's no number */
  const read = (text: string): number | null => {
    let t = text.replace(/[\s  ]/g, "");
    if (t === "") return null;
    if (marks.group) t = t.split(marks.group).join("");
    if (marks.decimal !== ".") t = t.split(marks.decimal).join(".");
    const negative = /^[-−]|[-−]$|^\(.*\)$/.test(t);
    t = t.replace(/[^\d.]/g, "");
    if (t === "" || t === "." || (t.match(/\./g)?.length ?? 0) > 1) return NaN;
    const n = Number(t) * (negative ? -1 : 1);
    return percent ? n / 100 : n;
  };

  /** Takes what's typed: clamped, formatted; something unreadable goes back to the last value */
  const commit = () => {
    if (draft === null) return;
    const parsed = read(draft);
    setDraft(null);
    if (parsed === null) return set(null);
    if (!Number.isFinite(parsed)) return;
    set(clamp(round(parsed, stepSize)));
  };

  /** One step up or down from the current (or typed) value, onto the step grid */
  const nudge = (dir: 1 | -1, by = stepSize) => {
    if (disabled || readOnly) return;
    const typed = draft !== null ? read(draft) : num;
    const base = typed !== null && Number.isFinite(typed) ? typed : null;
    // An empty field starts at min (or 0) – the first press doesn't skip a step
    const origin = Number.isFinite(lo) ? lo : 0;
    let next: number;
    if (base === null) next = clamp(Number.isFinite(lo) ? lo : 0);
    else if (by !== stepSize) next = clamp(round(origin + Math.round((base + dir * by - origin) / stepSize) * stepSize, stepSize));
    else {
      const k = (base - origin) / by;
      // Off the grid: the first step lands on it instead of jumping past
      const snapped = dir > 0 ? Math.floor(k + 1e-9) + 1 : Math.ceil(k - 1e-9) - 1;
      next = clamp(round(origin + snapped * by, by));
    }
    setDraft(null);
    // Already at the limit: nothing moves
    if (next === base) {
      if (draft !== null) set(next);
      return;
    }
    set(next);
    roll(input.current, dir);
  };

  const atMin = num !== null && num <= lo;
  const atMax = num !== null && num >= hi;

  // Hold − or + to keep stepping: a pause, then faster
  const hold = useRef<{ timer: number; dir: 1 | -1 } | null>(null);
  const stop = () => {
    if (hold.current) window.clearTimeout(hold.current.timer);
    hold.current = null;
  };
  const nudgeRef = useRef(nudge);
  nudgeRef.current = nudge;
  const press = (dir: 1 | -1) => {
    stop();
    nudgeRef.current(dir);
    const tick = (delay: number) => {
      hold.current = {
        dir,
        timer: window.setTimeout(() => {
          nudgeRef.current(dir);
          // After the first pause it repeats quickly and speeds up a little
          tick(delay >= 400 ? 120 : Math.max(40, delay * 0.9));
        }, delay),
      };
    };
    tick(400);
  };
  useEffect(() => stop, []);
  // Stops at the limit, so a held button doesn't keep firing at nothing
  useEffect(() => {
    if (hold.current && ((hold.current.dir > 0 && atMax) || (hold.current.dir < 0 && atMin))) stop();
  }, [atMax, atMin]);

  const unitText = typeof unit === "string" ? unit : "";
  const valueText = num === null ? undefined : `${typeof prefix === "string" ? prefix : ""}${fmt.format(num)}${unitText ? ` ${unitText}` : ""}`;

  const stepper = (dir: 1 | -1) => {
    const blocked = disabled || readOnly || (dir > 0 ? atMax : atMin);
    return (
      <button
        type="button"
        className="ui-nmi__step"
        // One tab stop per field, as in the spinbutton pattern: the arrow keys step, the buttons are for the pointer
        tabIndex={-1}
        aria-label={dir > 0 ? "Increase" : "Decrease"}
        aria-controls={inputId}
        aria-disabled={blocked || undefined}
        disabled={disabled}
        // Keeps the caret in the field while you click, and starts the hold-to-repeat
        onPointerDown={(e) => {
          if (e.button !== 0) return;
          e.preventDefault();
          if (!blocked) press(dir);
        }}
        onPointerUp={stop}
        onPointerLeave={stop}
        onPointerCancel={stop}
        onContextMenu={(e) => e.preventDefault()}
        // Enter or Space on a focused button (pointer clicks are handled above)
        onClick={(e) => {
          if (e.detail === 0 && !blocked) nudge(dir);
        }}
      >
        {dir > 0 ? <PlusIcon /> : <MinusIcon />}
      </button>
    );
  };

  return (
    <div
      className={["ui-nmi", className].filter(Boolean).join(" ")}
      data-size={scale}
      data-invalid={invalid || undefined}
      data-disabled={disabled || undefined}
      data-readonly={readOnly || undefined}
    >
      {/* React 19 hoists this into <head> once, no matter how many fields render */}
      <style href="ui-number-input" precedence="default">
        {css}
      </style>
      {label != null && (
        <div className="ui-nmi__head">
          <label className="ui-nmi__label" htmlFor={inputId}>
            {label}
          </label>
          {optional && <span className="ui-nmi__optional">Optional</span>}
        </div>
      )}
      {/* A click anywhere on the box – the unit, the padding – puts the caret in the input */}
      <div
        className="ui-nmi__box"
        onPointerDown={(e) => {
          if (e.target === input.current || (e.target as HTMLElement).closest("button")) return;
          e.preventDefault();
          input.current?.focus();
        }}
      >
        {prefix != null && <span className="ui-nmi__affix" data-side="start">{prefix}</span>}
        <input
          {...rest}
          ref={(el) => {
            input.current = el;
            if (typeof ref === "function") ref(el);
            else if (ref) ref.current = el;
          }}
          id={inputId}
          className={["ui-nmi__input", inputClassName].filter(Boolean).join(" ")}
          type="text"
          // Phone keypads: digits only, a decimal key when the value has decimals, the full keyboard when it can go below 0
          inputMode={lo < 0 ? "text" : !Number.isInteger(stepSize) || marks.decimals || percent ? "decimal" : "numeric"}
          role="spinbutton"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          value={shown}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          form={form}
          aria-label={rest["aria-label"] ?? fallbackName}
          aria-valuenow={num ?? undefined}
          aria-valuemin={Number.isFinite(lo) ? lo : undefined}
          aria-valuemax={Number.isFinite(hi) ? hi : undefined}
          aria-valuetext={valueText}
          aria-invalid={invalid || undefined}
          aria-describedby={[describedBy, message ? messageId : null].filter(Boolean).join(" ") || undefined}
          // The value hugs its text, so the unit sits right after it
          style={{ width: `calc(${Math.max(2, (shown || placeholder || "").length)}ch + 2px)`, ...rest.style }}
          onChange={(e) => setDraft(e.target.value.replace(ALLOWED, ""))}
          onBlur={(e) => {
            commit();
            onBlur?.(e);
          }}
          onKeyDown={(e) => {
            onKeyDown?.(e);
            if (e.defaultPrevented || e.nativeEvent.isComposing) return;
            const keys: Record<string, () => void> = {
              ArrowUp: () => nudge(1),
              ArrowDown: () => nudge(-1),
              PageUp: () => nudge(1, bigStep),
              PageDown: () => nudge(-1, bigStep),
              Enter: () => commit(),
              Escape: () => setDraft(null),
            };
            if (Number.isFinite(lo)) keys.Home = () => (setDraft(null), set(lo), roll(input.current, -1));
            if (Number.isFinite(hi)) keys.End = () => (setDraft(null), set(hi), roll(input.current, 1));
            const run = keys[e.key];
            if (!run || readOnly) return;
            // Enter still submits the form; Escape only counts while something was typed
            if (e.key === "Escape" && draft === null) return;
            if (e.key !== "Enter") e.preventDefault();
            run();
          }}
        />
        {unit != null && <span className="ui-nmi__affix" data-side="end">{unit}</span>}
        <span className="ui-nmi__steps">
          {stepper(-1)}
          {stepper(1)}
        </span>
      </div>
      {/* The plain number goes with the form, not the formatted text */}
      {name && <input type="hidden" name={name} form={form} value={num ?? ""} disabled={disabled} />}
      {message && (
        <p className="ui-nmi__message" id={messageId} key={shows(error) ? "error" : "hint"} dir="auto" aria-live={shows(error) ? "polite" : undefined}>
          {message}
        </p>
      )}
    </div>
  );
}

const SIZES = ["sm", "md", "lg"];
/** What can be typed: digits, separators, a minus, a percent sign – letters never show up */
const ALLOWED = /[^\d.,'’\s  \-−%]/g;
/** Text or an element – not true, false, null or an empty string */
const shows = (v: ReactNode) => v != null && typeof v !== "boolean" && v !== "";

/** The locale's group and decimal marks, and whether the format always shows decimals */
function separators(fmt: Intl.NumberFormat) {
  const parts = fmt.formatToParts(-12345.6789);
  return {
    group: parts.find((p) => p.type === "group")?.value ?? "",
    decimal: parts.find((p) => p.type === "decimal")?.value ?? ".",
    // Shown with decimals on purpose (minimumFractionDigits), so a decimal key is needed
    decimals: (fmt.resolvedOptions().minimumFractionDigits ?? 0) > 0,
  };
}

/** Rounds away float noise (0.1 + 0.2) to the step's own decimals, at least 10 */
function round(v: number, step: number) {
  const places = Math.max(10, (String(step).split(".")[1] ?? "").length);
  return Number(v.toFixed(Math.min(places, 15)));
}

/** The one motion: the new value rolls in from the direction it moved */
function roll(el: HTMLInputElement | null, dir: 1 | -1) {
  if (!el || typeof el.animate !== "function") return;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
  el.animate(
    [
      { transform: `translateY(${dir * 5}px)`, opacity: 0.35, filter: "blur(1.5px)" },
      { transform: "none", opacity: 1, filter: "none" },
    ],
    { duration: 220, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
  );
}

/* Icons: Hugeicons Free (MIT), drawn at 16px */
function MinusIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <path d="M20 12H4" />
    </svg>
  );
}
function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <path d="M12 4v16M20 12H4" />
    </svg>
  );
}

const css = /* css */ `
/* Colors and motion as variables – override them on .ui-nmi (see Theming in the docs) */
.ui-nmi {
  --ui-nmi-title: var(--aui-ink, #171717);
  --ui-nmi-ink: var(--aui-ink, #171717);
  --ui-nmi-subtle: var(--aui-muted, #8f8f8f);
  --ui-nmi-faint: var(--aui-placeholder, #b5b5b5);
  --ui-nmi-icon: var(--aui-muted, #8f8f8f);
  --ui-nmi-surface: var(--aui-surface, #ffffff);
  --ui-nmi-wash: #f4f4f5;
  --ui-nmi-press: #ebebed;
  --ui-nmi-readonly: #fafafa;
  --ui-nmi-line: var(--aui-border, #e6e6e8);
  --ui-nmi-shadow: 0 0 0 1px var(--ui-nmi-line), 0 1px 2px rgba(0, 0, 0, 0.04);
  --ui-nmi-shadow-hover: 0 0 0 1px var(--aui-border-strong, #d4d4d8), 0 1px 2px rgba(0, 0, 0, 0.04);
  --ui-nmi-shadow-focus: 0 0 0 1px var(--aui-border-strong, #b4b4bb), 0 1px 2px rgba(0, 0, 0, 0.04);
  --ui-nmi-danger: var(--aui-danger, #c4320a);
  --ui-nmi-danger-edge: #ff8a7a;
  --ui-nmi-danger-edge-focus: #f04438;
  --ui-nmi-danger-wash: color-mix(in srgb, var(--aui-red, #f04438) 4%, transparent);
  --ui-nmi-focus: var(--aui-focus, rgba(0, 96, 226, 0.7));
  --ui-nmi-ease: cubic-bezier(0.22, 1, 0.36, 1);

  --h: 36px;
  --px: 12px;
  --fs: 13.5px;
  --radius: var(--aui-radius, 10px);

  display: flex;
  flex-direction: column;
  gap: 7px;
  min-width: 0;
  font-family: var(--aui-font, "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif);
  font-size: 13.5px;
  line-height: 20px;
  color: var(--ui-nmi-ink);
  -webkit-font-smoothing: antialiased;
}
.ui-nmi[data-size="sm"] { --h: 32px; --px: 10px; --fs: 13px; --radius: calc(var(--aui-radius, 10px) - 1px); }
.ui-nmi[data-size="lg"] { --h: 40px; --px: 14px; --fs: 14px; --radius: calc(var(--aui-radius, 10px) + 2px); }
/* Touch screens: a comfortable tap height, and 16px text so iOS doesn't zoom in on focus */
@media (pointer: coarse) {
  .ui-nmi { --fs: 16px; }
  .ui-nmi[data-size="sm"] { --h: 36px; }
  .ui-nmi[data-size="md"] { --h: 40px; }
  .ui-nmi[data-size="lg"] { --h: 44px; }
}

.ui-nmi__head { display: flex; align-items: baseline; gap: 6px; min-width: 0; padding: 0 2px; }
.ui-nmi__label { min-width: 0; font-size: 13px; font-weight: 500; color: var(--ui-nmi-title); overflow-wrap: anywhere; cursor: default; }
.ui-nmi__optional { flex: none; font-size: 12px; line-height: 16px; color: var(--ui-nmi-subtle); }

/* The box: white with a 1px gray edge; hover and focus only darken that edge – no ring */
.ui-nmi__box {
  display: flex;
  align-items: center;
  gap: 4px;
  box-sizing: border-box;
  height: var(--h);
  min-width: 0;
  padding-inline: var(--px) 5px;
  border-radius: var(--radius);
  background: var(--ui-nmi-surface);
  box-shadow: var(--ui-nmi-shadow);
  cursor: text;
  transition: box-shadow 160ms ease, background-color 160ms ease;
}
.ui-nmi__box:hover { box-shadow: var(--ui-nmi-shadow-hover); }
.ui-nmi__box:has(.ui-nmi__input:focus) { box-shadow: var(--ui-nmi-shadow-focus); }
.ui-nmi[data-invalid] .ui-nmi__box { background: var(--ui-nmi-danger-wash); box-shadow: 0 0 0 1px var(--ui-nmi-danger-edge), 0 1px 2px rgba(0, 0, 0, 0.04); }
.ui-nmi[data-invalid] .ui-nmi__box:has(.ui-nmi__input:focus) { box-shadow: 0 0 0 1px var(--ui-nmi-danger-edge-focus), 0 1px 2px rgba(0, 0, 0, 0.04); }
.ui-nmi[data-readonly] .ui-nmi__box { background: var(--ui-nmi-readonly); box-shadow: 0 0 0 1px var(--ui-nmi-line); cursor: default; }
.ui-nmi[data-disabled] .ui-nmi__box { background: var(--ui-nmi-readonly); box-shadow: 0 0 0 1px var(--ui-nmi-line); cursor: not-allowed; }
.ui-nmi[data-disabled] { opacity: 0.55; }

/* The value: as wide as its text (set inline), so the unit follows it; it shrinks before the buttons do */
.ui-nmi__input {
  flex: 0 1 auto;
  min-width: 2ch;
  max-width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  border: 0;
  outline: 0;
  background: transparent;
  font: inherit;
  font-size: var(--fs);
  font-variant-numeric: tabular-nums;
  color: var(--ui-nmi-ink);
  text-overflow: ellipsis;
  -webkit-appearance: none;
  appearance: none;
}
.ui-nmi__input::placeholder { color: var(--ui-nmi-faint); opacity: 1; }
.ui-nmi__input:disabled { cursor: not-allowed; }

/* Prefix and unit: quiet text right against the value */
.ui-nmi__affix {
  display: inline-flex;
  flex: 0 1 auto;
  align-items: center;
  min-width: 0;
  max-width: 40%;
  font-size: var(--fs);
  color: var(--ui-nmi-subtle);
  white-space: nowrap;
  user-select: none;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ui-nmi__affix[data-side="start"] { margin-inline-end: -2px; }
.ui-nmi__affix > svg { display: block; width: 16px; height: 16px; flex: none; color: var(--ui-nmi-icon); }

/* − and +: two small buttons at the end */
.ui-nmi__steps { display: flex; flex: none; gap: 2px; margin-inline-start: auto; padding-inline-start: 4px; }
.ui-nmi__step {
  display: grid;
  place-items: center;
  position: relative;
  width: calc(var(--h) - 10px);
  height: calc(var(--h) - 10px);
  max-width: 28px;
  max-height: 28px;
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: calc(var(--radius) - 4px);
  background: transparent;
  color: var(--ui-nmi-icon);
  cursor: pointer;
  touch-action: manipulation;
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
  transition: background-color 140ms ease, color 140ms ease;
}
.ui-nmi__step:hover:not([aria-disabled]):not(:disabled) { background: var(--ui-nmi-wash); color: var(--ui-nmi-ink); }
.ui-nmi__step:active:not([aria-disabled]):not(:disabled) { background: var(--ui-nmi-press); }
.ui-nmi__step:focus-visible { outline: 2px solid var(--ui-nmi-focus); outline-offset: -2px; }
.ui-nmi__step[aria-disabled], .ui-nmi__step:disabled { opacity: 0.35; cursor: default; }
.ui-nmi__step svg { display: block; transition: transform 120ms var(--ui-nmi-ease); }
.ui-nmi__step:active:not([aria-disabled]):not(:disabled) svg { transform: scale(0.86); }
.ui-nmi[data-readonly] .ui-nmi__steps { display: none; }
/* Touch screens: bigger buttons and a hit area that reaches past them */
@media (pointer: coarse) {
  .ui-nmi__step { width: 32px; height: 32px; max-width: none; max-height: none; }
  .ui-nmi__step::before { content: ""; position: absolute; inset: -4px 0; }
}

/* Under the field: the hint, or the error in its place */
.ui-nmi__message {
  margin: 0;
  padding: 0 2px;
  font-size: 12.5px;
  line-height: 17px;
  color: var(--ui-nmi-subtle);
  overflow-wrap: anywhere;
  animation: ui-nmi-message 260ms var(--ui-nmi-ease);
}
.ui-nmi[data-invalid] .ui-nmi__message { color: var(--ui-nmi-danger); }

@keyframes ui-nmi-message {
  from { opacity: 0; transform: translateY(-3px); filter: blur(2px); }
}

@media (prefers-reduced-motion: reduce) {
  .ui-nmi * { animation-duration: 1ms !important; transition-duration: 1ms !important; }
  .ui-nmi__box { transition-duration: 1ms; }
}

/* Dark mode: follows a .dark class or data-theme="dark" on any ancestor, e.g. <html> */
:where(.dark, [data-theme="dark"]) .ui-nmi {
  --ui-nmi-title: var(--aui-ink, #ededed);
  --ui-nmi-ink: var(--aui-ink, #ededed);
  --ui-nmi-subtle: var(--aui-muted, #8b8b92);
  --ui-nmi-faint: var(--aui-placeholder, #5c5c63);
  --ui-nmi-icon: var(--aui-muted, #8b8b92);
  --ui-nmi-surface: var(--aui-surface, #19191b);
  --ui-nmi-wash: #26262a;
  --ui-nmi-press: #2e2e33;
  --ui-nmi-readonly: #151517;
  --ui-nmi-line: var(--aui-border, #2a2a2e);
  --ui-nmi-shadow: 0 0 0 1px var(--ui-nmi-line);
  --ui-nmi-shadow-hover: 0 0 0 1px var(--aui-border-strong, #3a3a40);
  --ui-nmi-shadow-focus: 0 0 0 1px var(--aui-border-strong, #4e4e55);
  --ui-nmi-danger: var(--aui-danger, #ff8a7a);
  --ui-nmi-danger-edge: color-mix(in srgb, var(--aui-red, #ff6b5f) 45%, transparent);
  --ui-nmi-danger-edge-focus: rgba(255, 99, 105, 0.75);
  --ui-nmi-danger-wash: color-mix(in srgb, var(--aui-red, #ff6b5f) 6%, transparent);
  --ui-nmi-focus: var(--aui-focus, rgba(77, 141, 255, 0.8));
}
`;
