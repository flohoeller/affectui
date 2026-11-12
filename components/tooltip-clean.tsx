"use client";

import {
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
  type Ref,
  type SyntheticEvent,
  type PointerEvent as ReactPointerEvent,
  type FocusEvent as ReactFocusEvent,
} from "react";

/*
 * Tooltip – a single self-contained file, clean style.
 * A small dark label for one control: it shows on hover after a short wait and at once under keyboard focus, and goes
 * on Escape, when the pointer leaves, on blur and on a click. Once one is open, its neighbours show at once (the
 * skip-delay window), so you can run along a toolbar and read every name. It lives in the top layer, so no card's
 * overflow cuts it, and flips to stay on screen. An optional shortcut sits inside it (⌘K). Never interactive content.
 * The styles are injected below, so no extra files are needed.
 */

export type TooltipProps = {
  /** The label – a few words; it wraps at about 240px. Empty or null: only the child is rendered */
  content: ReactNode;
  /** A keyboard shortcut shown after the label, e.g. "⌘K" */
  shortcut?: string;
  /** Exactly one element that takes a ref and focus – a button, a link, an Icon Button */
  children: ReactElement;
  /** Where it shows; it flips to the other side when there is no room */
  side?: "top" | "bottom" | "left" | "right";
  /** Which edges line up: start · center · end (start is the left, or the right in RTL) */
  align?: "start" | "center" | "end";
  /** Gap to the trigger in px */
  offset?: number;
  /** How long the pointer rests on the trigger before it shows, in ms – keyboard focus shows it at once */
  delay?: number;
  /** Never shows it, e.g. when a label is not cut off */
  disabled?: boolean;
  /** Controls it from outside (with onOpenChange); leave it out and it opens on its own */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** A class for the label */
  className?: string;
};

/** A neighbour that opens within this many ms of the last one closing shows at once */
const SKIP = 300;
/** The pointer may cross the gap onto the label without it closing (so it can be read under a magnifier) */
const GRACE = 120;

/** Only one label at a time on the page – and the skip-delay window that makes neighbours show at once */
const group: { current: { close: () => void } | null; warmUntil: number } = { current: null, warmUntil: 0 };

export function Tooltip({
  content,
  shortcut,
  children,
  side = "top",
  align = "center",
  offset = 6,
  delay = 500,
  disabled,
  open: openProp,
  onOpenChange,
  className,
}: TooltipProps) {
  const uid = useId();
  const tipId = `${uid}-tip`;
  const keysId = `${uid}-keys`;
  const trigger = useRef<HTMLElement | null>(null);
  const tip = useRef<HTMLSpanElement | null>(null);
  const timer = useRef(0);
  // After a click or Escape it stays closed until the pointer leaves or the focus goes
  const blocked = useRef(false);
  const [shown, setShown] = useState(false);
  const [instant, setInstant] = useState(false);
  const [quiet, setQuiet] = useState(false);
  const empty = content == null || typeof content === "boolean" || content === "";
  const open = !disabled && !empty && (openProp ?? shown);

  const change = useRef<(v: boolean) => void>(() => {});
  change.current = (v: boolean) => {
    window.clearTimeout(timer.current);
    if (openProp === undefined) setShown(v);
    if (v !== open) onOpenChange?.(v);
  };
  const me = useRef({ close: () => change.current(false) });

  const show = (now: boolean) => {
    window.clearTimeout(timer.current);
    const el = trigger.current;
    if (disabled || empty || blocked.current || !el || el.getAttribute("aria-expanded") === "true") return;
    // A neighbour is open, or one just closed: no wait and no fade
    const warm = (group.current && group.current !== me.current) || Date.now() < group.warmUntil;
    if (now || warm) {
      setInstant(!!warm);
      change.current(true);
    } else {
      timer.current = window.setTimeout(() => {
        setInstant(false);
        change.current(true);
      }, Math.max(0, delay));
    }
  };
  const hide = (later = false) => {
    window.clearTimeout(timer.current);
    if (later) timer.current = window.setTimeout(() => change.current(false), GRACE);
    else change.current(false);
  };

  // One at a time: opening this one closes the other; closing opens the skip-delay window
  useEffect(() => {
    if (!open) return;
    const self = me.current;
    if (group.current && group.current !== self) group.current.close();
    group.current = self;
    // When the label just repeats the trigger's own name, screen readers only get the shortcut from it
    const el = trigger.current;
    const name = (el?.getAttribute("aria-label") || el?.textContent || "").trim();
    setQuiet(typeof content === "string" && content.trim() === name);
    return () => {
      if (group.current === self) {
        group.current = null;
        group.warmUntil = Date.now() + SKIP;
      }
    };
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => window.clearTimeout(timer.current), []);

  // Into the top layer next to the trigger before paint; it follows on scroll and resize
  useLayoutEffect(() => {
    const el = tip.current;
    if (!open || !el) return;
    showLayer(el);
    const update = () => {
      const a = trigger.current;
      if (a) place(el, a, side, align, offset);
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
      hideLayer(el);
    };
  }, [open, side, align, offset]);

  // Escape closes it first – caught early, so a dialog around it stays open
  useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || e.defaultPrevented) return;
      e.preventDefault();
      e.stopPropagation();
      blocked.current = true;
      change.current(false);
    };
    window.addEventListener("keydown", key, true);
    return () => window.removeEventListener("keydown", key, true);
  }, [open]);

  if (!isValidElement(children)) return <>{children}</>;
  const own = children.props as Record<string, unknown> & { ref?: Ref<HTMLElement> };
  const call = (name: string, e: SyntheticEvent) => (own[name] as ((e: SyntheticEvent) => void) | undefined)?.(e);
  // The child's handler runs first; when it calls preventDefault, the tooltip leaves the event alone
  const wrap =
    <E extends SyntheticEvent>(name: string, mine: (e: E) => void) =>
    (e: E) => {
      call(name, e);
      if (!e.defaultPrevented) mine(e);
    };

  const describedBy = [own["aria-describedby"], open && (quiet ? (shortcut ? keysId : null) : tipId)].filter(Boolean).join(" ") || undefined;

  const trig = cloneElement(children as ReactElement<Record<string, unknown>>, {
    ref: (el: HTMLElement | null) => {
      trigger.current = el;
      const r = own.ref;
      if (typeof r === "function") r(el);
      else if (r) (r as { current: HTMLElement | null }).current = el;
    },
    "aria-describedby": describedBy,
    // Touch has no hover: a tap never opens it (the label must not live only in a tooltip)
    onPointerEnter: wrap("onPointerEnter", (e: ReactPointerEvent) => {
      if (e.pointerType !== "touch") show(false);
    }),
    onPointerLeave: wrap("onPointerLeave", (e: ReactPointerEvent) => {
      blocked.current = false;
      if (e.pointerType !== "touch") hide(true);
    }),
    onPointerDown: wrap("onPointerDown", () => {
      blocked.current = true;
      hide();
    }),
    onClick: wrap("onClick", () => {
      blocked.current = true;
      hide();
    }),
    // Keyboard focus shows it at once; a click's focus does not
    onFocus: wrap("onFocus", (e: ReactFocusEvent) => {
      let visible = true;
      try {
        visible = (e.currentTarget as HTMLElement).matches(":focus-visible");
      } catch {}
      if (visible) show(true);
    }),
    onBlur: wrap("onBlur", () => {
      blocked.current = false;
      hide();
    }),
  });

  return (
    <>
      {trig}
      {open && (
        <span
          ref={tip}
          id={tipId}
          role="tooltip"
          className={["ui-tipc", className].filter(Boolean).join(" ")}
          popover="manual"
          data-side={side}
          data-instant={instant || undefined}
          // The pointer can rest on the label itself; leaving it closes it
          onPointerEnter={() => window.clearTimeout(timer.current)}
          onPointerLeave={() => hide(true)}
        >
          {/* React 19 hoists this into <head> once, no matter how many tooltips render */}
          <style href="ui-tooltip-clean" precedence="default">
            {css}
          </style>
          <span className="ui-tipc__text" dir="auto">
            {content}
          </span>
          {shortcut && (
            <kbd className="ui-tipc__keys" id={keysId}>
              {shortcut}
            </kbd>
          )}
        </span>
      )}
    </>
  );
}

/* ---------- Helpers ---------- */

/** The top layer, so no overflow cuts it and no z-index fights it */
function showLayer(el: HTMLElement) {
  if ("showPopover" in el && !el.matches(":popover-open")) el.showPopover();
}
function hideLayer(el: HTMLElement) {
  if ("hidePopover" in el && el.isConnected && el.matches(":popover-open")) el.hidePopover();
}

/**
 * Puts the fixed label next to the trigger: on the preferred side, or the other one when that has more room (beside it
 * with no room either way: above or under it); the edge it lines up with switches when it would stick out, and it is
 * pushed inside the window as a last resort
 */
function place(el: HTMLElement, trigger: HTMLElement, side: "top" | "bottom" | "left" | "right", align: "start" | "center" | "end", gap: number) {
  const pad = 8;
  const r = trigger.getBoundingClientRect();
  const vw = document.documentElement.clientWidth || window.innerWidth;
  const vh = window.innerHeight;
  const w = el.offsetWidth;
  const h = el.offsetHeight;
  const room = { bottom: vh - r.bottom - gap - pad, top: r.top - gap - pad, right: vw - r.right - gap - pad, left: r.left - gap - pad };
  const flip = { top: "bottom", bottom: "top", left: "right", right: "left" } as const;
  let s: keyof typeof room = side;
  if (room[s] < (s === "top" || s === "bottom" ? h : w) && room[flip[s]] > room[s]) s = flip[s];
  if ((s === "left" || s === "right") && room[s] < w) s = room.top >= h || room.top >= room.bottom ? "top" : "bottom";
  // start and end follow the reading direction above and below
  const rtl = getComputedStyle(trigger).direction === "rtl";
  const a = (s === "top" || s === "bottom") && rtl && align !== "center" ? (align === "start" ? "end" : "start") : align;
  let top: number;
  let left: number;
  if (s === "top" || s === "bottom") {
    top = s === "bottom" ? r.bottom + gap : r.top - gap - h;
    left = a === "start" ? r.left : a === "end" ? r.right - w : r.left + r.width / 2 - w / 2;
    left = Math.min(Math.max(pad, left), vw - pad - w);
  } else {
    left = s === "right" ? r.right + gap : r.left - gap - w;
    top = a === "start" ? r.top : a === "end" ? r.bottom - h : r.top + r.height / 2 - h / 2;
    top = Math.min(Math.max(pad, top), Math.max(pad, vh - pad - h));
  }
  el.style.top = `${Math.round(top)}px`;
  el.style.left = `${Math.round(left)}px`;
  el.dataset.side = s;
}

/* ---------- Styles ---------- */

const css = /* css */ `
/* Colors and motion as variables – override them on .ui-tipc (see Theming in the docs) */
.ui-tipc {
  --ui-tipc-bg: rgba(24, 24, 27, 0.92);
  --ui-tipc-ink: #fcfcfc;
  --ui-tipc-muted: rgba(255, 255, 255, 0.6);
  --ui-tipc-shadow: 0 4px 12px -4px rgba(0, 0, 0, 0.24);
  --ui-tipc-ease: var(--aui-ease, cubic-bezier(0.22, 1, 0.36, 1));

  /* A small dark label in the top layer – it fits its text and wraps at 240px */
  position: fixed;
  inset: auto;
  z-index: 1001;
  display: flex;
  align-items: baseline;
  gap: 6px;
  box-sizing: border-box;
  width: max-content;
  max-width: min(240px, calc(100vw - 16px));
  margin: 0;
  padding: 4px 8px;
  border: 0;
  border-radius: var(--aui-radius, 6px);
  background: var(--ui-tipc-bg);
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
  box-shadow: var(--ui-tipc-shadow);
  color: var(--ui-tipc-ink);
  font-family: var(--aui-font, "Inter", "InterVariable", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif);
  font-size: 12px;
  line-height: 16px;
  font-weight: 500;
  text-align: start;
  white-space: normal;
  overflow: visible;
  -webkit-font-smoothing: antialiased;
  animation: ui-tipc-in 140ms var(--ui-tipc-ease) both;
}
.ui-tipc::backdrop { display: none; }
.ui-tipc__text { min-width: 0; overflow-wrap: anywhere; }
/* The shortcut: quieter, never broken across lines */
.ui-tipc__keys {
  flex: none;
  margin: 0;
  font: inherit;
  font-feature-settings: "tnum";
  letter-spacing: 0.02em;
  color: var(--ui-tipc-muted);
  white-space: nowrap;
}

/* It drifts in 2px from the trigger's side; a neighbour in the skip-delay window shows at once */
.ui-tipc[data-side="bottom"] { animation-name: ui-tipc-in-down; }
.ui-tipc[data-side="left"] { animation-name: ui-tipc-in-left; }
.ui-tipc[data-side="right"] { animation-name: ui-tipc-in-right; }
.ui-tipc[data-instant] { animation: none; }
@keyframes ui-tipc-in { from { opacity: 0; transform: translateY(2px); } }
@keyframes ui-tipc-in-down { from { opacity: 0; transform: translateY(-2px); } }
@keyframes ui-tipc-in-left { from { opacity: 0; transform: translateX(2px); } }
@keyframes ui-tipc-in-right { from { opacity: 0; transform: translateX(-2px); } }

/* Touch screens (a tablet with a mouse or pen): a little larger type */
@media (pointer: coarse) {
  .ui-tipc { padding: 5px 9px; font-size: 13px; line-height: 18px; }
}

@media (prefers-reduced-motion: reduce) {
  .ui-tipc { animation: none; }
}

/* Dark mode: a light label – follows a .dark class or data-theme="dark" on any ancestor, e.g. <html> */
:where(.dark, [data-theme="dark"]) .ui-tipc {
  --ui-tipc-bg: rgba(250, 250, 250, 0.94);
  --ui-tipc-ink: #111113;
  --ui-tipc-muted: rgba(0, 0, 0, 0.5);
  --ui-tipc-shadow: 0 4px 12px -4px rgba(0, 0, 0, 0.6);
  color-scheme: dark;
}
`;
