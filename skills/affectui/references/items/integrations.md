# Integrations (Pro)

App directory with a sticky header, categories, search and connect states

- Page: https://www.affectui.com/screens/integrations
- Section: Screens · App screens
- Install: `npx shadcn@latest add https://www.affectui.com/r/integrations.json` (needs the Pro access key)
- Import: `@/components/ui/integrations`

### When to use

- Settings or marketplace pages that list apps to connect
- Showing which tools are connected at a glance

### When not to use

- Fewer than six apps – a simple list is enough

### Usage

```tsx
import { IntegrationsScreen } from "@/components/ui/integrations";

export default function Page() {
  return <IntegrationsScreen workspace="Acme" user={{ name: "Alex Morgan" }} onNavigate={(label) => router.push(routes[label])} />;
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| onNavigate | `(label: string) => void` |  | Called with the label of a sidebar item or project |
| workspace | `string` | `"Acme"` | Workspace name in the sidebar |
| user | `{ name: string; avatar?: string }` | `{ name: "Alex Morgan" }` | Account at the bottom of the sidebar |
| loading | `boolean` |  | While your data loads: two sections of gray rows in the shape of the integrations (the shared Skeleton), so nothing jumps when the data lands |
| empty | `boolean` |  | No integrations at all: the title, tabs, search and Request stay, the list shows “No integrations yet” with a short line and a Request integration button that opens the request form; loading wins when both are on |
| className | `string` |  | Extra class on the root |

### Accessibility

- Sidebar items, projects and the collapse toggle are real buttons with labels
- Icons are decorative and hidden from screen readers

### Responsive

- Fills its container – give it the full viewport height in your app
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"; colors are CSS variables on .ui-as

### Requirements

- React 19
- @hugeicons/react
- @hugeicons/core-free-icons
- App Shell (installed with it)
