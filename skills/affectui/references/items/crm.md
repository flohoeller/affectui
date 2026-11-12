# CRM (Pro)

Company list with pipelines, open views as tabs and an editable data table

- Page: https://www.affectui.com/screens/crm
- Section: Screens · App screens
- Install: `npx shadcn@latest add https://www.affectui.com/r/crm.json` (needs the Pro access key)
- Import: `@/components/ui/crm`

### When to use

- Sales, customer or partner lists in an internal tool
- Any record list people edit like a spreadsheet

### When not to use

- Read-only reports – use a static table or the Analytics screen

### Usage

```tsx
import { CrmScreen } from "@/components/ui/crm";

export default function Page() {
  return <CrmScreen workspace="Acme" user={{ name: "Alex Morgan" }} onNavigate={(label) => router.push(routes[label])} />;
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| onNavigate | `(label: string) => void` |  | Called with the label of a sidebar item |
| workspace | `string` | `"Acme"` | Workspace name in the sidebar |
| user | `{ name: string; avatar?: string }` | `{ name: "Alex Morgan" }` | Account at the bottom of the sidebar |
| loading | `boolean` |  | While your data loads: the open view's table shows gray rows in the shape of the real ones, under the real column heads, so nothing jumps when the data lands |
| empty | `boolean` |  | No companies yet: path and view tabs stay, the open view’s table gives way to an empty state with its own title and line (“No companies yet”, “No deals yet” …) and an Add company or Add contact button |
| onAdd | `(view: string) => void` |  | Called by the empty state’s button with the open view |
| className | `string` |  | Extra class on the root |
| companies | `{ id; name; category; domain; owner; value: number; stage; contact }[]` |  | Companies behind all four tables (Company CRM, Deals, Contacts, Renewals) – the id picks the logo, otherwise the first letter shows |

### Accessibility

- Sidebar items, tabs and toolbar actions are real buttons with labels
- Icons are decorative and hidden from screen readers

### Responsive

- Fills its container – give it the full viewport height in your app
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"; colors are CSS variables on .ui-as

### Requirements

- React 19
- @hugeicons/react
- @hugeicons/core-free-icons
- App Shell, Data Table and Button (installed with it)
