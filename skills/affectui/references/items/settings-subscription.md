# Settings / Billing (Pro)

Billing in the settings: the plan with the upcoming bill and usage, plans with monthly or yearly pricing and an add-on, billing address and card, invoices and cancel

- Page: https://www.affectui.com/screens/settings-subscription
- Section: Screens · App screens
- Install: `npx shadcn@latest add https://www.affectui.com/r/settings-subscription.json` (needs the Pro access key)
- Import: `@/components/ui/settings-subscription`

### When to use

- The billing page of an app's settings – plan, usage, invoices and payment in one place
- Seat-based plans with add-ons and a monthly or yearly price

### When not to use

- A public pricing page – use the Pricing Plans block
- Your own profile – use Settings / Profile

### Usage

```tsx
import { SettingsSubscriptionScreen } from "@/components/ui/settings-subscription";

export default function Page() {
  return <SettingsSubscriptionScreen onNavigate={(label) => router.push(routes[label])} />;
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| onNavigate | `(label: string) => void` |  | Called with a settings page – "Members" from Manage members and the seats' +, or "Back to app" |
| workspace | `string` | `"Acme"` | Workspace name, used by the shell |
| user | `{ name: string; avatar?: string }` |  | Account at the bottom of the sidebar |
| loading | `boolean` |  | While billing loads: the plan, the upcoming bill, usage, billing details and invoices as gray shapes in the shape of the real ones |
| empty | `boolean` |  | A new subscription: plan and usage stay, the history shows “No invoices yet” with a Preview first bill button |
| className | `string` |  | Extra class on the root |

### Accessibility

- Usage bars carry their share as a label; tables use table roles
- Show details and Compare plans are buttons with aria-expanded
- Cancel asks first in a small dialog; every action is announced in a status toast

### Responsive

- Fills its container – give it the full viewport height in your app
- In narrow panels the plan, cards and details stack and usage goes two by two
- Dark mode built in, from the App Shell tokens

### Requirements

- React 19
- @hugeicons/react
- @hugeicons/core-free-icons
- App Shell, Settings / Profile (its sidebar), Segmented Control and Button (installed with it)
