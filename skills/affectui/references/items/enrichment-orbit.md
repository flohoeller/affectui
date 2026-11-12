# Enrichment Orbit (Free)

Grok tile inside two rings with comets and data nodes orbiting around it

- Page: https://www.affectui.com/illustrations/enrichment-orbit
- Section: Illustrations · Card illustrations
- Install: `npx shadcn@latest add https://www.affectui.com/r/enrichment-orbit.json`
- Import: `@/components/ui/enrichment-orbit`

### When to use

- A step or feature card about enriching, scoring or syncing data around a central record
- Bento grids that need a calm, continuously moving illustration

### When not to use

- Places where constant motion would distract from nearby content

### Usage

```tsx
import { EnrichmentOrbit } from "@/components/ui/enrichment-orbit";

export function FeatureCard() {
  return (
    <article style={{ maxWidth: 360 }}>
      <EnrichmentOrbit />
      <h3>Card title</h3>
      <p>Short description of the problem or step.</p>
    </article>
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| label | `string` | `"A Grok tile with data nodes orbiting…"` | Accessible description of the illustration |
| className | `string` |  | Extra class on the root, e.g. for width or margins |

### Accessibility

- Exposed as one image with a descriptive label; the rings and nodes inside are hidden from screen readers

### Motion

- Two colored comets run around the inner and outer ring in opposite directions (one turn every 7 s)
- Three data nodes orbit the outer ring 120° apart (one orbit every 22 s) and stay upright while they travel
- With prefers-reduced-motion everything is paused, the nodes keep their staggered spots on the ring

### Responsive

- Transparent background, so it sits on any light or dark surface
- Keeps a 3 : 2 aspect ratio and scales to the width of its container – set a width or max-width via className
- Drawn on a 320 × 240 viewBox, so rings and nodes scale crisply at any size
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19
