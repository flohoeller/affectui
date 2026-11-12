# Folders / Overview (Pro)

Folder overview with tabs, search, sort, grid/list toggle and file templates

- Page: https://www.affectui.com/screens/files
- Section: Screens · App screens
- Install: `npx shadcn@latest add https://www.affectui.com/r/files.json` (needs the Pro access key)
- Import: `@/components/ui/files`

### When to use

- File, knowledge or document areas in an app
- Overviews of projects or workspaces as cards

### When not to use

- Thousands of files – use a virtualised table

### Usage

```tsx
import { FilesScreen } from "@/components/ui/files";

export default function Page() {
  return <FilesScreen workspace="Acme" user={{ name: "Alex Morgan" }} onNavigate={(label) => router.push(routes[label])} />;
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| onNavigate | `(label: string) => void` |  | Called with the label of a sidebar item or project |
| workspace | `string` | `"Acme"` | Workspace name in the sidebar |
| user | `{ name: string; avatar?: string }` | `{ name: "Alex Morgan" }` | Account at the bottom of the sidebar |
| loading | `boolean` |  | While your data loads: both sections show gray placeholders in the shape of their cards (the shared Skeleton), so nothing jumps when the data lands |
| empty | `boolean` |  | No data at all: Folders shows “No folders yet” with a New folder button and File templates “No templates yet” with an Add template button; the tabs, search and actions stay |
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
