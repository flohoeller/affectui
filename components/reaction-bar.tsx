"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

/*
 * Reaction Bar – like, comment, repost and share in one pill, in a single self-contained file.
 * Tapping an action colors its icon with a small pop, and its count rolls in digit by digit while the pill
 * glides to its new width. The styles are injected below, so no extra files are needed.
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

/** 1234 → "1.2K", like social apps */
const short = (n: number) =>
  n >= 1_000_000 ? `${+(n / 1_000_000).toFixed(1)}M` : n >= 10_000 ? `${Math.round(n / 1000)}K` : n >= 1000 ? `${+(n / 1000).toFixed(1)}K` : `${n}`;

export function ReactionBar({ reactions = {}, onReact, actions = ["like", "comment", "repost", "share"], className }: ReactionBarProps) {
  const [state, setState] = useState(() =>
    Object.fromEntries(
      actions.map((k) => [k, { count: reactions[k]?.count ?? 0, active: reactions[k]?.active ?? false }]),
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

  return (
    <>
      <style href="ui-reaction-bar" precedence="default">
        {css}
      </style>
      <div className={["ui-rb", className].filter(Boolean).join(" ")} role="group" aria-label="Reactions">
        {actions.map((key) => {
          const { count, active } = state[key];
          const [verb, noun] = labels[key];
          return (
            <button
              key={key}
              type="button"
              className="ui-rb__btn"
              data-kind={key}
              aria-pressed={active}
              aria-label={`${verb}${count ? `, ${count} ${count === 1 ? noun.slice(0, -1) : noun}` : ""}`}
              onClick={() => toggle(key)}
            >
              <span className="ui-rb__icon" key={popped[key] ?? 0} data-pop={popped[key] ? true : undefined}>
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
    <span className="ui-rb__count" ref={outer} aria-hidden="true">
      <span className="ui-rb__digits" ref={inner}>
        {text.split("").map((d, i) => (
          <span key={`${text.length - i}-${d}`} className="ui-rb__digit">
            {d}
          </span>
        ))}
      </span>
    </span>
  );
}

/* ---------- Icons (stroke, rounded) ---------- */

const Svg = ({ children }: { children: ReactNode }) => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

const icons: Record<ReactionKey, ReactNode> = {
  like: (
    <Svg>
      <path className="ui-rb__fill" d="M19.46 4c-2.68-1.65-5.02-.99-6.43.07-.57.43-.86.65-1.03.65s-.46-.22-1.03-.65C9.56 3.01 7.22 2.35 4.54 4 1.02 6.15.22 13.27 8.34 19.28 9.89 20.43 10.66 21 12 21s2.11-.57 3.66-1.72C23.78 13.27 22.98 6.15 19.46 4Z" />
    </Svg>
  ),
  comment: (
    <Svg>
      <path className="ui-rb__fill" d="M12 21.5c5.52 0 10-4.25 10-9.5S17.52 2.5 12 2.5 2 6.75 2 12c0 1.36.3 2.65.84 3.82.15.31.2.66.1 1l-.6 2.23a1.08 1.08 0 0 0 1.6 1.59l2.22-.6c.34-.09.69-.04 1 .1 1.17.55 2.46.86 4.84.86Z" />
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
.ui-rb {
  --ui-rb-ink: #404040;
  --ui-rb-like: #ec4899;
  --ui-rb-comment: #2f6bff;
  --ui-rb-repost: #8b5cf6;
  --ui-rb-share: #171717;
  --ui-rb-ease: cubic-bezier(0.85, 0, 0.15, 1);
  --ui-rb-soft: cubic-bezier(0.22, 1, 0.36, 1);
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 4px 10px;
  border-radius: 999px;
  background: #fff;
  box-shadow: 0 0 0 1px #ececec, 0 1px 2px rgba(0, 0, 0, 0.04), 0 4px 12px rgba(0, 0, 0, 0.03);
  font-family: "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
}
.ui-rb *, .ui-rb *::before, .ui-rb *::after { box-sizing: border-box; }

.ui-rb__btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  min-width: 42px;
  height: 42px;
  margin: 0;
  padding: 0 10px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  font: inherit;
  color: var(--ui-rb-ink);
  cursor: pointer;
  transition: background-color 160ms ease;
  -webkit-tap-highlight-color: transparent;
}
.ui-rb__btn:hover { background: #f5f5f5; }
.ui-rb__btn:focus-visible { outline: 2px solid var(--ui-rb-comment); outline-offset: 2px; }
.ui-rb__btn[data-kind="like"] { --ui-rb-tone: var(--ui-rb-like); }
.ui-rb__btn[data-kind="comment"] { --ui-rb-tone: var(--ui-rb-comment); }
.ui-rb__btn[data-kind="repost"] { --ui-rb-tone: var(--ui-rb-repost); }
.ui-rb__btn[data-kind="share"] { --ui-rb-tone: var(--ui-rb-share); }

.ui-rb__icon { display: grid; place-items: center; flex: none; }
.ui-rb__icon svg { transition: color 200ms ease; }
.ui-rb__fill { fill: transparent; transition: fill 200ms ease; }
.ui-rb__btn[aria-pressed="true"] { color: var(--ui-rb-tone); }
.ui-rb__btn[aria-pressed="true"] .ui-rb__fill { fill: currentColor; }
/* Press pop: shrinks, springs past full size, settles */
.ui-rb__icon[data-pop] { animation: ui-rb-pop 320ms cubic-bezier(0.65, 0, 0.35, 1); }

/* Count: the width glides, digits roll */
.ui-rb__count {
  display: inline-block;
  overflow: hidden;
  width: 0;
  height: 20px;
}
.ui-rb__count[data-smooth] { transition: width 400ms var(--ui-rb-ease); }
.ui-rb__digits {
  display: inline-flex;
  padding-left: 6px;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.ui-rb__digits:empty { padding-left: 0; }
.ui-rb__digit { display: inline-block; animation: ui-rb-roll 400ms var(--ui-rb-ease) both; }

@keyframes ui-rb-pop {
  0% { transform: scale(1); }
  35% { transform: scale(0.75); }
  70% { transform: scale(1.12); }
  100% { transform: scale(1); }
}
@keyframes ui-rb-roll {
  from { opacity: 0; transform: translateY(70%); }
}
@media (prefers-reduced-motion: reduce) {
  .ui-rb__icon[data-pop], .ui-rb__digit { animation: none; }
  .ui-rb__count[data-smooth] { transition: none; }
}

/* Dark mode: follows a .dark class or data-theme="dark" on any ancestor, e.g. <html> */
:where(.dark, [data-theme="dark"]) .ui-rb {
  --ui-rb-ink: #c4c4c4;
  --ui-rb-like: #f472b6;
  --ui-rb-comment: #6b95ff;
  --ui-rb-repost: #a78bfa;
  --ui-rb-share: #ededed;
  background: #232326;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.08), 0 1px 2px rgba(0, 0, 0, 0.4), 0 4px 12px rgba(0, 0, 0, 0.35);
}
:where(.dark, [data-theme="dark"]) .ui-rb__btn:hover { background: rgba(255, 255, 255, 0.06); }
`;
