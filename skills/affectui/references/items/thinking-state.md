# Thinking State (Pro)

AI working panel with a live timer, searched sources and thinking steps that appear one by one

- Page: https://www.affectui.com/components/thinking-state
- Section: Components · Chat
- Install, classic style: `npx shadcn@latest add https://www.affectui.com/r/thinking-state.json` (needs the Pro access key)
- Install, clean style: `npx shadcn@latest add https://www.affectui.com/r/thinking-state-clean.json` (needs the Pro access key) – lands as `thinking-state-clean.tsx`, import from `@/components/ui/thinking-state-clean` – its docs: `thinking-state-clean.md`
- Import: `@/components/ui/thinking-state`

### When to use

- Showing what an AI assistant is doing while it works: searching, reading, drafting
- Long-running tasks where a visible trail of steps builds trust and keeps people waiting patiently

### When not to use

- Short waits under a second – a simple spinner or shimmer is enough
- Exact progress you can measure – use a progress bar with a percentage

### Usage

```tsx
import { ThinkingState } from "@/components/ui/thinking-state";

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
| onDone | `(seconds: number) => void` |  | Called once all steps are done |
| className | `string` |  | Extra class on the root |

### Keyboard

- Enter / Space: Collapse or expand the steps (on the header), or show more sources
- Tab: Move through the source links – each shows its tooltip on focus

### Accessibility

- The header is a button with aria-expanded, so the steps can be collapsed
- New steps are announced politely through an aria-live list

### Motion

- The header shimmers with a live timer while thinking, then turns into “Worked for …”
- Steps fade up one after another and the timeline grows down to each new node
- Sources pop in one by one; the active step pulses and shimmers
- Hovering a source shows its link as a tooltip; “+N more” reveals the remaining sources
- At the end a blue check pops in and draws its tick
- With prefers-reduced-motion everything appears without animation

### Responsive

- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19

Related: chat-composer, progress-tracker
