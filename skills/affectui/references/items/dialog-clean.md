# Dialog, clean style (Free)

A modal window on a dimmed backdrop – title and quiet line, content that scrolls under a fixed header and footer, Escape and backdrop close, the focus kept inside and handed back, a sheet on phones, and an AlertDialog to confirm with a red button

- Page: https://www.affectui.com/components/dialog
- Section: Components · Feedback
- Install: `npx shadcn@latest add https://www.affectui.com/r/dialog-clean.json`
- Import: `@/components/ui/dialog-clean`

### When to use

- A task that needs the whole attention before going on: create a task, edit an agent, invite people, connect an app
- A confirmation before something that can't be undone – delete an agent, cancel a subscription, revoke a key (use AlertDialog)
- Content that should open over the page and come back to the same place when it closes

### When not to use

- A short form or a few settings next to the button that asks for them – use the Popover, which doesn't block the page
- A list of actions or choices – use the Dropdown Menu
- Searching and running commands – use the Command Menu
- A short status after an action, like "Saved" or "Deleted · Undo" – use the Toaster; an undo is often kinder than a confirm
- Nothing to show yet – use the Empty State

### Usage

```tsx
import { useState } from "react";
import { Dialog } from "@/components/ui/dialog-clean";
import { Button } from "@/components/ui/button-clean";

export function EditAgent({ agent, onSave }: { agent: { name: string }; onSave: (name: string) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(agent.name);

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
      trigger={<Button variant="secondary">Edit</Button>}
      title="Edit agent"
      description="Changes apply from its next run."
      footer={
        <>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onSave(name);
              setOpen(false);
            }}
          >
            Save
          </Button>
        </>
      }
    >
      <input aria-label="Name" value={name} onChange={(e) => setName(e.target.value)} />
    </Dialog>
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| open | `boolean` |  | Shows it – pass it with onOpenChange to control it, or leave both out and use trigger |
| defaultOpen | `boolean` | `false` | Open from the start when it isn't controlled |
| onOpenChange | `(open: boolean) => void` |  | Called with false on Escape, a backdrop press, the × (and AlertDialog's buttons), with true from the trigger |
| trigger | `ReactElement` |  | A button that opens it – it keeps its own onClick, gets aria-haspopup and aria-expanded, and the focus comes back to it on close |
| title | `ReactNode` |  | Required. The heading – also the dialog's accessible name (aria-labelledby) |
| description | `ReactNode` |  | A quiet line under the title, read out with it (aria-describedby) |
| children | `ReactNode` |  | The content – it scrolls when it is taller than the window, a hairline shows at the edge that has more |
| footer | `ReactNode` |  | The actions, aligned to the end – they stay in view while the content scrolls and wrap rather than squeeze |
| size | `"sm" \| "md" \| "lg"` | `"md" (AlertDialog "sm")` | 400, 480 or 720px wide – never wider than the window |
| width | `number \| string` |  | Any width instead of a size, e.g. 560 or "40rem" |
| closeOnBackdrop | `boolean` | `true` | A press on the backdrop closes it. Off, the card gives a small nudge instead. AlertDialog never closes this way |
| closeButton | `boolean` | `true` | The × in the corner. AlertDialog has none – its Cancel is the way out |
| closeLabel | `string` | `"Close"` | The ×'s accessible name and tooltip – for other languages |
| initialFocus | `RefObject<HTMLElement>` |  | The control that gets the focus on open. By default: an element with data-autofocus, else the first control in the content, then in the footer |
| contained | `boolean` | `false` | Stays inside its nearest positioned parent – an app frame, a preview – instead of covering the window; Tab still goes round inside |
| ...dialog props | `ComponentProps<"dialog">` |  | className, style, id, aria-* … go to the <dialog> layer |

### Keyboard

- Tab: Moves through the controls inside and goes round – the page behind can't be reached
- Esc: Closes it (AlertDialog: cancels) – a menu or popover opened inside closes first
- Enter: Clicks the focused button – in AlertDialog that is the safe one first

### Accessibility

- A native <dialog> opened with showModal(): the top layer, everything behind it inert, the focus kept inside by the browser
- Named by its title and described by its description; AlertDialog has role="alertdialog"
- On open the focus moves to the first control (or initialFocus); on close it goes back to the trigger, or to whatever had it before
- AlertDialog puts the focus on the safe button, never closes on a backdrop press, and its busy confirm sets aria-busy
- contained keeps aria-modal and loops Tab itself, since the page around it isn't inert

### Motion

- The backdrop fades in, the card rises and scales from 97% – the way out is quicker and shrinks it slightly
- As a sheet on phones it slides up from the bottom and back down
- With prefers-reduced-motion it appears and goes at once

### Responsive

- On phones (or in a frame narrower than 520px) it becomes a sheet from the bottom: full width, the actions within the thumb's reach and above the home bar, AlertDialog's two buttons sharing the row
- Long content scrolls inside while the title and the actions stay put; long titles and unbroken words wrap
- The page under it stops scrolling while it is open, without shifting sideways
- Touch screens get bigger buttons and a bigger ×
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19

Related: popover, dropdown-menu, command-menu, toaster, button
