/** A boat seen from above, for course and maneuver drawings. Wind is from the top. */
export interface Pose {
  x: number;
  y: number;
  /** Direction of travel in degrees: 0 is into the wind, 90 to the right. */
  heading: number;
  /** Boom angle, positive to starboard. Defaults to a trim that suits the heading. */
  boom?: number;
  /** Jib angle, positive to starboard. The jib is only drawn when given. */
  jib?: number;
  step?: number;
  /** Offset of the step number from the boat. */
  stepAt?: [number, number];
}

const HULL = "M0,-13 C6,-6 6,4 4,11 L-4,11 C-6,4 -6,-6 0,-13 Z";
const MAST_Y = -3;
const BOW_Y = -13;

function trueWindAngle(heading: number): number {
  const h = ((heading % 360) + 360) % 360;
  return h <= 180 ? h : 360 - h;
}

function autoBoom(heading: number): number {
  const h = ((heading % 360) + 360) % 360;
  const twa = trueWindAngle(heading);
  if (twa < 30) return 0;
  const angle = Math.min(80, (twa - 30) * 0.57 + 6);
  return h <= 180 ? angle : -angle;
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

/** End of a line of the given length that leaves (0, fromY) pointing aft, swung by `angle`. */
function swing(fromY: number, length: number, angle: number): string {
  const rad = (angle * Math.PI) / 180;
  return `x1="0" y1="${fromY}" x2="${round(length * Math.sin(rad))}" y2="${round(fromY + length * Math.cos(rad))}"`;
}

export function boatGlyph(pose: Pose): string {
  const luffing = pose.boom === undefined && trueWindAngle(pose.heading) < 30;
  const boom = pose.boom ?? autoBoom(pose.heading);
  const jib = pose.jib === undefined ? "" : `<line class="dia-boom" ${swing(BOW_Y, 11, pose.jib)} />`;
  const [dx, dy] = pose.stepAt ?? [16, 5];
  const step =
    pose.step === undefined
      ? ""
      : `<text class="dia-step" x="${pose.x + dx}" y="${pose.y + dy}">${pose.step}</text>`;
  return `
    <g transform="translate(${pose.x},${pose.y}) rotate(${pose.heading})">
      <path class="dia-hull" d="${HULL}" />
      <line class="dia-boom${luffing ? " dia-dash" : ""}" ${swing(MAST_Y, 13, boom)} />
      ${jib}
    </g>
    ${step}
  `;
}

export function arrowHead(x: number, y: number, heading: number, className: string): string {
  return `<polygon class="${className}" points="0,-5 4,4 -4,4" transform="translate(${x},${y}) rotate(${heading})" />`;
}

/** The wind arrow, blowing down the page from (x, y). */
export function windArrow(x: number, y: number, labelSide: "left" | "right" = "right"): string {
  const label =
    labelSide === "right"
      ? `<text class="dia-text" x="${x + 8}" y="${y + 14}">Wind</text>`
      : `<text class="dia-text" x="${x - 8}" y="${y + 14}" text-anchor="end">Wind</text>`;
  return `
    <line class="dia-wind" x1="${x}" y1="${y}" x2="${x}" y2="${y + 24}" />
    ${arrowHead(x, y + 26, 180, "dia-wind-head")}
    ${label}
  `;
}
