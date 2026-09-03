import { NATO_ALPHABET } from "./natoAlphabet";
import { concat, phrase, term, type Phrase, type Term } from "./phrase";

export interface ShipIdentity {
  shipName: string;
  callSign: string;
  mmsi: string;
}

export interface CallContext {
  latitude: string;
  longitude: string;
  personsOnBoard: string;
  workingChannel: string;
  natureId: string;
}

export const EMPTY_IDENTITY: ShipIdentity = { shipName: "", callSign: "", mmsi: "" };

export const EMPTY_CONTEXT: CallContext = {
  latitude: "",
  longitude: "",
  personsOnBoard: "",
  workingChannel: "",
  natureId: ""
};

// Vessel names built only from words present in the offline model's dictionary,
// so a practice attempt can actually be scored. Verified by scripts/check-vocab.mjs.
export const SHIP_NAMES: string[] = [
  "Sea Breeze", "North Star", "Silver Gull", "White Swan", "Blue Moon",
  "Morning Tide", "Free Spirit", "Wind Dancer", "Southern Cross", "Storm Petrel",
  "Grey Seal", "Night Owl", "Sea Eagle", "Blue Heron", "Island Runner",
  "Ocean Pearl", "Summer Wind", "Silver Moon", "White Dolphin", "Northern Light"
];

// Maritime Identification Digits of a few European flag states.
const MID_PREFIXES = ["211", "244", "232", "227", "247", "224", "219", "265", "257"];

const CALLSIGN_PREFIXES = ["DA", "DB", "PA", "PB", "MA", "MB", "FA", "IA", "EA"];

const WORKING_CHANNELS = [6, 8, 9, 10, 12, 67, 68, 69, 71, 72, 73, 77];

const LETTER_TERMS = new Map<string, Term>(
  NATO_ALPHABET.map((entry) => [entry.letter, term(...entry.grammarForms)])
);

const DIGIT_TERMS: Record<string, Term> = {
  "0": term("zero", "nought"),
  "1": term("one"),
  "2": term("two"),
  "3": term("three"),
  "4": term("four"),
  "5": term("five"),
  "6": term("six"),
  "7": term("seven"),
  "8": term("eight"),
  "9": term("nine", "niner")
};

const ONES = [
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
  "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen",
  "seventeen", "eighteen", "nineteen"
];

const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

/** Spell a whole number 0-99 the way it is said in ordinary speech. */
export function numberToWords(value: number): string {
  if (value < 20) return ONES[value];
  const tens = TENS[Math.floor(value / 10)];
  const ones = value % 10;
  return ones === 0 ? tens : `${tens} ${ONES[ones]}`;
}

// ---------------------------------------------------------------- validation

export function validateShipName(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length === 0) return "Enter the vessel name.";
  if (trimmed.length < 2 || trimmed.length > 40) return "Use between 2 and 40 characters.";
  if (!/^[A-Za-z][A-Za-z\s'-]*$/.test(trimmed)) {
    return "Use letters, spaces, hyphens and apostrophes only.";
  }
  return null;
}

export function validateCallSign(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length === 0) return "Enter the call sign.";
  if (!/^[A-Za-z0-9]{3,7}$/.test(trimmed)) return "Use 3-7 letters and digits.";
  return null;
}

export function validateMmsi(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length === 0) return "Enter the MMSI.";
  if (!/^\d{9}$/.test(trimmed)) return "An MMSI is exactly 9 digits.";
  return null;
}

const LAT_PATTERN = /^(\d{1,2})\s+(\d{1,2}(?:\.\d)?)\s*([NnSs])$/;
const LON_PATTERN = /^(\d{1,3})\s+(\d{1,2}(?:\.\d)?)\s*([EeWw])$/;

export function validateLatitude(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length === 0) return "Enter the latitude.";
  const match = LAT_PATTERN.exec(trimmed);
  if (!match) return "Use the format 54 12.5 N";
  if (Number(match[1]) > 90) return "Degrees of latitude cannot exceed 90.";
  if (Number(match[2]) >= 60) return "Minutes must be below 60.";
  return null;
}

export function validateLongitude(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length === 0) return "Enter the longitude.";
  const match = LON_PATTERN.exec(trimmed);
  if (!match) return "Use the format 010 30.2 E";
  if (Number(match[1]) > 180) return "Degrees of longitude cannot exceed 180.";
  if (Number(match[2]) >= 60) return "Minutes must be below 60.";
  return null;
}

export function validatePersonsOnBoard(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length === 0) return "Enter the number of persons on board.";
  if (!/^\d{1,2}$/.test(trimmed) || Number(trimmed) < 1) return "Enter a number from 1 to 99.";
  return null;
}

export function validateWorkingChannel(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length === 0) return "Enter the working channel.";
  if (!/^\d{1,2}$/.test(trimmed)) return "Enter a channel number.";
  const channel = Number(trimmed);
  if (channel < 6 || channel > 88) return "Use a channel between 6 and 88.";
  if (channel === 16) return "Channel 16 is the calling channel - pick a working channel.";
  return null;
}

// -------------------------------------------------------------- random values

function pick<T>(list: readonly T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

function randomDigits(count: number): string {
  let out = "";
  for (let i = 0; i < count; i++) out += Math.floor(Math.random() * 10);
  return out;
}

export function randomIdentity(): ShipIdentity {
  return {
    shipName: pick(SHIP_NAMES),
    callSign: `${pick(CALLSIGN_PREFIXES)}${randomDigits(4)}`,
    mmsi: `${pick(MID_PREFIXES)}${randomDigits(6)}`
  };
}

export function randomPosition(): { latitude: string; longitude: string } {
  const latDeg = 36 + Math.floor(Math.random() * 24);
  const lonDeg = Math.floor(Math.random() * 20);
  const minutes = (): string => `${Math.floor(Math.random() * 60)}.${Math.floor(Math.random() * 10)}`;
  return {
    latitude: `${latDeg} ${minutes()} N`,
    longitude: `${String(lonDeg).padStart(3, "0")} ${minutes()} E`
  };
}

export function randomWorkingChannel(): string {
  return String(pick(WORKING_CHANNELS));
}

export function randomPersonsOnBoard(): string {
  return String(1 + Math.floor(Math.random() * 8));
}

// ------------------------------------------------------------- spoken phrases

export function shipNamePhrase(name: string): Phrase {
  return phrase(name);
}

/** A call sign is spelled out: letters phonetically, digits one by one. */
export function callSignPhrase(callSign: string): Phrase {
  const out: Phrase = [];
  for (const char of callSign.trim().toUpperCase()) {
    const letter = LETTER_TERMS.get(char);
    if (letter) {
      out.push(letter);
      continue;
    }
    const digit = DIGIT_TERMS[char];
    if (digit) out.push(digit);
  }
  return out;
}

/** Digits spoken individually, as required for an MMSI or a channel number. */
export function digitsPhrase(digits: string): Phrase {
  const out: Phrase = [];
  for (const char of digits.trim()) {
    const digit = DIGIT_TERMS[char];
    if (digit) out.push(digit);
  }
  return out;
}

/** A count, accepting either the ordinary number word or digit-by-digit. */
export function countPhrase(value: string): Phrase {
  const digits = value.trim();
  const numeric = Number(digits);
  if (!/^\d{1,2}$/.test(digits) || !Number.isFinite(numeric)) return digitsPhrase(digits);
  const alternates = [numberToWords(numeric)];
  if (digits.length > 1) alternates.push([...digits].map((d) => ONES[Number(d)]).join(" "));
  return [term(...alternates)];
}

const HEMISPHERES: Record<string, string> = { N: "north", S: "south", E: "east", W: "west" };

function coordinatePhrase(raw: string, pattern: RegExp): Phrase {
  const match = pattern.exec(raw.trim());
  if (!match) return [];
  const [, degrees, minutes, hemisphere] = match;
  const [whole, fraction] = minutes.split(".");
  const parts: Phrase[] = [digitsPhrase(degrees), phrase("degrees"), digitsPhrase(whole)];
  if (fraction) parts.push(phrase("decimal"), digitsPhrase(fraction));
  parts.push(phrase("minutes"), phrase(HEMISPHERES[hemisphere.toUpperCase()]));
  return concat(...parts);
}

export function positionPhrase(latitude: string, longitude: string): Phrase {
  return concat(
    coordinatePhrase(latitude, LAT_PATTERN),
    coordinatePhrase(longitude, LON_PATTERN)
  );
}

/** Human-readable rendering of a position, matching how it is spoken. */
export function positionText(latitude: string, longitude: string): string {
  return `${latitude.trim().toUpperCase()} ${longitude.trim().toUpperCase()}`;
}
