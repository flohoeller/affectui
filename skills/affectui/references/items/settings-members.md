# Settings / Teams (Pro)

Members and teams in the settings: seats at a glance, search, role filter, export and invite, members with role, plan and usage, bulk changes, and teams

- Page: https://www.affectui.com/screens/settings-members
- Section: Screens · App screens
- Install: `npx shadcn@latest add https://www.affectui.com/r/settings-members.json` (needs the Pro access key)
- Import: `@/components/ui/settings-members`

### When to use

- The members page of a workspace's settings
- Seat-based plans where admins invite, change roles and remove people

### When not to use

- Plans, payment and invoices – use Settings / Billing
- A public team or about page

### Usage

```tsx
import { SettingsMembersScreen } from "@/components/ui/settings-members";

export default function Page() {
  return (
    <SettingsMembersScreen
      me={user.id}
      members={members}
      teams={teams}
      onNavigate={(label) => router.push(routes[label])}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| members | `Member[]` |  | { id, name?, email, role, plan, usage (0–1), invited? } – the sample members when left out |
| teams | `Team[]` |  | { id, name, members: member ids } |
| me | `string` | `"alex"` | Id of the person looking – marked (You) and never removed |
| defaultTab | `"Members" \| "Teams"` | `"Members"` | Tab that is open first |
| onNavigate | `(label: string) => void` |  | Called with the label of a settings page, or "Back to app" |
| loading | `boolean` |  | While the members load: the numbers, the table's rows and the teams as gray shapes in the shape of the real ones; counts are hidden |
| empty | `boolean` |  | No one yet: the numbers at zero, “No members yet” with an Invite members button in the table's place and “No teams yet” with New team on the Teams tab |
| className | `string` |  | Extra class on the root |

### Accessibility

- The table uses table roles; every checkbox, role, plan and row menu carries the person's name in its label
- Invite is a small form: Enter sends, Escape closes
- Every change is announced in a status toast

### Responsive

- Fills its container – give it the full viewport height in your app
- In narrow panels the numbers stack, search takes its own line and plan and usage give way to name and role
- Dark mode built in, from the App Shell tokens

### Requirements

- React 19
- @hugeicons/react
- @hugeicons/core-free-icons
- App Shell, Settings / Profile (its sidebar), Filter Menu and Button (installed with it)
