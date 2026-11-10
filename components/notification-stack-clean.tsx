"use client";

import { useLayoutEffect, useRef, useState } from "react";

/*
 * Notification Stack (clean style) – notices stacked behind each other, in a single self-contained file.
 * One white card per notice with hairline shadows instead of borders, Inter at 13/15px, quiet line art.
 * Only the front card can be read; the others peek out below it. Dismissing the front card slides it away and
 * the next one moves up – one notice at a time.
 * The styles are injected below, so no extra files are needed.
 */

export type NoticePattern = "orbit" | "grid" | "rays";

export type Notice = {
  id: string;
  /** Small label in the pill, e.g. "Notice" */
  badge?: string;
  title: string;
  text: string;
  action?: { label: string; href?: string; onClick?: () => void; external?: boolean };
  /** Line art in the top-right corner */
  pattern?: NoticePattern;
};

export type NotificationStackProps = {
  notices: Notice[];
  /** Called after a notice was dismissed */
  onDismiss?: (notice: Notice) => void;
  className?: string;
};

const PEEK = 12; // how far each card behind peeks out below the one in front, in px

export function NotificationStack({ notices, onDismiss, className }: NotificationStackProps) {
  const [items, setItems] = useState(notices);
  const [leaving, setLeaving] = useState<Set<string>>(new Set());
  // New notices from the parent join the stack; dismissed ones stay gone
  const removed = useRef(new Set<string>());
  const [given, setGiven] = useState(notices);
  if (notices !== given) {
    setGiven(notices);
    setItems(notices.filter((n) => !removed.current.has(n.id)));
  }
  const [heights, setHeights] = useState<Record<string, number>>({});
  const refs = useRef(new Map<string, HTMLElement>());

  const visible = items.filter((n) => !leaving.has(n.id));
  const behind = Math.min(visible.length - 1, 2);

  // The front card's height sets the height of the stack
  useLayoutEffect(() => {
    const measure = () => {
      const next: Record<string, number> = {};
      // The full height, also for a card behind that is cut to the front card's height
      refs.current.forEach((el, id) => (next[id] = el.scrollHeight + el.offsetHeight - el.clientHeight));
      setHeights(next);
    };
    measure();
    const ro = new ResizeObserver(measure);
    refs.current.forEach((el) => ro.observe(el));
    return () => ro.disconnect();
  }, [items]);

  const dismiss = (notice: Notice) => {
    setLeaving((s) => new Set(s).add(notice.id));
    onDismiss?.(notice);
    window.setTimeout(() => {
      removed.current.add(notice.id);
      setItems((list) => list.filter((n) => n.id !== notice.id));
      setLeaving((s) => {
        const next = new Set(s);
        next.delete(notice.id);
        return next;
      });
    }, 320);
  };

  const front = visible[0] ? heights[visible[0].id] ?? 0 : 0;

  return (
    <>
      <style href="ui-notification-stack-clean" precedence="default">
        {css}
      </style>
      <section
        className={["ui-nsc", className].filter(Boolean).join(" ")}
        aria-label="Notifications"
        style={{ height: visible.length ? front + behind * PEEK : 0 }}
      >
        {items.map((notice) => {
          const i = visible.findIndex((n) => n.id === notice.id);
          const gone = i === -1;
          const depth = Math.max(0, i);
          // Only the cards that can show are rendered – a long list stays light
          if (!gone && depth > 3) return null;
          const isBehind = !gone && depth > 0;
          // Cards behind are lined up on the front card's bottom edge, a little lower and smaller each
          // A card behind that is taller than the front one is cut to its height, so it never peeks out above
          const y = gone || depth === 0 ? 0 : front - Math.min(heights[notice.id] ?? front, front) + Math.min(depth, 2) * PEEK;
          const scale = gone ? 1 : 1 - Math.min(depth, 2) * 0.05;
          return (
            <article
              key={notice.id}
              ref={(el) => {
                if (el) refs.current.set(notice.id, el);
                else refs.current.delete(notice.id);
              }}
              className="ui-nsc__card"
              data-depth={gone ? undefined : depth}
              data-leaving={gone || undefined}
              aria-labelledby={`${notice.id}-title`}
              aria-hidden={isBehind || undefined}
              inert={isBehind || gone}
              style={{
                zIndex: gone ? 10 : 10 - depth,
                transform: gone ? undefined : `translateY(${y}px) scale(${scale})`,
                opacity: depth > 2 ? 0 : undefined,
                maxHeight: isBehind && front ? front : undefined,
              }}
            >
              <Pattern kind={notice.pattern ?? "orbit"} />
              <div className="ui-nsc__body">
                <div className="ui-nsc__top">
                  {notice.badge ? (
                    <span className="ui-nsc__badge" dir="auto" title={notice.badge}>
                      {notice.badge}
                    </span>
                  ) : (
                    <span />
                  )}
                  <button
                    type="button"
                    className="ui-nsc__close"
                    aria-label={`Dismiss ${notice.title}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      dismiss(notice);
                    }}
                  >
                    <CloseIcon />
                  </button>
                </div>
                <h3 id={`${notice.id}-title`} className="ui-nsc__title" dir="auto">
                  {notice.title}
                </h3>
                <p className="ui-nsc__text" dir="auto">
                  {notice.text}
                </p>
                {notice.action &&
                  (notice.action.href ? (
                    <a
                      className="ui-nsc__btn"
                      dir="auto"
                      href={notice.action.href}
                      onClick={notice.action.onClick}
                      {...(notice.action.external ? { target: "_blank", rel: "noreferrer" } : {})}
                    >
                      {notice.action.label}
                      {notice.action.external && <ArrowIcon />}
                    </a>
                  ) : (
                    <button type="button" className="ui-nsc__btn" dir="auto" onClick={notice.action.onClick}>
                      {notice.action.label}
                    </button>
                  ))}
              </div>
            </article>
          );
        })}
      </section>
    </>
  );
}

/** Quiet line art for the top-right corner – fades out towards the text */
function Pattern({ kind }: { kind: NoticePattern }) {
  return (
    <svg className="ui-nsc__pattern" viewBox="0 0 220 160" fill="none" aria-hidden="true">
      {kind === "orbit" && (
        <>
          <circle cx="190" cy="10" r="46" />
          <circle cx="190" cy="10" r="86" />
          <circle cx="190" cy="10" r="128" />
          <path d="M60 160 220 0M0 58h220M150 0v160" />
          <circle cx="150" cy="58" r="3.5" className="ui-nsc__dot" />
        </>
      )}
      {kind === "grid" && (
        <>
          {[30, 60, 90, 120, 150, 180, 210].map((x) => (
            <path key={`x${x}`} d={`M${x} 0v160`} />
          ))}
          {[20, 50, 80, 110, 140].map((y) => (
            <path key={`y${y}`} d={`M0 ${y}h220`} />
          ))}
          <rect x="150" y="50" width="30" height="30" className="ui-nsc__fill" />
          <circle cx="180" cy="50" r="3.5" className="ui-nsc__dot" />
        </>
      )}
      {kind === "rays" && (
        <>
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <path key={i} d={`M210 6 L${210 - Math.cos((i * Math.PI) / 16) * 230} ${6 + Math.sin((i * Math.PI) / 16) * 230}`} />
          ))}
          <path d="M120 6a90 90 0 0 0 90 90" />
          <circle cx="146" cy="70" r="3.5" className="ui-nsc__dot" />
        </>
      )}
    </svg>
  );
}

const CloseIcon = () => (
  <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" aria-hidden="true">
    <path d="m4 4 8 8M12 4l-8 8" />
  </svg>
);

const ArrowIcon = () => (
  <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 11 11 5M6 5h5v5" />
  </svg>
);

/* ---------- Styles ---------- */

const css = /* css */ `
/* Colors and motion as variables – override them on .ui-nsc */
.ui-nsc {
  --ui-nsc-card: var(--aui-surface, #ffffff);
  --ui-nsc-strong: var(--aui-ink, #000000);
  --ui-nsc-ink: var(--aui-ink, rgba(0, 0, 0, 0.88));
  --ui-nsc-text: var(--aui-muted, rgba(0, 0, 0, 0.61));
  --ui-nsc-icon: var(--aui-muted, rgba(0, 0, 0, 0.447));
  --ui-nsc-line: var(--aui-border, rgba(0, 0, 0, 0.06));
  --ui-nsc-wash: var(--aui-subtle, rgba(0, 0, 0, 0.03));
  --ui-nsc-fill: var(--aui-subtle, rgba(0, 0, 0, 0.06));
  --ui-nsc-art: rgba(0, 0, 0, 0.07);
  --ui-nsc-accent: rgba(0, 96, 226, 0.765);
  --ui-nsc-accent-bg: rgba(0, 96, 226, 0.05);
  --ui-nsc-focus: var(--aui-focus, rgba(0, 96, 226, 0.7));
  /* Strokes are shadows: a 0.5px hairline plus a soft lift */
  --ui-nsc-shadow: 0 0 0 0.5px var(--aui-border, rgba(0, 0, 0, 0.06)), 0 1px 1px -1px rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --ui-nsc-shadow-hover: 0 0 0 0.5px var(--aui-border-strong, rgba(0, 0, 0, 0.1)), 0 1px 1px -1px rgba(0, 0, 0, 0.12), 0 1px 3px 0 rgba(0, 0, 0, 0.07);
  --ui-nsc-ease: var(--aui-ease, cubic-bezier(0.22, 1, 0.36, 1));
  position: relative;
  box-sizing: border-box;
  container-type: inline-size;
  width: 100%;
  max-width: 380px;
  font-family: var(--aui-font, "Inter", "InterVariable", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif);
  font-size: 13px;
  font-weight: 400;
  line-height: 20px;
  color: var(--ui-nsc-ink);
  text-align: left;
  -webkit-font-smoothing: antialiased;
  transition: height 460ms var(--ui-nsc-ease);
}
.ui-nsc *, .ui-nsc *::before, .ui-nsc *::after { box-sizing: border-box; }
:where(.ui-nsc) button { margin: 0; padding: 0; border: 0; background: none; font: inherit; color: inherit; cursor: pointer; -webkit-tap-highlight-color: transparent; }
:where(.ui-nsc) svg { flex: none; }
.ui-nsc button:focus-visible,
.ui-nsc a:focus-visible { outline: 2px solid var(--ui-nsc-focus); outline-offset: 2px; }

/* One white card per notice – the edge is a shadow, not a border */
.ui-nsc__card {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  overflow: hidden;
  border-radius: var(--aui-radius-lg, 10px);
  background: var(--ui-nsc-card);
  box-shadow: var(--aui-shadow-card, var(--ui-nsc-shadow));
  transform-origin: 50% 100%;
  transition:
    transform 460ms var(--ui-nsc-ease),
    opacity 300ms ease,
    box-shadow 300ms ease;
}
/* Cards behind show only their edge */
.ui-nsc__card > * { transition: opacity 260ms ease; }
.ui-nsc__card:not([data-depth="0"]) > * { opacity: 0; }
.ui-nsc__card[data-leaving] {
  opacity: 0;
  transform: translateX(40px) scale(0.98) !important;
  transition: transform 320ms var(--ui-nsc-ease), opacity 240ms ease;
}

/* Quiet hairline art in the top-right corner, with one blue mark */
.ui-nsc__pattern {
  position: absolute;
  top: 0;
  right: 0;
  width: 220px;
  height: 160px;
  stroke: var(--ui-nsc-art);
  stroke-width: 0.75;
  pointer-events: none;
  -webkit-mask-image: radial-gradient(120% 110% at 100% 0%, #000 20%, transparent 70%);
  mask-image: radial-gradient(120% 110% at 100% 0%, #000 20%, transparent 70%);
}
.ui-nsc__dot { fill: var(--ui-nsc-accent); stroke: none; }
.ui-nsc__fill { fill: var(--ui-nsc-accent-bg); }

.ui-nsc__body {
  position: relative;
  padding: 12px 12px 16px 16px;
}
.ui-nsc__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 28px;
  margin-bottom: 8px;
}
/* Tiny label: tinted fill, 10px uppercase */
.ui-nsc__badge {
  padding: 2px 6px;
  border-radius: var(--aui-radius-sm, 5px);
  background: var(--ui-nsc-fill);
  font-size: 10px;
  font-weight: 500;
  line-height: 16px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: var(--ui-nsc-text);
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
/* Ghost icon button */
.ui-nsc__close {
  display: grid;
  flex: none;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: calc(var(--aui-radius-sm, 5px) + 1px);
  transition: background-color 140ms ease, color 140ms ease;
}
:where(.ui-nsc) .ui-nsc__close { color: var(--ui-nsc-icon); }
.ui-nsc__close:hover { background: var(--ui-nsc-wash); color: var(--ui-nsc-ink); }
.ui-nsc__title {
  margin: 0;
  padding-right: 4px;
  font-size: 15px;
  font-weight: 500;
  line-height: 24px;
  color: var(--ui-nsc-strong);
  text-align: start;
  overflow-wrap: anywhere;
}
.ui-nsc__text {
  margin: 2px 0 0;
  padding-right: 4px;
  max-width: 38ch;
  font-size: 13px;
  line-height: 20px;
  color: var(--ui-nsc-text);
  text-align: start;
  overflow-wrap: anywhere;
  white-space: pre-line;
}
/* Secondary button: white with the card's hairline shadow */
.ui-nsc__btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  /* Grows with a long label instead of leaving the card */
  min-height: 28px;
  max-width: 100%;
  margin-top: 12px;
  padding: 4px 10px;
  border-radius: calc(var(--aui-radius, 7px) - 1px);
  text-align: start;
  overflow-wrap: anywhere;
  font-size: 13px;
  font-weight: 500;
  line-height: 20px;
  text-decoration: none;
  transition: background-color 140ms ease, box-shadow 140ms ease, transform 160ms var(--ui-nsc-ease);
}
:where(.ui-nsc) .ui-nsc__btn { background: var(--ui-nsc-card); box-shadow: var(--ui-nsc-shadow); color: var(--ui-nsc-strong); }
.ui-nsc__btn:has(svg) { padding: 4px 8px 4px 10px; }
.ui-nsc__btn:hover { box-shadow: var(--ui-nsc-shadow-hover); }
.ui-nsc__btn:active { transform: scale(0.97); }
.ui-nsc__btn svg { color: var(--ui-nsc-icon); }

/* Narrow stacks (phones) */
@container (max-width: 340px) {
  .ui-nsc__body { padding: 10px 10px 14px 14px; }
  .ui-nsc__text { max-width: none; }
}
/* Touch screens: bigger tap targets */
@media (pointer: coarse) {
  .ui-nsc__close { width: 36px; height: 36px; margin: -4px -4px -4px 0; }
  .ui-nsc__btn { min-height: 36px; padding: 8px 14px; }
  .ui-nsc__btn:has(svg) { padding: 8px 12px 8px 14px; }
}

@media (prefers-reduced-motion: reduce) {
  .ui-nsc, .ui-nsc__card, .ui-nsc__card > * { transition: none; }
}

/* Dark mode: follows a .dark class or data-theme="dark" on any ancestor, e.g. <html> */
:where(.dark, [data-theme="dark"]) .ui-nsc {
  --ui-nsc-card: var(--aui-surface, #1c1c1e);
  --ui-nsc-strong: var(--aui-ink, #ffffff);
  --ui-nsc-ink: var(--aui-ink, rgba(255, 255, 255, 0.9));
  --ui-nsc-text: var(--aui-muted, rgba(255, 255, 255, 0.62));
  --ui-nsc-icon: var(--aui-muted, rgba(255, 255, 255, 0.46));
  --ui-nsc-line: var(--aui-border, rgba(255, 255, 255, 0.08));
  --ui-nsc-wash: var(--aui-subtle, rgba(255, 255, 255, 0.04));
  --ui-nsc-fill: var(--aui-subtle, rgba(255, 255, 255, 0.08));
  --ui-nsc-art: rgba(255, 255, 255, 0.07);
  --ui-nsc-accent: var(--aui-blue, #4fb0fe);
  --ui-nsc-accent-bg: rgba(77, 141, 255, 0.1);
  --ui-nsc-focus: var(--aui-focus, rgba(77, 141, 255, 0.8));
  --ui-nsc-shadow: 0 0 0 0.5px var(--aui-border, rgba(255, 255, 255, 0.1)), 0 1px 2px 0 rgba(0, 0, 0, 0.4);
  --ui-nsc-shadow-hover: 0 0 0 0.5px var(--aui-border-strong, rgba(255, 255, 255, 0.16)), 0 1px 2px 0 rgba(0, 0, 0, 0.4);
}
:where(.dark, [data-theme="dark"]) .ui-nsc .ui-nsc__btn { background: rgba(255, 255, 255, 0.04); }
`;
