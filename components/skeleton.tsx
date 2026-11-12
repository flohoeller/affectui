"use client";

import type { ComponentPropsWithRef, CSSProperties } from "react";

/*
 * Skeleton – a single self-contained file.
 * Skeleton: a gray shape that stands in for text, an avatar or a button while the data loads; a soft sheen sweeps
 * across it, every skeleton in step. Give it the size of what it replaces – with `line` it sits in a box one text line
 * tall, so a row keeps its height when the words land. Loading: wraps the skeletons of one area, tells screen readers
 * it is busy and fades them in a beat late, so a fast load never flashes them.
 * The styles are injected below, so no extra files are needed.
 */

type Length = number | string;

export type SkeletonProps = Omit<ComponentPropsWithRef<"span">, "children"> & {
  /** px or any CSS length */
  width?: Length;
  /** The shape's own height – px or any CSS length */
  height?: Length;
  /** Corner radius – px, "50%" for a circle */
  radius?: Length;
  /**
   * Sits the shape in a box as tall as the text line it replaces (true = 1lh, or a length), centered in it –
   * a 10px bar in a 20px line, so the row is exactly as tall as it will be with text
   */
  line?: boolean | Length;
};

export function Skeleton({ width = "100%", height = 12, radius, line, className, style, ...rest }: SkeletonProps) {
  const bar = (
    <span
      {...(line ? {} : rest)}
      className={["ui-skl", line ? null : className].filter(Boolean).join(" ")}
      style={{ width, height, borderRadius: radius, ...(line ? null : style) }}
      aria-hidden="true"
    />
  );
  return (
    <>
      {/* React 19 hoists this into <head> once, no matter how many skeletons render */}
      <style href="ui-skeleton" precedence="default">
        {css}
      </style>
      {line ? (
        <span
          {...rest}
          className={["ui-skl__line", className].filter(Boolean).join(" ")}
          style={{ height: line === true ? "1lh" : line, ...style } as CSSProperties}
          aria-hidden="true"
        >
          {bar}
        </span>
      ) : (
        bar
      )}
    </>
  );
}

export type LoadingProps = Omit<ComponentPropsWithRef<"div">, "role"> & {
  /** What loads, for screen readers – "Loading runs" */
  label?: string;
};

/**
 * Wraps the skeletons that stand in for one area: role="status" with aria-busy, and a fade-in after 150ms.
 * Give it the real layout's class, so the grid or list is the same one the data fills.
 */
export function Loading({ label = "Loading", className, children, ...rest }: LoadingProps) {
  return (
    <div {...rest} className={["ui-skl-loading", className].filter(Boolean).join(" ")} role="status" aria-busy="true" aria-label={label}>
      <style href="ui-skeleton" precedence="default">
        {css}
      </style>
      {children}
    </div>
  );
}

const css = /* css */ `
/* Colors and motion as variables – override them on .ui-skl (see Theming in the docs) */
.ui-skl {
  --ui-skl-fill: #efefef;
  --ui-skl-sheen: rgba(255, 255, 255, 0.8);
  --ui-skl-speed: 1.6s;
  --ui-skl-ease: var(--aui-ease, cubic-bezier(0.22, 1, 0.36, 1));

  position: relative;
  display: block;
  flex: none;
  box-sizing: border-box;
  max-width: 100%;
  overflow: hidden;
  border-radius: var(--aui-radius-sm, 6px);
  background: var(--ui-skl-fill);
}
/* The sheen: every skeleton sweeps at the same time, so a whole list breathes as one */
.ui-skl::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, var(--ui-skl-sheen), transparent);
  translate: -100% 0;
  animation: ui-skl-sweep var(--ui-skl-speed) var(--ui-skl-ease) infinite;
}
@keyframes ui-skl-sweep { 60%, 100% { translate: 100% 0; } }

/* line: a box one text line tall, the shape centered in it */
.ui-skl__line { display: flex; align-items: center; min-width: 0; max-width: 100%; }

/* The wrapper fades in a beat late – a load under 150ms never shows the skeletons at all */
.ui-skl-loading { --ui-skl-delay: 150ms; animation: ui-skl-in 300ms ease var(--ui-skl-delay) both; }
@keyframes ui-skl-in { from { opacity: 0; } }

@media (prefers-reduced-motion: reduce) {
  .ui-skl::after { display: none; }
}

/* Dark mode: follows a .dark class or data-theme="dark" on any ancestor, e.g. <html> */
:where(.dark, [data-theme="dark"]) .ui-skl {
  --ui-skl-fill: #242428;
  --ui-skl-sheen: rgba(255, 255, 255, 0.05);
}
`;
