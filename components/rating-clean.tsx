"use client";

import { useState, type ComponentPropsWithRef, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent } from "react";

/*
 * Rating – a single self-contained file, clean style.
 * Stars from 1 to 5 (or any max), or thumbs up and down for rating an AI answer. Hovering previews, a press sets it,
 * pressing the chosen one again clears it. It is a radio group: one tab stop, the arrows move and choose. Read-only
 * it shows halves too ("4.5 out of 5") and is read out as one picture. A choice fills with a short pop.
 * The styles are injected below, so no extra files are needed.
 */

type Base = Omit<ComponentPropsWithRef<"div">, "defaultValue" | "onChange" | "children"> & {
  /** Only shows the value – no buttons, read out as one picture ("4.5 out of 5"); stars show halves */
  readOnly?: boolean;
  disabled?: boolean;
  /** Stars 14 · 18 · 24 px, thumbs 24 · 28 · 32 px buttons */
  size?: "sm" | "md" | "lg";
  /** Pressing the chosen one again (or Delete) clears it */
  allowClear?: boolean;
  /** Sends the value with a form ("" when nothing is chosen) */
  name?: string;
};

export type StarRatingProps = Base & {
  variant?: "stars";
  /** 1 to max, or null for none. Read-only it may be a fraction – shown to the nearest half */
  value?: number | null;
  defaultValue?: number | null;
  onValueChange?: (value: number | null) => void;
  /** How many stars */
  max?: number;
  /** How a value is read out – "3 out of 5" by default */
  getValueLabel?: (value: number, max: number) => string;
};

export type ThumbsRatingProps = Base & {
  variant: "thumbs";
  value?: "up" | "down" | null;
  defaultValue?: "up" | "down" | null;
  onValueChange?: (value: "up" | "down" | null) => void;
  /** The two buttons' names – "Good response" and "Bad response" by default */
  labels?: { up?: string; down?: string };
};

export type RatingProps = StarRatingProps | ThumbsRatingProps;

export function Rating(props: RatingProps) {
  return (
    <>
      {/* React 19 hoists this into <head> once, no matter how many ratings render */}
      <style href="ui-rating-clean" precedence="default">
        {css}
      </style>
      {props.variant === "thumbs" ? <Thumbs {...props} /> : <Stars {...props} />}
    </>
  );
}

/* ---------- Stars ---------- */

const num = new Intl.NumberFormat("en", { maximumFractionDigits: 1 });
const outOf = (value: number, max: number) => `${num.format(value)} out of ${max}`;

function Stars({
  variant: _variant,
  value: valueProp,
  defaultValue = null,
  onValueChange,
  max: maxProp = 5,
  readOnly,
  disabled,
  size = "md",
  allowClear = true,
  getValueLabel = outOf,
  name,
  className,
  ...rest
}: StarRatingProps) {
  const [value, setValue] = useControllable(valueProp, defaultValue, onValueChange);
  const [hover, setHover] = useState<number | null>(null);
  const [burst, setBurst] = useState({ upTo: 0, n: 0 });
  const max = Math.min(50, Math.max(1, Math.floor(Number(maxProp) || 5)));
  const items = Array.from({ length: max }, (_, i) => i + 1);
  const cls = ["ui-rtgc", className].filter(Boolean).join(" ");
  const sz = size === "sm" || size === "lg" ? size : "md";

  if (readOnly) {
    const v = typeof value === "number" && Number.isFinite(value) ? Math.min(max, Math.max(0, value)) : null;
    const shown = v == null ? 0 : Math.round(v * 2) / 2;
    return (
      <div {...rest} role="img" aria-label={rest["aria-label"] ?? (v == null ? "No rating" : getValueLabel(v, max))} className={cls} data-size={sz} data-readonly="">
        {items.map((i) => (
          <span key={i} className="ui-rtgc__star">
            <StarGlyph fill={Math.min(1, Math.max(0, shown - (i - 1)))} />
          </span>
        ))}
      </div>
    );
  }

  const chosen = typeof value === "number" ? Math.min(max, Math.max(1, Math.round(value))) : null;
  const shown = hover ?? chosen ?? 0;
  const choose = (i: number | null) => {
    setValue(i);
    if (i != null) setBurst((b) => ({ upTo: i, n: b.n + 1 }));
  };

  const onKeyDown = (e: ReactKeyboardEvent<HTMLButtonElement>) => {
    if ((e.key === "Delete" || e.key === "Backspace") && allowClear) {
      e.preventDefault();
      choose(null);
      return;
    }
    const back = getComputedStyle(e.currentTarget).direction === "rtl";
    const now = chosen ?? 0;
    const to =
      e.key === "Home" ? 1 : e.key === "End" ? max : e.key === "ArrowUp" || e.key === (back ? "ArrowLeft" : "ArrowRight") ? now + 1 : e.key === "ArrowDown" || e.key === (back ? "ArrowRight" : "ArrowLeft") ? now - 1 : null;
    if (to == null) return;
    e.preventDefault();
    const next = Math.min(max, Math.max(1, to));
    setHover(null);
    choose(next);
    (e.currentTarget.parentElement?.children[next - 1] as HTMLElement | undefined)?.focus();
  };

  return (
    <div
      {...rest}
      role="radiogroup"
      aria-label={rest["aria-label"] ?? (rest["aria-labelledby"] ? undefined : "Rating")}
      aria-disabled={disabled || undefined}
      className={cls}
      data-size={sz}
      data-disabled={disabled || undefined}
      onPointerLeave={(e) => {
        setHover(null);
        rest.onPointerLeave?.(e);
      }}
    >
      {items.map((i) => {
        const pop = burst.n > 0 && i <= burst.upTo && i <= (chosen ?? 0);
        return (
          <button
            key={i}
            type="button"
            role="radio"
            className="ui-rtgc__star"
            aria-checked={chosen === i}
            aria-label={getValueLabel(i, max)}
            tabIndex={i === (chosen ?? 1) ? 0 : -1}
            disabled={disabled}
            data-hover={hover === i || undefined}
            onPointerEnter={(e) => {
              if (e.pointerType === "mouse") setHover(i);
            }}
            onClick={() => choose(chosen === i && allowClear ? null : i)}
            onKeyDown={onKeyDown}
          >
            <StarGlyph key={pop ? `pop-${burst.n}` : "rest"} fill={i <= shown ? 1 : 0} pop={pop} delay={(i - 1) * 40} preview={hover != null} />
          </button>
        );
      })}
      {name && <input type="hidden" name={name} value={chosen ?? ""} />}
    </div>
  );
}

/* Star: Hugeicons Free (MIT, © Hugeicons, hugeicons.com) – drawn solid, a second copy clipped on top for the fill */
const STAR =
  "M13.7276 3.44418L15.4874 6.99288C15.7274 7.48687 16.3673 7.9607 16.9073 8.05143L20.0969 8.58575C22.1367 8.92853 22.6167 10.4206 21.1468 11.8925L18.6671 14.3927C18.2471 14.8161 18.0172 15.6327 18.1471 16.2175L18.8571 19.3125C19.417 21.7623 18.1271 22.71 15.9774 21.4296L12.9877 19.6452C12.4478 19.3226 11.5579 19.3226 11.0079 19.6452L8.01827 21.4296C5.8785 22.71 4.57865 21.7522 5.13859 19.3125L5.84851 16.2175C5.97849 15.6327 5.74852 14.8161 5.32856 14.3927L2.84884 11.8925C1.389 10.4206 1.85895 8.92853 3.89872 8.58575L7.08837 8.05143C7.61831 7.9607 8.25824 7.48687 8.49821 6.99288L10.258 3.44418C11.2179 1.51861 12.7777 1.51861 13.7276 3.44418Z";

function StarGlyph({ fill, pop, delay = 0, preview }: { fill: number; pop?: boolean; delay?: number; preview?: boolean }) {
  return (
    <span
      className="ui-rtgc__glyph"
      data-pop={pop || undefined}
      data-preview={preview || undefined}
      style={{ "--ui-rtgc-f": fill, animationDelay: `${delay}ms` } as CSSProperties}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" className="ui-rtgc__empty" focusable="false">
        <path d={STAR} fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
      {fill > 0 && (
        <svg viewBox="0 0 24 24" className="ui-rtgc__fill" focusable="false">
          <path d={STAR} fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      )}
    </span>
  );
}

/* ---------- Thumbs ---------- */

function Thumbs({
  variant: _variant,
  value: valueProp,
  defaultValue = null,
  onValueChange,
  labels,
  readOnly,
  disabled,
  size = "md",
  allowClear = true,
  name,
  className,
  ...rest
}: ThumbsRatingProps) {
  const [value, setValue] = useControllable(valueProp, defaultValue, onValueChange);
  const [burst, setBurst] = useState(0);
  const cls = ["ui-rtgc", "ui-rtgc--thumbs", className].filter(Boolean).join(" ");
  const sz = size === "sm" || size === "lg" ? size : "md";
  const names = { up: labels?.up ?? "Good response", down: labels?.down ?? "Bad response" };
  const chosen = value === "up" || value === "down" ? value : null;
  const choose = (v: "up" | "down" | null) => {
    setValue(v);
    if (v) setBurst((n) => n + 1);
  };

  if (readOnly) {
    return (
      <div {...rest} role="img" aria-label={rest["aria-label"] ?? (chosen ? `Rated: ${names[chosen]}` : "Not rated")} className={cls} data-size={sz} data-readonly="">
        {(["up", "down"] as const).map((k) => (
          <span key={k} className="ui-rtgc__thumb" data-on={chosen === k || undefined}>
            <ThumbGlyph down={k === "down"} solid={chosen === k} />
          </span>
        ))}
      </div>
    );
  }

  return (
    <div
      {...rest}
      role="radiogroup"
      aria-label={rest["aria-label"] ?? (rest["aria-labelledby"] ? undefined : "Rate this response")}
      aria-disabled={disabled || undefined}
      className={cls}
      data-size={sz}
      data-disabled={disabled || undefined}
    >
      {(["up", "down"] as const).map((k) => (
        <button
          key={k}
          type="button"
          role="radio"
          className="ui-rtgc__thumb"
          aria-checked={chosen === k}
          aria-label={names[k]}
          title={names[k]}
          tabIndex={k === (chosen ?? "up") ? 0 : -1}
          disabled={disabled}
          data-on={chosen === k || undefined}
          onClick={() => choose(chosen === k && allowClear ? null : k)}
          onKeyDown={(e) => {
            if ((e.key === "Delete" || e.key === "Backspace") && allowClear) {
              e.preventDefault();
              choose(null);
              return;
            }
            if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(e.key)) return;
            e.preventDefault();
            const other = e.key === "Home" ? "up" : e.key === "End" ? "down" : k === "up" ? "down" : "up";
            choose(other);
            (e.currentTarget.parentElement?.children[other === "up" ? 0 : 1] as HTMLElement | undefined)?.focus();
          }}
        >
          <ThumbGlyph key={chosen === k ? `pop-${burst}` : "rest"} down={k === "down"} solid={chosen === k} pop={chosen === k && burst > 0} />
        </button>
      ))}
      {name && <input type="hidden" name={name} value={chosen ?? ""} />}
    </div>
  );
}

/* Thumbs up / down: Hugeicons Free (MIT, © Hugeicons, hugeicons.com) – rounded 1.5px strokes, filled when chosen */
const THUMB_UP = [
  "M2 12.5C2 11.3954 2.89543 10.5 4 10.5C5.65685 10.5 7 11.8431 7 13.5V17.5C7 19.1569 5.65685 20.5 4 20.5C2.89543 20.5 2 19.6046 2 18.5V12.5Z",
  "M15.4787 7.80626L15.2124 8.66634C14.9942 9.37111 14.8851 9.72349 14.969 10.0018C15.0369 10.2269 15.1859 10.421 15.389 10.5487C15.64 10.7065 16.0197 10.7065 16.7791 10.7065H17.1831C19.7532 10.7065 21.0382 10.7065 21.6452 11.4673C21.7145 11.5542 21.7762 11.6467 21.8296 11.7437C22.2965 12.5921 21.7657 13.7351 20.704 16.0211C19.7297 18.1189 19.2425 19.1678 18.338 19.7852C18.2505 19.8449 18.1605 19.9013 18.0683 19.9541C17.116 20.5 15.9362 20.5 13.5764 20.5H13.0646C10.2057 20.5 8.77628 20.5 7.88814 19.6395C7 18.7789 7 17.3939 7 14.6239V13.6503C7 12.1946 7 11.4668 7.25834 10.8006C7.51668 10.1344 8.01135 9.58664 9.00069 8.49112L13.0921 3.96056C13.1947 3.84694 13.246 3.79012 13.2913 3.75075C13.7135 3.38328 14.3652 3.42464 14.7344 3.84235C14.774 3.8871 14.8172 3.94991 14.9036 4.07554C15.0388 4.27205 15.1064 4.37031 15.1654 4.46765C15.6928 5.33913 15.8524 6.37436 15.6108 7.35715C15.5838 7.46692 15.5488 7.5801 15.4787 7.80626Z",
];
const THUMB_DOWN = [
  "M2 11.5C2 12.6046 2.89543 13.5 4 13.5C5.65685 13.5 7 12.1569 7 10.5V6.5C7 4.84315 5.65685 3.5 4 3.5C2.89543 3.5 2 4.39543 2 5.5V11.5Z",
  "M15.4787 16.1937L15.2124 15.3337C14.9942 14.6289 14.8851 14.2765 14.969 13.9982C15.0369 13.7731 15.1859 13.579 15.389 13.4513C15.64 13.2935 16.0197 13.2935 16.7791 13.2935H17.1831C19.7532 13.2935 21.0382 13.2935 21.6452 12.5327C21.7145 12.4458 21.7762 12.3533 21.8296 12.2563C22.2965 11.4079 21.7657 10.2649 20.704 7.9789C19.7297 5.88111 19.2425 4.83222 18.338 4.21485C18.2505 4.15508 18.1605 4.0987 18.0683 4.04586C17.116 3.5 15.9362 3.5 13.5764 3.5H13.0646C10.2057 3.5 8.77628 3.5 7.88814 4.36053C7 5.22106 7 6.60607 7 9.37607V10.3497C7 11.8054 7 12.5332 7.25834 13.1994C7.51668 13.8656 8.01135 14.4134 9.00069 15.5089L13.0921 20.0394C13.1947 20.1531 13.246 20.2099 13.2913 20.2493C13.7135 20.6167 14.3652 20.5754 14.7344 20.1577C14.774 20.1129 14.8172 20.0501 14.9036 19.9245C15.0388 19.728 15.1064 19.6297 15.1654 19.5323C15.6928 18.6609 15.8524 17.6256 15.6108 16.6429C15.5838 16.5331 15.5488 16.4199 15.4787 16.1937Z",
];

function ThumbGlyph({ down, solid, pop }: { down?: boolean; solid?: boolean; pop?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="ui-rtgc__icon" data-down={down || undefined} data-pop={pop || undefined} focusable="false" aria-hidden="true">
      {(down ? THUMB_DOWN : THUMB_UP).map((d, i) => (
        <path key={i} d={d} fill={solid ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      ))}
    </svg>
  );
}

/* ---------- Helpers ---------- */

function useControllable<T>(value: T | undefined, initial: T, onChange?: (v: T) => void) {
  const [own, setOwn] = useState(initial);
  const controlled = value !== undefined;
  const set = (v: T) => {
    if (!controlled) setOwn(v);
    onChange?.(v);
  };
  return [controlled ? value : own, set] as const;
}

/* ---------- Styles ---------- */

const css = /* css */ `
/* Colors and motion as variables – override them on .ui-rtgc (see Theming in the docs) */
.ui-rtgc {
  --ui-rtgc-star: #e8b000;
  --ui-rtgc-empty: rgba(0, 0, 0, 0.1);
  --ui-rtgc-empty-hover: rgba(0, 0, 0, 0.16);
  --ui-rtgc-icon: var(--aui-muted, rgba(0, 0, 0, 0.447));
  --ui-rtgc-ink: var(--aui-ink, rgba(0, 0, 0, 0.88));
  --ui-rtgc-wash: rgba(0, 0, 0, 0.04);
  --ui-rtgc-wash-on: rgba(0, 0, 0, 0.06);
  --ui-rtgc-focus: var(--aui-focus, rgba(0, 96, 226, 0.7));
  --ui-rtgc-ease: var(--aui-ease, cubic-bezier(0.22, 1, 0.36, 1));

  /* A star's size, the space around it (its hit area) and a thumb button's size */
  --s: 18px;
  --pad: 3px;
  --b: 28px;
  --i: 16px;

  display: inline-flex;
  align-items: center;
  gap: 2px;
  min-width: 0;
  max-width: 100%;
  flex-wrap: wrap;
  vertical-align: middle;
  -webkit-tap-highlight-color: transparent;
}
.ui-rtgc[data-size="sm"] { --s: 14px; --pad: 2px; --b: 24px; --i: 14px; gap: 1px; }
.ui-rtgc[data-size="lg"] { --s: 24px; --pad: 3px; --b: 32px; --i: 18px; }
.ui-rtgc[data-readonly] { gap: 2px; }
.ui-rtgc[data-readonly][data-size="sm"] { gap: 1px; }
.ui-rtgc[data-disabled] { opacity: 0.5; }

/* A star: its button is the glyph plus a little room, so the hit area is bigger than the star */
.ui-rtgc__star {
  display: grid;
  flex: none;
  place-items: center;
  margin: 0;
  padding: var(--pad);
  border: 0;
  border-radius: 6px;
  background: none;
  color: inherit;
  font: inherit;
  cursor: pointer;
}
.ui-rtgc[data-readonly] .ui-rtgc__star { padding: 0; cursor: default; }
.ui-rtgc__star:disabled { cursor: not-allowed; }
.ui-rtgc__star:focus-visible { outline: 2px solid var(--ui-rtgc-focus); outline-offset: 2px; }

.ui-rtgc__glyph { position: relative; display: block; width: var(--s); height: var(--s); transition: transform 160ms var(--ui-rtgc-ease); }
.ui-rtgc__glyph svg { position: absolute; inset: 0; display: block; width: 100%; height: 100%; overflow: visible; }
.ui-rtgc__empty { color: var(--ui-rtgc-empty); transition: color 140ms ease; }
/* The fill is a second star on top, clipped from the start side – whole, or half for a read-only 4.5 */
.ui-rtgc__fill { color: var(--ui-rtgc-star); clip-path: inset(0 calc((1 - var(--ui-rtgc-f)) * 100%) 0 0); }
.ui-rtgc:dir(rtl) .ui-rtgc__fill { clip-path: inset(0 0 0 calc((1 - var(--ui-rtgc-f)) * 100%)); }
.ui-rtgc__star:not(:disabled):hover .ui-rtgc__empty { color: var(--ui-rtgc-empty-hover); }
.ui-rtgc__star[data-hover] .ui-rtgc__glyph { transform: scale(1.12); }
.ui-rtgc__star:not(:disabled):active .ui-rtgc__glyph { transform: scale(0.9); }
/* A choice: the stars up to it pop one after the other */
.ui-rtgc__glyph[data-pop] { animation: ui-rtgc-pop 420ms var(--ui-rtgc-ease) both; }

/* Thumbs: two quiet icon buttons; the chosen one fills in ink and sits on a soft wash */
.ui-rtgc__thumb {
  display: grid;
  flex: none;
  place-items: center;
  width: var(--b);
  height: var(--b);
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: 6px;
  background: none;
  color: var(--ui-rtgc-icon);
  font: inherit;
  cursor: pointer;
  transition: background-color 140ms ease, color 140ms ease;
}
.ui-rtgc[data-readonly] .ui-rtgc__thumb { width: auto; height: auto; cursor: default; }
.ui-rtgc[data-readonly] .ui-rtgc__thumb:not([data-on]) { opacity: 0.45; }
.ui-rtgc__thumb:not(:disabled):hover { background: var(--ui-rtgc-wash); color: var(--ui-rtgc-ink); }
.ui-rtgc__thumb[data-on] { color: var(--ui-rtgc-ink); }
.ui-rtgc:not([data-readonly]) .ui-rtgc__thumb[data-on] { background: var(--ui-rtgc-wash-on); }
.ui-rtgc__thumb:disabled { cursor: not-allowed; }
.ui-rtgc__thumb:focus-visible { outline: 2px solid var(--ui-rtgc-focus); outline-offset: 2px; }
.ui-rtgc__icon { display: block; width: var(--i); height: var(--i); }
.ui-rtgc__icon[data-pop] { animation: ui-rtgc-thumb 460ms var(--ui-rtgc-ease); transform-origin: 30% 70%; }
.ui-rtgc__icon[data-pop][data-down] { animation-name: ui-rtgc-thumb-down; transform-origin: 30% 30%; }

@keyframes ui-rtgc-pop { 0% { transform: scale(0.6); } 55% { transform: scale(1.22); } 100% { transform: scale(1); } }
@keyframes ui-rtgc-thumb { 0% { transform: scale(0.8) rotate(0); } 45% { transform: scale(1.18) rotate(-12deg); } 100% { transform: scale(1) rotate(0); } }
@keyframes ui-rtgc-thumb-down { 0% { transform: scale(0.8) rotate(0); } 45% { transform: scale(1.18) rotate(12deg); } 100% { transform: scale(1) rotate(0); } }

/* Touch screens: a hit area of at least 32px per star and 36px per thumb */
@media (pointer: coarse) {
  .ui-rtgc { --pad: 7px; --b: 36px; }
  .ui-rtgc[data-size="sm"] { --pad: 9px; --b: 32px; }
  .ui-rtgc[data-size="lg"] { --pad: 6px; --b: 40px; }
  .ui-rtgc:not([data-readonly]) { gap: 0; }
  .ui-rtgc__star[data-hover] .ui-rtgc__glyph { transform: none; }
}

@media (prefers-reduced-motion: reduce) {
  .ui-rtgc__glyph, .ui-rtgc__empty, .ui-rtgc__thumb { transition: none; }
  .ui-rtgc__glyph[data-pop], .ui-rtgc__icon[data-pop] { animation: none; }
  .ui-rtgc__star[data-hover] .ui-rtgc__glyph, .ui-rtgc__star:active .ui-rtgc__glyph { transform: none; }
}

/* Dark mode: follows a .dark class or data-theme="dark" on any ancestor, e.g. <html> */
:where(.dark, [data-theme="dark"]) .ui-rtgc {
  --ui-rtgc-star: #f0bd1a;
  --ui-rtgc-empty: rgba(255, 255, 255, 0.14);
  --ui-rtgc-empty-hover: rgba(255, 255, 255, 0.22);
  --ui-rtgc-icon: var(--aui-muted, rgba(255, 255, 255, 0.46));
  --ui-rtgc-ink: var(--aui-ink, rgba(255, 255, 255, 0.9));
  --ui-rtgc-wash: rgba(255, 255, 255, 0.06);
  --ui-rtgc-wash-on: rgba(255, 255, 255, 0.09);
  --ui-rtgc-focus: var(--aui-focus, rgba(77, 141, 255, 0.8));
}
`;
