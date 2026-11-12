# Settings / Security (Pro)

Security settings with a settings sidebar: email domains to verify, sign-in rules with SSO and two-step verification, the identity provider details to copy, an IP allowlist and a danger zone that signs everyone out

- Page: https://www.affectui.com/screens/settings-security
- Section: Screens · App screens
- Install: `npx shadcn@latest add https://www.affectui.com/r/settings-security.json` (needs the Pro access key)
- Import: `@/components/ui/settings-security`

### When to use

- The security page of a workspace's settings
- Admin pages with domains, single sign-on and network rules

### When not to use

- A single member's password or devices – put those under Settings / Profile
- The workspace's name and address – use Settings / General

### Usage

```tsx
import { SettingsSecurityScreen } from "@/components/ui/settings-security";

export default function Page() {
  return (
    <SettingsSecurityScreen
      security={settings}
      onSave={(security) => saveSecurity(security)}
      onVerifyDomain={(domain) => api.checkTxtRecord(domain)}
      onSignOutAll={() => api.revokeSessions()}
      onNavigate={(label) => router.push(routes[label])}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| security | `SecurityValues` |  | Domains, join by domain, SSO, metadata URL, two-step verification, session length and IP ranges – the sample workspace when left out |
| onSave | `(security: SecurityValues) => void` |  | Called with all settings whenever something changes – switches and lists at once, the metadata URL on blur |
| onVerifyDomain | `(domain: string) => Promise<boolean>` |  | Checks the domain's TXT record; resolve true once it is found. The demo waits a moment and says yes |
| onSignOutAll | `() => void` |  | Called once signing everyone out is confirmed |
| onNavigate | `(label: string) => void` |  | Called with the label of a sidebar item |
| workspace | `string` |  | Workspace name in the sidebar |
| user | `{ name: string; avatar?: string }` |  | Account at the bottom of the sidebar |
| loading | `boolean` |  | While the settings load: the domains, switches, session length, identity provider and IP ranges as gray shapes in the shape of the real ones |
| empty | `boolean` |  | Nothing set up yet: “No domains yet” with Add domain and “No IP ranges” with Add range in the lists' place; SSO and joining stay off |
| className | `string` |  | Extra class on the root |

### Accessibility

- Switches use role="switch" with aria-checked; a switch that needs a verified domain is disabled and says why
- Adding a domain or range is a small form: Enter adds, Escape cancels; wrong input answers with a toast
- Copy buttons turn into a check for a moment; read-only fields select their text on focus
- Remove buttons show on hover and on keyboard focus, always on touch screens

### Responsive

- Fills its container – give it the full viewport height in your app
- Below 600px each control moves under its label; switches and the domain rows stay on one line
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"; colors are CSS variables on .ui-as

### Requirements

- React 19
- @hugeicons/react
- @hugeicons/core-free-icons
- App Shell, Settings / Profile (its sidebar), Settings / General (its rows) and Button (installed with it)
