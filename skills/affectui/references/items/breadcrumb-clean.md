# Breadcrumb, clean style (Free)

Where a page sits and the way back up – links with quiet separators, the current page last, a long middle folded into a … menu, long names shortened with the full one on hover

- Page: https://www.affectui.com/components/breadcrumb
- Section: Components · Navigation
- Install: `npx shadcn@latest add https://www.affectui.com/r/breadcrumb-clean.json`
- Import: `@/components/ui/breadcrumb-clean`

### When to use

- Where a page sits in a hierarchy: workspace, agent, runs, the run
- Going back up several levels in one press – files and folders, a settings section, an issue in a project
- Deep trails: the middle folds into a … menu past maxItems, and on its own when the row gets narrow

### When not to use

- Moving between pages of one list – use the Pagination
- Switching between views on the same level – use the Segmented Control or tabs
- Steps of a flow the user goes through in order – use the Stepper Form
- Picking another workspace or project from the trail – put a Dropdown Menu on that crumb yourself

### Usage

```tsx
import { Breadcrumb } from "@/components/ui/breadcrumb-clean";

export function RunHeader({ agent, run }: { agent: { id: string; name: string }; run: { title: string } }) {
  return (
    <Breadcrumb
      items={[
        { label: "Agents", href: "/agents" },
        { label: agent.name, href: `/agents/${agent.id}` },
        { label: "Runs", href: `/agents/${agent.id}/runs` },
        { label: run.title },
      ]}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| items | `BreadcrumbItem[]` |  | From the top down; the last one is the page you are on – shown in ink, not a link, marked aria-current="page" |
| items[].label | `string` |  | The name. Long ones shorten with … at 200px and show in full on hover |
| items[].href | `string` |  | Makes the crumb a link |
| items[].onClick | `(event) => void` |  | Without href the crumb is a button; with href it runs first (call preventDefault to navigate with a router) |
| items[].icon | `ReactNode \| HugeIcon` |  | A 14px glyph before the label, e.g. the workspace's mark on the first crumb |
| separator | `"slash" \| "chevron" \| ReactNode` | `"slash"` | What sits between the crumbs – a quiet slash, a 12px chevron (mirrored right to left) or your own |
| maxItems | `number` | `4` | The most crumbs shown; past it the ones after the first fold into …, so the first and the last ones stay. A row too narrow folds more on its own |
| aria-label | `string` | `"Breadcrumb"` | Names the navigation landmark |
| ...nav props | `ComponentProps<"nav">` |  | className, style, ref and the rest go to the <nav> |

### Keyboard

- Tab: Moves through the crumbs and the …
- Enter: Follows a crumb, or opens the folded ones
- ↓ / ↑: Moves through the folded crumbs; ↓ on the … opens them
- Home / End: The first or the last folded crumb
- Esc: Closes the folded crumbs and goes back to the …

### Accessibility

- A <nav> landmark named Breadcrumb around an ordered list, so screen readers hear the levels and their count
- The page you are on is marked aria-current="page" and isn't a link
- Separators are hidden from screen readers
- The … says how many crumbs it holds ("Show 2 more crumbs") and opens a real menu with aria-expanded; the focus moves in and comes back
- Each label gets dir="auto", so a name in another script reads the right way
- The ring shows only under keyboard focus (:focus-visible), never after a click

### Motion

- The current page slides in softly when you move to another level; the folded crumbs' menu fades and scales in
- With prefers-reduced-motion it all appears at once

### Responsive

- One line that never wraps: crumbs shorten first, the current page last; when they would get too short, more of the middle folds into …
- Touch screens get larger hit areas around the crumbs and the …, and taller menu rows – the text doesn't move
- Right to left: the chevrons turn round and the menu opens from the right edge
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19
- Optional: @hugeicons/core-free-icons – its icon objects can be passed straight to an item's icon

Related: pagination, dropdown-menu, segmented-control, stepper-form
