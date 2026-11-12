# Thinking State, clean style (Pro)

AI working panel with a live timer, searched sources and thinking steps that appear one by one

- Page: https://www.affectui.com/components/thinking-state
- Section: Components · Chat
- Install: `npx shadcn@latest add https://www.affectui.com/r/thinking-state-clean.json` (needs the Pro access key)
- Import: `@/components/ui/thinking-state-clean`

### When to use

- Showing what an AI assistant is doing while it works: searching, reading, drafting
- Long-running tasks where a visible trail of steps builds trust and keeps people waiting patiently

### When not to use

- Short waits under a second – a simple spinner or shimmer is enough
- Exact progress you can measure – use a progress bar with a percentage

### Usage

```tsx
import { ThinkingState } from "@/components/ui/thinking-state-clean";

const steps = [
  { kind: "search", label: "Searched", sources: [{ label: "acme.com" }, { label: "+4 more" }] },
  { kind: "step", label: "Reading the sources" },
  { kind: "step", label: "Drafting your answer" },
];

export function AssistantMessage() {
  return <ThinkingState steps={steps} onDone={(seconds) => console.log(seconds)} />;
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| steps | `ThinkingStep[]` |  | Searches and thinking steps, revealed in order. Sources can link out (href) and show a tooltip; moreSources hide behind a “+N more” chip |
| doneLabel | `string` | `"Finished thinking"` | Label of the final row |
| stepMs | `number` | `1300` | Pause between two steps, in ms |
| loop | `boolean` | `false` | Starts over a few seconds after finishing |
| collapseOnDone | `boolean` | `false` | Folds the steps away by themselves once it's finished – the header stays |
| onDone | `(seconds: number) => void` |  | Called once all steps are done |
| className | `string` |  | Extra class on the root |

### Keyboard

- Enter / Space: Collapse or expand the steps (on the header), or show more sources
- Tab: Move through the source links – each shows its tooltip on focus

### Accessibility

- The header row is a button with aria-expanded, so the steps can be collapsed – only the steps fold away, the header always stays in view
- New steps are announced politely through an aria-live list

### Motion

- The header row shimmers with a live timer while a 3×3 pixel mark twinkles, then turns into “Worked for …”
- Steps fade up one after another and the timeline grows down to each new node
- Sources pop in one by one as small white chips; the active step gets a pulsing blue pixel and a shimmer
- Hovering a source shows its link in a small white tooltip; “+N more” reveals the remaining sources
- Hovering the header lightens its words and shows the chevron right after them – no fill
- At the end a blue check pops in and draws its tick
- With prefers-reduced-motion everything appears without animation

### Responsive

- No card – it sits straight on the page and works from about 300px wide; tighter padding on narrow containers and taller tap targets on touch screens
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19

Related: chat-composer, progress-tracker
