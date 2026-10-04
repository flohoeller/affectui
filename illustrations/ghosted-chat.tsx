"use client";

import { useEffect, useRef, useState } from "react";

/*
 * Ghosted Chat – a small card illustration, in a single self-contained file.
 * Three unanswered outgoing messages, the last one with a red shine and a soft glow, marked "Read".
 * On hover a thumbs-down reply pops in.
 * The scene is laid out on a 360 × 240 artboard and scaled to the width of its container.
 */

const W = 360;

export type GhostedChatProps = {
  className?: string;
  /** Accessible description of the scene */
  label?: string;
};

export function GhostedChat({
  className,
  label = "A chat with three unanswered messages marked as read",
}: GhostedChatProps) {
  const root = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  // The messages arrive one by one once the scene scrolls into view
  const [play, setPlay] = useState(false);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPlay(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Scale the artboard to the container width
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const fit = () => setScale(el.clientWidth / W);
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={root} className={["ui-gc", className].filter(Boolean).join(" ")} role="img" aria-label={label}>
      {/* React 19 hoists this into <head> once, no matter how many instances render */}
      <style href="ui-ghosted-chat" precedence="default">
        {css}
      </style>
      <div className="ui-gc-grid" aria-hidden="true" />
      <div
        className="ui-gc-stage"
        aria-hidden="true"
        data-play={play || undefined}
        style={{ transform: `scale(${scale})`, visibility: scale > 0 ? "visible" : "hidden" }}
      >
        <div className="ui-gc-content">
          <span className="ui-gc-status">No new messages</span>
          <div className="ui-gc-bubbles">
            <div className="ui-gc-bubble">
              <span>Hi team!</span>
            </div>
            <div className="ui-gc-bubble">
              <span>Are you by any chance looking for a recruiter?</span>
            </div>
            <div className="ui-gc-bubble ui-gc-bubble-last">
              <span className="ui-gc-alert">Hello?</span>
            </div>
            <span className="ui-gc-read">Read</span>
          </div>
          <div className="ui-gc-bubble ui-gc-reply">
            <span>👎</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Styles ---------- */

const css = /* css */ `
.ui-gc {
  --ui-gc-grid: rgba(28, 29, 31, 0.035);
  --ui-gc-bubble: #FFFFFF;
  --ui-gc-bubble-border: #EDEDED;
  --ui-gc-bubble-shadow: 0 2px 6px rgba(28, 29, 31, 0.08), 0 1px 2px rgba(28, 29, 31, 0.05);
  --ui-gc-text: #4A4C52;
  --ui-gc-ink: #202020;
  --ui-gc-status: #9A9DA3;
  --ui-gc-read: #A8ABB1;
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 2;
  overflow: hidden;
  font-family: "Inter", ui-sans-serif, system-ui, -apple-system, sans-serif;
}
.ui-gc *, .ui-gc *::before, .ui-gc *::after { box-sizing: border-box; margin: 0; }
.ui-gc-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(to right, var(--ui-gc-grid) 1px, transparent 1px),
    linear-gradient(to bottom, var(--ui-gc-grid) 1px, transparent 1px);
  background-size: 4.4444% 6.6667%;
  -webkit-mask-image: radial-gradient(ellipse at center, #000 25%, transparent 75%);
  mask-image: radial-gradient(ellipse at center, #000 25%, transparent 75%);
  pointer-events: none;
}

/* Fixed 360 × 240 artboard, scaled from the top-left corner */
.ui-gc-stage {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 1;
  width: 360px;
  height: 240px;
  padding: 22px 22px 0;
  transform-origin: 0 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}
/* A touch smaller than the frame, so the chat has room to breathe */
.ui-gc-content {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  transform: scale(0.86);
  transform-origin: 50% 45%;
}

/* Arrival: everything waits hidden, then fades in one after another */
.ui-gc-status,
.ui-gc-bubbles > * {
  opacity: 0;
}
.ui-gc-stage[data-play] .ui-gc-status {
  animation: ui-gc-fade 500ms ease-out 100ms both;
}
.ui-gc-stage[data-play] .ui-gc-bubbles > .ui-gc-bubble {
  animation: ui-gc-arrive 620ms cubic-bezier(0.22, 1, 0.36, 1) both;
}
.ui-gc-stage[data-play] .ui-gc-bubbles > .ui-gc-bubble:nth-child(1) { animation-delay: 500ms; }
.ui-gc-stage[data-play] .ui-gc-bubbles > .ui-gc-bubble:nth-child(2) { animation-delay: 1300ms; }
.ui-gc-stage[data-play] .ui-gc-bubbles > .ui-gc-bubble:nth-child(3) { animation-delay: 2300ms; }
.ui-gc-stage[data-play] .ui-gc-read {
  animation: ui-gc-fade 500ms ease-out 3200ms both;
}
@keyframes ui-gc-arrive {
  from { opacity: 0; transform: translateY(10px) scale(0.92); filter: blur(2px); }
  to { opacity: 1; transform: none; filter: none; }
}
@keyframes ui-gc-fade {
  from { opacity: 0; }
  to { opacity: 1; }
}
.ui-gc-bubbles > .ui-gc-bubble { transform-origin: 100% 100%; }

.ui-gc-status {
  font-size: 11px;
  line-height: 1.4;
  color: var(--ui-gc-status);
  letter-spacing: 0.01em;
  transition: color 0.3s ease;
}
.ui-gc-bubbles {
  width: 100%;
  padding-right: 14px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 5px;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.ui-gc-bubble {
  max-width: min(68%, 26ch);
  width: fit-content;
  padding: 7px 12px;
  background: var(--ui-gc-bubble);
  border: 1px solid var(--ui-gc-bubble-border);
  border-radius: 14px 14px 4px 14px;
  box-shadow: var(--ui-gc-bubble-shadow);
  font-size: 12.5px;
  line-height: 1.3;
  font-weight: 500;
  color: var(--ui-gc-text);
}

/* "Hello?" – a red shine sweeps through the text */
.ui-gc-alert {
  display: inline-block;
  font-weight: 500;
  background-image: linear-gradient(90deg, var(--ui-gc-ink) 0%, var(--ui-gc-ink) 38%, #FF4D47 50%, var(--ui-gc-ink) 62%, var(--ui-gc-ink) 100%);
  background-size: 300% 100%;
  background-position: 100% 0;
  background-repeat: no-repeat;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  animation: ui-gc-shine 4.5s ease-in-out infinite;
}
@keyframes ui-gc-shine {
  0% { background-position: 100% 0; }
  35%, 100% { background-position: 0% 0; }
}

/* Last bubble: soft colored glow underneath */
.ui-gc-bubble-last {
  position: relative;
  isolation: isolate;
  padding: 6px 11px;
  margin-bottom: 6px;
  /* The surface moves to ::before so the glow can sit behind it */
  background: transparent;
  border-color: transparent;
  box-shadow: none;
}
.ui-gc-bubble-last::before {
  content: "";
  position: absolute;
  inset: -1px;
  z-index: -1;
  background: var(--ui-gc-bubble);
  border: 1px solid var(--ui-gc-bubble-border);
  border-radius: inherit;
  box-shadow: var(--ui-gc-bubble-shadow);
}
.ui-gc-bubble-last::after {
  content: "";
  position: absolute;
  left: 50%;
  bottom: -6px;
  transform: translateX(-50%);
  width: 100%;
  height: 22px;
  background: linear-gradient(90deg, #FFA0AB 0%, #FFB89E 33%, #C8A8E5 66%, #A8B5FF 100%);
  opacity: 0.6;
  filter: blur(12px);
  border-radius: 50%;
  pointer-events: none;
  z-index: -2;
}
.ui-gc-read {
  font-size: 10.5px;
  line-height: 1.4;
  color: var(--ui-gc-read);
  margin-top: 2px;
  transition: color 0.3s ease;
}

/* Thumbs-down reply – hidden, pops in on hover */
.ui-gc-reply {
  position: absolute;
  left: 64px; /* from the padded chat column */
  bottom: 68px;
  max-width: none;
  width: auto;
  padding: 6px 12px;
  background: #155EEF;
  border: 1px solid #155EEF;
  border-radius: 14px 14px 14px 4px;
  color: #FFFFFF;
  font-size: 15px;
  line-height: 1.1;
  box-shadow: 0 4px 12px rgba(21, 94, 239, 0.22), 0 1px 2px rgba(21, 94, 239, 0.18);
  opacity: 0;
  transform: translateY(14px) scale(0.92);
  transform-origin: bottom left;
  transition: opacity 0.35s ease, transform 0.45s cubic-bezier(0.34, 1.4, 0.64, 1);
  pointer-events: none;
}
/* Hover hides the status texts via their color, so the arrival animation (opacity) is left alone */
.ui-gc:hover .ui-gc-status,
.ui-gc:hover .ui-gc-read { color: transparent; }
.ui-gc:hover .ui-gc-bubbles { transform: translateY(-12px); }
.ui-gc:hover .ui-gc-reply { opacity: 1; transform: translateY(0) scale(1); }

@media (prefers-reduced-motion: reduce) {
  .ui-gc-alert { animation: none; background-position: 0% 0; }
  .ui-gc-status, .ui-gc-bubbles, .ui-gc-read, .ui-gc-reply { transition: none; }
  .ui-gc-status, .ui-gc-bubbles > * { opacity: 1; animation: none !important; }
}

/* Dark mode: follows a .dark class or data-theme="dark" on any ancestor, e.g. <html> */
:where(.dark, [data-theme="dark"]) .ui-gc {
  --ui-gc-grid: rgba(255, 255, 255, 0.045);
  --ui-gc-bubble: #232326;
  --ui-gc-bubble-border: rgba(255, 255, 255, 0.08);
  --ui-gc-bubble-shadow: 0 2px 6px rgba(0, 0, 0, 0.35), 0 1px 2px rgba(0, 0, 0, 0.4);
  --ui-gc-text: #c4c4c4;
  --ui-gc-ink: #ededed;
  --ui-gc-status: #8f8f8f;
  --ui-gc-read: #8f8f8f;
}
:where(.dark, [data-theme="dark"]) .ui-gc-bubble-last::after { opacity: 0.45; }
:where(.dark, [data-theme="dark"]) .ui-gc-reply {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4), 0 1px 2px rgba(0, 0, 0, 0.4);
}
`;
