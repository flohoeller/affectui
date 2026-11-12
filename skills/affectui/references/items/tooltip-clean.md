# Tooltip, clean style (Free)

A small dark label for one control – shows on hover after a short wait and at once under keyboard focus, neighbours follow instantly, an optional shortcut inside, flips to stay on screen

- Page: https://www.affectui.com/components/tooltip
- Section: Components · Feedback
- Install: `npx shadcn@latest add https://www.affectui.com/r/tooltip-clean.json`
- Import: `@/components/ui/tooltip-clean`

### When to use

- The name of an icon-only control, with its shortcut: search ⌘K, filter, pin, share
- The full text of a label that is cut off with an ellipsis – a run name, a file name, a long branch
- One short extra line about a control that already has a visible or accessible name

### When not to use

- Anything you can click, select or copy inside it – use the Popover, which takes the focus and stays open
- A list of actions – use the Dropdown Menu
- Information someone needs to finish a task, or the only label of a control: touch screens never show tooltips – put it on the page, or in the control's aria-label
- A status after an action (Copied, Saved) that should be read out – use the Toaster

### Usage

```tsx
import { Search01Icon } from "@hugeicons/core-free-icons";
import { Tooltip } from "@/components/ui/tooltip-clean";
import { IconButton } from "@/components/ui/icon-button-clean";

export function SearchTool({ onSearch }: { onSearch: () => void }) {
  return (
    // One child element: the Tooltip clones it and adds its handlers, ref and aria-describedby
    <Tooltip content="Search runs" shortcut="⌘K" side="bottom">
      {/* title="" leaves out the Icon Button's own browser tooltip */}
      <IconButton variant="secondary" icon={Search01Icon} label="Search runs" title="" onClick={onSearch} />
    </Tooltip>
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| content | `ReactNode` |  | The label – a few words, wraps at 240px. Text only: never a link or button inside. Empty or null renders the child alone |
| shortcut | `string` |  | A keyboard shortcut after the label in a quieter tone, e.g. "⌘K" or "⇧⌘S" |
| children | `ReactElement` |  | Exactly one element that takes a ref and focus – a button, a link, an Icon Button. Its own handlers and ref keep working; they run first, and preventDefault in one stops the tooltip's |
| side | `"top" \| "bottom" \| "left" \| "right"` | `"top"` | Where it shows; flips to the other side when that has more room, and goes above or under when there is no room beside it |
| align | `"start" \| "center" \| "end"` | `"center"` | Which edges line up; above and under, start is the left (the right in RTL). Pushed inside the window when it would stick out |
| offset | `number` | `6` | Gap to the trigger in px |
| delay | `number` | `500` | How long the pointer rests on the trigger before it shows, in ms. Keyboard focus, and a neighbour within 300ms of the last one, show it at once |
| disabled | `boolean` | `false` | Never shows it – e.g. when the label is not cut off |
| open | `boolean` |  | Controls it from outside, with onOpenChange; leave it out and it opens on its own |
| onOpenChange | `(open: boolean) => void` |  | Called whenever it wants to open or close |
| className | `string` |  | A class for the label |

### Keyboard

- Tab: Focusing the trigger by keyboard shows it at once; moving on hides it
- Esc: Hides it, before anything around it (a dialog, a panel) reacts; it stays hidden until the focus or pointer leaves
- Enter / Space: Clicking the trigger hides it

### Accessibility

- role="tooltip"; while it shows, the trigger points to it with aria-describedby (added to any it already has) – a description, never the name
- The name stays on the trigger: an icon-only button needs its own aria-label (the Icon Button's label). When the tooltip only repeats that name, screen readers just get the shortcut from it, so nothing is read twice
- Opens under keyboard focus, never after a click; Escape hides it without moving the focus (WCAG 1.4.13)
- The pointer can move from the trigger onto the label without it closing, so it can be read under a screen magnifier
- Touch has no hover, so a tap never opens it – never put information only in a tooltip
- Only one shows at a time on the page

### Motion

- Fades in and drifts 2px from the trigger's side; it disappears at once
- Once one is open, moving to a neighbour (within 300ms) shows the next one instantly and without the fade
- With prefers-reduced-motion it appears without the drift

### Responsive

- It lives in the top layer (popover), so a card's overflow or z-index never cuts it; it follows its trigger on scroll and resize
- Always on screen: it flips sides and is pushed inside the window; long text wraps at 240px (never wider than the window)
- A label in another script reads in its own direction (dir="auto")
- Dark mode built in: a light label on dark pages – switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19

Related: icon-button, popover, dropdown-menu, toaster
