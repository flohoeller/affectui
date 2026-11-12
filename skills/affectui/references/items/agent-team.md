# Agent Team (Free)

A prompt types itself and branches out into three agents, each with a role and overlapping tool logos

- Page: https://www.affectui.com/illustrations/agent-team
- Section: Illustrations · Card illustrations
- Install: `npx shadcn@latest add https://www.affectui.com/r/agent-team.json`
- Import: `@/components/ui/agent-team`

### When to use

- AI and automation products where one prompt sets up several agents or roles
- Feature cards about teams, delegation or workflows that span several tools

### When not to use

- Real org charts or live agent status – the scene is decorative and loops on its own
- More than three agents – the layout is built for exactly three

### Usage

```tsx
import { AgentTeam } from "@/components/ui/agent-team";

export function FeatureCard() {
  return (
    <article style={{ maxWidth: 560 }}>
      <AgentTeam
        prompt="Build a team to work my inbound pipeline"
        members={[
          { role: "Lead Researcher", avatar: "/team/lena.jpg", tools: ["linkedin", "hubspot"] },
          { role: "Inbound Qualifier", avatar: "/team/theo.jpg", tools: ["hubspot", "slack"] },
          { role: "Outbound SDR", avatar: "/team/noah.jpg", tools: ["gmail", "salesforce"] },
        ]}
      />
    </article>
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| prompt | `string` | `"Build a team to work my inbound pipeline"` | Text that types itself into the prompt pill |
| members | `[AgentTeamMember, AgentTeamMember, AgentTeamMember]` |  | Required. Three agents, left to right – { role, avatar, tools? } with up to two of linkedin, hubspot, slack, gmail, salesforce |
| label | `string` |  | Accessible description – by default built from the prompt and the roles |
| className | `string` |  | Extra class on the root, e.g. for width or margins |

### Accessibility

- Exposed as one image with a label built from the prompt and the roles; everything inside is hidden from screen readers
- Nothing in the scene is interactive

### Motion

- The prompt types itself, the send button presses and a soft pink-to-violet glow blooms behind it, dashed lines draw down and the three agents pop in one after another – then it starts over
- Each status dot pops in last; the tool circles overlap slightly
- With prefers-reduced-motion it shows the finished team and stays still

### Responsive

- Transparent background, so it sits on any light or dark surface
- Keeps a 3 : 2 aspect ratio and scales to the width of its container – text and shapes are sized in container units
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19
