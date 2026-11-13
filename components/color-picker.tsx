"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";

/*
 * Color Picker – a single self-contained file.
 * A swatch button that opens a small card: a saturation / brightness area, a hue slider, an optional opacity slider,
 * a hex field (it understands #rgb, #rrggbb, #rrggbbaa and rgb()) and preset swatches. Every area and slider works
 * by pointer (dragged with capture, so it keeps following outside the card) and by keyboard (arrows, Shift for
 * bigger steps). The value is a hex string – "#0190fe", or "#0190fecc" with opacity below 100%.
 * ColorPickerPanel is the same card without the button, for a form or a settings page.
 * The styles are injected below, so no extra files are needed.
 */

/** A preset: a color, or a color with a name ("Blue") that is read out and shown as its tooltip */
export type ColorPreset = string | { value: string; label: string };

type ValueProps = {
  /** The color as hex – "#0190fe", or "#0190fecc" with opacity. Also takes #rgb and rgb() from outside */
  value?: string;
  /** The starting color when value isn't controlled */
  defaultValue?: string;
  /** Called on every change – while dragging too – with a lowercase hex string */
  onValueChange?: (value: string) => void;
  /** Shows the opacity slider; below 100% the value gets two more digits (#rrggbbaa) */
  alpha?: boolean;
  /** Swatches under the sliders – one press picks one */
  presets?: ColorPreset[];
};

export type ColorPickerPanelProps = Omit<ComponentPropsWithRef<"div">, "defaultValue" | "onChange" | "children"> & ValueProps;

export type ColorPickerProps = Omit<ComponentPropsWithRef<"button">, "value" | "defaultValue" | "onChange" | "children" | "name"> &
  ValueProps & {
    /** Whether the card is open – leave it out to let the picker handle it */
    open?: boolean;
    /** Open from the start, without taking the focus */
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    /** What the color is for – names the button and the card for screen readers */
    label?: string;
    /** Shows the hex next to the swatch; off: only the swatch */
    showValue?: boolean;
    /** sm 24 · md 28 high */
    size?: "sm" | "md";
    /** Where the card opens; it flips when there is no room */
    side?: "bottom" | "top";
    /** Which edges line up with the button */
    align?: "start" | "end";
    /** Sends the hex with a form */
    name?: string;
  };

const FALLBACK = "#0190fe";

/* ---------- The button and its card ---------- */

export function ColorPicker({
  value: valueProp,
  defaultValue,
  onValueChange,
  alpha,
  presets,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  label = "Color",
  showValue = true,
  size = "md",
  side = "bottom",
  align = "start",
  name,
  className,
  disabled,
  ref,
  onClick,
  ...rest
}: ColorPickerProps) {
  const [value, setValue] = useControllable(valueProp, defaultValue ?? FALLBACK, onValueChange);
  const [open, setOpen] = useControllable(openProp, defaultOpen, onOpenChange);
  const uid = useId();
  const wrap = useRef<HTMLSpanElement>(null);
  const button = useRef<HTMLButtonElement | null>(null);
  const card = useRef<HTMLDivElement>(null);
  const setOpenRef = useRef(setOpen);
  setOpenRef.current = setOpen;
  // Open from the start (a demo, a restored view) leaves the focus where it is – only an opening moves it
  const wasClosed = useRef(!open);
  if (!open) wasClosed.current = true;

  const rgba = parse(value);
  const shown = rgba ? format(rgba, false).toUpperCase() : value;
  const opacity = rgba && alpha && rgba.a < 1 ? `${Math.round(rgba.a * 100)}%` : null;
  const inside = (n: Node | null) => !!n && (!!card.current?.contains(n) || !!wrap.current?.contains(n));

  // Into the top layer, under (or over) the button, before paint; it follows on scroll and resize
  useLayoutEffect(() => {
    const el = card.current;
    if (!open || !el) return;
    if ("showPopover" in el && !el.matches(":popover-open")) el.showPopover();
    const update = () => {
      if (button.current) place(el, button.current.getBoundingClientRect(), side, align);
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    const ro = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(update);
    ro?.observe(el);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
      ro?.disconnect();
      if ("hidePopover" in el && el.isConnected && el.matches(":popover-open")) el.hidePopover();
    };
  }, [open, side, align]);

  // Opened by a press or a key: the focus moves onto the area, so the arrows work right away
  useEffect(() => {
    const el = card.current;
    if (!open || !el) return;
    if (wasClosed.current && !el.contains(document.activeElement)) el.querySelector<HTMLElement>("[role=slider]")?.focus({ preventScroll: true });
    wasClosed.current = false;
    const close = () => setOpenRef.current(false);
    let within = el.contains(document.activeElement);
    const into = () => (within = true);
    const away = (e: FocusEvent) => (within = !!e.relatedTarget && el.contains(e.relatedTarget as Node));
    el.addEventListener("focusin", into);
    el.addEventListener("focusout", away);
    const down = (e: PointerEvent) => {
      if (!inside(e.target as Node)) close();
    };
    // Caught first, so a page's own Escape (closing a dialog around it) doesn't fire as well
    const key = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || e.defaultPrevented) return;
      e.preventDefault();
      e.stopPropagation();
      const back = inside(document.activeElement);
      close();
      if (back) button.current?.focus({ preventScroll: true });
    };
    // Tabbing out of the button and the card closes it
    const out = (e: FocusEvent) => {
      const to = e.relatedTarget as Node | null;
      if (inside(e.target as Node) && to && !inside(to)) close();
    };
    document.addEventListener("pointerdown", down, true);
    window.addEventListener("keydown", key, true);
    document.addEventListener("focusout", out);
    return () => {
      document.removeEventListener("pointerdown", down, true);
      window.removeEventListener("keydown", key, true);
      document.removeEventListener("focusout", out);
      el.removeEventListener("focusin", into);
      el.removeEventListener("focusout", away);
      // Closed while the focus was inside: back to the button – unless something moved it on purpose
      const b = button.current;
      if (within)
        window.setTimeout(() => {
          const at = document.activeElement;
          if (b?.isConnected && (!at || at === document.body)) b.focus({ preventScroll: true });
        });
    };
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <span ref={wrap} className={["ui-clp", className].filter(Boolean).join(" ")} data-size={size === "sm" ? "sm" : "md"}>
      {/* React 19 hoists this into <head> once, no matter how many pickers render */}
      <style href="ui-color-picker" precedence="default">
        {css}
      </style>
      <button
        {...rest}
        ref={(el) => {
          button.current = el;
          if (typeof ref === "function") ref(el);
          else if (ref) ref.current = el;
        }}
        type="button"
        className="ui-clp__trigger"
        data-bare={!showValue || undefined}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? `${uid}-card` : undefined}
        onClick={(e) => {
          onClick?.(e);
          if (!e.defaultPrevented) setOpen(!open);
        }}
      >
        <span className="ui-clp__swatch" style={{ "--ui-clp-c": rgba ? paint(rgba) : value } as CSSProperties} aria-hidden="true" />
        <span className={showValue ? "ui-clp__value" : "ui-clp__sr"}>
          <span className="ui-clp__sr">{label}: </span>
          {shown}
          {opacity && <span className="ui-clp__alpha"> {opacity}</span>}
        </span>
      </button>
      {name && <input type="hidden" name={name} value={rgba ? format(rgba, !!alpha) : value} />}
      {open && (
        <div ref={card} id={`${uid}-card`} className="ui-clp__pop" role="dialog" aria-label={label} popover="manual" data-side={side} data-align={align}>
          <Panel value={value} onChange={setValue} alpha={alpha} presets={presets} />
        </div>
      )}
    </span>
  );
}

/* ---------- The card on its own ---------- */

export function ColorPickerPanel({ value: valueProp, defaultValue, onValueChange, alpha, presets, className, ...rest }: ColorPickerPanelProps) {
  const [value, setValue] = useControllable(valueProp, defaultValue ?? FALLBACK, onValueChange);
  return (
    <div {...rest} className={["ui-clp", "ui-clp--inline", className].filter(Boolean).join(" ")}>
      <style href="ui-color-picker" precedence="default">
        {css}
      </style>
      <Panel value={value} onChange={setValue} alpha={alpha} presets={presets} />
    </div>
  );
}

/* ---------- The area, the sliders, the hex field and the presets ---------- */

function Panel({ value, onChange, alpha, presets }: { value: string; onChange: (v: string) => void; alpha?: boolean; presets?: ColorPreset[] }) {
  const [c, setC] = useState<Hsva>(() => toHsva(parse(value) ?? parse(FALLBACK)!, 0, alpha));
  const [seen, setSeen] = useState(value);
  const [draft, setDraft] = useState<string | null>(null);
  const area = useRef<HTMLDivElement>(null);
  const hue = useRef<HTMLDivElement>(null);
  const opa = useRef<HTMLDivElement>(null);

  // A new value from outside: follow it, but keep the hue when the color is a gray (it has none of its own)
  if (value !== seen) {
    setSeen(value);
    const p = parse(value);
    if (p && format(p, !!alpha) !== format(toRgba(c), !!alpha)) setC(toHsva(p, c.h, alpha, c.s));
  }

  const rgb = toRgba(c);
  const hex = format(rgb, !!alpha);
  const set = (next: Hsva) => {
    setC(next);
    const out = format(toRgba(next), !!alpha);
    if (out !== value) onChange(out);
  };

  const S = Math.round(c.s * 100);
  const V = Math.round(c.v * 100);
  const H = Math.round(c.h);
  const A = Math.round(c.a * 100);

  const list = (presets ?? []).map((p) => (typeof p === "string" ? { value: p, label: p.toUpperCase() } : p));
  const picked = list.findIndex((p) => {
    const q = parse(p.value);
    return !!q && format(q, !!alpha) === hex;
  });

  const [bad, setBad] = useState(false);
  const commit = (t: string) => {
    const p = parse(t);
    if (p) set(toHsva(alpha ? p : { ...p, a: 1 }, c.h, alpha, c.s));
    return !!p;
  };

  return (
    <div className="ui-clp__panel" style={{ "--ui-clp-c": paint(rgb), "--ui-clp-solid": paint({ ...rgb, a: 1 }), "--ui-clp-hue": `hsl(${H} 100% 50%)` } as CSSProperties}>
      <div
        ref={area}
        className="ui-clp__area"
        role="slider"
        tabIndex={0}
        dir="ltr"
        aria-label="Saturation and brightness"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={S}
        aria-valuetext={`Saturation ${S}%, brightness ${V}%`}
        {...drag(area, (x, y) => set({ ...c, s: x, v: 1 - y }), true)}
        onKeyDown={(e) => {
          const step = e.shiftKey ? 10 : 1;
          const moves: Record<string, [number, number]> = {
            ArrowRight: [step, 0],
            ArrowLeft: [-step, 0],
            ArrowUp: [0, step],
            ArrowDown: [0, -step],
            PageUp: [0, 10],
            PageDown: [0, -10],
            Home: [-100, 0],
            End: [100, 0],
          };
          const m = moves[e.key];
          if (!m) return;
          e.preventDefault();
          set({ ...c, s: clamp(S + m[0], 0, 100) / 100, v: clamp(V + m[1], 0, 100) / 100 });
        }}
      >
        <span className="ui-clp__thumb" style={{ left: `${c.s * 100}%`, top: `${(1 - c.v) * 100}%` }} />
      </div>

      <div
        ref={hue}
        className="ui-clp__slider ui-clp__slider--hue"
        role="slider"
        tabIndex={0}
        dir="ltr"
        aria-label="Hue"
        aria-orientation="horizontal"
        aria-valuemin={0}
        aria-valuemax={360}
        aria-valuenow={H}
        aria-valuetext={`${H}°, ${hueName(H)}`}
        {...drag(hue, (x) => set({ ...c, h: x * 360 }))}
        onKeyDown={(e) => {
          const v = keyStep(e, H, 360);
          if (v != null) set({ ...c, h: v });
        }}
      >
        <span className="ui-clp__knob" style={{ "--p": c.h / 360, background: `hsl(${H} 100% 50%)` } as CSSProperties} />
      </div>

      {alpha && (
        <div
          ref={opa}
          className="ui-clp__slider ui-clp__slider--alpha"
          role="slider"
          tabIndex={0}
          dir="ltr"
          aria-label="Opacity"
          aria-orientation="horizontal"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={A}
          aria-valuetext={`${A}%`}
          {...drag(opa, (x) => set({ ...c, a: Math.round(x * 100) / 100 }))}
          onKeyDown={(e) => {
            const v = keyStep(e, A, 100);
            if (v != null) set({ ...c, a: v / 100 });
          }}
        >
          <span className="ui-clp__knob" style={{ "--p": c.a } as CSSProperties} />
        </div>
      )}

      <div className="ui-clp__fields">
        <span className="ui-clp__preview" aria-hidden="true" />
        <label className="ui-clp__hex" data-invalid={bad || undefined}>
          <span className="ui-clp__hash" aria-hidden="true">
            #
          </span>
          <input
            className="ui-clp__input"
            value={draft ?? hex.slice(1).toUpperCase()}
            aria-label="Hex color"
            aria-invalid={bad || undefined}
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
            onChange={(e) => {
              const t = e.target.value;
              setDraft(t);
              setBad(false);
              // Six or eight digits, or a closed rgb(…), apply as you type; #rgb waits for Enter, so it doesn't flash
              if (COMPLETE.test(t.trim())) commit(t);
            }}
            onBlur={() => {
              if (draft != null) commit(draft);
              setDraft(null);
              setBad(false);
            }}
            onKeyDown={(e) => {
              if (e.key !== "Enter" || draft == null) return;
              e.preventDefault();
              if (commit(draft)) setDraft(null);
              else setBad(true);
            }}
          />
        </label>
        {alpha && <span className="ui-clp__pct">{A}%</span>}
      </div>

      {list.length > 0 && (
        <div className="ui-clp__presets" role="radiogroup" aria-label="Presets">
          {list.map((p, i) => (
            <button
              key={`${p.value}-${i}`}
              type="button"
              role="radio"
              className="ui-clp__preset"
              aria-checked={i === picked}
              aria-label={p.label}
              title={p.label}
              tabIndex={i === (picked >= 0 ? picked : 0) ? 0 : -1}
              style={{ "--ui-clp-p": p.value } as CSSProperties}
              onClick={() => {
                const q = parse(p.value);
                if (q) set(toHsva(alpha ? q : { ...q, a: 1 }, c.h, alpha, c.s));
              }}
              onKeyDown={(e) => {
                const back = getComputedStyle(e.currentTarget).direction === "rtl";
                const d = { ArrowRight: back ? -1 : 1, ArrowDown: 1, ArrowLeft: back ? 1 : -1, ArrowUp: -1 }[e.key];
                const to = e.key === "Home" ? 0 : e.key === "End" ? list.length - 1 : d != null ? (i + d + list.length) % list.length : null;
                if (to == null) return;
                e.preventDefault();
                const next = e.currentTarget.parentElement?.children[to] as HTMLButtonElement | undefined;
                next?.focus();
                next?.click();
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Pointer and keys ---------- */

/** Press and drag on an area or a slider: the pointer is captured, so dragging past the card keeps working */
function drag(ref: { current: HTMLElement | null }, to: (x: number, y: number) => void, area = false) {
  const at = (e: ReactPointerEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    // A slider's knob stops half its track's height from each end; the area's thumb reaches the corners
    const inset = area ? 0 : r.height / 2;
    const x = clamp((e.clientX - r.left - inset) / Math.max(1, r.width - inset * 2), 0, 1);
    const y = clamp((e.clientY - r.top) / Math.max(1, r.height), 0, 1);
    to(x, y);
  };
  return {
    onPointerDown: (e: ReactPointerEvent) => {
      if (e.button !== 0) return;
      ref.current?.setPointerCapture(e.pointerId);
      ref.current?.focus({ preventScroll: true });
      e.preventDefault();
      at(e);
    },
    onPointerMove: (e: ReactPointerEvent) => {
      if (ref.current?.hasPointerCapture(e.pointerId)) at(e);
    },
    onPointerUp: (e: ReactPointerEvent) => {
      if (ref.current?.hasPointerCapture(e.pointerId)) ref.current.releasePointerCapture(e.pointerId);
    },
  };
}

/** Arrows ±1, with Shift ±10, Page Up / Down ±10, Home and End – the new value, or null for any other key */
function keyStep(e: ReactKeyboardEvent, now: number, max: number) {
  const step = e.shiftKey ? 10 : 1;
  const next: Record<string, number> = {
    ArrowRight: now + step,
    ArrowUp: now + step,
    ArrowLeft: now - step,
    ArrowDown: now - step,
    PageUp: now + 10,
    PageDown: now - 10,
    Home: 0,
    End: max,
  };
  if (!(e.key in next)) return null;
  e.preventDefault();
  return clamp(next[e.key], 0, max);
}

function useControllable<T>(value: T | undefined, initial: T, onChange?: (v: T) => void) {
  const [own, setOwn] = useState(initial);
  const controlled = value !== undefined;
  const set = (v: T) => {
    if (!controlled) setOwn(v);
    onChange?.(v);
  };
  return [controlled ? value : own, set] as const;
}

/* ---------- Placing the card ---------- */

/** Under the button, or over it when there is more room there; the edge it lines up with switches when it would stick out */
function place(el: HTMLElement, r: DOMRect, side: "top" | "bottom", align: "start" | "end") {
  const pad = 8;
  const gap = 6;
  const vw = document.documentElement.clientWidth || window.innerWidth;
  const vh = window.innerHeight;
  el.style.maxHeight = "";
  const w = el.offsetWidth;
  const h = el.offsetHeight;
  const room = { bottom: vh - r.bottom - gap - pad, top: r.top - gap - pad };
  let s = side;
  if (room[s] < h && room[s === "top" ? "bottom" : "top"] > room[s]) s = s === "top" ? "bottom" : "top";
  const fit = Math.min(h, Math.max(160, room[s]));
  const top = s === "bottom" ? r.bottom + gap : r.top - gap - fit;
  let a = align;
  let left = a === "start" ? r.left : r.right - w;
  if (a === "start" && left + w > vw - pad && r.right - w >= pad) (a = "end"), (left = r.right - w);
  else if (a === "end" && left < pad && r.left + w <= vw - pad) (a = "start"), (left = r.left);
  left = Math.min(Math.max(pad, left), vw - pad - w);
  if (h > fit) el.style.maxHeight = `${fit}px`;
  el.style.top = `${Math.round(top)}px`;
  el.style.left = `${Math.round(left)}px`;
  el.dataset.side = s;
  el.dataset.align = a;
}

/* ---------- Color math ---------- */

type Rgba = { r: number; g: number; b: number; a: number };
type Hsva = { h: number; s: number; v: number; a: number };

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const hex2 = (n: number) => Math.round(clamp(n, 0, 255)).toString(16).padStart(2, "0");
const COMPLETE = /^(#?([0-9a-f]{6}|[0-9a-f]{8})|rgba?\(.*\))$/i;
const NUM = /^-?(\d+\.?\d*|\.\d+)%?$/;

/** "#0190fe", "0190FE", "#09f", "#0190fecc", "rgb(1, 144, 254)", "rgb(1 144 254 / 80%)", "rgba(1,144,254,.8)" – or null */
function parse(input: string): Rgba | null {
  const s = String(input ?? "").trim().toLowerCase();
  const h = /^#?([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/.exec(s)?.[1];
  if (h) {
    const full = h.length <= 4 ? [...h].map((ch) => ch + ch).join("") : h;
    const n = (i: number) => parseInt(full.slice(i, i + 2), 16);
    return { r: n(0), g: n(2), b: n(4), a: full.length === 8 ? n(6) / 255 : 1 };
  }
  const body = /^rgba?\(([^)]*)\)$/.exec(s)?.[1];
  if (body == null) return null;
  const parts = body.trim().split(/\s*[,/]\s*|\s+/).filter(Boolean);
  if ((parts.length !== 3 && parts.length !== 4) || !parts.every((p) => NUM.test(p))) return null;
  const ch = (p: string) => clamp(Math.round(p.endsWith("%") ? parseFloat(p) * 2.55 : parseFloat(p)), 0, 255);
  const a = parts[3] == null ? 1 : clamp(parts[3].endsWith("%") ? parseFloat(parts[3]) / 100 : parseFloat(parts[3]), 0, 1);
  return { r: ch(parts[0]), g: ch(parts[1]), b: ch(parts[2]), a };
}

/** Lowercase #rrggbb – with alpha on and below 100%, #rrggbbaa */
const format = (c: Rgba, withAlpha: boolean) => `#${hex2(c.r)}${hex2(c.g)}${hex2(c.b)}${withAlpha && c.a < 1 ? hex2(c.a * 255) : ""}`;
const paint = (c: Rgba) => `rgb(${Math.round(c.r)} ${Math.round(c.g)} ${Math.round(c.b)} / ${c.a})`;

function toRgba({ h, s, v, a }: Hsva): Rgba {
  const f = (n: number) => {
    const k = (n + h / 60) % 6;
    return Math.round((v - v * s * Math.max(0, Math.min(k, 4 - k, 1))) * 255);
  };
  return { r: f(5), g: f(3), b: f(1), a };
}

/** Grays have no hue (and black no saturation) – those keep what the picker had, so the thumbs don't jump */
function toHsva({ r, g, b, a }: Rgba, keepH: number, alpha?: boolean, keepS = 0): Hsva {
  const R = r / 255;
  const G = g / 255;
  const B = b / 255;
  const max = Math.max(R, G, B);
  const d = max - Math.min(R, G, B);
  let h = keepH;
  if (d > 0) {
    h = max === R ? ((G - B) / d) % 6 : max === G ? (B - R) / d + 2 : (R - G) / d + 4;
    h = (h * 60 + 360) % 360;
  }
  return { h, s: max === 0 ? keepS : d / max, v: max, a: alpha ? a : 1 };
}

const hueName = (h: number) =>
  h < 15 ? "red" : h < 45 ? "orange" : h < 70 ? "yellow" : h < 165 ? "green" : h < 195 ? "cyan" : h < 255 ? "blue" : h < 290 ? "purple" : h < 335 ? "pink" : "red";

/* ---------- Styles ---------- */

const css = /* css */ `
/* Colors and motion as variables – override them on .ui-clp (see Theming in the docs) */
.ui-clp {
  --ui-clp-ink: var(--aui-ink, #171717);
  --ui-clp-strong: var(--aui-ink, #171717);
  --ui-clp-muted: var(--aui-muted, #8f8f8f);
  --ui-clp-surface: var(--aui-surface, #ffffff);
  --ui-clp-overlay: var(--aui-overlay, var(--aui-surface, #ffffff));
  --ui-clp-hover: rgba(0, 0, 0, 0.04);
  --ui-clp-hairline: rgba(0, 0, 0, 0.08);
  --ui-clp-check: #e6e6e6;
  --ui-clp-shadow: 0 0 0 1px var(--aui-border, #e6e6e8), 0 1px 2px rgba(0, 0, 0, 0.04);
  --ui-clp-shadow-hover: 0 0 0 1px var(--aui-border-strong, #d4d4d8), 0 1px 2px rgba(0, 0, 0, 0.05);
  --ui-clp-edge-focus: 0 0 0 1px var(--aui-border-strong, #b4b4bb), 0 1px 2px rgba(0, 0, 0, 0.05);
  --ui-clp-danger-edge: #f04438;
  --ui-clp-pop-shadow: var(--aui-shadow-popover, 0 0 0 1px rgba(0, 0, 0, 0.06), 0 18px 40px -12px rgba(0, 0, 0, 0.18), 0 4px 12px -4px rgba(0, 0, 0, 0.06));
  --ui-clp-focus: var(--aui-focus, rgba(0, 96, 226, 0.7));
  --ui-clp-ease: var(--aui-ease, cubic-bezier(0.22, 1, 0.36, 1));
  --ui-clp-mono: ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, monospace;

  --h: 32px;
  --radius: var(--aui-radius, 9px);

  position: relative;
  display: inline-flex;
  min-width: 0;
  vertical-align: middle;
  font-family: var(--aui-font, "Inter", "InterVariable", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif);
  font-size: 13.5px;
  line-height: 20px;
  color: var(--ui-clp-ink);
  -webkit-font-smoothing: antialiased;
}
.ui-clp[data-size="sm"] { --h: 28px; --radius: calc(var(--aui-radius, 9px) - 1px); }
.ui-clp--inline { display: block; }
.ui-clp *, .ui-clp *::before, .ui-clp *::after { box-sizing: border-box; }
.ui-clp__sr { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }

/* The button: white with a 1px edge, the swatch and the hex in a fixed-width face, so it never jumps */
.ui-clp__trigger {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  height: var(--h);
  margin: 0;
  padding: 0 12px 0 8px;
  border: 0;
  border-radius: var(--radius);
  background: var(--ui-clp-surface);
  box-shadow: var(--ui-clp-shadow);
  font: inherit;
  color: var(--ui-clp-strong);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: box-shadow 140ms ease;
}
.ui-clp[data-size="sm"] .ui-clp__trigger { padding: 0 10px 0 6px; }
.ui-clp__trigger[data-bare] { justify-content: center; width: var(--h); padding: 0; }
.ui-clp__trigger:hover:not(:disabled), .ui-clp__trigger[aria-expanded="true"] { box-shadow: var(--ui-clp-shadow-hover); }
.ui-clp__trigger:disabled { opacity: 0.5; cursor: not-allowed; }
.ui-clp__trigger:focus-visible { outline: 2px solid var(--ui-clp-focus); outline-offset: 2px; }

/* A swatch over a checkerboard, so a see-through color reads as see-through */
.ui-clp__swatch, .ui-clp__preview {
  flex: none;
  background: linear-gradient(var(--ui-clp-c), var(--ui-clp-c)), repeating-conic-gradient(var(--ui-clp-check) 0 25%, #fff 0 50%) 0 0 / 8px 8px;
  box-shadow: inset 0 0 0 0.5px var(--ui-clp-hairline);
}
.ui-clp__swatch { width: 18px; height: 18px; border-radius: 6px; }
.ui-clp[data-size="sm"] .ui-clp__swatch { width: 16px; height: 16px; border-radius: 5px; }
.ui-clp__value { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-family: var(--ui-clp-mono); font-size: 12px; font-weight: 500; letter-spacing: 0; }
.ui-clp__alpha { color: var(--ui-clp-muted); }

/* The card in the top layer: a 1px edge and a deeper drop */
.ui-clp__pop {
  position: fixed;
  inset: auto;
  z-index: 1000;
  box-sizing: border-box;
  max-width: calc(100vw - 16px);
  max-height: calc(100vh - 16px);
  margin: 0;
  padding: 14px;
  border: 0;
  border-radius: calc(var(--aui-radius-lg, 10px) + 6px);
  background: var(--ui-clp-overlay);
  box-shadow: var(--ui-clp-pop-shadow);
  color: var(--ui-clp-ink);
  font: inherit;
  overflow: auto;
  overscroll-behavior: contain;
  transform-origin: top left;
  animation: ui-clp-in 220ms var(--ui-clp-ease) both;
}
.ui-clp__pop::backdrop { display: none; }
.ui-clp__pop[data-align="end"] { transform-origin: top right; }
.ui-clp__pop[data-side="top"] { transform-origin: bottom left; animation-name: ui-clp-in-up; }
.ui-clp__pop[data-side="top"][data-align="end"] { transform-origin: bottom right; }

.ui-clp__panel { display: grid; gap: 14px; width: 236px; max-width: 100%; }
.ui-clp--inline .ui-clp__panel { width: 100%; }

/* Saturation left to right, brightness bottom to top, over the hue */
.ui-clp__area {
  position: relative;
  height: 152px;
  border-radius: calc(var(--radius) + 1px);
  background: linear-gradient(to top, #000, rgba(0, 0, 0, 0)), linear-gradient(to right, #fff, rgba(255, 255, 255, 0)), var(--ui-clp-hue);
  box-shadow: inset 0 0 0 1px var(--ui-clp-hairline);
  cursor: crosshair;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
}
.ui-clp__thumb, .ui-clp__knob {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  box-shadow: 0 0 0 2px #fff, 0 0 0 2.5px rgba(0, 0, 0, 0.18), 0 1px 4px 1px rgba(0, 0, 0, 0.24);
}
.ui-clp__thumb { width: 12px; height: 12px; margin: -6px 0 0 -6px; background: var(--ui-clp-solid); }

/* The sliders: a 12px rail, the knob stops half its height from each end */
.ui-clp__slider { position: relative; height: 12px; border-radius: 999px; cursor: pointer; touch-action: none; user-select: none; -webkit-user-select: none; box-shadow: inset 0 0 0 1px var(--ui-clp-hairline); }
.ui-clp__slider--hue { background: linear-gradient(to right, #f00 0%, #ff0 16.67%, #0f0 33.33%, #0ff 50%, #00f 66.67%, #f0f 83.33%, #f00 100%); }
.ui-clp__slider--alpha { background: linear-gradient(to right, transparent, var(--ui-clp-solid)), repeating-conic-gradient(var(--ui-clp-check) 0 25%, #fff 0 50%) 0 0 / 8px 8px; }
.ui-clp__knob { top: 50%; left: calc(6px + (100% - 12px) * var(--p)); width: 16px; height: 16px; margin: -8px 0 0 -8px; background: transparent; }
.ui-clp__slider--alpha .ui-clp__knob { background: linear-gradient(var(--ui-clp-c), var(--ui-clp-c)), repeating-conic-gradient(var(--ui-clp-check) 0 25%, #fff 0 50%) 0 0 / 6px 6px; }
.ui-clp__area:focus-visible, .ui-clp__slider:focus-visible { outline: 2px solid var(--ui-clp-focus); outline-offset: 2px; }

/* The hex field: no ring, only its edge firms up */
.ui-clp__fields { display: flex; align-items: center; gap: 8px; min-width: 0; }
.ui-clp__preview { width: 32px; height: 32px; border-radius: var(--radius); }
.ui-clp__hex {
  display: flex;
  flex: 1 1 auto;
  align-items: center;
  gap: 2px;
  min-width: 0;
  height: 32px;
  padding: 0 10px;
  border-radius: var(--radius);
  background: var(--ui-clp-surface);
  box-shadow: var(--ui-clp-shadow);
  cursor: text;
  transition: box-shadow 140ms ease;
}
.ui-clp__hex:hover { box-shadow: var(--ui-clp-shadow-hover); }
.ui-clp__hex:focus-within { box-shadow: var(--ui-clp-edge-focus); }
.ui-clp__hex[data-invalid] { box-shadow: 0 0 0 1px var(--ui-clp-danger-edge); }
.ui-clp__hash { flex: none; font-family: var(--ui-clp-mono); font-size: 12px; color: var(--ui-clp-muted); }
.ui-clp__input {
  flex: 1 1 auto;
  width: 0;
  min-width: 0;
  height: 100%;
  margin: 0;
  padding: 0;
  border: 0;
  outline: 0;
  background: transparent;
  font-family: var(--ui-clp-mono);
  font-size: 12px;
  font-weight: 500;
  color: var(--ui-clp-strong);
}
.ui-clp__pct { flex: none; width: 36px; font-size: 12px; line-height: 16px; text-align: end; font-variant-numeric: tabular-nums; color: var(--ui-clp-muted); }

/* Presets: round swatches; the chosen one gets a ring in its own color */
.ui-clp__presets { display: flex; flex-wrap: wrap; gap: 8px; padding: 2px; }
.ui-clp__preset {
  flex: none;
  width: 22px;
  height: 22px;
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: linear-gradient(var(--ui-clp-p), var(--ui-clp-p)), repeating-conic-gradient(var(--ui-clp-check) 0 25%, #fff 0 50%) 0 0 / 8px 8px;
  box-shadow: inset 0 0 0 0.5px var(--ui-clp-hairline);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: transform 140ms var(--ui-clp-ease), box-shadow 140ms ease;
}
.ui-clp__preset:hover { transform: scale(1.1); }
.ui-clp__preset[aria-checked="true"] { box-shadow: inset 0 0 0 0.5px var(--ui-clp-hairline), 0 0 0 2px var(--ui-clp-overlay), 0 0 0 3.5px var(--ui-clp-p); }
.ui-clp__preset:focus-visible { outline: 2px solid var(--ui-clp-focus); outline-offset: 2px; }

@keyframes ui-clp-in { from { opacity: 0; transform: scale(0.96) translateY(-4px); } }
@keyframes ui-clp-in-up { from { opacity: 0; transform: scale(0.96) translateY(4px); } }

/* Touch screens: a bigger button, thumbs and swatches, and 16px in the field so iOS doesn't zoom in */
@media (pointer: coarse) {
  .ui-clp { --h: 40px; }
  .ui-clp[data-size="sm"] { --h: 36px; }
  .ui-clp__area { height: 176px; }
  .ui-clp__slider { height: 14px; }
  .ui-clp__knob { left: calc(7px + (100% - 14px) * var(--p)); width: 20px; height: 20px; margin: -10px 0 0 -10px; }
  .ui-clp__thumb { width: 16px; height: 16px; margin: -8px 0 0 -8px; }
  .ui-clp__panel { gap: 14px; }
  .ui-clp__hex, .ui-clp__preview { height: 40px; }
  .ui-clp__preview { width: 40px; }
  .ui-clp__input { font-size: 16px; }
  .ui-clp__presets { gap: 10px; }
  .ui-clp__preset { width: 28px; height: 28px; }
}

@media (prefers-reduced-motion: reduce) {
  .ui-clp__pop { animation-duration: 1ms; }
  .ui-clp__preset { transition: none; }
  .ui-clp__preset:hover { transform: none; }
}

/* Dark mode: follows a .dark class or data-theme="dark" on any ancestor, e.g. <html> */
:where(.dark, [data-theme="dark"]) .ui-clp {
  --ui-clp-ink: var(--aui-ink, #ededed);
  --ui-clp-strong: var(--aui-ink, #ededed);
  --ui-clp-muted: var(--aui-muted, #8b8b92);
  --ui-clp-surface: var(--aui-surface, #1c1c1e);
  --ui-clp-overlay: var(--aui-overlay, var(--aui-surface, #19191b));
  --ui-clp-hover: rgba(255, 255, 255, 0.06);
  --ui-clp-hairline: rgba(255, 255, 255, 0.1);
  --ui-clp-shadow: 0 0 0 1px var(--aui-border, #2a2a2e);
  --ui-clp-shadow-hover: 0 0 0 1px var(--aui-border-strong, #3a3a40);
  --ui-clp-edge-focus: 0 0 0 1px var(--aui-border-strong, #4a4a52);
  --ui-clp-danger-edge: rgba(255, 99, 105, 0.8);
  --ui-clp-pop-shadow: var(--aui-shadow-popover, 0 0 0 1px rgba(255, 255, 255, 0.06), 0 18px 40px -12px rgba(0, 0, 0, 0.6));
  --ui-clp-focus: var(--aui-focus, rgba(77, 141, 255, 0.8));
  color-scheme: dark;
}
`;
