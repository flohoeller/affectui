"use client";

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode, type Ref } from "react";

/*
 * Time Picker – a single self-contained file, clean style.
 * A time of day: a field in the Text Field's look you can type into ("9", "930", "9:30 pm", "21.30") or open for a
 * list of times every few minutes – the chosen one has a check, a soft highlight glides to where the pointer or the
 * arrow keys are. 12 or 24 hours follow the locale unless you set them. Times outside min / max aren't offered, and
 * anything that isn't a time puts the last good one back. The value is "HH:mm" (24 h), like a native time input.
 * The list sits in the top layer, so a card's overflow never cuts it. The styles are injected below, so no extra
 * files are needed.
 */

export type TimePickerProps = {
  /** The chosen time as "HH:mm" (24 h) – makes it controlled; null shows the placeholder */
  value?: string | null;
  /** Starting time when uncontrolled */
  defaultValue?: string | null;
  /** Called with "HH:mm", or null when the field is cleared */
  onChange?: (value: string | null) => void;
  /** Minutes between the times in the list – typing can still set any minute */
  step?: number;
  /** The earliest time, "HH:mm" – the list starts here */
  min?: string;
  /** The latest time, "HH:mm" */
  max?: string;
  /** 12 (9:30 PM) or 24 (21:30) hours – defaults to the locale's */
  hourCycle?: 12 | 24;
  /** BCP 47 locale for how times are written – defaults to the browser's */
  locale?: string;
  /** Shown while nothing is chosen – defaults to an example time in the right format */
  placeholder?: string;
  /** Shown above the field and tied to it */
  label?: ReactNode;
  /** A quiet line under the field – the error takes its place while there is one */
  hint?: ReactNode;
  /** Marks the field invalid and shows this under it, in place of the hint */
  error?: ReactNode;
  /** "Optional" next to the label */
  optional?: boolean;
  /** sm 28 · md 32 · lg 36 high */
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  /** Sends "HH:mm" with a form, through a hidden input */
  name?: string;
  required?: boolean;
  id?: string;
  className?: string;
  "aria-label"?: string;
  ref?: Ref<HTMLInputElement>;
};

/* ---------- Times as minutes after midnight ---------- */

const DAY = 24 * 60;
const pad = (n: number) => String(n).padStart(2, "0");
/** "HH:mm" (seconds allowed) → minutes, or null */
const fromValue = (v?: string | null) => {
  const m = typeof v === "string" ? v.trim().match(/^(\d{1,2}):(\d{2})(?::\d{2}(?:\.\d+)?)?$/) : null;
  if (!m) return null;
  const h = Number(m[1]);
  const mi = Number(m[2]);
  return h < 24 && mi < 60 ? h * 60 + mi : null;
};
const toValue = (t: number) => `${pad(Math.floor(t / 60))}:${pad(t % 60)}`;
const norm = (s: string) => s.toLowerCase().replace(/[.\s\u00a0\u202f]/g, "");
/** The zeros of the digit sets people type times in (Arabic-Indic, Persian, Devanagari, Bengali, Thai, full-width …) */
const ZEROS = [0x660, 0x6f0, 0x966, 0x9e6, 0xa66, 0xae6, 0xb66, 0xbe6, 0xc66, 0xce6, 0xd66, 0xe50, 0xed0, 0xf20, 0x1040, 0x17e0, 0x1810, 0xff10];
/** "٩:٣٠" → "9:30" */
const latinDigits = (s: string) =>
  s.replace(/\p{Nd}/gu, (c) => {
    const cp = c.codePointAt(0)!;
    const zero = ZEROS.find((z) => cp >= z && cp <= z + 9);
    return zero == null ? c : String(cp - zero);
  });

/** A locale the browser knows, or undefined (the browser's own) */
function safeLocale(locale?: string) {
  if (!locale) return undefined;
  try {
    return Intl.getCanonicalLocales(locale)[0];
  } catch {
    return undefined;
  }
}

/**
 * What people type: "9", "930", "9:30", "09.30", "9h30", "9:30 pm", "9p", "21:30", "2130" – and the locale's own day
 * periods, before or after ("下午3:30", "오후 3:30"). Without a period the hour is read as 24 h.
 */
function parseTime(text: string, am: Set<string>, pm: Set<string>): number | null {
  const t = latinDigits(text).trim().toLowerCase();
  if (!t) return null;
  let pre = "";
  let post = "";
  let h: number;
  let mi = 0;
  const a = t.match(/^(\D*?)\s*(\d{1,2})(?:\s*[:.h]\s*(\d{2}))?\s*(\D*)$/);
  const b = a ? null : t.match(/^(\D*?)\s*(\d{3,4})\s*(\D*)$/);
  if (a) {
    [, pre, , , post] = a;
    h = Number(a[2]);
    mi = a[3] ? Number(a[3]) : 0;
  } else if (b) {
    [, pre, , post] = b;
    h = Number(b[2].slice(0, -2));
    mi = Number(b[2].slice(-2));
  } else return null;
  const before = norm(pre);
  const after = norm(post);
  if (before && after) return null;
  const word = before || after;
  const period = !word ? null : am.has(word) ? "am" : pm.has(word) ? "pm" : undefined;
  if (period === undefined || mi > 59) return null;
  if (period) {
    if (h < 1 || h > 12) return null;
    h = (h % 12) + (period === "pm" ? 12 : 0);
  } else if (h === 24 && mi === 0) h = 0;
  else if (h > 23) return null;
  return h * 60 + mi;
}

/* ---------- Picker ---------- */

export function TimePicker({
  value: valueProp,
  defaultValue = null,
  onChange,
  step: stepProp = 15,
  min,
  max,
  hourCycle,
  locale,
  placeholder,
  label,
  hint,
  error,
  optional = false,
  size = "md",
  disabled = false,
  name,
  required,
  id,
  className,
  "aria-label": ariaLabel,
  ref,
}: TimePickerProps) {
  const autoId = useId();
  const inputId = id ?? `${autoId}-input`;
  const listId = `${autoId}-list`;
  const labelId = `${autoId}-label`;
  const messageId = `${autoId}-message`;
  const optionId = (i: number) => `${autoId}-option-${i}`;

  const loc = safeLocale(locale);
  const { format, am, pm } = useMemo(() => {
    const twelve = hourCycle === 12 || hourCycle === 24 ? hourCycle === 12 : /h1[12]/.test(new Intl.DateTimeFormat(loc, { hour: "numeric" }).resolvedOptions().hourCycle ?? "");
    const f = new Intl.DateTimeFormat(loc, { hour: twelve ? "numeric" : "2-digit", minute: "2-digit", hourCycle: twelve ? "h12" : "h23" });
    // The locale's own words for before and after noon, so "下午3:30" or "3:30 nachm." can be typed too
    const period = (h: number) => {
      const part = new Intl.DateTimeFormat(loc, { hour: "numeric", hourCycle: "h12" }).formatToParts(new Date(2000, 0, 1, h)).find((p) => p.type === "dayPeriod");
      return part ? norm(part.value) : "";
    };
    return {
      format: (t: number) => f.format(new Date(2000, 0, 1, Math.floor(t / 60), t % 60)),
      am: new Set(["a", "am", period(1)].filter(Boolean)),
      pm: new Set(["p", "pm", period(13)].filter(Boolean)),
    };
  }, [loc, hourCycle]);

  const step = Number.isFinite(stepProp) ? Math.min(DAY, Math.max(1, Math.round(stepProp))) : 15;
  const minT = fromValue(min) ?? 0;
  const maxRaw = fromValue(max);
  const maxT = maxRaw != null && maxRaw >= minT ? maxRaw : DAY - 1;
  const times = useMemo(() => {
    const out: number[] = [];
    for (let t = minT; t <= maxT; t += step) out.push(t);
    return out;
  }, [minT, maxT, step]);

  const [own, setOwn] = useState<number | null>(() => fromValue(defaultValue));
  const value = valueProp !== undefined ? fromValue(valueProp) : own;
  const shown = value != null ? format(value) : "";

  const [text, setText] = useState(shown);
  const [editing, setEditing] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [glow, setGlow] = useState<{ top: number; height: number } | null>(null);
  const navigated = useRef(false);
  const center = useRef(false);

  const input = useRef<HTMLInputElement | null>(null);
  const box = useRef<HTMLDivElement | null>(null);
  const list = useRef<HTMLDivElement | null>(null);

  // While not typing, the field shows the chosen time in the locale's format
  const fieldText = editing ? text : shown;
  const invalid = Boolean(error);
  const message = shows(error) ? error : shows(hint) ? hint : null;
  const scale = SIZES.includes(size) ? size : "md";

  /** The list row closest to a time (the first one at or after it, else the last) */
  const nearest = (t: number) => {
    const i = times.findIndex((x) => x >= t);
    return i < 0 ? times.length - 1 : i;
  };
  const now = () => {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  };

  const show = (at?: number) => {
    if (disabled || !times.length) return;
    const exact = value != null ? times.indexOf(value) : -1;
    setActive(at ?? (exact >= 0 ? exact : nearest(value ?? now())));
    navigated.current = false;
    center.current = true;
    setOpen(true);
  };
  const hide = () => {
    setOpen(false);
    setGlow(null);
  };
  const commit = (t: number | null) => {
    if (valueProp === undefined) setOwn(t);
    if (t !== value) onChange?.(t == null ? null : toValue(t));
    setEditing(false);
  };
  const pick = (i: number) => {
    if (i < 0 || i >= times.length) return;
    commit(times[i]);
    hide();
  };
  /** The typed text: a time inside min / max is kept, an empty field clears, anything else puts the last time back */
  const settle = () => {
    if (!editing) return;
    const t = text.trim() ? parseTime(text, am, pm) : null;
    if (!text.trim()) commit(null);
    else if (t != null && t >= minT && t <= maxT) commit(t);
    else setEditing(false);
  };

  const type = (next: string) => {
    setText(next);
    setEditing(true);
    navigated.current = false;
    if (!times.length) return;
    // The list follows what is typed: the time it reads as, or the first row that starts with it
    const t = next.trim() ? parseTime(next, am, pm) : null;
    const q = norm(latinDigits(next));
    const hit = t != null ? nearest(t) : q ? times.findIndex((x) => norm(latinDigits(format(x))).startsWith(q)) : -1;
    if (!open) {
      center.current = true;
      setOpen(true);
    }
    if (hit >= 0) setActive(hit);
  };

  // Into the top layer, under the field (or above it when there is more room there); it follows on scroll
  useLayoutEffect(() => {
    const el = list.current;
    if (!open || !el) return;
    if ("showPopover" in el && !el.matches(":popover-open")) el.showPopover();
    const update = (e?: Event) => {
      // The list's own scrolling doesn't move it
      if (e?.type === "scroll" && e.target instanceof Node && el.contains(e.target)) return;
      if (box.current) place(el, box.current);
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
      if ("hidePopover" in el && el.isConnected && el.matches(":popover-open")) el.hidePopover();
    };
  }, [open]);

  // The highlight glides to the active time; the list keeps it in view (centred when it opens)
  useLayoutEffect(() => {
    if (!open || active < 0) return;
    const el = list.current;
    const row = el?.querySelector<HTMLElement>(`[data-index="${active}"]`);
    if (!el || !row) return;
    setGlow({ top: row.offsetTop, height: row.offsetHeight });
    if (center.current) {
      el.scrollTop = row.offsetTop - (el.clientHeight - row.offsetHeight) / 2;
      center.current = false;
    } else row.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  // A press anywhere else closes it; what was typed is settled when the field loses the focus
  useEffect(() => {
    if (!open) return;
    const down = (e: PointerEvent) => {
      const target = e.target as Node;
      if (box.current?.contains(target) || list.current?.contains(target)) return;
      hide();
    };
    document.addEventListener("pointerdown", down, true);
    return () => document.removeEventListener("pointerdown", down, true);
  }, [open]);

  const move = (by: number) => {
    if (!open) return show();
    navigated.current = true;
    setActive((a) => Math.min(times.length - 1, Math.max(0, (a < 0 ? 0 : a) + by)));
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    const page = Math.max(1, Math.round(60 / step));
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (e.altKey && !open) show();
        else move(1);
        break;
      case "ArrowUp":
        e.preventDefault();
        move(-1);
        break;
      case "PageDown":
        if (!open) return;
        e.preventDefault();
        move(page);
        break;
      case "PageUp":
        if (!open) return;
        e.preventDefault();
        move(-page);
        break;
      case "Enter":
        if (open && navigated.current && active >= 0) {
          e.preventDefault();
          pick(active);
        } else if (editing || open) {
          e.preventDefault();
          settle();
          hide();
        }
        break;
      case "Escape":
        if (open) {
          e.preventDefault();
          e.stopPropagation();
          hide();
        } else if (editing) {
          e.preventDefault();
          setEditing(false);
        }
        break;
      case "Tab":
        hide();
        break;
    }
  };

  const ph = placeholder ?? format(9 * 60);

  return (
    <div
      className={["ui-tpkc", className].filter(Boolean).join(" ")}
      data-size={scale}
      data-open={open || undefined}
      data-invalid={invalid || undefined}
      data-disabled={disabled || undefined}
    >
      {/* React 19 hoists this into <head> once, no matter how many pickers render */}
      <style href="ui-time-picker-clean" precedence="default">
        {css}
      </style>
      {label != null && (
        <div className="ui-tpkc__head">
          <label className="ui-tpkc__label" id={labelId} htmlFor={inputId}>
            {label}
          </label>
          {optional && <span className="ui-tpkc__optional">Optional</span>}
        </div>
      )}
      <div ref={box} className="ui-tpkc__box" onClick={() => input.current?.focus()}>
        <span className="ui-tpkc__icon" aria-hidden="true">
          <ClockIcon />
        </span>
        <input
          ref={(el) => {
            input.current = el;
            if (typeof ref === "function") ref(el);
            else if (ref) ref.current = el;
          }}
          id={inputId}
          className="ui-tpkc__input"
          type="text"
          role="combobox"
          inputMode="text"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={listId}
          aria-activedescendant={open && active >= 0 ? optionId(active) : undefined}
          aria-label={ariaLabel}
          aria-describedby={message ? messageId : undefined}
          aria-invalid={invalid || undefined}
          aria-required={required || undefined}
          placeholder={ph}
          disabled={disabled}
          value={fieldText}
          onChange={(e) => type(e.target.value)}
          onKeyDown={onKeyDown}
          onPointerDown={() => !open && show()}
          onBlur={() => {
            settle();
            hide();
          }}
        />
        <button
          type="button"
          className="ui-tpkc__toggle"
          tabIndex={-1}
          aria-label={open ? "Hide times" : "Show times"}
          disabled={disabled}
          onPointerDown={(e) => e.preventDefault()}
          onClick={(e) => {
            e.stopPropagation();
            input.current?.focus();
            if (open) hide();
            else show();
          }}
        >
          <ChevronIcon />
        </button>
      </div>
      {name && <input type="hidden" name={name} value={value != null ? toValue(value) : ""} />}
      {open && (
        <div
          ref={list}
          id={listId}
          className="ui-tpkc__list"
          role="listbox"
          aria-labelledby={label != null ? labelId : undefined}
          aria-label={label == null ? ariaLabel ?? "Times" : undefined}
          popover="manual"
        >
          {glow && <span className="ui-tpkc__glow" aria-hidden="true" style={{ transform: `translateY(${glow.top}px)`, height: glow.height }} />}
          {times.map((t, i) => (
            <div
              key={t}
              id={optionId(i)}
              className="ui-tpkc__option"
              role="option"
              data-index={i}
              aria-selected={t === value}
              data-active={i === active || undefined}
              onPointerMove={() => {
                navigated.current = true;
                if (i !== active) setActive(i);
              }}
              onPointerDown={(e) => e.preventDefault()}
              onClick={() => pick(i)}
            >
              <span className="ui-tpkc__time">{format(t)}</span>
              <span className="ui-tpkc__check" aria-hidden="true">
                {t === value && <CheckIcon />}
              </span>
            </div>
          ))}
        </div>
      )}
      {message && (
        <p className="ui-tpkc__message" id={messageId} key={shows(error) ? "error" : "hint"} aria-live={shows(error) ? "polite" : undefined}>
          {message}
        </p>
      )}
    </div>
  );
}

const SIZES = ["sm", "md", "lg"];
/** Text or an element – not true, false, null or an empty string */
const shows = (v: ReactNode) => v != null && typeof v !== "boolean" && v !== "";

/** Under the field (or above it when there is more room there), as wide as the field, always inside the window */
function place(el: HTMLElement, field: HTMLElement) {
  const r = field.getBoundingClientRect();
  const gap = 4;
  const edge = 8;
  const vw = document.documentElement.clientWidth || window.innerWidth;
  const vh = window.innerHeight;
  const width = Math.min(Math.max(r.width, 120), vw - 2 * edge);
  el.style.width = `${width}px`;
  const want = Math.min(el.scrollHeight, 264);
  const below = vh - r.bottom - gap - edge;
  const above = r.top - gap - edge;
  const up = below < Math.min(want, 160) && above > below;
  const room = Math.max(120, Math.min(264, up ? above : below));
  el.style.maxHeight = `${room}px`;
  const h = Math.min(want, room);
  el.style.left = `${Math.round(Math.min(Math.max(edge, r.left), vw - edge - width))}px`;
  el.style.top = `${Math.round(up ? r.top - gap - h : r.bottom + gap)}px`;
  el.toggleAttribute("data-up", up);
}

/* Icons: Hugeicons Free (MIT, © Hugeicons, hugeicons.com) – Clock 01, Arrow Down 01, Tick 02 */
function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8V12L14 14" />
    </svg>
  );
}
function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 9C18 9 13.58 15 12 15C10.42 15 6 9 6 9" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path className="ui-tpkc__tick" d="M5 14L8.5 17.5L19 6.5" pathLength={1} />
    </svg>
  );
}

/* ---------- Styles ---------- */

const css = /* css */ `
/* Colors and motion as variables – override them on .ui-tpkc (see Theming in the docs) */
.ui-tpkc {
  --ui-tpkc-title: var(--aui-ink, rgba(0, 0, 0, 0.88));
  --ui-tpkc-ink: var(--aui-ink, rgba(0, 0, 0, 0.88));
  --ui-tpkc-subtle: var(--aui-muted, rgba(0, 0, 0, 0.45));
  --ui-tpkc-faint: var(--aui-placeholder, rgba(0, 0, 0, 0.3));
  --ui-tpkc-icon: var(--aui-muted, rgba(0, 0, 0, 0.447));
  --ui-tpkc-surface: var(--aui-surface, #ffffff);
  --ui-tpkc-menu: var(--aui-overlay, var(--aui-surface, #ffffff));
  --ui-tpkc-glow: rgba(0, 0, 0, 0.045);
  --ui-tpkc-readonly: rgba(0, 0, 0, 0.02);
  --ui-tpkc-shadow: 0 0 0 0.5px var(--aui-border, rgba(0, 0, 0, 0.08)), 0 1px 1px -1px rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --ui-tpkc-shadow-hover: 0 0 0 0.5px var(--aui-border-strong, rgba(0, 0, 0, 0.13)), 0 1px 1px -1px rgba(0, 0, 0, 0.12), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  --ui-tpkc-edge-focus: 0 0 0 1px var(--aui-border-strong, rgba(0, 0, 0, 0.28)), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  --ui-tpkc-shadow-menu: var(--aui-shadow-popover, 0 0 0 0.5px rgba(0, 0, 0, 0.08), 0 8px 24px -6px rgba(0, 0, 0, 0.14), 0 2px 6px -2px rgba(0, 0, 0, 0.06));
  --ui-tpkc-danger: var(--aui-danger, #c4320a);
  --ui-tpkc-danger-edge: color-mix(in srgb, var(--aui-red, #f04438) 55%, transparent);
  --ui-tpkc-focus: var(--aui-focus, rgba(0, 96, 226, 0.7));
  --ui-tpkc-ease: var(--aui-ease, cubic-bezier(0.22, 1, 0.36, 1));

  --h: 32px;
  --px: 10px;
  --fs: 13px;
  --radius: var(--aui-radius, 7px);

  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  font-family: var(--aui-font, "Inter", "InterVariable", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif);
  font-size: 13px;
  line-height: 20px;
  color: var(--ui-tpkc-ink);
  -webkit-font-smoothing: antialiased;
}
.ui-tpkc[data-size="sm"] { --h: 28px; --px: 8px; --radius: calc(var(--aui-radius, 7px) - 1px); }
.ui-tpkc[data-size="lg"] { --h: 36px; --px: 12px; --fs: 14px; --radius: calc(var(--aui-radius, 7px) + 1px); }
/* Touch screens: a comfortable tap height, and 16px text so iOS doesn't zoom in on focus */
@media (pointer: coarse) {
  .ui-tpkc { --fs: 16px; }
  .ui-tpkc[data-size="sm"] { --h: 34px; }
  .ui-tpkc[data-size="md"] { --h: 38px; }
  .ui-tpkc[data-size="lg"] { --h: 40px; }
}
.ui-tpkc *, .ui-tpkc *::before, .ui-tpkc *::after { box-sizing: border-box; }

.ui-tpkc__head { display: flex; align-items: baseline; gap: 6px; min-width: 0; }
.ui-tpkc__label { min-width: 0; font-weight: 500; color: var(--ui-tpkc-title); overflow-wrap: anywhere; cursor: default; }
.ui-tpkc__optional { flex: none; font-size: 12px; line-height: 16px; color: var(--ui-tpkc-subtle); }

/* The field: white, a hairline edge that firms up on hover and while typing – no ring on a text field */
.ui-tpkc__box {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  height: var(--h);
  min-width: 0;
  padding: 0 calc(var(--px) - 6px) 0 var(--px);
  border-radius: var(--radius);
  background: var(--ui-tpkc-surface);
  box-shadow: var(--ui-tpkc-shadow);
  cursor: text;
  transition: box-shadow 140ms ease, background-color 140ms ease;
}
.ui-tpkc__box:hover { box-shadow: var(--ui-tpkc-shadow-hover); }
.ui-tpkc__box:focus-within, .ui-tpkc[data-open] .ui-tpkc__box { box-shadow: var(--ui-tpkc-edge-focus); }
.ui-tpkc[data-invalid] .ui-tpkc__box { box-shadow: 0 0 0 1px var(--ui-tpkc-danger-edge), 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
.ui-tpkc[data-disabled] .ui-tpkc__box { background: var(--ui-tpkc-readonly); box-shadow: 0 0 0 0.5px rgba(0, 0, 0, 0.06); cursor: not-allowed; }
.ui-tpkc[data-disabled] { opacity: 0.55; }
.ui-tpkc__icon { display: grid; flex: none; place-items: center; width: 16px; height: 16px; color: var(--ui-tpkc-icon); }
.ui-tpkc__icon svg { display: block; }
.ui-tpkc__input {
  flex: 1;
  width: 100%;
  min-width: 0;
  height: 100%;
  margin: 0;
  padding: 0;
  border: 0;
  outline: none;
  background: none;
  font: inherit;
  font-size: var(--fs);
  font-variant-numeric: tabular-nums;
  color: var(--ui-tpkc-ink);
  text-overflow: ellipsis;
}
.ui-tpkc__input::placeholder { color: var(--ui-tpkc-faint); opacity: 1; }
.ui-tpkc__input:disabled { cursor: not-allowed; }
.ui-tpkc__toggle {
  display: grid;
  flex: none;
  place-items: center;
  width: 24px;
  height: 24px;
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: 5px;
  background: none;
  color: var(--ui-tpkc-icon);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: background-color 120ms ease, color 120ms ease;
}
.ui-tpkc__toggle svg { display: block; transition: transform 240ms var(--ui-tpkc-ease); }
.ui-tpkc__toggle:hover:not(:disabled) { background: var(--ui-tpkc-glow); color: var(--ui-tpkc-ink); }
.ui-tpkc__toggle:focus-visible { outline: 2px solid var(--ui-tpkc-focus); outline-offset: -2px; }
.ui-tpkc__toggle:disabled { cursor: not-allowed; }
.ui-tpkc[data-open] .ui-tpkc__toggle svg { transform: rotate(180deg); }

/* The list: a white card in the top layer, at the field's edge */
.ui-tpkc__list {
  position: fixed;
  inset: auto;
  z-index: 1000;
  margin: 0;
  padding: 4px;
  border: 0;
  border-radius: 10px;
  background: var(--ui-tpkc-menu);
  box-shadow: var(--ui-tpkc-shadow-menu);
  color: var(--ui-tpkc-ink);
  font: inherit;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: thin;
  transform-origin: top center;
  animation: ui-tpkc-in 200ms var(--ui-tpkc-ease) both;
}
.ui-tpkc__list[data-up] { transform-origin: bottom center; animation-name: ui-tpkc-in-up; }
.ui-tpkc__list::backdrop { display: none; }

/* One soft highlight that glides between the rows */
.ui-tpkc__glow {
  position: absolute;
  top: 0;
  left: 4px;
  right: 4px;
  border-radius: 6px;
  background: var(--ui-tpkc-glow);
  pointer-events: none;
  transition: transform 160ms var(--ui-tpkc-ease), height 160ms var(--ui-tpkc-ease);
}

.ui-tpkc__option {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  height: 32px;
  padding: 0 8px;
  border-radius: 6px;
  font-size: 13px;
  line-height: 20px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
}
.ui-tpkc__time { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; }
.ui-tpkc__option[aria-selected="true"] .ui-tpkc__time { font-weight: 500; }
.ui-tpkc__check { display: grid; flex: none; place-items: center; width: 16px; height: 16px; color: var(--ui-tpkc-ink); }
.ui-tpkc__check svg { display: block; }
.ui-tpkc__tick { stroke-dasharray: 1; animation: ui-tpkc-draw 280ms 40ms var(--ui-tpkc-ease) both; }
@media (pointer: coarse) {
  .ui-tpkc__option { height: 40px; font-size: 15px; }
  .ui-tpkc__toggle { width: 32px; height: 32px; }
}

.ui-tpkc__message { margin: 0; font-size: 12px; line-height: 16px; color: var(--ui-tpkc-subtle); overflow-wrap: anywhere; animation: ui-tpkc-message 260ms var(--ui-tpkc-ease); }
.ui-tpkc[data-invalid] .ui-tpkc__message { color: var(--ui-tpkc-danger); }

@keyframes ui-tpkc-in { from { opacity: 0; transform: translateY(-4px) scale(0.98); } }
@keyframes ui-tpkc-in-up { from { opacity: 0; transform: translateY(4px) scale(0.98); } }
@keyframes ui-tpkc-draw { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
@keyframes ui-tpkc-message { from { opacity: 0; transform: translateY(-3px); filter: blur(2px); } }

@media (prefers-reduced-motion: reduce) {
  .ui-tpkc *, .ui-tpkc *::before, .ui-tpkc *::after { animation-duration: 1ms !important; transition-duration: 1ms !important; }
}

/* Dark mode: follows a .dark class or data-theme="dark" on any ancestor, e.g. <html> */
:where(.dark, [data-theme="dark"]) .ui-tpkc {
  --ui-tpkc-title: var(--aui-ink, rgba(255, 255, 255, 0.92));
  --ui-tpkc-ink: var(--aui-ink, rgba(255, 255, 255, 0.9));
  --ui-tpkc-subtle: var(--aui-muted, rgba(255, 255, 255, 0.46));
  --ui-tpkc-faint: var(--aui-placeholder, rgba(255, 255, 255, 0.3));
  --ui-tpkc-icon: var(--aui-muted, rgba(255, 255, 255, 0.5));
  --ui-tpkc-surface: var(--aui-surface, #1c1c1e);
  --ui-tpkc-menu: var(--aui-overlay, var(--aui-surface, #1f1f22));
  --ui-tpkc-glow: rgba(255, 255, 255, 0.07);
  --ui-tpkc-readonly: rgba(255, 255, 255, 0.03);
  --ui-tpkc-shadow: 0 0 0 0.5px var(--aui-border, rgba(255, 255, 255, 0.14)), 0 1px 2px 0 rgba(0, 0, 0, 0.4);
  --ui-tpkc-shadow-hover: 0 0 0 0.5px var(--aui-border-strong, rgba(255, 255, 255, 0.2)), 0 1px 2px 0 rgba(0, 0, 0, 0.4);
  --ui-tpkc-edge-focus: 0 0 0 1px var(--aui-border-strong, rgba(255, 255, 255, 0.3)), 0 1px 2px 0 rgba(0, 0, 0, 0.4);
  --ui-tpkc-shadow-menu: var(--aui-shadow-popover, 0 0 0 0.5px rgba(255, 255, 255, 0.12), 0 12px 32px -8px rgba(0, 0, 0, 0.6));
  --ui-tpkc-danger: var(--aui-danger, #ff8a7a);
  --ui-tpkc-danger-edge: color-mix(in srgb, var(--aui-red, #ff6b5f) 50%, transparent);
  --ui-tpkc-focus: var(--aui-focus, rgba(77, 141, 255, 0.8));
  color-scheme: dark;
}
:where(.dark, [data-theme="dark"]) .ui-tpkc[data-disabled] .ui-tpkc__box { box-shadow: 0 0 0 0.5px rgba(255, 255, 255, 0.12); }
`;
