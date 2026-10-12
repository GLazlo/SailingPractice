import type { GlossaryPage } from "./glossary";

// Reference boat: a modern cruising sloop. English names are British; the
// American name is given as an alternative where it differs.
export const SHIP_PAGE: GlossaryPage = {
  id: "ship",
  intro: "Parts of a cruising sloop. Tap a number on the drawing or a name in the list.",
  groups: ["Hull", "Deck", "Rig", "Lines", "Sails", "Directions"],
  diagrams: ["side", "deck"],
  entries: [
    // ---------------------------------------------------------------- hull
    {
      id: "hull",
      de: "Rumpf",
      en: "Hull",
      use: "The body of the boat that keeps the water out and carries everything else.",
      group: "Hull",
      mark: { diagram: "side", x: 250, y: 284 }
    },
    {
      id: "keel",
      de: "Kiel",
      en: "Keel",
      use: "Weighted fin under the hull. Its ballast keeps the boat upright and its area stops her sliding sideways.",
      group: "Hull",
      mark: { diagram: "side", x: 180, y: 336 }
    },
    {
      id: "rudder",
      de: "Ruder (Ruderblatt)",
      en: "Rudder",
      use: "Blade under the stern that steers the boat; turned by the wheel or tiller.",
      group: "Hull",
      mark: { diagram: "side", x: 80, y: 328 }
    },
    {
      id: "transom",
      de: "Spiegel",
      en: "Transom",
      use: "The flat surface closing off the stern; often carries the bathing ladder.",
      group: "Hull",
      mark: { diagram: "side", x: 30, y: 284, to: [48, 284] }
    },
    {
      id: "waterline",
      de: "Wasserlinie",
      en: "Waterline",
      use: "Where the surface of the water meets the hull.",
      group: "Hull",
      mark: { diagram: "side", x: 338, y: 300 }
    },
    {
      id: "bilge",
      de: "Bilge",
      en: "Bilge",
      use: "The lowest space inside the hull, where water collects. Check it when something seems wrong.",
      group: "Hull"
    },
    {
      id: "bow",
      de: "Bug",
      en: "Bow",
      use: "The front end of the boat.",
      group: "Hull",
      mark: { diagram: "deck", x: 348, y: 100 }
    },
    {
      id: "stern",
      de: "Heck",
      en: "Stern",
      use: "The back end of the boat.",
      group: "Hull",
      mark: { diagram: "deck", x: 16, y: 100 }
    },

    // ---------------------------------------------------------------- deck
    {
      id: "coachroof",
      de: "Kajütaufbau",
      en: "Coachroof",
      enAlt: "cabin top (US)",
      use: "The raised part of the deck over the cabin that gives headroom below.",
      group: "Deck",
      mark: { diagram: "side", x: 228, y: 240 }
    },
    {
      id: "wheel",
      de: "Steuerrad",
      en: "Wheel",
      enAlt: "helm",
      use: "Turns the rudder. Turn it the way you want the bow to go.",
      group: "Deck",
      mark: { diagram: "side", x: 86, y: 234, to: [96, 249] }
    },
    {
      id: "tiller",
      de: "Pinne",
      en: "Tiller",
      use: "A lever on the rudder instead of a wheel. Push it away from the side you want to turn to.",
      group: "Deck"
    },
    {
      id: "pushpit",
      de: "Heckkorb",
      en: "Pushpit",
      enAlt: "stern rail (US)",
      use: "Steel railing around the stern; lifebuoy and stern light are usually mounted here.",
      group: "Deck",
      mark: { diagram: "side", x: 58, y: 236 }
    },
    {
      id: "pulpit",
      de: "Bugkorb",
      en: "Pulpit",
      use: "Steel railing around the bow, for a secure hold when working forward.",
      group: "Deck",
      mark: { diagram: "side", x: 304, y: 236 }
    },
    {
      id: "guardrail",
      de: "Seereling",
      en: "Guardrail",
      enAlt: "lifelines (US)",
      use: "Wires along both sides of the deck that stop crew going overboard.",
      note: "Not strong enough to take a fender load for long or to be pulled on when boarding.",
      group: "Deck",
      mark: { diagram: "side", x: 274, y: 238 }
    },
    {
      id: "stanchion",
      de: "Relingsstütze",
      en: "Stanchion",
      use: "The upright posts that carry the guardrail wires.",
      group: "Deck"
    },
    {
      id: "cockpit",
      de: "Plicht (Cockpit)",
      en: "Cockpit",
      use: "The sunken area aft where the boat is steered and the sheets are worked.",
      group: "Deck",
      mark: { diagram: "deck", x: 82, y: 100 }
    },
    {
      id: "companionway",
      de: "Niedergang",
      en: "Companionway",
      use: "The entrance and steps from the cockpit down into the cabin.",
      group: "Deck",
      mark: { diagram: "deck", x: 156, y: 100, to: [140, 100] }
    },
    {
      id: "forehatch",
      de: "Vorluk",
      en: "Forehatch",
      use: "The hatch on the foredeck. Close it before leaving harbour.",
      group: "Deck",
      mark: { diagram: "deck", x: 262, y: 150, to: [270, 110] }
    },
    {
      id: "anchor-locker",
      de: "Ankerkasten",
      en: "Anchor locker",
      use: "The compartment in the bow that holds the anchor chain.",
      group: "Deck",
      mark: { diagram: "deck", x: 326, y: 72, to: [314, 96] }
    },
    {
      id: "winch",
      de: "Winsch",
      en: "Winch",
      use: "A drum that gives the power to haul in sheets and halyards. Always load it clockwise.",
      group: "Deck",
      mark: { diagram: "deck", x: 140, y: 48, to: [119, 69] }
    },
    {
      id: "cleat",
      de: "Klampe",
      en: "Cleat",
      use: "A two-horned fitting for making a line fast, above all mooring lines.",
      group: "Deck",
      mark: { diagram: "deck", x: 288, y: 62, to: [299, 81] }
    },
    {
      id: "traveller",
      de: "Traveller",
      en: "Traveller",
      enAlt: "traveler (US)",
      use: "A track with a sliding car for the mainsheet; moves the boom sideways without changing sail twist.",
      group: "Deck",
      mark: { diagram: "deck", x: 106, y: 100 }
    },
    {
      id: "clutch",
      de: "Fallenstopper",
      en: "Clutch",
      enAlt: "rope clutch",
      use: "A lever jammer that holds a line under load so its winch is free for another line.",
      group: "Deck"
    },
    {
      id: "block",
      de: "Block",
      en: "Block",
      use: "A pulley that changes the direction of a line or multiplies the pull.",
      group: "Deck"
    },
    {
      id: "shackle",
      de: "Schäkel",
      en: "Shackle",
      use: "A U-shaped metal link closed with a pin, for joining fittings, sails and chain.",
      group: "Deck"
    },
    {
      id: "fender",
      de: "Fender",
      en: "Fender",
      use: "An air-filled cushion hung over the side to protect the hull against a pontoon or another boat.",
      group: "Deck"
    },
    {
      id: "jackstay",
      de: "Strecktau",
      en: "Jackstay",
      enAlt: "jackline (US)",
      use: "A line or webbing run along the deck to clip a safety harness to.",
      group: "Deck"
    },

    // ----------------------------------------------------------------- rig
    {
      id: "mast",
      de: "Mast",
      en: "Mast",
      use: "The vertical spar that carries the sails.",
      group: "Rig",
      mark: { diagram: "side", x: 190, y: 172 }
    },
    {
      id: "masthead",
      de: "Masttopp",
      en: "Masthead",
      use: "The top of the mast, with the wind indicator, VHF aerial and lights.",
      group: "Rig",
      mark: { diagram: "side", x: 190, y: 14 }
    },
    {
      id: "boom",
      de: "Baum (Großbaum)",
      en: "Boom",
      use: "The horizontal spar along the foot of the mainsail.",
      note: "It sweeps across the cockpit in every tack and gybe: keep heads down.",
      group: "Rig",
      mark: { diagram: "side", x: 140, y: 247 }
    },
    {
      id: "gooseneck",
      de: "Lümmelbeschlag",
      en: "Gooseneck",
      use: "The swivelling joint that fixes the boom to the mast.",
      group: "Rig",
      mark: { diagram: "side", x: 214, y: 224, to: [192, 232] }
    },
    {
      id: "spreader",
      de: "Saling",
      en: "Spreader",
      use: "A strut on the mast that pushes the shrouds outward to support the mast better.",
      group: "Rig",
      mark: { diagram: "side", x: 208, y: 126, to: [197, 135] }
    },
    {
      id: "forestay",
      de: "Vorstag",
      en: "Forestay",
      use: "The wire from the mast to the bow; holds the mast forward and carries the headsail.",
      group: "Rig",
      mark: { diagram: "side", x: 266, y: 146 }
    },
    {
      id: "backstay",
      de: "Achterstag",
      en: "Backstay",
      use: "The wire from the masthead to the stern; holds the mast aft.",
      group: "Rig",
      mark: { diagram: "side", x: 104, y: 146 }
    },
    {
      id: "shroud",
      de: "Want (Wanten)",
      en: "Shroud",
      use: "The wires from the mast to the sides of the deck; hold the mast up sideways.",
      group: "Rig",
      mark: { diagram: "side", x: 172, y: 192, to: [185, 196] }
    },
    {
      id: "bottlescrew",
      de: "Wantenspanner",
      en: "Bottlescrew",
      enAlt: "turnbuckle (US)",
      use: "The threaded fitting at the foot of a shroud or stay that sets its tension.",
      group: "Rig"
    },

    // --------------------------------------------------------------- lines
    {
      id: "halyard",
      de: "Fall",
      en: "Halyard",
      use: "The line that hoists a sail and holds it up.",
      group: "Lines"
    },
    {
      id: "mainsheet",
      de: "Großschot",
      en: "Mainsheet",
      use: "The line that controls how far out the boom and mainsail are.",
      group: "Lines",
      mark: { diagram: "side", x: 124, y: 252 }
    },
    {
      id: "jibsheet",
      de: "Fockschot",
      en: "Jib sheet",
      use: "The lines from the clew of the headsail to the cockpit, one on each side. Only the leeward one is under load.",
      group: "Lines",
      mark: { diagram: "side", x: 158, y: 262 }
    },
    {
      id: "kicker",
      de: "Baumniederholer",
      en: "Kicking strap",
      enAlt: "boom vang (US)",
      use: "The tackle between boom and mast foot that stops the boom lifting, above all downwind.",
      group: "Lines",
      mark: { diagram: "side", x: 172, y: 244 }
    },
    {
      id: "topping-lift",
      de: "Dirk",
      en: "Topping lift",
      use: "The line from the masthead to the end of the boom; holds the boom up when the sail is lowered or reefed.",
      group: "Lines"
    },
    {
      id: "reefing-line",
      de: "Reffleine",
      en: "Reefing line",
      use: "Pulls the sail down to the boom to make it smaller.",
      group: "Lines"
    },
    {
      id: "outhaul",
      de: "Unterliekstrecker",
      en: "Outhaul",
      use: "Pulls the clew of the mainsail along the boom; tight makes the sail flat.",
      group: "Lines"
    },
    {
      id: "mooring-line",
      de: "Festmacher",
      en: "Mooring line",
      enAlt: "dock line (US)",
      use: "Any line that ties the boat to the shore.",
      group: "Lines"
    },
    {
      id: "bow-line",
      de: "Vorleine",
      en: "Bow line",
      use: "The mooring line from the bow to the shore.",
      group: "Lines"
    },
    {
      id: "stern-line",
      de: "Achterleine",
      en: "Stern line",
      use: "The mooring line from the stern to the shore.",
      group: "Lines"
    },
    {
      id: "spring",
      de: "Spring",
      en: "Spring",
      use: "A mooring line led diagonally along the boat; stops her moving forward or back and is used to turn her when leaving.",
      group: "Lines"
    },

    // --------------------------------------------------------------- sails
    {
      id: "mainsail",
      de: "Großsegel",
      en: "Mainsail",
      use: "The sail set behind the mast, on the boom.",
      group: "Sails",
      mark: { diagram: "side", x: 164, y: 150 }
    },
    {
      id: "jib",
      de: "Fock",
      en: "Jib",
      use: "The headsail set on the forestay, not reaching past the mast.",
      group: "Sails",
      mark: { diagram: "side", x: 242, y: 196 }
    },
    {
      id: "genoa",
      de: "Genua",
      en: "Genoa",
      use: "A large headsail that overlaps the mast; more power in light wind.",
      group: "Sails"
    },
    {
      id: "spinnaker",
      de: "Spinnaker",
      en: "Spinnaker",
      use: "A large, light, balloon-shaped sail for sailing downwind.",
      group: "Sails"
    },
    {
      id: "luff",
      de: "Vorliek",
      en: "Luff",
      use: "The front edge of a sail.",
      group: "Sails",
      mark: { diagram: "side", x: 181, y: 100 }
    },
    {
      id: "leech",
      de: "Achterliek",
      en: "Leech",
      use: "The back edge of a sail.",
      group: "Sails",
      mark: { diagram: "side", x: 124, y: 134 }
    },
    {
      id: "foot",
      de: "Unterliek",
      en: "Foot",
      use: "The bottom edge of a sail.",
      group: "Sails",
      mark: { diagram: "side", x: 150, y: 223 }
    },
    {
      id: "head",
      de: "Kopf",
      en: "Head",
      use: "The top corner of a sail, where the halyard is attached.",
      group: "Sails",
      mark: { diagram: "side", x: 160, y: 42, to: [184, 45] }
    },
    {
      id: "tack-corner",
      de: "Hals",
      en: "Tack",
      use: "The lower front corner of a sail.",
      note: "English uses the same word for the corner, the maneuver and the side the wind is on.",
      group: "Sails",
      mark: { diagram: "side", x: 177, y: 219 }
    },
    {
      id: "clew",
      de: "Schothorn",
      en: "Clew",
      use: "The lower back corner of a sail, where the sheet pulls.",
      group: "Sails",
      mark: { diagram: "side", x: 97, y: 221 }
    },
    {
      id: "batten",
      de: "Segellatte",
      en: "Batten",
      use: "A stiff strip in a pocket of the sail that supports the leech.",
      group: "Sails",
      mark: { diagram: "side", x: 153, y: 114 }
    },
    {
      id: "reef",
      de: "Reff",
      en: "Reef",
      use: "A row of eyes across the sail; lowering the sail to it makes the sail smaller in strong wind.",
      group: "Sails",
      mark: { diagram: "side", x: 140, y: 199 }
    },
    {
      id: "telltales",
      de: "Windfäden",
      en: "Telltales",
      use: "Short threads on the sail that show the airflow; both streaming aft means the sail is trimmed right.",
      group: "Sails"
    },

    // ---------------------------------------------------------- directions
    {
      id: "port",
      de: "Backbord",
      en: "Port",
      use: "The left side of the boat when facing the bow. Red light.",
      group: "Directions",
      mark: { diagram: "deck", x: 90, y: 44, to: [90, 63] }
    },
    {
      id: "starboard",
      de: "Steuerbord",
      en: "Starboard",
      use: "The right side of the boat when facing the bow. Green light.",
      group: "Directions",
      mark: { diagram: "deck", x: 110, y: 158, to: [110, 138] }
    },
    {
      id: "windward",
      de: "Luv",
      en: "Windward",
      use: "The side the wind is coming from.",
      group: "Directions",
      mark: { diagram: "deck", x: 228, y: 24 }
    },
    {
      id: "leeward",
      de: "Lee",
      en: "Leeward",
      use: "The side away from the wind; the sails are on this side.",
      note: "Pronounced “loo-ard” in English.",
      group: "Directions",
      mark: { diagram: "deck", x: 228, y: 178 }
    },
    {
      id: "ahead",
      de: "voraus",
      en: "Ahead",
      use: "In front of the boat.",
      group: "Directions"
    },
    {
      id: "astern",
      de: "achteraus",
      en: "Astern",
      use: "Behind the boat; also the direction when going backwards.",
      group: "Directions"
    },
    {
      id: "aft",
      de: "achtern",
      en: "Aft",
      use: "Towards or at the back of the boat.",
      group: "Directions"
    },
    {
      id: "abeam",
      de: "querab",
      en: "Abeam",
      use: "At right angles to the boat, level with the middle.",
      group: "Directions"
    },
    {
      id: "amidships",
      de: "mittschiffs",
      en: "Amidships",
      use: "In the middle of the boat; for the helm, rudder straight.",
      group: "Directions"
    }
  ]
};
