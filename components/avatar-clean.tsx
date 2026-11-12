"use client";

import {
  Children,
  cloneElement,
  isValidElement,
  useState,
  type ComponentPropsWithRef,
  type CSSProperties,
  type ReactElement,
} from "react";

/*
 * Avatar – a single self-contained file, clean style.
 * A person's picture, falling back to their initials on a soft color of their own; workspaces as rounded squares; an
 * agent as its own pixel mark that twinkles while it works; a status dot; and AvatarGroup, which overlaps them and
 * ends in +N.
 * The styles are injected below, so no extra files are needed.
 */

export type AvatarSize = 20 | 24 | 32 | 40;

export type AvatarProps = Omit<ComponentPropsWithRef<"span">, "children"> & {
  /** Who it is – the initials, the accessible name and the color come from it */
  name?: string;
  /** The picture; while it loads, and when it fails, the initials show instead */
  src?: string;
  /** 20, 24, 32 or 40 pixels */
  size?: AvatarSize;
  /** circle: people · square: a rounded square for workspaces, teams and agents */
  shape?: "circle" | "square";
  /** A dot on the corner: online green, away amber, busy red – also read out after the name */
  status?: "online" | "away" | "busy";
  /** person: picture or initials · agent: the agent's pixel mark, never initials */
  kind?: "person" | "agent";
  /** What the color and an agent's pattern are made from, e.g. a user or agent id – the name when left out */
  seed?: string;
  /** agent: the mark's color – blue when left out */
  color?: string;
  /** agent: the mark twinkles in a wave while the agent works */
  working?: boolean;
};

export function Avatar({
  name,
  src,
  size = 32,
  shape,
  status,
  kind = "person",
  seed,
  color,
  working,
  className,
  style,
  ...rest
}: AvatarProps) {
  // The picture that failed or finished loading – kept per src, so a new src tries again
  const [failed, setFailed] = useState<string | null>(null);
  const [loaded, setLoaded] = useState<string | null>(null);

  const agent = kind === "agent";
  const scale = SIZES.includes(size) ? size : 32;
  const form = shape === "circle" || shape === "square" ? shape : agent ? "square" : "circle";
  const key = (seed ?? name ?? "").trim();
  const showImage = !!src && failed !== src;
  const ready = showImage && loaded === src;
  const who = name?.trim();
  // "Mara Lindqvist, online" – an aria-label of your own wins; with no name at all it is left to the text beside it
  const label = rest["aria-label"] ?? (who ? (status && STATUS_LABEL[status] ? `${who}, ${STATUS_LABEL[status]}` : who) : undefined);

  return (
    <>
      {/* React 19 hoists this into <head> once, no matter how many avatars render */}
      <style href="ui-avatar-clean" precedence="default">
        {css}
      </style>
      <span
        className={["ui-avtc", className].filter(Boolean).join(" ")}
        data-size={scale}
        data-shape={form}
        data-kind={agent ? "agent" : "person"}
        data-hue={agent || !key ? undefined : hueOf(key)}
        data-ready={ready ? "" : undefined}
        data-working={agent && working ? "" : undefined}
        role={label ? "img" : undefined}
        aria-label={label}
        aria-hidden={label ? undefined : true}
        style={agent && color ? ({ "--ui-avtc-mark": color, ...style } as CSSProperties) : style}
        {...rest}
      >
        <span className="ui-avtc__face">
          {agent ? <Mark cells={pattern(key || "agent")} /> : <Initials name={name ?? ""} />}
          {showImage && (
            <img
              className="ui-avtc__img"
              src={src}
              alt=""
              loading="lazy"
              decoding="async"
              draggable={false}
              onLoad={() => setLoaded(src)}
              onError={() => setFailed(src)}
              // A cached picture can finish before React listens – take it as loaded right away
              ref={(el) => {
                if (el?.complete && el.naturalWidth > 0) setLoaded(src);
              }}
            />
          )}
        </span>
        {status && STATUS_LABEL[status] && <span className="ui-avtc__status" data-status={status} aria-hidden="true" />}
      </span>
    </>
  );
}

export type AvatarGroupProps = ComponentPropsWithRef<"div"> & {
  /** How many avatars show before the rest becomes +N */
  max?: number;
  /** The size of every avatar in the group and of the +N */
  size?: AvatarSize;
  /** How many there are in all, when you pass only the first few – +N counts from it */
  total?: number;
};

/** Avatars that overlap, each cut out of the one before by a ring in the background color, ending in +N */
export function AvatarGroup({ max = 4, size = 32, total, className, children, ...rest }: AvatarGroupProps) {
  const items = Children.toArray(children).filter(isValidElement) as ReactElement<AvatarProps>[];
  const scale = SIZES.includes(size) ? size : 32;
  const limit = Math.max(1, Math.floor(Number.isFinite(max) ? max : 4));
  const all = Math.max(items.length, Math.floor(Number.isFinite(total) ? (total as number) : 0));
  const shown = items.slice(0, limit);
  const more = all - shown.length;
  const last = shown[shown.length - 1]?.props.shape ?? (shown[shown.length - 1]?.props.kind === "agent" ? "square" : "circle");

  return (
    <>
      <style href="ui-avatar-clean" precedence="default">
        {css}
      </style>
      <div role="group" className={["ui-avtc__group", className].filter(Boolean).join(" ")} data-size={scale} {...rest}>
        {shown.map((item) => (item.type === Avatar ? cloneElement(item, { size: scale }) : item))}
        {more > 0 && (
          <span className="ui-avtc__more" data-shape={last} role="img" aria-label={`${new Intl.NumberFormat().format(more)} more`}>
            {more > 99 ? "99+" : `+${more}`}
          </span>
        )}
      </div>
    </>
  );
}

const SIZES: number[] = [20, 24, 32, 40];
const STATUS_LABEL: Record<string, string> = { online: "online", away: "away", busy: "busy" };

/** One of eight soft colors, always the same for the same name or id */
const hueOf = (key: string) => {
  let h = 7;
  for (const c of key) h = (h * 31 + c.codePointAt(0)!) >>> 0;
  return String(h % 8);
};

/* ---------- Initials ---------- */

type Segmenter = { segment: (text: string) => Iterable<{ segment: string }> };
let segmenter: Segmenter | null | undefined;
/** Whole characters – "é", "👩🏽‍💻" and flags stay one – with Intl.Segmenter where it exists */
const graphemes = (text: string): string[] => {
  if (segmenter === undefined) {
    const S = (Intl as unknown as { Segmenter?: new (locale?: string, options?: { granularity: string }) => Segmenter }).Segmenter;
    segmenter = S ? new S(undefined, { granularity: "grapheme" }) : null;
  }
  return segmenter ? Array.from(segmenter.segment(text), (s) => s.segment) : Array.from(text);
};
const LETTER = /[\p{L}\p{N}]/u;
const EMOJI = /\p{Extended_Pictographic}|\p{Regional_Indicator}/u;
/** "III", "Jr." and the like close a name but don't make an initial – "Christopher Montgomery III" is CM */
const SUFFIX = /^(jr|sr|ii|iii|iv|vi|phd|md|esq)\.?$/i;

/** Initials from the first and last word: "Mara Lindqvist" → ML, "Cher" → C, "🦊 Fox Team" → 🦊, "(Ana) Ruiz" → AR */
function initialsOf(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "";
  const lead = graphemes(words[0])[0];
  if (lead && EMOJI.test(lead) && !LETTER.test(lead)) return lead;
  // Each word's first letter or digit, skipping quotes, brackets and other marks in front of it
  const firsts = words
    .filter((w, i, all) => !(i > 0 && i === all.length - 1 && SUFFIX.test(w)))
    .map((w) => graphemes(w).find((g) => LETTER.test(g)))
    .filter((g): g is string => !!g);
  if (!firsts.length) return lead ?? "";
  const pair = firsts.length > 1 ? firsts[0] + firsts[firsts.length - 1] : firsts[0];
  return pair.toLocaleUpperCase();
}

function Initials({ name }: { name: string }) {
  const text = initialsOf(name);
  return (
    <span className="ui-avtc__initials" dir="auto" aria-hidden="true">
      {text || (
        // No name: a person outline – Hugeicons Free (MIT, © Hugeicons, hugeicons.com)
        <svg className="ui-avtc__anon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21C19.713 17.269 16.729 14.315 12.995 14.066L12 14C11.645 14.01 11.313 14.023 11.001 14.038C7.3 14.219 4.284 17.306 4 21" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      )}
    </span>
  );
}

/* ---------- The agent's pixel mark ---------- */

/** Twinkle order of the mark – a diagonal wave from the top left */
const WAVE = [0, 120, 240, 120, 240, 360, 240, 360, 480];

/** An agent's own 3×3 pattern, mirrored left to right, from its id – never fewer than five squares */
const pattern = (id: string) => {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  for (let k = 0; k < 64; k++) {
    const bits = (h >> (k % 26)) & 63;
    const cells = [0, 1, 2].flatMap((r) => {
      const a = (bits >> (r * 2)) & 1;
      const b = (bits >> (r * 2 + 1)) & 1;
      return [a, b, a];
    });
    if (cells.filter(Boolean).length >= 5) return cells;
    h = (h * 1103515245 + 12345) >>> 0;
  }
  return [1, 0, 1, 0, 1, 0, 1, 0, 1];
};

function Mark({ cells }: { cells: number[] }) {
  return (
    <span className="ui-avtc__mark" aria-hidden="true">
      {cells.map((on, i) => (
        <i key={i} data-on={on ? "" : undefined} style={{ animationDelay: `${WAVE[i]}ms` }} />
      ))}
    </span>
  );
}

/* ---------- Styles ---------- */

const css = /* css */ `
/* Colors as variables – override them on .ui-avtc or .ui-avtc__group (see Theming in the docs) */
.ui-avtc,
.ui-avtc__group {
  --ui-avtc-ink: var(--aui-ink, rgba(0, 0, 0, 0.88));
  --ui-avtc-text: rgba(0, 0, 0, 0.61);
  --ui-avtc-fill: var(--aui-subtle, rgba(0, 0, 0, 0.06));
  --ui-avtc-tile: var(--aui-surface, #ffffff);
  --ui-avtc-edge: rgba(0, 0, 0, 0.08);
  /* The ring that cuts each avatar out of the one before – set it to the background the group sits on */
  --ui-avtc-ring: var(--aui-surface, #ffffff);
  --ui-avtc-mark: rgba(0, 96, 226, 0.78);
  --ui-avtc-online: var(--aui-green, #5fc88a);
  --ui-avtc-away: var(--aui-amber, #e8b000);
  --ui-avtc-busy: var(--aui-red, #f04438);
  /* The soft colors behind initials: lightness and saturation of the tint and of the letters */
  --ui-avtc-bg-l: 93%;
  --ui-avtc-bg-s: 70%;
  --ui-avtc-fg-l: 36%;
  --ui-avtc-fg-s: 48%;

  --s: 32px;
  --fs: 12px;
  --dot: 9px;
  --sq: 4px;
  --gap: 2px;
}
.ui-avtc[data-size="20"], .ui-avtc__group[data-size="20"] { --s: 20px; --fs: 8.5px; --dot: 6px; --sq: 3px; --gap: 1px; }
.ui-avtc[data-size="24"], .ui-avtc__group[data-size="24"] { --s: 24px; --fs: 10px; --dot: 7px; --sq: 3px; --gap: 1.5px; }
.ui-avtc[data-size="40"], .ui-avtc__group[data-size="40"] { --s: 40px; --fs: 14px; --dot: 10px; --sq: 5px; --gap: 2.5px; }

.ui-avtc {
  position: relative;
  display: inline-grid;
  flex: none;
  box-sizing: border-box;
  width: var(--s);
  height: var(--s);
  vertical-align: middle;
  font-family: var(--aui-font, "Inter", "InterVariable", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif);
  -webkit-font-smoothing: antialiased;
  user-select: none;
}
.ui-avtc__face {
  position: relative;
  display: grid;
  place-items: center;
  overflow: hidden;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: var(--ui-avtc-fill);
  color: var(--ui-avtc-text);
}
/* Rounded squares keep the same curve at every size: a quarter of the side */
.ui-avtc[data-shape="square"] .ui-avtc__face { border-radius: calc(var(--s) / 4); }

/* Initials sit on a soft color of their own, picked from the name */
.ui-avtc[data-hue] .ui-avtc__face {
  background: hsl(var(--h) var(--ui-avtc-bg-s) var(--ui-avtc-bg-l));
  color: hsl(var(--h) var(--ui-avtc-fg-s) var(--ui-avtc-fg-l));
}
.ui-avtc[data-hue="0"] { --h: 214; }
.ui-avtc[data-hue="1"] { --h: 152; }
.ui-avtc[data-hue="2"] { --h: 40; }
.ui-avtc[data-hue="3"] { --h: 22; }
.ui-avtc[data-hue="4"] { --h: 330; }
.ui-avtc[data-hue="5"] { --h: 268; }
.ui-avtc[data-hue="6"] { --h: 174; }
.ui-avtc[data-hue="7"] { --h: 196; }

.ui-avtc__initials {
  grid-area: 1 / 1;
  font-size: var(--fs);
  font-weight: 500;
  line-height: 1;
  letter-spacing: 0;
  white-space: nowrap;
}
.ui-avtc__anon {
  display: block;
  width: calc(var(--s) * 0.55);
  height: calc(var(--s) * 0.55);
}

/* The picture covers the initials once it has loaded – they show while it loads and when it fails */
.ui-avtc__img {
  grid-area: 1 / 1;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 180ms ease;
}
.ui-avtc[data-ready] .ui-avtc__img { opacity: 1; }
.ui-avtc[data-ready] .ui-avtc__initials { visibility: hidden; }

/* A hairline on top of pictures and agent tiles, so white edges don't melt into a white page */
.ui-avtc[data-ready] .ui-avtc__face::after,
.ui-avtc[data-kind="agent"] .ui-avtc__face::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  box-shadow: inset 0 0 0 0.5px var(--ui-avtc-edge);
  pointer-events: none;
}

/* Agent: its own pixel mark on a white tile */
.ui-avtc[data-kind="agent"] .ui-avtc__face { background: var(--ui-avtc-tile); }
.ui-avtc__mark {
  grid-area: 1 / 1;
  display: grid;
  grid-template-columns: repeat(3, var(--sq));
  grid-auto-rows: var(--sq);
  gap: var(--gap);
}
.ui-avtc__mark i {
  border-radius: calc(var(--sq) / 4);
  background: var(--ui-avtc-mark);
  opacity: 0;
  transition: opacity 240ms ease;
}
.ui-avtc__mark i[data-on] { opacity: 1; }
/* Working: every square twinkles, in a diagonal wave */
.ui-avtc[data-working] .ui-avtc__mark i { animation: ui-avtc-pixel 1.2s ease-in-out infinite both; }
.ui-avtc[data-working] .ui-avtc__mark i:not([data-on]) { opacity: 0.16; }
@keyframes ui-avtc-pixel {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.2; }
}

/* Status: a dot on the corner, cut out of the avatar by a ring in the background color */
.ui-avtc__status {
  position: absolute;
  inset-inline-end: 0;
  bottom: 0;
  width: var(--dot);
  height: var(--dot);
  border-radius: 50%;
  background: var(--ui-avtc-online);
  box-shadow: 0 0 0 1.5px var(--ui-avtc-ring);
}
.ui-avtc[data-shape="square"] .ui-avtc__status { inset-inline-end: -2px; bottom: -2px; }
.ui-avtc__status[data-status="away"] { background: var(--ui-avtc-away); }
.ui-avtc__status[data-status="busy"] { background: var(--ui-avtc-busy); }

/* Group: each one overlaps the one before by a quarter, a ring in the background color between them */
.ui-avtc__group {
  display: inline-flex;
  align-items: center;
  vertical-align: middle;
  isolation: isolate;
}
.ui-avtc__group > .ui-avtc .ui-avtc__face { box-shadow: 0 0 0 2px var(--ui-avtc-ring); }
.ui-avtc__group > :is(.ui-avtc, .ui-avtc__more) + :is(.ui-avtc, .ui-avtc__more) { margin-inline-start: calc(var(--s) / -4); }
.ui-avtc__more {
  display: inline-grid;
  place-items: center;
  box-sizing: border-box;
  min-width: var(--s);
  height: var(--s);
  padding: 0 4px;
  border-radius: 999px;
  /* The gray tint laid over the ring color, so the face behind it doesn't show through */
  background: linear-gradient(var(--ui-avtc-fill), var(--ui-avtc-fill)), var(--ui-avtc-ring);
  box-shadow: 0 0 0 2px var(--ui-avtc-ring);
  font-family: var(--aui-font, "Inter", "InterVariable", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif);
  font-size: var(--fs);
  font-weight: 500;
  line-height: 1;
  color: var(--ui-avtc-text);
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
  -webkit-font-smoothing: antialiased;
}
.ui-avtc__more[data-shape="square"] { border-radius: calc(var(--s) / 4); }

@media (prefers-reduced-motion: reduce) {
  .ui-avtc__img { transition: none; }
  .ui-avtc__mark i { transition: none; }
  .ui-avtc[data-working] .ui-avtc__mark i { animation: none; }
  .ui-avtc[data-working] .ui-avtc__mark i:not([data-on]) { opacity: 0; }
}

/* Dark mode: follows a .dark class or data-theme="dark" on any ancestor, e.g. <html> */
:where(.dark, [data-theme="dark"]) :is(.ui-avtc, .ui-avtc__group) {
  --ui-avtc-ink: var(--aui-ink, rgba(255, 255, 255, 0.9));
  --ui-avtc-text: rgba(255, 255, 255, 0.62);
  --ui-avtc-fill: var(--aui-subtle, rgba(255, 255, 255, 0.08));
  --ui-avtc-tile: var(--aui-surface, #1c1c1e);
  --ui-avtc-edge: rgba(255, 255, 255, 0.1);
  --ui-avtc-ring: var(--aui-surface, #1c1c1e);
  --ui-avtc-mark: rgba(77, 141, 255, 0.85);
  --ui-avtc-online: var(--aui-green, #7dcf9f);
  --ui-avtc-away: var(--aui-amber, #e6c24d);
  --ui-avtc-busy: var(--aui-red, #ff6b5f);
  --ui-avtc-bg-l: 24%;
  --ui-avtc-bg-s: 28%;
  --ui-avtc-fg-l: 80%;
  --ui-avtc-fg-s: 60%;
}
`;
