# Integration Flow (Pro)

Integration pills rotating along a dashed arc, each beaming its data into a central analysis hub

- Page: https://www.affectui.com/illustrations/integration-flow
- Section: Illustrations · Product scenes
- Install: `npx shadcn@latest add https://www.affectui.com/r/integration-flow.json` (needs the Pro access key)
- Import: `@/components/ui/integration-flow`

### When to use

- A hero or feature section that shows your product pulling data in from the tools teams already use
- Integration or data-platform pages where a short, self-playing loop explains the idea better than a logo wall

### When not to use

- A real list of connected integrations – the pills are decorative, not interactive
- Very small spaces below ~320px wide, where the pill text gets hard to read
- Brands that clash with the warm coral background

### Usage

```tsx
import { IntegrationFlow } from "@/components/ui/integration-flow";

export function IntegrationsSection() {
  return (
    <section style={{ maxWidth: 1100, margin: "0 auto" }}>
      <IntegrationFlow />
    </section>
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| items | `{ name: string; icon: ReactNode; title?: string; mono?: boolean }[]` | `Okta, Snowflake, Slack, ClickUp, Zendesk` | Integrations that rotate through the pills (5 or more look best). The icon fills a 64 × 64 box; mono logos turn black in the centre |
| label | `string` | `"Integrations like Slack, Okta and Snowflake…"` | Accessible description of the scene |
| className | `string` |  | Extra class on the root, e.g. for width or margins |

### Accessibility

- The scene is exposed as one image with a descriptive label; the pills and cards inside are hidden from screen readers

### Motion

- The pills travel along the dashed arc one slot at a time (0.9 s); the one landing in the centre turns light and shows its logo in color
- The centre pill charges up, a beam sweeps over to the Data Analysis hub (1.1 s) and the hub lights up as it arrives
- The coral background blobs drift and breathe slowly on a 16 s loop
- With prefers-reduced-motion everything stands still in the centre state, with the beam drawn in

### Responsive

- Drawn on a 2400 × 1490 stage and scaled to the width of its container, so the layout never reflows
- Keeps its 2400 : 1490 aspect ratio; set a width or max-width via className
- Set --ui-if-bg and --ui-if-fade to change the stage background and the color the bottom fades into
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19
