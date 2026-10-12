import { arrowHead, boatGlyph, windArrow, type Pose } from "./boatGlyph";

export interface DiagramDef {
  label: string;
  viewBox: string;
  art: string;
}

export interface FigureDef {
  viewBox: string;
  art: string;
  /** One caption per numbered boat in the drawing. */
  steps: string[];
}

// ------------------------------------------------------------- ship, side view

const SIDE_VIEW = `
  <path class="dia-water" d="M8,300 H352" />
  <path class="dia-hull" d="M156,306 L204,306 L196,362 L166,362 Z" />
  <path class="dia-hull" d="M72,304 L90,306 L86,346 L74,346 Z" />
  <path class="dia-hull" d="M46,266 L314,262 Q304,290 272,306 L86,306 Q54,302 46,266 Z" />
  <path class="dia-hull" d="M124,265 L138,250 L226,250 L242,263 Z" />

  <path class="dia-sail" d="M187,38 L187,229 L86,233 Z" />
  <path class="dia-line" d="M165,80 L181,82 M142,125 L166,128 M121,165 L150,168" />
  <path class="dia-line dia-dash" d="M187,198 L104,200" />
  <path class="dia-sail" d="M200,50 L306,252 L206,242 Z" />

  <path class="dia-line" d="M190,30 L312,262" />
  <path class="dia-line" d="M190,28 L50,264" />
  <path class="dia-line" d="M190,60 L199,262 M190,135 L181,262" />
  <path class="dia-line" d="M183,135 H197" />
  <path class="dia-line" d="M112,235 L110,262" />
  <path class="dia-line" d="M160,233 L189,250" />
  <path class="dia-line" d="M206,242 L130,258" />

  <path class="dia-spar" d="M190,250 V28" />
  <path class="dia-spar" d="M190,232 L82,236" />

  <path class="dia-line" d="M48,266 V248 H70 V265" />
  <path class="dia-line" d="M292,263 V247 L314,249 L313,262" />
  <path class="dia-line" d="M70,249 L292,248 M105,249 V265 M262,248 V263" />
  <circle class="dia-line" cx="98" cy="254" r="7" />
  <path class="dia-line" d="M98,261 V265" />
`;

// ------------------------------------------------------------- ship, deck plan

const DECK_PLAN = `
  <path class="dia-hull" d="M32,68 Q28,100 32,132 L190,142 Q285,132 338,100 Q285,68 190,58 Z" />
  <rect class="dia-line" x="128" y="78" width="120" height="44" rx="10" />
  <rect class="dia-line" x="42" y="80" width="78" height="40" rx="6" />
  <rect class="dia-line" x="126" y="92" width="14" height="16" />
  <rect class="dia-line" x="260" y="90" width="20" height="20" rx="2" />
  <path class="dia-line" d="M306,92 L326,100 L306,108 Z" />
  <path class="dia-spar" d="M60,90 V110" />
  <path class="dia-line" d="M106,83 V117" />
  <circle class="dia-spar" cx="196" cy="100" r="3" />
  <circle class="dia-line" cx="116" cy="72" r="4.5" />
  <circle class="dia-line" cx="116" cy="128" r="4.5" />
  <path class="dia-spar" d="M40,74 H50 M40,126 H50 M295,84 H305 M295,116 H305" />
  ${windArrow(180, 4)}
`;

// --------------------------------------------------------------- points of sail

const POINTS_CENTER: [number, number] = [150, 135];
const POINTS_RADIUS = 85;

function pointsOfSail(): string {
  const boats = [0, 45, 90, 135, 180, 225, 270, 315]
    .map((heading) => {
      const rad = (heading * Math.PI) / 180;
      return boatGlyph({
        x: Math.round(POINTS_CENTER[0] + POINTS_RADIUS * Math.sin(rad)),
        y: Math.round(POINTS_CENTER[1] - POINTS_RADIUS * Math.cos(rad)),
        heading
      });
    })
    .join("");
  return `
    <path class="dia-nogo" d="M150,135 L76,47 A115,115 0 0 1 224,47 Z" />
    <circle class="dia-line dia-dash" cx="150" cy="135" r="${POINTS_RADIUS}" />
    ${boats}
    ${windArrow(150, 2)}
  `;
}

export const DIAGRAMS: Record<string, DiagramDef> = {
  side: { label: "Side view", viewBox: "0 0 360 372", art: SIDE_VIEW },
  deck: { label: "Deck plan", viewBox: "0 0 360 200", art: DECK_PLAN },
  points: { label: "Points of sail", viewBox: "0 0 300 245", art: pointsOfSail() }
};

// ------------------------------------------------------------ maneuver figures

const FIGURE_VIEWBOX = "0 0 240 200";

function figure(track: string, poses: Pose[], steps: string[], extra = ""): FigureDef {
  return {
    viewBox: FIGURE_VIEWBOX,
    art: `
      ${windArrow(218, 6, "left")}
      <path class="dia-track" d="${track}" />
      ${extra}
      ${poses.map(boatGlyph).join("")}
    `,
    steps
  };
}

export const FIGURES: Record<string, FigureDef> = {
  tack: figure(
    "M60,185 L128,117 Q146,99 128,81 L72,25",
    [
      { x: 85, y: 160, heading: 45, step: 1 },
      { x: 137, y: 99, heading: 0, step: 2 },
      { x: 95, y: 48, heading: 315, step: 3 }
    ],
    [
      "Close-hauled; crew ready at the sheets.",
      "The bow passes through the wind and the jib changes sides.",
      "Close-hauled on the new tack."
    ],
    arrowHead(72, 25, 315, "dia-track-head")
  ),
  gybe: figure(
    "M60,15 L128,83 Q146,101 128,119 L72,175",
    [
      { x: 85, y: 40, heading: 135, step: 1 },
      { x: 137, y: 101, heading: 180, boom: 0, step: 2 },
      { x: 95, y: 152, heading: 225, step: 3 }
    ],
    [
      "Broad reach; bear away and sheet the main in hard.",
      "The stern passes through the wind and the boom comes across.",
      "Ease the main on the new side."
    ],
    arrowHead(72, 175, 225, "dia-track-head")
  ),
  "q-turn": figure(
    "M40,30 L130,120 Q165,150 180,110 Q190,70 150,62 Q125,60 105,95 L50,150",
    [
      { x: 80, y: 70, heading: 135, step: 1 },
      { x: 160, y: 132, heading: 80, step: 2, stepAt: [4, 26] },
      { x: 177, y: 78, heading: 328, step: 3 },
      { x: 72, y: 128, heading: 225, step: 4, stepAt: [-22, 2] }
    ],
    [
      "Broad reach.",
      "Luff up and sheet in until close-hauled.",
      "Tack through the wind.",
      "Bear away onto the new broad reach and ease the sheets."
    ],
    arrowHead(50, 150, 225, "dia-track-head")
  ),
  "heave-to": figure(
    "M50,180 L118,112 Q136,94 126,80",
    [
      { x: 75, y: 155, heading: 45, jib: 16, step: 1 },
      { x: 124, y: 70, heading: 320, boom: -40, jib: 28, step: 2 }
    ],
    [
      "Close-hauled; tack without releasing the jib sheet.",
      "Jib backed to windward, main eased, helm held to leeward: the boat lies quietly."
    ]
  ),
  "round-up": figure(
    "M30,150 L120,150 Q160,150 160,110 L160,78",
    [
      { x: 70, y: 150, heading: 90, step: 1, stepAt: [-4, -18] },
      { x: 160, y: 78, heading: 0, step: 2 }
    ],
    [
      "Approach on a beam reach, downwind of the target.",
      "Turn head to wind and free the sheets: the boat coasts to a stop at the buoy."
    ],
    `<circle class="dia-buoy" cx="160" cy="52" r="4" />`
  )
};
