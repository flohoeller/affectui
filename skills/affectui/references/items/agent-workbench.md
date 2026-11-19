# Agent Workbench (Pro)

One agent at work: the person who asked on the left with their message, the agent in the middle with a work area showing what it does right now, the files it was given on the right under a macOS folder, and its tools below as cards with what each may do and what it did last – joined by soft rounded connectors, with a light running along the one in use

- Page: https://www.affectui.com/components/agent-workbench
- Section: Components · Agents
- Install, classic style: `npx shadcn@latest add https://www.affectui.com/r/agent-workbench.json` (needs the Pro access key)
- Install, clean style: `npx shadcn@latest add https://www.affectui.com/r/agent-workbench-clean.json` (needs the Pro access key) – lands as `agent-workbench-clean.tsx`, import from `@/components/ui/agent-workbench-clean` – its docs: `agent-workbench-clean.md`
- Import: `@/components/ui/agent-workbench`

### When to use

- Showing one agent at work on one request: who asked, what it reads, which tools it calls and what it does right now
- An assistant that works across a person's apps – mail, calendar, files – where people should see what it touches
- A live view next to a chat, or a still picture of how an agent is wired up

### When not to use

- Many agents handing work to each other – use Agent Crew or Agent Tree
- What an agent remembers and every tool it can reach – use Memory Graph
- Each tool call with its input and output – use Agent Tool Calls

### Usage

```tsx
import { AgentWorkbench, type WorkbenchStep, type WorkbenchTool } from "@/components/ui/agent-workbench";

const tools: WorkbenchTool[] = [
  { id: "gmail", name: "Gmail", logo: <GmailLogo />, scope: "Read & send · ryan@lumen.co", last: "Sent the weekly digest", when: "2h ago" },
  { id: "calendar", name: "Google Calendar", logo: <CalendarLogo />, scope: "Read & book · Work" },
];

const steps: WorkbenchStep[] = [
  { id: "s1", text: "Reading Ryan's request", at: "user" },
  { id: "s2", text: "Checking Marc's calendar next week", at: "calendar", running: true },
];

export function Workbench() {
  return (
    <AgentWorkbench
      user={{ name: "Ryan Brooks", photo: "/ryan.jpg", message: "Find 30 minutes with Marc next week." }}
      agent={{ id: "assistant", name: "Assistant", subtitle: "Works in your Google account" }}
      tools={tools}
      files={[{ id: "budget", name: "budget-q4.xlsx", logo: <ExcelLogo />, meta: "48 KB" }]}
      steps={steps}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| user | `{ name, message, photo?, avatar? }` |  | Who asked, on the left – their photo URL shown round beside the name (avatar takes your own node instead), and their message; without a photo, or if it doesn't load, the person's full mark |
| agent | `{ id, name, subtitle? }` |  | The agent in the middle – its pixel mark from its id, twinkling while it works |
| tools | `WorkbenchTool[]` |  | Its tools below as cards – logo, name, what each may do and where, and what it did last; up to four, with more the last spot sums up the rest ("+3 more tools") |
| WorkbenchTool.scope / last / when | `string / string / string` |  | "Read & send · ryan@lumen.co", its last action and when – while it's called, what it does now shows instead |
| files | `WorkbenchFile[]` |  | What it was given, on the right under a macOS folder – name, logo and a short meta like "48 KB"; up to four, then "+N more"; a file without a logo gets a plain page |
| steps | `WorkbenchStep[]` |  | What it did and does, oldest first – the last three show in its work area, newest on top |
| WorkbenchStep.at / running | `string / boolean` |  | Where it reaches – a tool id, "files" or "user" – and whether it still runs; the running step's line carries the light |
| reading | `string` |  | The id of the file it reads right now – lit up in the list |
| done | `boolean` |  | Finished – the status says Done and nothing runs |
| title | `string` |  | The section's accessible name |
| className | `string` |  | Extra class on the root – set the color variables on it |

### Accessibility

- The work area is a list with a polite live region – each new step is read as it comes in
- Every card is plain text and logos marked decorative; the connectors and their dots are hidden from screen readers
- Status is said in words – Working, Done, Calling, Used, Ready – never by color alone
- Nothing in it takes focus; put any controls around it

### Motion

- A light runs along the line in use – in from the person who asked, out to the files or the tool – full at its front and fading to nothing behind
- Each new step comes in from above at the top of the work area and shimmers while it runs; the agent's mark twinkles and Working turns
- The tool it calls shows what it does now, shimmering; the file it reads lights up
- Reduced motion turns it all off – steps simply appear

### Responsive

- Fills its container's width – the person, the agent and the files in a row, the tools in a row below, joined by soft rounded connectors with a hollow dot at each end
- Below 720px everything stacks – the person, the agent, the files, then the tools – and the connectors step aside
- Long names, scopes, file names and steps end in … with the full text on hover; the message keeps to four lines
- Broken data holds: a photo that doesn't load shows the person's mark, a step without text says Working… or Done, a tool without a last action says Nothing yet, no steps at all reads Waiting for a request
- One or two tools stay card-sized in the middle instead of stretching across
- The classic style has rounder cards, pill tags and status and firmer type – the same behavior as the clean one
- The work area keeps three rows of the same height, so the card never jumps as steps come in
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- Give every step and tool a stable id; set at to a tool id, "files" or "user"
- Keep step texts short and in the present while they run – "Checking Marc's calendar" – one step at a time running
- Update a tool's last and when once it's done its part
- Pass the files the person attached; set reading while the agent reads one

### Requirements

- React 19

Related: agent-crew, memory-graph, agent-tree, reasoning-summary
