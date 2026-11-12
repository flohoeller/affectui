# Settings / Notifications (Pro)

Notification settings with a settings sidebar: a daily digest with its time, a table of notification types each sent by email, mobile, both or only to the inbox, and quiet hours at night

- Page: https://www.affectui.com/screens/settings-notifications
- Section: Screens · App screens
- Install: `npx shadcn@latest add https://www.affectui.com/r/settings-notifications.json` (needs the Pro access key)
- Import: `@/components/ui/settings-notifications`

### When to use

- The notifications page of a person's settings
- Any list of event types that each need a delivery choice

### When not to use

- The notifications themselves – use the Notification Center
- Workspace-wide rules every member gets – put those under Settings / General

### Usage

```tsx
import { SettingsNotificationsScreen } from "@/components/ui/settings-notifications";

export default function Page() {
  return (
    <SettingsNotificationsScreen
      notifications={settings}
      onSave={(notifications) => saveNotifications(notifications)}
      onNavigate={(label) => router.push(routes[label])}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| notifications | `NotificationValues` |  | Digest on and its time, the weekly report, the types (id, title, note, channel: both, email, mobile or inbox) and quiet hours with from and to – the sample person when left out |
| onSave | `(notifications: NotificationValues) => void` |  | Called with all settings whenever something changes |
| onNavigate | `(label: string) => void` |  | Called with the label of a sidebar item |
| workspace | `string` |  | Workspace name in the sidebar |
| user | `{ name: string; avatar?: string }` |  | Account at the bottom of the sidebar |
| loading | `boolean` |  | While the settings load: the switches, times and each type's channel as gray shapes in the shape of the real ones |
| className | `string` |  | Extra class on the root |

### Accessibility

- Switches use role="switch" with aria-checked and the row's title as their name
- Each channel menu is labelled with its type, e.g. "Where to send Mentions"; the table head's Notify on sets every row at once
- Rows that only appear with their switch (digest time, quiet hours) rise in and stand still with prefers-reduced-motion

### Responsive

- Fills its container – give it the full viewport height in your app
- Below 600px each select moves under its label and the table head keeps only Notify on
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"; colors are CSS variables on .ui-as

### Requirements

- React 19
- @hugeicons/react
- @hugeicons/core-free-icons
- App Shell, Settings / Profile (its sidebar), Settings / General and Settings / Security (their rows, switches and selects)
