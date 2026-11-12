# App Shell Flat (Pro)

The App Shell laid flat – gray sidebar, an edge-to-edge page and the work area beside it, split by single hairlines

- Page: https://www.affectui.com/screens/app-shell-flat
- Section: Screens · App screens
- Install: `npx shadcn@latest add https://www.affectui.com/r/app-shell-flat.json` (needs the Pro access key)
- Import: `@/components/ui/app-shell-flat`

### When to use

- Tools and dashboards that should feel calm and edge to edge, like Linear or Notion
- Dense screens – tables, boards, editors – that want every pixel instead of a framed panel

### When not to use

- When the page should read as a card on a gray page – use App Shell Inset
- Marketing pages – use a block or a plain layout

### Usage

```tsx
import { AppShellFlat } from "@/components/ui/app-shell-flat";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AppShellFlat
      active="New chat"
      workspace="Acme"
      user={{ name: "Alex Morgan" }}
      onNavigate={(label) => router.push(routes[label])}
      workArea={{ newTab: { onOpen: (id) => openTool(id) } }}
    >
      <div className="ui-as-page">{children}</div>
    </AppShellFlat>
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| header | `{ title: ReactNode; actions?: ReactNode } \| false` | `the open page's name, share and more` | The header across the app – workspace and sidebar toggle, the page's title and actions, the work area's title; false for none |
| children | `ReactNode` |  | The page shown next to the sidebar |
| active | `string` |  | Label of the menu item or project that is open |
| onNavigate | `(label: string) => void` |  | Called with the label of a menu item or project when it is clicked |
| workspace | `string` | `"Acme"` | Workspace name; its first letter becomes the logo |
| user | `{ name: string; avatar?: string; email?: string }` | `{ name: "Alex Morgan" }` | Account at the bottom; without an avatar it shows initials. Its menu opens with picture, name and email, then language, appearance, integrations, settings, apps, changelog, help and log out |
| nav | `ShellNavItem[]` | `New chat, Folders, Integrations` | Menu items, each { label, icon } |
| projects | `string[]` |  | Project list under the menu |
| chats | `ShellChat[]` |  | Chats in the sidebar – with it the projects become folders that open and close and hold the chats whose folder they are; the rest under Pinned and Chats. A ⋯ menu (rename, pin, unread, project, section, share, copy, new window, archive) and a pin on hover; drag to reorder or into a folder |
| onOpenChat | `(chat: ShellChat) => void` |  | Called when a chat is clicked (default: onNavigate with its title) |
| groups | `ShellGroup[]` |  | Lists under the menu instead of Projects, e.g. Tools or Pipelines |
| workArea | `WorkAreaOptions \| WorkArea` |  | The work area on the right with tabs, like App Shell Inset's – your own tabs, artifacts in the shared viewers (document, sheet, folder, code, image) and New tabs; in Flat its tabs stand in the header's row |
| panel | `ReactNode` |  | Plain content for the work area – its one tab, named by panelTitle |
| className | `string` |  | Extra class on the root |

### Accessibility

- Sidebar items, projects and the collapse toggle are real buttons with labels; folded to a rail, each icon names itself in a tooltip
- Icons are decorative and hidden from screen readers

### Responsive

- Fills its container – give it the full viewport height in your app
- Below 900px the sidebar becomes a drawer that slides in over the page, the work area one from the right
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- Same props and the same page classes (.ui-as-page, .ui-as-page-title) as App Shell Inset – swap one for the other without touching the screens inside

### Requirements

- React 19
- @hugeicons/react
- @hugeicons/core-free-icons
- App Shell Inset (installed with it)

Related: app-shell
