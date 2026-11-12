# Stepper Form, clean style (Pro)

A multi-step flow for onboarding and setup – steps that fill and check off, sliding steps, a card that morphs to each step, inline validation and a success state

- Page: https://www.affectui.com/components/stepper-form
- Section: Components · Inputs
- Install: `npx shadcn@latest add https://www.affectui.com/r/stepper-form-clean.json` (needs the Pro access key)
- Import: `@/components/ui/stepper-form-clean`

### When to use

- Onboarding, checkout or setup wizards where one long form would feel like too much at once
- Flows whose later steps depend on earlier answers, ending in a review before anything is created

### When not to use

- Two or three fields – a single form is faster
- Settings people jump around in freely – use tabs or sections instead

### Usage

```tsx
import { StepperForm, StepperField, StepperInput, StepperTags, StepperChoices, StepperReview, type Step } from "@/components/ui/stepper-form-clean";

type Values = { name: string; slug: string; invites: string[]; plan: string };

const steps: Step<Values>[] = [
  {
    id: "workspace",
    title: "Workspace",
    heading: "Name your workspace",
    render: ({ values, setValues }) => (
      <>
        <StepperField name="name" label="Workspace name">
          <StepperInput value={values.name} onChange={(e) => setValues({ name: e.target.value, slug: slugify(e.target.value) })} />
        </StepperField>
        <StepperField name="slug" label="Workspace URL">
          <StepperInput prefix="acme.app/" value={values.slug} onChange={(e) => setValues({ slug: e.target.value })} />
        </StepperField>
      </>
    ),
    validate: (v) => ({ name: v.name.trim() ? undefined : "Give your workspace a name" }),
  },
  {
    id: "team",
    title: "Team",
    render: ({ values, setValues }) => (
      <StepperField name="invites" label="Email addresses" optional>
        <StepperTags value={values.invites} onChange={(invites) => setValues({ invites })} />
      </StepperField>
    ),
  },
  {
    id: "plan",
    title: "Plan",
    render: ({ values, setValues }) => (
      <StepperChoices label="Plan" value={values.plan} options={plans} onChange={(plan) => setValues({ plan })} />
    ),
  },
  {
    id: "review",
    title: "Review",
    render: ({ values, goTo }) => (
      <StepperReview
        onEdit={goTo}
        rows={[
          { label: "Workspace", value: values.name, step: "workspace" },
          { label: "Plan", value: values.plan, step: "plan" },
        ]}
      />
    ),
  },
];

export function Onboarding() {
  return (
    <StepperForm<Values>
      steps={steps}
      initialValues={{ name: "", slug: "", invites: [], plan: "pro" }}
      submitLabel="Create workspace"
      onComplete={(values) => api.createWorkspace(values)}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| steps | `Step<V>[]` |  | { id, title, heading?, description?, render(ctx), validate?(values) } – render gets values, setValues, errors, goTo and next; validate returns messages by field name |
| initialValues | `V` |  | Values shared by all steps, so Back and Edit keep what was entered |
| onComplete | `(values: V) => void \| Promise<void>` |  | Runs on the last step; a promise shows the submitting label until it settles, a thrown error is shown next to the button |
| initialStep | `number` | `0` | Index of the first step shown |
| step | `number` |  | Controlled step index; pair with onStepChange |
| onStepChange | `(step: number) => void` |  | Called whenever the step changes |
| submitLabel | `string` | `"Finish"` | Label of the button on the last step |
| submittingLabel | `string` | `"Creating…"` | Label while onComplete runs |
| success | `(values: V, reset: () => void) => ReactNode` |  | Replaces the steps once done – StepperSuccess gives the popping green check, a heading and a line |
| className | `string` |  | Extra class on the root |
| StepperField | `{ name, label, hint?, optional?, children }` |  | Label, control and inline message for the field name in validate; the control shakes when Continue finds a problem |
| StepperInput | `InputHTMLAttributes & { prefix? }` |  | A text field wired to its StepperField; prefix shows fixed text like "acme.app/" |
| StepperTags | `{ value, onChange, validate?, max?, placeholder? }` |  | Entries as chips in a one-line field that scrolls sideways – emails by default; Enter, comma or a pasted list add, × or Backspace remove |
| StepperChoices | `{ value, onChange, options, label }` |  | Selectable white cards { value, title, aside?, description?, badge? } as a radio group; the chosen one gets a faint blue fill and a light blue hairline |
| StepperReview | `{ rows, onEdit? }` |  | A summary { label, value, step? } – rows with a step get an Edit link (pass goTo) |

### Keyboard

- ↵: Continues (in a chip field: adds the typed entry first, Continue when it's empty)
- Tab: Moves through the fields, then Back and Continue
- ← / →: In the plan cards: moves and selects; ↵ picks and continues
- , / ⌫: In a chip field: comma adds, Backspace in the empty field removes the last chip

### Accessibility

- The steps are an ordered list with aria-current="step"; finished steps are buttons that jump back
- On narrow screens the list stays for screen readers while the compact "Step 2 of 4" text shows on screen
- The new step's first field (or its heading) gets the focus; after a failed Continue the first invalid field does
- Fields carry aria-invalid and point to their message with aria-describedby; "Step 2 of 4: Team" and errors are announced in a polite live region
- Continue looks dimmed while the step isn't valid but still answers, so keyboard and screen reader users hear what's missing

### Motion

- Each step's thin bar fills in blue as you reach it; a finished step swaps its number for a check that draws itself in
- Steps slide in from the side you're heading to with a short fade, while the old one slides out the other way
- Only the step content glides to the height of each step – the last row with Back and Continue never gets clipped; the dark button glides to the width of its new label
- An invalid field shakes once and its message folds in; chips pop in and fold away
- The light blue plan outline moves between cards; the success check pops in
- With prefers-reduced-motion everything switches instantly

### Responsive

- Fills its container up to 520px and works down to 320px
- Below 420px the step labels collapse to "Step 2 of 4 · Team" above the bars, plan cards stack and review rows wrap
- Touch screens get 16px, 40px tall fields (no zoom on iOS) and 36px buttons; the last row sticks to the bottom in long pages
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19

Related: setup-guide, progress-tracker, combobox, segmented-control
