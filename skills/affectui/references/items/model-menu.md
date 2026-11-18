# Model Menu (Pro)

A model picker – DeepSeek, GPT, Claude, Gemini and more with their marks, a pink band gliding to the picked one, its right edge and foot fading into the page

- Page: https://www.affectui.com/illustrations/model-menu
- Section: Illustrations · Product scenes
- Install: `npx shadcn@latest add https://www.affectui.com/r/model-menu.json` (needs the Pro access key)
- Import: `@/components/ui/model-menu`

### When to use

- Hero or feature section of an AI product that lets people pick their model – it shows the choice at a glance
- Beside a headline or in a feature card – it fades into the page on the right and at the bottom, so it can sit at an edge
- Launch posts and OG images – a still frame with playing={false} reads well small

### When not to use

- As the real model picker – it's a picture of one; nothing in it can be clicked. Use Model Picker for that
- In tight spaces – it needs about 340 × 320px, and its fades want room around it

### Usage

```tsx
import { ModelMenu } from "@/components/ui/model-menu";

export function Hero() {
  return (
    <section className="relative">
      <h1>Every frontier model, one place</h1>
      <ModelMenu className="absolute right-0 top-24" />
    </section>
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| models | `MenuModel[]` |  | The rows: name and logo (any node, about 16px) – DeepSeek, GPT, Claude Opus, Gemini, Mistral Large, Qwen and Llama by default |
| title | `string \| null` | `"Best models"` | The quiet header above the rows – null leaves it out |
| selected | `number` | `1` | The picked row, where the band starts |
| playing | `boolean` | `true` | The band glides on to the next model now and then – false holds it on selected |
| hold | `number` | `2200` | How long the band stays on a model, in ms |
| walk | `number` | `3` | How many rows from the top the band walks through – the lower ones sit in the fade |
| className | `string` |  | Extra class on the root |

### Accessibility

- Decorative: the whole illustration is hidden from screen readers and takes no clicks
- With prefers-reduced-motion nothing moves: the band stays on the selected row

### Motion

- The pink band with the check glides from one model to the next in about half a second, then stays for hold ms
- The card's right edge, its foot and the last row stay faded into the page; the check is always in view

### Responsive

- Fixed size, about 340 × 320px with its fades – scale it with zoom or a transform for smaller screens
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- Logos are plain nodes – pass any 16px SVG; the defaults are the makers' own marks drawn inline
- Rows are a fixed 32px, so long names cut off with an ellipsis instead of moving the band

### Requirements

- React 19

Related: inspect-agent-card, inspect-composer, model-picker, model-wheel
