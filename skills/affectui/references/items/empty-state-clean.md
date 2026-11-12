# Empty State, clean style (Free)

What a list, table or panel shows while it has nothing yet – an icon on a soft tile, a title, one line and a button for the first step, framed or bare

- Page: https://www.affectui.com/components/empty-state
- Section: Components · Feedback
- Install: `npx shadcn@latest add https://www.affectui.com/r/empty-state-clean.json`
- Import: `@/components/ui/empty-state-clean`

### When to use

- A list, table or board that has nothing in it yet – say what will show up and offer the first step
- A search or filter that matched nothing – with a button that clears it
- A side panel or page with nothing picked – bare, without a frame

### When not to use

- While the data is still loading – show skeletons or the Thinking Loader, then the empty state only if it stays empty
- Errors or a failed load – say what went wrong in a Toaster or inline, with a retry
- A first-run checklist with several steps – use the Setup Guide

### Usage

```tsx
import { Calendar03Icon, PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button-clean";
import { EmptyState } from "@/components/ui/empty-state-clean";

export function Schedules({ schedules, onNew }: { schedules: { id: string }[]; onNew: () => void }) {
  if (!schedules.length) {
    return (
      <EmptyState
        icon={Calendar03Icon}
        title="No schedules yet"
        text="Runs you ask an agent to repeat show up here, with their next time."
        action={
          <Button variant="secondary" size="sm" icon={<HugeiconsIcon icon={PlusSignIcon} size={15} />} onClick={onNew}>
            New schedule
          </Button>
        }
      />
    );
  }
  return null; // …the list
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| title | `ReactNode` |  | Required. What's empty, e.g. "No schedules yet" |
| text | `ReactNode` |  | One line on what will show up here, or how to get there – balanced over two lines when it wraps |
| action | `ReactNode` |  | The first step, usually a small secondary Button; several sit in a row and wrap |
| icon | `ReactNode \| HugeIcon` | `a file` | The glyph on the soft tile – an inline SVG or a Hugeicons icon object, drawn 18px at a 1.9 stroke; null leaves the tile out |
| bare | `boolean` | `false` | Without the frame – for a panel or page where it is the only content |
| tall | `boolean` | `false` | Fills its parent's height and centres itself in it – for a list or table area that keeps its size |
| ...div props | `ComponentProps<"div">` |  | className, style, id, role, ref and the rest go to the outer <div> |

### Accessibility

- Plain text and the button you pass – nothing is hidden from screen readers except the decorative icon
- When it replaces a list after a search or filter, announce the change: give a wrapper role="status" or aria-live="polite"
- The action keeps its own focus ring; the empty state itself takes no focus

### Responsive

- Centered and as wide as its parent; the text stops at 430px and wraps in balance
- Long titles and unbroken words wrap instead of running out
- Below 560px the frame tightens to 36px top and 18px at the sides
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19
- Optional: @hugeicons/core-free-icons – its icon objects can be passed straight to icon

Related: button, setup-guide, toaster, thinking-loader
