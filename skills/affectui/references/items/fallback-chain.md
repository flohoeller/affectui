# Fallback Chain (Pro)

One request finding a model that answers, as a small flow diagram – the request branches out to each model in its fallback order, a light runs to the one being tried, failed branches break red, and the one that answers runs on to the response

- Page: https://www.affectui.com/components/fallback-chain
- Section: Components · Agents
- Install, classic style: `npx shadcn@latest add https://www.affectui.com/r/fallback-chain.json` (needs the Pro access key)
- Install, clean style: `npx shadcn@latest add https://www.affectui.com/r/fallback-chain-clean.json` (needs the Pro access key) – lands as `fallback-chain-clean.tsx`, import from `@/components/ui/fallback-chain-clean` – its docs: `fallback-chain-clean.md`
- Import: `@/components/ui/fallback-chain`

### When to use

- A request can go to several models, providers or regions and people should see which one answered – and why the others didn't
- Model routers, LLM gateways, retries across providers, uptime and incident views

### When not to use

- When several models answer the same prompt at once and you compare them – use Parallel Attempts
- When the full timeline of one run matters – use Trace Waterfall

### Usage

```tsx
import { FallbackChain, type FallbackAttempt } from "@/components/ui/fallback-chain";

export function Route({ attempts }: { attempts: FallbackAttempt[] }) {
  return (
    <FallbackChain
      title="Summarize support ticket"
      route="openrouter/auto"
      attempts={attempts} // { id, model, provider?, providerLogo?, region?, logo?, status, startedAt?, duration?, timeout?, cost? (USD), reason?, note?, details? }
      request={{ name: "HubSpot · Ticket #4821", logo: <HubSpotLogo />, text: prompt }}
      response={{ name: "Slack · #support", logo: <SlackLogo />, text: answer }}
      onRetry={() => resend()}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| attempts | `FallbackAttempt[]` |  | The models in the order they're tried, each with its status: waiting, trying, failed, answered or skipped |
| title | `string` | `"Request"` | What was asked, above the diagram next to the attempt and the running time and cost |
| route | `string` |  | The route on the request node, e.g. "openrouter/auto" |
| request | `ChainEnd` |  | Where the request came from – { name, logo, text, details } for its hover card: the source, a preview of the prompt and extra lines |
| response | `ChainEnd` |  | Where the answer goes – { name, logo, text, details } for its hover card; the preview shows once a model answered |
| now | `number` |  | A clock you control for the live timer – without it it follows real time |
| onRetry | `() => void` |  | Shows a Retry button once every model failed |
| className | `string` |  | Extra class on the root |

### Keyboard

- Tab: Moves through the request, each model and the response – each opens its hover card while focused; then the Retry button once every model failed

### Accessibility

- The summary on top is a status region – “Attempt 2 of 4”, “Answered in 8.5s” and failures are announced
- The branches are decoration – the models are an ordered list with each one's provider, status and time
- Hover cards are tooltips tied to their element (aria-describedby), so they're read on focus too
- Every state is written out (“Rate limited · 429”, “Not needed”), not only shown by color
- The running light and the drawing branches stop with reduced motion

### Responsive

- Below 680px the provider moves into the model's hover card; below 520px the diagram turns into a tree – the request on top, the models branching off one line, the result stays in the line above
- Dark mode built in; colors are CSS variables on .ui-fbk

### Requirements

- React 19
