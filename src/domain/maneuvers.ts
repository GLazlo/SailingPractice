import type { GlossaryPage } from "./glossary";

// Commands vary between schools and boats; these are the common German forms
// with the usual British equivalents.
export const MANEUVERS_PAGE: GlossaryPage = {
  id: "maneuvers",
  intro:
    "Courses, maneuvers and the calls that go with them. Commands differ a little from boat to boat: agree on them before leaving.",
  groups: ["Points of sail", "Under sail", "Harbour and anchor", "Emergency", "Basic orders"],
  diagrams: ["points"],
  entries: [
    // ------------------------------------------------------ points of sail
    {
      id: "head-to-wind",
      de: "Im Wind",
      en: "Head to wind",
      enAlt: "in irons (when stuck there)",
      use: "Bow pointing straight into the wind. The sails flap and the boat stops; used for hoisting and lowering the mainsail.",
      group: "Points of sail",
      mark: { diagram: "points", x: 174, y: 50 }
    },
    {
      id: "close-hauled",
      de: "Am Wind",
      en: "Close-hauled",
      use: "As close to the wind as the boat will sail, about 45°. Sails sheeted in hard.",
      group: "Points of sail",
      mark: { diagram: "points", x: 234, y: 68 }
    },
    {
      id: "beam-reach",
      de: "Halber Wind",
      en: "Beam reach",
      use: "Wind from the side, at 90°. Sails about half out; usually the fastest and easiest course.",
      group: "Points of sail",
      mark: { diagram: "points", x: 260, y: 135 }
    },
    {
      id: "broad-reach",
      de: "Raumer Wind (raumschots)",
      en: "Broad reach",
      use: "Wind from behind the beam, around 135°. Sails well out.",
      group: "Points of sail",
      mark: { diagram: "points", x: 234, y: 204 }
    },
    {
      id: "running",
      de: "Vor dem Wind",
      en: "Running",
      enAlt: "dead downwind",
      use: "Wind from straight behind. Mainsail all the way out.",
      note: "Risk of an accidental gybe: steer carefully and consider a preventer on the boom.",
      group: "Points of sail",
      mark: { diagram: "points", x: 174, y: 226 }
    },
    {
      id: "port-tack",
      de: "Steuerbordbug",
      en: "Port tack",
      use: "Wind from the port side, boom out to starboard. Gives way to a boat on starboard tack.",
      note: "The names cross over: German names the side the boom is on, English the side the wind comes from.",
      group: "Points of sail",
      mark: { diagram: "points", x: 198, y: 135 }
    },
    {
      id: "starboard-tack",
      de: "Backbordbug",
      en: "Starboard tack",
      use: "Wind from the starboard side, boom out to port. Has right of way over a boat on port tack.",
      note: "The names cross over: German names the side the boom is on, English the side the wind comes from.",
      group: "Points of sail",
      mark: { diagram: "points", x: 102, y: 135 }
    },

    // ---------------------------------------------------------- under sail
    {
      id: "tack",
      de: "Wende",
      en: "Tack",
      enAlt: "going about",
      use: "Turning the bow through the wind to bring the wind onto the other side. The normal way to change tack when sailing upwind.",
      group: "Under sail",
      figure: "tack",
      commands: [
        {
          de: "Klar zur Wende?",
          en: "Ready about?",
          when: "Helm announces the tack; crew take the new sheet onto its winch and get ready to release the old one."
        },
        { de: "Ist klar!", en: "Ready!", when: "Crew answer once both sheets are manned." },
        { de: "Ree!", en: "Helm's a-lee!", when: "Helm, at the moment the wheel goes over. Also heard: “Lee-ho!”" },
        {
          de: "Über die Fock!",
          en: "Let go and haul!",
          when: "As the jib starts to back: release the old sheet and haul in the new one."
        }
      ]
    },
    {
      id: "gybe",
      de: "Halse",
      en: "Gybe",
      enAlt: "jibe (US)",
      use: "Turning the stern through the wind. Changes tack when sailing downwind.",
      note: "The boom comes across fast and hard. Sheet the main in first and keep heads down.",
      group: "Under sail",
      figure: "gybe",
      commands: [
        { de: "Klar zur Halse?", en: "Ready to gybe?", when: "Helm announces the gybe." },
        { de: "Ist klar!", en: "Ready!", when: "Crew answer once the mainsheet is manned." },
        {
          de: "Hol dicht die Großschot!",
          en: "Sheet in the main!",
          when: "Before the stern passes through the wind: bring the boom to the middle."
        },
        { de: "Rund achtern!", en: "Gybe-ho!", when: "Helm, as the stern goes through the wind and the boom crosses." },
        {
          de: "Fier auf die Großschot!",
          en: "Ease the main!",
          when: "Straight after the boom has crossed: let the sheet run out under control."
        }
      ]
    },
    {
      id: "q-turn",
      de: "Q-Wende",
      en: "Tacking round",
      enAlt: "chicken gybe",
      use: "Changing tack downwind by luffing up and tacking instead of gybing. The safe choice in strong wind or with a new crew.",
      group: "Under sail",
      figure: "q-turn",
      commands: [
        {
          de: "Klar zur Q-Wende?",
          en: "Ready to tack round?",
          when: "Helm announces it; the commands of a normal tack follow. English has no fixed call, so say what you intend."
        }
      ]
    },
    {
      id: "heave-to",
      de: "Beidrehen",
      en: "Heaving to",
      use: "Parking the boat under sail with the jib backed. For a break, reefing, waiting, or riding out a squall.",
      note: "The boat still drifts slowly forward and to leeward: check for sea room.",
      group: "Under sail",
      figure: "heave-to",
      commands: [
        { de: "Klar zum Beidrehen?", en: "Ready to heave to?", when: "Helm announces it." },
        {
          de: "Ree! Fockschot bleibt belegt.",
          en: "Helm's a-lee! Leave the jib sheet.",
          when: "Helm tacks; the crew do not touch the jib sheet, so the jib ends up backed."
        }
      ]
    },
    {
      id: "round-up",
      de: "Aufschießer",
      en: "Rounding up",
      enAlt: "shooting up into the wind",
      use: "Turning head to wind and letting the boat coast to a stop. For picking up a mooring buoy or stopping under sail.",
      group: "Under sail",
      figure: "round-up",
      commands: [
        { de: "Klar zum Aufschießer?", en: "Ready to round up?", when: "Helm announces it on the approach." },
        { de: "Schoten los!", en: "Let fly the sheets!", when: "As the bow comes into the wind: free all sheets so the sails flap." }
      ]
    },
    {
      id: "reefing",
      de: "Reffen",
      en: "Reefing",
      use: "Making the sails smaller when the wind rises. Reef early: if you are wondering whether to, do it.",
      group: "Under sail",
      commands: [
        { de: "Klar zum Reffen?", en: "Ready to reef?", when: "Helm announces it and brings the boat close to the wind." },
        { de: "Fier auf das Großfall!", en: "Ease the main halyard!", when: "Lower the sail to the reef mark." },
        { de: "Hol dicht die Reffleine!", en: "Haul in the reefing line!", when: "Pull the new clew down to the boom." },
        { de: "Hol durch das Großfall!", en: "Tension the halyard!", when: "Tighten the luff again, then sheet in." }
      ]
    },
    {
      id: "hoisting",
      de: "Segel setzen",
      en: "Hoisting sails",
      use: "Setting the sails, with the bow into the wind for the mainsail.",
      group: "Under sail",
      commands: [
        { de: "Klar zum Segelsetzen?", en: "Ready to hoist?", when: "Helm, once the boat is head to wind and the sail ties are off." },
        { de: "Heiß auf das Groß!", en: "Hoist the main!", when: "Pull the halyard until the luff is tight." },
        { de: "Belegen!", en: "Make fast!", when: "Secure the halyard in its clutch or on its cleat." }
      ]
    },
    {
      id: "dropping",
      de: "Segel bergen",
      en: "Dropping sails",
      enAlt: "lowering sails",
      use: "Taking the sails down, again with the bow into the wind for the mainsail.",
      group: "Under sail",
      commands: [
        { de: "Klar zum Segelbergen?", en: "Ready to drop the sails?", when: "Helm, once the boat is head to wind." },
        { de: "Fier auf das Großfall!", en: "Lower the main!", when: "Let the halyard run and gather the sail on the boom." }
      ]
    },

    // -------------------------------------------------- harbour and anchor
    {
      id: "casting-off",
      de: "Ablegen",
      en: "Casting off",
      enAlt: "leaving the berth",
      use: "Leaving a pontoon or quay. Decide beforehand which line comes off last, and rig it as a slip line.",
      group: "Harbour and anchor",
      commands: [
        { de: "Klar zum Ablegen?", en: "Ready to cast off?", when: "Skipper, once the engine runs and everyone knows their line." },
        { de: "Vorleine los!", en: "Let go the bow line!", when: "Release the bow line and bring it aboard." },
        { de: "Achterleine los!", en: "Let go the stern line!", when: "Release the stern line and bring it aboard." },
        { de: "Leinen sind klar!", en: "All lines clear!", when: "Crew report that no line is in the water near the propeller." }
      ]
    },
    {
      id: "coming-alongside",
      de: "Anlegen",
      en: "Coming alongside",
      enAlt: "docking (US)",
      use: "Bringing the boat to a pontoon or quay. Lines and fenders are prepared before the approach.",
      note: "Step ashore, never jump, and never fend off with hands or feet.",
      group: "Harbour and anchor",
      commands: [
        { de: "Klar zum Anlegen?", en: "Ready to come alongside?", when: "Skipper, after saying which side and which line goes first." },
        { de: "Fender raus!", en: "Fenders out!", when: "Hang the fenders on the side named, at pontoon height." },
        { de: "Vorleine über!", en: "Bow line ashore!", when: "Take or pass the bow line ashore." },
        { de: "Leinen fest!", en: "Make fast!", when: "Secure the lines on the cleats." }
      ]
    },
    {
      id: "anchoring",
      de: "Ankern",
      en: "Anchoring",
      use: "Holding the boat on the seabed. Let out at least five times the depth in chain, more in strong wind.",
      group: "Harbour and anchor",
      commands: [
        { de: "Klar zum Ankern?", en: "Ready to anchor?", when: "Skipper on the approach; the anchor is made ready to drop." },
        { de: "Fallen Anker!", en: "Let go!", when: "When the boat has stopped over the chosen spot." },
        { de: "Kette stecken!", en: "Veer more chain!", when: "Let out more chain as the boat drifts back." },
        { de: "Anker hält!", en: "Anchor is holding!", when: "Crew report once the chain has come tight and the boat stays put." },
        { de: "Anker auf!", en: "Weigh anchor!", when: "To leave: haul in the chain and bring the anchor up." }
      ]
    },

    // ----------------------------------------------------------- emergency
    {
      id: "mob",
      de: "Mensch über Bord (MOB)",
      en: "Man overboard (MOB)",
      use: "Someone has fallen into the water. Shout, throw flotation, keep pointing at the person, press the MOB button, then turn back.",
      note: "How to turn back depends on the boat, the crew and the conditions. Practise the method your boat uses before you need it.",
      group: "Emergency",
      commands: [
        { de: "Mensch über Bord!", en: "Man overboard!", when: "Whoever sees it, at once and loudly." },
        {
          de: "Du zeigst auf die Person!",
          en: "You: point at the casualty!",
          when: "Skipper names one person who does nothing but watch and point."
        },
        { de: "Rettungsring werfen!", en: "Throw the lifebuoy!", when: "Straight away, towards the person." }
      ]
    },

    // -------------------------------------------------------- basic orders
    {
      id: "luff-up",
      de: "Anluven",
      en: "Luff up",
      enAlt: "head up",
      use: "Steer closer to the wind.",
      group: "Basic orders"
    },
    {
      id: "bear-away",
      de: "Abfallen",
      en: "Bear away",
      enAlt: "fall off (US)",
      use: "Steer further away from the wind.",
      group: "Basic orders"
    },
    {
      id: "sheet-in",
      de: "Dichtholen",
      en: "Sheet in",
      use: "Pull a sheet in so the sail comes closer to the middle of the boat.",
      group: "Basic orders"
    },
    {
      id: "ease",
      de: "Fieren",
      en: "Ease",
      use: "Let a line out slowly and under control.",
      group: "Basic orders"
    },
    {
      id: "make-fast",
      de: "Belegen",
      en: "Make fast",
      use: "Secure a line on a cleat or in a clutch.",
      group: "Basic orders"
    },
    {
      id: "heads-up",
      de: "Wahrschau!",
      en: "Heads up!",
      enAlt: "watch out",
      use: "General warning shout: something is about to happen or to hit someone.",
      group: "Basic orders"
    }
  ]
};
