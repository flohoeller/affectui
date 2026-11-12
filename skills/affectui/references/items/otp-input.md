# OTP Input (Free)

The verification code field done right – a gliding focus ring, paste and SMS autofill, a calm shake on errors and a morph into Verified

- Page: https://www.affectui.com/components/otp-input
- Section: Components · Inputs
- Install, classic style: `npx shadcn@latest add https://www.affectui.com/r/otp-input.json`
- Install, clean style: `npx shadcn@latest add https://www.affectui.com/r/otp-input-clean.json` – lands as `otp-input-clean.tsx`, import from `@/components/ui/otp-input-clean` – its docs: `otp-input-clean.md`
- Import: `@/components/ui/otp-input`

### When to use

- Two-step sign-in, email or phone verification, confirming a sensitive action with a one-time code
- Any short code people copy from an email or SMS – paste and autofill fill every box at once

### When not to use

- Codes longer than about 8 characters or with free-form text – a plain text field is easier to read and correct
- Passwords or PINs that must stay hidden – the boxes show what's typed

### Usage

```tsx
import { useState } from "react";
import { OtpInput, type OtpStatus } from "@/components/ui/otp-input";

export function VerifyEmail() {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<OtpStatus>("idle");
  const [triesLeft, setTriesLeft] = useState(3);

  async function verify(value: string) {
    setStatus("verifying");
    const res = await fetch("/api/verify", { method: "POST", body: JSON.stringify({ code: value }) });
    if (res.ok) {
      setStatus("success");
      router.push("/dashboard");
    } else {
      setTriesLeft((n) => n - 1);
      setStatus("error");
    }
  }

  return (
    <OtpInput
      value={code}
      onChange={(next) => {
        setCode(next);
        if (status === "error" && next) setStatus("idle");
      }}
      onComplete={verify}
      status={status}
      errorMessage={`That code didn't work. ${triesLeft} tries left.`}
      separator
      autoFocus
      onResend={() => fetch("/api/send-code", { method: "POST" })}
      resendIn={30}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| length | `number` | `6` | Number of boxes |
| separator | `boolean \| number` | `false` | A small dash between the boxes – true puts it in the middle, a number after that many boxes |
| numeric | `boolean` | `true` | Digits only with the numeric keyboard on phones; false allows letters too, shown in capitals |
| value | `string` |  | The code – makes the field controlled |
| defaultValue | `string` | `""` | Starting code when uncontrolled |
| onChange | `(code: string) => void` |  | Every change: typing, Backspace, paste, autofill and the clearing after an error |
| onComplete | `(code: string) => void` |  | Called once the last box is filled by the user – the place to start verifying |
| status | `"idle" \| "verifying" \| "error" \| "success"` | `"idle"` | Verifying shimmers and locks the field, error shakes and shows the message, success morphs into the pill |
| errorMessage | `ReactNode` | `"That code didn't work. Try again."` | Shown below the boxes after an error, until the user types again |
| clearOnError | `boolean` | `true` | Clears the boxes shortly after the shake, ready for the next try |
| successLabel | `string` | `"Verified"` | Text in the pill on success |
| onResend | `() => void` |  | Shows "Didn't get a code?" below the boxes with a countdown that becomes a Resend button; clicking restarts the countdown |
| resendIn | `number` | `30` | Seconds until the code can be resent |
| align | `"start" \| "center"` | `"start"` | Where the boxes and the lines below them sit |
| disabled | `boolean` | `false` | Dims the field and ignores input |
| autoFocus | `boolean` | `false` | Focuses the field on mount (without scrolling) |
| label | `string` | `"Verification code"` | Accessible name; the number of digits is added |
| className | `string` |  | Extra class on the root |

### Keyboard

- 0–9: Fills the active box and moves on; typing on a filled box replaces it
- ⌫: Clears the box and goes back one
- ← / →: Moves between the filled boxes and the next empty one
- Home / End: Jumps to the first box, or to the next empty one
- ⌘ / V: Pastes a whole code – spaces and dashes are ignored

### Accessibility

- One real text input carries the whole code, so screen readers hear one field ("Verification code, 6 digits") instead of six
- autocomplete="one-time-code" lets iOS and Android offer the code from an SMS; inputMode="numeric" opens the number pad
- Errors set aria-invalid and point to the message with aria-describedby; verifying, errors, success and resend are announced in a polite live region

### Motion

- A single focus ring glides from box to box with a softly blinking caret; digits pop in out of a short blur
- Pasted or autofilled codes fill the boxes one after another
- Verifying: a soft light passes over the boxes. Error: a calm shake, red borders, the message grows in below and the code fades out for the next try
- Success: the boxes slide together while one frame morphs its width into a "Verified" pill and the check draws in
- With prefers-reduced-motion everything switches instantly

### Responsive

- Container query: the boxes shrink to fit their container – six boxes with a separator fit a 320px phone
- Inputs use 16px text under the hood, so iOS doesn't zoom in on focus
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19

Related: combobox, segmented-control, button, toaster
