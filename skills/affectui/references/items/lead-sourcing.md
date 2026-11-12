# Lead Sourcing (Free)

ChatGPT tile linked to Gmail and Grok, with a shine running along the connection

- Page: https://www.affectui.com/illustrations/lead-sourcing
- Section: Illustrations · Card illustrations
- Install: `npx shadcn@latest add https://www.affectui.com/r/lead-sourcing.json`
- Import: `@/components/ui/lead-sourcing`

### When to use

- A step or feature card about collecting leads or data from several sources
- Integration sections that show your product connecting a few well-known apps

### When not to use

- Communicating real integrations you don't offer – swap the logos for your own sources

### Usage

```tsx
import { LeadSourcing } from "@/components/ui/lead-sourcing";

export function FeatureCard() {
  return (
    <article style={{ maxWidth: 360 }}>
      <LeadSourcing />
      <h3>Card title</h3>
      <p>Short description of the problem or step.</p>
    </article>
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| label | `string` | `"A ChatGPT tile connected to Gmail and Grok…"` | Accessible description of the illustration |
| className | `string` |  | Extra class on the root, e.g. for width or margins |

### Accessibility

- Exposed as one image with a descriptive label; the logos and tiles inside are hidden from screen readers

### Motion

- A colored shine sweeps along the connecting line from left to right, then the line rests for a few seconds before the next pass
- With prefers-reduced-motion the line stays gray and still

### Responsive

- Transparent background, so it sits on any light or dark surface
- Keeps a 3 : 2 aspect ratio and scales to the width of its container – set a width or max-width via className
- Drawn on a 320 × 240 viewBox, so logos and tiles scale crisply at any size
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19
