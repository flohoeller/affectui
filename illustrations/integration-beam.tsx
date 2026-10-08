"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, type FocusEvent, type PointerEvent, type ReactNode } from "react";

/*
 * Integration Beam – an animated product scene, in a single self-contained file.
 * Your product sits in the middle, three tools on each side, joined by curved beams. In sync cycles,
 * soft light pulses travel from the tools on the left into the product and on out to the tools on the
 * right; every arrival makes the target glow. Hover a tool to bring its beam forward, click it to
 * pause it. The beams are measured from the real tile positions, so the scene reflows with its
 * container – on narrow widths the tools stack above and below and the curves morph into place.
 */

export type BeamTool = {
  /** Shown in the tooltip and read to screen readers, e.g. "Slack" */
  name: string;
  /** Logo, drawn into a 28 × 28 box (an <svg> fills the box) */
  logo: ReactNode;
};

export type BeamCenter = {
  /** Your product's name, used in the accessible description */
  name: string;
  /** Your mark, drawn into a 36 × 36 box on the dark tile – a neutral flower when left out */
  logo?: ReactNode;
};

export type IntegrationBeamProps = {
  /** Tools that send data in (left, or above on narrow widths) – three look best */
  left?: BeamTool[];
  /** Tools that receive data (right, or below on narrow widths) – three look best */
  right?: BeamTool[];
  /** The product in the middle */
  center?: BeamCenter;
  className?: string;
  /** Accessible description of the scene */
  label?: string;
};

/* Choreography, in ms */
const TRAVEL = 1500; // one pulse, end to end
const STAGGER = 280; // between the pulses of one wave
const REST = 1500; // quiet time between two sync cycles
const MORPH = 460; // tiles and curves gliding to a new layout
const FLASH = 1400; // tooltip shown after a tap
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

/** Easing of the morph – the same curve as EASE (it's easeOutQuint), so curves and tiles move together */
const easeOut = (t: number) => 1 - (1 - t) ** 5;
/** Pulses glide in and out softly instead of shooting off */
const easeInOut = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;

// useLayoutEffect measures before the first paint; on the server it simply never runs
const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

type Point = { x: number; y: number };
/** A cubic curve as 8 numbers: start, two control points, end – one shape, so any two can be blended */
type Curve = number[];

export function IntegrationBeam({
  left = DEFAULT_LEFT,
  right = DEFAULT_RIGHT,
  center = DEFAULT_CENTER,
  className,
  label,
}: IntegrationBeamProps) {
  const uid = "ui-ib" + useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const tools = [...left, ...right];
  const n = tools.length;
  const nLeft = left.length;

  const [off, setOff] = useState<ReadonlySet<number>>(() => new Set());
  const [focus, setFocus] = useState<number | null>(null);
  const [flash, setFlash] = useState<number | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [announce, setAnnounce] = useState("");

  const rootRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);
  const centerRingRef = useRef<HTMLSpanElement>(null);
  const chipRef = useRef<HTMLSpanElement>(null);
  const chipInnerRef = useRef<HTMLSpanElement>(null);
  const toolRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const ringRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const lineRefs = useRef<(SVGPathElement | null)[]>([]);
  const pulseRefs = useRef<(SVGGElement | null)[]>([]);
  const gradRefs = useRef<(SVGLinearGradientElement | null)[]>([]);
  const flashTimer = useRef(0);
  // The animation loop reads the paused tools without restarting
  const offRef = useRef(off);
  offRef.current = off;

  const connected = n - off.size;
  const status = connected === 0 ? "All paused" : syncing ? "Syncing…" : `${connected} connected`;

  /* ---------- Beams: measure, morph, pulses ---------- */
  useIsoLayoutEffect(() => {
    const root = rootRef.current;
    const scene = sceneRef.current;
    const svg = svgRef.current;
    const hub = centerRef.current;
    if (!root || !scene || !svg || !hub) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let shown: Curve[] = [];
    let from: Curve[] = [];
    let to: Curve[] = [];
    let morphStart = 0;
    let lastPos: Point[] | null = null;
    let lastStack: boolean | null = null;
    const lengths: number[] = [];

    // Tiles are positioned, the scene and groups are not – so offsets are relative to the root and ignore transforms
    const centerOf = (el: HTMLElement): Point => ({ x: el.offsetLeft + el.offsetWidth / 2, y: el.offsetTop + el.offsetHeight / 2 });

    // Horizontal tangents side by side, vertical ones when stacked: the S-curve leaves and enters each tile straight
    const curve = (a: Point, b: Point, stack: boolean): Curve => {
      if (stack) {
        const my = (a.y + b.y) / 2;
        return [a.x, a.y, a.x, my, b.x, my, b.x, b.y];
      }
      const mx = (a.x + b.x) / 2;
      return [a.x, a.y, mx, a.y, mx, b.y, b.x, b.y];
    };

    const draw = (curves: Curve[]) => {
      shown = curves;
      curves.forEach((c, i) => {
        const d = `M${c[0]} ${c[1]}C${c[2]} ${c[3]} ${c[4]} ${c[5]} ${c[6]} ${c[7]}`;
        const line = lineRefs.current[i];
        if (!line) return;
        line.setAttribute("d", d);
        pulseRefs.current[i]?.querySelectorAll("path").forEach((p) => p.setAttribute("d", d));
        lengths[i] = line.getTotalLength();
      });
    };

    const measure = () => {
      svg.setAttribute("viewBox", `0 0 ${root.clientWidth} ${root.clientHeight}`);
      const stack = getComputedStyle(scene).getPropertyValue("--ui-ib-stack").trim() === "1";
      const els = [...toolRefs.current.slice(0, n), hub];
      if (els.some((el) => !el)) return;
      const pos = els.map((el) => centerOf(el!));
      const c = pos[n];
      // Left tools send into the centre, the centre sends out to the right – paths run in the pulse's direction
      const target = pos.slice(0, n).map((p, i) => (i < nLeft ? curve(p, c, stack) : curve(c, p, stack)));

      if (lastPos && lastStack !== null && stack !== lastStack && !reduce) {
        // The layout flipped: tiles glide from their old spots (FLIP), the curves blend along with them
        els.forEach((el, i) => {
          const dx = lastPos![i].x - pos[i].x;
          const dy = lastPos![i].y - pos[i].y;
          if (dx || dy) el!.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }], { duration: MORPH, easing: EASE });
        });
        from = shown.length === n ? shown : target;
        to = target;
        morphStart = performance.now();
        kick();
      } else if (morphStart) {
        // Resizing while a morph runs: keep gliding, just towards the new spots
        to = target;
      } else {
        draw(target);
      }
      lastPos = pos;
      lastStack = stack;
    };

    /* Pulses: one per beam at a time, started from a schedule that's rebuilt every sync cycle */
    const pulseStart: (number | null)[] = Array(n).fill(null);
    let queue: { beam: number; at: number }[] = [];
    let nextCycle = 0;
    let syncFrom = 0;
    let syncTo = 0;
    let wasSyncing = false;
    let visible = false;
    let raf = 0;

    const hide = (i: number) => {
      pulseStart[i] = null;
      const g = pulseRefs.current[i];
      if (g) g.style.opacity = "0";
    };

    const ring = (el: HTMLElement | null | undefined) =>
      el?.animate(
        [
          { opacity: 0, transform: "scale(0.96)" },
          { opacity: 1, transform: "scale(1)", offset: 0.3 },
          { opacity: 0, transform: "scale(1.14)" },
        ],
        { duration: 760, easing: "ease-out" },
      );

    const planCycle = (now: number) => {
      const ins = Array.from({ length: nLeft }, (_, i) => i).filter((i) => !offRef.current.has(i));
      const outs = Array.from({ length: n - nLeft }, (_, i) => nLeft + i).filter((i) => !offRef.current.has(i));
      if (!ins.length && !outs.length) {
        nextCycle = now + REST;
        return;
      }
      const t0 = now;
      // The outgoing wave leaves as the first incoming pulse lands
      const tOut = ins.length ? t0 + TRAVEL : t0;
      queue = [...ins.map((beam, k) => ({ beam, at: t0 + k * STAGGER })), ...outs.map((beam, k) => ({ beam, at: tOut + k * STAGGER }))];
      const end = Math.max(...queue.map((q) => q.at)) + TRAVEL;
      syncFrom = ins.length ? tOut : t0;
      syncTo = end;
      nextCycle = end + REST;
    };

    const paint = (i: number, t: number) => {
      const line = lineRefs.current[i];
      const g = pulseRefs.current[i];
      const grad = gradRefs.current[i];
      if (!line || !g || !grad) return;
      const L = lengths[i] || 0;
      const seg = Math.min(84, L * 0.42);
      const head = easeInOut(t) * (L + seg);
      // One dash, `seg` long, ending at the head
      g.querySelectorAll("path").forEach((p) => {
        p.style.strokeDasharray = `${seg} ${L + seg}`;
        p.style.strokeDashoffset = `${seg - head}`;
      });
      // The gradient runs from tail (clear) to head (bright) along the dash
      const a = line.getPointAtLength(Math.max(0, Math.min(L, head - seg)));
      const b = line.getPointAtLength(Math.max(0, Math.min(L, head)));
      grad.setAttribute("x1", `${a.x}`);
      grad.setAttribute("y1", `${a.y}`);
      grad.setAttribute("x2", `${b.x + (b.x === a.x && b.y === a.y ? 0.01 : 0)}`);
      grad.setAttribute("y2", `${b.y}`);
      g.style.opacity = "1";
    };

    const frame = (now: number) => {
      raf = 0;
      if (morphStart) {
        const t = Math.min(1, (now - morphStart) / MORPH);
        const e = easeOut(t);
        draw(to.map((c, i) => c.map((v, k) => (from[i]?.[k] ?? v) + (v - (from[i]?.[k] ?? v)) * e)));
        if (t >= 1) morphStart = 0;
      }
      if (visible && !reduce) {
        if (now >= nextCycle) planCycle(now);
        queue = queue.filter((q) => {
          if (q.at > now) return true;
          if (!offRef.current.has(q.beam) && pulseStart[q.beam] === null) pulseStart[q.beam] = q.at;
          return false;
        });
        for (let i = 0; i < n; i++) {
          const start = pulseStart[i];
          if (start === null) continue;
          // Paused mid-flight: the pulse fades out where it is
          if (offRef.current.has(i)) {
            hide(i);
            continue;
          }
          const t = (now - start) / TRAVEL;
          if (t >= 1) {
            hide(i);
            ring(i < nLeft ? centerRingRef.current : ringRefs.current[i]);
            continue;
          }
          paint(i, t);
        }
        const isSyncing = now >= syncFrom && now < syncTo;
        if (isSyncing !== wasSyncing) {
          wasSyncing = isSyncing;
          setSyncing(isSyncing);
        }
      }
      if (morphStart || (visible && !reduce)) raf = requestAnimationFrame(frame);
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(root);

    // Runs only while the scene is on screen
    const io =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver(([e]) => {
            visible = e.isIntersecting;
            if (visible) {
              nextCycle = performance.now() + 400;
              kick();
            } else {
              queue = [];
              for (let i = 0; i < n; i++) hide(i);
              syncTo = 0;
              if (wasSyncing) setSyncing((wasSyncing = false));
            }
          });
    io?.observe(root);

    return () => {
      ro.disconnect();
      io?.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [n, nLeft]);

  /* The status chip glides to the width of its new text */
  useIsoLayoutEffect(() => {
    const chip = chipRef.current;
    const inner = chipInnerRef.current;
    if (chip && inner) chip.style.width = `${inner.offsetWidth}px`;
  }, [status]);

  useEffect(() => () => window.clearTimeout(flashTimer.current), []);

  const toggle = (i: number) => {
    const pausing = !off.has(i);
    const next = new Set(off);
    if (pausing) next.add(i);
    else next.delete(i);
    setOff(next);
    setAnnounce(`${tools[i].name} ${pausing ? "paused" : "connected"}. ${n - next.size} of ${n} connected.`);
    // On touch there's no hover: show the tooltip for a moment so the tap says what it did
    setFlash(i);
    window.clearTimeout(flashTimer.current);
    flashTimer.current = window.setTimeout(() => setFlash(null), FLASH);
  };

  const onEnter = (i: number) => (e: PointerEvent) => {
    if (e.pointerType === "mouse") setFocus(i);
  };
  const onFocus = (i: number) => (e: FocusEvent<HTMLButtonElement>) => {
    if (e.currentTarget.matches(":focus-visible")) setFocus(i);
  };

  const tile = (t: BeamTool, i: number) => (
    <button
      key={i}
      ref={(el) => {
        toolRefs.current[i] = el;
      }}
      type="button"
      className="ui-ib__tool"
      aria-pressed={!off.has(i)}
      aria-label={`${t.name}, ${off.has(i) ? "paused" : "connected"}`}
      data-off={off.has(i) || undefined}
      data-tip={focus === i || flash === i || undefined}
      onClick={() => toggle(i)}
      onPointerEnter={onEnter(i)}
      onPointerLeave={() => setFocus(null)}
      onFocus={onFocus(i)}
      onBlur={() => setFocus(null)}
    >
      <span
        className="ui-ib__ring"
        ref={(el) => {
          ringRefs.current[i] = el;
        }}
      />
      <span className="ui-ib__logo" aria-hidden="true">
        {t.logo}
      </span>
      <span className="ui-ib__tip" aria-hidden="true">
        {t.name}
        {off.has(i) && <span className="ui-ib__tip-state"> · Paused</span>}
      </span>
    </button>
  );

  return (
    <div
      ref={rootRef}
      className={["ui-ib", className].filter(Boolean).join(" ")}
      role="group"
      aria-label={label ?? `${center.name} connected to ${tools.map((t) => t.name).join(", ")}`}
      data-focus={focus !== null || undefined}
    >
      {/* React 19 hoists this into <head> once, no matter how many instances render */}
      <style href="ui-integration-beam" precedence="default">
        {css}
      </style>

      <svg ref={svgRef} className="ui-ib__beams" aria-hidden="true">
        <defs>
          {/* User-space region: a straight, flat beam has a zero-height box and would lose its glow otherwise */}
          <filter id={`${uid}-blur`} filterUnits="userSpaceOnUse" x="-100" y="-100" width="10000" height="10000">
            <feGaussianBlur stdDeviation="3" />
          </filter>
          {tools.map((_, i) => (
            <linearGradient
              key={i}
              id={`${uid}-g${i}`}
              gradientUnits="userSpaceOnUse"
              ref={(el) => {
                gradRefs.current[i] = el;
              }}
            >
              <stop offset="0" className="ui-ib__stop-tail" />
              <stop offset="0.6" className="ui-ib__stop-mid" />
              <stop offset="1" className="ui-ib__stop-head" />
            </linearGradient>
          ))}
        </defs>
        {tools.map((_, i) => (
          <path
            key={i}
            className="ui-ib__line"
            data-off={off.has(i) || undefined}
            data-focus={focus === i || undefined}
            ref={(el) => {
              lineRefs.current[i] = el;
            }}
          />
        ))}
        {tools.map((_, i) => (
          <g
            key={i}
            className="ui-ib__pulse"
            data-focus={focus === i || undefined}
            ref={(el) => {
              pulseRefs.current[i] = el;
            }}
          >
            <path className="ui-ib__glow" stroke={`url(#${uid}-g${i})`} filter={`url(#${uid}-blur)`} />
            <path className="ui-ib__core" stroke={`url(#${uid}-g${i})`} />
          </g>
        ))}
      </svg>

      <div ref={sceneRef} className="ui-ib__scene">
        <div className="ui-ib__group ui-ib__group--in">{left.map((t, i) => tile(t, i))}</div>

        <div ref={centerRef} className="ui-ib__center" data-syncing={(syncing && connected > 0) || undefined}>
          <span className="ui-ib__ring ui-ib__ring--center" ref={centerRingRef} />
          <span className="ui-ib__mark" aria-hidden="true">
            {center.logo ?? <ProductMark />}
          </span>
          <span ref={chipRef} className="ui-ib__chip">
            <span ref={chipInnerRef} className="ui-ib__chip-inner">
              <span className="ui-ib__dot" data-idle={connected === 0 || undefined} />
              <span className="ui-ib__status" key={status}>
                {status}
              </span>
            </span>
          </span>
        </div>

        <div className="ui-ib__group ui-ib__group--out">{right.map((t, i) => tile(t, nLeft + i))}</div>
      </div>

      <span className="ui-ib__sr" aria-live="polite">
        {announce}
      </span>
    </div>
  );
}

/* A neutral four-petal flower, with fainter diagonal petals */
function ProductMark() {
  const petal = "M24 24C17.6 19.6 16.4 9.4 24 3.5C31.6 9.4 30.4 19.6 24 24Z";
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <g opacity="0.36">
        {[45, 135, 225, 315].map((r) => (
          <path key={r} d={petal} transform={`rotate(${r} 24 24)`} />
        ))}
      </g>
      {[0, 90, 180, 270].map((r) => (
        <path key={r} d={petal} transform={`rotate(${r} 24 24)`} />
      ))}
    </svg>
  );
}

/* ---------- Brand marks: the brands' own marks (svgl.app, Simple Icons – CC0) ---------- */

const Svg = ({ children }: { children: ReactNode }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    {children}
  </svg>
);

const DEFAULT_CENTER: BeamCenter = { name: "Acme" };

const DEFAULT_LEFT: BeamTool[] = [
  {
    name: "Slack",
    logo: (
      <Svg>
        <svg x="2" y="2" width="20" height="20" viewBox="0 0 2447.6 2452.5"><g clipRule="evenodd" fillRule="evenodd"><path d="m897.4 0c-135.3.1-244.8 109.9-244.7 245.2-.1 135.3 109.5 245.1 244.8 245.2h244.8v-245.1c.1-135.3-109.5-245.1-244.9-245.3.1 0 .1 0 0 0m0 654h-652.6c-135.3.1-244.9 109.9-244.8 245.2-.2 135.3 109.4 245.1 244.7 245.3h652.7c135.3-.1 244.9-109.9 244.8-245.2.1-135.4-109.5-245.2-244.8-245.3z" fill="#36c5f0" /><path d="m2447.6 899.2c.1-135.3-109.5-245.1-244.8-245.2-135.3.1-244.9 109.9-244.8 245.2v245.3h244.8c135.3-.1 244.9-109.9 244.8-245.3zm-652.7 0v-654c.1-135.2-109.4-245-244.7-245.2-135.3.1-244.9 109.9-244.8 245.2v654c-.2 135.3 109.4 245.1 244.7 245.3 135.3-.1 244.9-109.9 244.8-245.3z" fill="#2eb67d" /><path d="m1550.1 2452.5c135.3-.1 244.9-109.9 244.8-245.2.1-135.3-109.5-245.1-244.8-245.2h-244.8v245.2c-.1 135.2 109.5 245 244.8 245.2zm0-654.1h652.7c135.3-.1 244.9-109.9 244.8-245.2.2-135.3-109.4-245.1-244.7-245.3h-652.7c-135.3.1-244.9 109.9-244.8 245.2-.1 135.4 109.4 245.2 244.7 245.3z" fill="#ecb22e" /><path d="m0 1553.2c-.1 135.3 109.5 245.1 244.8 245.2 135.3-.1 244.9-109.9 244.8-245.2v-245.2h-244.8c-135.3.1-244.9 109.9-244.8 245.2zm652.7 0v654c-.2 135.3 109.4 245.1 244.7 245.3 135.3-.1 244.9-109.9 244.8-245.2v-653.9c.2-135.3-109.4-245.1-244.7-245.3-135.4 0-244.9 109.8-244.8 245.1 0 0 0 .1 0 0" fill="#e01e5a" /></g></svg>
      </Svg>
    ),
  },
  {
    name: "Notion",
    logo: (
      <Svg>
        <path
          fill="currentColor"
          d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z"
        />
      </Svg>
    ),
  },
  {
    name: "Gmail",
    logo: (
      <Svg>
        <svg x="2" y="2" width="20" height="20" viewBox="0 49.4 512 399.42"><g fill="none" fillRule="evenodd"><g fillRule="nonzero"><path fill="#4285f4" d="M34.91 448.818h81.454V251L0 163.727V413.91c0 19.287 15.622 34.91 34.91 34.91z"/><path fill="#34a853" d="M395.636 448.818h81.455c19.287 0 34.909-15.622 34.909-34.909V163.727L395.636 251z"/><path fill="#fbbc04" d="M395.636 99.727V251L512 163.727v-46.545c0-43.142-49.25-67.782-83.782-41.891z"/></g><path fill="#ea4335" d="M116.364 251V99.727L256 204.455 395.636 99.727V251L256 355.727z"/><path fill="#c5221f" fillRule="nonzero" d="M0 117.182v46.545L116.364 251V99.727L83.782 75.291C49.25 49.4 0 74.04 0 117.18z"/></g></svg>
      </Svg>
    ),
  },
];

const DEFAULT_RIGHT: BeamTool[] = [
  {
    name: "HubSpot",
    logo: (
      <Svg>
        <path
          fill="#FF7A59"
          d="M18.164 7.93V5.084a2.198 2.198 0 001.267-1.978v-.067A2.2 2.2 0 0017.238.845h-.067a2.2 2.2 0 00-2.193 2.193v.067a2.196 2.196 0 001.252 1.973l.013.006v2.852a6.22 6.22 0 00-2.969 1.31l.012-.01-7.828-6.095A2.497 2.497 0 104.3 4.656l-.012.006 7.697 5.991a6.176 6.176 0 00-1.038 3.446c0 1.343.425 2.588 1.147 3.607l-.013-.02-2.342 2.343a1.968 1.968 0 00-.58-.095h-.002a2.033 2.033 0 102.033 2.033 1.978 1.978 0 00-.1-.595l.005.014 2.317-2.317a6.247 6.247 0 104.782-11.134l-.036-.005zm-.964 9.378a3.206 3.206 0 113.215-3.207v.002a3.206 3.206 0 01-3.207 3.207z"
        />
      </Svg>
    ),
  },
  {
    name: "Linear",
    logo: (
      <Svg>
        <path
          fill="#5E6AD2"
          d="M2.886 4.18A11.982 11.982 0 0 1 11.99 0C18.624 0 24 5.376 24 12.009c0 3.64-1.62 6.903-4.18 9.105L2.887 4.18ZM1.817 5.626l16.556 16.556c-.524.33-1.075.62-1.65.866L.951 7.277c.247-.575.537-1.126.866-1.65ZM.322 9.163l14.515 14.515c-.71.172-1.443.282-2.195.322L0 11.358a12 12 0 0 1 .322-2.195Zm-.17 4.862 9.823 9.824a12.02 12.02 0 0 1-9.824-9.824Z"
        />
      </Svg>
    ),
  },
  {
    name: "Google Drive",
    logo: (
      <Svg>
        <svg x="1" y="2" width="22" height="20" viewBox="0 0 87.3 78">
          <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da" />
          <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#00ac47" />
          <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335" />
          <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d" />
          <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc" />
          <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00" />
        </svg>
      </Svg>
    ),
  },
];

/* ---------- Styles ---------- */

const css = /* css */ `
.ui-ib {
  --ui-ib-ink: #171717;
  --ui-ib-text: #404040;
  --ui-ib-muted: #8f8f8f;
  --ui-ib-faint: #b5b5b5;
  --ui-ib-line: #e2e2e2;
  --ui-ib-line-hi: #a9c0ff;
  --ui-ib-card: #ffffff;
  --ui-ib-tray: #f0f0f0;
  --ui-ib-accent: #2f6bff;
  /* Pulse: clear tail, accent body, a pale tip that reads as light */
  --ui-ib-pulse: #2f6bff;
  --ui-ib-tip-color: #b9cdff;
  --ui-ib-ring: rgba(47, 107, 255, 0.2);
  --ui-ib-glow: rgba(47, 107, 255, 0.26);
  --ui-ib-hub: #171717;
  --ui-ib-hub-mark: #ffffff;
  --ui-ib-hub-edge: rgba(0, 0, 0, 0.9);
  --ui-ib-tooltip: #171717;
  --ui-ib-tooltip-text: #ffffff;
  --ui-ib-shadow: 0 0 0 1px rgba(0, 0, 0, 0.07), 0 1px 2px rgba(0, 0, 0, 0.04), 0 8px 18px -10px rgba(0, 0, 0, 0.18);
  --ui-ib-focus: rgba(23, 23, 23, 0.22);
  --ui-ib-ease: ${EASE};
  position: relative;
  width: 100%;
  container-type: inline-size;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  font-size: 13px;
  color: var(--ui-ib-text);
  -webkit-tap-highlight-color: transparent;
}
.ui-ib *, .ui-ib *::before, .ui-ib *::after { box-sizing: border-box; }

/* ---------- Beams ---------- */

/* Absolute, so it paints below the (positioned) tiles */
.ui-ib__beams {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  pointer-events: none;
}
.ui-ib__line {
  fill: none;
  stroke: var(--ui-ib-line);
  stroke-width: 1.5;
  stroke-linecap: round;
  transition: stroke 300ms var(--ui-ib-ease), opacity 300ms var(--ui-ib-ease);
}
.ui-ib__line[data-off] { stroke: var(--ui-ib-faint); stroke-dasharray: 2 5; opacity: 0.75; }
.ui-ib[data-focus] .ui-ib__line:not([data-focus]) { opacity: 0.35; }
.ui-ib__line[data-focus]:not([data-off]) { stroke: var(--ui-ib-line-hi); }

.ui-ib__pulse { opacity: 0; transition: opacity 240ms ease; }
.ui-ib__pulse path { fill: none; stroke-linecap: round; transition: opacity 300ms var(--ui-ib-ease); }
.ui-ib__core { stroke-width: 2; }
.ui-ib__glow { stroke-width: 6; opacity: 0.45; }
.ui-ib[data-focus] .ui-ib__pulse:not([data-focus]) path { opacity: 0.25; }
.ui-ib__pulse[data-focus] .ui-ib__glow { opacity: 0.7; }
.ui-ib__stop-tail { stop-color: var(--ui-ib-pulse); stop-opacity: 0; }
.ui-ib__stop-mid { stop-color: var(--ui-ib-pulse); stop-opacity: 0.9; }
.ui-ib__stop-head { stop-color: var(--ui-ib-tip-color); stop-opacity: 1; }

/* ---------- Layout: side by side, stacked on narrow widths ---------- */

.ui-ib__scene {
  --ui-ib-stack: 0;
  display: grid;
  grid-template-columns: auto minmax(40px, 1fr) auto minmax(40px, 1fr) auto;
  grid-template-areas: "in . hub . out";
  align-items: center;
  padding: 6px 0;
}
.ui-ib__group { display: flex; flex-direction: column; gap: 26px; }
.ui-ib__group--in { grid-area: in; }
.ui-ib__group--out { grid-area: out; }

/* ---------- Tools ---------- */

.ui-ib__tool {
  position: relative;
  display: grid;
  place-items: center;
  width: 60px;
  height: 60px;
  padding: 0;
  border: 0;
  border-radius: 18px;
  background: var(--ui-ib-card);
  box-shadow: var(--ui-ib-shadow);
  color: var(--ui-ib-ink);
  font: inherit;
  cursor: pointer;
  transition: background-color 300ms var(--ui-ib-ease), box-shadow 300ms var(--ui-ib-ease);
}
.ui-ib__tool:focus-visible { outline: 2px solid var(--ui-ib-focus); outline-offset: 3px; }
.ui-ib__logo {
  display: grid;
  width: 28px;
  height: 28px;
  transition: transform 300ms var(--ui-ib-ease), filter 300ms var(--ui-ib-ease), opacity 300ms var(--ui-ib-ease);
}
.ui-ib__logo > svg { width: 100%; height: 100%; }
@media (hover: hover) {
  .ui-ib__tool:hover .ui-ib__logo { transform: scale(1.08); }
}
.ui-ib__tool[data-off] { background: var(--ui-ib-tray); }
.ui-ib__tool[data-off] .ui-ib__logo { filter: grayscale(1); opacity: 0.4; }

/* Arrival glow – played with the Web Animations API */
.ui-ib__ring {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  box-shadow: 0 0 0 3px var(--ui-ib-ring), 0 0 22px 2px var(--ui-ib-glow);
  opacity: 0;
  pointer-events: none;
}

/* Tooltip: points toward the centre, so it never leaves the scene */
.ui-ib__tip {
  --ui-ib-tip-from: translate(-4px, -50%);
  position: absolute;
  z-index: 3;
  top: 50%;
  left: calc(100% + 10px);
  padding: 5px 9px;
  border-radius: 8px;
  background: var(--ui-ib-tooltip);
  color: var(--ui-ib-tooltip-text);
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transform: var(--ui-ib-tip-from);
  transition: opacity 180ms ease, transform 260ms var(--ui-ib-ease);
}
.ui-ib__group--out .ui-ib__tip { --ui-ib-tip-from: translate(4px, -50%); left: auto; right: calc(100% + 10px); }
.ui-ib__tip-state { opacity: 0.6; font-weight: 400; }
.ui-ib__tool[data-tip] .ui-ib__tip { opacity: 1; transform: translate(0, -50%); }

/* ---------- Centre ---------- */

.ui-ib__center {
  grid-area: hub;
  position: relative;
  display: grid;
  place-items: center;
  width: 80px;
  height: 80px;
  border-radius: 24px;
  background: var(--ui-ib-hub);
  box-shadow: 0 0 0 1px var(--ui-ib-hub-edge), inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 14px 28px -12px rgba(0, 0, 0, 0.38);
  color: var(--ui-ib-hub-mark);
}
.ui-ib__mark { display: grid; width: 36px; height: 36px; fill: currentColor; }
.ui-ib__mark > svg { width: 100%; height: 100%; }
.ui-ib__ring--center { inset: -1px; }

/* Status chip under the hub – absolute, so the hub itself stays centred on the beams */
.ui-ib__chip {
  position: absolute;
  top: calc(100% + 12px);
  left: 50%;
  translate: -50% 0;
  display: block;
  height: 26px;
  overflow: hidden;
  border-radius: 999px;
  background: var(--ui-ib-card);
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.07), 0 1px 2px rgba(0, 0, 0, 0.04);
  transition: width 320ms var(--ui-ib-ease);
}
.ui-ib__chip-inner {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  width: max-content;
  height: 26px;
  padding: 0 11px 0 10px;
  font-size: 12px;
  font-weight: 500;
  color: var(--ui-ib-text);
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
.ui-ib__status { display: inline-block; animation: ui-ib-in 320ms var(--ui-ib-ease) both; }
.ui-ib__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--ui-ib-accent);
  transition: background-color 300ms ease;
}
.ui-ib__dot[data-idle] { background: var(--ui-ib-faint); }
.ui-ib__center[data-syncing] .ui-ib__dot { animation: ui-ib-breathe 1.1s ease-in-out infinite; }

.ui-ib__sr {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

@keyframes ui-ib-in { from { opacity: 0; transform: translateY(6px); filter: blur(2px); } to { opacity: 1; transform: none; filter: none; } }
@keyframes ui-ib-breathe { 50% { box-shadow: 0 0 0 3px var(--ui-ib-ring); } }

/* Narrow: senders above, receivers below, vertical beams */
@container (max-width: 459px) {
  .ui-ib__scene {
    --ui-ib-stack: 1;
    grid-template-columns: 1fr;
    grid-template-areas: "in" "hub" "out";
    justify-items: center;
    row-gap: 78px;
    padding: 0 0 4px;
  }
  .ui-ib__group { flex-direction: row; gap: clamp(14px, 7cqw, 34px); }
  .ui-ib__tool { width: 56px; height: 56px; border-radius: 17px; }
  .ui-ib__center { width: 76px; height: 76px; border-radius: 23px; }
  /* Tooltips sit between the rows; the outer tools align theirs to their edge */
  .ui-ib__tip,
  .ui-ib__group--out .ui-ib__tip {
    --ui-ib-tip-from: translate(-50%, -4px);
    top: calc(100% + 8px);
    right: auto;
    left: 50%;
  }
  .ui-ib__group--out .ui-ib__tip { --ui-ib-tip-from: translate(-50%, 4px); top: auto; bottom: calc(100% + 8px); }
  .ui-ib__tool[data-tip] .ui-ib__tip { transform: translate(-50%, 0); }
  .ui-ib__tool:first-child .ui-ib__tip { left: 0; translate: 50% 0; }
  .ui-ib__tool:last-child .ui-ib__tip { left: 100%; translate: -50% 0; }
}

/* Touch: the tiles are already 56px+; tooltips are shown after a tap instead of on hover */
@media (hover: none) and (pointer: coarse) {
  .ui-ib__tool { min-width: 44px; min-height: 44px; }
}

@media (prefers-reduced-motion: reduce) {
  .ui-ib__line, .ui-ib__tool, .ui-ib__logo, .ui-ib__tip, .ui-ib__chip, .ui-ib__dot { transition: none; }
  .ui-ib__status, .ui-ib__center[data-syncing] .ui-ib__dot { animation: none; }
}

/* Dark mode: follows a .dark class or data-theme="dark" on any ancestor, e.g. <html> */
:where(.dark, [data-theme="dark"]) .ui-ib {
  --ui-ib-ink: #ededed;
  --ui-ib-text: #c8c8cc;
  --ui-ib-muted: #8b8b92;
  --ui-ib-faint: #5c5c63;
  --ui-ib-line: #2e2e33;
  --ui-ib-line-hi: #4b5f9e;
  --ui-ib-card: #19191b;
  --ui-ib-tray: #111113;
  --ui-ib-accent: #6d8bff;
  --ui-ib-pulse: #6d8bff;
  --ui-ib-tip-color: #ffffff;
  --ui-ib-ring: rgba(109, 139, 255, 0.24);
  --ui-ib-glow: rgba(109, 139, 255, 0.3);
  --ui-ib-hub: #26262a;
  --ui-ib-hub-mark: #ffffff;
  --ui-ib-hub-edge: rgba(255, 255, 255, 0.12);
  --ui-ib-tooltip: #ededed;
  --ui-ib-tooltip-text: #111113;
  --ui-ib-shadow: 0 0 0 1px #2a2a2e, 0 1px 2px rgba(0, 0, 0, 0.3), 0 8px 18px -10px rgba(0, 0, 0, 0.6);
  --ui-ib-focus: rgba(255, 255, 255, 0.3);
}
:where(.dark, [data-theme="dark"]) .ui-ib__chip { box-shadow: 0 0 0 1px #2a2a2e, 0 1px 2px rgba(0, 0, 0, 0.3); }
`;
