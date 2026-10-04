"use client";

import { useId } from "react";

/*
 * Team Invite – a small card illustration, in a single self-contained file.
 * Two connected teammates and an empty dashed slot. A cursor drags a third avatar into the slot:
 * it lands, the dashed line turns solid and the status dot lights up – then the scene starts over.
 * The artwork is laid out on a 600 × 400 grid inside a 3 : 2 frame and scales with its container.
 */

export type TeamInviteAvatar = {
  /** Image URL – a square portrait, shown in a circle */
  src: string;
  /** Name for the accessible description */
  name?: string;
};

export type TeamInviteProps = {
  /** The two teammates that are already connected, then the one being invited */
  avatars: [TeamInviteAvatar, TeamInviteAvatar, TeamInviteAvatar];
  className?: string;
  /** Accessible description of the scene */
  label?: string;
};

export function TeamInvite({ avatars, className, label }: TeamInviteProps) {
  const id = "ui-ti" + useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const [a, b, c] = avatars;
  const names = avatars.map((p, i) => p.name ?? `Teammate ${i + 1}`);

  return (
    <div
      className={["ui-ti", className].filter(Boolean).join(" ")}
      role="img"
      aria-label={label ?? `${names[0]} and ${names[1]} are connected; ${names[2]} is dragged into the empty slot and joins the team`}
    >
      {/* React 19 hoists this into <head> once, no matter how many instances render */}
      <style href="ui-team-invite" precedence="default">
        {css}
      </style>

      <svg className="ui-ti-lines" viewBox="0 0 600 400" aria-hidden="true">
        <defs>
          <linearGradient id={`${id}-line`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" className="ui-ti-stop-a" />
            <stop offset="100%" className="ui-ti-stop-b" />
          </linearGradient>
        </defs>
        {/* Already connected */}
        <path className="ui-ti-line" d="M162 159C214 159 222 105 258 105" stroke={`url(#${id}-line)`} />
        {/* The open invite: dashed while waiting, drawn solid once the avatar lands */}
        <path className="ui-ti-line ui-ti-line--dashed" d="M162 159C214 165 214 245 248 245" />
        <path className="ui-ti-line ui-ti-line--joined" d="M162 159C214 165 214 245 248 245" pathLength={1} stroke={`url(#${id}-line)`} />
        {/* Empty slot – same stroke, dash and gap as the dashed line (19 dashes fit the circle exactly) */}
        <g className="ui-ti-slot">
          <circle className="ui-ti-line ui-ti-line--slot" cx="290" cy="245" r="40" />
          <path className="ui-ti-plus" d="M290 234v22M279 245h22" />
        </g>
      </svg>

      <Node className="ui-ti-node--a" avatar={a} online />
      <Node className="ui-ti-node--b" avatar={b} online />

      {/* Dragged from the right into the slot, with the cursor holding on */}
      <div className="ui-ti-drag" aria-hidden="true">
        <Node className="ui-ti-node--c" avatar={c} online />
        {/* Pointer with soft, rounded corners; its tip sits at (0, 0) of the viewBox */}
        <svg className="ui-ti-cursor" viewBox="-2.186 -0.256 18.514 22.277" aria-hidden="true">
          <path
            transform="rotate(21.37)"
            d="M13.92 4.07c1.69.66 3.03 1.18 3.94 1.68.46.25.87.53 1.16.86.31.35.51.79.48 1.29-.03.51-.27.92-.62 1.23-.33.3-.77.53-1.25.74-.96.4-2.36.78-4.12 1.26-.56.15-.98.27-1.26.37-.26.1-.38.18-.47.27-.09.09-.17.21-.27.47-.1.28-.22.7-.37 1.26-.48 1.76-.86 3.16-1.26 4.12-.2.49-.44.93-.74 1.25-.32.35-.72.6-1.23.62-.51.03-.94-.17-1.29-.48-.33-.29-.61-.7-.86-1.16-.5-.91-1.02-2.25-1.68-3.94L1.66 7.76C.96 5.99.41 4.59.16 3.51-.09 2.44-.12 1.39.63.63 1.39-.12 2.44-.09 3.51.16c1.08.25 2.48.8 4.25 1.5l6.16 2.41Z"
          />
        </svg>
      </div>
    </div>
  );
}

function Node({ avatar, online, className }: { avatar: TeamInviteAvatar; online?: boolean; className: string }) {
  return (
    <div className={`ui-ti-node ${className}`} aria-hidden="true">
      <span className="ui-ti-face">
        <img src={avatar.src} alt="" draggable={false} />
      </span>
      {online && <span className="ui-ti-dot" />}
    </div>
  );
}

/* ---------- Styles ---------- */

const css = /* css */ `
.ui-ti {
  /* 1 unit of the 600 × 400 layout grid */
  --u: calc(100cqw / 600);
  --ui-ti-bubble: #ffffff;
  --ui-ti-bubble-ring: rgba(10, 10, 10, 0.06);
  --ui-ti-face: #eef0f4;
  /* Same gray as the lines in Outreach Branches */
  --ui-ti-line-a: #e4e7ec;
  --ui-ti-line-b: #e4e7ec;
  --ui-ti-dash: #e4e7ec;
  --ui-ti-plus: #c4c4c4;
  --ui-ti-online: #34c46a;
  /* Ring around the status dot: mostly white with a hint of the green, fully opaque */
  --ui-ti-dot-ring: #e2f6e9;
  --ui-ti-dot-edge: rgba(52, 196, 106, 0.1);
  --ui-ti-cursor: #141b34;
  --ui-ti-shadow: 0 calc(10 * var(--u)) calc(24 * var(--u)) rgba(0, 0, 0, 0.07), 0 calc(2 * var(--u)) calc(5 * var(--u)) rgba(0, 0, 0, 0.05);
  --ui-ti-lift: 0 calc(18 * var(--u)) calc(34 * var(--u)) rgba(0, 0, 0, 0.12), 0 calc(3 * var(--u)) calc(8 * var(--u)) rgba(0, 0, 0, 0.06);
  --ui-ti-loop: 4.4s;
  --ui-ti-ease: cubic-bezier(0.7, 0, 0.25, 1);
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 2;
  overflow: hidden;
  container-type: inline-size;
}
.ui-ti *, .ui-ti *::before, .ui-ti *::after { box-sizing: border-box; }

.ui-ti-lines { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.ui-ti-stop-a { stop-color: var(--ui-ti-line-a); }
.ui-ti-stop-b { stop-color: var(--ui-ti-line-b); }
.ui-ti-line { fill: none; stroke-width: 2.4; stroke-linecap: round; }
.ui-ti-line--dashed {
  stroke: var(--ui-ti-dash);
  stroke-dasharray: 6 7.23;
  animation: ui-ti-dashed var(--ui-ti-loop) linear infinite;
}
.ui-ti-line--slot {
  stroke: var(--ui-ti-dash);
  stroke-dasharray: 6 7.23;
}
.ui-ti-line--joined {
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  animation: ui-ti-joined var(--ui-ti-loop) linear infinite;
}

/* ---------- Nodes ---------- */

.ui-ti-node {
  position: absolute;
  width: calc(84 * var(--u));
  height: calc(84 * var(--u));
  margin: calc(-42 * var(--u)) 0 0 calc(-42 * var(--u));
  padding: calc(5 * var(--u));
  border-radius: 50%;
  background: var(--ui-ti-bubble);
  box-shadow: inset 0 0 0 calc(1 * var(--u)) var(--ui-ti-bubble-ring), var(--ui-ti-shadow);
}
.ui-ti-node--a { left: calc(120 * var(--u)); top: calc(159 * var(--u)); }
.ui-ti-node--b { left: calc(300 * var(--u)); top: calc(105 * var(--u)); }
.ui-ti-face {
  display: block;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 50%;
  background: var(--ui-ti-face);
}
.ui-ti-face img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  user-select: none;
}
/* Status: a bright green dot in a thick, pale green ring with a faint 10% halo outside */
.ui-ti-dot {
  position: absolute;
  right: calc(1 * var(--u));
  bottom: calc(3 * var(--u));
  width: calc(24 * var(--u));
  height: calc(24 * var(--u));
  border: calc(7 * var(--u)) solid var(--ui-ti-dot-ring);
  border-radius: 50%;
  background: var(--ui-ti-online);
  box-shadow: 0 0 0 calc(2 * var(--u)) var(--ui-ti-dot-edge);
}

/* ---------- Empty slot ---------- */

.ui-ti-slot {
  transform-box: fill-box;
  transform-origin: center;
  animation: ui-ti-slot var(--ui-ti-loop) linear infinite;
}
.ui-ti-plus { fill: none; stroke: var(--ui-ti-plus); stroke-width: 1.8; stroke-linecap: round; }

/* ---------- The invite being dragged in ---------- */

/* Starts on the right and is carried to the slot (290, 245) */
.ui-ti-drag {
  position: absolute;
  left: calc(456 * var(--u));
  top: calc(281 * var(--u));
  animation: ui-ti-drag var(--ui-ti-loop) infinite;
}
.ui-ti-node--c {
  left: 0;
  top: 0;
  animation: ui-ti-lift var(--ui-ti-loop) infinite;
}
.ui-ti-node--c .ui-ti-dot { animation: ui-ti-online var(--ui-ti-loop) infinite; }
/* The pointer rests on the photo: its tip at (+16, +14) from the avatar's centre (the tip is 11.8% / 1.15% into the image) */
.ui-ti-cursor {
  position: absolute;
  left: calc(11.28 * var(--u));
  top: calc(13.45 * var(--u));
  width: calc(40 * var(--u));
  height: calc(48.13 * var(--u));
  overflow: visible;
  transform-origin: calc(4.72 * var(--u)) calc(0.55 * var(--u));
  filter: drop-shadow(0 calc(3 * var(--u)) calc(7 * var(--u)) rgba(0, 0, 0, 0.16));
  animation: ui-ti-cursor var(--ui-ti-loop) infinite;
}
.ui-ti-cursor path {
  fill: var(--ui-ti-cursor);
  stroke: #fff;
  stroke-width: 1.7;
  stroke-linejoin: round;
  paint-order: stroke;
}

/*
 * One loop:
 *   (4.4 s)
 *   0–12%   rest on the right          12–16% pick up (lift)
 *   16–42%  carried to the slot        42–48% drop, settle
 *   48–54%  line draws solid, dot pops 54–62% cursor lets go and drifts off
 *   62–88%  hold the finished team     88–100% fade back to the start
 */
@keyframes ui-ti-drag {
  0%, 16% { transform: translate(0, 0); opacity: 1; animation-timing-function: var(--ui-ti-ease); }
  42%, 88% { transform: translate(calc(-166 * var(--u)), calc(-36 * var(--u))); opacity: 1; }
  94% { transform: translate(calc(-166 * var(--u)), calc(-36 * var(--u))); opacity: 0; }
  95% { transform: translate(0, 0); opacity: 0; }
  100% { transform: translate(0, 0); opacity: 1; }
}
@keyframes ui-ti-lift {
  0%, 12% { transform: scale(1); box-shadow: inset 0 0 0 calc(1 * var(--u)) var(--ui-ti-bubble-ring), var(--ui-ti-shadow); animation-timing-function: var(--ui-ti-ease); }
  16%, 40% { transform: scale(1.07); box-shadow: inset 0 0 0 calc(1 * var(--u)) var(--ui-ti-bubble-ring), var(--ui-ti-lift); animation-timing-function: var(--ui-ti-ease); }
  46%, 100% { transform: scale(1); box-shadow: inset 0 0 0 calc(1 * var(--u)) var(--ui-ti-bubble-ring), var(--ui-ti-shadow); }
}
@keyframes ui-ti-online {
  0%, 48% { transform: scale(0); }
  52% { transform: scale(1.25); }
  56%, 100% { transform: scale(1); }
}
@keyframes ui-ti-cursor {
  0%, 11% { transform: translate(0, 0) scale(1); opacity: 1; animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1); }
  14%, 42% { transform: translate(0, 0) scale(0.86); opacity: 1; animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1); }
  47% { transform: translate(0, 0) scale(1); opacity: 1; animation-timing-function: var(--ui-ti-ease); }
  62%, 88% { transform: translate(calc(70 * var(--u)), calc(44 * var(--u))) scale(1); opacity: 0; }
  95% { transform: translate(calc(20 * var(--u)), calc(14 * var(--u))) scale(1); opacity: 0; }
  100% { transform: translate(0, 0) scale(1); opacity: 1; }
}
@keyframes ui-ti-slot {
  0%, 30% { opacity: 1; transform: scale(1); animation-timing-function: var(--ui-ti-ease); }
  42%, 90% { opacity: 0; transform: scale(1.12); }
  100% { opacity: 1; transform: scale(1); }
}
@keyframes ui-ti-dashed {
  0%, 46% { opacity: 1; }
  50%, 92% { opacity: 0; }
  100% { opacity: 1; }
}
@keyframes ui-ti-joined {
  0%, 44% { stroke-dashoffset: 1; opacity: 1; }
  54%, 88% { stroke-dashoffset: 0; opacity: 1; }
  94%, 100% { stroke-dashoffset: 0; opacity: 0; }
}

/* Reduced motion: a still frame of the waiting state */
@media (prefers-reduced-motion: reduce) {
  .ui-ti-drag, .ui-ti-node--c, .ui-ti-node--c .ui-ti-dot, .ui-ti-cursor, .ui-ti-slot,
  .ui-ti-line--dashed, .ui-ti-line--joined { animation: none; }
  .ui-ti-node--c .ui-ti-dot { transform: scale(0); }
}

/* Dark mode: follows a .dark class or data-theme="dark" on any ancestor, e.g. <html> */
:where(.dark, [data-theme="dark"]) .ui-ti {
  --ui-ti-bubble: #232326;
  --ui-ti-bubble-ring: rgba(255, 255, 255, 0.08);
  --ui-ti-face: #2e2e33;
  --ui-ti-line-a: rgba(255, 255, 255, 0.14);
  --ui-ti-line-b: rgba(255, 255, 255, 0.14);
  --ui-ti-dash: rgba(255, 255, 255, 0.14);
  --ui-ti-plus: #5c5c61;
  --ui-ti-online: #3fd17a;
  --ui-ti-dot-ring: #24392c;
  --ui-ti-dot-edge: rgba(63, 209, 122, 0.12);
  --ui-ti-shadow: 0 calc(10 * var(--u)) calc(24 * var(--u)) rgba(0, 0, 0, 0.4), 0 calc(2 * var(--u)) calc(5 * var(--u)) rgba(0, 0, 0, 0.3);
  --ui-ti-lift: 0 calc(18 * var(--u)) calc(34 * var(--u)) rgba(0, 0, 0, 0.5), 0 calc(3 * var(--u)) calc(8 * var(--u)) rgba(0, 0, 0, 0.3);
}
`;
