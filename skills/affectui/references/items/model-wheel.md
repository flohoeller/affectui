# Model Wheel (Free)

AI model names on a turning drum – the rows bend away at the edges and each model lands on a soft gray fill

- Page: https://www.affectui.com/illustrations/model-wheel
- Section: Illustrations · Card illustrations
- Install: `npx shadcn@latest add https://www.affectui.com/r/model-wheel.json`
- Import: `@/components/ui/model-wheel`

### When to use

- Feature cards about model choice, routing or "bring your own model"
- Landing pages that list supported AI providers in a calm, moving way

### When not to use

- A real model picker – the wheel can be spun, but it doesn't report a choice
- Long lists – the drum shows about seven rows at a time

### Usage

```tsx
import { ModelWheel } from "@/components/ui/model-wheel";

export function FeatureCard() {
  return (
    <article style={{ maxWidth: 360 }}>
      <ModelWheel />
      <h3>Every model, one workspace</h3>
    </article>
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| models | `{ name, viewBox, color, d }[]` | `8 popular models` | Models on the wheel, each with its brand mark as one SVG path; use at least 7 to keep the drum full |
| hold | `number` | `1500` | Milliseconds a model stays in the middle |
| label | `string` | `"AI models on a turning wheel…"` | Accessible description of the illustration |
| className | `string` |  | Extra class on the root |

### Accessibility

- Exposed as one image with a descriptive label; the rows are hidden from screen readers
- Hovering holds the wheel, so nothing moves while someone reads it
- Spinning by hand also works with touch; the automatic turn starts again after a short pause

### Motion

- The rows sit on a cylinder: towards the top and bottom they tilt away, shrink and fade
- Every turn runs on a soft spring: the drum gathers speed, overshoots a touch and locks onto the next model like a magnet
- Grab the wheel and drag it up or down to spin it; a quick flick keeps it turning, then it snaps onto the closest model
- The wheel turns downwards; the model in the middle sits on a gray fill that grows or shrinks to its name
- Runs only while on screen; with prefers-reduced-motion it doesn't turn by itself; spun by hand it follows the finger and lands on the closest model without swinging

### Responsive

- Fixed height of seven rows; the width follows its container
- Light and dark mode via a .dark class or data-theme="dark"

### Notes for AI

- Brand marks belong to their owners – check you may show them before you ship

### Requirements

- React 19

Related: glow-keyboard, chat-composer
