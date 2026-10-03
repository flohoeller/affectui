"use client";

import { useLayoutEffect, useRef, useState } from "react";

/*
 * Notification Stack – notices stacked behind each other, in a single self-contained file.
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
  const [heights, setHeights] = useState<Record<string, number>>({});
  const refs = useRef(new Map<string, HTMLElement>());

  const visible = items.filter((n) => !leaving.has(n.id));
  const behind = Math.min(visible.length - 1, 2);

  // The front card's height sets the height of the stack
  useLayoutEffect(() => {
    const measure = () => {
      const next: Record<string, number> = {};
      refs.current.forEach((el, id) => (next[id] = el.offsetHeight));
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
      <style href="ui-notification-stack" precedence="default">
        {css}
      </style>
      <section
        className={["ui-ns", className].filter(Boolean).join(" ")}
        aria-label="Notifications"
        style={{ height: visible.length ? front + behind * PEEK : 0 }}
      >
        {items.map((notice) => {
          const i = visible.findIndex((n) => n.id === notice.id);
          const gone = i === -1;
          const depth = Math.max(0, i);
          const isBehind = !gone && depth > 0;
          // Cards behind are lined up on the front card's bottom edge, a little lower and smaller each
          const y = gone || depth === 0 ? 0 : front - (heights[notice.id] ?? front) + Math.min(depth, 2) * PEEK;
          const scale = gone ? 1 : 1 - Math.min(depth, 2) * 0.05;
          return (
            <article
              key={notice.id}
              ref={(el) => {
                if (el) refs.current.set(notice.id, el);
                else refs.current.delete(notice.id);
              }}
              className="ui-ns__card"
              data-depth={gone ? undefined : depth}
              data-leaving={gone || undefined}
              aria-labelledby={`${notice.id}-title`}
              aria-hidden={isBehind || undefined}
              inert={isBehind || gone}
              style={{
                zIndex: gone ? 10 : 10 - depth,
                transform: gone ? undefined : `translateY(${y}px) scale(${scale})`,
                opacity: depth > 2 ? 0 : undefined,
              }}
            >
              <Pattern kind={notice.pattern ?? "orbit"} />
              <div className="ui-ns__body">
                <div className="ui-ns__top">
                  {notice.badge ? <span className="ui-ns__badge">{notice.badge}</span> : <span />}
                  <button
                    type="button"
                    className="ui-ns__close"
                    aria-label={`Dismiss ${notice.title}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      dismiss(notice);
                    }}
                  >
                    <CloseIcon />
                  </button>
                </div>
                <h3 id={`${notice.id}-title`} className="ui-ns__title">
                  {notice.title}
                </h3>
                <p className="ui-ns__text">{notice.text}</p>
                {notice.action &&
                  (notice.action.href ? (
                    <a
                      className="ui-ns__btn"
                      href={notice.action.href}
                      onClick={notice.action.onClick}
                      {...(notice.action.external ? { target: "_blank", rel: "noreferrer" } : {})}
                    >
                      {notice.action.label}
                      {notice.action.external && <ArrowIcon />}
                    </a>
                  ) : (
                    <button type="button" className="ui-ns__btn" onClick={notice.action.onClick}>
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
    <svg className="ui-ns__pattern" viewBox="0 0 220 160" fill="none" aria-hidden="true">
      {kind === "orbit" && (
        <>
          <circle cx="190" cy="10" r="46" />
          <circle cx="190" cy="10" r="86" />
          <circle cx="190" cy="10" r="128" />
          <path d="M60 160 220 0M0 58h220M150 0v160" />
          <circle cx="150" cy="58" r="3.5" className="ui-ns__dot" />
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
          <rect x="150" y="50" width="30" height="30" className="ui-ns__fill" />
          <circle cx="180" cy="50" r="3.5" className="ui-ns__dot" />
        </>
      )}
      {kind === "rays" && (
        <>
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <path key={i} d={`M210 6 L${210 - Math.cos((i * Math.PI) / 16) * 230} ${6 + Math.sin((i * Math.PI) / 16) * 230}`} />
          ))}
          <path d="M120 6a90 90 0 0 0 90 90" />
          <circle cx="146" cy="70" r="3.5" className="ui-ns__dot" />
        </>
      )}
    </svg>
  );
}

const CloseIcon = () => (
  <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden="true">
    <path d="m4 4 8 8M12 4l-8 8" />
  </svg>
);

const ArrowIcon = () => (
  <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 11 11 5M6 5h5v5" />
  </svg>
);

/* ---------- Styles ---------- */

const css = /* css */ `
.ui-ns {
  --ui-ns-card: #ffffff;
  --ui-ns-line: #e5e5e5;
  --ui-ns-ink: #171717;
  --ui-ns-muted: #737373;
  --ui-ns-art: #e3e3e3;
  --ui-ns-accent: #2f6bff;
  --ui-ns-ease: cubic-bezier(0.22, 1, 0.36, 1);
  position: relative;
  box-sizing: border-box;
  width: 100%;
  max-width: 380px;
  font-family: "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  color: var(--ui-ns-ink);
  -webkit-font-smoothing: antialiased;
  transition: height 460ms var(--ui-ns-ease);
}
.ui-ns *, .ui-ns *::before, .ui-ns *::after { box-sizing: border-box; }

.ui-ns__card {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  overflow: hidden;
  background: var(--ui-ns-card);
  border: 1px solid var(--ui-ns-line);
  border-radius: 20px;
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.03),
    0 8px 24px rgba(0, 0, 0, 0.035);
  transform-origin: 50% 100%;
  transition:
    transform 460ms var(--ui-ns-ease),
    opacity 300ms ease,
    box-shadow 300ms ease;
}
/* Cards behind show only their edge */
.ui-ns__card > * { transition: opacity 260ms ease; }
.ui-ns__card:not([data-depth="0"]) > * { opacity: 0; }
.ui-ns__card[data-leaving] {
  opacity: 0;
  transform: translateX(40px) scale(0.98) !important;
  transition: transform 320ms var(--ui-ns-ease), opacity 240ms ease;
}

.ui-ns__pattern {
  position: absolute;
  top: 0;
  right: 0;
  width: 220px;
  height: 160px;
  stroke: var(--ui-ns-art);
  stroke-width: 1;
  pointer-events: none;
  /* Only the top-right corner, fading out towards the text */
  -webkit-mask-image: radial-gradient(120% 110% at 100% 0%, #000 20%, transparent 70%);
  mask-image: radial-gradient(120% 110% at 100% 0%, #000 20%, transparent 70%);
}
.ui-ns__dot { fill: #d4d4d4; stroke: none; }
.ui-ns__fill { fill: #f5f5f5; }

.ui-ns__body {
  position: relative;
  padding: 18px 20px 20px;
}
.ui-ns__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 26px;
  margin-bottom: 14px;
}
.ui-ns__badge {
  padding: 2px 9px;
  border-radius: 999px;
  background: #fff;
  box-shadow: inset 0 0 0 1px var(--ui-ns-line);
  font-size: 11px;
  font-weight: 500;
  line-height: 18px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #525252;
}
.ui-ns__close {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  margin: -2px -6px 0 0;
  padding: 0;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--ui-ns-muted);
  cursor: pointer;
  transition: background-color 140ms ease, color 140ms ease;
}
.ui-ns__close:hover { background: rgba(0, 0, 0, 0.05); color: var(--ui-ns-ink); }
.ui-ns__title {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  line-height: 22px;
  letter-spacing: -0.01em;
}
.ui-ns__text {
  margin: 6px 0 0;
  max-width: 34ch;
  font-size: 14px;
  line-height: 21px;
  color: var(--ui-ns-muted);
}
.ui-ns__btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 32px;
  margin-top: 16px;
  padding: 0 12px;
  border: 0;
  border-radius: 9px;
  background: #fff;
  box-shadow: 0 0 0 1px var(--ui-ns-line), 0 1px 2px rgba(0, 0, 0, 0.04);
  font: inherit;
  font-size: 13px;
  font-weight: 500;
  color: var(--ui-ns-ink);
  text-decoration: none;
  cursor: pointer;
  transition: background-color 160ms ease, transform 160ms ease;
}
.ui-ns__btn:hover { background: #f7f7f7; }
.ui-ns__btn:active { transform: scale(0.98); }
.ui-ns__btn svg { color: var(--ui-ns-muted); }
.ui-ns button:focus-visible,
.ui-ns a:focus-visible { outline: 2px solid var(--ui-ns-accent); outline-offset: 2px; }

@media (prefers-reduced-motion: reduce) {
  .ui-ns, .ui-ns__card, .ui-ns__card > * { transition: none; }
}
`;
