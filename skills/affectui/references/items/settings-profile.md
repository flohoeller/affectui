# Settings / Profile (Pro)

Profile settings with a settings sidebar: picture, name, role and email as rows, time preferences, personal context for the assistant and the password

- Page: https://www.affectui.com/screens/settings-profile
- Section: Screens · App screens
- Install: `npx shadcn@latest add https://www.affectui.com/r/settings-profile.json` (needs the Pro access key)
- Import: `@/components/ui/settings-profile`

### When to use

- The profile page of an app's settings
- Any settings page built of labelled rows – copy a row and swap its control

### When not to use

- Plans, payment and invoices – use Settings / Billing
- Sign-up and onboarding – use Onboarding

### Usage

```tsx
import { SettingsProfileScreen } from "@/components/ui/settings-profile";

export default function Page() {
  return (
    <SettingsProfileScreen
      profile={{ firstName: "Alex", lastName: "Morgan", email: "alex@acme.com", timezone: "Europe/Vienna", weekStart: "Monday", context: "" }}
      onSave={(profile) => saveProfile(profile)}
      onNavigate={(label) => router.push(routes[label])}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| profile | `ProfileValues` |  | firstName, lastName, email, role?, timezone, weekStart, context, avatar?, hasPassword? – the sample profile when left out |
| onSave | `(profile: ProfileValues) => void` |  | Called with the whole profile whenever something is saved – text on blur, choices at once |
| onNavigate | `(label: string) => void` |  | Called with the label of a settings page, or "Back to app" |
| workspace | `string` | `"Acme"` | Workspace name, used by the shell |
| loading | `boolean` |  | While the profile loads: the picture, fields, choices, personal context and password note as gray shapes in the shape of the real ones |
| className | `string` |  | Extra class on the root |

### Accessibility

- Every field has a visible label; the picture's remove button and the selects carry their own labels
- Selects open the shell's menu – arrow keys move, Enter picks, Escape closes
- Saves are announced in a status toast

### Responsive

- Fills its container – give it the full viewport height in your app
- In narrow panels each control moves under its label and takes the full width
- Dark mode built in, from the App Shell tokens

### Requirements

- React 19
- @hugeicons/react
- @hugeicons/core-free-icons
- App Shell and Button (installed with it)
