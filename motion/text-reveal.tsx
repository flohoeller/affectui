"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

/*
 * Text Reveal – a text effect, in a single self-contained file.
 * When the text scrolls into view it arrives piece by piece – word by word or letter by letter –
 * each piece fading in out of a soft blur while it rises a little, one after another.
 * Screen readers get the whole sentence at once; the moving pieces are hidden from them.
 * Font, size and color come from the parent.
 */

export type TextRevealProps = {
  /** The text to reveal */
  text: string;
  /** Reveal word by word or letter by letter */
  by?: "word" | "char";
  /** Time between two pieces, in ms */
  stagger?: number;
  /** Wait before the first piece, in ms */
  delay?: number;
  /** Time each piece takes to arrive, in ms */
  duration?: number;
  /** Element to render */
  as?: "p" | "h1" | "h2" | "h3" | "span";
  /** Reveal only the first time; otherwise it plays again each time it enters the view */
  once?: boolean;
  className?: string;
};

export function TextReveal({ text, by = "word", stagger = 40, delay = 0, duration = 700, as: Tag = "p", once = true, className }: TextRevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return setShown(true);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setShown(true);
            if (once) io.disconnect();
          } else if (!once) {
            setShown(false);
          }
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [once]);

  // Words and the whitespace between them; whitespace stays plain text so lines wrap normally
  let i = 0;
  const parts = text.split(/(\s+)/).map((part, k) => {
    if (part === "") return null;
    if (/^\s+$/.test(part)) return part;
    if (by === "word") {
      return (
        <span key={k} className="ui-trv__p" style={{ "--ui-trv-i": i++ } as CSSProperties}>
          {part}
        </span>
      );
    }
    // Letter by letter: the letters of a word sit in one unbreakable group
    return (
      <span key={k} className="ui-trv__w">
        {Array.from(part).map((ch, c) => (
          <span key={c} className="ui-trv__p" style={{ "--ui-trv-i": i++ } as CSSProperties}>
            {ch}
          </span>
        ))}
      </span>
    );
  });

  return (
    <Tag
      ref={ref as never}
      className={["ui-trv", className].filter(Boolean).join(" ")}
      data-shown={shown ? "" : undefined}
      style={
        {
          "--ui-trv-stagger": `${stagger}ms`,
          "--ui-trv-delay": `${delay}ms`,
          "--ui-trv-duration": `${duration}ms`,
        } as CSSProperties
      }
    >
      {/* React 19 hoists this into <head> once, no matter how many instances render */}
      <style href="ui-text-reveal" precedence="default">
        {css}
      </style>
      <span className="ui-trv__sr">{text}</span>
      <span aria-hidden="true">{parts}</span>
    </Tag>
  );
}

const css = /* css */ `
.ui-trv {
  --ui-trv-blur: 8px;
  --ui-trv-rise: 0.35em;
  --ui-trv-ease: cubic-bezier(0.2, 0.7, 0.2, 1);
}
.ui-trv__sr {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}
.ui-trv__w {
  display: inline-block;
  white-space: nowrap;
}
.ui-trv__p {
  display: inline-block;
  opacity: 0;
  filter: blur(var(--ui-trv-blur));
  transform: translateY(var(--ui-trv-rise));
  will-change: opacity, filter, transform;
}
.ui-trv[data-shown] .ui-trv__p {
  animation: ui-trv-in var(--ui-trv-duration) var(--ui-trv-ease) both;
  animation-delay: calc(var(--ui-trv-delay) + var(--ui-trv-i) * var(--ui-trv-stagger));
}
@keyframes ui-trv-in {
  from {
    opacity: 0;
    filter: blur(var(--ui-trv-blur));
    transform: translateY(var(--ui-trv-rise));
  }
  to {
    opacity: 1;
    filter: blur(0);
    transform: none;
  }
}

/* Reduced motion: the text is simply there */
@media (prefers-reduced-motion: reduce) {
  .ui-trv .ui-trv__p,
  .ui-trv[data-shown] .ui-trv__p {
    opacity: 1;
    filter: none;
    transform: none;
    animation: none;
  }
}

/* Dark mode: follows a .dark class or data-theme="dark" on any ancestor, e.g. <html>.
   The text takes its color from the parent, so only the blur softens a touch on dark backgrounds */
:where(.dark, [data-theme="dark"]) .ui-trv {
  --ui-trv-blur: 6px;
}
`;
