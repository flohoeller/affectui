# Token Flow, clean style (Pro)

Where an agent's tokens and cost go, as a Sankey diagram of cards – system prompt, tool results and memory flow into the models and on into answered, retried or cancelled

- Page: https://www.affectui.com/components/token-flow
- Section: Components · Agents
- Install: `npx shadcn@latest add https://www.affectui.com/r/token-flow-clean.json` (needs the Pro access key)
- Import: `@/components/ui/token-flow-clean`

### When to use

- Showing where an agent run's tokens and money went – from what filled the prompt, through each model, to what came of it
- Making waste visible: how much went into retries and cancelled calls, and which sources and models fed them
- A cost panel next to a run's trace, or a report after a run

### When not to use

- How the cost adds up step by step in order – use Cost Waterfall
- What fills one context window right now – use Context Window or Context Compaction
- Usage per model over days or weeks – use Model Usage

### Usage

```tsx
import { TokenFlow, type TokenLink } from "@/components/ui/token-flow-clean";

const links: TokenLink[] = [
  { from: "system", to: "sonnet", tokens: 9000 },
  { from: "tools", to: "sonnet", tokens: 104000 },
  { from: "sonnet", to: "done", tokens: 98000 },
  { from: "sonnet", to: "retry", tokens: 15000 },
];

export function RunCost() {
  return (
    <TokenFlow
      title="Answer a refund question"
      sources={[
        { id: "system", label: "System prompt", kind: "system" },
        { id: "tools", label: "Tool results", kind: "tool", apps: [{ name: "GitHub", path: githubPath }], total: 6 },
      ]}
      models={[{ id: "sonnet", label: "Claude Sonnet 5.5", logo: <ClaudeLogo />, price: 6 }]}
      outcomes={[
        { id: "done", label: "Answer delivered", tone: "delivered" },
        { id: "retry", label: "Retried", tone: "retried" },
      ]}
      links={links}
      previous={{ tokens: 140000, cost: 0.81 }}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| sources | `TokenSource[]` |  | The left column – { id, label, kind?, color?, avatar?, apps?, total?, file? }. kind is system, user, agent, tool, file or memory and picks the icon and the color; avatar is a photo for you; apps – { name, path?, icon?, color?, tile? } – show as up to three overlapping logo tiles and +N for the rest of total; file is the extension printed on the page |
| models | `TokenModel[]` |  | The middle column – { id, label, logo?, price?, color? }. logo is any node on a small white tile (without it the first letter); price is a blended $ per million tokens, shown as $ / 1K in its details; color makes the bands shade into it – without one the model is a quiet hub and its bands soften toward it |
| outcomes | `TokenOutcome[]` |  | The right column – { id, label, tone?, color? }. tone is delivered (green check), retried (orange arrows) or wasted (red cross) |
| links | `TokenLink[]` |  | The bands – { from, to, tokens, cost? }, from a source to a model or from a model to an outcome. Others are left out, the same pair twice is added up |
| previous | `{ tokens?, cost? }` |  | The last run's totals – once the run is done the head shows a badge, e.g. −12% vs last run, green when it's less, red when it's more |
| unit | `"tokens" \| "cost"` |  | What the bands' widths and the big number show – controlled; leave it out and the switch keeps its own |
| defaultUnit | `"tokens" \| "cost"` |  | Where the switch starts – default tokens |
| onUnitChange | `(unit) => void` |  | Called when the switch moves |
| streaming | `boolean` |  | The run is still going – the wave sweeps across the bands faster and the pixel marks twinkle |
| title | `string` |  | The name in the head – default Token flow |
| height | `number` |  | The diagram's height in px – default 400; it grows when a column has more cards than fit (from eight on, cards go to one line) |
| className | `string` |  | Extra class on the root – set the color variables on it, e.g. --ui-tflc-k-tool |

### Keyboard

- Tab: The switch, then every card, column by column
- ↑ / ↓: The card above or below in its column – its path comes forward
- ← / →: The nearest card in the column before or after
- Home / End: The first source or the last outcome
- Enter / Space: Opens the card's details – a model's price per 1K, what came in and went out; again closes them
- Esc: Closes the details and lets go of what is lit, from anywhere
- ← / →: Tokens or $, on the switch

### Accessibility

- Every card is a button that reads its name, tokens, cost, share and where it goes – "Tool results, 182K tokens, $0.87, 54% of all – to Claude Sonnet 5.5 104K, GPT-5.5 46K, Gemini 3 Flash 32K"; a model also its price per 1K
- The details open as a labelled dialog next to the card; Esc or a click outside closes them
- The switch is a radio group – Tokens or Cost in dollars
- The bands, the wave and the tag are drawn for the eye only; the buttons carry the same numbers
- Focus rings show for the keyboard only (:focus-visible)

### Motion

- A soft wave of fill sweeps across all the bands at once, left to right – it fades in, swells and fades out, like water moving through the diagram; faster while the run streams
- The bands grow toward new numbers and the numbers on the cards roll with them – smoothed by the clock, so it looks the same at any frame rate; new flows grow in from nothing
- Switching between tokens and $ eases every band to its new width
- Pointing at a card brings its path forward and fades the rest; the details open with a short lift
- With prefers-reduced-motion nothing moves – no wave, the numbers simply change

### Responsive

- Fills its container; narrower than 600px it turns compact – sources and outcomes show their icon and number, models their logo, name and tokens – so all three columns fit a phone; a tap or Enter shows the rest
- A column with more than seven cards shows them on one line each, and the diagram grows taller instead of crowding them
- Long names end in …; the whole name is in the tooltip, the details and the button's label
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- Keep ids stable while streaming – the bands grow from where they were
- A model's outgoing bands should add up to its incoming ones; when they don't, it is as tall as the larger side
- Bands run only between neighbouring columns – a source never links straight to an outcome
- Logos: pass Simple Icons paths or your own multi-color SVGs; they sit on white tiles in both themes

### Requirements

- React 19

Related: cost-waterfall, model-usage, context-window, trace-waterfall
