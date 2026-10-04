"use client";

import { useEffect, useId, useState, type ReactNode } from "react";

/*
 * Agent Team – an animated card illustration, in a single self-contained file.
 * A prompt types itself into a pill and is sent; dashed lines branch out from it to three agents,
 * who pop in one after another with their role and the tools they use – then the scene starts over.
 * The artwork is laid out on a 600 × 400 grid inside a 3 : 2 frame and scales with its container.
 */

export type AgentTool = "linkedin" | "hubspot" | "slack" | "gmail" | "salesforce";

export type AgentTeamMember = {
  /** Role shown in the pill */
  role: string;
  /** Square portrait, shown in a circle */
  avatar: string;
  /** One or two tools, drawn as overlapping logo circles */
  tools?: AgentTool[];
};

export type AgentTeamProps = {
  /** Text that types itself into the prompt */
  prompt?: string;
  /** Exactly three agents, left to right */
  members: [AgentTeamMember, AgentTeamMember, AgentTeamMember];
  className?: string;
  /** Accessible description of the scene */
  label?: string;
};

/* Choreography, in ms */
const TYPE = 22; // per character
const SEND = 420; // button press after typing
const SPREAD = 700; // lines draw down
const STAGGER = 160; // between agents
const HOLD = 2600; // finished team stays
const RESET = 600; // fade back

type Phase = "typing" | "sent" | "team" | "reset";

export function AgentTeam({ prompt = "Build a team to work my inbound pipeline", members, className, label }: AgentTeamProps) {
  const id = "ui-at" + useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const [typed, setTyped] = useState(0);
  const [phase, setPhase] = useState<Phase>("typing");

  useEffect(() => {
    // Reduced motion: show the finished scene and stay there
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTyped(prompt.length);
      setPhase("team");
      return;
    }
    const timers: number[] = [];
    const later = (fn: () => void, ms: number) => timers.push(window.setTimeout(fn, ms));
    const run = () => {
      setPhase("typing");
      setTyped(0);
      for (let i = 1; i <= prompt.length; i++) later(() => setTyped(i), 500 + i * TYPE);
      const typedAt = 500 + prompt.length * TYPE;
      later(() => setPhase("sent"), typedAt + SEND);
      later(() => setPhase("team"), typedAt + SEND + SPREAD * 0.55);
      const doneAt = typedAt + SEND + SPREAD + STAGGER * 3 + 500;
      later(() => setPhase("reset"), doneAt + HOLD);
      later(run, doneAt + HOLD + RESET);
    };
    run();
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [prompt]);

  const lines = ["M300 110C300 162 102 152 102 196", "M300 110V196", "M300 110C300 162 498 152 498 196"];

  return (
    <div
      className={["ui-at", className].filter(Boolean).join(" ")}
      data-phase={phase}
      role="img"
      aria-label={label ?? `A prompt – “${prompt}” – builds a team of three agents: ${members.map((m) => m.role).join(", ")}`}
    >
      {/* React 19 hoists this into <head> once, no matter how many instances render */}
      <style href="ui-agent-team" precedence="default">
        {css}
      </style>

      <svg className="ui-at-lines" viewBox="0 0 600 400" aria-hidden="true">
        <defs>
          {lines.map((d, i) => (
            <mask key={i} id={`${id}-reveal-${i}`} maskUnits="userSpaceOnUse" x="0" y="0" width="600" height="400">
              <path className="ui-at-reveal" d={d} pathLength={1} />
            </mask>
          ))}
        </defs>
        {lines.map((d, i) => (
          <path key={i} className="ui-at-line" d={d} mask={`url(#${id}-reveal-${i})`} />
        ))}
      </svg>

      {/* Soft Pro-colored glow that blooms behind the prompt when it's sent */}
      <div className="ui-at-halo" aria-hidden="true" />

      {/* Prompt */}
      <div className="ui-at-prompt" aria-hidden="true">
        <span className="ui-at-text">
          {prompt.slice(0, typed)}
          <span className="ui-at-caret" />
        </span>
        <span className="ui-at-send">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 18.5v-13M6.5 11 12 5.5l5.5 5.5" />
          </svg>
        </span>
      </div>

      {members.map((m, i) => (
        <div key={i} className="ui-at-agent" style={{ left: `calc(${102 + i * 198} * var(--u))`, ["--i" as string]: i }} aria-hidden="true">
          <div className="ui-at-node">
            <span className="ui-at-face">
              <img src={m.avatar} alt="" draggable={false} />
            </span>
            <span className="ui-at-dot" />
          </div>
          <div className="ui-at-role">
            {m.tools && m.tools.length > 0 && (
              <span className="ui-at-tools">
                {m.tools.slice(0, 2).map((t) => (
                  <span key={t} className="ui-at-tool">
                    {logos[t]}
                  </span>
                ))}
              </span>
            )}
            <span>{m.role}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- Tool logos, simplified marks on a 24 grid ---------- */

const Svg = ({ children }: { children: ReactNode }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    {children}
  </svg>
);

const logos: Record<AgentTool, ReactNode> = {
  linkedin: (
    <Svg>
      <rect x="2" y="2" width="20" height="20" rx="4" fill="#0A66C2" />
      <circle cx="7.6" cy="7.4" r="1.6" fill="#fff" />
      <rect x="6.2" y="10" width="2.8" height="8" rx=".6" fill="#fff" />
      <path d="M11 10h2.6v1.2c.5-.8 1.5-1.4 2.8-1.4 2.1 0 3.1 1.3 3.1 3.6V18h-2.8v-4.2c0-1.1-.4-1.8-1.4-1.8s-1.5.7-1.5 1.8V18H11v-8Z" fill="#fff" />
    </Svg>
  ),
  hubspot: (
    <Svg>
      <path
        fill="#FF7A59"
        d="M18.164 7.93V5.084a2.198 2.198 0 001.267-1.978v-.067A2.2 2.2 0 0017.238.845h-.067a2.2 2.2 0 00-2.193 2.193v.067a2.196 2.196 0 001.252 1.973l.013.006v2.852a6.22 6.22 0 00-2.969 1.31l.012-.01-7.828-6.095A2.497 2.497 0 104.3 4.656l-.012.006 7.697 5.991a6.176 6.176 0 00-1.038 3.446c0 1.343.425 2.588 1.147 3.607l-.013-.02-2.342 2.343a1.968 1.968 0 00-.58-.095h-.002a2.033 2.033 0 102.033 2.033 1.978 1.978 0 00-.1-.595l.005.014 2.317-2.317a6.247 6.247 0 104.782-11.134l-.036-.005zm-.964 9.378a3.206 3.206 0 113.215-3.207v.002a3.206 3.206 0 01-3.207 3.207z"
      />
    </Svg>
  ),
  slack: (
    <Svg>
      <rect x="9.6" y="2" width="3.4" height="9" rx="1.7" fill="#36C5F0" />
      <rect x="2" y="9.6" width="9" height="3.4" rx="1.7" fill="#36C5F0" />
      <rect x="13" y="9.6" width="9" height="3.4" rx="1.7" fill="#2EB67D" transform="rotate(0)" />
      <rect x="15.4" y="2" width="3.4" height="9" rx="1.7" fill="#2EB67D" />
      <rect x="2" y="15.4" width="9" height="3.4" rx="1.7" fill="#E01E5A" />
      <rect x="9.6" y="13" width="3.4" height="9" rx="1.7" fill="#E01E5A" />
      <rect x="13" y="15.4" width="9" height="3.4" rx="1.7" fill="#ECB22E" />
      <rect x="15.4" y="13" width="3.4" height="9" rx="1.7" fill="#ECB22E" transform="translate(0 0)" />
    </Svg>
  ),
  gmail: (
    <Svg>
      <path d="M3.5 19.5h3.3v-8L2 7.9v10.1c0 .8.7 1.5 1.5 1.5Z" fill="#4285F4" />
      <path d="M17.2 19.5h3.3c.8 0 1.5-.7 1.5-1.5V7.9l-4.8 3.6v8Z" fill="#34A853" />
      <path d="M17.2 5.3v6.2L22 7.9V6c0-1.6-1.8-2.5-3.1-1.6l-1.7 1.3Z" fill="#FBBC04" />
      <path d="M6.8 11.5V5.3L12 9.2l5.2-3.9v6.2L12 15.4l-5.2-3.9Z" fill="#EA4335" />
      <path d="M2 6v1.9l4.8 3.6V5.3L5.1 4C3.8 3.1 2 4 2 6Z" fill="#C5221F" />
    </Svg>
  ),
  salesforce: (
    <Svg>
      <path
        fill="#00A1E0"
        d="M10 5.6a4 4 0 0 1 3 1.4 3.4 3.4 0 0 1 5.3 1.2 4.1 4.1 0 1 1 1 8.1 3 3 0 0 1-3.9 1.4 3.5 3.5 0 0 1-6.3-.3 3.3 3.3 0 0 1-4.2-4.1A3.4 3.4 0 0 1 6.7 7 4 4 0 0 1 10 5.6Z"
      />
    </Svg>
  ),
};

/* ---------- Styles ---------- */

const css = /* css */ `
.ui-at {
  /* 1 unit of the 600 × 400 layout grid */
  --u: calc(100cqw / 600);
  --ui-at-surface: #ffffff;
  --ui-at-ring: rgba(10, 10, 10, 0.06);
  --ui-at-text: #171717;
  --ui-at-accent: #2f6bff;
  --ui-at-caret: #171717;
  /* Same pink → violet as the Get Pro button */
  --ui-at-halo-from: rgba(221, 6, 116, 0.18);
  --ui-at-halo-to: rgba(94, 62, 224, 0.18);
  --ui-at-dash: #e4e7ec; /* same gray as the lines in Outreach Branches */
  --ui-at-face: #eef0f4;
  --ui-at-online: #34c46a;
  --ui-at-dot-ring: #e2f6e9;
  --ui-at-dot-edge: rgba(52, 196, 106, 0.1);
  --ui-at-tool-ring: #e5e5e5;
  --ui-at-shadow: 0 calc(10 * var(--u)) calc(24 * var(--u)) rgba(0, 0, 0, 0.07), 0 calc(2 * var(--u)) calc(5 * var(--u)) rgba(0, 0, 0, 0.05);
  --ui-at-ease: cubic-bezier(0.7, 0, 0.25, 1);
  --ui-at-pop: cubic-bezier(0.34, 1.4, 0.64, 1);
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 2;
  overflow: hidden;
  container-type: inline-size;
  font-family: "Inter", ui-sans-serif, system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
}
.ui-at *, .ui-at *::before, .ui-at *::after { box-sizing: border-box; }

/* ---------- Dashed lines, revealed top to bottom ---------- */

.ui-at-lines { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.ui-at-line {
  fill: none;
  stroke: var(--ui-at-dash);
  stroke-width: 2.4;
  stroke-linecap: round;
  stroke-dasharray: 6 7.23;
}
.ui-at-reveal {
  fill: none;
  stroke: #fff;
  stroke-width: 8;
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  transition: stroke-dashoffset 700ms var(--ui-at-ease);
}
.ui-at:is([data-phase="sent"], [data-phase="team"]) .ui-at-reveal { stroke-dashoffset: 0; }
.ui-at[data-phase="reset"] .ui-at-lines { opacity: 0; transition: opacity 500ms ease; }

/* ---------- Prompt ---------- */

.ui-at-halo {
  position: absolute;
  left: 50%;
  top: calc(52 * var(--u));
  width: calc(400 * var(--u));
  height: calc(68 * var(--u));
  transform: translateX(-50%) scale(0.9);
  border-radius: 999px;
  background: linear-gradient(90deg, var(--ui-at-halo-from), var(--ui-at-halo-to));
  filter: blur(calc(22 * var(--u)));
  opacity: 0;
  transition: opacity 700ms ease, transform 900ms var(--ui-at-ease);
}
.ui-at:is([data-phase="sent"], [data-phase="team"]) .ui-at-halo { opacity: 1; transform: translateX(-50%) scale(1); }

.ui-at-prompt {
  position: absolute;
  left: 50%;
  top: calc(60 * var(--u));
  display: flex;
  align-items: center;
  gap: calc(12 * var(--u));
  width: calc(380 * var(--u));
  height: calc(52 * var(--u));
  padding: 0 calc(8 * var(--u)) 0 calc(20 * var(--u));
  transform: translateX(-50%);
  border-radius: 999px;
  background: var(--ui-at-surface);
  box-shadow: 0 0 0 calc(1 * var(--u)) var(--ui-at-ring), var(--ui-at-shadow);
}
.ui-at-text {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  font-size: calc(15 * var(--u));
  line-height: 1.3;
  letter-spacing: -0.01em;
  white-space: nowrap;
  color: var(--ui-at-text);
}
.ui-at-caret {
  display: inline-block;
  width: calc(1.6 * var(--u));
  height: calc(17 * var(--u));
  margin-left: calc(2 * var(--u));
  vertical-align: calc(-3 * var(--u));
  border-radius: 1px;
  background: var(--ui-at-caret);
  animation: ui-at-blink 1s steps(1) infinite;
}
.ui-at-send {
  flex: none;
  display: grid;
  place-items: center;
  width: calc(36 * var(--u));
  height: calc(36 * var(--u));
  border-radius: 50%;
  background: var(--ui-at-accent);
  transition: transform 200ms var(--ui-at-pop), filter 200ms ease;
}
.ui-at-send svg {
  width: calc(18 * var(--u));
  height: calc(18 * var(--u));
  fill: none;
  stroke: #fff;
  stroke-width: 2.2;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.ui-at[data-phase="sent"] .ui-at-send { animation: ui-at-press 380ms var(--ui-at-ease); }
.ui-at[data-phase="reset"] .ui-at-text { opacity: 0; transition: opacity 400ms ease; }

/* ---------- Agents ---------- */

.ui-at-agent {
  position: absolute;
  top: calc(196 * var(--u));
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: calc(14 * var(--u));
  transform: translateX(-50%);
}
.ui-at-node,
.ui-at-role {
  opacity: 0;
  transform: translateY(calc(10 * var(--u))) scale(0.92);
  transition: opacity 360ms ease, transform 520ms var(--ui-at-pop);
}
.ui-at[data-phase="team"] .ui-at-node {
  opacity: 1;
  transform: none;
  transition-delay: calc(var(--i) * 160ms);
}
.ui-at[data-phase="team"] .ui-at-role {
  opacity: 1;
  transform: none;
  transition-delay: calc(var(--i) * 160ms + 120ms);
}
.ui-at[data-phase="reset"] .ui-at-node,
.ui-at[data-phase="reset"] .ui-at-role { transform: none; transition: opacity 500ms ease; }

.ui-at-node {
  position: relative;
  width: calc(84 * var(--u));
  height: calc(84 * var(--u));
  padding: calc(5 * var(--u));
  border-radius: 50%;
  background: var(--ui-at-surface);
  box-shadow: inset 0 0 0 calc(1 * var(--u)) var(--ui-at-ring), var(--ui-at-shadow);
}
.ui-at-face {
  display: block;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 50%;
  background: var(--ui-at-face);
}
.ui-at-face img { display: block; width: 100%; height: 100%; object-fit: cover; user-select: none; }
.ui-at-dot {
  position: absolute;
  right: calc(1 * var(--u));
  bottom: calc(3 * var(--u));
  width: calc(24 * var(--u));
  height: calc(24 * var(--u));
  border: calc(7 * var(--u)) solid var(--ui-at-dot-ring);
  border-radius: 50%;
  background: var(--ui-at-online);
  box-shadow: 0 0 0 calc(2 * var(--u)) var(--ui-at-dot-edge);
  transform: scale(0);
  transition: transform 420ms var(--ui-at-pop);
}
.ui-at[data-phase="team"] .ui-at-dot { transform: scale(1); transition-delay: calc(var(--i) * 160ms + 360ms); }

/* Role pill: overlapping tool circles first, then the role */
.ui-at-role {
  display: flex;
  align-items: center;
  gap: calc(10 * var(--u));
  height: calc(42 * var(--u));
  padding: 0 calc(15 * var(--u)) 0 calc(7 * var(--u));
  border-radius: 999px;
  background: var(--ui-at-surface);
  box-shadow: 0 0 0 calc(1 * var(--u)) var(--ui-at-ring), var(--ui-at-shadow);
  font-size: calc(12.5 * var(--u));
  font-weight: 500;
  letter-spacing: -0.01em;
  white-space: nowrap;
  color: var(--ui-at-text);
}
.ui-at-role:not(:has(.ui-at-tools)) { padding-left: calc(15 * var(--u)); }
.ui-at-tools { display: flex; }
.ui-at-tool {
  display: grid;
  place-items: center;
  width: calc(26 * var(--u));
  height: calc(26 * var(--u));
  border-radius: 50%;
  background: var(--ui-at-surface);
  box-shadow: 0 0 0 calc(1 * var(--u)) var(--ui-at-tool-ring), 0 calc(1.5 * var(--u)) calc(3 * var(--u)) rgba(0, 0, 0, 0.08);
}
/* The second circle sits slightly over the first */
.ui-at-tool + .ui-at-tool { margin-left: calc(-8 * var(--u)); }
.ui-at-tool svg { width: calc(14 * var(--u)); height: calc(14 * var(--u)); }

@keyframes ui-at-blink { 50% { opacity: 0; } }
@keyframes ui-at-press {
  0% { transform: scale(1); }
  40% { transform: scale(0.86); }
  100% { transform: scale(1); }
}

@media (prefers-reduced-motion: reduce) {
  .ui-at *, .ui-at *::before { transition: none !important; animation: none !important; }
}

/* Dark mode: follows a .dark class or data-theme="dark" on any ancestor, e.g. <html> */
:where(.dark, [data-theme="dark"]) .ui-at {
  --ui-at-surface: #232326;
  --ui-at-ring: rgba(255, 255, 255, 0.08);
  --ui-at-text: #ededed;
  --ui-at-accent: #2f6bff;
  --ui-at-caret: #ededed;
  --ui-at-halo-from: rgba(244, 114, 182, 0.16);
  --ui-at-halo-to: rgba(167, 139, 250, 0.16);
  --ui-at-dash: rgba(255, 255, 255, 0.14);
  --ui-at-face: #2e2e33;
  --ui-at-online: #3fd17a;
  --ui-at-dot-ring: #24392c;
  --ui-at-dot-edge: rgba(63, 209, 122, 0.12);
  --ui-at-tool-ring: rgba(255, 255, 255, 0.12);
  --ui-at-shadow: 0 calc(10 * var(--u)) calc(24 * var(--u)) rgba(0, 0, 0, 0.4), 0 calc(2 * var(--u)) calc(5 * var(--u)) rgba(0, 0, 0, 0.3);
}
:where(.dark, [data-theme="dark"]) .ui-at-tool { background: #f4f4f5; }
`;
