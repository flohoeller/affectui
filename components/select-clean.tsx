"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode, type Ref } from "react";

/*
 * Select – a single self-contained file, clean style.
 * Pick one option from a list: a field in the Text Field's look that opens a list under it (or above, when there is
 * no room), options with an icon and a quiet second line, a check on the chosen one and a soft highlight that glides
 * to where the pointer or the arrow keys are. Typing a letter jumps to the option. The list sits in the top layer,
 * so a card's overflow never cuts it. The styles are injected below, so no extra files are needed.
 */

export type SelectOption = {
  value: string;
  label: string;
  /** A quiet second line under the label */
  description?: string;
  /** A 16px icon before the label, e.g. an inline SVG */
  icon?: ReactNode;
  disabled?: boolean;
};

export type SelectProps = {
  options: SelectOption[];
  /** The chosen value – makes it controlled */
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (value: string, option: SelectOption) => void;
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
  /** Sends the value with a form, through a hidden input */
  name?: string;
  required?: boolean;
  id?: string;
  className?: string;
  "aria-label"?: string;
  ref?: Ref<HTMLButtonElement>;
};

export function Select({
  options,
  value: valueProp,
  defaultValue = null,
  onChange,
  placeholder = "Choose…",
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
}: SelectProps) {
  const autoId = useId();
  const triggerId = id ?? `${autoId}-trigger`;
  const listId = `${autoId}-list`;
  const labelId = `${autoId}-label`;
  const messageId = `${autoId}-message`;
  const optionId = (i: number) => `${autoId}-option-${i}`;

  const [own, setOwn] = useState<string | null>(defaultValue);
  const value = valueProp !== undefined ? valueProp : own;
  const chosen = options.find((o) => o.value === value) ?? null;

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [place, setPlace] = useState<{ top: number; left: number; width: number; maxHeight: number; up: boolean } | null>(null);
  const [glow, setGlow] = useState<{ top: number; height: number } | null>(null);

  const trigger = useRef<HTMLButtonElement | null>(null);
  const list = useRef<HTMLDivElement | null>(null);
  const typed = useRef({ text: "", at: 0 });

  const invalid = Boolean(error);
  const message = shows(error) ? error : shows(hint) ? hint : null;
  const scale = SIZES.includes(size) ? size : "md";
  const enabled = (i: number) => i >= 0 && i < options.length && !options[i].disabled;

  const first = () => options.findIndex((o) => !o.disabled);
  const last = () => {
    for (let i = options.length - 1; i >= 0; i--) if (!options[i].disabled) return i;
    return -1;
  };
  const step = (from: number, dir: 1 | -1) => {
    for (let i = from + dir; i >= 0 && i < options.length; i += dir) if (!options[i].disabled) return i;
    return from;
  };

  const show = (at?: number) => {
    if (disabled || !options.length) return;
    const chosenAt = options.findIndex((o) => o.value === value);
    setActive(at ?? (enabled(chosenAt) ? chosenAt : first()));
    setOpen(true);
  };
  const hide = (focusBack = true) => {
    setOpen(false);
    setGlow(null);
    setPlace(null);
    if (focusBack) trigger.current?.focus({ preventScroll: true });
  };
  const pick = (i: number) => {
    if (!enabled(i)) return;
    const o = options[i];
    if (valueProp === undefined) setOwn(o.value);
    if (o.value !== value) onChange?.(o.value, o);
    hide();
  };

  // Where the list goes: under the field, or above it when there is more room there; as wide as the field
  const measure = () => {
    const t = trigger.current;
    if (!t) return;
    const r = t.getBoundingClientRect();
    const gap = 4;
    const edge = 8;
    const below = window.innerHeight - r.bottom - gap - edge;
    const above = r.top - gap - edge;
    const want = Math.min(list.current?.scrollHeight ?? 280, 288);
    const up = below < Math.min(want, 160) && above > below;
    const width = Math.max(r.width, 180);
    const left = Math.min(Math.max(edge, r.left), window.innerWidth - width - edge);
    setPlace({ top: up ? r.top - gap : r.bottom + gap, left, width, maxHeight: Math.max(120, Math.min(288, up ? above : below)), up });
  };

  useLayoutEffect(() => {
    if (!open) return;
    const el = list.current;
    // The top layer, so no overflow cuts it and no z-index fights it
    if (el && "showPopover" in el && !el.matches(":popover-open")) el.showPopover();
    measure();
    const update = () => measure();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
      if (el && "hidePopover" in el && el.matches(":popover-open")) el.hidePopover();
    };
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // A press anywhere else closes it, without taking the focus back
  useEffect(() => {
    if (!open) return;
    const down = (e: PointerEvent) => {
      const target = e.target as Node;
      if (trigger.current?.contains(target) || list.current?.contains(target)) return;
      hide(false);
    };
    document.addEventListener("pointerdown", down, true);
    return () => document.removeEventListener("pointerdown", down, true);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // The highlight glides to the active option, and the list scrolls it into view
  useLayoutEffect(() => {
    if (!open || active < 0) return;
    const row = list.current?.querySelector<HTMLElement>(`[data-index="${active}"]`);
    if (!row) return;
    setGlow({ top: row.offsetTop, height: row.offsetHeight });
    row.scrollIntoView({ block: "nearest" });
  }, [active, open, place]);

  // Typing letters jumps to the next option that starts with them, like a native select
  const typeahead = (key: string) => {
    const now = Date.now();
    typed.current.text = now - typed.current.at > 700 ? key : typed.current.text + key;
    typed.current.at = now;
    const q = typed.current.text.toLowerCase();
    const start = open ? active : options.findIndex((o) => o.value === value);
    const order = [...options.keys()].map((k) => (k + start + (q.length === 1 ? 1 : 0) + options.length) % options.length);
    const hit = order.find((i) => enabled(i) && options[i].label.toLowerCase().startsWith(q));
    if (hit === undefined) return;
    if (open) setActive(hit);
    else pick(hit);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        show();
      } else if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) typeahead(e.key);
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActive((a) => step(a, 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActive((a) => step(a, -1));
        break;
      case "Home":
      case "PageUp":
        e.preventDefault();
        setActive(first());
        break;
      case "End":
      case "PageDown":
        e.preventDefault();
        setActive(last());
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (e.key === " " && Date.now() - typed.current.at < 700) typeahead(" ");
        else pick(active);
        break;
      case "Escape":
        e.preventDefault();
        hide();
        break;
      case "Tab":
        hide(false);
        break;
      default:
        if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) typeahead(e.key);
    }
  };

  return (
    <div
      className={["ui-selc", className].filter(Boolean).join(" ")}
      data-size={scale}
      data-open={open || undefined}
      data-invalid={invalid || undefined}
      data-disabled={disabled || undefined}
    >
      {/* React 19 hoists this into <head> once, no matter how many selects render */}
      <style href="ui-select-clean" precedence="default">
        {css}
      </style>
      {label != null && (
        <div className="ui-selc__head">
          <label className="ui-selc__label" id={labelId} htmlFor={triggerId}>
            {label}
          </label>
          {optional && <span className="ui-selc__optional">Optional</span>}
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
        className="ui-selc__trigger"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open && active >= 0 ? optionId(active) : undefined}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabel ? undefined : label != null ? `${labelId} ${triggerId}` : undefined}
        aria-describedby={message ? messageId : undefined}
        aria-invalid={invalid || undefined}
        aria-required={required || undefined}
        disabled={disabled}
        onClick={() => (open ? hide() : show())}
        onKeyDown={onKeyDown}
      >
        {chosen?.icon && (
          <span className="ui-selc__icon" aria-hidden="true">
            {chosen.icon}
          </span>
        )}
        <span className="ui-selc__value" data-empty={chosen ? undefined : ""} title={chosen?.label}>
          {chosen ? chosen.label : placeholder}
        </span>
        <span className="ui-selc__chevron" aria-hidden="true">
          <ChevronIcon />
        </span>
      </button>
      {name && <input type="hidden" name={name} value={value ?? ""} />}
      {open && (
        <div
          ref={list}
          id={listId}
          className="ui-selc__list"
          role="listbox"
          aria-labelledby={label != null ? labelId : undefined}
          aria-label={label == null ? ariaLabel ?? placeholder : undefined}
          popover="manual"
          data-up={place?.up || undefined}
          style={place ? { top: place.up ? undefined : place.top, bottom: place.up ? window.innerHeight - place.top : undefined, left: place.left, width: place.width, maxHeight: place.maxHeight } : undefined}
          onPointerLeave={() => setActive(-1)}
        >
          {glow && <span className="ui-selc__glow" aria-hidden="true" style={{ transform: `translateY(${glow.top}px)`, height: glow.height }} />}
          {options.map((o, i) => (
            <div
              key={o.value}
              id={optionId(i)}
              className="ui-selc__option"
              role="option"
              data-index={i}
              aria-selected={o.value === value}
              aria-disabled={o.disabled || undefined}
              data-active={i === active || undefined}
              onPointerMove={() => o.disabled || i === active || setActive(i)}
              onPointerDown={(e) => e.preventDefault()}
              onClick={() => pick(i)}
            >
              {o.icon && (
                <span className="ui-selc__icon" aria-hidden="true">
                  {o.icon}
                </span>
              )}
              <span className="ui-selc__text">
                <span className="ui-selc__option-label">{o.label}</span>
                {o.description && <span className="ui-selc__option-hint">{o.description}</span>}
              </span>
              <span className="ui-selc__check" aria-hidden="true">
                {o.value === value && <CheckIcon />}
              </span>
            </div>
          ))}
        </div>
      )}
      {message && (
        <p className="ui-selc__message" id={messageId} key={shows(error) ? "error" : "hint"} aria-live={shows(error) ? "polite" : undefined}>
          {message}
        </p>
      )}
    </div>
  );
}

const SIZES = ["sm", "md", "lg"];
/** Text or an element – not true, false, null or an empty string */
const shows = (v: ReactNode) => v != null && typeof v !== "boolean" && v !== "";

/* Icons: Hugeicons Free (MIT) */
function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m7 10 5 5 5-5" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path className="ui-selc__tick" d="M5 12.5 9.5 17 19 7" pathLength={1} />
    </svg>
  );
}

const css = /* css */ `
/* Colors and motion as variables – override them on .ui-selc (see Theming in the docs) */
.ui-selc {
  --ui-selc-title: var(--aui-ink, rgba(0, 0, 0, 0.88));
  --ui-selc-ink: var(--aui-ink, rgba(0, 0, 0, 0.88));
  --ui-selc-subtle: var(--aui-muted, rgba(0, 0, 0, 0.45));
  --ui-selc-faint: var(--aui-placeholder, rgba(0, 0, 0, 0.3));
  --ui-selc-icon: var(--aui-muted, rgba(0, 0, 0, 0.447));
  --ui-selc-surface: var(--aui-surface, #ffffff);
  --ui-selc-menu: var(--aui-surface, #ffffff);
  --ui-selc-glow: rgba(0, 0, 0, 0.045);
  --ui-selc-readonly: rgba(0, 0, 0, 0.02);
  --ui-selc-shadow: 0 0 0 0.5px var(--aui-border, rgba(0, 0, 0, 0.08)), 0 1px 1px -1px rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --ui-selc-shadow-hover: 0 0 0 0.5px var(--aui-border-strong, rgba(0, 0, 0, 0.13)), 0 1px 1px -1px rgba(0, 0, 0, 0.12), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  --ui-selc-shadow-open: 0 0 0 1px var(--aui-border-strong, rgba(0, 0, 0, 0.28)), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  --ui-selc-shadow-menu: 0 0 0 0.5px rgba(0, 0, 0, 0.08), 0 8px 24px -6px rgba(0, 0, 0, 0.14), 0 2px 6px -2px rgba(0, 0, 0, 0.06);
  --ui-selc-danger: var(--aui-danger, #c4320a);
  --ui-selc-danger-edge: color-mix(in srgb, var(--aui-red, #f04438) 55%, transparent);
  --ui-selc-focus: var(--aui-focus, rgba(0, 96, 226, 0.7));
  --ui-selc-ease: cubic-bezier(0.22, 1, 0.36, 1);

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
  color: var(--ui-selc-ink);
  -webkit-font-smoothing: antialiased;
}
.ui-selc[data-size="sm"] { --h: 28px; --px: 8px; --radius: calc(var(--aui-radius, 7px) - 1px); }
.ui-selc[data-size="lg"] { --h: 36px; --px: 12px; --fs: 14px; --radius: calc(var(--aui-radius, 7px) + 1px); }
/* Touch screens: a comfortable tap height and 16px text */
@media (pointer: coarse) {
  .ui-selc { --fs: 16px; }
  .ui-selc[data-size="sm"] { --h: 34px; }
  .ui-selc[data-size="md"] { --h: 38px; }
  .ui-selc[data-size="lg"] { --h: 40px; }
}

.ui-selc__head { display: flex; align-items: baseline; gap: 6px; min-width: 0; }
.ui-selc__label { min-width: 0; font-weight: 500; color: var(--ui-selc-title); overflow-wrap: anywhere; cursor: default; }
.ui-selc__optional { flex: none; font-size: 12px; line-height: 16px; color: var(--ui-selc-subtle); }

/* The field: the Text Field's look – white, a hairline edge that firms up on hover and while open */
.ui-selc__trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  box-sizing: border-box;
  width: 100%;
  height: var(--h);
  min-width: 0;
  margin: 0;
  padding: 0 calc(var(--px) - 2px) 0 var(--px);
  border: 0;
  border-radius: var(--radius);
  background: var(--ui-selc-surface);
  box-shadow: var(--ui-selc-shadow);
  font: inherit;
  font-size: var(--fs);
  color: var(--ui-selc-ink);
  text-align: start;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: box-shadow 140ms ease, background-color 140ms ease;
}
.ui-selc__trigger:hover { box-shadow: var(--ui-selc-shadow-hover); }
.ui-selc[data-open] .ui-selc__trigger { box-shadow: var(--ui-selc-shadow-open); }
.ui-selc__trigger:focus-visible { outline: 2px solid var(--ui-selc-focus); outline-offset: 2px; }
.ui-selc[data-invalid] .ui-selc__trigger { box-shadow: 0 0 0 1px var(--ui-selc-danger-edge), 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
.ui-selc__trigger:disabled { background: var(--ui-selc-readonly); box-shadow: 0 0 0 0.5px rgba(0, 0, 0, 0.06); cursor: not-allowed; }
.ui-selc[data-disabled] { opacity: 0.55; }

.ui-selc__value { flex: 1; min-width: 0; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.ui-selc__value[data-empty] { color: var(--ui-selc-faint); }
.ui-selc__icon { display: grid; flex: none; place-items: center; width: 16px; height: 16px; color: var(--ui-selc-icon); }
.ui-selc__icon > svg, .ui-selc__icon > img { display: block; width: 16px; height: 16px; }
.ui-selc__chevron { display: grid; flex: none; place-items: center; width: 16px; height: 16px; color: var(--ui-selc-icon); transition: transform 240ms var(--ui-selc-ease); }
.ui-selc[data-open] .ui-selc__chevron { transform: rotate(180deg); }

/* The list: a white card in the top layer, at the field's edge */
.ui-selc__list {
  position: fixed;
  inset: auto;
  z-index: 1000;
  box-sizing: border-box;
  margin: 0;
  padding: 4px;
  border: 0;
  border-radius: 10px;
  background: var(--ui-selc-menu);
  box-shadow: var(--ui-selc-shadow-menu);
  color: var(--ui-selc-ink);
  font: inherit;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: thin;
  transform-origin: top center;
  animation: ui-selc-in 200ms var(--ui-selc-ease) both;
}
.ui-selc__list[data-up] { transform-origin: bottom center; }
.ui-selc__list::backdrop { display: none; }

/* One soft highlight that glides between the rows */
.ui-selc__glow {
  position: absolute;
  top: 0;
  left: 4px;
  right: 4px;
  border-radius: 6px;
  background: var(--ui-selc-glow);
  pointer-events: none;
  transition: transform 180ms var(--ui-selc-ease), height 180ms var(--ui-selc-ease);
}

.ui-selc__option {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 32px;
  padding: 6px 8px;
  box-sizing: border-box;
  border-radius: 6px;
  font-size: 13px;
  line-height: 20px;
  cursor: pointer;
  user-select: none;
}
.ui-selc__option[aria-disabled] { color: var(--ui-selc-faint); cursor: default; }
.ui-selc__option[aria-disabled] .ui-selc__icon { opacity: 0.5; }
.ui-selc__text { display: grid; flex: 1; min-width: 0; }
.ui-selc__option-label { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.ui-selc__option[aria-selected="true"] .ui-selc__option-label { font-weight: 500; }
.ui-selc__option-hint { overflow: hidden; font-size: 12px; line-height: 16px; white-space: nowrap; text-overflow: ellipsis; color: var(--ui-selc-subtle); }
.ui-selc__check { display: grid; flex: none; place-items: center; width: 16px; height: 16px; color: var(--ui-selc-ink); }
.ui-selc__tick { stroke-dasharray: 1; animation: ui-selc-draw 280ms 40ms var(--ui-selc-ease) both; }
@media (pointer: coarse) {
  .ui-selc__option { min-height: 40px; font-size: 15px; }
}

.ui-selc__message { margin: 0; font-size: 12px; line-height: 16px; color: var(--ui-selc-subtle); overflow-wrap: anywhere; animation: ui-selc-message 260ms var(--ui-selc-ease); }
.ui-selc[data-invalid] .ui-selc__message { color: var(--ui-selc-danger); }

@keyframes ui-selc-in {
  from { opacity: 0; transform: translateY(-4px) scale(0.98); }
}
.ui-selc__list[data-up] { animation-name: ui-selc-in-up; }
@keyframes ui-selc-in-up {
  from { opacity: 0; transform: translateY(4px) scale(0.98); }
}
@keyframes ui-selc-draw {
  from { stroke-dashoffset: 1; }
  to { stroke-dashoffset: 0; }
}
@keyframes ui-selc-message {
  from { opacity: 0; transform: translateY(-3px); filter: blur(2px); }
}

@media (prefers-reduced-motion: reduce) {
  .ui-selc *, .ui-selc__list { animation-duration: 1ms !important; }
  .ui-selc__glow, .ui-selc__chevron, .ui-selc__trigger { transition-duration: 1ms; }
}

/* Dark mode: follows a .dark class or data-theme="dark" on any ancestor, e.g. <html> */
:where(.dark, [data-theme="dark"]) .ui-selc {
  --ui-selc-title: var(--aui-ink, rgba(255, 255, 255, 0.92));
  --ui-selc-ink: var(--aui-ink, rgba(255, 255, 255, 0.9));
  --ui-selc-subtle: var(--aui-muted, rgba(255, 255, 255, 0.46));
  --ui-selc-faint: var(--aui-placeholder, rgba(255, 255, 255, 0.3));
  --ui-selc-icon: var(--aui-muted, rgba(255, 255, 255, 0.5));
  --ui-selc-surface: var(--aui-surface, #1c1c1e);
  --ui-selc-menu: var(--aui-surface, #1f1f22);
  --ui-selc-glow: rgba(255, 255, 255, 0.07);
  --ui-selc-readonly: rgba(255, 255, 255, 0.03);
  --ui-selc-shadow: 0 0 0 0.5px var(--aui-border, rgba(255, 255, 255, 0.14)), 0 1px 2px 0 rgba(0, 0, 0, 0.4);
  --ui-selc-shadow-hover: 0 0 0 0.5px var(--aui-border-strong, rgba(255, 255, 255, 0.2)), 0 1px 2px 0 rgba(0, 0, 0, 0.4);
  --ui-selc-shadow-open: 0 0 0 1px var(--aui-border-strong, rgba(255, 255, 255, 0.3)), 0 1px 2px 0 rgba(0, 0, 0, 0.4);
  --ui-selc-shadow-menu: 0 0 0 0.5px rgba(255, 255, 255, 0.12), 0 12px 32px -8px rgba(0, 0, 0, 0.6);
  --ui-selc-danger: var(--aui-danger, #ff8a7a);
  --ui-selc-danger-edge: color-mix(in srgb, var(--aui-red, #ff6b5f) 50%, transparent);
  --ui-selc-focus: var(--aui-focus, rgba(77, 141, 255, 0.8));
}
`;
