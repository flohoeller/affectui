# Command Menu (Pro)

Search and run anything from one field – tool actions with logos and ⌘1–⌘5, everyday commands with icons

- Page: https://www.affectui.com/components/command-menu
- Section: Components · Navigation
- Install, classic style: `npx shadcn@latest add https://www.affectui.com/r/command-menu.json` (needs the Pro access key)
- Install, clean style: `npx shadcn@latest add https://www.affectui.com/r/command-menu-clean.json` (needs the Pro access key) – lands as `command-menu-clean.tsx`, import from `@/components/ui/command-menu-clean` – its docs: `command-menu-clean.md`
- Import: `@/components/ui/command-menu`

### When to use

- A ⌘K menu that runs actions across the tools your product connects to
- Power users who want to reach any page or action without the mouse

### When not to use

- The only way to reach something – keep the main navigation visible as well
- Fewer than five actions – buttons are easier to discover

### Usage

```tsx
import { CommandMenu, type CommandGroup } from "@/components/ui/command-menu";

export function Commands({ onClose }: { onClose: () => void }) {
  return (
    <CommandMenu
      autoFocus
      onClose={onClose}
      onRun={(id, query) => (id === "ask" ? askAssistant(query) : runCommand(id))}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| groups | `CommandGroup[]` | `Suggestions, Share, General, Go to` | Each { id, label, commands: { id, label, hint?, logo? | icon?, keys?, keywords? }[] }; the group with id "suggestions" gets ⌘1–⌘5 |
| placeholder | `string` | `"Type a command or search…"` | Text in the empty field |
| onRun | `(id: string, query?: string) => void` |  | Called when a command runs; the assistant fallback sends "ask" and the typed text |
| onClose | `() => void` |  | Runs on Esc in an empty field – close your dialog here |
| autoFocus | `boolean` |  | Focus the field when the menu appears |
| className | `string` |  | Extra class on the root |

### Keyboard

- ↑ / ↓: Move row by row through all sections
- ↵: Run the highlighted command
- Tab: Jump to the next section (Shift Tab goes back)
- ⌘ / 1–5: Run a suggestion straight away (Ctrl on Windows)
- Esc: Clear the field, then close
- ⌘ / K: Focus the field from anywhere

### Accessibility

- The field is a combobox that controls the list; the highlighted command is the active option
- Groups are labelled, shortcut keys are hidden from screen readers
- What just ran is announced in a polite live region

### Motion

- The gray highlight glides from row to row
- The row that runs gives a short press; a check and its name appear in the tray below
- With prefers-reduced-motion everything switches instantly

### Responsive

- Fills its container up to 600px; on phones shortcut keys and hints are left out
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19
