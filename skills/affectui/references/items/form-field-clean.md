# Form Field, clean style (Free)

The frame around any control – label with a required mark or Optional, a hint, an error in its place and a count, all wired up with ids and aria

- Page: https://www.affectui.com/components/form-field
- Section: Components · Inputs
- Install: `npx shadcn@latest add https://www.affectui.com/r/form-field-clean.json`
- Import: `@/components/ui/form-field-clean`

### When to use

- Any control that needs a label, a hint and an error but doesn't draw them itself: a plain <input> or <select>, a Number Input without its own label, a slider, a radio group, your own picker
- Forms that mix controls – every label, hint and error sits at the same distance and looks the same, whatever is inside

### When not to use

- Around a Text Field, Text Area or Select that already has its label, hint and error – pass those props to them instead
- A single checkbox or switch – their own label and description sit next to them (Checkbox, Switch)
- Grouping several fields under one heading – use a <fieldset> with a <legend>

### Usage

```tsx
import { useState } from "react";
import { FormField } from "@/components/ui/form-field-clean";

export function AgentForm() {
  const [name, setName] = useState("");
  const [budget, setBudget] = useState("40");
  const over = Number(budget) > 100;

  return (
    <form className="grid gap-4">
      <FormField label="Agent name" required counter={`${name.length}/40`}>
        <input value={name} maxLength={40} onChange={(e) => setName(e.target.value)} />
      </FormField>

      <FormField
        label="Budget per run"
        hint="In US dollars – the run stops once it's spent."
        error={over ? "Your plan allows up to $100 per run." : undefined}
      >
        <input inputMode="decimal" value={budget} onChange={(e) => setBudget(e.target.value)} />
      </FormField>

      {/* Controls that need the ids somewhere else get them as a function */}
      <FormField label="Reasoning" hint="How long the agent may think.">
        {(field) => <EffortPicker {...field} aria-labelledby={field.labelId} />}
      </FormField>
    </form>
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| label | `ReactNode` |  | Shown above the control; a <label> tied to it, so a click focuses it |
| hint | `ReactNode` |  | A quiet line under the control – the error takes its place while there is one |
| error | `ReactNode` |  | Shows the message where the hint was and sets aria-invalid on the control; true marks it invalid without a line |
| required | `boolean` | `false` | A quiet * after the label and aria-required on the control; native inputs, selects and textareas also get required |
| optional | `boolean` | `false` | "Optional" next to the label – for forms where most fields are required |
| counter | `ReactNode` |  | At the end of the line under the control, e.g. "12/40" – linked with aria-describedby |
| disabled | `boolean` | `false` | Dims the whole field and passes disabled to the control |
| htmlFor | `string` |  | The control's id – by default it keeps its own id or gets one made up |
| children | `ReactElement \| (field) => ReactNode` |  | One element, which gets id, aria-describedby, aria-invalid and aria-required – or a function that receives them (plus labelId) to spread where they belong |
| ...div props | `ComponentProps<"div">` |  | className, style, ref and the rest go on the wrapper |

### Keyboard

- Tab: Goes straight to the control – the label, hint and count aren't stops

### Accessibility

- The label is a real <label for>, so clicking it focuses the control and screen readers read it as the control's name
- The hint, the error and the count are linked with aria-describedby (added to any the control already has); an error sets aria-invalid and is announced politely when it appears
- A <div role="radiogroup"> or similar, which a <label> can't name, gets aria-labelledby pointing at the label; in the function form, use labelId
- The * is hidden from screen readers – aria-required says it instead
- dir="auto" on the message, so Arabic or Hebrew text reads the right way

### Motion

- The error slides in out of a short blur in place of the hint – nothing below moves
- With prefers-reduced-motion it switches instantly

### Responsive

- Fills its container; long labels and messages wrap, even unbroken words, and never push it wider
- The count keeps its place at the end of the line while the hint wraps beside it
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19

Related: text-field, number-input, select, text-area
