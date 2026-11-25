"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";

/*
 * Model Orbit – a wide card illustration, in a single self-contained file.
 * A wide gray track seen at a slant. AI model makers sit on it at even steps as app tiles with their marks, leaning back
 * with the track – nearer ones larger, the ones at the back smaller and paler – each with a number; point at one and a
 * dark tip shows its name. Thin blue beams arc from every tile to a white hub with the agent's pixel mark, landing on its
 * edge, and short blue sparks run along them now and then. Drag sideways to turn it; it glides to a stop when let go.
 * The artwork is drawn on a 960 × 540 viewBox. Decoration, so it is one image for screen readers.
 */

export type OrbitModel = {
  name: string;
  /** The maker's mark, drawn in a 24 × 24 box */
  logo: ReactNode;
};

export type ModelOrbitProps = {
  /** The models on the rim, in order around it – eight by default */
  models?: OrbitModel[];
  /** Show the small numbers next to the chips */
  labels?: boolean;
  /** Drag (or use the arrow keys) to turn the ring – on by default */
  draggable?: boolean;
  className?: string;
  /** Accessible description of the scene */
  label?: string;
};

/* ---------- Model makers: their own marks, as plain SVG so they scale with the chips ---------- */

const Mark = ({ children, box = "0 0 24 24" }: { children: ReactNode; box?: string }) => (
  <svg viewBox={box} width="24" height="24" x="-12" y="-12" aria-hidden="true">
    {children}
  </svg>
);

const OpenAILogo = () => (
  <Mark>
    <path className="ui-mor-ink" d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" />
  </Mark>
);

const ClaudeLogo = () => (
  <Mark>
    <path fill="#D97757" d="m4.7144 15.9555 4.7174-2.6471.079-.2307-.079-.1275h-.2307l-.7893-.0486-2.6956-.0729-2.3375-.0971-2.2646-.1214-.5707-.1215-.5343-.7042.0546-.3522.4797-.3218.686.0608 1.5179.1032 2.2767.1578 1.6514.0972 2.4468.255h.3886l.0546-.1579-.1336-.0971-.1032-.0972L6.973 9.8356l-2.55-1.6879-1.3356-.9714-.7225-.4918-.3643-.4614-.1578-1.0078.6557-.7225.8803.0607.2246.0607.8925.686 1.9064 1.4754 2.4893 1.8336.3643.3035.1457-.1032.0182-.0728-.164-.2733-1.3539-2.4467-1.445-2.4893-.6435-1.032-.17-.6194c-.0607-.255-.1032-.4674-.1032-.7285L6.287.1335 6.6997 0l.9957.1336.419.3642.6192 1.4147 1.0018 2.2282 1.5543 3.0296.4553.8985.2429.8318.091.255h.1579v-.1457l.1275-1.706.2368-2.0947.2307-2.6957.0789-.7589.3764-.9107.7468-.4918.5828.2793.4797.686-.0668.4433-.2853 1.8517-.5586 2.9021-.3643 1.9429h.2125l.2429-.2429.9835-1.3053 1.6514-2.0643.7286-.8196.85-.9046.5464-.4311h1.0321l.759 1.1293-.34 1.1657-1.0625 1.3478-.8804 1.1414-1.2628 1.7-.7893 1.36.0729.1093.1882-.0183 2.8535-.607 1.5421-.2794 1.8396-.3157.8318.3886.091.3946-.3278.8075-1.967.4857-2.3072.4614-3.4364.8136-.0425.0304.0486.0607 1.5482.1457.6618.0364h1.621l3.0175.2247.7892.522.4736.6376-.079.4857-1.2142.6193-1.6393-.3886-3.825-.9107-1.3113-.3279h-.1822v.1093l1.0929 1.0686 2.0035 1.8092 2.5075 2.3314.1275.5768-.3218.4554-.34-.0486-2.2039-1.6575-.85-.7468-1.9246-1.621h-.1275v.17l.4432.6496 2.3436 3.5214.1214 1.0807-.17.3521-.6071.2125-.6679-.1214-1.3721-1.9246L14.38 17.959l-1.1414-1.9428-.1397.079-.674 7.2552-.3156.3703-.7286.2793-.6071-.4614-.3218-.7468.3218-1.4753.3886-1.9246.3157-1.53.2853-1.9004.17-.6314-.0121-.0425-.1397.0182-1.4328 1.9672-2.1796 2.9446-1.7243 1.8456-.4128.164-.7164-.3704.0667-.6618.4008-.5889 2.386-3.0357 1.4389-1.882.929-1.0868-.0062-.1579h-.0546l-6.3385 4.1164-1.1293.1457-.4857-.4554.0608-.7467.2307-.2429 1.9064-1.3114Z" />
  </Mark>
);

const GeminiLogo = ({ id }: { id: string }) => (
  <Mark>
    <defs>
      <linearGradient id={`${id}-gem`} x1="2" y1="22" x2="22" y2="2" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#00b95c" />
        <stop offset="0.35" stopColor="#3186ff" />
        <stop offset="0.7" stopColor="#3186ff" />
        <stop offset="0.85" stopColor="#fc413d" />
        <stop offset="1" stopColor="#ffd500" />
      </linearGradient>
    </defs>
    <path fill={`url(#${id}-gem)`} d="M11.04 19.32Q12 21.51 12 24q0-2.49.93-4.68.96-2.19 2.58-3.81t3.81-2.55Q21.51 12 24 12q-2.49 0-4.68-.93a12.3 12.3 0 0 1-3.81-2.58 12.3 12.3 0 0 1-2.58-3.81Q12 2.49 12 0q0 2.49-.96 4.68-.93 2.19-2.55 3.81a12.3 12.3 0 0 1-3.81 2.58Q2.49 12 0 12q2.49 0 4.68.96 2.19.93 3.81 2.55t2.55 3.81" />
  </Mark>
);

const MistralLogo = ({ id }: { id: string }) => (
  <Mark>
    <defs>
      {/* Mistral's rows run from yellow to red */}
      <linearGradient id={`${id}-mis`} x1="0" y1="3.4" x2="0" y2="20.6" gradientUnits="userSpaceOnUse">
        <stop offset="0.2" stopColor="#ffd800" />
        <stop offset="0.2" stopColor="#ffaf00" />
        <stop offset="0.4" stopColor="#ffaf00" />
        <stop offset="0.4" stopColor="#ff8205" />
        <stop offset="0.6" stopColor="#ff8205" />
        <stop offset="0.6" stopColor="#fa500f" />
        <stop offset="0.8" stopColor="#fa500f" />
        <stop offset="0.8" stopColor="#e10500" />
      </linearGradient>
    </defs>
    <path fill={`url(#${id}-mis)`} d="M17.143 3.429v3.428h-3.429v3.429h-3.428V6.857H6.857V3.43H3.43v13.714H0v3.428h10.286v-3.428H6.857v-3.429h3.429v3.429h3.429v-3.429h3.428v3.429h-3.428v3.428H24v-3.428h-3.43V3.429z" />
  </Mark>
);

const MetaLogo = () => (
  <Mark>
    <path fill="#0467DF" d="M6.915 4.03c-1.968 0-3.683 1.28-4.871 3.113C.704 9.208 0 11.883 0 14.449c0 .706.07 1.369.21 1.973a6.624 6.624 0 0 0 .265.86 5.297 5.297 0 0 0 .371.761c.696 1.159 1.818 1.927 3.593 1.927 1.497 0 2.633-.671 3.965-2.444.76-1.012 1.144-1.626 2.663-4.32l.756-1.339.186-.325c.061.1.121.196.183.3l2.152 3.595c.724 1.21 1.665 2.556 2.47 3.314 1.046.987 1.992 1.22 3.06 1.22 1.075 0 1.876-.355 2.455-.843a3.743 3.743 0 0 0 .81-.973c.542-.939.861-2.127.861-3.745 0-2.72-.681-5.357-2.084-7.45-1.282-1.912-2.957-2.93-4.716-2.93-1.047 0-2.088.467-3.053 1.308-.652.57-1.257 1.29-1.82 2.05-.69-.875-1.335-1.547-1.958-2.056-1.182-.966-2.315-1.303-3.454-1.303zm10.16 2.053c1.147 0 2.188.758 2.992 1.999 1.132 1.748 1.647 4.195 1.647 6.4 0 1.548-.368 2.9-1.839 2.9-.58 0-1.027-.23-1.664-1.004-.496-.601-1.343-1.878-2.832-4.358l-.617-1.028a44.908 44.908 0 0 0-1.255-1.98c.07-.109.141-.224.211-.327 1.12-1.667 2.118-2.602 3.358-2.602zm-10.201.553c1.265 0 2.058.791 2.675 1.446.307.327.737.871 1.234 1.579l-1.02 1.566c-.757 1.163-1.882 3.017-2.837 4.338-1.191 1.649-1.81 1.817-2.486 1.817-.524 0-1.038-.237-1.383-.794-.263-.426-.464-1.13-.464-2.046 0-2.221.63-4.535 1.66-6.088.454-.687.964-1.226 1.533-1.533a2.264 2.264 0 0 1 1.088-.285z" />
  </Mark>
);

const DeepSeekLogo = () => (
  <Mark>
    <path fill="#4D6BFE" d="M23.748 4.651c-.254-.124-.364.113-.512.233-.051.04-.094.09-.137.137-.372.397-.806.657-1.373.626-.829-.046-1.537.214-2.163.848-.133-.782-.575-1.248-1.247-1.548-.352-.155-.708-.311-.955-.65-.172-.24-.219-.509-.305-.774-.055-.16-.11-.323-.293-.35-.2-.031-.278.136-.356.276-.313.572-.434 1.202-.422 1.84.027 1.436.633 2.58 1.838 3.393.137.094.172.187.129.323-.082.28-.18.553-.266.833-.055.179-.137.218-.328.14a5.5 5.5 0 0 1-1.737-1.179c-.857-.828-1.631-1.743-2.597-2.46a12 12 0 0 0-.689-.47c-.985-.957.13-1.743.387-1.836.27-.098.094-.433-.778-.428-.872.003-1.67.295-2.687.685a3 3 0 0 1-.465.136 9.6 9.6 0 0 0-2.883-.101c-1.885.21-3.39 1.1-4.497 2.622C.082 8.776-.231 10.854.152 13.02c.403 2.284 1.568 4.175 3.36 5.653 1.857 1.533 3.997 2.284 6.438 2.14 1.482-.085 3.132-.284 4.994-1.86.47.234.962.328 1.78.398.629.058 1.235-.031 1.705-.129.735-.155.684-.836.418-.961-2.155-1.004-1.682-.595-2.112-.926 1.095-1.295 2.768-3.598 3.284-6.733.05-.346.115-.834.108-1.114-.004-.171.035-.238.23-.257a4.2 4.2 0 0 0 1.545-.475c1.397-.763 1.96-2.016 2.093-3.517.02-.23-.004-.467-.247-.588M11.58 18.168c-2.088-1.642-3.101-2.183-3.52-2.16-.39.024-.32.472-.234.763.09.288.207.487.371.74.114.167.192.416-.113.603-.673.416-1.842-.14-1.897-.168-1.361-.801-2.5-1.86-3.301-3.306-.775-1.393-1.225-2.888-1.299-4.482-.02-.385.094-.522.477-.592a4.7 4.7 0 0 1 1.53-.038c2.131.311 3.946 1.264 5.467 2.774.868.86 1.525 1.887 2.202 2.89.72 1.066 1.494 2.082 2.48 2.915.348.291.626.513.892.677-.802.09-2.14.109-3.055-.615zm1.001-6.44a.306.306 0 0 1 .415-.287.3.3 0 0 1 .113.074.3.3 0 0 1 .086.214c0 .17-.136.307-.308.307a.303.303 0 0 1-.306-.307m3.11 1.596c-.2.081-.4.151-.591.16a1.25 1.25 0 0 1-.798-.254c-.274-.23-.47-.358-.551-.758a1.7 1.7 0 0 1 .015-.588c.07-.327-.007-.537-.238-.727-.188-.156-.426-.199-.689-.199a.6.6 0 0 1-.254-.078.253.253 0 0 1-.114-.358 1 1 0 0 1 .192-.21c.356-.202.767-.136 1.146.016.352.144.618.408 1.001.782.392.451.462.576.685.915.176.264.336.536.446.848.066.194-.02.353-.25.45" />
  </Mark>
);

const QwenLogo = () => (
  <Mark>
    <path fill="#6950EF" d="M23.919 14.545 20.817 9.17l1.47-2.544a.56.56 0 0 0 0-.566l-1.633-2.83a.57.57 0 0 0-.49-.283h-6.207L12.487.402a.57.57 0 0 0-.49-.284H8.732a.56.56 0 0 0-.49.284L5.139 5.775h-2.94a.56.56 0 0 0-.49.284L.077 8.887a.56.56 0 0 0 0 .567L3.18 14.83l-1.47 2.545a.56.56 0 0 0 0 .566l1.634 2.83a.57.57 0 0 0 .49.283h6.205l1.47 2.545a.57.57 0 0 0 .49.284h3.266a.57.57 0 0 0 .49-.284l3.104-5.375h2.94a.57.57 0 0 0 .49-.283l1.634-2.828a.55.55 0 0 0-.004-.568M8.733.686l1.634 2.828-1.634 2.828H21.8L20.164 9.17H7.425L5.63 6.06Zm1.306 19.801-6.205-.002 1.634-2.83h3.265L2.201 6.344h3.267q3.182 5.517 6.367 11.032zm10.124-5.66L18.53 12l-6.532 11.315-1.634-2.83c2.129-3.673 4.25-7.351 6.373-11.028h3.592l3.102 5.374z" />
  </Mark>
);

const GrokLogo = () => (
  <Mark box="-1 -1 35.4 34">
    <path className="ui-mor-ink" d="M12.8734 20.5407L23.9549 12.3506C24.4982 11.9491 25.2747 12.1057 25.5336 12.7294C26.896 16.0185 26.2873 19.9712 23.5766 22.6851C20.866 25.3989 17.0944 25.9941 13.6471 24.6386L9.88123 26.3843C15.2826 30.0806 21.8416 29.1665 25.9403 25.0601C29.1914 21.8051 30.1983 17.3683 29.2568 13.3673L29.2653 13.3758C27.9 7.49809 29.601 5.14871 33.0853 0.344576C33.1677 0.230667 33.2502 0.116757 33.3327 0L28.7476 4.59055V4.57631L12.8706 20.5436" />
    <path className="ui-mor-ink" d="M10.5867 22.5312C6.70979 18.8234 7.37821 13.0852 10.6862 9.77618C13.1323 7.3271 17.14 6.32755 20.6385 7.79698L24.3959 6.05986C23.719 5.57005 22.8514 5.04322 21.8559 4.67301C17.3562 2.81914 11.969 3.7418 8.31115 7.40114C4.79271 10.9238 3.68626 16.3402 5.58628 20.9621C7.0056 24.4164 4.67893 26.8597 2.3352 29.3259C1.50465 30.2001 0.67126 31.0744 0 31.9999L10.5838 22.534" />
  </Mark>
);

/* ---------- The scene ---------- */

const W = 960;
const H = 540;
const CX = 480;
const CY = 242;
/** The ring's radius and how flat the slant makes it */
const R = 432;
const FLAT = 0.5;
/** How far the chips lean back with the ring – a little less flat than the ring, so the marks stay readable */
const LEAN = 0.62;
/** The chips sit at even steps around the rim, the first one nearest (90°) – -90° is the far side */
const MAX = 12;
const spot = (i: number, count: number) => 90 + (i * 360) / count;
/** The hub's pixel mark: a 3×3 grid, mirrored left to right */
const HUB = [1, 0, 1, 1, 1, 1, 1, 0, 1];

/** An ellipse of radius r around the center, as a path – two of them make the track */
const oval = (r: number) => `M${CX - r} ${CY} a${r} ${r * FLAT} 0 1 0 ${2 * r} 0 a${r} ${r * FLAT} 0 1 0 ${-2 * r} 0 Z`;

/** The hub chip's radius – the beams land on its edge */
const HUB_R = 32;
type Beam = { x0: number; y0: number; cx: number; cy: number; x1: number; y1: number };
/** A beam from a tile to the hub: it bows upward a little on its way in (more for the near ones) and ends on the hub's edge */
const beamFor = (x: number, y: number, near: number): Beam => {
  const cx = (x + CX) / 2;
  const cy = Math.min(y, CY) - 30 - 50 * near;
  const len = Math.hypot(CX - cx, CY - cy) || 1;
  const dx = (CX - cx) / len;
  const dy = (CY - cy) / len;
  const t = 1 / Math.sqrt((dx / HUB_R) ** 2 + (dy / (HUB_R * LEAN)) ** 2);
  return { x0: x, y0: y, cx, cy, x1: CX - dx * t, y1: CY - dy * t };
};
/** A point on a beam, t from 0 (tile) to 1 (hub) */
const along = (b: Beam, t: number) => {
  const u = 1 - t;
  return { x: u * u * b.x0 + 2 * u * t * b.cx + t * t * b.x1, y: u * u * b.y0 + 2 * u * t * b.cy + t * t * b.y1 };
};
/** Spark color: affectUI's blue */
const SPARK = "#0090fe";

/** Sparks: short colored streaks that run along random beams toward the hub, fading from the head to the tail */
function Sparks({ id, beams }: { id: string; beams: { b: Beam; near: number }[] }) {
  const POOL = 7;
  const paths = useRef<(SVGPathElement | null)[]>([]);
  const grads = useRef<(SVGLinearGradientElement | null)[]>([]);
  const beamsRef = useRef(beams);
  beamsRef.current = beams;
  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    // Each spark waits a random moment, then runs one beam in 0.9–1.6 s
    const sparks = Array.from({ length: POOL }, () => ({ beam: 0, start: performance.now() + Math.random() * 2500, dur: 1200 }));
    let frame = 0;
    const tick = (now: number) => {
      const list = beamsRef.current;
      sparks.forEach((sp, k) => {
        const path = paths.current[k];
        const grad = grads.current[k];
        if (!path || !grad || !list.length) return;
        if (now < sp.start) {
          path.style.opacity = "0";
          return;
        }
        const p = (now - sp.start) / sp.dur;
        if (p >= 1) {
          // Rest a little, then pick a new beam
          sp.beam = Math.floor(Math.random() * list.length);
          sp.start = now + 300 + Math.random() * 2200;
          sp.dur = 900 + Math.random() * 700;
          path.style.opacity = "0";
          return;
        }
        const { b, near } = list[Math.min(sp.beam, list.length - 1)];
        const head = Math.min(1, p * 1.25);
        const tail = Math.max(0, head - 0.28);
        const pts = Array.from({ length: 9 }, (_, j) => along(b, tail + ((head - tail) * j) / 8));
        path.setAttribute("d", "M" + pts.map((q) => `${q.x.toFixed(1)} ${q.y.toFixed(1)}`).join(" L"));
        const a = pts[0];
        const z = pts[pts.length - 1];
        grad.setAttribute("x1", a.x.toFixed(1));
        grad.setAttribute("y1", a.y.toFixed(1));
        grad.setAttribute("x2", z.x.toFixed(1));
        grad.setAttribute("y2", z.y.toFixed(1));
        // Fades in as it leaves the tile, out as it reaches the hub; paler at the back
        const edge = Math.min(1, p / 0.12, (1 - p) / 0.18);
        path.style.opacity = String(Math.max(0, edge) * (0.35 + near * 0.65));
      });
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);
  return (
    <g aria-hidden="true">
      <defs>
        {Array.from({ length: POOL }, (_, k) => (
          <linearGradient key={k} id={`${id}-spark${k}`} gradientUnits="userSpaceOnUse" ref={(el) => { grads.current[k] = el; }}>
            <stop offset="0" stopColor={SPARK} stopOpacity="0" />
            <stop offset="1" stopColor={SPARK} stopOpacity="1" />
          </linearGradient>
        ))}
      </defs>
      {Array.from({ length: POOL }, (_, k) => (
        <path key={k} className="ui-mor-spark" stroke={`url(#${id}-spark${k})`} ref={(el) => { paths.current[k] = el; }} style={{ opacity: 0 }} />
      ))}
    </g>
  );
}

const pointAt = (deg: number, r = R) => {
  const a = (deg * Math.PI) / 180;
  return { x: CX + r * Math.cos(a), y: CY + r * Math.sin(a) * FLAT, near: (Math.sin(a) + 1) / 2 };
};

export function ModelOrbit({
  models,
  labels = true,
  draggable = true,
  className,
  label = "AI model makers around a ring, each linked to its center",
}: ModelOrbitProps) {
  const id = "ui-mor" + useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const list: OrbitModel[] = models ?? [
    { name: "ChatGPT", logo: <OpenAILogo /> },
    { name: "Claude", logo: <ClaudeLogo /> },
    { name: "Gemini", logo: <GeminiLogo id={id} /> },
    { name: "Mistral", logo: <MistralLogo id={id} /> },
    { name: "Llama", logo: <MetaLogo /> },
    { name: "DeepSeek", logo: <DeepSeekLogo /> },
    { name: "Qwen", logo: <QwenLogo /> },
    { name: "Grok", logo: <GrokLogo /> },
  ];

  /* Turning the ring: drag sideways and it follows, let go and it glides to a stop */
  const [turn, setTurn] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [hover, setHover] = useState<number | null>(null);
  const drag = useRef<{ x: number; t: number; v: number } | null>(null);
  const glide = useRef(0);
  const box = useRef<HTMLDivElement>(null);
  /** Degrees per pixel – a full drag across the card turns it about half way */
  const perPx = () => 180 / Math.max(240, box.current?.clientWidth ?? 760);
  useEffect(() => () => cancelAnimationFrame(glide.current), []);

  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!draggable || e.button !== 0) return;
    cancelAnimationFrame(glide.current);
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, t: performance.now(), v: 0 };
    setDragging(true);
  };
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const now = performance.now();
    const dx = e.clientX - d.x;
    // Dragging right brings the left side forward
    const step = -dx * perPx();
    d.v = step / Math.max(8, now - d.t);
    d.x = e.clientX;
    d.t = now;
    setTurn((t) => t + step);
  };
  const onUp = () => {
    const d = drag.current;
    drag.current = null;
    setDragging(false);
    if (!d || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    let v = d.v * 16;
    let last = performance.now();
    const run = (now: number) => {
      const dt = Math.min(48, now - last) / 16;
      last = now;
      v *= Math.pow(0.91, dt);
      if (Math.abs(v) < 0.02) return;
      setTurn((t) => t + v * dt);
      glide.current = requestAnimationFrame(run);
    };
    glide.current = requestAnimationFrame(run);
  };
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!draggable) return;
    const step = 360 / Math.max(1, Math.min(MAX, list.length)) / 2;
    if (e.key === "ArrowLeft") setTurn((t) => t + step);
    else if (e.key === "ArrowRight") setTurn((t) => t - step);
    else return;
    e.preventDefault();
  };

  // Chips, far side first so the near ones sit on top
  const nodes = list
    .slice(0, MAX)
    .map((m, i, all) => ({ ...m, i, deg: spot(i, all.length) + turn, ...pointAt(spot(i, all.length) + turn) }))
    .sort((a, b) => a.y - b.y);

  const beams = nodes.map((n) => ({ b: beamFor(n.x, n.y, n.near), near: n.near, i: n.i }));

  return (
    <div
      ref={box}
      className={["ui-mor", className].filter(Boolean).join(" ")}
      role="img"
      aria-label={draggable ? `${label} – drag or use the arrow keys to turn it` : label}
      tabIndex={draggable ? 0 : undefined}
      data-draggable={draggable || undefined}
      data-dragging={dragging || undefined}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      onKeyDown={onKey}
    >
      <style href="ui-model-orbit" precedence="default">
        {css}
      </style>
      <svg className="ui-mor-art" viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
        <defs>
          {/* A soft shadow under each chip */}
          <filter id={`${id}-lift`} x="-60%" y="-60%" width="220%" height="240%">
            <feDropShadow dx="0" dy="6" stdDeviation="8" className="ui-mor-shadow" floodOpacity="0.08" />
            <feDropShadow dx="0" dy="1" stdDeviation="1" className="ui-mor-shadow" floodOpacity="0.06" />
          </filter>
        </defs>

        {/* A wide track, beams arcing from every tile to a glowing hub */}
        <defs>
          <linearGradient id={`${id}-band`} x1="0" y1={CY - R * FLAT} x2="0" y2={CY + R * FLAT} gradientUnits="userSpaceOnUse">
            <stop offset="0" className="ui-mor-band-far" />
            <stop offset="1" className="ui-mor-band-near" />
          </linearGradient>
          <radialGradient id={`${id}-glow`} cx="50%" cy="50%" r="50%">
            <stop offset="0" className="ui-mor-glow-in" />
            <stop offset="1" className="ui-mor-glow-out" />
          </radialGradient>
          {nodes.map((n) => (
            <linearGradient key={n.i} id={`${id}-beam${n.i}`} x1={n.x} y1={n.y} x2={beamFor(n.x, n.y, n.near).x1} y2={beamFor(n.x, n.y, n.near).y1} gradientUnits="userSpaceOnUse">
              <stop offset="0" className="ui-mor-beam-from" />
              <stop offset="1" className="ui-mor-beam-to" />
            </linearGradient>
          ))}
        </defs>
        <ellipse fill={`url(#${id}-glow)`} cx={CX} cy={CY} rx={R * 0.55} ry={R * 0.55 * FLAT} />
        <ellipse className="ui-mor-ripple" cx={CX} cy={CY} rx={R * 0.2} ry={R * 0.2 * FLAT} />
        <ellipse className="ui-mor-ripple" cx={CX} cy={CY} rx={R * 0.36} ry={R * 0.36 * FLAT} />
        <path className="ui-mor-track" fill={`url(#${id}-band)`} fillRule="evenodd" d={`${oval(R + 22)} ${oval(R - 22)}`} />
        <g transform={`translate(${CX} ${CY}) scale(1 ${LEAN})`}>
          <circle className="ui-mor-halo" r="44" />
          <circle className="ui-mor-chip" r={HUB_R} filter={`url(#${id}-lift)`} />
          {HUB.map((on, k) =>
            on ? <rect key={k} className="ui-mor-pixel" x={-10 + (k % 3) * 7} y={-10 + Math.floor(k / 3) * 7} width="5" height="5" rx="1.2" /> : null
          )}
        </g>
        {/* The beams land on the hub's edge, on top of it */}
        {beams.map(({ b, near, i }) => {
          const d = `M${b.x0.toFixed(1)} ${b.y0.toFixed(1)} Q${b.cx.toFixed(1)} ${b.cy.toFixed(1)} ${b.x1.toFixed(1)} ${b.y1.toFixed(1)}`;
          return (
            <g key={`b${i}`} style={{ opacity: 0.3 + near * 0.7 }}>
              <path className="ui-mor-beam-glow" d={d} stroke={`url(#${id}-beam${i})`} />
              <path className="ui-mor-beam" d={d} stroke={`url(#${id}-beam${i})`} />
            </g>
          );
        })}
        <Sparks id={id} beams={beams} />

        {/* The chips */}
        {nodes.map((n) => {
          const s = 0.62 + n.near * 0.48;
          const fade = 0.35 + n.near * 0.65;
          return (
            <g
              key={`n${n.i}`}
              className="ui-mor-node"
              transform={`translate(${n.x.toFixed(1)} ${n.y.toFixed(1)}) scale(${s.toFixed(3)})`}
              style={{ opacity: fade }}
              onPointerEnter={() => setHover(n.i)}
              onPointerLeave={() => setHover((h) => (h === n.i ? null : h))}
            >
              {/* The chip lies in the ring's plane: flattened like the ring, its mark with it */}
              <g transform={`scale(1 ${LEAN})`}>
                {/* An app tile with a hairline edge */}
                <rect className="ui-mor-chip ui-mor-tile" x="-30" y="-30" width="60" height="60" rx="18" filter={`url(#${id}-lift)`} />
                <g transform="scale(1.15)">{n.logo}</g>
              </g>
              {labels && (
                <>
                  <text className="ui-mor-num" x="40" y="-22">
                    {String(n.i + 1).padStart(2, "0")}
                  </text>
                </>
              )}
            </g>
          );
        })}
      </svg>
      {/* The name, in a small dark tip above the logo you point at */}
      {nodes.map((n) =>
        n.i === hover && !dragging && String(n.name ?? "").trim() ? (
          <span
            key={`tip${n.i}`}
            className="ui-mor-tip"
            style={{ left: `${(n.x / W) * 100}%`, top: `${((n.y - 30 * LEAN * (0.62 + n.near * 0.48)) / H) * 100}%` }}
          >
            {n.name}
          </span>
        ) : null
      )}
    </div>
  );
}

const css = /* css */ `
.ui-mor {
  --ui-mor-ink: #171717;
  --ui-mor-chip: #ffffff;
  --ui-mor-halo: rgba(0, 0, 0, 0.1);
  --ui-mor-band: rgba(0, 0, 0, 0.035);
  --ui-mor-agent: rgba(0, 96, 226, 0.78);
  --ui-mor-num: rgba(0, 0, 0, 0.4);
  --ui-mor-shadow: #000000;
  --ui-mor-tip: rgba(0, 0, 0, 0.88);
  --ui-mor-tip-ink: #fcfcfc;
  --ui-mor-focus: var(--aui-focus, rgba(0, 96, 226, 0.7));
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  font-family: var(--aui-font, "Inter", "InterVariable", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif);
}
.ui-mor { position: relative; outline: none; touch-action: pan-y; -webkit-user-select: none; user-select: none; }
.ui-mor[data-draggable] { cursor: grab; }
.ui-mor[data-dragging] { cursor: grabbing; }
.ui-mor:focus-visible { outline: 2px solid var(--ui-mor-focus); outline-offset: 2px; border-radius: 12px; }
.ui-mor-art { display: block; width: 100%; height: 100%; overflow: visible; }
.ui-mor-node { cursor: default; }
.ui-mor[data-draggable] .ui-mor-node { cursor: inherit; }
/* The tip: a small dark label above the logo, like the chart tags */
.ui-mor-tip {
  position: absolute;
  z-index: 1;
  padding: 3px 8px;
  border-radius: 6px;
  background: var(--ui-mor-tip);
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
  color: var(--ui-mor-tip-ink);
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  pointer-events: none;
  transform: translate(-50%, calc(-100% - 8px));
  animation: ui-mor-tip 140ms ease-out both;
}
@keyframes ui-mor-tip { from { opacity: 0; transform: translate(-50%, calc(-100% - 4px)); } }
@media (prefers-reduced-motion: reduce) { .ui-mor-tip { animation: none; } }
.ui-mor-ink { fill: var(--ui-mor-ink); }
.ui-mor-pixel { fill: var(--ui-mor-agent); }
.ui-mor-band-far { stop-color: var(--ui-mor-band); stop-opacity: 0.35; }
.ui-mor-band-near { stop-color: var(--ui-mor-band); stop-opacity: 1; }
.ui-mor-glow-in { stop-color: var(--ui-mor-agent); stop-opacity: 0.16; }
.ui-mor-glow-out { stop-color: var(--ui-mor-agent); stop-opacity: 0; }
.ui-mor-ripple { fill: none; stroke: var(--ui-mor-agent); stroke-opacity: 0.18; stroke-width: 1; }
.ui-mor-beam-from { stop-color: var(--ui-mor-agent); stop-opacity: 0.08; }
.ui-mor-beam-to { stop-color: var(--ui-mor-agent); stop-opacity: 0.7; }
.ui-mor-beam { fill: none; stroke-width: 1.4; stroke-linecap: round; }
.ui-mor-beam-glow { fill: none; stroke-width: 6; stroke-linecap: round; opacity: 0.12; }
.ui-mor-tile { stroke: var(--ui-mor-halo); stroke-width: 1; }
.ui-mor-spark { fill: none; stroke-width: 2; stroke-linecap: round; }
.ui-mor-chip { fill: var(--ui-mor-chip); }
.ui-mor-halo { fill: none; stroke: var(--ui-mor-halo); stroke-width: 1; }
.ui-mor-shadow { flood-color: var(--ui-mor-shadow); }
.ui-mor-num { font-size: 12px; font-weight: 500; letter-spacing: 0.04em; fill: var(--ui-mor-num); font-variant-numeric: tabular-nums; }

/* Dark mode: follows a .dark class or data-theme="dark" on any ancestor, e.g. <html> */
:where(.dark, [data-theme="dark"]) .ui-mor {
  --ui-mor-ink: #ededed;
  --ui-mor-chip: #232326;
  --ui-mor-halo: rgba(255, 255, 255, 0.1);
  --ui-mor-band: rgba(255, 255, 255, 0.05);
  --ui-mor-agent: rgba(77, 141, 255, 0.85);
  --ui-mor-num: rgba(255, 255, 255, 0.4);
  --ui-mor-shadow: #000000;
  --ui-mor-tip: rgba(255, 255, 255, 0.92);
  --ui-mor-tip-ink: #111111;
  --ui-mor-focus: var(--aui-focus, rgba(77, 141, 255, 0.8));
}
`;
