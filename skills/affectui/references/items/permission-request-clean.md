# Permission Request, clean style (Pro)

An agent asks for one specific right – who, why and exactly what will happen – and you allow it once, for an hour or always; then it folds into one line with the time left and Revoke

- Page: https://www.affectui.com/components/permission-request
- Section: Components · Agents
- Install: `npx shadcn@latest add https://www.affectui.com/r/permission-request-clean.json` (needs the Pro access key)
- Import: `@/components/ui/permission-request-clean`

### When to use

- An agent hits an action it isn't allowed to do yet and asks for that one right – push to main, send emails, spend money
- Granting access for a while instead of forever: just once, for an hour, or always
- Anywhere people should see exactly what will happen – the files, recipients or amounts – before they say yes

### When not to use

- Setting up front how much an agent may do in general – use Autonomy Dial
- Reviewing a finished result before it goes out – use Approval Card or Agent Inbox
- Connecting a tool for the first time (OAuth) – that's the provider's consent screen

### Usage

```tsx
import { PermissionRequest } from "@/components/ui/permission-request-clean";

export function PushRequest({ onAnswer }: { onAnswer: (allowed: boolean, until?: number) => void }) {
  return (
    <PermissionRequest
      agent={{ name: "Coder", model: "GPT-6 Sol" }}
      action="push to main"
      target="acme/web"
      risk="risky"
      reason="The fix for the flaky checkout test passed review and all checks."
      preview={[
        { id: "a", label: "src/checkout/cart.ts", meta: "+12 −4" },
        { id: "b", label: "Deploys to production after the merge" },
      ]}
      onDecisionChange={(d) => d && onAnswer(d.allow, d.until)}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| agent | `{ name, model?, avatar? }` |  | Who asks – the avatar is a small mark, e.g. the model maker's logo; defaults to initials |
| action | `string` |  | What it wants to do, read after "wants to", e.g. "push to main" |
| target | `string` |  | Where, e.g. "acme/web" or "Stripe · live mode" – shown under the title with toolIcon |
| toolIcon | `ReactNode` |  | The tool's mark next to the target |
| risk | `"safe" \| "risky" \| "destructive"` | `"risky"` | Risky and destructive carry a tag; destructive also turns Allow red and leaves out Always |
| reason | `string` |  | The agent's own words on why it needs this |
| preview | `{ id, label, meta?, icon? }[]` |  | Exactly what will happen – files, recipients, amounts; meta is right-aligned, e.g. "+12 −4" |
| previewTitle | `string` | `"What will happen"` | Heading of the preview |
| previewLimit | `number` | `3` | Rows shown before "N more" |
| scopes | `("once" \| "timed" \| "always")[]` | `all three` | The choices of how long; one choice hides the switch |
| scope / defaultScope / onScopeChange | `PermissionScope` | `"once"` | Controlled or uncontrolled choice of how long |
| duration | `number` | `60` | Minutes a timed grant holds |
| decision / defaultDecision | `PermissionDecision \| null` |  | { allow, scope, at, until? } – null while it waits |
| onDecisionChange | `(decision \| null) => void` |  | Allow, Deny – and null for Revoke, Change or Ask again |
| now | `number` | `Date.now()` | The clock for the time left – without it the card ticks every second while a timed grant runs |
| className | `string` |  | Extra class on the root |

### Keyboard

- Enter: Allows, with the chosen scope – while the focus is in the card
- Esc: Denies
- ← / →: Picks how long

### Accessibility

- While it waits the card is a dialog labelled by its title ("Coder wants to push to main") and described by the reason
- How long is a radio group; the Allow button names the choice, e.g. "Allow for 1 hour"
- The decided line is a status, so screen readers announce "Allowed for 1 hour" or "Denied"

### Motion

- The preview rows rise in a beat after each other; the Allow label swaps softly when the scope changes
- On a decision the card folds to one line, the check or cross pops in, and a thin bar drains until a timed grant runs out
- With prefers-reduced-motion everything switches instantly

### Responsive

- Fills its container up to 400px
- Below 340px the reason loses its indent, the buttons share the width and the keyboard hints go
- Touch screens get taller choices and buttons and no keyboard hints
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- The component only asks – store the decision and check it where the agent acts: allow, and for scope "timed" also Date.now() < until
- Destructive actions can never be allowed for always – the choice isn't offered, even if scopes lists it
- Revoke, Change and Ask again all call onDecisionChange(null): treat it as "not allowed, ask again"
- Keep the preview concrete (file names, addresses, amounts) – that is what makes people comfortable saying yes
- The icons are Hugeicons Free (MIT) – keep the credit comment when you copy the file

### Requirements

- React 19

Related: autonomy-dial, approval-card, agent-inbox, tool-call-card
