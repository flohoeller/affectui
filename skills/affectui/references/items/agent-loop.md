# Agent Loop (Pro)

A run of agents working in steps – Plan, Build, QA, Review, Security – as a row of cards, with every time the run went back drawn as a counted arc underneath

- Page: https://www.affectui.com/components/agent-loop
- Section: Components · Agents
- Install, classic style: `npx shadcn@latest add https://www.affectui.com/r/agent-loop.json` (needs the Pro access key)
- Install, clean style: `npx shadcn@latest add https://www.affectui.com/r/agent-loop-clean.json` (needs the Pro access key) – lands as `agent-loop-clean.tsx`, import from `@/components/ui/agent-loop-clean` – its docs: `agent-loop-clean.md`
- Import: `@/components/ui/agent-loop`

### When to use

- Following a run where agents work in fixed steps – plan, build, test, review, ship – and loop back when a step fails
- Seeing at a glance how often a run went back and why – QA back to Build 2×
- Showing what a run produced – browser screenshots, build and scan logs – next to the step that made it

### When not to use

- One agent moving freely between states – use Agent State Machine
- How long each step took on a time axis – use Trace Waterfall
- Agents that branch into sub-agents – use Agent Tree

### Usage

```tsx
import { AgentLoop, type LoopStep, type LoopBack, type LoopArtifact } from "@/components/ui/agent-loop";

const steps: LoopStep[] = [
  { id: "plan", label: "Plan", status: "done", model: "Claude Opus 5.5", logo: <ClaudeLogo />, summary: "Split the task into 4 changes", time: 66000, tokens: 15400,
    tools: [{ name: "Linear", logo: <LinearLogo /> }] },
  { id: "build", label: "Build", status: "running", model: "GPT-5.1 Codex", logo: <OpenAILogo />, summary: "Fixing the Pay button", time: 192000, tokens: 61000, progress: 0.4 },
  { id: "qa", label: "QA", status: "queued", model: "Gemini 3 Pro", logo: <GeminiLogo /> },
  { id: "review", label: "Review", status: "queued" },
];

const loops: LoopBack[] = [
  { from: "qa", to: "build", label: "checks failed", count: 2, reasons: ["Pay overlaps the footer at 375px", "Total off by one cent"] },
];

const artifacts: LoopArtifact[] = [
  { id: "s1", kind: "screenshot", step: "qa", title: "Checkout · 375px", status: "fail", src: "/shots/checkout-375.png", logo: <ChromeLogo /> },
  { id: "l1", kind: "log", step: "build", title: "Build log", status: "pass", lines: ["$ npm run build", "✓ built in 3.8s"] },
];

export function Run() {
  return <AgentLoop title="Dev loop" subtitle="shop · feat/coupons" logo={<GitHubLogo />} steps={steps} loops={loops} artifacts={artifacts} />;
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| steps | `LoopStep[]` |  | Every step in order – { id, label, status, agent?, model?, logo?, summary?, time?, tokens?, progress?, tools? } |
| logo | `ReactNode` |  | On a step: the model maker's logo before the model. On the root: a logo before the subtitle, e.g. GitHub for the repo |
| tools | `{ name, logo? }[]` |  | The tools a step works with – small overlapping tiles with their logos on its card, by name in its card |
| status | `"queued" \| "running" \| "done" \| "failed"` |  | Running takes a soft wash of the agent's blue and shows a progress bar; failed gets a red edge |
| progress | `number` |  | 0–1 on the running step; left out, its bar sweeps |
| agent | `{ id?, name?, color? }` |  | The agent doing the step – its pixel mark comes from its id (by default the step's id), in its color; by default each step's agent gets its own from a quiet palette |
| loops | `LoopBack[]` |  | { from, to, count, label?, reasons?, id? } – the run going back from a later step to an earlier one (or the same one), drawn as an arc underneath with a count |
| artifacts | `LoopArtifact[]` |  | { id, title, kind: "screenshot" | "log", step?, status?, src?, preview?, lines?, meta?, logo? } – under the row, each tied to its step, with its source's logo before the title |
| title / subtitle | `string` |  | The header – "Agent loop" by default; the subtitle sits next to it in grey |
| iteration | `number` |  | Shown in the header – by default 1 + every time the run went back |
| onSelect | `({ step } \| { loop } \| { artifact } \| null) => void` |  | A step's, a loop's or an artifact's card opened or closed |
| children | `ReactNode` |  | A slot under the artifacts |
| formatTime | `(ms) => string` |  | Formats the times – 12s, 2m 05s by default |
| className | `string` |  | An extra class on the root |

### Keyboard

- Tab: Steps, then the loop counts, then the artifacts
- ← / →: The previous or next step (↑ ↓ when stacked)
- Home / End: The first or last step
- Enter / Space: Open the card of a step, a count or an artifact
- Esc: Close the card – focus goes back

### Accessibility

- Every step, count and artifact is a button with aria-expanded
- A step reads as its name, its place, its status, the model, what it did, time and tokens, and how often it ran
- A count reads as its trigger and the route – "checks failed: QA back to Build, 2 times"
- The run's state is announced as it changes – Running · Build, Done, Failed
- A card opened with the keyboard takes focus; Esc closes it from anywhere and focus goes back
- The lines, arcs and the light are decoration and hidden from screen readers
- A focus ring shows only for the keyboard

### Motion

- On first view the steps settle in, the arcs draw themselves and the counts appear; between two cards there's just an arrowhead, and the arcs keep a little room from the cards
- The running step shimmers with the agent's mark twinkling; its bar fills with a sheen and a glowing leading edge
- Short blue sparks run now and then along the arcs the run has taken – a line on the line, full at its head and fading to nothing at its tail
- When the run goes back, a spark runs back along that arc at once and its count rolls up
- Pointing at a step brings its loops and artifacts forward and fades the rest; pointing at a count, its two steps
- Reduced motion turns all of it off – the steps simply change

### Responsive

- The classic style has a rounder card with a hairline border, rounder steps, pill tags and firmer type – the same behavior as the clean one
- Fills its container's width – the cards share it, from 124 to 260px each; short of room the gaps narrow first
- Still too wide, the row scales down to fit – it never scrolls sideways
- Under 560px the steps stack and the arcs run down the right side
- Every card has three fixed lines – name with the model's logo and the status, summary, tokens with the tools (the time is in its card) – so nothing jumps as it changes; on narrow cards the model shows only its logo, its name is in the card; long text ends in …; short of room the tool tiles give way, never the tokens
- Tokens are short – 4.8K, 48K, 1.2M; times and tokens that aren't numbers are left out
- Loops to steps that don't exist, forward loops and repeated ids are left out
- Artifacts fill a grid of 118px tiles that wraps
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- Keep step labels to one word – Plan, Build, QA – and summaries to one short line
- Count each time the run went back from the run's events and pass it as count; add the reason for each to reasons
- Pass loops that never fired with count 0 – they show dashed, so people see the possible paths
- Set step on every artifact so pointing at a step finds what it made

### Requirements

- React 19

Related: agent-state-machine, trace-waterfall, agent-tree, approval-gates
