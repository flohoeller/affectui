# Integration Picker, clean style (Pro)

Integrations page of a command menu – search, a list of services and the picked one with its connection on two tiles

- Page: https://www.affectui.com/components/integration-picker
- Section: Components · Navigation
- Install: `npx shadcn@latest add https://www.affectui.com/r/integration-picker-clean.json` (needs the Pro access key)
- Import: `@/components/ui/integration-picker-clean`

### When to use

- The integrations step of a command menu or settings dialog
- Letting people find a service quickly and switch it on without leaving what they're doing

### When not to use

- A full marketplace with categories and many details per app – use a page instead
- Two or three integrations – a simple list with switches is enough

### Usage

```tsx
import { IntegrationPicker } from "@/components/ui/integration-picker-clean";

export function Integrations() {
  return (
    <IntegrationPicker
      appName="affectUI"
      onToggle={(id, connected) => saveIntegration(id, connected)}
      onExplore={(id) => router.push(`/integrations/${id}`)}
      onBack={() => setPage("root")}
      onClose={closeMenu}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| integrations | `Integration[]` | `10 sample services` | Each { id, name, domain, category, description, features, path + color or icon, connected } |
| appName | `string` | `"affectUI"` | Your product's name in the title, e.g. “affectUI + Linear” |
| appIcon | `ReactNode` | `the affectUI mark` | Your product's mark on the black tile |
| defaultSelected | `string` | `the first item` | Id of the integration that is picked first |
| onToggle | `(id: string, connected: boolean) => void` |  | Called when an integration is switched on or off |
| onExplore | `(id: string) => void` |  | Called by “Explore integration” |
| onBack | `() => void` |  | Shows the back button and runs on ← in an empty search |
| onClose | `() => void` |  | Runs on Esc in an empty search |
| className | `string` |  | Extra class on the root |

### Keyboard

- ↑ / ↓: Move through the list
- ↵: Switch the picked integration on or off
- Esc: Clear the search, then close
- ←: Back to the parent page when the search is empty
- ⌘ / /: Jump into the search from anywhere (Ctrl / on Windows)

### Accessibility

- The search is a combobox that controls the list; the picked row is announced as the active option
- The connection switch is a real switch with a label that says what it will do
- Details update in a polite live region when the pick changes

### Motion

- The highlight steps quickly from row to row, also across the Connected and Available groups – no long glide
- The service tile swaps in with a short blur and lift; the arrows between the tiles turn once when connected
- While connected, a thin blue ring keeps spreading out from the tiles – paused when the picker is off screen
- With prefers-reduced-motion everything switches instantly

### Responsive

- Follows its own width: below 560px the list sits above the details and the key hints in the last row are left out; below 400px the capabilities are too
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19
