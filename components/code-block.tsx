"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";

/*
 * Code Block – a single self-contained file.
 * Code on a white card inside a light-gray tray: the tray carries the file name (or the language) and a copy button
 * that turns into a check for a moment. Optional line numbers that stay put while long lines scroll sideways, highlighted lines,
 * wrapping instead of scrolling, and a max height after which the code scrolls inside.
 * A tiny built-in colorizer for TypeScript / JavaScript, JSON, Bash and Python – no highlighter to install;
 * every other language is shown as plain text.
 * The styles are injected below, so no extra files are needed.
 */

export type CodeBlockProps = {
  /** The code – copied exactly as given */
  code: string;
  /** ts, tsx, js, jsx, json, bash, sh, python … – colors the code when known, otherwise plain text */
  language?: string;
  /** Shown in the header, e.g. "agent.config.ts" – without it the header names the language */
  filename?: string;
  /** Numbers in front of every line, they stay in place while the code scrolls sideways */
  showLineNumbers?: boolean;
  /** Lines to mark, counted from 1 – e.g. [3, 4, 5] */
  highlightLines?: number[];
  /** Long lines wrap instead of scrolling sideways */
  wrap?: boolean;
  /** After this height the code scrolls inside, e.g. 320 or "40vh" */
  maxHeight?: number | string;
  /** The copy button in the header */
  copyable?: boolean;
  /** Called after the code was copied – e.g. for a toast */
  onCopy?: (code: string) => void;
  className?: string;
  style?: CSSProperties;
};

type Kind = "com" | "str" | "kw" | "num" | "lit" | "fn" | "key" | "var";
type Token = [Kind | null, string];

export function CodeBlock({
  code,
  language,
  filename,
  showLineNumbers = false,
  highlightLines,
  wrap = false,
  maxHeight,
  copyable = true,
  onCopy,
  className,
  style,
}: CodeBlockProps) {
  // One trailing newline is how files end – it shouldn't show as an empty last line
  const source = typeof code === "string" ? code : code == null ? "" : String(code);
  const shown = source.replace(/\r\n?/g, "\n").replace(/\n$/, "");
  const lang = resolve(language);
  const lines = useMemo(() => toLines(tokenize(shown, lang)), [shown, lang]);
  const marked = useMemo(() => new Set(Array.isArray(highlightLines) ? highlightLines : []), [highlightLines]);
  const label = filename || languageName(language);

  const scroller = useRef<HTMLDivElement>(null);
  const [scrolls, setScrolls] = useState(false);
  const [copied, setCopied] = useState(false);

  // A scrolling block is reachable by Tab, so keyboard users can scroll it with the arrow keys
  useLayoutEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const check = () => setScrolls(el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);
    return () => ro.disconnect();
  }, [shown, wrap, maxHeight, showLineNumbers]);

  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 1400);
    return () => window.clearTimeout(t);
  }, [copied]);

  const copy = () =>
    copyText(source).then((ok) => {
      if (!ok) return;
      setCopied(true);
      onCopy?.(source);
    });

  const header = !!label || copyable;
  const digits = String(lines.length).length;

  return (
    <figure
      className={["ui-code", className].filter(Boolean).join(" ")}
      data-wrap={wrap || undefined}
      data-numbers={showLineNumbers || undefined}
      style={{ ...style, ["--ui-code-digits" as string]: digits }}
    >
      {/* React 19 hoists this into <head> once, no matter how many blocks render */}
      <style href="ui-code-block" precedence="default">
        {css}
      </style>
      {header && (
        <figcaption className="ui-code__head">
          <span className="ui-code__label" dir="auto" title={label || undefined}>
            {label}
          </span>
          {copyable && (
            <button
              type="button"
              className="ui-code__copy"
              data-copied={copied || undefined}
              aria-label={copied ? "Copied" : "Copy code"}
              title={copied ? "Copied" : "Copy code"}
              onClick={copy}
            >
              <svg className="ui-code__copy-icon" viewBox="0 0 16 16" aria-hidden="true">
                <rect x="5.5" y="5.5" width="8.5" height="8.5" rx="2" />
                <path d="M10.5 3.75v-.25A1.5 1.5 0 0 0 9 2H3.5A1.5 1.5 0 0 0 2 3.5V9a1.5 1.5 0 0 0 1.5 1.5h.25" />
              </svg>
              <svg className="ui-code__copy-done" viewBox="0 0 16 16" aria-hidden="true">
                <path d="M3.5 8.4 6.6 11.3 12.5 4.9" />
              </svg>
            </button>
          )}
        </figcaption>
      )}
      {/* Screen readers hear the copy – the button's new name alone isn't announced */}
      {copyable && (
        <span className="ui-code__sr" role="status">
          {copied ? "Copied" : ""}
        </span>
      )}
      <div
        ref={scroller}
        className="ui-code__scroll"
        style={maxHeight != null ? { maxHeight } : undefined}
        tabIndex={scrolls ? 0 : undefined}
        role={scrolls ? "region" : undefined}
        aria-label={scrolls ? `${label || "Code"}, code` : undefined}
      >
        <pre className="ui-code__pre" dir="ltr">
          <code className="ui-code__code">
            {lines.map((line, i) => (
              <span key={i} className="ui-code__line" data-marked={marked.has(i + 1) || undefined}>
                {showLineNumbers && (
                  <span className="ui-code__ln" aria-hidden="true">
                    {i + 1}
                  </span>
                )}
                <span className="ui-code__text">
                  {line.map(([kind, text], j) =>
                    kind ? (
                      <span key={j} className={`ui-code__t-${kind}`}>
                        {text}
                      </span>
                    ) : (
                      text
                    ),
                  )}
                </span>
              </span>
            ))}
          </code>
        </pre>
      </div>
    </figure>
  );
}

/* ---------- The colorizer ---------- */

type Lang = "js" | "json" | "bash" | "python";

const ALIASES: Record<string, Lang> = {
  ts: "js", tsx: "js", typescript: "js", js: "js", jsx: "js", javascript: "js", mjs: "js", cjs: "js",
  json: "json", jsonc: "json",
  bash: "bash", sh: "bash", shell: "bash", zsh: "bash", console: "bash",
  python: "python", py: "python",
};

const NAMES: Record<string, string> = {
  ts: "TypeScript", typescript: "TypeScript", tsx: "TSX", js: "JavaScript", javascript: "JavaScript", jsx: "JSX",
  mjs: "JavaScript", cjs: "JavaScript", json: "JSON", jsonc: "JSON", bash: "Bash", sh: "Shell", shell: "Shell",
  zsh: "Zsh", console: "Terminal", python: "Python", py: "Python",
};

const resolve = (language?: string): Lang | null => (language ? ALIASES[language.toLowerCase()] ?? null : null);
const languageName = (language?: string) => (language ? NAMES[language.toLowerCase()] ?? language : "");

const END = "(?![\\s\\S])";
const BLOCK_COMMENT = `\\/\\*[\\s\\S]*?(?:\\*\\/|${END})`;

/** Each language: [kind, pattern] in order – at one spot the first that matches wins */
const RULES: Record<Lang, [Kind, string][]> = {
  js: [
    ["com", `\\/\\/[^\\n]*|${BLOCK_COMMENT}`],
    ["str", `"(?:[^"\\\\\\n]|\\\\.)*"?|'(?:[^'\\\\\\n]|\\\\.)*'?|\`(?:[^\`\\\\]|\\\\[\\s\\S])*\`?`],
    ["num", `\\b0[xXbBoO][\\da-fA-F_]+n?\\b|\\b\\d[\\d_]*(?:\\.\\d+)?(?:[eE][+-]?\\d+)?n?\\b`],
    ["lit", `\\b(?:true|false|null|undefined|NaN|Infinity)\\b`],
    [
      "kw",
      `\\b(?:abstract|as|async|await|break|case|catch|class|const|continue|debugger|declare|default|delete|do|else|enum|export|extends|finally|for|from|function|if|implements|import|in|instanceof|interface|keyof|let|new|of|private|protected|public|readonly|return|satisfies|static|super|switch|this|throw|try|type|typeof|var|void|while|with|yield)\\b`,
    ],
    ["fn", `(?<![\\w$])[A-Za-z_$][\\w$]*(?=\\s*\\()`],
  ],
  json: [
    ["com", `\\/\\/[^\\n]*|${BLOCK_COMMENT}`],
    ["key", `"(?:[^"\\\\\\n]|\\\\.)*"(?=\\s*:)`],
    ["str", `"(?:[^"\\\\\\n]|\\\\.)*"?`],
    ["num", `-?\\b\\d+(?:\\.\\d+)?(?:[eE][+-]?\\d+)?\\b`],
    ["lit", `\\b(?:true|false|null)\\b`],
  ],
  bash: [
    ["com", `(?<![^\\s;|&(])#[^\\n]*`],
    ["str", `"(?:[^"\\\\]|\\\\[\\s\\S])*"?|'[^']*'?`],
    ["var", `\\$\\{[^}\\n]*\\}?|\\$[A-Za-z_]\\w*|\\$[0-9@#?*$!-]`],
    ["kw", `\\b(?:if|then|else|elif|fi|for|in|do|done|while|until|case|esac|function|return|export|local|readonly|unset|exit)\\b`],
    // The command: the first word of a line or after a pipe, ;, && or $( – but not NAME=value
    ["fn", `(?<=^[ \\t]*|[|;&(][ \\t]*)[A-Za-z_.\\/~][\\w.\\/~+-]*(?![\\w=])`],
  ],
  python: [
    ["com", `#[^\\n]*`],
    [
      "str",
      `(?:\\b[rRbBuUfF]{1,2})?(?:"""[\\s\\S]*?(?:"""|${END})|'''[\\s\\S]*?(?:'''|${END})|"(?:[^"\\\\\\n]|\\\\.)*"?|'(?:[^'\\\\\\n]|\\\\.)*'?)`,
    ],
    ["fn", `@[A-Za-z_][\\w.]*`],
    ["num", `\\b0[xXoObB][\\da-fA-F_]+\\b|\\b\\d[\\d_]*(?:\\.\\d+)?(?:[eE][+-]?\\d+)?j?\\b`],
    ["lit", `\\b(?:True|False|None|self|cls)\\b`],
    [
      "kw",
      `\\b(?:and|as|assert|async|await|break|case|class|continue|def|del|elif|else|except|finally|for|from|global|if|import|in|is|lambda|match|nonlocal|not|or|pass|raise|return|try|while|with|yield)\\b`,
    ],
    ["fn", `\\b[A-Za-z_]\\w*(?=\\s*\\()`],
  ],
};

const compiled = new Map<Lang, { re: RegExp; kinds: Kind[] }>();
function grammar(lang: Lang) {
  let g = compiled.get(lang);
  if (!g) {
    const rules = RULES[lang];
    g = { re: new RegExp(rules.map(([, p]) => `(${p})`).join("|"), "gm"), kinds: rules.map(([k]) => k) };
    compiled.set(lang, g);
  }
  return g;
}

function tokenize(text: string, lang: Lang | null): Token[] {
  if (!lang || !text) return [[null, text]];
  const { re, kinds } = grammar(lang);
  re.lastIndex = 0;
  const out: Token[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (!m[0]) {
      re.lastIndex++;
      continue;
    }
    if (m.index > last) out.push([null, text.slice(last, m.index)]);
    const group = m.findIndex((g, i) => i > 0 && g !== undefined);
    out.push([kinds[group - 1] ?? null, m[0]]);
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push([null, text.slice(last)]);
  return out;
}

/** Splits the tokens into lines – a comment or string that runs over several lines keeps its color on each */
function toLines(tokens: Token[]): Token[][] {
  const lines: Token[][] = [[]];
  for (const [kind, text] of tokens) {
    text.split("\n").forEach((part, i) => {
      if (i) lines.push([]);
      if (part) lines[lines.length - 1].push([kind, part]);
    });
  }
  return lines;
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Older browsers and non-secure contexts
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.cssText = "position:fixed;opacity:0;pointer-events:none";
    document.body.appendChild(area);
    area.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }
    area.remove();
    return ok;
  }
}

/* ---------- Styles ---------- */

const css = /* css */ `
/* Colors as variables – override them on .ui-code (see Theming in the docs) */
.ui-code {
  --ui-code-tray: var(--aui-subtle, #f4f4f4);
  --ui-code-bg: var(--aui-surface, #ffffff);
  --ui-code-line: var(--aui-border, #e7e7e7);
  --ui-code-ink: var(--aui-ink, #171717);
  --ui-code-muted: var(--aui-muted, #737373);
  --ui-code-faint: #b4b4b4;
  --ui-code-icon: var(--aui-muted, #8a8a8a);
  --ui-code-wash: rgba(0, 0, 0, 0.05);
  --ui-code-mark: rgba(0, 96, 226, 0.06);
  --ui-code-mark-edge: rgba(0, 96, 226, 0.5);
  --ui-code-focus: var(--aui-focus, rgba(0, 96, 226, 0.7));
  --ui-code-ease: var(--aui-ease, cubic-bezier(0.22, 1, 0.36, 1));
  --ui-code-mono: var(--aui-font-mono, ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, monospace);
  --ui-code-r: calc(var(--aui-radius, 10px) + 2px);
  --ui-code-pad: 3px;
  /* Tokens */
  --ui-code-com: #9a9a9a;
  --ui-code-str: #0b8576;
  --ui-code-kw: #8a35d6;
  --ui-code-num: #b25e00;
  --ui-code-lit: #b25e00;
  --ui-code-fn: #1f63c9;
  --ui-code-key: #171717;
  --ui-code-var: #1f63c9;

  box-sizing: border-box;
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 0;
  margin: 0;
  padding: var(--ui-code-pad);
  border-radius: var(--ui-code-r);
  background: var(--ui-code-tray);
  color: var(--ui-code-ink);
  font-family: var(--aui-font, "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif);
  font-size: 13.5px;
  line-height: 20px;
  -webkit-font-smoothing: antialiased;
}
.ui-code *, .ui-code *::before, .ui-code *::after { box-sizing: border-box; }

/* Header on the tray: the name on the left, copy on the right – the button as far from the right edge as from the top */
.ui-code__head {
  display: flex;
  flex: none;
  align-items: center;
  gap: 8px;
  height: 32px;
  padding: 0 3px 0 13px;
}
.ui-code__label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  font-size: 12.5px;
  line-height: 16px;
  font-weight: 500;
  color: var(--ui-code-muted);
  white-space: nowrap;
  text-overflow: ellipsis;
}
.ui-code__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }

/* Copy: a ghost button on the tray; the copy glyph blurs into a check */
.ui-code__copy {
  all: unset;
  position: relative;
  display: grid;
  flex: none;
  place-items: center;
  width: 26px;
  height: 26px;
  border-radius: calc(var(--ui-code-r) - 5px);
  color: var(--ui-code-icon);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: background-color 160ms ease, color 160ms ease;
}
.ui-code__copy svg {
  position: absolute;
  width: 15px;
  height: 15px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.4;
  stroke-linecap: round;
  stroke-linejoin: round;
  transition: opacity 200ms ease, transform 320ms var(--ui-code-ease), filter 200ms ease;
}
.ui-code__copy-icon rect { fill: none; stroke: currentColor; }
.ui-code__copy .ui-code__copy-done { opacity: 0; transform: scale(0.6); filter: blur(2px); stroke-width: 1.7; }
.ui-code__copy[data-copied] { color: var(--ui-code-ink); }
.ui-code__copy[data-copied] .ui-code__copy-icon { opacity: 0; transform: scale(0.6); filter: blur(2px); }
.ui-code__copy[data-copied] .ui-code__copy-done { opacity: 1; transform: none; filter: none; }
.ui-code__copy:focus-visible { outline: 2px solid var(--ui-code-focus); outline-offset: 2px; }
@media (hover: hover) {
  .ui-code__copy:hover { background: var(--ui-code-wash); color: var(--ui-code-ink); }
}

/* The white card with the code: scrolls sideways (or wraps) and, past maxHeight, down – never wider than its container */
.ui-code__scroll {
  position: relative;
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
  overflow: auto;
  overscroll-behavior-x: contain;
  border-radius: calc(var(--ui-code-r) - var(--ui-code-pad));
  background: var(--ui-code-bg);
  box-shadow: 0 0 0 1px var(--ui-code-line), 0 1px 2px rgba(0, 0, 0, 0.04);
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.18) transparent;
}
.ui-code__scroll:focus-visible { outline: 2px solid var(--ui-code-focus); outline-offset: -2px; }
.ui-code__pre {
  margin: 0;
  padding: 12px 0;
  font-family: var(--ui-code-mono);
  font-size: 12.5px;
  line-height: 20px;
  color: var(--ui-code-ink);
  tab-size: 2;
  text-align: left;
}
.ui-code__code { display: block; width: max-content; min-width: 100%; font: inherit; }
.ui-code[data-wrap] .ui-code__code { width: auto; }

.ui-code__line { display: flex; min-height: 20px; padding: 0 16px; }
.ui-code__text { flex: 1 0 auto; white-space: pre; }
.ui-code[data-wrap] .ui-code__text { flex: 1 1 auto; min-width: 0; white-space: pre-wrap; overflow-wrap: anywhere; }
.ui-code__line[data-marked] { background: var(--ui-code-mark); box-shadow: inset 2px 0 0 var(--ui-code-mark-edge); }

/* Line numbers stay in place while long lines scroll sideways */
.ui-code[data-numbers] .ui-code__line { padding-left: 0; }
.ui-code__ln {
  position: sticky;
  left: 0;
  z-index: 1;
  flex: none;
  min-width: calc(var(--ui-code-digits, 2) * 1ch + 32px);
  padding: 0 14px 0 18px;
  background: var(--ui-code-bg);
  color: var(--ui-code-faint);
  text-align: right;
  font-variant-numeric: tabular-nums;
  -webkit-user-select: none;
  user-select: none;
}
.ui-code__line[data-marked] .ui-code__ln {
  background: linear-gradient(var(--ui-code-mark), var(--ui-code-mark)), var(--ui-code-bg);
  box-shadow: inset 2px 0 0 var(--ui-code-mark-edge);
  color: var(--ui-code-muted);
}

.ui-code__t-com { color: var(--ui-code-com); }
.ui-code__t-str { color: var(--ui-code-str); }
.ui-code__t-kw { color: var(--ui-code-kw); }
.ui-code__t-num { color: var(--ui-code-num); }
.ui-code__t-lit { color: var(--ui-code-lit); }
.ui-code__t-fn { color: var(--ui-code-fn); }
.ui-code__t-key { color: var(--ui-code-key); }
.ui-code__t-var { color: var(--ui-code-var); }

/* Touch screens: a bigger hit area around the copy button, the look stays */
@media (pointer: coarse) {
  .ui-code__copy::after { content: ""; position: absolute; inset: -5px; }
}

@media (prefers-reduced-motion: reduce) {
  .ui-code__copy, .ui-code__copy svg { transition: none; }
}

/* Dark mode: follows a .dark class or data-theme="dark" on any ancestor, e.g. <html> */
:where(.dark, [data-theme="dark"]) .ui-code {
  --ui-code-tray: var(--aui-subtle, #1d1d20);
  --ui-code-bg: var(--aui-surface, #161618);
  --ui-code-line: var(--aui-border, rgba(255, 255, 255, 0.1));
  --ui-code-ink: var(--aui-ink, #ededed);
  --ui-code-muted: var(--aui-muted, #8b8b92);
  --ui-code-faint: #55555b;
  --ui-code-icon: var(--aui-muted, #8b8b92);
  --ui-code-wash: rgba(255, 255, 255, 0.07);
  --ui-code-mark: rgba(77, 141, 255, 0.1);
  --ui-code-mark-edge: rgba(77, 141, 255, 0.6);
  --ui-code-focus: var(--aui-focus, rgba(77, 141, 255, 0.8));
  --ui-code-com: #6e6e75;
  --ui-code-str: var(--aui-teal, #4fc3b4);
  --ui-code-kw: #cfaef5;
  --ui-code-num: var(--aui-orange, #f2a15c);
  --ui-code-lit: var(--aui-orange, #f2a15c);
  --ui-code-fn: #7cb4ff;
  --ui-code-key: #ededed;
  --ui-code-var: #7cb4ff;
}
:where(.dark, [data-theme="dark"]) .ui-code__scroll { box-shadow: 0 0 0 1px var(--ui-code-line); scrollbar-color: rgba(255, 255, 255, 0.2) transparent; }
`;
