import { describe, expect, it } from "vitest";
import { filterEntries, markNumbers, matchesQuery, type GlossaryPage } from "../src/domain/glossary";
import { KNOTS_PAGE } from "../src/domain/knots";
import { MANEUVERS_PAGE } from "../src/domain/maneuvers";
import { SHIP_PAGE } from "../src/domain/shipParts";
import { DIAGRAMS, FIGURES } from "../src/ui/diagrams";

const PAGES: GlossaryPage[] = [SHIP_PAGE, MANEUVERS_PAGE, KNOTS_PAGE];

describe.each(PAGES)("glossary data: $id", (page) => {
  it("has unique entry ids", () => {
    const ids = page.entries.map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gives every entry both names, a use and a known group", () => {
    for (const entry of page.entries) {
      expect(entry.de.trim(), entry.id).not.toBe("");
      expect(entry.en.trim(), entry.id).not.toBe("");
      expect(entry.use.trim(), entry.id).not.toBe("");
      expect(page.groups, entry.id).toContain(entry.group);
    }
  });

  it("uses every group", () => {
    for (const group of page.groups) {
      expect(page.entries.some((entry) => entry.group === group), group).toBe(true);
    }
  });

  it("places every marker inside a diagram of the page", () => {
    for (const entry of page.entries) {
      if (!entry.mark) continue;
      expect(page.diagrams, entry.id).toContain(entry.mark.diagram);
      const [, , width, height] = DIAGRAMS[entry.mark.diagram].viewBox.split(" ").map(Number);
      expect(entry.mark.x, entry.id).toBeGreaterThan(7);
      expect(entry.mark.x, entry.id).toBeLessThan(width - 7);
      expect(entry.mark.y, entry.id).toBeGreaterThan(7);
      expect(entry.mark.y, entry.id).toBeLessThan(height - 7);
    }
  });

  it("keeps markers on the same diagram from overlapping", () => {
    const marked = page.entries.filter((entry) => entry.mark);
    for (const a of marked) {
      for (const b of marked) {
        if (a === b || a.mark!.diagram !== b.mark!.diagram) continue;
        const distance = Math.hypot(a.mark!.x - b.mark!.x, a.mark!.y - b.mark!.y);
        expect(distance, `${a.id} / ${b.id}`).toBeGreaterThanOrEqual(15);
      }
    }
  });

  it("refers only to figures that exist, with complete commands", () => {
    for (const entry of page.entries) {
      if (entry.figure) expect(Object.keys(FIGURES), entry.id).toContain(entry.figure);
      for (const command of entry.commands ?? []) {
        expect(command.de.trim(), entry.id).not.toBe("");
        expect(command.en.trim(), entry.id).not.toBe("");
        expect(command.when.trim(), entry.id).not.toBe("");
      }
    }
  });
});

describe("glossary search", () => {
  it("finds German terms typed without umlauts", () => {
    const hits = filterEntries(SHIP_PAGE, "lummel", "");
    expect(hits.map((entry) => entry.id)).toEqual(["gooseneck"]);
  });

  it("matches either language, the alternative name and commands", () => {
    const vang = SHIP_PAGE.entries.find((entry) => entry.id === "kicker")!;
    expect(matchesQuery(vang, "BAUMNIEDER")).toBe(true);
    expect(matchesQuery(vang, "kicking")).toBe(true);
    expect(matchesQuery(vang, "boom vang")).toBe(true);
    expect(matchesQuery(vang, "anchor")).toBe(false);

    const hits = filterEntries(MANEUVERS_PAGE, "ready about", "");
    expect(hits.map((entry) => entry.id)).toEqual(["tack"]);
  });

  it("narrows to a group", () => {
    const sails = filterEntries(SHIP_PAGE, "", "Sails");
    expect(sails.length).toBeGreaterThan(0);
    expect(sails.every((entry) => entry.group === "Sails")).toBe(true);
  });
});

describe("markNumbers", () => {
  it("numbers the marked entries of a page from 1 without gaps or repeats", () => {
    const numbers = markNumbers(SHIP_PAGE);
    const marked = SHIP_PAGE.entries.filter((entry) => entry.mark);
    expect(marked.map((entry) => numbers.get(entry.id))).toEqual(marked.map((_, index) => index + 1));
    expect(numbers.size).toBe(marked.length);
  });
});
