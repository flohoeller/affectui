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

/* ---------- Tool logos: the brands' own marks (svgl.app, Simple Icons) on a 24 grid ---------- */

const Svg = ({ children }: { children: ReactNode }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    {children}
  </svg>
);

const logos: Record<AgentTool, ReactNode> = {
  linkedin: (
    <Svg>
      <svg x="2" y="2" width="20" height="20" viewBox="0 0 256 256"><path d="M218.123 218.127h-37.931v-59.403c0-14.165-.253-32.4-19.728-32.4-19.756 0-22.779 15.434-22.779 31.369v60.43h-37.93V95.967h36.413v16.694h.51a39.907 39.907 0 0 1 35.928-19.733c38.445 0 45.533 25.288 45.533 58.186l-.016 67.013ZM56.955 79.27c-12.157.002-22.014-9.852-22.016-22.009-.002-12.157 9.851-22.014 22.008-22.016 12.157-.003 22.014 9.851 22.016 22.008A22.013 22.013 0 0 1 56.955 79.27m18.966 138.858H37.95V95.967h37.97v122.16ZM237.033.018H18.89C8.58-.098.125 8.161-.001 18.471v219.053c.122 10.315 8.576 18.582 18.89 18.474h218.144c10.336.128 18.823-8.139 18.966-18.474V18.454c-.147-10.33-8.635-18.588-18.966-18.453" fill="#0A66C2"/></svg>
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
      <svg x="2" y="2" width="20" height="20" viewBox="0 0 2447.6 2452.5"><g clipRule="evenodd" fillRule="evenodd"><path d="m897.4 0c-135.3.1-244.8 109.9-244.7 245.2-.1 135.3 109.5 245.1 244.8 245.2h244.8v-245.1c.1-135.3-109.5-245.1-244.9-245.3.1 0 .1 0 0 0m0 654h-652.6c-135.3.1-244.9 109.9-244.8 245.2-.2 135.3 109.4 245.1 244.7 245.3h652.7c135.3-.1 244.9-109.9 244.8-245.2.1-135.4-109.5-245.2-244.8-245.3z" fill="#36c5f0" /><path d="m2447.6 899.2c.1-135.3-109.5-245.1-244.8-245.2-135.3.1-244.9 109.9-244.8 245.2v245.3h244.8c135.3-.1 244.9-109.9 244.8-245.3zm-652.7 0v-654c.1-135.2-109.4-245-244.7-245.2-135.3.1-244.9 109.9-244.8 245.2v654c-.2 135.3 109.4 245.1 244.7 245.3 135.3-.1 244.9-109.9 244.8-245.3z" fill="#2eb67d" /><path d="m1550.1 2452.5c135.3-.1 244.9-109.9 244.8-245.2.1-135.3-109.5-245.1-244.8-245.2h-244.8v245.2c-.1 135.2 109.5 245 244.8 245.2zm0-654.1h652.7c135.3-.1 244.9-109.9 244.8-245.2.2-135.3-109.4-245.1-244.7-245.3h-652.7c-135.3.1-244.9 109.9-244.8 245.2-.1 135.4 109.4 245.2 244.7 245.3z" fill="#ecb22e" /><path d="m0 1553.2c-.1 135.3 109.5 245.1 244.8 245.2 135.3-.1 244.9-109.9 244.8-245.2v-245.2h-244.8c-135.3.1-244.9 109.9-244.8 245.2zm652.7 0v654c-.2 135.3 109.4 245.1 244.7 245.3 135.3-.1 244.9-109.9 244.8-245.2v-653.9c.2-135.3-109.4-245.1-244.7-245.3-135.4 0-244.9 109.8-244.8 245.1 0 0 0 .1 0 0" fill="#e01e5a" /></g></svg>
    </Svg>
  ),
  gmail: (
    <Svg>
      <svg x="2" y="2" width="20" height="20" viewBox="0 49.4 512 399.42"><g fill="none" fillRule="evenodd"><g fillRule="nonzero"><path fill="#4285f4" d="M34.91 448.818h81.454V251L0 163.727V413.91c0 19.287 15.622 34.91 34.91 34.91z"/><path fill="#34a853" d="M395.636 448.818h81.455c19.287 0 34.909-15.622 34.909-34.909V163.727L395.636 251z"/><path fill="#fbbc04" d="M395.636 99.727V251L512 163.727v-46.545c0-43.142-49.25-67.782-83.782-41.891z"/></g><path fill="#ea4335" d="M116.364 251V99.727L256 204.455 395.636 99.727V251L256 355.727z"/><path fill="#c5221f" fillRule="nonzero" d="M0 117.182v46.545L116.364 251V99.727L83.782 75.291C49.25 49.4 0 74.04 0 117.18z"/></g></svg>
    </Svg>
  ),
  salesforce: (
    <Svg>
      <svg x="1" y="1" width="22" height="22" viewBox=".5 .5 999 699.242"><path fill="#00A1E0" d="M416.224 76.763c32.219-33.57 77.074-54.391 126.682-54.391 65.946 0 123.48 36.772 154.12 91.361 26.626-11.896 56.098-18.514 87.106-18.514 118.94 0 215.368 97.268 215.368 217.247 0 119.993-96.428 217.261-215.368 217.261a213.735 213.735 0 0 1-42.422-4.227c-26.981 48.128-78.397 80.646-137.412 80.646-24.705 0-48.072-5.706-68.877-15.853-27.352 64.337-91.077 109.448-165.348 109.448-77.344 0-143.261-48.939-168.563-117.574-11.057 2.348-22.513 3.572-34.268 3.572C75.155 585.74.5 510.317.5 417.262c0-62.359 33.542-116.807 83.378-145.937-10.26-23.608-15.967-49.665-15.967-77.06C67.911 87.25 154.79.5 261.948.5c62.914 0 118.827 29.913 154.276 76.263"/><path fill="#FFF" d="M145.196 363.11c-.626 1.637.228 1.979.427 2.263 1.878 1.366 3.786 2.349 5.707 3.444 10.189 5.407 19.81 6.986 29.871 6.986 20.492 0 33.214-10.9 33.214-28.447v-.341c0-16.224-14.358-22.115-27.835-26.37l-1.75-.569c-10.161-3.302-18.927-6.147-18.927-12.836v-.355c0-5.721 5.123-9.934 13.064-9.934 8.823 0 19.297 2.932 26.042 6.66 0 0 1.978 1.281 2.704-.64.398-1.025 3.814-10.218 4.17-11.214.384-1.082-.299-1.879-.996-2.306-7.699-4.682-18.344-7.884-29.358-7.884l-2.049.014c-18.756 0-31.848 11.328-31.848 27.565v.342c0 17.119 14.444 22.669 27.978 26.54l2.177.669c9.862 3.031 18.358 5.635 18.358 12.58v.342c0 6.347-5.521 11.071-14.43 11.071-3.458 0-14.487-.071-26.398-7.6-1.438-.84-2.277-1.451-3.387-2.12-.583-.37-2.049-1.011-2.689.925l-4.045 11.215zm299.998 0c-.626 1.637.228 1.979.427 2.263 1.878 1.366 3.786 2.349 5.706 3.444 10.189 5.407 19.811 6.986 29.871 6.986 20.492 0 33.215-10.9 33.215-28.447v-.341c0-16.224-14.359-22.115-27.836-26.37l-1.75-.569c-10.161-3.302-18.928-6.147-18.928-12.836v-.355c0-5.721 5.123-9.934 13.064-9.934 8.823 0 19.297 2.932 26.043 6.66 0 0 1.978 1.281 2.703-.64.398-1.025 3.814-10.218 4.17-11.214.385-1.082-.299-1.879-.996-2.306-7.699-4.682-18.344-7.884-29.358-7.884l-2.05.014c-18.756 0-31.848 11.328-31.848 27.565v.342c0 17.119 14.444 22.669 27.978 26.54l2.177.669c9.862 3.031 18.373 5.635 18.373 12.58v.342c0 6.347-5.536 11.071-14.445 11.071-3.457 0-14.486-.071-26.397-7.6-1.438-.84-2.291-1.423-3.372-2.12-.371-.242-2.107-.911-2.705.925l-4.042 11.215zm204.801-34.37c0 9.919-1.85 17.731-5.493 23.253-3.601 5.465-9.051 8.126-16.649 8.126-7.613 0-13.035-2.647-16.579-8.126-3.587-5.507-5.407-13.334-5.407-23.253 0-9.904 1.82-17.703 5.407-23.168 3.544-5.407 8.966-8.04 16.579-8.04 7.599 0 13.049 2.633 16.664 8.04 3.629 5.464 5.478 13.263 5.478 23.168m17.106-18.386c-1.68-5.679-4.298-10.688-7.784-14.857-3.487-4.184-7.898-7.542-13.136-9.99-5.223-2.433-11.398-3.671-18.328-3.671-6.945 0-13.121 1.238-18.344 3.671-5.237 2.448-9.648 5.807-13.149 9.99-3.472 4.184-6.091 9.193-7.784 14.857-1.665 5.649-2.505 11.825-2.505 18.386s.84 12.751 2.505 18.386c1.693 5.664 4.298 10.674 7.799 14.857 3.486 4.184 7.912 7.528 13.135 9.904 5.236 2.377 11.398 3.586 18.344 3.586 6.93 0 13.092-1.209 18.328-3.586 5.223-2.376 9.648-5.721 13.136-9.904 3.486-4.17 6.104-9.179 7.784-14.857 1.68-5.649 2.519-11.84 2.519-18.386s-.841-12.737-2.52-18.386m140.467 47.116c-.569-1.665-2.177-1.039-2.177-1.039-2.49.954-5.138 1.836-7.955 2.277-2.861.44-6.006.669-9.379.669-8.281 0-14.856-2.462-19.566-7.329-4.725-4.867-7.372-12.736-7.344-23.381.029-9.691 2.362-16.978 6.561-22.527 4.17-5.521 10.517-8.354 18.984-8.354 7.059 0 12.438.811 18.072 2.59 0 0 1.352.583 1.992-1.181 1.494-4.156 2.604-7.13 4.198-11.698.456-1.295-.654-1.85-1.053-2.007-2.22-.868-7.457-2.276-11.413-2.874-3.7-.569-8.026-.868-12.836-.868-7.188 0-13.591 1.224-19.069 3.672-5.465 2.433-10.104 5.791-13.775 9.976-3.672 4.184-6.461 9.192-8.325 14.856-1.85 5.649-2.789 11.854-2.789 18.415 0 14.188 3.828 25.657 11.385 34.054 7.57 8.425 18.941 12.708 33.77 12.708 8.766 0 17.76-1.778 24.221-4.326 0 0 1.238-.598.697-2.034l-4.199-11.599zm29.929-38.232c.811-5.507 2.334-10.09 4.682-13.661 3.544-5.422 8.951-8.396 16.551-8.396s12.623 2.988 16.223 8.396c2.391 3.571 3.43 8.354 3.843 13.661h-41.299zm57.592-12.111c-1.451-5.479-5.052-11.015-7.414-13.548-3.729-4.013-7.371-6.816-10.986-8.382-4.725-2.021-10.389-3.358-16.593-3.358-7.229 0-13.79 1.21-19.112 3.714-5.336 2.505-9.818 5.921-13.334 10.176-3.516 4.24-6.162 9.292-7.842 15.027-1.693 5.707-2.547 11.926-2.547 18.485 0 6.675.883 12.894 2.633 18.486 1.765 5.636 4.582 10.602 8.396 14.714 3.799 4.142 8.695 7.387 14.558 9.648 5.821 2.249 12.894 3.416 21.019 3.401 16.722-.057 25.53-3.785 29.159-5.792.641-.355 1.253-.981.483-2.774l-3.785-10.603c-.568-1.579-2.177-.996-2.177-.996-4.142 1.537-10.032 4.298-23.766 4.27-8.979-.014-15.64-2.661-19.81-6.803-4.283-4.24-6.375-10.474-6.745-19.268l57.905.057s1.522-.028 1.68-1.509c.057-.624 1.993-11.895-1.722-24.945m-521.327 12.111c.825-5.507 2.334-10.09 4.682-13.661 3.543-5.422 8.951-8.396 16.55-8.396s12.623 2.988 16.237 8.396c2.376 3.571 3.415 8.354 3.828 13.661h-41.297zm57.577-12.111c-1.451-5.479-5.037-11.015-7.399-13.548-3.729-4.013-7.372-6.816-10.986-8.382-4.725-2.021-10.388-3.358-16.593-3.358-7.215 0-13.79 1.21-19.112 3.714-5.336 2.505-9.819 5.921-13.334 10.176-3.515 4.24-6.162 9.292-7.841 15.027-1.679 5.707-2.547 11.926-2.547 18.485 0 6.675.882 12.894 2.633 18.486 1.765 5.636 4.583 10.602 8.396 14.714 3.8 4.142 8.695 7.387 14.558 9.648 5.821 2.249 12.893 3.416 21.019 3.401 16.721-.057 25.53-3.785 29.159-5.792.641-.355 1.252-.981.484-2.774l-3.771-10.603c-.584-1.579-2.191-.996-2.191-.996-4.141 1.537-10.019 4.298-23.78 4.27-8.965-.014-15.625-2.661-19.795-6.803-4.284-4.24-6.375-10.474-6.746-19.268l57.905.057s1.522-.028 1.679-1.509c.055-.624 1.99-11.895-1.738-24.945m-182.738 50.026c-2.263-1.808-2.576-2.263-3.344-3.43-1.139-1.779-1.722-4.312-1.722-7.528 0-5.095 1.679-8.752 5.166-11.214-.042.015 4.981-4.34 16.792-4.184 8.296.114 15.71 1.338 15.71 1.338v26.327h.014s-7.357 1.579-15.639 2.077c-11.783.712-17.02-3.4-16.977-3.386m23.039-40.686c-2.348-.171-5.394-.271-9.037-.271-4.966 0-9.762.626-14.259 1.836-4.525 1.209-8.595 3.103-12.096 5.606a27.927 27.927 0 0 0-8.396 9.549c-2.049 3.814-3.088 8.311-3.088 13.349 0 5.123.882 9.577 2.647 13.221 1.765 3.657 4.312 6.702 7.556 9.051 3.216 2.348 7.187 4.069 11.797 5.108 4.54 1.039 9.691 1.565 15.327 1.565 5.934 0 11.854-.483 17.589-1.466 5.678-.968 12.651-2.377 14.586-2.817a146.25 146.25 0 0 0 4.056-1.039c1.438-.355 1.324-1.893 1.324-1.893l-.029-52.952c0-11.613-3.102-20.223-9.207-25.559-6.077-5.322-15.028-8.013-26.597-8.013-4.341 0-11.328.599-15.512 1.438 0 0-12.651 2.448-17.86 6.518 0 0-1.138.712-.512 2.306l4.099 11.015c.512 1.423 1.893.939 1.893.939s.441-.171.954-.47c11.143-6.062 25.231-5.877 25.231-5.877 6.262 0 11.072 1.252 14.316 3.742 3.159 2.419 4.767 6.076 4.767 13.789v2.448c-4.981-.711-9.549-1.123-9.549-1.123m467.029-29.836c.44-1.31-.484-1.936-.869-2.078-.981-.384-5.905-1.423-9.705-1.665-7.271-.441-11.312.783-14.928 2.405-3.586 1.622-7.57 4.24-9.791 7.215v-7.044c0-.982-.697-1.765-1.665-1.765h-14.843c-.967 0-1.664.782-1.664 1.765v86.366c0 .968.797 1.765 1.764 1.765h15.213a1.76 1.76 0 0 0 1.75-1.765v-43.147c0-5.792.641-11.569 1.922-15.198 1.252-3.587 2.96-6.461 5.066-8.525 2.12-2.049 4.525-3.486 7.158-4.297 2.689-.826 5.663-1.096 7.77-1.096 3.031 0 6.361.782 6.361.782 1.109.128 1.736-.555 2.105-1.565.997-2.647 3.815-10.574 4.356-12.153"/><path fill="#FFF" d="M595.874 246.603c-1.85-.569-3.529-.954-5.721-1.366-2.221-.398-4.867-.598-7.869-.598-10.475 0-18.729 2.96-24.52 8.794-5.764 5.807-9.678 14.644-11.642 26.271l-.712 3.913h-13.148s-1.594-.057-1.936 1.68l-2.148 12.053c-.157 1.139.342 1.864 1.878 1.864h12.794l-12.979 72.463c-1.011 5.835-2.178 10.631-3.473 14.273-1.267 3.587-2.504 6.276-4.041 8.24-1.48 1.879-2.875 3.273-5.295 4.084-1.992.669-4.297.982-6.816.982-1.395 0-3.258-.229-4.639-.513-1.366-.271-2.092-.569-3.131-1.011 0 0-1.494-.568-2.092.926-.47 1.238-3.885 10.615-4.298 11.769-.398 1.152.171 2.049.896 2.319 1.708.598 2.974.996 5.294 1.551 3.217.755 5.934.797 8.481.797 5.322 0 10.189-.754 14.217-2.205 4.042-1.466 7.57-4.014 10.701-7.457 3.373-3.729 5.493-7.628 7.515-12.964 2.006-5.266 3.729-11.812 5.094-19.439l13.05-73.815h19.069s1.607.057 1.936-1.693l2.162-12.039c.143-1.152-.341-1.864-1.893-1.864h-18.514c.1-.412.939-6.931 3.06-13.063.911-2.604 2.618-4.725 4.056-6.177 1.424-1.423 3.06-2.433 4.854-3.017 1.835-.598 3.928-.882 6.219-.882 1.736 0 3.457.199 4.752.469 1.793.385 2.49.584 2.961.727 1.893.569 2.148.014 2.519-.896l4.426-12.153c.455-1.312-.669-1.867-1.067-2.023m-258.68 125.231c0 .968-.697 1.751-1.665 1.751h-15.355c-.968 0-1.651-.783-1.651-1.751v-123.58c0-.967.683-1.75 1.651-1.75h15.355c.968 0 1.665.783 1.665 1.75v123.58z"/></svg>
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
