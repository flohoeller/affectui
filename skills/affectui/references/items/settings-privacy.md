# Settings / Privacy (Pro)

Privacy settings with a settings sidebar: switches for ad measurement, analytics and training on chats, this browser's cookies, product emails, active sessions to sign out, chats shared by link and a danger zone to export or delete every chat

- Page: https://www.affectui.com/screens/settings-privacy
- Section: Screens · App screens
- Install: `npx shadcn@latest add https://www.affectui.com/r/settings-privacy.json` (needs the Pro access key)
- Import: `@/components/ui/settings-privacy`

### When to use

- The privacy page of a person's settings in an AI product
- Pages that list sessions or shared links someone may want to revoke

### When not to use

- Workspace-wide sign-in rules – use Settings / Security
- Which notifications go where – use Settings / Notifications

### Usage

```tsx
import { SettingsPrivacyScreen } from "@/components/ui/settings-privacy";

export default function Page() {
  return (
    <SettingsPrivacyScreen
      privacy={settings}
      onSave={(privacy) => savePrivacy(privacy)}
      onExport={() => api.startExport()}
      onDeleteChats={() => api.deleteAllChats()}
      onNavigate={(label) => router.push(routes[label])}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| privacy | `PrivacyValues` |  | The switches, this browser's cookies, product emails, sessions (device, name, meta, current) and shared chats (title, scope, shared, views) – the sample person when left out |
| onSave | `(privacy: PrivacyValues) => void` |  | Called with all settings whenever something changes, signing out a session and stopping a share included |
| onExport | `() => void` |  | Called when an export of every chat and file is requested |
| onDeleteChats | `() => void` |  | Called once deleting every chat is confirmed |
| onNavigate | `(label: string) => void` |  | Called with the label of a sidebar item |
| workspace | `string` |  | Workspace name in the sidebar |
| user | `{ name: string; avatar?: string }` |  | Account at the bottom of the sidebar |
| loading | `boolean` |  | While the settings load: the switches, the email subscription, sessions and shared chats as gray shapes in the shape of the real ones; counts are hidden |
| empty | `boolean` |  | Nothing shared yet: only this device signed in, and “No shared chats” (or “No public links”) with an Open chats button in the shared chats' place |
| className | `string` |  | Extra class on the root |

### Accessibility

- Switches use role="switch" with aria-checked; Manage cookies has aria-expanded and opens its choices right below
- The shared chats' filter is a tab list; stopping a share is a button named after the chat
- The current device can't be signed out from here – it carries a This device badge instead of a button
- Deleting every chat asks once more before it happens

### Responsive

- Fills its container – give it the full viewport height in your app
- Below 600px controls move under their labels; sessions and shared chats keep their action beside them
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"; colors are CSS variables on .ui-as

### Requirements

- React 19
- @hugeicons/react
- @hugeicons/core-free-icons
- App Shell, Settings / Profile (its sidebar), Settings / General and Settings / Security (their rows, switches and badges), Button and Segmented Control (installed with it)
