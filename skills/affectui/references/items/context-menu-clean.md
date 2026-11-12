# Context Menu, clean style (Free)

The menu a right-click opens, right at the pointer – a long press on touch, Shift F10 from the keyboard, items built for what was clicked, with icons, shortcuts, checks, red items and submenus

- Page: https://www.affectui.com/components/context-menu
- Section: Components · Navigation
- Install: `npx shadcn@latest add https://www.affectui.com/r/context-menu-clean.json`
- Import: `@/components/ui/context-menu-clean`

### When to use

- Actions on the thing under the pointer – a file, a row, a message, a node on a canvas – where people expect a right-click
- One menu for a whole list: build the items from the element that was right-clicked (a file's actions, or New file on the empty space)
- As a shortcut next to a visible way in: the same actions should also sit behind a ⋯ button or a toolbar

### When not to use

- The only way to reach an action – most people never right-click, and touch needs a long press; put a ⋯ button with the Dropdown Menu next to it
- A menu that opens from a button – use the Dropdown Menu
- Searching across many commands – use the Command Menu
- A preview of what a link points to – use the Hover Card

### Usage

```tsx
import { Copy01Icon, Delete02Icon, FileAddIcon, Link01Icon, ViewIcon } from "@hugeicons/core-free-icons";
import { ContextMenu } from "@/components/ui/context-menu-clean";

export function Files({ files }: { files: { id: string; name: string }[] }) {
  return (
    <ContextMenu
      aria-label="File actions"
      items={(target) => {
        const id = target.closest<HTMLElement>("[data-file]")?.dataset.file;
        const file = files.find((f) => f.id === id);
        if (!file) return [{ label: "New file", icon: FileAddIcon, shortcut: "⌘N", onSelect: () => create() }];
        return [
          { label: "Open", icon: ViewIcon, onSelect: () => open(file.id) },
          { label: "Copy link", icon: Link01Icon, onSelect: () => copyLink(file.id) },
          { label: "Duplicate", icon: Copy01Icon, onSelect: () => duplicate(file.id) },
          { label: "Delete file", icon: Delete02Icon, danger: true, divider: true, onSelect: () => remove(file.id) },
        ];
      }}
    >
      <ul>
        {files.map((f) => (
          <li key={f.id}>
            <button type="button" data-file={f.id}>{f.name}</button>
          </li>
        ))}
      </ul>
    </ContextMenu>
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| children | `ReactElement` |  | The area it opens on – exactly one element that takes a ref (a row, a card, a list). Its own handlers run first; one that calls preventDefault keeps the menu shut. The menu is a <div> right after it – wrap a <li> or <tr> in its list or table rather than the row itself |
| items | `ContextMenuItem[] \| (target: HTMLElement) => ContextMenuItem[]` |  | The items, or a function that builds them for the element under the pointer (or the focused one) at the moment it opens – and again while it is open, so checks stay current. No items: the browser's own menu shows |
| item | `ContextMenuItem` |  | { label, description?, icon?, logo?, checked?, type?, danger?, shortcut?, divider?, disabled?, keepOpen?, submenu?, onSelect? } – the same items as the Dropdown Menu |
| item.icon | `ReactNode \| HugeIcon` |  | A 16px glyph before the label – an inline SVG, or a Hugeicons icon object passed as it is |
| item.checked / item.type | `boolean / "radio" \| "checkbox"` |  | Makes the item a choice with a check on the right – one of a set (radio) or on and off on its own (checkbox) |
| item.danger | `boolean` |  | Red label and icon, a red-tinted highlight – for Delete and the like |
| item.shortcut | `string` |  | Shown on the right, e.g. "⌘C" – only shown, wire the keys up yourself |
| item.divider / item.disabled / item.keepOpen | `boolean` |  | A hairline above the item · faint and skipped by the arrow keys · the menu stays open after the pick |
| item.submenu | `ContextMenuItem[]` |  | Opens beside the item on hover, →, Enter or Space; ← or Esc steps back |
| title | `string` |  | A small gray heading above the items – also the menu's accessible name |
| aria-label | `string` | `"Actions"` | Names the menu when there is no title |
| onOpenChange | `(open: boolean, target: HTMLElement \| null) => void` |  | Called when it opens, with the element it opened on – e.g. to select the row it is about – and when it closes |
| disabled | `boolean` |  | Never opens – the browser's own menu shows |
| width | `number \| string` |  | The menu's width; by default it fits the items, at least 168px |
| menuClassName | `string` |  | Classes on the menu panel |

### Keyboard

- Shift / F10: On the focused element inside the area: open the menu at it, the first item focused
- Menu key: The same, with the context menu key some keyboards have
- ↓ / ↑: Next or previous item, wrapping around; disabled ones are skipped
- Home / End: First or last item
- A–Z: Jump to the next item that starts with what you type
- Enter / Space: Pick the item, or open its submenu
- → / ←: Into a submenu, and back out of it
- Esc: Close the submenu, or the menu – the focus goes back to where it was
- Tab: Close the menu and move on from where the focus was

### Accessibility

- The list is role="menu" named by the title or aria-label; items are menuitem, menuitemradio or menuitemcheckbox with aria-checked; an item with a submenu has aria-haspopup and aria-expanded
- Shift F10 and the menu key open it from the keyboard, so every action is reachable without a mouse – make the rows of your area focusable (buttons, or tabIndex)
- Real focus moves through the items (roving focus); opened with the pointer the focus waits on the menu itself, so no item looks picked until you hover or press a key
- However it closes, the focus goes back to the element that had it – unless the pick moved it on purpose (e.g. into a rename field)
- Text fields inside the area keep the browser's own menu – paste, spelling and autofill stay where people expect them
- A right-click is a hidden gesture: offer the same actions somewhere visible too (a ⋯ button with the Dropdown Menu)
- The ring shows only under keyboard focus (:focus-visible), inside the row

### Motion

- The menu fades and scales in from the corner at the pointer; submenus fade in beside their item
- One soft highlight glides between the rows as the pointer or the arrow keys move – red-tinted on a danger item
- The check on a choice draws itself
- With prefers-reduced-motion everything switches instantly

### Responsive

- Opens with its corner at the pointer and turns to the left or upward when there is no room; it lives in the top layer (popover), so no overflow or z-index cuts it
- A press elsewhere, a scroll that moves the area, resizing or leaving the window closes it
- Touch: a long press (half a second, without moving) opens it at the finger – the callout and the tap that would follow are held back; touch screens get 40px rows
- In right-to-left text it opens to the left of the pointer
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19
- Optional: @hugeicons/core-free-icons – its icon objects can be passed straight to icon

Related: dropdown-menu, command-menu, popover, hover-card
