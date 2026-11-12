# Logo Cluster (Free)

Your mark on a white disc in the middle – company logos bounce out of it and settle around it

- Page: https://www.affectui.com/illustrations/logo-cluster
- Section: Illustrations · Card illustrations
- Install: `npx shadcn@latest add https://www.affectui.com/r/logo-cluster.json`
- Import: `@/components/ui/logo-cluster`

### When to use

- Integration or ecosystem sections – "works with the tools you already use"
- Feature cards that need a lively, friendly picture around your own brand

### When not to use

- Listing your real integrations – the logos are examples
- Places where people need to read or click the logos

### Usage

```tsx
import { LogoCluster } from "@/components/ui/logo-cluster";

export function IntegrationsCard() {
  return (
    <article style={{ maxWidth: 360 }}>
      <LogoCluster />
      <h3>Connects with everything</h3>
    </article>
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| label | `string` | `"The affectUI mark surrounded by…"` | Accessible description of the illustration |
| className | `string` |  | Extra class on the root, e.g. for width |

### Accessibility

- Exposed as one image with a descriptive label; the bubbles are hidden from screen readers

### Motion

- When the cluster comes into view the middle circle appears, then the logos quickly bounce out of it one after another
- Once they land, the ring turns slowly clockwise while every logo stays upright – paused while off screen
- Hovering a bubble grows it slightly with a springy ease and a softer shadow
- With prefers-reduced-motion everything is in place right away

### Responsive

- Square, scales with the width of its container (max 420px) – every size is in container units
- Light and dark mode via a .dark class or data-theme="dark"

### Notes for AI

- Swap the mark in the middle for your own logo: replace the MARK path and its viewBox
- Company logos belong to their owners – check you may show them before you ship

### Requirements

- React 19

Related: integration-grid, model-wheel
