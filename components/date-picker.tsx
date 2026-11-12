"use client";

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode, type Ref } from "react";

/*
 * Date Picker – a single self-contained file.
 * One day: a field in the Text Field's look that opens a month in a small white card – under the field, or above it
 * when there is no room. Today is marked with a small dot, the chosen day is a blue chip; days outside min / max or ones
 * you rule out stay visible but can't be picked. Arrow keys move day by day, PageUp / PageDown month by month (with
 * Shift a year), Home / End to the start or end of the week, Enter picks, Esc closes. Month names, weekdays and the
 * first day of the week follow the locale. Always six weeks high, so the card never jumps between months.
 * The card sits in the top layer, so a card's overflow never cuts it. The styles are injected below, so no extra
 * files are needed.
 */

export type DatePickerProps = {
  /** The chosen day – makes it controlled; null shows the placeholder */
  value?: Date | null;
  /** Starting day when uncontrolled */
  defaultValue?: Date | null;
  /** Called with the picked day (local midnight) */
  onChange?: (date: Date) => void;
  /** Days before this can't be picked */
  min?: Date;
  /** Days after this can't be picked */
  max?: Date;
  /** Rules out single days, e.g. weekends – they stay visible but can't be picked */
  isDateDisabled?: (date: Date) => boolean;
  /** BCP 47 locale for month names, weekdays and the shown value – defaults to the browser's */
  locale?: string;
  /** 0 = Sunday … 6 = Saturday – defaults to the locale's first day of the week */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /** Shown while nothing is chosen */
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
  /** Sends the day as YYYY-MM-DD with a form, through a hidden input */
  name?: string;
  required?: boolean;
  /** "Today" for the marker – defaults to the real today */
  today?: Date;
  /** Open the calendar right away (it doesn't take the focus) – nice for previews */
  defaultOpen?: boolean;
  id?: string;
  className?: string;
  "aria-label"?: string;
  ref?: Ref<HTMLButtonElement>;
};

/* ---------- Days (local, no library) ---------- */

const valid = (d?: Date | null): d is Date => d instanceof Date && !Number.isNaN(d.getTime());
const day = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const daysIn = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
/** The same day n months on – Jan 31 + 1 month is Feb 28, not Mar 3 */
const addMonths = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth() + n, Math.min(d.getDate(), daysIn(d.getFullYear(), d.getMonth() + n)));
const same = (a?: Date | null, b?: Date | null) => !!a && !!b && a.getTime() === b.getTime();
const sameMonth = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
const clamp = (d: Date, min?: Date, max?: Date) => (min && d < min ? min : max && d > max ? max : d);
const pad = (n: number) => String(n).padStart(2, "0");
/** YYYY-MM-DD in local time, what a form sends */
const iso = (d: Date) => `${String(d.getFullYear()).padStart(4, "0")}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** Six weeks from the start of the week the month begins in – always 42 days, so the card never changes height */
function weeks(month: Date, weekStart: number) {
  const first = startOfMonth(month);
  const start = addDays(first, -((first.getDay() - weekStart + 7) % 7));
  return Array.from({ length: 6 }, (_, w) => Array.from({ length: 7 }, (_, i) => addDays(start, w * 7 + i)));
}

/** A locale the browser knows, or undefined (the browser's own) */
function safeLocale(locale?: string) {
  if (!locale) return undefined;
  try {
    return Intl.getCanonicalLocales(locale)[0];
  } catch {
    return undefined;
  }
}

/** Regions whose week starts on Sunday – only used where the browser can't tell (no Intl week info) */
const SUNDAY_FIRST = new Set(["US", "CA", "MX", "BR", "JP", "KR", "TW", "HK", "IL", "PH", "IN", "ZA", "SA", "PE", "CO", "VE", "GT", "PR"]);

/** 0 = Sunday … 6 = Saturday, from the locale's own week */
function localeWeekStart(locale?: string): number {
  try {
    type WeekLocale = Intl.Locale & { getWeekInfo?: () => { firstDay: number }; weekInfo?: { firstDay: number } };
    const loc = new Intl.Locale(locale ?? new Intl.DateTimeFormat().resolvedOptions().locale) as WeekLocale;
    const info = loc.getWeekInfo?.() ?? loc.weekInfo;
    if (info && info.firstDay >= 1 && info.firstDay <= 7) return info.firstDay % 7;
    const region = loc.maximize().region;
    return region && SUNDAY_FIRST.has(region) ? 0 : 1;
  } catch {
    return 1;
  }
}

/* ---------- Picker ---------- */

export function DatePicker({
  value: valueProp,
  defaultValue = null,
  onChange,
  min,
  max,
  isDateDisabled,
  locale,
  weekStartsOn,
  placeholder = "Pick a date",
  label,
  hint,
  error,
  optional = false,
  size = "md",
  disabled = false,
  name,
  required,
  today: todayProp,
  defaultOpen = false,
  id,
  className,
  "aria-label": ariaLabel,
  ref,
}: DatePickerProps) {
  const autoId = useId();
  const triggerId = id ?? `${autoId}-trigger`;
  const panelId = `${autoId}-panel`;
  const labelId = `${autoId}-label`;
  const titleId = `${autoId}-title`;
  const messageId = `${autoId}-message`;

  const loc = safeLocale(locale);
  const fmt = useMemo(() => {
    // Always the Gregorian calendar the grid is built on – fa-IR or th-TH would otherwise name other months
    const f = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(loc, { ...o, calendar: "gregory" });
    return {
      value: f({ weekday: "short", month: "short", day: "numeric", year: "numeric" }),
      month: f({ month: "long", year: "numeric" }),
      long: f({ weekday: "long", month: "long", day: "numeric", year: "numeric" }),
      /** Only the number – "9", not "9日" – in the locale's digits */
      day: (d: Date) => f({ day: "numeric" }).formatToParts(d).find((p) => p.type === "day")?.value ?? String(d.getDate()),
      wdShort: f({ weekday: "short" }),
      wdNarrow: f({ weekday: "narrow" }),
      wdLong: f({ weekday: "long" }),
    };
  }, [loc]);
  const wso = weekStartsOn != null && weekStartsOn >= 0 && weekStartsOn <= 6 ? Math.floor(weekStartsOn) : localeWeekStart(loc);

  const todayTime = valid(todayProp) ? day(todayProp).getTime() : undefined;
  const today = useMemo(() => (todayTime != null ? new Date(todayTime) : day(new Date())), [todayTime]);
  const minDay = valid(min) ? day(min) : undefined;
  const maxDay = valid(max) && (!minDay || day(max) >= minDay) ? day(max) : undefined;
  const blocked = (d: Date) => (!!minDay && d < minDay) || (!!maxDay && d > maxDay) || !!isDateDisabled?.(d);

  const [own, setOwn] = useState<Date | null>(() => (valid(defaultValue) ? day(defaultValue) : null));
  const value = valueProp !== undefined ? (valid(valueProp) ? day(valueProp) : null) : own;

  const startDay = () => clamp(value ?? today, minDay, maxDay);
  const [open, setOpen] = useState(defaultOpen && !disabled);
  const [focus, setFocus] = useState<Date>(startDay);
  const [month, setMonth] = useState<Date>(() => startOfMonth(startDay()));
  const [dir, setDir] = useState<1 | -1>(1);

  const trigger = useRef<HTMLButtonElement | null>(null);
  const panel = useRef<HTMLDivElement | null>(null);
  // Only an opening or the keys move the focus onto a day – not a press on the month arrows, not a preview
  const moveFocus = useRef(false);

  const invalid = Boolean(error);
  const message = shows(error) ? error : shows(hint) ? hint : null;
  const scale = SIZES.includes(size) ? size : "md";

  const show = () => {
    if (disabled) return;
    const d = startDay();
    setFocus(d);
    setMonth(startOfMonth(d));
    moveFocus.current = true;
    setOpen(true);
  };
  const hide = (focusBack = true) => {
    setOpen(false);
    moveFocus.current = false;
    if (focusBack) trigger.current?.focus({ preventScroll: true });
  };
  const pick = (d: Date) => {
    if (blocked(d)) return;
    if (valueProp === undefined) setOwn(d);
    if (!same(d, value)) onChange?.(d);
    hide();
  };
  const goMonth = (next: Date) => {
    const m = startOfMonth(next);
    if (m.getTime() !== month.getTime()) {
      setDir(m > month ? 1 : -1);
      setMonth(m);
    }
  };
  // The month arrows: the focus stays on the arrow, the roving day follows into the new month
  const shift = (n: number) => {
    moveFocus.current = false;
    const m = new Date(month.getFullYear(), month.getMonth() + n, 1);
    setFocus(clamp(addMonths(focus, n), minDay, maxDay));
    setDir(n > 0 ? 1 : -1);
    setMonth(m);
  };
  const canPrev = !minDay || startOfMonth(minDay) < month;
  const canNext = !maxDay || startOfMonth(maxDay) > month;

  // Into the top layer, next to the field – under it, or above when there is more room there; it follows on scroll
  useLayoutEffect(() => {
    const el = panel.current;
    if (!open || !el) return;
    if ("showPopover" in el && !el.matches(":popover-open")) el.showPopover();
    const update = () => {
      const t = trigger.current;
      if (t) place(el, t);
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

  // The focus follows the focused day – after an opening or a key, before paint
  useLayoutEffect(() => {
    if (!open || !moveFocus.current) return;
    panel.current?.querySelector<HTMLButtonElement>(`[data-day="${focus.getTime()}"]`)?.focus({ preventScroll: true });
  }, [open, focus, month]);

  // A press anywhere else closes it, without taking the focus back
  useEffect(() => {
    if (!open) return;
    const down = (e: PointerEvent) => {
      const target = e.target as Node;
      if (trigger.current?.contains(target) || panel.current?.contains(target)) return;
      hide(false);
    };
    document.addEventListener("pointerdown", down, true);
    return () => document.removeEventListener("pointerdown", down, true);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const onGridKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
    const side = rtl ? -1 : 1;
    let next: Date | null = null;
    switch (e.key) {
      case "ArrowLeft": next = addDays(focus, -side); break;
      case "ArrowRight": next = addDays(focus, side); break;
      case "ArrowUp": next = addDays(focus, -7); break;
      case "ArrowDown": next = addDays(focus, 7); break;
      case "PageUp": next = addMonths(focus, e.shiftKey ? -12 : -1); break;
      case "PageDown": next = addMonths(focus, e.shiftKey ? 12 : 1); break;
      case "Home": next = addDays(focus, -((focus.getDay() - wso + 7) % 7)); break;
      case "End": next = addDays(focus, 6 - ((focus.getDay() - wso + 7) % 7)); break;
      case "Enter":
      case " ":
        e.preventDefault();
        pick(focus);
        return;
      default:
        return;
    }
    e.preventDefault();
    next = clamp(next, minDay, maxDay);
    moveFocus.current = true;
    setFocus(next);
    goMonth(next);
  };

  const rows = weeks(month, wso);
  const visible = rows.flat();
  // The day that Tab lands on: the focused one, or the first in the month when it scrolled out of view
  const tabDay = visible.some((d) => same(d, focus)) ? focus : (visible.find((d) => sameMonth(d, month) && !blocked(d)) ?? visible.find((d) => sameMonth(d, month))!);
  const heads = rows[0].map((d) => {
    const short = fmt.wdShort.format(d).replace(/\.$/, "");
    // Latin scripts: two letters (Mo, Tu); others their short name, or the narrow one when that is long
    const text = /^\p{Script=Latin}/u.test(short) ? short.slice(0, 2) : short.length > 3 ? fmt.wdNarrow.format(d) : short;
    return { key: d.getDay(), text, long: fmt.wdLong.format(d) };
  });

  return (
    <div
      className={["ui-dpk", className].filter(Boolean).join(" ")}
      data-size={scale}
      data-open={open || undefined}
      data-invalid={invalid || undefined}
      data-disabled={disabled || undefined}
    >
      {/* React 19 hoists this into <head> once, no matter how many pickers render */}
      <style href="ui-date-picker" precedence="default">
        {css}
      </style>
      {label != null && (
        <div className="ui-dpk__head">
          <label className="ui-dpk__label" id={labelId} htmlFor={triggerId}>
            {label}
          </label>
          {optional && <span className="ui-dpk__optional">Optional</span>}
        </div>
      )}
      <button
        ref={(el) => {
          trigger.current = el;
          if (typeof ref === "function") ref(el);
          else if (ref) ref.current = el;
        }}
        id={triggerId}
        type="button"
        className="ui-dpk__trigger"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-label={ariaLabel ? `${ariaLabel}, ${value ? fmt.long.format(value) : placeholder}` : undefined}
        aria-labelledby={ariaLabel ? undefined : label != null ? `${labelId} ${triggerId}` : undefined}
        aria-describedby={message ? messageId : undefined}
        aria-invalid={invalid || undefined}
        aria-required={required || undefined}
        disabled={disabled}
        onClick={() => (open ? hide() : show())}
        onKeyDown={(e) => {
          if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
            e.preventDefault();
            show();
          } else if (open && e.key === "Escape") {
            e.preventDefault();
            hide();
          }
        }}
      >
        <span className="ui-dpk__icon" aria-hidden="true">
          <CalendarIcon />
        </span>
        <span className="ui-dpk__value" data-empty={value ? undefined : ""} key={value ? value.getTime() : "empty"}>
          {value ? fmt.value.format(value) : placeholder}
        </span>
        <span className="ui-dpk__chevron" aria-hidden="true">
          <ChevronIcon />
        </span>
      </button>
      {name && <input type="hidden" name={name} value={value ? iso(value) : ""} />}

      {open && (
        <div
          ref={panel}
          id={panelId}
          className="ui-dpk__panel"
          role="dialog"
          aria-modal="false"
          aria-labelledby={titleId}
          popover="manual"
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.preventDefault();
              e.stopPropagation();
              hide();
            }
          }}
          onBlur={(e) => {
            // Tabbing out of the card closes it (not into the field)
            const to = e.relatedTarget as Node | null;
            if (to && !panel.current?.contains(to) && !trigger.current?.contains(to)) hide(false);
          }}
        >
          <div className="ui-dpk__nav">
            <button type="button" className="ui-dpk__arrow" aria-label="Previous month" disabled={!canPrev} onClick={() => shift(-1)}>
              <ArrowIcon d="M15 6C15 6 9 10.42 9 12C9 13.58 15 18 15 18" />
            </button>
            <div className="ui-dpk__title" id={titleId} aria-live="polite">
              <span key={month.getTime()} data-dir={dir}>
                {fmt.month.format(month)}
              </span>
            </div>
            <button type="button" className="ui-dpk__arrow" aria-label="Next month" disabled={!canNext} onClick={() => shift(1)}>
              <ArrowIcon d="M9 6C9 6 15 10.42 15 12C15 13.58 9 18 9 18" />
            </button>
          </div>

          <div role="grid" aria-labelledby={titleId} className="ui-dpk__grid" onKeyDown={onGridKey} onPointerDown={() => (moveFocus.current = false)}>
            <div role="row" className="ui-dpk__weekdays">
              {heads.map((h) => (
                <span key={h.key} role="columnheader" aria-label={h.long} className="ui-dpk__weekday">
                  <abbr title={h.long}>{h.text}</abbr>
                </span>
              ))}
            </div>
            <div className="ui-dpk__weeks" key={month.getTime()} data-dir={dir}>
              {rows.map((week, wi) => (
                <div role="row" key={wi} className="ui-dpk__week">
                  {week.map((d) => {
                    const chosen = same(d, value);
                    const off = blocked(d);
                    return (
                      <span key={d.getTime()} role="gridcell" aria-selected={chosen} className="ui-dpk__cell">
                        <button
                          type="button"
                          className="ui-dpk__day"
                          data-day={d.getTime()}
                          data-outside={!sameMonth(d, month) || undefined}
                          data-chosen={chosen || undefined}
                          tabIndex={same(d, tabDay) ? 0 : -1}
                          aria-label={fmt.long.format(d)}
                          aria-current={same(d, today) ? "date" : undefined}
                          aria-disabled={off || undefined}
                          onClick={() => pick(d)}
                          onFocus={() => same(d, focus) || setFocus(d)}
                        >
                          {fmt.day(d)}
                        </button>
                      </span>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {message && (
        <p className="ui-dpk__message" id={messageId} key={shows(error) ? "error" : "hint"} aria-live={shows(error) ? "polite" : undefined}>
          {message}
        </p>
      )}
    </div>
  );
}

const SIZES = ["sm", "md", "lg"];
/** Text or an element – not true, false, null or an empty string */
const shows = (v: ReactNode) => v != null && typeof v !== "boolean" && v !== "";

/** Under the field (or above it when there is more room there), at its start edge, always inside the window */
function place(el: HTMLElement, trigger: HTMLElement) {
  const r = trigger.getBoundingClientRect();
  const gap = 6;
  const edge = 8;
  const vw = document.documentElement.clientWidth || window.innerWidth;
  const vh = window.innerHeight;
  const w = el.offsetWidth;
  const h = el.offsetHeight;
  const below = vh - r.bottom - gap - edge;
  const above = r.top - gap - edge;
  const up = below < h && above > below;
  const rtl = getComputedStyle(trigger).direction === "rtl";
  const left = Math.min(Math.max(edge, rtl ? r.right - w : r.left), Math.max(edge, vw - edge - w));
  const top = up ? Math.max(edge, r.top - gap - h) : r.bottom + gap;
  el.style.left = `${Math.round(left)}px`;
  el.style.top = `${Math.round(top)}px`;
  el.toggleAttribute("data-up", up);
}

/* Icons: Hugeicons Free (MIT, © Hugeicons, hugeicons.com) – Calendar 03, Arrow Left / Right / Down 01 */
function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 2V6M8 2V6" />
      <path d="M13 4H11C7.23 4 5.34 4 4.17 5.17C3 6.34 3 8.23 3 12V14C3 17.77 3 19.66 4.17 20.83C5.34 22 7.23 22 11 22H13C16.77 22 18.66 22 19.83 20.83C21 19.66 21 17.77 21 14V12C21 8.23 21 6.34 19.83 5.17C18.66 4 16.77 4 13 4Z" />
      <path d="M3 10H21" />
      <path d="M12 14H12.01M12 18H12.01M7.5 14H7.51M7.5 18H7.51M16.5 14H16.51" strokeWidth="2" />
    </svg>
  );
}
function ArrowIcon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
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

/* ---------- Styles ---------- */

const css = /* css */ `
/* Colors and motion as variables – override them on .ui-dpk (see Theming in the docs) */
.ui-dpk {
  --ui-dpk-title: var(--aui-ink, #171717);
  --ui-dpk-strong: var(--aui-ink, #171717);
  --ui-dpk-ink: var(--aui-ink, #171717);
  --ui-dpk-subtle: var(--aui-muted, #8f8f8f);
  --ui-dpk-faint: var(--aui-placeholder, #c4c4c7);
  --ui-dpk-icon: var(--aui-muted, #8f8f8f);
  --ui-dpk-surface: var(--aui-surface, #ffffff);
  --ui-dpk-card: var(--aui-overlay, var(--aui-surface, #ffffff));
  --ui-dpk-line: var(--aui-border, #e6e6e8);
  --ui-dpk-edge: var(--aui-border-strong, #d4d4d8);
  --ui-dpk-edge-open: var(--aui-border-strong, #b4b4bb);
  --ui-dpk-hover: var(--aui-subtle, #f2f2f3);
  --ui-dpk-readonly: #fafafa;
  /* The chosen day: a blue chip */
  --ui-dpk-accent: var(--aui-blue, #4fb0fe);
  --ui-dpk-on-accent: #ffffff;
  --ui-dpk-shadow-pop: var(--aui-shadow-popover, 0 0 0 1px rgba(0, 0, 0, 0.06), 0 18px 40px -12px rgba(0, 0, 0, 0.18), 0 4px 12px -4px rgba(0, 0, 0, 0.06));
  --ui-dpk-danger: var(--aui-danger, #c4320a);
  --ui-dpk-danger-edge: #ff8a7a;
  --ui-dpk-danger-wash: color-mix(in srgb, var(--aui-red, #f04438) 4%, transparent);
  --ui-dpk-focus: var(--aui-focus, rgba(0, 96, 226, 0.7));
  --ui-dpk-ease: var(--aui-ease, cubic-bezier(0.22, 1, 0.36, 1));
  --ui-dpk-spring: cubic-bezier(0.34, 1.56, 0.64, 1);

  --h: 36px;
  --px: 12px;
  --fs: 13.5px;
  --radius: var(--aui-radius, 10px);
  --cell: 34px;

  display: flex;
  flex-direction: column;
  gap: 7px;
  min-width: 0;
  font-family: var(--aui-font, "Inter", "InterVariable", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif);
  font-size: 13.5px;
  line-height: 20px;
  color: var(--ui-dpk-ink);
  -webkit-font-smoothing: antialiased;
}
.ui-dpk[data-size="sm"] { --h: 32px; --px: 10px; --fs: 13px; --radius: calc(var(--aui-radius, 10px) - 1px); }
.ui-dpk[data-size="lg"] { --h: 40px; --px: 14px; --fs: 14px; --radius: calc(var(--aui-radius, 10px) + 2px); }
/* Touch screens: a comfortable tap height, 16px text and bigger days */
@media (pointer: coarse) {
  .ui-dpk { --fs: 16px; --cell: 40px; }
  .ui-dpk[data-size="sm"] { --h: 36px; }
  .ui-dpk[data-size="md"] { --h: 40px; }
  .ui-dpk[data-size="lg"] { --h: 44px; }
}
.ui-dpk *, .ui-dpk *::before, .ui-dpk *::after { box-sizing: border-box; }
:where(.ui-dpk) button { margin: 0; padding: 0; border: 0; background: none; font: inherit; color: inherit; cursor: pointer; -webkit-tap-highlight-color: transparent; }
:where(.ui-dpk) svg { display: block; flex: none; }
.ui-dpk button:focus-visible { outline: 2px solid var(--ui-dpk-focus); outline-offset: 2px; }

.ui-dpk__head { display: flex; align-items: baseline; gap: 6px; min-width: 0; padding: 0 2px; }
.ui-dpk__label { min-width: 0; font-size: 13px; font-weight: 500; color: var(--ui-dpk-title); overflow-wrap: anywhere; cursor: default; }
.ui-dpk__optional { flex: none; font-size: 12px; line-height: 16px; color: var(--ui-dpk-subtle); }

/* The field: the Text Field's look – white with a 1px gray edge that darkens on hover and while open */
.ui-dpk__trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  height: var(--h);
  min-width: 0;
  padding: 0 calc(var(--px) - 2px) 0 var(--px);
  border-radius: var(--radius);
  background: var(--ui-dpk-surface);
  box-shadow: 0 0 0 1px var(--ui-dpk-line), 0 1px 2px rgba(0, 0, 0, 0.04);
  font-size: var(--fs);
  color: var(--ui-dpk-ink);
  text-align: start;
  transition: box-shadow 140ms ease, background-color 140ms ease;
}
.ui-dpk__trigger:hover { box-shadow: 0 0 0 1px var(--ui-dpk-edge), 0 1px 2px rgba(0, 0, 0, 0.04); }
.ui-dpk[data-open] .ui-dpk__trigger { box-shadow: 0 0 0 1px var(--ui-dpk-edge-open), 0 1px 2px rgba(0, 0, 0, 0.04); }
.ui-dpk[data-invalid] .ui-dpk__trigger { background: var(--ui-dpk-danger-wash); box-shadow: 0 0 0 1px var(--ui-dpk-danger-edge), 0 1px 2px rgba(0, 0, 0, 0.04); }
.ui-dpk__trigger:disabled { background: var(--ui-dpk-readonly); box-shadow: 0 0 0 1px var(--ui-dpk-line); cursor: not-allowed; }
.ui-dpk[data-disabled] { opacity: 0.55; }
.ui-dpk__icon, .ui-dpk__chevron { display: grid; flex: none; place-items: center; width: 16px; height: 16px; color: var(--ui-dpk-icon); }
.ui-dpk__chevron { transition: transform 240ms var(--ui-dpk-ease); }
.ui-dpk[data-open] .ui-dpk__chevron { transform: rotate(180deg); }
.ui-dpk__value { flex: 1; min-width: 0; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; font-variant-numeric: tabular-nums; animation: ui-dpk-value 260ms var(--ui-dpk-ease) both; }
.ui-dpk__value[data-empty] { color: var(--ui-dpk-faint); animation: none; }

/* The card: white in the top layer, a 1px edge and a deeper drop */
.ui-dpk__panel {
  position: fixed;
  inset: auto;
  z-index: 1000;
  width: calc(var(--cell) * 7 + 20px);
  max-width: calc(100vw - 16px);
  margin: 0;
  padding: 10px;
  border: 0;
  border-radius: 16px;
  background: var(--ui-dpk-card);
  box-shadow: var(--ui-dpk-shadow-pop);
  color: var(--ui-dpk-ink);
  font: inherit;
  font-size: 13px;
  overflow: hidden;
  transform-origin: top left;
  animation: ui-dpk-open 220ms var(--ui-dpk-ease) both;
}
.ui-dpk__panel:dir(rtl) { transform-origin: top right; }
.ui-dpk__panel[data-up] { transform-origin: bottom left; animation-name: ui-dpk-open-up; }
.ui-dpk__panel::backdrop { display: none; }

/* Month name between the two arrows */
.ui-dpk__nav { display: flex; align-items: center; gap: 4px; height: 30px; margin-bottom: 4px; }
.ui-dpk__title { flex: 1; min-width: 0; overflow: hidden; text-align: center; font-size: 13.5px; font-weight: 600; white-space: nowrap; color: var(--ui-dpk-strong); }
.ui-dpk__title > span { display: block; overflow: hidden; text-overflow: ellipsis; animation: ui-dpk-fade 240ms var(--ui-dpk-ease) both; }
.ui-dpk__arrow { display: grid; flex: none; place-items: center; width: 30px; height: 30px; border-radius: 9px; color: var(--ui-dpk-icon); transition: background-color 140ms ease, color 140ms ease; }
.ui-dpk__arrow:hover:not(:disabled) { background: var(--ui-dpk-hover); color: var(--ui-dpk-ink); }
.ui-dpk__arrow:disabled { opacity: 0.35; cursor: default; }
.ui-dpk__arrow:dir(rtl) svg { transform: scaleX(-1); }

/* The month: weekday heads and six weeks of days that touch */
.ui-dpk__grid { display: grid; }
.ui-dpk__weekdays, .ui-dpk__week { display: grid; grid-template-columns: repeat(7, minmax(0, var(--cell))); justify-content: center; }
.ui-dpk__weekday { height: 26px; overflow: hidden; font-size: 11px; font-weight: 500; line-height: 26px; text-align: center; white-space: nowrap; color: var(--ui-dpk-subtle); }
.ui-dpk__weekday abbr { text-decoration: none; cursor: default; }
.ui-dpk__weeks { animation: ui-dpk-slide 300ms var(--ui-dpk-ease) both; }
.ui-dpk__weeks[data-dir="-1"] { animation-name: ui-dpk-slide-back; }
.ui-dpk__cell { display: grid; height: var(--cell); }
.ui-dpk__day {
  position: relative;
  margin: 2px;
  border-radius: 9px;
  font-size: 12.5px;
  line-height: 20px;
  font-variant-numeric: tabular-nums;
  color: var(--ui-dpk-ink);
  transition: background-color 200ms ease, color 200ms ease, transform 160ms var(--ui-dpk-ease);
}
.ui-dpk__day:hover:not([aria-disabled]):not([data-chosen]) { background: var(--ui-dpk-hover); }
.ui-dpk__day:active:not([aria-disabled]) { transform: scale(0.94); }
/* Days of the months around: quieter, still a press away */
.ui-dpk__day[data-outside] { color: var(--ui-dpk-subtle); }
.ui-dpk__day[aria-disabled] { color: var(--ui-dpk-faint); cursor: default; }
/* The days touch each other: their ring sits inside */
.ui-dpk .ui-dpk__day:focus-visible { outline-offset: -2px; }
/* Today: a small dot under the number */
.ui-dpk__day[aria-current="date"] { font-weight: 600; }
.ui-dpk__day[aria-current="date"]::after { content: ""; position: absolute; left: 50%; bottom: 4px; width: 3px; height: 3px; margin-left: -1.5px; border-radius: 50%; background: currentColor; opacity: 0.55; }
/* The chosen day: a blue chip that pops in */
.ui-dpk__day[data-chosen] { background: var(--ui-dpk-accent); color: var(--ui-dpk-on-accent); font-weight: 600; animation: ui-dpk-pick 380ms var(--ui-dpk-spring); }
.ui-dpk__day[data-chosen][aria-current="date"]::after { opacity: 0.85; }

.ui-dpk__message { margin: 0; padding: 0 2px; font-size: 12.5px; line-height: 17px; color: var(--ui-dpk-subtle); overflow-wrap: anywhere; animation: ui-dpk-message 260ms var(--ui-dpk-ease); }
.ui-dpk[data-invalid] .ui-dpk__message { color: var(--ui-dpk-danger); }

@keyframes ui-dpk-open { from { opacity: 0; transform: translateY(-4px) scale(0.98); } }
@keyframes ui-dpk-open-up { from { opacity: 0; transform: translateY(4px) scale(0.98); } }
@keyframes ui-dpk-slide { from { opacity: 0; transform: translateX(14px); } }
@keyframes ui-dpk-slide-back { from { opacity: 0; transform: translateX(-14px); } }
@keyframes ui-dpk-fade { from { opacity: 0; } }
@keyframes ui-dpk-value { from { opacity: 0; transform: translateY(4px); filter: blur(2px); } }
@keyframes ui-dpk-pick { 0% { transform: scale(0.82); } 60% { transform: scale(1.06); } 100% { transform: scale(1); } }
@keyframes ui-dpk-message { from { opacity: 0; transform: translateY(-3px); filter: blur(2px); } }

@media (prefers-reduced-motion: reduce) {
  .ui-dpk *, .ui-dpk *::before, .ui-dpk *::after { animation-duration: 1ms !important; transition-duration: 1ms !important; }
}

/* Dark mode: follows a .dark class or data-theme="dark" on any ancestor, e.g. <html> */
:where(.dark, [data-theme="dark"]) .ui-dpk {
  --ui-dpk-title: var(--aui-ink, #ededed);
  --ui-dpk-strong: var(--aui-ink, #ededed);
  --ui-dpk-ink: var(--aui-ink, #ededed);
  --ui-dpk-subtle: var(--aui-muted, #8b8b92);
  --ui-dpk-faint: var(--aui-placeholder, #4a4a50);
  --ui-dpk-icon: var(--aui-muted, #8b8b92);
  --ui-dpk-surface: var(--aui-surface, #19191b);
  --ui-dpk-card: var(--aui-overlay, var(--aui-surface, #19191b));
  --ui-dpk-line: var(--aui-border, #2a2a2e);
  --ui-dpk-edge: var(--aui-border-strong, #3a3a40);
  --ui-dpk-edge-open: var(--aui-border-strong, #4e4e55);
  --ui-dpk-hover: var(--aui-subtle, #232326);
  --ui-dpk-readonly: #151517;
  --ui-dpk-accent: var(--aui-blue, #4fb0fe);
  --ui-dpk-on-accent: #0d0d10;
  --ui-dpk-shadow-pop: var(--aui-shadow-popover, 0 0 0 1px rgba(255, 255, 255, 0.06), 0 18px 40px -12px rgba(0, 0, 0, 0.6));
  --ui-dpk-danger: var(--aui-danger, #ff8a7a);
  --ui-dpk-danger-edge: color-mix(in srgb, var(--aui-red, #ff6b5f) 45%, transparent);
  --ui-dpk-danger-wash: color-mix(in srgb, var(--aui-red, #ff6b5f) 6%, transparent);
  --ui-dpk-focus: var(--aui-focus, rgba(77, 141, 255, 0.8));
  color-scheme: dark;
}
`;
