# Folders / Detail (Pro)

Inside one folder: breadcrumbs, file cards with previews, and an empty state

- Page: https://www.affectui.com/screens/folder
- Section: Screens · App screens
- Install: `npx shadcn@latest add https://www.affectui.com/r/folder.json` (needs the Pro access key)
- Import: `@/components/ui/folder`

### When to use

- Detail view of a project, folder or collection
- Pairs with Folders / Overview

### When not to use

- Nested trees deeper than one level

### Usage

```tsx
import { FolderScreen } from "@/components/ui/folder";

export default function Page() {
  return <FolderScreen folder="Q3 Campaign" workspace="Acme" user={{ name: "Alex Morgan" }} onNavigate={(label) => router.push(routes[label])} />;
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| folder | `string` | `"Q3 Campaign"` | Folder that is open – the title, crumbs and files follow it |
| onNavigate | `(label: string) => void` |  | Called with the label of a sidebar item or project |
| workspace | `string` | `"Acme"` | Workspace name in the sidebar |
| user | `{ name: string; avatar?: string }` | `{ name: "Alex Morgan" }` | Account at the bottom of the sidebar |
| loading | `boolean` |  | While your data loads: gray file cards in the shape of the real ones; the title, crumbs and actions stay |
| empty | `boolean` |  | No files in the folder: “No files yet” with a short hint and a Work in folder button that starts a chat; uploads still land in the list |
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
- App Shell Inset (installed with it)
