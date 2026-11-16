# Reasoning Summary, clean style (Pro)

How an agent spent its time on one answer, in one small card – the agent's pixel mark twinkling while it reasons and the time counting, a bar with a segment per step in its kind's color, the running one growing with a sheen, the time per kind with its icon, and the models that took part with how hard they thought – click one for its provider, tokens and cost. Point at a kind, model or segment and what belongs with it stays clear; the sources it searched and every step open below

- Page: https://www.affectui.com/components/reasoning-summary
- Section: Components · Agents
- Install: `npx shadcn@latest add https://www.affectui.com/r/reasoning-summary-clean.json` (needs the Pro access key)
- Import: `@/components/ui/reasoning-summary-clean`

### When to use

- Showing how long an agent thought about one answer, and what it spent that time on – searching, analyzing, coding, testing
- Showing which models took part in one answer, how hard each one thought, what it did and what it cost
- A small card above or below an answer that says where it came from, with the steps and sources one click away

### When not to use

- A live "thinking…" line while the answer streams – use Thinking State
- Every span of a run with its nesting and timing – use Trace Waterfall
- Where a run's money went, step by step – use Cost Waterfall

### Usage

```tsx
import { ReasoningSummary, type ReasonStep, type ReasonModel } from "@/components/ui/reasoning-summary-clean";

const steps: ReasonStep[] = [
  { id: "s1", kind: "search", label: "Searched the docs for rate limits", model: "opus", ms: 1800 },
  { id: "s2", kind: "analyze", label: "Compared the limits across three plans", model: "grok", ms: 2200 },
  { id: "s3", kind: "code", label: "Wrote a retry with backoff", model: "gpt", ms: 1600 },
  { id: "s4", kind: "test", label: "Ran it against the sandbox", model: "gpt", ms: 2600 },
];

const models: ReasonModel[] = [
  { id: "opus", name: "Claude Opus 5.5", logo: <ClaudeLogo />, effort: "medium", role: "Researching", provider: "Anthropic" },
  { id: "grok", name: "Grok 5", logo: <GrokLogo />, effort: "high", role: "Analyzing", provider: "xAI" },
  { id: "gpt", name: "GPT-5.5", logo: <OpenAILogo />, effort: "max", role: "Solving", provider: "OpenAI" },
];

export function Answer() {
  return <ReasoningSummary steps={steps} models={models} sources={sources} sourceCount={24} />;
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| steps | `ReasonStep[]` |  | Every step in order – one bar segment each, as wide as its share of the time |
| ReasonStep.kind / label | `string / string` |  | What kind of step it is – its color and icon – and what it did, shown in Steps |
| ReasonStep.ms / running | `number / boolean` |  | How long it took; leave ms out on a running step and it counts on its own |
| ReasonStep.model | `string` |  | The id of the model that did it – ties the step to its model for highlighting and details |
| models | `ReasonModel[]` |  | One row each: logo, name, an effort meter, role and time; a click opens its details below |
| ReasonModel.effort | `"low" \| "medium" \| "high" \| "max"` |  | How hard it thought – four small bars, lit in the color of the kind it spent most time on |
| ReasonModel.provider / tokens / cost / note | `string / { input?, output? } / number / string` |  | Its details: who makes it, what it read and wrote, what it cost in dollars, and why it was picked |
| sources / sourceCount | `ReasonSource[] / number` |  | The stacked logos and the Sources list (name, detail, href); sourceCount when there were more than you pass |
| running | `boolean` |  | Still reasoning – the header says "Reasoning", the mark twinkles, the bar leaves room to grow |
| estimate | `number` |  | How long it will likely take (ms) – the grey track at the end of the bar shows what's probably left |
| kinds | `Record<string, { label, color, icon? }>` |  | Names, colors and icons for kinds of your own, or to change the built-in ones |
| agent | `{ id, color? }` |  | The agent behind it – its id picks its pixel mark, color tints it (blue by default) |
| defaultOpen | `boolean` |  | Steps open from the start |
| className | `string` |  | Extra class on the root – set the color variables on it |

### Keyboard

- Tab: Four stops: the kinds, the models, Sources, Steps
- ← / → / ↑ / ↓: Walk the kinds (two columns) or the models – what belongs with the focused one lights up
- Home / End: The first, the last kind or model
- Enter / Space: Open or close a model's details, the Sources list or the Steps list
- Esc: Close whatever is open

### Accessibility

- The bar is an image named with the time per kind; every segment has its step and time as a tooltip
- Models, Sources and Steps are buttons with aria-expanded and point at what they open; each model is named with its role, time and effort
- A polite live region says "Reasoned for 11s, 6 steps" once it's done
- A focused kind or model lights up what belongs with it, as pointing does
- Focus rings show for the keyboard only, in light and dark
- Color never carries meaning alone: every kind has its name and icon, effort its word in the label

### Motion

- The running segment grows every frame with a light sheen sweeping along it; new segments open from the left
- The agent's pixel mark twinkles in a diagonal wave while it reasons, and the label shimmers
- The card grows smoothly when a new row of kinds comes in, and when details or lists open
- Pointing at a kind, model or segment fades everything else back
- Reduced motion turns it all off – things simply appear

### Responsive

- Fills its container's width; the kinds stay two columns, names end in … before times do
- Long model names, roles, step labels and source details end in … with the full text on hover – the role gives way first, the time always stays
- Below 340px of width the model's role steps aside so names keep their room; touch screens get bigger rows and buttons
- Numbers read well at any size: 12,345 sources, 1.9M tokens, 2h 00m
- Broken data holds: a time that isn't a number counts as 0, an unknown kind gets a grey square and its own name, a model or source without a logo shows its first letter, a step without a label shows its kind
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- Give every step and model a stable id – a new step id grows in once
- Keep labels short and in the past tense – "Searched the docs for rate limits" – and the running one in the present
- Pass ms for finished steps; for the running one leave it out and set running
- Set model on every step so highlighting and the model details add up
- Pass only a few sources with logos and the full number as sourceCount

### Requirements

- React 19

Related: thinking-state, trace-waterfall, cost-waterfall, model-picker
