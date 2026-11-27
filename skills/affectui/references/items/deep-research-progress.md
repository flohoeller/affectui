# Deep Research Progress (Pro)

An agent researching a question – the sources it finds on the left, the report taking shape section by section on the right, a line running from each source to the section it feeds

- Page: https://www.affectui.com/components/deep-research-progress
- Section: Components · Agents
- Install, classic style: `npx shadcn@latest add https://www.affectui.com/r/deep-research-progress.json` (needs the Pro access key)
- Install, clean style: `npx shadcn@latest add https://www.affectui.com/r/deep-research-progress-clean.json` (needs the Pro access key) – lands as `deep-research-progress-clean.tsx`, import from `@/components/ui/deep-research-progress-clean` – its docs: `deep-research-progress-clean.md`
- Import: `@/components/ui/deep-research-progress`

### When to use

- A deep research or analysis agent at work – what it has read, what it is writing, and how far along it is
- Making a long run worth the wait: every source and citation shows up as it happens, and the person can steer a section
- Research, due-diligence, market-analysis or sales-intelligence products that turn the web into a report

### When not to use

- The finished answer with its sources – use Cited Answer
- One agent's steps and tools in general – use Agent Monitor or Agent Workbench
- A plan with steps to approve – use Agent Plan

### Usage

```tsx
import { DeepResearchProgress, type ResearchSection, type ResearchSource } from "@/components/ui/deep-research-progress";

const sources: ResearchSource[] = [
  { id: "stripe", title: "Billing for AI products", domain: "stripe.com", logo: <StripeLogo />, status: "read", sections: ["s1"] },
  { id: "github", title: "Premium requests in Copilot", domain: "github.blog", logo: <GitHubLogo />, status: "reading", sections: ["s1", "s2"],
    quote: "Every plan includes a monthly allowance of premium requests.", mark: "monthly allowance" },
  { id: "intercom", title: "Fin's price per resolution", domain: "intercom.com", color: "#1F8DED", status: "queued", sections: ["s3"] },
];

const sections: ResearchSection[] = [
  { id: "s1", title: "Pricing models in use", status: "writing", words: 180, cites: ["stripe"] },
  { id: "s2", title: "What the big platforms charge", status: "queued" },
  { id: "s3", title: "Paying per outcome", status: "queued" },
];

export function Research() {
  return (
    <DeepResearchProgress
      question="How are SaaS companies pricing AI agents in 2026?"
      agent={{ id: "research", name: "Research agent", model: "Claude Opus 5.5" }}
      sources={sources}
      sections={sections}
      elapsed={74}
      onStop={stop}
      onDeeper={(id) => steer(id)}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| question | `string` |  | What the agent was asked – not shown; it names the region for screen readers ("Deep research: …") |
| sources | `ResearchSource[]` |  | What it found, in order – { id, title, domain, logo?, full?, color?, status, quote?, mark?, sections? }. status is queued, reading, read or skipped. logo is a small node on a white tile – with full, a whole app icon with its own background (Adobe's PDF, Stripe) that fills the tile edge to edge; without a logo, the domain's first letter – white on color, if given. quote and mark fill the source's card; sections are the ids it feeds |
| sections | `ResearchSection[]` |  | The report, in order – { id, title, status, summary?, words?, cites?, deeper? }. status is queued, writing or done; cites are source ids, their logos stack up beside the summary |
| agent | `{ id, name, model?, logo? }` |  | Who researches – id draws its pixel mark, model and logo show as a tag |
| elapsed | `number` |  | Seconds since it started – shown as a clock while it runs |
| status | `"running" \| "done" \| "stopped"` |  | Default running. done shows Ready instead of the clock and, with onOpen, Open report in place of the footer ring; stopped shows Stopped and stops every motion |
| onStop | `() => void` |  | Shows Stop while it runs |
| onDeeper | `(sectionId: string) => void` |  | Shows Dig deeper on every section that isn't done – set deeper on it to show the tag |
| onOpen | `() => void` |  | Shows Open report at the right of the footer row when it's done |
| rows | `number` |  | The source list is as tall as the report beside it and scrolls – it never shows fewer rows than this (or than it has). Default 4 |
| className | `string` |  | Extra class on the root – set the color variables on it, e.g. --ui-rsh-blue |

### Keyboard

- Tab: Stop, then one stop for the source list, then Dig deeper on each open section
- ↑ / ↓: The source before or after – its card shows
- Home / End: The first or the last source
- Enter / Space: Keeps a source's card open; Esc closes it

### Accessibility

- The sources are a listbox – every option reads its title, site and whether it was read
- A polite live region says what the agent reads or writes now, and when the report is ready
- The footer ring reads "2 of 5 sections written"; citations read as a count
- Focus rings show for the keyboard only (:focus-visible)

### Motion

- The source being read shimmers and the list keeps it in view; a line runs from it to the section being written – straight across and up or down, with rounded corners – a light running along it
- When a source is read, its logo drops into the section's citations; sources, citations and words roll up
- The section being written shimmers with a turning ring; a written one gets its check
- With prefers-reduced-motion nothing moves – the numbers and states simply change

### Responsive

- The report column gets a little more room than the sources; long titles shorten with an ellipsis
- The source list ends where the report ends and scrolls inside – its foot fades out while there is more below
- Sources, citations and words sit in a footer row with an icon each; on narrow cards the words beside the icons step aside (screen readers still hear them), so the numbers stay on one row
- Narrow: the report goes under the sources, the list keeps a height of its own, the line steps aside and Dig deeper stays visible
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- Keep ids stable – the line and the citations are matched by id
- Only one source should be reading at a time; the line goes to the first of its sections that isn't done
- Give the site's logo where you have one (Simple Icons is a good source); otherwise color gives a clean letter tile

### Requirements

- React 19

Related: cited-answer, agent-monitor, agent-workbench, agent-plan
