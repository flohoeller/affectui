"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

/*
 * Logo Marquee – the endless "Trusted by" strip for landing pages, in a single self-contained file.
 * Every row repeats its logos as often as the width needs and slides by a measured set width, so the wrap has no
 * gap and no jump. Speed is in px per second, the same on a phone and on a wide screen. One requestAnimationFrame
 * loop owns a velocity per row: hovering or focusing the strip eases it down to a stop, leaving speeds it back up,
 * and dragging or swiping scrubs it with inertia before it settles back into its own pace. Logos sit muted and
 * monochrome; the one under the pointer lifts to full colour. It only runs while on screen, and
 * prefers-reduced-motion shows a static, wrapping row instead. The styles are injected below.
 */

export type MarqueeLogo = {
  /** Brand name – the accessible name, and the visible label when `labels` is on */
  name: string;
  /** The mark, ideally an <svg> with fill="currentColor" so it follows the muted colour */
  svg?: ReactNode;
  /** An image instead of `svg` (shown grayscale until hovered when `grayscale` is on) */
  src?: string;
  /** Brand colour the mark lifts to on hover, e.g. "#635BFF" – leave out for black marks like Vercel or GitHub */
  color?: string;
  /** Optical size correction, e.g. 0.9 for a heavy round mark – 1 by default */
  scale?: number;
  /** Turns the logo into a link */
  href?: string;
};

export type LogoMarqueeProps = {
  logos: MarqueeLogo[];
  /** Pixels per second, independent of the strip's width */
  speed?: number;
  /** Which way the first row runs; a second row runs the other way */
  direction?: "left" | "right";
  /** 1, or 2 for a second row in the opposite direction (the logos are split between the rows) */
  rows?: 1 | 2;
  /** Space between logos in px (smaller on narrow containers) */
  gap?: number;
  /** Ease to a stop while the pointer is over the strip or it has keyboard focus */
  pauseOnHover?: boolean;
  /** Muted, colourless logos that lift to full colour on hover */
  grayscale?: boolean;
  /** Show the brand name under each mark or beside it, like a wordmark */
  labels?: "none" | "below" | "beside";
  /** Accessible name of the strip */
  label?: string;
  className?: string;
};

type Row = {
  logos: MarqueeLogo[];
  /** Run direction: 1 = content moves left, -1 = right */
  dir: 1 | -1;
};

/** Motion state of one row, kept outside React so the loop never re-renders */
type RowState = {
  x: number;
  v: number;
  /** Width of one set, including its trailing gap – the wrap distance */
  w: number;
  drag: null | { id: number; lastX: number; lastT: number; moved: number; captured: boolean };
  /** Pending nudge (px) to bring a focused logo into view */
  seek: number;
};

const mod = (n: number, m: number) => (m > 0 ? ((n % m) + m) % m : 0);
const clamp = (n: number, a: number, b: number) => Math.min(b, Math.max(a, n));

export function LogoMarquee({
  logos,
  speed = 40,
  direction = "left",
  rows = 1,
  gap = 56,
  pauseOnHover = true,
  grayscale = true,
  labels = "none",
  label = "Logos of companies using the product",
  className,
}: LogoMarqueeProps) {
  const root = useRef<HTMLDivElement>(null);
  const tracks = useRef<(HTMLDivElement | null)[]>([]);
  const sets = useRef<(HTMLUListElement | null)[]>([]);
  const views = useRef<(HTMLDivElement | null)[]>([]);
  const state = useRef<RowState[]>([]);
  const hover = useRef(false);
  const focus = useRef(false);
  const [copies, setCopies] = useState<number[]>([]);
  const [reduced, setReduced] = useState(false);

  // Two rows split the logos alternately, so each row shows different brands
  const split: Row[] =
    rows === 2 && logos.length > 1
      ? [
          { logos: logos.filter((_, i) => i % 2 === 0), dir: direction === "left" ? 1 : -1 },
          { logos: logos.filter((_, i) => i % 2 === 1), dir: direction === "left" ? -1 : 1 },
        ]
      : [{ logos, dir: direction === "left" ? 1 : -1 }];

  // Latest props for the loop without restarting it
  const live = useRef({ speed, pauseOnHover, split });
  live.current = { speed, pauseOnHover, split };

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // Measure every row: one set's width and how many copies cover the viewport plus one wrap
  useEffect(() => {
    if (reduced) return;
    const measure = () => {
      const next = split.map((_, i) => {
        const set = sets.current[i];
        const view = views.current[i];
        if (!set || !view) return 2;
        const w = set.getBoundingClientRect().width;
        const s = (state.current[i] ??= { x: i * w * 0.5, v: 0, w, drag: null, seek: 0 });
        // Keep the same spot within the set when the width changes (container query, font load)
        if (s.w > 0 && w > 0 && s.w !== w) s.x = (s.x / s.w) * w;
        s.w = w;
        return w > 0 ? Math.ceil(view.clientWidth / w) + 1 : 2;
      });
      setCopies((prev) => (prev.length === next.length && prev.every((c, i) => c === next[i]) ? prev : next));
    };
    measure();
    const ro = new ResizeObserver(measure);
    for (const el of [...sets.current, ...views.current]) if (el) ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, split.length, logos, gap, labels]);

  // The loop: one velocity per row that eases toward its target, so stops and starts are never abrupt
  useEffect(() => {
    const el = root.current;
    if (reduced || !el) return;
    let raf = 0;
    let last = 0;
    let visible = false;

    const frame = (now: number) => {
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now;
      const { speed, pauseOnHover, split } = live.current;
      const stopped = pauseOnHover && (hover.current || focus.current);
      split.forEach((row, i) => {
        const s = state.current[i];
        const track = tracks.current[i];
        if (!s || !track || s.w <= 0) return;
        if (!s.drag) {
          const target = stopped ? 0 : speed * row.dir;
          // A fling coasts out; slowing down for hover is a little quicker than winding back up
          const fling = Math.abs(s.v - target) > Math.max(120, speed * 2);
          const tau = fling ? 0.55 : stopped ? 0.32 : 0.7;
          s.v += (target - s.v) * (1 - Math.exp(-dt / tau));
          s.x += s.v * dt;
          if (s.seek) {
            const step = s.seek * (1 - Math.exp(-dt / 0.12));
            s.x += step;
            s.seek = Math.abs(s.seek - step) < 0.5 ? 0 : s.seek - step;
          }
        }
        s.x = mod(s.x, s.w);
        track.style.transform = `translate3d(${-s.x}px, 0, 0)`;
      });
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

  /* ---------- Drag / swipe ---------- */

  const onPointerDown = (i: number) => (e: React.PointerEvent<HTMLDivElement>) => {
    const s = state.current[i];
    if (!s || (e.pointerType === "mouse" && e.button !== 0)) return;
    s.drag = { id: e.pointerId, lastX: e.clientX, lastT: e.timeStamp, moved: 0, captured: false };
    s.v = 0;
  };

  const onPointerMove = (i: number) => (e: React.PointerEvent<HTMLDivElement>) => {
    const s = state.current[i];
    const d = s?.drag;
    if (!s || !d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.lastX;
    const dt = Math.max(1, e.timeStamp - d.lastT) / 1000;
    d.moved += Math.abs(dx);
    // Capture only once it is clearly a drag, so plain clicks on links still work
    if (!d.captured && d.moved > 4) {
      d.captured = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      e.currentTarget.setAttribute("data-dragging", "");
    }
    s.x -= dx;
    // Smoothed release velocity in px/s
    s.v = s.v * 0.6 + (-dx / dt) * 0.4;
    d.lastX = e.clientX;
    d.lastT = e.timeStamp;
  };

  const onPointerUp = (i: number) => (e: React.PointerEvent<HTMLDivElement>) => {
    const s = state.current[i];
    const d = s?.drag;
    if (!s || !d || d.id !== e.pointerId) return;
    // A pause before letting go means no fling
    if (e.timeStamp - d.lastT > 80) s.v = 0;
    s.v = clamp(s.v, -2400, 2400);
    s.drag = null;
    e.currentTarget.removeAttribute("data-dragging");
    if (d.captured) {
      // Swallow the click that ends a drag, so a link under the pointer doesn't open
      const view = e.currentTarget;
      const stop = (ev: MouseEvent) => {
        ev.preventDefault();
        ev.stopPropagation();
      };
      view.addEventListener("click", stop, { capture: true, once: true });
      setTimeout(() => view.removeEventListener("click", stop, { capture: true }), 0);
    }
  };

  /* ---------- Keyboard: a focused logo is nudged into view ---------- */

  const onFocusItem = (i: number) => (e: React.FocusEvent<HTMLElement>) => {
    const s = state.current[i];
    const view = views.current[i];
    if (reduced || !s || !view) return;
    const v = view.getBoundingClientRect();
    const r = e.currentTarget.getBoundingClientRect();
    const pad = Math.min(96, v.width * 0.15);
    if (r.left < v.left + pad) s.seek = r.left - (v.left + pad);
    else if (r.right > v.right - pad) s.seek = r.right - (v.right - pad);
  };

  const item = (logo: MarqueeLogo, i: number, interactive: boolean) => {
    const mark = logo.svg ?? (logo.src ? <img src={logo.src} alt="" draggable={false} /> : null);
    const body = (
      <>
        <span className="ui-lm__mark" aria-hidden="true">
          {mark}
        </span>
        {labels !== "none" ? <span className="ui-lm__name">{logo.name}</span> : <span className="ui-lm__sr">{logo.name}</span>}
      </>
    );
    return (
      <li
        key={logo.name}
        className="ui-lm__item"
        style={{ "--ui-lm-brand": logo.color, "--ui-lm-scale": logo.scale } as CSSProperties}
      >
        {logo.href ? (
          <a
            className="ui-lm__link"
            href={logo.href}
            draggable={false}
            tabIndex={interactive ? undefined : -1}
            onFocus={interactive ? onFocusItem(i) : undefined}
          >
            {body}
          </a>
        ) : (
          <span className="ui-lm__link">{body}</span>
        )}
      </li>
    );
  };

  const vars = { "--ui-lm-gap": `${gap}px` } as CSSProperties;
  const cls = ["ui-lm", className].filter(Boolean).join(" ");

  return (
    <>
      <style href="ui-logo-marquee" precedence="default">
        {css}
      </style>
      <div
        ref={root}
        className={cls}
        style={vars}
        role="region"
        aria-label={label}
        data-labels={labels}
        data-grayscale={grayscale || undefined}
        data-static={reduced || undefined}
        onPointerEnter={(e) => {
          if (e.pointerType !== "touch") hover.current = true;
        }}
        onPointerLeave={() => (hover.current = false)}
        // Keyboard focus stops the strip; a mouse click that focuses a link does not
        onFocus={(e) => (focus.current = e.target.matches(":focus-visible"))}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) focus.current = false;
        }}
      >
        {reduced ? (
          // Reduced motion: one calm, wrapping row – nothing moves
          <ul className="ui-lm__wrap">{logos.map((l) => item(l, 0, true))}</ul>
        ) : (
          split.map((row, i) => (
            <div
              key={i}
              ref={(n) => {
                views.current[i] = n;
              }}
              className="ui-lm__row"
              onPointerDown={onPointerDown(i)}
              onPointerMove={onPointerMove(i)}
              onPointerUp={onPointerUp(i)}
              onPointerCancel={onPointerUp(i)}
            >
              <div
                ref={(n) => {
                  tracks.current[i] = n;
                }}
                className="ui-lm__track"
              >
                {Array.from({ length: Math.max(2, copies[i] ?? 2) }, (_, c) => (
                  <ul
                    key={c}
                    ref={
                      c === 0
                        ? (n) => {
                            sets.current[i] = n;
                          }
                        : undefined
                    }
                    className="ui-lm__set"
                    // Only the first set is read out and reachable by Tab; the copies are decoration
                    aria-hidden={c > 0 || undefined}
                    inert={c > 0 || undefined}
                  >
                    {row.logos.map((l) => item(l, i, c === 0))}
                  </ul>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}

/* ---------- Styles ---------- */

const css = /* css */ `
.ui-lm {
  --ui-lm-h: 28px;
  --ui-lm-g: var(--ui-lm-gap, 56px);
  --ui-lm-row-gap: 20px;
  --ui-lm-fade: min(14%, 120px);
  --ui-lm-muted: #9a9a9a;
  --ui-lm-ink: #171717;
  --ui-lm-label: #8f8f8f;
  --ui-lm-dim: 0.75;
  --ui-lm-focus: #2f6bff;
  --ui-lm-ease: cubic-bezier(0.22, 1, 0.36, 1);
  container-type: inline-size;
  display: grid;
  gap: var(--ui-lm-row-gap);
  width: 100%;
  min-width: 0;
  font-family: "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
}
/* Narrow containers (phones): smaller logos, tighter gaps */
@container (max-width: 520px) {
  .ui-lm__row, .ui-lm__wrap { --ui-lm-h: 22px; --ui-lm-g: calc(var(--ui-lm-gap, 56px) * 0.62); }
}

.ui-lm__row {
  overflow: hidden;
  /* Vertical page scroll stays native; horizontal swipes scrub the strip */
  touch-action: pan-y;
  cursor: grab;
  user-select: none;
  -webkit-user-select: none;
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 var(--ui-lm-fade), #000 calc(100% - var(--ui-lm-fade)), transparent);
  mask-image: linear-gradient(90deg, transparent, #000 var(--ui-lm-fade), #000 calc(100% - var(--ui-lm-fade)), transparent);
  /* Room for focus rings so they aren't clipped */
  padding-block: 6px;
}
.ui-lm__row[data-dragging] { cursor: grabbing; }
.ui-lm__track {
  display: flex;
  width: max-content;
  will-change: transform;
}
.ui-lm__set,
.ui-lm__wrap {
  display: flex;
  align-items: center;
  margin: 0;
  padding: 0;
  list-style: none;
}
.ui-lm__set { flex: none; }
/* Every logo carries its gap on the right, so one set's width is exactly the wrap distance */
.ui-lm__item { flex: none; margin-inline-end: var(--ui-lm-g); }

.ui-lm__link {
  display: flex;
  align-items: center;
  gap: calc(var(--ui-lm-h) * 0.32);
  border-radius: 8px;
  color: var(--ui-lm-muted);
  text-decoration: none;
  transition: color 260ms var(--ui-lm-ease), opacity 260ms var(--ui-lm-ease), filter 260ms var(--ui-lm-ease);
  -webkit-user-drag: none;
}
.ui-lm[data-labels="below"] .ui-lm__link { flex-direction: column; gap: 8px; }
.ui-lm__link:focus-visible { outline: 2px solid var(--ui-lm-focus); outline-offset: 4px; }

/* Consistent optical height: every mark fills the same box, nudged by its own scale */
.ui-lm__mark {
  display: grid;
  place-items: center;
  height: var(--ui-lm-h);
  transition: color 260ms var(--ui-lm-ease);
}
.ui-lm__mark > svg,
.ui-lm__mark > img {
  display: block;
  height: calc(var(--ui-lm-h) * var(--ui-lm-scale, 1));
  width: auto;
  max-width: calc(var(--ui-lm-h) * 5);
  pointer-events: none;
}
.ui-lm__name {
  font-size: calc(var(--ui-lm-h) * 0.68);
  font-weight: 600;
  letter-spacing: -0.025em;
  line-height: 1;
  white-space: nowrap;
}
.ui-lm[data-labels="below"] .ui-lm__name {
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0;
  color: var(--ui-lm-label);
}
.ui-lm__sr {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

/* Grayscale: muted marks, images without colour – the hovered logo lifts to its brand colour */
.ui-lm[data-grayscale] .ui-lm__mark > img { filter: grayscale(1); opacity: 0.6; transition: filter 260ms var(--ui-lm-ease), opacity 260ms var(--ui-lm-ease); }
.ui-lm:not([data-grayscale]) .ui-lm__mark { color: var(--ui-lm-brand, var(--ui-lm-ink)); }
.ui-lm:not([data-grayscale]) .ui-lm__link { color: var(--ui-lm-ink); }
@media (hover: hover) {
  .ui-lm__link:hover,
  .ui-lm__link:focus-visible { color: var(--ui-lm-ink); }
  .ui-lm[data-grayscale] .ui-lm__link:hover .ui-lm__mark,
  .ui-lm[data-grayscale] .ui-lm__link:focus-visible .ui-lm__mark { color: var(--ui-lm-brand, var(--ui-lm-ink)); }
  .ui-lm[data-grayscale] .ui-lm__link:hover img { filter: none; opacity: 1; }
  /* Full colour: the others step back a little while one is hovered */
  .ui-lm:not([data-grayscale]) .ui-lm__set:has(.ui-lm__link:hover) .ui-lm__link:not(:hover) { opacity: var(--ui-lm-dim); }
  /* No colour flicker under the pointer while scrubbing */
  .ui-lm[data-grayscale] .ui-lm__row[data-dragging] .ui-lm__link { color: var(--ui-lm-muted); }
  .ui-lm[data-grayscale] .ui-lm__row[data-dragging] .ui-lm__mark { color: inherit; }
}

/* Reduced motion: a static, centred, wrapping row */
.ui-lm__wrap {
  flex-wrap: wrap;
  justify-content: center;
  row-gap: calc(var(--ui-lm-g) * 0.5);
  padding-inline: 8px;
}
.ui-lm__wrap .ui-lm__item { margin-inline: calc(var(--ui-lm-g) * 0.5); }

@media (hover: none) and (pointer: coarse) {
  /* Bigger touch targets for linked logos */
  a.ui-lm__link { min-height: 40px; }
}
@media (prefers-reduced-motion: reduce) {
  .ui-lm__link, .ui-lm__mark, .ui-lm__mark > img { transition: none; }
}

/* Dark mode: follows a .dark class or data-theme="dark" on any ancestor, e.g. <html> */
:where(.dark, [data-theme="dark"]) .ui-lm {
  --ui-lm-muted: #7a7a82;
  --ui-lm-ink: #ededed;
  --ui-lm-label: #8b8b92;
  --ui-lm-focus: #6d8bff;
}
`;
