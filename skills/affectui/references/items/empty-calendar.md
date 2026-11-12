# Empty Calendar (Free)

Stack of calendar cards marked empty, fanning out on hover

- Page: https://www.affectui.com/illustrations/empty-calendar
- Section: Illustrations · Card illustrations
- Install: `npx shadcn@latest add https://www.affectui.com/r/empty-calendar.json`
- Import: `@/components/ui/empty-calendar`

### When to use

- A problem or pain-point card about an empty pipeline or no booked meetings
- Bento grids and feature cards that need a small, friendly illustration above the text

### When not to use

- Showing a real calendar – the cards are decorative and contain placeholder lines only

### Usage

```tsx
import { EmptyCalendar } from "@/components/ui/empty-calendar";

export function FeatureCard() {
  return (
    <article style={{ maxWidth: 360 }}>
      <EmptyCalendar />
      <h3>Card title</h3>
      <p>Short description of the problem or step.</p>
    </article>
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| label | `string` | `"Stacked calendar cards marked empty…"` | Accessible description of the illustration |
| className | `string` |  | Extra class on the root, e.g. for width or margins |

### Accessibility

- Exposed as one image with a descriptive label; the cards and texts inside are hidden from screen readers
- Hover effects are purely decorative, nothing needs to be reached with the keyboard

### Motion

- The placeholder lines shimmer softly and the colored glow under the front card breathes
- Hover the front card to lift and tilt it; hover a back card to slide it further out
- With prefers-reduced-motion the shimmer and glow stop and hover changes happen instantly

### Responsive

- Transparent background, so it sits on any light or dark surface
- Keeps a 3 : 2 aspect ratio and scales to the width of its container – set a width or max-width via className
- Drawn on a 320 × 240 viewBox, so text and cards scale crisply at any size
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19
