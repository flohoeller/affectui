# Progress Pill (Pro)

An agent building a report as a slim pill – its pixel mark, the title and how far it is, the step it's on as a subtitle, a thin bar with a shimmer, a soft color glow beneath

- Page: https://www.affectui.com/illustrations/progress-pill
- Section: Illustrations · Product scenes
- Install: `npx shadcn@latest add https://www.affectui.com/r/progress-pill.json` (needs the Pro access key)
- Import: `@/components/ui/progress-pill`

### When to use

- Hero or feature section of an AI product that does long work for people – reports, research, builds – to show it's happening
- Beside a headline or at the edge of a card – the pill runs out into the page on the right, so it can sit against an edge
- Launch posts and OG images – a still frame with playing={false} reads well small

### When not to use

- As a real progress indicator – it's a picture of one and makes up its own progress. Use Progress Tracker or Thinking Loader for that
- In tight spaces – it needs about 420 × 180px, and its fade wants room on the right

### Usage

```tsx
import { ProgressPill } from "@/components/ui/progress-pill";

export function Hero() {
  return (
    <section className="relative">
      <h1>Reports that write themselves</h1>
      <ProgressPill className="absolute right-0 top-24" />
    </section>
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| title | `string` | `"Q3 revenue report"` | What the agent is making – the card's title |
| name | `string` | `"Analyst"` | The agent's name, shown before the step it's on |
| steps | `string[]` |  | The steps the agent goes through, one after another as the subtitle – the bar fills one part per step, then it shows "Report ready" for a moment and starts over |
| agent | `string` | `"analyst"` | The agent's id – its 3×3 pixel pattern comes from it |
| playing | `boolean` | `true` | Goes from step to step and starts over – false holds it on step |
| step | `number` | `1` | The step it shows when not playing |
| hold | `number` | `2600` | How long it stays on a step, in ms |
| className | `string` |  | Extra class on the root |

### Accessibility

- Decorative: the whole illustration is hidden from screen readers and takes no clicks
- With prefers-reduced-motion nothing moves: it stays on one step, without shimmer, sheen or twinkle

### Motion

- Each step comes in as the subtitle from below with a slight blur, then a soft shimmer runs across it; the percentage follows
- The thin bar grows as the step runs, and a shimmer keeps running over the whole bar – over the fill and the empty track alike
- The agent's pixel mark twinkles while it works, and a blurred glow of blue, purple and pink drifts slowly under the pill

### Responsive

- Fixed size, about 420 × 180px with its shadow and glow – scale it with zoom or a transform for smaller screens
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- The agent is drawn with affectUI's pixel mark, never a sparkles or bot glyph – pass another id for another pattern
- Colors are variables on .ui-ppl – --ui-ppl-fill for the bar, --ui-ppl-blue / -purple / -pink for the glow

### Requirements

- React 19

Related: model-menu, inspect-agent-card, thinking-loader, progress-tracker
