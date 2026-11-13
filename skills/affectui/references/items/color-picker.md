# Color Picker (Free)

A swatch button that opens a color card – saturation and brightness, hue and optional opacity by drag or arrows, a hex field that also reads rgb(), named presets, a hex string as the value

- Page: https://www.affectui.com/components/color-picker
- Section: Components · Inputs
- Install, classic style: `npx shadcn@latest add https://www.affectui.com/r/color-picker.json`
- Install, clean style: `npx shadcn@latest add https://www.affectui.com/r/color-picker-clean.json` – lands as `color-picker-clean.tsx`, import from `@/components/ui/color-picker-clean` – its docs: `color-picker-clean.md`
- Import: `@/components/ui/color-picker`

### When to use

- Picking a color that belongs to something: an agent, a project, a label, a calendar
- Brand or theme settings where any color is allowed, with a few presets to start from
- ColorPickerPanel: the same card right in a form or a settings page, without the button

### When not to use

- Only a handful of fixed colors – a row of swatches as a radio group (the presets alone) or the Toggle Group is quicker
- A color that is really a status or a kind – use the Select or the Segmented Control with named options
- Anything that isn't a color – the Popover is the base for other small floating forms

### Usage

```tsx
import { useState } from "react";
import { ColorPicker } from "@/components/ui/color-picker";

const PRESETS = [
  { value: "#0190fe", label: "Blue" },
  { value: "#13b3a0", label: "Teal" },
  { value: "#e8b000", label: "Amber" },
  { value: "#a651f0", label: "Purple" },
];

export function AgentColor({ onSave }: { onSave: (hex: string) => void }) {
  const [color, setColor] = useState("#0190fe");

  return (
    <ColorPicker
      label="Agent color"
      value={color}
      onValueChange={setColor}
      onOpenChange={(open) => !open && onSave(color)}
      presets={PRESETS}
      align="end"
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| value | `string` |  | The color as lowercase hex – "#0190fe", or "#0190fecc" when alpha is on and opacity is below 100%. From outside it also takes #rgb and rgb() |
| defaultValue | `string` | `"#0190fe"` | The starting color when value isn't controlled |
| onValueChange | `(value: string) => void` |  | Called on every change, while dragging too |
| alpha | `boolean` | `false` | Shows the opacity slider and its percentage; without it, opacity in a value is dropped |
| presets | `(string \| { value: string; label: string })[]` |  | Round swatches under the sliders; a label is read out and shown as the tooltip (a plain string reads as its hex) |
| open | `boolean` |  | ColorPicker only – whether the card is open; leave it out to let the picker handle it |
| defaultOpen | `boolean` | `false` | ColorPicker only – open from the first render, without taking the focus |
| onOpenChange | `(open: boolean) => void` |  | ColorPicker only – called when the button, a press outside, Escape or tabbing away opens or closes it |
| label | `string` | `"Color"` | ColorPicker only – what the color is for; names the button ("Agent color: #0190FE") and the card |
| showValue | `boolean` | `true` | ColorPicker only – the hex next to the swatch; off: a square swatch button |
| size | `"sm" \| "md"` | `"md"` | ColorPicker only – a 28 or 32px high button; bigger on touch screens |
| side | `"bottom" \| "top"` | `"bottom"` | ColorPicker only – where the card opens; it flips when there is more room on the other side |
| align | `"start" \| "end"` | `"start"` | ColorPicker only – which edges line up; switches when it would stick out |
| name | `string` |  | ColorPicker only – sends the hex with a form (a hidden input) |
| ...button / div props | `ComponentProps<"button"> \| ComponentProps<"div">` |  | ColorPicker: disabled, aria-label, id, ref … go to the button. ColorPickerPanel: className, style, aria-label … go to its box |

### Keyboard

- Enter / Space: On the button: opens the card, the focus lands on the area
- ← / →: Area: less or more saturation · sliders: down or up by 1
- ↑ / ↓: Area: brighter or darker · sliders: up or down by 1
- Shift / Arrows: Steps of 10
- Page Up / Page Down: Area: brightness by 10 · sliders: by 10
- Home / End: Area: no or full saturation · sliders: the start or the end
- Enter: In the hex field: takes what you typed (#rgb waits for this; six digits and rgb() apply as you type)
- Arrows: In the presets: moves to the next swatch and picks it – one tab stop for all of them
- Esc: Closes the card – the focus goes back to the button

### Accessibility

- The area and every slider are role="slider" with a name and a spoken value: "Saturation 64%, brightness 99%", "210°, blue", "80%"
- The button says what the color is for and which one it is ("Agent color: #A651F0"), with aria-haspopup and aria-expanded
- The card is a non-modal dialog named by label; it takes the focus only when it is opened, never from the first render
- The presets are a radio group with names – "Blue" instead of a hex – so the chosen one is announced
- The hex field has no ring, only a firmer edge; a value it can't read gets a red edge and aria-invalid on Enter, and is dropped when you leave
- Rings show only under keyboard focus (:focus-visible), never after a click or a drag

### Motion

- The card fades and scales in from the corner it is attached to
- Swatches grow a little on hover
- With prefers-reduced-motion everything appears and changes at once

### Responsive

- Dragging captures the pointer, so you can drag past the card's edge and the thumb stays at the end
- The hex is set in a fixed-width face, so the button doesn't change size while you drag
- The card lives in the top layer, follows its button on scroll and resize, and stays fully on screen; 264px wide, it fits a 320px phone
- The sliders always run left to right, also in right-to-left pages – a color scale isn't text
- Touch screens get a taller area, bigger thumbs and swatches, and 16px in the hex field so iOS doesn't zoom in
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19

Related: popover, text-field, toggle-group, select
