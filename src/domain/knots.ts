import type { GlossaryPage } from "./glossary";

export const KNOTS_PAGE: GlossaryPage = {
  id: "knots",
  intro: "The knots a crew needs on a cruising boat, and what each one is for.",
  groups: ["Stopper", "Loops and hitches", "Joining lines", "Line handling"],
  diagrams: [],
  entries: [
    {
      id: "figure-eight",
      de: "Achtknoten",
      en: "Figure-of-eight knot",
      use: "Stopper at the end of a sheet or halyard, so the end cannot run out through a block or clutch.",
      group: "Stopper"
    },
    {
      id: "bowline",
      de: "Palstek",
      en: "Bowline",
      use: "A fixed loop that does not tighten: mooring line over a post or through a ring, sheets onto the clew.",
      note: "Cannot be untied while under load.",
      group: "Loops and hitches"
    },
    {
      id: "clove-hitch",
      de: "Webeleinstek",
      en: "Clove hitch",
      use: "Quick hitch around a rail or post, above all for hanging fenders on the guardrail.",
      note: "Works loose when the pull changes direction; finish with a half hitch if it has to stay.",
      group: "Loops and hitches"
    },
    {
      id: "round-turn",
      de: "Rundtörn mit zwei halben Schlägen",
      en: "Round turn and two half hitches",
      use: "Mooring to a ring or post. Holds securely and can be released even under load.",
      group: "Loops and hitches"
    },
    {
      id: "rolling-hitch",
      de: "Stopperstek",
      en: "Rolling hitch",
      use: "Ties a line to another taut line or a spar so that it grips along its length, for example to take the load off a jammed sheet.",
      group: "Loops and hitches"
    },
    {
      id: "cleat-hitch",
      de: "Belegen einer Klampe",
      en: "Cleat hitch",
      use: "Making a line fast on a cleat: a round turn, figure-of-eight turns, and a locking turn to finish.",
      group: "Loops and hitches"
    },
    {
      id: "half-hitch",
      de: "Halber Schlag",
      en: "Half hitch",
      use: "A single turn around the standing part. Rarely used alone; secures other knots.",
      group: "Loops and hitches"
    },
    {
      id: "reef-knot",
      de: "Kreuzknoten",
      en: "Reef knot",
      enAlt: "square knot (US)",
      use: "Ties two ends of the same thickness together, as when tying in reef points or sail ties.",
      note: "Not for joining two lines under load: it can capsize and slip.",
      group: "Joining lines"
    },
    {
      id: "sheet-bend",
      de: "Einfacher Schotstek",
      en: "Sheet bend",
      use: "Joins two lines, also of different thickness.",
      group: "Joining lines"
    },
    {
      id: "double-sheet-bend",
      de: "Doppelter Schotstek",
      en: "Double sheet bend",
      use: "As the sheet bend, with an extra turn: for lines of very different thickness or slippery rope.",
      group: "Joining lines"
    },
    {
      id: "coiling",
      de: "Aufschießen einer Leine",
      en: "Coiling a line",
      use: "Gathering a line into even loops so it stows tidily and runs out without tangles.",
      group: "Line handling"
    }
  ]
};
