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
 * Tool Call Card – one tool call of an AI agent, in a single self-contained file.
 * A header with the tool's icon, its name in mono, a short summary and the status:
 * a spinner with a live timer, a check with the duration, or "Failed". Click it open to
 * see the arguments and the result as highlighted JSON, each with a copy button; long
 * blocks are capped with a fade and "Show all". Errors show the message and a Retry button.
 * ToolCallGroup folds several cards into one line: "Used 3 tools · 2.4s".
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
      className={["ui-tcl", className].filter(Boolean).join(" ")}
      data-status={status}
      data-open={open || undefined}
    >
      {/* React 19 hoists this into <head> once, no matter how many cards render */}
      <style href="ui-tool-call" precedence="default">
        {css}
      </style>
      <span className="ui-tcl-sr" role="status" aria-live="polite">
        {announce}
      </span>

      <button
        type="button"
        className="ui-tcl__head"
        aria-expanded={open}
        aria-controls={`${id}-body`}
        onClick={() => {
          setAutoOpened(false);
          setOpen(!open);
        }}
      >
        <span className="ui-tcl__icon" aria-hidden="true">
          {icon ?? <WrenchIcon />}
        </span>
        <span className="ui-tcl__main">
          <code className="ui-tcl__name" title={name}>
            {name}
          </code>
          {summary != null && (
            <span className="ui-tcl__summary" dir="auto" title={typeof summary === "string" ? summary : undefined}>
              {summary}
            </span>
          )}
        </span>
        <span className="ui-tcl__status" key={status}>
          {status === "running" && <Spinner />}
          {status === "success" && (
            <svg className="ui-tcl__ok" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M3.5 8.4 6.6 11.3 12.5 4.9" pathLength={1} />
            </svg>
          )}
          {status === "error" && <ErrorIcon />}
          <span className="ui-tcl__time">
            {status === "error" ? "Failed" : ms != null ? formatMs(ms, status === "running") : null}
          </span>
        </span>
        <Chevron />
      </button>

      <div className="ui-tcl__body" id={`${id}-body`} inert={!open}>
        <div className="ui-tcl__clip">
          <div className="ui-tcl__sections">
            {status === "error" && (
              <div className="ui-tcl__error">
                <ErrorIcon />
                <p className="ui-tcl__error-text" dir="auto">{error ?? "The tool call failed."}</p>
                {onRetry && (
                  <button type="button" className="ui-tcl__retry" onClick={onRetry}>
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
              <div className="ui-tcl__section">
                <div className="ui-tcl__section-head">
                  <span className="ui-tcl__label">Result</span>
                </div>
                <p className="ui-tcl__pending">Waiting for result…</p>
              </div>
            ) : null}
            {args === undefined && result === undefined && status === "success" && (
              <p className="ui-tcl__pending">No arguments or result.</p>
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
      className={["ui-tcl-group", className].filter(Boolean).join(" ")}
      data-running={running || undefined}
      data-open={open || undefined}
    >
      <style href="ui-tool-call" precedence="default">
        {css}
      </style>
      <span className="ui-tcl-sr" role="status" aria-live="polite">
        {running ? runningLabel : `${count}${failed ? `, ${failed} failed` : ""}`}
      </span>

      <button
        type="button"
        className="ui-tcl-group__head"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        onClick={() => {
          if (openProp === undefined) setOpenState(!open);
          onOpenChange?.(!open);
        }}
      >
        <span className="ui-tcl-group__stack" aria-hidden="true">
          {icons.map((c, i) => (
            <span className="ui-tcl__icon" key={calls.length - icons.length + i}>
              {c.icon ?? <WrenchIcon />}
            </span>
          ))}
        </span>
        <span className="ui-tcl-group__title" key={running ? "busy" : "done"}>
          <span className={running ? "ui-tcl-group__label ui-tcl__shine" : "ui-tcl-group__label"} data-text={title}>
            {title}
          </span>
          {!running && failed > 0 && <span className="ui-tcl-group__failed">· {failed} failed</span>}
          {ms != null && <span className="ui-tcl-group__time">· {formatMs(ms, running)}</span>}
        </span>
        <Chevron />
      </button>

      <div className="ui-tcl__body" id={`${id}-list`} inert={!open}>
        <div className="ui-tcl__clip">
          <div className="ui-tcl-group__list">{children}</div>
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
    <div className="ui-tcl__section">
      <div className="ui-tcl__section-head">
        <span className="ui-tcl__label">{label}</span>
        <CopyButton text={text} label={label.toLowerCase()} />
      </div>
      <pre
        ref={pre}
        className="ui-tcl__code"
        data-capped={(capped && !full) || undefined}
        data-scroll={(capped && full && height > OPEN_MAX) || undefined}
        // Open, a very long block stops at a few screens and scrolls inside – no 200,000px card
        style={capped ? { maxHeight: full ? Math.min(height, OPEN_MAX) : cap } : undefined}
      >
        <code>{json ? highlight(text) : text}</code>
      </pre>
      {capped && (
        <button type="button" className="ui-tcl__more" aria-expanded={full} onClick={() => setFull(!full)}>
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
      className="ui-tcl__copy"
      data-copied={copied || undefined}
      aria-label={copied ? "Copied" : `Copy ${label}`}
      title={copied ? "Copied" : `Copy ${label}`}
      onClick={() => copyText(text).then((ok) => ok && setCopied(true))}
    >
      <svg className="ui-tcl__copy-icon" viewBox="0 0 16 16" aria-hidden="true">
        <rect x="5.25" y="5.25" width="8" height="8" rx="2" />
        <path d="M10.75 5.25v-1a1.5 1.5 0 0 0-1.5-1.5h-4.5a2 2 0 0 0-2 2v4.5a1.5 1.5 0 0 0 1.5 1.5h1" />
      </svg>
      <svg className="ui-tcl__copy-done" viewBox="0 0 16 16" aria-hidden="true">
        <path d="M3.5 8.4 6.6 11.3 12.5 4.9" pathLength={1} />
      </svg>
    </button>
  );
}

function Spinner() {
  return (
    <svg className="ui-tcl__spinner" viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="8" r="5.75" />
      <path d="M8 2.25a5.75 5.75 0 0 1 5.75 5.75" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg className="ui-tcl__err" viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="8" r="6" />
      <path d="M8 5v3.4M8 10.9v.1" />
    </svg>
  );
}

function Chevron() {
  return (
    <svg className="ui-tcl__chevron" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M4.5 6.25 8 9.75l3.5-3.5" />
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
        <span key={m.index} className="ui-tcl__t-key">
          {m[1]}
        </span>,
        m[2],
      );
    } else {
      const kind = m[1] ? "str" : /^[tfn]/.test(m[0]) ? "lit" : "num";
      out.push(
        <span key={m.index} className={`ui-tcl__t-${kind}`}>
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
.ui-tcl,
.ui-tcl-group {
  --ui-tcl-ink: var(--aui-ink, #171717);
  --ui-tcl-text: var(--aui-muted, #6b6b6b);
  --ui-tcl-muted: var(--aui-muted, #8a8a8a);
  --ui-tcl-bg: var(--aui-surface, #ffffff);
  --ui-tcl-line: var(--aui-border, #e7e7e7);
  --ui-tcl-hover: var(--aui-subtle, #fafafa);
  --ui-tcl-tile: #f5f5f5;
  --ui-tcl-code: #fafafa;
  --ui-tcl-ring: #ffffff;
  --ui-tcl-red: var(--aui-danger, #c4320a);
  --ui-tcl-red-bg: color-mix(in srgb, var(--aui-red, #f04438) 6%, transparent);
  --ui-tcl-red-line: color-mix(in srgb, var(--aui-red, #f04438) 16%, transparent);
  --ui-tcl-key: #171717;
  --ui-tcl-str: #0b8576;
  --ui-tcl-num: var(--aui-warning, #b25e00);
  --ui-tcl-lit: #8a35d6;
  --ui-tcl-shine: rgba(255, 255, 255, 0.82);
  --ui-tcl-focus: var(--aui-focus, rgba(0, 96, 226, 0.7));
  --ui-tcl-ease: var(--aui-ease, cubic-bezier(0.22, 1, 0.36, 1));
  --ui-tcl-mono: var(--aui-font-mono, ui-monospace, "SF Mono", Menlo, monospace);
  box-sizing: border-box;
  min-width: 0;
  color: var(--ui-tcl-text);
  font-family: var(--aui-font, "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif);
  font-size: 13.5px;
  line-height: 1.4;
  letter-spacing: -0.006em;
  -webkit-font-smoothing: antialiased;
}
.ui-tcl *,
.ui-tcl-group * { box-sizing: border-box; }

.ui-tcl {
  position: relative;
  border-radius: calc(var(--aui-radius-lg, 16px) - 4px);
  background: var(--ui-tcl-bg);
  box-shadow: var(--aui-shadow-card, inset 0 0 0 1px var(--ui-tcl-line), 0 1px 2px rgba(0, 0, 0, 0.04));
}
.ui-tcl-sr {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

/* Header: icon, name + summary, status, chevron – everything truncates before it overflows */
.ui-tcl__head {
  all: unset;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-height: 44px;
  padding: 8px 10px 8px 9px;
  border-radius: calc(var(--aui-radius-lg, 16px) - 4px);
  cursor: pointer;
  transition: background-color 160ms ease;
}
.ui-tcl[data-open] .ui-tcl__head { border-radius: calc(var(--aui-radius-lg, 16px) - 4px) calc(var(--aui-radius-lg, 16px) - 4px) 0 0; }
.ui-tcl__head:focus-visible,
.ui-tcl-group__head:focus-visible,
.ui-tcl__copy:focus-visible,
.ui-tcl__more:focus-visible,
.ui-tcl__retry:focus-visible {
  outline: 2px solid var(--ui-tcl-focus);
  outline-offset: 2px;
}
@media (hover: hover) {
  .ui-tcl__head:hover { background: var(--ui-tcl-hover); }
  .ui-tcl-group__head:hover { background: var(--ui-tcl-hover); color: var(--ui-tcl-ink); }
  .ui-tcl__copy:hover { background: var(--ui-tcl-hover); color: var(--ui-tcl-ink); }
  .ui-tcl__more:hover { color: var(--ui-tcl-ink); }
  .ui-tcl__retry:hover { background: var(--ui-tcl-hover); }
}

.ui-tcl__icon {
  display: grid;
  place-items: center;
  flex: none;
  width: 26px;
  height: 26px;
  border-radius: 7px;
  background: var(--ui-tcl-tile);
  box-shadow: inset 0 0 0 1px var(--ui-tcl-line);
  color: var(--ui-tcl-ink);
}
.ui-tcl__icon > svg { width: 14px; height: 14px; fill: none; stroke: currentColor; stroke-width: 1.4; stroke-linecap: round; stroke-linejoin: round; }

.ui-tcl__main {
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex: 1;
  min-width: 0;
}
.ui-tcl__name {
  flex: 0 1 auto;
  max-width: 55%;
  overflow: hidden;
  color: var(--ui-tcl-ink);
  font-family: var(--ui-tcl-mono);
  font-size: 12.5px;
  font-weight: 500;
  letter-spacing: 0;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ui-tcl__summary {
  flex: 1 1 0;
  min-width: 0;
  overflow: hidden;
  color: var(--ui-tcl-text);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ui-tcl__status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex: none;
  color: var(--ui-tcl-muted);
  font-size: 12.5px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  animation: ui-tcl-in 360ms var(--ui-tcl-ease) both;
}
.ui-tcl[data-status="error"] .ui-tcl__status { color: var(--ui-tcl-red); }
.ui-tcl__status > svg { width: 14px; height: 14px; flex: none; fill: none; stroke-linecap: round; stroke-linejoin: round; }
.ui-tcl__spinner circle { stroke: currentColor; stroke-width: 1.6; opacity: 0.22; }
.ui-tcl__spinner path { stroke: var(--ui-tcl-ink); stroke-width: 1.6; }
.ui-tcl__spinner { animation: ui-tcl-spin 800ms linear infinite; }
.ui-tcl__ok { stroke: var(--ui-tcl-ink); stroke-width: 1.8; }
.ui-tcl__ok path { stroke-dasharray: 1; stroke-dashoffset: 1; animation: ui-tcl-draw 360ms var(--ui-tcl-ease) 80ms forwards; }
.ui-tcl__err { stroke: var(--ui-tcl-red); stroke-width: 1.5; }

.ui-tcl__chevron {
  flex: none;
  width: 14px;
  height: 14px;
  fill: none;
  stroke: var(--ui-tcl-muted);
  stroke-width: 1.5;
  stroke-linecap: round;
  stroke-linejoin: round;
  transition: transform 360ms var(--ui-tcl-ease);
}
.ui-tcl[data-open] > .ui-tcl__head .ui-tcl__chevron,
.ui-tcl-group[data-open] > .ui-tcl-group__head .ui-tcl__chevron { transform: rotate(180deg); }

/* Body: grows from 0fr to 1fr, so the height animates without measuring */
.ui-tcl__body {
  display: grid;
  grid-template-rows: 0fr;
  opacity: 0;
  transition: grid-template-rows 380ms var(--ui-tcl-ease), opacity 240ms ease;
}
.ui-tcl[data-open] > .ui-tcl__body,
.ui-tcl-group[data-open] > .ui-tcl__body {
  grid-template-rows: 1fr;
  opacity: 1;
}
.ui-tcl__clip { min-height: 0; overflow: hidden; }
.ui-tcl__sections {
  display: grid;
  gap: 12px;
  padding: 12px;
  border-top: 1px solid var(--ui-tcl-line);
}

.ui-tcl__section { display: grid; gap: 6px; min-width: 0; }
.ui-tcl__section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 24px;
}
.ui-tcl__label { color: var(--ui-tcl-muted); font-size: 12px; font-weight: 500; }
.ui-tcl__pending { margin: 0; color: var(--ui-tcl-muted); font-size: 12.5px; }

.ui-tcl__copy {
  all: unset;
  position: relative;
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border-radius: calc(var(--aui-radius-sm, 7px) - 1px);
  color: var(--ui-tcl-muted);
  cursor: pointer;
  transition: background-color 160ms ease, color 160ms ease;
}
.ui-tcl__copy svg {
  position: absolute;
  width: 14px;
  height: 14px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.4;
  stroke-linecap: round;
  stroke-linejoin: round;
  transition: opacity 200ms ease, transform 320ms var(--ui-tcl-ease), filter 200ms ease;
}
.ui-tcl__copy-done { opacity: 0; transform: scale(0.6); filter: blur(2px); stroke-width: 1.7; }
.ui-tcl__copy[data-copied] { color: var(--ui-tcl-ink); }
.ui-tcl__copy[data-copied] .ui-tcl__copy-icon { opacity: 0; transform: scale(0.6); filter: blur(2px); }
.ui-tcl__copy[data-copied] .ui-tcl__copy-done { opacity: 1; transform: none; filter: none; }

/* Code: wraps instead of scrolling sideways; capped blocks fade out at the bottom */
.ui-tcl__code {
  position: relative;
  margin: 0;
  padding: 10px 12px;
  overflow: hidden;
  border-radius: calc(var(--aui-radius-sm, 7px) + 1px);
  background: var(--ui-tcl-code);
  box-shadow: inset 0 0 0 1px var(--ui-tcl-line);
  color: var(--ui-tcl-muted);
  font-family: var(--ui-tcl-mono);
  font-size: 12px;
  line-height: 1.6;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  tab-size: 2;
  transition: max-height 420ms var(--ui-tcl-ease);
}
.ui-tcl__code code { display: block; font: inherit; }
.ui-tcl__code::after {
  content: "";
  position: absolute;
  left: 1px;
  right: 1px;
  bottom: 1px;
  height: 56px;
  border-radius: 0 0 var(--aui-radius-sm, 7px) var(--aui-radius-sm, 7px);
  background: linear-gradient(to bottom, transparent, var(--ui-tcl-code));
  opacity: 0;
  transition: opacity 240ms ease;
  pointer-events: none;
}
.ui-tcl__code[data-capped]::after { opacity: 1; }
.ui-tcl__code[data-scroll] { overflow-y: auto; overscroll-behavior: contain; }
.ui-tcl__t-key { color: var(--ui-tcl-key); }
.ui-tcl__t-str { color: var(--ui-tcl-str); }
.ui-tcl__t-num { color: var(--ui-tcl-num); }
.ui-tcl__t-lit { color: var(--ui-tcl-lit); }

.ui-tcl__more {
  all: unset;
  justify-self: start;
  padding: 2px 4px;
  margin-left: -4px;
  border-radius: 5px;
  color: var(--ui-tcl-text);
  font-size: 12.5px;
  font-weight: 500;
  cursor: pointer;
  transition: color 160ms ease;
}

/* Error: the message and an optional retry */
.ui-tcl__error {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 9px 10px 9px 11px;
  border-radius: calc(var(--aui-radius-sm, 7px) + 1px);
  background: var(--ui-tcl-red-bg);
  box-shadow: inset 0 0 0 1px var(--ui-tcl-red-line);
}
.ui-tcl__error > .ui-tcl__err { flex: none; width: 14px; height: 14px; margin-top: 2px; fill: none; stroke-linecap: round; }
.ui-tcl__error-text {
  flex: 1;
  min-width: 0;
  max-height: 200px;
  margin: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  white-space: pre-line;
  color: var(--ui-tcl-red);
  font-size: 13px;
  line-height: 1.45;
  overflow-wrap: anywhere;
}
.ui-tcl__retry {
  all: unset;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  flex: none;
  height: 26px;
  margin: -3px 0;
  padding: 0 10px 0 8px;
  border-radius: var(--aui-radius-sm, 7px);
  background: var(--ui-tcl-bg);
  box-shadow: inset 0 0 0 1px var(--ui-tcl-line), 0 1px 2px rgba(0, 0, 0, 0.04);
  color: var(--ui-tcl-ink);
  font-size: 12.5px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 160ms ease;
}
.ui-tcl__retry svg { width: 13px; height: 13px; fill: none; stroke: currentColor; stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; }
.ui-tcl__retry:active svg { transform: rotate(-60deg); transition: transform 200ms var(--ui-tcl-ease); }

/* Group: one quiet line with the tool icons stacked, the cards below */
.ui-tcl-group { display: grid; }
.ui-tcl-group__head {
  all: unset;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 9px;
  justify-self: start;
  max-width: 100%;
  min-height: 36px;
  padding: 4px 10px 4px 5px;
  border-radius: var(--aui-radius, 10px);
  color: var(--ui-tcl-text);
  cursor: pointer;
  transition: background-color 160ms ease, color 160ms ease;
}
.ui-tcl-group__stack { display: flex; flex: none; }
.ui-tcl-group__stack .ui-tcl__icon {
  width: 24px;
  height: 24px;
  border-radius: 7px;
  box-shadow: inset 0 0 0 1px var(--ui-tcl-line), 0 0 0 2px var(--ui-tcl-ring);
  animation: ui-tcl-pop 420ms var(--ui-tcl-ease) both;
}
.ui-tcl-group__stack .ui-tcl__icon + .ui-tcl__icon { margin-left: -5px; }
.ui-tcl-group__stack .ui-tcl__icon > svg { width: 13px; height: 13px; }
.ui-tcl-group__title {
  display: flex;
  align-items: baseline;
  gap: 5px;
  min-width: 0;
  white-space: nowrap;
  animation: ui-tcl-in 360ms var(--ui-tcl-ease) both;
}
.ui-tcl-group__label {
  position: relative;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  color: inherit;
  font-weight: 500;
}
.ui-tcl-group__failed { flex: none; color: var(--ui-tcl-red); }
.ui-tcl-group__time { flex: none; color: var(--ui-tcl-muted); font-variant-numeric: tabular-nums; }
.ui-tcl-group__list { display: grid; gap: 8px; padding-top: 8px; }

/* A soft light sweeping over "Using tools…" */
.ui-tcl__shine::after {
  content: attr(data-text);
  content: attr(data-text) / "";
  position: absolute;
  inset: 0;
  white-space: nowrap;
  color: transparent;
  background: linear-gradient(90deg, transparent 38%, var(--ui-tcl-shine) 50%, transparent 62%) 100% 0 / 300% 100% no-repeat;
  -webkit-background-clip: text;
  background-clip: text;
  animation: ui-tcl-sweep 1.8s linear infinite;
  pointer-events: none;
}

@keyframes ui-tcl-in {
  from { opacity: 0; transform: translateY(3px); filter: blur(2px); }
  to { opacity: 1; transform: none; filter: none; }
}
@keyframes ui-tcl-pop {
  from { opacity: 0; transform: scale(0.6); }
  to { opacity: 1; transform: none; }
}
@keyframes ui-tcl-spin { to { transform: rotate(360deg); } }
@keyframes ui-tcl-draw { to { stroke-dashoffset: 0; } }
@keyframes ui-tcl-sweep {
  from { background-position: 100% 0; }
  to { background-position: 0% 0; }
}

@media (prefers-reduced-motion: reduce) {
  .ui-tcl *,
  .ui-tcl-group *,
  .ui-tcl *::after,
  .ui-tcl-group *::after {
    animation-duration: 1ms !important;
    animation-delay: 0ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 1ms !important;
  }
  .ui-tcl__shine::after { display: none; }
  .ui-tcl__ok path { stroke-dashoffset: 0; }
}

/* Dark mode: follows a .dark class or data-theme="dark" on any ancestor, e.g. <html> */
:where(.dark, [data-theme="dark"]) .ui-tcl,
:where(.dark, [data-theme="dark"]) .ui-tcl-group {
  --ui-tcl-ink: var(--aui-ink, #ededed);
  --ui-tcl-text: var(--aui-muted, #a1a1a1);
  --ui-tcl-muted: var(--aui-muted, #7c7c7c);
  --ui-tcl-bg: var(--aui-surface, #161618);
  --ui-tcl-line: var(--aui-border, rgba(255, 255, 255, 0.1));
  --ui-tcl-hover: var(--aui-subtle, rgba(255, 255, 255, 0.035));
  --ui-tcl-tile: #1d1d20;
  --ui-tcl-code: #1d1d20;
  --ui-tcl-ring: #161618;
  --ui-tcl-red: var(--aui-danger, #ff8a7a);
  --ui-tcl-red-bg: color-mix(in srgb, var(--aui-red, #ff6b5f) 8%, transparent);
  --ui-tcl-red-line: color-mix(in srgb, var(--aui-red, #ff6b5f) 20%, transparent);
  --ui-tcl-key: #ededed;
  --ui-tcl-str: var(--aui-teal, #4fc3b4);
  --ui-tcl-num: var(--aui-orange, #f2a15c);
  --ui-tcl-lit: #cfaef5;
  --ui-tcl-shine: rgba(255, 255, 255, 0.95);
  --ui-tcl-focus: var(--aui-focus, rgba(77, 141, 255, 0.8));
}
:where(.dark, [data-theme="dark"]) .ui-tcl { box-shadow: var(--aui-shadow-card, inset 0 0 0 1px var(--ui-tcl-line)); }
`;
