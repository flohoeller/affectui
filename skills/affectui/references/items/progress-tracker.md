# Progress Tracker (Free)

Onboarding checklist with an animated progress bar, ticks that draw themselves and auto play

- Page: https://www.affectui.com/components/progress-tracker
- Section: Components · Feedback
- Install, classic style: `npx shadcn@latest add https://www.affectui.com/r/progress-tracker.json`
- Install, clean style: `npx shadcn@latest add https://www.affectui.com/r/progress-tracker-clean.json` – lands as `progress-tracker-clean.tsx`, import from `@/components/ui/progress-tracker-clean` – its docs: `progress-tracker-clean.md`
- Import: `@/components/ui/progress-tracker`

### When to use

- Onboarding checklists that guide new users through their first steps
- Any short list of tasks where progress should feel rewarding

### When not to use

- Long task lists – past roughly eight steps the card gets hard to scan
- Long step labels – each step stays on one line and cuts off with an ellipsis
- Steps that must happen in a fixed order – use a stepper that locks the next step

### Usage

```tsx
import { ProgressTracker } from "@/components/ui/progress-tracker";

const steps = [
  { id: "tools", label: "Connect your imported tools" },
  { id: "notify", label: "Turn on notifications" },
  { id: "project", label: "Create a project", done: true },
];

export function Onboarding() {
  return <ProgressTracker title="Getting started" steps={steps} onChange={save} />;
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| steps | `ProgressStep[]` |  | Each step has an id, a label, an optional done flag and icon |
| title | `string` | `"Getting started"` | Heading above the bar |
| autoPlay | `boolean` | `false` | Ticks the open steps one by one and starts over – stops when someone clicks or types |
| interval | `number` | `2200` | Pause between two automatic steps, in ms |
| onChange | `(steps: ProgressStep[]) => void` |  | Called with every step and its state |
| className | `string` |  | Extra class on the card |

### Keyboard

- Tab: Move between the steps
- Space / Enter: Tick or untick the focused step

### Accessibility

- Each step is a checkbox with aria-checked; the bar is a progressbar with the count as text
- Any click or key press stops the automatic play, so it never fights the user

### Motion

- The bar fills smoothly and a light sweeps across it each time a step is done
- The check ring fills and pops, then the tick draws itself
- A line strikes through the label, line by line, while it fades to gray
- On mount the card settles in and the rows fade up one after another
- Steps stay in place so nothing jumps; the counter rolls to the new number
- With prefers-reduced-motion every change is instant

### Responsive

- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19

Related: button, chat-composer
