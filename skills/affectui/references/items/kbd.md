# Kbd (Free)

A key chip for shortcuts – one key or a combo in one chip, ⌘ on a Mac and Ctrl elsewhere from a single mod key, spelled out for screen readers

- Page: https://www.affectui.com/components/kbd
- Section: Components · Text
- Install, classic style: `npx shadcn@latest add https://www.affectui.com/r/kbd.json`
- Install, clean style: `npx shadcn@latest add https://www.affectui.com/r/kbd-clean.json` – lands as `kbd-clean.tsx`, import from `@/components/ui/kbd-clean` – its docs: `kbd-clean.md`
- Import: `@/components/ui/kbd`

### When to use

- The shortcut next to a menu item or command: Search ⌘K, Run ⌘↵
- A help sheet or settings page that lists the keyboard shortcuts
- A key named in running text: Press Esc to close
- The shortcut inside a tooltip or on a dark button (the chip follows the colors around it)

### When not to use

- A status or a count – use the Badge
- Code, a command or a file path – use inline <code>
- Something you click or remove – use the Button or the Tag Input
- On touch-only screens, where no one has a keyboard – leave the hint out there

### Usage

```tsx
import { Kbd } from "@/components/ui/kbd";

export function SearchHint() {
  return (
    <span>
      Search runs and files <Kbd keys={["mod", "K"]} />
    </span>
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| keys | `string \| string[]` |  | One key or a combo, drawn in one chip. Named keys: mod (⌘ on a Mac, Ctrl elsewhere), cmd, ctrl, alt (⌥ / Alt), shift, enter, esc, tab, space, backspace, delete, up, down, left, right, pageup, pagedown, home, end – any other key is shown as it is, single letters as capitals |
| children | `ReactNode` |  | Shown as one plain key when keys is left out. With neither, nothing renders |
| size | `"sm" \| "md"` | `"sm"` | 18px high with 11px text (menus, hints), or 22px with 12px (lists, help sheets) |
| platform | `"mac" \| "other"` |  | Draws ⌘ ⌥ ⇧ ↵ for a Mac or Ctrl, Alt, Shift, Enter for Windows and Linux. Found out from the browser when left out – "other" on the server, so hydration matches |
| ...kbd props | `ComponentProps<"kbd">` |  | className, title, ref and the rest go to the <kbd> |

### Accessibility

- A real <kbd> element, read in place as part of the sentence
- The glyphs are hidden from screen readers; a visually hidden text spells the keys out – "Command Shift A", "Control Period"
- Not focusable and not interactive – the shortcut itself is handled by your app
- In Windows high-contrast mode the chip keeps a visible edge

### Motion

- None – a key chip never moves

### Responsive

- Never wraps: a combo stays in one chip
- Tabular figures, so a column of shortcuts lines up
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- Write shortcuts with mod, not cmd or ctrl, so Mac and Windows users each see their own key
- Keep the keys in the order people press them: modifiers first (mod, shift, alt), then the key
- Show a shortcut where people look for it – menus, tooltips, a help sheet – not as a hint on every button

### Requirements

- React 19

Related: tooltip, dropdown-menu, command-menu, badge
