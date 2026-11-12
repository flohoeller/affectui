# Evals (Pro)

Prompt evaluation dashboard: pass rate by version, reviewable prompt changes and test cases you can re-run

- Page: https://www.affectui.com/screens/evals
- Section: Screens · App screens
- Install: `npx shadcn@latest add https://www.affectui.com/r/evals.json` (needs the Pro access key)
- Import: `@/components/ui/evals`

### When to use

- Eval dashboards for prompts, agents or LLM features
- Comparing prompt or model versions against a fixed test suite

### When not to use

- Live production monitoring of single requests – use a log or trace view

### Usage

```tsx
import { EvalsScreen } from "@/components/ui/evals";

export default function Page() {
  return <EvalsScreen workspace="Acme" user={{ name: "Alex Morgan" }} onNavigate={(label) => router.push(routes[label])} />;
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| onNavigate | `(label: string) => void` |  | Called with the label of a sidebar item |
| workspace | `string` | `"Acme"` | Workspace name in the sidebar |
| user | `{ name: string; avatar?: string }` | `{ name: "Alex Morgan" }` | Account at the bottom of the sidebar |
| loading | `boolean` |  | While your data loads: gray key figures, chart, prompt change and test case rows in the shape of the real ones; the header, filters and Run eval stay |
| empty | `boolean` |  | A new prompt with no test cases: the header stays at v1, key figures, chart and prompt change hide, and the test cases show “No test cases yet” with an Add test case button |
| onAddCase | `() => void` |  | Called by the empty state’s Add test case button |
| className | `string` |  | Extra class on the root |

### Accessibility

- Sidebar items, the version menu, filters and Run eval are real buttons with labels
- Test case rows are focusable and select with Enter or Space
- Prompt changes are reviewed with the keyboard: Tab between changes, Y accepts, N rejects
- Icons are decorative and hidden from screen readers

### Responsive

- Fills its container – give it the full viewport height in your app
- Below 1000px the right column moves under the table; the table scrolls sideways on phones
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"; colors are CSS variables on .ui-as

### Requirements

- React 19
- @hugeicons/react
- @hugeicons/core-free-icons
- App Shell Inset, KPI Chart, Inline Diff, Segmented Control and Button (installed with it)
