# Model Router (Pro)

How a gateway splits its traffic across AI models – streaks of light into each model's line, as wide as its share; pick Cost, Balanced or Quality and the split and price change

- Page: https://www.affectui.com/components/model-router
- Section: Components · Agents
- Install, classic style: `npx shadcn@latest add https://www.affectui.com/r/model-router.json` (needs the Pro access key)
- Install, clean style: `npx shadcn@latest add https://www.affectui.com/r/model-router-clean.json` (needs the Pro access key) – lands as `model-router-clean.tsx`, import from `@/components/ui/model-router-clean` – its docs: `model-router-clean.md`
- Import: `@/components/ui/model-router`

### When to use

- Showing how an AI gateway splits its traffic across models – and letting people pick a strategy for it
- Comparing what a cheaper or a stronger split would cost against the policy that's live, before deploying it
- Setting a fallback model that takes over when another one fails

### When not to use

- How much each model was used over a period – use Model Usage
- Picking one model for a chat – use Model Picker
- Requests routed to agents rather than models – use Agent Router

### Usage

```tsx
import { ModelRouter, type RouterModel, type RouterStrategy } from "@/components/ui/model-router";

const models: RouterModel[] = [
  { id: "opus", name: "Claude Opus 5.5", provider: "Anthropic", logo: <ClaudeLogo />, p95: 2.16, cost: 0.0126 },
  { id: "gpt", name: "GPT-5.5", provider: "OpenAI", logo: <OpenAILogo />, p95: 1.34, cost: 0.0048 },
  { id: "flash", name: "Gemini 3 Flash", provider: "Google", logo: <GeminiLogo />, p95: 0.64, cost: 0.0007 },
];

const strategies: RouterStrategy[] = [
  { id: "cost", label: "Cost", shares: { opus: 6, gpt: 30, flash: 64 } },
  { id: "balanced", label: "Balanced", shares: { opus: 20, gpt: 50, flash: 30 } },
  { id: "quality", label: "Quality", shares: { opus: 60, gpt: 32, flash: 8 } },
];

export function Router() {
  return (
    <ModelRouter
      models={models}
      strategies={strategies}
      live={{ strategy: "balanced", fallback: { enabled: true, from: "opus", to: "gpt" } }}
      version={14}
      environment="chat-prod"
      onDeploy={(policy) => savePolicy(policy)}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| models | `RouterModel[]` |  | The models the gateway routes to, top to bottom – each a line in the flow and a row in the table |
| RouterModel | `{ id, name, provider?, logo?, color?, p95, cost }` |  | p95 is the latency in seconds, cost the price per 1K tokens in dollars; provider shows on hover |
| strategies | `{ id, label, shares }[]` |  | The switch on top – shares are each model's part of the traffic by id, scaled to add up to 100% |
| live | `{ strategy, fallback: { enabled, from, to } }` |  | The policy that's live now – where it starts, and what the blended cost is compared to |
| version | `number` |  | The live policy's version – "Policy v14"; it goes up by one with every deploy |
| environment | `string` |  | Where it runs – "chat-prod", shown in the header and the footer |
| onDeploy | `(policy) => void \| Promise<void>` |  | Deploys the policy – while a returned promise runs the button says Deploying |
| onChange | `(policy) => void` |  | Every edit to the strategy or the fallback |
| title | `string` |  | The heading and the section's accessible name |
| className | `string` |  | Extra class on the root – set the color variables on it |

### Accessibility

- The strategy switch is a radio group with one tab stop – arrows move between Cost, Balanced and Quality
- The fallback is a switch with its state; each model picker opens a menu with Enter, Space or the arrows – arrows, Home and End move, Enter picks, Esc closes and puts focus back, Tab leaves it
- Revert moves focus to Deploy, so it never gets lost when the button goes away
- The routes are a real table with column and row headers
- The footer says Live, Unsaved changes or Deploying in words and is announced as it changes; Deploy is aria-disabled until something changed
- The flow is decoration and hidden from screen readers – the table carries the numbers
- A focus ring shows only for the keyboard

### Motion

- Streaks of light run along each line, gateway to model, as often as its share – they fade in, are full in the middle and fade out
- Switching the strategy eases every band and share bar to its new width, and the cost and shares roll to their new values
- Pointing at a line or a row brings that model forward everywhere and fades the rest
- Reduced motion stops the streaks and the rolls – the numbers simply change

### Responsive

- Fills its container's width – the lines stretch, the model names stay on the right
- Below 440px the strategy switch moves under the cost and the table keeps share and price
- Below 380px the fallback's pickers show just the model's logo – the name is in their label and their menu – so the rule stays on one line
- Long model names, strategy labels and the environment end in … with the full text on hover; long strategy lists wrap
- One model hides the fallback; no models at all reads No models to route to
- A fallback naming a model that isn't in the list falls back to the first ones, never the same model twice
- A strategy without shares splits evenly; shares that don't add up to 100 are scaled
- The classic style has a rounder card with a hairline border, pill switch, tags and buttons and firmer type – the same behavior as the clean one
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- Give every model a stable id and use the same ids in each strategy's shares
- cost is per 1K tokens in dollars, p95 in seconds – the blended cost is the shares times the costs
- Keep three strategies or fewer and label them by what they favor – Cost, Balanced, Quality
- Persist the policy in onDeploy; pass the new live policy and version back in once it's saved

### Requirements

- React 19

Related: model-usage, agent-router, model-picker, cost-waterfall
