# Outreach Branches (Pro)

Lines branching out to Gmail, Slack and Notion with colored pulses flowing down

- Page: https://www.affectui.com/illustrations/outreach-branches
- Section: Illustrations · Card illustrations
- Install: `npx shadcn@latest add https://www.affectui.com/r/outreach-branches.json` (needs the Pro access key)
- Import: `@/components/ui/outreach-branches`

### When to use

- A step or feature card about sending messages across several channels
- Integration sections that show one action fanning out to a few apps

### When not to use

- Communicating real integrations you don't offer – swap the logos for your own channels

### Usage

```tsx
import { OutreachBranches } from "@/components/ui/outreach-branches";

export function FeatureCard() {
  return (
    <article style={{ maxWidth: 360 }}>
      <OutreachBranches />
      <h3>Card title</h3>
      <p>Short description of the problem or step.</p>
    </article>
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| label | `string` | `"Lines branching out to Gmail, Slack and Notion…"` | Accessible description of the illustration |
| className | `string` |  | Extra class on the root, e.g. for width or margins |

### Accessibility

- Exposed as one image with a descriptive label; the logos and lines inside are hidden from screen readers

### Motion

- Short colored pulses flow down each of the three lines, staggered by one second (3 s loop)
- With prefers-reduced-motion the pulses are hidden and only the gray lines remain

### Responsive

- Transparent background, so it sits on any light or dark surface
- Keeps a 3 : 2 aspect ratio and scales to the width of its container – set a width or max-width via className
- Drawn on a 320 × 240 viewBox, so logos and tiles scale crisply at any size
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19
