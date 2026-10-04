"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

/*
 * Layer Stack – an interactive card illustration, in a single self-contained file.
 * An isometric stack of five layers next to a list of five entries. The chosen entry lifts its layer
 * out of the stack in blue, with a soft glow underneath; the others settle back to glassy gray.
 * It steps through the entries on its own and pauses while you hover; click or focus an entry to pick it.
 * The artwork is laid out on a 600 × 400 grid inside a 3 : 2 frame and scales with its container.
 */

export type LayerStackItem = {
  /** Main line of the entry */
  title: string;
  /** Short muted hint on the right */
  hint?: string;
  /** Icon drawn onto the layer: one of the built-in names */
  icon?: LayerIcon;
};

export type LayerIcon = "bolt" | "database" | "plug" | "spark" | "pulse";

export type LayerStackProps = {
  /** Up to five entries, top layer first */
  items?: LayerStackItem[];
  /** Entry to start on */
  defaultIndex?: number;
  /** Time per entry while it plays on its own, in ms */
  interval?: number;
  /** Called when an entry is picked by the user */
  onChange?: (index: number) => void;
  className?: string;
};

const defaultItems: LayerStackItem[] = [
  { title: "Triggered by events", hint: "Webhooks", icon: "bolt" },
  { title: "Grounded in your data", hint: "Context", icon: "database" },
  { title: "Connected to your apps", hint: "APIs", icon: "plug" },
  { title: "Works with any model", hint: "Routing", icon: "spark" },
  { title: "Traced at every step", hint: "Logs", icon: "pulse" },
];

/* Layer geometry on the 600 × 400 grid */
const SIZE = 104; // side of a layer before the isometric projection (rhombus 208 × 104)
const STEP = 26; // vertical distance between resting layers
const GAP = 34; // the chosen layer lifts off the ones below it
const ABOVE = 24; // and the layers above it lift a little further, so it shows
const THICK = 9; // layer thickness
const CX = 168; // stack centre
const TOP = 109; // y of the top layer's back corner when nothing is lifted

export function LayerStack({ items = defaultItems, defaultIndex = 0, interval = 2600, onChange, className }: LayerStackProps) {
  const id = "ui-lyr" + useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const list = items.slice(0, 5);
  const [active, setActive] = useState(Math.min(defaultIndex, list.length - 1));
  const [paused, setPaused] = useState(false);
  const touched = useRef(false);

  // Step through the entries on its own until someone interacts; never with reduced motion
  useEffect(() => {
    if (paused || touched.current || list.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setActive((i) => (i + 1) % list.length), interval);
    return () => window.clearInterval(timer);
  }, [paused, interval, list.length]);

  const pick = (i: number) => {
    touched.current = true;
    setActive(i);
    onChange?.(i);
  };

  // Resting y of each layer: gaps open below and above the chosen one. The bottom layer has nothing
  // below it, so when it's chosen it stays put and only the layers above it rise
  const last = list.length - 1;
  const yOf = (i: number) => TOP + i * STEP - (i < active ? GAP + ABOVE : i === active && active < last ? GAP : 0);

  return (
    <div
      className={["ui-lyr", className].filter(Boolean).join(" ")}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {/* React 19 hoists this into <head> once, no matter how many instances render */}
      <style href="ui-layer-stack" precedence="default">
        {css}
      </style>

      <svg className="ui-lyr-stack" viewBox="0 0 600 400" aria-hidden="true">
        <defs>
          <filter id={`${id}-glow`} x="-60%" y="-120%" width="220%" height="340%">
            <feGaussianBlur stdDeviation="14" />
          </filter>
        </defs>

        {/* Bottom layer first, so the upper ones overlap it */}
        {list
          .map((item, i) => (
            <g
              key={i}
              className="ui-lyr-layer"
              data-active={i === active ? "" : undefined}
              data-above={i < active ? "" : undefined}
              style={{ transform: `translate(${CX}px, ${yOf(i)}px)` }}
            >
              {/* Glow just beneath this layer – fades in while it's the chosen one, same strength on every layer */}
              <ellipse className="ui-lyr-glow" cx={0} cy={SIZE / 2 + THICK + 18} rx={70} ry={24} filter={`url(#${id}-glow)`} />
              {/* Thickness: the same rhombus, shifted down, peeks out below the top face */}
              <g transform={`translate(0 ${THICK}) matrix(1 0.5 -1 0.5 0 0)`}>
                <rect className="ui-lyr-side" width={SIZE} height={SIZE} rx={9} />
                <rect className="ui-lyr-side-on" width={SIZE} height={SIZE} rx={9} />
              </g>
              <g transform="matrix(1 0.5 -1 0.5 0 0)">
                <rect className="ui-lyr-face" width={SIZE} height={SIZE} rx={9} />
                <rect className="ui-lyr-face-on" width={SIZE} height={SIZE} rx={9} />
                <g className="ui-lyr-icon" transform={`translate(${SIZE / 2 - 18} ${SIZE / 2 - 18}) scale(1.5)`}>
                  {icons[item.icon ?? "bolt"]}
                </g>
              </g>
            </g>
          ))
          .reverse()}
      </svg>

      <div className="ui-lyr-menu" role="tablist" aria-label="Layers" aria-orientation="vertical">
        <span className="ui-lyr-pill" aria-hidden="true" style={{ transform: `translateY(calc(${active} * var(--ui-lyr-row)))` }} />
        {list.map((item, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={i === active}
            tabIndex={i === active ? 0 : -1}
            className="ui-lyr-row"
            onClick={() => pick(i)}
            onKeyDown={(e) => {
              const next = e.key === "ArrowDown" ? i + 1 : e.key === "ArrowUp" ? i - 1 : null;
              if (next === null) return;
              e.preventDefault();
              const n = (next + list.length) % list.length;
              pick(n);
              (e.currentTarget.parentElement?.children[n + 1] as HTMLElement | undefined)?.focus();
            }}
          >
            <span className="ui-lyr-title">{item.title}</span>
            {item.hint && <span className="ui-lyr-hint">{item.hint}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------- Icons, drawn on a 24 grid and laid onto the layer ---------- */

const icons: Record<LayerIcon, ReactNode> = {
  bolt: <path d="M13 3 5 13.5h6L10 21l8-10.5h-6L13 3Z" />,
  database: (
    <>
      <ellipse cx="12" cy="6" rx="7" ry="3" />
      <path d="M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3" />
    </>
  ),
  plug: <path d="M9 3v5M15 3v5M6.5 8h11v3a5.5 5.5 0 0 1-11 0V8ZM12 16.5V21" />,
  spark: <path d="M12 3c.6 4.6 2.4 6.4 7 7-4.6.6-6.4 2.4-7 7-.6-4.6-2.4-6.4-7-7 4.6-.6 6.4-2.4 7-7ZM18.5 15.5c.2 1.5.8 2.1 2.3 2.3-1.5.2-2.1.8-2.3 2.3-.2-1.5-.8-2.1-2.3-2.3 1.5-.2 2.1-.8 2.3-2.3Z" />,
  pulse: <path d="M3 12h4l2.5-6 5 12 2.5-6h4" />,
};

/* ---------- Styles ---------- */

const css = /* css */ `
.ui-lyr {
  /* 1 unit of the 600 × 400 layout grid */
  --u: calc(100cqw / 600);
  --ui-lyr-row: calc(52 * var(--u));
  /* The accent blue used across the library */
  --ui-lyr-accent: #2f6bff;
  --ui-lyr-accent-deep: #2557d9;
  --ui-lyr-tint: #e9f0ff;
  --ui-lyr-glow: rgba(47, 107, 255, 0.28);
  --ui-lyr-face: rgba(255, 255, 255, 0.6);
  --ui-lyr-edge: rgba(10, 10, 10, 0.11);
  --ui-lyr-side: #ececef;
  --ui-lyr-face-above: rgba(255, 255, 255, 0.3);
  --ui-lyr-side-above: rgba(236, 236, 239, 0.55);
  --ui-lyr-panel: #f5f5f5;
  --ui-lyr-pill: #ffffff;
  --ui-lyr-pill-ring: #e5e5e5;
  --ui-lyr-text: #171717;
  --ui-lyr-muted: #8f8f8f;
  --ui-lyr-ease: cubic-bezier(0.65, 0, 0.25, 1);
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 2;
  container-type: inline-size;
  font-family: "Inter", ui-sans-serif, system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
}
.ui-lyr *, .ui-lyr *::before, .ui-lyr *::after { box-sizing: border-box; }

/* ---------- Stack ---------- */

.ui-lyr-stack { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.ui-lyr-layer { transition: transform 560ms var(--ui-lyr-ease); }
.ui-lyr-glow {
  fill: var(--ui-lyr-glow);
  opacity: 0;
  transition: opacity 420ms ease;
}
.ui-lyr-layer[data-active] .ui-lyr-glow { opacity: 1; }
.ui-lyr-side-on {
  fill: var(--ui-lyr-accent-deep);
  opacity: 0;
  transition: opacity 360ms ease;
}
.ui-lyr-side {
  fill: var(--ui-lyr-side);
  stroke: var(--ui-lyr-edge);
  stroke-width: 1;
  vector-effect: non-scaling-stroke;
  transition: fill 360ms ease, stroke 360ms ease;
}
.ui-lyr-face {
  fill: var(--ui-lyr-face);
  stroke: var(--ui-lyr-edge);
  stroke-width: 1;
  vector-effect: non-scaling-stroke;
  transition: fill 360ms ease, stroke 360ms ease;
}
.ui-lyr-face-on {
  fill: var(--ui-lyr-tint);
  stroke: var(--ui-lyr-accent);
  opacity: 0;
  stroke-width: 1.6;
  vector-effect: non-scaling-stroke;
  transition: opacity 360ms ease;
}
.ui-lyr-icon {
  fill: none;
  stroke: var(--ui-lyr-accent);
  stroke-width: 1.5;
  stroke-linecap: round;
  stroke-linejoin: round;
  opacity: 0;
  transition: opacity 300ms ease;
}
/* Layers above the chosen one turn more glassy, so its color shows through */
.ui-lyr-layer[data-above] .ui-lyr-face { fill: var(--ui-lyr-face-above); }
.ui-lyr-layer[data-above] .ui-lyr-side { fill: var(--ui-lyr-side-above); }
.ui-lyr-layer[data-active] .ui-lyr-side-on { opacity: 1; }
.ui-lyr-layer[data-active] .ui-lyr-face-on { opacity: 1; }
.ui-lyr-layer[data-active] .ui-lyr-icon { opacity: 1; transition-delay: 120ms; }

/* ---------- Menu ---------- */

.ui-lyr-menu {
  position: absolute;
  left: calc(326 * var(--u));
  top: 50%;
  width: calc(248 * var(--u));
  padding: calc(8 * var(--u));
  transform: translateY(-50%);
  border-radius: calc(18 * var(--u));
  background: var(--ui-lyr-panel);
}
/* White card that glides behind the chosen row */
.ui-lyr-pill {
  position: absolute;
  left: calc(8 * var(--u));
  right: calc(8 * var(--u));
  top: calc(8 * var(--u));
  height: var(--ui-lyr-row);
  border-radius: calc(12 * var(--u));
  background: var(--ui-lyr-pill);
  box-shadow: 0 0 0 1px var(--ui-lyr-pill-ring), 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: transform 460ms var(--ui-lyr-ease);
}
.ui-lyr-row {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: calc(10 * var(--u));
  width: 100%;
  height: var(--ui-lyr-row);
  margin: 0;
  padding: 0 calc(14 * var(--u));
  border: 0;
  border-radius: calc(12 * var(--u));
  background: transparent;
  font: inherit;
  text-align: left;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.ui-lyr-row:focus-visible { outline: 2px solid var(--ui-lyr-accent); outline-offset: -2px; }
.ui-lyr-title {
  min-width: 0;
  overflow: hidden;
  font-size: calc(14 * var(--u));
  font-weight: 500;
  line-height: 1.3;
  letter-spacing: -0.01em;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: var(--ui-lyr-text);
  transition: color 300ms ease;
}
.ui-lyr-hint {
  flex: none;
  font-size: calc(12 * var(--u));
  line-height: 1.3;
  color: var(--ui-lyr-muted);
}
.ui-lyr-row[aria-selected="true"] .ui-lyr-title { color: var(--ui-lyr-accent); }

@media (prefers-reduced-motion: reduce) {
  .ui-lyr-layer, .ui-lyr-glow, .ui-lyr-pill { transition: none; }
}

/* Dark mode: follows a .dark class or data-theme="dark" on any ancestor, e.g. <html> */
:where(.dark, [data-theme="dark"]) .ui-lyr {
  --ui-lyr-accent: #6b95ff;
  --ui-lyr-accent-deep: #2f6bff;
  --ui-lyr-tint: #1f2c4d;
  --ui-lyr-glow: rgba(47, 107, 255, 0.3);
  --ui-lyr-face: rgba(255, 255, 255, 0.04);
  --ui-lyr-edge: rgba(255, 255, 255, 0.13);
  --ui-lyr-side: #26262a;
  --ui-lyr-face-above: rgba(255, 255, 255, 0.025);
  --ui-lyr-side-above: rgba(38, 38, 42, 0.5);
  --ui-lyr-panel: #161618;
  --ui-lyr-pill: #232326;
  --ui-lyr-pill-ring: rgba(255, 255, 255, 0.08);
  --ui-lyr-text: #ededed;
  --ui-lyr-muted: #8f8f8f;
}
`;
