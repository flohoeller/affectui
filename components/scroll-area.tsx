"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ComponentPropsWithRef, type CSSProperties, type PointerEvent as ReactPointerEvent, type Ref, type UIEventHandler } from "react";

/*
 * Scroll Area – a single self-contained file, classic style.
 * A box that scrolls the browser's own way – wheel, trackpad, touch, keyboard, find-in-page – with a slim scrollbar
 * of its own drawn over the content: it shows while you hover or scroll and fades out after, its thumb can be dragged
 * and a press on the track pages. Soft fades at the edges can hint that there is more. The box is a Tab stop only
 * while it actually scrolls, so the arrow keys and Page Up / Down reach it.
 * The styles are injected below, so no extra files are needed.
 */

export type ScrollAreaProps = Omit<ComponentPropsWithRef<"div">, "onScroll"> & {
  /** Which way it scrolls – vertical, horizontal or both */
  orientation?: "vertical" | "horizontal" | "both";
  /** When the scrollbar shows: on hover and while scrolling · only while scrolling · always (when there is more) */
  type?: "hover" | "scroll" | "always";
  /** Soft fades at the edges where there is more to scroll */
  fade?: boolean;
  /** The most it grows before it scrolls – or give it a height with className / style */
  maxHeight?: number | string;
  /** The element that scrolls – for scrollTo, scrollTop or an observer */
  viewportRef?: Ref<HTMLDivElement>;
  /** Fires on the element that scrolls */
  onScroll?: UIEventHandler<HTMLDivElement>;
};

type Axis = "y" | "x";

export function ScrollArea({
  orientation = "vertical",
  type = "hover",
  fade = false,
  maxHeight,
  viewportRef,
  onScroll,
  className,
  style,
  children,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  ref,
  ...rest
}: ScrollAreaProps) {
  const root = useRef<HTMLDivElement | null>(null);
  const view = useRef<HTMLDivElement | null>(null);
  const content = useRef<HTMLDivElement | null>(null);
  const thumbs = useRef<Record<Axis, HTMLDivElement | null>>({ y: null, x: null });
  const idle = useRef(0);
  const drag = useRef<{ axis: Axis; from: number; start: number; per: number } | null>(null);
  // Whether it overflows – the only thing that re-renders: the box becomes a Tab stop only then
  const [scrolls, setScrolls] = useState(false);
  const wantY = orientation !== "horizontal";
  const wantX = orientation !== "vertical";

  /** Sizes and moves the thumbs, sets the fades – straight on the elements, no re-render */
  const update = useCallback(() => {
    const v = view.current;
    const r = root.current;
    if (!v || !r) return;
    const cs = getComputedStyle(r);
    const rtl = cs.direction === "rtl";
    const cap = parseFloat(cs.getPropertyValue("--ui-sa-fade")) || 28;
    const has = { y: wantY && v.scrollHeight - v.clientHeight > 1, x: wantX && v.scrollWidth - v.clientWidth > 1 };
    for (const axis of ["y", "x"] as const) {
      r.toggleAttribute(`data-scroll-${axis}`, has[axis]);
      const t = thumbs.current[axis];
      const bar = t?.parentElement;
      if (!has[axis] || !t || !bar) continue;
      const size = axis === "y" ? v.clientHeight : v.clientWidth;
      const full = axis === "y" ? v.scrollHeight : v.scrollWidth;
      const pos = Math.abs(axis === "y" ? v.scrollTop : v.scrollLeft);
      const track = axis === "y" ? bar.clientHeight : bar.clientWidth;
      const len = Math.max(Math.min(24, track), Math.round((track * size) / full));
      const at = full - size > 0 ? ((track - len) * Math.min(pos, full - size)) / (full - size) : 0;
      if (axis === "y") {
        t.style.height = `${len}px`;
        t.style.transform = `translate3d(0, ${at}px, 0)`;
      } else {
        t.style.width = `${len}px`;
        t.style.transform = `translate3d(${rtl ? -at : at}px, 0, 0)`;
      }
      // How far from each end, capped – the fades shrink as you reach an end
      const end = full - size - pos;
      r.style.setProperty(`--ui-sa-${axis}-start`, `${Math.min(pos, cap)}px`);
      r.style.setProperty(`--ui-sa-${axis}-end`, `${Math.min(Math.max(end, 0), cap)}px`);
    }
    if (!has.y) r.style.setProperty("--ui-sa-y-start", "0px"), r.style.setProperty("--ui-sa-y-end", "0px");
    if (!has.x) r.style.setProperty("--ui-sa-x-start", "0px"), r.style.setProperty("--ui-sa-x-end", "0px");
    setScrolls(has.x || has.y);
  }, [wantX, wantY]);

  // Follows the box and its content as either changes size – new rows, a wider window, fonts loading
  useLayoutEffect(() => {
    update();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => update());
    if (view.current) ro.observe(view.current);
    if (content.current) ro.observe(content.current);
    return () => ro.disconnect();
  }, [update]);

  useEffect(() => () => window.clearTimeout(idle.current), []);

  const scrolled: UIEventHandler<HTMLDivElement> = (e) => {
    update();
    // Shown while it moves, then it fades out a moment after the last scroll
    const r = root.current;
    if (r) {
      r.setAttribute("data-scrolling", "");
      window.clearTimeout(idle.current);
      idle.current = window.setTimeout(() => r.removeAttribute("data-scrolling"), 800);
    }
    onScroll?.(e);
  };

  // Dragging the thumb: the pointer's way along the track, turned into the content's way
  const grab = (axis: Axis) => (e: ReactPointerEvent<HTMLDivElement>) => {
    const v = view.current;
    const t = thumbs.current[axis];
    const bar = t?.parentElement;
    if (e.button !== 0 || !v || !t || !bar) return;
    e.preventDefault();
    e.stopPropagation();
    // A zoomed or scaled card: pointer pixels vs. layout pixels
    const rect = bar.getBoundingClientRect();
    const scale = axis === "y" ? rect.height / (bar.offsetHeight || 1) : rect.width / (bar.offsetWidth || 1);
    const track = axis === "y" ? bar.clientHeight : bar.clientWidth;
    const len = axis === "y" ? t.offsetHeight : t.offsetWidth;
    const room = axis === "y" ? v.scrollHeight - v.clientHeight : v.scrollWidth - v.clientWidth;
    drag.current = { axis, from: axis === "y" ? e.clientY : e.clientX, start: axis === "y" ? v.scrollTop : v.scrollLeft, per: room / Math.max(1, track - len) / (scale || 1) };
    t.setPointerCapture(e.pointerId);
    root.current?.setAttribute("data-dragging", "");
  };
  const move = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    const v = view.current;
    if (!d || !v) return;
    const by = ((d.axis === "y" ? e.clientY : e.clientX) - d.from) * d.per;
    if (d.axis === "y") v.scrollTop = d.start + by;
    else v.scrollLeft = d.start + by;
  };
  const drop = () => {
    drag.current = null;
    root.current?.removeAttribute("data-dragging");
  };

  // A press on the track pages towards it, like the browser's own bar
  const page = (axis: Axis) => (e: ReactPointerEvent<HTMLDivElement>) => {
    const v = view.current;
    const t = thumbs.current[axis];
    if (e.button !== 0 || !v || !t || e.target === t) return;
    e.preventDefault();
    const tr = t.getBoundingClientRect();
    const before = axis === "y" ? e.clientY < tr.top : getComputedStyle(v).direction === "rtl" ? e.clientX > tr.right : e.clientX < tr.left;
    const step = (axis === "y" ? v.clientHeight : v.clientWidth) * 0.9 * (before ? -1 : 1);
    const rtl = axis === "x" && getComputedStyle(v).direction === "rtl" ? -1 : 1;
    const smooth = !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    v.scrollBy({ [axis === "y" ? "top" : "left"]: step * rtl, behavior: smooth ? "smooth" : "auto" });
  };

  // Stable, so your ref functions run once per element and not on every render
  const setView = useCallback((el: HTMLDivElement | null) => {
    view.current = el;
    assign(viewportRef, el);
  }, [viewportRef]);
  const setRoot = useCallback((el: HTMLDivElement | null) => {
    root.current = el;
    assign(ref, el);
  }, [ref]);

  const bar = (axis: Axis) => (
    <div className="ui-sa__bar" data-axis={axis} aria-hidden="true" onPointerDown={page(axis)}>
      <div
        className="ui-sa__thumb"
        ref={(el) => {
          thumbs.current[axis] = el;
        }}
        onPointerDown={grab(axis)}
        onPointerMove={move}
        onPointerUp={drop}
        onPointerCancel={drop}
        onLostPointerCapture={drop}
      />
    </div>
  );

  return (
    <div
      ref={setRoot}
      className={["ui-sa", className].filter(Boolean).join(" ")}
      data-orientation={orientation}
      data-type={type}
      data-fade={fade ? "" : undefined}
      style={maxHeight != null ? ({ maxHeight, ...style } as CSSProperties) : style}
      {...rest}
    >
      {/* React 19 hoists this into <head> once, no matter how many scroll areas render */}
      <style href="ui-scroll-area" precedence="default">
        {css}
      </style>
      <div
        ref={setView}
        className="ui-sa__viewport"
        // A Tab stop only while there is something to scroll – the arrow keys and Page Up / Down then move it
        tabIndex={scrolls ? 0 : undefined}
        role={ariaLabel || ariaLabelledby ? "region" : undefined}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
        onScroll={scrolled}
      >
        <div ref={content} className="ui-sa__content">
          {children}
        </div>
      </div>
      {wantY && bar("y")}
      {wantX && bar("x")}
    </div>
  );
}

/* ---------- Helpers ---------- */

/** Hands an element to a ref of yours, a function or an object */
function assign<T>(ref: Ref<T> | undefined, el: T | null) {
  if (typeof ref === "function") ref(el);
  else if (ref) (ref as { current: T | null }).current = el;
}

/* ---------- Styles ---------- */

const css = /* css */ `
/* The fades' lengths animate as you near an end */
@property --ui-sa-y-start { syntax: "<length>"; inherits: true; initial-value: 0px; }
@property --ui-sa-y-end { syntax: "<length>"; inherits: true; initial-value: 0px; }
@property --ui-sa-x-start { syntax: "<length>"; inherits: true; initial-value: 0px; }
@property --ui-sa-x-end { syntax: "<length>"; inherits: true; initial-value: 0px; }

/* Colors and sizes as variables – override them on .ui-sa (see Theming in the docs) */
.ui-sa {
  --ui-sa-thumb: rgba(0, 0, 0, 0.22);
  --ui-sa-thumb-hover: rgba(0, 0, 0, 0.36);
  --ui-sa-thumb-active: rgba(0, 0, 0, 0.48);
  --ui-sa-size: 6px;
  --ui-sa-size-hover: 8px;
  --ui-sa-inset: 2px;
  --ui-sa-fade: 28px;
  --ui-sa-focus: var(--aui-focus, rgba(0, 96, 226, 0.7));
  --ui-sa-ease: var(--aui-ease, cubic-bezier(0.22, 1, 0.36, 1));

  /* A column, so a height or max-height on the box is what the viewport fills */
  position: relative;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}
.ui-sa *, .ui-sa *::before, .ui-sa *::after { box-sizing: border-box; }

/* The element that scrolls: the browser's own scrolling, its bar hidden – ours is drawn on top */
.ui-sa__viewport {
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
  border-radius: inherit;
  overflow: hidden;
  overscroll-behavior: contain;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}
.ui-sa__viewport::-webkit-scrollbar { display: none; }
.ui-sa[data-orientation="vertical"] > .ui-sa__viewport { overflow-y: auto; }
.ui-sa[data-orientation="horizontal"] > .ui-sa__viewport { overflow-x: auto; }
.ui-sa[data-orientation="both"] > .ui-sa__viewport { overflow: auto; }
.ui-sa__viewport:focus { outline: none; }
/* Inside the box, so no card edge or overflow cuts it */
.ui-sa__viewport:focus-visible { outline: 2px solid var(--ui-sa-focus); outline-offset: -2px; }

/* Sideways the content keeps its natural width, so a wide row really overflows; text still wraps at the box */
.ui-sa:not([data-orientation="vertical"]) .ui-sa__content { min-width: fit-content; }

/* Soft fades where there is more – a mask, so it works on any background */
.ui-sa[data-fade][data-scroll-y] > .ui-sa__viewport {
  -webkit-mask-image: linear-gradient(to bottom, transparent, #000 var(--ui-sa-y-start), #000 calc(100% - var(--ui-sa-y-end)), transparent);
  mask-image: linear-gradient(to bottom, transparent, #000 var(--ui-sa-y-start), #000 calc(100% - var(--ui-sa-y-end)), transparent);
}
.ui-sa[data-fade][data-scroll-x]:not([data-scroll-y]) > .ui-sa__viewport {
  -webkit-mask-image: linear-gradient(to right, transparent, #000 var(--ui-sa-x-start), #000 calc(100% - var(--ui-sa-x-end)), transparent);
  mask-image: linear-gradient(to right, transparent, #000 var(--ui-sa-x-start), #000 calc(100% - var(--ui-sa-x-end)), transparent);
}
.ui-sa[data-fade][dir="rtl"][data-scroll-x]:not([data-scroll-y]) > .ui-sa__viewport,
[dir="rtl"] .ui-sa[data-fade][data-scroll-x]:not([data-scroll-y]) > .ui-sa__viewport {
  -webkit-mask-image: linear-gradient(to left, transparent, #000 var(--ui-sa-x-start), #000 calc(100% - var(--ui-sa-x-end)), transparent);
  mask-image: linear-gradient(to left, transparent, #000 var(--ui-sa-x-start), #000 calc(100% - var(--ui-sa-x-end)), transparent);
}
.ui-sa[data-fade] {
  transition: --ui-sa-y-start 160ms ease, --ui-sa-y-end 160ms ease, --ui-sa-x-start 160ms ease, --ui-sa-x-end 160ms ease;
}

/* The bar: a 10px strip over the content's edge, the thumb in it – hidden until there is something to scroll */
.ui-sa__bar {
  position: absolute;
  z-index: 1;
  display: none;
  opacity: 0;
  touch-action: none;
  user-select: none;
  transition: opacity 280ms var(--ui-sa-ease);
}
.ui-sa__bar[data-axis="y"] { top: var(--ui-sa-inset); bottom: var(--ui-sa-inset); inset-inline-end: 0; width: 10px; }
.ui-sa__bar[data-axis="x"] { left: var(--ui-sa-inset); right: var(--ui-sa-inset); bottom: 0; height: 10px; }
/* Both bars: each stops short of the corner the other one runs into */
.ui-sa[data-scroll-y][data-scroll-x] > .ui-sa__bar[data-axis="y"] { bottom: 10px; }
.ui-sa[data-scroll-y][data-scroll-x] > .ui-sa__bar[data-axis="x"] { inset-inline-end: 10px; }
.ui-sa[data-scroll-y] > .ui-sa__bar[data-axis="y"], .ui-sa[data-scroll-x] > .ui-sa__bar[data-axis="x"] { display: block; }

.ui-sa__thumb {
  position: absolute;
  border-radius: 999px;
  background: var(--ui-sa-thumb);
  cursor: default;
  transition: background-color 150ms ease, width 150ms var(--ui-sa-ease), height 150ms var(--ui-sa-ease);
  will-change: transform;
}
/* A wider, invisible grab area around the thin thumb */
.ui-sa__thumb::before { content: ""; position: absolute; inset: -4px; }
.ui-sa__bar[data-axis="y"] > .ui-sa__thumb { top: 0; inset-inline-end: var(--ui-sa-inset); width: var(--ui-sa-size); }
.ui-sa__bar[data-axis="x"] > .ui-sa__thumb { inset-inline-start: 0; bottom: var(--ui-sa-inset); height: var(--ui-sa-size); }
.ui-sa__bar[data-axis="y"]:hover > .ui-sa__thumb, .ui-sa[data-dragging] > .ui-sa__bar[data-axis="y"] > .ui-sa__thumb { width: var(--ui-sa-size-hover); }
.ui-sa__bar[data-axis="x"]:hover > .ui-sa__thumb, .ui-sa[data-dragging] > .ui-sa__bar[data-axis="x"] > .ui-sa__thumb { height: var(--ui-sa-size-hover); }
.ui-sa__bar:hover > .ui-sa__thumb { background: var(--ui-sa-thumb-hover); }
.ui-sa[data-dragging] .ui-sa__thumb { background: var(--ui-sa-thumb-active); }
.ui-sa[data-dragging] { user-select: none; }

/* When it shows: hover – while the pointer is over the box or it scrolls · scroll – only while it scrolls · always */
.ui-sa[data-type="always"] > .ui-sa__bar,
.ui-sa[data-scrolling] > .ui-sa__bar,
.ui-sa[data-dragging] > .ui-sa__bar { opacity: 1; transition-duration: 120ms; }
@media (hover: hover) {
  .ui-sa[data-type="hover"]:hover > .ui-sa__bar { opacity: 1; transition-duration: 120ms; }
}
/* Faded out it lets the pointer through to the content under it */
.ui-sa > .ui-sa__bar { pointer-events: none; }
.ui-sa:is([data-type="always"], [data-scrolling], [data-dragging]) > .ui-sa__bar { pointer-events: auto; }
@media (hover: hover) {
  .ui-sa[data-type="hover"]:hover > .ui-sa__bar { pointer-events: auto; }
}

/* Touch screens: the finger scrolls the content – the bar only shows where you are, a little thicker */
@media (pointer: coarse) {
  .ui-sa { --ui-sa-size: 4px; --ui-sa-size-hover: 4px; }
  .ui-sa > .ui-sa__bar { pointer-events: none; }
}

@media (prefers-reduced-motion: reduce) {
  .ui-sa__bar, .ui-sa__thumb, .ui-sa[data-fade] { transition-duration: 1ms !important; }
}

/* Windows high contrast: the thumb keeps a system color */
@media (forced-colors: active) {
  .ui-sa__thumb { background: CanvasText; }
}

/* Dark mode: follows a .dark class or data-theme="dark" on any ancestor, e.g. <html> */
:where(.dark, [data-theme="dark"]) .ui-sa {
  --ui-sa-thumb: rgba(255, 255, 255, 0.22);
  --ui-sa-thumb-hover: rgba(255, 255, 255, 0.36);
  --ui-sa-thumb-active: rgba(255, 255, 255, 0.5);
  --ui-sa-focus: var(--aui-focus, rgba(77, 141, 255, 0.8));
}
`;
