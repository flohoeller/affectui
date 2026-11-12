# Popover (Free)

A small floating card attached to its trigger – a title and quiet line, any content, flips to stay on screen, closes on a press outside or Escape and hands the focus back

- Page: https://www.affectui.com/components/popover
- Section: Components · Navigation
- Install, classic style: `npx shadcn@latest add https://www.affectui.com/r/popover.json`
- Install, clean style: `npx shadcn@latest add https://www.affectui.com/r/popover-clean.json` – lands as `popover-clean.tsx`, import from `@/components/ui/popover-clean` – its docs: `popover-clean.md`
- Import: `@/components/ui/popover`

### When to use

- A short form next to the button that asks for it: a schedule, an invite, a request, a rename
- A few settings or an explanation that should stay close to what it is about
- The base for your own floating panels – it handles where it goes, the top layer, outside presses, Escape and the focus

### When not to use

- A list of actions or choices – use the Dropdown Menu, which adds the menu roles and keys
- Picking a value for a form field – use the Select
- Something that needs the whole attention or a decision first – use a dialog
- A short status after an action – use the Toaster

### Usage

```tsx
import { useState } from "react";
import { Popover } from "@/components/ui/popover";

export function InviteButton({ onInvite }: { onInvite: (email: string) => void }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");

  return (
    // The Popover attaches to its parent – wrap the trigger and the Popover in one element
    <span style={{ display: "inline-flex" }}>
      <button type="button" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        Invite members
      </button>
      <Popover open={open} onClose={() => setOpen(false)} align="end" width={300} title="Invite to the workspace" description="They get an email with a link to join.">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onInvite(email);
            setOpen(false);
          }}
        >
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" aria-label="Email address" />
          <button type="submit">Send invite</button>
        </form>
      </Popover>
    </span>
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| open | `boolean` |  | Shows it – the Popover is always controlled |
| onClose | `() => void` |  | Called on a press outside, Escape, or when the focus leaves trigger and popover – set open to false here |
| side | `"bottom" \| "top" \| "right" \| "left"` | `"bottom"` | Where it opens; flips to the other side when that has more room, and goes under or above when there is no room beside it |
| align | `"start" \| "center" \| "end"` | `"start"` | Which edges line up – left/right above or below, top/bottom beside it; switches when it would stick out |
| offset | `number` | `6` | Gap to the trigger in px |
| anchor | `RefObject<HTMLElement>` |  | What it attaches to; by default its parent element. The trigger (focused again on close) is the anchor itself or its first control |
| title | `ReactNode` |  | A heading at the top – also the popover's accessible name |
| description | `ReactNode` |  | A quiet line under the title, read out with it |
| width | `number \| string` |  | The card's width; by default it fits its content (never wider than the window) |
| focusOnOpen | `boolean` | `true` | Moves the focus to the first control inside when it opens, or onto the card when there is none |
| role | `string` | `"dialog"` | A non-modal dialog by default |
| ...div props | `ComponentProps<"div">` |  | className, style, aria-label, id, ref … go to the card |

### Keyboard

- Tab: Moves through the controls inside; tabbing out of trigger and popover closes it
- Esc: Closes it – the focus goes back to the trigger. A menu opened inside closes first

### Accessibility

- A non-modal role="dialog", named by the title (aria-labelledby) and described by the description; without a title, pass aria-label
- Give the trigger aria-haspopup="dialog" and aria-expanded – the usage shows how
- On open the focus moves to the first control inside; however it closes, if the focus was inside, the trigger gets it back
- Open from the first render (a restored view) it leaves the focus where it is

### Motion

- Fades and scales in from the side and corner it is attached to – after a flip, from the new side
- With prefers-reduced-motion it appears at once

### Responsive

- It lives in the top layer (popover), so a card's overflow or z-index never cuts it; it follows its anchor on scroll and resize
- Always fully on screen: it flips sides, switches the edge it lines up with and is pushed inside the window as a last resort; too tall, it scrolls
- Touch screens get 15px text and a little more padding
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19

Related: dropdown-menu, select, toaster, filter-menu
