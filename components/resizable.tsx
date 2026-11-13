"use client";

import {
  createContext,
  useCallback,
  useContext,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type Ref,
} from "react";

/*
 * Resizable – a single self-contained file, classic style.
 * Panes side by side or stacked, with a hairline between them you can drag: a sidebar and a work area, a list and its
 * detail, an editor over its output. Sizes are in percent, so the layout fits any width; each pane can have a
 * smallest and a largest size, and a collapsible one snaps shut when dragged past half its minimum. The handle is a
 * real separator: arrow keys move it, Home and End go to the limits, Enter folds a pane away and back, a double-click
 * puts it back where it started.
 * The styles are injected below, so no extra files are needed.
 */

export type ResizablePanelGroupProps = ComponentPropsWithRef<"div"> & {
  /** horizontal: panes side by side · vertical: stacked */
  direction?: "horizontal" | "vertical";
  /** Called with every pane's size in % (in order) after the user resizes – store it to bring the layout back */
  onLayout?: (sizes: number[]) => void;
  /** How far an arrow key moves a handle, in % (Shift: 2 ×) */
  keyboardStep?: number;
};

export type ResizablePanelProps = ComponentPropsWithRef<"div"> & {
  /** The size it starts at, in % of the group; panes without one share what is left */
  defaultSize?: number;
  /** The smallest it gets, in % */
  minSize?: number;
  /** The largest it gets, in % */
  maxSize?: number;
  /** Snaps to collapsedSize when dragged past half its minimum – Enter on its handle folds it and brings it back */
  collapsible?: boolean;
  /** Its size when folded, in % – 0 hides it; a little more keeps an icon rail */
  collapsedSize?: number;
};

export type ResizableHandleProps = ComponentPropsWithRef<"div"> & {
  /** A small grip on the line, so it reads as draggable */
  withHandle?: boolean;
};

type Config = { min: number; max: number; collapsible: boolean; collapsed: number; initial?: number };
type Group = {
  direction: "horizontal" | "vertical";
  sizes: Record<string, number>;
  configs: Map<string, Config>;
  register: () => () => void;
  /** The panes' sizes in order, right now */
  read: () => number[];
  /** Changes the sizes around a handle – change gets them in order, the panes' limits and the index of the pane before it */
  resize: (handle: HTMLElement, change: (sizes: number[], cfg: Config[], at: number) => number[] | null, animate?: boolean) => void;
  dragging: (on: boolean) => void;
  step: number;
};

const Ctx = createContext<Group | null>(null);
const EPS = 0.01;
const PANEL = "data-rsz-panel";

/* ---------- Group ---------- */

export function ResizablePanelGroup({ direction = "horizontal", onLayout, keyboardStep = 5, className, style, children, ref, ...rest }: ResizablePanelGroupProps) {
  const el = useRef<HTMLDivElement | null>(null);
  const configs = useRef(new Map<string, Config>()).current;
  const [sizes, setSizes] = useState<Record<string, number>>({});
  const sizesRef = useRef(sizes);
  sizesRef.current = sizes;
  const [panes, setPanes] = useState(0);
  const layout = useRef(onLayout);
  layout.current = onLayout;
  const snap = useRef(0);

  /** The panes in the order they are on screen – only the group's own, not those of a group inside */
  const order = useCallback(() => (el.current ? [...el.current.children].filter((c) => c.hasAttribute(PANEL)).map((c) => c.getAttribute(PANEL)!) : []), []);

  // Every pane gets a size before paint: its defaultSize, or a share of what is left; then all of them add up to 100
  useLayoutEffect(() => {
    const ids = order();
    const cur = sizesRef.current;
    if (!ids.length) return;
    // Limits of panes that are gone
    for (const id of [...configs.keys()]) if (!ids.includes(id)) configs.delete(id);
    const known = ids.filter((id) => cur[id] != null || configs.get(id)?.initial != null);
    const given = known.reduce((s, id) => s + (cur[id] ?? configs.get(id)!.initial!), 0);
    const share = ids.length > known.length ? Math.max(0, 100 - given) / (ids.length - known.length) : 0;
    let next = ids.map((id) => cur[id] ?? configs.get(id)?.initial ?? share);
    const total = next.reduce((a, b) => a + b, 0) || 1;
    next = next.map((s) => (s * 100) / total);
    const same = ids.length === Object.keys(cur).length && ids.every((id, i) => Math.abs((cur[id] ?? -1) - next[i]) < EPS);
    if (!same) setSizes(Object.fromEntries(ids.map((id, i) => [id, next[i]])));
  }, [panes, order, configs]);

  // A pane coming or going: the sizes are worked out again (one that's gone hands its share to the others)
  const register = useCallback(() => {
    setPanes((n) => n + 1);
    return () => setPanes((n) => n + 1);
  }, []);

  const group = useMemo<Group>(
    () => ({
      direction,
      sizes,
      configs,
      step: keyboardStep,
      register,
      read: () => order().map((id) => sizesRef.current[id] ?? 0),
      dragging: (on) => el.current?.toggleAttribute("data-resizing", on),
      resize: (handle, change, animate) => {
        const ids = order();
        const before = prevPanel(handle);
        const at = before ? ids.indexOf(before) : -1;
        if (at < 0 || at >= ids.length - 1) return;
        const cur = ids.map((id) => sizesRef.current[id] ?? 0);
        const next = change(cur, ids.map((id) => configs.get(id) ?? { min: 0, max: 100, collapsible: false, collapsed: 0 }), at);
        if (!next || next.every((s, i) => Math.abs(s - cur[i]) < EPS)) return;
        // Keys, Enter and double-click glide; a drag follows the pointer exactly
        const g = el.current;
        if (g && animate) {
          g.setAttribute("data-snap", "");
          window.clearTimeout(snap.current);
          snap.current = window.setTimeout(() => g.removeAttribute("data-snap"), 240);
        }
        const out = Object.fromEntries(ids.map((id, i) => [id, next[i]]));
        sizesRef.current = out;
        setSizes(out);
        layout.current?.(next.map((s) => Math.round(s * 100) / 100));
      },
    }),
    [direction, sizes, configs, keyboardStep, register, order],
  );

  const setRef = useCallback(
    (node: HTMLDivElement | null) => {
      el.current = node;
      assign(ref, node);
    },
    [ref],
  );

  return (
    <Ctx.Provider value={group}>
      {/* React 19 hoists this into <head> once, no matter how many groups render */}
      <style href="ui-resizable" precedence="default">
        {css}
      </style>
      <div ref={setRef} className={["ui-rsz", className].filter(Boolean).join(" ")} data-direction={direction} style={style} {...rest}>
        {children}
      </div>
    </Ctx.Provider>
  );
}

/* ---------- Panel ---------- */

export function ResizablePanel({ defaultSize, minSize = 0, maxSize = 100, collapsible = false, collapsedSize = 0, id, className, style, children, ...rest }: ResizablePanelProps) {
  const group = useContext(Ctx);
  const auto = useId();
  const key = id ?? auto;
  const min = clamp(minSize, 0, 100);
  // Written during render, so the group reads this render's limits on the next drag
  group?.configs.set(key, { min, max: clamp(maxSize, min, 100), collapsible, collapsed: clamp(collapsedSize, 0, min), initial: defaultSize });

  useLayoutEffect(() => {
    if (!group) return;
    return group.register();
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  const size = group?.sizes[key] ?? defaultSize;
  const cfg = group?.configs.get(key);
  const folded = !!cfg?.collapsible && size != null && size <= cfg.collapsed + EPS;
  // Folded all the way: out of the Tab order and away from screen readers too
  const hidden = folded && size! <= EPS;

  return (
    <div
      id={key}
      className={["ui-rsz__panel", className].filter(Boolean).join(" ")}
      {...{ [PANEL]: key }}
      data-collapsed={folded ? "" : undefined}
      inert={hidden || undefined}
      style={{ flex: `${size ?? 1} 1 0px`, ...style } as CSSProperties}
      {...rest}
    >
      {children}
    </div>
  );
}

/* ---------- Handle ---------- */

export function ResizableHandle({ withHandle = false, className, "aria-label": ariaLabel, ...rest }: ResizableHandleProps) {
  const group = useContext(Ctx);
  const self = useRef<HTMLDivElement | null>(null);
  const start = useRef<{ pos: number; px: number; sizes: number[]; sign: number } | null>(null);
  // Sizes to come back to after Enter folded a pane, by pane id
  const restore = useRef<Record<string, number>>({});
  const [near, setNear] = useState<{ before?: string; after?: string }>({});
  const [active, setActive] = useState(false);
  const horizontal = (group?.direction ?? "horizontal") === "horizontal";

  // Which panes it sits between – read from the page, so conditional panes are fine
  useLayoutEffect(() => {
    const el = self.current;
    if (!el) return;
    const before = prevPanel(el) ?? undefined;
    const after = nextPanel(el) ?? undefined;
    if (before !== near.before || after !== near.after) setNear({ before, after });
  });

  if (!group) return null;
  const cfg = near.before ? group.configs.get(near.before) : undefined;
  const now = near.before ? group.sizes[near.before] : undefined;

  const rtl = () => horizontal && !!self.current && getComputedStyle(self.current).direction === "rtl";

  const down = (e: ReactPointerEvent<HTMLDivElement>) => {
    const el = self.current;
    const g = el?.parentElement;
    if (e.button !== 0 || !el || !g) return;
    e.preventDefault();
    el.focus({ preventScroll: true });
    // The panes' own pixels (without the handles), corrected for a zoomed or scaled card
    const rect = g.getBoundingClientRect();
    const scale = horizontal ? rect.width / (g.offsetWidth || 1) : rect.height / (g.offsetHeight || 1);
    const px = [...g.children].filter((c) => c.hasAttribute(PANEL)).reduce((s, c) => s + (horizontal ? (c as HTMLElement).offsetWidth : (c as HTMLElement).offsetHeight), 0) * (scale || 1);
    start.current = { pos: horizontal ? e.clientX : e.clientY, px: Math.max(1, px), sizes: group.read(), sign: rtl() ? -1 : 1 };
    el.setPointerCapture(e.pointerId);
    setActive(true);
    group.dragging(true);
  };
  const move = (e: ReactPointerEvent<HTMLDivElement>) => {
    const s = start.current;
    if (!s || !self.current || !s.sizes.length) return;
    const delta = (((horizontal ? e.clientX : e.clientY) - s.pos) / s.px) * 100 * s.sign;
    group.resize(self.current, (_, cfg, at) => shift(s.sizes, cfg, at, delta));
  };
  const up = () => {
    if (!start.current) return;
    start.current = null;
    setActive(false);
    group.dragging(false);
  };

  /** Folds the collapsible pane next to it, or brings it back to where it was */
  const toggle = () => {
    const el = self.current;
    if (!el) return;
    group.resize(
      el,
      (sizes, cfg, at) => {
        // The pane before the handle first, else the one after it
        const side = cfg[at].collapsible ? at : cfg[at + 1].collapsible ? at + 1 : -1;
        if (side < 0) return null;
        const c = cfg[side];
        const id = side === at ? near.before : near.after;
        const sign = side === at ? 1 : -1;
        if (sizes[side] <= c.collapsed + EPS) {
          const back = clamp(restore.current[id ?? ""] ?? c.initial ?? c.min, c.min, c.max);
          return shift(sizes, cfg, at, (back - sizes[side]) * sign, true);
        }
        if (id) restore.current[id] = sizes[side];
        return shift(sizes, cfg, at, (c.collapsed - sizes[side]) * sign);
      },
      true,
    );
  };

  const key = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    const el = self.current;
    if (!el) return;
    const step = group.step * (e.shiftKey ? 2 : 1);
    const back = horizontal ? (rtl() ? "ArrowRight" : "ArrowLeft") : "ArrowUp";
    const fwd = horizontal ? (rtl() ? "ArrowLeft" : "ArrowRight") : "ArrowDown";
    if (e.key === back || e.key === fwd) {
      e.preventDefault();
      group.resize(el, (sizes, cfg, at) => shift(sizes, cfg, at, e.key === fwd ? step : -step, true), true);
    } else if (e.key === "Home" || e.key === "End") {
      e.preventDefault();
      group.resize(el, (sizes, cfg, at) => shift(sizes, cfg, at, (e.key === "Home" ? cfg[at].min : cfg[at].max) - sizes[at], true), true);
    } else if (e.key === "Enter") {
      e.preventDefault();
      toggle();
    }
  };

  // Back to where it started: the pane before it at its defaultSize
  const reset = () => {
    const el = self.current;
    if (!el) return;
    group.resize(el, (sizes, cfg, at) => (cfg[at].initial == null ? null : shift(sizes, cfg, at, cfg[at].initial - sizes[at], true)), true);
  };

  return (
    <div
      ref={self}
      className={["ui-rsz__handle", className].filter(Boolean).join(" ")}
      role="separator"
      tabIndex={0}
      // Panes side by side are split by an upright line
      aria-orientation={horizontal ? "vertical" : "horizontal"}
      aria-label={ariaLabel ?? "Resize"}
      aria-controls={near.before}
      aria-valuenow={now != null ? Math.round(now) : undefined}
      aria-valuemin={cfg ? Math.round(cfg.collapsible ? cfg.collapsed : cfg.min) : 0}
      aria-valuemax={cfg ? Math.round(cfg.max) : 100}
      data-dragging={active || undefined}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      onLostPointerCapture={up}
      onDoubleClick={reset}
      onKeyDown={key}
      {...rest}
    >
      {withHandle && <span className="ui-rsz__grip" aria-hidden="true" />}
    </div>
  );
}

/* ---------- Helpers ---------- */

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** The pane right before / after a handle, by its id */
function prevPanel(el: Element) {
  let n = el.previousElementSibling;
  while (n && !n.hasAttribute(PANEL)) n = n.previousElementSibling;
  return n?.getAttribute(PANEL) ?? null;
}
function nextPanel(el: Element) {
  let n = el.nextElementSibling;
  while (n && !n.hasAttribute(PANEL)) n = n.nextElementSibling;
  return n?.getAttribute(PANEL) ?? null;
}

/**
 * Moves the handle after pane `at` by `delta` % (positive: toward the end). The pane on the side it moves away from
 * grows up to its max; the panes on the other side give way in turn, each down to its min – the one next to the
 * handle snaps shut when it is collapsible and pushed past half its min. A folded pane opens straight to its min once
 * it is pulled past half of it (by the keyboard at once).
 */
function shift(start: number[], cfg: Config[], at: number, delta: number, keyboard = false): number[] {
  const next = start.slice();
  if (Math.abs(delta) < EPS) return next;
  const grow = delta > 0 ? at : at + 1;
  const order: number[] = [];
  if (delta > 0) for (let i = at + 1; i < start.length; i++) order.push(i);
  else for (let i = at; i >= 0; i--) order.push(i);
  const g = cfg[grow];
  let want = Math.abs(delta);
  const opening = g.collapsible && start[grow] <= g.collapsed + EPS && g.min > g.collapsed;
  if (opening) {
    if (!keyboard && want < (g.min - g.collapsed) / 2) return next;
    want = Math.max(want, g.min - g.collapsed);
  }
  want = Math.min(want, g.max - start[grow]);
  if (want <= EPS) return next;
  let taken = 0;
  for (const i of order) {
    const c = cfg[i];
    const need = want - taken;
    if (need <= EPS) break;
    const room = Math.max(0, start[i] - c.min);
    const open = !(c.collapsible && start[i] <= c.collapsed + EPS);
    // Next to the handle and pushed well past its min: it folds and hands over all of its room at once
    if (i === order[0] && c.collapsible && open && need > room + (c.min - c.collapsed) / 2 && start[grow] + (start[i] - c.collapsed) <= g.max + EPS) {
      taken += start[i] - c.collapsed;
      next[i] = c.collapsed;
      break;
    }
    if (!open) continue;
    const take = Math.min(room, need);
    next[i] = start[i] - take;
    taken += take;
  }
  // A folded pane opens to at least its min, or not at all
  if (opening && taken < g.min - g.collapsed - EPS) return start.slice();
  next[grow] = start[grow] + taken;
  return next;
}

/** Hands an element to a ref of yours, a function or an object */
function assign<T>(ref: Ref<T> | undefined, el: T | null) {
  if (typeof ref === "function") ref(el);
  else if (ref) (ref as { current: T | null }).current = el;
}

/* ---------- Styles ---------- */

const css = /* css */ `
/* Colors as variables – override them on .ui-rsz (see Theming in the docs) */
.ui-rsz {
  --ui-rsz-line: var(--aui-border, #ececec);
  --ui-rsz-line-active: #c4c4c8;
  --ui-rsz-grip: var(--aui-surface, #ffffff);
  --ui-rsz-grip-edge: #e1e1e4;
  --ui-rsz-focus: var(--aui-focus, rgba(0, 96, 226, 0.7));
  --ui-rsz-ease: var(--aui-ease, cubic-bezier(0.22, 1, 0.36, 1));

  /* Fills what it is put in; the panes share it by their sizes */
  display: flex;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}
.ui-rsz[data-direction="vertical"] { flex-direction: column; }
.ui-rsz *, .ui-rsz *::before, .ui-rsz *::after { box-sizing: border-box; }
.ui-rsz[data-resizing] { user-select: none; -webkit-user-select: none; }
.ui-rsz[data-direction="horizontal"][data-resizing] { cursor: col-resize; }
.ui-rsz[data-direction="vertical"][data-resizing] { cursor: row-resize; }
/* While dragging, iframes and text under the pointer don't catch it */
.ui-rsz[data-resizing] > .ui-rsz__panel { pointer-events: none; }

/* A pane: its share of the room, never pushed wider by its content; it scrolls when the content doesn't fit */
.ui-rsz__panel { position: relative; min-width: 0; min-height: 0; overflow: auto; }
.ui-rsz[data-snap] > .ui-rsz__panel { transition: flex-grow 220ms var(--ui-rsz-ease); }

/* The handle: a 1px line in the layout, a 12px grab strip over it */
.ui-rsz__handle {
  position: relative;
  z-index: 1;
  flex: none;
  outline: none;
  touch-action: none;
  user-select: none;
  border: 0 solid var(--ui-rsz-line);
  transition: border-color 150ms ease;
}
.ui-rsz[data-direction="horizontal"] > .ui-rsz__handle { width: 0; border-inline-start-width: 1px; cursor: col-resize; }
.ui-rsz[data-direction="vertical"] > .ui-rsz__handle { height: 0; border-top-width: 1px; cursor: row-resize; }
.ui-rsz__handle::after { content: ""; position: absolute; border-radius: 4px; }
.ui-rsz[data-direction="horizontal"] > .ui-rsz__handle::after { top: 0; bottom: 0; left: -6px; right: -6px; }
.ui-rsz[data-direction="vertical"] > .ui-rsz__handle::after { left: 0; right: 0; top: -6px; bottom: -6px; }
/* The line firms up under the pointer (after a short rest, so passing over it stays calm) and while dragging */
.ui-rsz__handle:hover { border-color: var(--ui-rsz-line-active); transition-delay: 120ms; }
.ui-rsz__handle[data-dragging], .ui-rsz__handle:focus-visible { border-color: var(--ui-rsz-line-active); transition-delay: 0ms; }
/* Keyboard focus: the ring around the grab strip, inside it, so the panes' edges never cut it */
.ui-rsz__handle:focus-visible::after { outline: 2px solid var(--ui-rsz-focus); outline-offset: -2px; }

/* The grip: a small white pill on the line, a 1px edge */
.ui-rsz__grip {
  position: absolute;
  z-index: 1;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 999px;
  background: var(--ui-rsz-grip);
  box-shadow: 0 0 0 1px var(--ui-rsz-grip-edge), 0 1px 2px rgba(0, 0, 0, 0.06);
  pointer-events: none;
}
.ui-rsz[data-direction="horizontal"] .ui-rsz__grip { width: 8px; height: 28px; }
.ui-rsz[data-direction="vertical"] .ui-rsz__grip { width: 28px; height: 8px; }

/* Touch screens: a wider strip for the finger and a bigger grip */
@media (pointer: coarse) {
  .ui-rsz[data-direction="horizontal"] > .ui-rsz__handle::after { left: -12px; right: -12px; }
  .ui-rsz[data-direction="vertical"] > .ui-rsz__handle::after { top: -12px; bottom: -12px; }
  .ui-rsz[data-direction="horizontal"] .ui-rsz__grip { width: 10px; height: 36px; }
  .ui-rsz[data-direction="vertical"] .ui-rsz__grip { width: 36px; height: 10px; }
}

@media (prefers-reduced-motion: reduce) {
  .ui-rsz[data-snap] > .ui-rsz__panel { transition: none; }
  .ui-rsz__handle { transition: none; }
}

/* Windows high contrast: the line keeps a system color */
@media (forced-colors: active) {
  .ui-rsz__handle { border-color: CanvasText; }
}

/* Dark mode: follows a .dark class or data-theme="dark" on any ancestor, e.g. <html> */
:where(.dark, [data-theme="dark"]) .ui-rsz {
  --ui-rsz-line: var(--aui-border, #26262a);
  --ui-rsz-line-active: #4a4a50;
  --ui-rsz-grip: var(--aui-surface, #1c1c1e);
  --ui-rsz-grip-edge: #34343a;
  --ui-rsz-focus: var(--aui-focus, rgba(77, 141, 255, 0.8));
}
`;
