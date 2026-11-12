# Onboarding / Website (Pro)

First step of setting up an AI assistant: the website, docs and help center it should learn from as chips on the left; on the right the assistant's dashboard as a large loading state, where each domain lands in its Knowledge table

- Page: https://www.affectui.com/screens/onboarding-website
- Section: Screens · App screens
- Install: `npx shadcn@latest add https://www.affectui.com/r/onboarding-website.json` (needs the Pro access key)
- Import: `@/components/ui/onboarding-website`

### When to use

- The first step after sign-up for an AI assistant or agent that learns from a company's own pages
- Flows where every answer visibly sets up the product people are about to use – the dashboard glides to where each answer lands

### When not to use

- In-app setup inside an existing workspace – use the Onboarding screen
- Long forms with many fields – use the Stepper Form

### Usage

```tsx
import { OnboardingWebsiteScreen } from "@/components/ui/onboarding-website";

export default function Page() {
  return (
    <OnboardingWebsiteScreen
      email={session.user.email}
      defaultDomains={[session.user.email.split("@")[1]]}
      onContinue={(domains) => api.saveDomains(domains).then(() => router.push("/onboarding/brand"))}
      onLogout={signOut}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| defaultDomains | `string[]` | `[]` | Domains already known, e.g. from the sign-up email; the first one is the company's own |
| onContinue | `(domains: string[]) => void` |  | Called with the cleaned-up domains (no https://, www. or paths) when Continue is pressed |
| onBack | `() => void` |  | Shows Back in the top bar – leave it out on the first step |
| onLogout | `() => void` |  | Called by Log out |
| email | `string` | `"alex@northwind.com"` | The signed-in account, top right |
| product | `string` | `"Lumen"` | Your product's name, for the logo label and the footer |
| layout | `"inset" \| "flat"` |  | The dashboard picture like the App Shell: main area as a rounded panel on the gray page, or edge to edge. Left out, it follows data-shell="flat" on an ancestor |
| autoFocus | `boolean` | `false` | Focus the first field when the step opens (Ready: Open dashboard) – turn it on in a real flow so the keyboard carries on from step to step |
| step / steps | `number` | `1 / 4` | Where this step sits in the flow – one dash per step under the top |
| autoType | `string` |  | Types this into the field once on load, for demos and recordings; stops when someone types |
| className | `string` |  | Extra class on the root |

### Accessibility

- One form: Enter adds what's in the field as a chip, Enter on the empty field continues; comma or space adds too
- Every chip has a remove button; Backspace in the empty field takes the last chip back
- Invalid domains are marked with aria-invalid and explained in a polite live hint under the field
- The dashboard on the right is decoration and hidden from assistive tech
- Animations turn off with prefers-reduced-motion

### Responsive

- Fills its container – give it the full viewport height
- The step sits centered in the left half; the dashboard starts at the middle and runs off the right edge
- Below 900px the step takes the full width and the dashboard fades back behind it
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19
- @hugeicons/react
- @hugeicons/core-free-icons
