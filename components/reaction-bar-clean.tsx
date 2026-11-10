"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

/*
 * Reaction Bar (clean style) – like, comment, repost and share as a row of quiet chips, in a single self-contained file.
 * Tapping an action marks the chip as yours with a light blue tint, its icon pops, and the count rolls in digit by
 * digit while the chip glides to its new width. The styles are injected below, so no extra files are needed.
 */

export type ReactionKey = "like" | "comment" | "repost" | "share";

export type ReactionState = { count: number; active?: boolean };

export type ReactionBarProps = {
  /** Starting counts and whether each action is already taken */
  reactions?: Partial<Record<ReactionKey, ReactionState>>;
  /** Called after an action was toggled, with its new state */
  onReact?: (key: ReactionKey, state: Required<ReactionState>) => void;
  /** Hide actions you don't need */
  actions?: ReactionKey[];
  className?: string;
};

const labels: Record<ReactionKey, [string, string]> = {
  like: ["Like", "likes"],
  comment: ["Comment", "comments"],
  repost: ["Repost", "reposts"],
  share: ["Share", "shares"],
};

/** 1234 → "1.2K", like social apps – rounded so 999,950 reads "1M", not "1000K" */
const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });
const exact = new Intl.NumberFormat("en");
const short = (n: number) => (n >= 10_000 && n < 1_000_000 ? compact.format(Math.round(n / 1000) * 1000) : compact.format(n));
/** Counts are whole, never negative – NaN, Infinity and the like count as 0 */
const clean = (n: unknown) => (typeof n === "number" && Number.isFinite(n) && n > 0 ? Math.floor(n) : 0);

export function ReactionBar({ reactions = {}, onReact, actions: actionsProp = ["like", "comment", "repost", "share"], className }: ReactionBarProps) {
  // Only known actions, each once
  const actions = (Array.isArray(actionsProp) ? actionsProp : []).filter((k, i, all) => k in labels && all.indexOf(k) === i);
  const [state, setState] = useState(() =>
    Object.fromEntries(
      (Object.keys(labels) as ReactionKey[]).map((k) => [k, { count: clean(reactions?.[k]?.count), active: reactions?.[k]?.active === true }]),
    ) as Record<ReactionKey, Required<ReactionState>>,
  );
  const [popped, setPopped] = useState<Record<string, number>>({});

  const toggle = (key: ReactionKey) => {
    const cur = state[key];
    const next = { active: !cur.active, count: Math.max(0, cur.count + (cur.active ? -1 : 1)) };
    setState((s) => ({ ...s, [key]: next }));
    // A new key restarts the pop animation on every tap
    setPopped((p) => ({ ...p, [key]: (p[key] ?? 0) + 1 }));
    onReact?.(key, next);
  };

  if (!actions.length) return null;

  return (
    <>
      <style href="ui-reaction-bar-clean" precedence="default">
        {css}
      </style>
      <div className={["ui-rbc", className].filter(Boolean).join(" ")} role="group" aria-label="Reactions">
        {actions.map((key) => {
          const { count, active } = state[key];
          const [verb, noun] = labels[key];
          return (
            <button
              key={key}
              type="button"
              className="ui-rbc__btn"
              data-kind={key}
              aria-pressed={active}
              aria-label={`${verb}${count ? `, ${exact.format(count)} ${count === 1 ? noun.slice(0, -1) : noun}` : ""}`}
              title={count >= 1000 ? `${exact.format(count)} ${noun}` : undefined}
              onClick={() => toggle(key)}
            >
              <span className="ui-rbc__icon" key={popped[key] ?? 0} data-pop={popped[key] ? true : undefined}>
                {icons[key]}
              </span>
              <Count value={count} />
            </button>
          );
        })}
      </div>
    </>
  );
}

/** The count glides to its new width; each changed digit rolls in from below */
function Count({ value }: { value: number }) {
  const text = value > 0 ? short(value) : "";
  const outer = useRef<HTMLSpanElement>(null);
  const inner = useRef<HTMLSpanElement>(null);
  const first = useRef(true);

  useLayoutEffect(() => {
    const o = outer.current;
    const i = inner.current;
    if (!o || !i) return;
    o.style.width = `${i.offsetWidth}px`;
    if (first.current) {
      first.current = false;
      requestAnimationFrame(() => o.setAttribute("data-smooth", ""));
    }
  }, [text]);

  return (
    <span className="ui-rbc__count" ref={outer} aria-hidden="true">
      <span className="ui-rbc__digits" ref={inner}>
        {text.split("").map((d, i) => (
          <span key={`${text.length - i}-${d}`} className="ui-rbc__digit">
            {d}
          </span>
        ))}
      </span>
    </span>
  );
}

/* ---------- Icons (stroke, rounded) ---------- */

const Svg = ({ children }: { children: ReactNode }) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

const icons: Record<ReactionKey, ReactNode> = {
  like: (
    <Svg>
      <path className="ui-rbc__fill" d="M19.46 4c-2.68-1.65-5.02-.99-6.43.07-.57.43-.86.65-1.03.65s-.46-.22-1.03-.65C9.56 3.01 7.22 2.35 4.54 4 1.02 6.15.22 13.27 8.34 19.28 9.89 20.43 10.66 21 12 21s2.11-.57 3.66-1.72C23.78 13.27 22.98 6.15 19.46 4Z" />
    </Svg>
  ),
  comment: (
    <Svg>
      <path className="ui-rbc__fill" d="M12 21.5c5.52 0 10-4.25 10-9.5S17.52 2.5 12 2.5 2 6.75 2 12c0 1.36.3 2.65.84 3.82.15.31.2.66.1 1l-.6 2.23a1.08 1.08 0 0 0 1.6 1.59l2.22-.6c.34-.09.69-.04 1 .1 1.17.55 2.46.86 4.84.86Z" />
    </Svg>
  ),
  repost: (
    <Svg>
      <path d="M16.5 3.5 19 6l-2.5 2.5" />
      <path d="M19 6H8a4 4 0 0 0-4 4v1" />
      <path d="M7.5 20.5 5 18l2.5-2.5" />
      <path d="M5 18h11a4 4 0 0 0 4-4v-1" />
    </Svg>
  ),
  share: (
    <Svg>
      <path d="M21 3 10.5 13.5" />
      <path d="M21 3 14.6 20.6a.5.5 0 0 1-.93.05L10.5 13.5 3.35 10.33a.5.5 0 0 1 .05-.93Z" />
    </Svg>
  ),
};

/* ---------- Styles ---------- */

const css = /* css */ `
.ui-rbc {
  --ui-rbc-ink: var(--aui-ink, rgba(0, 0, 0, 0.88));
  --ui-rbc-text: var(--aui-muted, rgba(0, 0, 0, 0.61));
  --ui-rbc-icon: var(--aui-muted, rgba(0, 0, 0, 0.447));
  --ui-rbc-line: var(--aui-border, rgba(0, 0, 0, 0.06));
  --ui-rbc-wash: var(--aui-subtle, rgba(0, 0, 0, 0.03));
  --ui-rbc-accent: rgba(0, 96, 226, 0.765);
  --ui-rbc-mine: rgba(0, 96, 226, 0.05);
  --ui-rbc-mine-line: rgba(0, 96, 226, 0.35);
  --ui-rbc-focus: var(--aui-focus, rgba(0, 96, 226, 0.7));
  --ui-rbc-ease: cubic-bezier(0.85, 0, 0.15, 1);
  --ui-rbc-h: 28px;
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  max-width: 100%;
  font-family: var(--aui-font, "Inter", "InterVariable", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif);
  font-size: 13px;
  font-weight: 500;
  line-height: 20px;
  color: var(--ui-rbc-text);
  -webkit-font-smoothing: antialiased;
}
.ui-rbc *, .ui-rbc *::before, .ui-rbc *::after { box-sizing: border-box; }
:where(.ui-rbc) button { margin: 0; padding: 0; border: 0; background: none; font: inherit; color: inherit; cursor: pointer; }
:where(.ui-rbc) svg { display: block; flex: none; }

/* A chip: the tab-chip look – inset hairline, radius 6. Without a count it is a square-ish icon chip */
.ui-rbc__btn {
  position: relative;
  display: inline-flex;
  flex: none;
  align-items: center;
  height: var(--ui-rbc-h);
  padding: 0 8px;
  border-radius: calc(var(--aui-radius-sm, 5px) + 1px);
  box-shadow: inset 0 0 0 0.5px var(--ui-rbc-line);
  color: var(--ui-rbc-text);
  transition: background-color 90ms ease, box-shadow 160ms ease, color 160ms ease;
  -webkit-tap-highlight-color: transparent;
}
.ui-rbc__btn:focus-visible { outline: 2px solid var(--ui-rbc-focus); outline-offset: 2px; }
@media (hover: hover) {
  .ui-rbc__btn:hover { background-color: var(--ui-rbc-wash); color: var(--ui-rbc-ink); }
  .ui-rbc__btn:hover .ui-rbc__icon { color: var(--ui-rbc-ink); }
}
/* Your own reaction: a minimal blue tint with a light blue hairline */
.ui-rbc__btn[aria-pressed="true"],
.ui-rbc__btn[aria-pressed="true"]:hover {
  background-color: var(--ui-rbc-mine);
  box-shadow: inset 0 0 0 0.5px var(--ui-rbc-mine-line);
  color: var(--ui-rbc-accent);
}

.ui-rbc__icon { display: grid; place-items: center; flex: none; width: 16px; height: 16px; color: var(--ui-rbc-icon); transition: color 160ms ease; }
.ui-rbc__fill { fill: transparent; transition: fill 160ms ease; }
.ui-rbc__btn[aria-pressed="true"] .ui-rbc__icon { color: var(--ui-rbc-accent); }
.ui-rbc__btn[aria-pressed="true"] .ui-rbc__fill { fill: currentColor; }
/* Press pop: shrinks, springs past full size, settles */
.ui-rbc__icon[data-pop] { animation: ui-rbc-pop 320ms cubic-bezier(0.65, 0, 0.35, 1); }

/* Count: the width glides, digits roll */
.ui-rbc__count {
  display: inline-block;
  overflow: hidden;
  width: 0;
  height: 20px;
}
.ui-rbc__count[data-smooth] { transition: width 400ms var(--ui-rbc-ease); }
.ui-rbc__digits {
  display: inline-flex;
  padding: 0 2px 0 6px;
  line-height: 20px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.ui-rbc__digits:empty { padding: 0; }
.ui-rbc__digit { display: inline-block; animation: ui-rbc-roll 400ms var(--ui-rbc-ease) both; }

@keyframes ui-rbc-pop {
  0% { transform: scale(1); }
  35% { transform: scale(0.75); }
  70% { transform: scale(1.12); }
  100% { transform: scale(1); }
}
@keyframes ui-rbc-roll {
  from { opacity: 0; transform: translateY(70%); }
}

/* Touch screens: taller chips */
@media (hover: none) and (pointer: coarse) {
  .ui-rbc { --ui-rbc-h: 36px; gap: 6px; }
  .ui-rbc__btn { padding: 0 10px; }
}
@media (prefers-reduced-motion: reduce) {
  .ui-rbc__icon[data-pop], .ui-rbc__digit { animation: none; }
  .ui-rbc__count[data-smooth] { transition: none; }
}

/* Dark mode: follows a .dark class or data-theme="dark" on any ancestor, e.g. <html> */
:where(.dark, [data-theme="dark"]) .ui-rbc {
  --ui-rbc-ink: var(--aui-ink, rgba(255, 255, 255, 0.9));
  --ui-rbc-text: var(--aui-muted, rgba(255, 255, 255, 0.62));
  --ui-rbc-icon: var(--aui-muted, rgba(255, 255, 255, 0.46));
  --ui-rbc-line: var(--aui-border, rgba(255, 255, 255, 0.08));
  --ui-rbc-wash: var(--aui-subtle, rgba(255, 255, 255, 0.04));
  --ui-rbc-accent: var(--aui-blue, #4fb0fe);
  --ui-rbc-mine: rgba(77, 141, 255, 0.14);
  --ui-rbc-mine-line: rgba(77, 141, 255, 0.4);
  --ui-rbc-focus: var(--aui-focus, rgba(77, 141, 255, 0.8));
}
`;
