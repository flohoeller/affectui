"use client";

import { useEffect, useRef } from "react";

/*
 * Model Wheel – AI model names on a turning drum, in a single self-contained file.
 * The list sits on a cylinder: rows bend away and fade towards the top and bottom edge.
 * Every few seconds the drum rolls one model further and locks onto it like a magnet;
 * the model in the middle sits on a soft gray fill that follows the length of its name.
 * Grab it and spin it: a flick keeps it turning, then it snaps onto the closest model. Hover holds it.
 * Runs only while on screen; prefers-reduced-motion keeps it still.
 */

export type WheelModel = { name: string; viewBox: string; color: string; d: string };

export type ModelWheelProps = {
  /** Models on the wheel – brand marks as a single SVG path; at least 7 keep the drum full */
  models?: WheelModel[];
  /** Milliseconds a model stays selected before the wheel turns on */
  hold?: number;
  className?: string;
  /** Accessible description of the scene */
  label?: string;
};

/** Brand marks: Simple Icons (CC0) and the OpenAI mark from the affectUI Chat Composer */
export const defaultModels: WheelModel[] = [
  { name: "Claude", viewBox: "0 0 24 24", color: "#D97757", d: "m4.7144 15.9555 4.7174-2.6471.079-.2307-.079-.1275h-.2307l-.7893-.0486-2.6956-.0729-2.3375-.0971-2.2646-.1214-.5707-.1215-.5343-.7042.0546-.3522.4797-.3218.686.0608 1.5179.1032 2.2767.1578 1.6514.0972 2.4468.255h.3886l.0546-.1579-.1336-.0971-.1032-.0972L6.973 9.8356l-2.55-1.6879-1.3356-.9714-.7225-.4918-.3643-.4614-.1578-1.0078.6557-.7225.8803.0607.2246.0607.8925.686 1.9064 1.4754 2.4893 1.8336.3643.3035.1457-.1032.0182-.0728-.164-.2733-1.3539-2.4467-1.445-2.4893-.6435-1.032-.17-.6194c-.0607-.255-.1032-.4674-.1032-.7285L6.287.1335 6.6997 0l.9957.1336.419.3642.6192 1.4147 1.0018 2.2282 1.5543 3.0296.4553.8985.2429.8318.091.255h.1579v-.1457l.1275-1.706.2368-2.0947.2307-2.6957.0789-.7589.3764-.9107.7468-.4918.5828.2793.4797.686-.0668.4433-.2853 1.8517-.5586 2.9021-.3643 1.9429h.2125l.2429-.2429.9835-1.3053 1.6514-2.0643.7286-.8196.85-.9046.5464-.4311h1.0321l.759 1.1293-.34 1.1657-1.0625 1.3478-.8804 1.1414-1.2628 1.7-.7893 1.36.0729.1093.1882-.0183 2.8535-.607 1.5421-.2794 1.8396-.3157.8318.3886.091.3946-.3278.8075-1.967.4857-2.3072.4614-3.4364.8136-.0425.0304.0486.0607 1.5482.1457.6618.0364h1.621l3.0175.2247.7892.522.4736.6376-.079.4857-1.2142.6193-1.6393-.3886-3.825-.9107-1.3113-.3279h-.1822v.1093l1.0929 1.0686 2.0035 1.8092 2.5075 2.3314.1275.5768-.3218.4554-.34-.0486-2.2039-1.6575-.85-.7468-1.9246-1.621h-.1275v.17l.4432.6496 2.3436 3.5214.1214 1.0807-.17.3521-.6071.2125-.6679-.1214-1.3721-1.9246L14.38 17.959l-1.1414-1.9428-.1397.079-.674 7.2552-.3156.3703-.7286.2793-.6071-.4614-.3218-.7468.3218-1.4753.3886-1.9246.3157-1.53.2853-1.9004.17-.6314-.0121-.0425-.1397.0182-1.4328 1.9672-2.1796 2.9446-1.7243 1.8456-.4128.164-.7164-.3704.0667-.6618.4008-.5889 2.386-3.0357 1.4389-1.882.929-1.0868-.0062-.1579h-.0546l-6.3385 4.1164-1.1293.1457-.4857-.4554.0608-.7467.2307-.2429 1.9064-1.3114Z" },
  { name: "ChatGPT", viewBox: "0 0 68.614 68.002", color: "currentColor", d: "M26.3166 24.7525V18.2923C26.3166 17.7482 26.5208 17.3401 26.9966 17.0684L39.9853 9.5882C41.7533 8.56821 43.8615 8.09244 46.0372 8.09244C54.1973 8.09244 59.3658 14.4167 59.3658 21.1486C59.3658 21.6245 59.3658 22.1686 59.2976 22.7127L45.8331 14.8243C45.0172 14.3486 44.2009 14.3486 43.385 14.8243L26.3166 24.7525ZM56.6454 49.9134V34.4766C56.6454 33.5244 56.2371 32.8444 55.4213 32.3685L38.3529 22.4403L43.9291 19.244C44.405 18.9723 44.8131 18.9723 45.289 19.244L58.2776 26.7242C62.018 28.9005 64.5338 33.5244 64.5338 38.0122C64.5338 43.1802 61.4739 47.9406 56.6454 49.9128V49.9134ZM22.3045 36.3131L16.7284 33.0492C16.2526 32.7775 16.0484 32.3692 16.0484 31.8251V16.8649C16.0484 9.58891 21.6245 4.08038 29.1729 4.08038C32.0293 4.08038 34.6809 5.03262 36.9255 6.7326L23.5292 14.485C22.7134 14.9608 22.3052 15.6408 22.3052 16.5932V36.3137L22.3045 36.3131ZM34.307 43.2491L26.3166 38.7611V29.2412L34.307 24.7532L42.2968 29.2412V38.7611L34.307 43.2491ZM39.4411 63.9219C36.5848 63.9219 33.9333 62.9697 31.6886 61.2699L45.0848 53.5173C45.9007 53.0415 46.3089 52.3615 46.3089 51.4091V31.6886L51.9533 34.9525C52.4291 35.2242 52.6333 35.6324 52.6333 36.1766V51.1369C52.6333 58.4128 46.9889 63.9214 39.4411 63.9214V63.9219ZM23.3245 48.7576L10.3358 41.2775C6.59541 39.1011 4.07967 34.4773 4.07967 29.9894C4.07967 24.7532 7.2078 20.0612 12.0356 18.0889V33.5933C12.0356 34.5455 12.4439 35.2255 13.2597 35.7014L30.2605 45.5613L24.6844 48.7576C24.2086 49.0293 23.8003 49.0293 23.3245 48.7576ZM22.5769 59.9099C14.8926 59.9099 9.24834 54.1297 9.24834 46.9895C9.24834 46.4454 9.31651 45.9013 9.38411 45.3572L22.7804 53.1097C23.5962 53.5856 24.4127 53.5856 25.2284 53.1097L42.2968 43.2498V49.71C42.2968 50.2541 42.0927 50.6622 41.6168 50.9339L28.6283 58.4141C26.8601 59.4341 24.752 59.9099 22.5762 59.9099H22.5769ZM39.4411 68.0017C47.6694 68.0017 54.5372 62.1538 56.1019 54.4013C63.718 52.4291 68.6141 45.2889 68.6141 38.0129C68.6141 33.2526 66.5743 28.6288 62.9021 25.2966C63.2421 23.8685 63.4462 22.4403 63.4462 21.0129C63.4462 11.2887 55.5578 4.01207 46.4454 4.01207C44.6098 4.01207 42.8416 4.28375 41.0735 4.89614C38.0129 1.90392 33.7968 0 29.1729 0C20.9447 0 14.0769 5.84782 12.5122 13.6003C4.89614 15.5725 0 22.7127 0 29.9887C0 34.749 2.03983 39.3728 5.71204 42.705C5.37205 44.1331 5.16797 45.5613 5.16797 46.9889C5.16797 56.713 13.0563 63.9895 22.1686 63.9895C24.0044 63.9895 25.7725 63.7179 27.5407 63.1055C30.6005 66.0977 34.8166 68.0017 39.4411 68.0017Z" },
  { name: "Gemini", viewBox: "0 0 24 24", color: "#8E75B2", d: "M11.04 19.32Q12 21.51 12 24q0-2.49.93-4.68.96-2.19 2.58-3.81t3.81-2.55Q21.51 12 24 12q-2.49 0-4.68-.93a12.3 12.3 0 0 1-3.81-2.58 12.3 12.3 0 0 1-2.58-3.81Q12 2.49 12 0q0 2.49-.96 4.68-.93 2.19-2.55 3.81a12.3 12.3 0 0 1-3.81 2.58Q2.49 12 0 12q2.49 0 4.68.96 2.19.93 3.81 2.55t2.55 3.81" },
  { name: "Perplexity", viewBox: "0 0 24 24", color: "#1FB8CD", d: "M22.3977 7.0896h-2.3106V.0676l-7.5094 6.3542V.1577h-1.1554v6.1966L4.4904 0v7.0896H1.6023v10.3976h2.8882V24l6.932-6.3591v6.2005h1.1554v-6.0469l6.9318 6.1807v-6.4879h2.8882V7.0896zm-3.4657-4.531v4.531h-5.355l5.355-4.531zm-13.2862.0676 4.8691 4.4634H5.6458V2.6262zM2.7576 16.332V8.245h7.8476l-6.1149 6.1147v1.9723H2.7576zm2.8882 5.0404v-3.8852h.0001v-2.6488l5.7763-5.7764v7.0111l-5.7764 5.2993zm12.7086.0248-5.7766-5.1509V9.0618l5.7766 5.7766v6.5588zm2.8882-5.0652h-1.733v-1.9723L13.3948 8.245h7.8478v8.087z" },
  { name: "DeepSeek", viewBox: "0 0 24 24", color: "#5786FE", d: "M23.748 4.651c-.254-.124-.364.113-.512.233-.051.04-.094.09-.137.137-.372.397-.806.657-1.373.626-.829-.046-1.537.214-2.163.848-.133-.782-.575-1.248-1.247-1.548-.352-.155-.708-.311-.955-.65-.172-.24-.219-.509-.305-.774-.055-.16-.11-.323-.293-.35-.2-.031-.278.136-.356.276-.313.572-.434 1.202-.422 1.84.027 1.436.633 2.58 1.838 3.393.137.094.172.187.129.323-.082.28-.18.553-.266.833-.055.179-.137.218-.328.14a5.5 5.5 0 0 1-1.737-1.179c-.857-.828-1.631-1.743-2.597-2.46a12 12 0 0 0-.689-.47c-.985-.957.13-1.743.387-1.836.27-.098.094-.433-.778-.428-.872.003-1.67.295-2.687.685a3 3 0 0 1-.465.136 9.6 9.6 0 0 0-2.883-.101c-1.885.21-3.39 1.1-4.497 2.622C.082 8.776-.231 10.854.152 13.02c.403 2.284 1.568 4.175 3.36 5.653 1.857 1.533 3.997 2.284 6.438 2.14 1.482-.085 3.132-.284 4.994-1.86.47.234.962.328 1.78.398.629.058 1.235-.031 1.705-.129.735-.155.684-.836.418-.961-2.155-1.004-1.682-.595-2.112-.926 1.095-1.295 2.768-3.598 3.284-6.733.05-.346.115-.834.108-1.114-.004-.171.035-.238.23-.257a4.2 4.2 0 0 0 1.545-.475c1.397-.763 1.96-2.016 2.093-3.517.02-.23-.004-.467-.247-.588M11.58 18.168c-2.088-1.642-3.101-2.183-3.52-2.16-.39.024-.32.472-.234.763.09.288.207.487.371.74.114.167.192.416-.113.603-.673.416-1.842-.14-1.897-.168-1.361-.801-2.5-1.86-3.301-3.306-.775-1.393-1.225-2.888-1.299-4.482-.02-.385.094-.522.477-.592a4.7 4.7 0 0 1 1.53-.038c2.131.311 3.946 1.264 5.467 2.774.868.86 1.525 1.887 2.202 2.89.72 1.066 1.494 2.082 2.48 2.915.348.291.626.513.892.677-.802.09-2.14.109-3.055-.615zm1.001-6.44a.306.306 0 0 1 .415-.287.3.3 0 0 1 .113.074.3.3 0 0 1 .086.214c0 .17-.136.307-.308.307a.303.303 0 0 1-.306-.307m3.11 1.596c-.2.081-.4.151-.591.16a1.25 1.25 0 0 1-.798-.254c-.274-.23-.47-.358-.551-.758a1.7 1.7 0 0 1 .015-.588c.07-.327-.007-.537-.238-.727-.188-.156-.426-.199-.689-.199a.6.6 0 0 1-.254-.078.253.253 0 0 1-.114-.358 1 1 0 0 1 .192-.21c.356-.202.767-.136 1.146.016.352.144.618.408 1.001.782.392.451.462.576.685.915.176.264.336.536.446.848.066.194-.02.353-.25.45" },
  { name: "Mistral", viewBox: "0 0 24 24", color: "#FA520F", d: "M17.143 3.429v3.428h-3.429v3.429h-3.428V6.857H6.857V3.43H3.43v13.714H0v3.428h10.286v-3.428H6.857v-3.429h3.429v3.429h3.429v-3.429h3.428v3.429h-3.428v3.428H24v-3.428h-3.43V3.429z" },
  { name: "Qwen", viewBox: "0 0 24 24", color: "#6950EF", d: "M23.919 14.545 20.817 9.17l1.47-2.544a.56.56 0 0 0 0-.566l-1.633-2.83a.57.57 0 0 0-.49-.283h-6.207L12.487.402a.57.57 0 0 0-.49-.284H8.732a.56.56 0 0 0-.49.284L5.139 5.775h-2.94a.56.56 0 0 0-.49.284L.077 8.887a.56.56 0 0 0 0 .567L3.18 14.83l-1.47 2.545a.56.56 0 0 0 0 .566l1.634 2.83a.57.57 0 0 0 .49.283h6.205l1.47 2.545a.57.57 0 0 0 .49.284h3.266a.57.57 0 0 0 .49-.284l3.104-5.375h2.94a.57.57 0 0 0 .49-.283l1.634-2.828a.55.55 0 0 0-.004-.568M8.733.686l1.634 2.828-1.634 2.828H21.8L20.164 9.17H7.425L5.63 6.06Zm1.306 19.801-6.205-.002 1.634-2.83h3.265L2.201 6.344h3.267q3.182 5.517 6.367 11.032zm10.124-5.66L18.53 12l-6.532 11.315-1.634-2.83c2.129-3.673 4.25-7.351 6.373-11.028h3.592l3.102 5.374z" },
  { name: "Llama", viewBox: "0 0 24 24", color: "#0467DF", d: "M6.915 4.03c-1.968 0-3.683 1.28-4.871 3.113C.704 9.208 0 11.883 0 14.449c0 .706.07 1.369.21 1.973a6.624 6.624 0 0 0 .265.86 5.297 5.297 0 0 0 .371.761c.696 1.159 1.818 1.927 3.593 1.927 1.497 0 2.633-.671 3.965-2.444.76-1.012 1.144-1.626 2.663-4.32l.756-1.339.186-.325c.061.1.121.196.183.3l2.152 3.595c.724 1.21 1.665 2.556 2.47 3.314 1.046.987 1.992 1.22 3.06 1.22 1.075 0 1.876-.355 2.455-.843a3.743 3.743 0 0 0 .81-.973c.542-.939.861-2.127.861-3.745 0-2.72-.681-5.357-2.084-7.45-1.282-1.912-2.957-2.93-4.716-2.93-1.047 0-2.088.467-3.053 1.308-.652.57-1.257 1.29-1.82 2.05-.69-.875-1.335-1.547-1.958-2.056-1.182-.966-2.315-1.303-3.454-1.303zm10.16 2.053c1.147 0 2.188.758 2.992 1.999 1.132 1.748 1.647 4.195 1.647 6.4 0 1.548-.368 2.9-1.839 2.9-.58 0-1.027-.23-1.664-1.004-.496-.601-1.343-1.878-2.832-4.358l-.617-1.028a44.908 44.908 0 0 0-1.255-1.98c.07-.109.141-.224.211-.327 1.12-1.667 2.118-2.602 3.358-2.602zm-10.201.553c1.265 0 2.058.791 2.675 1.446.307.327.737.871 1.234 1.579l-1.02 1.566c-.757 1.163-1.882 3.017-2.837 4.338-1.191 1.649-1.81 1.817-2.486 1.817-.524 0-1.038-.237-1.383-.794-.263-.426-.464-1.13-.464-2.046 0-2.221.63-4.535 1.66-6.088.454-.687.964-1.226 1.533-1.533a2.264 2.264 0 0 1 1.088-.285z" },
];

const ROW = 44;
const STEP = 20; // degrees between two rows on the drum
const RADIUS = ROW / 2 / Math.tan(((STEP / 2) * Math.PI) / 180);
const VISIBLE = 4; // rows above and below the middle that are drawn


export function ModelWheel({
  models = defaultModels,
  hold = 1500,
  className,
  label = "AI models on a turning wheel, one after another lands in the middle",
}: ModelWheelProps) {
  const root = useRef<HTMLDivElement>(null);
  const rows = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const n = models.length;
    let offset = 0;

    // Places every row on the drum for the current offset
    const place = () => {
      rows.current.forEach((row, i) => {
        if (!row) return;
        let rel = (((i - offset) % n) + n) % n;
        if (rel > n / 2) rel -= n;
        const angle = rel * STEP;
        const hidden = Math.abs(rel) > VISIBLE;
        row.style.transform = `translateZ(${-RADIUS}px) rotateX(${-angle}deg) translateZ(${RADIUS}px)`;
        row.style.opacity = hidden ? "0" : String(Math.max(0, Math.cos((angle * Math.PI) / 180)) ** 1.6);
        const active = Math.abs(rel) < 0.5;
        if (active && !row.hasAttribute("data-active")) {
          // The fill grows or shrinks to the new model's name
          el.style.setProperty("--ui-mw-fill-w", `${row.querySelector(".ui-mw-label")!.getBoundingClientRect().width + 28}px`);
        }
        row.toggleAttribute("data-active", active);
      });
    };
    place();

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /*
     * One spring moves the drum: it pulls the offset towards the nearest row like a magnet,
     * overshoots a touch and settles. Dragging sets the offset directly; letting go keeps the
     * swing going and the spring locks onto the row it lands closest to.
     */
    let vel = 0; // rows per second
    let target = 0;
    let stiffness = 0;
    let damping = 0;
    let frame = 0;
    let last = 0;
    let timer = 0;
    let visible = false;
    let hovered = false;
    let drag: { y: number; offset: number; t: number } | null = null;

    const spring = (k: number, ratio: number) => {
      stiffness = k;
      damping = 2 * Math.sqrt(k) * ratio;
    };
    const loop = (now: number) => {
      const dt = Math.min(0.032, (now - last) / 1000);
      last = now;
      if (!drag) {
        const force = stiffness * (target - offset) - damping * vel;
        vel += force * dt;
        offset += vel * dt;
        if (Math.abs(target - offset) < 0.0005 && Math.abs(vel) < 0.01) {
          offset = target = ((target % n) + n) % n;
          vel = 0;
          place();
          frame = 0;
          schedule();
          return;
        }
      }
      place();
      frame = requestAnimationFrame(loop);
    };
    const run = () => {
      if (frame) return;
      last = performance.now();
      frame = requestAnimationFrame(loop);
    };

    // Auto turn: a slow, soft spring to the next row
    const schedule = () => {
      window.clearTimeout(timer);
      if (still || !visible || hovered || drag) return;
      timer = window.setTimeout(() => {
        // Turns downwards: the model above rolls into the middle
        target = Math.round(offset) - 1;
        spring(70, 0.66);
        run();
      }, hold);
    };

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      e.preventDefault(); // no text selection or native drag while spinning
      window.clearTimeout(timer);
      el.setPointerCapture(e.pointerId);
      el.setAttribute("data-dragging", "");
      drag = { y: e.clientY, offset, t: performance.now() };
      vel = 0;
      run();
    };
    const onMove = (e: PointerEvent) => {
      if (!drag) return;
      // The button was released somewhere we didn't hear about (outside the window, another frame) – let go now
      if (e.buttons === 0) return onUp();
      const now = performance.now();
      const raw = drag.offset + (drag.y - e.clientY) / ROW;
      // Detents while dragging: each row pulls the wheel in a little, so it ticks from model to model
      const next = raw - Math.sin(2 * Math.PI * raw) * 0.07;
      // Smoothed speed, so a quick flick keeps spinning after the release
      const instant = (next - offset) / Math.max(0.008, (now - drag.t) / 1000);
      vel = vel * 0.6 + instant * 0.4;
      offset = next;
      drag.t = now;
    };
    const onUp = () => {
      if (!drag) return;
      drag = null;
      el.removeAttribute("data-dragging");
      // Throw: the swing carries on a little, then the magnet locks the closest row
      target = Math.round(offset + vel * 0.22);
      spring(140, 0.68);
      run();
    };

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) schedule();
      else window.clearTimeout(timer);
    });
    io.observe(el);
    const enter = () => {
      hovered = true;
      window.clearTimeout(timer);
    };
    const leave = () => {
      hovered = false;
      schedule();
    };
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    // Releasing outside the wheel or losing the capture always ends the spin
    el.addEventListener("lostpointercapture", onUp);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("blur", onUp);

    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      el.removeEventListener("lostpointercapture", onUp);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("blur", onUp);
    };
  }, [models, hold]);

  return (
    <div ref={root} className={["ui-mw", className].filter(Boolean).join(" ")} role="img" aria-label={label}>
      {/* React 19 hoists this into <head> once, no matter how many instances render */}
      <style href="ui-model-wheel" precedence="default">
        {css}
      </style>
      <div className="ui-mw-fill" aria-hidden="true" />
      <div className="ui-mw-drum" aria-hidden="true">
        {models.map((m, i) => (
          <div
            key={m.name}
            ref={(node) => {
              rows.current[i] = node;
            }}
            className="ui-mw-row"
          >
            <span className="ui-mw-label">
              <svg viewBox={m.viewBox} style={{ color: m.color === "currentColor" ? undefined : m.color }}>
                <path d={m.d} fill="currentColor" />
              </svg>
              {m.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Styles ---------- */

const css = /* css */ `
.ui-mw {
  touch-action: none;
  cursor: grab;
  --ui-mw-ink: #171717;
  --ui-mw-muted: #8f8f8f;
  --ui-mw-fill: rgba(0, 0, 0, 0.05);
  --ui-mw-mark: #171717;
  position: relative;
  display: grid;
  place-items: center;
  width: 100%;
  height: ${ROW * 7}px;
  font-family: inherit;
  -webkit-font-smoothing: antialiased;
  user-select: none;
}
/* The selected model sits on a soft gray fill that follows the length of its name */
.ui-mw-fill {
  position: absolute;
  top: 50%;
  left: 50%;
  width: var(--ui-mw-fill-w, 140px);
  height: ${ROW - 6}px;
  translate: -50% -50%;
  border-radius: 11px;
  background: var(--ui-mw-fill);
  transition: width 420ms cubic-bezier(0.22, 1, 0.36, 1);
}
.ui-mw-drum {
  position: absolute;
  inset: 0;
  perspective: 560px;
  transform-style: preserve-3d;
  /* Rows fade out softly at both ends of the drum */
  -webkit-mask-image: linear-gradient(to bottom, transparent, #000 22%, #000 78%, transparent);
  mask-image: linear-gradient(to bottom, transparent, #000 22%, #000 78%, transparent);
}
.ui-mw-row {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  height: ${ROW}px;
  margin-top: ${-ROW / 2}px;
  backface-visibility: hidden;
  font-size: 16px;
  font-weight: 450;
  letter-spacing: -0.01em;
  color: var(--ui-mw-muted);
  will-change: transform, opacity;
}
.ui-mw[data-dragging] { cursor: grabbing; }
.ui-mw-label { display: inline-flex; align-items: center; gap: 10px; }
.ui-mw-row svg { flex: none; width: 18px; height: 18px; color: var(--ui-mw-mark); }
.ui-mw-row[data-active] { font-weight: 500; color: var(--ui-mw-ink); }

/* Dark mode: follows a .dark class or data-theme="dark" on any ancestor */
:where(.dark, [data-theme="dark"]) .ui-mw {
  --ui-mw-ink: #ededed;
  --ui-mw-muted: #8a8a8f;
  --ui-mw-fill: rgba(255, 255, 255, 0.07);
  --ui-mw-mark: #ededed;
}
`;
