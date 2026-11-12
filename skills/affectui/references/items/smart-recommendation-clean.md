# Smart Recommendation, clean style (Free)

Suggestion card with a confidence signal, alternatives to switch to and accept with undo

- Page: https://www.affectui.com/components/smart-recommendation
- Section: Components · Cards
- Install: `npx shadcn@latest add https://www.affectui.com/r/smart-recommendation-clean.json`
- Import: `@/components/ui/smart-recommendation-clean`

### When to use

- Suggesting the next step an app or assistant thinks is best – with a way out
- Settings people rarely change but should get a nudge on, like sync modes or plans

### When not to use

- Choices without a clear favorite – show them side by side instead

### Usage

```tsx
import { SmartRecommendation } from "@/components/ui/smart-recommendation-clean";

const options = [
  { id: "incremental", label: "Incremental sync", reason: "Only 4% of rows changed.", signal: 3 },
  { id: "full", label: "Full refresh", reason: "Rebuilds every table.", signal: 1 },
];

export function Sync() {
  return <SmartRecommendation options={options} onAccept={(o) => api.setMode(o.id)} />;
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| options | `Recommendation[]` |  | The first is recommended, the rest are alternatives – id, label, reason and signal (0–3) |
| onAccept | `(option) => void` |  | Called when an option is accepted |
| onUndo | `(option) => void` |  | Called when an accept is undone |
| defaultOpen | `boolean` | `true` | Starts with the reason visible |
| title | `string` | `"Smart recommendation"` | Heading of the card |

### Keyboard

- Enter / Space: Fold the card, open alternatives or accept
- Escape: Close the alternatives

### Accessibility

- The heading is a button with aria-expanded; alternatives are a menu of radio items
- The signal is written out in words next to the bars

### Motion

- The reason swaps softly when an alternative is picked; reduced motion turns this off

### Responsive

- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19

Related: decision-inbox, comment-thread
