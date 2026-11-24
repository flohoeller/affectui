# Guardrail Funnel (Pro)

The deterministic guardrails an agent's traffic passes through, as a funnel: requests, input check, PII redaction, tool-call allowlist, output check, delivered. Every stage a fixed row with how many it stopped or changed, how many got through and the share still in; in the middle a soft band per stage as wide as what reached it – the stopped part at its ends in the stage's color, what it redacted as a band – with a slow sheen running down. Click or focus a stage and cards show what it caught: the masked snippet, the rule that fired, and Allow once or Override

- Page: https://www.affectui.com/components/guardrail-funnel
- Section: Components · Agents
- Install, classic style: `npx shadcn@latest add https://www.affectui.com/r/guardrail-funnel.json` (needs the Pro access key)
- Install, clean style: `npx shadcn@latest add https://www.affectui.com/r/guardrail-funnel-clean.json` (needs the Pro access key) – lands as `guardrail-funnel-clean.tsx`, import from `@/components/ui/guardrail-funnel-clean` – its docs: `guardrail-funnel-clean.md`
- Import: `@/components/ui/guardrail-funnel`

### When to use

- Showing the deterministic checks an agent's traffic passes – input, PII, tool calls, output – and what each one stops
- A trust page or admin view for a customer-facing agent: how much was redacted, denied or rejected, with real examples
- Watching guardrails live while an agent is under load or being probed

### When not to use

- Asking a person to approve one action – use Approval Card or Permission Request
- Which tools an agent may use at all – use Tool Access Map
- How much an agent may do on its own – use Autonomy Dial

### Usage

```tsx
import { GuardrailFunnel, type GuardrailStage } from "@/components/ui/guardrail-funnel";

const stages: GuardrailStage[] = [
  { id: "requests", label: "Requests", passed: 18240 },
  { id: "input", label: "Input check", hint: "Prompt injection, jailbreak", passed: 16636, blocked: 1604 },
  { id: "pii", label: "PII redacted", passed: 16636, changed: 2931 },
  { id: "tool", label: "Tool call allowed", passed: 15724, blocked: 912, verb: "denied" },
  { id: "output", label: "Output check", passed: 15236, blocked: 488, verb: "rejected" },
  { id: "delivered", label: "Delivered", passed: 15236 },
];

export function Guardrails() {
  return <GuardrailFunnel stages={stages} agent="Support agent" ranges={["1h", "24h", "7d"]} range="24h" live />;
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| stages | `GuardrailStage[]` |  | The stages in order, the first what came in, the last what got out – { id, label, hint?, passed, blocked?, changed?, verb?, changedVerb?, tone?, icon?, examples?, parts? }. A stage's band is as wide as passed + blocked: blocked shows at its ends in the stage's color, changed as a band in the middle. icon – requests, input, pii, tool, output or delivered – is the small glyph before its name (default by position). examples – { id, text, match?, replace?, rule?, at?, code?, logo?, action?, resolved? } – up to three cards of what it caught. parts – { id, label, value, note? } – up to three rows of what it is made of, shown when it has no examples, e.g. where requests came from or how answers got through |
| title | `string` |  | The name in the bar – default Guardrails |
| agent | `string` |  | A tag beside the title with the agent's pixel mark |
| ranges | `string[]` |  | Time ranges to switch between, e.g. ["1h", "24h", "7d"] – the switch shows with two or more |
| range | `string` |  | The picked range |
| onRangeChange | `(range: string) => void` |  | Called when a range is picked |
| live | `boolean` |  | A live dot in the bar; the agent's mark twinkles |
| defaultStage | `string` |  | The stage whose catches show first – default the first that caught something |
| onStageChange | `(id: string) => void` |  | Called when a stage is picked by click or Enter |
| onAction | `(stageId: string, exampleId: string) => void` |  | Called when someone uses a card's button – Allow once, Override; set resolved on the example afterwards |
| className | `string` |  | Extra class on the root – set the color variables on it, e.g. --ui-gdf-t-pink |

### Keyboard

- Tab: The range switch, then one stop for the stages, then the cards' Allow once and Override buttons
- ← / →: The range before or after
- ↑ / ↓: The stage before or after – the panel shows what it caught
- Home / End: The first or the last stage
- Enter / Space: Picks the stage, so its catches stay when you move on
- Esc: Back to the picked stage's catches

### Accessibility

- The stages are a listbox – each reads its name, what it checks, how many got through, how many it stopped or changed and the share of all requests
- The funnel is decoration (aria-hidden) – each stage's label reads the same numbers, the share it stopped included
- The panel is a polite live region, labelled by the stage it shows
- A redacted value shows only masked – the original text is never in the page
- The range switch is a radio group; focus rings show for the keyboard only (:focus-visible)
- A shortened stage name, card title or button label keeps its full text as a tooltip

### Motion

- The bands grow in from the middle, one after another, and ease to new widths as the numbers change; the counts ease too
- One quiet motion: a slow sheen runs across the bands, one after another, down the funnel
- With prefers-reduced-motion nothing moves – the bands and numbers are simply there

### Responsive

- Rows and cards keep their height whatever the data – three card slots, so switching stages never moves the layout; names, snippets and hints shorten with an ellipsis
- A long button label takes at most about two fifths of its card, so the snippet stays readable
- Narrow: a slimmer funnel; the agent tag keeps its mark, live its dot; the hint, the times and the parts' notes go
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- passed of one stage is usually what reaches the next – the taper joins them, so keep them consistent
- Put only masked values in replace – the component shows replace instead of match, but text is still yours to keep clean
- Give verbs that fit: denied for tool calls, rejected for answers, redacted for PII
- Keep it quiet: a logo only where it says something – the tool a blocked call wanted
- parts should add up to the stage's passed – each bar is its share of it

### Requirements

- React 19

Related: tool-access-map, permission-request, approval-gates, autonomy-dial
