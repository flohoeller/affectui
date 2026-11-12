"use client";

import { createElement, type ComponentPropsWithRef, type ReactNode } from "react";

/*
 * Badge – a single self-contained file, clean style.
 * A small status label – the one place a status gets its color: a soft tint with matching text, a leading dot or icon,
 * a live dot that pulses softly while something runs, or a round count like 3 or 99+.
 * The styles are injected below, so no extra files are needed.
 */

/** An icon from Hugeicons (e.g. `import { Clock01Icon } from "@hugeicons/core-free-icons"`) – drawn inline */
export type HugeIcon = readonly (readonly [string, { readonly [key: string]: string | number }])[];

export type BadgeTone = "neutral" | "info" | "success" | "warning" | "danger" | "purple";

export type BadgeProps = ComponentPropsWithRef<"span"> & {
  /** neutral: gray, the default · info: blue, running · success: green, done · warning: orange, needs you · danger: red, failed · purple: a kind, like Beta */
  tone?: BadgeTone;
  /** sm: 18px high, 11px text · md: 20px high, 12px text */
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
      <style href="ui-badge-clean" precedence="default">
        {css}
      </style>
      <span
        className={["ui-bdgc", className].filter(Boolean).join(" ")}
        data-tone={hue}
        data-size={scale}
        data-count={isCount ? "" : undefined}
        data-lead={lead ?? undefined}
        {...rest}
      >
        {lead === "dot" && <span className="ui-bdgc__dot" data-live={live ? "" : undefined} aria-hidden="true" />}
        {lead === "icon" && (
          <span className="ui-bdgc__icon" aria-hidden="true">
            <Glyph icon={icon} />
          </span>
        )}
        {isCount ? formatCount(count, max) : <span className="ui-bdgc__label">{children}</span>}
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
/* Colors as variables – override them on .ui-bdgc (see Theming in the docs) */
.ui-bdgc {
  --ui-bdgc-neutral-bg: var(--aui-subtle, rgba(0, 0, 0, 0.06));
  --ui-bdgc-neutral-fg: rgba(0, 0, 0, 0.61);
  --ui-bdgc-neutral-dot: rgba(0, 0, 0, 0.3);
  --ui-bdgc-info-bg: var(--aui-info-soft, #008ff519);
  --ui-bdgc-info-fg: var(--aui-info, #006dcbf2);
  --ui-bdgc-success-bg: var(--aui-success-soft, #00a43319);
  --ui-bdgc-success-fg: var(--aui-success, #007d2ee0);
  --ui-bdgc-warning-bg: var(--aui-warning-soft, #ff9c0029);
  --ui-bdgc-warning-fg: var(--aui-warning, #b25e00);
  --ui-bdgc-danger-bg: var(--aui-danger-soft, #f52b0018);
  --ui-bdgc-danger-fg: var(--aui-danger, #d72400da);
  --ui-bdgc-purple-bg: color-mix(in srgb, var(--aui-purple, #a651f0) 11%, transparent);
  --ui-bdgc-purple-fg: #8a35d6;

  --bg: var(--ui-bdgc-neutral-bg);
  --fg: var(--ui-bdgc-neutral-fg);
  --dot: currentColor;
  --h: 18px;
  --pad: 6px;
  --lead: 4px;
  --mark: 12px;

  display: inline-flex;
  flex: none;
  align-items: center;
  gap: 4px;
  box-sizing: border-box;
  max-width: 100%;
  height: var(--h);
  padding: 0 var(--pad);
  border-radius: calc(var(--aui-radius-sm, 5px) - 1px);
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
.ui-bdgc[data-size="md"] {
  --h: 20px;
  --pad: 7px;
  --lead: 5px;
  --mark: 13px;
  gap: 5px;
  border-radius: var(--aui-radius-sm, 5px);
  font-size: 12px;
}
/* A dot or icon in front sits a little closer to the edge, so it looks as far in as the text on the other side */
.ui-bdgc[data-lead] {
  padding-inline-start: var(--lead);
}

.ui-bdgc[data-tone="neutral"] { --dot: var(--ui-bdgc-neutral-dot); }
.ui-bdgc[data-tone="info"] { --bg: var(--ui-bdgc-info-bg); --fg: var(--ui-bdgc-info-fg); }
.ui-bdgc[data-tone="success"] { --bg: var(--ui-bdgc-success-bg); --fg: var(--ui-bdgc-success-fg); }
.ui-bdgc[data-tone="warning"] { --bg: var(--ui-bdgc-warning-bg); --fg: var(--ui-bdgc-warning-fg); }
.ui-bdgc[data-tone="danger"] { --bg: var(--ui-bdgc-danger-bg); --fg: var(--ui-bdgc-danger-fg); }
.ui-bdgc[data-tone="purple"] { --bg: var(--ui-bdgc-purple-bg); --fg: var(--ui-bdgc-purple-fg); }

/* Long text ends in … instead of pushing the row wider */
.ui-bdgc__label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ui-bdgc__dot {
  position: relative;
  flex: none;
  width: 6px;
  height: 6px;
  margin: 0 1px;
  border-radius: 50%;
  background: var(--dot);
}
/* Live: a soft halo grows out of the dot and fades, over and over */
.ui-bdgc__dot[data-live]::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: var(--dot);
  animation: ui-bdgc-live 1.8s cubic-bezier(0.22, 1, 0.36, 1) infinite;
}
@keyframes ui-bdgc-live {
  0% { transform: scale(1); opacity: 0.5; }
  70%, 100% { transform: scale(2.6); opacity: 0; }
}

.ui-bdgc__icon {
  display: grid;
  flex: none;
  place-items: center;
  width: var(--mark);
  height: var(--mark);
}
.ui-bdgc__icon > svg,
.ui-bdgc__icon > img {
  display: block;
  width: 100%;
  height: 100%;
}

/* Count: round, at least as wide as it is high, the number centred */
.ui-bdgc[data-count] {
  justify-content: center;
  min-width: var(--h);
  padding: 0 5px;
  border-radius: 999px;
}

@media (prefers-reduced-motion: reduce) {
  .ui-bdgc__dot[data-live]::after {
    animation: none;
    opacity: 0;
  }
}

/* Dark mode: follows a .dark class or data-theme="dark" on any ancestor, e.g. <html> */
:where(.dark, [data-theme="dark"]) .ui-bdgc {
  --ui-bdgc-neutral-bg: var(--aui-subtle, rgba(255, 255, 255, 0.08));
  --ui-bdgc-neutral-fg: rgba(255, 255, 255, 0.62);
  --ui-bdgc-neutral-dot: rgba(255, 255, 255, 0.34);
  --ui-bdgc-info-bg: var(--aui-info-soft, #0077ff3a);
  --ui-bdgc-info-fg: var(--aui-info, #70b8ff);
  --ui-bdgc-success-bg: var(--aui-success-soft, #00f04a1f);
  --ui-bdgc-success-fg: var(--aui-success, #5fc88a);
  --ui-bdgc-warning-bg: var(--aui-warning-soft, #fb6a0025);
  --ui-bdgc-warning-fg: var(--aui-warning, #ffb35c);
  --ui-bdgc-danger-bg: var(--aui-danger-soft, #ff35232b);
  --ui-bdgc-danger-fg: var(--aui-danger, #ff8a7a);
  --ui-bdgc-purple-bg: color-mix(in srgb, var(--aui-purple, #b98af0) 16%, transparent);
  --ui-bdgc-purple-fg: #c9a2f5;
}
`;
