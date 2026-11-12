# Settings / General (Pro)

Workspace settings with a settings sidebar: icon, name and address as rows, a company context for the assistant and a danger zone that asks for the name

- Page: https://www.affectui.com/screens/settings-general
- Section: Screens · App screens
- Install: `npx shadcn@latest add https://www.affectui.com/r/settings-general.json` (needs the Pro access key)
- Import: `@/components/ui/settings-general`

### When to use

- The general page of a workspace's settings
- Any settings page with a free-text field the assistant reads, like a company or team context

### When not to use

- Your own profile – use Settings / Profile
- Plans, payment and invoices – use Settings / Billing

### Usage

```tsx
import { SettingsGeneralScreen } from "@/components/ui/settings-general";

export default function Page() {
  return (
    <SettingsGeneralScreen
      workspace={{ name: "Acme", slug: "acme", context: "" }}
      onSave={(workspace) => saveWorkspace(workspace)}
      onDelete={() => deleteWorkspace()}
      onNavigate={(label) => router.push(routes[label])}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| workspace | `{ name: string; slug: string; context: string; icon?: string }` |  | The workspace – the sample workspace when left out |
| onSave | `(workspace: WorkspaceValues) => void` |  | Called with the whole workspace whenever something is saved – text on blur, the icon at once |
| onDelete | `() => void` |  | Called once the deletion is confirmed by typing the workspace's name |
| onNavigate | `(label: string) => void` |  | Called with the label of a settings page, or "Back to app" |
| user | `{ name: string; avatar?: string }` |  | Account at the bottom of the sidebar |
| loading | `boolean` |  | While the workspace loads: its icon, name, address and company context as gray shapes in the shape of the real ones |
| className | `string` |  | Extra class on the root |

### Accessibility

- Every field has a visible label; the icon's remove button and the field size button carry their own labels
- Deleting asks for the workspace's name first; the button stays disabled until it matches
- Saves are announced in a status toast

### Responsive

- Fills its container – give it the full viewport height in your app
- Below 600px each control moves under its label, full width
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"; colors are CSS variables on .ui-as

### Requirements

- React 19
- @hugeicons/react
- @hugeicons/core-free-icons
- App Shell, Settings / Profile (its sidebar) and Button (installed with it)
