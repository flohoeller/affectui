# Tab Overload (Free)

Overlapping browser windows where the highlight follows the hovered tab

- Page: https://www.affectui.com/illustrations/tab-overload
- Section: Illustrations · Card illustrations
- Install: `npx shadcn@latest add https://www.affectui.com/r/tab-overload.json`
- Import: `@/components/ui/tab-overload`

### When to use

- A problem card about context switching, research in too many tabs or manual busywork
- Bento grids and feature cards that need a small illustration above the text

### When not to use

- Showing real browser content – the windows only contain placeholder blocks
- Places where the right and bottom edge must stay sharp – the scene fades out there by design

### Usage

```tsx
import { TabOverload } from "@/components/ui/tab-overload";

export function FeatureCard() {
  return (
    <article style={{ maxWidth: 360 }}>
      <TabOverload />
      <h3>Card title</h3>
      <p>Short description of the problem or step.</p>
    </article>
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| label | `string` | `"Three overlapping browser windows…"` | Accessible description of the illustration |
| className | `string` |  | Extra class on the root, e.g. for width or margins |

### Accessibility

- Exposed as one image with a descriptive label; the windows inside are hidden from screen readers
- The hover highlight is purely decorative, nothing needs to be reached with the keyboard

### Motion

- The placeholder blocks shimmer softly
- The front window is highlighted with colored dots, an outline and a glow; hover a window behind it and the highlight moves over
- With prefers-reduced-motion the shimmer stops and the highlight switches instantly

### Responsive

- Transparent background; the whole scene fades out towards the right and bottom edge with a CSS mask, so it blends into any surface
- Keeps a 3 : 2 aspect ratio and scales to the width of its container – set a width or max-width via className
- The hover swap uses the CSS :has() selector; in browsers without it the front window simply stays highlighted
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19
