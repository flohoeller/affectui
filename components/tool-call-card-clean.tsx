"use client";

import {
  Children,
  isValidElement,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";

/*
 * Tool Call Card (Clean) – one tool call of an AI agent, in a single self-contained file.
 * Clean style: one white card with hairline shadows, no tile and no tray. The header row holds the
 * tool's icon, its name in mono, a short summary and the status: a blue spinner with a live timer,
 * a blue check with the duration, or a red "Failed". Click it open to see the arguments and the
 * result as highlighted JSON on a faint panel, each with a small white copy button; long blocks are
 * capped with a fade and "Show all". Errors show the message and a white Retry button.
 * ToolCallGroup folds several cards into one quiet line: "Used 3 tools · 2.4s".
 * The styles are injected below, so no extra files are needed.
 */

export type ToolCallStatus = "running" | "success" | "error";

export type ToolCallCardProps = {
  /** Tool name as the agent calls it, shown in mono – e.g. "search_web" */
  name: string;
  /** Short human summary – e.g. "Searched the web for 'CRM pricing 2026'" */
  summary?: ReactNode;
  /** Icon in the tile on the left – defaults to a wrench */
  icon?: ReactNode;
  status: ToolCallStatus;
  /** Arguments the tool was called with – objects are pretty-printed, JSON strings parsed */
  args?: unknown;
  /** What the tool returned – objects are pretty-printed, JSON strings parsed, other text shown as is */
  result?: unknown;
  /** Error message, shown when status is "error" */
  error?: string;
  /** When the call started (ms since epoch, e.g. Date.now()) – the live timer counts from here */
  startedAt?: number;
  /** Final duration in ms – otherwise measured while the card shows "running" */
  duration?: number;
  /** Start expanded (uncontrolled) */
  defaultOpen?: boolean;
  /** Expanded state (controlled) */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Opens the card when the call fails and closes it again on the next run, unless someone toggled it */
  openOnError?: boolean;
  /** Shows a Retry button next to the error */
  onRetry?: () => void;
  /** Height in px after which arguments and result are capped with a fade and "Show all" */
  maxCodeHeight?: number;
  className?: string;
};

export type ToolCallGroupProps = {
  /** ToolCallCard elements – the group reads their name, icon, status and duration */
  children: ReactNode;
  /** Label once all calls are done – defaults to "Used 3 tools" */
  label?: string;
  /** Label while any call is running */
  runningLabel?: string;
  /** Total duration in ms – otherwise the sum of the cards' durations, or the time measured while running */
  duration?: number;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
};

/* ---------- Card ---------- */

export function ToolCallCard({
  name,
  summary,
  icon,
  status,
  args,
  result,
  error,
  startedAt,
  duration,
  defaultOpen = false,
  open: openProp,
  onOpenChange,
  openOnError = true,
  onRetry,
  maxCodeHeight = 220,
  className,
}: ToolCallCardProps) {
  const id = useId();
  const [openState, setOpenState] = useState(defaultOpen);
  const open = openProp ?? openState;
  const setOpen = (next: boolean) => {
    if (openProp === undefined) setOpenState(next);
    onOpenChange?.(next);
  };

  // Open on failure, close again on the next run – only while nobody has toggled it by hand
  const [prevStatus, setPrevStatus] = useState(status);
  const [autoOpened, setAutoOpened] = useState(false);
  if (status !== prevStatus) {
    setPrevStatus(status);
    if (openProp === undefined && openOnError) {
      if (status === "error" && !openState) {
        setOpenState(true);
        setAutoOpened(true);
      } else if (prevStatus === "error" && autoOpened) {
        setOpenState(false);
        setAutoOpened(false);
      }
    }
  }

  const measured = useStopwatch(status === "running", startedAt, false);
  const ms = status === "running" ? (measured ?? 0) : (duration ?? measured);

  const announce =
    status === "running" ? `${name} running` : status === "success" ? `${name} finished` : `${name} failed${error ? `: ${error}` : ""}`;

  return (
    <div
      className={["ui-tclc", className].filter(Boolean).join(" ")}
      data-status={status}
      data-open={open || undefined}
    >
      {/* React 19 hoists this into <head> once, no matter how many cards render */}
      <style href="ui-tool-call-clean" precedence="default">
        {css}
      </style>
      <span className="ui-tclc-sr" role="status" aria-live="polite">
        {announce}
      </span>

      <button
        type="button"
        className="ui-tclc__head"
        aria-expanded={open}
        aria-controls={`${id}-body`}
        onClick={() => {
          setAutoOpened(false);
          setOpen(!open);
        }}
      >
        <span className="ui-tclc__icon" aria-hidden="true">
          {icon ?? <WrenchIcon />}
        </span>
        <span className="ui-tclc__main">
          <code className="ui-tclc__name" title={name}>
            {name}
          </code>
          {summary != null && (
            <span className="ui-tclc__summary" dir="auto" title={typeof summary === "string" ? summary : undefined}>
              {summary}
            </span>
          )}
        </span>
        <span className="ui-tclc__status" key={status}>
          {status === "running" && <Spinner />}
          {status === "success" && (
            <svg className="ui-tclc__ok" viewBox="0 0 16 16" aria-hidden="true">
              <circle cx="8" cy="8" r="7" />
              <path d="M5.1 8.2 7.1 10.1 10.9 6" pathLength={1} />
            </svg>
          )}
          {status === "error" && <ErrorIcon />}
          <span className="ui-tclc__time">
            {status === "error" ? "Failed" : ms != null ? formatMs(ms, status === "running") : null}
          </span>
        </span>
        <Chevron />
      </button>

      <div className="ui-tclc__body" id={`${id}-body`} inert={!open}>
        <div className="ui-tclc__clip">
          <div className="ui-tclc__sections">
            {status === "error" && (
              <div className="ui-tclc__error">
                <ErrorIcon />
                <p className="ui-tclc__error-text" dir="auto">{error ?? "The tool call failed."}</p>
                {onRetry && (
                  <button type="button" className="ui-tclc__retry" onClick={onRetry}>
                    <svg viewBox="0 0 16 16" aria-hidden="true">
                      <path d="M2.75 8a5.25 5.25 0 1 0 1.6-3.77" />
                      <path d="M2.5 2.5v2.75h2.75" />
                    </svg>
                    Retry
                  </button>
                )}
              </div>
            )}
            {args !== undefined && <CodeSection label="Arguments" value={args} cap={maxCodeHeight} />}
            {result !== undefined ? (
              <CodeSection label="Result" value={result} cap={maxCodeHeight} />
            ) : status === "running" ? (
              <div className="ui-tclc__section">
                <div className="ui-tclc__section-head">
                  <span className="ui-tclc__label">Result</span>
                </div>
                <p className="ui-tclc__pending">Waiting for result…</p>
              </div>
            ) : null}
            {args === undefined && result === undefined && status === "success" && (
              <p className="ui-tclc__pending">No arguments or result.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Group ---------- */

export function ToolCallGroup({
  children,
  label,
  runningLabel = "Using tools…",
  duration,
  defaultOpen = false,
  open: openProp,
  onOpenChange,
  className,
}: ToolCallGroupProps) {
  const id = useId();
  const [openState, setOpenState] = useState(defaultOpen);
  const open = openProp ?? openState;

  // Read the cards' props to summarise them in the header
  const calls = Children.toArray(children)
    .filter(isValidElement)
    .map((c) => (c as ReactElement<Partial<ToolCallCardProps>>).props);
  const running = calls.some((c) => c.status === "running");
  const failed = calls.filter((c) => c.status === "error").length;

  // Time spent with tools running, added up across stretches (e.g. a pause before a retry)
  // Counts from the earliest running card that knows when it started, so the group never shows less than its cards
  const since = calls.reduce<number | undefined>(
    (min, c) => (c.status === "running" && c.startedAt != null && (min == null || c.startedAt < min) ? c.startedAt : min),
    undefined,
  );
  const measured = useStopwatch(running, since, true);
  const sum = calls.length && calls.every((c) => c.duration != null) ? calls.reduce((t, c) => t + (c.duration ?? 0), 0) : null;
  const ms = running ? measured : (duration ?? sum ?? measured);

  const count = `Used ${calls.length.toLocaleString("en-US")} ${calls.length === 1 ? "tool" : "tools"}`;
  const title = running ? runningLabel : (label ?? count);
  const icons = calls.slice(-3);

  return (
    <div
      className={["ui-tclc-group", className].filter(Boolean).join(" ")}
      data-running={running || undefined}
      data-open={open || undefined}
    >
      <style href="ui-tool-call-clean" precedence="default">
        {css}
      </style>
      <span className="ui-tclc-sr" role="status" aria-live="polite">
        {running ? runningLabel : `${count}${failed ? `, ${failed} failed` : ""}`}
      </span>

      <button
        type="button"
        className="ui-tclc-group__head"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        onClick={() => {
          if (openProp === undefined) setOpenState(!open);
          onOpenChange?.(!open);
        }}
      >
        <span className="ui-tclc-group__stack" aria-hidden="true">
          {icons.map((c, i) => (
            <span className="ui-tclc__icon" key={calls.length - icons.length + i}>
              {c.icon ?? <WrenchIcon />}
            </span>
          ))}
        </span>
        <span className="ui-tclc-group__title" key={running ? "busy" : "done"}>
          <span className={running ? "ui-tclc-group__label ui-tclc__shine" : "ui-tclc-group__label"} data-text={title}>
            {title}
          </span>
          {!running && failed > 0 && <span className="ui-tclc-group__failed">· {failed} failed</span>}
          {ms != null && <span className="ui-tclc-group__time">· {formatMs(ms, running)}</span>}
        </span>
        <Chevron />
      </button>

      <div className="ui-tclc__body" id={`${id}-list`} inert={!open}>
        <div className="ui-tclc__clip">
          <div className="ui-tclc-group__list">{children}</div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Pieces ---------- */

const OPEN_MAX = 640;

function CodeSection({ label, value, cap }: { label: string; value: unknown; cap: number }) {
  const { text, json } = toText(value);
  const pre = useRef<HTMLPreElement>(null);
  const [full, setFull] = useState(false);
  const [height, setHeight] = useState(0);

  // Natural height of the block – decides whether it needs the cap and how far "Show all" opens
  useLayoutEffect(() => {
    const el = pre.current;
    const inner = el?.firstElementChild;
    if (!el || !inner) return;
    const measure = () => setHeight(el.scrollHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(inner);
    return () => ro.disconnect();
  }, [text]);

  const capped = height > cap + 24;

  return (
    <div className="ui-tclc__section">
      <div className="ui-tclc__section-head">
        <span className="ui-tclc__label">{label}</span>
        <CopyButton text={text} label={label.toLowerCase()} />
      </div>
      <pre
        ref={pre}
        className="ui-tclc__code"
        data-capped={(capped && !full) || undefined}
        data-scroll={(capped && full && height > OPEN_MAX) || undefined}
        // Open, a very long block stops at a few screens and scrolls inside – no 200,000px card
        style={capped ? { maxHeight: full ? Math.min(height, OPEN_MAX) : cap } : undefined}
      >
        <code>{json ? highlight(text) : text}</code>
      </pre>
      {capped && (
        <button type="button" className="ui-tclc__more" aria-expanded={full} onClick={() => setFull(!full)}>
          {full ? "Show less" : "Show all"}
        </button>
      )}
    </div>
  );
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 1400);
    return () => window.clearTimeout(t);
  }, [copied]);

  return (
    <button
      type="button"
      className="ui-tclc__copy"
      data-copied={copied || undefined}
      aria-label={copied ? "Copied" : `Copy ${label}`}
      title={copied ? "Copied" : `Copy ${label}`}
      onClick={() => copyText(text).then((ok) => ok && setCopied(true))}
    >
      <svg className="ui-tclc__copy-icon" viewBox="0 0 16 16" aria-hidden="true">
        <rect x="5.5" y="5.5" width="8.5" height="8.5" rx="2" />
        <path d="M10.5 3.75v-.25A1.5 1.5 0 0 0 9 2H3.5A1.5 1.5 0 0 0 2 3.5V9a1.5 1.5 0 0 0 1.5 1.5h.25" />
      </svg>
      <svg className="ui-tclc__copy-done" viewBox="0 0 16 16" aria-hidden="true">
        <path d="M3.5 8.4 6.6 11.3 12.5 4.9" pathLength={1} />
      </svg>
    </button>
  );
}

function Spinner() {
  return (
    <svg className="ui-tclc__spinner" viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="8" r="6" />
      <path d="M8 2a6 6 0 0 1 6 6" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg className="ui-tclc__err" viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="8" r="7" />
      <path d="M8 4.9v3.5M8 10.9v.1" />
    </svg>
  );
}

function Chevron() {
  return (
    <svg className="ui-tclc__chevron" viewBox="0 0 12 12" aria-hidden="true">
      <path d="M3.5 5.25 6 7.75l2.5-2.5" />
    </svg>
  );
}

function WrenchIcon() {
  return (
    <svg viewBox="0 0 16 16">
      <path d="M10.2 2.4a3.5 3.5 0 0 0-4.3 4.6L2.6 10.3a1.4 1.4 0 0 0 2 2L7.9 9a3.5 3.5 0 0 0 4.6-4.3l-2 2-1.6-.4-.4-1.6 1.7-2.3Z" />
    </svg>
  );
}

/* ---------- Helpers ---------- */

/** Live ms while running, the final value after. accumulate = add up several running stretches. */
function useStopwatch(running: boolean, startedAt: number | undefined, accumulate: boolean) {
  const start = useRef<number | null>(null);
  const base = useRef(0);
  const [ms, setMs] = useState<number | null>(null);
  useEffect(() => {
    if (!running) {
      if (start.current !== null) {
        base.current += Date.now() - start.current;
        start.current = null;
        setMs(base.current);
      }
      return;
    }
    if (!accumulate) base.current = 0;
    start.current = startedAt ?? Date.now();
    const tick = () => setMs(base.current + Date.now() - (start.current ?? Date.now()));
    tick();
    const t = window.setInterval(tick, 100);
    return () => window.clearInterval(t);
  }, [running, startedAt, accumulate]);
  return ms;
}

/** 0.4s, 12.3s, 2m 05s, 3h 12m, 2d 4h – the live timer always shows tenths below a minute */
function formatMs(ms: number, live: boolean) {
  if (!live && ms < 1000) return `${Math.max(1, Math.round(ms))}ms`;
  if (ms < 60_000) return `${(Math.floor(ms / 100) / 10).toFixed(1)}s`;
  const s = Math.floor(ms / 1000);
  if (s < 3600) return `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, "0")}s`;
  const h = Math.floor(s / 3600);
  if (h < 24) return `${h}h ${String(Math.floor(s / 60) % 60).padStart(2, "0")}m`;
  return `${Math.floor(h / 24)}d ${h % 24}h`;
}

function toText(value: unknown): { text: string; json: boolean } {
  if (typeof value === "string") {
    const t = value.trim();
    if (t.startsWith("{") || t.startsWith("[")) {
      try {
        return { text: JSON.stringify(JSON.parse(t), null, 2), json: true };
      } catch {
        /* not JSON – shown as plain text */
      }
    }
    return { text: value, json: false };
  }
  try {
    const s = JSON.stringify(value, null, 2);
    return s === undefined ? { text: String(value), json: false } : { text: s, json: true };
  } catch {
    return { text: String(value), json: false };
  }
}

// Strings (keys when followed by a colon), literals and numbers – everything else stays punctuation
const TOKEN = /("(?:[^"\\]|\\.)*")(\s*:)?|\b(?:true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g;

function highlight(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = new RegExp(TOKEN.source, "g");
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1] && m[2]) {
      out.push(
        <span key={m.index} className="ui-tclc__t-key">
          {m[1]}
        </span>,
        m[2],
      );
    } else {
      const kind = m[1] ? "str" : /^[tfn]/.test(m[0]) ? "lit" : "num";
      out.push(
        <span key={m.index} className={`ui-tclc__t-${kind}`}>
          {m[0]}
        </span>,
      );
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Older browsers and non-secure contexts
    const area = document.createElement("textarea");
    area.value = text;
    area.style.cssText = "position:fixed;opacity:0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  }
}

const css = /* css */ `
/* Colors and motion as variables – override them on .ui-tclc / .ui-tclc-group */
.ui-tclc,
.ui-tclc-group {
  --ui-tclc-card: #ffffff;
  --ui-tclc-strong: var(--aui-ink, #000000);
  --ui-tclc-ink: var(--aui-ink, rgba(0, 0, 0, 0.88));
  --ui-tclc-text: var(--aui-muted, rgba(0, 0, 0, 0.61));
  --ui-tclc-muted: var(--aui-muted, rgba(0, 0, 0, 0.45));
  --ui-tclc-faint: var(--aui-placeholder, rgba(0, 0, 0, 0.27));
  --ui-tclc-icon: var(--aui-muted, rgba(0, 0, 0, 0.447));
  --ui-tclc-line: var(--aui-border, rgba(0, 0, 0, 0.06));
  --ui-tclc-wash: var(--aui-subtle, rgba(0, 0, 0, 0.03));
  --ui-tclc-wash-big: var(--aui-subtle, rgba(0, 0, 0, 0.015));
  /* The code panel: a 2% black frame, kept opaque so the fade of capped blocks can end on it */
  --ui-tclc-code: #fafafa;
  --ui-tclc-accent: rgba(0, 96, 226, 0.765);
  --ui-tclc-red: var(--aui-red, #f04438);
  --ui-tclc-red-bg: color-mix(in srgb, var(--aui-red, #f04438) 4%, transparent);
  --ui-tclc-red-line: color-mix(in srgb, var(--aui-red, #f04438) 14%, transparent);
  --ui-tclc-key: rgba(0, 0, 0, 0.88);
  --ui-tclc-str: color-mix(in srgb, var(--aui-cyan, #14b3f0) 90%, transparent);
  --ui-tclc-num: var(--aui-warning, #b25e00);
  --ui-tclc-lit: var(--aui-purple, #a651f0);
  --ui-tclc-shine: rgba(255, 255, 255, 0.82);
  /* Strokes are shadows: a 0.5px hairline plus a soft lift */
  --ui-tclc-shadow: 0 0 0 0.5px rgba(0, 0, 0, 0.06), 0 1px 1px -1px rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --ui-tclc-focus: var(--aui-focus, rgba(0, 96, 226, 0.7));
  --ui-tclc-ease: var(--aui-ease, cubic-bezier(0.22, 1, 0.36, 1));
  --ui-tclc-mono: var(--aui-font-mono, ui-monospace, "SF Mono", Menlo, monospace);
  box-sizing: border-box;
  container-type: inline-size;
  min-width: 0;
  color: var(--ui-tclc-ink);
  font-family: var(--aui-font, "Inter", "InterVariable", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif);
  font-size: 13px;
  line-height: 20px;
  font-weight: 400;
  -webkit-font-smoothing: antialiased;
}
.ui-tclc *,
.ui-tclc-group * { box-sizing: border-box; }

.ui-tclc {
  position: relative;
  border-radius: var(--aui-radius-lg, 10px);
  background: var(--aui-surface, var(--ui-tclc-card));
  box-shadow: var(--aui-shadow-card, var(--ui-tclc-shadow));
}
.ui-tclc-sr {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

/* Header row: icon, name + summary, status, chevron – everything truncates before it overflows */
.ui-tclc__head {
  all: unset;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-height: 44px;
  padding: 0 14px;
  border-radius: var(--aui-radius-lg, 10px);
  cursor: pointer;
  transition: background-color 160ms ease, border-radius 0ms linear 380ms;
}
.ui-tclc[data-open] .ui-tclc__head {
  border-radius: var(--aui-radius-lg, 10px) var(--aui-radius-lg, 10px) 0 0;
  transition: background-color 160ms ease;
}
.ui-tclc__head:focus-visible,
.ui-tclc-group__head:focus-visible,
.ui-tclc__copy:focus-visible,
.ui-tclc__more:focus-visible,
.ui-tclc__retry:focus-visible {
  outline: 2px solid var(--ui-tclc-focus);
  outline-offset: 2px;
}
@media (hover: hover) {
  .ui-tclc__head:hover { background: var(--ui-tclc-wash-big); }
  .ui-tclc__head:hover .ui-tclc__chevron { stroke: var(--ui-tclc-ink); }
  .ui-tclc-group__head:hover { background: var(--ui-tclc-wash); color: var(--ui-tclc-ink); }
  .ui-tclc__copy:hover { background: var(--ui-tclc-wash-big); color: var(--ui-tclc-ink); }
  .ui-tclc__more:hover { color: var(--ui-tclc-ink); }
  .ui-tclc__retry:hover { background: var(--ui-tclc-wash-big); }
}

/* The tool's icon: a plain 16px glyph, no tile */
.ui-tclc__icon {
  display: grid;
  place-items: center;
  flex: none;
  width: 16px;
  height: 16px;
  color: var(--ui-tclc-icon);
}
.ui-tclc__icon > svg { width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 1.4; stroke-linecap: round; stroke-linejoin: round; }

.ui-tclc__main {
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex: 1;
  min-width: 0;
}
.ui-tclc__name {
  flex: 0 1 auto;
  max-width: 55%;
  overflow: hidden;
  color: var(--ui-tclc-strong);
  font-family: var(--ui-tclc-mono);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ui-tclc__summary {
  flex: 1 1 0;
  min-width: 0;
  overflow: hidden;
  color: var(--ui-tclc-text);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ui-tclc__status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex: none;
  color: var(--ui-tclc-muted);
  font-size: 12px;
  line-height: 16px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  animation: ui-tclc-in 360ms var(--ui-tclc-ease) both;
}
.ui-tclc[data-status="error"] .ui-tclc__status { color: var(--ui-tclc-red); font-weight: 500; }
.ui-tclc__status > svg { width: 14px; height: 14px; flex: none; fill: none; stroke-linecap: round; stroke-linejoin: round; }
.ui-tclc__spinner circle { stroke: var(--ui-tclc-line); stroke-width: 1.6; }
.ui-tclc__spinner path { stroke: var(--ui-tclc-accent); stroke-width: 1.6; }
.ui-tclc__spinner { animation: ui-tclc-spin 800ms linear infinite; }
/* Done: a solid blue dot whose white check draws itself */
.ui-tclc__ok { animation: ui-tclc-pop 460ms cubic-bezier(0.34, 1.56, 0.64, 1) both; }
.ui-tclc__ok circle { fill: var(--ui-tclc-accent); }
.ui-tclc__ok path { stroke: #fff; stroke-width: 1.5; stroke-dasharray: 1; stroke-dashoffset: 1; animation: ui-tclc-draw 360ms var(--ui-tclc-ease) 160ms forwards; }
.ui-tclc__err circle { fill: var(--ui-tclc-red); }
.ui-tclc__err path { stroke: #fff; stroke-width: 1.6; stroke-linecap: round; }

.ui-tclc__chevron {
  flex: none;
  width: 12px;
  height: 12px;
  fill: none;
  stroke: var(--ui-tclc-icon);
  stroke-width: 1.2;
  stroke-linecap: round;
  stroke-linejoin: round;
  transition: transform 360ms var(--ui-tclc-ease), stroke 160ms ease;
}
.ui-tclc[data-open] > .ui-tclc__head .ui-tclc__chevron,
.ui-tclc-group[data-open] > .ui-tclc-group__head .ui-tclc__chevron { transform: rotate(180deg); }

/* Body: grows from 0fr to 1fr, so the height animates without measuring */
.ui-tclc__body {
  display: grid;
  grid-template-rows: 0fr;
  opacity: 0;
  transition: grid-template-rows 380ms var(--ui-tclc-ease), opacity 240ms ease;
}
.ui-tclc[data-open] > .ui-tclc__body,
.ui-tclc-group[data-open] > .ui-tclc__body {
  grid-template-rows: 1fr;
  opacity: 1;
}
.ui-tclc__clip { min-height: 0; overflow: hidden; }
.ui-tclc__sections {
  display: grid;
  gap: 14px;
  padding: 12px 14px 14px;
  border-top: 0.5px solid var(--ui-tclc-line);
}

.ui-tclc__section { display: grid; gap: 6px; min-width: 0; }
.ui-tclc__section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 28px;
}
/* Tiny uppercase labels: "ARGUMENTS", "RESULT" */
.ui-tclc__label {
  color: var(--ui-tclc-muted);
  font-size: 10px;
  line-height: 16px;
  font-weight: 500;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}
.ui-tclc__pending { margin: 0; color: var(--ui-tclc-muted); font-size: 12px; line-height: 16px; }

/* Copy: a small white icon button with the card's hairline */
.ui-tclc__copy {
  all: unset;
  position: relative;
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: calc(var(--aui-radius-sm, 5px) + 1px);
  background: var(--aui-surface, var(--ui-tclc-card));
  box-shadow: var(--ui-tclc-shadow);
  color: var(--ui-tclc-icon);
  cursor: pointer;
  transition: background-color 160ms ease, color 160ms ease;
}
.ui-tclc__copy svg {
  position: absolute;
  width: 16px;
  height: 16px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.4;
  stroke-linecap: round;
  stroke-linejoin: round;
  transition: opacity 200ms ease, transform 320ms var(--ui-tclc-ease), filter 200ms ease;
}
.ui-tclc__copy-icon rect { fill: currentColor; stroke: none; }
.ui-tclc__copy-done { opacity: 0; transform: scale(0.6); filter: blur(2px); stroke-width: 1.7; }
.ui-tclc__copy[data-copied] { color: var(--ui-tclc-accent); }
.ui-tclc__copy[data-copied] .ui-tclc__copy-icon { opacity: 0; transform: scale(0.6); filter: blur(2px); }
.ui-tclc__copy[data-copied] .ui-tclc__copy-done { opacity: 1; transform: none; filter: none; }

/* Code: a faint panel with a 0.5px frame; wraps instead of scrolling sideways, capped blocks fade out */
.ui-tclc__code {
  position: relative;
  margin: 0;
  padding: 10px 12px;
  overflow: hidden;
  border-radius: calc(var(--aui-radius-sm, 5px) + 3px);
  background: var(--ui-tclc-code);
  box-shadow: inset 0 0 0 0.5px var(--ui-tclc-line);
  color: var(--ui-tclc-muted);
  font-family: var(--ui-tclc-mono);
  font-size: 12px;
  line-height: 20px;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  tab-size: 2;
  transition: max-height 420ms var(--ui-tclc-ease);
}
.ui-tclc__code code { display: block; font: inherit; }
.ui-tclc__code::after {
  content: "";
  position: absolute;
  left: 0.5px;
  right: 0.5px;
  bottom: 0.5px;
  height: 56px;
  border-radius: 0 0 calc(var(--aui-radius-sm, 5px) + 2.5px) calc(var(--aui-radius-sm, 5px) + 2.5px);
  background: linear-gradient(to bottom, transparent, var(--ui-tclc-code));
  opacity: 0;
  transition: opacity 240ms ease;
  pointer-events: none;
}
.ui-tclc__code[data-capped]::after { opacity: 1; }
.ui-tclc__code[data-scroll] { overflow-y: auto; overscroll-behavior: contain; }
.ui-tclc__t-key { color: var(--ui-tclc-key); }
.ui-tclc__t-str { color: var(--ui-tclc-str); }
.ui-tclc__t-num { color: var(--ui-tclc-num); }
.ui-tclc__t-lit { color: var(--ui-tclc-lit); }

.ui-tclc__more {
  all: unset;
  justify-self: start;
  padding: 2px 4px;
  margin-left: -4px;
  border-radius: 6px;
  color: var(--ui-tclc-text);
  font-size: 12px;
  line-height: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: color 160ms ease;
}

/* Error: the message on a faint red panel and an optional white Retry button */
.ui-tclc__error {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  padding: 8px 8px 8px 12px;
  border-radius: calc(var(--aui-radius-sm, 5px) + 3px);
  background: var(--ui-tclc-red-bg);
  box-shadow: inset 0 0 0 0.5px var(--ui-tclc-red-line);
}
.ui-tclc__error > .ui-tclc__err { flex: none; align-self: flex-start; width: 16px; height: 16px; margin-top: 6px; }
.ui-tclc__error-text {
  flex: 1;
  min-width: 0;
  /* A stack trace stops at 10 lines and scrolls, so Retry and the arguments stay close */
  max-height: 200px;
  margin: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  white-space: pre-line;
  color: var(--ui-tclc-red);
  font-size: 13px;
  line-height: 20px;
  overflow-wrap: anywhere;
}
.ui-tclc__retry {
  all: unset;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex: none;
  height: 28px;
  padding: 0 10px 0 6px;
  border-radius: calc(var(--aui-radius-sm, 5px) + 1px);
  background: var(--aui-surface, var(--ui-tclc-card));
  box-shadow: var(--ui-tclc-shadow);
  color: var(--ui-tclc-strong);
  font-size: 13px;
  line-height: 20px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 160ms ease;
}
.ui-tclc__retry svg { width: 16px; height: 16px; fill: none; stroke: var(--ui-tclc-icon); stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; }
.ui-tclc__retry:active svg { transform: rotate(-60deg); transition: transform 200ms var(--ui-tclc-ease); }

/* Group: one quiet line with the tool icons stacked on small white tiles, the cards below */
.ui-tclc-group { display: grid; }
.ui-tclc-group__head {
  all: unset;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 8px;
  justify-self: start;
  max-width: 100%;
  min-height: 32px;
  margin-left: -6px;
  padding: 4px 10px 4px 6px;
  border-radius: calc(var(--aui-radius, 7px) + 1px);
  color: var(--ui-tclc-ink);
  cursor: pointer;
  transition: background-color 160ms ease, color 160ms ease;
}
.ui-tclc-group__stack { display: flex; flex: none; padding: 0.5px; }
.ui-tclc-group__stack .ui-tclc__icon {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background: var(--ui-tclc-card);
  box-shadow: var(--ui-tclc-shadow);
  animation: ui-tclc-pop 420ms var(--ui-tclc-ease) both;
}
.ui-tclc-group__stack .ui-tclc__icon + .ui-tclc__icon { margin-left: -4px; }
.ui-tclc-group__stack .ui-tclc__icon > svg { width: 12px; height: 12px; stroke-width: 1.5; }
.ui-tclc-group__title {
  display: flex;
  align-items: baseline;
  gap: 6px;
  min-width: 0;
  white-space: nowrap;
  animation: ui-tclc-in 360ms var(--ui-tclc-ease) both;
}
.ui-tclc-group__label {
  position: relative;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  color: inherit;
  font-weight: 500;
}
.ui-tclc-group__label.ui-tclc__shine { color: var(--ui-tclc-muted); }
.ui-tclc-group__failed { flex: none; color: var(--ui-tclc-red); }
.ui-tclc-group__time { flex: none; color: var(--ui-tclc-faint); font-variant-numeric: tabular-nums; }
.ui-tclc-group__list { display: grid; gap: 8px; padding: 6px 0 2px; }

/* A soft light sweeping over "Using tools…" */
.ui-tclc__shine::after {
  content: attr(data-text);
  content: attr(data-text) / "";
  position: absolute;
  inset: 0;
  white-space: nowrap;
  color: transparent;
  background: linear-gradient(90deg, transparent 38%, var(--ui-tclc-shine) 50%, transparent 62%) 100% 0 / 300% 100% no-repeat;
  -webkit-background-clip: text;
  background-clip: text;
  animation: ui-tclc-sweep 1.8s linear infinite;
  pointer-events: none;
}

@keyframes ui-tclc-in {
  from { opacity: 0; transform: translateY(3px); filter: blur(2px); }
  to { opacity: 1; transform: none; filter: none; }
}
@keyframes ui-tclc-pop {
  from { opacity: 0; transform: scale(0.6); }
  to { opacity: 1; transform: none; }
}
@keyframes ui-tclc-spin { to { transform: rotate(360deg); } }
@keyframes ui-tclc-draw { to { stroke-dashoffset: 0; } }
@keyframes ui-tclc-sweep {
  from { background-position: 100% 0; }
  to { background-position: 0% 0; }
}

/* Narrow (phones): a little less padding, the summary gives way first */
@container (max-width: 360px) {
  .ui-tclc__head { gap: 8px; padding: 0 12px; }
  .ui-tclc__sections { padding: 12px 12px 12px; }
}
/* Touch screens: bigger tap targets */
@media (pointer: coarse) {
  .ui-tclc__head { min-height: 52px; }
}
@media (prefers-reduced-motion: reduce) {
  .ui-tclc *,
  .ui-tclc-group *,
  .ui-tclc *::after,
  .ui-tclc-group *::after {
    animation-duration: 1ms !important;
    animation-delay: 0ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 1ms !important;
  }
  .ui-tclc__shine::after { display: none; }
  .ui-tclc__ok path { stroke-dashoffset: 0; }
}

/* Dark mode: follows a .dark class or data-theme="dark" on any ancestor, e.g. <html> */
:where(.dark, [data-theme="dark"]) .ui-tclc,
:where(.dark, [data-theme="dark"]) .ui-tclc-group {
  --ui-tclc-card: #1c1c1e;
  --ui-tclc-strong: var(--aui-ink, #ffffff);
  --ui-tclc-ink: var(--aui-ink, rgba(255, 255, 255, 0.9));
  --ui-tclc-text: var(--aui-muted, rgba(255, 255, 255, 0.62));
  --ui-tclc-muted: var(--aui-muted, rgba(255, 255, 255, 0.46));
  --ui-tclc-faint: var(--aui-placeholder, rgba(255, 255, 255, 0.3));
  --ui-tclc-icon: var(--aui-muted, rgba(255, 255, 255, 0.5));
  --ui-tclc-line: var(--aui-border, rgba(255, 255, 255, 0.08));
  --ui-tclc-wash: var(--aui-subtle, rgba(255, 255, 255, 0.04));
  --ui-tclc-wash-big: var(--aui-subtle, rgba(255, 255, 255, 0.025));
  --ui-tclc-code: #212123;
  --ui-tclc-accent: var(--aui-blue, #4fb0fe);
  --ui-tclc-red: var(--aui-danger, #ff8a7a);
  --ui-tclc-red-bg: color-mix(in srgb, var(--aui-red, #ff6b5f) 7%, transparent);
  --ui-tclc-red-line: color-mix(in srgb, var(--aui-red, #ff6b5f) 18%, transparent);
  --ui-tclc-key: rgba(255, 255, 255, 0.9);
  --ui-tclc-str: var(--aui-cyan, #5cc6ee);
  --ui-tclc-num: var(--aui-orange, #f2a15c);
  --ui-tclc-lit: #cfaff5;
  --ui-tclc-shine: #ffffff;
  --ui-tclc-shadow: 0 0 0 0.5px rgba(255, 255, 255, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.4);
  --ui-tclc-focus: var(--aui-focus, rgba(77, 141, 255, 0.8));
}
`;
