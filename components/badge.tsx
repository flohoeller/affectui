"use client";

import { createElement, type ComponentPropsWithRef, type ReactNode } from "react";

/*
 * Badge – a single self-contained file.
 * A small status pill – the one place a status gets its color: a soft tint with matching text, a leading dot or icon,
 * a live dot that pulses softly while something runs, or a round count like 3 or 99+.
 * The styles are injected below, so no extra files are needed.
 */

/** An icon from Hugeicons (e.g. `import { Clock01Icon } from "@hugeicons/core-free-icons"`) – drawn inline */
export type HugeIcon = readonly (readonly [string, { readonly [key: string]: string | number }])[];

export type BadgeTone = "neutral" | "info" | "success" | "warning" | "danger" | "purple";

export type BadgeProps = ComponentPropsWithRef<"span"> & {
  /** neutral: gray, the default · info: blue, running · success: green, done · warning: orange, needs you · danger: red, failed · purple: a kind, like Beta */
  tone?: BadgeTone;
  /** sm: 20px high, 11px text · md: 22px high, 12px text */
  size?: "sm" | "md";
  /** A small dot in the tone's color before the text */
  dot?: boolean;
  /** The dot pulses softly – for running, live and recording states */
  live?: boolean;
  /** An icon before the text: any element (an inline SVG) or a Hugeicons icon object */
  icon?: ReactNode | HugeIcon;
  /** Makes it a round count: the number in place of the text, "99+" above max */
  count?: number;
  /** The highest count shown in full – above it the badge reads max+ */
  max?: number;
};

export function Badge({ tone = "neutral", size = "sm", dot, live, icon, count, max = 99, className, children, ...rest }: BadgeProps) {
  // Unknown values fall back to the defaults instead of an unstyled badge
  const hue = TONES.includes(tone) ? tone : "neutral";
  const scale = size === "md" ? "md" : "sm";
  const isCount = typeof count === "number" && Number.isFinite(count);
  const lead = isCount ? null : live || dot ? "dot" : icon != null && icon !== false ? "icon" : null;
  // Nothing to say – no text, no count, no mark: no empty pill either (e.g. count={NaN} from missing data)
  const empty = !isCount && !lead && (children == null || children === false || children === "");
  if (empty) return null;

  return (
    <>
      {/* React 19 hoists this into <head> once, no matter how many badges render */}
      <style href="ui-badge" precedence="default">
        {css}
      </style>
      <span
        className={["ui-bdg", className].filter(Boolean).join(" ")}
        data-tone={hue}
        data-size={scale}
        data-count={isCount ? "" : undefined}
        data-lead={lead ?? undefined}
        {...rest}
      >
        {lead === "dot" && <span className="ui-bdg__dot" data-live={live ? "" : undefined} aria-hidden="true" />}
        {lead === "icon" && (
          <span className="ui-bdg__icon" aria-hidden="true">
            <Glyph icon={icon} />
          </span>
        )}
        {isCount ? formatCount(count, max) : <span className="ui-bdg__label">{children}</span>}
      </span>
    </>
  );
}

const TONES: BadgeTone[] = ["neutral", "info", "success", "warning", "danger", "purple"];

/** 7 · 1,234 · 99+ – whole numbers, never below zero, in the reader's own digits */
const formatCount = (count: number, max: number) => {
  const n = Math.max(0, Math.floor(count));
  const top = Math.max(0, Math.floor(Number.isFinite(max) ? max : 99));
  const format = (v: number) => new Intl.NumberFormat().format(v);
  return n > top ? `${format(top)}+` : format(n);
};

const isHugeIcon = (icon: unknown): icon is HugeIcon =>
  Array.isArray(icon) && icon.length > 0 && icon.every((part) => Array.isArray(part) && typeof part[0] === "string");

/** Draws a Hugeicons icon object as an inline SVG at the badge's stroke; anything else is shown as it is */
function Glyph({ icon }: { icon: ReactNode | HugeIcon }) {
  if (!isHugeIcon(icon)) return <>{icon}</>;
  return (
    <svg viewBox="0 0 24 24" fill="none" focusable="false">
      {icon.map(([tag, { key, ...attrs }], i) =>
        createElement(tag, { ...attrs, key: String(key ?? i), ...("strokeWidth" in attrs ? { strokeWidth: STROKE } : null) }),
      )}
    </svg>
  );
}
const STROKE = 2;

/* ---------- Styles ---------- */

const css = /* css */ `
/* Colors as variables – override them on .ui-bdg (see Theming in the docs) */
.ui-bdg {
  --ui-bdg-neutral-bg: var(--aui-subtle, #f0f0f0);
  --ui-bdg-neutral-fg: #616161;
  --ui-bdg-neutral-dot: #a3a3a3;
  --ui-bdg-info-bg: var(--aui-info-soft, #eaf1ff);
  --ui-bdg-info-fg: var(--aui-info, #2456d6);
  --ui-bdg-success-bg: var(--aui-success-soft, #e6f6ed);
  --ui-bdg-success-fg: var(--aui-success, #1e8a4f);
  --ui-bdg-warning-bg: var(--aui-warning-soft, #fff1e0);
  --ui-bdg-warning-fg: var(--aui-warning, #b25e00);
  --ui-bdg-danger-bg: var(--aui-danger-soft, #fdecea);
  --ui-bdg-danger-fg: var(--aui-danger, #c4320a);
  --ui-bdg-purple-bg: #f4ebfd;
  --ui-bdg-purple-fg: #8a35d6;

  --bg: var(--ui-bdg-neutral-bg);
  --fg: var(--ui-bdg-neutral-fg);
  --dot: currentColor;
  --h: 20px;
  --pad: 8px;
  --lead: 6px;
  --mark: 12px;

  display: inline-flex;
  flex: none;
  align-items: center;
  gap: 4px;
  box-sizing: border-box;
  max-width: 100%;
  height: var(--h);
  padding: 0 var(--pad);
  border-radius: 999px;
  background: var(--bg);
  color: var(--fg);
  font-family: var(--aui-font, "Inter", "InterVariable", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif);
  font-size: 11px;
  font-weight: 500;
  line-height: 16px;
  letter-spacing: 0;
  white-space: nowrap;
  vertical-align: middle;
  font-variant-numeric: tabular-nums;
  -webkit-font-smoothing: antialiased;
}
.ui-bdg[data-size="md"] {
  --h: 22px;
  --pad: 9px;
  --lead: 7px;
  --mark: 13px;
  gap: 5px;
  font-size: 12px;
}
/* A dot or icon in front sits a little closer to the edge, so it looks as far in as the text on the other side */
.ui-bdg[data-lead] {
  padding-inline-start: var(--lead);
}

.ui-bdg[data-tone="neutral"] { --dot: var(--ui-bdg-neutral-dot); }
.ui-bdg[data-tone="info"] { --bg: var(--ui-bdg-info-bg); --fg: var(--ui-bdg-info-fg); }
.ui-bdg[data-tone="success"] { --bg: var(--ui-bdg-success-bg); --fg: var(--ui-bdg-success-fg); }
.ui-bdg[data-tone="warning"] { --bg: var(--ui-bdg-warning-bg); --fg: var(--ui-bdg-warning-fg); }
.ui-bdg[data-tone="danger"] { --bg: var(--ui-bdg-danger-bg); --fg: var(--ui-bdg-danger-fg); }
.ui-bdg[data-tone="purple"] { --bg: var(--ui-bdg-purple-bg); --fg: var(--ui-bdg-purple-fg); }

/* Long text ends in … instead of pushing the row wider */
.ui-bdg__label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ui-bdg__dot {
  position: relative;
  flex: none;
  width: 6px;
  height: 6px;
  margin: 0 1px;
  border-radius: 50%;
  background: var(--dot);
}
/* Live: a soft halo grows out of the dot and fades, over and over */
.ui-bdg__dot[data-live]::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: var(--dot);
  animation: ui-bdg-live 1.8s cubic-bezier(0.22, 1, 0.36, 1) infinite;
}
@keyframes ui-bdg-live {
  0% { transform: scale(1); opacity: 0.5; }
  70%, 100% { transform: scale(2.6); opacity: 0; }
}

.ui-bdg__icon {
  display: grid;
  flex: none;
  place-items: center;
  width: var(--mark);
  height: var(--mark);
}
.ui-bdg__icon > svg,
.ui-bdg__icon > img {
  display: block;
  width: 100%;
  height: 100%;
}

/* Count: round, at least as wide as it is high, the number centred */
.ui-bdg[data-count] {
  justify-content: center;
  min-width: var(--h);
  padding: 0 6px;
}

@media (prefers-reduced-motion: reduce) {
  .ui-bdg__dot[data-live]::after {
    animation: none;
    opacity: 0;
  }
}

/* Dark mode: follows a .dark class or data-theme="dark" on any ancestor, e.g. <html> */
:where(.dark, [data-theme="dark"]) .ui-bdg {
  --ui-bdg-neutral-bg: var(--aui-subtle, #26262a);
  --ui-bdg-neutral-fg: #a1a1a6;
  --ui-bdg-neutral-dot: #6b6b72;
  --ui-bdg-info-bg: var(--aui-info-soft, #16243f);
  --ui-bdg-info-fg: var(--aui-info, #8ab4ff);
  --ui-bdg-success-bg: var(--aui-success-soft, #123020);
  --ui-bdg-success-fg: var(--aui-success, #5fc88a);
  --ui-bdg-warning-bg: var(--aui-warning-soft, #3a2610);
  --ui-bdg-warning-fg: var(--aui-warning, #ffb35c);
  --ui-bdg-danger-bg: var(--aui-danger-soft, #3b1c14);
  --ui-bdg-danger-fg: var(--aui-danger, #ff8a7a);
  --ui-bdg-purple-bg: #2a1c3d;
  --ui-bdg-purple-fg: #c9a2f5;
}
`;
