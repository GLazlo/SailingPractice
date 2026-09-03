import {
  callSignPhrase,
  countPhrase,
  digitsPhrase,
  positionPhrase,
  positionText,
  shipNamePhrase,
  type CallContext,
  type ShipIdentity
} from "./shipIdentity";
import { concat, phrase, phraseWords, term, type Phrase } from "./phrase";

export type CallType = "securite" | "panpan" | "mayday";

export interface CallTypeInfo {
  id: CallType;
  label: string;
  description: string;
}

export const CALL_TYPES: CallTypeInfo[] = [
  { id: "securite", label: "Sécurité (safety)", description: "Navigational or meteorological warning." },
  { id: "panpan", label: "Pan-pan (urgency)", description: "Urgent message about the safety of a vessel or person." },
  { id: "mayday", label: "Mayday (distress)", description: "Grave and imminent danger, immediate assistance required." }
];

// "Sécurité" is not in the offline model's dictionary, so the slot accepts the
// nearest in-dictionary renderings instead. Same trick as the two-word "x ray".
const SECURITE_FORMS = ["security", "securitas", "securitate", "say cure e tay"];

const MMSI_LABEL_FORMS = ["em em es eye", "maritime mobile service identity"];

export interface NatureOption {
  id: string;
  label: string;
  text: string;
}

export const NATURE_LABELS: Record<CallType, string> = {
  securite: "Subject of the warning",
  panpan: "Nature of urgency",
  mayday: "Nature of distress"
};

export const NATURE_OPTIONS: Record<CallType, NatureOption[]> = {
  mayday: [
    { id: "sinking", label: "Sinking", text: "I am sinking" },
    { id: "fire", label: "On fire", text: "I am on fire" },
    { id: "flooding", label: "Flooding", text: "I am flooding" },
    { id: "aground", label: "Run aground", text: "I have run aground" },
    { id: "capsized", label: "Capsized", text: "I have capsized" },
    { id: "collision", label: "Collision", text: "I have been in collision" },
    { id: "overboard", label: "Man overboard", text: "I have a man overboard" },
    { id: "abandoning", label: "Abandoning vessel", text: "I am abandoning vessel" }
  ],
  panpan: [
    { id: "engine", label: "Engine failure", text: "I have engine failure" },
    { id: "steering", label: "Steering failure", text: "I have steering failure" },
    { id: "mast", label: "Lost my mast", text: "I have lost my mast" },
    { id: "injured", label: "Injured persons", text: "I have injured persons on board" },
    { id: "adrift", label: "Adrift", text: "I am adrift" },
    { id: "water", label: "Taking water slowly", text: "I am taking water slowly" }
  ],
  securite: [
    { id: "container", label: "Floating container", text: "I have sighted a floating container" },
    { id: "buoy", label: "Unlit buoy", text: "I have sighted an unlit buoy" },
    { id: "whale", label: "Whale sighting", text: "I have sighted a whale" },
    { id: "diving", label: "Diving operations", text: "I am carrying out diving operations" },
    { id: "towing", label: "Long tow", text: "I am towing a long tow" },
    { id: "survey", label: "Survey operations", text: "I am carrying out survey operations" }
  ]
};

export function natureOption(type: CallType, natureId: string): NatureOption | undefined {
  return NATURE_OPTIONS[type].find((option) => option.id === natureId);
}

export interface CallSlot {
  id: string;
  label: string;
  /** Text shown in the message panel. */
  text: string;
  phrase: Phrase;
  /** How many times the phrase must be spoken (e.g. MAYDAY MAYDAY MAYDAY). */
  repeat: number;
  /** Optional slots are recognized but do not count towards the score. */
  optional: boolean;
  /** Ends the transmission; only accepted once every earlier slot is behind us. */
  terminator: boolean;
  /** Start a new line in the message panel. */
  startsLine: boolean;
  /** Caption of a divider drawn above this slot. */
  dividerBefore?: string;
}

export interface RenderedCall {
  type: CallType;
  slots: CallSlot[];
}

interface SlotInit {
  id: string;
  label: string;
  text: string;
  phrase: Phrase;
  repeat?: number;
  optional?: boolean;
  terminator?: boolean;
  startsLine?: boolean;
  dividerBefore?: string;
}

function slot(init: SlotInit): CallSlot {
  return {
    repeat: 1,
    optional: false,
    terminator: false,
    startsLine: false,
    ...init
  };
}

function repeated(text: string, times: number): string {
  return Array.from({ length: times }, () => text).join(" ");
}

/** THIS IS <name x3>, CALL SIGN ..., MMSI ... — common to all three calls. */
function identityBlock(identity: ShipIdentity): CallSlot[] {
  const name = identity.shipName.trim().toUpperCase();
  const rawCallSign = identity.callSign.trim().toUpperCase();
  // Spell it out letter by letter, unless it is a placeholder standing in for a
  // field the user has not filled in yet.
  const callSignText = /^[A-Z0-9]+$/.test(rawCallSign)
    ? rawCallSign.split("").join(" ")
    : rawCallSign;
  return [
    slot({ id: "this-is", label: "\"This is\"", text: "THIS IS", phrase: phrase("this is"), startsLine: true }),
    slot({
      id: "name",
      label: "Vessel name, three times",
      text: repeated(name, 3),
      phrase: shipNamePhrase(identity.shipName),
      repeat: 3
    }),
    slot({
      id: "callsign",
      label: "Call sign",
      text: `CALL SIGN ${callSignText}`,
      phrase: concat(phrase("call sign"), callSignPhrase(identity.callSign)),
      startsLine: true
    }),
    slot({
      id: "mmsi-label",
      label: "\"MMSI\"",
      text: "MMSI",
      phrase: [term(...MMSI_LABEL_FORMS)],
      optional: true,
      startsLine: true
    }),
    slot({
      id: "mmsi",
      label: "MMSI digits",
      text: identity.mmsi.trim(),
      phrase: digitsPhrase(identity.mmsi)
    })
  ];
}

function positionSlot(context: CallContext, lead: string): CallSlot {
  return slot({
    id: "position",
    label: "Position",
    text: `${lead.toUpperCase()} ${positionText(context.latitude, context.longitude)}`,
    phrase: concat(
      phrase(lead),
      positionPhrase(context.latitude, context.longitude)
    ),
    startsLine: true
  });
}

function natureSlot(type: CallType, context: CallContext): CallSlot {
  const option = natureOption(type, context.natureId);
  const text = option?.text ?? "";
  return slot({
    id: "nature",
    label: NATURE_LABELS[type],
    // Nothing chosen yet: show the gap in the message rather than a blank line.
    text: (text || `[${NATURE_LABELS[type]}]`).toUpperCase(),
    phrase: phrase(text),
    startsLine: true
  });
}

function personsSlot(context: CallContext): CallSlot {
  return slot({
    id: "persons",
    label: "Persons on board",
    text: `${context.personsOnBoard.trim()} PERSONS ON BOARD`,
    phrase: concat(countPhrase(context.personsOnBoard), phrase("persons on board")),
    startsLine: true
  });
}

function buildMayday(identity: ShipIdentity, context: CallContext): CallSlot[] {
  return [
    slot({
      id: "distress-signal",
      label: "Distress signal, three times",
      text: repeated("MAYDAY", 3),
      phrase: phrase("mayday"),
      repeat: 3,
      startsLine: true
    }),
    ...identityBlock(identity),
    slot({
      id: "mayday-name",
      label: "\"Mayday\" plus vessel name",
      text: `MAYDAY ${identity.shipName.trim().toUpperCase()}`,
      phrase: concat(phrase("mayday"), shipNamePhrase(identity.shipName)),
      startsLine: true
    }),
    positionSlot(context, "my position is"),
    natureSlot("mayday", context),
    slot({
      id: "assistance",
      label: "Assistance required",
      text: "I REQUIRE IMMEDIATE ASSISTANCE",
      phrase: phrase("i require immediate assistance"),
      startsLine: true
    }),
    personsSlot(context),
    slot({
      id: "over",
      label: "\"Over\"",
      text: "OVER",
      phrase: phrase("over"),
      terminator: true,
      startsLine: true
    })
  ];
}

function buildPanPan(identity: ShipIdentity, context: CallContext): CallSlot[] {
  return [
    slot({
      id: "urgency-signal",
      label: "Urgency signal, three times",
      text: repeated("PAN PAN", 3),
      phrase: phrase("pan pan"),
      repeat: 3,
      startsLine: true
    }),
    slot({
      id: "all-stations",
      label: "\"All stations\", three times",
      text: repeated("ALL STATIONS", 3),
      phrase: phrase("all stations"),
      repeat: 3,
      startsLine: true
    }),
    ...identityBlock(identity),
    positionSlot(context, "my position is"),
    natureSlot("panpan", context),
    slot({
      id: "assistance",
      label: "Assistance required",
      text: "I REQUIRE ASSISTANCE",
      phrase: phrase("i require assistance"),
      startsLine: true
    }),
    personsSlot(context),
    slot({
      id: "over",
      label: "\"Over\"",
      text: "OVER",
      phrase: phrase("over"),
      terminator: true,
      startsLine: true
    })
  ];
}

function buildSecurite(identity: ShipIdentity, context: CallContext): CallSlot[] {
  const channel = context.workingChannel.trim();
  const name = identity.shipName.trim().toUpperCase();
  return [
    slot({
      id: "safety-signal",
      label: "Safety signal, three times",
      text: repeated("SÉCURITÉ", 3),
      phrase: [term(...SECURITE_FORMS)],
      repeat: 3,
      startsLine: true
    }),
    slot({
      id: "all-stations",
      label: "\"All stations\", three times",
      text: repeated("ALL STATIONS", 3),
      phrase: phrase("all stations"),
      repeat: 3,
      startsLine: true
    }),
    ...identityBlock(identity),
    slot({
      id: "channel",
      label: "Working channel announcement",
      text: `LISTEN CHANNEL ${channel}`,
      phrase: concat(phrase("listen channel"), digitsPhrase(channel)),
      startsLine: true
    }),
    slot({
      id: "announce-out",
      label: "\"Out\" ending the announcement",
      text: "OUT",
      phrase: phrase("out"),
      startsLine: true
    }),
    slot({
      id: "safety-signal-2",
      label: "Safety signal on the working channel",
      text: "SÉCURITÉ",
      phrase: [term(...SECURITE_FORMS)],
      startsLine: true,
      dividerBefore: `Switch to channel ${channel} — now transmit the message`
    }),
    slot({
      id: "this-is-2",
      label: "Identification on the working channel",
      text: `THIS IS ${name}`,
      phrase: concat(phrase("this is"), shipNamePhrase(identity.shipName)),
      startsLine: true
    }),
    natureSlot("securite", context),
    positionSlot(context, "in position"),
    slot({
      id: "out",
      label: "\"Out\"",
      text: "OUT",
      phrase: phrase("out"),
      terminator: true,
      startsLine: true
    })
  ];
}

export function buildCall(
  type: CallType,
  identity: ShipIdentity,
  context: CallContext
): RenderedCall {
  switch (type) {
    case "mayday":
      return { type, slots: buildMayday(identity, context) };
    case "panpan":
      return { type, slots: buildPanPan(identity, context) };
    case "securite":
      return { type, slots: buildSecurite(identity, context) };
  }
}

/**
 * Vocabulary handed to the recognizer for this attempt. "over" and "out" are
 * always present so a terminator spoken too early can be heard and reported
 * rather than silently ignored.
 */
export function buildCallGrammar(call: RenderedCall): string[] {
  const words = new Set<string>(["over", "out"]);
  for (const s of call.slots) for (const w of phraseWords(s.phrase)) words.add(w);
  return [...words, "[unk]"];
}

/** The whole message as plain text, one logical line per group. */
export function callText(call: RenderedCall): string {
  const lines: string[] = [];
  for (const s of call.slots) {
    if (s.startsLine || lines.length === 0) lines.push(s.text);
    else lines[lines.length - 1] += ` ${s.text}`;
  }
  return lines.join("\n");
}

/** Which context fields the selected call type actually uses. */
export function contextFieldsFor(type: CallType): Array<keyof CallContext> {
  const common: Array<keyof CallContext> = ["latitude", "longitude", "natureId"];
  if (type === "securite") return [...common, "workingChannel"];
  return [...common, "personsOnBoard"];
}
