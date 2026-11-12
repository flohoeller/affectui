# Separator (Free)

A thin line between groups – across or upright between tools, an optional word in its middle like "or" or "Earlier", decorative or a real separator for screen readers

- Page: https://www.affectui.com/components/separator
- Section: Components · Data display
- Install, classic style: `npx shadcn@latest add https://www.affectui.com/r/separator.json`
- Install, clean style: `npx shadcn@latest add https://www.affectui.com/r/separator-clean.json` – lands as `separator-clean.tsx`, import from `@/components/ui/separator-clean` – its docs: `separator-clean.md`
- Import: `@/components/ui/separator`

### When to use

- Between groups in a card, a list or a menu – above a footer, between settings sections
- Upright between groups of tools in a toolbar, or between stats in a header: 12 runs | 1 failed
- A labelled break in a feed: Today, Earlier – or "or" between two ways in (Continue with GitHub · or · email)

### When not to use

- Between every row of a list – a hairline on the rows themselves (or just spacing) is calmer
- To group a few things that already sit on their own card – use the Card
- A heading for a section people navigate by – use a real heading (h2, h3)
- Between items in a Dropdown Menu – it draws its own (divider on the item)

### Usage

```tsx
import { Separator } from "@/components/ui/separator";

export function RunStats() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span>12 runs</span>
      <Separator orientation="vertical" />
      <span>1 failed</span>
    </div>
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| orientation | `"horizontal" \| "vertical"` | `"horizontal"` | A line across its container, or an upright line centred in its row (18px high – set height to change it) |
| label | `ReactNode` |  | A short word in the middle of a horizontal line. Long text wraps in the middle, the lines stay at least 12px |
| decorative | `boolean` | `true` | true: only a visual line, hidden from screen readers (a label stays readable as text). false: role="separator" with aria-orientation, named after a text label |
| ...div props | `ComponentProps<"div">` |  | className, style, id, ref and the rest go to the <div> |

### Accessibility

- Decorative by default (role="none") – most lines only help the eye, and the content around them is grouped already
- decorative={false} makes it a real separator: role="separator", aria-orientation="vertical" when upright, and the label as its name
- A decorative separator with a label keeps the word readable – only the two lines are hidden
- Not focusable – a separator you can drag to resize is a different control
- In Windows high-contrast mode the line takes the system text color

### Motion

- None

### Responsive

- The line is a border, so it stays one crisp pixel on every screen density
- Logical properties – the upright line and the label follow right-to-left text
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- Space first, line second: reach for a separator only where spacing alone doesn't show the break
- Keep labels to one or two words – a sentence wants to be a heading

### Requirements

- React 19

Related: card, dropdown-menu, kbd, badge
