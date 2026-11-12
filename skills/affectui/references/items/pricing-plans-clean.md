# Pricing Plans, clean style (Pro)

Pricing section with a monthly / yearly switch, three plan cards and collapsible details

- Page: https://www.affectui.com/blocks/pricing-plans
- Section: Blocks · Pricing
- Install: `npx shadcn@latest add https://www.affectui.com/r/pricing-plans-clean.json` (needs the Pro access key)
- Import: `@/components/ui/pricing-plans-clean`

### When to use

- A pricing page or section with up to three plans and a monthly / yearly choice
- Plans that differ in a few limits plus a longer list of features

### When not to use

- One-time purchases – drop the billing switch or use a simpler card
- More than three or four plans – use a comparison table instead

### Usage

```tsx
import { PricingPlans } from "@/components/ui/pricing-plans-clean";

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
- ← / →: Switch the billing period – the switch is one tab stop
- Enter / Space: Start a plan or show / hide details

### Accessibility

- The billing switch is a radio group
- Details toggles use aria-expanded; hidden details are inert
- Features that are not included are announced as such

### Motion

- The white chip slides to the chosen period and takes its width; prices roll digit by digit after a switch
- Details fold open and closed; reduced motion turns this off

### Responsive

- Three columns on wide screens, one column below 860px
- Yearly shows the biggest saving any plan gets (e.g. −20%); it disappears when yearly isn't cheaper
- The plan with a badge gets the one dark button and an accent hairline; the others get white buttons
- Long plan names, badges, limit labels, sync chips and button labels stay on one line with an ellipsis and show in full on hover; feature labels wrap
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19
