# Onboarding / Brand (Pro)

Second step of setting up an AI assistant: the company's name and the short forms customers use as chips, suggested from the website before; the dashboard glides up to the assistant's card, where its name, greeting and tags fill in as you type

- Page: https://www.affectui.com/screens/onboarding-brand
- Section: Screens · App screens
- Install: `npx shadcn@latest add https://www.affectui.com/r/onboarding-brand.json` (needs the Pro access key)
- Import: `@/components/ui/onboarding-brand`

### When to use

- The step after the website when setting up an AI assistant that speaks for a company
- Anywhere one thing goes by several names – short forms, old names – and the product should know all of them

### When not to use

- A single plain name field in a settings page – use a Text Field
- Free-form tags – use the Tag Input

### Usage

```tsx
import { OnboardingBrandScreen } from "@/components/ui/onboarding-brand";

export default function Page() {
  return (
    <OnboardingBrandScreen
      domain={draft.domains[0]}
      email={session.user.email}
      onBack={() => router.push("/onboarding/website")}
      onContinue={(names) => api.saveNames(names).then(() => router.push("/onboarding/tone"))}
      onLogout={signOut}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| domain | `string` | `"northwind.com"` | The website from the step before – suggests the first name (northwind.com → Northwind) |
| defaultNames | `string[]` |  | Names already known; replaces the suggestion. The first one is the name the assistant uses |
| onContinue | `(names: string[]) => void` |  | Called with the names, the one the assistant uses first, when Continue is pressed |
| onBack | `() => void` |  | Shows Back in the top bar |
| onLogout | `() => void` |  | Called by Log out |
| email | `string` | `"alex@northwind.com"` | The signed-in account, top right |
| product | `string` | `"Lumen"` | Your product's name, for the logo label and the footer |
| logo | `ReactNode` |  | Your logo, top left – the affectUI mark when left out |
| layout | `"inset" \| "flat"` |  | The dashboard picture like the App Shell. Left out, it follows data-shell="flat" on an ancestor |
| autoFocus | `boolean` | `false` | Focus the first field when the step opens (Ready: Open dashboard) – turn it on in a real flow so the keyboard carries on from step to step |
| step / steps | `number` | `2 / 4` | Where this step sits in the flow |
| autoType | `string` |  | Types this into the field once on load, for demos and recordings; stops when someone types |
| className | `string` |  | Extra class on the root |

### Accessibility

- One form: Enter or a comma adds a name as a chip; Enter on the empty field continues
- Every chip has a remove button; Backspace in the empty field takes the last chip back
- The count of names is announced in a polite live line under the chips
- The dashboard on the right is decoration and hidden from assistive tech
- Animations turn off with prefers-reduced-motion

### Responsive

- Fills its container – give it the full viewport height
- Same layout as Onboarding / Website, so moving between the steps nothing jumps
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19
- @hugeicons/react
- @hugeicons/core-free-icons
- Onboarding / Website (installed with it – frame, field and dashboard come from there)
