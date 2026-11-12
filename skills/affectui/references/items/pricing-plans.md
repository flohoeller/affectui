# Pricing Plans (Pro)

Pricing section with a monthly / yearly switch, three plan cards and collapsible details

- Page: https://www.affectui.com/blocks/pricing-plans
- Section: Blocks · Pricing
- Install, classic style: `npx shadcn@latest add https://www.affectui.com/r/pricing-plans.json` (needs the Pro access key)
- Install, clean style: `npx shadcn@latest add https://www.affectui.com/r/pricing-plans-clean.json` (needs the Pro access key) – lands as `pricing-plans-clean.tsx`, import from `@/components/ui/pricing-plans-clean` – its docs: `pricing-plans-clean.md`
- Import: `@/components/ui/pricing-plans`

### When to use

- A pricing page or section with up to three plans and a monthly / yearly choice
- Plans that differ in a few limits plus a longer list of features

### When not to use

- One-time purchases – drop the billing switch or use a simpler card
- More than three or four plans – use a comparison table instead

### Usage

```tsx
import { PricingPlans } from "@/components/ui/pricing-plans";

export function Pricing() {
  return <PricingPlans plans={plans} defaultBilling="yearly" />;
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| plans | `Plan[]` |  | Name, monthly and yearly price, limits, sync chip, features and an onSelect callback. One to three plans sit side by side, four two by two; a price that is not a number reads “Custom”; none shows a short empty note |
| title | `string` | `"Choose your plan"` | Section heading |
| subtitle | `string` |  | Line under the heading |
| defaultBilling | `"monthly" \| "yearly"` | `"yearly"` | Billing period shown first |
| currency | `string` | `"$"` | Symbol in front of the prices, or a three-letter code like "EUR" to format them as that currency (cents only when a price has them) |
| className | `string` |  | Extra class on the section |

### Keyboard

- Tab: Move between the switch, the buttons and the detail toggles
- Enter / Space: Switch the billing period, start a plan or show / hide details

### Accessibility

- The billing switch is a radio group
- Details toggles use aria-expanded; hidden details are inert
- Features that are not included are announced as such

### Motion

- The switch thumb slides; prices roll digit by digit after a switch
- Details fold open and closed; reduced motion turns this off

### Responsive

- Three columns on wide screens, one column below 860px
- Long plan names, badges, limit labels, sync chips and button labels stay on one line with an ellipsis and show in full on hover; feature labels wrap
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19
