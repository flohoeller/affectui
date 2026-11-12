# Grid Background (Free)

A fine line grid that drifts slowly behind your content and fades out towards the edges

- Page: https://www.affectui.com/motion/grid-background
- Section: Motion · Backgrounds
- Install: `npx shadcn@latest add https://www.affectui.com/r/grid-background.json`
- Import: `@/components/ui/grid-background`

### When to use

- Hero sections and feature headers that need a quiet, technical backdrop
- Empty states or panels that feel too flat on a plain background

### When not to use

- Behind dense text or data tables – the lines compete with the content
- Several moving backgrounds on one screen – keep it to one per view

### Usage

```tsx
import { GridBackground } from "@/components/ui/grid-background";

export function Hero() {
  return (
    <GridBackground size={48} direction="diagonal">
      <section style={{ display: "grid", placeItems: "center", minHeight: 480 }}>
        <h1>Build on a steady grid</h1>
      </section>
    </GridBackground>
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| children | `ReactNode` |  | Content rendered above the grid |
| size | `number` | `48` | Cell size in px |
| color | `string` | `rgba(0,0,0,.07)` | Line color; dark mode defaults to rgba(255,255,255,.07) |
| speed | `number` | `3` | Seconds per cell; 0 keeps the grid still |
| direction | `"up" \| "down" \| "left" \| "right" \| "diagonal"` | `"diagonal"` | Drift direction; diagonal runs from top right to bottom left |
| reveal | `boolean` | `true` | Uncover the grid with a circle growing from the center when it first comes into view |
| fade | `number` | `70` | Radius of the edge fade, in % of the distance to the corners |
| className | `string` |  | Extra class on the container – give it a height or let the content size it |

### Accessibility

- The grid layer is decorative: aria-hidden and pointer-events: none
- Content sits in its own layer above the grid and stays fully interactive

### Motion

- The lines move by exactly one cell per loop, so the drift is seamless; only transform is animated
- The reveal grows a circular mask from the center once, when the grid is 20% in view
- Reduced motion: the grid stays still and appears without the reveal

### Responsive

- Fills its container at any size; the fade follows the container's shape
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19
