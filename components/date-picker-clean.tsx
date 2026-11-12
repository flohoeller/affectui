"use client";

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode, type Ref } from "react";

/*
 * Date Picker – a single self-contained file, clean style.
 * One day: a field in the Text Field's look that opens a month in a small white card – under the field, or above it
 * when there is no room. Today is marked with a blue dot, the chosen day is a dark chip; days outside min / max or ones
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
      className={["ui-dpkc", className].filter(Boolean).join(" ")}
      data-size={scale}
      data-open={open || undefined}
      data-invalid={invalid || undefined}
      data-disabled={disabled || undefined}
    >
      {/* React 19 hoists this into <head> once, no matter how many pickers render */}
      <style href="ui-date-picker-clean" precedence="default">
        {css}
      </style>
      {label != null && (
        <div className="ui-dpkc__head">
          <label className="ui-dpkc__label" id={labelId} htmlFor={triggerId}>
            {label}
          </label>
          {optional && <span className="ui-dpkc__optional">Optional</span>}
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
        className="ui-dpkc__trigger"
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
        <span className="ui-dpkc__icon" aria-hidden="true">
          <CalendarIcon />
        </span>
        <span className="ui-dpkc__value" data-empty={value ? undefined : ""} key={value ? value.getTime() : "empty"}>
          {value ? fmt.value.format(value) : placeholder}
        </span>
        <span className="ui-dpkc__chevron" aria-hidden="true">
          <ChevronIcon />
        </span>
      </button>
      {name && <input type="hidden" name={name} value={value ? iso(value) : ""} />}

      {open && (
        <div
          ref={panel}
          id={panelId}
          className="ui-dpkc__panel"
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
          <div className="ui-dpkc__nav">
            <button type="button" className="ui-dpkc__arrow" aria-label="Previous month" disabled={!canPrev} onClick={() => shift(-1)}>
              <ArrowIcon d="M15 6C15 6 9 10.42 9 12C9 13.58 15 18 15 18" />
            </button>
            <div className="ui-dpkc__title" id={titleId} aria-live="polite">
              <span key={month.getTime()} data-dir={dir}>
                {fmt.month.format(month)}
              </span>
            </div>
            <button type="button" className="ui-dpkc__arrow" aria-label="Next month" disabled={!canNext} onClick={() => shift(1)}>
              <ArrowIcon d="M9 6C9 6 15 10.42 15 12C15 13.58 9 18 9 18" />
            </button>
          </div>

          <div role="grid" aria-labelledby={titleId} className="ui-dpkc__grid" onKeyDown={onGridKey} onPointerDown={() => (moveFocus.current = false)}>
            <div role="row" className="ui-dpkc__weekdays">
              {heads.map((h) => (
                <span key={h.key} role="columnheader" aria-label={h.long} className="ui-dpkc__weekday">
                  <abbr title={h.long}>{h.text}</abbr>
                </span>
              ))}
            </div>
            <div className="ui-dpkc__weeks" key={month.getTime()} data-dir={dir}>
              {rows.map((week, wi) => (
                <div role="row" key={wi} className="ui-dpkc__week">
                  {week.map((d) => {
                    const chosen = same(d, value);
                    const off = blocked(d);
                    return (
                      <span key={d.getTime()} role="gridcell" aria-selected={chosen} className="ui-dpkc__cell">
                        <button
                          type="button"
                          className="ui-dpkc__day"
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
        <p className="ui-dpkc__message" id={messageId} key={shows(error) ? "error" : "hint"} aria-live={shows(error) ? "polite" : undefined}>
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
/* Colors and motion as variables – override them on .ui-dpkc (see Theming in the docs) */
.ui-dpkc {
  --ui-dpkc-title: var(--aui-ink, rgba(0, 0, 0, 0.88));
  --ui-dpkc-strong: var(--aui-ink, #000000);
  --ui-dpkc-ink: var(--aui-ink, rgba(0, 0, 0, 0.88));
  --ui-dpkc-subtle: var(--aui-muted, rgba(0, 0, 0, 0.45));
  --ui-dpkc-faint: var(--aui-placeholder, rgba(0, 0, 0, 0.27));
  --ui-dpkc-icon: var(--aui-muted, rgba(0, 0, 0, 0.447));
  --ui-dpkc-surface: var(--aui-surface, #ffffff);
  --ui-dpkc-card: var(--aui-overlay, var(--aui-surface, #ffffff));
  --ui-dpkc-wash: rgba(0, 0, 0, 0.045);
  --ui-dpkc-readonly: rgba(0, 0, 0, 0.02);
  /* The chosen day: a dark chip; today: blue text and a dot */
  --ui-dpkc-chip: var(--aui-primary, rgba(0, 0, 0, 0.88));
  --ui-dpkc-on-chip: var(--aui-on-primary, #fcfcfc);
  --ui-dpkc-accent: rgba(0, 96, 226, 0.765);
  --ui-dpkc-today-on-chip: var(--aui-blue, #4fb0fe);
  --ui-dpkc-shadow: 0 0 0 0.5px var(--aui-border, rgba(0, 0, 0, 0.08)), 0 1px 1px -1px rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --ui-dpkc-shadow-hover: 0 0 0 0.5px var(--aui-border-strong, rgba(0, 0, 0, 0.13)), 0 1px 1px -1px rgba(0, 0, 0, 0.12), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  --ui-dpkc-shadow-open: 0 0 0 1px var(--aui-border-strong, rgba(0, 0, 0, 0.28)), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  --ui-dpkc-shadow-pop: var(--aui-shadow-popover, 0 0 0 0.5px rgba(0, 0, 0, 0.08), 0 8px 24px -6px rgba(0, 0, 0, 0.14), 0 2px 6px -2px rgba(0, 0, 0, 0.06));
  --ui-dpkc-danger: var(--aui-danger, #c4320a);
  --ui-dpkc-danger-edge: color-mix(in srgb, var(--aui-red, #f04438) 55%, transparent);
  --ui-dpkc-focus: var(--aui-focus, rgba(0, 96, 226, 0.7));
  --ui-dpkc-ease: var(--aui-ease, cubic-bezier(0.22, 1, 0.36, 1));
  --ui-dpkc-spring: cubic-bezier(0.34, 1.56, 0.64, 1);

  --h: 32px;
  --px: 10px;
  --fs: 13px;
  --radius: var(--aui-radius, 7px);
  --cell: 32px;

  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  font-family: var(--aui-font, "Inter", "InterVariable", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif);
  font-size: 13px;
  line-height: 20px;
  color: var(--ui-dpkc-ink);
  -webkit-font-smoothing: antialiased;
}
.ui-dpkc[data-size="sm"] { --h: 28px; --px: 8px; --radius: calc(var(--aui-radius, 7px) - 1px); }
.ui-dpkc[data-size="lg"] { --h: 36px; --px: 12px; --fs: 14px; --radius: calc(var(--aui-radius, 7px) + 1px); }
/* Touch screens: a comfortable tap height, 16px text and bigger days */
@media (pointer: coarse) {
  .ui-dpkc { --fs: 16px; --cell: 40px; }
  .ui-dpkc[data-size="sm"] { --h: 34px; }
  .ui-dpkc[data-size="md"] { --h: 38px; }
  .ui-dpkc[data-size="lg"] { --h: 40px; }
}
.ui-dpkc *, .ui-dpkc *::before, .ui-dpkc *::after { box-sizing: border-box; }
:where(.ui-dpkc) button { margin: 0; padding: 0; border: 0; background: none; font: inherit; color: inherit; cursor: pointer; -webkit-tap-highlight-color: transparent; }
:where(.ui-dpkc) svg { display: block; flex: none; }
.ui-dpkc button:focus-visible { outline: 2px solid var(--ui-dpkc-focus); outline-offset: 2px; }

.ui-dpkc__head { display: flex; align-items: baseline; gap: 6px; min-width: 0; }
.ui-dpkc__label { min-width: 0; font-weight: 500; color: var(--ui-dpkc-title); overflow-wrap: anywhere; cursor: default; }
.ui-dpkc__optional { flex: none; font-size: 12px; line-height: 16px; color: var(--ui-dpkc-subtle); }

/* The field: the Text Field's look – white, a hairline edge that firms up on hover and while open */
.ui-dpkc__trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  height: var(--h);
  min-width: 0;
  padding: 0 calc(var(--px) - 2px) 0 var(--px);
  border-radius: var(--radius);
  background: var(--ui-dpkc-surface);
  box-shadow: var(--ui-dpkc-shadow);
  font-size: var(--fs);
  color: var(--ui-dpkc-ink);
  text-align: start;
  transition: box-shadow 140ms ease, background-color 140ms ease;
}
.ui-dpkc__trigger:hover { box-shadow: var(--ui-dpkc-shadow-hover); }
.ui-dpkc[data-open] .ui-dpkc__trigger { box-shadow: var(--ui-dpkc-shadow-open); }
.ui-dpkc[data-invalid] .ui-dpkc__trigger { box-shadow: 0 0 0 1px var(--ui-dpkc-danger-edge), 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
.ui-dpkc__trigger:disabled { background: var(--ui-dpkc-readonly); box-shadow: 0 0 0 0.5px rgba(0, 0, 0, 0.06); cursor: not-allowed; }
.ui-dpkc[data-disabled] { opacity: 0.55; }
.ui-dpkc__icon, .ui-dpkc__chevron { display: grid; flex: none; place-items: center; width: 16px; height: 16px; color: var(--ui-dpkc-icon); }
.ui-dpkc__chevron { transition: transform 240ms var(--ui-dpkc-ease); }
.ui-dpkc[data-open] .ui-dpkc__chevron { transform: rotate(180deg); }
.ui-dpkc__value { flex: 1; min-width: 0; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; font-variant-numeric: tabular-nums; animation: ui-dpkc-value 240ms var(--ui-dpkc-ease) both; }
.ui-dpkc__value[data-empty] { color: var(--ui-dpkc-faint); animation: none; }

/* The card: white in the top layer, a 0.5px edge and a soft drop */
.ui-dpkc__panel {
  position: fixed;
  inset: auto;
  z-index: 1000;
  width: calc(var(--cell) * 7 + 16px);
  max-width: calc(100vw - 16px);
  margin: 0;
  padding: 8px;
  border: 0;
  border-radius: 10px;
  background: var(--ui-dpkc-card);
  box-shadow: var(--ui-dpkc-shadow-pop);
  color: var(--ui-dpkc-ink);
  font: inherit;
  font-size: 13px;
  overflow: hidden;
  transform-origin: top left;
  animation: ui-dpkc-open 200ms var(--ui-dpkc-ease) both;
}
.ui-dpkc__panel:dir(rtl) { transform-origin: top right; }
.ui-dpkc__panel[data-up] { transform-origin: bottom left; animation-name: ui-dpkc-open-up; }
.ui-dpkc__panel::backdrop { display: none; }

/* Month name between the two arrows */
.ui-dpkc__nav { display: flex; align-items: center; gap: 4px; height: 28px; margin-bottom: 4px; }
.ui-dpkc__title { flex: 1; min-width: 0; overflow: hidden; text-align: center; font-weight: 500; white-space: nowrap; color: var(--ui-dpkc-strong); }
.ui-dpkc__title > span { display: block; overflow: hidden; text-overflow: ellipsis; animation: ui-dpkc-fade 220ms var(--ui-dpkc-ease) both; }
.ui-dpkc__arrow { display: grid; flex: none; place-items: center; width: 28px; height: 28px; border-radius: 6px; color: var(--ui-dpkc-icon); transition: background-color 120ms ease, color 120ms ease; }
.ui-dpkc__arrow:hover:not(:disabled) { background: var(--ui-dpkc-wash); color: var(--ui-dpkc-ink); }
.ui-dpkc__arrow:disabled { opacity: 0.35; cursor: default; }
.ui-dpkc__arrow:dir(rtl) svg { transform: scaleX(-1); }

/* The month: weekday heads and six weeks of days that touch */
.ui-dpkc__grid { display: grid; }
.ui-dpkc__weekdays, .ui-dpkc__week { display: grid; grid-template-columns: repeat(7, minmax(0, var(--cell))); justify-content: center; }
.ui-dpkc__weekday { height: 24px; overflow: hidden; font-size: 10px; font-weight: 500; line-height: 24px; letter-spacing: 0.5px; text-transform: uppercase; text-align: center; white-space: nowrap; color: var(--ui-dpkc-subtle); }
.ui-dpkc__weekday abbr { text-decoration: none; cursor: default; }
.ui-dpkc__weeks { animation: ui-dpkc-slide 260ms var(--ui-dpkc-ease) both; }
.ui-dpkc__weeks[data-dir="-1"] { animation-name: ui-dpkc-slide-back; }
.ui-dpkc__cell { display: grid; height: var(--cell); }
.ui-dpkc__day {
  position: relative;
  margin: 2px;
  border-radius: 6px;
  font-size: 13px;
  line-height: 20px;
  font-variant-numeric: tabular-nums;
  color: var(--ui-dpkc-ink);
  transition: background-color 120ms ease, color 120ms ease, transform 160ms var(--ui-dpkc-ease);
}
.ui-dpkc__day:hover:not([aria-disabled]):not([data-chosen]) { background: var(--ui-dpkc-wash); }
.ui-dpkc__day:active:not([aria-disabled]) { transform: scale(0.94); }
/* Days of the months around: quieter, still a press away */
.ui-dpkc__day[data-outside] { color: var(--ui-dpkc-subtle); }
.ui-dpkc__day[aria-disabled] { color: var(--ui-dpkc-faint); cursor: default; }
/* The days touch each other: their ring sits inside */
.ui-dpkc .ui-dpkc__day:focus-visible { outline-offset: -2px; }
/* Today: blue, with a small dot under the number */
.ui-dpkc__day[aria-current="date"] { color: var(--ui-dpkc-accent); font-weight: 500; }
.ui-dpkc__day[aria-current="date"]::after { content: ""; position: absolute; left: 50%; bottom: 3px; width: 4px; height: 4px; margin-left: -2px; border-radius: 50%; background: currentColor; }
/* The chosen day: a dark chip that pops in */
.ui-dpkc__day[data-chosen] { background: var(--ui-dpkc-chip); color: var(--ui-dpkc-on-chip); font-weight: 500; animation: ui-dpkc-pick 380ms var(--ui-dpkc-spring); }
.ui-dpkc__day[data-chosen][aria-current="date"]::after { background: var(--ui-dpkc-today-on-chip); }

.ui-dpkc__message { margin: 0; font-size: 12px; line-height: 16px; color: var(--ui-dpkc-subtle); overflow-wrap: anywhere; animation: ui-dpkc-message 260ms var(--ui-dpkc-ease); }
.ui-dpkc[data-invalid] .ui-dpkc__message { color: var(--ui-dpkc-danger); }

@keyframes ui-dpkc-open { from { opacity: 0; transform: translateY(-4px) scale(0.98); } }
@keyframes ui-dpkc-open-up { from { opacity: 0; transform: translateY(4px) scale(0.98); } }
@keyframes ui-dpkc-slide { from { opacity: 0; transform: translateX(12px); } }
@keyframes ui-dpkc-slide-back { from { opacity: 0; transform: translateX(-12px); } }
@keyframes ui-dpkc-fade { from { opacity: 0; } }
@keyframes ui-dpkc-value { from { opacity: 0; transform: translateY(3px); } }
@keyframes ui-dpkc-pick { 0% { transform: scale(0.82); } 60% { transform: scale(1.06); } 100% { transform: scale(1); } }
@keyframes ui-dpkc-message { from { opacity: 0; transform: translateY(-3px); filter: blur(2px); } }

@media (prefers-reduced-motion: reduce) {
  .ui-dpkc *, .ui-dpkc *::before, .ui-dpkc *::after { animation-duration: 1ms !important; transition-duration: 1ms !important; }
}

/* Dark mode: follows a .dark class or data-theme="dark" on any ancestor, e.g. <html> */
:where(.dark, [data-theme="dark"]) .ui-dpkc {
  --ui-dpkc-title: var(--aui-ink, rgba(255, 255, 255, 0.92));
  --ui-dpkc-strong: var(--aui-ink, #ffffff);
  --ui-dpkc-ink: var(--aui-ink, rgba(255, 255, 255, 0.9));
  --ui-dpkc-subtle: var(--aui-muted, rgba(255, 255, 255, 0.46));
  --ui-dpkc-faint: var(--aui-placeholder, rgba(255, 255, 255, 0.28));
  --ui-dpkc-icon: var(--aui-muted, rgba(255, 255, 255, 0.5));
  --ui-dpkc-surface: var(--aui-surface, #1c1c1e);
  --ui-dpkc-card: var(--aui-overlay, var(--aui-surface, #1f1f22));
  --ui-dpkc-wash: rgba(255, 255, 255, 0.07);
  --ui-dpkc-readonly: rgba(255, 255, 255, 0.03);
  --ui-dpkc-chip: var(--aui-primary, rgba(255, 255, 255, 0.9));
  --ui-dpkc-on-chip: var(--aui-on-primary, #111113);
  --ui-dpkc-accent: var(--aui-blue, #4fb0fe);
  --ui-dpkc-today-on-chip: #0070d6;
  --ui-dpkc-shadow: 0 0 0 0.5px var(--aui-border, rgba(255, 255, 255, 0.14)), 0 1px 2px 0 rgba(0, 0, 0, 0.4);
  --ui-dpkc-shadow-hover: 0 0 0 0.5px var(--aui-border-strong, rgba(255, 255, 255, 0.2)), 0 1px 2px 0 rgba(0, 0, 0, 0.4);
  --ui-dpkc-shadow-open: 0 0 0 1px var(--aui-border-strong, rgba(255, 255, 255, 0.3)), 0 1px 2px 0 rgba(0, 0, 0, 0.4);
  --ui-dpkc-shadow-pop: var(--aui-shadow-popover, 0 0 0 0.5px rgba(255, 255, 255, 0.12), 0 12px 32px -8px rgba(0, 0, 0, 0.6));
  --ui-dpkc-danger: var(--aui-danger, #ff8a7a);
  --ui-dpkc-danger-edge: color-mix(in srgb, var(--aui-red, #ff6b5f) 50%, transparent);
  --ui-dpkc-focus: var(--aui-focus, rgba(77, 141, 255, 0.8));
  color-scheme: dark;
}
`;
