"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";

/*
 * Testimonial Wall – the landing-page wall of quotes, in a single self-contained file.
 * Quotes are dealt into columns (3 on wide containers, 2 on tablets, 1 on phones – measured on the wall itself,
 * not the window) that scroll vertically and endlessly, alternating up and down at slightly different speeds.
 * Every column repeats a measured set of cards and wraps by exactly its height, so the loop has no gap and no
 * jump; the top and bottom edges fade out with a mask. One requestAnimationFrame loop owns a velocity per column:
 * hovering or keyboard-focusing a column eases it to a stop, leaving winds it back up, and dragging it with the
 * mouse scrubs it with inertia. On touch the page keeps scrolling natively – pressing and holding a column pauses
 * it to read. It only runs while on screen, and prefers-reduced-motion shows a static grid instead.
 * The styles are injected below.
 */

export type Testimonial = {
  /** The quote itself – mix short and long ones, the masonry looks more natural */
  quote: string;
  name: string;
  /** e.g. "Design Engineer" */
  role?: string;
  /** e.g. "Fieldnote" – shown after the role */
  company?: string;
  /** Photo URL; without one the initials sit on a soft gray circle */
  avatar?: string;
  /** 1–5 – a small, calm gray star row above the quote */
  rating?: number;
  /** A small gray check beside the name */
  verified?: boolean;
};

export type TestimonialWallProps = {
  items: Testimonial[];
  /** Most columns on a wide container – narrower containers use fewer (2 below 740px, 1 below 480px) */
  columns?: 1 | 2 | 3;
  /** Pixels per second of the first column; the others run a little slower and faster */
  speed?: number;
  /** Ease a column to a stop while the pointer is over it or a card in it has keyboard focus */
  pauseOnHover?: boolean;
  /** Accessible name of the wall */
  label?: string;
  /** Extra class on the wrapper – set the height with --ui-tw-height (600px by default) */
  className?: string;
};

/** Motion state of one column, kept outside React so the loop never re-renders */
type ColState = {
  /** Offset into the loop in px – the real set starts at -x */
  y: number;
  v: number;
  /** Height of one set, including its trailing gap – the wrap distance */
  h: number;
  drag: null | { id: number; lastY: number; lastT: number; moved: number; captured: boolean };
  /** Pending nudge (px) to bring a focused card into view */
  seek: number;
};

/** Run direction and pace of each column: up, down, up – never quite in step */
const PACE = [1, -0.84, 1.12];
/** Where each column starts in its loop, so the rows of cards don't line up */
const START = [0, 0.42, 0.18];

const mod = (n: number, m: number) => (m > 0 ? ((n % m) + m) % m : 0);
const clamp = (n: number, a: number, b: number) => Math.min(b, Math.max(a, n));

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");

/** Container width → column count; matches the container queries in the styles */
const fit = (width: number, max: number) => Math.min(max, width >= 740 ? 3 : width >= 480 ? 2 : 1);

export function TestimonialWall({
  items,
  columns = 3,
  speed = 28,
  pauseOnHover = true,
  label = "What customers say",
  className,
}: TestimonialWallProps) {
  const root = useRef<HTMLDivElement>(null);
  const cols = useRef<(HTMLDivElement | null)[]>([]);
  const tracks = useRef<(HTMLDivElement | null)[]>([]);
  const sets = useRef<(HTMLUListElement | null)[]>([]);
  const state = useRef<ColState[]>([]);
  const hover = useRef<boolean[]>([]);
  const hold = useRef<boolean[]>([]);
  const focus = useRef<boolean[]>([]);
  const [count, setCount] = useState<number>(columns);
  const [copies, setCopies] = useState<number[]>([]);
  const [reduced, setReduced] = useState(false);

  // Deal the quotes into columns: 1, 2, 3, 1, 2, 3 … so short and long ones mix in every column
  const dealt: Testimonial[][] = Array.from({ length: count }, (_, c) => items.filter((_, i) => i % count === c));

  // Latest props for the loop without restarting it
  const live = useRef({ speed, pauseOnHover, count });
  live.current = { speed, pauseOnHover, count };

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // Column count follows the wall's own width (before paint, so it never flashes the wrong layout)
  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const measure = () => setCount(fit(el.clientWidth, columns));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [columns]);

  // Measure every column: one set's height and how many copies cover the column plus one wrap
  useEffect(() => {
    if (reduced) return;
    const measure = () => {
      const next = dealt.map((_, i) => {
        const set = sets.current[i];
        const col = cols.current[i];
        if (!set || !col) return 2;
        // Layout px, not screen px – a CSS zoom or scale on an ancestor must not skew the wrap distance
        const scale = col.getBoundingClientRect().height / (col.offsetHeight || 1) || 1;
        const h = set.getBoundingClientRect().height / scale;
        const s = (state.current[i] ??= { y: h * (START[i] ?? 0), v: 0, h, drag: null, seek: 0 });
        // Keep the same spot within the set when its height changes (fewer columns, font load)
        if (s.h > 0 && h > 0 && s.h !== h) s.y = (s.y / s.h) * h;
        s.h = h;
        // Capped, as a guard against a column that isn't given a height
        return h > 0 ? Math.min(12, Math.ceil(col.clientHeight / h) + 1) : 2;
      });
      state.current.length = dealt.length;
      setCopies((prev) => (prev.length === next.length && prev.every((c, i) => c === next[i]) ? prev : next));
    };
    measure();
    const ro = new ResizeObserver(measure);
    for (const el of [...sets.current.slice(0, count), ...cols.current.slice(0, count)]) if (el) ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, count, items]);

  // The loop: one velocity per column that eases toward its target, so stops and starts are never abrupt
  useEffect(() => {
    const el = root.current;
    if (reduced || !el) return;
    let raf = 0;
    let last = 0;
    let visible = false;

    const frame = (now: number) => {
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now;
      const { speed, pauseOnHover, count } = live.current;
      for (let i = 0; i < count; i++) {
        const s = state.current[i];
        const track = tracks.current[i];
        if (!s || !track || s.h <= 0) continue;
        const pace = count === 1 ? 1 : PACE[i % 3]!;
        const stopped = hold.current[i] || focus.current[i] || (pauseOnHover && hover.current[i]);
        if (!s.drag) {
          const target = stopped ? 0 : speed * pace;
          // A fling coasts out; slowing down for hover is a little quicker than winding back up
          const fling = Math.abs(s.v - target) > Math.max(120, speed * 2);
          const tau = fling ? 0.55 : stopped ? 0.32 : 0.7;
          s.v += (target - s.v) * (1 - Math.exp(-dt / tau));
          s.y += s.v * dt;
          if (s.seek) {
            const step = s.seek * (1 - Math.exp(-dt / 0.12));
            s.y += step;
            s.seek = Math.abs(s.seek - step) < 0.5 ? 0 : s.seek - step;
          }
        }
        // While a card has keyboard focus the column may sit just outside one wrap (see onFocusCard);
        // otherwise the offset stays inside one set, where every copy looks the same
        s.y = focus.current[i] ? clamp(s.y, -s.h, s.h * 2) : mod(s.y, s.h);
        track.style.transform = `translate3d(0, ${-(s.h + s.y)}px, 0)`;
      }
      raf = visible ? requestAnimationFrame(frame) : 0;
    };

    // Runs only while on screen
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf) {
        last = 0;
        raf = requestAnimationFrame(frame);
      }
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [reduced]);

  /* ---------- Drag (mouse, pen) and press-and-hold (touch) ---------- */

  const onPointerDown = (i: number) => (e: React.PointerEvent<HTMLDivElement>) => {
    const s = state.current[i];
    if (!s) return;
    // Touch: the page keeps scrolling natively, a finger resting on a column just holds it still
    if (e.pointerType === "touch") {
      hold.current[i] = true;
      return;
    }
    if (e.button !== 0) return;
    s.drag = { id: e.pointerId, lastY: e.clientY, lastT: e.timeStamp, moved: 0, captured: false };
    s.v = 0;
  };

  const onPointerMove = (i: number) => (e: React.PointerEvent<HTMLDivElement>) => {
    const s = state.current[i];
    const d = s?.drag;
    if (!s || !d || d.id !== e.pointerId) return;
    const col = e.currentTarget;
    const scale = col.getBoundingClientRect().height / (col.offsetHeight || 1) || 1;
    const dy = (e.clientY - d.lastY) / scale;
    const dt = Math.max(1, e.timeStamp - d.lastT) / 1000;
    d.moved += Math.abs(dy);
    // Capture only once it is clearly a drag, so a plain click still focuses a card or follows a link
    if (!d.captured && d.moved > 4) {
      d.captured = true;
      col.setPointerCapture(e.pointerId);
      col.setAttribute("data-dragging", "");
    }
    s.y -= dy;
    // Smoothed release velocity in px/s
    s.v = s.v * 0.6 + (-dy / dt) * 0.4;
    d.lastY = e.clientY;
    d.lastT = e.timeStamp;
  };

  const onPointerUp = (i: number) => (e: React.PointerEvent<HTMLDivElement>) => {
    hold.current[i] = false;
    const s = state.current[i];
    const d = s?.drag;
    if (!s || !d || d.id !== e.pointerId) return;
    // A pause before letting go means no fling
    if (e.timeStamp - d.lastT > 80) s.v = 0;
    s.v = clamp(s.v, -2400, 2400);
    s.drag = null;
    e.currentTarget.removeAttribute("data-dragging");
    if (d.captured) {
      // Swallow the click that ends a drag, so a link inside a quote doesn't open
      const col = e.currentTarget;
      const stop = (ev: MouseEvent) => {
        ev.preventDefault();
        ev.stopPropagation();
      };
      col.addEventListener("click", stop, { capture: true, once: true });
      setTimeout(() => col.removeEventListener("click", stop, { capture: true }), 0);
    }
  };

  /* ---------- Keyboard: a focused card stops its column and is nudged into view ---------- */

  const onFocusCard = (i: number) => (e: React.FocusEvent<HTMLElement>) => {
    const s = state.current[i];
    const col = cols.current[i];
    if (reduced || !s || !col || s.h <= 0 || !e.currentTarget.matches(":focus-visible")) return;
    // Layout units: the card's place in its set, the column's height
    const li = e.currentTarget.parentElement as HTMLElement;
    const top = li.offsetTop;
    const h = e.currentTarget.offsetHeight;
    const viewH = col.clientHeight;
    const pad = Math.min(56, viewH * 0.12);
    // Only the real set is focusable; pick the wrap (one set up, here or one down) that is closest, so the
    // nudge is short – every copy looks the same, so the switch is invisible
    s.y = [s.y - s.h, s.y, s.y + s.h].reduce((best, y) =>
      Math.abs(top - y - viewH / 2) < Math.abs(top - best - viewH / 2) ? y : best,
    );
    const at = top - s.y;
    if (h > viewH - pad * 2 || at < pad) s.seek = at - pad;
    else if (at + h > viewH - pad) s.seek = at + h - (viewH - pad);
    else s.seek = 0;
  };

  const card = (t: Testimonial, i: number, interactive: boolean, key: string) => {
    // The dot stays with the role, so a wrap starts cleanly with the company
    const meta = [t.role, t.company].filter(Boolean).join("\u00a0· ");
    const stars = t.rating ? clamp(Math.round(t.rating), 1, 5) : 0;
    return (
      <li key={key} className="ui-tw__item">
        <figure
          className="ui-tw__card"
          tabIndex={interactive ? 0 : undefined}
          onFocus={interactive ? onFocusCard(i) : undefined}
        >
          {stars ? (
            <div className="ui-tw__stars" role="img" aria-label={`Rated ${stars} out of 5`}>
              {Array.from({ length: 5 }, (_, n) => (
                <svg key={n} viewBox="0 0 16 16" aria-hidden="true" data-on={n < stars || undefined}>
                  <path d="M8 1.6l1.9 3.95 4.35.6-3.17 3.03.78 4.32L8 11.43 4.14 13.5l.78-4.32L1.75 6.15l4.35-.6L8 1.6z" />
                </svg>
              ))}
            </div>
          ) : null}
          <blockquote className="ui-tw__quote">
            <p>{t.quote}</p>
          </blockquote>
          <figcaption className="ui-tw__who">
            {t.avatar ? (
              <img className="ui-tw__avatar" src={t.avatar} alt="" width={36} height={36} loading="lazy" decoding="async" draggable={false} />
            ) : (
              <span className="ui-tw__avatar ui-tw__avatar--initials" aria-hidden="true">
                {initials(t.name)}
              </span>
            )}
            <span className="ui-tw__id">
              <span className="ui-tw__name">
                <span className="ui-tw__name-text">{t.name}</span>
                {t.verified ? (
                  <svg className="ui-tw__verified" viewBox="0 0 16 16" role="img" aria-label="Verified customer">
                    <circle cx="8" cy="8" r="7" />
                    <path d="M5.2 8.1l1.9 1.9 3.7-3.8" fill="none" stroke="var(--ui-tw-card)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : null}
              </span>
              {meta ? <span className="ui-tw__meta">{meta}</span> : null}
            </span>
          </figcaption>
        </figure>
      </li>
    );
  };

  const cls = ["ui-tw", className].filter(Boolean).join(" ");

  return (
    <>
      <style href="ui-testimonial-wall" precedence="default">
        {css}
      </style>
      <div
        ref={root}
        className={cls}
        role="region"
        aria-label={label}
        data-cols={count}
        data-static={reduced || undefined}
        style={{ "--ui-tw-cols": count } as CSSProperties}
      >
        {dealt.map((list, i) =>
          reduced ? (
            // Reduced motion: a calm, static masonry – every quote once, nothing moves
            <div key={i} className="ui-tw__col">
              <ul className="ui-tw__set">{list.map((t, n) => card(t, i, true, String(n)))}</ul>
            </div>
          ) : (
            <div
              key={i}
              ref={(n) => {
                cols.current[i] = n;
              }}
              className="ui-tw__col"
              onPointerEnter={(e) => {
                if (e.pointerType !== "touch") hover.current[i] = true;
              }}
              onPointerLeave={() => (hover.current[i] = false)}
              onPointerDown={onPointerDown(i)}
              onPointerMove={onPointerMove(i)}
              onPointerUp={onPointerUp(i)}
              onPointerCancel={onPointerUp(i)}
              // Keyboard focus stops the column; a mouse click that focuses a card does not
              onFocus={(e) => (focus.current[i] = e.target.matches(":focus-visible"))}
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node | null)) focus.current[i] = false;
              }}
            >
              <div
                ref={(n) => {
                  tracks.current[i] = n;
                }}
                className="ui-tw__track"
                style={{ transform: `translate3d(0, ${-((state.current[i]?.h ?? 0) + (state.current[i]?.y ?? 0))}px, 0)` }}
              >
                {/* One copy above the real set and enough below it, so a nudge or a wrap never shows a gap */}
                {Array.from({ length: 1 + Math.max(2, copies[i] ?? 2) }, (_, c) => {
                  const real = c === 1;
                  return (
                    <ul
                      key={real ? "real" : c}
                      ref={
                        real
                          ? (n) => {
                              sets.current[i] = n;
                            }
                          : undefined
                      }
                      className="ui-tw__set"
                      // Only the real set is read out and reachable by Tab; the copies are decoration
                      aria-hidden={!real || undefined}
                      inert={!real || undefined}
                    >
                      {list.map((t, n) => card(t, i, real, `${c}-${n}`))}
                    </ul>
                  );
                })}
              </div>
            </div>
          ),
        )}
      </div>
    </>
  );
}

/* ---------- Styles ---------- */

const css = /* css */ `
.ui-tw {
  --ui-tw-card: #ffffff;
  --ui-tw-line: #ececec;
  --ui-tw-ink: #171717;
  --ui-tw-text: #404040;
  --ui-tw-muted: #8f8f8f;
  --ui-tw-faint: #b5b5b5;
  --ui-tw-star: #a3a3a8;
  --ui-tw-star-off: #e2e2e5;
  --ui-tw-initials: #f0f0f1;
  --ui-tw-shadow: 0 0 0 1px var(--ui-tw-line), 0 1px 2px rgba(0, 0, 0, 0.04);
  --ui-tw-lift: 0 0 0 1px var(--ui-tw-line), 0 2px 4px rgba(0, 0, 0, 0.03), 0 12px 28px -10px rgba(0, 0, 0, 0.14);
  --ui-tw-focus: #2f6bff;
  --ui-tw-gap: 16px;
  --ui-tw-fade: 96px;
  --ui-tw-dim: 0.62;
  --ui-tw-ease: cubic-bezier(0.22, 1, 0.36, 1);
  container-type: inline-size;
  display: grid;
  grid-template-columns: repeat(var(--ui-tw-cols, 3), minmax(0, 1fr));
  /* One row exactly as tall as the wall, so a column's height never follows its (repeated) content */
  grid-template-rows: minmax(0, 1fr);
  gap: var(--ui-tw-gap);
  width: 100%;
  min-width: 0;
  height: var(--ui-tw-height, 600px);
  /* Room at the sides for the lifted card's shadow; the wall clips everything else */
  padding-inline: 12px;
  box-sizing: border-box;
  overflow: hidden;
  -webkit-mask-image: linear-gradient(180deg, transparent, #000 var(--ui-tw-fade), #000 calc(100% - var(--ui-tw-fade)), transparent);
  mask-image: linear-gradient(180deg, transparent, #000 var(--ui-tw-fade), #000 calc(100% - var(--ui-tw-fade)), transparent);
  font-family: "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
}

.ui-tw__col {
  position: relative;
  min-width: 0;
  min-height: 0;
  height: 100%;
  cursor: grab;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
}
.ui-tw__col[data-dragging] { cursor: grabbing; }
.ui-tw__track { will-change: transform; }
.ui-tw__set {
  position: relative;
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  list-style: none;
}
/* Every card carries its gap below, so one set's height is exactly the wrap distance */
.ui-tw__item { margin-bottom: var(--ui-tw-gap); }

.ui-tw__card {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin: 0;
  padding: 18px 20px 18px;
  border-radius: 16px;
  background: var(--ui-tw-card);
  box-shadow: var(--ui-tw-shadow);
  color: var(--ui-tw-text);
  transition: transform 320ms var(--ui-tw-ease), box-shadow 320ms var(--ui-tw-ease), opacity 320ms var(--ui-tw-ease);
}
.ui-tw__card:focus { outline: none; }
.ui-tw__card:focus-visible { outline: 2px solid var(--ui-tw-focus); outline-offset: 2px; }

.ui-tw__stars { display: flex; gap: 2px; margin-bottom: -4px; }
.ui-tw__stars svg { width: 13px; height: 13px; fill: var(--ui-tw-star-off); }
.ui-tw__stars svg[data-on] { fill: var(--ui-tw-star); }

.ui-tw__quote { margin: 0; }
.ui-tw__quote p {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  letter-spacing: -0.006em;
  text-wrap: pretty;
  overflow-wrap: break-word;
}

.ui-tw__who { display: flex; align-items: center; gap: 10px; min-width: 0; }
.ui-tw__avatar {
  flex: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  background: var(--ui-tw-initials);
  /* A hairline ring keeps light photos from melting into the card */
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.05);
  pointer-events: none;
}
.ui-tw__avatar--initials {
  display: grid;
  place-items: center;
  font-size: 12.5px;
  font-weight: 600;
  letter-spacing: 0.01em;
  color: var(--ui-tw-muted);
}
.ui-tw__id { display: grid; gap: 1px; min-width: 0; }
.ui-tw__name {
  display: flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
  font-size: 13.5px;
  font-weight: 500;
  line-height: 18px;
  color: var(--ui-tw-ink);
}
/* The name wins over the role: it shrinks last and only then truncates */
.ui-tw__name-text { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ui-tw__verified { flex: none; width: 14px; height: 14px; fill: var(--ui-tw-faint); }
.ui-tw__meta {
  min-width: 0;
  overflow-wrap: break-word;
  font-size: 12.5px;
  line-height: 17px;
  color: var(--ui-tw-muted);
}

/* Hover: the card under the pointer lifts a little, the rest of the wall steps back */
@media (hover: hover) {
  .ui-tw__col:not([data-dragging]) .ui-tw__card:hover { transform: translateY(-3px); box-shadow: var(--ui-tw-lift); }
  .ui-tw:has(.ui-tw__col:not([data-dragging]) .ui-tw__card:hover) .ui-tw__card:not(:hover) { opacity: var(--ui-tw-dim); }
}
/* Keyboard focus gets the same lift */
.ui-tw__card:focus-visible { transform: translateY(-3px); box-shadow: var(--ui-tw-lift); }

/* Narrow walls (one column on phones): roomier, more readable quotes */
@container (max-width: 479px) {
  .ui-tw__card { padding: 18px 18px 18px; }
  .ui-tw__quote p { font-size: 15px; line-height: 1.58; }
}
@container (max-width: 739px) {
  .ui-tw__col { --ui-tw-gap: 14px; }
}

/* Reduced motion: a static masonry that shows every quote – no fixed height, no fade */
.ui-tw[data-static] {
  height: auto;
  grid-template-rows: auto;
  overflow: visible;
  -webkit-mask-image: none;
  mask-image: none;
}
.ui-tw[data-static] .ui-tw__col { height: auto; cursor: auto; user-select: auto; -webkit-user-select: auto; }

@media (prefers-reduced-motion: reduce) {
  .ui-tw__card { transition: none; }
}

/* Dark mode: follows a .dark class or data-theme="dark" on any ancestor, e.g. <html> */
:where(.dark, [data-theme="dark"]) .ui-tw {
  --ui-tw-card: #19191b;
  --ui-tw-line: #2a2a2e;
  --ui-tw-ink: #ededed;
  --ui-tw-text: #c8c8cc;
  --ui-tw-muted: #8b8b92;
  --ui-tw-faint: #6b6b72;
  --ui-tw-star: #7a7a82;
  --ui-tw-star-off: #2f2f34;
  --ui-tw-initials: #232327;
  --ui-tw-shadow: 0 0 0 1px var(--ui-tw-line);
  --ui-tw-lift: 0 0 0 1px #34343a, 0 12px 28px -10px rgba(0, 0, 0, 0.6);
  --ui-tw-focus: #6d8bff;
}
:where(.dark, [data-theme="dark"]) .ui-tw__avatar { box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.06); }
`;
