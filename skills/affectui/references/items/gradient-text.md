# Gradient Text (Pro)

Letters cut from a liquid, ever-flowing gradient – the color sweeps across the word the first time it's seen

- Page: https://www.affectui.com/motion/gradient-text
- Section: Motion · Text
- Install: `npx shadcn@latest add https://www.affectui.com/r/gradient-text.json` (needs the Pro access key)
- Import: `@/components/ui/gradient-text`

### When to use

- One word or a short phrase in a hero headline that should carry the brand
- A highlight inside a heading, like a product name or the payoff of a sentence

### When not to use

- Body copy or long passages – a moving gradient makes them harder to read
- Several highlights on one screen – the effect works because it's rare

### Usage

```tsx
import { GradientText } from "@/components/ui/gradient-text";

export function Hero() {
  return (
    <h1>
      Interfaces people actually <GradientText>feel.</GradientText>
    </h1>
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| children | `ReactNode` |  | The text to fill with the gradient |
| colors | `string[]` | `["#dd0674", "#5e3ee0", "#ff5fae", "#7c5cff"]` | Gradient start, end and up to two blob colors; replaces the dark-mode colors too |
| speed | `number` | `8` | Seconds per flow cycle |
| sweep | `boolean` | `true` | Sweep the color in from left to right when the text scrolls into view |
| as | `"span" \| "h1" \| "h2" \| "p"` | `"span"` | Element to render |
| className | `string` |  | Extra class on the root |

### Accessibility

- The text stays real, selectable text – the gradient copy on top is aria-hidden
- Pick colors with enough contrast against your background; the defaults are tuned for white and near-black

### Motion

- Soft color blobs drift across a two-color base in a slow loop; the sweep wipes the color in once, the first time the text is 60% visible
- Reduced motion shows the finished gradient, standing still

### Responsive

- Font, size and weight come from the parent, so it scales with your headline
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19

Related: text-reveal
