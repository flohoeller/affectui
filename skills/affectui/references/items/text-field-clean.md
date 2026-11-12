# Text Field, clean style (Free)

One input for every form – label, hint and error in place, prefix and suffix, clear, show-password and copy buttons, a character count

- Page: https://www.affectui.com/components/text-field
- Section: Components · Inputs
- Install: `npx shadcn@latest add https://www.affectui.com/r/text-field-clean.json`
- Import: `@/components/ui/text-field-clean`

### When to use

- Every single-line field in a form: names, emails, URLs, amounts, search, passwords, API keys
- Settings pages, sign-up and onboarding – one field everywhere, so all your screens look and behave the same

### When not to use

- Longer text over several lines – use a textarea
- Picking from a fixed list – use Combobox or a select
- Short verification codes – OTP Input reads and pastes them better

### Usage

```tsx
import { useState } from "react";
import { TextField } from "@/components/ui/text-field-clean";

export function WorkspaceForm() {
  const [slug, setSlug] = useState("");
  const valid = /^[a-z0-9-]*$/.test(slug);

  return (
    <form className="grid gap-4">
      <TextField label="Workspace name" name="name" maxLength={32} counter clearable required />
      <TextField
        label="Workspace URL"
        prefix="acme.app/"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        hint="Lowercase letters, numbers and dashes."
        error={valid ? undefined : "Only lowercase letters, numbers and dashes."}
      />
      <TextField label="Password" type="password" name="password" autoComplete="new-password" />
      <TextField label="API key" value={apiKey} readOnly copyable />
    </form>
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| label | `ReactNode` |  | Shown above the field; clicking it focuses the input |
| hint | `ReactNode` |  | A quiet line under the field – the error takes its place while there is one |
| error | `ReactNode` |  | Marks the field invalid (red edge, aria-invalid) and shows the message where the hint was |
| prefix | `ReactNode` |  | Text or a 16px icon inside the field before the value – e.g. "https://" or a search icon |
| suffix | `ReactNode` |  | Text or an icon after the value – e.g. ".acme.app", "USD" or "%" |
| size | `"sm" \| "md" \| "lg"` | `"md"` | 28 · 32 · 36px high; taller on touch screens |
| optional | `boolean` | `false` | Adds "Optional" next to the label |
| clearable | `boolean` | `false` | A small × (and Esc) that empties the field while it has a value; onChange fires as if the user had deleted the text |
| copyable | `boolean` | `false` | A copy button that turns into a green check – pair it with readOnly for keys, links and IDs |
| counter | `boolean` | `false` | Shows "12/40" under the field, red once a prefilled value is over the limit; needs maxLength |
| type | `string` | `"text"` | Any input type – "password" adds a show/hide button, "search" drops the browser's own × |
| onClear | `() => void` |  | Called after the × emptied the field |
| inputClassName | `string` |  | Extra class on the input itself, e.g. a monospace font |
| className | `string` |  | Extra class on the wrapper |
| ...input props | `ComponentProps<"input">` |  | Everything else – value, defaultValue, onChange, name, placeholder, required, disabled, readOnly, maxLength, autoComplete, ref – goes to the input |

### Keyboard

- Tab: Moves into the field, then to its show-password or copy button – the × stays out of the way, Esc does its job
- Esc: Empties a clearable field and keeps the caret in it
- Enter / Space: On a button: shows or hides the password, or copies

### Accessibility

- A real <input> with a <label> tied to it – works with forms, autofill, password managers and screen readers
- The hint and the error are linked with aria-describedby; an error sets aria-invalid and is announced politely when it appears
- Clear, show password and copy are labelled buttons; the reveal button reports its state with aria-pressed and "Copied" is announced
- Without a label, a text placeholder becomes the field's accessible name – better still, pass aria-label
- Focus darkens the edge a step – no ring, the caret shows where you are; the buttons get a clear outline under keyboard focus. Need a stronger focus edge? Override --ui-tf(c)-edge-focus / --ui-tfc-shadow-focus
- dir="auto" on the value and the message, so Arabic or Hebrew text reads the right way in any form; prefix, suffix and buttons follow the page direction

### Motion

- No focus ring: the hairline edge firms up on hover and a little more on focus
- An error nudges the field once and its message slides in out of a short blur, in place of the hint – nothing below moves
- Showing a password brings the characters out of a short blur; the copy icon morphs into a check that draws itself
- With prefers-reduced-motion everything switches instantly

### Responsive

- Fills its container; long values, prefixes and messages never push it wider – a long prefix is cut at its start, so the part next to the value stays
- On touch screens the field grows to a comfortable tap height, its buttons to 32px with a larger hit area, and it uses 16px text, so iOS doesn't zoom in on focus
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19

Related: combobox, otp-input, button, stepper-form
