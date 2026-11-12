"use client";

import {
  cloneElement,
  isValidElement,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent as ReactFocusEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
  type SyntheticEvent,
} from "react";

/*
 * Hover Card – a single self-contained file.
 * A preview of what a link or a name points to – an agent, a person, a file, a run – that shows when the pointer
 * rests on it and when the keyboard focuses it. It waits a moment before it opens, so passing over a list doesn't
 * flash cards, and stays open while the pointer travels into it (a grace area across the gap), so you can read it,
 * select text or press a link inside. Touch never opens it: a tap follows the link. It lives in the top layer, so no
 * card's overflow cuts it, and flips to stay on screen.
 * The styles are injected below, so no extra files are needed.
 */

export type HoverCardProps = {
  /** What the card shows – a name, a line, a few facts, a link to the full page */
  content: ReactNode;
  /** Exactly one element that takes a ref and focus – usually a link or a button with a name */
  children: ReactElement;
  /** Where it opens; it flips to the other side when there is no room */
  side?: "bottom" | "top" | "right" | "left";
  /** Which edges line up: start (left, or top beside it) · center · end – start and end follow the reading direction */
  align?: "start" | "center" | "end";
  /** Gap to the trigger in px */
  offset?: number;
  /** How long the pointer rests (or the keyboard focus stays) before it opens, in ms */
  openDelay?: number;
  /** How long it stays after the pointer leaves trigger and card, in ms */
  closeDelay?: number;
  /** The card's width – by default it fits its content, up to 320px */
  width?: number | string;
  /** Never opens */
  disabled?: boolean;
  /** Controls it from outside (with onOpenChange); leave it out and it opens on its own */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** A class for the card */
  className?: string;
};

/** Only one card at a time on the page */
const group: { current: { close: () => void } | null } = { current: null };

export function HoverCard({
  content,
  children,
  side = "bottom",
  align = "start",
  offset = 8,
  openDelay = 600,
  closeDelay = 300,
  width,
  disabled,
  open: openProp,
  onOpenChange,
  className,
}: HoverCardProps) {
  const trigger = useRef<HTMLElement | null>(null);
  const card = useRef<HTMLDivElement | null>(null);
  const timer = useRef(0);
  // On its way into the card: the corridor from where the pointer left the trigger to the card's far edges
  const corridor = useRef<{ x: number; y: number }[] | null>(null);
  // After a press or Escape it stays closed until the pointer leaves or the focus goes
  const blocked = useRef(false);
  const [shown, setShown] = useState(false);
  const empty = content == null || typeof content === "boolean" || content === "";
  const open = !disabled && !empty && (openProp ?? shown);
  const isOpen = useRef(open);
  isOpen.current = open;

  const change = useRef<(v: boolean) => void>(() => {});
  change.current = (v: boolean) => {
    window.clearTimeout(timer.current);
    corridor.current = null;
    if (openProp === undefined) setShown(v);
    if (v !== isOpen.current) onOpenChange?.(v);
  };
  const me = useRef({ close: () => change.current(false) });

  const show = () => {
    window.clearTimeout(timer.current);
    if (disabled || empty || blocked.current || isOpen.current) return;
    timer.current = window.setTimeout(() => change.current(true), Math.max(0, openDelay));
  };
  const hide = () => {
    window.clearTimeout(timer.current);
    if (!isOpen.current) return;
    timer.current = window.setTimeout(() => change.current(false), Math.max(0, closeDelay));
  };
  const stay = () => {
    window.clearTimeout(timer.current);
    corridor.current = null;
  };

  // One at a time: opening this one closes the other
  useEffect(() => {
    if (!open) return;
    const self = me.current;
    if (group.current && group.current !== self) group.current.close();
    group.current = self;
    return () => {
      if (group.current === self) group.current = null;
    };
  }, [open]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  // Into the top layer next to the trigger before paint; it follows on scroll and resize
  useLayoutEffect(() => {
    const el = card.current;
    if (!open || !el) return;
    showLayer(el);
    const update = () => trigger.current && place(el, trigger.current, side, align, offset);
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    const ro = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(update);
    ro?.observe(el);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
      ro?.disconnect();
      hideLayer(el);
    };
  }, [open, side, align, offset]);

  useEffect(() => {
    if (!open) return;
    // Escape closes it first – caught early, so a dialog around it stays open
    const key = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || e.defaultPrevented) return;
      e.preventDefault();
      e.stopPropagation();
      blocked.current = true;
      const back = card.current?.contains(document.activeElement);
      change.current(false);
      if (back) trigger.current?.focus({ preventScroll: true });
    };
    // The grace area: inside the corridor it stays; out of it (and off trigger and card) the close delay starts
    const move = (e: PointerEvent) => {
      const c = corridor.current;
      if (!c || e.pointerType === "touch") return;
      if (!inHull(c, e.clientX, e.clientY)) {
        corridor.current = null;
        hide();
      }
    };
    // A tap or press anywhere else closes it at once (on touch, nothing else would)
    const down = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!card.current?.contains(t) && !trigger.current?.contains(t)) change.current(false);
    };
    window.addEventListener("keydown", key, true);
    document.addEventListener("pointermove", move);
    document.addEventListener("pointerdown", down, true);
    return () => {
      window.removeEventListener("keydown", key, true);
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerdown", down, true);
    };
  }, [open]);

  if (!isValidElement(children)) return <>{children}</>;
  const own = children.props as Record<string, unknown> & { ref?: Ref<HTMLElement> };
  const call = (name: string, e: SyntheticEvent) => (own[name] as ((e: SyntheticEvent) => void) | undefined)?.(e);
  // The child's handler runs first; when it calls preventDefault, the card leaves the event alone
  const wrap =
    <E extends SyntheticEvent>(name: string, mine: (e: E) => void) =>
    (e: E) => {
      call(name, e);
      if (!e.defaultPrevented) mine(e);
    };

  /** Leaving trigger or card: toward the card the corridor keeps it open, anywhere else the close delay starts */
  const leave = (e: ReactPointerEvent, fromTrigger: boolean) => {
    blocked.current = false;
    if (e.pointerType === "touch") return;
    const r = card.current?.getBoundingClientRect();
    const to = e.relatedTarget as Node | null;
    if (to instanceof Node && (card.current?.contains(to) || trigger.current?.contains(to))) return stay();
    if (fromTrigger && isOpen.current && r) {
      corridor.current = hull([{ x: e.clientX, y: e.clientY }, { x: r.left, y: r.top }, { x: r.right, y: r.top }, { x: r.right, y: r.bottom }, { x: r.left, y: r.bottom }]);
      if (inHull(corridor.current, e.clientX, e.clientY)) return window.clearTimeout(timer.current);
    }
    corridor.current = null;
    if (isOpen.current) hide();
    else window.clearTimeout(timer.current);
  };

  const trig = cloneElement(children as ReactElement<Record<string, unknown>>, {
    ref: (el: HTMLElement | null) => {
      trigger.current = el;
      const r = own.ref;
      if (typeof r === "function") r(el);
      else if (r) (r as { current: HTMLElement | null }).current = el;
    },
    // Touch has no hover: a tap follows the link and never opens it
    onPointerEnter: wrap("onPointerEnter", (e: ReactPointerEvent) => {
      if (e.pointerType === "touch") return;
      if (isOpen.current) stay();
      else show();
    }),
    onPointerLeave: wrap("onPointerLeave", (e: ReactPointerEvent) => leave(e, true)),
    // A press means the link is followed or the button acts – the card gets out of the way
    onPointerDown: wrap("onPointerDown", () => {
      blocked.current = true;
      change.current(false);
    }),
    // Keyboard focus opens it after the same wait; a click's focus does not
    onFocus: wrap("onFocus", (e: ReactFocusEvent) => {
      let visible = true;
      try {
        visible = (e.currentTarget as HTMLElement).matches(":focus-visible");
      } catch {}
      if (visible) show();
    }),
    onBlur: wrap("onBlur", (e: ReactFocusEvent) => {
      blocked.current = false;
      // Tab goes on into the card (it follows the trigger) – it stays open for its links
      if (e.relatedTarget instanceof Node && card.current?.contains(e.relatedTarget)) return;
      if (isOpen.current) change.current(false);
      else window.clearTimeout(timer.current);
    }),
  });

  return (
    <>
      {/* React 19 hoists this into <head> once, no matter how many cards render */}
      <style href="ui-hover-card" precedence="default">
        {css}
      </style>
      {trig}
      {open && (
        <div
          ref={card}
          className={["ui-hvc", className].filter(Boolean).join(" ")}
          popover="manual"
          data-side={side}
          data-align={align}
          style={width != null ? ({ width, maxWidth: "calc(100vw - 16px)" } as CSSProperties) : undefined}
          onPointerEnter={(e) => e.pointerType !== "touch" && stay()}
          onPointerLeave={(e) => leave(e, false)}
          onBlur={(e) => {
            const to = e.relatedTarget;
            if (to instanceof Node && (card.current?.contains(to) || trigger.current?.contains(to))) return;
            change.current(false);
          }}
        >
          {content}
        </div>
      )}
    </>
  );
}

/* ---------- Helpers ---------- */

type Point = { x: number; y: number };

/** The convex hull of a few points (monotone chain) – the corridor from the exit point to the card */
function hull(points: Point[]) {
  const p = [...points].sort((a, b) => a.x - b.x || a.y - b.y);
  const cross = (o: Point, a: Point, b: Point) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const lower: Point[] = [];
  for (const q of p) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], q) <= 0) lower.pop();
    lower.push(q);
  }
  const upper: Point[] = [];
  for (const q of [...p].reverse()) {
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], q) <= 0) upper.pop();
    upper.push(q);
  }
  return lower.slice(0, -1).concat(upper.slice(0, -1));
}

/** Inside the convex polygon, with a few px to spare for a shaky hand */
function inHull(poly: Point[], x: number, y: number) {
  if (poly.length < 3) return false;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    // Counter-clockwise hull: a point to the right of an edge by more than the slack is outside
    if (((b.x - a.x) * (y - a.y) - (b.y - a.y) * (x - a.x)) / len < -4) return false;
  }
  return true;
}

/** The top layer, so no overflow cuts it and no z-index fights it */
function showLayer(el: HTMLElement) {
  if ("showPopover" in el && !el.matches(":popover-open")) el.showPopover();
}
function hideLayer(el: HTMLElement) {
  if ("hidePopover" in el && el.isConnected && el.matches(":popover-open")) el.hidePopover();
}

/**
 * Puts the fixed card next to the trigger: on the preferred side, or the other one when that has more room (beside it
 * with no room either way: under or above it); the edge it lines up with switches when it would stick out, and it is
 * pushed inside the window as a last resort. Too tall for the room it gets: it scrolls.
 */
function place(el: HTMLElement, trigger: HTMLElement, side: "top" | "bottom" | "left" | "right", align: "start" | "center" | "end", gap: number) {
  const pad = 8;
  const r = trigger.getBoundingClientRect();
  const vw = document.documentElement.clientWidth || window.innerWidth;
  const vh = window.innerHeight;
  el.style.maxHeight = "";
  const w = el.offsetWidth;
  const h = el.offsetHeight;
  const room = { bottom: vh - r.bottom - gap - pad, top: r.top - gap - pad, right: vw - r.right - gap - pad, left: r.left - gap - pad };
  const flip = { top: "bottom", bottom: "top", left: "right", right: "left" } as const;
  let s: keyof typeof room = side;
  if (room[s] < (s === "top" || s === "bottom" ? h : w) && room[flip[s]] > room[s]) s = flip[s];
  if ((s === "left" || s === "right") && room[s] < w) s = room.bottom >= room.top ? "bottom" : "top";
  // start and end follow the reading direction above and below
  const rtl = getComputedStyle(trigger).direction === "rtl";
  let a = (s === "top" || s === "bottom") && rtl && align !== "center" ? (align === "start" ? "end" : "start") : align;
  let top: number;
  let left: number;
  if (s === "top" || s === "bottom") {
    const fit = Math.min(h, Math.max(120, room[s]));
    top = s === "bottom" ? r.bottom + gap : r.top - gap - fit;
    left = a === "start" ? r.left : a === "end" ? r.right - w : r.left + r.width / 2 - w / 2;
    if (a === "start" && left + w > vw - pad && r.right - w >= pad) (a = "end"), (left = r.right - w);
    else if (a === "end" && left < pad && r.left + w <= vw - pad) (a = "start"), (left = r.left);
    left = Math.min(Math.max(pad, left), vw - pad - w);
    if (h > fit) el.style.maxHeight = `${fit}px`;
  } else {
    left = s === "right" ? r.right + gap : r.left - gap - w;
    top = a === "start" ? r.top : a === "end" ? r.bottom - h : r.top + r.height / 2 - h / 2;
    top = Math.min(Math.max(pad, top), Math.max(pad, vh - pad - h));
    if (h > vh - 2 * pad) el.style.maxHeight = `${vh - 2 * pad}px`;
  }
  el.style.top = `${Math.round(top)}px`;
  el.style.left = `${Math.round(left)}px`;
  el.dataset.side = s;
  el.dataset.align = a;
}

/* ---------- Styles ---------- */

const css = /* css */ `
/* Colors and motion as variables – override them on .ui-hvc (see Theming in the docs) */
.ui-hvc {
  --ui-hvc-surface: var(--aui-overlay, var(--aui-surface, #ffffff));
  --ui-hvc-ink: var(--aui-ink, #171717);
  --ui-hvc-shadow: var(--aui-shadow-popover, 0 0 0 1px rgba(0, 0, 0, 0.06), 0 18px 40px -12px rgba(0, 0, 0, 0.18), 0 4px 12px -4px rgba(0, 0, 0, 0.06));
  --ui-hvc-focus: var(--aui-focus, rgba(0, 96, 226, 0.7));
  --ui-hvc-ease: var(--aui-ease, cubic-bezier(0.22, 1, 0.36, 1));

  /* A white card in the top layer: a 1px edge and a deeper drop. It fits its content up to 320px; width lifts the cap */
  position: fixed;
  inset: auto;
  z-index: 1000;
  display: block;
  box-sizing: border-box;
  width: max-content;
  max-width: min(320px, calc(100vw - 16px));
  max-height: calc(100vh - 16px);
  margin: 0;
  padding: 16px;
  border: 0;
  border-radius: calc(var(--aui-radius-lg, 10px) + 6px);
  background: var(--ui-hvc-surface);
  box-shadow: var(--ui-hvc-shadow);
  color: var(--ui-hvc-ink);
  font-family: var(--aui-font, "Inter", "InterVariable", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif);
  font-size: 13.5px;
  line-height: 20px;
  font-weight: 400;
  text-align: start;
  overflow: auto;
  overflow-wrap: anywhere;
  overscroll-behavior: contain;
  -webkit-font-smoothing: antialiased;
  transform-origin: top left;
  animation: ui-hvc-in 200ms var(--ui-hvc-ease) both;
}
.ui-hvc::backdrop { display: none; }
.ui-hvc *, .ui-hvc *::before, .ui-hvc *::after { box-sizing: border-box; }
/* Links and buttons you put inside get the library's ring */
.ui-hvc :is(a, button, [tabindex]):focus-visible { outline: 2px solid var(--ui-hvc-focus); outline-offset: 2px; }

/* It grows out of the side and edge it is attached to */
.ui-hvc[data-align="end"] { transform-origin: top right; }
.ui-hvc[data-align="center"] { transform-origin: top center; }
.ui-hvc[data-side="top"] { transform-origin: bottom left; animation-name: ui-hvc-in-up; }
.ui-hvc[data-side="top"][data-align="end"] { transform-origin: bottom right; }
.ui-hvc[data-side="top"][data-align="center"] { transform-origin: bottom center; }
.ui-hvc[data-side="right"] { transform-origin: top left; animation-name: ui-hvc-in-right; }
.ui-hvc[data-side="right"][data-align="end"] { transform-origin: bottom left; }
.ui-hvc[data-side="right"][data-align="center"] { transform-origin: center left; }
.ui-hvc[data-side="left"] { transform-origin: top right; animation-name: ui-hvc-in-left; }
.ui-hvc[data-side="left"][data-align="end"] { transform-origin: bottom right; }
.ui-hvc[data-side="left"][data-align="center"] { transform-origin: center right; }

@keyframes ui-hvc-in { from { opacity: 0; transform: scale(0.97) translateY(-4px); } }
@keyframes ui-hvc-in-up { from { opacity: 0; transform: scale(0.97) translateY(4px); } }
@keyframes ui-hvc-in-right { from { opacity: 0; transform: scale(0.97) translateX(-4px); } }
@keyframes ui-hvc-in-left { from { opacity: 0; transform: scale(0.97) translateX(4px); } }

/* Touch screens with a mouse or pen (a tablet): 15px text, so it reads like the rest of the UI there */
@media (pointer: coarse) {
  .ui-hvc { padding: 16px; font-size: 15px; line-height: 22px; }
}

@media (prefers-reduced-motion: reduce) {
  .ui-hvc { animation: none; }
}

/* Dark mode: follows a .dark class or data-theme="dark" on any ancestor, e.g. <html> */
:where(.dark, [data-theme="dark"]) .ui-hvc {
  --ui-hvc-surface: var(--aui-overlay, var(--aui-surface, #19191b));
  --ui-hvc-ink: var(--aui-ink, #ededed);
  --ui-hvc-shadow: var(--aui-shadow-popover, 0 0 0 1px rgba(255, 255, 255, 0.06), 0 18px 40px -12px rgba(0, 0, 0, 0.6));
  --ui-hvc-focus: var(--aui-focus, rgba(77, 141, 255, 0.8));
  color-scheme: dark;
}
`;
