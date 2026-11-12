# Text Reveal (Free)

Text that arrives word by word or letter by letter – each piece rises out of a soft blur as it scrolls into view

- Page: https://www.affectui.com/motion/text-reveal
- Section: Motion · Text
- Install: `npx shadcn@latest add https://www.affectui.com/r/text-reveal.json`
- Import: `@/components/ui/text-reveal`

### When to use

- Headlines and short intros on landing pages that should arrive as you scroll
- A key sentence you want read in order, like a mission statement or a quote

### When not to use

- Long paragraphs or anything people need to read right away – waiting for words gets tiring
- Text that changes often, like live data – the reveal plays only when it enters the view

### Usage

```tsx
import { TextReveal } from "@/components/ui/text-reveal";

export function Intro() {
  return <TextReveal as="h2" text="Words that arrive one at a time." />;
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| text | `string` |  | The text to reveal |
| by | `"word" \| "char"` | `"word"` | Reveal word by word or letter by letter |
| stagger | `number` | `40` | Time between two pieces, in ms |
| delay | `number` | `0` | Wait before the first piece, in ms |
| duration | `number` | `700` | Time each piece takes to arrive, in ms |
| as | `"p" \| "h1" \| "h2" \| "h3" \| "span"` | `"p"` | Element to render |
| once | `boolean` | `true` | Reveal only the first time; otherwise it plays again each time it enters the view |
| className | `string` |  | Extra class on the root |

### Accessibility

- Screen readers get the full sentence from a visually hidden copy; the animated pieces are aria-hidden
- Words never break in the middle, and spaces stay real, so lines wrap like normal text

### Motion

- Each piece fades in out of a blur while it rises a little, one after another, once 30% of the text is visible
- Reduced motion shows the text right away

### Responsive

- Font, size and color come from the parent, so it fits any heading or paragraph
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19

Related: gradient-text
