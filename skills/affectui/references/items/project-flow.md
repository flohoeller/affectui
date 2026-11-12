# Project Flow (Pro)

Animated scene of a client task branching into subtasks, notes and assigned roles

- Page: https://www.affectui.com/illustrations/project-flow
- Section: Illustrations · Product scenes
- Install: `npx shadcn@latest add https://www.affectui.com/r/project-flow.json` (needs the Pro access key)
- Import: `@/components/ui/project-flow`

### When to use

- A feature section that shows how tasks, clients and roles connect in your product
- Landing pages where a short, self-playing scene explains a workflow better than text

### When not to use

- Interactive product UI – the scene is a decorative illustration, not working components
- Very small spaces below ~320px wide, where the card text gets hard to read

### Usage

```tsx
import { ProjectFlow } from "@/components/ui/project-flow";

export function FeatureSection() {
  return (
    <section style={{ maxWidth: 960, margin: "0 auto" }}>
      <ProjectFlow />
    </section>
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| theme | `"light" \| "dark"` | `"light"` | Light or dark cards |
| label | `string` | `"A client task branching…"` | Accessible description of the scene |
| className | `string` |  | Extra class on the root, e.g. for width or margins |

### Accessibility

- The scene is exposed as one image with a descriptive label; its inner elements are hidden from screen readers

### Motion

- The cards build up one after another: client, task, notes, roles and team, connected by lines that draw in
- A hand drags the subtask cards in, drops them with a small bounce and lets go
- With prefers-reduced-motion everything appears in its final state right away

### Responsive

- The background is transparent; set --ui-pf-fade to your page color so the soft edges blend in
- Drawn on a 2312 × 1644 artboard and scaled to the width of its container, so the layout never reflows

### Requirements

- React 19
