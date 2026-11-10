"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

/*
 * Logo Marquee (clean) – the endless "Trusted by" strip for landing pages, in a single self-contained file.
 * A calm white section: smaller marks in a quiet gray, generous even spacing instead of any lines, and long, soft
 * edge fades. Every row repeats its logos as often as the width needs and slides by a measured set width, so the
 * wrap has no gap and no jump. Speed is in px per second, the same on a phone and on a wide screen. One
 * requestAnimationFrame loop owns a velocity per row: hovering or focusing the strip eases it down to a stop,
 * leaving speeds it back up, and dragging or swiping scrubs it with inertia before it settles back into its own
 * pace. Only the logo under the pointer lifts to its brand colour. It only runs while on screen, and
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

/** First letter of a name as a whole grapheme, so "🦊 Fox" gives 🦊 and "Ølafur" gives Ø */
function initial(name: string) {
  const text = name.trim();
  if (!text) return "?";
  const first =
    typeof Intl !== "undefined" && "Segmenter" in Intl
      ? new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(text)[Symbol.iterator]().next().value?.segment
      : Array.from(text)[0];
  return (first ?? "?").toLocaleUpperCase();
}

/**
 * The mark: the svg, else the image, else – when there is no visible name next to it – a letter tile, so a logo
 * without artwork (or with an image that fails to load) never leaves an empty gap in the strip.
 */
function Mark({ logo, named }: { logo: MarqueeLogo; named: boolean }) {
  const [failed, setFailed] = useState(false);
  const mark = logo.svg ?? (logo.src && !failed ? <img src={logo.src} alt="" draggable={false} onError={() => setFailed(true)} /> : null);
  if (!mark && named) return null;
  return (
    <span className="ui-lmc__mark" aria-hidden="true">
      {mark ?? <span className="ui-lmc__tile">{initial(logo.name)}</span>}
    </span>
  );
}

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

  const item = (logo: MarqueeLogo, i: number, interactive: boolean, index: number) => {
    const body = (
      <>
        <Mark logo={logo} named={labels !== "none"} />
        {labels !== "none" ? (
          <span className="ui-lmc__name" title={logo.name}>
            {logo.name}
          </span>
        ) : (
          <span className="ui-lmc__sr">{logo.name}</span>
        )}
      </>
    );
    return (
      <li
        // Index in the key too – two logos may share a name
        key={`${index}-${logo.name}`}
        className="ui-lmc__item"
        style={{ "--ui-lmc-brand": logo.color, "--ui-lmc-scale": logo.scale } as CSSProperties}
      >
        {logo.href ? (
          <a
            className="ui-lmc__link"
            href={logo.href}
            draggable={false}
            tabIndex={interactive ? undefined : -1}
            onFocus={interactive ? onFocusItem(i) : undefined}
          >
            {body}
          </a>
        ) : (
          <span className="ui-lmc__link">{body}</span>
        )}
      </li>
    );
  };

  /* ---------- Keyboard: arrows step between linked logos, or scrub a strip without links ---------- */

  const hasLinks = logos.some((l) => l.href);
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    const back = e.key === "ArrowLeft";
    if (e.target instanceof HTMLAnchorElement) {
      const list = Array.from(e.target.closest("ul")?.querySelectorAll<HTMLAnchorElement>("a[href]") ?? []);
      const next = list[list.indexOf(e.target) + (back ? -1 : 1)];
      if (next) {
        e.preventDefault();
        next.focus();
      }
      return;
    }
    if (reduced || e.target !== e.currentTarget) return;
    e.preventDefault();
    for (const s of state.current) if (s) s.seek += back ? -160 : 160;
  };

  // Nothing to show – no empty, labelled region
  if (logos.length === 0) return null;

  const vars = { "--ui-lmc-gap": `${gap}px` } as CSSProperties;
  const cls = ["ui-lmc", className].filter(Boolean).join(" ");

  return (
    <>
      <style href="ui-logo-marquee-clean" precedence="default">
        {css}
      </style>
      <div
        ref={root}
        className={cls}
        style={vars}
        role="region"
        aria-label={label}
        // Without links the strip itself is one tab stop: focus pauses it and the arrows scrub it
        tabIndex={!hasLinks && !reduced ? 0 : undefined}
        onKeyDown={onKeyDown}
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
          <ul className="ui-lmc__wrap">{logos.map((l, k) => item(l, 0, true, k))}</ul>
        ) : (
          split.map((row, i) => (
            <div
              key={i}
              ref={(n) => {
                views.current[i] = n;
              }}
              className="ui-lmc__row"
              onPointerDown={onPointerDown(i)}
              onPointerMove={onPointerMove(i)}
              onPointerUp={onPointerUp(i)}
              onPointerCancel={onPointerUp(i)}
            >
              <div
                ref={(n) => {
                  tracks.current[i] = n;
                }}
                className="ui-lmc__track"
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
                    className="ui-lmc__set"
                    // Only the first set is read out and reachable by Tab; the copies are decoration
                    aria-hidden={c > 0 || undefined}
                    inert={c > 0 || undefined}
                  >
                    {row.logos.map((l, k) => item(l, i, c === 0, k))}
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
.ui-lmc {
  --ui-lmc-focus: var(--aui-focus, rgba(0, 96, 226, 0.7));
  --ui-lmc-h: 24px;
  --ui-lmc-g: var(--ui-lmc-gap, 56px);
  --ui-lmc-row-gap: 24px;
  --ui-lmc-fade: min(20%, 168px);
  --ui-lmc-muted: rgba(0, 0, 0, 0.36);
  --ui-lmc-ink: rgba(0, 0, 0, 0.88);
  --ui-lmc-label: var(--aui-muted, rgba(0, 0, 0, 0.45));
  --ui-lmc-dim: 0.6;
  --ui-lmc-accent: var(--aui-info, #0070d6);
  --ui-lmc-tile: #fff;
  --ui-lmc-tile-ink: rgba(0, 0, 0, 0.61);
  --ui-lmc-shadow: 0 0 0 0.5px rgba(0, 0, 0, 0.06), 0 1px 1px -1px rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --ui-lmc-ease: var(--aui-ease, cubic-bezier(0.22, 1, 0.36, 1));
  container-type: inline-size;
  display: grid;
  gap: var(--ui-lmc-row-gap);
  width: 100%;
  min-width: 0;
  font-family: var(--aui-font, "Inter", "InterVariable", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif);
  font-size: 13px;
  line-height: 20px;
  -webkit-font-smoothing: antialiased;
}
.ui-lmc *, .ui-lmc *::before, .ui-lmc *::after { box-sizing: border-box; }
/* Narrow containers (phones): smaller logos, tighter gaps */
@container (max-width: 520px) {
  .ui-lmc__row, .ui-lmc__wrap { --ui-lmc-h: 20px; --ui-lmc-g: calc(var(--ui-lmc-gap, 56px) * 0.62); }
  .ui-lmc { --ui-lmc-row-gap: 20px; }
}

.ui-lmc__row {
  overflow: hidden;
  /* Vertical page scroll stays native; horizontal swipes scrub the strip */
  touch-action: pan-y;
  cursor: grab;
  user-select: none;
  -webkit-user-select: none;
  /* A long, eased fade – the marks dissolve into the white instead of hitting an edge */
  -webkit-mask-image: linear-gradient(90deg, transparent 0, rgba(0, 0, 0, 0.35) calc(var(--ui-lmc-fade) * 0.4), #000 var(--ui-lmc-fade), #000 calc(100% - var(--ui-lmc-fade)), rgba(0, 0, 0, 0.35) calc(100% - var(--ui-lmc-fade) * 0.4), transparent 100%);
  mask-image: linear-gradient(90deg, transparent 0, rgba(0, 0, 0, 0.35) calc(var(--ui-lmc-fade) * 0.4), #000 var(--ui-lmc-fade), #000 calc(100% - var(--ui-lmc-fade)), rgba(0, 0, 0, 0.35) calc(100% - var(--ui-lmc-fade) * 0.4), transparent 100%);
  /* Room for focus rings so they aren't clipped */
  padding-block: 8px;
}
.ui-lmc__row[data-dragging] { cursor: grabbing; }
.ui-lmc__track {
  display: flex;
  width: max-content;
  will-change: transform;
}
.ui-lmc__set,
.ui-lmc__wrap {
  display: flex;
  align-items: center;
  margin: 0;
  padding: 0;
  list-style: none;
}
.ui-lmc__set { flex: none; }
/* Every logo carries its gap on the right, so one set's width is exactly the wrap distance */
.ui-lmc__item { flex: none; margin-inline-end: var(--ui-lmc-g); }

.ui-lmc__link {
  display: flex;
  align-items: center;
  gap: calc(var(--ui-lmc-h) * 0.36);
  border-radius: 6px;
  color: var(--ui-lmc-muted);
  text-decoration: none;
  transition: color 240ms var(--ui-lmc-ease), opacity 240ms var(--ui-lmc-ease);
  -webkit-user-drag: none;
}
.ui-lmc[data-labels="below"] .ui-lmc__link { flex-direction: column; gap: 8px; }
.ui-lmc:focus-visible { outline: 2px solid var(--ui-lmc-focus); outline-offset: -2px; }
.ui-lmc__link:focus-visible { outline: 2px solid var(--ui-lmc-focus); outline-offset: 2px; }

/* Consistent optical height: every mark fills the same box, nudged by its own scale */
.ui-lmc__mark {
  display: grid;
  place-items: center;
  height: var(--ui-lmc-h);
  transition: color 240ms var(--ui-lmc-ease);
}
.ui-lmc__mark > svg,
.ui-lmc__mark > img {
  display: block;
  height: calc(var(--ui-lmc-h) * var(--ui-lmc-scale, 1));
  width: auto;
  max-width: calc(var(--ui-lmc-h) * 5);
  pointer-events: none;
}
.ui-lmc__name {
  /* A long company name ends in an ellipsis; the full name is in the title */
  max-width: calc(var(--ui-lmc-h) * 9);
  overflow: hidden;
  font-size: calc(var(--ui-lmc-h) * 0.66);
  font-weight: 500;
  letter-spacing: -0.01em;
  line-height: 1.2;
  white-space: nowrap;
  text-overflow: ellipsis;
}
/* A logo without artwork: a small white tile with a hairline shadow and its first letter */
.ui-lmc__tile {
  display: grid;
  place-items: center;
  width: var(--ui-lmc-h);
  height: var(--ui-lmc-h);
  border-radius: 6px;
  background: var(--ui-lmc-tile);
  box-shadow: var(--ui-lmc-shadow);
  color: var(--ui-lmc-tile-ink);
  font-size: calc(var(--ui-lmc-h) * 0.5);
  font-weight: 500;
  line-height: 1;
}
.ui-lmc[data-labels="below"] .ui-lmc__name {
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;
  letter-spacing: 0;
  color: var(--ui-lmc-label);
}
.ui-lmc__sr {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

/* Grayscale: quiet gray marks, images without colour – the hovered logo lifts to its brand colour */
.ui-lmc[data-grayscale] .ui-lmc__mark > img { filter: grayscale(1); opacity: 0.5; transition: filter 240ms var(--ui-lmc-ease), opacity 240ms var(--ui-lmc-ease); }
.ui-lmc:not([data-grayscale]) .ui-lmc__mark { color: var(--ui-lmc-brand, var(--ui-lmc-ink)); }
.ui-lmc:not([data-grayscale]) .ui-lmc__link { color: var(--ui-lmc-ink); }
@media (hover: hover) {
  .ui-lmc__link:hover,
  .ui-lmc__link:focus-visible { color: var(--ui-lmc-ink); }
  .ui-lmc[data-grayscale] .ui-lmc__link:hover .ui-lmc__mark,
  .ui-lmc[data-grayscale] .ui-lmc__link:focus-visible .ui-lmc__mark { color: var(--ui-lmc-brand, var(--ui-lmc-ink)); }
  .ui-lmc[data-grayscale] .ui-lmc__link:hover img { filter: none; opacity: 1; }
  /* Full colour: the others step back while one is hovered */
  .ui-lmc:not([data-grayscale]) .ui-lmc__set:has(.ui-lmc__link:hover) .ui-lmc__link:not(:hover) { opacity: var(--ui-lmc-dim); }
  /* No colour flicker under the pointer while scrubbing */
  .ui-lmc[data-grayscale] .ui-lmc__row[data-dragging] .ui-lmc__link { color: var(--ui-lmc-muted); }
  .ui-lmc[data-grayscale] .ui-lmc__row[data-dragging] .ui-lmc__mark { color: inherit; }
}

/* Reduced motion: a static, centred, wrapping row */
.ui-lmc__wrap {
  flex-wrap: wrap;
  justify-content: center;
  row-gap: calc(var(--ui-lmc-g) * 0.5);
  padding: 8px 16px;
}
.ui-lmc__wrap .ui-lmc__item { margin-inline: calc(var(--ui-lmc-g) * 0.5); }

@media (pointer: coarse) {
  /* Bigger touch targets for linked logos */
  a.ui-lmc__link { min-height: 44px; padding-inline: 4px; }
}
@media (prefers-reduced-motion: reduce) {
  .ui-lmc__link, .ui-lmc__mark, .ui-lmc__mark > img { transition: none; }
}

/* Dark mode: follows a .dark class or data-theme="dark" on any ancestor, e.g. <html> */
:where(.dark, [data-theme="dark"]) .ui-lmc {
  --ui-lmc-focus: var(--aui-focus, rgba(77, 141, 255, 0.8));
  --ui-lmc-muted: rgba(255, 255, 255, 0.4);
  --ui-lmc-ink: rgba(255, 255, 255, 0.88);
  --ui-lmc-label: var(--aui-muted, rgba(255, 255, 255, 0.45));
  --ui-lmc-accent: var(--aui-info, #4fb0fe);
  --ui-lmc-tile: #1c1c1e;
  --ui-lmc-tile-ink: rgba(255, 255, 255, 0.61);
  --ui-lmc-shadow: 0 0 0 0.5px rgba(255, 255, 255, 0.08), 0 1px 2px 0 rgba(0, 0, 0, 0.4);
}
`;
