# Dropdown Menu (Free)

Actions and choices behind any trigger – icons, shortcuts, checks, red items and submenus, a gliding highlight, type-ahead and the full menu keyboard

- Page: https://www.affectui.com/components/dropdown-menu
- Section: Components · Navigation
- Install, classic style: `npx shadcn@latest add https://www.affectui.com/r/dropdown-menu.json`
- Install, clean style: `npx shadcn@latest add https://www.affectui.com/r/dropdown-menu-clean.json` – lands as `dropdown-menu-clean.tsx`, import from `@/components/ui/dropdown-menu-clean` – its docs: `dropdown-menu-clean.md`
- Import: `@/components/ui/dropdown-menu`

### When to use

- Actions on one thing behind a ⋯ button: rerun, duplicate, copy link, move, delete
- A short choice that changes a view right away – sort order, period, density – shown as checked items
- Account and workspace menus with a header (who is signed in) and submenus (language, appearance)

### When not to use

- Picking a value for a form field – use the Select
- Searching across many commands or pages – use the Command Menu
- A short form or an explanation next to a button – use the Popover
- Filters with several groups and counts – use the Filter Menu

### Usage

```tsx
import { Copy01Icon, Delete02Icon, Folder01Icon, MoreHorizontalIcon, RepeatIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { DropdownMenu } from "@/components/ui/dropdown-menu";

export function RunActions({ run }: { run: { id: string; name: string } }) {
  return (
    <DropdownMenu
      align="end"
      items={[
        { label: "Rerun", icon: RepeatIcon, shortcut: "⌘R", onSelect: () => rerun(run.id) },
        { label: "Duplicate", icon: Copy01Icon, onSelect: () => duplicate(run.id) },
        {
          label: "Move to",
          icon: Folder01Icon,
          divider: true,
          submenu: folders.map((f) => ({ label: f.name, icon: f.icon, checked: f.id === run.folder, onSelect: () => move(run.id, f.id) })),
        },
        { label: "Delete run", icon: Delete02Icon, danger: true, divider: true, onSelect: () => remove(run.id) },
      ]}
      trigger={({ triggerProps }) => (
        <button type="button" aria-label={`Actions for ${run.name}`} {...triggerProps}>
          <HugeiconsIcon icon={MoreHorizontalIcon} size={16} />
        </button>
      )}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| trigger | `({ open, toggle, triggerProps }) => ReactNode` |  | Draws the trigger. Spread triggerProps on it (id, aria-haspopup, aria-expanded, aria-controls, onClick) – or call toggle yourself |
| items | `DropdownMenuItem[]` |  | { label, description?, icon?, logo?, checked?, type?, danger?, shortcut?, divider?, disabled?, keepOpen?, submenu?, onSelect? } |
| item.icon | `ReactNode \| HugeIcon` |  | A 16px glyph before the label – an inline SVG, or a Hugeicons icon object passed as it is |
| item.logo | `ReactNode` |  | A brand mark in its own colors in place of the icon (Gmail, Slack, a flag) |
| item.checked | `boolean` |  | Makes the item a choice with a check on the right; leave it out for a plain action |
| item.type | `"radio" \| "checkbox"` | `"radio"` | radio: one of a set (menuitemradio) · checkbox: on or off on its own (menuitemcheckbox) |
| item.danger | `boolean` |  | Red label and icon, a red-tinted highlight – for Delete and the like |
| item.shortcut | `string` |  | Shown on the right, e.g. "⌘R" – only shown, wire the keys up yourself |
| item.divider | `boolean` |  | A hairline above the item, to start a group |
| item.disabled | `boolean` |  | Shown faint; can't be picked and the arrow keys skip it |
| item.keepOpen | `boolean` |  | The menu stays open after the pick – for checkboxes you tick several of |
| item.submenu | `DropdownMenuItem[]` |  | Opens beside the item on hover, →, Enter or Space; ← or Esc steps back |
| align | `"start" \| "end"` | `"start"` | Which edges of menu and trigger line up; switches when the menu would stick out |
| side | `"bottom" \| "top"` | `"bottom"` | Where it opens; flips when the other side has more room |
| title | `string` |  | A small gray heading above the items – also the menu's accessible name |
| header | `ReactNode` |  | Anything above the items, e.g. the signed-in user |
| open / defaultOpen / onOpenChange | `boolean / boolean / (open) => void` |  | Controlled or uncontrolled open state |
| width | `number \| string` |  | The menu's width; by default it fits the items, at least 180px |
| menuClassName | `string` |  | Classes on the menu panel itself – className goes on the wrapper around the trigger and the menu. The panel carries the trigger's width as a CSS variable, e.g. min-width: var(--ui-dm-trigger-w) for a menu as wide as its field |
| empty | `ReactNode` | `"Nothing here yet"` | Shown when items is empty |
| className | `string` |  | On the inline wrapper around the trigger |
| aria-label | `string` |  | Names the menu when there is no title (otherwise the trigger names it) |

### Keyboard

- Enter / Space / ↓: On the trigger: open with the checked or first item focused
- ↑: On the trigger: open with the last item focused
- ↓ / ↑: Next or previous item, wrapping around; disabled ones are skipped
- Home / End: First or last item
- A–Z: Jump to the next item that starts with what you type
- Enter / Space: Pick the item, or open its submenu
- → / ←: Into a submenu, and back out of it
- Esc: Close the submenu, or the menu – the focus goes back to the trigger
- Tab: Close the menu and move on from the trigger

### Accessibility

- The menu button pattern: the trigger has aria-haspopup="menu", aria-expanded and aria-controls; the list is role="menu" named by the title or the trigger
- Items are menuitem, menuitemradio or menuitemcheckbox with aria-checked; an item with a submenu has aria-haspopup and aria-expanded; dividers are separators
- Real focus moves through the items (roving focus), so every screen reader follows; disabled items carry aria-disabled
- Opened with the pointer, the focus waits on the menu itself – no item looks picked until you hover or press a key
- However it closes, the focus goes back to the trigger – unless the pick moved it on purpose (e.g. into a rename field)
- The ring shows only under keyboard focus (:focus-visible), inside the row

### Motion

- The menu fades and scales in from the corner it is attached to; submenus fade in beside their item
- One soft highlight glides between the rows as the pointer or the arrow keys move – red-tinted on a danger item
- The check on a choice draws itself
- With prefers-reduced-motion everything switches instantly

### Responsive

- It lives in the top layer (popover), so a card's overflow or z-index never cuts it; it follows its trigger on scroll
- Opens where there is room – under or above the trigger, the edges line up the other way near the screen's side; a long menu scrolls
- A submenu opens to the right, to the left when there is no room, and under its item on a narrow phone
- Long labels end in … with the full text on hover; touch screens get 40px rows
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19
- Optional: @hugeicons/core-free-icons – its icon objects can be passed straight to icon

Related: popover, select, command-menu, filter-menu, profile-menu
