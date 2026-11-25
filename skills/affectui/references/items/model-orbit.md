# Model Orbit (Free)

AI model makers evenly around a slanted track – app tiles leaning back with it, blue beams arcing to a hub with the agent's pixel mark and sparks running along them; point at a logo for its name, drag to turn it

- Page: https://www.affectui.com/illustrations/model-orbit
- Section: Illustrations · Card illustrations
- Install: `npx shadcn@latest add https://www.affectui.com/r/model-orbit.json`
- Import: `@/components/ui/model-orbit`

### When to use

- A hero or feature section about supporting many AI models or providers – one gateway, every model
- Wide cards and landing sections that need a calm illustration with a little life

### When not to use

- Small cards – it is wide (16 : 9) and its details need room

### Usage

```tsx
import { ModelOrbit } from "@/components/ui/model-orbit";

export function Providers() {
  return (
    <section style={{ maxWidth: 960 }}>
      <ModelOrbit />
    </section>
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| models | `{ name, logo }[]` | `ChatGPT, Claude, Gemini, Mistral, Llama, DeepSeek, Qwen, Grok` | Up to twelve makers, spaced evenly around the rim, the first one nearest; a logo is drawn in a 24 × 24 box |
| labels | `boolean` | `true` | The small numbers next to the chips |
| draggable | `boolean` | `true` | Drag sideways – or use the arrow keys – to turn the ring; it glides to a stop when let go |
| label | `string` | `"AI model makers around a ring…"` | Accessible description of the illustration |
| className | `string` |  | Extra class on the root, e.g. for width or margins |

### Keyboard

- Tab: Focus the illustration
- ← / →: Turn the ring by half a step

### Accessibility

- Exposed as one image with a descriptive label that says it can be turned; track, tiles and beams inside are hidden from screen readers

### Motion

- Short blue sparks run along random beams to the hub, fading from the head to the tail
- Dragging turns the ring and it glides to a stop – with prefers-reduced-motion it stops right away and the sparks stay off
- Pointing at a logo fades a small dark tip with its name in above it

### Responsive

- Transparent background, so it sits on any light or dark surface
- Keeps a 16 : 9 aspect ratio and scales to the width of its container – drawn on a 960 × 540 viewBox, so it stays crisp
- The far side of the ring is smaller and paler, so it reads as a slanted disc at any size
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19
