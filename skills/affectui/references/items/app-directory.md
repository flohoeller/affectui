# App Directory (Pro)

Browse, search and connect integrations – categories, filters and app cards with a connect flow

- Page: https://www.affectui.com/blocks/app-directory
- Section: Blocks · Integrations
- Install, classic style: `npx shadcn@latest add https://www.affectui.com/r/app-directory.json` (needs the Pro access key)
- Install, clean style: `npx shadcn@latest add https://www.affectui.com/r/app-directory-clean.json` (needs the Pro access key) – lands as `app-directory-clean.tsx`, import from `@/components/ui/app-directory-clean` – its docs: `app-directory-clean.md`
- Import: `@/components/ui/app-directory`

### When to use

- An integrations or marketplace page in a SaaS product
- Settings screens where people connect and disconnect third-party tools

### When not to use

- Two or three integrations – a short list in settings is enough
- Hundreds of apps – add server-side search and paging

### Usage

```tsx
import { AppDirectory } from "@/components/ui/app-directory";

export function Integrations() {
  return <AppDirectory apps={apps} onToggle={(app, connected) => save(app.id, connected)} />;
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| apps | `App[]` |  | id, name, vendor, description, categories, logo, tile color, essential and connected |
| categories | `AppCategory[]` |  | Sidebar entries with id, label and icon – essentials and all are built in |
| title | `string` | `"Integrations"` | Heading inside the card |
| subtitle | `string` |  | Line under the heading |
| onToggle | `(app: App, connected: boolean) => void` |  | Called after an app was connected or disconnected |
| className | `string` |  | Extra class on the block |

### Keyboard

- Tab: Move through search, filter, categories and the connect buttons
- Escape: Close the filter menu

### Accessibility

- Search has a label, the filter is a menu of radio items, the current category is marked
- Connect buttons say which app they connect; the result heading is a live region

### Motion

- Cards fade in, connecting shows a spinner, the filter menu drops in – reduced motion turns this off

### Responsive

- Three columns with a sidebar on wide containers; below 820px the categories become a row of chips and the grid two columns; below 560px one column
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19
