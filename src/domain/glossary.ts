export type Lang = "de" | "en";

/** A call made during a maneuver; shown as text, never spoken to the app. */
export interface Command {
  de: string;
  en: string;
  when: string;
}

/** Where an entry sits on one of the page's diagrams, in viewBox units. */
export interface Mark {
  diagram: string;
  x: number;
  y: number;
  /** Draws a leader line when the marker cannot sit on the part itself. */
  to?: [number, number];
}

export interface GlossaryEntry {
  id: string;
  de: string;
  en: string;
  /** Another common English name, usually the American one. */
  enAlt?: string;
  /** What it is for, or when it is used. */
  use: string;
  /** A caution worth knowing before relying on it. */
  note?: string;
  group: string;
  mark?: Mark;
  /** Id of a step-by-step figure shown with the entry. */
  figure?: string;
  commands?: Command[];
}

export interface GlossaryPage {
  id: "ship" | "maneuvers" | "knots";
  intro: string;
  groups: string[];
  diagrams: string[];
  entries: GlossaryEntry[];
}

/** Lower-cases and strips umlauts so "lummel" finds "Lümmelbeschlag". */
export function foldText(value: string): string {
  return value
    .toLowerCase()
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export function matchesQuery(entry: GlossaryEntry, query: string): boolean {
  const needle = foldText(query.trim());
  if (!needle) return true;
  const haystack = [
    entry.de,
    entry.en,
    entry.enAlt ?? "",
    ...(entry.commands ?? []).flatMap((command) => [command.de, command.en])
  ];
  return haystack.some((text) => foldText(text).includes(needle));
}

export function filterEntries(page: GlossaryPage, query: string, group: string): GlossaryEntry[] {
  return page.entries.filter(
    (entry) => (group === "" || entry.group === group) && matchesQuery(entry, query)
  );
}

/**
 * Marker numbers run through the whole page in data order, so a number in the
 * list means the same part whichever diagram is showing.
 */
export function markNumbers(page: GlossaryPage): Map<string, number> {
  const numbers = new Map<string, number>();
  for (const entry of page.entries) {
    if (entry.mark) numbers.set(entry.id, numbers.size + 1);
  }
  return numbers;
}
